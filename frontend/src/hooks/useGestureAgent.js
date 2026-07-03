import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";

import { completeTask, getCurrentFocus, logInteraction, pauseFocus, startFocus } from "../api/client.js";
import { useToast } from "../components/common/ToastProvider.jsx";
import { useAppData } from "../context/AppDataContext.jsx";

const GESTURE_DEFS = {
  OPEN_PALM: {
    label: "打开 AI 导师",
    description: "跳转到 AI 导师，并围绕当前关卡继续讲解。",
  },
  SWIPE_LEFT: {
    label: "上一关",
    description: "在学习地图中切换到上一个知识关卡。",
  },
  SWIPE_RIGHT: {
    label: "下一关",
    description: "在学习地图中切换到下一个知识关卡。",
  },
  THUMBS_UP: {
    label: "完成任务",
    description: "完成当前关卡下第一条未完成任务。",
  },
  V_SIGN: {
    label: "开始专注",
    description: "为当前关卡创建 25 分钟专注会话。",
  },
  PALM_DOWN: {
    label: "暂停专注",
    description: "暂停当前正在运行的专注会话。",
  },
};

function sortedLevels(levels) {
  return [...(levels || [])].sort((a, b) => Number(a.id) - Number(b.id));
}

export function getGestureDefinitions() {
  return GESTURE_DEFS;
}

export default function useGestureAgent() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { selectedLevel, setSelectedLevel, learningMap, tasks, refreshAll } = useAppData();
  const [busy, setBusy] = useState(false);
  const [lastGesture, setLastGesture] = useState(null);
  const [actionLog, setActionLog] = useState([]);

  const pushLog = useCallback((message, type = "success") => {
    const item = { id: `${Date.now()}-${Math.random()}`, message, type };
    setActionLog((items) => [item, ...items].slice(0, 8));
  }, []);

  const writeGestureEvent = useCallback(
    async (code, action, extra = {}) => {
      try {
        await logInteraction({
          type: "gesture",
          name: code,
          action,
          page: "MultimodalLab",
          target_id: extra.targetId ?? selectedLevel?.id,
          metadata: {
            label: GESTURE_DEFS[code]?.label || code,
            selectedLevelTitle: selectedLevel?.title || "",
            source: extra.source || "simulation",
            ...extra,
          },
        });
      } catch {
        // Logging should never block the user-facing gesture action.
      }
    },
    [selectedLevel],
  );

  const moveLevel = useCallback(
    async (code, step, meta = {}) => {
      const levels = sortedLevels(learningMap);
      if (!levels.length) throw new Error("学习地图还没有加载完成。");
      const currentId = selectedLevel?.id ?? levels[0]?.id;
      const currentIndex = Math.max(0, levels.findIndex((item) => item.id === currentId));
      const nextIndex = Math.min(levels.length - 1, Math.max(0, currentIndex + step));
      const nextLevel = levels[nextIndex];
      setSelectedLevel(nextLevel);
      navigate("/map");
      await writeGestureEvent(code, step < 0 ? "previous_level" : "next_level", { ...meta, targetId: nextLevel.id, nextLevelTitle: nextLevel.title });
      return `已切换到：${nextLevel.title}`;
    },
    [learningMap, navigate, selectedLevel?.id, setSelectedLevel, writeGestureEvent],
  );

  const runGesture = useCallback(
    async (code, meta = {}) => {
      const def = GESTURE_DEFS[code];
      if (!def || busy) return;
      setBusy(true);
      setLastGesture({ code, ...def, source: meta.source || "simulation", at: new Date().toISOString() });

      try {
        let message = "";
        if (code === "OPEN_PALM") {
          await writeGestureEvent(code, "open_tutor", meta);
          sessionStorage.setItem("gestureSelectedLevel", JSON.stringify(selectedLevel || {}));
          navigate("/tutor");
          message = selectedLevel ? `已打开 AI 导师：${selectedLevel.title}` : "已打开 AI 导师。";
        }

        if (code === "SWIPE_LEFT") {
          message = await moveLevel(code, -1, meta);
        }

        if (code === "SWIPE_RIGHT") {
          message = await moveLevel(code, 1, meta);
        }

        if (code === "THUMBS_UP") {
          if (!selectedLevel) throw new Error("请先选择一个关卡。");
          const targetTask = tasks.find((task) => task.knowledge_point_id === selectedLevel.id && !task.completed);
          if (!targetTask) throw new Error("当前关卡没有未完成任务。");
          await completeTask(targetTask.id);
          await writeGestureEvent(code, "complete_task", { ...meta, targetId: targetTask.id, taskTitle: targetTask.title });
          await refreshAll();
          message = `已完成任务：${targetTask.title}`;
        }

        if (code === "V_SIGN") {
          if (!selectedLevel) throw new Error("请先选择一个关卡。");
          const current = await getCurrentFocus();
          if (current?.status === "running" || current?.status === "paused") {
            await writeGestureEvent(code, "open_existing_focus", { ...meta, targetId: current.knowledge_point_id, focusSessionId: current.id });
            navigate("/focus");
            message = "已有专注会话，已进入专注空间。";
          } else {
            const session = await startFocus({ knowledgePointId: selectedLevel.id, taskId: null, plannedMinutes: 25, source: meta.source === "camera" ? "gesture_camera" : "gesture" });
            await writeGestureEvent(code, "start_focus", { ...meta, targetId: selectedLevel.id, focusSessionId: session.id, plannedMinutes: 25 });
            await refreshAll();
            navigate("/focus");
            message = `已开始 25 分钟专注：${selectedLevel.title}`;
          }
        }

        if (code === "PALM_DOWN") {
          const current = await getCurrentFocus();
          if (!current) throw new Error("当前没有可暂停的专注会话。");
          if (current.status === "paused") {
            message = "专注会话已经处于暂停状态。";
          } else {
            await pauseFocus(current.id);
            await writeGestureEvent(code, "pause_focus", { ...meta, targetId: current.knowledge_point_id, focusSessionId: current.id });
            await refreshAll();
            message = "已暂停当前专注会话。";
          }
          navigate("/focus");
        }

        pushLog(message, "success");
        showToast(message, "success");
      } catch (error) {
        const message = error?.response?.data?.detail || error?.message || "手势动作执行失败。";
        await writeGestureEvent(code, "failed", { ...meta, error: message });
        pushLog(message, "error");
        showToast(message, "error");
      } finally {
        setBusy(false);
      }
    },
    [busy, moveLevel, navigate, pushLog, refreshAll, selectedLevel, showToast, tasks, writeGestureEvent],
  );

  return { busy, lastGesture, actionLog, runGesture, gestures: GESTURE_DEFS };
}

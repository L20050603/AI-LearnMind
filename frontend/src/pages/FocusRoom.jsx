import { useEffect, useMemo, useState } from "react";

import { cancelFocus, finishFocus, getCurrentFocus, getFocusStats, pauseFocus, resumeFocus, startFocus } from "../api/client.js";
import FocusBreathingAnimation from "../components/focus/FocusBreathingAnimation.jsx";
import FocusCompletionModal from "../components/focus/FocusCompletionModal.jsx";
import FocusControlPanel from "../components/focus/FocusControlPanel.jsx";
import FocusStatsPanel from "../components/focus/FocusStatsPanel.jsx";
import FocusTimer from "../components/focus/FocusTimer.jsx";
import { useToast } from "../components/common/ToastProvider.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

function secondsFromSession(session) {
  if (!session) return 25 * 60;
  const planned = (session.planned_minutes || 25) * 60;
  if (session.status === "paused") return Math.max(0, planned);
  const started = session.start_time ? new Date(session.start_time).getTime() : Date.now();
  const elapsed = Math.max(0, Math.floor((Date.now() - started) / 1000));
  return Math.max(0, planned - elapsed);
}

export default function FocusRoom() {
  const { selectedLevel, setSelectedLevel, learningMap, refreshAll } = useAppData();
  const { showToast } = useToast();
  const [plannedMinutes, setPlannedMinutes] = useState(25);
  const [customMinutes, setCustomMinutes] = useState("");
  const [session, setSession] = useState(null);
  const [stats, setStats] = useState(null);
  const [remainingSeconds, setRemainingSeconds] = useState(25 * 60);
  const [busy, setBusy] = useState(false);
  const [completion, setCompletion] = useState(null);

  const sessionLevel = useMemo(() => learningMap.find((node) => node.id === session?.knowledge_point_id), [learningMap, session]);

  async function loadFocusState() {
    const [current, statData] = await Promise.all([getCurrentFocus(), getFocusStats()]);
    setSession(current);
    setStats(statData);
    if (current) {
      setPlannedMinutes(current.planned_minutes || 25);
      setRemainingSeconds(secondsFromSession(current));
      const node = learningMap.find((item) => item.id === current.knowledge_point_id);
      if (node) setSelectedLevel(node);
    }
  }

  useEffect(() => {
    loadFocusState().catch(() => {});
  }, [learningMap.length]);

  useEffect(() => {
    if (!session || session.status !== "running") return undefined;
    const timer = window.setInterval(() => {
      setRemainingSeconds((value) => {
        if (value <= 1) {
          window.clearInterval(timer);
          handleFinish();
          return 0;
        }
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [session?.id, session?.status]);

  async function handleStart() {
    if (!selectedLevel) return;
    setBusy(true);
    try {
      const data = await startFocus({
        knowledgePointId: selectedLevel.id,
        taskId: null,
        plannedMinutes,
        source: "manual",
      });
      setSession(data);
      setRemainingSeconds((data.planned_minutes || plannedMinutes) * 60);
      showToast("专注会话已启动。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "启动专注失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handlePause() {
    if (!session) return;
    setBusy(true);
    try {
      setSession(await pauseFocus(session.id));
      showToast("专注已暂停。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "暂停失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleResume() {
    if (!session) return;
    setBusy(true);
    try {
      setSession(await resumeFocus(session.id));
      showToast("继续专注。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "继续失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleFinish() {
    if (!session) return;
    setBusy(true);
    try {
      const result = await finishFocus(session.id);
      setCompletion(result);
      setSession(null);
      await refreshAll();
      await loadFocusState();
      showToast(`专注完成，获得 ${result.xpGained} XP。`, "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "完成专注失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  async function handleCancel() {
    if (!session) return;
    setBusy(true);
    try {
      await cancelFocus(session.id);
      setSession(null);
      await loadFocusState();
      showToast("专注会话已取消。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "取消失败。", "error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageContainer eyebrow="专注空间" title="专注学习空间" description="建立真实 FocusSession，会话完成后写入学习记录、增加 XP，并刷新掌握度、风险和学习地图。">
      <div className="grid gap-4 xl:grid-cols-[380px_minmax(0,1fr)_320px]">
        <FocusControlPanel
          selectedLevel={sessionLevel || selectedLevel}
          learningMap={learningMap}
          setSelectedLevel={setSelectedLevel}
          plannedMinutes={plannedMinutes}
          setPlannedMinutes={(value) => {
            setPlannedMinutes(value);
            if (!session) setRemainingSeconds(value * 60);
          }}
          customMinutes={customMinutes}
          setCustomMinutes={setCustomMinutes}
          session={session}
          busy={busy}
          onStart={handleStart}
          onPause={handlePause}
          onResume={handleResume}
          onFinish={handleFinish}
          onCancel={handleCancel}
        />

        <FocusTimer remainingSeconds={remainingSeconds} plannedMinutes={plannedMinutes} status={session?.status || "idle"} />

        <div className="space-y-4">
          <FocusBreathingAnimation active={session?.status === "running"} />
          <FocusStatsPanel stats={stats} />
        </div>
      </div>
      <FocusCompletionModal result={completion} onClose={() => setCompletion(null)} />
    </PageContainer>
  );
}

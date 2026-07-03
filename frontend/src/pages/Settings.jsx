import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getAiStatus, updateProfile } from "../api/client.js";
import { useToast } from "../components/common/ToastProvider.jsx";
import GoalEditModal from "../components/profile/GoalEditModal.jsx";
import StudyPlanEditModal from "../components/profile/StudyPlanEditModal.jsx";
import AiModeBadge from "../components/tutor/AiModeBadge.jsx";
import { useAppData } from "../context/AppDataContext.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import PageContainer from "../layouts/PageContainer.jsx";

function useLocalSetting(key, defaultValue) {
  const [value, setValue] = useState(() => localStorage.getItem(key) ?? defaultValue);
  function update(next) {
    setValue(next);
    localStorage.setItem(key, next);
  }
  return [value, update];
}

export default function Settings() {
  const navigate = useNavigate();
  const { user, setUser, logout } = useAuth();
  const { dashboard, refreshAll, courses, activeCourse, switchCourse } = useAppData();
  const { showToast } = useToast();
  const profile = dashboard?.student || user || {};
  const [status, setStatus] = useState(null);
  const [voiceEnabled, setVoiceEnabled] = useLocalSetting("voiceRecognitionEnabled", "true");
  const [speakEnabled, setSpeakEnabled] = useLocalSetting("voiceSpeakEnabled", "true");
  const [logEnabled, setLogEnabled] = useLocalSetting("interactionLogEnabled", "true");
  const [rate, setRate] = useLocalSetting("voiceSpeakRate", "1");
  const [profileForm, setProfileForm] = useState({ name: "", email: "", major: "", grade: "", avatar: "" });
  const [goalOpen, setGoalOpen] = useState(false);
  const [planOpen, setPlanOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [courseBusy, setCourseBusy] = useState(false);

  useEffect(() => {
    getAiStatus()
      .then(setStatus)
      .catch(() => setStatus({ configured: false, provider: "local-template", mode: "local", model: "local-template", baseUrl: null }));
  }, []);

  useEffect(() => {
    setProfileForm({
      name: user?.name || "",
      email: user?.email || "",
      major: user?.major || "",
      grade: user?.grade || "",
      avatar: user?.avatar || "",
    });
  }, [user]);

  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const data = await updateProfile(profileForm);
      setUser(data);
      await refreshAll();
      showToast("用户资料已保存。", "success");
    } finally {
      setBusy(false);
    }
  }

  async function handleSwitchCourse(courseCode) {
    if (!courseCode || courseCode === activeCourse?.active_course_code) return;
    setCourseBusy(true);
    try {
      await switchCourse(courseCode);
      showToast("学习主题已切换，学习地图、资源猎手、AI 导师和报告将围绕新主题生成。", "success");
    } catch (error) {
      showToast(error?.response?.data?.detail || "学习主题切换失败。", "error");
    } finally {
      setCourseBusy(false);
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <PageContainer eyebrow="系统设置" title="系统设置与隐私" description="管理账号资料、学习主题、学习目标、AI Provider 和多模态权限。">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass-panel p-5 lg:col-span-2">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-white">学习主题设置</h2>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                当前主题：{activeCourse?.active_course_name || profile.active_course_name || "人工智能与机器智能基础"}。
                切换主题不会删除历史数据，不同课程使用不同知识点 ID，掌握度不会互相污染。
              </p>
            </div>
            <select
              disabled={courseBusy}
              value={activeCourse?.active_course_code || profile.active_course_code || "artificial_intelligence"}
              onChange={(event) => handleSwitchCourse(event.target.value)}
              className="min-w-64 rounded-2xl border border-cyan-200/20 bg-slate-950/80 px-4 py-3 text-sm text-white outline-none"
            >
              {courses.map((course) => (
                <option key={course.code} value={course.code}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {courses.map((course) => (
              <button
                key={course.code}
                type="button"
                disabled={courseBusy}
                onClick={() => handleSwitchCourse(course.code)}
                className={`rounded-3xl border p-4 text-left transition ${
                  course.code === activeCourse?.active_course_code ? "border-cyan-200/60 bg-cyan-400/15" : "border-white/10 bg-white/[0.045] hover:border-cyan-200/40"
                }`}
              >
                <p className="font-semibold text-white">{course.name}</p>
                <p className="mt-1 text-xs text-cyan-100/70">{course.point_count} 个知识点</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{course.description}</p>
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={saveProfile} className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">用户资料</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ["name", "姓名"],
              ["email", "邮箱"],
              ["major", "专业"],
              ["grade", "年级"],
              ["avatar", "头像 URL"],
            ].map(([key, label]) => (
              <label key={key} className={`block text-sm text-slate-300 ${key === "avatar" ? "md:col-span-2" : ""}`}>
                <span className="mb-1 block text-slate-400">{label}</span>
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={profileForm[key]} onChange={(event) => setProfileForm({ ...profileForm, [key]: event.target.value })} />
              </label>
            ))}
          </div>
          <button type="submit" disabled={busy} className="primary-submit mt-4 max-w-40">
            {busy ? "保存中..." : "保存资料"}
          </button>
        </form>

        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">账号信息</h2>
          <div className="mt-3 space-y-2 text-sm leading-6 text-slate-300">
            <p>用户名：{user?.username || "-"}</p>
            <p>等级：Lv.{profile.level ?? user?.level ?? 1}</p>
            <p>XP：{profile.xp ?? user?.xp ?? 0}</p>
            <p>当前目标：{profile.goal || "未设置"}</p>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => setGoalOpen(true)} className="action-button">编辑目标</button>
            <button type="button" onClick={() => setPlanOpen(true)} className="action-button">编辑计划</button>
            <button type="button" onClick={handleLogout} className="action-button border-rose-300/30 text-rose-100">退出登录</button>
          </div>
        </div>

        <div className="glass-panel p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-white">AI Provider 状态</h2>
            <AiModeBadge mode={status?.mode || "local"} status={status} />
          </div>
          <div className="space-y-2 text-sm leading-6 text-slate-300">
            <p>是否已配置：{status?.configured ? "是" : "否"}</p>
            <p>Provider：{status?.provider || "local-template"}</p>
            <p>模式：{status?.mode === "llm" ? "大模型增强" : "本地规则 / 模板"}</p>
            <p>模型：{status?.model || "local-template"}</p>
          </div>
        </div>

        <div className="glass-panel p-5">
          <h2 className="text-lg font-semibold text-white">语音交互设置</h2>
          <div className="mt-4 space-y-3">
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">
              <span>启用语音识别入口</span>
              <input type="checkbox" checked={voiceEnabled === "true"} onChange={(event) => setVoiceEnabled(String(event.target.checked))} />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">
              <span>启用语音播报</span>
              <input type="checkbox" checked={speakEnabled === "true"} onChange={(event) => setSpeakEnabled(String(event.target.checked))} />
            </label>
            <label className="block rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">
              <span>播报语速：{rate}x</span>
              <input className="mt-3 w-full" type="range" min="0.7" max="1.3" step="0.1" value={rate} onChange={(event) => setRate(event.target.value)} />
            </label>
          </div>
        </div>

        <div className="glass-panel p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white">隐私与资源合规说明</h2>
          <label className="mt-4 flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.045] p-3 text-sm text-slate-200">
            <span>记录关键交互事件</span>
            <input type="checkbox" checked={logEnabled === "true"} onChange={(event) => setLogEnabled(String(event.target.checked))} />
          </label>
          <p className="mt-3 text-sm leading-6 text-slate-300">
            API Key 只放在后端环境变量中。资源猎手默认使用本地资料库；如配置官方搜索 API，只保存标题、链接和摘要，不绕过登录、付费墙、验证码或 robots 限制。
          </p>
        </div>
      </div>

      <GoalEditModal open={goalOpen} onClose={() => setGoalOpen(false)} profile={profile} onSaved={() => refreshAll()} />
      <StudyPlanEditModal open={planOpen} onClose={() => setPlanOpen(false)} profile={profile} onSaved={() => refreshAll()} />
    </PageContainer>
  );
}

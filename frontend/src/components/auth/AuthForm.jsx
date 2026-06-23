import { Link } from "react-router-dom";

export default function AuthForm({ mode, form, setForm, onSubmit, busy, error }) {
  const isRegister = mode === "register";
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-md">
        <div className="mb-6 text-center">
          <p className="text-sm text-cyan-200/70">AI-LearnMind 知学伴</p>
          <h1 className="mt-2 text-3xl font-black text-white">{isRegister ? "创建学习账户" : "登录学习驾驶舱"}</h1>
          <p className="mt-2 text-sm text-slate-400">账户数据会隔离保存，任务、记录、报告只属于当前登录用户。</p>
        </div>
        <form onSubmit={onSubmit} className="glass-panel space-y-4 p-6">
          {isRegister && (
            <>
              <label className="block text-sm text-slate-300">
                <span className="mb-1 block text-slate-400">姓名</span>
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
              </label>
              <label className="block text-sm text-slate-300">
                <span className="mb-1 block text-slate-400">邮箱</span>
                <input className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              </label>
            </>
          )}
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">用户名或邮箱</span>
            <input className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.username} onChange={(event) => setForm({ ...form, username: event.target.value })} />
          </label>
          <label className="block text-sm text-slate-300">
            <span className="mb-1 block text-slate-400">密码</span>
            <input type="password" className="w-full rounded-2xl border border-white/10 bg-slate-950/80 px-3 py-2 text-white outline-none" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
          </label>
          {error && <div className="rounded-2xl border border-rose-300/20 bg-rose-500/10 p-3 text-sm text-rose-50">{error}</div>}
          <button type="submit" disabled={busy} className="primary-submit">
            {busy ? "处理中..." : isRegister ? "注册并进入系统" : "登录"}
          </button>
          <p className="text-center text-sm text-slate-400">
            {isRegister ? "已有账户？" : "还没有账户？"}
            <Link className="ml-1 text-cyan-100" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "去登录" : "去注册"}
            </Link>
          </p>
          {!isRegister && <p className="text-center text-xs text-slate-500">演示账号：demo / 123456</p>}
        </form>
      </div>
    </div>
  );
}

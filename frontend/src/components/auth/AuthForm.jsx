import { Link } from "react-router-dom";

function Field({ label, hint, error, children }) {
  return (
    <label className="block text-sm text-slate-300">
      <span className="mb-1.5 flex items-center justify-between gap-3">
        <span className="font-medium text-slate-200">{label}</span>
        {error && <span className="text-xs text-rose-200">{error}</span>}
      </span>
      {children}
      {hint && <span className="mt-1.5 block text-xs leading-5 text-slate-500">{hint}</span>}
    </label>
  );
}

function inputClass(hasError) {
  return [
    "w-full rounded-2xl border px-4 py-3 text-base text-white outline-none transition",
    "bg-slate-950/80 placeholder:text-slate-600",
    hasError ? "border-rose-300/60 shadow-[0_0_0_3px_rgba(251,113,133,0.12)]" : "border-white/10 focus:border-cyan-300/60",
  ].join(" ");
}

export default function AuthForm({ mode, form, setForm, onSubmit, busy, error, fieldErrors = {}, onUseDemo }) {
  const isRegister = mode === "register";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,#0e749033,transparent_34%),#020617] px-4 py-10 text-slate-100">
      <div className="mx-auto max-w-xl">
        <div className="mb-8 text-center">
          <p className="text-sm font-semibold tracking-[0.24em] text-cyan-200/80">AI-LearnMind 知学伴</p>
          <h1 className="mt-3 text-4xl font-black text-white">{isRegister ? "创建学习账户" : "登录学习驾驶舱"}</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            {isRegister ? "注册后会为你创建独立学习空间，任务、记录和报告只属于当前账号。" : "使用用户名或邮箱登录。演示账号可以一键填入，方便快速体验系统。"}
          </p>
        </div>

        <form onSubmit={onSubmit} className="glass-panel space-y-5 p-6 md:p-8">
          {!isRegister && (
            <div className="rounded-3xl border border-cyan-200/15 bg-cyan-300/10 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-cyan-100">演示账号</p>
                  <p className="mt-1 text-xs text-cyan-100/70">用户名：demo　密码：123456</p>
                </div>
                <button type="button" onClick={onUseDemo} className="rounded-2xl border border-cyan-200/30 px-4 py-2 text-sm font-semibold text-cyan-50 hover:bg-cyan-300/10">
                  一键填入
                </button>
              </div>
            </div>
          )}

          {isRegister && (
            <>
              <Field label="姓名" hint="用于页面展示，例如：李同学、Lyl。" error={fieldErrors.name}>
                <input
                  className={inputClass(fieldErrors.name)}
                  value={form.name}
                  placeholder="例如：李同学"
                  autoComplete="name"
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                />
              </Field>

              <Field label="用户名" hint="3-40 个字符，建议使用字母、数字或下划线。登录时也可以使用邮箱。" error={fieldErrors.username}>
                <input
                  className={inputClass(fieldErrors.username)}
                  value={form.username}
                  placeholder="例如：student001"
                  autoComplete="username"
                  onChange={(event) => setForm({ ...form, username: event.target.value })}
                />
              </Field>

              <Field label="邮箱" hint="请输入有效邮箱，例如 student001@example.com。" error={fieldErrors.email}>
                <input
                  type="email"
                  className={inputClass(fieldErrors.email)}
                  value={form.email}
                  placeholder="例如：student001@example.com"
                  autoComplete="email"
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                />
              </Field>
            </>
          )}

          {!isRegister && (
            <Field label="用户名或邮箱" hint="可以输入 demo，也可以输入注册时填写的邮箱。" error={fieldErrors.username}>
              <input
                className={inputClass(fieldErrors.username)}
                value={form.username}
                placeholder="demo 或你的邮箱"
                autoComplete="username"
                onChange={(event) => setForm({ ...form, username: event.target.value })}
              />
            </Field>
          )}

          <Field label="密码" hint={isRegister ? "至少 6 位字符。" : "演示账号密码为 123456。"} error={fieldErrors.password}>
            <input
              type="password"
              className={inputClass(fieldErrors.password)}
              value={form.password}
              placeholder={isRegister ? "至少 6 位" : "请输入密码"}
              autoComplete={isRegister ? "new-password" : "current-password"}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
            />
          </Field>

          {error && <div className="rounded-2xl border border-rose-300/30 bg-rose-500/12 p-3 text-sm leading-6 text-rose-50">{error}</div>}

          <button type="submit" disabled={busy} className="primary-submit disabled:cursor-not-allowed disabled:opacity-60">
            {busy ? "处理中..." : isRegister ? "注册并进入系统" : "登录"}
          </button>

          <p className="text-center text-sm text-slate-400">
            {isRegister ? "已有账号？" : "还没有账号？"}
            <Link className="ml-1 font-semibold text-cyan-100 hover:text-white" to={isRegister ? "/login" : "/register"}>
              {isRegister ? "去登录" : "去注册"}
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

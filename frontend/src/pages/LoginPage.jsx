import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";

import AuthForm from "../components/auth/AuthForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ username: "demo", password: "123456" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  if (!loading && isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = {};
    if (!form.username.trim()) nextErrors.username = "请输入用户名或邮箱";
    if (!form.password) nextErrors.password = "请输入密码";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setError("请先补全登录信息。");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await login({ username: form.username.trim(), password: form.password });
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(normalizeApiError(err, "登录失败，请检查用户名或密码。"));
    } finally {
      setBusy(false);
    }
  }

  return (
    <AuthForm
      mode="login"
      form={form}
      setForm={setForm}
      onSubmit={handleSubmit}
      busy={busy}
      error={error}
      fieldErrors={fieldErrors}
      onUseDemo={() => {
        setForm({ username: "demo", password: "123456" });
        setFieldErrors({});
        setError("");
      }}
    />
  );
}

function normalizeApiError(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) return detail.map((item) => item.msg || item.message).filter(Boolean).join("；") || fallback;
  if (err?.code === "ERR_NETWORK") return "无法连接后端服务，请先启动 FastAPI：http://localhost:8000";
  return fallback;
}

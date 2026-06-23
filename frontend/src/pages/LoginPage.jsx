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

  if (!loading && isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "登录失败，请检查用户名和密码。");
    } finally {
      setBusy(false);
    }
  }

  return <AuthForm mode="login" form={form} setForm={setForm} onSubmit={handleSubmit} busy={busy} error={error} />;
}

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import AuthForm from "../components/auth/AuthForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  if (!loading && isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err?.response?.data?.detail || "注册失败，请检查信息是否完整。");
    } finally {
      setBusy(false);
    }
  }

  return <AuthForm mode="register" form={form} setForm={setForm} onSubmit={handleSubmit} busy={busy} error={error} />;
}

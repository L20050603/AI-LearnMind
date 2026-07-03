import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";

import AuthForm from "../components/auth/AuthForm.jsx";
import { useAuth } from "../context/AuthContext.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const USERNAME_RE = /^[A-Za-z0-9_@.-]+$/;

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, loading } = useAuth();
  const [form, setForm] = useState({ username: "", email: "", password: "", name: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  if (!loading && isAuthenticated) return <Navigate to="/" replace />;

  async function handleSubmit(event) {
    event.preventDefault();
    const cleaned = {
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
      name: form.name.trim(),
    };
    const nextErrors = validateRegister(cleaned);
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      setError("请按提示修正注册信息。");
      return;
    }

    setBusy(true);
    setError("");
    try {
      await register(cleaned);
      navigate("/", { replace: true });
    } catch (err) {
      setError(normalizeApiError(err, "注册失败，请检查信息是否完整。"));
    } finally {
      setBusy(false);
    }
  }

  return <AuthForm mode="register" form={form} setForm={setForm} onSubmit={handleSubmit} busy={busy} error={error} fieldErrors={fieldErrors} />;
}

function validateRegister(form) {
  const errors = {};
  if (!form.name) errors.name = "请输入姓名";
  if (!form.username) errors.username = "请输入用户名";
  else if (form.username.length < 3) errors.username = "至少 3 个字符";
  else if (form.username.length > 40) errors.username = "不能超过 40 个字符";
  else if (!USERNAME_RE.test(form.username)) errors.username = "仅支持字母、数字、下划线、点、横线或 @";
  if (!form.email) errors.email = "请输入邮箱";
  else if (!EMAIL_RE.test(form.email)) errors.email = "邮箱格式不正确";
  if (!form.password) errors.password = "请输入密码";
  else if (form.password.length < 6) errors.password = "至少 6 位";
  return errors;
}

function normalizeApiError(err, fallback) {
  const detail = err?.response?.data?.detail;
  if (typeof detail === "string") {
    if (detail.includes("exists") || detail.includes("已存在")) return "用户名或邮箱已存在，可以直接去登录，或换一个用户名/邮箱。";
    return detail;
  }
  if (Array.isArray(detail)) return detail.map((item) => humanizeValidationError(item)).filter(Boolean).join("；") || fallback;
  if (err?.code === "ERR_NETWORK") return "无法连接后端服务，请先启动 FastAPI：http://localhost:8000";
  return fallback;
}

function humanizeValidationError(item) {
  const field = item?.loc?.at(-1);
  const names = { username: "用户名", email: "邮箱", password: "密码", name: "姓名" };
  if (item?.type === "string_too_short") return `${names[field] || field}长度太短`;
  if (item?.type === "string_too_long") return `${names[field] || field}长度太长`;
  return item?.msg;
}

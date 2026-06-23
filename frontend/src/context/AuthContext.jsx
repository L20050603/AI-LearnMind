import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

import { getMe, login as loginApi, logout as logoutApi, register as registerApi, setAuthToken } from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    const token = localStorage.getItem("ai_learnmind_token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }
    try {
      const data = await getMe();
      setUser(data);
      return data;
    } catch {
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
    const handler = () => setUser(null);
    window.addEventListener("auth:logout", handler);
    return () => window.removeEventListener("auth:logout", handler);
  }, [refreshMe]);

  async function login(payload) {
    const data = await loginApi(payload);
    setAuthToken(data.access_token);
    setUser(data.user);
    return data;
  }

  async function register(payload) {
    const data = await registerApi(payload);
    setAuthToken(data.access_token);
    setUser(data.user);
    return data;
  }

  async function logout() {
    try {
      await logoutApi();
    } catch {
      // Token may already be invalid; local cleanup is still correct.
    }
    setAuthToken("");
    setUser(null);
  }

  const value = useMemo(() => ({ user, setUser, loading, login, register, logout, refreshMe, isAuthenticated: Boolean(user) }), [loading, user, refreshMe]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

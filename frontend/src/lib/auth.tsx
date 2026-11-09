"use client";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { api } from "./api";

export type Role = "student" | "recruiter" | "admin";
export interface Me { _id: string; name: string; email: string; role: Role; college?: string; company?: string }

interface Ctx { user: Me | null; loading: boolean; login: (token: string) => Promise<void>; logout: () => void; refresh: () => Promise<void> }
const AuthCtx = createContext<Ctx>({} as Ctx);
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!localStorage.getItem("hirehub_token")) { setUser(null); setLoading(false); return; }
    try { setUser(await api<Me>("/auth/me")); } catch { localStorage.removeItem("hirehub_token"); setUser(null); }
    setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const login = async (token: string) => { localStorage.setItem("hirehub_token", token); await refresh(); };
  const logout = () => { localStorage.removeItem("hirehub_token"); setUser(null); window.location.href = "/login"; };

  return <AuthCtx.Provider value={{ user, loading, login, logout, refresh }}>{children}</AuthCtx.Provider>;
}

import { createContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { request } from "@/services/api";

export type UserRole = "fleet-manager" | "dispatcher" | "safety-officer" | "financial-analyst" | "admin";
export interface User { id: number; name: string; email: string; role: UserRole; }
interface AuthContextType { user: User | null; isAuthReady: boolean; login: (email: string, password: string) => Promise<void>; logout: () => void; }
export const AuthContext = createContext<AuthContextType>(null!);
const USER_KEY = "transpilot_user";
const TOKEN_KEY = "transpilot_access_token";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      const token = localStorage.getItem(TOKEN_KEY);
      if (raw && token) setUser(JSON.parse(raw) as User);
    } catch { localStorage.removeItem(USER_KEY); localStorage.removeItem(TOKEN_KEY); }
    finally { setIsAuthReady(true); }
  }, []);

  const login = async (email: string, password: string) => {
    const result = await request("auth/login", { method: "POST", body: JSON.stringify({ email, password }) });
    const nextUser: User = { id: result.user_id, name: email.split("@")[0], email, role: result.role as UserRole };
    localStorage.setItem(TOKEN_KEY, result.access_token);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    setUser(nextUser);
  };
  const logout = () => { setUser(null); localStorage.removeItem(USER_KEY); localStorage.removeItem(TOKEN_KEY); };
  return <AuthContext.Provider value={{ user, isAuthReady, login, logout }}>{children}</AuthContext.Provider>;
}

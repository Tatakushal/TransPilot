import { createContext, useState } from "react";
import type { ReactNode } from "react";

export type UserRole =
  | "fleet-manager"
  | "dispatcher"
  | "safety-officer"
  | "financial-analyst"
  | "admin";

export interface User {
  name: string;
  email: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  login: (role: UserRole) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>(null!);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Temporary logged-in user for hackathon
  const [user, setUser] = useState<User | null>(null);

  const login = (role: UserRole) => {
    setUser({
      name: "Kushal",
      email: "kushal@transitops.ai",
      role,
    });
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

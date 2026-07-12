import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>("fleet-manager");

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
            TO
          </div>

          <h1 className="text-3xl font-bold">TransitOps</h1>

          <p className="mt-2 text-slate-500">AI Fleet Management Platform</p>
        </div>

        <div className="space-y-5">
          <input
            placeholder="Email"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500"
          />

          <select
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            className="w-full rounded-xl border border-slate-200 px-4 py-3"
          >
            <option value="admin">Admin</option>
            <option value="fleet-manager">Fleet Manager</option>
            <option value="dispatcher">Dispatcher</option>
            <option value="safety-officer">Safety Officer</option>
            <option value="financial-analyst">Financial Analyst</option>
          </select>

          <button
            onClick={() => {
              login(role);
              navigate("/dashboard");
            }}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<UserRole>("fleet-manager");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errors, setErrors] = useState({
    email: "",
    password: "",
  });

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  function validate() {
    const newErrors = {
      email: "",
      password: "",
    };

    let valid = true;

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Enter a valid email";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Minimum 6 characters";
      valid = false;
    }

    setErrors(newErrors);

    return valid;
  }

  function handleLogin() {
    if (!validate()) return;

    login(role);

    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 text-2xl font-bold text-white">
            TO
          </div>

          <h1 className="text-3xl font-bold">TransitOps</h1>

          <p className="mt-2 text-slate-500">AI Fleet Management Platform</p>
        </div>

        <div className="space-y-5">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                errors.email
                  ? "border-red-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                errors.password
                  ? "border-red-500"
                  : "border-slate-200 focus:border-indigo-500"
              }`}
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

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
            onClick={handleLogin}
            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}

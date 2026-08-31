import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/context/AuthContext";

export default function LoginPage() {
  const { login, user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState<UserRole>("fleet-manager");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({ email: "", password: "" });

  if (!isAuthReady) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  function validateEmail(value: string) {
    if (!value.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(value.trim())) return "Enter a valid email";
    return "";
  }

  function validatePassword(value: string) {
    if (!value) return "Password is required";
    if (value.length < 6) return "Minimum 6 characters";
    return "";
  }

  function handleLogin() {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });
    setSubmitError("");
    if (emailError || passwordError) return;

    setLoading(true);
    window.setTimeout(() => {
      try {
        login(role);
        navigate("/dashboard", { replace: true });
      } catch {
        setSubmitError("Unable to sign in. Please try again.");
        setLoading(false);
      }
    }, 400);
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-6">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 shadow-xl">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-indigo-600">
            <img src="/logo.png" alt="TransPilot" className="h-full w-full object-contain" />
          </div>
          <h1 className="text-3xl font-bold">TransPilot</h1>
          <p className="mt-2 text-slate-500">AI Fleet Management Platform</p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(e) => { setEmail(e.target.value); setSubmitError(""); setErrors((prev) => ({ ...prev, email: validateEmail(e.target.value) })); }} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className={`w-full rounded-xl border px-4 py-3 outline-none transition ${errors.email ? "border-red-500" : "border-slate-200 focus:border-indigo-500"}`} />
            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <div className="relative">
              <input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e) => { setPassword(e.target.value); setSubmitError(""); setErrors((prev) => ({ ...prev, password: validatePassword(e.target.value) })); }} onKeyDown={(e) => e.key === "Enter" && handleLogin()} className={`w-full rounded-xl border px-4 py-3 pr-12 outline-none transition ${errors.password ? "border-red-500" : "border-slate-200 focus:border-indigo-500"}`} />
              <button type="button" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword((value) => !value)} className="absolute right-4 top-3 text-slate-500">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
            </div>
            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as UserRole)} className="w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500">
              <option value="admin">Admin</option>
              <option value="fleet-manager">Fleet Manager</option>
              <option value="dispatcher">Dispatcher</option>
              <option value="safety-officer">Safety Officer</option>
              <option value="financial-analyst">Financial Analyst</option>
            </select>
          </div>

          {submitError && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{submitError}</p>}

          <button onClick={handleLogin} disabled={loading} className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400">
            {loading ? "Signing In..." : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "@/services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("fleet-manager");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault(); setError(""); setMessage(""); setLoading(true);
    try {
      const result = await request("auth/register", { method: "POST", body: JSON.stringify({ name, email, password, role }) });
      setMessage(result.message || "Account created. Check your email to verify it.");
      setTimeout(() => navigate("/login"), 1800);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create account"); }
    finally { setLoading(false); }
  }

  return <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4"><form onSubmit={submit} className="w-full max-w-md space-y-5 rounded-3xl bg-white p-8 shadow-2xl"><div><h1 className="text-2xl font-bold text-slate-900">Create your account</h1><p className="mt-1 text-sm text-slate-500">Start managing your fleet with TransPilot.</p></div><input required minLength={2} value={name} onChange={e=>setName(e.target.value)} placeholder="Full name" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"/><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Work email" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"/><input required minLength={8} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (8+ characters)" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"/><select value={role} onChange={e=>setRole(e.target.value)} className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm"><option value="fleet-manager">Fleet Manager</option><option value="dispatcher">Dispatcher</option><option value="safety-officer">Safety Officer</option><option value="financial-analyst">Financial Analyst</option></select>{error&&<p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}{message&&<p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}<button disabled={loading} className="h-12 w-full rounded-xl bg-indigo-600 font-semibold text-white disabled:opacity-60">{loading?"Creating account…":"Create account"}</button><p className="text-center text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-indigo-600">Sign in</Link></p></form></main>;
}

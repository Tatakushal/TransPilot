import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "@/services/api";
import { KeyRound, ShieldCheck } from "lucide-react";

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapKey, setBootstrapKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const result = await request("auth/bootstrap/admin", {
        method: "POST",
        headers: { "X-Bootstrap-Key": bootstrapKey },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      setMessage(result.message || "Administrator created. Redirecting to sign in…");
      window.setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create administrator");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <form onSubmit={submit} className="w-full max-w-lg space-y-5 rounded-[28px] bg-white p-8 shadow-2xl">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><ShieldCheck size={24} /></div>
          <div>
            <p className="text-sm font-semibold text-indigo-600">Initial setup</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Create administrator</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">This setup is available only while no administrator exists. The server requires the private bootstrap key configured for your deployment.</p>
          </div>
        </div>

        <input required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Administrator name" autoComplete="name" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500" />
        <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Administrator email" autoComplete="email" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500" />
        <input required minLength={10} maxLength={128} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Administrator password (10+ characters)" autoComplete="new-password" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500" />
        <div>
          <label htmlFor="bootstrap-key" className="mb-2 block text-sm font-semibold text-slate-700">Bootstrap key</label>
          <div className="relative">
            <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input id="bootstrap-key" required type="password" value={bootstrapKey} onChange={e => setBootstrapKey(e.target.value)} placeholder="Enter the deployment bootstrap key" autoComplete="off" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white" />
          </div>
          <p className="mt-2 text-xs text-slate-400">Do not share this key. After creating the first admin, rotate or remove ADMIN_BOOTSTRAP_KEY in your deployment settings.</p>
        </div>

        {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

        <button type="submit" disabled={loading} className="h-12 w-full rounded-xl bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60">
          {loading ? "Creating administrator…" : "Create administrator"}
        </button>
        <p className="text-center text-sm text-slate-500"><Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Back to sign in</Link></p>
      </form>
    </main>
  );
}

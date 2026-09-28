import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { KeyRound, ShieldCheck, Database, AlertTriangle } from "lucide-react";
import { request } from "@/services/api";

export default function AdminSetupPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [bootstrapKey, setBootstrapKey] = useState("");
  const [freshStart, setFreshStart] = useState(true);
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError(""); setMessage(""); setLoading(true);
    try {
      const endpoint = freshStart ? "auth/bootstrap/fresh-start" : "auth/bootstrap/admin";
      const body = freshStart
        ? { name: name.trim(), email: email.trim(), password, confirmation }
        : { name: name.trim(), email: email.trim(), password };
      const result = await request(endpoint, { method: "POST", headers: { "X-Bootstrap-Key": bootstrapKey }, body: JSON.stringify(body) });
      setMessage(result.message || "Administrator created. Redirecting to sign in…");
      window.setTimeout(() => navigate("/login", { replace: true }), 1600);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to initialize the workspace");
    } finally { setLoading(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <form onSubmit={submit} className="w-full max-w-2xl rounded-[30px] bg-white p-7 shadow-2xl sm:p-9">
        <div className="flex items-start gap-4">
          <div className="rounded-2xl bg-indigo-50 p-3 text-indigo-600"><ShieldCheck size={24} /></div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-indigo-600">Workspace initialization</p>
            <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">Start TransPilot fresh</h1>
            <p className="mt-1 text-sm leading-6 text-slate-500">Create the first administrator and choose whether this environment should begin completely empty.</p>
          </div>
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button type="button" onClick={() => setFreshStart(true)} className={`rounded-2xl border p-4 text-left ${freshStart ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-100" : "border-slate-200"}`}>
            <div className="flex items-center gap-3"><Database size={19} className="text-indigo-600"/><div><p className="text-sm font-bold text-slate-900">Fresh workspace</p><p className="mt-1 text-xs text-slate-500">Clear existing operational and account data, then create the first admin.</p></div></div>
          </button>
          <button type="button" onClick={() => setFreshStart(false)} className={`rounded-2xl border p-4 text-left ${!freshStart ? "border-indigo-500 bg-indigo-50/60 ring-2 ring-indigo-100" : "border-slate-200"}`}>
            <div className="flex items-center gap-3"><ShieldCheck size={19} className="text-slate-500"/><div><p className="text-sm font-bold text-slate-900">Keep existing data</p><p className="mt-1 text-xs text-slate-500">Only create the first administrator without clearing the workspace.</p></div></div>
          </button>
        </div>

        {freshStart && <div className="mt-4 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-amber-600"/><p className="text-xs leading-5 text-amber-800"><b>This is destructive.</b> Fresh start removes existing users, sessions, audit logs, vehicles, drivers, trips, fuel records and maintenance records. It cannot be undone.</p></div>}

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <input required minLength={2} maxLength={100} value={name} onChange={e => setName(e.target.value)} placeholder="Administrator name" autoComplete="name" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500" />
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Administrator email" autoComplete="email" className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500" />
        </div>
        <input required minLength={10} maxLength={128} type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Administrator password (10+ characters)" autoComplete="new-password" className="mt-4 h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500" />

        {freshStart && <input required value={confirmation} onChange={e => setConfirmation(e.target.value)} placeholder='Type "START FRESH" to confirm' className="mt-4 h-12 w-full rounded-xl border border-amber-200 bg-amber-50 px-4 text-sm outline-none focus:border-amber-500" />}

        <div className="relative mt-4">
          <KeyRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
          <input required type="password" value={bootstrapKey} onChange={e => setBootstrapKey(e.target.value)} placeholder="Deployment bootstrap key" autoComplete="off" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white" />
        </div>
        <p className="mt-2 text-xs text-slate-400">The bootstrap key is the private ADMIN_BOOTSTRAP_KEY configured on the server. Rotate or remove it after initialization.</p>

        {error && <p role="alert" className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

        <button type="submit" disabled={loading} className="mt-6 h-12 w-full rounded-xl bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:opacity-60">
          {loading ? "Initializing workspace…" : freshStart ? "Start fresh & create administrator" : "Create administrator"}
        </button>
        <p className="mt-5 text-center text-sm text-slate-500"><Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Back to sign in</Link></p>
      </form>
    </main>
  );
}

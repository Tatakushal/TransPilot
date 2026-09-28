import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Radio, ShieldAlert, Truck, UserRound, WalletCards, ShieldCheck } from "lucide-react";
import { request } from "@/services/api";

const roles = [
  { id: "fleet-manager", title: "Fleet Manager", description: "Manage vehicles, drivers and fleet health.", permissions: "Fleet · Drivers · Trips · Maintenance", icon: Truck },
  { id: "dispatcher", title: "Dispatcher", description: "Coordinate trips and keep operations moving.", permissions: "Trips · Vehicles · Drivers", icon: Radio },
  { id: "safety-officer", title: "Safety Officer", description: "Monitor driver safety and compliance.", permissions: "Drivers · Safety · Reports", icon: ShieldAlert },
  { id: "financial-analyst", title: "Financial Analyst", description: "Understand fuel costs and fleet performance.", permissions: "Fuel · Reports · Analytics", icon: WalletCards },
] as const;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<(typeof roles)[number]["id"]>("fleet-manager");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setError(""); setMessage(""); setLoading(true);
    try {
      const result = await request("auth/register", { method: "POST", body: JSON.stringify({ name: name.trim(), email: email.trim(), password, role }) });
      setMessage(result.message || "Account created successfully. Redirecting to sign in…");
      window.setTimeout(() => navigate("/login", { replace: true }), 1200);
    } catch (err) { setError(err instanceof Error ? err.message : "Unable to create account"); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-slate-950 p-4 sm:p-6">
    <div className="mx-auto max-w-3xl rounded-[30px] bg-white p-6 shadow-2xl sm:p-10">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 rounded-xl bg-indigo-600 p-2"><img src="/logo.png" alt="TransPilot" className="h-full w-full object-contain" /></div>
          <div><p className="font-bold text-slate-950">TransPilot</p><p className="text-xs text-slate-500">Fleet Operations</p></div>
        </div>
        <ShieldCheck className="text-indigo-500" size={22}/>
      </div>

      <div className="max-w-2xl">
        <p className="text-sm font-semibold text-indigo-600">Get started</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Create your workspace</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">Choose the role that best matches how you will use TransPilot. Administrators are initialized separately for security.</p>
      </div>

      <form onSubmit={submit} className="mt-8 space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label><div className="relative"><UserRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)} placeholder="Your name" autoComplete="name" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white"/></div></div>
          <div><label className="mb-2 block text-sm font-semibold text-slate-700">Work email</label><input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-500 focus:bg-white"/></div>
        </div>
        <div><label className="mb-2 block text-sm font-semibold text-slate-700">Password</label><input required minLength={8} maxLength={128} type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-500 focus:bg-white"/></div>

        <div>
          <div className="mb-3"><p className="text-sm font-semibold text-slate-700">Choose your role</p><p className="mt-0.5 text-xs text-slate-400">Your administrator can change your role later.</p></div>
          <div className="grid gap-3 md:grid-cols-2">
            {roles.map(({id,title,description,permissions,icon:Icon}) => {
              const selected = role === id;
              return <button type="button" key={id} onClick={()=>setRole(id)} aria-pressed={selected} className={`group rounded-2xl border p-4 text-left transition ${selected ? "border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-100" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"}`}>
                <div className="flex items-start justify-between"><span className={`rounded-xl p-2.5 ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:text-indigo-600"}`}><Icon size={18}/></span><span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-transparent"}`}>✓</span></div>
                <p className="mt-3 text-sm font-bold text-slate-900">{title}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p><p className="mt-3 text-[11px] font-medium text-slate-400">{permissions}</p>
              </button>;
            })}
          </div>
        </div>

        {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</p>}
        {message && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

        <button type="submit" disabled={loading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Creating account…" : "Create account"} {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5"/>}</button>
      </form>

      <div className="mt-7 flex flex-col items-center gap-2 border-t border-slate-100 pt-6 text-center">
        <p className="text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link></p>
        <button type="button" onClick={()=>navigate("/admin-setup")} className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Initialize the first administrator →</button>
      </div>
    </div>
  </main>;
}

import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Truck } from "lucide-react";
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
      try { login(role); navigate("/dashboard", { replace: true }); }
      catch { setSubmitError("Unable to sign in. Please try again."); setLoading(false); }
    }, 400);
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[28px] bg-white shadow-2xl lg:grid-cols-[1.05fr_.95fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-700 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 p-2 ring-1 ring-white/20"><img src="/logo.png" alt="TransPilot" className="h-full w-full object-contain" /></div><div><p className="text-xl font-bold">TransPilot</p><p className="text-xs text-indigo-100">Fleet Operations</p></div></div>
            <div className="mt-28 max-w-xl"><div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold ring-1 ring-white/15"><ShieldCheck size={15} /> Smart fleet management</div><h1 className="text-5xl font-bold leading-[1.08] tracking-tight">Your fleet.<br />Under control.</h1><p className="mt-6 max-w-md text-base leading-7 text-indigo-100">Plan trips, manage drivers, track vehicles and keep every operation moving from one intelligent workspace.</p></div>
          </div>
          <div className="relative grid grid-cols-3 gap-3">{[[Truck,"Fleet","Visibility"],[ShieldCheck,"Safety","Compliance"],[LockKeyhole,"Secure","Access"]].map(([Icon,title,text]) => { const I = Icon as typeof Truck; return <div key={title as string} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm"><I size={19}/><p className="mt-3 text-sm font-semibold">{title as string}</p><p className="text-xs text-indigo-100">{text as string}</p></div>; })}</div>
        </section>

        <section className="flex items-center justify-center px-6 py-10 sm:px-12 lg:px-14">
          <div className="w-full max-w-md">
            <div className="mb-9 flex items-center gap-3 lg:hidden"><div className="flex h-11 w-11 rounded-xl bg-indigo-600 p-2"><img src="/logo.png" alt="TransPilot" className="h-full w-full object-contain" /></div><div><p className="font-bold">TransPilot</p><p className="text-xs text-slate-500">Fleet Operations</p></div></div>
            <div className="mb-8"><p className="mb-2 text-sm font-semibold text-indigo-600">Welcome back 👋</p><h2 className="text-3xl font-bold tracking-tight text-slate-900">Sign in to your workspace</h2><p className="mt-2 text-sm leading-6 text-slate-500">Access your fleet command center and keep operations moving.</p></div>
            <div className="space-y-5">
              <div><label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label><div className="relative"><Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input id="email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={(e)=>{setEmail(e.target.value);setSubmitError("");setErrors(p=>({...p,email:validateEmail(e.target.value)}));}} onKeyDown={(e)=>e.key==="Enter"&&handleLogin()} className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:bg-white focus:ring-4 focus:ring-indigo-100 ${errors.email?"border-red-400":"border-slate-200 focus:border-indigo-500"}`}/></div>{errors.email&&<p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>}</div>
              <div><label htmlFor="password" className="mb-2 block text-sm font-semibold text-slate-700">Password</label><div className="relative"><LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/><input id="password" type={showPassword?"text":"password"} autoComplete="current-password" placeholder="Enter your password" value={password} onChange={(e)=>{setPassword(e.target.value);setSubmitError("");setErrors(p=>({...p,password:validatePassword(e.target.value)}));}} onKeyDown={(e)=>e.key==="Enter"&&handleLogin()} className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-12 text-sm outline-none transition focus:bg-white focus:ring-4 focus:ring-indigo-100 ${errors.password?"border-red-400":"border-slate-200 focus:border-indigo-500"}`}/><button type="button" aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{errors.password&&<p className="mt-1.5 text-xs font-medium text-red-500">{errors.password}</p>}</div>
              <div><label htmlFor="role" className="mb-2 block text-sm font-semibold text-slate-700">Workspace role</label><select id="role" value={role} onChange={e=>setRole(e.target.value as UserRole)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-100"><option value="admin">Admin</option><option value="fleet-manager">Fleet Manager</option><option value="dispatcher">Dispatcher</option><option value="safety-officer">Safety Officer</option><option value="financial-analyst">Financial Analyst</option></select></div>
              {submitError&&<div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{submitError}</div>}
              <button type="button" onClick={handleLogin} disabled={loading} className="h-12 w-full rounded-xl bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">{loading?"Signing you in...":"Sign in to dashboard"}</button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400"><LockKeyhole size={13}/> Secure fleet operations workspace</div>
          </div>
        </section>
      </div>
    </main>
  );
}

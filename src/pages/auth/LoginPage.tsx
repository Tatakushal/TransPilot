import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { Eye, EyeOff, LockKeyhole, Mail, ShieldCheck, Truck, UserRound, Radio, ShieldAlert, WalletCards, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/context/AuthContext";

const roles: Array<{ id: Exclude<UserRole, "admin">; title: string; description: string; permissions: string; icon: typeof Truck }> = [
  { id: "fleet-manager", title: "Fleet Manager", description: "Manage vehicles, drivers and fleet health.", permissions: "Fleet · Drivers · Trips · Maintenance", icon: Truck },
  { id: "dispatcher", title: "Dispatcher", description: "Coordinate trips and keep operations moving.", permissions: "Trips · Vehicles · Drivers", icon: Radio },
  { id: "safety-officer", title: "Safety Officer", description: "Monitor driver safety and compliance.", permissions: "Drivers · Safety · Reports", icon: ShieldAlert },
  { id: "financial-analyst", title: "Financial Analyst", description: "Understand fuel costs and fleet performance.", permissions: "Fuel · Reports · Analytics", icon: WalletCards },
];

export default function LoginPage() {
  const { login, register, user, isAuthReady } = useAuth();
  const navigate = useNavigate();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Exclude<UserRole, "admin">>("fleet-manager");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState({ name: "", email: "", password: "" });

  if (!isAuthReady) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  const validateEmail = (value: string) => {
    if (!value.trim()) return "Email is required";
    if (!/^\S+@\S+\.\S+$/.test(value.trim())) return "Enter a valid email";
    return "";
  };

  const validatePassword = (value: string) => {
    if (!value) return "Password is required";
    if (value.length < 8) return "Minimum 8 characters";
    return "";
  };

  async function handleSubmit() {
    const nextErrors = {
      name: isRegister && !name.trim() ? "Name is required" : "",
      email: validateEmail(email),
      password: validatePassword(password),
    };
    setErrors(nextErrors);
    setSubmitError("");
    if (nextErrors.name || nextErrors.email || nextErrors.password) return;

    setLoading(true);
    try {
      if (isRegister) {
        await register(name.trim(), email.trim(), password, role);
      } else {
        // The server determines the user's role from the authenticated account.
        await login(email.trim(), password);
      }
      navigate("/dashboard", { replace: true });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to continue. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function switchMode() {
    setIsRegister(v => !v);
    setSubmitError("");
    setErrors({ name: "", email: "", password: "" });
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-2rem)] max-w-6xl overflow-hidden rounded-[30px] bg-white shadow-2xl lg:grid-cols-[1.02fr_.98fr]">
        <section className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-700 via-indigo-700 to-slate-950 p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-indigo-400/30 blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-sky-400/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 p-2 ring-1 ring-white/20"><img src="/logo.png" alt="TransPilot" className="h-full w-full object-contain" /></div>
              <div><p className="text-xl font-bold">TransPilot</p><p className="text-xs text-indigo-100">Fleet Operations</p></div>
            </div>
            <div className="mt-28 max-w-xl">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-xs font-semibold ring-1 ring-white/15"><ShieldCheck size={15} /> Smart fleet management</div>
              <h1 className="text-5xl font-bold leading-[1.08] tracking-tight">Your fleet.<br />Under control.</h1>
              <p className="mt-6 max-w-md text-base leading-7 text-indigo-100">Plan trips, manage drivers, track vehicles and keep every operation moving from one intelligent workspace.</p>
            </div>
          </div>
          <div className="relative grid grid-cols-3 gap-3">
            {[[Truck, "Fleet", "Visibility"], [ShieldCheck, "Safety", "Compliance"], [LockKeyhole, "Secure", "Access"]].map(([Icon, title, text]) => { const I = Icon as typeof Truck; return <div key={title as string} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10 backdrop-blur-sm"><I size={19}/><p className="mt-3 text-sm font-semibold">{title as string}</p><p className="text-xs text-indigo-100">{text as string}</p></div>; })}
          </div>
        </section>

        <section className="flex items-center justify-center px-5 py-8 sm:px-10 lg:px-12 lg:py-10">
          <div className="w-full max-w-lg">
            <div className="mb-7 flex items-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 rounded-xl bg-indigo-600 p-2"><img src="/logo.png" alt="TransPilot" className="h-full w-full object-contain" /></div>
              <div><p className="font-bold">TransPilot</p><p className="text-xs text-slate-500">Fleet Operations</p></div>
            </div>

            <div className="mb-7">
              <p className="mb-2 text-sm font-semibold text-indigo-600">{isRegister ? "Welcome to TransPilot 👋" : "Welcome back 👋"}</p>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">{isRegister ? "Create your workspace" : "Sign in to your workspace"}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-500">{isRegister ? "Choose the role that matches how you'll use TransPilot." : "Enter your credentials. TransPilot automatically loads the access level assigned to your account."}</p>
            </div>

            <div className="space-y-5">
              {isRegister && (
                <div>
                  <label htmlFor="name" className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
                  <div className="relative">
                    <UserRound size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                    <input id="name" type="text" autoComplete="name" placeholder="Your name" value={name} onChange={e=>{setName(e.target.value);setSubmitError("");setErrors(p=>({...p,name:e.target.value.trim()?"":"Name is required"}));}} className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:bg-white focus:ring-4 focus:ring-indigo-100 ${errors.name?"border-red-400":"border-slate-200 focus:border-indigo-500"}`}/>
                  </div>
                  {errors.name&&<p className="mt-1.5 text-xs font-medium text-red-500">{errors.name}</p>}
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-semibold text-slate-700">Email address</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input id="email" type="email" autoComplete="email" placeholder="you@company.com" value={email} onChange={e=>{setEmail(e.target.value);setSubmitError("");setErrors(p=>({...p,email:validateEmail(e.target.value)}));}} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-4 text-sm outline-none transition focus:bg-white focus:ring-4 focus:ring-indigo-100 ${errors.email?"border-red-400":"border-slate-200 focus:border-indigo-500"}`}/>
                </div>
                {errors.email&&<p className="mt-1.5 text-xs font-medium text-red-500">{errors.email}</p>}
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="password" className="block text-sm font-semibold text-slate-700">Password</label>
                  {!isRegister && <button type="button" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">Forgot password?</button>}
                </div>
                <div className="relative">
                  <LockKeyhole size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"/>
                  <input id="password" type={showPassword?"text":"password"} autoComplete={isRegister?"new-password":"current-password"} placeholder={isRegister?"At least 8 characters":"Enter your password"} value={password} onChange={e=>{setPassword(e.target.value);setSubmitError("");setErrors(p=>({...p,password:validatePassword(e.target.value)}));}} onKeyDown={e=>e.key==="Enter"&&handleSubmit()} className={`h-12 w-full rounded-xl border bg-slate-50 pl-11 pr-12 text-sm outline-none transition focus:bg-white focus:ring-4 focus:ring-indigo-100 ${errors.password?"border-red-400":"border-slate-200 focus:border-indigo-500"}`}/>
                  <button type="button" aria-label={showPassword?"Hide password":"Show password"} onClick={()=>setShowPassword(v=>!v)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700">{showPassword?<EyeOff size={18}/>:<Eye size={18}/>}</button>
                </div>
                {errors.password&&<p className="mt-1.5 text-xs font-medium text-red-500">{errors.password}</p>}
              </div>

              {isRegister && (
                <div>
                  <div className="mb-3 flex items-end justify-between">
                    <div><p className="text-sm font-semibold text-slate-700">Choose your role</p><p className="mt-0.5 text-xs text-slate-400">You can be assigned a different role later by an administrator.</p></div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {roles.map(({ id, title, description, permissions, icon: Icon }) => {
                      const selected = role === id;
                      return <button type="button" key={id} onClick={() => setRole(id)} aria-pressed={selected} className={`group rounded-2xl border p-4 text-left transition ${selected ? "border-indigo-500 bg-indigo-50/70 shadow-sm ring-2 ring-indigo-100" : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50"}`}>
                        <div className="flex items-start justify-between gap-3">
                          <span className={`rounded-xl p-2.5 ${selected ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"}`}><Icon size={18}/></span>
                          <span className={`flex h-5 w-5 items-center justify-center rounded-full border text-[10px] font-bold ${selected ? "border-indigo-600 bg-indigo-600 text-white" : "border-slate-300 text-transparent"}`}>✓</span>
                        </div>
                        <p className="mt-3 text-sm font-bold text-slate-900">{title}</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">{description}</p>
                        <p className="mt-3 text-[11px] font-medium text-slate-400">{permissions}</p>
                      </button>;
                    })}
                  </div>
                </div>
              )}

              {submitError&&<div role="alert" className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">{submitError}</div>}

              <button type="button" onClick={handleSubmit} disabled={loading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60">
                {loading ? (isRegister ? "Creating workspace..." : "Signing you in...") : (isRegister ? "Create account" : "Sign in to dashboard")} {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5"/>}
              </button>

              <button type="button" onClick={switchMode} className="w-full text-center text-sm font-semibold text-indigo-600 hover:text-indigo-700">{isRegister ? "Already have an account? Sign in" : "New to TransPilot? Create an account"}</button>

              {isRegister && <div className="border-t border-slate-100 pt-5 text-center"><p className="text-xs text-slate-400">Setting up a new TransPilot environment?</p><button type="button" onClick={() => navigate("/admin-setup")} className="mt-1 text-xs font-bold text-slate-600 hover:text-indigo-600">Initialize the first administrator →</button></div>}
            </div>

            <div className="mt-7 flex items-center justify-center gap-2 text-xs text-slate-400"><LockKeyhole size={13}/> Secure fleet operations workspace</div>
          </div>
        </section>
      </div>
    </main>
  );
}

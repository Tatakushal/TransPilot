import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ShieldCheck, UserRound, UsersRound, LockKeyhole } from "lucide-react";
import { request } from "@/services/api";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const result = await request("auth/register", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password }),
      });
      setMessage(result.message || "Account created successfully. Redirecting to sign in…");
      window.setTimeout(() => navigate("/login", { replace: true }), 1400);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 p-4 sm:p-6">
      <div className="mx-auto max-w-3xl rounded-[30px] bg-white p-6 shadow-2xl sm:p-10">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 rounded-xl bg-indigo-600 p-2">
              <img src="/logo.png" alt="TransPilot" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-slate-950">TransPilot</p>
              <p className="text-xs text-slate-500">Fleet Operations</p>
            </div>
          </div>
          <ShieldCheck className="text-indigo-500" size={22} />
        </div>

        <div className="max-w-2xl">
          <p className="text-sm font-semibold text-indigo-600">Get started</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">Create your account</h1>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Create your account with your work details. Your administrator controls your access level and can assign or change your role.
          </p>
        </div>

        <form onSubmit={submit} className="mt-8 space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Full name</label>
              <div className="relative">
                <UserRound size={17} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input required minLength={2} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" autoComplete="name" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 text-sm outline-none focus:border-indigo-500 focus:bg-white" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">Work email</label>
              <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" autoComplete="email" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-500 focus:bg-white" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Password</label>
            <input required minLength={8} maxLength={128} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" autoComplete="new-password" className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm outline-none focus:border-indigo-500 focus:bg-white" />
          </div>

          <section className="rounded-[24px] border border-indigo-100 bg-indigo-50/60 p-5">
            <div className="flex items-start gap-4">
              <div className="rounded-xl bg-indigo-600 p-2.5 text-white">
                <UsersRound size={19} />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-950">Role assignment is administrator-controlled</h2>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  You don't choose your permissions during registration. The TransPilot administrator assigns the appropriate role from the Admin Control Center.
                </p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/80 p-3.5 ring-1 ring-indigo-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800"><LockKeyhole size={15} className="text-indigo-600" /> Server enforced</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">The backend assigns the initial account role. Browser input cannot elevate access.</p>
              </div>
              <div className="rounded-2xl bg-white/80 p-3.5 ring-1 ring-indigo-100">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800"><ShieldCheck size={15} className="text-indigo-600" /> Admin managed</div>
                <p className="mt-1 text-xs leading-5 text-slate-500">Administrators can change roles, disable accounts and revoke sessions.</p>
              </div>
            </div>
          </section>

          {error && <p role="alert" className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm text-red-600">{error}</p>}
          {message && <p role="status" className="rounded-xl border border-emerald-100 bg-emerald-50 p-3 text-sm text-emerald-700">{message}</p>}

          <button type="submit" disabled={loading} className="group flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 font-semibold text-white shadow-lg shadow-indigo-200 transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60">
            {loading ? "Creating account…" : "Create account"}
            {!loading && <ArrowRight size={17} className="transition-transform group-hover:translate-x-0.5" />}
          </button>
        </form>

        <div className="mt-7 flex flex-col items-center gap-2 border-t border-slate-100 pt-6 text-center">
          <p className="text-sm text-slate-500">Already have an account? <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700">Sign in</Link></p>
          <button type="button" onClick={() => navigate("/admin-setup")} className="text-xs font-semibold text-slate-500 hover:text-indigo-600">Initialize the first administrator →</button>
        </div>
      </div>
    </main>
  );
}

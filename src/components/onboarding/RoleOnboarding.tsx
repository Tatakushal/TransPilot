import { useEffect, useState } from "react";
import { ArrowRight, CheckCircle2, CircleHelp, ShieldCheck, Truck, Radio, ShieldAlert, WalletCards, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import type { UserRole } from "@/context/AuthContext";

type Guide = {
  title: string;
  subtitle: string;
  responsibilities: string[];
  firstSteps: string[];
  modules: Array<[string, string]>;
  icon: typeof Truck;
};

const guides: Record<UserRole, Guide> = {
  admin: {
    title: "Welcome to TransPilot",
    subtitle: "You’re the administrator. Start by setting up the people, access and operating structure behind your fleet.",
    responsibilities: ["Manage users and role access", "Review audit activity and active sessions", "Oversee fleet operations and system health", "Keep the workspace secure and correctly configured"],
    firstSteps: ["Create your fleet team from Admin → Users", "Add your vehicles and drivers", "Review role permissions before inviting more users"],
    modules: [["Admin", "Users, permissions, audit logs and sessions"], ["Dashboard", "Fleet-wide health and live KPIs"], ["Settings", "Workspace and account configuration"]],
    icon: ShieldCheck,
  },
  "fleet-manager": {
    title: "Welcome, Fleet Manager",
    subtitle: "Your job is to keep the fleet available, safe and productive.",
    responsibilities: ["Maintain the vehicle registry and availability", "Manage driver assignments and readiness", "Plan and monitor trips", "Track maintenance and operational risks"],
    firstSteps: ["Add your vehicles", "Add your drivers and verify their readiness", "Create your first trip and monitor the dashboard"],
    modules: [["Vehicles", "Fleet inventory, status and capacity"], ["Drivers", "Licences, safety and availability"], ["Trips", "Assignments and trip lifecycle"], ["Maintenance", "Service history and vehicle health"]],
    icon: Truck,
  },
  dispatcher: {
    title: "Welcome, Dispatcher",
    subtitle: "Your workspace is built around keeping trips moving with the right vehicle and driver at the right time.",
    responsibilities: ["Coordinate trip assignments", "Check vehicle and driver availability", "Track pending and active trips", "Resolve operational conflicts quickly"],
    firstSteps: ["Review available vehicles and drivers", "Create your first trip", "Use Operations to watch pending and active work"],
    modules: [["Operations", "Live dispatch and attention queue"], ["Trips", "Create and manage assignments"], ["Vehicles", "Check availability and capacity"], ["Drivers", "Check driver availability"]],
    icon: Radio,
  },
  "safety-officer": {
    title: "Welcome, Safety Officer",
    subtitle: "Your focus is driver readiness, safety signals and compliance visibility.",
    responsibilities: ["Monitor driver safety scores", "Review licence and readiness information", "Identify suspended or unavailable drivers", "Use reports to surface safety trends"],
    firstSteps: ["Review the Drivers directory", "Check safety and expiry information", "Use Reports to establish a baseline for your fleet"],
    modules: [["Drivers", "Safety scores, licences and status"], ["Reports", "Safety and operational analysis"], ["Dashboard", "Current driver and fleet signals"]],
    icon: ShieldAlert,
  },
  "financial-analyst": {
    title: "Welcome, Financial Analyst",
    subtitle: "Your workspace helps you understand the cost of operating the fleet and turn records into useful financial insight.",
    responsibilities: ["Track fuel spending", "Review fleet operating costs", "Analyse reports and trends", "Identify cost patterns that need attention"],
    firstSteps: ["Review Fuel records", "Confirm vehicle cost data is current", "Use Reports to establish your first financial baseline"],
    modules: [["Fuel", "Fuel usage, odometer and spend"], ["Reports", "Cost and performance analysis"], ["Dashboard", "Fleet-level operational context"]],
    icon: WalletCards,
  },
};

const STORAGE_PREFIX = "transpilot_onboarding_seen_v1_";

export default function RoleOnboarding() {
  const { user } = useAuth();
  const [open, setOpen] = useState(() => {
    if (!user) return false;
    return localStorage.getItem(STORAGE_PREFIX + user.role) !== "true";
  });

  useEffect(() => {
    const reopen = () => setOpen(true);
    window.addEventListener("transpilot:open-onboarding", reopen);
    return () => window.removeEventListener("transpilot:open-onboarding", reopen);
  }, []);

  if (!user || !open) return null;

  const guide = guides[user.role];
  const Icon = guide.icon;

  function finish() {
    localStorage.setItem(STORAGE_PREFIX + user.role, "true");
    setOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="onboarding-title">
      <div className="w-full max-w-3xl overflow-hidden rounded-[30px] bg-white shadow-2xl">
        <div className="relative overflow-hidden bg-slate-950 px-7 py-7 text-white sm:px-9">
          <div className="absolute -right-20 -top-24 h-64 w-64 rounded-full bg-indigo-500/25 blur-3xl" />
          <div className="relative flex items-start justify-between gap-5">
            <div className="flex items-start gap-4">
              <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-white/10"><Icon size={24} /></div>
              <div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-300">First-time guide</p><h2 id="onboarding-title" className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">{guide.title}</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">{guide.subtitle}</p></div>
            </div>
            <button onClick={finish} aria-label="Close onboarding" className="rounded-xl p-2 text-slate-400 hover:bg-white/10 hover:text-white"><X size={18}/></button>
          </div>
        </div>

        <div className="grid gap-6 p-7 sm:p-9 lg:grid-cols-[1fr_1fr]">
          <section>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><ShieldCheck size={17} className="text-indigo-600"/> Your responsibilities</div>
            <div className="mt-4 space-y-3">
              {guide.responsibilities.map(item => <div key={item} className="flex gap-3 rounded-2xl bg-slate-50 p-3.5"><CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-500"/><p className="text-sm leading-5 text-slate-600">{item}</p></div>)}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><CircleHelp size={17} className="text-indigo-600"/> What to do first</div>
            <div className="mt-4 space-y-3">
              {guide.firstSteps.map((item, index) => <div key={item} className="flex gap-3 rounded-2xl border border-slate-200 p-3.5"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-bold text-indigo-600">{index + 1}</span><p className="text-sm leading-5 text-slate-600">{item}</p></div>)}
            </div>
          </section>

          <section className="lg:col-span-2">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-950"><ArrowRight size={17} className="text-indigo-600"/> Your main areas</div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {guide.modules.map(([name, description]) => <div key={name} className="rounded-2xl border border-slate-200 p-4"><p className="text-sm font-bold text-slate-900">{name}</p><p className="mt-1 text-xs leading-5 text-slate-500">{description}</p></div>)}
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse gap-3 border-t border-slate-100 bg-slate-50/70 px-7 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-9">
          <p className="text-xs text-slate-400">You can close this guide now. Your role determines the navigation and permissions available to you.</p>
          <button onClick={finish} className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white hover:bg-indigo-700">Got it, let’s start <ArrowRight size={16}/></button>
        </div>
      </div>
    </div>
  );
}

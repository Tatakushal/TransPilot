import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, RefreshCw } from "lucide-react";
import { getDrivers, type Driver } from "@/services/driverService";

export default function DriverAlerts() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getDrivers().then((next) => { if (active) setDrivers(next); }).catch(() => { /* dashboard can still render without alerts */ }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const alerts = useMemo(() => {
    const now = new Date();
    const candidates = drivers.flatMap((driver) => {
      const expiry = new Date(`${driver.licenseExpiryDate}T00:00:00`);
      const daysToExpiry = Math.ceil((expiry.getTime() - now.getTime()) / 86400000);
      const items: { driver: string; message: string; tone: "yellow" | "red" | "blue" }[] = [];
      if (daysToExpiry <= 30) items.push({ driver: driver.name, message: daysToExpiry < 0 ? `License expired ${Math.abs(daysToExpiry)} days ago` : `License expires in ${daysToExpiry} days`, tone: "yellow" });
      if (driver.safety < 70) items.push({ driver: driver.name, message: `Safety score is ${driver.safety}%`, tone: "red" });
      if (driver.status === "Suspended") items.push({ driver: driver.name, message: "Driver is currently suspended", tone: "red" });
      return items;
    });
    return candidates.slice(0, 4);
  }, [drivers]);

  return <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm"><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold">Driver Alerts</h2><p className="mt-1 text-sm text-slate-500">Live safety & compliance checks</p></div><div className="rounded-2xl bg-red-100 p-3"><ShieldAlert size={22} className="text-red-600" /></div></div><div className="mt-8 space-y-5">{loading ? <div className="flex items-center justify-center py-8 text-sm text-slate-400"><RefreshCw className="mr-2 animate-spin" size={16} />Checking drivers…</div> : alerts.length === 0 ? <div className="rounded-2xl bg-emerald-50 p-5 text-sm font-medium text-emerald-700">No driver safety or compliance alerts.</div> : alerts.map((alert, index) => <div key={`${alert.driver}-${alert.message}-${index}`} className="rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50"><div className="flex items-start justify-between gap-4"><div><p className="font-semibold">{alert.driver}</p><p className="mt-1 text-sm text-slate-500">{alert.message}</p></div><span className={`mt-1 h-2.5 w-2.5 rounded-full ${alert.tone === "red" ? "bg-red-500" : "bg-amber-400"}`} /></div></div>)}</div></motion.div>;
}

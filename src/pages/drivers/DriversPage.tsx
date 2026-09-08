import { useCallback, useMemo, useState } from "react";
import type { ComponentType } from "react";
import AppShell from "@/components/layout/AppShell";
import DriverToolbar from "@/components/drivers/DriverToolbar";
import DriverTable from "@/components/drivers/DriverTable";
import { addDriver, updateDriver, type Driver, type DriverStatus } from "@/services/driverService";
import { ShieldCheck, Users, UserCheck, AlertTriangle, X } from "lucide-react";

type DriverStat = { label: string; value: number; Icon: ComponentType<{ size?: number }> };

type FormState = {
  name: string;
  license: string;
  licenseCategory: string;
  licenseExpiryDate: string;
  contactNumber: string;
  safety: string;
  status: DriverStatus;
};

const today = new Date();
const defaultExpiry = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate()).toISOString().slice(0, 10);
const emptyForm: FormState = {
  name: "",
  license: "",
  licenseCategory: "LMV",
  licenseExpiryDate: defaultExpiry,
  contactNumber: "",
  safety: "100",
  status: "Available",
};

export default function DriversPage() {
  const [search, setSearch] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);
  const [editing, setEditing] = useState<Driver | null>(null);
  const [viewing, setViewing] = useState<Driver | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setError("");
    setOpen(true);
  };

  const openEdit = (driver: Driver) => {
    setEditing(driver);
    setForm({
      name: driver.name,
      license: driver.license,
      licenseCategory: driver.licenseCategory,
      licenseExpiryDate: driver.licenseExpiryDate,
      contactNumber: driver.contactNumber,
      safety: String(driver.safety),
      status: driver.status,
    });
    setError("");
    setOpen(true);
  };

  const close = () => {
    if (saving) return;
    setOpen(false);
    setEditing(null);
    setError("");
  };

  const save = async () => {
    const safety = Number(form.safety);
    if (!form.name.trim() || !form.license.trim() || !form.licenseCategory.trim() || !form.licenseExpiryDate || !form.contactNumber.trim()) {
      setError("Please complete all driver fields.");
      return;
    }
    if (!Number.isFinite(safety) || safety < 0 || safety > 100) {
      setError("Safety score must be between 0 and 100.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      const driver: Driver = {
        name: form.name.trim(),
        license: form.license.trim().toUpperCase(),
        licenseCategory: form.licenseCategory.trim(),
        licenseExpiryDate: form.licenseExpiryDate,
        contactNumber: form.contactNumber.trim(),
        safety,
        status: form.status,
      };
      if (editing) {
        await updateDriver(driver);
      } else {
        await addDriver(driver);
      }
      close();
      refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to save driver.");
    } finally {
      setSaving(false);
    }
  };

  const stats = useMemo<DriverStat[]>(() => [
    { label: "Total Drivers", value: 0, Icon: Users },
    { label: "Available", value: 0, Icon: UserCheck },
    { label: "On Trip", value: 0, Icon: ShieldCheck },
    { label: "Safety Alerts", value: 0, Icon: AlertTriangle },
  ], []);

  return (
    <AppShell>
      <div className="space-y-7">
        <div>
          <p className="text-sm font-semibold text-indigo-600">People & safety</p>
          <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-900">Driver Management</h1>
          <p className="mt-2 text-sm text-slate-500">Manage driver profiles, availability and safety compliance.</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map(({ label, Icon }) => (
            <div key={label} className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">{label}</span>
                <span className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600"><Icon size={19} /></span>
              </div>
              <p className="mt-4 text-3xl font-bold text-slate-900">—</p>
            </div>
          ))}
        </div>

        <DriverToolbar search={search} onSearch={setSearch} onAdd={openCreate} />
        <DriverTable
          search={search}
          refreshKey={refreshKey}
          onEdit={openEdit}
          onView={setViewing}
        />

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-7 shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-indigo-600">{editing ? "Update profile" : "New profile"}</p>
                  <h2 className="mt-1 text-xl font-bold text-slate-900">{editing ? "Edit Driver" : "Add Driver"}</h2>
                  <p className="mt-1 text-sm text-slate-500">Driver information is saved to the fleet database.</p>
                </div>
                <button type="button" onClick={close} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={20} /></button>
              </div>

              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold text-slate-700">Full name
                  <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-indigo-500 focus:bg-white" placeholder="Driver name" />
                </label>
                <label className="text-sm font-semibold text-slate-700">License number
                  <input value={form.license} disabled={Boolean(editing)} onChange={(e) => setForm({ ...form, license: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal uppercase outline-none disabled:cursor-not-allowed disabled:opacity-60 focus:border-indigo-500 focus:bg-white" placeholder="DL-123456" />
                </label>
                <label className="text-sm font-semibold text-slate-700">License category
                  <input value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-indigo-500 focus:bg-white" placeholder="LMV / HMV" />
                </label>
                <label className="text-sm font-semibold text-slate-700">License expiry
                  <input type="date" value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-indigo-500 focus:bg-white" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Contact number
                  <input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-indigo-500 focus:bg-white" placeholder="Phone number" />
                </label>
                <label className="text-sm font-semibold text-slate-700">Safety score
                  <input type="number" min="0" max="100" value={form.safety} onChange={(e) => setForm({ ...form, safety: e.target.value })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-indigo-500 focus:bg-white" />
                </label>
                <label className="text-sm font-semibold text-slate-700 sm:col-span-2">Status
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as DriverStatus })} className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 font-normal outline-none focus:border-indigo-500 focus:bg-white">
                    <option>Available</option><option>On Trip</option><option>Off Duty</option><option>Suspended</option>
                  </select>
                </label>
              </div>

              {error && <div role="alert" className="mt-4 rounded-xl border border-rose-100 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700">{error}</div>}
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={close} disabled={saving} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
                <button type="button" onClick={save} disabled={saving} className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50">{saving ? "Saving…" : editing ? "Save changes" : "Create driver"}</button>
              </div>
            </div>
          </div>
        )}

        {viewing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm" onMouseDown={() => setViewing(null)}>
            <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl" onMouseDown={(event) => event.stopPropagation()}>
              <div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-indigo-600">Driver profile</p><h2 className="mt-1 text-xl font-bold text-slate-900">{viewing.name}</h2></div><button type="button" onClick={() => setViewing(null)} className="rounded-xl p-2 text-slate-400 hover:bg-slate-100" aria-label="Close"><X size={20} /></button></div>
              <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
                <div><dt className="text-slate-400">License</dt><dd className="mt-1 font-semibold text-slate-700">{viewing.license}</dd></div>
                <div><dt className="text-slate-400">Category</dt><dd className="mt-1 font-semibold text-slate-700">{viewing.licenseCategory}</dd></div>
                <div><dt className="text-slate-400">Expiry</dt><dd className="mt-1 font-semibold text-slate-700">{viewing.licenseExpiryDate}</dd></div>
                <div><dt className="text-slate-400">Safety</dt><dd className="mt-1 font-semibold text-slate-700">{viewing.safety}%</dd></div>
                <div><dt className="text-slate-400">Contact</dt><dd className="mt-1 font-semibold text-slate-700">{viewing.contactNumber}</dd></div>
                <div><dt className="text-slate-400">Status</dt><dd className="mt-1 font-semibold text-slate-700">{viewing.status}</dd></div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

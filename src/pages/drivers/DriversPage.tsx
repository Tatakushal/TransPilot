import AppShell from "@/components/layout/AppShell";
import DriverToolbar from "@/components/drivers/DriverToolbar";
import DriverTable from "@/components/drivers/DriverTable";

export default function DriversPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Driver Management
          </h1>

          <p className="text-base text-slate-500">
            Manage driver profiles and safety compliance.
          </p>
        </div>

        <DriverToolbar />

        <DriverTable />
      </div>
    </AppShell>
  );
}

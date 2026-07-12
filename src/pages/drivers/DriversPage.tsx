import AppShell from "@/components/layout/AppShell";
import DriverToolbar from "@/components/drivers/DriverToolbar";
import DriverTable from "@/components/drivers/DriverTable";

export default function DriversPage() {
  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Driver Management</h1>

          <p className="text-gray-500 mt-2">
            Manage driver profiles and safety compliance.
          </p>
        </div>

        <DriverToolbar />

        <DriverTable />
      </div>
    </AppShell>
  );
}

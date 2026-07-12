import AppShell from "@/components/layout/AppShell";
import VehicleToolbar from "@/components/vehicles/VehicleToolbar";
import VehicleTable from "@/components/vehicles/VehicleTable";

export default function VehiclesPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Vehicle Registry
          </h1>

          <p className="text-base text-slate-500">
            Manage fleet assets and monitor availability.
          </p>
        </div>

        <VehicleToolbar />

        <VehicleTable />
      </div>
    </AppShell>
  );
}

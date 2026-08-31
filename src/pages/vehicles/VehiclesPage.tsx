import { useCallback, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import VehicleToolbar from "@/components/vehicles/VehicleToolbar";
import VehicleTable from "@/components/vehicles/VehicleTable";
import AddVehicleModal from "@/components/vehicles/AddVehicleModal";

export default function VehiclesPage() {
  const [addOpen, setAddOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vehicle Registry</h1>
          <p className="text-base text-slate-500">Manage fleet assets and monitor availability.</p>
        </div>

        <VehicleToolbar onAdd={() => setAddOpen(true)} />
        <VehicleTable key={refreshKey} />

        <AddVehicleModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refresh} />
      </div>
    </AppShell>
  );
}

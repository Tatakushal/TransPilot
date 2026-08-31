import { useCallback, useState } from "react";
import AppShell from "@/components/layout/AppShell";
import VehicleToolbar from "@/components/vehicles/VehicleToolbar";
import VehicleTable from "@/components/vehicles/VehicleTable";
import AddVehicleModal from "@/components/vehicles/AddVehicleModal";
import EditVehicleModal from "@/components/vehicles/EditVehicleModal";
import VehicleDetailsModal from "@/components/vehicles/VehicleDetailsModal";
import type { Vehicle } from "@/types/vehicles";

export default function VehiclesPage() {
  const [search, setSearch] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [viewingVehicle, setViewingVehicle] = useState<Vehicle | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refresh = useCallback(() => setRefreshKey((key) => key + 1), []);

  return (
    <AppShell>
      <div className="space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Vehicle Registry</h1>
          <p className="text-base text-slate-500">Manage fleet assets and monitor availability.</p>
        </div>

        <VehicleToolbar search={search} onSearch={setSearch} onAdd={() => setAddOpen(true)} />
        <VehicleTable search={search} refreshKey={refreshKey} onEdit={setEditingVehicle} onView={setViewingVehicle} />

        <AddVehicleModal open={addOpen} onClose={() => setAddOpen(false)} onSuccess={refresh} />
        <EditVehicleModal vehicle={editingVehicle} onClose={() => setEditingVehicle(null)} onSuccess={refresh} />
        <VehicleDetailsModal vehicle={viewingVehicle} onClose={() => setViewingVehicle(null)} />
      </div>
    </AppShell>
  );
}

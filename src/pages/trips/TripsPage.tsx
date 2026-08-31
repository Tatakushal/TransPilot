import { useState } from "react";
import AppShell from "@/components/layout/AppShell";
import TripToolbar from "@/components/trips/TripToolbar";
import TripTable from "@/components/trips/TripTable";
import CreateTripModal from "@/components/trips/CreateTripModal";
import type { Trip } from "@/services/tripService";

export default function TripsPage() {
  const [open, setOpen] = useState(false);
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const openCreate = () => { setEditingTrip(null); setOpen(true); };
  const openEdit = (trip: Trip) => { setEditingTrip(trip); setOpen(true); };
  const close = () => { setOpen(false); setEditingTrip(null); };

  return (
    <AppShell>
      <TripToolbar onCreateTrip={openCreate} />
      <TripTable refreshKey={refreshKey} onEdit={openEdit} />
      <CreateTripModal open={open} editingTrip={editingTrip} onClose={close} onCreated={() => setRefreshKey(k => k + 1)} />
    </AppShell>
  );
}

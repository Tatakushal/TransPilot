import { useState } from "react";

import AppShell from "@/components/layout/AppShell";

import TripToolbar from "@/components/trips/TripToolbar";

import TripTable from "@/components/trips/TripTable";

import CreateTripModal from "@/components/trips/CreateTripModal";

export default function TripsPage() {
  const [open, setOpen] = useState(false);

  return (
    <AppShell>
      <TripToolbar onCreateTrip={() => setOpen(true)} />

      <TripTable />

      <CreateTripModal open={open} onClose={() => setOpen(false)} />
    </AppShell>
  );
}

interface Vehicle {
  status: string;
  capacity: number;
}

interface Driver {
  status: string;
  licenseExpired: boolean;
}

export function validateTrip(
  vehicle: Vehicle,
  driver: Driver,
  cargoWeight: number,
): string | null {
  if (vehicle.status === "Maintenance")
    return "Vehicle is currently in maintenance.";

  if (vehicle.status === "On Trip")
    return "Vehicle is already assigned to another trip.";

  if (driver.status === "On Trip") return "Driver is already assigned.";

  if (driver.status === "Suspended") return "Driver is suspended.";

  if (driver.licenseExpired) return "Driver license has expired.";

  if (cargoWeight > vehicle.capacity) return "Cargo exceeds vehicle capacity.";

  return null;
}

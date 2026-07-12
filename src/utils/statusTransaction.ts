export interface Vehicle {
  status: "Available" | "On Trip" | "Maintenance";
}

export interface Driver {
  status: "Available" | "On Trip" | "Suspended";
}

export function dispatchTrip(vehicle: Vehicle, driver: Driver) {
  vehicle.status = "On Trip";
  driver.status = "On Trip";
}

export function completeTrip(vehicle: Vehicle, driver: Driver) {
  vehicle.status = "Available";
  driver.status = "Available";
}

export function startMaintenance(vehicle: Vehicle) {
  vehicle.status = "Maintenance";
}

export function finishMaintenance(vehicle: Vehicle) {
  vehicle.status = "Available";
}

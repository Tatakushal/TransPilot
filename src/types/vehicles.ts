export type VehicleStatus = "Available" | "On Trip" | "In Shop" | "Retired";

export interface Vehicle {
  id: number;
  registration: string;
  model: string;
  type: string;
  capacity: string;
  odometer: number;
  acquisitionCost: number;
  status: VehicleStatus;
}

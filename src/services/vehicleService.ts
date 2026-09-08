import { deleteData, getData, postData, putData } from "@/services/api";
import type { Vehicle, VehicleStatus } from "@/types/vehicles";

interface VehicleResponse {
  registration_number: string;
  vehicle_name_model: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: string;
}

export interface VehiclePayload {
  registration_number: string;
  vehicle_name_model: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: VehicleStatus;
}

function mapVehicle(vehicle: VehicleResponse): Vehicle {
  return {
    id: vehicle.registration_number as unknown as number,
    registration: vehicle.registration_number,
    model: vehicle.vehicle_name_model,
    type: vehicle.type,
    capacity: `${vehicle.max_load_capacity.toLocaleString()} kg`,
    odometer: vehicle.odometer,
    acquisitionCost: vehicle.acquisition_cost,
    status: vehicle.status as VehicleStatus,
  };
}

function toPayload(vehicle: Vehicle): VehiclePayload {
  return {
    registration_number: vehicle.registration.trim().toUpperCase(),
    vehicle_name_model: vehicle.model.trim(),
    type: vehicle.type.trim(),
    max_load_capacity: Number(String(vehicle.capacity).replace(/[^0-9.]/g, "")),
    odometer: Number(vehicle.odometer),
    acquisition_cost: Number(vehicle.acquisitionCost),
    status: vehicle.status,
  };
}

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await getData("vehicles") as VehicleResponse[];
  return response.map(mapVehicle);
}

export async function addVehicle(vehicle: Vehicle) {
  return postData("vehicles", toPayload(vehicle));
}

export async function updateVehicle(vehicle: Pick<Vehicle, "registration" | "model" | "type" | "capacity" | "odometer" | "acquisitionCost" | "status">) {
  return putData(`vehicles/${encodeURIComponent(vehicle.registration)}`, {
    vehicle_name_model: vehicle.model.trim(),
    type: vehicle.type.trim(),
    max_load_capacity: Number(String(vehicle.capacity).replace(/[^0-9.]/g, "")),
    odometer: Number(vehicle.odometer),
    acquisition_cost: Number(vehicle.acquisitionCost),
    status: vehicle.status,
  });
}

export function deleteVehicle(registration: string) {
  return deleteData(`vehicles/${encodeURIComponent(registration)}`);
}

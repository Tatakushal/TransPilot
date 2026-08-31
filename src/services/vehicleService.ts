import axios from "axios";
import type { Vehicle, VehicleStatus } from "@/types/vehicles";

const API = import.meta.env.VITE_API_URL || "/api";

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

function mapVehicle(v: VehicleResponse): Vehicle {
  return {
    id: v.registration_number as unknown as number,
    registration: v.registration_number,
    model: v.vehicle_name_model,
    type: v.type,
    capacity: `${v.max_load_capacity.toLocaleString()} kg`,
    odometer: v.odometer,
    acquisitionCost: v.acquisition_cost,
    status: v.status as VehicleStatus,
  };
}

function toPayload(vehicle: Vehicle): VehiclePayload {
  return {
    registration_number: vehicle.registration.trim().toUpperCase(),
    vehicle_name_model: vehicle.model.trim(), type: vehicle.type.trim(),
    max_load_capacity: Number(String(vehicle.capacity).replace(/[^0-9.]/g, "")),
    odometer: Number(vehicle.odometer), acquisition_cost: Number(vehicle.acquisitionCost), status: vehicle.status,
  };
}

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await axios.get<VehicleResponse[]>(`${API}/vehicles`);
  return response.data.map(mapVehicle);
}

export async function addVehicle(vehicle: Vehicle) { return axios.post(`${API}/vehicles`, toPayload(vehicle)); }

export async function updateVehicle(vehicle: Pick<Vehicle, "registration" | "model" | "type" | "capacity" | "odometer" | "acquisitionCost" | "status">) {
  return axios.put(`${API}/vehicles/${encodeURIComponent(vehicle.registration)}`, {
    vehicle_name_model: vehicle.model.trim(), type: vehicle.type.trim(),
    max_load_capacity: Number(String(vehicle.capacity).replace(/[^0-9.]/g, "")),
    odometer: Number(vehicle.odometer), acquisition_cost: Number(vehicle.acquisitionCost), status: vehicle.status,
  });
}

export async function deleteVehicle(registration: string) { return axios.delete(`${API}/vehicles/${encodeURIComponent(registration)}`); }

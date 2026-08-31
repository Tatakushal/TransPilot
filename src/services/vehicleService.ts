import axios from "axios";
import type { Vehicle } from "@/types/vehicles";

const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

interface VehicleResponse {
  registration_number: string;
  vehicle_name_model: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: Vehicle["status"];
}

function mapVehicle(v: VehicleResponse): Vehicle {
  return {
    id: Number.NaN,
    registration: v.registration_number,
    model: v.vehicle_name_model,
    type: v.type,
    capacity: `${v.max_load_capacity.toLocaleString()} kg`,
    odometer: v.odometer,
    acquisitionCost: v.acquisition_cost,
    status: v.status,
  };
}

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await axios.get<VehicleResponse[]>(`${API}/vehicles`);
  return response.data.map(mapVehicle);
}

export interface VehiclePayload {
  registration_number: string;
  vehicle_name_model: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: Vehicle["status"];
}

export async function addVehicle(vehicle: VehiclePayload) {
  return axios.post<VehicleResponse>(`${API}/vehicles`, vehicle);
}

export async function updateVehicle(registration: string, vehicle: Omit<VehiclePayload, "registration_number">) {
  return axios.put<VehicleResponse>(`${API}/vehicles/${encodeURIComponent(registration)}`, vehicle);
}

export async function deleteVehicle(registration: string) {
  return axios.delete(`${API}/vehicles/${encodeURIComponent(registration)}`);
}

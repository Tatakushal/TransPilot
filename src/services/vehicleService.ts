import axios from "axios";
import type { Vehicle } from "@/types/vehicles";

const API = "http://127.0.0.1:8000/api";

interface VehicleResponse {
  registration_number: string;
  vehicle_name_model: string;
  type: string;
  max_load_capacity: number;
  odometer: number;
  acquisition_cost: number;
  status: string;
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
    status: v.status as Vehicle["status"],
  };
}

export async function getVehicles(): Promise<Vehicle[]> {
  const response = await axios.get<VehicleResponse[]>(`${API}/vehicles`);
  return response.data.map(mapVehicle);
}

export async function addVehicle(vehicle: Vehicle) {
  return axios.post(`${API}/vehicles`, vehicle);
}

export async function updateVehicle(vehicle: Vehicle) {
  return axios.put(`${API}/vehicles/${vehicle.registration}`, vehicle);
}

export async function deleteVehicle(registration: string) {
  return axios.delete(`${API}/vehicles/${registration}`);
}

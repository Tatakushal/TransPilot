import { getData } from "@/services/api";

export interface DashboardKPIs {
  active_vehicles: number;
  available_vehicles: number;
  vehicles_in_maintenance: number;
  active_trips: number;
  pending_trips: number;
  drivers_on_duty: number;
  fleet_utilization_percent: number;
}

export async function getDashboardKPIs(): Promise<DashboardKPIs> {
  return getData("dashboard/kpis") as Promise<DashboardKPIs>;
}

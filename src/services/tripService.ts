import { deleteData, getData, postData, putData } from "@/services/api";

export interface Trip {
  id: number;
  vehicle_registration: string;
  driver_license: string;
  source: string;
  destination: string;
  cargo_weight: number;
  trip_date: string;
  status: "Pending" | "Active" | "Completed" | "Cancelled";
}

export interface TripPayload {
  vehicle_registration: string;
  driver_license: string;
  source: string;
  destination: string;
  cargo_weight: number;
  trip_date: string;
  status: Trip["status"];
}

export const tripService = {
  list: () => getData("trips") as Promise<Trip[]>,
  get: (id: number) => getData(`trips/${id}`) as Promise<Trip>,
  create: (payload: TripPayload) => postData("trips", payload) as Promise<Trip>,
  update: (id: number, payload: TripPayload) => putData(`trips/${id}`, payload) as Promise<Trip>,
  remove: (id: number) => deleteData(`trips/${id}`),
};

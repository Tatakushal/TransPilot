const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

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

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.detail) message = body.detail;
    } catch { /* keep fallback */ }
    throw new Error(message);
  }
  return response.json();
}

export const tripService = {
  list: () => request<Trip[]>("/trips"),
  get: (id: number) => request<Trip>(`/trips/${id}`),
  create: (payload: TripPayload) => request<Trip>("/trips", { method: "POST", body: JSON.stringify(payload) }),
  update: (id: number, payload: TripPayload) => request<Trip>(`/trips/${id}`, { method: "PUT", body: JSON.stringify(payload) }),
  remove: (id: number) => request<{ message: string }>(`/trips/${id}`, { method: "DELETE" }),
};

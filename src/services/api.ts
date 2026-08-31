const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("transpilot_access_token");
  const res = await fetch(`${API_URL}/${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `API request failed (${res.status})`);
  }
  return res.json();
}

export function getData(endpoint: string) { return request(endpoint); }
export function postData(endpoint: string, body: unknown) { return request(endpoint, { method: "POST", body: JSON.stringify(body) }); }
export function putData(endpoint: string, body: unknown) { return request(endpoint, { method: "PUT", body: JSON.stringify(body) }); }
export function deleteData(endpoint: string) { return request(endpoint, { method: "DELETE" }); }

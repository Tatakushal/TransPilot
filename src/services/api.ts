const API_URL = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");

export async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("transpilot_access_token");
  const res = await fetch(`${API_URL}/${endpoint.replace(/^\//, "")}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("transpilot_access_token");
      localStorage.removeItem("transpilot_user");
      window.dispatchEvent(new Event("transpilot:unauthorized"));
    }
    const body = await res.json().catch(() => null);
    throw new Error(body?.detail || `API request failed (${res.status})`);
  }

  if (res.status === 204) return null;
  return res.json();
}

export function getData(endpoint: string) { return request(endpoint); }
export function postData(endpoint: string, body: unknown) { return request(endpoint, { method: "POST", body: JSON.stringify(body) }); }
export function putData(endpoint: string, body: unknown) { return request(endpoint, { method: "PUT", body: JSON.stringify(body) }); }
export function deleteData(endpoint: string) { return request(endpoint, { method: "DELETE" }); }

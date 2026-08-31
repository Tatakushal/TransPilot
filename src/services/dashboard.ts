const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

export async function getDashboardKPIs() {
  const res = await fetch(`${API}/dashboard/kpis`);
  if (!res.ok) throw new Error("Failed to fetch dashboard KPIs");
  return res.json();
}

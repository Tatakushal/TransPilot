const API = import.meta.env.VITE_API_URL || "/api";

export async function getDashboardKPIs() {
  const res = await fetch(`${API}/dashboard/kpis`);
  if (!res.ok) throw new Error("Failed to fetch dashboard KPIs");
  return res.json();
}

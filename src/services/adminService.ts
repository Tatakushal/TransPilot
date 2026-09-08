import { deleteData, getData, patchData, postData } from "@/services/api";

export type AdminRole = "admin" | "fleet-manager" | "dispatcher" | "safety-officer" | "financial-analyst";
export interface AdminUser { id: number; name: string; email: string; role: AdminRole; is_active: boolean; email_verified?: boolean; created_at?: string; }
export interface AdminOverview { total_users: number; active_users: number; disabled_users: number; fleet_size: number; active_trips: number; available_drivers: number; active_sessions: number; audit_events: number; system_health: string; }
export interface AuditLog { id: number; user_email: string; action: string; target?: string; details?: string; created_at: string; }
export interface AdminRoleInfo { id: AdminRole; name: string; permissions: string[]; }
export interface AdminSession { id: number; user_id: number; user_email: string; user_name: string; expires_at: string; }
export interface AdminHealth { status: string; database: string; timestamp: string; }

const base = "auth/control";

export const adminService = {
  overview: () => getData(`${base}/overview`) as Promise<AdminOverview>,
  users: (params?: { search?: string; role?: AdminRole | ""; status?: "active" | "disabled" | "" }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.role) query.set("role", params.role);
    if (params?.status) query.set("status", params.status);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return getData(`${base}/users${suffix}`) as Promise<AdminUser[]>;
  },
  createUser: (body: { name: string; email: string; password: string; role: AdminRole }) => postData(`${base}/users`, body) as Promise<AdminUser>,
  updateUser: (id: number, body: Partial<Pick<AdminUser, "name" | "email" | "role" | "is_active">>) => patchData(`${base}/users/${id}`, body) as Promise<AdminUser>,
  resetPassword: (id: number, password: string) => postData(`${base}/users/${id}/password`, { password }),
  roles: () => getData(`${base}/roles`) as Promise<AdminRoleInfo[]>,
  auditLogs: (params?: { search?: string; action?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set("search", params.search);
    if (params?.action) query.set("action", params.action);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    return getData(`${base}/audit-logs${suffix}`) as Promise<AuditLog[]>;
  },
  sessions: () => getData(`${base}/sessions`) as Promise<AdminSession[]>,
  revokeSession: (id: number) => deleteData(`${base}/sessions/${id}`),
  health: () => getData(`${base}/health`) as Promise<AdminHealth>,
};

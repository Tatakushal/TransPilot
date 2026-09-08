import { getData, patchData, postData } from "@/services/api";

export type AdminRole = "admin" | "fleet-manager" | "dispatcher" | "safety-officer" | "financial-analyst";
export interface AdminUser { id:number; name:string; email:string; role:AdminRole; is_active:boolean; email_verified?:boolean; created_at?:string; }
export interface AdminOverview { total_users:number; active_users:number; fleet_size:number; active_trips:number; system_health:string; }
export interface AuditLog { id:number; user_email:string; action:string; target?:string; details?:string; created_at:string; }

export const adminService = {
  overview: () => getData("auth/admin/overview") as Promise<AdminOverview>,
  users: () => getData("auth/admin/users") as Promise<AdminUser[]>,
  createUser: (body: {name:string;email:string;password:string;role:AdminRole}) => postData("auth/admin/users", body) as Promise<AdminUser>,
  updateUser: (id:number, body: Partial<Pick<AdminUser,"name"|"email"|"role"|"is_active">>) => patchData(`auth/admin/users/${id}`, body) as Promise<AdminUser>,
  resetPassword: (id:number, password:string) => postData(`auth/admin/users/${id}/password`, {password}),
  auditLogs: () => getData("auth/admin/audit-logs") as Promise<AuditLog[]>,
};

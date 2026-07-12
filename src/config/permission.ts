import type { UserRole } from "@/types/roles";

export const permissions: Record<UserRole, string[]> = {
  ADMIN: [
    "dashboard",
    "vehicles",
    "drivers",
    "trips",
    "maintenance",
    "fuel",
    "reports",
    "settings",
  ],

  FLEET_MANAGER: [
    "dashboard",
    "vehicles",
    "drivers",
    "trips",
    "maintenance",
    "reports",
  ],

  DISPATCHER: ["dashboard", "vehicles", "drivers", "trips"],

  SAFETY_OFFICER: ["dashboard", "drivers", "reports"],

  FINANCE: ["dashboard", "fuel", "reports"],
};

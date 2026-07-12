import type { LucideIcon } from "lucide-react";
import type { UserRole } from "./auth";

export interface NavItem {
  title: string;
  icon: LucideIcon;
  href: string;
  roles: UserRole[];
}

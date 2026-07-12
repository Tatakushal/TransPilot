import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";

import type { NavItem } from "@/types/navigation";

export const sidebarItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    roles: [
      "fleet-manager",
      "dispatcher",
      "financial-analyst",
      "safety-officer",
    ],
  },

  {
    title: "Vehicles",
    href: "/vehicles",
    icon: Truck,
    roles: ["fleet-manager", "dispatcher"],
  },

  {
    title: "Drivers",
    href: "/drivers",
    icon: Users,
    roles: ["fleet-manager", "dispatcher", "safety-officer"],
  },

  {
    title: "Trips",
    href: "/trips",
    icon: Route,
    roles: ["dispatcher"],
  },

  {
    title: "Maintenance",
    href: "/maintenance",
    icon: Wrench,
    roles: ["fleet-manager"],
  },

  {
    title: "Fuel & Expenses",
    href: "/fuel",
    icon: Fuel,
    roles: ["financial-analyst"],
  },

  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
    roles: ["fleet-manager", "financial-analyst", "safety-officer"],
  },

  {
    title: "Safety",
    href: "/safety",
    icon: Shield,
    roles: ["safety-officer"],
  },

  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
    roles: [
      "fleet-manager",
      "dispatcher",
      "financial-analyst",
      "safety-officer",
    ],
  },
];

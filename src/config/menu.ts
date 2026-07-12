import {
  LayoutDashboard,
  Truck,
  Users,
  Route,
  Wrench,
  Fuel,
  BarChart3,
  Settings,
} from "lucide-react";

export const menu = [
  {
    title: "Overview",
    items: [
      {
        label: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
        roles: [
          "admin",
          "fleet-manager",
          "dispatcher",
          "safety-officer",
          "financial-analyst",
        ],
      },
    ],
  },

  {
    title: "Fleet",
    items: [
      {
        label: "Vehicles",
        path: "/vehicles",
        icon: Truck,
        roles: ["admin", "fleet-manager", "dispatcher"],
      },

      {
        label: "Drivers",
        path: "/drivers",
        icon: Users,
        roles: ["admin", "fleet-manager", "dispatcher", "safety-officer"],
      },
    ],
  },

  {
    title: "Operations",
    items: [
      {
        label: "Trips",
        path: "/trips",
        icon: Route,
        roles: ["admin", "fleet-manager", "dispatcher"],
      },
    ],
  },

  {
    title: "Maintenance",
    items: [
      {
        label: "Maintenance",
        path: "/maintenance",
        icon: Wrench,
        roles: ["admin", "fleet-manager"],
      },
    ],
  },

  {
    title: "Finance",
    items: [
      {
        label: "Fuel",
        path: "/fuel",
        icon: Fuel,
        roles: ["admin", "financial-analyst"],
      },
    ],
  },

  {
    title: "Analytics",
    items: [
      {
        label: "Reports",
        path: "/reports",
        icon: BarChart3,
        roles: [
          "admin",
          "fleet-manager",
          "financial-analyst",
          "safety-officer",
        ],
      },
    ],
  },

  {
    title: "Administration",
    items: [
      {
        label: "Settings",
        path: "/settings",
        icon: Settings,
        roles: ["admin"],
      },
    ],
  },
];

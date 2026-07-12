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
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

type Role =
  | "admin"
  | "fleet-manager"
  | "dispatcher"
  | "safety-officer"
  | "financial-analyst";

type MenuItem = {
  icon: React.ElementType;
  label: string;
  path: string;
  roles: Role[];
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

const menu: MenuSection[] = [
  {
    title: "Overview",
    items: [
      {
        icon: LayoutDashboard,
        label: "Dashboard",
        path: "/dashboard",
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
        icon: Truck,
        label: "Vehicles",
        path: "/vehicles",
        roles: ["admin", "fleet-manager", "dispatcher"],
      },
      {
        icon: Users,
        label: "Drivers",
        path: "/drivers",
        roles: ["admin", "fleet-manager", "dispatcher", "safety-officer"],
      },
    ],
  },

  {
    title: "Operations",
    items: [
      {
        icon: Route,
        label: "Trips",
        path: "/trips",
        roles: ["admin", "fleet-manager", "dispatcher"],
      },
    ],
  },

  {
    title: "Maintenance",
    items: [
      {
        icon: Wrench,
        label: "Maintenance",
        path: "/maintenance",
        roles: ["admin", "fleet-manager"],
      },
    ],
  },

  {
    title: "Finance",
    items: [
      {
        icon: Fuel,
        label: "Fuel",
        path: "/fuel",
        roles: ["admin", "financial-analyst"],
      },
    ],
  },

  {
    title: "Analytics",
    items: [
      {
        icon: BarChart3,
        label: "Reports",
        path: "/reports",
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
        icon: Settings,
        label: "Settings",
        path: "/settings",
        roles: ["admin"],
      },
    ],
  },
];

export default function Sidebar() {
  const { user } = useAuth();
  if (!user) {
    return null;
  }

  return (
    <aside className="w-60 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}

      <div className="border-b border-slate-100 px-7 py-7">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 font-bold text-white">
            TO
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">TransitOps</h1>

            <p className="text-xs text-slate-500">Fleet Operations</p>
          </div>
        </div>
      </div>

      {/* Menu */}

      <div className="flex-1 overflow-y-auto px-4 py-6">
        {menu.map((section) => {
          const visibleItems = section.items.filter((item) =>
            item.roles.includes(user.role),
          );

          if (visibleItems.length === 0) return null;

          return (
            <div key={section.title} className="mb-7">
              <p className="mb-3 px-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-400">
                {section.title}
              </p>

              {visibleItems.map((item) => {
                const Icon = item.icon;

                return (
                  <NavLink
                    key={item.label}
                    to={item.path}
                    className={({ isActive }) =>
                      `mb-1 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-indigo-50 text-indigo-600 shadow-sm"
                          : "text-slate-600 hover:bg-indigo-50 hover:text-indigo-600"
                      }`
                    }
                  >
                    <Icon size={18} />

                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User */}

      <div className="border-t border-slate-100 bg-slate-50 p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 font-semibold text-indigo-600">
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </div>

          <div>
            <p className="text-sm font-semibold">{user.name}</p>

            <p className="text-xs text-slate-500">{user.email}</p>

            <p className="mt-1 text-[11px] capitalize text-indigo-600">
              {user.role}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

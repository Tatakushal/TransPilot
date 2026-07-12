import AppShell from "@/components/layout/AppShell";
import KpiCard from "@/components/dashboard/KpiCard";
import VehicleStatus from "@/components/dashboard/VehicleStatus";
import RecentTrips from "@/components/dashboard/RecentTrips";
import MaintenanceAlerts from "@/components/dashboard/MaintanenceAlerts";
import DriverAlerts from "@/components/dashboard/DriverAlerts";
import FleetStatus from "@/components/dashboard/FleetStatus";
import FleetChart from "@/components/dashboard/FleetChart";
import AIRecommendation from "@/components/dashboard/AIRecommendation";

import { useEffect, useState } from "react";
import { getDashboardKPIs } from "@/services/dashboard";
import { Truck, Route, Users, BarChart3 } from "lucide-react";

interface DashboardKPIs {
  active_vehicles: number;
  available_vehicles: number;
  vehicles_in_maintenance: number;
  active_trips: number;
  pending_trips: number;
  drivers_on_duty: number;
  fleet_utilization_percent: number;
}

export default function DashboardPage() {
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const data = await getDashboardKPIs();
        setKpis(data);
      } catch (error) {
        console.error(error);
      }
    };

    fetchKPIs();
  }, []);

  if (!kpis) {
    return (
      <AppShell>
        <div className="p-10 text-center">Loading dashboard...</div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="space-y-8">
        <AIRecommendation />

        <div className="grid gap-7 lg:grid-cols-4 md:grid-cols-2 grid-cols-1">
          <KpiCard
            title="Active Vehicles"
            value={String(kpis.active_vehicles)}
            change="+4 this week"
            icon={Truck}
          />

          <KpiCard
            title="Trips Running"
            value={String(kpis.active_trips)}
            change="+2 today"
            icon={Route}
          />

          <KpiCard
            title="Drivers On Duty"
            value={String(kpis.drivers_on_duty)}
            change="+5%"
            icon={Users}
          />

          <KpiCard
            title="Fleet Utilization"
            value={`${kpis.fleet_utilization_percent}%`}
            change="+6%"
            icon={BarChart3}
          />
        </div>

        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-8">
            <FleetChart />
          </div>

          <div className="col-span-4">
            <VehicleStatus />
          </div>
        </div>

        <FleetStatus />

        <RecentTrips />

        <div className="grid grid-cols-2 gap-7">
          <MaintenanceAlerts />

          <DriverAlerts />
        </div>
      </div>
    </AppShell>
  );
}

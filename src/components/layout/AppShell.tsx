import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function AppShell({ children }: Props) {
  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />

        <main className="flex-1 overflow-y-auto px-8 py-7 bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}

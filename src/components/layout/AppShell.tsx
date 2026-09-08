import { useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import type { ReactNode } from "react";

interface Props { children: ReactNode; }

export default function AppShell({ children }: Props) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return <div className="flex h-screen overflow-hidden bg-slate-50"><Sidebar mobileOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} /><div className="flex min-w-0 flex-1 flex-col overflow-hidden"><Topbar onMenu={() => setMobileNavOpen((open) => !open)} /><main className="flex-1 overflow-y-auto bg-slate-50 px-4 py-5 sm:px-6 sm:py-7 lg:px-8">{children}</main></div></div>;
}

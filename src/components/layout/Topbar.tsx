import { Bell, LogOut, Search, Settings, UserCircle2, Menu, Command } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useRef, useState } from "react";

interface Props { onMenu: () => void; }
const destinations = [
  ["dashboard", "/dashboard"], ["vehicles", "/vehicles"], ["drivers", "/drivers"], ["trips", "/trips"],
  ["maintenance", "/maintenance"], ["fuel", "/fuel"], ["reports", "/reports"], ["admin", "/admin"], ["settings", "/settings"],
] as const;

export default function Topbar({ onMenu }: Props) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Morning" : hour < 18 ? "Afternoon" : "Evening";
  const matches = destinations.filter(([name]) => user?.role === "admin" || name !== "admin").filter(([name]) => name.includes(query.toLowerCase())).slice(0, 5);
  useEffect(() => { const onKey = (event: KeyboardEvent) => { if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); searchRef.current?.focus(); setOpen(true); } }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, []);
  function submitSearch() { const match = matches[0]; if (match) { navigate(match[1]); setQuery(""); setOpen(false); } }
  function handleLogout() { logout(); navigate("/login", { replace: true }); }
  return <header className="flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-3 sm:min-h-20 sm:px-6 lg:px-8"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={onMenu} className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 lg:hidden" aria-label="Open navigation"><Menu size={22}/></button><div className="min-w-0"><h1 className="truncate text-lg font-bold sm:text-2xl">Good {greeting}, {user?.name || "there"} 👋</h1><p className="mt-1 hidden text-sm text-slate-500 sm:block">Your fleet command center at a glance.</p></div></div><div className="flex shrink-0 items-center gap-2 sm:gap-4"><div className="relative hidden xl:block"><Search size={18} className="absolute left-4 top-3.5 text-slate-400"/><input ref={searchRef} value={query} onChange={(e) => {setQuery(e.target.value);setOpen(true)}} onFocus={() => setOpen(true)} onKeyDown={(e) => {if(e.key === "Enter") submitSearch(); if(e.key === "Escape") setOpen(false)}} placeholder="Search pages..." className="w-72 rounded-xl border border-slate-200 py-3 pl-11 pr-12 outline-none focus:border-indigo-500" aria-label="Global page search"/><span className="absolute right-3 top-3 rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-400"><Command size={11}/></span>{open && query && <div className="absolute left-0 right-0 top-14 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white p-1.5 shadow-2xl">{matches.length ? matches.map(([name,path]) => <button key={path} type="button" onMouseDown={() => {navigate(path);setQuery("");setOpen(false)}} className="flex w-full items-center rounded-xl px-3 py-2.5 text-left text-sm font-medium capitalize text-slate-700 hover:bg-indigo-50 hover:text-indigo-700">{name}</button>) : <p className="px-3 py-3 text-xs text-slate-400">No matching page</p>}</div>}</div><button type="button" className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100" aria-label="Notifications"><Bell size={21}/><span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">3</span></button>{user?.role === "admin" && <button type="button" onClick={() => navigate("/settings")} className="hidden rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:block" aria-label="Settings"><Settings size={21}/></button>}<div className="group relative"><button type="button" className="rounded-full" aria-label="Account menu"><UserCircle2 size={32} className="text-indigo-600"/></button><div className="invisible absolute right-0 top-11 z-50 w-52 translate-y-1 rounded-2xl border border-slate-200 bg-white p-2 opacity-0 shadow-xl transition group-hover:visible group-hover:translate-y-0 group-hover:opacity-100"><div className="px-3 py-2"><p className="text-sm font-semibold text-slate-900">{user?.name}</p><p className="truncate text-xs text-slate-500">{user?.email}</p></div><button type="button" onClick={handleLogout} className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"><LogOut size={16}/>Sign out</button></div></div></div></header>;
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard, ClipboardList, Users, Bot, Settings, Menu, X, Zap,
} from "lucide-react";
import clsx from "clsx";

const NAV = [
  { href: "/dashboard",  label: "Overview",      icon: LayoutDashboard },
  { href: "/form",       label: "Add Retailer",  icon: ClipboardList },
  { href: "/retailers",  label: "All Retailers", icon: Users },
  { href: "/agent",      label: "AI Agent",      icon: Bot },
  { href: "/settings",   label: "Settings",      icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden neu-sm p-2"
        onClick={() => setOpen(!open)}
        aria-label="Toggle sidebar"
      >
        {open ? <X size={20} className="text-cobalt" /> : <Menu size={20} className="text-cobalt" />}
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={clsx(
          "sidebar fixed left-0 top-0 h-full w-64 z-40 flex flex-col transition-transform duration-300",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
            <Zap size={18} className="text-white" />
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-tight">Find My Retailer</p>
            <p className="text-white/50 text-xs">Bajaj Electricals</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href) && (href !== "/" || pathname === "/");
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                  active
                    ? "bg-white/20 text-white shadow-inner"
                    : "text-white/60 hover:text-white hover:bg-white/10"
                )}
              >
                <Icon size={18} />
                {label}
                {active && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-white/10">
          <p className="text-white/30 text-xs">© 2025 Bajaj Electricals</p>
          <p className="text-white/20 text-xs mt-0.5">FMR v1.0</p>
        </div>
      </aside>
    </>
  );
}

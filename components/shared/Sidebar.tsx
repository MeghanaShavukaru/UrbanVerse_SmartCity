"use client";

// ============================================================
// components/shared/Sidebar.tsx
// Collapsible sidebar navigation for the dashboard
// ============================================================

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Map,
  History,
  FileText,
  Compass,
  BrainCircuit,
  Sparkles,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/dashboard/map", icon: Map, label: "City Map" },
  { href: "/dashboard/scenarios", icon: History, label: "Scenarios" },
  { href: "/dashboard/reports", icon: FileText, label: "Reports" },
  { href: "/dashboard/decision-studio", icon: Sparkles, label: "Decision Studio" },
  { href: "/dashboard/demo-guide", icon: Compass, label: "Demo Guide" },
  { href: "/dashboard/city-intelligence", icon: BrainCircuit, label: "City Intelligence" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const { logout, user } = useAuth();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className="relative flex flex-col h-full overflow-hidden"
      style={{
        background: "hsl(var(--sidebar))",
        borderRight: "1px solid hsl(var(--sidebar-border))",
        flexShrink: 0,
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 overflow-hidden"
        style={{ borderBottom: "1px solid hsl(var(--sidebar-border))" }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-base flex-shrink-0"
          style={{ background: "linear-gradient(135deg, hsl(217 91% 60%), hsl(142 71% 45%))" }}>
          🏙️
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="text-white font-bold text-sm leading-tight">UrbanVerse</p>
              <p className="text-xs font-medium" style={{ color: "hsl(142 71% 55%)" }}>AI Platform</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 p-3 space-y-1 overflow-hidden">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer transition-all duration-150 overflow-hidden"
                style={{
                  background: isActive
                    ? "hsl(217 91% 60% / 0.2)"
                    : "transparent",
                  border: isActive
                    ? "1px solid hsl(217 91% 60% / 0.3)"
                    : "1px solid transparent",
                  color: isActive
                    ? "hsl(217 91% 75%)"
                    : "hsl(215 20% 65%)",
                }}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-sm font-medium whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User + Logout */}
      <div className="p-3 space-y-1" style={{ borderTop: "1px solid hsl(var(--sidebar-border))" }}>
        {/* User info */}
        <AnimatePresence>
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 py-2 rounded-lg mb-1 overflow-hidden"
              style={{ background: "hsl(var(--sidebar-muted))" }}
            >
              <p className="text-xs font-medium text-white truncate">
                {user?.displayName || user?.email?.split("@")[0] || "Planner"}
              </p>
              <p className="text-xs truncate" style={{ color: "hsl(215 20% 55%)" }}>
                {user?.email || ""}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout */}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-150 overflow-hidden"
          style={{ color: "hsl(0 84% 65%)" }}
          title={collapsed ? "Logout" : undefined}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center z-10 shadow-lg transition-colors"
        style={{
          background: "hsl(var(--sidebar))",
          border: "1px solid hsl(var(--sidebar-border))",
          color: "hsl(215 20% 65%)",
        }}
      >
        {collapsed ? (
          <ChevronRight className="w-3.5 h-3.5" />
        ) : (
          <ChevronLeft className="w-3.5 h-3.5" />
        )}
      </button>
    </motion.aside>
  );
}

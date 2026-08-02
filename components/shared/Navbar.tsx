"use client";

// ============================================================
// components/shared/Navbar.tsx
// Top navigation bar for the dashboard
// ============================================================

import { useAuth } from "@/context/AuthContext";
import { Bell } from "lucide-react";
import { motion } from "framer-motion";

interface NavbarProps {
  title?: string;
  subtitle?: string;
}

export function Navbar({ title = "Dashboard", subtitle }: NavbarProps) {
  const { user } = useAuth();

  const displayName =
    user?.displayName || user?.email?.split("@")[0] || "Planner";
  const initial = displayName[0]?.toUpperCase() || "U";

  return (
    <header
      className="flex items-center justify-between px-6 py-3 flex-shrink-0"
      style={{
        background: "hsl(var(--card))",
        borderBottom: "1px solid hsl(var(--border))",
        height: "60px",
      }}
    >
      {/* Left: Page title */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1 className="text-base font-semibold leading-tight">{title}</h1>
        {subtitle && (
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {subtitle}
          </p>
        )}
      </motion.div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification bell */}
        <button
          className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ background: "hsl(var(--muted))" }}
          title="Notifications"
        >
          <Bell className="w-4 h-4" style={{ color: "hsl(var(--muted-foreground))" }} />
          <span
            className="absolute top-1 right-1 w-2 h-2 rounded-full"
            style={{ background: "hsl(var(--secondary))" }}
          />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--secondary)))",
            }}
          >
            {initial}
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-medium leading-tight">{displayName}</p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              City Planner
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}

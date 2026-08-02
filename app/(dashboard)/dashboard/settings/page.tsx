"use client";

// ============================================================
// app/(dashboard)/dashboard/settings/page.tsx
// Settings page
// ============================================================

import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import { User, Info } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold">Settings</h2>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Manage your account and application settings
        </p>
      </div>

      {/* Profile */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl p-5"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <User className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
          <h3 className="font-semibold text-sm">Profile</h3>
        </div>
        <div className="space-y-3">
          <div className="rounded-lg p-3" style={{ background: "hsl(var(--muted))" }}>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Email</p>
            <p className="text-sm font-medium">{user?.email || "—"}</p>
          </div>
          <div className="rounded-lg p-3" style={{ background: "hsl(var(--muted))" }}>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Role</p>
            <p className="text-sm font-medium">City Planner</p>
          </div>
        </div>
      </motion.div>

      {/* About */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-xl p-5"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
      >
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-4 h-4" style={{ color: "hsl(var(--primary))" }} />
          <h3 className="font-semibold text-sm">About UrbanVerse AI</h3>
        </div>
        <div className="space-y-2 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          <p>🏙️ <strong style={{ color: "hsl(var(--foreground))" }}>UrbanVerse AI</strong> — Ask your city before you change it.</p>
          <p>An AI-powered Urban Decision Intelligence Platform for the Singapore-India Hackathon.</p>
          <p className="text-xs pt-2" style={{ borderTop: "1px solid hsl(var(--border))" }}>
            Powered by: Next.js 15 · Google Gemini AI · Firebase Auth · PostgreSQL (Neon) · Leaflet Maps
          </p>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

// ============================================================
// app/(dashboard)/dashboard/page.tsx
// Main dashboard: city overview, quick metrics, recent scenarios
// ============================================================

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ZONES } from "@/config/zones";
import { getLocalScenarios } from "@/lib/localScenarios";
import {
  MapPin,
  Activity,
  Leaf,
  AlertTriangle,
  Zap,
  ArrowRight,
  Clock,
  TrendingUp,
  TrendingDown,
  Users,
} from "lucide-react";

// City-wide aggregates from zone data
const cityMetrics = {
  totalPopulation: ZONES.reduce((a, z) => a + z.population, 0),
  avgTraffic: Math.round(ZONES.reduce((a, z) => a + z.metrics.trafficIndex, 0) / ZONES.length),
  avgCarbon: Math.round(ZONES.reduce((a, z) => a + z.metrics.carbonScore, 0) / ZONES.length),
  avgFloodRisk: Math.round(ZONES.reduce((a, z) => a + z.metrics.floodRisk, 0) / ZONES.length),
  avgAccessibility: Math.round(ZONES.reduce((a, z) => a + z.metrics.accessibility, 0) / ZONES.length),
};

const quickMetrics = [
  {
    label: "Population",
    value: (cityMetrics.totalPopulation / 1000).toFixed(0) + "K",
    icon: Users,
    color: "hsl(217 91% 60%)",
    bg: "hsl(217 91% 60% / 0.1)",
    trend: "+2.3%",
    up: true,
  },
  {
    label: "Avg Traffic Index",
    value: cityMetrics.avgTraffic,
    icon: Activity,
    color: "hsl(38 92% 50%)",
    bg: "hsl(38 92% 50% / 0.1)",
    trend: "-4.1%",
    up: false,
  },
  {
    label: "Carbon Score",
    value: cityMetrics.avgCarbon,
    icon: Leaf,
    color: "hsl(142 71% 45%)",
    bg: "hsl(142 71% 45% / 0.1)",
    trend: "-8.2%",
    up: false,
  },
  {
    label: "Flood Risk",
    value: cityMetrics.avgFloodRisk,
    icon: AlertTriangle,
    color: "hsl(0 84% 60%)",
    bg: "hsl(0 84% 60% / 0.1)",
    trend: "+1.4%",
    up: true,
  },
  {
    label: "Accessibility",
    value: cityMetrics.avgAccessibility,
    icon: Zap,
    color: "hsl(199 89% 48%)",
    bg: "hsl(199 89% 48% / 0.1)",
    trend: "+6.7%",
    up: true,
  },
];

function MetricCard({ metric, index }: { metric: typeof quickMetrics[0]; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="metric-card rounded-xl p-4"
      style={{
        background: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))",
      }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center"
          style={{ background: metric.bg }}>
          <metric.icon className="w-4.5 h-4.5" style={{ color: metric.color, width: 18, height: 18 }} />
        </div>
        <span
          className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
          style={{
            color: metric.up ? "hsl(0 84% 60%)" : "hsl(142 71% 45%)",
            background: metric.up ? "hsl(0 84% 60% / 0.1)" : "hsl(142 71% 45% / 0.1)",
          }}
        >
          {metric.up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
          {metric.trend}
        </span>
      </div>
      <p className="text-2xl font-bold">{metric.value}</p>
      <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{metric.label}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [recentScenarios, setRecentScenarios] = useState<{
    id: string; zoneName: string; action: string; createdAt: string; parsedIntent: string;
  }[]>([]);

  const displayName = user?.displayName || user?.email?.split("@")[0] || "Planner";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  useEffect(() => {
    fetch("/api/scenarios")
      .then((r) => r.json())
      .then((data) => setRecentScenarios((data.data?.length ? data.data : getLocalScenarios()).slice(0, 5)))
      .catch(() => setRecentScenarios(getLocalScenarios().slice(0, 5)));
  }, []);

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-6 relative overflow-hidden"
        style={{
          background: "linear-gradient(135deg, hsl(222 47% 11%), hsl(217 33% 17%))",
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, hsl(217 91% 60%), transparent)", transform: "translate(30%, -30%)" }} />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <p className="text-sm mb-1" style={{ color: "hsl(215 20% 65%)" }}>{greeting},</p>
            <h2 className="text-2xl font-bold text-white mb-1 capitalize">{displayName} 👋</h2>
            <p className="text-sm" style={{ color: "hsl(215 20% 55%)" }}>
              UrbanVerse City · {ZONES.length} zones active
            </p>
          </div>
          <Link href="/dashboard/map">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
              style={{ background: "hsl(217 91% 60% / 0.3)", border: "1px solid hsl(217 91% 60% / 0.4)" }}
            >
              Open City Map
              <ArrowRight className="w-4 h-4" />
            </motion.button>
          </Link>
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div>
        <h3 className="text-sm font-semibold mb-3" style={{ color: "hsl(var(--muted-foreground))" }}>
          CITY-WIDE METRICS
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {quickMetrics.map((m, i) => (
            <MetricCard key={m.label} metric={m} index={i} />
          ))}
        </div>
      </div>

      {/* Bottom Grid: Zones + Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Zone Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="rounded-xl"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h3 className="font-semibold text-sm">City Zones</h3>
            <Link href="/dashboard/map">
              <span className="text-xs font-medium flex items-center gap-1"
                style={{ color: "hsl(var(--primary))" }}>
                View map <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: "hsl(var(--border))" }}>
            {ZONES.slice(0, 6).map((zone) => (
              <div key={zone.id} className="flex items-center gap-3 px-5 py-3">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: zone.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{zone.name}</p>
                  <p className="text-xs truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Pop. {(zone.population / 1000).toFixed(0)}K
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <span title="Traffic">🚦 {zone.metrics.trafficIndex}</span>
                  <span title="Flood Risk">🌊 {zone.metrics.floodRisk}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Scenarios */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="rounded-xl"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <div className="flex items-center justify-between px-5 py-4"
            style={{ borderBottom: "1px solid hsl(var(--border))" }}>
            <h3 className="font-semibold text-sm">Recent Scenarios</h3>
            <Link href="/dashboard/scenarios">
              <span className="text-xs font-medium flex items-center gap-1"
                style={{ color: "hsl(var(--primary))" }}>
                View all <ArrowRight className="w-3 h-3" />
              </span>
            </Link>
          </div>
          {recentScenarios.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
              <div className="text-4xl mb-3">🗺️</div>
              <p className="font-medium text-sm mb-1">No scenarios yet</p>
              <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                Open the city map, select a zone, and run your first analysis
              </p>
              <Link href="/dashboard/map">
                <button className="mt-4 px-4 py-2 rounded-lg text-xs font-semibold text-white"
                  style={{ background: "hsl(var(--primary))" }}>
                  Start Planning
                </button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[hsl(var(--border))]">
              {recentScenarios.map((s) => (
                <div key={s.id} className="px-5 py-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: "hsl(var(--primary))" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{s.zoneName}</p>
                      <p className="text-xs truncate" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {s.parsedIntent}
                      </p>
                      <p className="text-xs mt-1 flex items-center gap-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                        <Clock className="w-3 h-3" />
                        {new Date(s.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}

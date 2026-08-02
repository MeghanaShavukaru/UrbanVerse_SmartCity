"use client";

// ============================================================
// features/simulation/ImpactDashboard.tsx
// Animated metric cards + Recharts bar chart showing before/after
// ============================================================

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
} from "recharts";
import { SimulationResult } from "@/types";
import { ACTION_ICONS, ACTION_LABELS, SupportedAction } from "@/config/rules";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ImpactDashboardProps {
  result: SimulationResult;
}

const METRIC_CONFIG = [
  { key: "trafficIndex", label: "Traffic", emoji: "🚦", lowerIsBetter: true, color: "#F59E0B" },
  { key: "accessibility", label: "Access", emoji: "♿", lowerIsBetter: false, color: "#3B82F6" },
  { key: "carbonScore", label: "Carbon", emoji: "🌿", lowerIsBetter: true, color: "#10B981" },
  { key: "floodRisk", label: "Flood Risk", emoji: "🌊", lowerIsBetter: true, color: "#06B6D4" },
  { key: "emergencyResponse", label: "Emergency", emoji: "🚑", lowerIsBetter: false, color: "#EF4444" },
];

// Animated counter hook
function useCounter(target: number, duration = 1200) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.round(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return value;
}

function MetricCard({
  base,
  current,
  config,
  index,
}: {
  base: number;
  current: number;
  config: (typeof METRIC_CONFIG)[0];
  index: number;
}) {
  const delta = current - base;
  const animatedValue = useCounter(current);
  const isGood =
    (config.lowerIsBetter && delta <= 0) ||
    (!config.lowerIsBetter && delta >= 0);
  const isNeutral = delta === 0;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      className="rounded-xl p-4"
      style={{
        background: "hsl(var(--card))",
        border: `1px solid ${config.color}33`,
        boxShadow: `0 4px 16px ${config.color}15`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-lg">{config.emoji}</span>
        {!isNeutral && (
          <span
            className="flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full"
            style={{
              color: isGood ? "hsl(142 71% 45%)" : "hsl(0 84% 60%)",
              background: isGood
                ? "hsl(142 71% 45% / 0.1)"
                : "hsl(0 84% 60% / 0.1)",
            }}
          >
            {delta > 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
        )}
        {isNeutral && (
          <span className="text-xs px-1.5 py-0.5 rounded-full"
            style={{ color: "hsl(var(--muted-foreground))", background: "hsl(var(--muted))" }}>
            <Minus className="w-3 h-3" />
          </span>
        )}
      </div>
      <p className="text-2xl font-bold" style={{ color: config.color }}>
        {animatedValue}
      </p>
      <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
        {config.label}
      </p>
      <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--muted))" }}>
        <motion.div
          initial={{ width: `${base}%` }}
          animate={{ width: `${current}%` }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="h-full rounded-full"
          style={{ background: config.color }}
        />
      </div>
      <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>
        Was: {base} · Now: {current}
      </p>
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; fill: string; name: string }>;
  label?: string;
}) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-3 py-2 shadow-xl text-sm"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p) => (
          <p key={p.name} style={{ color: p.fill }}>
            {p.name}: <strong>{p.value}</strong>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export function ImpactDashboard({ result }: ImpactDashboardProps) {
  const base = result.baseMetrics as unknown as Record<string, number>;
  const updated = result.newMetrics as unknown as Record<string, number>;

  const chartData = METRIC_CONFIG.map((m) => ({
    name: m.label,
    Before: base[m.key] ?? 0,
    After: updated[m.key] ?? 0,
  }));

  const radarData = METRIC_CONFIG.map((m) => ({
    metric: m.label,
    Before: base[m.key] ?? 0,
    After: updated[m.key] ?? 0,
    fullMark: 100,
  }));

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl"
        style={{
          background: "hsl(142 71% 45% / 0.08)",
          border: "1px solid hsl(142 71% 45% / 0.2)",
        }}
      >
        <span className="text-2xl">
          {ACTION_ICONS[result.action as SupportedAction]}
        </span>
        <div>
          <p className="font-semibold text-sm">{ACTION_LABELS[result.action as SupportedAction]}</p>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {result.zoneName} · {result.parsedIntent}
          </p>
        </div>
      </motion.div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {METRIC_CONFIG.map((config, index) => (
          <MetricCard
            key={config.key}
            base={base[config.key] ?? 0}
            current={updated[config.key] ?? 0}
            config={config}
            index={index}
          />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Bar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="rounded-xl p-4"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <h4 className="font-semibold text-sm mb-4">Before vs After</h4>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData} barCategoryGap="30%">
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis
                domain={[0, 100]}
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar dataKey="Before" fill="#94A3B8" radius={[4, 4, 0, 0]} />
              <Bar dataKey="After" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Radar Chart */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="rounded-xl p-4"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}
        >
          <h4 className="font-semibold text-sm mb-4">Zone Health Radar</h4>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis
                dataKey="metric"
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
              />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} />
              <Radar name="Before" dataKey="Before" stroke="#94A3B8" fill="#94A3B8" fillOpacity={0.2} />
              <Radar name="After" dataKey="After" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.3} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowRight, BrainCircuit, CloudRain, Leaf, ShieldCheck, TrafficCone, Users } from "lucide-react";
import { ZONES } from "@/config/zones";

const priorities = ZONES.map((zone) => {
  const score = Math.round(
    zone.metrics.trafficIndex * 0.3 +
    zone.metrics.carbonScore * 0.25 +
    zone.metrics.floodRisk * 0.25 +
    (100 - zone.metrics.accessibility) * 0.2
  );
  const concern = zone.metrics.floodRisk >= 55
    ? "Flood resilience"
    : zone.metrics.trafficIndex >= 70
    ? "Traffic pressure"
    : zone.metrics.carbonScore >= 70
    ? "Carbon reduction"
    : "Access improvement";
  return { ...zone, score, concern };
}).sort((a, b) => b.score - a.score);

const cityHealth = Math.round(100 - priorities.reduce((total, zone) => total + zone.score, 0) / priorities.length);

export default function CityIntelligencePage() {
  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-10">
      <section className="relative overflow-hidden rounded-2xl p-6" style={{ background: "linear-gradient(135deg, hsl(222 47% 11%), hsl(217 33% 17%))" }}>
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full opacity-25" style={{ background: "radial-gradient(circle, hsl(199 89% 48%), transparent 68%)" }} />
        <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div><p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(142 71% 55%)" }}><BrainCircuit className="w-4 h-4" /> CITY INTELLIGENCE</p><h2 className="mt-2 text-2xl font-bold text-white">See where the city needs attention first.</h2><p className="mt-2 max-w-2xl text-sm" style={{ color: "hsl(215 20% 65%)" }}>A transparent priority model combines mobility, climate, flood resilience, and accessibility to guide the next planning conversation.</p></div>
          <div className="rounded-2xl px-5 py-4 text-center" style={{ background: "hsl(0 0% 100% / 0.1)", border: "1px solid hsl(0 0% 100% / 0.15)" }}><p className="text-xs text-white/60">CITY HEALTH SCORE</p><p className="mt-1 text-4xl font-bold text-white">{cityHealth}<span className="text-lg text-white/60">/100</span></p><p className="mt-1 text-xs" style={{ color: "hsl(142 71% 55%)" }}>Explainable, not black-box AI</p></div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[{ label: "Priority zones", value: priorities.filter((zone) => zone.score >= 55).length, icon: AlertTriangle, color: "hsl(0 84% 60%)" }, { label: "Residents affected", value: `${Math.round(priorities.slice(0, 3).reduce((sum, zone) => sum + zone.population, 0) / 1000)}K`, icon: Users, color: "hsl(217 91% 60%)" }, { label: "Climate watch", value: priorities.filter((zone) => zone.metrics.carbonScore >= 60).length, icon: Leaf, color: "hsl(142 71% 45%)" }, { label: "Flood watch", value: priorities.filter((zone) => zone.metrics.floodRisk >= 45).length, icon: CloudRain, color: "hsl(199 89% 48%)" }].map((metric, index) => <motion.div key={metric.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }} className="rounded-xl p-4" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}><metric.icon className="w-5 h-5" style={{ color: metric.color }} /><p className="mt-3 text-2xl font-bold">{metric.value}</p><p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{metric.label}</p></motion.div>)}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}><div className="flex items-center justify-between"><div><p className="font-semibold">Intervention priority queue</p><p className="mt-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Higher score means more urgent combined city pressure.</p></div><TrafficCone className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} /></div><div className="mt-5 space-y-3">{priorities.slice(0, 5).map((zone, index) => <div key={zone.id} className="flex items-center gap-3 rounded-xl p-3" style={{ background: "hsl(var(--muted))" }}><span className="flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: index === 0 ? "hsl(0 84% 60%)" : "hsl(var(--primary))" }}>{index + 1}</span><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><p className="truncate text-sm font-semibold">{zone.name}</p><span className="text-xs font-bold" style={{ color: zone.score >= 60 ? "hsl(0 84% 60%)" : "hsl(38 92% 38%)" }}>{zone.score}/100</span></div><p className="mt-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Primary need: {zone.concern}</p><div className="mt-2 h-1.5 overflow-hidden rounded-full" style={{ background: "hsl(var(--border))" }}><motion.div initial={{ width: 0 }} animate={{ width: `${zone.score}%` }} className="h-full rounded-full" style={{ background: zone.color }} /></div></div></div>)}</div></div>
        <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}><div className="flex items-center gap-2"><ShieldCheck className="w-5 h-5" style={{ color: "hsl(142 71% 40%)" }} /><p className="font-semibold">Planning signals</p></div><div className="mt-5 space-y-3">{[{ title: "Act now", text: `${priorities[0].name} has the highest combined pressure score.`, color: "hsl(0 84% 60%)" }, { title: "Protect resilience", text: `${priorities.find((zone) => zone.metrics.floodRisk >= 45)?.name ?? "No zone"} needs flood-resilience planning.`, color: "hsl(199 89% 48%)" }, { title: "Create a scenario", text: "Use the City Map to test an intervention before allocating funds.", color: "hsl(142 71% 40%)" }].map((signal) => <div key={signal.title} className="rounded-xl border-l-4 p-3" style={{ background: "hsl(var(--muted))", borderLeftColor: signal.color }}><p className="text-sm font-semibold">{signal.title}</p><p className="mt-1 text-xs leading-5" style={{ color: "hsl(var(--muted-foreground))" }}>{signal.text}</p></div>)}</div><Link href="/dashboard/map"><button className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-semibold text-white" style={{ background: "hsl(var(--primary))" }}>Test an intervention <ArrowRight className="w-4 h-4" /></button></Link></div>
      </section>
    </div>
  );
}

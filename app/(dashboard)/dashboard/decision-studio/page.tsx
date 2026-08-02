"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileDown,
  Leaf,
  Maximize2,
  MapPin,
  MessageCircle,
  Minimize2,
  ShieldAlert,
  Sparkles,
  Users,
  WalletCards,
} from "lucide-react";
import { ZONES } from "@/config/zones";

type Option = {
  id: string;
  title: string;
  subtitle: string;
  cost: string;
  timeline: string;
  score: number;
  changes: { traffic: number; carbon: number; access: number; resilience: number };
  equity: string;
  risk: string;
  recommendation: string;
};

const options: Option[] = [
  {
    id: "balanced",
    title: "Balanced mobility corridor",
    subtitle: "Dedicated bus lane, safe crossings, and shaded walking links",
    cost: "$4.2M",
    timeline: "9 months",
    score: 87,
    changes: { traffic: -14, carbon: -11, access: 18, resilience: 6 },
    equity: "Improves access for transit riders, seniors, and low-income commuters.",
    risk: "Manage construction disruption with phased delivery and local business outreach.",
    recommendation: "Recommend. It delivers the strongest near-term public benefit with manageable delivery risk.",
  },
  {
    id: "green",
    title: "Green street alternative",
    subtitle: "Pocket parks, permeable paving, and EV charging",
    cost: "$3.4M",
    timeline: "7 months",
    score: 82,
    changes: { traffic: -6, carbon: -18, access: 9, resilience: 17 },
    equity: "Adds cooler, safer public space in a dense neighbourhood with limited greenery.",
    risk: "Benefits are broad, but congestion relief is less immediate during peak hours.",
    recommendation: "Strong climate-led alternative. Pair it with transit priority if peak traffic is the primary concern.",
  },
  {
    id: "build",
    title: "Capacity-first expansion",
    subtitle: "Road widening and additional vehicle lanes",
    cost: "$6.8M",
    timeline: "16 months",
    score: 51,
    changes: { traffic: -10, carbon: 8, access: 4, resilience: -3 },
    equity: "Favors private vehicle users; benefits do not reach non-drivers equally.",
    risk: "High cost, land-acquisition uncertainty, and a likely increase in emissions.",
    recommendation: "Do not recommend as the default. Use only if essential freight access cannot be solved otherwise.",
  },
  {
    id: "baseline",
    title: "Maintain the status quo",
    subtitle: "No intervention; retain the existing transport and public-space conditions",
    cost: "$0",
    timeline: "Immediate",
    score: 32,
    changes: { traffic: 0, carbon: 0, access: 0, resilience: 0 },
    equity: "Avoids short-term disruption, but leaves current access gaps and heat exposure unresolved.",
    risk: "The city absorbs the cost of delay: worsening congestion, inequitable access, and missed climate benefits.",
    recommendation: "Use as the baseline, not the outcome. It makes the cost of inaction visible to decision-makers.",
  },
];

const metricLabels = [
  { key: "traffic", label: "Peak traffic", goodWhenNegative: true },
  { key: "carbon", label: "Carbon impact", goodWhenNegative: true },
  { key: "access", label: "Access", goodWhenNegative: false },
  { key: "resilience", label: "Climate resilience", goodWhenNegative: false },
] as const;

const citizenPulse = [
  { persona: "Daily commuter", sentiment: "Supportive", message: "A reliable bus lane means fewer unpredictable trips and safer crossings.", color: "hsl(142 71% 38%)" },
  { persona: "Local business owner", sentiment: "Needs mitigation", message: "Keep loading access and communicate construction phases early.", color: "hsl(38 92% 38%)" },
  { persona: "Senior resident", sentiment: "Supportive", message: "Shaded walks and closer transit make everyday services easier to reach.", color: "hsl(217 91% 55%)" },
];

export default function DecisionStudioPage() {
  const [proposal, setProposal] = useState("Improve the journey between the Railway Hub and nearby homes without increasing emissions.");
  const [zoneId, setZoneId] = useState("ZONE_RAILWAY");
  const [selectedId, setSelectedId] = useState("balanced");
  const [briefReady, setBriefReady] = useState(false);
  const [judgeMode, setJudgeMode] = useState(false);

  const zone = useMemo(() => ZONES.find((item) => item.id === zoneId) ?? ZONES[0], [zoneId]);
  const selected = options.find((option) => option.id === selectedId) ?? options[0];

  const toggleJudgeMode = async () => {
    if (judgeMode) {
      if (document.fullscreenElement) await document.exitFullscreen();
      setJudgeMode(false);
      return;
    }
    await document.documentElement.requestFullscreen?.().catch(() => undefined);
    setJudgeMode(true);
  };

  return (
    <div className={judgeMode ? "fixed inset-0 z-[100] overflow-y-auto bg-[hsl(var(--background))] p-6" : "max-w-7xl mx-auto space-y-6 pb-10"}>
      <div className={judgeMode ? "max-w-7xl mx-auto space-y-6 pb-10" : "space-y-6"}>
      <section className="rounded-2xl p-6 overflow-hidden relative" style={{ background: "linear-gradient(135deg, hsl(222 47% 11%), hsl(217 33% 17%))" }}>
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(142 71% 45%), transparent 68%)" }} />
        <div className="relative flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(142 71% 55%)" }}><Sparkles className="w-4 h-4" /> URBANVERSE DECISION STUDIO</p>
            <h2 className="mt-2 text-2xl font-bold text-white">Move from a city idea to an accountable decision.</h2>
            <p className="mt-2 max-w-2xl text-sm" style={{ color: "hsl(215 20% 65%)" }}>Compare choices beyond cost alone—then surface who benefits, what could go wrong, and what to do next.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
          <button onClick={toggleJudgeMode} className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-white" style={{ background: "hsl(0 0% 100% / 0.1)", border: "1px solid hsl(0 0% 100% / 0.16)" }}>{judgeMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}{judgeMode ? "Exit Judge Mode" : "Judge Mode"}</button>
          <div className="flex items-center gap-2 rounded-xl px-4 py-3" style={{ background: "hsl(0 0% 100% / 0.08)", border: "1px solid hsl(0 0% 100% / 0.12)" }}>
            <CheckCircle2 className="w-5 h-5" style={{ color: "hsl(142 71% 55%)" }} />
            <div><p className="text-xs text-white/60">Decision confidence</p><p className="font-semibold text-white">{selected.score}% evidence-aligned</p></div>
          </div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-2 mb-4"><span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "hsl(var(--primary))" }}>1</span><h3 className="font-semibold">Proposal Copilot</h3><span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Frame the decision in plain English</span></div>
        <div className="grid gap-3 lg:grid-cols-[1fr_260px_auto]">
          <textarea value={proposal} onChange={(event) => { setProposal(event.target.value); setBriefReady(false); }} rows={2} className="w-full resize-none rounded-xl px-4 py-3 text-sm outline-none" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }} />
          <select value={zoneId} onChange={(event) => { setZoneId(event.target.value); setBriefReady(false); }} className="rounded-xl px-3 text-sm outline-none" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
            {ZONES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
          </select>
          <button onClick={() => setBriefReady(true)} className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(221 83% 53%))" }}><Sparkles className="w-4 h-4" /> Generate brief</button>
        </div>
        <div className="mt-4 flex flex-wrap gap-2 text-xs"><span className="rounded-full px-3 py-1" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}><MapPin className="mr-1 inline w-3 h-3" /> {zone.name}</span><span className="rounded-full px-3 py-1" style={{ background: "hsl(142 71% 45% / 0.1)", color: "hsl(142 71% 35%)" }}>Population affected: {(zone.population / 1000).toFixed(0)}K</span><span className="rounded-full px-3 py-1" style={{ background: "hsl(var(--muted))", color: "hsl(var(--muted-foreground))" }}>Focus: mobility · climate · equity</span></div>
      </section>

      <section>
        <div className="mb-3 flex items-end justify-between"><div><p className="text-sm font-semibold">2. Compare viable paths</p><p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Select an option to inspect its full decision profile.</p></div><span className="text-xs font-medium" style={{ color: "hsl(var(--primary))" }}>Deterministic demo scenario model</span></div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {options.map((option, index) => {
            const active = selectedId === option.id;
            return <motion.button key={option.id} onClick={() => { setSelectedId(option.id); setBriefReady(false); }} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.08 }} className="rounded-2xl p-5 text-left transition-all" style={{ background: active ? "hsl(var(--primary) / 0.08)" : "hsl(var(--card))", border: `1px solid ${active ? "hsl(var(--primary))" : "hsl(var(--border))"}`, boxShadow: active ? "0 10px 28px hsl(var(--primary) / 0.12)" : "none" }}>
              <div className="flex items-start justify-between gap-3"><div><p className="text-sm font-semibold">{option.title}</p><p className="mt-1 text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{option.subtitle}</p></div><span className="rounded-full px-2 py-1 text-xs font-bold" style={{ background: option.score >= 80 ? "hsl(142 71% 45% / 0.12)" : "hsl(38 92% 50% / 0.12)", color: option.score >= 80 ? "hsl(142 71% 35%)" : "hsl(38 92% 35%)" }}>{option.score}</span></div>
              <div className="mt-4 flex gap-4 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}><span className="flex items-center gap-1"><WalletCards className="w-3.5 h-3.5" />{option.cost}</span><span className="flex items-center gap-1"><Clock3 className="w-3.5 h-3.5" />{option.timeline}</span></div>
              <div className="mt-4 grid grid-cols-2 gap-2">{metricLabels.map((metric) => { const value = option.changes[metric.key]; const good = metric.goodWhenNegative ? value < 0 : value > 0; return <div key={metric.key} className="rounded-lg px-2 py-1.5 text-xs" style={{ background: "hsl(var(--muted))" }}><span style={{ color: "hsl(var(--muted-foreground))" }}>{metric.label}</span><span className="float-right font-semibold" style={{ color: good ? "hsl(142 71% 38%)" : "hsl(0 84% 60%)" }}>{value > 0 ? "+" : ""}{value}</span></div>; })}</div>
              {active && <div className="mt-4 flex items-center gap-1 text-xs font-semibold" style={{ color: "hsl(var(--primary))" }}>Selected for decision brief <ArrowRight className="w-3.5 h-3.5" /></div>}
            </motion.button>;
          })}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white" style={{ background: "hsl(var(--primary))" }}>3</span><h3 className="font-semibold">Equity & risk lens</h3></div>
          <div className="mt-5 space-y-4">
            <div className="flex gap-3 rounded-xl p-4" style={{ background: "hsl(142 71% 45% / 0.08)", border: "1px solid hsl(142 71% 45% / 0.18)" }}><Users className="mt-0.5 w-5 h-5 shrink-0" style={{ color: "hsl(142 71% 38%)" }} /><div><p className="text-sm font-semibold">Who benefits</p><p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{selected.equity}</p></div></div>
            <div className="flex gap-3 rounded-xl p-4" style={{ background: "hsl(38 92% 50% / 0.08)", border: "1px solid hsl(38 92% 50% / 0.18)" }}><ShieldAlert className="mt-0.5 w-5 h-5 shrink-0" style={{ color: "hsl(38 92% 38%)" }} /><div><p className="text-sm font-semibold">Delivery watch-out</p><p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{selected.risk}</p></div></div>
          </div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "linear-gradient(145deg, hsl(217 91% 60% / 0.12), hsl(142 71% 45% / 0.08))", border: "1px solid hsl(var(--primary) / 0.25)" }}>
          <div className="flex items-center gap-2"><Leaf className="w-5 h-5" style={{ color: "hsl(142 71% 35%)" }} /><h3 className="font-semibold">Impact at a glance</h3></div>
          <div className="mt-4 grid grid-cols-2 gap-3">{metricLabels.map((metric) => { const value = selected.changes[metric.key]; const good = metric.goodWhenNegative ? value < 0 : value > 0; return <div key={metric.key} className="rounded-xl p-3" style={{ background: "hsl(var(--card) / 0.8)" }}><p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{metric.label}</p><p className="mt-1 text-xl font-bold" style={{ color: good ? "hsl(142 71% 38%)" : "hsl(0 84% 60%)" }}>{value > 0 ? "+" : ""}{value}<span className="ml-1 text-xs font-normal">pts</span></p></div>; })}</div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="flex items-center gap-2"><MessageCircle className="w-5 h-5" style={{ color: "hsl(var(--primary))" }} /><h3 className="font-semibold">Citizen Pulse</h3><span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Simulated stakeholder perspective</span></div>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">{citizenPulse.map((voice) => <div key={voice.persona} className="rounded-xl p-3" style={{ background: "hsl(var(--muted))" }}><div className="flex items-center justify-between gap-2"><p className="text-sm font-semibold">{voice.persona}</p><span className="text-[10px] font-bold" style={{ color: voice.color }}>{voice.sentiment}</span></div><p className="mt-2 text-xs leading-5" style={{ color: "hsl(var(--muted-foreground))" }}>“{voice.message}”</p></div>)}</div>
        </div>
        <div className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <p className="font-semibold">Live Decision Score</p><p className="mt-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>A transparent balance of city priorities.</p>
          <div className="mt-4 space-y-3">{[{ label: "Mobility", value: Math.max(20, selected.score - 4) }, { label: "Climate", value: Math.max(20, selected.score + (selected.changes.carbon < 0 ? 6 : -12)) }, { label: "Equity", value: Math.max(20, selected.score - (selected.id === "build" ? 20 : 2)) }, { label: "Deliverability", value: Math.max(20, selected.score - (selected.id === "build" ? 10 : 0)) }].map((factor) => <div key={factor.label}><div className="flex justify-between text-xs"><span style={{ color: "hsl(var(--muted-foreground))" }}>{factor.label}</span><span className="font-semibold">{Math.min(100, factor.value)}</span></div><div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: "hsl(var(--muted))" }}><motion.div animate={{ width: `${Math.min(100, factor.value)}%` }} transition={{ duration: 0.5 }} className="h-full rounded-full" style={{ background: "linear-gradient(90deg, hsl(var(--primary)), hsl(142 71% 45%))" }} /></div></div>)}</div>
        </div>
      </section>

      <section className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center justify-between gap-3"><div><p className="font-semibold">Before → After City Story</p><p className="mt-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>A clear visual narrative for a council meeting or judge presentation.</p></div><span className="rounded-full px-3 py-1 text-xs font-semibold" style={{ background: "hsl(var(--primary) / 0.1)", color: "hsl(var(--primary))" }}>{selected.title}</span></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto_1fr]"><div className="rounded-xl p-4" style={{ background: "hsl(var(--muted))" }}><p className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>TODAY · {zone.name.toUpperCase()}</p><p className="mt-2 text-sm">Traffic index {zone.metrics.trafficIndex}, carbon score {zone.metrics.carbonScore}, and unequal access remain visible city challenges.</p></div><div className="flex items-center justify-center"><ArrowRight className="w-6 h-6" style={{ color: "hsl(var(--primary))" }} /></div><motion.div key={selected.id} initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} className="rounded-xl p-4" style={{ background: "hsl(142 71% 45% / 0.08)", border: "1px solid hsl(142 71% 45% / 0.2)" }}><p className="text-xs font-semibold" style={{ color: "hsl(142 71% 35%)" }}>WITH THE SELECTED OPTION</p><p className="mt-2 text-sm">{selected.changes.traffic === 0 ? "Conditions remain unchanged, making the cost of inaction explicit." : `Traffic shifts ${selected.changes.traffic} points, access changes ${selected.changes.access > 0 ? "+" : ""}${selected.changes.access}, and the city can track the result openly.`}</p></motion.div></div>
      </section>

      {briefReady && <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl p-6" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"><div><p className="flex items-center gap-2 text-xs font-semibold" style={{ color: "hsl(var(--primary))" }}><Sparkles className="w-4 h-4" /> AI DECISION BRIEF</p><h3 className="mt-2 text-xl font-bold">Recommendation: {selected.title}</h3><p className="mt-3 max-w-3xl text-sm leading-6" style={{ color: "hsl(var(--muted-foreground))" }}>For {zone.name}, UrbanVerse recommends the selected approach for the proposal “{proposal}”. {selected.recommendation}</p></div><button onClick={() => window.print()} className="flex shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}><FileDown className="w-4 h-4" /> Export brief</button></div>
        <div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-xl p-3" style={{ background: "hsl(var(--muted))" }}><p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>First 30 days</p><p className="mt-1 text-sm font-semibold">Validate routes with affected residents</p></div><div className="rounded-xl p-3" style={{ background: "hsl(var(--muted))" }}><p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Success signal</p><p className="mt-1 text-sm font-semibold">Track access and peak-hour travel time</p></div><div className="rounded-xl p-3" style={{ background: "hsl(var(--muted))" }}><p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Governance</p><p className="mt-1 text-sm font-semibold">Publish outcomes to stakeholders</p></div></div>
      </motion.section>}
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Check, Clipboard, Compass, FileText, Map, Sparkles, Timer } from "lucide-react";
import { toast } from "sonner";

const steps = [
  { title: "Set the problem", description: "Open a live city zone and frame a real planning trade-off.", href: "/dashboard/map", icon: Map, action: "Open City Map", time: "0:00–0:30" },
  { title: "Simulate the proposal", description: "Select Railway Hub and run the hospital or green-mobility scenario.", href: "/dashboard/map", icon: Sparkles, action: "Run AI analysis", time: "0:30–1:30" },
  { title: "Explain the outcome", description: "Show measurable traffic, access, carbon, and resilience impacts—not a black-box answer.", href: "/dashboard/map", icon: Compass, action: "View impacts", time: "1:30–2:00" },
  { title: "Make the decision", description: "Compare alternatives, surface equity and risk, and create an executive recommendation.", href: "/dashboard/decision-studio", icon: FileText, action: "Open Decision Studio", time: "2:00–3:00" },
];

export default function DemoGuidePage() {
  const copyPrompt = async () => {
    await navigator.clipboard.writeText("Build a hospital near the Railway Hub while protecting accessibility and emissions.");
    toast.success("Demo prompt copied — paste it into the AI Planning Assistant.");
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10">
      <section className="rounded-2xl p-7 relative overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(222 47% 11%), hsl(217 33% 17%))" }}>
        <div className="absolute right-0 top-0 h-52 w-52 rounded-full opacity-20" style={{ background: "radial-gradient(circle, hsl(217 91% 60%), transparent 70%)" }} />
        <div className="relative"><p className="flex items-center gap-2 text-sm font-semibold" style={{ color: "hsl(142 71% 55%)" }}><Timer className="w-4 h-4" /> 3-MINUTE JUDGE STORY</p><h2 className="mt-3 text-3xl font-bold text-white">From city problem to confident public decision.</h2><p className="mt-3 max-w-2xl text-sm leading-6" style={{ color: "hsl(215 20% 65%)" }}>Use this run-of-show to demonstrate why UrbanVerse is different: it makes planning choices measurable, explainable, and equitable before money is committed.</p></div>
      </section>

      <section className="rounded-2xl p-5" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><p className="font-semibold">Ready-to-use demo prompt</p><p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>A clear prompt that shows both service delivery and sustainability trade-offs.</p></div><button onClick={copyPrompt} className="flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white" style={{ background: "hsl(var(--primary))" }}><Clipboard className="w-4 h-4" /> Copy prompt</button></div><p className="mt-4 rounded-xl p-4 font-mono text-sm" style={{ background: "hsl(var(--muted))" }}>“Build a hospital near the Railway Hub while protecting accessibility and emissions.”</p>
      </section>

      <section className="space-y-3">{steps.map((step, index) => <motion.div key={step.title} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.08 }} className="flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center" style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white" style={{ background: "linear-gradient(135deg, hsl(var(--primary)), hsl(142 71% 45%))" }}><step.icon className="w-5 h-5" /></div><div className="flex-1"><div className="flex items-center gap-2"><span className="text-xs font-bold" style={{ color: "hsl(var(--primary))" }}>{step.time}</span><span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>STEP {index + 1}</span></div><p className="mt-1 font-semibold">{step.title}</p><p className="mt-1 text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{step.description}</p></div><Link href={step.href}><button className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold sm:w-auto" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>{step.action} <Check className="w-4 h-4" style={{ color: "hsl(142 71% 40%)" }} /></button></Link></motion.div>)}</section>

      <section className="rounded-2xl p-5" style={{ background: "hsl(142 71% 45% / 0.08)", border: "1px solid hsl(142 71% 45% / 0.2)" }}><p className="font-semibold">Closing line for judges</p><p className="mt-2 text-sm leading-6" style={{ color: "hsl(var(--muted-foreground))" }}>“UrbanVerse does not replace planners. It gives them an explainable way to test choices, understand trade-offs, and bring communities into the decision before the city builds.”</p></section>
    </div>
  );
}

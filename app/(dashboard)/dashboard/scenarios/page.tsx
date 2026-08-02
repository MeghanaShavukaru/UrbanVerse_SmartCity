"use client";

// ============================================================
// app/(dashboard)/dashboard/scenarios/page.tsx
// Scenario History — list, open, delete
// ============================================================

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { Trash2, Clock, MapPin, Loader2 } from "lucide-react";
import { ACTION_ICONS, ACTION_LABELS, SupportedAction } from "@/config/rules";
import { deleteLocalScenario, getLocalScenarios } from "@/lib/localScenarios";

interface Scenario {
  id: string;
  zoneId: string;
  zoneName: string;
  action: string;
  prompt: string;
  parsedIntent: string;
  createdAt: string;
}

export default function ScenariosPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchScenarios = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/scenarios");
      const data = await res.json();
      const savedScenarios = data.data?.length ? data.data : getLocalScenarios();
      setScenarios(savedScenarios);
    } catch {
      toast.error("Failed to load scenarios");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(() => { void fetchScenarios(); }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const handleDelete = async (id: string) => {
    setDeleting(id);
    try {
      await fetch(`/api/scenarios/${id}`, { method: "DELETE" });
      deleteLocalScenario(id);
      setScenarios((prev) => prev.filter((s) => s.id !== id));
      toast.success("Scenario deleted");
    } catch {
      toast.error("Failed to delete scenario");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Scenario History</h2>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            All your saved planning simulations
          </p>
        </div>
        <Link href="/dashboard/map">
          <button className="px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: "hsl(var(--primary))" }}>
            + New Scenario
          </button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: "hsl(var(--primary))" }} />
        </div>
      ) : scenarios.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl"
          style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="font-semibold text-lg mb-2">No scenarios yet</h3>
          <p className="text-sm mb-6" style={{ color: "hsl(var(--muted-foreground))" }}>
            Run your first planning simulation on the city map
          </p>
          <Link href="/dashboard/map">
            <button className="px-6 py-2.5 rounded-lg font-semibold text-white"
              style={{ background: "hsl(var(--primary))" }}>
              Open City Map
            </button>
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {scenarios.map((scenario, index) => (
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: index * 0.04 }}
                className="rounded-xl p-4 flex items-start gap-4"
                style={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                  style={{ background: "hsl(var(--muted))" }}>
                  {ACTION_ICONS[scenario.action as SupportedAction] || "📋"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">
                        {ACTION_LABELS[scenario.action as SupportedAction] || scenario.action}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {scenario.parsedIntent}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleDelete(scenario.id)}
                        disabled={deleting === scenario.id}
                        className="p-1.5 rounded-lg transition-colors"
                        style={{ color: "hsl(0 84% 60%)" }}
                        title="Delete"
                      >
                        {deleting === scenario.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 mt-2">
                    <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <MapPin className="w-3 h-3" /> {scenario.zoneName}
                    </span>
                    <span className="flex items-center gap-1 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      <Clock className="w-3 h-3" />
                      {new Date(scenario.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs mt-1.5 italic" style={{ color: "hsl(var(--muted-foreground))" }}>
                    &ldquo;{scenario.prompt}&rdquo;
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}

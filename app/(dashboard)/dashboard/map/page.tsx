"use client";

// ============================================================
// app/(dashboard)/dashboard/map/page.tsx
// Main planning workspace: Map + AI Panel + Impact Dashboard + AI Insights
// ============================================================

import { useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import { Zone } from "@/config/zones";
import { SimulationResult } from "@/types";
import { AIPanel } from "@/features/ai/AIPanel";
import { ImpactDashboard } from "@/features/simulation/ImpactDashboard";
import { AIInsightsCard } from "@/features/simulation/AIInsightsCard";
import { toast } from "sonner";
import { LayoutGrid, Map, Globe2 } from "lucide-react";
import { generatePDFReport } from "@/lib/reportGenerator";
import { saveLocalScenario } from "@/lib/localScenarios";

// Dynamic import to disable SSR for Leaflet
const LeafletMap = dynamic(
  () => import("@/features/map/LeafletMap").then((m) => m.LeafletMap),
  { ssr: false, loading: () => (
    <div className="w-full h-full rounded-xl flex items-center justify-center"
      style={{ background: "hsl(220 20% 10%)" }}>
      <div className="flex flex-col items-center gap-3">
        <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin"
          style={{ borderColor: "hsl(217 91% 60%)", borderTopColor: "transparent" }} />
        <p className="text-sm" style={{ color: "hsl(215 20% 55%)" }}>Loading map...</p>
      </div>
    </div>
  )}
);

const GoogleMaps = dynamic(
  () => import("@/features/map/GoogleMaps").then((m) => m.GoogleMaps),
  { ssr: false }
);

type ViewMode = "split" | "map" | "results";
type MapProvider = "leaflet" | "google";

export default function MapPage() {
  const [selectedZone, setSelectedZone] = useState<Zone | null>(null);
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("split");
  // Keep the built-in map as the reliable default. Google Maps is optional.
  const [mapProvider, setMapProvider] = useState<MapProvider>("leaflet");
  const hasGoogleMaps = Boolean(process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);

  const handleZoneSelect = useCallback((zone: Zone) => {
    setSelectedZone(zone);
    setSimulationResult(null); // clear previous result on zone change
  }, []);

  const handleSimulationComplete = useCallback((result: SimulationResult) => {
    setSimulationResult(result);
    saveLocalScenario(result);
    // Auto-switch to results view on mobile
    if (window.innerWidth < 768) setViewMode("results");
    toast.success("Analysis complete! Scroll down to view results.");
  }, []);

  const handleExportReport = async () => {
    if (!simulationResult) {
      toast.error("Run a simulation first");
      return;
    }
    const toastId = toast.loading("Generating PDF report...");
    try {
      await generatePDFReport(simulationResult);
      toast.success("Report downloaded!", { id: toastId });
    } catch {
      toast.error("Failed to generate report", { id: toastId });
    }
  };

  return (
    <div className="h-full flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-shrink-0">
        <div>
          <h2 className="font-bold text-lg">City Planning Map</h2>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Select a zone → Describe your proposal → Run AI analysis
          </p>
        </div>
        {/* View toggle (desktop) */}
        <div className="hidden md:flex items-center gap-2">
        <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "hsl(var(--muted))" }}>
          {(["split", "map"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all"
              style={{
                background: viewMode === mode ? "hsl(var(--card))" : "transparent",
                color: viewMode === mode ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                boxShadow: viewMode === mode ? "0 1px 4px rgba(0,0,0,0.1)" : undefined,
              }}
            >
              {mode === "split" ? <LayoutGrid className="w-3.5 h-3.5" /> : <Map className="w-3.5 h-3.5" />}
              {mode === "split" ? "Split View" : "Map Only"}
            </button>
          ))}
        </div>
        {hasGoogleMaps && <div className="flex items-center gap-1 rounded-lg p-1" style={{ background: "hsl(var(--muted))" }}>
          <button onClick={() => setMapProvider("google")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium" style={{ background: mapProvider === "google" ? "hsl(var(--card))" : "transparent", color: mapProvider === "google" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}><Globe2 className="w-3.5 h-3.5" /> Google</button>
          <button onClick={() => setMapProvider("leaflet")} className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium" style={{ background: mapProvider === "leaflet" ? "hsl(var(--card))" : "transparent", color: mapProvider === "leaflet" ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}><Map className="w-3.5 h-3.5" /> City</button>
        </div>}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4 min-h-0">
        {/* Map Panel (2/3 width) */}
        {(viewMode === "split" || viewMode === "map") && (
          <div className="md:col-span-2 min-h-96 md:min-h-0"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "0.75rem",
              overflow: "hidden",
              minHeight: "520px",
            }}>
            {mapProvider === "google" ? <GoogleMaps onZoneSelect={handleZoneSelect} selectedZoneId={selectedZone?.id} /> : <LeafletMap onZoneSelect={handleZoneSelect} selectedZoneId={selectedZone?.id} />}
          </div>
        )}

        {/* AI Panel (1/3 width) */}
        {viewMode !== "map" && (
          <div className="md:col-span-1 rounded-xl overflow-hidden flex flex-col"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
            }}>
            {/* Panel Header */}
            <div className="px-4 py-3 flex-shrink-0"
              style={{
                background: "hsl(var(--muted))",
                borderBottom: "1px solid hsl(var(--border))",
              }}>
              <p className="text-sm font-semibold flex items-center gap-2">
                <span>✨</span> AI Planning Assistant
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              <AIPanel
                selectedZone={selectedZone}
                onSimulationComplete={handleSimulationComplete}
              />
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <AnimatePresence>
        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.4 }}
            className="space-y-4"
          >
            {/* Impact Dashboard */}
            <div className="rounded-xl p-5"
              style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
              <h3 className="font-semibold mb-4">Impact Analysis Results</h3>
              <ImpactDashboard result={simulationResult} />
            </div>

            {/* AI Insights */}
            <AIInsightsCard
              insights={simulationResult.insights}
              onExportReport={handleExportReport}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

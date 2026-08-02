"use client";

// ============================================================
// features/ai/AIPanel.tsx
// Right-side AI planning panel: prompt input → scenario preview → run analysis
// ============================================================

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Zone, ZONES } from "@/config/zones";
import { ACTION_ICONS, ACTION_LABELS, SupportedAction } from "@/config/rules";
import { ParsedScenario, SimulationResult } from "@/types";
import { toast } from "sonner";

import {
  Loader2,
  Play,
  MapPin,
  ChevronDown,
  Sparkles,
  Mic,
  MicOff,
  X,
} from "lucide-react";

type SpeechRecognitionLike = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: ((event: { results: ArrayLike<ArrayLike<{ transcript: string }>> }) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

interface AIPanelProps {
  selectedZone: Zone | null;
  onSimulationComplete: (result: SimulationResult) => void;
}

const EXAMPLE_PROMPTS = [
  "Build a hospital near the station",
  "Add an EV charging station",
  "Create a green park here",
  "Simulate a flood event",
  "Close the main road temporarily",
];

export function AIPanel({ selectedZone, onSimulationComplete }: AIPanelProps) {
  const [prompt, setPrompt] = useState("");
  const [parsedScenario, setParsedScenario] = useState<ParsedScenario | null>(null);
  const [loadingParse, setLoadingParse] = useState(false);
  const [loadingSimulate, setLoadingSimulate] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);

  const handleVoiceInput = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    const browserWindow = window as Window & {
      SpeechRecognition?: SpeechRecognitionConstructor;
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
    };
    const Recognition = browserWindow.SpeechRecognition ?? browserWindow.webkitSpeechRecognition;
    if (!Recognition) {
      toast.info("Speech input is not supported in this browser. You can still type your proposal.");
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = 0; index < event.results.length; index += 1) {
        transcript += event.results[index][0]?.transcript ?? "";
      }
      setPrompt((current) => `${current}${current ? " " : ""}${transcript.trim()}`);
      toast.success("Voice note added to your planning request.");
    };
    recognition.onerror = (event) => {
      if (event.error !== "aborted") toast.error("We could not hear that. Please try again or type your request.");
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    setIsListening(true);
    recognition.start();
  };

  const handleParse = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a planning request");
      return;
    }
    if (!selectedZone) {
      toast.error("Please select a zone on the map first");
      return;
    }
    setLoadingParse(true);
    setParsedScenario(null);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, zoneId: selectedZone.id, parseOnly: true }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setParsedScenario(data.scenario);
      toast.success("Scenario parsed — review and run the analysis");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to parse request");
    } finally {
      setLoadingParse(false);
    }
  };

  const handleRunSimulation = async () => {
    if (!parsedScenario || !selectedZone) return;
    setLoadingSimulate(true);
    try {
      const res = await fetch("/api/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, zoneId: selectedZone.id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      onSimulationComplete(data.data);
      toast.success("Simulation complete!");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Simulation failed");
    } finally {
      setLoadingSimulate(false);
    }
  };

  if (!selectedZone) {
    return (
      <div className="h-full flex flex-col items-center justify-center px-6 text-center">
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
          className="text-5xl mb-4"
        >
          🗺️
        </motion.div>
        <h3 className="font-semibold mb-2">Select a City Zone</h3>
        <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Click any colored zone on the map to open the AI planning assistant
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Zone Header */}
      <div className="px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: selectedZone.color }} />
          <div>
            <p className="text-sm font-semibold">{selectedZone.name}</p>
            <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
              Pop. {(selectedZone.population / 1000).toFixed(0)}K · Traffic {selectedZone.metrics.trafficIndex}/100
            </p>
          </div>
        </div>
      </div>

      {/* Zone Base Metrics */}
      <div className="px-4 py-3 flex-shrink-0"
        style={{ borderBottom: "1px solid hsl(var(--border))" }}>
        <p className="text-xs font-semibold mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
          CURRENT METRICS
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: "Traffic", value: selectedZone.metrics.trafficIndex, emoji: "🚦" },
            { label: "Accessibility", value: selectedZone.metrics.accessibility, emoji: "♿" },
            { label: "Carbon", value: selectedZone.metrics.carbonScore, emoji: "🌿" },
            { label: "Flood Risk", value: selectedZone.metrics.floodRisk, emoji: "🌊" },
            { label: "Emergency", value: selectedZone.metrics.emergencyResponse, emoji: "🚑" },
          ].map((m) => (
            <div key={m.label} className="flex items-center justify-between rounded-lg px-2.5 py-1.5"
              style={{ background: "hsl(var(--muted))" }}>
              <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                {m.emoji} {m.label}
              </span>
              <span className="text-xs font-semibold">{m.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Prompt Area */}
      <div className="flex-1 px-4 py-3 overflow-y-auto space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold" style={{ color: "hsl(var(--muted-foreground))" }}>
              AI PLANNING REQUEST
            </p>
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-1 text-xs"
              style={{ color: "hsl(var(--primary))" }}
            >
              Examples <ChevronDown className={`w-3 h-3 transition-transform ${showExamples ? "rotate-180" : ""}`} />
            </button>
          </div>

          <AnimatePresence>
            {showExamples && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3 space-y-1 overflow-hidden"
              >
                {EXAMPLE_PROMPTS.map((ex) => (
                  <button
                    key={ex}
                    onClick={() => { setPrompt(ex); setShowExamples(false); }}
                    className="w-full text-left text-xs px-3 py-2 rounded-lg transition-colors"
                    style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
                  >
                    {ex}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`E.g. "Build a hospital near ${selectedZone.name}"`}
            rows={3}
            className="w-full px-3 py-2.5 pr-11 rounded-lg text-sm resize-none outline-none transition-all"
            style={{
              background: "hsl(var(--muted))",
              border: "1px solid hsl(var(--border))",
              color: "hsl(var(--foreground))",
            }}
            onFocus={(e) => (e.target.style.borderColor = "hsl(var(--primary))")}
            onBlur={(e) => (e.target.style.borderColor = "hsl(var(--border))")}
            onKeyDown={(e) => {
              if (e.key === "Enter" && e.ctrlKey) handleParse();
            }}
          />
          <button
            type="button"
            onClick={handleVoiceInput}
            aria-label={isListening ? "Stop voice input" : "Start voice input"}
            title={isListening ? "Stop listening" : "Speak your planning request"}
            className="absolute right-2 bottom-2 p-2 rounded-lg transition-colors"
            style={{ background: isListening ? "hsl(0 84% 60% / 0.15)" : "hsl(var(--primary) / 0.12)", color: isListening ? "hsl(0 84% 60%)" : "hsl(var(--primary))" }}
          >
            {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
          </div>
          <p className="mt-1.5 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            {isListening ? "Listening… speak naturally, then pause to finish." : "Type or use the microphone to describe your proposal."}
          </p>

          <button
            onClick={handleParse}
            disabled={loadingParse || !prompt.trim()}
            className="mt-2 w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(221 83% 53%))",
            }}
          >
            {loadingParse ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Parsing with AI...</>
            ) : (
              <><Sparkles className="w-4 h-4" /> Parse with AI</>
            )}
          </button>
        </div>

        {/* Scenario Preview */}
        <AnimatePresence>
          {parsedScenario && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="rounded-xl p-4 space-y-3"
              style={{
                background: "hsl(142 71% 45% / 0.08)",
                border: "1px solid hsl(142 71% 45% / 0.25)",
              }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold" style={{ color: "hsl(142 71% 45%)" }}>
                  SCENARIO PREVIEW
                </p>
                <button onClick={() => setParsedScenario(null)}>
                  <X className="w-3.5 h-3.5" style={{ color: "hsl(var(--muted-foreground))" }} />
                </button>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{ACTION_ICONS[parsedScenario.action as SupportedAction]}</span>
                  <div>
                    <p className="font-semibold">{ACTION_LABELS[parsedScenario.action as SupportedAction]}</p>
                    <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                      {parsedScenario.parsed_intent}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{ZONES.find(z => z.id === parsedScenario.zone_id)?.name || parsedScenario.zone_id}</span>
                </div>

                {parsedScenario.analysis_categories.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {parsedScenario.analysis_categories.map((cat) => (
                      <span key={cat} className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "hsl(var(--primary) / 0.15)", color: "hsl(var(--primary))" }}>
                        {cat}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={handleRunSimulation}
                disabled={loadingSimulate}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, hsl(142 71% 40%), hsl(142 71% 32%))",
                }}
              >
                {loadingSimulate ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Running simulation...</>
                ) : (
                  <><Play className="w-4 h-4" /> Run Analysis</>
                )}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

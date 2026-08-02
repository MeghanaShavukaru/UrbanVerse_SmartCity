// ============================================================
// types/index.ts
// Shared TypeScript types across the application
// ============================================================

import { SupportedAction } from "@/config/rules";
import { ZoneId, ZoneMetrics } from "@/config/zones";

// --- Simulation ---

export interface ParsedScenario {
  action: SupportedAction;
  zone_id: ZoneId;
  parsed_intent: string;
  analysis_categories: string[];
}

export interface SimulationResult {
  scenarioId: string;
  action: SupportedAction;
  zone_id: ZoneId;
  zoneName: string;
  prompt: string;
  parsedIntent: string;
  baseMetrics: ZoneMetrics;
  newMetrics: ZoneMetrics;
  deltas: Partial<ZoneMetrics>;
  insights: AIInsights;
  createdAt: string;
}

export interface AIInsights {
  executive_summary: string;
  benefits: string[];
  risks: string[];
  recommendations: string[];
}

// --- API Payloads ---

export interface SimulateRequest {
  prompt: string;
  zoneId: ZoneId;
}

export interface SimulateResponse {
  success: boolean;
  data?: SimulationResult;
  error?: string;
}

// --- Scenario (DB) ---

export interface ScenarioRecord {
  id: string;
  userId: string;
  zoneId: ZoneId;
  zoneName: string;
  action: SupportedAction;
  prompt: string;
  parsedIntent: string;
  baseMetrics: ZoneMetrics;
  newMetrics: ZoneMetrics;
  insights: AIInsights;
  createdAt: string;
}

// --- Report ---

export interface ReportData {
  scenarioId: string;
  generatedAt: string;
  scenario: ScenarioRecord;
}

// --- Auth ---

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
}

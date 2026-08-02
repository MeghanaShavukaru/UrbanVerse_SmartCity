// ============================================================
// app/api/simulate/route.ts
// POST /api/simulate
// Flow: Validate → Gemini parse → Validator → Rule engine → Gemini insights → DB save
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { genai, geminiModel } from "@/lib/gemini";
import { prisma } from "@/lib/prisma";
import { ZONE_MAP, ZoneId } from "@/config/zones";
import {
  SUPPORTED_ACTIONS,
  SupportedAction,
  applyRules,
} from "@/config/rules";
import {
  PARSE_INTENT_SYSTEM_PROMPT,
  GENERATE_INSIGHTS_SYSTEM_PROMPT,
} from "@/config/prompts";
import type { AIInsights, ParsedScenario, SimulationResult } from "@/types";

// ---- Request validation ----
const RequestSchema = z.object({
  prompt: z.string().min(3).max(500),
  zoneId: z.string(),
  parseOnly: z.boolean().optional().default(false),
});

// ---- Gemini structured output schema for intent parsing ----
const parseSchema = {
  type: "object",
  properties: {
    action: {
      type: "string",
      enum: SUPPORTED_ACTIONS,
    },
    zone_id: {
      type: "string",
      enum: Object.keys(ZONE_MAP),
    },
    parsed_intent: {
      type: "string",
    },
    analysis_categories: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["action", "zone_id", "parsed_intent", "analysis_categories"],
};

// ---- Gemini structured output schema for AI insights ----
const insightsSchema = {
  type: "object",
  properties: {
    executive_summary: { type: "string" },
    benefits: { type: "array", items: { type: "string" } },
    risks: { type: "array", items: { type: "string" } },
    recommendations: { type: "array", items: { type: "string" } },
  },
  required: ["executive_summary", "benefits", "risks", "recommendations"],
};

function createFallbackScenario(prompt: string, zoneId: string): ParsedScenario {
  const normalized = prompt.toLowerCase();
  const action: SupportedAction = normalized.includes("hospital") || normalized.includes("clinic")
    ? "add_hospital"
    : normalized.includes("park") || normalized.includes("green") || normalized.includes("tree")
    ? "add_park"
    : normalized.includes("ev") || normalized.includes("charging") || normalized.includes("electric")
    ? "add_ev_station"
    : normalized.includes("close") || normalized.includes("closure") || normalized.includes("road")
    ? "road_closure"
    : normalized.includes("flood")
    ? "flood_event"
    : "add_park";

  return {
    action,
    zone_id: zoneId as ZoneId,
    parsed_intent: `Planning proposal: ${prompt}`,
    analysis_categories: ["Mobility", "Accessibility", "Climate", "Resilience"],
  };
}

function createFallbackInsights(
  action: SupportedAction,
  zone: (typeof ZONE_MAP)[ZoneId],
  baseMetrics: Record<string, number>,
  newMetrics: Record<string, number>
): AIInsights {
  const trafficDelta = newMetrics.trafficIndex - baseMetrics.trafficIndex;
  const carbonDelta = newMetrics.carbonScore - baseMetrics.carbonScore;
  const accessDelta = newMetrics.accessibility - baseMetrics.accessibility;
  return {
    executive_summary: `${action.replaceAll("_", " ")} was evaluated for ${zone.name}. The deterministic city model shows the proposal's direct impact on mobility, access, climate, and resilience.`,
    benefits: [
      accessDelta >= 0 ? `Accessibility improves by ${accessDelta} points for people using ${zone.name}.` : "The scenario makes access trade-offs visible before implementation.",
      carbonDelta <= 0 ? `Carbon impact improves by ${Math.abs(carbonDelta)} points.` : "The proposal's carbon impact is explicitly measured for mitigation planning.",
    ],
    risks: [
      trafficDelta > 0 ? `Traffic may increase by ${trafficDelta} points during or after delivery.` : "Monitor travel times and local access during implementation.",
      "Validate the proposal with affected residents and local businesses before final approval.",
    ],
    recommendations: [
      "Run a phased pilot and publish the before-and-after metrics.",
      "Use the Decision Studio to compare this option against the no-action baseline.",
    ],
  };
}

async function parseIntent(
  prompt: string,
  zoneId: string
): Promise<ParsedScenario> {
  const zone = ZONE_MAP[zoneId as ZoneId];
  const userPrompt = `The city planner is working in the "${zone?.name || zoneId}" zone and says: "${prompt}"\n\nMap this to the correct action and zone.`;

  const response = await genai.models.generateContent({
    model: geminiModel,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: PARSE_INTENT_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: parseSchema as Parameters<typeof genai.models.generateContent>[0]["config"] extends { responseSchema?: infer S } ? S : never,
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini returned empty response");

  const parsed = JSON.parse(text) as ParsedScenario;

  // Server-side validation
  if (!SUPPORTED_ACTIONS.includes(parsed.action as SupportedAction)) {
    throw new Error(`Unsupported action: ${parsed.action}`);
  }
  if (!ZONE_MAP[parsed.zone_id as ZoneId]) {
    // Fall back to requested zone if AI hallucinates
    parsed.zone_id = zoneId as ZoneId;
  }

  return parsed;
}

async function generateInsights(
  action: SupportedAction,
  zone: (typeof ZONE_MAP)[ZoneId],
  baseMetrics: Record<string, number>,
  newMetrics: Record<string, number>,
  parsedIntent: string
): Promise<AIInsights> {
  const metricSummary = Object.entries(newMetrics)
    .map(
      (
        [key, val] // Show delta
      ) =>
        `${key}: ${baseMetrics[key as keyof typeof baseMetrics]} → ${val} (${
          val - (baseMetrics[key as keyof typeof baseMetrics] as number) > 0
            ? "+"
            : ""
        }${val - (baseMetrics[key as keyof typeof baseMetrics] as number)})`
    )
    .join(", ");

  const userPrompt = `
Scenario: ${parsedIntent}
Zone: ${zone.name} (Population: ${zone.population.toLocaleString()})
Action: ${action}
Metric Changes: ${metricSummary}

Write a professional planning report based on these simulation results.
`;

  const response = await genai.models.generateContent({
    model: geminiModel,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction: GENERATE_INSIGHTS_SYSTEM_PROMPT,
      responseMimeType: "application/json",
      responseSchema: insightsSchema as Parameters<typeof genai.models.generateContent>[0]["config"] extends { responseSchema?: infer S } ? S : never,
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) throw new Error("Gemini insights returned empty response");
  return JSON.parse(text) as AIInsights;
}

export async function POST(req: NextRequest) {
  try {
    // 1. Parse and validate request body
    const body = await req.json();
    const validated = RequestSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { success: false, error: "Invalid request: " + validated.error.message },
        { status: 400 }
      );
    }
    const { prompt, zoneId, parseOnly } = validated.data;

    // 2. Validate zone exists
    const zone = ZONE_MAP[zoneId as ZoneId];
    if (!zone) {
      return NextResponse.json(
        { success: false, error: `Zone not found: ${zoneId}` },
        { status: 400 }
      );
    }

    // 3. Parse intent with Gemini
    let parsedScenario: ParsedScenario;
    try {
      parsedScenario = await parseIntent(prompt, zoneId);
    } catch (error) {
      console.warn("Gemini parsing unavailable; using deterministic fallback", error);
      parsedScenario = createFallbackScenario(prompt, zoneId);
    }

    // Return early if parseOnly flag set (scenario preview)
    if (parseOnly) {
      return NextResponse.json({ success: true, scenario: parsedScenario });
    }

    // 4. Run deterministic rule engine
    const baseMetrics = { ...zone.metrics } as unknown as Record<string, number>;
    const newMetricsRaw = applyRules(baseMetrics, parsedScenario.action as SupportedAction);
    const newMetrics = newMetricsRaw as unknown as typeof zone.metrics;

    // Calculate deltas
    const deltas: Record<string, number> = {};
    for (const key of Object.keys(baseMetrics)) {
      const delta = (newMetrics as unknown as Record<string, number>)[key] - baseMetrics[key];
      if (delta !== 0) deltas[key] = delta;
    }

    // 5. Generate AI insights narrative
    let insights: AIInsights;
    try {
      insights = await generateInsights(
        parsedScenario.action as SupportedAction,
        zone,
        baseMetrics,
        newMetricsRaw,
        parsedScenario.parsed_intent
      );
    } catch (error) {
      console.warn("Gemini insights unavailable; using deterministic fallback", error);
      insights = createFallbackInsights(parsedScenario.action as SupportedAction, zone, baseMetrics, newMetricsRaw);
    }

    // 6. Persist scenario to database (try, but don't fail if DB not configured)
    let scenarioId = `sim_${Date.now()}`;
    try {
      // Try to find or create user (by email, using Firebase token eventually)
      // For now use a demo user approach
      let user = await prisma.user.findFirst();
      if (!user) {
        user = await prisma.user.create({
          data: {
            firebaseUid: "demo",
            email: "demo@urbanverse.ai",
            name: "Demo Planner",
          },
        });
      }

      const scenario = await prisma.scenario.create({
        data: {
          userId: user.id,
          zoneId: zone.id,
          action: parsedScenario.action,
          prompt,
          parsedIntent: parsedScenario.parsed_intent,
          baseMetrics: baseMetrics as unknown as Prisma.InputJsonValue,
          newMetrics: newMetrics as unknown as Prisma.InputJsonValue,
          deltas: deltas as unknown as Prisma.InputJsonValue,
          insights: insights as unknown as Prisma.InputJsonValue,
        },
      });
      scenarioId = scenario.id;

      // Create event record
      await prisma.event.create({
        data: {
          scenarioId: scenario.id,
          type: parsedScenario.action.toUpperCase(),
          zoneId: zone.id,
          payload: { prompt, parsedIntent: parsedScenario.parsed_intent },
        },
      });
    } catch {
      // DB not configured yet — return in-memory result
      console.warn("DB not configured, returning in-memory result");
    }

    const result: SimulationResult = {
      scenarioId,
      action: parsedScenario.action as SupportedAction,
      zone_id: zone.id as ZoneId,
      zoneName: zone.name,
      prompt,
      parsedIntent: parsedScenario.parsed_intent,
      baseMetrics: zone.metrics,
      newMetrics,
      deltas: deltas as typeof deltas & typeof zone.metrics,
      insights,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    console.error("[/api/simulate]", err);
    const message = err instanceof Error ? err.message : "Simulation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// ============================================================
// app/api/scenarios/route.ts
// GET /api/scenarios — fetch scenario history
// POST /api/scenarios — save a scenario (handled by simulate)
// ============================================================

import { NextResponse } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

type ScenarioWithZone = {
  id: string;
  zoneId: string;
  action: string;
  prompt: string;
  parsedIntent: string;
  baseMetrics: Prisma.JsonValue;
  newMetrics: Prisma.JsonValue;
  deltas: Prisma.JsonValue;
  insights: Prisma.JsonValue;
  createdAt: Date;
  zone: { name: string };
};

export async function GET() {
  try {
    const scenarios = await prisma.scenario.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        zoneId: true,
        action: true,
        prompt: true,
        parsedIntent: true,
        baseMetrics: true,
        newMetrics: true,
        deltas: true,
        insights: true,
        createdAt: true,
        zone: { select: { name: true } },
      },
    });

    const data = (scenarios as ScenarioWithZone[]).map((s) => ({
      id: s.id,
      zoneId: s.zoneId,
      zoneName: s.zone.name,
      action: s.action,
      prompt: s.prompt,
      parsedIntent: s.parsedIntent,
      baseMetrics: s.baseMetrics,
      newMetrics: s.newMetrics,
      deltas: s.deltas,
      insights: s.insights,
      createdAt: s.createdAt.toISOString(),
    }));

    return NextResponse.json({ success: true, data });
  } catch {
    return NextResponse.json({ success: true, data: [] });
  }
}

// ============================================================
// app/api/scenarios/route.ts
// GET /api/scenarios — fetch scenario history
// POST /api/scenarios — save a scenario (handled by simulate)
// ============================================================

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    const data = scenarios.map((s) => ({
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

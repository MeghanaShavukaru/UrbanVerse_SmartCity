// ============================================================
// app/api/zones/route.ts
// GET /api/zones — return all predefined city zones
// ============================================================

import { NextResponse } from "next/server";
import { ZONES } from "@/config/zones";

export async function GET() {
  return NextResponse.json({ success: true, data: ZONES });
}

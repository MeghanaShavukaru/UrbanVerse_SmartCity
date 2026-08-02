"use client";

// ============================================================
// app/(dashboard)/dashboard/reports/page.tsx
// Reports page — lists downloadable planning reports
// ============================================================

import Link from "next/link";
import { FileText } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold">Reports</h2>
          <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
            Download PDF reports from your simulation history
          </p>
        </div>
      </div>

      {/* Empty state */}
      <div className="flex flex-col items-center justify-center py-24 text-center rounded-2xl"
        style={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))" }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: "hsl(var(--primary) / 0.1)" }}>
          <FileText className="w-8 h-8" style={{ color: "hsl(var(--primary))" }} />
        </div>
        <h3 className="font-semibold text-lg mb-2">No reports yet</h3>
        <p className="text-sm mb-6 max-w-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
          Run a simulation and click &ldquo;Export Report&rdquo; to generate and download a professional PDF planning report.
        </p>
        <Link href="/dashboard/map">
          <button className="px-6 py-2.5 rounded-lg font-semibold text-white"
            style={{ background: "hsl(var(--primary))" }}>
            Run a Simulation
          </button>
        </Link>
      </div>
    </div>
  );
}

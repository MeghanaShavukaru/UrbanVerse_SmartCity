// ============================================================
// lib/reportGenerator.ts
// Client-side PDF report generation using jsPDF + html2canvas
// ============================================================

import { SimulationResult } from "@/types";
import { ACTION_ICONS, ACTION_LABELS, SupportedAction } from "@/config/rules";

export async function generatePDFReport(result: SimulationResult): Promise<void> {
  const { default: jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 20;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // ---- Helper functions ----
  const addText = (
    text: string,
    x: number,
    yPos: number,
    options?: { fontSize?: number; fontStyle?: string; color?: [number, number, number]; align?: "left" | "center" | "right"; maxWidth?: number }
  ) => {
    if (options?.fontSize) doc.setFontSize(options.fontSize);
    if (options?.fontStyle) doc.setFont("helvetica", options.fontStyle as "normal" | "bold" | "italic");
    if (options?.color) doc.setTextColor(...options.color);
    doc.text(text, x, yPos, { align: options?.align ?? "left", maxWidth: options?.maxWidth });
  };

  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage();
      y = margin;
    }
  };

  // ---- Header ----
  // Blue gradient header bar
  doc.setFillColor(37, 99, 235);
  doc.rect(0, 0, pageWidth, 30, "F");

  addText("UrbanVerse AI", margin, 12, { fontSize: 18, fontStyle: "bold", color: [255, 255, 255] });
  addText("Planning Simulation Report", margin, 20, { fontSize: 10, fontStyle: "normal", color: [191, 219, 254] });
  addText(new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }), pageWidth - margin, 20,
    { fontSize: 9, color: [191, 219, 254], align: "right" });

  y = 42;

  // ---- Scenario Info ----
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(margin, y, contentWidth, 28, 3, 3, "F");

  addText("SCENARIO", margin + 5, y + 7, { fontSize: 7, fontStyle: "bold", color: [100, 116, 139] });
  addText(
    `${ACTION_ICONS[result.action as SupportedAction]} ${ACTION_LABELS[result.action as SupportedAction]}`,
    margin + 5, y + 14, { fontSize: 12, fontStyle: "bold", color: [15, 23, 42] }
  );
  addText(`Zone: ${result.zoneName}`, margin + 5, y + 21, { fontSize: 9, color: [71, 85, 105] });
  addText(`ID: ${result.scenarioId}`, pageWidth - margin - 5, y + 21, {
    fontSize: 8, color: [148, 163, 184], align: "right"
  });

  y += 36;

  // ---- Planning Request ----
  addText("Planning Request", margin, y, { fontSize: 11, fontStyle: "bold", color: [15, 23, 42] });
  y += 6;
  doc.setFillColor(248, 250, 252);
  const reqLines = doc.splitTextToSize(`"${result.prompt}"`, contentWidth - 10);
  doc.roundedRect(margin, y, contentWidth, reqLines.length * 5 + 8, 2, 2, "F");
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(margin, y, contentWidth, reqLines.length * 5 + 8, 2, 2, "S");
  addText(reqLines.join("\n"), margin + 5, y + 5, { fontSize: 9, fontStyle: "italic", color: [71, 85, 105] });
  y += reqLines.length * 5 + 16;

  // ---- Impact Metrics Table ----
  checkPageBreak(60);
  addText("Simulation Results", margin, y, { fontSize: 11, fontStyle: "bold", color: [15, 23, 42] });
  y += 8;

  const metricConfig = [
    { key: "trafficIndex", label: "Traffic Index", emoji: "🚦", lowerIsBetter: true },
    { key: "accessibility", label: "Accessibility", emoji: "♿", lowerIsBetter: false },
    { key: "carbonScore", label: "Carbon Score", emoji: "🌿", lowerIsBetter: true },
    { key: "floodRisk", label: "Flood Risk", emoji: "🌊", lowerIsBetter: true },
    { key: "emergencyResponse", label: "Emergency Response", emoji: "🚑", lowerIsBetter: false },
  ];

  // Table header
  doc.setFillColor(30, 41, 59);
  doc.rect(margin, y, contentWidth, 8, "F");
  addText("Metric", margin + 5, y + 5.5, { fontSize: 8, fontStyle: "bold", color: [255, 255, 255] });
  addText("Before", margin + 90, y + 5.5, { fontSize: 8, fontStyle: "bold", color: [255, 255, 255] });
  addText("After", margin + 120, y + 5.5, { fontSize: 8, fontStyle: "bold", color: [255, 255, 255] });
  addText("Change", margin + 150, y + 5.5, { fontSize: 8, fontStyle: "bold", color: [255, 255, 255] });
  y += 8;

  const baseMetricsMap = result.baseMetrics as unknown as Record<string, number>;
  const newMetricsMap = result.newMetrics as unknown as Record<string, number>;

  metricConfig.forEach((m, idx) => {
    const base = baseMetricsMap[m.key] ?? 0;
    const after = newMetricsMap[m.key] ?? 0;
    const delta = after - base;
    const isGood = (m.lowerIsBetter && delta <= 0) || (!m.lowerIsBetter && delta >= 0);

    doc.setFillColor(idx % 2 === 0 ? 248 : 255, idx % 2 === 0 ? 250 : 255, idx % 2 === 0 ? 252 : 255);
    doc.rect(margin, y, contentWidth, 7, "F");

    addText(m.label, margin + 5, y + 5, { fontSize: 9, color: [30, 41, 59] });
    addText(String(base), margin + 90, y + 5, { fontSize: 9, color: [71, 85, 105] });
    addText(String(after), margin + 120, y + 5, { fontSize: 9, fontStyle: "bold", color: [30, 41, 59] });

    const changeText = delta === 0 ? "No change" : `${delta > 0 ? "+" : ""}${delta}`;
    const changeColor: [number, number, number] = delta === 0
      ? [148, 163, 184]
      : isGood
      ? [21, 128, 61]
      : [185, 28, 28];
    addText(changeText, margin + 150, y + 5, { fontSize: 9, color: changeColor });
    y += 7;
  });
  y += 10;

  // ---- AI Insights ----
  checkPageBreak(80);
  addText("AI Planning Insights", margin, y, { fontSize: 11, fontStyle: "bold", color: [15, 23, 42] });
  y += 3;
  addText("Generated by Google Gemini AI", margin, y + 4, { fontSize: 8, color: [148, 163, 184] });
  y += 12;

  // Executive Summary
  addText("Executive Summary", margin, y, { fontSize: 10, fontStyle: "bold", color: [37, 99, 235] });
  y += 5;
  const summaryLines = doc.splitTextToSize(result.insights.executive_summary, contentWidth);
  addText(summaryLines.join("\n"), margin, y, { fontSize: 9, color: [51, 65, 85] });
  y += summaryLines.length * 4.5 + 8;

  // Benefits
  checkPageBreak(40);
  addText("Benefits", margin, y, { fontSize: 10, fontStyle: "bold", color: [21, 128, 61] });
  y += 5;
  result.insights.benefits.forEach((b, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${b}`, contentWidth - 5);
    addText(lines.join("\n"), margin + 3, y, { fontSize: 9, color: [51, 65, 85] });
    y += lines.length * 4.5 + 2;
  });
  y += 4;

  // Risks
  checkPageBreak(30);
  addText("Risks & Concerns", margin, y, { fontSize: 10, fontStyle: "bold", color: [185, 28, 28] });
  y += 5;
  result.insights.risks.forEach((r, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${r}`, contentWidth - 5);
    addText(lines.join("\n"), margin + 3, y, { fontSize: 9, color: [51, 65, 85] });
    y += lines.length * 4.5 + 2;
  });
  y += 4;

  // Recommendations
  checkPageBreak(40);
  addText("Recommendations", margin, y, { fontSize: 10, fontStyle: "bold", color: [30, 41, 59] });
  y += 5;
  result.insights.recommendations.forEach((rec, i) => {
    const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, contentWidth - 5);
    addText(lines.join("\n"), margin + 3, y, { fontSize: 9, color: [51, 65, 85] });
    y += lines.length * 4.5 + 2;
  });

  // ---- Footer on all pages ----
  const totalPages = (doc.internal as unknown as { getNumberOfPages(): number }).getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const footerY = doc.internal.pageSize.getHeight() - 10;
    doc.setFillColor(241, 245, 249);
    doc.rect(0, footerY - 5, pageWidth, 15, "F");
    addText("UrbanVerse AI — Urban Decision Intelligence Platform", margin, footerY,
      { fontSize: 7, color: [148, 163, 184] });
    addText(`Page ${i} of ${totalPages}`, pageWidth - margin, footerY,
      { fontSize: 7, color: [148, 163, 184], align: "right" });
  }

  // Save
  const fileName = `urbanverse_${result.action}_${result.zoneName.replace(/\s+/g, "_").toLowerCase()}_${Date.now()}.pdf`;
  doc.save(fileName);
}

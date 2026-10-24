"use client";

import React, { useState } from "react";
import WorkspaceNav from "@/components/WorkspaceNav";
import { DEMO_VESSELS, DETAILED_INDIAN_PORTS, compareThreeVessels } from "@/lib/maritime-calculator";
import jsPDF from "jspdf";
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Compass,
  Ship,
  Info,
  Calendar,
} from "lucide-react";

export default function ReportsPage() {
  const [isExporting, setIsExporting] = useState(false);

  const defaultInputs = {
    cargoType: "Thermal Coal",
    cargoQuantityMT: 75000,
    originPortId: "singapore",
    destinationPortId: "paradip",
    laycanDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    fuelPriceUSD: 640,
    usdToInrRate: 83.50,
    portWaitingDays: 3.5,
    selectedTideState: "NORMAL" as const,
  };

  const comparison = compareThreeVessels(defaultInputs);
  const { port, results, recommendedVesselId, executiveRationale } = comparison;
  const recommendedResult = results[recommendedVesselId];
  const reportId = "BSR-EXEC-2026-0941";
  const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

  const handleDownloadPDF = () => {
    setIsExporting(true);
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    // Background top bar
    doc.setFillColor(16, 59, 45); // Forest green #103B2D
    doc.rect(0, 0, pageWidth, 36, "F");

    // Title
    doc.setTextColor(247, 241, 223); // Paper cream #F7F1DF
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("BLUESENTINEL", margin, 16);

    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text("VOYAGE DECISION BRIEF & PORT ENTRY AUDIT", margin, 23);

    doc.setFontSize(7.5);
    doc.setTextColor(216, 168, 60); // Mustard
    doc.text(`REPORT ID: ${reportId} • GENERATED: ${timestamp} IST`, margin, 29);

    let y = 44;

    // Disclaimer Box
    doc.setFillColor(254, 243, 199);
    doc.setDrawColor(245, 158, 11);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 10, 1.5, 1.5, "FD");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(180, 83, 9);
    doc.text(
      "PROTOTYPE DECISION-SUPPORT OUTPUT. ALL SIMULATED VALUES REQUIRE OPERATIONAL VERIFICATION BEFORE USE.",
      margin + 3,
      y + 6.5
    );

    y += 16;

    // Executive Recommendation Banner
    doc.setFillColor(242, 235, 206);
    doc.setDrawColor(16, 59, 45);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 24, 1.5, 1.5, "FD");

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 59, 45);
    doc.text("EXECUTIVE CHARTER RECOMMENDATION", margin + 4, y + 6);

    doc.setFontSize(13);
    doc.setTextColor(242, 75, 42); // Coral
    doc.text(`SELECTED: ${recommendedResult.vessel.name.toUpperCase()}`, margin + 4, y + 13);

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(
      `Landed Cost: $${recommendedResult.costs.totalLandedCostUSD.toLocaleString()} USD | Risk-Adjusted: $${recommendedResult.costs.riskAdjustedCostUSD.toLocaleString()} | UKC Margin: +${recommendedResult.draftMarginM}m`,
      margin + 4,
      y + 19
    );

    y += 30;

    // Voyage Profile
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 59, 45);
    doc.text("1. VOYAGE SUMMARY & PORT DRAFT SPECIFICATION", margin, y);

    y += 5;
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(`• Cargo: ${defaultInputs.cargoQuantityMT.toLocaleString()} MT (${defaultInputs.cargoType})`, margin, y);
    doc.text(`• Target Port: ${port.name} (${port.country})`, margin + 65, y);
    doc.text(`• Origin: Port of Singapore (1,650 NM)`, margin + 130, y);
    y += 4.5;
    doc.text(`• Max Port Draft: ${port.maxPermissibleDraft}m CD`, margin, y);
    doc.text(`• Mandatory UKC: ${port.requiredUKC}m`, margin + 65, y);
    doc.text(`• Fuel Price: $${defaultInputs.fuelPriceUSD}/MT VLSFO`, margin + 130, y);

    y += 9;

    // Table of 3 Candidates
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 59, 45);
    doc.text("2. THREE-VESSEL DETERMINISTIC PERFORMANCE AUDIT", margin, y);

    y += 5;
    doc.setFillColor(16, 59, 45);
    doc.rect(margin, y, pageWidth - margin * 2, 6, "F");
    doc.setTextColor(247, 241, 223);
    doc.setFontSize(7);
    doc.setFont("helvetica", "bold");
    doc.text("METRIC", margin + 3, y + 4.2);
    doc.text("VESSEL A (PANAMAX)", margin + 60, y + 4.2);
    doc.text("VESSEL B (RECOMMENDED)", margin + 110, y + 4.2);
    doc.text("VESSEL C (OLDER SUPRAMAX)", margin + 155, y + 4.2);

    const rows = [
      ["Static Loaded Draft", `${results.vesselA.vessel.loadedDraft} m`, `${results.vesselB.vessel.loadedDraft} m`, `${results.vesselC.vessel.loadedDraft} m`],
      ["Dynamic Arrival Draft", `${results.vesselA.dynamicArrivalDraftM} m`, `${results.vesselB.dynamicArrivalDraftM} m`, `${results.vesselC.dynamicArrivalDraftM} m`],
      ["Channel Allowable Draft", `${results.vesselA.allowablePortDraftM} m`, `${results.vesselB.allowablePortDraftM} m`, `${results.vesselC.allowablePortDraftM} m`],
      ["Draft Compliance Verdict", `BREACH (${results.vesselA.draftMarginM}m)`, `COMPLIANT (+${results.vesselB.draftMarginM}m)`, `COMPLIANT (+${results.vesselC.draftMarginM}m)`],
      ["Base Freight Cost", `$${results.vesselA.costs.baseFreightUSD.toLocaleString()}`, `$${results.vesselB.costs.baseFreightUSD.toLocaleString()}`, `$${results.vesselC.costs.baseFreightUSD.toLocaleString()}`],
      ["Offshore Lightering Penalty", `$${results.vesselA.costs.lighteringPenaltyUSD.toLocaleString()}`, "$0 (Direct Berth)", "$0 (Direct Berth)"],
      ["Total Landed Cost", `$${results.vesselA.costs.totalLandedCostUSD.toLocaleString()}`, `$${results.vesselB.costs.totalLandedCostUSD.toLocaleString()}`, `$${results.vesselC.costs.totalLandedCostUSD.toLocaleString()}`],
      ["TOTAL RISK-ADJUSTED COST", `$${results.vesselA.costs.riskAdjustedCostUSD.toLocaleString()}`, `$${results.vesselB.costs.riskAdjustedCostUSD.toLocaleString()}`, `$${results.vesselC.costs.riskAdjustedCostUSD.toLocaleString()}`],
      ["Estimated CO2 Emissions", `${results.vesselA.estimatedCO2MT} MT`, `${results.vesselB.estimatedCO2MT} MT`, `${results.vesselC.estimatedCO2MT} MT`],
      ["Composite Risk Score", `${results.vesselA.compositeRiskScore} / 100 (${results.vesselA.riskCategory})`, `${results.vesselB.compositeRiskScore} / 100 (${results.vesselB.riskCategory})`, `${results.vesselC.compositeRiskScore} / 100 (${results.vesselC.riskCategory})`],
    ];

    y += 6;
    doc.setFont("helvetica", "normal");
    rows.forEach((r, idx) => {
      const isRiskRow = r[0].includes("RISK-ADJUSTED") || r[0].includes("Verdict");
      if (isRiskRow) {
        doc.setFillColor(242, 235, 206);
        doc.rect(margin, y, pageWidth - margin * 2, 5, "F");
        doc.setFont("helvetica", "bold");
      } else if (idx % 2 === 1) {
        doc.setFillColor(250, 247, 237);
        doc.rect(margin, y, pageWidth - margin * 2, 5, "F");
        doc.setFont("helvetica", "normal");
      } else {
        doc.setFont("helvetica", "normal");
      }

      doc.setTextColor(16, 59, 45);
      doc.setFontSize(6.5);
      doc.text(r[0], margin + 3, y + 3.5);
      doc.text(r[1], margin + 60, y + 3.5);
      doc.text(r[2], margin + 110, y + 3.5);
      doc.text(r[3], margin + 155, y + 3.5);
      y += 5;
    });

    y += 6;

    // BlueAI Evidence Section
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(16, 59, 45);
    doc.text("3. BLUEAI EVIDENCE & REGULATORY AUDIT CITATIONS", margin, y);

    y += 5;
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(
      "• Citation 1: Paradip_Port_Notice_Marine_Circular_2026.pdf, Page 2: Berth 4 max permissible draft strictly capped at 14.20m CD.",
      margin,
      y
    );
    y += 4;
    doc.text(
      "• Citation 2: MV_Sagar_Samrat_Panamax_SpecSheet.pdf, Page 1: Extreme summer laden draft 14.80m breaches Under Keel Clearance by 0.78m.",
      margin,
      y
    );
    y += 4;
    doc.text(
      "• Citation 3: Paradip_Port_Notice_Marine_Circular_2026.pdf, Page 3: Offshore lightering tariff assessed at $9.50/MT plus $35,000 mobilization.",
      margin,
      y
    );

    y += 12;

    // Sign off Block
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, margin + 60, y);
    doc.line(pageWidth - margin - 60, y, pageWidth - margin, y);

    doc.setFontSize(6.5);
    doc.setTextColor(100, 100, 100);
    doc.text("CHARTERING SUPERINTENDENT AUDIT", margin, y + 3.5);
    doc.text("INDIAN PORT CLEARANCE AUTHORITY SEAL", pageWidth - margin - 60, y + 3.5);

    // Save
    doc.save(`BlueSentinel_Decision_Brief_${port.id.toUpperCase()}_${Date.now()}.pdf`);
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      <WorkspaceNav serviceTitle="Executive Decision Reports" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-10 py-10 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-forest/15 dark:border-paper-light/15">
          <div className="space-y-1">
            <span className="text-xs font-mono uppercase tracking-widest text-coral">
              PHASE 8 • EXECUTIVE VOYAGE BRIEF
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight">
              BlueSentinel Voyage Decision Brief
            </h1>
            <p className="text-xs text-forest/70 dark:text-paper-light/70 font-mono">
              REPORT REF: {reportId} • GENERATED: {timestamp}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded border border-forest/20 dark:border-paper-light/20 text-xs font-semibold hover:border-forest flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print View</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isExporting}
              className="px-5 py-2 rounded bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-xs font-bold flex items-center gap-2 shadow-editorial hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
            >
              <Download className="w-3.5 h-3.5 text-coral" />
              <span>{isExporting ? "Generating PDF..." : "Export Official PDF"}</span>
            </button>
          </div>
        </div>

        {/* PROMINENT DISCLAIMER */}
        <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <AlertTriangle className="w-5 h-5 text-mustard shrink-0" />
          <div className="font-semibold leading-relaxed">
            PROTOTYPE DECISION-SUPPORT OUTPUT. ALL SIMULATED VALUES REQUIRE OPERATIONAL VERIFICATION BEFORE USE.
          </div>
        </div>

        {/* DOCUMENT PREVIEW CONTAINER */}
        <div className="p-8 sm:p-12 rounded-xl bg-paper-surface/60 dark:bg-paper-dark-surface/40 border border-forest/20 dark:border-paper-light/20 space-y-8 font-sans print:p-0 print:border-none">
          {/* Header Block */}
          <div className="flex items-center justify-between border-b-2 border-forest/20 dark:border-paper-light/20 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-6 h-6 text-coral" />
                <span className="font-serif font-black text-2xl tracking-tight text-forest dark:text-paper-light">
                  BLUESENTINEL
                </span>
              </div>
              <div className="text-xs uppercase font-mono tracking-widest text-forest/60 dark:text-paper-light/60 mt-1">
                MARITIME DECISION INTELLIGENCE AUDIT
              </div>
            </div>

            <div className="text-right text-xs font-mono text-forest/70 dark:text-paper-light/70 space-y-0.5">
              <div>PORT: {port.name.toUpperCase()}</div>
              <div>CARGO: {defaultInputs.cargoQuantityMT.toLocaleString()} MT</div>
              <div>STATUS: AUDIT VERIFIED</div>
            </div>
          </div>

          {/* Executive Verdict */}
          <div className="p-6 rounded-lg bg-forest text-paper-light dark:bg-paper-light dark:text-forest space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-coral font-bold uppercase">CHARTER RECOMMENDATION</span>
              <span>100% CLEARANCE</span>
            </div>
            <div className="font-serif font-black text-2xl sm:text-3xl">
              Selected: {recommendedResult.vessel.name} ({recommendedResult.vessel.type})
            </div>
            <p className="text-xs opacity-90 leading-relaxed font-normal">
              {executiveRationale}
            </p>
          </div>

          {/* Performance Audit Table */}
          <div className="space-y-3">
            <h2 className="font-serif font-bold text-lg text-forest dark:text-paper-light">
              Candidate Performance Matrix
            </h2>
            <div className="overflow-x-auto border border-forest/15 dark:border-paper-light/15 rounded bg-paper-light dark:bg-paper-dark">
              <table className="w-full text-xs text-left">
                <thead className="bg-paper-surface dark:bg-paper-dark-surface font-serif text-xs border-b border-forest/15 dark:border-paper-light/15">
                  <tr>
                    <th className="p-3">Evaluation Metric</th>
                    <th className="p-3">Vessel A (Panamax)</th>
                    <th className="p-3 bg-forest/5 dark:bg-paper-light/5 font-bold">Vessel B (Recommended)</th>
                    <th className="p-3">Vessel C (Older Supramax)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-forest/10 dark:divide-paper-light/10 font-mono">
                  <tr>
                    <td className="p-3 font-sans font-semibold">Loaded Draft</td>
                    <td className="p-3">{results.vesselA.vessel.loadedDraft} m</td>
                    <td className="p-3 bg-forest/5 dark:bg-paper-light/5 font-bold">{results.vesselB.vessel.loadedDraft} m</td>
                    <td className="p-3">{results.vesselC.vessel.loadedDraft} m</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-semibold">Dynamic Arrival Draft</td>
                    <td className="p-3 text-coral font-bold">{results.vesselA.dynamicArrivalDraftM} m</td>
                    <td className="p-3 bg-forest/5 dark:bg-paper-light/5 font-bold text-forest dark:text-mustard">{results.vesselB.dynamicArrivalDraftM} m</td>
                    <td className="p-3">{results.vesselC.dynamicArrivalDraftM} m</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-semibold">UKC Margin (vs {port.maxPermissibleDraft}m CD)</td>
                    <td className="p-3 text-coral font-bold">FAIL ({results.vesselA.draftMarginM}m)</td>
                    <td className="p-3 bg-forest/5 dark:bg-paper-light/5 font-bold text-forest dark:text-mustard">PASS (+{results.vesselB.draftMarginM}m)</td>
                    <td className="p-3">PASS (+{results.vesselC.draftMarginM}m)</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-semibold">Offshore Lightering</td>
                    <td className="p-3 text-coral font-bold">${results.vesselA.costs.lighteringPenaltyUSD.toLocaleString()}</td>
                    <td className="p-3 bg-forest/5 dark:bg-paper-light/5 font-bold">$0 (Direct Berth)</td>
                    <td className="p-3">$0</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-sans font-semibold">Total Landed Cost</td>
                    <td className="p-3">${results.vesselA.costs.totalLandedCostUSD.toLocaleString()}</td>
                    <td className="p-3 bg-forest/5 dark:bg-paper-light/5 font-bold">${results.vesselB.costs.totalLandedCostUSD.toLocaleString()}</td>
                    <td className="p-3">${results.vesselC.costs.totalLandedCostUSD.toLocaleString()}</td>
                  </tr>
                  <tr className="bg-forest/10 dark:bg-paper-light/10 font-bold">
                    <td className="p-3 font-sans text-forest dark:text-paper-light">RISK-ADJUSTED TOTAL</td>
                    <td className="p-3 text-coral font-black">${results.vesselA.costs.riskAdjustedCostUSD.toLocaleString()}</td>
                    <td className="p-3 bg-forest/20 dark:bg-paper-light/20 text-forest dark:text-paper-light font-black">${results.vesselB.costs.riskAdjustedCostUSD.toLocaleString()}</td>
                    <td className="p-3">${results.vesselC.costs.riskAdjustedCostUSD.toLocaleString()}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* BlueAI Grounded Citations Evidence Box */}
          <div className="space-y-2 pt-2">
            <h2 className="font-serif font-bold text-base text-forest dark:text-paper-light flex items-center gap-1.5">
              <span>Verified Document Citations (RAG Evidence)</span>
            </h2>
            <div className="p-4 rounded bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 text-xs font-mono space-y-1.5 text-forest/75 dark:text-paper-light/75">
              <div>• [Paradip_Port_Notice_Marine_Circular_2026.pdf, Page 2]: Max draft at Berth 4 capped at 14.20m CD.</div>
              <div>• [MV_Sagar_Samrat_Panamax_SpecSheet.pdf, Page 1]: Vessel A laden draft 14.80m breaches fairway safety UKC.</div>
              <div>• [Paradip_Port_Notice_Marine_Circular_2026.pdf, Page 3]: Lightering tariff $9.50/MT + $35,000 mobilization.</div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 border-t border-forest/20 dark:border-paper-light/20 grid grid-cols-2 gap-8 text-xs font-mono text-forest/60 dark:text-paper-light/60">
            <div>
              <div className="border-b border-forest/30 dark:border-paper-light/30 pb-6 mb-1" />
              <span>Nautical Superintendent Authorization</span>
            </div>
            <div>
              <div className="border-b border-forest/30 dark:border-paper-light/30 pb-6 mb-1" />
              <span>Indian Port Clearance Agent Seal</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

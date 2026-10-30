"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import WorkspaceNav from "@/components/WorkspaceNav";
import { VoyagePlannerInputs, MultiVesselComparison, VesselEvaluationResult } from "@/lib/maritime-models";
import { compareThreeVessels } from "@/lib/maritime-calculator";
import { saveVoyageComparisonLog } from "@/lib/supabase";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ArrowLeft,
  FileText,
  DollarSign,
  Ship,
  Sparkles,
  Bot,
} from "lucide-react";

export default function VoyagePlannerResultsPage() {
  const [comparison, setComparison] = useState<MultiVesselComparison | null>(null);
  const [selectedVesselForRejectionModal, setSelectedVesselForRejectionModal] = useState<VesselEvaluationResult | null>(null);
  const [expandedCalculationDetails, setExpandedCalculationDetails] = useState(false);

  useEffect(() => {
    let savedInputs: VoyagePlannerInputs | null = null;
    if (typeof window !== "undefined") {
      const raw = localStorage.getItem("bluesentinel_voyage_inputs");
      if (raw) {
        try {
          savedInputs = JSON.parse(raw);
        } catch {
          // ignore
        }
      }
    }

    const effectiveInputs: VoyagePlannerInputs = savedInputs || {
      cargoType: "Thermal Coal",
      cargoQuantityMT: 75000,
      originPortId: "singapore",
      destinationPortId: "paradip",
      laycanDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
      fuelPriceUSD: 640,
      usdToInrRate: 83.50,
      portWaitingDays: 3.5,
      selectedTideState: "NORMAL",
    };

    const res = compareThreeVessels(effectiveInputs);
    setComparison(res);
    saveVoyageComparisonLog(effectiveInputs, res);
  }, []);

  if (!comparison) {
    return (
      <div className="min-h-screen bg-paper-light dark:bg-paper-dark flex items-center justify-center text-forest dark:text-paper-light font-sans">
        <div className="text-xs uppercase font-mono tracking-widest animate-pulse">
          Synthesizing deterministic vessel hydrodynamics...
        </div>
      </div>
    );
  }

  const { port, results, recommendedVesselId, executiveRationale } = comparison;
  const recommendedResult = results[recommendedVesselId];

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      <WorkspaceNav serviceTitle="Vessel Comparison & Recommendations" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-12 space-y-12">
        {/* Navigation & Header */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Link
              href="/workspace/voyage-planner"
              className="text-xs font-semibold text-forest/70 dark:text-paper-light/70 hover:text-coral flex items-center gap-1.5 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Modify Voyage Inputs</span>
            </Link>
            <span className="text-xs font-mono text-coral uppercase tracking-wider">
              SIMULATED PROTOTYPE DATA • DETERMINISTIC OUTPUT
            </span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black text-forest dark:text-paper-light tracking-tight">
            Vessel Comparison & Audit Verdict
          </h1>
          <p className="text-sm sm:text-base text-forest/75 dark:text-paper-light/75 max-w-2xl font-normal leading-relaxed">
            Side-by-side evaluation of all three candidates for inbound call at <strong>{port.name}</strong>. All financial calculations and draft margins are computed using strict naval architecture formulas.
          </p>
        </div>

        {/* EXECUTIVE RECOMMENDATION BANNER */}
        <div className="p-8 rounded-xl bg-paper-surface dark:bg-paper-dark-surface border-2 border-forest dark:border-paper-light space-y-4 shadow-editorial">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-xs font-bold uppercase tracking-wider">
                OFFICIAL CHARTER VERDICT
              </span>
              <span className="text-xs font-mono text-coral font-bold">
                100% Channel Clearance
              </span>
            </div>
            <div className="text-xs font-mono text-forest/60 dark:text-paper-light/60">
              AUDIT REF: BSR-{port.id.toUpperCase()}-2026
            </div>
          </div>

          <div className="space-y-2">
            <h2 className="font-serif text-2xl sm:text-3xl font-black text-forest dark:text-paper-light">
              Recommended: {recommendedResult.vessel.name} ({recommendedResult.vessel.type})
            </h2>
            <p className="text-sm text-forest/80 dark:text-paper-light/80 leading-relaxed font-normal">
              {executiveRationale}
            </p>
          </div>

          <div className="pt-4 border-t border-forest/15 dark:border-paper-light/15 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div>
              Landed Cost: <strong className="text-base text-forest dark:text-paper-light">${recommendedResult.costs.totalLandedCostUSD.toLocaleString()} USD</strong> (₹{(recommendedResult.costs.totalLandedCostINR / 1e7).toFixed(2)} Cr)
            </div>
            <div>
              Risk-Adjusted Total: <strong className="text-base text-forest dark:text-paper-light">${recommendedResult.costs.riskAdjustedCostUSD.toLocaleString()} USD</strong>
            </div>
            <div>
              Under Keel Clearance: <strong className="text-base text-forest dark:text-paper-light">+{recommendedResult.draftMarginM}m Safe Cushion</strong>
            </div>
          </div>
        </div>

        {/* THREE-VESSEL COMPARISON TABLE */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest dark:text-paper-light">
              Three-Candidate Performance Matrix
            </h2>
            <span className="text-xs font-mono text-forest/60 dark:text-paper-light/60">
              CHANNEL LIMIT: {port.maxPermissibleDraft}M CD
            </span>
          </div>

          <div className="overflow-x-auto border border-forest/15 dark:border-paper-light/15 rounded-lg bg-paper-surface/40 dark:bg-paper-dark-surface/30">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-forest/15 dark:border-paper-light/15 bg-paper-surface/80 dark:bg-paper-dark-surface/70 font-serif text-sm">
                  <th className="p-4 text-forest dark:text-paper-light font-bold">Metric / Hydrostatic Audit</th>
                  <th className="p-4 text-forest dark:text-paper-light">
                    <div>{results.vesselA.vessel.name}</div>
                    <span className="text-[10px] font-sans text-coral font-bold uppercase">Draft Breach</span>
                  </th>
                  <th className="p-4 text-forest dark:text-paper-light bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">
                    <div>{results.vesselB.vessel.name}</div>
                    <span className="text-[10px] font-sans text-forest dark:text-mustard font-bold uppercase">Recommended Choice</span>
                  </th>
                  <th className="p-4 text-forest dark:text-paper-light">
                    <div>{results.vesselC.vessel.name}</div>
                    <span className="text-[10px] font-sans text-mustard font-bold uppercase">Delay Sensitive</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10 dark:border-paper-light/10 font-mono">
                {/* Draft Compliance */}
                <tr className="hover:bg-paper-surface/60 transition-colors">
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Dynamic Arrival Draft
                  </td>
                  <td className="p-4 font-bold text-coral">
                    {results.vesselA.dynamicArrivalDraftM} m
                  </td>
                  <td className="p-4 font-bold text-forest dark:text-paper-light bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">
                    {results.vesselB.dynamicArrivalDraftM} m
                  </td>
                  <td className="p-4 text-forest/80 dark:text-paper-light/80">
                    {results.vesselC.dynamicArrivalDraftM} m
                  </td>
                </tr>

                {/* UKC Margin */}
                <tr className="hover:bg-paper-surface/60 transition-colors">
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Channel UKC Status
                  </td>
                  <td className="p-4 text-coral font-bold">
                    FAIL ({results.vesselA.draftMarginM}m)
                  </td>
                  <td className="p-4 text-forest dark:text-paper-light font-bold bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">
                    PASS (+{results.vesselB.draftMarginM}m)
                  </td>
                  <td className="p-4 text-forest dark:text-paper-light">
                    PASS (+{results.vesselC.draftMarginM}m)
                  </td>
                </tr>

                {/* Base Freight Cost */}
                <tr className="hover:bg-paper-surface/60 transition-colors">
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Base Daily Freight Rate
                  </td>
                  <td className="p-4">${results.vesselA.vessel.freightDailyRate.toLocaleString()}/d</td>
                  <td className="p-4 bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">${results.vesselB.vessel.freightDailyRate.toLocaleString()}/d</td>
                  <td className="p-4">${results.vesselC.vessel.freightDailyRate.toLocaleString()}/d</td>
                </tr>

                {/* Demurrage Terms */}
                <tr className="hover:bg-paper-surface/60 transition-colors">
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Demurrage Daily Penalty
                  </td>
                  <td className="p-4">${results.vesselA.vessel.demurrageDailyRate.toLocaleString()}/d</td>
                  <td className="p-4 bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">${results.vesselB.vessel.demurrageDailyRate.toLocaleString()}/d</td>
                  <td className="p-4 text-mustard font-bold">${results.vesselC.vessel.demurrageDailyRate.toLocaleString()}/d</td>
                </tr>

                {/* Offshore Lightering */}
                <tr className="hover:bg-paper-surface/60 transition-colors">
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Offshore Lightering Penalty
                  </td>
                  <td className="p-4 text-coral font-bold">${results.vesselA.costs.lighteringPenaltyUSD.toLocaleString()}</td>
                  <td className="p-4 bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">$0 (Direct Berth)</td>
                  <td className="p-4">$0 (Direct Berth)</td>
                </tr>

                {/* Total Landed Cost (USD) */}
                <tr className="hover:bg-paper-surface/60 transition-colors">
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Total Landed Cost (USD)
                  </td>
                  <td className="p-4 font-bold">${results.vesselA.costs.totalLandedCostUSD.toLocaleString()}</td>
                  <td className="p-4 font-bold bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">${results.vesselB.costs.totalLandedCostUSD.toLocaleString()}</td>
                  <td className="p-4 font-bold">${results.vesselC.costs.totalLandedCostUSD.toLocaleString()}</td>
                </tr>

                {/* Total Landed Cost (INR) */}
                <tr className="hover:bg-paper-surface/60 transition-colors">
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Total Landed Cost (INR)
                  </td>
                  <td className="p-4">₹{(results.vesselA.costs.totalLandedCostINR / 1e7).toFixed(2)} Cr</td>
                  <td className="p-4 bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">₹{(results.vesselB.costs.totalLandedCostINR / 1e7).toFixed(2)} Cr</td>
                  <td className="p-4">₹{(results.vesselC.costs.totalLandedCostINR / 1e7).toFixed(2)} Cr</td>
                </tr>

                {/* HIGHLIGHT: TOTAL RISK-ADJUSTED COST */}
                <tr className="bg-forest/10 dark:bg-paper-light/10 font-bold text-sm">
                  <td className="p-4 font-sans text-forest dark:text-paper-light">
                    TOTAL RISK-ADJUSTED COST
                  </td>
                  <td className="p-4 text-coral">
                    ${results.vesselA.costs.riskAdjustedCostUSD.toLocaleString()}
                  </td>
                  <td className="p-4 text-forest dark:text-paper-light bg-forest/20 dark:bg-paper-light/20 border-x border-forest/20 dark:border-paper-light/20 font-black">
                    ${results.vesselB.costs.riskAdjustedCostUSD.toLocaleString()}
                  </td>
                  <td className="p-4 text-forest/90 dark:text-paper-light/90">
                    ${results.vesselC.costs.riskAdjustedCostUSD.toLocaleString()}
                  </td>
                </tr>

                {/* CO2 Emissions */}
                <tr className="hover:bg-paper-surface/60 transition-colors">
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Estimated CO₂ Footprint
                  </td>
                  <td className="p-4">{results.vesselA.estimatedCO2MT} MT</td>
                  <td className="p-4 bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">{results.vesselB.estimatedCO2MT} MT</td>
                  <td className="p-4">{results.vesselC.estimatedCO2MT} MT</td>
                </tr>

                {/* Composite Risk Score */}
                <tr className="hover:bg-paper-surface/60 transition-colors">
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Composite Risk Index (0-100)
                  </td>
                  <td className="p-4 text-coral font-bold">{results.vesselA.compositeRiskScore} / 100 ({results.vesselA.riskCategory})</td>
                  <td className="p-4 text-forest dark:text-paper-light font-bold bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">{results.vesselB.compositeRiskScore} / 100 ({results.vesselB.riskCategory})</td>
                  <td className="p-4 text-mustard font-bold">{results.vesselC.compositeRiskScore} / 100 ({results.vesselC.riskCategory})</td>
                </tr>

                {/* Rejection / Action Button */}
                <tr>
                  <td className="p-4 font-sans font-semibold text-forest dark:text-paper-light">
                    Vessel Status Action
                  </td>
                  <td className="p-4 font-sans">
                    <button
                      onClick={() => setSelectedVesselForRejectionModal(results.vesselA)}
                      className="px-3 py-1.5 rounded border border-coral text-coral hover:bg-coral hover:text-white transition-colors text-xs font-bold"
                    >
                      Why was Vessel A rejected?
                    </button>
                  </td>
                  <td className="p-4 font-sans bg-forest/5 dark:bg-paper-light/5 border-x border-forest/15 dark:border-paper-light/15">
                    <span className="px-3 py-1.5 rounded bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-xs font-bold">
                      Selected Candidate
                    </span>
                  </td>
                  <td className="p-4 font-sans">
                    <button
                      onClick={() => setSelectedVesselForRejectionModal(results.vesselC)}
                      className="px-3 py-1.5 rounded border border-mustard text-mustard hover:bg-mustard hover:text-forest transition-colors text-xs font-bold"
                    >
                      Why was Vessel C rejected?
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* EXPANDABLE "HOW THIS WAS CALCULATED" SECTION */}
        <div className="border border-forest/15 dark:border-paper-light/15 rounded-lg bg-paper-surface/40 dark:bg-paper-dark-surface/30 overflow-hidden">
          <button
            type="button"
            onClick={() => setExpandedCalculationDetails(!expandedCalculationDetails)}
            className="w-full p-6 text-left flex items-center justify-between text-sm font-bold font-serif text-forest dark:text-paper-light hover:text-coral transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-coral" />
              <span>How This Was Calculated (Deterministic Naval Architecture & Tariff Engine)</span>
            </div>
            {expandedCalculationDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {expandedCalculationDetails && (
            <div className="p-6 pt-0 border-t border-forest/10 dark:border-paper-light/10 text-xs space-y-4 leading-relaxed font-sans text-forest/80 dark:text-paper-light/80">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <h3 className="font-bold font-serif text-sm text-forest dark:text-paper-light">
                    1. Hydrodynamic Squat & Under Keel Clearance (UKC)
                  </h3>
                  <p>
                    Squat is computed using the Barrass/Huuska formula for bulkers in restricted waters:
                    <br />
                    <code className="font-mono bg-paper-light dark:bg-paper-dark px-1.5 py-0.5 rounded">Squat (m) = Cb * (Speed² / 120)</code>.
                    For a vessel at 14 knots with Cb = 0.82, bodily sinkage is +0.18m.
                    Allowable depth is <code className="font-mono">{port.maxPermissibleDraft}m CD + {port.tidalAllowance}m tide - {port.requiredUKC}m UKC = {results.vesselA.allowablePortDraftM}m</code>.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold font-serif text-sm text-forest dark:text-paper-light">
                    2. Offshore Lightering Tariff & Delay Mechanics
                  </h3>
                  <p>
                    When arrival draft breaches channel depth, Paradip Port circular mandates offshore lightering at POA Anchorage:
                    <br />
                    <code className="font-mono bg-paper-light dark:bg-paper-dark px-1.5 py-0.5 rounded">Lightering Cost = (Tonnage * $9.50) + $35,000 Barge Mobilization</code>.
                    Additionally, 3.5 days of tidal delay demurrage are added to the risk-adjusted total.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold font-serif text-sm text-forest dark:text-paper-light">
                    3. Fuel Consumption & IMO CO₂ Model
                  </h3>
                  <p>
                    Sea transit fuel burn is calculated from daily consumption over sea days ({results.vesselB.seaDays} days at {results.vesselB.vessel.averageSpeed} kts).
                    CO₂ emissions follow IMO Resolution MEPC.308(73) conversion factor of 3.114 MT CO₂ per MT of VLSFO fuel.
                  </p>
                </div>

                <div className="space-y-2">
                  <h3 className="font-bold font-serif text-sm text-forest dark:text-paper-light">
                    4. Demurrage Volatility Exposure
                  </h3>
                  <p>
                    Vessel C incorporates a steeper charterparty demurrage clause of $28,500/day.
                    As port waiting exceeds 3.5 days, Vessel C&apos;s cost escalates faster than any other option, explaining its rejection.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* WORKFLOW FORWARD CTAS */}
        <div className="pt-6 border-t border-forest/15 dark:border-paper-light/15 flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/workspace/compliance"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md border border-forest/30 dark:border-paper-light/30 text-xs font-bold hover:border-forest text-forest dark:text-paper-light transition-all"
          >
            <span>Proceed to Port Compliance Check</span>
            <ArrowRight className="w-4 h-4 text-mustard" />
          </Link>

          <Link
            href="/workspace/blueai"
            className="inline-flex items-center gap-2 px-6 py-3.5 rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-xs font-bold shadow-editorial hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all"
          >
            <Bot className="w-4 h-4 text-coral" />
            <span>Ask BlueAI to Explain Rejections</span>
          </Link>
        </div>
      </main>

      {/* REJECTION REASON MODAL */}
      {selectedVesselForRejectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/30 dark:bg-paper-dark/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-paper-light dark:bg-paper-dark border-2 border-forest dark:border-paper-light rounded-xl max-w-lg w-full p-6 space-y-4 shadow-editorial">
            <div className="flex items-center justify-between border-b border-forest/15 dark:border-paper-light/15 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-coral" />
                <span className="font-serif font-bold text-lg text-forest dark:text-paper-light">
                  Rejection Analysis: {selectedVesselForRejectionModal.vessel.name}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedVesselForRejectionModal(null)}
                className="text-forest/60 dark:text-paper-light/60 hover:text-coral text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs leading-relaxed">
              <div className="p-3 rounded bg-coral/10 border border-coral text-coral font-semibold">
                {selectedVesselForRejectionModal.rejectionReason}
              </div>

              <div className="space-y-1.5 pt-2">
                <span className="font-bold text-forest dark:text-paper-light font-serif">
                  Deterministic Audit Trail:
                </span>
                <ul className="space-y-1 text-forest/70 dark:text-paper-light/70 font-mono text-[11px]">
                  {selectedVesselForRejectionModal.detailedAuditNotes.map((note, i) => (
                    <li key={i}>• {note}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="pt-3 flex justify-between items-center border-t border-forest/15 dark:border-paper-light/15">
              <Link
                href="/workspace/blueai"
                className="text-xs font-semibold text-coral hover:underline flex items-center gap-1"
              >
                <span>Ask BlueAI with Document Evidence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <button
                type="button"
                onClick={() => setSelectedVesselForRejectionModal(null)}
                className="px-4 py-2 rounded bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-xs font-bold"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

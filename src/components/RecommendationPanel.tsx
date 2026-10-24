"use client";

import React from "react";
import {
  VesselCalculationResult,
  ComparisonVerdict,
  PortData,
} from "../lib/types";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingDown,
  ShieldCheck,
  DollarSign,
  Leaf,
  Anchor,
  Clock,
  ArrowRight,
} from "lucide-react";

interface Props {
  verdict: ComparisonVerdict;
  resultA: VesselCalculationResult;
  resultB: VesselCalculationResult;
  port: PortData;
  onSelectVessel?: (vesselId: "vesselA" | "vesselB") => void;
}

export default function RecommendationPanel({
  verdict,
  resultA,
  resultB,
  port,
}: Props) {
  const isBRecommended = verdict.recommendedVesselId === "vesselB";
  const recResult = isBRecommended ? resultB : resultA;
  const altResult = isBRecommended ? resultA : resultB;
  const costSavings = Math.abs(verdict.costDifferenceUSD);
  const co2Savings = Math.abs(verdict.co2DifferenceMT);

  return (
    <div className="bg-gradient-to-br from-navy-900 via-navy-850 to-navy-900 border border-cyan-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
      {/* Background glowing nautical compass watermark */}
      <div className="absolute -right-10 -bottom-10 opacity-5 pointer-events-none">
        <Anchor className="w-64 h-64 text-cyan-400" />
      </div>

      {/* Top Banner: Formal Recommendation Verdict */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-navy-750">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
                AI Advisory & Deterministic Verdict
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-bold">
                RECOMMENDED CHARTER
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-0.5">
              {recResult.vesselName}
            </h2>
            <p className="text-xs text-slate-400">
              {recResult.vesselType} • {recResult.isDraftCompliant ? "Fully Draft-Compliant at " + port.name : "Conditional"}
            </p>
          </div>
        </div>

        {/* Big Savings Stats */}
        <div className="flex items-center gap-3">
          <div className="bg-navy-950/90 border border-navy-750 rounded-lg px-4 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
              <TrendingDown className="w-3 h-3 text-emerald-400" />
              <span>Risk-Adjusted Savings</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              ${costSavings.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400">vs {altResult.vesselName}</div>
          </div>

          <div className="bg-navy-950/90 border border-navy-750 rounded-lg px-4 py-2 text-right">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center justify-end gap-1">
              <Leaf className="w-3 h-3 text-cyan-400" />
              <span>CO₂ Emissions Avoided</span>
            </div>
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">
              {co2Savings} <span className="text-xs font-normal text-slate-300">MT</span>
            </div>
            <div className="text-[10px] text-slate-400">CII Grade: {recResult.ciiRating}</div>
          </div>
        </div>
      </div>

      {/* Decision Rationale Narrative */}
      <div className="my-4 p-3.5 bg-navy-950/70 border border-navy-800 rounded-lg">
        <div className="flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-amber-300">The Base-Rate Commercial Trap: </strong>
            {verdict.primaryRationale}
          </div>
        </div>
      </div>

      {/* 4 Pillars of Operational Superiority */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Pillar 1: Channel Draft & Grounding Risk */}
        <div className="bg-navy-850/80 border border-navy-750 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-cyan-400" />
              Channel Draft Compliance
            </span>
            {recResult.isDraftCompliant ? (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <CheckCircle2 className="w-3.5 h-3.5" /> Pass
              </span>
            ) : (
              <span className="text-red-400 flex items-center gap-1 text-[11px]">
                <XCircle className="w-3.5 h-3.5" /> Breach
              </span>
            )}
          </div>
          <div className="text-xs text-slate-400">
            Dynamic draft <strong className="text-white font-mono">{recResult.dynamicDraft}m</strong> vs limit <strong className="text-cyan-300 font-mono">{recResult.allowableDraft}m</strong>.
          </div>
          <div className="text-[11px] text-emerald-400 font-medium bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
            Surplus UKC Margin: +{recResult.draftMargin}m safe under-keel clearance.
          </div>
        </div>

        {/* Pillar 2: Offshore Lightering & Transshipment */}
        <div className="bg-navy-850/80 border border-navy-750 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Offshore Lightering Risk
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">$0 Risk</span>
          </div>
          <div className="text-xs text-slate-400">
            Direct channel berthing without compulsory transshipment or double handling.
          </div>
          <div className="text-[11px] text-slate-300 bg-navy-950 p-1.5 rounded border border-navy-800">
            Vessel A incurs <strong className="text-red-400 font-mono">${resultA.lighteringRiskCostUSD.toLocaleString()}</strong> in barge lightering charges.
          </div>
        </div>

        {/* Pillar 3: Port Turnaround & Demurrage */}
        <div className="bg-navy-850/80 border border-navy-750 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              Port Turnaround Exposure
            </span>
            <span className="text-cyan-300 font-mono text-[11px]">
              {recResult.totalVoyageDays} Days
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Guaranteed high-water tidal pilotage slot without waiting for spring tide windows.
          </div>
          <div className="text-[11px] text-slate-300 bg-navy-950 p-1.5 rounded border border-navy-800">
            Avoids 3.5 days of tidal delay demurrage (<strong className="text-amber-400 font-mono">${(3.5 * port.dailyDemurrageRate).toLocaleString()}</strong>).
          </div>
        </div>

        {/* Pillar 4: Decarbonization & Quiet Vessel */}
        <div className="bg-navy-850/80 border border-navy-750 rounded-lg p-3 space-y-1.5">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
              Green Rating & URN
            </span>
            <span className="text-emerald-400 font-mono text-[11px]">
              IMO Tier III
            </span>
          </div>
          <div className="text-xs text-slate-400">
            Mewis duct propulsion with low acoustic signature ({recResult.underwaterNoiseDB} dB).
          </div>
          <div className="text-[11px] text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-500/20">
            Complies with DG Shipping Cetacean & Turtle acoustic corridor guidelines.
          </div>
        </div>
      </div>
    </div>
  );
}

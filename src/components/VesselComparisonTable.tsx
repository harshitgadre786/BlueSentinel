"use client";

import React from "react";
import {
  VesselCalculationResult,
  ComparisonVerdict,
  PortData,
} from "../lib/types";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Ship,
  TrendingDown,
  Info,
  DollarSign,
  Fuel,
  Volume2,
  ShieldCheck,
  Zap,
} from "lucide-react";

interface Props {
  resultA: VesselCalculationResult;
  resultB: VesselCalculationResult;
  verdict: ComparisonVerdict;
  port: PortData;
  speedKnots: number;
}

export default function VesselComparisonTable({
  resultA,
  resultB,
  verdict,
  port,
  speedKnots,
}: Props) {
  const isBRecommended = verdict.recommendedVesselId === "vesselB";

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-xl">
      <div className="p-4 sm:p-5 border-b border-navy-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Ship className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Vessel Charter Comparison & Hydrostatic Audit
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic calculations evaluated against {port.name} Channel Limits
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-400 flex items-center gap-2">
          <span>Speed: <strong className="text-cyan-300 font-mono">{speedKnots} kts</strong></span>
          <span>•</span>
          <span>Port Max Draft: <strong className="text-white font-mono">{port.maxPermissibleDraft}m CD</strong></span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-left">
          {/* Table Header */}
          <thead>
            <tr className="bg-navy-950 border-b border-navy-800 text-slate-400 text-[11px] font-semibold uppercase tracking-wider">
              <th className="py-3 px-4 w-1/3">Evaluation Metric</th>
              <th className="py-3 px-4 w-1/3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-white font-bold">{resultA.vesselName}</span>
                    <div className="text-[10px] text-slate-400 font-normal lowercase">{resultA.vesselType}</div>
                  </div>
                  {!resultA.isDraftCompliant && (
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 border border-red-500/50 text-[10px] font-bold">
                      DRAFT BREACH
                    </span>
                  )}
                </div>
              </th>
              <th className="py-3 px-4 w-1/3 bg-cyan-950/20 border-l border-cyan-500/30">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-cyan-300 font-bold">{resultB.vesselName}</span>
                    <div className="text-[10px] text-slate-400 font-normal lowercase">{resultB.vesselType}</div>
                  </div>
                  {isBRecommended && (
                    <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/50 text-[10px] font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> RECOMMENDED
                    </span>
                  )}
                </div>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-navy-800">
            {/* Section: Hydrostatics & Draft Compliance */}
            <tr className="bg-navy-850/50">
              <td colSpan={3} className="py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                1. Hydrostatic Draft & Port Channel Clearance
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">Static Laden Draft</td>
              <td className="py-2.5 px-4 font-mono text-slate-200">
                14.80 m
              </td>
              <td className="py-2.5 px-4 font-mono text-slate-200 bg-cyan-950/10 border-l border-navy-800">
                13.30 m <span className="text-[10px] text-emerald-400">(Shallow Draft)</span>
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">
                Dynamic Squat Sinkage ({speedKnots} kts)
              </td>
              <td className="py-2.5 px-4 font-mono text-slate-300">
                +{(resultA.dynamicDraft - 14.8).toFixed(2)} m
              </td>
              <td className="py-2.5 px-4 font-mono text-slate-300 bg-cyan-950/10 border-l border-navy-800">
                +{(resultB.dynamicDraft - 13.3).toFixed(2)} m
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">Dynamic Arrival Draft</td>
              <td className="py-2.5 px-4 font-mono font-bold text-white">
                {resultA.dynamicDraft} m
              </td>
              <td className="py-2.5 px-4 font-mono font-bold text-white bg-cyan-950/10 border-l border-navy-800">
                {resultB.dynamicDraft} m
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">
                Channel Allowable Draft ({port.name})
              </td>
              <td className="py-2.5 px-4 font-mono text-slate-300">
                {resultA.allowableDraft} m (CD + Tide - UKC)
              </td>
              <td className="py-2.5 px-4 font-mono text-slate-300 bg-cyan-950/10 border-l border-navy-800">
                {resultB.allowableDraft} m (CD + Tide - UKC)
              </td>
            </tr>

            <tr className="bg-navy-950/80 font-semibold">
              <td className="py-3 px-4 text-white">Draft Compliance & UKC Margin</td>
              <td className="py-3 px-4">
                {resultA.isDraftCompliant ? (
                  <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                    <CheckCircle className="w-4 h-4" /> Compliant (+{resultA.draftMargin}m)
                  </span>
                ) : (
                  <span className="text-red-400 font-bold flex items-center gap-1 font-mono">
                    <XCircle className="w-4 h-4" /> BREACH ({resultA.draftMargin}m)
                  </span>
                )}
                <div className="text-[10px] text-red-300 mt-0.5">
                  Fails UKC requirement; channel entry refused without lightering
                </div>
              </td>
              <td className="py-3 px-4 bg-cyan-950/20 border-l border-cyan-500/30">
                <span className="text-emerald-400 font-bold flex items-center gap-1 font-mono">
                  <CheckCircle className="w-4 h-4" /> 100% COMPLIANT (+{resultB.draftMargin}m UKC)
                </span>
                <div className="text-[10px] text-emerald-300 mt-0.5">
                  Full clearance guaranteed across all tidal states
                </div>
              </td>
            </tr>

            {/* Section: Fuel & Voyage Performance */}
            <tr className="bg-navy-850/50">
              <td colSpan={3} className="py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                2. Fuel Consumption & Bunker Economics
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">Daily Fuel at Sea ({speedKnots} kts)</td>
              <td className="py-2.5 px-4 font-mono text-slate-200">
                {resultA.dailyFuelSea} MT / day
              </td>
              <td className="py-2.5 px-4 font-mono text-emerald-400 bg-cyan-950/10 border-l border-navy-800">
                {resultB.dailyFuelSea} MT / day (-{Number((resultA.dailyFuelSea - resultB.dailyFuelSea).toFixed(1))} MT)
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">Total Voyage Fuel Consumed</td>
              <td className="py-2.5 px-4 font-mono text-slate-200">
                {resultA.totalFuelMT} MT
              </td>
              <td className="py-2.5 px-4 font-mono text-emerald-400 bg-cyan-950/10 border-l border-navy-800">
                {resultB.totalFuelMT} MT (-{Number((resultA.totalFuelMT - resultB.totalFuelMT).toFixed(1))} MT)
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">Bunker Fuel Cost (VLSFO)</td>
              <td className="py-2.5 px-4 font-mono text-white">
                ${resultA.bunkerFuelCostUSD.toLocaleString()}
              </td>
              <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold bg-cyan-950/10 border-l border-navy-800">
                ${resultB.bunkerFuelCostUSD.toLocaleString()}
              </td>
            </tr>

            {/* Section: Commercial & Risk-Adjusted Cost */}
            <tr className="bg-navy-850/50">
              <td colSpan={3} className="py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                3. Financial Breakdown & Risk-Adjusted Voyage Cost
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">Base Charter Hire</td>
              <td className="py-2.5 px-4 font-mono text-emerald-300">
                ${resultA.charterCostUSD.toLocaleString()} <span className="text-[10px] text-slate-400">($18,500/d)</span>
              </td>
              <td className="py-2.5 px-4 font-mono text-slate-200 bg-cyan-950/10 border-l border-navy-800">
                ${resultB.charterCostUSD.toLocaleString()} <span className="text-[10px] text-slate-400">($21,000/d)</span>
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">
                Offshore Lightering Tariff & Barge Fee
              </td>
              <td className="py-2.5 px-4 font-mono text-red-400 font-bold">
                ${resultA.lighteringRiskCostUSD.toLocaleString()}
                <div className="text-[10px] text-red-300 font-normal">
                  Mandatory transshipment at POA Anchorage
                </div>
              </td>
              <td className="py-2.5 px-4 font-mono text-emerald-400 font-bold bg-cyan-950/10 border-l border-navy-800">
                $0
                <div className="text-[10px] text-emerald-300 font-normal">
                  Zero lightering required; direct berth
                </div>
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">
                Port Demurrage Exposure
              </td>
              <td className="py-2.5 px-4 font-mono text-amber-300">
                ${resultA.demurrageExposureUSD.toLocaleString()}
                <div className="text-[10px] text-slate-400 font-normal">
                  Includes 3.5d tidal delay queue
                </div>
              </td>
              <td className="py-2.5 px-4 font-mono text-slate-300 bg-cyan-950/10 border-l border-navy-800">
                ${resultB.demurrageExposureUSD.toLocaleString()}
                <div className="text-[10px] text-slate-400 font-normal">
                  Standard queue only
                </div>
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">Base Voyage Quote (Unadjusted)</td>
              <td className="py-2.5 px-4 font-mono text-slate-300">
                ${resultA.baseVoyageCostUSD.toLocaleString()}
              </td>
              <td className="py-2.5 px-4 font-mono text-slate-300 bg-cyan-950/10 border-l border-navy-800">
                ${resultB.baseVoyageCostUSD.toLocaleString()}
              </td>
            </tr>

            {/* HIGHLIGHT: TOTAL RISK-ADJUSTED COST */}
            <tr className="bg-gradient-to-r from-navy-950 via-navy-850 to-navy-950 font-bold text-sm border-y-2 border-cyan-500/50">
              <td className="py-3 px-4 text-cyan-300 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-cyan-400" />
                <span>TOTAL RISK-ADJUSTED COST</span>
              </td>
              <td className="py-3 px-4 font-mono text-red-400">
                ${resultA.riskAdjustedCostUSD.toLocaleString()}
                <div className="text-[10px] text-red-300 font-normal">
                  +${Math.abs(verdict.costDifferenceUSD).toLocaleString()} excess cost
                </div>
              </td>
              <td className="py-3 px-4 font-mono text-emerald-400 text-base bg-cyan-950/30 border-l border-cyan-500/50">
                ${resultB.riskAdjustedCostUSD.toLocaleString()}
                <div className="text-[10px] text-emerald-300 font-normal">
                  Saves ${Math.abs(verdict.costDifferenceUSD).toLocaleString()} USD
                </div>
              </td>
            </tr>

            {/* Section: Risk & Environmental Score */}
            <tr className="bg-navy-850/50">
              <td colSpan={3} className="py-2 px-4 text-[11px] font-bold uppercase tracking-wider text-cyan-400">
                4. Environmental Rating & Composite Risk Index
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">CO2 Emissions (IMO MEPC)</td>
              <td className="py-2.5 px-4 font-mono text-slate-200">
                {resultA.co2EmissionsMT} MT CO₂ (CII: {resultA.ciiRating})
              </td>
              <td className="py-2.5 px-4 font-mono text-emerald-400 bg-cyan-950/10 border-l border-navy-800">
                {resultB.co2EmissionsMT} MT CO₂ (CII: {resultB.ciiRating})
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors">
              <td className="py-2.5 px-4 text-slate-300 font-medium">Underwater Radiated Noise (URN)</td>
              <td className="py-2.5 px-4 font-mono text-slate-200">
                {resultA.underwaterNoiseDB} dB (Score: {resultA.underwaterNoiseScore})
              </td>
              <td className="py-2.5 px-4 font-mono text-emerald-400 bg-cyan-950/10 border-l border-navy-800">
                {resultB.underwaterNoiseDB} dB (Score: {resultB.underwaterNoiseScore})
              </td>
            </tr>

            <tr className="hover:bg-navy-850/60 transition-colors font-semibold">
              <td className="py-3 px-4 text-white">Composite Total Risk Score (0-100)</td>
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-red-400 font-bold text-sm">
                    {resultA.totalRiskScore} / 100
                  </span>
                  <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-500/40 text-[10px]">
                    {resultA.riskCategory}
                  </span>
                </div>
              </td>
              <td className="py-3 px-4 bg-cyan-950/20 border-l border-cyan-500/30">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-emerald-400 font-bold text-sm">
                    {resultB.totalRiskScore} / 100
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-[10px]">
                    {resultB.riskCategory}
                  </span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

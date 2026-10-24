"use client";

import React from "react";
import {
  SimulationInputs,
  PortData,
  VesselCalculationResult,
  ComparisonVerdict,
} from "../lib/types";
import { generateExecutiveReportPDF } from "../lib/report-generator";
import {
  FileText,
  Download,
  Printer,
  ShieldCheck,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Anchor,
  Compass,
} from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  inputs: SimulationInputs;
  port: PortData;
  resultA: VesselCalculationResult;
  resultB: VesselCalculationResult;
  verdict: ComparisonVerdict;
}

export default function ExecutiveReportModal({
  isOpen,
  onClose,
  inputs,
  port,
  resultA,
  resultB,
  verdict,
}: Props) {
  if (!isOpen) return null;

  const isB = verdict.recommendedVesselId === "vesselB";
  const recResult = isB ? resultB : resultA;
  const savingUSD = Math.abs(verdict.costDifferenceUSD);
  const co2Saving = Math.abs(verdict.co2DifferenceMT);

  const handleDownloadPDF = () => {
    generateExecutiveReportPDF(inputs, port, resultA, resultB, verdict);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-navy-900 border border-navy-750 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Top Action Bar */}
        <div className="px-6 py-4 bg-navy-850 border-b border-navy-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Executive Decision Audit Brief
              </h2>
              <p className="text-xs text-slate-400">
                Official Chartering & Port Call Memorandum for Indian Harbours
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700 flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-4 h-4 text-slate-400" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              className="px-4 py-1.5 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-navy-950 flex items-center gap-1.5 shadow-glow transition-all active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-navy-750 transition-colors ml-2"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Document Body (Printable & Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white text-slate-900 font-sans print:p-0">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Compass className="w-6 h-6 text-cyan-600" />
                <span className="text-2xl font-black tracking-tight text-slate-950">
                  BLUESENTINEL
                </span>
              </div>
              <div className="text-xs font-bold text-cyan-700 tracking-wider uppercase mt-0.5">
                Maritime Port Call Decision & Regulatory Compliance Audit
              </div>
            </div>

            <div className="text-right text-xs text-slate-600 font-mono">
              <div>REF: BSR-{Math.floor(100000 + Math.random() * 900000)}</div>
              <div>DATE: {new Date().toISOString().slice(0, 10)}</div>
              <div>PORT: {port.name.toUpperCase()}</div>
            </div>
          </div>

          {/* Prototype Notice in Report */}
          <div className="p-2.5 rounded bg-amber-50 border border-amber-300 text-amber-900 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <div>
              <strong>ADVISORY MEMORANDUM: </strong>
              All values represent simulated prototype data calibrated for maritime decision testing. All hydrostatic and financial calculations are derived deterministically.
            </div>
          </div>

          {/* Executive Verdict Box */}
          <div className="p-4 rounded-xl bg-slate-900 text-white space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold tracking-widest uppercase text-emerald-400">
                RECOMMENDED CHARTER VESSEL
              </span>
              <span className="text-xs font-mono text-cyan-300">
                100% Channel Clearance
              </span>
            </div>
            <div className="text-2xl font-black text-white">
              {recResult.vesselName} ({recResult.vesselType})
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {verdict.primaryRationale}
            </p>
            <div className="pt-2 border-t border-slate-800 flex flex-wrap gap-4 text-xs font-mono">
              <span className="text-emerald-400">
                Net Risk-Adjusted Advantage: <strong>${savingUSD.toLocaleString()} USD</strong>
              </span>
              <span className="text-cyan-300">
                Carbon Avoidance: <strong>{co2Saving} MT CO₂</strong>
              </span>
              <span className="text-slate-300">
                Safe UKC Clearance: <strong>+{recResult.draftMargin}m</strong>
              </span>
            </div>
          </div>

          {/* Voyage Parameters */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              1. Voyage Profile & Port Bathymetry
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs">
              <div>
                <span className="text-slate-500">Origin Port:</span>{" "}
                <strong className="text-slate-800">{inputs.originId.toUpperCase()}</strong>
              </div>
              <div>
                <span className="text-slate-500">Destination:</span>{" "}
                <strong className="text-slate-800">{port.name}</strong>
              </div>
              <div>
                <span className="text-slate-500">Cargo:</span>{" "}
                <strong className="text-slate-800">{inputs.cargoTonnage.toLocaleString()} MT ({inputs.cargoType})</strong>
              </div>
              <div>
                <span className="text-slate-500">Sailing Speed:</span>{" "}
                <strong className="text-slate-800 font-mono">{inputs.speedKnots} knots</strong>
              </div>
              <div>
                <span className="text-slate-500">Voyage Distance:</span>{" "}
                <strong className="text-slate-800 font-mono">{resultA.voyageDistanceNM} NM</strong>
              </div>
              <div>
                <span className="text-slate-500">Bunker Rate:</span>{" "}
                <strong className="text-slate-800 font-mono">${inputs.fuelCostPerTonne}/MT VLSFO</strong>
              </div>
              <div>
                <span className="text-slate-500">Max Port Draft:</span>{" "}
                <strong className="text-slate-800 font-mono">{port.maxPermissibleDraft}m CD</strong>
              </div>
              <div>
                <span className="text-slate-500">Mandatory UKC:</span>{" "}
                <strong className="text-slate-800 font-mono">{port.requiredUKC}m</strong>
              </div>
              <div>
                <span className="text-slate-500">Daily Demurrage:</span>{" "}
                <strong className="text-slate-800 font-mono">${port.dailyDemurrageRate.toLocaleString()}/day</strong>
              </div>
            </div>
          </div>

          {/* Deterministic Comparison Table */}
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              2. Deterministic Hydrostatic & Financial Audit
            </h3>
            <table className="w-full text-xs text-left border border-slate-200">
              <thead className="bg-slate-100 border-b border-slate-200 text-slate-700 font-bold">
                <tr>
                  <th className="py-2 px-3">Evaluation Parameter</th>
                  <th className="py-2 px-3">Vessel A (MV Sagar Samrat)</th>
                  <th className="py-2 px-3 bg-emerald-50 text-emerald-900">Vessel B (MV Nilgiri Green)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="py-1.5 px-3 font-medium">Static Laden Draft</td>
                  <td className="py-1.5 px-3 font-mono">14.80 m</td>
                  <td className="py-1.5 px-3 font-mono bg-emerald-50/50">13.30 m</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">Dynamic Squat (at {inputs.speedKnots} kts)</td>
                  <td className="py-1.5 px-3 font-mono">+{(resultA.dynamicDraft - 14.8).toFixed(2)} m</td>
                  <td className="py-1.5 px-3 font-mono bg-emerald-50/50">+{(resultB.dynamicDraft - 13.3).toFixed(2)} m</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">Dynamic Arrival Draft</td>
                  <td className="py-1.5 px-3 font-mono font-bold text-red-600">{resultA.dynamicDraft} m</td>
                  <td className="py-1.5 px-3 font-mono font-bold text-emerald-700 bg-emerald-50/50">{resultB.dynamicDraft} m</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">Channel Allowable Draft</td>
                  <td className="py-1.5 px-3 font-mono">{resultA.allowableDraft} m</td>
                  <td className="py-1.5 px-3 font-mono bg-emerald-50/50">{resultB.allowableDraft} m</td>
                </tr>
                <tr className="font-semibold bg-slate-50">
                  <td className="py-1.5 px-3">Draft Compliance Verdict</td>
                  <td className="py-1.5 px-3 text-red-600 font-mono">NON-COMPLIANT ({resultA.draftMargin}m)</td>
                  <td className="py-1.5 px-3 text-emerald-700 font-mono bg-emerald-50">COMPLIANT (+{resultB.draftMargin}m)</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">Total Fuel Consumed</td>
                  <td className="py-1.5 px-3 font-mono">{resultA.totalFuelMT} MT</td>
                  <td className="py-1.5 px-3 font-mono bg-emerald-50/50">{resultB.totalFuelMT} MT</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">Bunker Fuel Cost</td>
                  <td className="py-1.5 px-3 font-mono">${resultA.bunkerFuelCostUSD.toLocaleString()}</td>
                  <td className="py-1.5 px-3 font-mono bg-emerald-50/50">${resultB.bunkerFuelCostUSD.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">Offshore Lightering Tariff</td>
                  <td className="py-1.5 px-3 font-mono text-red-600 font-bold">${resultA.lighteringRiskCostUSD.toLocaleString()}</td>
                  <td className="py-1.5 px-3 font-mono text-emerald-700 font-bold bg-emerald-50/50">$0</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">Port Demurrage Exposure</td>
                  <td className="py-1.5 px-3 font-mono">${resultA.demurrageExposureUSD.toLocaleString()}</td>
                  <td className="py-1.5 px-3 font-mono bg-emerald-50/50">${resultB.demurrageExposureUSD.toLocaleString()}</td>
                </tr>
                <tr className="bg-slate-100 font-bold text-sm">
                  <td className="py-2 px-3">TOTAL RISK-ADJUSTED COST</td>
                  <td className="py-2 px-3 font-mono text-red-600">${resultA.riskAdjustedCostUSD.toLocaleString()}</td>
                  <td className="py-2 px-3 font-mono text-emerald-700 bg-emerald-100">${resultB.riskAdjustedCostUSD.toLocaleString()}</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">Composite Risk Score (0-100)</td>
                  <td className="py-1.5 px-3 font-mono">{resultA.totalRiskScore} / 100 ({resultA.riskCategory})</td>
                  <td className="py-1.5 px-3 font-mono bg-emerald-50/50">{resultB.totalRiskScore} / 100 ({resultB.riskCategory})</td>
                </tr>
                <tr>
                  <td className="py-1.5 px-3 font-medium">Underwater Noise (URN)</td>
                  <td className="py-1.5 px-3 font-mono">{resultA.underwaterNoiseDB} dB</td>
                  <td className="py-1.5 px-3 font-mono bg-emerald-50/50">{resultB.underwaterNoiseDB} dB (SILENT-E)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Sign-off Seal */}
          <div className="pt-6 border-t border-slate-300 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <div className="font-bold text-slate-900">FLEET COMMERCIAL DESK</div>
              <div className="mt-8 border-t border-slate-400 pt-1">
                Authorized Nautical Superintendent Signature
              </div>
            </div>
            <div>
              <div className="font-bold text-slate-900">INDIAN PORT AGENT AUDIT</div>
              <div className="mt-8 border-t border-slate-400 pt-1">
                Berth Allocation & Draft Pilotage Clearance Seal
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

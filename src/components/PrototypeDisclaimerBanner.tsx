"use client";

import React from "react";
import { AlertTriangle, Sparkles, ShieldCheck } from "lucide-react";

interface Props {
  onLoadDemoScenario: () => void;
  isDemoActive: boolean;
}

export default function PrototypeDisclaimerBanner({
  onLoadDemoScenario,
  isDemoActive,
}: Props) {
  return (
    <div className="bg-gradient-to-r from-amber-500/10 via-navy-850 to-cyan-950/40 border-y border-amber-500/30 px-4 py-2.5 text-xs">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 text-amber-200">
          <div className="p-1 rounded bg-amber-500/20 text-amber-400 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="font-semibold text-amber-300">
              SIMULATED PROTOTYPE DATA:
            </span>{" "}
            All hydrodynamic squat values, bunker rates, and port clearance metrics are
            calibrated for decision-support testing. Hydrostatic equations are
            deterministic.
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onLoadDemoScenario}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-medium text-xs transition-all ${
              isDemoActive
                ? "bg-cyan-500 text-navy-950 font-semibold shadow-glow"
                : "bg-navy-800 hover:bg-navy-700 text-cyan-300 border border-cyan-500/40"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>
              {isDemoActive ? "Active: Draft & Demurrage Demo" : "Load High-Stakes Demo Scenario"}
            </span>
          </button>
          <div className="hidden lg:flex items-center gap-1 text-slate-400 border-l border-navy-700 pl-3">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>IMO MEPC.308 / UKC Compliant</span>
          </div>
        </div>
      </div>
    </div>
  );
}

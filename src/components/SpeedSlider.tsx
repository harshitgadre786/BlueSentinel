"use client";

import React from "react";
import {
  Gauge,
  Clock,
  Fuel,
  Cloud,
  Volume2,
  AlertTriangle,
  Zap,
  Leaf,
  ShieldAlert,
} from "lucide-react";
import { VesselCalculationResult } from "../lib/types";

interface Props {
  speedKnots: number;
  onSpeedChange: (speed: number) => void;
  resultA: VesselCalculationResult;
  resultB: VesselCalculationResult;
}

export default function SpeedSlider({
  speedKnots,
  onSpeedChange,
  resultA,
  resultB,
}: Props) {
  // Speed presets
  const presets = [
    { label: "Eco-Steaming", speed: 11.5, badge: "Low URN / Cetacean Safe" },
    { label: "Normal Service", speed: 13.5, badge: "Balanced" },
    { label: "High Speed", speed: 16.0, badge: "High Consumption" },
  ];

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <Gauge className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Dynamic Speed Governor & Real-Time Hydrodynamics
            </h2>
            <p className="text-xs text-slate-400">
              Cubic Admiralty fuel law, squat sinkage, and underwater acoustic radiation model
            </p>
          </div>
        </div>

        {/* Preset quick buttons */}
        <div className="flex items-center gap-2">
          {presets.map((preset) => (
            <button
              key={preset.label}
              onClick={() => onSpeedChange(preset.speed)}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                Math.abs(speedKnots - preset.speed) < 0.2
                  ? "bg-cyan-500 text-navy-950 font-bold border-cyan-400 shadow-glow"
                  : "bg-navy-850 hover:bg-navy-800 text-slate-300 border-navy-700"
              }`}
            >
              {preset.label} ({preset.speed} kts)
            </button>
          ))}
        </div>
      </div>

      {/* Main Slider Row */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-slate-400">10.0 kts (Min Steerage)</span>
          <div className="flex items-center gap-2 px-3 py-1 bg-navy-850 rounded-lg border border-cyan-500/40">
            <span className="text-slate-400 font-normal">Active Speed:</span>
            <span className="text-cyan-400 text-base font-extrabold font-mono">
              {speedKnots.toFixed(1)}
            </span>
            <span className="text-slate-300 font-normal">knots</span>
          </div>
          <span className="text-slate-400">18.0 kts (Max Rating)</span>
        </div>

        <div className="relative">
          <input
            type="range"
            min={10.0}
            max={18.0}
            step={0.1}
            value={speedKnots}
            onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
            className="w-full h-2.5 bg-navy-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 focus:outline-none"
          />
          <div
            className="absolute top-0 h-2.5 bg-gradient-to-r from-emerald-500 via-cyan-400 to-amber-500 rounded-lg pointer-events-none opacity-40"
            style={{ width: `${((speedKnots - 10) / 8) * 100}%` }}
          />
        </div>

        {/* Real-time calculated indicators based on active speed */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          {/* ETA & Sea Days */}
          <div className="bg-navy-850/90 border border-navy-750 rounded-lg p-3">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                Transit & ETA
              </span>
              <span className="font-mono text-cyan-300 font-semibold">{resultB.seaDays} Sea Days</span>
            </div>
            <div className="text-sm font-bold text-white font-mono">
              {new Date(resultB.etaDate).toLocaleDateString("en-IN", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Includes {resultB.totalVoyageDays - resultB.seaDays}d port wait
            </div>
          </div>

          {/* Fuel & Bunker Cost */}
          <div className="bg-navy-850/90 border border-navy-750 rounded-lg p-3">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1">
                <Fuel className="w-3.5 h-3.5 text-amber-400" />
                Fuel (Vessel B vs A)
              </span>
              <span className="text-emerald-400 font-bold font-mono">
                -{Number((resultA.totalFuelMT - resultB.totalFuelMT).toFixed(1))} MT
              </span>
            </div>
            <div className="text-sm font-bold text-white font-mono">
              ${resultB.bunkerFuelCostUSD.toLocaleString()}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Vessel A: ${resultA.bunkerFuelCostUSD.toLocaleString()} ({resultA.totalFuelMT} MT)
            </div>
          </div>

          {/* CO2 Emissions */}
          <div className="bg-navy-850/90 border border-navy-750 rounded-lg p-3">
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1">
                <Cloud className="w-3.5 h-3.5 text-emerald-400" />
                Carbon Footprint
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                CII: {resultB.ciiRating}
              </span>
            </div>
            <div className="text-sm font-bold text-emerald-400 font-mono">
              {resultB.co2EmissionsMT} MT CO₂
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Avoids {Number((resultA.co2EmissionsMT - resultB.co2EmissionsMT).toFixed(1))} MT CO2 vs A
            </div>
          </div>

          {/* Underwater Radiated Noise (URN) */}
          <div
            className={`border rounded-lg p-3 transition-colors ${
              resultB.marineSanctuaryCaution
                ? "bg-amber-950/20 border-amber-500/40"
                : "bg-navy-850/90 border-navy-750"
            }`}
          >
            <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
              <span className="flex items-center gap-1">
                <Volume2
                  className={`w-3.5 h-3.5 ${
                    resultB.marineSanctuaryCaution ? "text-amber-400" : "text-cyan-400"
                  }`}
                />
                Underwater Noise (URN)
              </span>
              <span
                className={`font-mono text-xs font-bold ${
                  resultB.marineSanctuaryCaution ? "text-amber-400" : "text-cyan-300"
                }`}
              >
                {resultB.underwaterNoiseScore}/100
              </span>
            </div>
            <div className="text-sm font-bold text-white font-mono flex items-center justify-between">
              <span>{resultB.underwaterNoiseDB} dB</span>
              {resultB.marineSanctuaryCaution ? (
                <span className="text-[10px] font-semibold text-amber-300 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-amber-400 shrink-0" />
                  Whale Corridor Caution
                </span>
              ) : (
                <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
                  <Leaf className="w-3 h-3 text-emerald-400 shrink-0" />
                  Eco-Speed Compliant (≤11.5 kts)
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              {resultB.marineSanctuaryCaution
                ? "Demo eco-speed threshold: 11.5 knots in prototype sensitivity zone"
                : "Cavitation noise within demo eco-speed threshold (Prototype scenario data)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

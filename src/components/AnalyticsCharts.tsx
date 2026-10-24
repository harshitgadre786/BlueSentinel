"use client";

import React, { useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  VesselCalculationResult,
  VesselOption,
  SimulationInputs,
  PortData,
} from "../lib/types";
import {
  generateSpeedSensitivityCurve,
  DEFAULT_VESSEL_A,
  DEFAULT_VESSEL_B,
} from "../lib/maritime-engine";
import {
  BarChart3,
  TrendingUp,
  Volume2,
  ShieldAlert,
  Fuel,
} from "lucide-react";

interface Props {
  resultA: VesselCalculationResult;
  resultB: VesselCalculationResult;
  inputs: SimulationInputs;
  port: PortData;
  speedKnots: number;
}

export default function AnalyticsCharts({
  resultA,
  resultB,
  inputs,
  port,
  speedKnots,
}: Props) {
  const [activeTab, setActiveTab] = useState<"cost" | "speed" | "risk" | "noise">("cost");

  // Speed sensitivity curves for both vessels
  const curveA = generateSpeedSensitivityCurve(DEFAULT_VESSEL_A, inputs, port, resultA.voyageDistanceNM);
  const curveB = generateSpeedSensitivityCurve(DEFAULT_VESSEL_B, inputs, port, resultA.voyageDistanceNM);

  // Combined speed sensitivity data
  const speedCurveData = curveA.map((item, idx) => ({
    speed: item.speed,
    fuelA: item.fuelMT,
    fuelB: curveB[idx]?.fuelMT || 0,
    co2A: item.co2MT,
    co2B: curveB[idx]?.co2MT || 0,
    noiseA: item.noiseDB,
    noiseB: curveB[idx]?.noiseDB || 0,
  }));

  // Financial Cost Breakdown Data
  const costBreakdownData = [
    {
      category: "Bunker Fuel",
      "Vessel A": resultA.bunkerFuelCostUSD,
      "Vessel B": resultB.bunkerFuelCostUSD,
    },
    {
      category: "Base Charter",
      "Vessel A": resultA.charterCostUSD,
      "Vessel B": resultB.charterCostUSD,
    },
    {
      category: "Port Demurrage",
      "Vessel A": resultA.demurrageExposureUSD,
      "Vessel B": resultB.demurrageExposureUSD,
    },
    {
      category: "Offshore Lightering",
      "Vessel A": resultA.lighteringRiskCostUSD,
      "Vessel B": resultB.lighteringRiskCostUSD,
    },
    {
      category: "Total Risk-Adjusted",
      "Vessel A": resultA.riskAdjustedCostUSD,
      "Vessel B": resultB.riskAdjustedCostUSD,
    },
  ];

  // Risk Score Component Data
  const riskComponentData = [
    {
      component: "Draft Breach",
      "Vessel A": resultA.draftRiskScore,
      "Vessel B": resultB.draftRiskScore,
    },
    {
      component: "Demurrage / Delay",
      "Vessel A": resultA.portCongestionRiskScore,
      "Vessel B": resultB.portCongestionRiskScore,
    },
    {
      component: "Weather / Swell",
      "Vessel A": resultA.weatherRiskScore,
      "Vessel B": resultB.weatherRiskScore,
    },
    {
      component: "Environmental / URN",
      "Vessel A": resultA.environmentalRiskScore,
      "Vessel B": resultB.environmentalRiskScore,
    },
    {
      component: "Total Composite",
      "Vessel A": resultA.totalRiskScore,
      "Vessel B": resultB.totalRiskScore,
    },
  ];

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 sm:p-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-navy-800 gap-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Maritime Analytics & Sensitivity Modeling
            </h2>
            <p className="text-xs text-slate-400">
              Deterministic curves illustrating cubic power laws and commercial exposure
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 bg-navy-850 p-1 rounded-lg border border-navy-750">
          <button
            onClick={() => setActiveTab("cost")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              activeTab === "cost"
                ? "bg-cyan-500 text-navy-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Cost Breakdown
          </button>
          <button
            onClick={() => setActiveTab("speed")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              activeTab === "speed"
                ? "bg-cyan-500 text-navy-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Fuel vs Speed
          </button>
          <button
            onClick={() => setActiveTab("risk")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              activeTab === "risk"
                ? "bg-cyan-500 text-navy-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Risk Vectors
          </button>
          <button
            onClick={() => setActiveTab("noise")}
            className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
              activeTab === "noise"
                ? "bg-cyan-500 text-navy-950 font-bold"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Underwater Noise (URN)
          </button>
        </div>
      </div>

      {/* Chart View Area */}
      <div className="w-full h-[300px]">
        {activeTab === "cost" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={costBreakdownData}
              margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3b77" opacity={0.3} />
              <XAxis dataKey="category" stroke="#94a3b8" fontSize={11} />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                tickFormatter={(val) => `$${(val / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1a36",
                  borderColor: "#1f3b77",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
                formatter={(val: number) => [`$${val.toLocaleString()} USD`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />
              <Bar dataKey="Vessel A" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Vessel A (MV Sagar Samrat)" />
              <Bar dataKey="Vessel B" fill="#10b981" radius={[4, 4, 0, 0]} name="Vessel B (MV Nilgiri Green)" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === "speed" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={speedCurveData}
              margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3b77" opacity={0.3} />
              <XAxis
                dataKey="speed"
                stroke="#94a3b8"
                fontSize={11}
                unit=" kts"
              />
              <YAxis
                stroke="#94a3b8"
                fontSize={11}
                unit=" MT"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1a36",
                  borderColor: "#1f3b77",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
                formatter={(val: number) => [`${val} MT Fuel Consumed`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />
              <Line
                type="monotone"
                dataKey="fuelA"
                stroke="#f43f5e"
                strokeWidth={2.5}
                name="Vessel A Fuel (MT)"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="fuelB"
                stroke="#10b981"
                strokeWidth={2.5}
                name="Vessel B Fuel (MT)"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {activeTab === "risk" && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={riskComponentData}
              margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3b77" opacity={0.3} />
              <XAxis dataKey="component" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1a36",
                  borderColor: "#1f3b77",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
                formatter={(val: number) => [`${val} / 100`, "Risk Score"]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />
              <Bar dataKey="Vessel A" fill="#f43f5e" radius={[4, 4, 0, 0]} name="Vessel A (Score)" />
              <Bar dataKey="Vessel B" fill="#10b981" radius={[4, 4, 0, 0]} name="Vessel B (Score)" />
            </BarChart>
          </ResponsiveContainer>
        )}

        {activeTab === "noise" && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={speedCurveData}
              margin={{ top: 10, right: 20, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1f3b77" opacity={0.3} />
              <XAxis dataKey="speed" stroke="#94a3b8" fontSize={11} unit=" kts" />
              <YAxis stroke="#94a3b8" fontSize={11} domain={[130, 160]} unit=" dB" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0d1a36",
                  borderColor: "#1f3b77",
                  borderRadius: "8px",
                  color: "#f8fafc",
                }}
                formatter={(val: number) => [`${val} dB Sound Level`, ""]}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#cbd5e1" }} />
              <Line
                type="monotone"
                dataKey="noiseA"
                stroke="#f43f5e"
                strokeWidth={2}
                name="Vessel A Acoustic dB"
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="noiseB"
                stroke="#00d2ff"
                strokeWidth={2}
                name="Vessel B Acoustic dB"
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

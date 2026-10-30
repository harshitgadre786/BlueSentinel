"use client";

import React, { useState } from "react";
import WorkspaceNav from "@/components/WorkspaceNav";
import { DEMO_VESSELS, DETAILED_INDIAN_PORTS, calculateDynamicSquat } from "@/lib/maritime-calculator";
import { DemoVessel } from "@/lib/maritime-models";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import {
  Sliders,
  TrendingDown,
  Clock,
  Fuel,
  Cloud,
  Ship,
  Info,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function WhatIfSimulatorPage() {
  // Simulator Controls
  const [speedKnots, setSpeedKnots] = useState<number>(13.5);
  const [fuelPricePct, setFuelPricePct] = useState<number>(0); // -15% to +15%
  const [portWaitDays, setPortWaitDays] = useState<number>(3.5); // 0 to 7 days
  const [usdToInrRate, setUsdToInrRate] = useState<number>(83.50);
  const [isHighSpringTide, setIsHighSpringTide] = useState<boolean>(false);

  // Baseline conditions
  const baseFuelPriceUSD = 640;
  const currentFuelPriceUSD = Math.round(baseFuelPriceUSD * (1 + fuelPricePct / 100));

  const port = DETAILED_INDIAN_PORTS.paradip;
  const distanceNM = 1650; // Singapore to Paradip

  // Compute live metrics for all 3 vessels
  const computeVesselSimulation = (vessel: DemoVessel) => {
    const seaDays = Number((distanceNM / (speedKnots * 24)).toFixed(2));
    const totalDays = Number((seaDays + portWaitDays).toFixed(2));

    // Dynamic Squat and Arrival Draft
    const squatM = calculateDynamicSquat(speedKnots);
    const dynamicDraftM = Number((vessel.loadedDraft + squatM).toFixed(2));

    const currentTideM = isHighSpringTide ? 2.40 : 1.50;
    const allowablePortDraftM = Number((port.maxPermissibleDraft + currentTideM - port.requiredUKC).toFixed(2));
    const draftMarginM = Number((allowablePortDraftM - dynamicDraftM).toFixed(2));
    const isDraftCompliant = draftMarginM >= 0;

    // Fuel consumption with Admiralty cubic ratio
    const speedRatio = speedKnots / vessel.averageSpeed;
    const dailySeaFuelBurn = vessel.dailyFuelBurn * Math.pow(speedRatio, 3);
    const totalSeaFuel = dailySeaFuelBurn * seaDays;
    const totalPortFuel = vessel.portFuelBurn * portWaitDays;
    const totalFuelMT = Number((totalSeaFuel + totalPortFuel).toFixed(1));
    const co2MT = Number((totalFuelMT * vessel.emissionFactor).toFixed(1));

    // Financials
    const baseFreightUSD = Math.round(vessel.freightDailyRate * totalDays);
    const bunkerFuelUSD = Math.round(totalFuelMT * currentFuelPriceUSD);
    const portTariffUSD = 28500;
    const demurrageRiskUSD = Math.round(vessel.demurrageDailyRate * portWaitDays);

    let lighteringPenaltyUSD = 0;
    let lighteringDelayDays = 0;
    if (!isDraftCompliant) {
      const excess = Math.abs(draftMarginM);
      const lighteredTonnage = Math.min(18000, Math.max(6500, Math.round(excess * 12500)));
      lighteringPenaltyUSD = Math.round(lighteredTonnage * port.lighteringCostPerTonne + 35000);
      lighteringDelayDays = 3.5;
    }

    const extraDemurrageUSD = Math.round(lighteringDelayDays * vessel.demurrageDailyRate);
    const totalLandedUSD = baseFreightUSD + bunkerFuelUSD + portTariffUSD + demurrageRiskUSD;
    const riskAdjustedUSD = totalLandedUSD + lighteringPenaltyUSD + extraDemurrageUSD;

    // Risk Level
    let delayRiskLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL" = "LOW";
    if (vessel.id === "vesselC" && portWaitDays >= 4.5) delayRiskLevel = "CRITICAL";
    else if (portWaitDays >= 4.0 || !isDraftCompliant) delayRiskLevel = "HIGH";
    else if (portWaitDays >= 2.5) delayRiskLevel = "MODERATE";

    return {
      vessel,
      seaDays,
      totalDays: Number((totalDays + lighteringDelayDays).toFixed(2)),
      dynamicDraftM,
      draftMarginM,
      isDraftCompliant,
      totalFuelMT,
      co2MT,
      baseFreightUSD,
      bunkerFuelUSD,
      portTariffUSD,
      demurrageRiskUSD: demurrageRiskUSD + extraDemurrageUSD,
      lighteringPenaltyUSD,
      totalLandedUSD,
      riskAdjustedUSD,
      totalLandedINR: Math.round(totalLandedUSD * usdToInrRate),
      riskAdjustedINR: Math.round(riskAdjustedUSD * usdToInrRate),
      delayRiskLevel,
    };
  };

  const simA = computeVesselSimulation(DEMO_VESSELS.vesselA);
  const simB = computeVesselSimulation(DEMO_VESSELS.vesselB);
  const simC = computeVesselSimulation(DEMO_VESSELS.vesselC);

  // Recommended is B unless special conditions
  const recommendedSim = simB;
  const baseCaseBUSD = 328000;
  const deltaFromBaseUSD = simB.riskAdjustedUSD - baseCaseBUSD;

  // Chart Data: Cost Composition
  const costChartData = [
    {
      category: "Freight",
      "Vessel A": simA.baseFreightUSD,
      "Vessel B": simB.baseFreightUSD,
      "Vessel C": simC.baseFreightUSD,
    },
    {
      category: "Fuel",
      "Vessel A": simA.bunkerFuelUSD,
      "Vessel B": simB.bunkerFuelUSD,
      "Vessel C": simC.bunkerFuelUSD,
    },
    {
      category: "Demurrage",
      "Vessel A": simA.demurrageRiskUSD,
      "Vessel B": simB.demurrageRiskUSD,
      "Vessel C": simC.demurrageRiskUSD,
    },
    {
      category: "Lightering",
      "Vessel A": simA.lighteringPenaltyUSD,
      "Vessel B": simB.lighteringPenaltyUSD,
      "Vessel C": simC.lighteringPenaltyUSD,
    },
    {
      category: "Risk-Adjusted",
      "Vessel A": simA.riskAdjustedUSD,
      "Vessel B": simB.riskAdjustedUSD,
      "Vessel C": simC.riskAdjustedUSD,
    },
  ];

  // Chart Data: Speed Sensitivity Curve for Vessel B
  const speedCurveData = [11.0, 12.0, 12.8, 13.5, 14.5, 15.5, 16.5].map((spd) => {
    const sDays = Number((distanceNM / (spd * 24)).toFixed(2));
    const sRatio = spd / DEMO_VESSELS.vesselB.averageSpeed;
    const fBurn = Number((DEMO_VESSELS.vesselB.dailyFuelBurn * Math.pow(sRatio, 3) * sDays).toFixed(1));
    return {
      speed: spd,
      fuelMT: fBurn,
      seaDays: sDays,
    };
  });

  const handleResetSimulator = () => {
    setSpeedKnots(13.5);
    setFuelPricePct(0);
    setPortWaitDays(3.5);
    setUsdToInrRate(83.50);
    setIsHighSpringTide(false);
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      <WorkspaceNav serviceTitle="What-If Voyage Simulator" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-coral">
              SENSITIVITY ANALYSIS • WHAT-IF SIMULATION
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight">
              What-If Scenario Simulator
            </h1>
            <p className="text-xs sm:text-sm text-forest/75 dark:text-paper-light/75 max-w-xl font-normal">
              Adjust sailing speed, fuel volatility (±15%), anchorage delay (0-7d), and tide windows. Observe deterministic cost changes in real time.
            </p>
          </div>

          <button
            onClick={handleResetSimulator}
            className="self-start sm:self-center px-3 py-1.5 rounded-md border border-forest/20 dark:border-paper-light/20 text-xs font-semibold hover:border-coral flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5 text-mustard" />
            <span>Reset Sliders</span>
          </button>
        </div>

        {/* INTERACTIVE CONTROLS PANEL */}
        <div className="p-6 rounded-xl bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Slider 1: Speed */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Sailing Speed</span>
              <span className="font-mono text-coral font-bold">{speedKnots.toFixed(1)} kts</span>
            </div>
            <input
              type="range"
              min={10.5}
              max={16.5}
              step={0.1}
              value={speedKnots}
              onChange={(e) => setSpeedKnots(parseFloat(e.target.value))}
              className="w-full h-2 bg-paper-surface dark:bg-paper-dark rounded accent-coral cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-forest/50 dark:text-paper-light/50 font-mono">
              <span>10.5 Eco</span>
              <span>13.5 Normal</span>
              <span>16.5 Fast</span>
            </div>
          </div>

          {/* Slider 2: Fuel Price Change */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Fuel Price Shift</span>
              <span className="font-mono text-mustard font-bold">
                {fuelPricePct > 0 ? `+${fuelPricePct}%` : `${fuelPricePct}%`} (${currentFuelPriceUSD}/t)
              </span>
            </div>
            <input
              type="range"
              min={-15}
              max={15}
              step={1}
              value={fuelPricePct}
              onChange={(e) => setFuelPricePct(parseInt(e.target.value))}
              className="w-full h-2 bg-paper-surface dark:bg-paper-dark rounded accent-mustard cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-forest/50 dark:text-paper-light/50 font-mono">
              <span>-15%</span>
              <span>Baseline $640</span>
              <span>+15%</span>
            </div>
          </div>

          {/* Slider 3: Port Waiting Days */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Port Anchorage Wait</span>
              <span className="font-mono text-coral font-bold">{portWaitDays.toFixed(1)} Days</span>
            </div>
            <input
              type="range"
              min={0}
              max={7}
              step={0.5}
              value={portWaitDays}
              onChange={(e) => setPortWaitDays(parseFloat(e.target.value))}
              className="w-full h-2 bg-paper-surface dark:bg-paper-dark rounded accent-coral cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-forest/50 dark:text-paper-light/50 font-mono">
              <span>0 Days</span>
              <span>3.5d Benchmark</span>
              <span>7.0 Days</span>
            </div>
          </div>

          {/* FX Rate & Spring Tide Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>USD/INR Exchange</span>
              <span className="font-mono">{usdToInrRate.toFixed(2)}</span>
            </div>
            <input
              type="number"
              step={0.1}
              value={usdToInrRate}
              onChange={(e) => setUsdToInrRate(parseFloat(e.target.value) || 83.5)}
              className="w-full p-1.5 text-xs font-mono bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded"
            />
            <div className="flex items-center gap-2 pt-1 text-[11px]">
              <input
                type="checkbox"
                id="tide-toggle"
                checked={isHighSpringTide}
                onChange={(e) => setIsHighSpringTide(e.target.checked)}
                className="rounded text-forest accent-coral cursor-pointer"
              />
              <label htmlFor="tide-toggle" className="cursor-pointer font-medium select-none">
                Simulate Spring High Tide (+2.4m)
              </label>
            </div>
          </div>
        </div>

        {/* LIVE INSIGHT NOTIFICATION PANEL */}
        <div className="p-4 rounded-lg bg-paper-surface dark:bg-paper-dark-surface border-l-4 border-mustard text-xs space-y-1">
          <div className="font-bold font-serif text-sm flex items-center gap-2">
            <Info className="w-4 h-4 text-mustard" />
            <span>Operational Trade-Off Insight:</span>
          </div>
          <p className="leading-relaxed opacity-90">
            &ldquo;Reducing speed to <strong>12.8 knots</strong> lowers fuel consumption exponentially, but arrival timing must still meet berth availability windows at Paradip. With port wait at <strong>{portWaitDays} days</strong>, Vessel C&apos;s demurrage accumulates rapidly at $28,500/day.&rdquo;
          </p>
        </div>

        {/* LIVE SIMULATION KPI CARDS */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg bg-paper-surface/40 dark:bg-paper-dark-surface/30 border border-forest/15 dark:border-paper-light/15 space-y-1">
            <span className="text-[10px] font-mono uppercase text-forest/60 dark:text-paper-light/60">
              Vessel B Landed Cost
            </span>
            <div className="font-serif font-black text-xl">${simB.totalLandedUSD.toLocaleString()}</div>
            <div className="text-[10px] font-mono text-forest/60">₹{(simB.totalLandedINR / 1e7).toFixed(2)} Cr</div>
          </div>

          <div className="p-4 rounded-lg bg-paper-surface/40 dark:bg-paper-dark-surface/30 border border-forest/15 dark:border-paper-light/15 space-y-1">
            <span className="text-[10px] font-mono uppercase text-forest/60 dark:text-paper-light/60">
              Delta vs Base Case
            </span>
            <div className={`font-serif font-black text-xl ${deltaFromBaseUSD <= 0 ? "text-forest dark:text-mustard" : "text-coral"}`}>
              {deltaFromBaseUSD <= 0 ? `-$${Math.abs(deltaFromBaseUSD).toLocaleString()}` : `+$${deltaFromBaseUSD.toLocaleString()}`}
            </div>
            <div className="text-[10px] text-forest/60">Based on $328k benchmark</div>
          </div>

          <div className="p-4 rounded-lg bg-paper-surface/40 dark:bg-paper-dark-surface/30 border border-forest/15 dark:border-paper-light/15 space-y-1">
            <span className="text-[10px] font-mono uppercase text-forest/60 dark:text-paper-light/60">
              Est. CO₂ Footprint
            </span>
            <div className="font-serif font-black text-xl text-coral">{simB.co2MT} MT</div>
            <div className="text-[10px] text-forest/60">Sea fuel: {simB.totalFuelMT} MT</div>
          </div>

          <div className="p-4 rounded-lg bg-paper-surface/40 dark:bg-paper-dark-surface/30 border border-forest/15 dark:border-paper-light/15 space-y-1">
            <span className="text-[10px] font-mono uppercase text-forest/60 dark:text-paper-light/60">
              Recommended Vessel
            </span>
            <div className="font-serif font-black text-xl text-forest dark:text-mustard">
              {simA.isDraftCompliant ? "Vessel A (Tidal Window)" : "Vessel B (Eco)"}
            </div>
            <div className="text-[10px] font-mono text-forest/60">
              {simA.isDraftCompliant ? "High tide clearance" : "Zero lightering risk"}
            </div>
          </div>
        </div>

        {/* TWO VISUALLY IMPRESSIVE CHARTS */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
          {/* Chart 1: Cost Composition Bar Chart */}
          <div className="p-6 rounded-xl bg-paper-surface/40 dark:bg-paper-dark-surface/30 border border-forest/15 dark:border-paper-light/15 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">Cost Composition Comparison</h3>
              <span className="text-[10px] font-mono text-forest/50">USD LANDED</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={costChartData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8D0BD" opacity={0.3} />
                  <XAxis dataKey="category" stroke="#103B2D" fontSize={10} />
                  <YAxis stroke="#103B2D" fontSize={10} tickFormatter={(v) => `$${v / 1000}k`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#F7F1DF", borderColor: "#103B2D", borderRadius: "6px" }}
                    formatter={(val: number) => [`$${val.toLocaleString()}`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Bar dataKey="Vessel A" fill="#F24B2A" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Vessel B" fill="#103B2D" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Vessel C" fill="#D8A83C" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Speed vs Fuel Trade-Off Line Chart */}
          <div className="p-6 rounded-xl bg-paper-surface/40 dark:bg-paper-dark-surface/30 border border-forest/15 dark:border-paper-light/15 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif font-bold text-base">Speed vs Fuel Trade-Off (Vessel B)</h3>
              <span className="text-[10px] font-mono text-forest/50">ADMIRALTY CUBIC LAW</span>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={speedCurveData} margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#D8D0BD" opacity={0.3} />
                  <XAxis dataKey="speed" stroke="#103B2D" fontSize={10} unit=" kts" />
                  <YAxis stroke="#103B2D" fontSize={10} unit=" MT" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#F7F1DF", borderColor: "#103B2D", borderRadius: "6px" }}
                    formatter={(val: number) => [`${val} MT Fuel`, ""]}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Line type="monotone" dataKey="fuelMT" stroke="#F24B2A" strokeWidth={2} name="Total Fuel (MT)" dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="seaDays" stroke="#103B2D" strokeWidth={2} name="Sea Days" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

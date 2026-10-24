"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import WorkspaceNav from "@/components/WorkspaceNav";
import { VoyagePlannerInputs } from "@/lib/maritime-models";
import { DETAILED_INDIAN_PORTS, DEMO_VESSELS } from "@/lib/maritime-calculator";
import {
  Ship,
  Anchor,
  Navigation,
  Calendar,
  Fuel,
  Clock,
  Layers,
  DollarSign,
  ArrowRight,
  Info,
  ShieldCheck,
  RotateCcw,
} from "lucide-react";

export default function VoyagePlannerPage() {
  const router = useRouter();

  const defaultInputs: VoyagePlannerInputs = {
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

  const [inputs, setInputs] = useState<VoyagePlannerInputs>(defaultInputs);
  const [activeStep, setActiveStep] = useState<1 | 2>(1);

  const selectedPort = DETAILED_INDIAN_PORTS[inputs.destinationPortId] || DETAILED_INDIAN_PORTS.paradip;

  const handleResetDefaults = () => {
    setInputs(defaultInputs);
  };

  const handleProceedToComparison = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      localStorage.setItem("bluesentinel_voyage_inputs", JSON.stringify(inputs));
    }
    router.push("/workspace/voyage-planner/results");
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      <WorkspaceNav serviceTitle="Voyage Planner" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-10 py-12 space-y-12">
        {/* Header & Breadcrumb */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-widest text-coral">
              PHASE 2 • VOYAGE SPECIFICATION
            </span>
            <button
              onClick={handleResetDefaults}
              className="text-xs font-semibold text-forest/60 dark:text-paper-light/60 hover:text-coral flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-mustard" />
              <span>Reset to Paradip Benchmark</span>
            </button>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black text-forest dark:text-paper-light tracking-tight">
            Configure Voyage Parameters
          </h1>
          <p className="text-sm sm:text-base text-forest/75 dark:text-paper-light/75 max-w-2xl font-normal leading-relaxed">
            Enter cargo tonnage, ports, and laycan details. BlueSentinel will deterministically calculate landed costs, Under Keel Clearance, and evaluate three chartered vessels.
          </p>

          <div className="p-3 rounded bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
            <Info className="w-4 h-4 text-mustard shrink-0" />
            <span>
              <strong>Simulated prototype data:</strong> All hydrodynamic squat formulas, draft parameters, and port charges are calibrated for decision-support testing.
            </span>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleProceedToComparison} className="space-y-10">
          {/* Step 1: Cargo & Routing */}
          <div className="p-8 rounded-xl bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-forest/15 dark:border-paper-light/15">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest dark:bg-paper-light text-paper-light dark:text-forest text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif text-xl font-bold text-forest dark:text-paper-light">
                  Cargo Profile & Routing
                </h2>
              </div>
              <span className="text-xs font-mono text-forest/50 dark:text-paper-light/50">
                ORIGIN ➔ INDIAN PORT
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cargo Type */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-coral" />
                  Cargo Type
                </label>
                <select
                  value={inputs.cargoType}
                  onChange={(e) => setInputs({ ...inputs, cargoType: e.target.value })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none focus:border-forest dark:focus:border-paper-light cursor-pointer font-medium"
                >
                  <option value="Thermal Coal">Thermal Coal (Bulk)</option>
                  <option value="Iron Ore Fines">Iron Ore Fines</option>
                  <option value="Coking Coal">Coking Coal</option>
                  <option value="Bauxite / Mineral Agri">Bauxite / Agri Bulk</option>
                  <option value="Clean Petroleum Products">Clean Petroleum (CPP)</option>
                </select>
              </div>

              {/* Cargo Quantity */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Ship className="w-3.5 h-3.5 text-coral" />
                  Cargo Quantity (Metric Tonnes)
                </label>
                <input
                  type="number"
                  min={20000}
                  max={150000}
                  step={5000}
                  value={inputs.cargoQuantityMT}
                  onChange={(e) => setInputs({ ...inputs, cargoQuantityMT: Number(e.target.value) || 75000 })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none focus:border-forest dark:focus:border-paper-light font-mono font-semibold"
                  required
                />
              </div>

              {/* Origin Port */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-mustard" />
                  Origin Port (Loading Hub)
                </label>
                <select
                  value={inputs.originPortId}
                  onChange={(e) => setInputs({ ...inputs, originPortId: e.target.value })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none focus:border-forest dark:focus:border-paper-light cursor-pointer font-medium"
                >
                  <option value="singapore">Port of Singapore (1,650 NM to Paradip)</option>
                  <option value="port_hedland">Port Hedland, Australia (3,680 NM)</option>
                  <option value="richards_bay">Richards Bay, South Africa (4,850 NM)</option>
                  <option value="ras_laffan">Ras Laffan, Qatar (2,580 NM)</option>
                </select>
              </div>

              {/* Destination Port */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Anchor className="w-3.5 h-3.5 text-coral" />
                  Destination Indian Port
                </label>
                <select
                  value={inputs.destinationPortId}
                  onChange={(e) => setInputs({ ...inputs, destinationPortId: e.target.value })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none focus:border-forest dark:focus:border-paper-light cursor-pointer font-bold text-coral"
                >
                  {Object.values(DETAILED_INDIAN_PORTS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Max Draft: {p.maxPermissibleDraft}m CD)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Port Alert Card */}
            <div className="p-4 rounded-md bg-paper-light dark:bg-paper-dark border border-forest/10 dark:border-paper-light/10 text-xs space-y-1">
              <div className="flex items-center justify-between font-semibold">
                <span className="text-forest dark:text-paper-light">
                  {selectedPort.name} Berth Channel Limits:
                </span>
                <span className="font-mono text-coral font-bold">
                  Max Draft: {selectedPort.maxPermissibleDraft}m CD
                </span>
              </div>
              <p className="text-forest/70 dark:text-paper-light/70 text-[11px] leading-relaxed">
                {selectedPort.description} Mandatory UKC: {selectedPort.requiredUKC}m.
              </p>
            </div>
          </div>

          {/* Step 2: Laycan, Market Rates & Port Delays */}
          <div className="p-8 rounded-xl bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-forest/15 dark:border-paper-light/15">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest dark:bg-paper-light text-paper-light dark:text-forest text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif text-xl font-bold text-forest dark:text-paper-light">
                  Laycan Timing & Cost Parameters
                </h2>
              </div>
              <span className="text-xs font-mono text-forest/50 dark:text-paper-light/50">
                MARKET RATES & DELAY ASSUMPTIONS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Laycan Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-mustard" />
                  Expected Departure
                </label>
                <input
                  type="date"
                  value={inputs.laycanDate}
                  onChange={(e) => setInputs({ ...inputs, laycanDate: e.target.value })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-xs text-forest dark:text-paper-light focus:outline-none focus:border-forest font-mono"
                  required
                />
              </div>

              {/* Fuel Price (VLSFO) */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-coral" />
                  Fuel Price (USD / MT)
                </label>
                <input
                  type="number"
                  min={400}
                  max={1200}
                  step={10}
                  value={inputs.fuelPriceUSD}
                  onChange={(e) => setInputs({ ...inputs, fuelPriceUSD: Number(e.target.value) || 640 })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-xs text-forest dark:text-paper-light focus:outline-none focus:border-forest font-mono font-bold"
                  required
                />
              </div>

              {/* USD to INR Exchange Rate */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-mustard" />
                  USD to INR Rate
                </label>
                <input
                  type="number"
                  min={75}
                  max={95}
                  step={0.1}
                  value={inputs.usdToInrRate}
                  onChange={(e) => setInputs({ ...inputs, usdToInrRate: Number(e.target.value) || 83.5 })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-xs text-forest dark:text-paper-light focus:outline-none focus:border-forest font-mono"
                  required
                />
              </div>

              {/* Port Wait Days */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-coral" />
                  Est. Port Wait (Days)
                </label>
                <input
                  type="number"
                  min={0}
                  max={15}
                  step={0.5}
                  value={inputs.portWaitingDays}
                  onChange={(e) => setInputs({ ...inputs, portWaitingDays: Number(e.target.value) || 3.0 })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-xs text-forest dark:text-paper-light focus:outline-none focus:border-forest font-mono font-bold"
                  required
                />
              </div>
            </div>
          </div>

          {/* Three Available Candidate Vessels Preview */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-serif text-xl font-bold text-forest dark:text-paper-light">
                Available Chartered Vessels (3 Candidate Options)
              </h2>
              <span className="text-xs font-mono text-forest/60 dark:text-paper-light/60">
                EVALUATED AT NEXT STEP
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.values(DEMO_VESSELS).map((v) => (
                <div
                  key={v.id}
                  className="p-6 rounded-lg bg-paper-surface/40 dark:bg-paper-dark-surface/30 border border-forest/15 dark:border-paper-light/15 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-serif font-bold text-lg text-forest dark:text-paper-light">
                      {v.name}
                    </span>
                    {v.id === "vesselA" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-coral/10 text-coral border border-coral/30 font-bold">
                        DRAFT BREACH
                      </span>
                    )}
                    {v.id === "vesselB" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest text-paper-light dark:bg-paper-light dark:text-forest font-bold">
                        RECOMMENDED
                      </span>
                    )}
                    {v.id === "vesselC" && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mustard/20 text-mustard-hover dark:text-mustard font-bold">
                        DELAY SENSITIVE
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-forest/65 dark:text-paper-light/65 leading-relaxed">
                    {v.description}
                  </p>

                  <div className="pt-3 border-t border-forest/10 dark:border-paper-light/10 grid grid-cols-2 gap-2 text-xs font-mono text-forest/80 dark:text-paper-light/80">
                    <div>Draft: <strong>{v.loadedDraft}m</strong></div>
                    <div>Speed: <strong>{v.averageSpeed} kts</strong></div>
                    <div>Fuel: <strong>{v.dailyFuelBurn} MT/d</strong></div>
                    <div>Rate: <strong>${v.freightDailyRate.toLocaleString()}/d</strong></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-forest/15 dark:border-paper-light/15">
            <div className="text-xs text-forest/60 dark:text-paper-light/60">
              Deterministic calculations executed across all 3 vessels instantly.
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-sm font-bold tracking-wide border border-forest dark:border-paper-light shadow-editorial hover:translate-x-[-1px] hover:translate-y-[-1px] transition-all cursor-pointer"
            >
              <span>Compare Vessels & Run Audit</span>
              <ArrowRight className="w-4 h-4 text-coral" />
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

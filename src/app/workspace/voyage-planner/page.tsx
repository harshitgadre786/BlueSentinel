"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import WorkspaceNav from "@/components/WorkspaceNav";
import { VoyagePlannerInputs, DemoVessel, CargoProfile } from "@/lib/maritime-models";
import {
  DETAILED_INDIAN_PORTS,
  CARGO_PROFILES,
  CHARTERED_FLEET,
  getVesselsForCargo,
} from "@/lib/maritime-calculator";
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
  CheckCircle2,
  AlertTriangle,
  Radio,
  FileCheck2,
  Gauge,
  Sliders,
} from "lucide-react";

export default function VoyagePlannerPage() {
  const router = useRouter();

  const defaultInputs: VoyagePlannerInputs = {
    cargoType: "Dry Bulk (Thermal Coal / Iron Ore / Grain)",
    cargoCategory: "DRY_BULK",
    cargoQuantityMT: 75000,
    originPortId: "singapore",
    destinationPortId: "paradip",
    laycanDate: new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10),
    fuelPriceUSD: 640,
    usdToInrRate: 83.50,
    portWaitingDays: 3.5,
    selectedTideState: "NORMAL",
    selectedVesselId: "vesselB",
    unNumber: "N/A (IMSBC Group B - MHB)",
    imdgClass: "Non-IMDG (Solid Bulk Cargo)",
    vgmMethod: "Certified Belt Conveyor Scale Ticket + Draft Survey",
    targetDraftM: 13.30,
    vesselBeamM: 32.26,
    vesselDwtMT: 64500,
    permissiblePayloadMT: 61275,
  };

  const [inputs, setInputs] = useState<VoyagePlannerInputs>(defaultInputs);
  const [availableVessels, setAvailableVessels] = useState<DemoVessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState<DemoVessel>(CHARTERED_FLEET.vesselB);

  // Initialize and react to cargo type changes
  useEffect(() => {
    const vessels = getVesselsForCargo(inputs.cargoType);
    setAvailableVessels(vessels);

    // Pick first matching vessel or keep current if still valid
    const currentStillValid = vessels.find((v) => v.id === inputs.selectedVesselId);
    const primary = currentStillValid || vessels[0];

    if (primary) {
      setSelectedVessel(primary);
      setInputs((prev) => ({
        ...prev,
        selectedVesselId: primary.id,
        targetDraftM: primary.loadedDraft,
        vesselBeamM: primary.beam,
        vesselDwtMT: primary.dwt,
        permissiblePayloadMT: primary.permissiblePayloadMT || Math.round(primary.dwt * 0.95),
      }));
    }
  }, [inputs.cargoType, inputs.selectedVesselId]);

  const selectedPort = DETAILED_INDIAN_PORTS[inputs.destinationPortId] || DETAILED_INDIAN_PORTS.paradip;

  // Handle Cargo Selection change with auto-parameters
  const handleCargoTypeChange = (selectedName: string) => {
    const matchedProfile = Object.values(CARGO_PROFILES).find(
      (p) => p.name === selectedName
    ) || CARGO_PROFILES.dry_bulk_coal;

    const filteredVessels = getVesselsForCargo(selectedName);
    const candidate = filteredVessels[0] || CHARTERED_FLEET.vesselB;

    setSelectedVessel(candidate);
    setInputs((prev) => ({
      ...prev,
      cargoType: matchedProfile.name,
      cargoCategory: matchedProfile.category,
      cargoQuantityMT: matchedProfile.defaultTonnageMT,
      unNumber: matchedProfile.unNumber,
      imdgClass: matchedProfile.imdgClass,
      vgmMethod: matchedProfile.vgmMethod,
      selectedVesselId: candidate.id,
      targetDraftM: candidate.loadedDraft,
      vesselBeamM: candidate.beam,
      vesselDwtMT: candidate.dwt,
      permissiblePayloadMT: candidate.permissiblePayloadMT || Math.round(candidate.dwt * 0.95),
    }));
  };

  // Handle Vessel Selection card click
  const handleSelectVessel = (v: DemoVessel) => {
    setSelectedVessel(v);
    setInputs((prev) => ({
      ...prev,
      selectedVesselId: v.id,
      targetDraftM: v.loadedDraft,
      vesselBeamM: v.beam,
      vesselDwtMT: v.dwt,
      permissiblePayloadMT: v.permissiblePayloadMT || Math.round(v.dwt * 0.95),
    }));
  };

  const handleResetDefaults = () => {
    setInputs(defaultInputs);
    setSelectedVessel(CHARTERED_FLEET.vesselB);
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
              VOYAGE SETUP & VESSEL CHARTER • SPECIFICATION
            </span>
            <button
              onClick={handleResetDefaults}
              className="text-xs font-semibold text-forest/60 dark:text-paper-light/60 hover:text-coral flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-mustard" />
              <span>Reset to Paradip Benchmark</span>
            </button>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl font-black text-forest dark:text-paper-light tracking-tight">
            Configure Voyage & Fleet Parameters
          </h1>
          <p className="text-sm sm:text-base text-forest/75 dark:text-paper-light/75 max-w-2xl font-normal leading-relaxed">
            Select cargo classification and voyage laycan. BlueSentinel dynamically filters chartered fleet options, verifies IMO statutory compliance, and calculates landed costs.
          </p>

          <div className="p-3.5 rounded-lg bg-forest/5 dark:bg-paper-light/5 border border-forest/15 dark:border-paper-light/15 text-xs flex items-center gap-2.5">
            <Info className="w-4 h-4 text-mustard shrink-0" />
            <span className="text-forest/80 dark:text-paper-light/80">
              <strong>Dynamic Fleet Reactivity Active:</strong> Changing Cargo Type automatically filters available chartered vessels and auto-updates arrival draft, beam, and payload limits.
            </span>
          </div>
        </div>

        {/* Form Container */}
        <form onSubmit={handleProceedToComparison} className="space-y-10">
          {/* Step 1: Cargo Profile & Routing */}
          <div className="p-8 rounded-xl bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-forest/15 dark:border-paper-light/15">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest dark:bg-paper-light text-paper-light dark:text-forest text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="font-serif text-xl font-bold text-forest dark:text-paper-light">
                  Cargo Specification & Regulatory Class
                </h2>
              </div>
              <span className="text-xs font-mono text-forest/50 dark:text-paper-light/50">
                DYNAMIC FILTERING ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Cargo Type Select */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-coral" />
                  Cargo Type / Classification
                </label>
                <select
                  value={inputs.cargoType}
                  onChange={(e) => handleCargoTypeChange(e.target.value)}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none focus:border-forest dark:focus:border-paper-light cursor-pointer font-bold"
                >
                  <option value="Dry Bulk (Thermal Coal / Iron Ore / Grain)">Dry Bulk (Thermal Coal / Iron Ore / Grain)</option>
                  <option value="Containerized Goods">Containerized Goods (Feeder, Panamax TEU)</option>
                  <option value="Liquid Bulk / Crude / Chemicals">Liquid Bulk / Crude / Chemicals</option>
                  <option value="Hazardous / IMDG Special">Hazardous / IMDG Special</option>
                  <option value="LNG / Cryogenic Liquefied Gas">LNG / Cryogenic Liquefied Gas</option>
                  <option value="Breakbulk / Heavy Machinery">Breakbulk / Heavy Machinery</option>
                  <option value="Ro-Ro / Wheeled Rolling Stock">Ro-Ro / Wheeled Rolling Stock</option>
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
                  min={5000}
                  max={160000}
                  step={1000}
                  value={inputs.cargoQuantityMT}
                  onChange={(e) =>
                    setInputs({ ...inputs, cargoQuantityMT: Number(e.target.value) || 75000 })
                  }
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none focus:border-forest font-mono font-bold"
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
                  Destination Port (Indian Gateway)
                </label>
                <select
                  value={inputs.destinationPortId}
                  onChange={(e) => setInputs({ ...inputs, destinationPortId: e.target.value })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none focus:border-forest dark:focus:border-paper-light cursor-pointer font-bold"
                >
                  {Object.values(DETAILED_INDIAN_PORTS).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Max Draft: {p.maxPermissibleDraft}m CD)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Step 2: Commercial & Operational Inputs */}
          <div className="p-8 rounded-xl bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-forest/15 dark:border-paper-light/15">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-forest dark:bg-paper-light text-paper-light dark:text-forest text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="font-serif text-xl font-bold text-forest dark:text-paper-light">
                  Commercial Laycan & Port Parameters
                </h2>
              </div>
              <span className="text-xs font-mono text-forest/50 dark:text-paper-light/50">
                FINANCIAL DISPATCH FACTORS
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {/* Laycan Date */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-mustard" />
                  Laycan Date
                </label>
                <input
                  type="date"
                  value={inputs.laycanDate}
                  onChange={(e) => setInputs({ ...inputs, laycanDate: e.target.value })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-xs text-forest dark:text-paper-light focus:outline-none focus:border-forest font-mono cursor-pointer"
                  required
                />
              </div>

              {/* Fuel Price */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <Fuel className="w-3.5 h-3.5 text-coral" />
                  VLSFO Bunker ($/MT)
                </label>
                <input
                  type="number"
                  min={400}
                  max={1200}
                  step={10}
                  value={inputs.fuelPriceUSD}
                  onChange={(e) => setInputs({ ...inputs, fuelPriceUSD: Number(e.target.value) || 640 })}
                  className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-xs text-forest dark:text-paper-light focus:outline-none focus:border-forest font-mono"
                  required
                />
              </div>

              {/* USD to INR */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5 text-mustard" />
                  USD/INR Rate
                </label>
                <input
                  type="number"
                  min={70}
                  max={100}
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

          {/* DYNAMIC VESSEL FILTERING BY CARGO TYPE */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="font-serif text-xl font-bold text-forest dark:text-paper-light flex items-center gap-2">
                  <Ship className="w-5 h-5 text-coral" />
                  <span>Available Chartered Vessels for {inputs.cargoType}</span>
                </h2>
                <p className="text-xs text-forest/60 dark:text-paper-light/60">
                  Click a vessel to bind its hydrodynamic parameters (draft, beam, DWT) to this voyage calculation.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-forest/10 dark:bg-paper-light/10 text-forest dark:text-paper-light font-bold">
                {availableVessels.length} VESSELS IN RANGE
              </span>
            </div>

            {availableVessels.length === 0 ? (
              <div className="p-8 rounded-lg bg-coral/10 border border-coral text-coral text-sm text-center font-medium">
                No compliant chartered vessels in range for this cargo class. Adjust filters or port radius.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {availableVessels.map((v) => {
                  const isSelected = selectedVessel?.id === v.id;
                  return (
                    <div
                      key={v.id}
                      onClick={() => handleSelectVessel(v)}
                      className={`p-6 rounded-lg border transition-all cursor-pointer space-y-3 relative ${
                        isSelected
                          ? "bg-forest/10 dark:bg-paper-light/10 border-forest dark:border-paper-light ring-2 ring-coral"
                          : "bg-paper-surface/40 dark:bg-paper-dark-surface/30 border-forest/15 dark:border-paper-light/15 hover:border-forest/40"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-serif font-bold text-lg text-forest dark:text-paper-light flex items-center gap-1.5">
                            <span>{v.name}</span>
                            {isSelected && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] font-mono text-forest/60 dark:text-paper-light/60 mt-0.5">
                            IMO: {v.imoNumber} &bull; Flag: {v.flag}
                          </div>
                        </div>

                        {v.archetype === "DRAFT_RISK" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-coral/10 text-coral border border-coral/30 font-bold uppercase shrink-0">
                            Draft Breach
                          </span>
                        )}
                        {v.archetype === "RECOMMENDED" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest text-paper-light dark:bg-paper-light dark:text-forest font-bold uppercase shrink-0">
                            Recommended
                          </span>
                        )}
                        {v.archetype === "DELAY_RISK" && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mustard/20 text-mustard-hover dark:text-mustard font-bold uppercase shrink-0">
                            Delay Sensitive
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-forest/70 dark:text-paper-light/70 leading-relaxed font-sans line-clamp-2">
                        {v.description}
                      </p>

                      <div className="pt-3 border-t border-forest/10 dark:border-paper-light/10 grid grid-cols-2 gap-2 text-xs font-mono text-forest/80 dark:text-paper-light/80">
                        <div>Draft: <strong className={v.loadedDraft > selectedPort.maxPermissibleDraft ? "text-coral" : ""}>{v.loadedDraft}m</strong></div>
                        <div>Beam: <strong>{v.beam}m</strong></div>
                        <div>DWT: <strong>{v.dwt.toLocaleString()} MT</strong></div>
                        <div>Rate: <strong>${v.freightDailyRate.toLocaleString()}/d</strong></div>
                      </div>

                      <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-forest/60 dark:text-paper-light/60">
                        <span className="truncate">Port: {v.currentPort}</span>
                        <span className="font-bold text-coral">
                          {isSelected ? "ACTIVE SELECTION" : "CLICK TO BIND"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-forest/15 dark:border-paper-light/15">
            <div className="text-xs text-forest/60 dark:text-paper-light/60">
              Deterministic calculations executed across chartered candidates with full draft compliance check.
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

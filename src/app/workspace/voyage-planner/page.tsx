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
  getPortRule,
  getVoyageDistance,
  INTERNATIONAL_LOADING_HUBS,
  getInternationalHub,
} from "@/lib/maritime-calculator";
import {
  INDIAN_MAJOR_PORTS,
  INTERNATIONAL_DESTINATION_PORTS,
  getMajorPort,
  validateTerminalCargoCompatibility,
} from "@/data/ports";
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
  ArrowLeftRight,
  Info,
  ShieldCheck,
  ShieldAlert,
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
    originPortId: "in-jnpa",
    destinationPortId: "rotterdam",
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

  const selectedMajorPort = getMajorPort(inputs.destinationPortId) || INDIAN_MAJOR_PORTS[0];
  const selectedOriginMajor = getMajorPort(inputs.originPortId);
  const selectedOriginHub = getInternationalHub(inputs.originPortId);
  const selectedPort = getPortRule(inputs.destinationPortId);
  const compatibility = validateTerminalCargoCompatibility(inputs.destinationPortId, inputs.cargoType);

  // Dynamic Validation Rules
  // 1. Same Port Block
  const isSamePort = inputs.originPortId === inputs.destinationPortId ||
    (!!selectedOriginMajor && !!selectedMajorPort && selectedOriginMajor.id === selectedMajorPort.id);

  // 2. Dynamic Distance & Days
  const voyageNM = getVoyageDistance(inputs.originPortId, inputs.destinationPortId);
  const vesselSpeed = selectedVessel?.averageSpeed || 14.0;
  const transitDays = voyageNM > 0 ? Number((voyageNM / (vesselSpeed * 24)).toFixed(1)) : 0;
  const transitHours = voyageNM > 0 ? Math.round(voyageNM / vesselSpeed) : 0;
  
  // Trade direction classifications
  const isOriginIndian = inputs.originPortId.startsWith("in-");
  const isDestIndian = inputs.destinationPortId.startsWith("in-");
  const isDomesticVoyage = isOriginIndian && isDestIndian;
  const isExportVoyage = isOriginIndian && !isDestIndian;
  const isImportVoyage = !isOriginIndian && isDestIndian;

  const handleSwapPorts = () => {
    setInputs((prev) => ({
      ...prev,
      originPortId: prev.destinationPortId,
      destinationPortId: prev.originPortId,
    }));
  };

  // 3. Draft Check & Vessel Rejection Check
  const isTerminalIncompatible = !compatibility.isCompatible;
  const isSelectedVesselRejected = selectedVessel
    ? (selectedVessel.loadedDraft > selectedMajorPort.maxBerthDraftM)
    : false;
  const isFormBlocked = isSamePort || isTerminalIncompatible || isSelectedVesselRejected;

  const effectiveDraft = inputs.targetDraftM || selectedVessel?.loadedDraft || 13.3;
  const maxBerthDraft = selectedMajorPort.maxBerthDraftM;
  const isDraftExceeded = effectiveDraft > maxBerthDraft;
  const draftDifferenceM = Math.abs(Number((effectiveDraft - maxBerthDraft).toFixed(2)));

  // Synchronize available vessels and reactively bind compliant active vessel
  useEffect(() => {
    const vessels = getVesselsForCargo(inputs.cargoType);
    setAvailableVessels(vessels);

    const portDraft = selectedMajorPort.maxBerthDraftM;
    const compliant = vessels.filter((v) => v.loadedDraft <= portDraft);
    const currentInPool = vessels.find((v) => v.id === inputs.selectedVesselId);

    // Prefer current vessel if compliant; otherwise first compliant vessel; otherwise first in pool
    const candidate = (currentInPool && currentInPool.loadedDraft <= portDraft)
      ? currentInPool
      : compliant[0] || currentInPool || vessels[0];

    if (candidate) {
      setSelectedVessel(candidate);
      if (candidate.id !== inputs.selectedVesselId) {
        setInputs((prev) => ({
          ...prev,
          selectedVesselId: candidate.id,
          targetDraftM: candidate.loadedDraft,
          vesselBeamM: candidate.beam,
          vesselDwtMT: candidate.dwt,
          permissiblePayloadMT: candidate.permissiblePayloadMT || Math.round(candidate.dwt * 0.95),
        }));
      }
    }
  }, [inputs.cargoType, inputs.destinationPortId, inputs.selectedVesselId, selectedMajorPort.maxBerthDraftM]);

  // Handle Cargo Selection change with auto-parameters
  const handleCargoTypeChange = (selectedName: string) => {
    const matchedProfile = Object.values(CARGO_PROFILES).find(
      (p) => p.name === selectedName
    ) || CARGO_PROFILES.dry_bulk_coal;

    const filteredVessels = getVesselsForCargo(selectedName);
    const portDraft = selectedMajorPort.maxBerthDraftM;
    const compliant = filteredVessels.filter((v) => v.loadedDraft <= portDraft);
    const candidate = compliant[0] || filteredVessels[0] || CHARTERED_FLEET.vesselB;

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
    if (isSamePort) {
      alert("Origin and Destination cannot be identical. Please select different ports for coastal transit.");
      return;
    }
    if (isSelectedVesselRejected) {
      alert(`Selected vessel (${selectedVessel?.name}) draft (${selectedVessel?.loadedDraft}m) exceeds ${selectedMajorPort.name} max draft (${selectedMajorPort.maxBerthDraftM}m). Please select a compliant vessel or choose another destination port.`);
      return;
    }
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

            </div>

            {/* Routing & Direction Selection with Swap Control */}
            <div className="pt-2 border-t border-forest/10 dark:border-paper-light/10">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
                {/* Origin Port */}
                <div className="lg:col-span-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                      <Navigation className="w-3.5 h-3.5 text-mustard" />
                      Origin Port (LOCODE)
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest/10 dark:bg-paper-light/10 font-bold border border-forest/15">
                      {isOriginIndian ? "INDIA MAJOR PORT" : "INTERNATIONAL HUB"}
                    </span>
                  </div>
                  <select
                    value={inputs.originPortId}
                    onChange={(e) => setInputs({ ...inputs, originPortId: e.target.value })}
                    className={`w-full bg-paper-light dark:bg-paper-dark border rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none focus:border-forest dark:focus:border-paper-light cursor-pointer font-bold ${
                      isSamePort ? "border-red-500 ring-2 ring-red-500/30" : "border-forest/20 dark:border-paper-light/20"
                    }`}
                  >
                    <optgroup label="India (12 Major Ports)">
                      <option value="in-deendayal">Deendayal / Kandla [INIXY] - Gujarat</option>
                      <option value="in-mumbai">Mumbai Port [INBOM] - Maharashtra</option>
                      <option value="in-jnpa">JNPA / Nhava Sheva [INNSA] - Maharashtra</option>
                      <option value="in-mormugao">Mormugao [INMRM] - Goa</option>
                      <option value="in-new-mangalore">New Mangalore [INNML] - Karnataka</option>
                      <option value="in-cochin">Cochin / Kochi [INCOK] - Kerala</option>
                      <option value="in-voc">V.O. Chidambaranar / Tuticorin [INTUT] - Tamil Nadu</option>
                      <option value="in-chennai">Chennai Port [INMAA] - Tamil Nadu</option>
                      <option value="in-kamarajar">Kamarajar / Ennore [INENR] - Tamil Nadu</option>
                      <option value="in-visakhapatnam">Visakhapatnam [INVTZ] - Andhra Pradesh</option>
                      <option value="in-paradip">Paradip Port [INPRT] - Odisha</option>
                      <option value="in-smp-kolkata">Syama Prasad Mookerjee / Kolkata-Haldia [INCCU] - West Bengal</option>
                    </optgroup>
                    <optgroup label="Global Hub Ports (International)">
                      {INTERNATIONAL_DESTINATION_PORTS.map((p) => (
                        <option key={`orig-${p.id}`} value={p.id}>
                          {p.name} [{p.code}], {p.country} - Max Draft: {p.maxBerthDraftM}m
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* Swap Direction Button */}
                <div className="lg:col-span-2 flex items-center justify-center pb-0.5">
                  <button
                    type="button"
                    onClick={handleSwapPorts}
                    title="Swap Direction (⇄)"
                    className="w-full py-3 px-3 rounded-md bg-paper-light hover:bg-forest/10 dark:bg-paper-dark dark:hover:bg-paper-light/10 border border-forest/20 dark:border-paper-light/20 text-xs font-bold text-forest dark:text-paper-light transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 group"
                  >
                    <ArrowLeftRight className="w-4 h-4 text-coral group-hover:rotate-180 transition-transform duration-300" />
                    <span>Swap Direction (⇄)</span>
                  </button>
                </div>

                {/* Destination Port */}
                <div className="lg:col-span-5 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
                      <Anchor className="w-3.5 h-3.5 text-coral" />
                      Destination Port (Call)
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-forest/10 dark:bg-paper-light/10 font-bold border border-forest/15">
                      MAX DRAFT: {selectedMajorPort.maxBerthDraftM}M
                    </span>
                  </div>
                  <select
                    value={inputs.destinationPortId}
                    onChange={(e) => setInputs({ ...inputs, destinationPortId: e.target.value })}
                    className={`w-full bg-paper-light dark:bg-paper-dark border rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none focus:border-forest dark:focus:border-paper-light cursor-pointer font-bold ${
                      isSamePort ? "border-red-500 ring-2 ring-red-500/30" : "border-forest/20 dark:border-paper-light/20"
                    }`}
                  >
                    <optgroup label="India (12 Major Ports)">
                      <option value="in-deendayal">Deendayal / Kandla [INIXY] - Gujarat</option>
                      <option value="in-mumbai">Mumbai Port [INBOM] - Maharashtra</option>
                      <option value="in-jnpa">JNPA / Nhava Sheva [INNSA] - Maharashtra</option>
                      <option value="in-mormugao">Mormugao [INMRM] - Goa</option>
                      <option value="in-new-mangalore">New Mangalore [INNML] - Karnataka</option>
                      <option value="in-cochin">Cochin / Kochi [INCOK] - Kerala</option>
                      <option value="in-voc">V.O. Chidambaranar / Tuticorin [INTUT] - Tamil Nadu</option>
                      <option value="in-chennai">Chennai Port [INMAA] - Tamil Nadu</option>
                      <option value="in-kamarajar">Kamarajar / Ennore [INENR] - Tamil Nadu</option>
                      <option value="in-visakhapatnam">Visakhapatnam [INVTZ] - Andhra Pradesh</option>
                      <option value="in-paradip">Paradip Port [INPRT] - Odisha</option>
                      <option value="in-smp-kolkata">Syama Prasad Mookerjee / Kolkata-Haldia [INCCU] - West Bengal</option>
                    </optgroup>
                    <optgroup label="Global Hub Ports (International)">
                      {INTERNATIONAL_DESTINATION_PORTS.map((p) => (
                        <option key={`dest-${p.id}`} value={p.id}>
                          {p.name} [{p.code}], {p.country} - Max Draft: {p.maxBerthDraftM}m
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>
            </div>

            {/* DYNAMIC VALIDATION RULES */}
            <div className="space-y-3 pt-2">
              {/* 1. Same Port Warning Block */}
              {isSamePort && (
                <div className="p-3.5 rounded-lg bg-red-500/10 border-2 border-red-500 text-xs flex items-start gap-3 animate-in fade-in duration-200">
                  <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                  <div className="space-y-0.5">
                    <div className="font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
                      <span>Origin and Destination cannot be identical</span>
                      <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-600 text-paper-light">ROUTING BLOCKED</span>
                    </div>
                    <p className="text-forest/80 dark:text-paper-light/80 text-[11px] leading-relaxed">
                      Please select distinct loading and discharging ports for domestic coastal transit, or select an international loading hub.
                    </p>
                  </div>
                </div>
              )}

              {/* 2. Dynamic Distance & Transit Telemetry Bar */}
              <div className="p-4 rounded-lg bg-forest/5 dark:bg-paper-light/5 border border-forest/15 dark:border-paper-light/15 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-forest/60 dark:text-paper-light/60 block">
                    Voyage Classification
                  </span>
                  <span className="font-bold text-forest dark:text-paper-light flex items-center gap-1.5 mt-0.5">
                    {isDomesticVoyage ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate">Coastal Cabotage</span>
                      </>
                    ) : isExportVoyage ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                        <span className="truncate">Export (India ➔ Hub)</span>
                      </>
                    ) : isImportVoyage ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0"></span>
                        <span className="truncate">Import (Hub ➔ India)</span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-purple-500 shrink-0"></span>
                        <span className="truncate">Cross-Trade Hub</span>
                      </>
                    )}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-forest/60 dark:text-paper-light/60 block">
                    Estimated Sea Distance
                  </span>
                  <span className="font-mono font-bold text-forest dark:text-paper-light text-sm mt-0.5 block">
                    {isSamePort ? "0 NM" : `${voyageNM.toLocaleString()} NM`}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-forest/60 dark:text-paper-light/60 block">
                    Vessel Speed
                  </span>
                  <span className="font-mono font-bold text-forest dark:text-paper-light text-sm mt-0.5 block">
                    {vesselSpeed} Knots
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase font-mono tracking-wider text-forest/60 dark:text-paper-light/60 block">
                    Voyage Transit Time
                  </span>
                  <span className="font-mono font-bold text-coral text-sm mt-0.5 block">
                    {isSamePort ? "N/A" : `${transitDays} Days (${transitHours}h)`}
                  </span>
                </div>
              </div>

              {/* 3. Operational Draft vs Berth Draft Check */}
              {isDraftExceeded ? (
                <div className="p-3.5 rounded-lg bg-amber-500/10 border-2 border-amber-500/60 text-xs flex items-start gap-3">
                  <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-2 py-0.5 rounded bg-amber-500 text-paper-light uppercase">
                        Draft Warning (+{draftDifferenceM}m Over Berth Limit)
                      </span>
                      <span className="font-bold text-amber-800 dark:text-amber-300">
                        Operational Draft ({effectiveDraft}m) exceeds {selectedMajorPort.name} limit ({maxBerthDraft}m)
                      </span>
                    </div>
                    <p className="text-forest/80 dark:text-paper-light/80 text-[11px] leading-relaxed">
                      Laden vessel draft exceeds standard charted berth depth. Entering fairway requires high-water spring tidal transit or offshore lightering.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span className="text-forest/90 dark:text-paper-light/90">
                      <strong>Draft Check Passed:</strong> Vessel operational draft ({effectiveDraft}m) is within {selectedMajorPort.name}&apos;s max berth limit ({maxBerthDraft}m).
                    </span>
                  </div>
                  <span className="font-mono text-[11px] text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded bg-emerald-500/15 shrink-0">
                    Safe Margin: +{draftDifferenceM}m
                  </span>
                </div>
              )}
            </div>

            {/* Terminal-Cargo Compatibility Validation */}
            {!compatibility.isCompatible ? (
              <div className="mt-4 p-4 rounded-lg bg-coral/10 border-2 border-coral text-forest dark:text-paper-light space-y-3 animate-in fade-in duration-200">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-coral shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-coral text-paper-light">
                        STATUTORY TERMINAL REJECTION
                      </span>
                      <span className="text-xs font-bold text-coral">
                        {selectedMajorPort?.name} ({selectedMajorPort?.code})
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-forest/90 dark:text-paper-light/90 font-medium leading-relaxed">
                      {compatibility.rejectionReason}
                    </p>
                  </div>
                </div>

                {/* Authorized Cargo Classes */}
                <div className="text-xs bg-paper-surface/60 dark:bg-paper-dark-surface/60 p-2.5 rounded border border-forest/10 dark:border-paper-light/10">
                  <span className="font-bold text-forest/80 dark:text-paper-light/80">Authorized Cargo Classes at {selectedMajorPort?.name}: </span>
                  <span className="text-forest/70 dark:text-paper-light/70">
                    {selectedMajorPort?.allowedCargoTypes.join(" • ")}
                  </span>
                </div>

                {/* 1-Click Compliant Port Alternatives */}
                {compatibility.suggestedAlternatives && compatibility.suggestedAlternatives.length > 0 && (
                  <div className="pt-2 border-t border-coral/20 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-bold text-forest/80 dark:text-paper-light/80">
                      Suggested Compliant Alternative Ports:
                    </span>
                    {compatibility.suggestedAlternatives.map((alt) => (
                      <button
                        key={alt.id}
                        type="button"
                        onClick={() => setInputs((prev) => ({ ...prev, destinationPortId: alt.id }))}
                        className="px-3 py-1 text-xs font-bold bg-forest text-paper-light dark:bg-paper-light dark:text-forest rounded hover:bg-forest/80 dark:hover:bg-paper-light/80 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <span>Switch to {alt.name} ({alt.code})</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-4 p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="text-forest/90 dark:text-paper-light/90">
                    <strong>Terminal Cargo Verified:</strong> {selectedMajorPort?.name} ({selectedMajorPort?.code}) is statutorily cleared for <em>{inputs.cargoType}</em> under {selectedMajorPort?.imoStandard}.
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-forest/70 dark:text-paper-light/70">
                  <span className="px-2 py-0.5 rounded bg-forest/5 dark:bg-paper-light/10 border border-forest/15">
                    Berth Max Draft: {selectedMajorPort?.maxBerthDraftM}m
                  </span>
                  <span className="px-2 py-0.5 rounded bg-forest/5 dark:bg-paper-light/10 border border-forest/15">
                    LOA: {selectedMajorPort?.maxLOAM}m
                  </span>
                </div>
              </div>
            )}
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
                <p className="text-xs text-forest/70 dark:text-paper-light/70">
                  Select a ship below to check port fit, fuel costs, and voyage safety.
                </p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-forest/10 dark:bg-paper-light/10 text-forest dark:text-paper-light font-bold">
                {availableVessels.length} SHIPS AVAILABLE
              </span>
            </div>

            {availableVessels.length === 0 ? (
              <div className="p-8 rounded-lg bg-coral/10 border border-coral text-coral text-sm text-center font-medium">
                No compliant chartered vessels in range for this cargo class. Adjust filters or port radius.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Alert if all vessels in category exceed port draft */}
                {availableVessels.every((v) => v.loadedDraft > selectedMajorPort.maxBerthDraftM) && (
                  <div className="p-4 rounded-lg bg-red-500/10 border-2 border-red-500 text-xs flex items-start gap-3 animate-in fade-in">
                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <div className="font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
                        <span>All Available Ships Too Deep for {selectedMajorPort.name} (Max Allowed Depth: {selectedMajorPort.maxBerthDraftM}m)</span>
                        <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-red-600 text-paper-light">CANNOT DOCK</span>
                      </div>
                      <p className="text-forest/80 dark:text-paper-light/80 text-[11px] leading-relaxed">
                        None of the ships for {inputs.cargoType} can safely enter this port without risking getting stuck. Please select a deeper port (like Visakhapatnam at 18.1m) or plan for cargo transfer at sea.
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {availableVessels.map((v) => {
                    const isSelected = selectedVessel?.id === v.id;
                    const isVesselDraftExceeded = v.loadedDraft > selectedMajorPort.maxBerthDraftM;
                    const ukcMargin = Number((selectedMajorPort.maxBerthDraftM - v.loadedDraft).toFixed(1));

                    return (
                      <div
                        key={v.id}
                        onClick={() => {
                          if (!isVesselDraftExceeded) {
                            handleSelectVessel(v);
                          }
                        }}
                        className={`p-6 rounded-lg border transition-all space-y-3 relative ${
                          isVesselDraftExceeded
                            ? "bg-red-50/40 dark:bg-red-950/15 border-red-300 dark:border-red-900/50 cursor-not-allowed opacity-80"
                            : isSelected
                            ? "bg-forest/10 dark:bg-paper-light/10 border-forest dark:border-paper-light ring-2 ring-coral cursor-pointer"
                            : "bg-paper-surface/40 dark:bg-paper-dark-surface/30 border-forest/15 dark:border-paper-light/15 hover:border-forest/40 cursor-pointer"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="font-serif font-bold text-lg text-forest dark:text-paper-light flex items-center gap-1.5">
                              <span>{v.name}</span>
                              {isSelected && !isVesselDraftExceeded && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              )}
                            </div>
                            <div className="text-[10px] font-mono text-forest/60 dark:text-paper-light/60 mt-0.5">
                              IMO: {v.imoNumber} &bull; Flag: {v.flag}
                            </div>
                          </div>

                          {/* DYNAMIC REACTIVE COMPLIANCE BADGE */}
                          {isVesselDraftExceeded ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-100 text-red-700 border border-red-300 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800 font-bold uppercase shrink-0">
                              REJECTED
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800 font-bold uppercase shrink-0">
                              RECOMMENDED
                            </span>
                          )}
                        </div>

                        {/* EXPLICIT PLAIN-ENGLISH REJECTION NOTICE OR CLEARANCE */}
                        {isVesselDraftExceeded ? (
                          <div className="p-2.5 rounded bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs font-medium leading-relaxed">
                            ⚠️ Ship Too Deep: This ship needs {v.loadedDraft}m water depth, but {selectedMajorPort.name} only allows {selectedMajorPort.maxBerthDraftM}m. It risks getting stuck.
                          </div>
                        ) : (
                          <div className="p-2 rounded bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
                            ✓ Safe to Enter: Fits port with {ukcMargin.toFixed(1)}m safety water depth.
                          </div>
                        )}

                        <p className="text-xs text-forest/75 dark:text-paper-light/75 leading-relaxed font-sans min-h-[2.5rem]">
                          {v.description}
                        </p>

                        <div className="pt-3 border-t border-forest/10 dark:border-paper-light/10 grid grid-cols-2 gap-2 text-xs font-mono text-forest/80 dark:text-paper-light/80">
                          <div>
                            Depth Needed (Draft):{" "}
                            <strong className={isVesselDraftExceeded ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}>
                              {v.loadedDraft}m
                            </strong>
                          </div>
                          <div>Ship Width: <strong>{v.beam}m</strong></div>
                          <div>Max Cargo (DWT): <strong>{v.dwt.toLocaleString()} Tonnes</strong></div>
                          <div>Daily Cost: <strong>${v.freightDailyRate.toLocaleString()}/day</strong></div>
                        </div>

                        <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-forest/60 dark:text-paper-light/60">
                          <span className="truncate">Port: {v.currentPort}</span>
                          {isVesselDraftExceeded ? (
                            <span className="font-bold text-red-600 dark:text-red-400">
                              Cannot Dock (Too Deep)
                            </span>
                          ) : (
                            <span className="font-bold text-coral">
                              {isSelected ? "✓ Selected Ship" : "Select Ship"}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-forest/15 dark:border-paper-light/15">
            <div className="text-xs text-forest/70 dark:text-paper-light/70">
              All candidate ships are automatically verified against port depth and safety regulations.
            </div>

            <button
              type="submit"
              disabled={isFormBlocked}
              className={`inline-flex items-center justify-center gap-3 px-8 py-4 rounded-md text-sm font-bold tracking-wide border shadow-editorial transition-all ${
                isFormBlocked
                  ? "bg-forest/40 text-paper-light/50 border-forest/20 cursor-not-allowed opacity-60"
                  : "bg-forest text-paper-light dark:bg-paper-light dark:text-forest border-forest dark:border-paper-light hover:translate-x-[-1px] hover:translate-y-[-1px] cursor-pointer"
              }`}
            >
              <span>
                {isSamePort
                  ? "Cannot Proceed: Origin and Destination are Identical"
                  : isTerminalIncompatible
                  ? "Cannot Proceed: Selected Port Cannot Handle This Cargo"
                  : isSelectedVesselRejected
                  ? "Cannot Proceed: Selected Ship Too Deep for Port"
                  : "Analyze Voyage & Calculate Costs →"}
              </span>
              {!isFormBlocked && <ArrowRight className="w-4 h-4 text-coral" />}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

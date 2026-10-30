"use client";

import React, { useState, useMemo } from "react";
import {
  IMO_PORTS,
  IMO_CARGO_TYPES,
  IMO_VESSELS,
  ImoPort,
  ImoCargoType,
  ImoVessel,
} from "@/data/imo-shipment-data";
import {
  calculateDynamicImoShipment,
  DynamicVoyageCalculation,
} from "@/lib/imo-maritime-engine";
import { persistImoShipment } from "@/lib/imo-maritime-service";
import RAGMaritimeAssistant from "./RAGMaritimeAssistant";
import {
  Ship,
  Anchor,
  Compass,
  Navigation,
  Wind,
  Waves,
  Calendar,
  Clock,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileText,
  DollarSign,
  Fuel,
  Leaf,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  ChevronDown,
  ChevronUp,
  FileCheck2,
  Save,
  Check,
  Gauge,
  Thermometer,
} from "lucide-react";

export default function ImoShipmentDashboard() {
  // Preset Scenarios
  const PRESET_SCENARIOS = [
    {
      id: "paradip_coal",
      label: "Paradip [INPRT] Thermal Coal",
      badge: "75k MT IMSBC B",
      origin: "singapore",
      dest: "in-paradip",
      cargo: "dry_bulk_imsbc",
      vessel: "vesselB",
      tonnage: 75000,
    },
    {
      id: "jnpa_containers",
      label: "JNPA [INNSA] Electronics TEU",
      badge: "42k MT IMDG 9",
      origin: "singapore",
      dest: "in-jnpa",
      cargo: "container_dry",
      vessel: "vesselB",
      tonnage: 42000,
    },
    {
      id: "cochin_lng",
      label: "Cochin [INCOK] Cryogenic LNG",
      badge: "68k MT UN 1972",
      origin: "ras_laffan",
      dest: "in-cochin",
      cargo: "lng_cryogenic",
      vessel: "vesselGas",
      tonnage: 68000,
    },
    {
      id: "kandla_crude",
      label: "Kandla [INIXY] Crude Oil",
      badge: "80k MT UN 1267",
      origin: "fujairah",
      dest: "in-deendayal",
      cargo: "liquid_crude_pol",
      vessel: "vesselTanker",
      tonnage: 80000,
    },
    {
      id: "ennore_roro",
      label: "Ennore [INENR] Ro-Ro Auto",
      badge: "15k MT UN 3166",
      origin: "singapore",
      dest: "in-kamarajar",
      cargo: "ro_ro_automotive",
      vessel: "vesselA",
      tonnage: 15000,
    },
  ];

  // Component State
  const [originPortId, setOriginPortId] = useState<string>("singapore");
  const [destPortId, setDestPortId] = useState<string>("in-paradip");
  const [cargoTypeId, setCargoTypeId] = useState<string>("dry_bulk_imsbc");
  const [selectedVesselId, setSelectedVesselId] = useState<string>("vesselB");
  const [cargoTonnage, setCargoTonnage] = useState<number>(75000);
  const [laycanDate, setLaycanDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );

  const [activeTab, setActiveTab] = useState<"VGM" | "DG_MANIFEST" | "SDS" | "BILL_LADING">("VGM");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [expandedSection, setExpandedSection] = useState<string | null>("all");

  // Reactive Calculation
  const calculation: DynamicVoyageCalculation = useMemo(() => {
    return calculateDynamicImoShipment({
      originPortId,
      destPortId,
      cargoTypeId,
      vesselId: selectedVesselId,
      cargoTonnageMT: cargoTonnage,
      laycanDate,
    });
  }, [originPortId, destPortId, cargoTypeId, selectedVesselId, cargoTonnage, laycanDate]);

  const handleApplyPreset = (preset: typeof PRESET_SCENARIOS[0]) => {
    setOriginPortId(preset.origin);
    setDestPortId(preset.dest);
    setCargoTypeId(preset.cargo);
    setSelectedVesselId(preset.vessel);
    setCargoTonnage(preset.tonnage);
  };

  const handleSaveToAudit = async () => {
    setSaveStatus("saving");
    await persistImoShipment(calculation);
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 3000);
    }, 400);
  };

  // Color helper for CII ratings
  const getCiiBadgeColor = (rating: string) => {
    switch (rating) {
      case "A":
        return "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30";
      case "B":
        return "bg-lime-500/15 text-lime-700 dark:text-lime-400 border-lime-500/30";
      case "C":
        return "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30";
      case "D":
        return "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-500/30";
      case "E":
      default:
        return "bg-coral/15 text-coral border-coral/30";
    }
  };

  const getCongestionBadgeColor = (status: string) => {
    if (status.includes("Low")) return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20";
    if (status.includes("Moderate")) return "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20";
    return "bg-coral/10 text-coral border-coral/20";
  };

  return (
    <section className="space-y-8 rounded-2xl bg-paper-surface/60 dark:bg-paper-dark-surface/50 border border-forest/15 dark:border-paper-light/15 p-6 sm:p-8 shadow-sm">
      {/* Header & Standard Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-forest/15 dark:border-paper-light/15">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest uppercase text-coral">
            <ShieldCheck className="w-4 h-4 text-coral" />
            <span>IMO & UN/LOCODE Statutory Maritime Intelligence Console</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-black text-forest dark:text-paper-light tracking-tight mt-1">
            Dynamic Shipment & Fleet Compliance Monitor
          </h2>
          <p className="text-xs sm:text-sm text-forest/70 dark:text-paper-light/70 font-normal mt-1 max-w-2xl">
            Live deterministic computations conforming to IMO Conventions (MARPOL Annex VI, SOLAS VI/VII, IMSBC, IMDG, IGC Codes). Data dynamically recalibrates upon selecting any port or cargo.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-center">
          <button
            type="button"
            onClick={handleSaveToAudit}
            disabled={saveStatus === "saving"}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-xs font-bold transition-all hover:bg-forest/90 dark:hover:bg-paper-light/90 disabled:opacity-50 cursor-pointer shadow-sm"
          >
            {saveStatus === "saving" ? (
              <>
                <Clock className="w-3.5 h-3.5 animate-spin" />
                <span>Recording Audit...</span>
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Saved to Relational DB</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-coral" />
                <span>Save to Fleet Log</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Preset Quick Selectors */}
      <div className="space-y-2">
        <label className="text-[11px] font-mono uppercase tracking-wider text-forest/60 dark:text-paper-light/60 font-bold flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-mustard" />
          <span>Real-World Benchmark Scenarios:</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {PRESET_SCENARIOS.map((p) => {
            const isActive =
              originPortId === p.origin &&
              destPortId === p.dest &&
              cargoTypeId === p.cargo;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleApplyPreset(p)}
                className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all flex items-center gap-2 ${
                  isActive
                    ? "bg-forest text-paper-light dark:bg-paper-light dark:text-forest border-forest dark:border-paper-light shadow-sm font-bold"
                    : "bg-paper-light dark:bg-paper-dark border-forest/20 dark:border-paper-light/20 text-forest/80 dark:text-paper-light/80 hover:border-forest/50"
                }`}
              >
                <span>{p.label}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                    isActive
                      ? "bg-paper-light/20 text-paper-light dark:bg-forest/20 dark:text-forest font-bold"
                      : "bg-forest/5 dark:bg-paper-light/5 text-coral"
                  }`}
                >
                  {p.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Reactive Dropdown Controls Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-5 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15">
        {/* Origin Port */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-coral" />
            <span>Origin Port (LOCODE)</span>
          </label>
          <select
            value={originPortId}
            onChange={(e) => setOriginPortId(e.target.value)}
            className="w-full bg-paper-surface dark:bg-paper-dark-surface border border-forest/20 dark:border-paper-light/20 rounded-md p-2.5 text-xs text-forest dark:text-paper-light font-bold focus:outline-none cursor-pointer"
          >
            <optgroup label="International Supply Hubs">
              <option value="singapore">Singapore [SGSIN] - Jurong / PSA</option>
              <option value="port_hedland">Port Hedland [AUPHE] - Australia</option>
              <option value="richards_bay">Richards Bay [ZARCB] - South Africa</option>
              <option value="ras_laffan">Ras Laffan [QARLF] - Qatar LNG Hub</option>
              <option value="fujairah">Fujairah [AEFJR] - UAE Bunkers</option>
              <option value="rotterdam">Rotterdam [NLRTM] - Europe</option>
            </optgroup>
            <optgroup label="Indian Coastal Major Ports">
              <option value="in-paradip">Paradip Port [INPRT]</option>
              <option value="in-visakhapatnam">Visakhapatnam [INVTZ]</option>
              <option value="in-chennai">Chennai Port [INMAA]</option>
              <option value="in-jnpa">JNPA / Nhava Sheva [INNSA]</option>
              <option value="in-cochin">Cochin Port [INCOK]</option>
              <option value="in-deendayal">Deendayal / Kandla [INIXY]</option>
            </optgroup>
          </select>
          <div className="text-[11px] font-mono text-forest/50 dark:text-paper-light/50 flex items-center justify-between">
            <span>UN/LOCODE: {calculation.originPort.locode}</span>
            <span>{calculation.originPort.country}</span>
          </div>
        </div>

        {/* Destination Port */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-mustard" />
            <span>Destination Port (Call)</span>
          </label>
          <select
            value={destPortId}
            onChange={(e) => setDestPortId(e.target.value)}
            className="w-full bg-paper-surface dark:bg-paper-dark-surface border border-forest/20 dark:border-paper-light/20 rounded-md p-2.5 text-xs text-forest dark:text-paper-light font-bold focus:outline-none cursor-pointer"
          >
            <optgroup label="East Coast (Bay of Bengal)">
              <option value="in-paradip">Paradip Port [INPRT] (Draft: 14.5m)</option>
              <option value="in-visakhapatnam">Visakhapatnam [INVTZ] (Draft: 18.1m)</option>
              <option value="in-kamarajar">Kamarajar / Ennore [INENR] (Draft: 16.0m)</option>
              <option value="in-chennai">Chennai Port [INMAA] (Draft: 15.5m)</option>
              <option value="in-voc">V.O. Chidambaranar / Tuticorin [INTUT] (Draft: 14.2m)</option>
              <option value="in-smp-haldia">Haldia Dock [INHAL] (Draft: 10.5m)</option>
              <option value="in-smp-kolkata">Kolkata Dock [INCCU] (Draft: 8.0m)</option>
            </optgroup>
            <optgroup label="West Coast (Arabian Sea)">
              <option value="in-jnpa">JNPA / Nhava Sheva [INNSA] (Draft: 15.0m)</option>
              <option value="in-deendayal">Deendayal / Kandla [INIXY] (Draft: 13.0m)</option>
              <option value="in-cochin">Cochin Port [INCOK] (Draft: 14.5m)</option>
              <option value="in-mormugao">Mormugao Port [INMRM] (Draft: 14.1m)</option>
              <option value="in-new-mangalore">New Mangalore [INNML] (Draft: 14.0m)</option>
            </optgroup>
          </select>
          <div className="text-[11px] font-mono text-forest/50 dark:text-paper-light/50 flex items-center justify-between">
            <span>UN/LOCODE: {calculation.destPort.locode}</span>
            <span>Max Berth Draft: {calculation.destPort.maxBerthDraftM}m</span>
          </div>
        </div>

        {/* Cargo Type */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-coral" />
            <span>Cargo Type / IMO Class</span>
          </label>
          <select
            value={cargoTypeId}
            onChange={(e) => {
              setCargoTypeId(e.target.value);
              const defaultTon = IMO_CARGO_TYPES[e.target.value]?.defaultTonnageMT;
              if (defaultTon) setCargoTonnage(defaultTon);
            }}
            className="w-full bg-paper-surface dark:bg-paper-dark-surface border border-forest/20 dark:border-paper-light/20 rounded-md p-2.5 text-xs text-forest dark:text-paper-light font-bold focus:outline-none cursor-pointer"
          >
            <option value="dry_bulk_imsbc">Dry Bulk: Thermal Coal / Ore (IMSBC Group B)</option>
            <option value="container_dry">Containerized Goods: Electronics (IMDG Class 9)</option>
            <option value="liquid_crude_pol">Bulk Liquid: Crude Oil (IMDG Class 3 / UN 1267)</option>
            <option value="lng_cryogenic">LNG: Cryogenic Liquefied Gas (IGC Code / UN 1972)</option>
            <option value="dangerous_goods_chem">Dangerous Goods: Chemicals (IMDG Class 8 PG I)</option>
            <option value="breakbulk_machinery">Breakbulk: Heavy Machinery (CSS Code Annex 13)</option>
            <option value="ro_ro_automotive">Ro-Ro: Wheeled Rolling Stock (IMDG Class 9)</option>
          </select>
          <div className="text-[11px] font-mono text-coral font-semibold truncate">
            {calculation.cargo.hazardClassification}
          </div>
        </div>

        {/* Cargo Tonnage & Departure */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-forest/70 dark:text-paper-light/70" />
            <span>Quantity (MT) & Laycan</span>
          </label>
          <div className="flex gap-2">
            <input
              type="number"
              value={cargoTonnage}
              onChange={(e) => setCargoTonnage(Number(e.target.value))}
              step={1000}
              min={5000}
              className="w-1/2 bg-paper-surface dark:bg-paper-dark-surface border border-forest/20 dark:border-paper-light/20 rounded-md p-2 text-xs text-forest dark:text-paper-light font-mono font-bold focus:outline-none"
            />
            <input
              type="date"
              value={laycanDate}
              onChange={(e) => setLaycanDate(e.target.value)}
              className="w-1/2 bg-paper-surface dark:bg-paper-dark-surface border border-forest/20 dark:border-paper-light/20 rounded-md p-2 text-xs text-forest dark:text-paper-light font-mono focus:outline-none"
            />
          </div>
          <div className="text-[11px] font-mono text-forest/50 dark:text-paper-light/50">
            Density: {calculation.cargo.densityT_M3} t/m³ | Stowage: {calculation.cargo.stowageFactorM3_MT} m³/t
          </div>
        </div>
      </div>

      {/* DYNAMIC 4-COLUMN MARITIME METRICS DISPLAY */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Nautical Distance & Dynamic ETA */}
        <div className="p-4 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-forest/60 dark:text-paper-light/60">
            <span className="font-bold uppercase flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-coral" />
              Routing & ETA
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest/5 dark:bg-paper-light/5 font-mono">
              {calculation.vessel.serviceSpeedKnots} KTS
            </span>
          </div>

          <div>
            <div className="text-2xl font-serif font-black text-forest dark:text-paper-light">
              {calculation.distanceNM.toLocaleString()} <span className="text-sm font-sans font-normal text-forest/60 dark:text-paper-light/60">NM</span>
            </div>
            <div className="text-xs text-forest/70 dark:text-paper-light/70 font-mono mt-0.5">
              Transit: {calculation.transitDays} Days ({calculation.transitHours}h sea leg)
            </div>
          </div>

          <div className="pt-2 border-t border-forest/10 dark:border-paper-light/10 space-y-1.5 text-xs font-mono">
            <div className="flex justify-between items-center text-forest/70 dark:text-paper-light/70">
              <span>Pilot Boarding:</span>
              <strong className="text-forest dark:text-paper-light text-[11px]">{calculation.etaPilotStation}</strong>
            </div>
            <div className="flex justify-between items-center text-forest/70 dark:text-paper-light/70">
              <span>Berth Arrival:</span>
              <strong className="text-coral text-[11px]">{calculation.etaBerthArrival}</strong>
            </div>
            <div className="text-[10px] text-forest/50 dark:text-paper-light/50">
              *Includes +{calculation.preBerthingWaitHours}h pre-berthing queue
            </div>
          </div>
        </div>

        {/* Metric 2: Berth Congestion & Port Tariffs */}
        <div className="p-4 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-forest/60 dark:text-paper-light/60">
            <span className="font-bold uppercase flex items-center gap-1">
              <Anchor className="w-3.5 h-3.5 text-mustard" />
              Berth & Tariffs
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded border font-bold ${getCongestionBadgeColor(calculation.destPort.congestion.status)}`}>
              {calculation.destPort.congestion.status}
            </span>
          </div>

          <div>
            <div className="text-2xl font-serif font-black text-forest dark:text-paper-light">
              ${calculation.tariffsUSD.totalPortTariffUSD.toLocaleString()}
            </div>
            <div className="text-xs font-mono text-emerald-600 dark:text-emerald-400 font-bold mt-0.5">
              ₹{calculation.tariffsUSD.totalPortTariffINR.toLocaleString()} INR
            </div>
          </div>

          <div className="pt-2 border-t border-forest/10 dark:border-paper-light/10 space-y-1 text-xs font-mono text-forest/70 dark:text-paper-light/70">
            <div className="flex justify-between">
              <span>Avg Pre-Berth Wait:</span>
              <strong>{calculation.destPort.congestion.avgPreBerthingHours} Hours</strong>
            </div>
            <div className="flex justify-between">
              <span>Queued Vessels:</span>
              <strong>{calculation.destPort.congestion.queuedVesselsCount} Ships at Roads</strong>
            </div>
            <div className="flex justify-between text-[11px]">
              <span>Pilot + Berth + Tugs:</span>
              <span>${(calculation.tariffsUSD.pilotage + calculation.tariffsUSD.berthHire + calculation.tariffsUSD.tugAssistance).toLocaleString()}</span>
            </div>
            {calculation.tariffsUSD.greenIncentiveCredit > 0 && (
              <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span>Green ESI Discount:</span>
                <span>-${calculation.tariffsUSD.greenIncentiveCredit.toLocaleString()}</span>
              </div>
            )}
          </div>
        </div>

        {/* Metric 3: Weather, Sea State & Beaufort Scale */}
        <div className="p-4 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-forest/60 dark:text-paper-light/60">
            <span className="font-bold uppercase flex items-center gap-1">
              <Waves className="w-3.5 h-3.5 text-blue-500" />
              Weather & Sea State
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold font-mono">
              BFT {calculation.destPort.weatherSeaState.beaufortScale}
            </span>
          </div>

          <div>
            <div className="text-2xl font-serif font-black text-forest dark:text-paper-light">
              {calculation.destPort.weatherSeaState.waveHeightM}m <span className="text-xs font-sans font-normal text-forest/60 dark:text-paper-light/60">Significant Wave</span>
            </div>
            <div className="text-xs text-forest/70 dark:text-paper-light/70 font-mono mt-0.5">
              {calculation.destPort.weatherSeaState.beaufortDescription}
            </div>
          </div>

          <div className="pt-2 border-t border-forest/10 dark:border-paper-light/10 space-y-1 text-xs font-mono text-forest/70 dark:text-paper-light/70">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-1">
                <Wind className="w-3 h-3 text-forest/50 dark:text-paper-light/50" />
                Wind:
              </span>
              <strong>{calculation.destPort.weatherSeaState.windSpeedKnots} kts ({calculation.destPort.weatherSeaState.windDirection})</strong>
            </div>
            <div className="flex justify-between">
              <span>Swell Condition:</span>
              <strong>{calculation.destPort.weatherSeaState.swellDirection}</strong>
            </div>
            <div className="flex justify-between">
              <span>Tidal Range / Current:</span>
              <strong>{calculation.destPort.weatherSeaState.tidalRangeM}m / {calculation.destPort.weatherSeaState.currentSpeedKnots} kts</strong>
            </div>
          </div>
        </div>

        {/* Metric 4: IMO CII & MARPOL Annex VI Decarbonization */}
        <div className="p-4 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-forest/60 dark:text-paper-light/60">
            <span className="font-bold uppercase flex items-center gap-1">
              <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              IMO CII Rating
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded border font-black font-serif ${getCiiBadgeColor(calculation.ciiRating)}`}>
              GRADE {calculation.ciiRating}
            </span>
          </div>

          <div>
            <div className="text-2xl font-serif font-black text-forest dark:text-paper-light">
              {calculation.attainedCII} <span className="text-xs font-sans font-normal text-forest/60 dark:text-paper-light/60">g CO₂/DWT·NM</span>
            </div>
            <div className="text-xs font-mono text-forest/70 dark:text-paper-light/70 mt-0.5">
              Ref Baseline: {calculation.requiredCII} (Ratio: {calculation.ciiRatio})
            </div>
          </div>

          <div className="pt-2 border-t border-forest/10 dark:border-paper-light/10 space-y-1 text-xs font-mono text-forest/70 dark:text-paper-light/70">
            <div className="flex justify-between">
              <span>Total Fuel Consumed:</span>
              <strong>{calculation.totalFuelBurnMT} MT {calculation.vessel.fuelType}</strong>
            </div>
            <div className="flex justify-between">
              <span>GHG CO₂ Emitted:</span>
              <strong>{calculation.totalCo2EmissionsMT} MT</strong>
            </div>
            <div className="flex justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-bold truncate">
              <span>MARPOL Annex VI:</span>
              <span>{calculation.marpolAnnexViStatus.slice(0, 22)}...</span>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILED DYNAMIC CONTEXT ACCORDION: STOWAGE, SEGREGATION & STATUTORY DOCS */}
      <div className="space-y-6 pt-4 border-t border-forest/15 dark:border-paper-light/15">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column: Cargo Stowage & Segregation Protocol */}
          <div className="p-5 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-paper-light/10">
              <h3 className="font-serif text-base font-bold text-forest dark:text-paper-light flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-coral" />
                <span>Cargo Stowage & Segregation Protocol</span>
              </h3>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-coral/10 text-coral font-bold uppercase border border-coral/20">
                {calculation.cargo.unNumber}
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-forest/50 dark:text-paper-light/50">
                  STATUTORY IMO REGULATORY MANDATE:
                </span>
                <p className="text-forest dark:text-paper-light font-medium mt-0.5">
                  {calculation.cargo.imoConvention}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-forest/50 dark:text-paper-light/50">
                  STOWAGE & SEGREGATION PROTOCOL:
                </span>
                <p className="text-forest/80 dark:text-paper-light/80 leading-relaxed font-mono mt-0.5 bg-forest/5 dark:bg-paper-light/5 p-2.5 rounded border border-forest/10 dark:border-paper-light/10">
                  {calculation.cargo.stowageSegregationProtocol}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="p-2.5 rounded bg-forest/5 dark:bg-paper-light/5 border border-forest/10 dark:border-paper-light/10">
                  <span className="text-[10px] font-mono uppercase text-forest/50 dark:text-paper-light/50 font-bold block">
                    TARGET TEMP & PRESSURE
                  </span>
                  <span className="text-xs font-mono font-bold text-forest dark:text-paper-light mt-0.5 block">
                    {calculation.cargo.targetStorageTempPressure}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-forest/5 dark:bg-paper-light/5 border border-forest/10 dark:border-paper-light/10">
                  <span className="text-[10px] font-mono uppercase text-forest/50 dark:text-paper-light/50 font-bold block">
                    EMERGENCY SCHEDULE (EmS)
                  </span>
                  <span className="text-xs font-mono font-bold text-coral mt-0.5 block">
                    {calculation.cargo.sds.emergencyScheduleEmS}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono font-bold text-forest/50 dark:text-paper-light/50">
                  GREEN CORRIDOR & SHORE POWER DIRECTIVE:
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[10px] font-mono font-semibold border border-emerald-500/20">
                    {calculation.destPort.greenCorridor.marpolAnnexViZone}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-forest/5 dark:bg-paper-light/5 text-forest/70 dark:text-paper-light/70 text-[10px] font-mono border border-forest/10 dark:border-paper-light/10">
                    {calculation.destPort.greenCorridor.shorePowerAvailable ? "✓ Shore Power (AMP) Active" : "No High-Voltage AMP"}
                  </span>
                  {calculation.destPort.greenCorridor.cleanBunkerFuelAvailable.map((f) => (
                    <span key={f} className="px-1.5 py-0.5 rounded bg-forest/5 dark:bg-paper-light/5 text-forest/60 dark:text-paper-light/60 text-[10px] font-mono">
                      {f} Bunker
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Interactive Statutory Documents & SDS Inspector */}
          <div className="p-5 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-forest/10 dark:border-paper-light/10">
              <h3 className="font-serif text-base font-bold text-forest dark:text-paper-light flex items-center gap-2">
                <FileText className="w-4 h-4 text-mustard" />
                <span>Required IMO Declarations & SDS</span>
              </h3>
              <div className="flex gap-1">
                {(["VGM", "DG_MANIFEST", "SDS", "BILL_LADING"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                      activeTab === tab
                        ? "bg-forest text-paper-light dark:bg-paper-light dark:text-forest font-bold"
                        : "bg-forest/5 dark:bg-paper-light/5 text-forest/70 dark:text-paper-light/70 hover:bg-forest/10"
                    }`}
                  >
                    {tab.replace("_", " ")}
                  </button>
                ))}
              </div>
            </div>

            {/* Document Content View */}
            <div className="p-4 rounded-lg bg-paper-surface/60 dark:bg-paper-dark-surface/50 border border-forest/10 dark:border-paper-light/10 font-mono text-xs space-y-3">
              {activeTab === "VGM" && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex justify-between items-center text-forest/60 dark:text-paper-light/60 text-[11px] pb-1 border-b border-forest/10 dark:border-paper-light/10">
                    <span>SOLAS Chapter VI Reg 2 Certificate</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">VERIFIED</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Certificate Number:</span>
                    <span className="font-bold text-forest dark:text-paper-light">{calculation.statutoryDocs.vgmCertificate.certificateNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Verified Gross Mass:</span>
                    <span className="font-bold text-coral text-sm">{calculation.statutoryDocs.vgmCertificate.verifiedGrossMassMT.toLocaleString()} MT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Weighing Method:</span>
                    <span className="text-forest dark:text-paper-light text-[11px] text-right max-w-[240px]">{calculation.statutoryDocs.vgmCertificate.method}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Scale Ticket Ref:</span>
                    <span className="text-forest dark:text-paper-light">{calculation.statutoryDocs.vgmCertificate.scaleTicketId}</span>
                  </div>
                  <div className="pt-2 text-[10px] text-forest/50 dark:text-paper-light/50 border-t border-forest/10 dark:border-paper-light/10">
                    Signatory: {calculation.statutoryDocs.vgmCertificate.authorizedSignatory}
                  </div>
                </div>
              )}

              {activeTab === "DG_MANIFEST" && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex justify-between items-center text-forest/60 dark:text-paper-light/60 text-[11px] pb-1 border-b border-forest/10 dark:border-paper-light/10">
                    <span>IMO Dangerous Goods Manifest (FAL Form 7)</span>
                    <span className="text-coral font-bold">{calculation.cargo.imdgClass}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">UN Number:</span>
                    <span className="font-bold text-coral">{calculation.statutoryDocs.dgManifest.unNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Proper Shipping Name:</span>
                    <span className="font-bold text-forest dark:text-paper-light text-[11px] text-right truncate max-w-[220px]">
                      {calculation.statutoryDocs.dgManifest.properShippingName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Packing Group / Flashpoint:</span>
                    <span className="text-forest dark:text-paper-light">{calculation.statutoryDocs.dgManifest.packingGroup} • {calculation.statutoryDocs.dgManifest.flashpoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Marine Pollutant Status:</span>
                    <span className="font-bold text-forest dark:text-paper-light">
                      {calculation.statutoryDocs.dgManifest.marinePollutant ? "YES (MARPOL Regulated)" : "NO"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Emergency Schedule:</span>
                    <span className="text-coral font-bold">{calculation.statutoryDocs.dgManifest.emergencyScheduleEmS}</span>
                  </div>
                </div>
              )}

              {activeTab === "SDS" && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex justify-between items-center text-forest/60 dark:text-paper-light/60 text-[11px] pb-1 border-b border-forest/10 dark:border-paper-light/10">
                    <span>Safety Data Sheet (SDS) Chemical Profile</span>
                    <span className="font-bold text-forest dark:text-paper-light">ERG #{calculation.statutoryDocs.sdsSummary.ergGuideNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">CAS Registry No:</span>
                    <span className="font-bold text-forest dark:text-paper-light">{calculation.statutoryDocs.sdsSummary.casNumber}</span>
                  </div>
                  <div>
                    <span className="text-forest/60 dark:text-paper-light/60 block text-[10px] uppercase font-bold">Firefighting Protocol:</span>
                    <p className="text-forest/80 dark:text-paper-light/80 text-[11px] leading-relaxed mt-0.5">
                      {calculation.statutoryDocs.sdsSummary.firefightingAgent}
                    </p>
                  </div>
                  <div>
                    <span className="text-forest/60 dark:text-paper-light/60 block text-[10px] uppercase font-bold">Spillage & Bilge Isolation:</span>
                    <p className="text-forest/80 dark:text-paper-light/80 text-[11px] leading-relaxed mt-0.5">
                      {calculation.statutoryDocs.sdsSummary.spillMitigation}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === "BILL_LADING" && (
                <div className="space-y-2 animate-fadeIn">
                  <div className="flex justify-between items-center text-forest/60 dark:text-paper-light/60 text-[11px] pb-1 border-b border-forest/10 dark:border-paper-light/10">
                    <span>Clean On-Board Ocean Bill of Lading</span>
                    <span className="text-forest dark:text-paper-light font-bold">{calculation.statutoryDocs.billOfLading.blNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Carrier / Vessel:</span>
                    <span className="font-bold text-forest dark:text-paper-light">{calculation.statutoryDocs.billOfLading.carrier}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Port of Loading (POL):</span>
                    <span className="text-forest dark:text-paper-light">{calculation.statutoryDocs.billOfLading.portOfLoading}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">Port of Discharge (POD):</span>
                    <span className="font-bold text-coral">{calculation.statutoryDocs.billOfLading.portOfDischarge}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest/60 dark:text-paper-light/60">ISPS Security Level:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{calculation.statutoryDocs.ispsAndHealth.ispsSecurityLevel}</span>
                  </div>
                  <div className="pt-2 text-[10px] text-forest/50 dark:text-paper-light/50 border-t border-forest/10 dark:border-paper-light/10">
                    {calculation.statutoryDocs.ispsAndHealth.maritimeHealthDeclaration}
                  </div>
                </div>
              )}
            </div>

            {/* Required Declarations Checklist */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] uppercase font-mono font-bold text-forest/50 dark:text-paper-light/50 block">
                MANDATORY STATUTORY FILINGS ({calculation.cargo.requiredDeclarations.length} Required):
              </span>
              <ul className="space-y-1 text-[11px] font-mono text-forest/75 dark:text-paper-light/75">
                {calculation.cargo.requiredDeclarations.map((decl, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                    <span>{decl}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Gemini RAG Maritime Assistant connected to active shipment */}
      <RAGMaritimeAssistant
        shipmentContext={{
          originPortId,
          destPortId,
          cargoTypeId,
          vesselId: selectedVesselId,
          cargoTonnageMT: cargoTonnage,
          laycanDate,
        }}
      />
    </section>
  );
}

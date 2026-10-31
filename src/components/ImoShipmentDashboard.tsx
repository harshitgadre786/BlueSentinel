"use client";

import React, { useState, useMemo } from "react";
import {
  IMO_CARGO_TYPES,
} from "@/data/imo-shipment-data";
import {
  calculateDynamicImoShipment,
  DynamicVoyageCalculation,
} from "@/lib/imo-maritime-engine";
import {
  Anchor,
  Compass,
  Navigation,
  Waves,
  Calendar,
  Leaf,
  Layers,
  ArrowLeftRight,
  AlertTriangle,
} from "lucide-react";

export default function ImoShipmentDashboard() {
  // Component State - Defaults to JNPA [INNSA] as Origin, Rotterdam [NLRTM] as Destination
  const [originPortId, setOriginPortId] = useState<string>("in-jnpa");
  const [destPortId, setDestPortId] = useState<string>("rotterdam");
  const [cargoTypeId, setCargoTypeId] = useState<string>("dry_bulk_imsbc");
  const [selectedVesselId, setSelectedVesselId] = useState<string>("vesselB");
  const [cargoTonnage, setCargoTonnage] = useState<number>(75000);
  const [laycanDate, setLaycanDate] = useState<string>(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 10)
  );

  // Bidirectional Trade Direction & Same Port Validation
  const isSamePort = originPortId === destPortId;
  const isOriginIndian = originPortId.startsWith("in-");
  const isDestIndian = destPortId.startsWith("in-");

  const tradeDirection = isOriginIndian && isDestIndian
    ? { label: "Coastal Cabotage (Domestic)", badge: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20", dot: "bg-emerald-500" }
    : isOriginIndian && !isDestIndian
    ? { label: "Export (India ➔ Global Hub)", badge: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-500/20", dot: "bg-blue-500" }
    : !isOriginIndian && isDestIndian
    ? { label: "Import (Global Hub ➔ India)", badge: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-500/20", dot: "bg-cyan-500" }
    : { label: "International Hub-to-Hub", badge: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/20", dot: "bg-purple-500" };

  const handleSwapPorts = () => {
    setOriginPortId(destPortId);
    setDestPortId(originPortId);
  };

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
    <section className="space-y-6 rounded-2xl bg-paper-surface/60 dark:bg-paper-dark-surface/50 border border-forest/15 dark:border-paper-light/15 p-6 sm:p-8 shadow-sm">
      {/* Header */}
      <div className="pb-4 border-b border-forest/15 dark:border-paper-light/15">
        <h2 className="font-serif text-2xl sm:text-3xl font-black text-forest dark:text-paper-light tracking-tight">
          Dynamic Shipment & Fleet Compliance Monitor
        </h2>
      </div>

      {/* Reactive Dropdown Controls Bar */}
      <div className="space-y-4 p-5 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15">
        {/* Trade Direction Badge & Same Port Alert */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-forest/10 dark:border-paper-light/10">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono font-bold tracking-wider text-forest/60 dark:text-paper-light/60 uppercase">
              TRADE DIRECTION:
            </span>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1.5 ${tradeDirection.badge}`}>
              <span className={`w-2 h-2 rounded-full ${tradeDirection.dot}`} />
              {tradeDirection.label}
            </span>
          </div>

          {isSamePort && (
            <span className="text-xs px-3 py-1 rounded-full font-bold bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/30 flex items-center gap-1.5 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              Origin and Destination cannot be identical
            </span>
          )}
        </div>

        {/* Inputs Grid with Swap Button */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Origin Port */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-coral" />
              <span>Origin Port (LOCODE)</span>
            </label>
            <select
              value={originPortId}
              onChange={(e) => setOriginPortId(e.target.value)}
              className={`w-full bg-paper-surface dark:bg-paper-dark-surface border rounded-md p-2.5 text-xs text-forest dark:text-paper-light font-bold focus:outline-none cursor-pointer ${
                isSamePort ? "border-red-500 ring-2 ring-red-500/20" : "border-forest/20 dark:border-paper-light/20"
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
                <option value="rotterdam">Port of Rotterdam [NLRTM], Netherlands (Draft: 24.0m)</option>
                <option value="singapore">Port of Singapore [SGSIN], Singapore (Draft: 18.5m)</option>
                <option value="shanghai">Port of Shanghai [CNSHA], China (Draft: 17.5m)</option>
                <option value="jebel_ali">Jebel Ali / Dubai [AEJEA], UAE (Draft: 17.0m)</option>
                <option value="antwerp_bruges">Port of Antwerp-Bruges [BEANR], Belgium (Draft: 17.5m)</option>
                <option value="busan">Port of Busan [KRBUS], South Korea (Draft: 18.0m)</option>
                <option value="los_angeles">Port of Los Angeles [USLAX], USA (Draft: 18.5m)</option>
                <option value="hamburg">Port of Hamburg [DEHAM], Germany (Draft: 15.1m)</option>
                <option value="tanjung_pelepas">Port of Tanjung Pelepas [MYTPP], Malaysia (Draft: 18.5m)</option>
              </optgroup>
            </select>
          </div>

          {/* Swap Direction Button */}
          <div className="md:col-span-1 flex items-center justify-center pb-0.5">
            <button
              type="button"
              onClick={handleSwapPorts}
              title="Swap Direction (⇄)"
              className="w-full md:w-auto p-2.5 rounded-lg bg-paper-surface hover:bg-forest/10 dark:bg-paper-dark-surface dark:hover:bg-paper-light/10 border border-forest/20 dark:border-paper-light/20 text-forest dark:text-paper-light transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm active:scale-95 group"
            >
              <ArrowLeftRight className="w-4 h-4 text-coral group-hover:rotate-180 transition-transform duration-300" />
              <span className="md:hidden text-xs font-bold">Swap Direction (⇄)</span>
            </button>
          </div>

          {/* Destination Port */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
              <Navigation className="w-3.5 h-3.5 text-mustard" />
              <span>Destination Port (Call)</span>
            </label>
            <select
              value={destPortId}
              onChange={(e) => setDestPortId(e.target.value)}
              className={`w-full bg-paper-surface dark:bg-paper-dark-surface border rounded-md p-2.5 text-xs text-forest dark:text-paper-light font-bold focus:outline-none cursor-pointer ${
                isSamePort ? "border-red-500 ring-2 ring-red-500/20" : "border-forest/20 dark:border-paper-light/20"
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
                <option value="rotterdam">Port of Rotterdam [NLRTM], Netherlands (Draft: 24.0m)</option>
                <option value="singapore">Port of Singapore [SGSIN], Singapore (Draft: 18.5m)</option>
                <option value="shanghai">Port of Shanghai [CNSHA], China (Draft: 17.5m)</option>
                <option value="jebel_ali">Jebel Ali / Dubai [AEJEA], UAE (Draft: 17.0m)</option>
                <option value="antwerp_bruges">Port of Antwerp-Bruges [BEANR], Belgium (Draft: 17.5m)</option>
                <option value="busan">Port of Busan [KRBUS], South Korea (Draft: 18.0m)</option>
                <option value="los_angeles">Port of Los Angeles [USLAX], USA (Draft: 18.5m)</option>
                <option value="hamburg">Port of Hamburg [DEHAM], Germany (Draft: 15.1m)</option>
                <option value="tanjung_pelepas">Port of Tanjung Pelepas [MYTPP], Malaysia (Draft: 18.5m)</option>
              </optgroup>
            </select>
          </div>

          {/* Cargo Type */}
          <div className="md:col-span-3 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-coral" />
              <span>Cargo Type</span>
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
          </div>

          {/* Cargo Tonnage & Departure */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-forest/70 dark:text-paper-light/70" />
              <span>Quantity & Laycan</span>
            </label>
            <div className="flex gap-1.5">
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
          </div>
        </div>
      </div>

      {/* 4-COLUMN SUMMARY METRICS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Distance & Transit */}
        <div className="p-4 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-forest/60 dark:text-paper-light/60">
            <span className="font-bold uppercase flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-coral" />
              Routing & ETA
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-forest/5 dark:bg-paper-light/5 font-mono">
              {calculation.vessel.serviceSpeedKnots} KTS
            </span>
          </div>
          <div>
            <div className="text-2xl font-serif font-black text-forest dark:text-paper-light">
              {isSamePort ? "0" : calculation.distanceNM.toLocaleString()}{" "}
              <span className="text-sm font-sans font-normal text-forest/60 dark:text-paper-light/60">
                NM
              </span>
            </div>
            <div className="text-xs text-forest/70 dark:text-paper-light/70 font-mono mt-0.5">
              {isSamePort
                ? "Same Port Selected (0 Days)"
                : `Transit: ${calculation.transitDays} Days (${calculation.transitHours}h sea leg)`}
            </div>
          </div>
        </div>

        {/* Metric 2: Port Tariffs */}
        <div className="p-4 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-forest/60 dark:text-paper-light/60">
            <span className="font-bold uppercase flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-mustard" />
              Berth & Tariffs
            </span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded border font-bold ${getCongestionBadgeColor(
                calculation.destPort.congestion.status
              )}`}
            >
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
        </div>

        {/* Metric 3: Weather & Sea State */}
        <div className="p-4 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-forest/60 dark:text-paper-light/60">
            <span className="font-bold uppercase flex items-center gap-1.5">
              <Waves className="w-3.5 h-3.5 text-blue-500" />
              Weather & Sea State
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-bold font-mono">
              BFT {calculation.destPort.weatherSeaState.beaufortScale}
            </span>
          </div>
          <div>
            <div className="text-2xl font-serif font-black text-forest dark:text-paper-light">
              {calculation.destPort.weatherSeaState.waveHeightM}m{" "}
              <span className="text-xs font-sans font-normal text-forest/60 dark:text-paper-light/60">
                Significant Wave
              </span>
            </div>
            <div className="text-xs text-forest/70 dark:text-paper-light/70 font-mono mt-0.5">
              {calculation.destPort.weatherSeaState.beaufortDescription}
            </div>
          </div>
        </div>

        {/* Metric 4: IMO CII Rating */}
        <div className="p-4 rounded-xl bg-paper-light dark:bg-paper-dark border border-forest/15 dark:border-paper-light/15 space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-forest/60 dark:text-paper-light/60">
            <span className="font-bold uppercase flex items-center gap-1.5">
              <Leaf className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              IMO CII Rating
            </span>
            <span
              className={`text-xs px-2.5 py-0.5 rounded border font-black font-serif ${getCiiBadgeColor(
                calculation.ciiRating
              )}`}
            >
              GRADE {isSamePort ? "C" : calculation.ciiRating}
            </span>
          </div>
          <div>
            <div className="text-2xl font-serif font-black text-forest dark:text-paper-light">
              {isSamePort ? "0.00" : calculation.attainedCII}{" "}
              <span className="text-xs font-sans font-normal text-forest/60 dark:text-paper-light/60">
                g CO₂/DWT·NM
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

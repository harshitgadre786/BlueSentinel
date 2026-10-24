"use client";

import React, { useState } from "react";
import WorkspaceNav from "@/components/WorkspaceNav";
import MaritimeMap from "@/components/MaritimeMap";
import { DETAILED_INDIAN_PORTS, DEMO_VESSELS, calculateAcousticNoiseDB } from "@/lib/maritime-calculator";
import { ORIGIN_PORTS, calculateVesselMetrics } from "@/lib/maritime-engine";
import {
  Leaf,
  Volume2,
  Cloud,
  AlertTriangle,
  Info,
  Waves,
  ShieldAlert,
  ArrowRight,
  Gauge,
} from "lucide-react";

export default function EnvironmentalImpactPage() {
  const [speedKnots, setSpeedKnots] = useState<number>(12.8);
  const [selectedVesselId, setSelectedVesselId] = useState<"vesselA" | "vesselB" | "vesselC">("vesselB");

  const port = DETAILED_INDIAN_PORTS.paradip;
  const origin = ORIGIN_PORTS.singapore;
  const vessel = DEMO_VESSELS[selectedVesselId];

  // Acoustic & emissions model
  const noiseDB = calculateAcousticNoiseDB(speedKnots);
  const isSanctuaryAlert = speedKnots > 11.5;

  // Fuel & CO2 at speed
  const distanceNM = 1650;
  const seaDays = Number((distanceNM / (speedKnots * 24)).toFixed(2));
  const speedRatio = speedKnots / vessel.averageSpeed;
  const dailyFuel = vessel.dailyFuelBurn * Math.pow(speedRatio, 3);
  const totalFuelMT = Number((dailyFuel * seaDays).toFixed(1));
  const totalCO2MT = Number((totalFuelMT * vessel.emissionFactor).toFixed(1));

  // Convert for map component compatibility
  const dummySimulationInputs = {
    cargoType: "Thermal Coal",
    cargoTonnage: 75000,
    originId: "singapore",
    destinationId: "paradip",
    departureDate: new Date().toISOString(),
    speedKnots,
    fuelCostPerTonne: 640,
    estimatedPortWaitDays: 3.5,
  };

  const mapResultA = calculateVesselMetrics(
    {
      id: "vesselA",
      name: "MV Ocean Titan",
      type: "Panamax",
      dwt: 82500,
      loa: 229,
      beam: 32.26,
      staticDraft: 14.8,
      designSpeed: 14.0,
      baseCharterRatePerDay: 17500,
      baseFuelConsumptionPerDay: 32.2,
      portAuxFuelConsumptionPerDay: 3.2,
      flag: "Marshall Islands",
      yearBuilt: 2014,
      engineType: "MAN B&W",
      baselineCII: "D",
      vesselNotes: "",
    },
    dummySimulationInputs,
    port,
    distanceNM
  );

  const mapResultB = calculateVesselMetrics(
    {
      id: "vesselB",
      name: "MV Nilgiri Wave",
      type: "Eco-Ultramax",
      dwt: 64500,
      loa: 199.9,
      beam: 32.26,
      staticDraft: 13.3,
      designSpeed: 13.5,
      baseCharterRatePerDay: 21500,
      baseFuelConsumptionPerDay: 24.8,
      portAuxFuelConsumptionPerDay: 2.1,
      flag: "Singapore",
      yearBuilt: 2021,
      engineType: "Tier III Mewis",
      baselineCII: "A",
      vesselNotes: "",
    },
    dummySimulationInputs,
    port,
    distanceNM
  );

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      <WorkspaceNav serviceTitle="Environmental Impact & Acoustic Risk" />

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 sm:px-10 py-10 space-y-10">
        {/* Header */}
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase tracking-widest text-coral">
            PHASE 7 • MARITIME DECARBONIZATION & URN AUDIT
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-black tracking-tight">
            Environmental Impact & Sensitive Zone Advisory
          </h1>
          <p className="text-xs sm:text-sm text-forest/75 dark:text-paper-light/75 max-w-2xl font-normal leading-relaxed">
            Monitor voyage route risk zones, Underwater Radiated Noise (URN) scores, and emissions tradeoffs along the Bay of Bengal and Indian Ocean cetacean corridors.
          </p>
        </div>

        {/* DECISION SUPPORT DISCLAIMER */}
        <div className="p-3.5 rounded-lg bg-paper-surface dark:bg-paper-dark-surface border border-forest/15 dark:border-paper-light/15 text-xs flex items-center gap-2">
          <Info className="w-4 h-4 text-mustard shrink-0" />
          <span>
            <strong>Decision-support prototype:</strong> This is an advisory decision tool, not an ECDIS certified navigational system. Eco-sensitive boundaries represent prototype regulatory corridors.
          </span>
        </div>

        {/* CONTROLS & LIVE METRICS BAR */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-6 rounded-xl bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15">
          {/* Speed Slider */}
          <div className="space-y-2 md:col-span-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Voyage Steaming Speed</span>
              <span className="font-mono text-coral font-bold">{speedKnots.toFixed(1)} kts</span>
            </div>
            <input
              type="range"
              min={10.0}
              max={16.5}
              step={0.1}
              value={speedKnots}
              onChange={(e) => setSpeedKnots(parseFloat(e.target.value))}
              className="w-full h-2 bg-paper-surface dark:bg-paper-dark rounded accent-coral cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-forest/50 dark:text-paper-light/50 font-mono">
              <span>10.0 kts (Min cavitation)</span>
              <span>11.5 kts (Whale limit)</span>
              <span>16.5 kts</span>
            </div>
          </div>

          {/* CO2 Output */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-forest/60 dark:text-paper-light/60 flex items-center gap-1">
              <Cloud className="w-3 h-3 text-coral" />
              Est. CO₂ Footprint
            </span>
            <div className="font-serif font-black text-2xl text-coral">{totalCO2MT} MT</div>
            <div className="text-[10px] text-forest/60 font-mono">Total fuel: {totalFuelMT} MT VLSFO</div>
          </div>

          {/* Underwater Radiated Noise (URN) */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono uppercase text-forest/60 dark:text-paper-light/60 flex items-center gap-1">
              <Volume2 className="w-3 h-3 text-mustard" />
              Underwater Noise (URN)
            </span>
            <div className={`font-serif font-black text-2xl ${isSanctuaryAlert ? "text-coral" : "text-forest dark:text-mustard"}`}>
              {noiseDB} dB
            </div>
            <div className="text-[10px] text-forest/60 font-mono">
              {isSanctuaryAlert ? "Exceeds 11.5 kts limit" : "Whale sanctuary compliant"}
            </div>
          </div>
        </div>

        {/* CORE OPERATIONAL INSIGHT BANNER */}
        <div className="p-4 rounded-lg bg-forest/10 dark:bg-paper-light/10 border-l-4 border-coral text-xs space-y-1">
          <span className="font-bold font-serif text-sm block">Environmental Insight:</span>
          <p className="leading-relaxed opacity-90">
            &ldquo;Lower speed can reduce fuel use, emissions, and underwater-noise exposure when operationally feasible. In the Sri Lanka cetacean buffer, reducing speed to <strong>11.5 knots</strong> decreases cavitation sound pressure by over <strong>8.2 dB</strong>, protecting Blue Whale and Olive Ridley sea turtle corridors.&rdquo;
          </p>
        </div>

        {/* ROUTE MAP WITH SENSITIVE ZONES */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-forest dark:text-paper-light flex items-center gap-2">
              <Waves className="w-5 h-5 text-coral" />
              <span>Singapore ➔ Paradip Voyage Route & Sensitive Risk Zones</span>
            </h2>
            <span className="text-xs font-mono text-forest/60 dark:text-paper-light/60">
              LEAFLET CARTOGRAPHIC PROJECTION
            </span>
          </div>

          {/* Leaflet interactive map */}
          <div className="rounded-xl overflow-hidden border border-forest/15 dark:border-paper-light/15">
            <MaritimeMap
              selectedPort={port}
              selectedOrigin={origin}
              resultA={mapResultA}
              resultB={mapResultB}
              speedKnots={speedKnots}
            />
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import {
  PortData,
  OriginPort,
  RiskZone,
  VesselCalculationResult,
} from "../lib/types";
import {
  MARITIME_RISK_ZONES,
  MARITIME_ROUTES,
} from "../lib/maritime-engine";
import {
  MapPin,
  AlertTriangle,
  Compass,
  Layers,
  ShieldAlert,
  Navigation2,
  Waves,
  Eye,
  Info,
  CheckCircle2,
  Volume2,
} from "lucide-react";

// Dynamically import Leaflet components to prevent Next.js SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Popup = dynamic(
  () => import("react-leaflet").then((mod) => mod.Popup),
  { ssr: false }
);
const Polyline = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polyline),
  { ssr: false }
);
const Polygon = dynamic(
  () => import("react-leaflet").then((mod) => mod.Polygon),
  { ssr: false }
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((mod) => mod.CircleMarker),
  { ssr: false }
);

interface Props {
  selectedPort: PortData;
  selectedOrigin: OriginPort;
  resultA: VesselCalculationResult;
  resultB: VesselCalculationResult;
  speedKnots: number;
}

export default function MaritimeMap({
  selectedPort,
  selectedOrigin,
  resultA,
  resultB,
  speedKnots,
}: Props) {
  const [isClient, setIsClient] = useState(false);
  const [mapMode, setMapMode] = useState<"leaflet" | "editorial">("leaflet");
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [selectedZoneInfo, setSelectedZoneInfo] = useState<RiskZone | null>(null);
  const [tileError, setTileError] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Dynamically inject Leaflet CSS if not already present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // Compute route coordinates for Singapore -> Paradip
  const routeKey = `${selectedOrigin.id}-${selectedPort.id}`;
  const defaultRoute: [number, number][] = MARITIME_ROUTES[routeKey] || [
    [1.29, 103.85], // Singapore
    [3.0, 100.5], // Malacca Strait
    [5.8, 95.3], // Great Channel / Banda Aceh
    [11.5, 92.5], // Andaman Sea
    [16.0, 89.0], // Bay of Bengal Central
    [19.8, 87.1], // Paradip Pilot Approach
    [20.26, 86.68], // Paradip Port Berth
  ];

  // Calculate simulated vessel position (~58% along voyage)
  const vesselPosIndex = Math.min(
    defaultRoute.length - 1,
    Math.max(1, Math.floor(defaultRoute.length * 0.58))
  );
  const vesselLat = defaultRoute[vesselPosIndex][0];
  const vesselLng = defaultRoute[vesselPosIndex][1];

  // Map center between origin (Singapore) and destination (Paradip)
  const mapCenter: [number, number] = [11.0, 93.0];

  // Speed-related acoustic noise and sanctuary risk
  const isAcousticViolation = speedKnots > 11.5;
  const estimatedNoiseDB = Math.round(152 + Math.pow(speedKnots / 10, 2.5) * 12);

  return (
    <div className="bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-xl overflow-hidden shadow-editorial transition-colors">
      {/* Map Control Toolbar */}
      <div className="px-4 py-3 bg-paper-surface/60 dark:bg-paper-dark-surface/60 border-b border-forest/15 dark:border-paper-light/15 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded bg-forest dark:bg-paper-light text-paper-light dark:text-forest flex items-center justify-center">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-sm text-forest dark:text-paper-light">
                {selectedOrigin.name} ➔ {selectedPort.name}
              </span>
              <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-forest/10 dark:bg-paper-light/10 text-forest/70 dark:text-paper-light/70 border border-forest/15 dark:border-paper-light/15">
                {resultA.voyageDistanceNM} NM
              </span>
            </div>
            <span className="text-[11px] text-forest/60 dark:text-paper-light/60 font-sans">
              OpenStreetMap Maritime Cartography • Zero Paid API Keys Required
            </span>
          </div>
        </div>

        {/* View Toggle & Layer Controls */}
        <div className="flex items-center gap-2 text-xs">
          <button
            type="button"
            onClick={() => setMapMode(mapMode === "leaflet" ? "editorial" : "leaflet")}
            className="px-2.5 py-1 rounded border border-forest/20 dark:border-paper-light/20 text-[11px] font-medium text-forest/80 dark:text-paper-light/80 hover:bg-forest/5 dark:hover:bg-paper-light/5 flex items-center gap-1 transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-coral" />
            <span>{mapMode === "leaflet" ? "Show Editorial Chart" : "Show OpenStreetMap"}</span>
          </button>

          <button
            type="button"
            onClick={() => setShowRiskZones(!showRiskZones)}
            className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
              showRiskZones
                ? "bg-coral/10 text-coral border-coral/30"
                : "border-forest/20 dark:border-paper-light/20 text-forest/60 dark:text-paper-light/60"
            }`}
          >
            Eco Zones: {showRiskZones ? "On" : "Off"}
          </button>
        </div>
      </div>

      {/* Speed-Related Operational Alert Banner */}
      <div
        className={`px-4 py-2.5 text-xs border-b flex flex-wrap items-center justify-between gap-2 transition-colors ${
          isAcousticViolation
            ? "bg-coral/10 border-coral/30 text-forest dark:text-paper-light"
            : "bg-forest/10 dark:bg-paper-light/10 border-forest/15 dark:border-paper-light/15 text-forest dark:text-paper-light"
        }`}
      >
        <div className="flex items-center gap-2">
          {isAcousticViolation ? (
            <AlertTriangle className="w-4 h-4 text-coral shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          )}
          <span className="text-[11px] leading-tight">
            <strong>Vessel Speed: {speedKnots} kts</strong> • Underwater Radiated Noise (URN): ~{estimatedNoiseDB} dB.{" "}
            {isAcousticViolation ? (
              <span className="text-coral font-medium">
                Exceeds 11.5 kts cetacean acoustic advisory south of Sri Lanka / Bay of Bengal. High cavitation risk.
              </span>
            ) : (
              <span className="text-emerald-700 dark:text-emerald-300 font-medium">
                Eco-speed compliant. Low cavitation sound pressure protects marine wildlife and saves ~24% bunker fuel.
              </span>
            )}
          </span>
        </div>

        <div className="text-[10px] font-mono text-forest/60 dark:text-paper-light/60">
          IMO MEPC.1/Circ.906 Guideline
        </div>
      </div>

      {/* Main Map Canvas Area */}
      <div className="relative w-full h-[380px] sm:h-[460px] bg-[#EAE2CE] dark:bg-[#071714]">
        {!isClient ? (
          /* Loading State */
          <div className="w-full h-full flex flex-col items-center justify-center p-6 text-forest/60 dark:text-paper-light/60">
            <Compass className="w-8 h-8 animate-spin text-coral mb-2" />
            <span className="text-xs font-mono uppercase tracking-widest">
              Initializing OpenStreetMap Canvas...
            </span>
            <span className="text-[11px] text-forest/50 dark:text-paper-light/50 mt-1">
              Rendering Bay of Bengal waypoint coordinates
            </span>
          </div>
        ) : mapMode === "editorial" || tileError ? (
          /* Fallback Editorial Route Illustration (Pure SVG Vector) */
          <div className="w-full h-full p-4 flex flex-col justify-between relative select-none">
            <div className="flex items-center justify-between text-[11px] font-mono text-forest/70 dark:text-paper-light/70 border-b border-forest/15 dark:border-paper-light/15 pb-2">
              <span className="font-bold flex items-center gap-1 text-coral">
                <Navigation2 className="w-3.5 h-3.5" />
                Editorial Nautical Chart: Singapore ➔ Paradip Transit
              </span>
              <span>1,650 NM • 75,000 MT Thermal Coal</span>
            </div>

            {/* SVG Visual Cartogram */}
            <div className="flex-1 w-full flex items-center justify-center">
              <svg viewBox="0 0 800 320" className="w-full h-full max-h-[300px]" preserveAspectRatio="xMidYMid meet">
                {/* Background Bathymetric Gradient lines */}
                <path d="M 50 280 Q 250 200 450 180 T 750 60" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-forest/15 dark:text-paper-light/15" />
                <path d="M 80 300 Q 280 230 500 210 T 780 90" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" className="text-forest/10 dark:text-paper-light/10" />

                {/* Eco-Sensitive Zone: Sri Lanka Acoustic Buffer */}
                <rect x="220" y="140" width="160" height="90" rx="8" fill="#F24B2A" fillOpacity="0.12" stroke="#F24B2A" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="230" y="160" fill="#F24B2A" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                  Sri Lanka Cetacean Sanctuary
                </text>
                <text x="230" y="175" fill="currentColor" fontSize="9" className="text-forest/70 dark:text-paper-light/70">
                  Voluntary Speed Limit: ≤ 11.5 kts
                </text>
                <text x="230" y="190" fill="currentColor" fontSize="9" className="text-forest/70 dark:text-paper-light/70">
                  Active URN Advisory Corridor
                </text>

                {/* Eco-Sensitive Zone: Paradip Sandheads Siltation */}
                <rect x="580" y="25" width="160" height="75" rx="8" fill="#D8A83C" fillOpacity="0.15" stroke="#D8A83C" strokeWidth="1.5" strokeDasharray="4 4" />
                <text x="590" y="45" fill="#D8A83C" fontSize="10" fontFamily="sans-serif" fontWeight="bold">
                  Paradip Sandheads & Turtles
                </text>
                <text x="590" y="60" fill="currentColor" fontSize="9" className="text-forest/70 dark:text-paper-light/70">
                  Gahirmatha Olive Ridley Buffer
                </text>
                <text x="590" y="75" fill="currentColor" fontSize="9" className="text-forest/70 dark:text-paper-light/70">
                  Max Permissible Draft: 14.50m CD
                </text>

                {/* Voyage Route Polyline */}
                <path
                  d="M 100 270 Q 200 210 320 180 T 520 120 T 680 50"
                  fill="none"
                  stroke="#103B2D"
                  strokeWidth="4"
                  className="dark:stroke-paper-light opacity-80"
                />
                <path
                  d="M 100 270 Q 200 210 320 180 T 520 120 T 680 50"
                  fill="none"
                  stroke="#F24B2A"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />

                {/* Origin Marker: Singapore */}
                <circle cx="100" cy="270" r="8" fill="#103B2D" className="dark:fill-paper-light" />
                <circle cx="100" cy="270" r="4" fill="#F7F1DF" className="dark:fill-forest" />
                <text x="60" y="295" fill="currentColor" fontSize="11" fontWeight="bold" className="text-forest dark:text-paper-light">
                  Singapore (SGSIN)
                </text>
                <text x="75" y="308" fill="currentColor" fontSize="9" className="text-forest/60 dark:text-paper-light/60">
                  Origin Departure Port
                </text>

                {/* Active Vessel Marker (Simulated Position) */}
                <circle cx="430" cy="148" r="10" fill="#F24B2A" fillOpacity="0.25" className="animate-ping" />
                <circle cx="430" cy="148" r="7" fill="#F24B2A" />
                <text x="390" y="132" fill="#F24B2A" fontSize="11" fontWeight="bold">
                  MV Nilgiri Wave
                </text>
                <text x="390" y="144" fill="currentColor" fontSize="9" className="text-forest/70 dark:text-paper-light/70">
                  Pos: 12.8°N, 89.2°E • {speedKnots} kts
                </text>

                {/* Destination Marker: Paradip */}
                <circle cx="680" cy="50" r="9" fill="#F24B2A" />
                <circle cx="680" cy="50" r="4" fill="#F7F1DF" />
                <text x="695" y="48" fill="currentColor" fontSize="12" fontWeight="bold" className="text-forest dark:text-paper-light">
                  Paradip Port (INPBD)
                </text>
                <text x="695" y="62" fill="currentColor" fontSize="9" className="text-forest/60 dark:text-paper-light/60">
                  Destination • Coal Berth 1 & 2
                </text>
              </svg>
            </div>

            {/* Bottom info banner in fallback */}
            <div className="flex items-center justify-between text-[11px] text-forest/70 dark:text-paper-light/70 bg-paper-surface/80 dark:bg-paper-dark-surface/80 p-2 rounded border border-forest/15 dark:border-paper-light/15">
              <span>Fallback Cartogram: Operational routing verified without external dependencies.</span>
              <button
                type="button"
                onClick={() => {
                  setTileError(false);
                  setMapMode("leaflet");
                }}
                className="text-coral underline font-semibold text-[10px]"
              >
                Retry Live OpenStreetMap
              </button>
            </div>
          </div>
        ) : (
          /* Live React Leaflet Map with OpenStreetMap Tiles */
          <MapContainer
            center={mapCenter}
            zoom={5}
            scrollWheelZoom={false}
            style={{ width: "100%", height: "100%", background: "#EAE2CE" }}
          >
            {/* OpenStreetMap Standard Tiles with Visible Attribution */}
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
              url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={18}
              eventHandlers={{
                tileerror: () => setTileError(true),
              }}
            />

            {/* Voyage Route Polyline (Singapore to Paradip) */}
            <Polyline
              positions={defaultRoute}
              pathOptions={{
                color: "#103B2D",
                weight: 4,
                opacity: 0.9,
                lineCap: "round",
              }}
            />
            <Polyline
              positions={defaultRoute}
              pathOptions={{
                color: "#F24B2A",
                weight: 2,
                opacity: 0.85,
                dashArray: "6, 6",
              }}
            />

            {/* Eco-Sensitive Zones (Polygons) */}
            {showRiskZones &&
              MARITIME_RISK_ZONES.map((zone) => {
                const isDanger = zone.severity === "danger";
                const isWarning = zone.severity === "warning";
                const color = isDanger ? "#F24B2A" : isWarning ? "#D8A83C" : "#103B2D";

                return (
                  <Polygon
                    key={zone.id}
                    positions={zone.coordinates}
                    pathOptions={{
                      color: color,
                      fillColor: color,
                      fillOpacity: 0.2,
                      weight: 2,
                      dashArray: isDanger ? "4, 4" : undefined,
                    }}
                    eventHandlers={{
                      click: () => setSelectedZoneInfo(zone),
                    }}
                  >
                    <Popup>
                      <div className="p-2 space-y-1.5 max-w-xs text-xs font-sans text-forest">
                        <div className="flex items-center gap-1.5 font-bold font-serif text-sm">
                          <AlertTriangle className="w-4 h-4 shrink-0" style={{ color }} />
                          <span>{zone.name}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-forest/80">
                          {zone.description}
                        </p>
                        <div className="p-1.5 rounded bg-forest/10 border border-forest/20 text-[10px] text-forest">
                          <strong>Advisory: </strong>
                          {zone.mitigationRequirement}
                        </div>
                      </div>
                    </Popup>
                  </Polygon>
                );
              })}

            {/* Origin Port Marker: Singapore */}
            <CircleMarker
              center={[selectedOrigin.lat, selectedOrigin.lng]}
              radius={8}
              pathOptions={{
                fillColor: "#103B2D",
                color: "#F7F1DF",
                weight: 2.5,
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div className="p-1.5 text-xs font-sans text-forest">
                  <div className="font-bold font-serif text-sm">Origin: {selectedOrigin.name}</div>
                  <div className="text-[11px] text-forest/70">
                    Departure Port (Lat {selectedOrigin.lat}°, Lng {selectedOrigin.lng}°)
                  </div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Destination Port Marker: Paradip */}
            <CircleMarker
              center={[selectedPort.lat, selectedPort.lng]}
              radius={10}
              pathOptions={{
                fillColor: "#F24B2A",
                color: "#FFFFFF",
                weight: 2.5,
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div className="p-2 space-y-1 text-xs font-sans text-forest">
                  <div className="font-serif font-bold text-sm text-coral flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Destination: {selectedPort.name}</span>
                  </div>
                  <div className="text-[11px] text-forest/80 font-mono">
                    Max Permissible Draft: <strong>{selectedPort.maxPermissibleDraft}m CD</strong>
                  </div>
                  <div className="text-[11px] text-forest/80 font-mono">
                    Under Keel Clearance (UKC): <strong>{selectedPort.requiredUKC}m</strong>
                  </div>
                  <div className="p-1 rounded bg-coral/10 text-coral text-[10px] font-semibold mt-1">
                    Coal Berth 1 & 2 • Mechanized Discharge
                  </div>
                </div>
              </Popup>
            </CircleMarker>

            {/* Active Vessel Simulated Position Marker */}
            <CircleMarker
              center={[vesselLat, vesselLng]}
              radius={7}
              pathOptions={{
                fillColor: isAcousticViolation ? "#F24B2A" : "#103B2D",
                color: "#FFFFFF",
                weight: 2,
                fillOpacity: 1,
              }}
            >
              <Popup>
                <div className="p-2 text-xs font-sans text-forest">
                  <div className="font-serif font-bold text-sm flex items-center gap-1 text-coral">
                    <Navigation2 className="w-3.5 h-3.5" />
                    <span>Active Vessel: MV Nilgiri Wave</span>
                  </div>
                  <div className="text-[11px] text-forest/80 mt-1">
                    Bay of Bengal Inbound Transit
                  </div>
                  <div className="text-[11px] font-mono mt-0.5">
                    Speed: <strong>{speedKnots} kts</strong> • Noise: <strong>{estimatedNoiseDB} dB</strong>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          </MapContainer>
        )}

        {/* Floating Map Legend (Mobile and Desktop Friendly) */}
        <div className="absolute bottom-3 left-3 bg-paper-light/95 dark:bg-paper-dark/95 backdrop-blur-md border border-forest/20 dark:border-paper-light/20 rounded-lg p-2.5 text-[11px] shadow-editorial max-w-[220px] sm:max-w-xs space-y-1.5 z-[500]">
          <div className="font-serif font-bold text-forest dark:text-paper-light flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-coral" />
            <span>Nautical Legend</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-2 gap-y-1 text-forest/75 dark:text-paper-light/75 text-[10px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-forest dark:bg-paper-light shrink-0" />
              <span>Singapore (Origin)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-coral shrink-0" />
              <span>Paradip (Dest)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-coral shrink-0" />
              <span>Vessel Position</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-coral/30 border border-coral shrink-0" />
              <span>Eco-Zone Buffer</span>
            </div>
          </div>
        </div>

        {/* Selected Zone Directive Drawer (if clicked) */}
        {selectedZoneInfo && (
          <div className="absolute top-3 right-3 bg-paper-light/95 dark:bg-paper-dark/95 backdrop-blur-md border border-forest/20 dark:border-paper-light/20 rounded-lg p-3 text-xs shadow-editorial max-w-xs z-[500] animate-fadeIn">
            <div className="flex items-center justify-between pb-1.5 border-b border-forest/15 dark:border-paper-light/15">
              <span className="font-serif font-bold text-forest dark:text-paper-light flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-coral" />
                <span>{selectedZoneInfo.name}</span>
              </span>
              <button
                type="button"
                onClick={() => setSelectedZoneInfo(null)}
                className="text-forest/50 dark:text-paper-light/50 hover:text-coral text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-forest/80 dark:text-paper-light/80 text-[11px] mt-1.5 leading-relaxed">
              {selectedZoneInfo.description}
            </p>
            <div className="mt-2 p-1.5 rounded bg-forest/10 dark:bg-paper-light/10 border border-forest/15 dark:border-paper-light/15 text-[10px] text-forest dark:text-paper-light">
              <span className="font-bold text-coral">Directive: </span>
              {selectedZoneInfo.mitigationRequirement}
            </div>
          </div>
        )}
      </div>

      {/* Prominent Footer Attribution (Required for OpenStreetMap) */}
      <div className="px-4 py-2 bg-paper-surface dark:bg-paper-dark-surface border-t border-forest/15 dark:border-paper-light/15 flex flex-wrap items-center justify-between text-[11px] text-forest/60 dark:text-paper-light/60">
        <div className="flex items-center gap-1.5">
          <span>Map data &copy;</span>
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="text-coral underline hover:opacity-80 font-medium"
          >
            OpenStreetMap contributors
          </a>
          <span>• Under ODbL License</span>
        </div>
        <div className="text-[10px] font-mono">
          Leaflet v1.9.4 • No API Key Dependency
        </div>
      </div>
    </div>
  );
}

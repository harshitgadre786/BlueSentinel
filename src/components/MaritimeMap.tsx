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
} from "lucide-react";

// Dynamically import Leaflet components to prevent SSR issues
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
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
  const [showRiskZones, setShowRiskZones] = useState(true);
  const [showWeatherSwell, setShowWeatherSwell] = useState(true);
  const [selectedZoneInfo, setSelectedZoneInfo] = useState<RiskZone | null>(null);

  useEffect(() => {
    setIsClient(true);
    // Inject leaflet css dynamically if not already present
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }
  }, []);

  // Compute route coordinates
  const routeKey = `${selectedOrigin.id}-${selectedPort.id}`;
  const defaultRoute: [number, number][] = MARITIME_ROUTES[routeKey] || [
    [selectedOrigin.lat, selectedOrigin.lng],
    [(selectedOrigin.lat + selectedPort.lat) / 2, (selectedOrigin.lng + selectedPort.lng) / 2],
    [selectedPort.lat, selectedPort.lng],
  ];

  // Calculate simulated vessel position (~60% along the voyage)
  const vesselPosIndex = Math.min(
    defaultRoute.length - 1,
    Math.max(1, Math.floor(defaultRoute.length * 0.6))
  );
  const vesselLat = defaultRoute[vesselPosIndex][0];
  const vesselLng = defaultRoute[vesselPosIndex][1];

  // Map center between origin and port
  const mapCenter: [number, number] = [
    (selectedOrigin.lat + selectedPort.lat) / 2 + 3,
    (selectedOrigin.lng + selectedPort.lng) / 2,
  ];

  if (!isClient) {
    return (
      <div className="w-full h-[440px] bg-navy-950 border border-navy-800 rounded-xl flex items-center justify-center">
        <div className="flex items-center gap-2 text-cyan-400 text-xs">
          <Compass className="w-5 h-5 animate-spin" />
          <span>Initializing Maritime Cartography & Bathymetry Layer...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl overflow-hidden shadow-2xl relative">
      {/* Top Map Toolbar */}
      <div className="px-4 py-3 bg-navy-900 border-b border-navy-800 flex flex-wrap items-center justify-between gap-3 z-10 relative">
        <div className="flex items-center gap-2">
          <div className="p-1 rounded bg-cyan-500/10 text-cyan-400">
            <Compass className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Live Voyage Track & Indian Coastal Risk Bathymetry
            </h3>
            <span className="text-[11px] text-slate-400">
              {selectedOrigin.name} ➔ {selectedPort.name} ({resultA.voyageDistanceNM} NM)
            </span>
          </div>
        </div>

        {/* Layer Toggles & Status */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowRiskZones(!showRiskZones)}
            className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
              showRiskZones
                ? "bg-cyan-950/60 text-cyan-300 border-cyan-500/40"
                : "bg-navy-850 text-slate-400 border-navy-700"
            }`}
          >
            Risk Zones ({showRiskZones ? "Visible" : "Hidden"})
          </button>

          <button
            onClick={() => setShowWeatherSwell(!showWeatherSwell)}
            className={`px-2.5 py-1 rounded border text-[11px] font-medium transition-colors ${
              showWeatherSwell
                ? "bg-amber-950/60 text-amber-300 border-amber-500/40"
                : "bg-navy-850 text-slate-400 border-navy-700"
            }`}
          >
            Monsoon Swell ({showWeatherSwell ? "Active" : "Off"})
          </button>
        </div>
      </div>

      {/* Leaflet Map Canvas */}
      <div className="w-full h-[460px] relative z-0">
        <MapContainer
          center={mapCenter}
          zoom={5}
          scrollWheelZoom={true}
          style={{ width: "100%", height: "100%", background: "#040916" }}
        >
          {/* CartoDB Dark Matter Maritime Basemap */}
          <TileLayer
            attribution='&copy; <a href="https://carto.com/">CartoDB</a> | OpenStreetMap'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            maxZoom={18}
          />

          {/* Active Risk Zones */}
          {showRiskZones &&
            MARITIME_RISK_ZONES.map((zone) => {
              const isDanger = zone.severity === "danger";
              const isWarning = zone.severity === "warning";
              const color = isDanger ? "#ef4444" : isWarning ? "#f59e0b" : "#06b6d4";

              return (
                <Polygon
                  key={zone.id}
                  positions={zone.coordinates}
                  pathOptions={{
                    color: color,
                    fillColor: color,
                    fillOpacity: 0.22,
                    weight: 1.8,
                    dashArray: isDanger ? "4, 4" : undefined,
                  }}
                  eventHandlers={{
                    click: () => setSelectedZoneInfo(zone),
                  }}
                >
                  <Popup>
                    <div className="p-2 space-y-1.5 max-w-xs text-xs">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <AlertTriangle
                          className="w-4 h-4 shrink-0"
                          style={{ color }}
                        />
                        <span>{zone.name}</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">
                        {zone.description}
                      </p>
                      <div className="bg-navy-950/80 p-1.5 rounded border border-navy-700 text-[10px] text-cyan-300">
                        <strong className="text-white">Directive: </strong>
                        {zone.mitigationRequirement}
                      </div>
                    </div>
                  </Popup>
                </Polygon>
              );
            })}

          {/* Voyage Route Polyline */}
          <Polyline
            positions={defaultRoute}
            pathOptions={{
              color: "#00d2ff",
              weight: 3.5,
              opacity: 0.85,
              lineCap: "round",
            }}
          />

          {/* Glow backdrop line */}
          <Polyline
            positions={defaultRoute}
            pathOptions={{
              color: "#0284c7",
              weight: 8,
              opacity: 0.25,
            }}
          />

          {/* Origin Marker */}
          <CircleMarker
            center={[selectedOrigin.lat, selectedOrigin.lng]}
            radius={8}
            pathOptions={{
              fillColor: "#38bdf8",
              color: "#ffffff",
              weight: 2,
              fillOpacity: 0.9,
            }}
          >
            <Popup>
              <div className="p-2 text-xs">
                <div className="font-bold text-cyan-300">Origin Port</div>
                <div className="text-white font-semibold">{selectedOrigin.name}</div>
                <div className="text-slate-400 text-[10px] mt-1">
                  Departure Port | Cargo Loaded
                </div>
              </div>
            </Popup>
          </CircleMarker>

          {/* Indian Destination Port Marker (with radar pulse style) */}
          <CircleMarker
            center={[selectedPort.lat, selectedPort.lng]}
            radius={10}
            pathOptions={{
              fillColor: "#ef4444",
              color: "#ffffff",
              weight: 2.5,
              fillOpacity: 0.95,
            }}
          >
            <Popup>
              <div className="p-2 space-y-1 text-xs">
                <div className="font-bold text-red-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>Indian Destination Port</span>
                </div>
                <div className="text-white font-bold text-sm">{selectedPort.name}</div>
                <div className="text-slate-300 text-[11px]">
                  Max Permissible Draft:{" "}
                  <strong className="text-cyan-400 font-mono">
                    {selectedPort.maxPermissibleDraft}m CD
                  </strong>
                </div>
                <div className="text-slate-300 text-[11px]">
                  Safety UKC Allowance:{" "}
                  <strong className="text-white">{selectedPort.requiredUKC}m</strong>
                </div>
                <div className="text-[10px] text-amber-300 bg-amber-950/40 p-1 rounded mt-1 border border-amber-500/30">
                  {resultA.isDraftCompliant
                    ? "Both vessels draft-compliant"
                    : `Vessel A draft ${resultA.dynamicDraft}m exceeds limit! Mandatory lightering.`}
                </div>
              </div>
            </Popup>
          </CircleMarker>

          {/* Simulated Active Vessel Position */}
          <CircleMarker
            center={[vesselLat, vesselLng]}
            radius={7}
            pathOptions={{
              fillColor: "#10b981",
              color: "#ffffff",
              weight: 2,
              fillOpacity: 1,
            }}
          >
            <Popup>
              <div className="p-2 text-xs">
                <div className="font-bold text-emerald-400 flex items-center gap-1">
                  <Navigation2 className="w-3.5 h-3.5" />
                  <span>Simulated Vessel Position</span>
                </div>
                <div className="text-white font-semibold">Bay of Bengal Transit</div>
                <div className="text-slate-300 text-[11px] mt-1 font-mono">
                  Speed: {speedKnots} kts | Distance to Port: ~{Math.round(resultA.voyageDistanceNM * 0.4)} NM
                </div>
              </div>
            </Popup>
          </CircleMarker>
        </MapContainer>

        {/* Floating Map Legend & Risk Summary Pill */}
        <div className="absolute bottom-3 left-3 bg-navy-900/90 backdrop-blur-md border border-navy-750 rounded-lg p-2.5 text-[11px] shadow-lg max-w-xs space-y-1.5 z-[1000]">
          <div className="font-semibold text-white flex items-center gap-1.5">
            <Layers className="w-3 h-3 text-cyan-400" />
            <span>Maritime Chart Legend</span>
          </div>
          <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-slate-300">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shrink-0" />
              <span>Voyage Track</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0" />
              <span>Simulated Position</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-red-500/40 border border-red-500 shrink-0" />
              <span>Shallow Siltation</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-amber-500/40 border border-amber-500 shrink-0" />
              <span>Monsoon / Swell</span>
            </div>
            <div className="flex items-center gap-1.5 col-span-2">
              <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500/40 border border-cyan-500 shrink-0" />
              <span>Cetacean Corridor (URN &lt; 12 kts)</span>
            </div>
          </div>
        </div>

        {/* Selected Zone Directive Drawer (if clicked) */}
        {selectedZoneInfo && (
          <div className="absolute top-3 right-3 bg-navy-900/95 backdrop-blur-md border border-navy-700 rounded-lg p-3 text-xs shadow-2xl max-w-sm z-[1000] animate-fadeIn">
            <div className="flex items-center justify-between pb-1 border-b border-navy-800">
              <span className="font-bold text-white flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                {selectedZoneInfo.name}
              </span>
              <button
                onClick={() => setSelectedZoneInfo(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>
            <p className="text-slate-300 text-[11px] mt-1.5 leading-relaxed">
              {selectedZoneInfo.description}
            </p>
            <div className="mt-2 p-1.5 rounded bg-navy-950 border border-navy-800 text-[10px] text-cyan-300">
              <span className="font-bold text-white">Advisory: </span>
              {selectedZoneInfo.mitigationRequirement}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import React from "react";
import {
  SimulationInputs,
  PortData,
  OriginPort,
} from "../lib/types";
import {
  INDIAN_PORTS,
  ORIGIN_PORTS,
} from "../lib/maritime-engine";
import {
  Anchor,
  Navigation,
  Calendar,
  Fuel,
  Clock,
  Package,
  Layers,
  SlidersHorizontal,
} from "lucide-react";

interface Props {
  inputs: SimulationInputs;
  onChangeInputs: (newInputs: Partial<SimulationInputs>) => void;
  selectedPort: PortData;
  selectedOrigin: OriginPort;
}

export default function SimulationControls({
  inputs,
  onChangeInputs,
  selectedPort,
  selectedOrigin,
}: Props) {
  return (
    <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 sm:p-5 shadow-xl">
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-navy-800">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <h2 className="text-sm font-bold text-white tracking-wide uppercase">
            Voyage & Port Call Parameters
          </h2>
        </div>
        <div className="text-xs text-slate-400">
          Target Indian Port: <span className="text-cyan-400 font-semibold">{selectedPort.name}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cargo Type & Tonnage */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Package className="w-3.5 h-3.5 text-cyan-400" />
            Cargo Type
          </label>
          <select
            value={inputs.cargoType}
            onChange={(e) => onChangeInputs({ cargoType: e.target.value })}
            className="w-full bg-navy-850 border border-navy-750 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          >
            <option value="Thermal Coal">Thermal Coal (Bulk)</option>
            <option value="Iron Ore Fines">Iron Ore Fines</option>
            <option value="Coking Coal">Coking Coal</option>
            <option value="Clean Petroleum Products">Clean Petroleum (CPP)</option>
            <option value="Bauxite / Grain">Bauxite / Agri Bulk</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            Cargo Tonnage (MT)
          </label>
          <input
            type="number"
            min={10000}
            max={180000}
            step={5000}
            value={inputs.cargoTonnage}
            onChange={(e) =>
              onChangeInputs({ cargoTonnage: Number(e.target.value) || 65000 })
            }
            className="w-full bg-navy-850 border border-navy-750 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Origin Port */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-cyan-400" />
            Departure Origin
          </label>
          <select
            value={inputs.originId}
            onChange={(e) => onChangeInputs({ originId: e.target.value })}
            className="w-full bg-navy-850 border border-navy-750 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          >
            {Object.values(ORIGIN_PORTS).map((orig) => (
              <option key={orig.id} value={orig.id}>
                {orig.name} ({orig.country})
              </option>
            ))}
          </select>
        </div>

        {/* Destination Indian Port */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Anchor className="w-3.5 h-3.5 text-cyan-400" />
            Indian Destination Port
          </label>
          <select
            value={inputs.destinationId}
            onChange={(e) => onChangeInputs({ destinationId: e.target.value })}
            className="w-full bg-navy-850 border border-navy-750 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none font-semibold text-cyan-300"
          >
            {Object.values(INDIAN_PORTS).map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} (Max Draft: {p.maxPermissibleDraft}m)
              </option>
            ))}
          </select>
        </div>

        {/* Departure Date */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-cyan-400" />
            Voyage Departure Date
          </label>
          <input
            type="date"
            value={inputs.departureDate.slice(0, 10)}
            onChange={(e) =>
              onChangeInputs({
                departureDate: new Date(e.target.value).toISOString(),
              })
            }
            className="w-full bg-navy-850 border border-navy-750 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Fuel Cost */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Fuel className="w-3.5 h-3.5 text-amber-400" />
            Bunker Fuel Price ($/MT VLSFO)
          </label>
          <input
            type="number"
            min={400}
            max={1200}
            step={10}
            value={inputs.fuelCostPerTonne}
            onChange={(e) =>
              onChangeInputs({
                fuelCostPerTonne: Number(e.target.value) || 620,
              })
            }
            className="w-full bg-navy-850 border border-navy-750 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Port Anchorage Wait Days */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            Est. Port Anchorage Wait (Days)
          </label>
          <input
            type="number"
            min={0}
            max={20}
            step={0.5}
            value={inputs.estimatedPortWaitDays}
            onChange={(e) =>
              onChangeInputs({
                estimatedPortWaitDays: Number(e.target.value) || 3.0,
              })
            }
            className="w-full bg-navy-850 border border-navy-750 text-slate-200 text-xs rounded-lg px-3 py-2 focus:ring-1 focus:ring-cyan-500 focus:border-cyan-500 outline-none"
          />
        </div>

        {/* Port Under-Keel Protocol Alert Pill */}
        <div className="bg-navy-850/80 border border-navy-750 rounded-lg p-2.5 flex flex-col justify-center">
          <div className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
            <span>Port Draft Threshold:</span>
            <span className="text-cyan-300 font-mono font-bold">
              {selectedPort.maxPermissibleDraft}m CD
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">
            Mandatory UKC: <span className="text-white">{selectedPort.requiredUKC}m</span> | Tide: +{selectedPort.tidalAllowance}m
          </div>
        </div>
      </div>
    </div>
  );
}

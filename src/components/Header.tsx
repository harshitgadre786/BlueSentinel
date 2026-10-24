"use client";

import React, { useState, useEffect } from "react";
import {
  Compass,
  FileText,
  Ship,
  Database,
  Anchor,
  Clock,
  Sparkles,
  Waves,
} from "lucide-react";

interface Props {
  onOpenReportModal: () => void;
  onOpenDocModal: () => void;
  onResetDemo: () => void;
  isDemoActive: boolean;
  selectedPortName: string;
}

export default function Header({
  onOpenReportModal,
  onOpenDocModal,
  onResetDemo,
  isDemoActive,
  selectedPortName,
}: Props) {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toUTCString().slice(17, 22) + " UTC | " + now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: false }) + " IST"
      );
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-navy-900 border-b border-navy-800 sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 shadow-glow text-navy-950 font-bold">
              <Compass className="w-6 h-6 text-navy-950 animate-spin-slow" />
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight text-white">
                  Blue<span className="text-cyan-400">Sentinel</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  Decision Support v4.2
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Safe, Green & Compliant Maritime Port Calls for Indian Harbours
              </p>
            </div>
          </div>

          {/* Center Info: Active Indian Port & UTC/IST Time */}
          <div className="hidden md:flex items-center gap-4 bg-navy-850 px-3.5 py-1.5 rounded-lg border border-navy-750">
            <div className="flex items-center gap-1.5 text-xs text-cyan-300">
              <Anchor className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">Inbound Port:</span>
              <span className="font-semibold text-white">{selectedPortName}</span>
            </div>
            <div className="w-px h-4 bg-navy-700" />
            <div className="flex items-center gap-1.5 text-xs text-slate-300">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{currentTime || "07:30 UTC | 13:00 IST"}</span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={onResetDemo}
              title="Reset to Benchmark Demo Scenario"
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                isDemoActive
                  ? "bg-navy-800 text-cyan-300 border-cyan-500/30"
                  : "bg-navy-850 hover:bg-navy-800 text-slate-300 border-navy-700"
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Demo Scenario</span>
            </button>

            <button
              onClick={onOpenDocModal}
              title="Port Notice & Vessel Spec Documents"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-navy-850 hover:bg-navy-800 text-slate-200 border border-navy-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Port Notices & Specs</span>
              <span className="sm:hidden">Docs</span>
            </button>

            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-navy-950 shadow-glow transition-all active:scale-95"
            >
              <Ship className="w-3.5 h-3.5 text-navy-950" />
              <span>Executive Report</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

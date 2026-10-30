"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import { getDecisionLogs, VoyageDecisionLog } from "@/lib/supabase";
import { useEffect } from "react";
import ThemeToggle from "../../components/ThemeToggle";
import { CoralStar, WaveLine } from "../../components/editorial/EditorialMarks";
import {
  Compass,
  Ship,
  FileCheck,
  Bot,
  Sliders,
  FileText,
  Leaf,
  LogOut,
  ChevronDown,
  ArrowRight,
  ExternalLink,
  RotateCcw,
  Database,
  CheckCircle2,
} from "lucide-react";

export default function WorkspaceHomePage() {
  const { user, isConfigured, signOut } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [decisionLogs, setDecisionLogs] = useState<VoyageDecisionLog[]>([]);

  useEffect(() => {
    async function loadLogs() {
      const logs = await getDecisionLogs();
      setDecisionLogs(logs);
    }
    loadLogs();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleResetDemo = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("bluesentinel_voyage_inputs");
      localStorage.removeItem("bluesentinel_doc_chunks");
    }
    showToast("Demo scenario restored: Paradip Inbound Benchmark loaded in local sandbox.");
  };

  const services = [
    {
      title: "Plan a Voyage",
      href: "/workspace/voyage-planner",
      icon: Ship,
      tag: "Voyage Setup & Vessel Charter",
      accent: "hover:border-coral group-hover:text-coral",
      desc: "Multi-step cargo planning form with 3-vessel deterministic comparison (Vessel A, B, and C), draft checking, and landed cost breakdown in USD/INR.",
    },
    {
      title: "Port Compliance",
      href: "/workspace/compliance",
      icon: FileCheck,
      tag: "Cargo Manifest & Compliance Audit",
      accent: "hover:border-mustard group-hover:text-mustard",
      desc: "Detailed berth draft limits, tidal state verification, mandatory document checklists, and operational risk alerts for Indian ports (Paradip, Kandla, JNPT).",
    },
    {
      title: "BlueAI Document Copilot",
      href: "/workspace/blueai",
      icon: Bot,
      tag: "BlueAI Copilot & Documentation",
      accent: "hover:border-coral group-hover:text-coral",
      desc: "Upload vessel specs & port circulars, extract text chunks, and query Gemini RAG intelligence with exact page-level citations.",
    },
    {
      title: "What-if Simulator",
      href: "/workspace/simulator",
      icon: Sliders,
      tag: "What-If Simulator",
      accent: "hover:border-forest dark:hover:border-paper-light",
      desc: "Interactive sensitivity sliders for speed, fuel price (±15%), port wait days (0-7d), FX rates, and live trade-off charts.",
    },
    {
      title: "Environmental Impact",
      href: "/workspace/environment",
      icon: Leaf,
      tag: "Environmental Impact",
      accent: "hover:border-mustard group-hover:text-mustard",
      desc: "Voyage route map, CO2 footprint curves, speed-related fuel impact, and Underwater Radiated Noise (URN) prototype sensitivity zone alerts.",
    },
    {
      title: "Decision Reports",
      href: "/workspace/reports",
      icon: FileText,
      tag: "Executive Decision Brief",
      accent: "hover:border-coral group-hover:text-coral",
      desc: "Generate and export the formal BlueSentinel Voyage Decision Brief PDF with complete audit trail and evidence citations.",
    },
  ];

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 p-4 rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-xs font-semibold shadow-editorial animate-fadeIn border border-forest dark:border-paper-light flex items-center gap-2">
          <CoralStar className="w-4 h-4 text-coral" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-paper-light/95 dark:bg-paper-dark/95 backdrop-blur-sm border-b border-forest/15 dark:border-paper-light/15 py-4 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5 group focus:outline-none">
              <div className="w-8 h-8 rounded bg-forest dark:bg-paper-light flex items-center justify-center text-paper-light dark:text-forest">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-serif font-black text-xl tracking-tight text-forest dark:text-paper-light">
                BlueSentinel
              </span>
            </Link>
            <span className="text-forest/20 dark:text-paper-light/20 hidden sm:inline">|</span>
            <span className="text-xs font-mono uppercase tracking-widest text-forest/60 dark:text-paper-light/60 hidden sm:inline">
              Command Workspace
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Supabase Connection Status Pill */}
            {isConfigured ? (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-forest/10 dark:bg-paper-light/10 text-forest dark:text-paper-light border border-forest/20 dark:border-paper-light/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>Supabase Live</span>
              </span>
            ) : (
              <span className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium bg-mustard/15 text-mustard border border-mustard/30">
                <span className="w-1.5 h-1.5 rounded-full bg-mustard" />
                <span>Sandbox Mode</span>
              </span>
            )}

            {/* Reset Demo Button */}
            <button
              onClick={handleResetDemo}
              title="Reset to default benchmark demo scenario"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-forest/20 dark:border-paper-light/20 text-xs font-semibold text-forest/70 dark:text-paper-light/70 hover:border-forest/50 dark:hover:border-paper-light/50 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-mustard" />
              <span>Reset Demo</span>
            </button>

            <ThemeToggle />

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-forest/20 dark:border-paper-light/20 text-xs font-medium"
                aria-expanded={profileDropdownOpen}
              >
                <div className="w-5 h-5 rounded-full bg-forest dark:bg-paper-light text-paper-light dark:text-forest flex items-center justify-center text-[10px] font-bold">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "C"}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline font-semibold">
                  {user?.name || "Captain"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-forest/50 dark:text-paper-light/50" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-md bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 py-2 z-50 text-xs shadow-lg animate-fadeIn"
                  role="menu"
                >
                  <div className="px-3.5 py-2 border-b border-forest/10 dark:border-paper-light/10">
                    <div className="font-bold text-forest dark:text-paper-light truncate">
                      {user?.name || "Captain"}
                    </div>
                    <div className="text-[11px] font-mono text-forest/50 dark:text-paper-light/50 truncate mt-0.5">
                      {user?.phone || user?.email || "Authenticated Operator"}
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3.5 py-2 text-forest/80 dark:text-paper-light/80 hover:bg-paper-surface dark:hover:bg-paper-dark-surface transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-forest/50 dark:text-paper-light/50" />
                    <span>View Public Landing</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => signOut()}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-coral hover:bg-coral/10 transition-colors font-semibold border-t border-forest/10 dark:border-paper-light/10 mt-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-12 sm:py-16 space-y-16">
        {/* Welcome Section */}
        <section className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-forest/60 dark:text-paper-light/60">
            <CoralStar className="w-3.5 h-3.5" />
            <span>Maritime Decision Intelligence Hub</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-black text-forest dark:text-paper-light tracking-tight">
            Good morning, Captain.
          </h1>

          <p className="text-lg text-forest/75 dark:text-paper-light/75 font-normal leading-relaxed">
            Select a verified maritime decision service below to evaluate inbound Indian port calls, calculate dynamic draft compliance, and simulate speed trade-offs.
          </p>

          <div className="pt-2 text-xs font-mono text-coral flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            <span>SIMULATED PROTOTYPE DATA ACTIVE • DETERMINISTIC ENGINE</span>
          </div>
        </section>

        {/* 6 WORKING SERVICE TILES */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pt-4 border-t border-forest/15 dark:border-paper-light/15">
          {services.map((svc) => {
            const Icon = svc.icon;
            return (
              <Link
                key={svc.title}
                href={svc.href}
                className="group text-left p-6 sm:p-8 rounded-lg bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15 hover:border-forest/50 dark:hover:border-paper-light/50 transition-all flex flex-col justify-between space-y-6"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-md border border-forest/20 dark:border-paper-light/20 flex items-center justify-center text-forest dark:text-paper-light transition-colors">
                      <Icon className="w-5 h-5 stroke-[1.5]" />
                    </div>
                    <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-forest/5 dark:bg-paper-light/5 text-forest/60 dark:text-paper-light/60 border border-forest/10 dark:border-paper-light/10">
                      {svc.tag}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="font-serif text-2xl font-bold text-forest dark:text-paper-light group-hover:text-coral transition-colors">
                      {svc.title}
                    </h2>
                    <p className="text-xs sm:text-sm text-forest/70 dark:text-paper-light/70 leading-relaxed font-normal">
                      {svc.desc}
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-paper-light group-hover:text-coral transition-colors pt-2 border-t border-forest/10 dark:border-paper-light/10">
                  <span>Enter service</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            );
          })}
        </section>

        {/* RECENT ACTIVITY & AUDIT SECTION */}
        <section className="space-y-6 pt-10 border-t border-forest/15 dark:border-paper-light/15">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest dark:text-paper-light">
                Recent Voyage Decision Logs
              </h2>
              <span className="text-xs text-forest/60 dark:text-paper-light/60 font-sans">
                Deterministic charter evaluations and port entry compliance records
              </span>
            </div>
            <span className="text-xs text-forest/40 dark:text-paper-light/40 font-mono uppercase tracking-wider">
              OFFICIAL AUDIT TRAIL
            </span>
          </div>

          <div className="overflow-x-auto rounded-lg border border-forest/15 dark:border-paper-light/15 bg-paper-surface/40 dark:bg-paper-dark-surface/30">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-forest/5 dark:bg-paper-light/5 border-b border-forest/10 dark:border-paper-light/10 text-[11px] font-mono text-forest/60 dark:text-paper-light/60 uppercase">
                <tr>
                  <th className="py-3 px-4">Voyage / Cargo</th>
                  <th className="py-3 px-4">Destination Port</th>
                  <th className="py-3 px-4">Recommended Vessel</th>
                  <th className="py-3 px-4">Risk-Adjusted Saving</th>
                  <th className="py-3 px-4">CO₂ Saving</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-forest/10 dark:divide-paper-light/10">
                {decisionLogs.length > 0 ? (
                  decisionLogs.slice(0, 5).map((log, idx) => (
                    <tr key={log.id || idx} className="hover:bg-forest/5 dark:hover:bg-paper-light/5 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-forest dark:text-paper-light">
                        <div>{log.cargo_tonnage.toLocaleString()} MT {log.cargo_type}</div>
                        <div className="text-[10px] font-mono text-forest/50 dark:text-paper-light/50 mt-0.5">
                          {log.origin} ➔ {log.destination}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-medium text-forest/80 dark:text-paper-light/80">
                        {log.destination}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-forest dark:text-paper-light flex items-center gap-1.5 pt-4">
                        <Ship className="w-3.5 h-3.5 text-coral shrink-0" />
                        <span>{log.recommended_vessel}</span>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        +${log.risk_adjusted_saving_usd.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-forest/70 dark:text-paper-light/70">
                        {log.co2_saving_mt} MT
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-mono text-[10px] font-bold uppercase">
                          {log.status || "APPROVED"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <Link
                          href="/workspace/reports"
                          className="text-coral hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <span>Brief</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  /* Captain Arun Sharma Benchmark Voyage default row */
                  <tr className="hover:bg-forest/5 dark:hover:bg-paper-light/5 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-forest dark:text-paper-light">
                      <div>75,000 MT Thermal Coal</div>
                      <div className="text-[10px] font-mono text-forest/50 dark:text-paper-light/50 mt-0.5">
                        Singapore (SGSIN) ➔ Paradip (INPBD)
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-forest/80 dark:text-paper-light/80">
                      Paradip Port (INPBD)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-forest dark:text-paper-light flex items-center gap-1.5 pt-4">
                      <Ship className="w-3.5 h-3.5 text-coral shrink-0" />
                      <span>MV Sentinel Carrier</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">
                      +$142,000
                    </td>
                    <td className="py-3.5 px-4 font-mono text-forest/70 dark:text-paper-light/70">
                      114.0 MT
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 font-mono text-[10px] font-bold uppercase">
                        APPROVED
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        href="/workspace/reports"
                        className="text-coral hover:underline font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <span>View Brief</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

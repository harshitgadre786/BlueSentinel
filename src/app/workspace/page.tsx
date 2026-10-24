"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";
import { CoralStar, WaveLine } from "../../components/editorial/EditorialMarks";
import {
  Compass,
  Ship,
  FileCheck,
  Bot,
  LogOut,
  ArrowRight,
  ChevronDown,
  Clock,
  ExternalLink,
} from "lucide-react";

export default function WorkspacePage() {
  const router = useRouter();
  const { user, isLoading, signOut } = useAuth();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeModalMessage, setActiveModalMessage] = useState<string | null>(null);

  // Protected route check
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-paper-light dark:bg-paper-dark flex items-center justify-center text-forest dark:text-paper-light font-sans">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 rounded bg-forest dark:bg-paper-light flex items-center justify-center text-paper-light dark:text-forest animate-pulse">
            <Compass className="w-5 h-5 animate-spin" />
          </div>
          <span className="text-xs uppercase font-mono tracking-widest text-forest/60 dark:text-paper-light/60">
            Checking nautical registry...
          </span>
        </div>
      </div>
    );
  }

  const handleSignOut = async () => {
    await signOut();
    router.push("/login");
  };

  const handleTileClick = (featureTitle: string, description: string) => {
    setActiveModalMessage(
      `Service Module Initialized: ${featureTitle}\n\n${description}\n\nThis entry point is fully wired for feature expansion in the next development cycle.`
    );
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      {/* Minimal Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-paper-light/95 dark:bg-paper-dark/95 backdrop-blur-sm border-b border-forest/15 dark:border-paper-light/15 py-4 px-6 sm:px-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo & Workspace Name */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="w-8 h-8 rounded bg-forest dark:bg-paper-light flex items-center justify-center text-paper-light dark:text-forest">
                <Compass className="w-4 h-4" />
              </div>
              <span className="font-serif font-black text-xl tracking-tight text-forest dark:text-paper-light">
                BlueSentinel
              </span>
            </Link>

            <span className="text-forest/20 dark:text-paper-light/20 hidden sm:inline">|</span>

            <span className="text-xs font-mono uppercase tracking-widest text-forest/60 dark:text-paper-light/60 hidden sm:inline">
              Operations Desk
            </span>
          </div>

          {/* Right: Theme Toggle & Profile Menu */}
          <div className="flex items-center gap-3">
            <ThemeToggle />

            {/* Profile Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md border border-forest/20 dark:border-paper-light/20 hover:border-forest/50 dark:hover:border-paper-light/50 transition-colors text-xs font-medium"
                aria-expanded={profileDropdownOpen}
                aria-haspopup="true"
              >
                <div className="w-5 h-5 rounded-full bg-forest dark:bg-paper-light text-paper-light dark:text-forest flex items-center justify-center text-[10px] font-bold">
                  {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                </div>
                <span className="max-w-[120px] truncate hidden sm:inline font-semibold">
                  {user.name || "Captain"}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-forest/50 dark:text-paper-light/50" />
              </button>

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-md bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 py-2 z-50 text-xs shadow-lg animate-fadeIn"
                  role="menu"
                >
                  <div className="px-3.5 py-2 border-b border-forest/10 dark:border-paper-light/10">
                    <div className="font-bold text-forest dark:text-paper-light truncate">
                      {user.name || "Captain"}
                    </div>
                    <div className="text-[11px] font-mono text-forest/50 dark:text-paper-light/50 truncate mt-0.5">
                      {user.phone || user.email || "Authenticated Operator"}
                    </div>
                  </div>

                  <Link
                    href="/"
                    className="flex items-center gap-2 px-3.5 py-2 text-forest/80 dark:text-paper-light/80 hover:bg-paper-surface dark:hover:bg-paper-dark-surface transition-colors"
                    role="menuitem"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-forest/50 dark:text-paper-light/50" />
                    <span>View Public Landing</span>
                  </Link>

                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-3.5 py-2 text-coral hover:bg-coral/10 transition-colors font-semibold border-t border-forest/10 dark:border-paper-light/10 mt-1"
                    role="menuitem"
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

      {/* Main Workspace Body: Calm Editorial Broadsheet */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 sm:px-10 py-16 sm:py-24 space-y-20">
        {/* Main Welcome Heading */}
        <section className="space-y-4 max-w-2xl">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-forest/60 dark:text-paper-light/60">
            <CoralStar className="w-3.5 h-3.5" />
            <span>Nautical Command</span>
          </div>

          <h1 className="font-serif text-4xl sm:text-6xl font-black text-forest dark:text-paper-light tracking-tight">
            Good morning, Captain.
          </h1>

          <p className="text-lg sm:text-xl text-forest/75 dark:text-paper-light/75 font-normal">
            What would you like to plan today?
          </p>
        </section>

        {/* THREE SPACIOUS SERVICE-ENTRY TILES (Simplified, Broad-Editorial) */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 pt-4 border-t border-forest/15 dark:border-paper-light/15">
          {/* Tile 1: Plan a voyage */}
          <button
            type="button"
            onClick={() =>
              handleTileClick(
                "Plan a Voyage",
                "Configure origin, Indian arrival berth, cargo parameters, and run deterministic speed-fuel cubic optimization curves."
              )
            }
            className="group text-left space-y-6 pt-6 transition-all focus:outline-none"
          >
            <div className="w-10 h-10 flex items-center justify-center text-forest dark:text-paper-light group-hover:text-coral transition-colors">
              <Ship className="w-7 h-7 stroke-[1.25]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-forest dark:text-paper-light group-hover:text-coral transition-colors">
                Plan a voyage
              </h2>
              <p className="text-sm text-forest/70 dark:text-paper-light/70 leading-relaxed font-normal">
                Calculate speed, fuel cubic curves, dynamic squat, and arrival
                timelines for bulk carriers.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-paper-light group-hover:text-coral transition-colors pt-2">
              <span>Initialize route plan</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Tile 2: Check port compliance */}
          <button
            type="button"
            onClick={() =>
              handleTileClick(
                "Check Port Compliance",
                "Verify maximum permissible arrival drafts, Under Keel Clearance (UKC), and local Notice to Mariners at Paradip, Kandla, JNPT, and Mundra."
              )
            }
            className="group text-left space-y-6 pt-6 transition-all focus:outline-none md:border-l md:border-forest/15 md:dark:border-paper-light/15 md:pl-10"
          >
            <div className="w-10 h-10 flex items-center justify-center text-forest dark:text-paper-light group-hover:text-mustard transition-colors">
              <FileCheck className="w-7 h-7 stroke-[1.25]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-forest dark:text-paper-light group-hover:text-mustard transition-colors">
                Check port compliance
              </h2>
              <p className="text-sm text-forest/70 dark:text-paper-light/70 leading-relaxed font-normal">
                Audit vessel drafts against tidal allowance and official Indian
                berth circulars before charter execution.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-paper-light group-hover:text-mustard transition-colors pt-2">
              <span>Audit port constraints</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>

          {/* Tile 3: Ask BlueAI */}
          <button
            type="button"
            onClick={() =>
              handleTileClick(
                "Ask BlueAI RAG Intelligence",
                "Query indexed port circulars, berth tariffs, and vessel hydrostatic sheets with exact page-level source citations."
              )
            }
            className="group text-left space-y-6 pt-6 transition-all focus:outline-none md:border-l md:border-forest/15 md:dark:border-paper-light/15 md:pl-10"
          >
            <div className="w-10 h-10 flex items-center justify-center text-forest dark:text-paper-light group-hover:text-coral transition-colors">
              <Bot className="w-7 h-7 stroke-[1.25]" />
            </div>

            <div className="space-y-2">
              <h2 className="font-serif text-2xl font-bold text-forest dark:text-paper-light group-hover:text-coral transition-colors">
                Ask BlueAI
              </h2>
              <p className="text-sm text-forest/70 dark:text-paper-light/70 leading-relaxed font-normal">
                RAG assistant citing exact page numbers from port circulars
                without mathematical hallucination.
              </p>
            </div>

            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-forest dark:text-paper-light group-hover:text-coral transition-colors pt-2">
              <span>Open advisory console</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </div>
          </button>
        </section>

        {/* RECENT ACTIVITY SECTION (Clean Broadsheet Empty-State) */}
        <section className="space-y-6 pt-12 border-t border-forest/15 dark:border-paper-light/15">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-forest dark:text-paper-light">
              Recent activity
            </h2>
            <span className="text-xs text-forest/40 dark:text-paper-light/40 font-mono">
              LOG AUDIT
            </span>
          </div>

          <div className="py-16 text-center space-y-3 border-t border-dashed border-forest/15 dark:border-paper-light/15">
            <WaveLine className="w-16 h-3 mx-auto opacity-50" />
            <p className="font-serif text-lg font-bold text-forest/70 dark:text-paper-light/70">
              Your voyage decisions will appear here.
            </p>
            <p className="text-xs text-forest/50 dark:text-paper-light/50 max-w-sm mx-auto font-normal">
              Once you run a voyage assessment, the deterministic charter
              comparisons and executive reports will be logged to your audit trail.
            </p>
          </div>
        </section>
      </main>

      {/* Interactive Modal */}
      {activeModalMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest/20 dark:bg-paper-dark/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-paper-light dark:bg-paper-dark border border-forest/30 dark:border-paper-light/30 rounded-lg max-w-md w-full p-6 space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-forest/15 dark:border-paper-light/15 pb-3">
              <span className="font-serif font-bold text-forest dark:text-paper-light">
                Service Entry Point
              </span>
              <button
                type="button"
                onClick={() => setActiveModalMessage(null)}
                className="text-forest/60 dark:text-paper-light/60 hover:text-coral text-sm"
              >
                ✕
              </button>
            </div>

            <p className="text-xs sm:text-sm text-forest/80 dark:text-paper-light/80 whitespace-pre-line leading-relaxed">
              {activeModalMessage}
            </p>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveModalMessage(null)}
                className="px-4 py-2 rounded bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-xs font-bold transition-all"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

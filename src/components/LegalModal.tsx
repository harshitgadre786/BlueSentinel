"use client";

import React, { useEffect } from "react";
import { X, ShieldCheck, FileText, PhoneCall, Mail, Compass, CheckCircle2 } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  type: "privacy" | "terms" | "contact" | null;
  onClose: () => void;
}

export default function LegalModal({ isOpen, type, onClose }: LegalModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !type) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-forest/70 dark:bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-xl border border-forest/20 dark:border-paper-light/20 bg-paper dark:bg-paper-dark shadow-2xl p-6 sm:p-8 text-forest dark:text-paper-light"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-forest/15 dark:border-paper-light/15 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-forest/10 dark:bg-paper-light/10 text-coral flex items-center justify-center">
              {type === "privacy" && <ShieldCheck className="w-5 h-5" />}
              {type === "terms" && <FileText className="w-5 h-5" />}
              {type === "contact" && <PhoneCall className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold">
                {type === "privacy" && "Privacy & Data Protection Policy"}
                {type === "terms" && "Terms of Service & Decision Protocol"}
                {type === "contact" && "Fleet Operations & Contact Desk"}
              </h3>
              <p className="text-xs text-forest/60 dark:text-paper-light/60 font-mono mt-0.5">
                BlueSentinel Maritime Intelligence &bull; Version 4.0
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg border border-forest/15 dark:border-paper-light/15 hover:bg-forest/10 dark:hover:bg-paper-light/10 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4 text-forest/70 dark:text-paper-light/70" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-5 text-xs sm:text-sm leading-relaxed text-forest/85 dark:text-paper-light/85">
          {type === "privacy" && (
            <>
              <div className="p-3.5 rounded-lg bg-forest/5 dark:bg-paper-light/5 border border-forest/10 dark:border-paper-light/10">
                <span className="font-bold text-coral uppercase tracking-wider text-[11px] font-mono block mb-1">
                  Tenant Data Isolation Commitment
                </span>
                <p className="text-xs text-forest/75 dark:text-paper-light/75">
                  BlueSentinel enforces strict multi-tenant Row Level Security (RLS) on all user-owned database records. Your private voyage plans, charter rates, and vessel specifications cannot be inspected, accessed, or queried by other operators or unauthorized parties.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest dark:text-paper-light mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Zero Third-Party Commercial Tracking
                </h4>
                <p className="text-xs text-forest/75 dark:text-paper-light/75">
                  We do not sell vessel tracking coordinates, trade routes, commercial cargo quantities, or bunker negotiation parameters to commodities brokers, charter index publishers, or third-party advertising networks.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest dark:text-paper-light mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Deterministic Calculation Boundary
                </h4>
                <p className="text-xs text-forest/75 dark:text-paper-light/75">
                  Hydrodynamic resistance, Admiralty draft limits, tidal under-keel clearances (UKC), and bunker burn calculations run strictly on validated deterministic formulas on local edge runtimes—never through hallucinating generative models.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest dark:text-paper-light mb-1.5 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Document Storage & Retention
                </h4>
                <p className="text-xs text-forest/75 dark:text-paper-light/75">
                  Vessel specifications and port notices uploaded into BlueAI are retained solely within your authenticated storage partition and can be purged at any time from your session settings.
                </p>
              </div>
            </>
          )}

          {type === "terms" && (
            <>
              <div className="p-3.5 rounded-lg bg-mustard/15 border border-mustard/30 text-forest dark:text-paper-light">
                <span className="font-bold text-forest dark:text-paper-light uppercase tracking-wider text-[11px] font-mono block mb-1">
                  Decision-Support Prototype Disclaimer
                </span>
                <p className="text-xs opacity-90">
                  BlueSentinel provides computational decision support based on published port circulars, tidal forecasts, and vessel hydrodynamic curves. Navigational command, seaworthiness, and final arrival clearance remain at all times under the operational discretion of the Master and port harbor authorities.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest dark:text-paper-light mb-1.5">
                  1. Operational Scope
                </h4>
                <p className="text-xs text-forest/75 dark:text-paper-light/75">
                  The scores, risk rankings, and financial projections produced in this system are intended for pre-arrival voyage planning, speed optimization, and commercial charter screening. Always consult official notices to mariners, live bathymetric surveys, and vessel stability booklets before navigating shallow approaches.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest dark:text-paper-light mb-1.5">
                  2. Environmental Overlay Data
                </h4>
                <p className="text-xs text-forest/75 dark:text-paper-light/75">
                  Marine sanctuary boundaries, cetacean acoustic corridors, and speed restriction zones are rendered from standard international conservation coordinates. Official Notice to Mariners (NTM) updates supersede prototype platform overlays.
                </p>
              </div>

              <div>
                <h4 className="font-bold text-forest dark:text-paper-light mb-1.5">
                  3. Deterministic Integrity
                </h4>
                <p className="text-xs text-forest/75 dark:text-paper-light/75">
                  BlueAI reasoning outputs are tethered strictly to verifiable citations from user-supplied documentation and verified port parameters. Financial comparisons reflect the deterministic cost engines configured in the voyage specification.
                </p>
              </div>
            </>
          )}

          {type === "contact" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-forest/5 dark:bg-paper-light/5 border border-forest/15 dark:border-paper-light/15">
                  <span className="font-mono text-xs uppercase tracking-wider font-bold text-coral block mb-1">
                    Singapore Operations Hub
                  </span>
                  <p className="text-xs text-forest/70 dark:text-paper-light/70 font-sans">
                    Marina Bay Financial Centre, Tower 2<br />
                    10 Marina Boulevard, Singapore 018983<br />
                    <span className="font-mono text-[11px]">dispatch.sg@bluesentinel.maritime</span>
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-forest/5 dark:bg-paper-light/5 border border-forest/15 dark:border-paper-light/15">
                  <span className="font-mono text-xs uppercase tracking-wider font-bold text-coral block mb-1">
                    Mumbai Maritime Command
                  </span>
                  <p className="text-xs text-forest/70 dark:text-paper-light/70 font-sans">
                    Ballard Estate Maritime Quarter<br />
                    Shoorji Vallabhdas Marg, Mumbai 400001<br />
                    <span className="font-mono text-[11px]">operations.in@bluesentinel.maritime</span>
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-lg border border-forest/15 dark:border-paper-light/15 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-forest dark:text-paper-light">
                  <Mail className="w-4 h-4 text-coral" />
                  <span>Direct Chartering Inquiries</span>
                </div>
                <p className="text-xs text-forest/70 dark:text-paper-light/70 pl-6">
                  For vessel integration, custom API webhooks, or port circular feeds, reach our engineering desk at <span className="font-mono font-bold text-forest dark:text-paper-light">contact@bluesentinel.ai</span>.
                </p>
                <div className="flex items-center gap-2 text-xs font-bold text-forest dark:text-paper-light pt-2">
                  <Compass className="w-4 h-4 text-mustard" />
                  <span>Captain Arun Sharma (Fleet Superintendent Lead)</span>
                </div>
                <p className="text-xs text-forest/70 dark:text-paper-light/70 pl-6">
                  Available on Inmarsat-C Fleet 77 &bull; MMSI 419000123 &bull; VHF Ch 16 Bridge-to-Bridge.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="mt-6 pt-4 border-t border-forest/15 dark:border-paper-light/15 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-lg bg-forest text-paper-light dark:bg-paper-light dark:text-forest hover:opacity-90 transition-opacity"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}

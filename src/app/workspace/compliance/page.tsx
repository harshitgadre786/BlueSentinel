"use client";

import React, { useState } from "react";
import Link from "next/link";
import WorkspaceNav from "@/components/WorkspaceNav";
import { DETAILED_INDIAN_PORTS, DEMO_VESSELS, calculateDynamicSquat } from "@/lib/maritime-calculator";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck,
  Anchor,
  Ship,
  Info,
  Clock,
  ExternalLink,
  ArrowRight,
  ShieldAlert,
} from "lucide-react";

export default function PortCompliancePage() {
  const [selectedPortId, setSelectedPortId] = useState<string>("paradip");
  const [selectedVesselId, setSelectedVesselId] = useState<string>("vesselA");
  const [selectedTideState, setSelectedTideState] = useState<"NEAP" | "NORMAL" | "SPRING">("NORMAL");
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    DOC_LLD: true,
    DOC_CDG: true,
  });

  const port = DETAILED_INDIAN_PORTS[selectedPortId] || DETAILED_INDIAN_PORTS.paradip;
  const vessel = DEMO_VESSELS[selectedVesselId] || DEMO_VESSELS.vesselA;

  // Dynamic calculations
  let tideHeightM = port.tidalAllowance;
  if (selectedTideState === "NEAP") tideHeightM = 0.80;
  if (selectedTideState === "SPRING") tideHeightM = 2.40;

  const squatM = calculateDynamicSquat(vessel.averageSpeed);
  const dynamicArrivalDraftM = Number((vessel.loadedDraft + squatM).toFixed(2));
  const allowableDraftM = Number((port.maxPermissibleDraft + tideHeightM - port.requiredUKC).toFixed(2));
  const draftMarginM = Number((allowableDraftM - dynamicArrivalDraftM).toFixed(2));

  // Compliance Status: GREEN (Compliant), AMBER (Marginal), RED (Breach)
  const isDraftCompliant = draftMarginM >= 0;
  const missingMandatoryDocs = port.requiredDocuments.filter(
    (doc) => doc.mandatory && !checkedDocs[doc.code]
  );
  const hasMissingDocs = missingMandatoryDocs.length > 0;

  let overallComplianceState: "GREEN" | "AMBER" | "RED" = "GREEN";
  if (!isDraftCompliant) {
    overallComplianceState = "RED";
  } else if (draftMarginM < 0.4 || hasMissingDocs) {
    overallComplianceState = "AMBER";
  }

  const toggleDocCheck = (code: string) => {
    setCheckedDocs((prev) => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      <WorkspaceNav serviceTitle="Port Compliance Verification" />

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 sm:px-10 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-3">
          <span className="text-xs font-mono uppercase tracking-widest text-coral">
            CARGO MANIFEST & COMPLIANCE • HARBOUR CLEARANCE AUDIT
          </span>
          <h1 className="font-serif text-3xl sm:text-5xl font-black text-forest dark:text-paper-light tracking-tight">
            Indian Port Rules & Draft Verification
          </h1>
          <p className="text-sm sm:text-base text-forest/75 dark:text-paper-light/75 max-w-2xl font-normal leading-relaxed">
            Verify vessel arrival dimensions against official Indian port circulars, tidal windows, and required documentation before voyage clearance.
          </p>
        </div>

        {/* Input Selectors Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 p-6 rounded-xl bg-paper-surface/50 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15">
          {/* Port Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
              <Anchor className="w-3.5 h-3.5 text-coral" />
              Target Port
            </label>
            <select
              value={selectedPortId}
              onChange={(e) => setSelectedPortId(e.target.value)}
              className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none cursor-pointer font-bold"
            >
              {Object.values(DETAILED_INDIAN_PORTS).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.country})
                </option>
              ))}
            </select>
          </div>

          {/* Vessel Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
              <Ship className="w-3.5 h-3.5 text-mustard" />
              Candidate Vessel
            </label>
            <select
              value={selectedVesselId}
              onChange={(e) => setSelectedVesselId(e.target.value)}
              className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none cursor-pointer font-semibold"
            >
              {Object.values(DEMO_VESSELS).map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} (Draft: {v.loadedDraft}m)
                </option>
              ))}
            </select>
          </div>

          {/* Tidal State Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-coral" />
              Berth Tidal Condition
            </label>
            <select
              value={selectedTideState}
              onChange={(e) => setSelectedTideState(e.target.value as "NEAP" | "NORMAL" | "SPRING")}
              className="w-full bg-paper-light dark:bg-paper-dark border border-forest/20 dark:border-paper-light/20 rounded-md p-3 text-sm text-forest dark:text-paper-light focus:outline-none cursor-pointer font-medium"
            >
              <option value="NEAP">Neap Tide (+0.80m tide)</option>
              <option value="NORMAL">Mean Semi-Diurnal (+{port.tidalAllowance}m tide)</option>
              <option value="SPRING">Spring High Tide (+2.40m tide)</option>
            </select>
          </div>
        </div>

        {/* VERIFICATION RESULT BANNER (GREEN / AMBER / RED) */}
        <div
          className={`p-8 rounded-xl border-2 space-y-4 transition-all ${
            overallComplianceState === "RED"
              ? "bg-coral/10 border-coral text-coral"
              : overallComplianceState === "AMBER"
              ? "bg-mustard/15 border-mustard text-forest dark:text-paper-light"
              : "bg-forest/10 dark:bg-paper-light/10 border-forest dark:border-paper-light text-forest dark:text-paper-light"
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {overallComplianceState === "RED" && <XCircle className="w-8 h-8 text-coral shrink-0" />}
              {overallComplianceState === "AMBER" && <AlertTriangle className="w-8 h-8 text-mustard shrink-0" />}
              {overallComplianceState === "GREEN" && <CheckCircle2 className="w-8 h-8 text-forest dark:text-paper-light shrink-0" />}
              <div>
                <span className="text-xs font-mono uppercase tracking-widest font-bold">
                  COMPLIANCE VERDICT: {overallComplianceState}
                </span>
                <h2 className="font-serif text-2xl font-black">
                  {overallComplianceState === "RED" && "Direct Berth Entry Prohibited (Draft Breach)"}
                  {overallComplianceState === "AMBER" && "Conditional Clearance — Marginal UKC or Missing Docs"}
                  {overallComplianceState === "GREEN" && "100% Channel Clearance Approved"}
                </h2>
              </div>
            </div>

            <span className="text-xs font-mono font-bold px-3 py-1 rounded bg-paper-light dark:bg-paper-dark border border-current">
              Margin: {draftMarginM >= 0 ? `+${draftMarginM}m` : `${draftMarginM}m`}
            </span>
          </div>

          {/* Clear Operational Explanation */}
          <div className="text-sm leading-relaxed border-t border-current/20 pt-4 font-normal">
            {!isDraftCompliant ? (
              <p>
                <strong>{vessel.name}</strong> has a loaded draft of <strong>{vessel.loadedDraft} m</strong> (+{squatM}m hydrodynamic squat = <strong>{dynamicArrivalDraftM} m</strong>). The selected {selectedTideState.toLowerCase()} port condition at {port.name} permits a maximum dynamic draft of <strong>{allowableDraftM} m</strong> (incorporating {port.requiredUKC}m mandatory safety UKC). Direct berth entry is <strong>not permitted</strong>.
              </p>
            ) : (
              <p>
                <strong>{vessel.name}</strong> has a dynamic arrival draft of <strong>{dynamicArrivalDraftM} m</strong>. The maximum allowable channel draft at {port.name} is <strong>{allowableDraftM} m</strong>, confirming a safe surplus Under Keel Clearance of <strong>+{draftMarginM} m</strong>.
              </p>
            )}
          </div>

          {/* Operational Consequences & Next Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
            <div className="p-3 rounded bg-paper-light/80 dark:bg-paper-dark/80 border border-current/20 space-y-1">
              <span className="font-bold uppercase tracking-wider block">Estimated Operational Consequence</span>
              <p className="opacity-90">{port.consequenceOfDraftBreach}</p>
            </div>
            <div className="p-3 rounded bg-paper-light/80 dark:bg-paper-dark/80 border border-current/20 space-y-1">
              <span className="font-bold uppercase tracking-wider block">Suggested Next Action</span>
              <p className="opacity-90">{port.suggestedAction}</p>
            </div>
          </div>
        </div>

        {/* MANDATORY REQUIRED DOCUMENT CHECKLIST */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-bold text-forest dark:text-paper-light flex items-center gap-2">
              <FileCheck className="w-5 h-5 text-coral" />
              <span>Mandatory Indian Port Documentation Checklist</span>
            </h2>
            <span className="text-xs font-mono text-forest/60 dark:text-paper-light/60">
              {port.requiredDocuments.length} CLAUSES AUDITED
            </span>
          </div>

          <div className="divide-y divide-forest/10 dark:divide-paper-light/10 border border-forest/15 dark:border-paper-light/15 rounded-lg bg-paper-surface/40 dark:bg-paper-dark-surface/30 overflow-hidden">
            {port.requiredDocuments.map((doc) => {
              const isChecked = !!checkedDocs[doc.code];
              return (
                <div
                  key={doc.code}
                  onClick={() => toggleDocCheck(doc.code)}
                  className="p-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-paper-surface/80 dark:hover:bg-paper-dark-surface/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => {}} // handled by div
                      className="w-4 h-4 rounded text-forest accent-coral cursor-pointer"
                    />
                    <div>
                      <div className="text-sm font-semibold text-forest dark:text-paper-light flex items-center gap-2">
                        <span>{doc.name}</span>
                        {doc.mandatory && (
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-coral/10 text-coral border border-coral/30 uppercase font-bold">
                            Mandatory
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-forest/60 dark:text-paper-light/60 font-mono mt-0.5">
                        Issuing Authority: {doc.authority} • Code: {doc.code}
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-mono font-bold ${
                      isChecked ? "text-forest dark:text-mustard" : "text-coral"
                    }`}
                  >
                    {isChecked ? "VERIFIED ON FILE" : "MISSING"}
                  </span>
                </div>
              );
            })}
          </div>

          {hasMissingDocs && (
            <div className="p-3 rounded bg-coral/10 border border-coral text-coral text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                <strong>Warning:</strong> {missingMandatoryDocs.length} mandatory regulatory document(s) missing from file. Port customs entry cannot proceed without physical endorsement.
              </span>
            </div>
          )}
        </div>

        {/* CITED RULE SOURCE */}
        <div className="p-4 rounded-md bg-paper-surface/60 dark:bg-paper-dark-surface/40 border border-forest/15 dark:border-paper-light/15 text-xs flex items-center justify-between text-forest/70 dark:text-paper-light/70 font-mono">
          <span>SOURCE: {port.name.toUpperCase()} MARINE CIRCULAR NO. 04/2026</span>
          <span className="text-[11px] text-forest/50 dark:text-paper-light/50">PROTOTYPE RULE BASE</span>
        </div>
      </main>
    </div>
  );
}

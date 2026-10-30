"use client";

import React, { useState } from "react";
import { Compass } from "lucide-react";
import LegalModal from "./LegalModal";

export default function Footer() {
  const [activeModal, setActiveModal] = useState<"privacy" | "terms" | "contact" | null>(null);

  return (
    <>
      <footer className="border-t border-forest/15 dark:border-paper-light/15 bg-paper-surface/60 dark:bg-paper-dark-surface/40 py-14 px-6 sm:px-10 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded bg-forest dark:bg-paper-light flex items-center justify-center text-paper-light dark:text-forest">
              <Compass className="w-4 h-4" />
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-xs text-forest/70 dark:text-paper-light/70 font-sans">
              <span className="font-serif font-bold text-forest dark:text-paper-light text-sm">
                BlueSentinel
              </span>
              <span className="hidden sm:inline text-forest/30 dark:text-paper-light/30">—</span>
              <span>Maritime decision intelligence</span>
            </div>
          </div>

          <div className="flex items-center gap-8 text-xs font-medium text-forest/70 dark:text-paper-light/70">
            <button
              type="button"
              onClick={() => setActiveModal("privacy")}
              className="hover:text-coral transition-colors cursor-pointer"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("contact")}
              className="hover:text-coral transition-colors cursor-pointer"
            >
              Contact
            </button>
            <button
              type="button"
              onClick={() => setActiveModal("terms")}
              className="hover:text-coral transition-colors cursor-pointer"
            >
              Terms
            </button>
            <span className="text-forest/30 dark:text-paper-light/30">|</span>
            <span className="text-[11px] font-mono text-forest/50 dark:text-paper-light/50">
              &copy; {new Date().getFullYear()} BlueSentinel Inc.
            </span>
          </div>
        </div>
      </footer>

      <LegalModal
        isOpen={activeModal !== null}
        type={activeModal}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
}

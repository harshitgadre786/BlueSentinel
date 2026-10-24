"use client";

import React from "react";
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import VesselIllustration from "../components/editorial/VesselIllustration";
import { CoralStar, WaveLine } from "../components/editorial/EditorialMarks";
import { ArrowRight, Compass } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light overflow-x-hidden">
      <Navbar />

      <main className="flex-1">
        {/* ========================================================= */}
        {/* HERO: The Vessel as the Emotional Visual Anchor           */}
        {/* ========================================================= */}
        <section className="relative pt-12 pb-24 md:pt-20 md:pb-36 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
              {/* Left Column: Bold Expressive Editorial Headline */}
              <div className="lg:col-span-6 space-y-8 z-10">
                <div className="flex items-center gap-2.5 text-xs font-semibold tracking-widest uppercase text-forest/60 dark:text-paper-light/60">
                  <CoralStar className="w-3.5 h-3.5" />
                  <span>Maritime Decision Intelligence</span>
                </div>

                <div className="space-y-6">
                  <h1 className="font-serif text-4xl sm:text-6xl lg:text-[4.25rem] font-black tracking-tight leading-[1.04] text-forest dark:text-paper-light">
                    Every voyage deserves a{" "}
                    <span className="editorial-underline text-coral inline-block">
                      safer decision.
                    </span>
                  </h1>

                  <p className="text-lg sm:text-xl text-forest/75 dark:text-paper-light/75 leading-relaxed max-w-lg font-normal pt-1">
                    BlueSentinel helps cargo teams understand port rules, voyage
                    risk, and operational cost before a ship sails.
                  </p>
                </div>

                {/* Primary & Secondary Actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pt-3">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-3 px-7 py-4 rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-sm font-bold tracking-wide hover:bg-forest-light dark:hover:bg-paper-surface border border-forest dark:border-paper-light transition-all shadow-editorial hover:translate-x-[-1px] hover:translate-y-[-1px]"
                  >
                    <span>Explore BlueSentinel</span>
                    <ArrowRight className="w-4 h-4 text-coral" />
                  </Link>

                  <Link
                    href="/login"
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-forest/80 dark:text-paper-light/80 hover:text-coral transition-colors py-2 px-1"
                  >
                    <span>Log in to your workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Vessel Visual Anchor */}
              <div className="lg:col-span-6 relative flex items-center justify-center">
                <div className="relative w-full max-w-2xl transform lg:scale-105">
                  <VesselIllustration variant="hero" className="w-full" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* MAIN GOAL: Pure Typographic Statement (Zero Cards)       */}
        {/* ========================================================= */}
        <section
          id="why-bluesentinel"
          className="py-24 md:py-36 border-t border-forest/15 dark:border-paper-light/15"
        >
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
            <div className="text-xs font-bold uppercase tracking-widest text-coral flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-coral" />
              <span>The Commercial Reality</span>
            </div>

            <div className="space-y-8">
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-forest dark:text-paper-light leading-tight">
                Clear decisions before costly mistakes.
              </h2>

              <p className="font-serif text-xl sm:text-2xl md:text-3xl font-normal leading-relaxed text-forest/85 dark:text-paper-light/85 border-l-2 border-coral pl-6 py-2">
                “A voyage can look inexpensive on paper but become costly
                because of draft restrictions, port delays, fuel volatility, or
                missing compliance documents. BlueSentinel brings these risks
                into one clear decision.”
              </p>
            </div>

            {/* Quiet broadsheet side-by-side comparison without boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-10 border-t border-forest/15 dark:border-paper-light/15 text-sm">
              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-forest dark:text-paper-light">
                  The hidden charter penalty
                </h3>
                <p className="text-forest/70 dark:text-paper-light/70 leading-relaxed font-normal">
                  A vessel chartered with a 14.8m laden draft for a port with a
                  14.2m low-tide threshold may appear $25,000 cheaper on base
                  hire. But unexpected offshore lightering, pilotage delays, and
                  queue forfeits turn that choice into a six-figure demurrage loss.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="font-serif font-bold text-lg text-forest dark:text-paper-light">
                  Defensible nautical governance
                </h3>
                <p className="text-forest/70 dark:text-paper-light/70 leading-relaxed font-normal">
                  BlueSentinel calculates dynamic squat, Under Keel Clearance,
                  Admiralty fuel cubic relationships, and port circulars
                  deterministically, giving superintendents and charterers audit
                  certainty before contract signature.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* HOW IT WORKS: Three Clean Numbered Editorial Steps        */}
        {/* ========================================================= */}
        <section
          id="how-it-works"
          className="py-24 md:py-36 border-t border-forest/15 dark:border-paper-light/15 bg-paper-surface/40 dark:bg-paper-dark-surface/30"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            <div className="max-w-xl space-y-3">
              <span className="text-xs font-bold uppercase tracking-widest text-forest/60 dark:text-paper-light/60">
                Operating System
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl font-black text-forest dark:text-paper-light">
                How BlueSentinel works.
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-16">
              {/* Step 01 */}
              <div className="space-y-6">
                <div className="font-serif font-black text-6xl sm:text-7xl text-forest/20 dark:text-paper-light/20 select-none">
                  01.
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-forest dark:text-paper-light">
                    Add voyage details
                  </h3>
                  <p className="text-sm text-forest/75 dark:text-paper-light/75 leading-relaxed font-normal">
                    Enter origin, Indian destination port, cargo tonnage, arrival
                    target date, and baseline fuel parameters in seconds.
                  </p>
                </div>
              </div>

              {/* Step 02 */}
              <div className="space-y-6">
                <div className="font-serif font-black text-6xl sm:text-7xl text-forest/20 dark:text-paper-light/20 select-none">
                  02.
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-forest dark:text-paper-light">
                    Check vessel, port, and cost risk
                  </h3>
                  <p className="text-sm text-forest/75 dark:text-paper-light/75 leading-relaxed font-normal">
                    Our deterministic hydrodynamics engine evaluates channel
                    draft limits, Under Keel Clearance, speed cubic fuel laws, and
                    demurrage exposure.
                  </p>
                </div>
              </div>

              {/* Step 03 */}
              <div className="space-y-6">
                <div className="font-serif font-black text-6xl sm:text-7xl text-forest/20 dark:text-paper-light/20 select-none">
                  03.
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-forest dark:text-paper-light">
                    Receive a clear recommendation
                  </h3>
                  <p className="text-sm text-forest/75 dark:text-paper-light/75 leading-relaxed font-normal">
                    Get an auditable risk-adjusted charter verdict, verified source
                    citations from official port notices, and a printable executive
                    audit memorandum.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* IMPACT: Concise Statements with Generous Whitespace      */}
        {/* ========================================================= */}
        <section
          id="impact"
          className="py-24 md:py-36 border-t border-forest/15 dark:border-paper-light/15"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
            <div className="max-w-3xl space-y-4">
              <span className="text-xs font-bold uppercase tracking-widest text-coral">
                Operational Impact
              </span>
              <h2 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-black text-forest dark:text-paper-light leading-tight">
                Less uncertainty at sea.{" "}
                <span className="text-forest/50 dark:text-paper-light/50 font-normal italic">
                  Better decisions on shore.
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-10 border-t border-forest/15 dark:border-paper-light/15">
              <div className="space-y-2">
                <div className="font-serif font-bold text-xl text-forest dark:text-paper-light">
                  Safer port calls
                </div>
                <p className="text-sm text-forest/70 dark:text-paper-light/70 leading-relaxed font-normal">
                  Eliminate grounding hazards and tidal lockouts with dynamic squat
                  and Under Keel Clearance safety buffers evaluated for every
                  Indian berth.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-serif font-bold text-xl text-forest dark:text-paper-light">
                  Lower avoidable cost
                </div>
                <p className="text-sm text-forest/70 dark:text-paper-light/70 leading-relaxed font-normal">
                  Expose deceptive base charter rates before signing, preventing
                  unexpected offshore transshipment lightering and anchorage
                  demurrage.
                </p>
              </div>

              <div className="space-y-2">
                <div className="font-serif font-bold text-xl text-forest dark:text-paper-light">
                  Clearer operational decisions
                </div>
                <p className="text-sm text-forest/70 dark:text-paper-light/70 leading-relaxed font-normal">
                  Align cargo logistics managers, vessel masters, and commercial
                  superintendents around one auditable, source-grounded brief.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FINAL CTA: Minimalist Editorial Sign-off                 */}
        {/* ========================================================= */}
        <section className="py-24 md:py-36 border-t border-forest/15 dark:border-paper-light/15 bg-paper-surface/60 dark:bg-paper-dark-surface/40">
          <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
            <div className="inline-flex justify-center text-mustard">
              <Compass className="w-8 h-8" />
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-black text-forest dark:text-paper-light tracking-tight">
              Ready to plan with confidence?
            </h2>

            <p className="text-base sm:text-lg text-forest/75 dark:text-paper-light/75 max-w-lg mx-auto font-normal">
              Sign in to your BlueSentinel workspace to compare inbound vessel
              options, check port draft circulars, and optimize speed plans.
            </p>

            <div className="pt-2">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-sm font-bold tracking-wide border border-forest dark:border-paper-light transition-all shadow-editorial hover:translate-x-[-1px] hover:translate-y-[-1px]"
              >
                <span>Enter BlueSentinel</span>
                <ArrowRight className="w-4 h-4 text-coral" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React from "react";

interface Props {
  className?: string;
  variant?: "hero" | "login" | "subtle";
}

export default function VesselIllustration({ className = "", variant = "hero" }: Props) {
  return (
    <div className={`relative flex items-center justify-center select-none ${className}`}>
      <svg
        viewBox="0 0 740 480"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto max-w-full"
        aria-label="Editorial paper-cut cargo vessel navigating calm coastal waters"
      >
        <defs>
          {/* Subtle paper-cut relief shadows */}
          <filter id="softPaperShadow" x="-8%" y="-8%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#103B2D" floodOpacity="0.10" />
          </filter>
          <filter id="hullShadow" x="-8%" y="-8%" width="120%" height="120%" filterUnits="userSpaceOnUse">
            <feDropShadow dx="3" dy="6" stdDeviation="5" floodColor="#0B211C" floodOpacity="0.14" />
          </filter>
        </defs>

        {/* --- CELESTIAL & NAUTICAL SKY ELEMENTS --- */}
        {/* Coral Celestial Sun / Compass Rose */}
        <g transform="translate(580, 52)" filter="url(#softPaperShadow)">
          <circle cx="36" cy="36" r="36" fill="#F24B2A" />
          {/* Radiating 8-point nautical star */}
          <path
            d="M36 6 L42 28 L64 28 L46 41 L53 63 L36 49 L19 63 L26 41 L8 28 L30 28 Z"
            fill="#F7F1DF"
            opacity="0.95"
          />
          <circle cx="36" cy="36" r="6" fill="#D8A83C" />
          {/* Concentric paper compass ring */}
          <circle cx="36" cy="36" r="48" stroke="#F24B2A" strokeWidth="1" strokeDasharray="3 4" opacity="0.4" />
        </g>

        {/* Delicate navigation coordinates & chart grid lines */}
        <g stroke="#103B2D" strokeWidth="0.8" opacity="0.22" className="dark:stroke-paper-light">
          {/* Compass grid lines */}
          <line x1="80" y1="40" x2="80" y2="440" strokeDasharray="2 4" />
          <line x1="280" y1="40" x2="280" y2="440" strokeDasharray="2 4" />
          <line x1="480" y1="40" x2="480" y2="440" strokeDasharray="2 4" />
          
          <circle cx="140" cy="80" r="18" strokeDasharray="2 3" />
          <line x1="140" y1="56" x2="140" y2="104" />
          <line x1="116" y1="80" x2="164" y2="80" />
          <circle cx="140" cy="80" r="2.5" fill="#D8A83C" />
          <text
            x="170"
            y="84"
            fontSize="9"
            fontFamily="var(--font-plus-jakarta)"
            letterSpacing="2"
            fill="currentColor"
            fontWeight="500"
          >
            LAT 20° 15&apos; N · LON 86° 40&apos; E · FAIRWAY
          </text>
        </g>

        {/* Sweeping dashed navigation course line */}
        <path
          d="M 50 250 C 180 180, 340 280, 680 190"
          stroke="#D8A83C"
          strokeWidth="1.5"
          strokeDasharray="6 6"
          opacity="0.7"
        />
        <circle cx="50" cy="250" r="3.5" fill="#D8A83C" />
        <circle cx="680" cy="190" r="4" fill="#F24B2A" />

        {/* --- CARGO VESSEL: REFINED EDITORIAL SILHOUETTE --- */}
        <g filter="url(#hullShadow)">
          {/* Funnel & Exhaust Stack */}
          <g transform="translate(180, 130)">
            <rect x="0" y="24" width="24" height="46" rx="2" fill="#103B2D" />
            <rect x="0" y="36" width="24" height="14" fill="#F24B2A" />
            <path d="M 0 24 L 24 19 L 24 24 Z" fill="#D8A83C" />
            {/* Minimalist steam wisps */}
            <path d="M 12 16 Q 18 6 30 8" stroke="#D8D0BD" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.6" />
            <path d="M 20 8 Q 28 0 40 4" stroke="#D8D0BD" strokeWidth="1.5" strokeLinecap="round" fill="none" opacity="0.4" />
          </g>

          {/* Slender Navigation Radar Mast & Rigging */}
          <g transform="translate(225, 108)" stroke="#103B2D" strokeWidth="1.8" strokeLinecap="round" className="dark:stroke-paper-light">
            <line x1="0" y1="0" x2="0" y2="92" />
            <line x1="-14" y1="24" x2="14" y2="24" />
            <line x1="-9" y1="44" x2="9" y2="44" />
            <line x1="0" y1="24" x2="35" y2="92" strokeWidth="0.8" opacity="0.5" strokeDasharray="3 3" />
            <line x1="0" y1="24" x2="-35" y2="92" strokeWidth="0.8" opacity="0.5" strokeDasharray="3 3" />
            <circle cx="0" cy="0" r="3" fill="#F24B2A" />
            <circle cx="14" cy="24" r="2.5" fill="#10B981" />
            <circle cx="-14" cy="24" r="2.5" fill="#F24B2A" />
          </g>

          {/* Bridge Deckhouse (Multi-Tier Paper-Cut Geometry) */}
          <g transform="translate(148, 172)">
            {/* Upper Pilot House */}
            <rect x="30" y="0" width="62" height="34" rx="2" fill="#F7F1DF" stroke="#103B2D" strokeWidth="1.5" />
            {/* Panoramic Bridge Windows */}
            <rect x="35" y="7" width="52" height="8" rx="1" fill="#103B2D" />
            {/* Mid Deck Tier with portholes */}
            <rect x="18" y="34" width="86" height="34" rx="2" fill="#F2EBCE" stroke="#103B2D" strokeWidth="1.5" />
            <circle cx="36" cy="51" r="3" fill="#103B2D" />
            <circle cx="58" cy="51" r="3" fill="#103B2D" />
            <circle cx="80" cy="51" r="3" fill="#103B2D" />
            {/* Lower Main Superstructure */}
            <rect x="6" y="68" width="108" height="34" rx="2" fill="#F7F1DF" stroke="#103B2D" strokeWidth="1.5" />
          </g>

          {/* Deck Deck-Crane Boom */}
          <g transform="translate(390, 185)" stroke="#103B2D" strokeWidth="1.8" strokeLinecap="round" className="dark:stroke-paper-light">
            <line x1="0" y1="50" x2="0" y2="12" />
            <line x1="0" y1="14" x2="40" y2="-10" />
            <line x1="40" y1="-10" x2="40" y2="50" strokeDasharray="2 3" strokeWidth="1.2" opacity="0.6" />
            <circle cx="0" cy="14" r="3" fill="#D8A83C" />
          </g>

          {/* STACKED CONTAINER CARGO (Editorial Paper-Cut Mosaic) */}
          <g transform="translate(268, 196)">
            {/* Tier 1 - Base Containers */}
            <rect x="0" y="42" width="54" height="36" rx="2" fill="#103B2D" />
            <line x1="14" y1="42" x2="14" y2="78" stroke="#F7F1DF" strokeWidth="1" opacity="0.25" />
            <line x1="28" y1="42" x2="28" y2="78" stroke="#F7F1DF" strokeWidth="1" opacity="0.25" />
            <line x1="42" y1="42" x2="42" y2="78" stroke="#F7F1DF" strokeWidth="1" opacity="0.25" />

            <rect x="58" y="42" width="54" height="36" rx="2" fill="#D8A83C" />
            <line x1="72" y1="42" x2="72" y2="78" stroke="#103B2D" strokeWidth="1" opacity="0.25" />
            <line x1="86" y1="42" x2="86" y2="78" stroke="#103B2D" strokeWidth="1" opacity="0.25" />

            <rect x="116" y="42" width="54" height="36" rx="2" fill="#F24B2A" />
            <line x1="130" y1="42" x2="130" y2="78" stroke="#F7F1DF" strokeWidth="1" opacity="0.3" />
            <line x1="144" y1="42" x2="144" y2="78" stroke="#F7F1DF" strokeWidth="1" opacity="0.3" />

            <rect x="174" y="42" width="54" height="36" rx="2" fill="#103B2D" />

            {/* Tier 2 - Mid Containers */}
            <rect x="12" y="6" width="54" height="36" rx="2" fill="#D8A83C" />
            <rect x="70" y="6" width="54" height="36" rx="2" fill="#F7F1DF" stroke="#103B2D" strokeWidth="1.2" />
            <rect x="128" y="6" width="54" height="36" rx="2" fill="#103B2D" />

            {/* Tier 3 - Accent Single Container */}
            <rect x="78" y="-28" width="50" height="32" rx="2" fill="#F24B2A" />
            <line x1="94" y1="-28" x2="94" y2="4" stroke="#F7F1DF" strokeWidth="1" opacity="0.4" />
            <line x1="110" y1="-28" x2="110" y2="4" stroke="#F7F1DF" strokeWidth="1" opacity="0.4" />
          </g>

          {/* MAIN HULL: Upper Forest Green + Coral Red Waterline + Golden Keel */}
          {/* Main Hull Body */}
          <path
            d="M 104 274 L 540 274 L 610 274 L 658 278 L 624 334 L 144 334 L 112 312 Z"
            fill="#103B2D"
            stroke="#103B2D"
            strokeWidth="1.5"
          />

          {/* Sheer Deck Edge Highlight Line (Paper fold crease) */}
          <path
            d="M 104 274 L 658 278"
            stroke="#F7F1DF"
            strokeWidth="3"
            strokeLinecap="round"
            opacity="0.9"
          />

          {/* Anchor Hawsehole & Hull Draft Scale */}
          <g fill="#F7F1DF">
            {/* Forward anchor pocket */}
            <ellipse cx="620" cy="288" rx="4" ry="6" fill="#0B211C" stroke="#D8D0BD" strokeWidth="1" />
            {/* Draft Marks on the bow */}
            <line x1="640" y1="284" x2="646" y2="284" stroke="#D8A83C" strokeWidth="1.8" />
            <line x1="636" y1="294" x2="643" y2="294" stroke="#D8A83C" strokeWidth="1.8" />
            <line x1="632" y1="304" x2="640" y2="304" stroke="#D8A83C" strokeWidth="1.8" />
            <line x1="628" y1="314" x2="636" y2="314" stroke="#D8A83C" strokeWidth="1.8" />
            {/* Midship Portholes */}
            <circle cx="570" cy="288" r="2.5" />
            <circle cx="582" cy="288" r="2.5" />
            <circle cx="594" cy="288" r="2.5" />
          </g>

          {/* Lower Waterline Belt (Vibrant Coral Red) */}
          <path
            d="M 144 334 L 624 334 L 602 368 L 172 368 Z"
            fill="#F24B2A"
          />

          {/* Keel Strip (Muted Mustard) */}
          <path
            d="M 172 368 L 602 368 L 590 376 L 188 376 Z"
            fill="#C4952D"
          />
        </g>

        {/* --- CALM ROLLING WAVES (LAYERED PAPER-CUT CONTOURS) --- */}
        {/* Layer 1: Background Warm Foam Ripple */}
        <path
          d="M 20 354 C 110 340, 190 364, 290 352 C 390 340, 500 366, 620 350 C 670 342, 705 348, 725 352 L 725 450 L 20 450 Z"
          fill="#D8D0BD"
          opacity="0.3"
          className="dark:fill-forest-border-dark dark:opacity-30"
        />

        {/* Layer 2: Mid Calm Swell (Forest Tone) */}
        <path
          d="M 0 374 C 120 358, 220 382, 340 370 C 460 358, 570 380, 680 364 C 710 360, 730 363, 740 366 L 740 460 L 0 460 Z"
          fill="#103B2D"
          opacity="0.10"
          className="dark:fill-forest-light dark:opacity-25"
        />

        {/* Layer 3: Crisp Nautical Water Surface Lines */}
        <g stroke="#103B2D" strokeWidth="1.8" strokeLinecap="round" className="dark:stroke-paper-light" opacity="0.45">
          {/* Bow wake spray ripple */}
          <path d="M 620 364 C 645 352, 675 352, 705 362" stroke="#F24B2A" strokeWidth="2" opacity="0.8" />
          <path d="M 50 390 C 95 380, 140 380, 185 390 C 230 400, 275 400, 320 390" />
          <path d="M 360 394 C 405 384, 450 384, 495 394 C 540 404, 585 404, 630 394" />
          <path d="M 120 420 C 175 410, 230 410, 285 420 C 340 430, 395 430, 450 420" strokeDasharray="6 4" />
          <path d="M 480 424 C 535 414, 590 414, 645 424" />
        </g>
      </svg>
    </div>
  );
}

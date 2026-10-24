import React from "react";

export function CoralStar({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={`text-coral ${className}`}
      aria-hidden="true"
    >
      <path d="M12 0L14.2 9.8L24 12L14.2 14.2L12 24L9.8 14.2L0 12L9.8 9.8L12 0Z" />
    </svg>
  );
}

export function MustardCompassTick({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      className={`text-mustard ${className}`}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" strokeDasharray="2 3" />
      <polygon points="12 4 14 11 12 10 10 11" fill="currentColor" />
      <polygon points="12 20 14 13 12 14 10 13" fill="currentColor" opacity="0.4" />
    </svg>
  );
}

export function WaveLine({ className = "w-16 h-3" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 80 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      className={`text-forest/30 dark:text-paper-light/30 ${className}`}
      aria-hidden="true"
    >
      <path d="M2 6C8 2 12 2 18 6C24 10 28 10 34 6C40 2 44 2 50 6C56 10 60 10 66 6C72 2 76 2 78 6" />
    </svg>
  );
}

export function NavigationRouteDashes({ className = "w-32 h-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 140 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeDasharray="4 4"
      className={`text-forest/40 dark:text-paper-light/40 ${className}`}
      aria-hidden="true"
    >
      <path d="M4 18 C 40 4, 80 22, 134 8" />
      <circle cx="4" cy="18" r="2.5" fill="#F24B2A" />
      <circle cx="134" cy="8" r="2.5" fill="#103B2D" className="dark:fill-paper-light" />
    </svg>
  );
}

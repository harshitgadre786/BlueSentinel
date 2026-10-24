"use client";

import React from "react";
import { useTheme } from "../context/ThemeContext";
import { Sun, Moon } from "lucide-react";

interface Props {
  className?: string;
}

export default function ThemeToggle({ className = "" }: Props) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      type="button"
      aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
      className={`relative inline-flex items-center justify-center p-2 rounded-lg border border-forest/20 dark:border-forest-border-dark bg-paper-light dark:bg-paper-dark hover:border-forest/50 dark:hover:border-paper-light/50 text-forest dark:text-paper-light transition-colors ${className}`}
      title={`Toggle theme (Current: ${theme})`}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 text-forest transition-transform hover:-rotate-12" />
      ) : (
        <Sun className="w-4 h-4 text-mustard transition-transform hover:rotate-45" />
      )}
    </button>
  );
}

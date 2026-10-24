"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Compass, Menu, X, ArrowRight } from "lucide-react";

export default function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-paper-light/95 dark:bg-paper-dark/95 backdrop-blur-sm border-b border-forest/15 dark:border-paper-light/15 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Left: Logo (Simple compass mark + wordmark) */}
          <Link
            href="/"
            className="flex items-center gap-3 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded bg-forest dark:bg-paper-light flex items-center justify-center text-paper-light dark:text-forest transition-transform group-hover:scale-105">
              <Compass className="w-4 h-4 transition-transform group-hover:rotate-45" />
            </div>
            <div className="flex flex-col">
              <span className="font-serif font-black text-2xl tracking-tight text-forest dark:text-paper-light leading-none">
                BlueSentinel
              </span>
              <span className="text-[10px] uppercase font-sans font-medium tracking-widest text-forest/50 dark:text-paper-light/50 mt-1">
                Maritime Decisions
              </span>
            </div>
          </Link>

          {/* Middle Nav: Editorial Links */}
          <nav className="hidden md:flex items-center gap-10 text-sm font-medium text-forest/80 dark:text-paper-light/80">
            <Link
              href="#how-it-works"
              className="hover:text-coral transition-colors py-1 relative group"
            >
              How It Works
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coral transition-all group-hover:w-full" />
            </Link>
            <Link
              href="#why-bluesentinel"
              className="hover:text-coral transition-colors py-1 relative group"
            >
              Why BlueSentinel
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coral transition-all group-hover:w-full" />
            </Link>
            <Link
              href="#impact"
              className="hover:text-coral transition-colors py-1 relative group"
            >
              Impact
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-coral transition-all group-hover:w-full" />
            </Link>
          </nav>

          {/* Right: Theme Toggle & Log In Button */}
          <div className="hidden sm:flex items-center gap-4">
            <ThemeToggle />

            {user ? (
              <Link
                href="/workspace"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest hover:bg-forest-light dark:hover:bg-paper-surface border border-forest dark:border-paper-light transition-all shadow-editorial hover:translate-x-[-1px] hover:translate-y-[-1px]"
              >
                <span>Workspace</span>
                <ArrowRight className="w-3.5 h-3.5 text-coral" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest hover:bg-forest-light dark:hover:bg-paper-surface border border-forest dark:border-paper-light transition-all shadow-editorial hover:translate-x-[-1px] hover:translate-y-[-1px]"
              >
                <span>Log in</span>
                <ArrowRight className="w-3.5 h-3.5 text-coral" />
              </Link>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="flex sm:hidden items-center gap-3">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              type="button"
              className="p-2 rounded-md border border-forest/20 dark:border-paper-light/20 text-forest dark:text-paper-light"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-forest/15 dark:border-paper-light/15 bg-paper-light dark:bg-paper-dark px-6 pt-4 pb-6 space-y-4">
          <Link
            href="#how-it-works"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-sm font-medium text-forest dark:text-paper-light hover:text-coral"
          >
            How It Works
          </Link>
          <Link
            href="#why-bluesentinel"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-sm font-medium text-forest dark:text-paper-light hover:text-coral"
          >
            Why BlueSentinel
          </Link>
          <Link
            href="#impact"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1 text-sm font-medium text-forest dark:text-paper-light hover:text-coral"
          >
            Impact
          </Link>
          <div className="pt-3 border-t border-forest/15 dark:border-paper-light/15">
            <Link
              href={user ? "/workspace" : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="block w-full text-center py-3 text-xs font-bold rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest"
            >
              {user ? "Open Workspace" : "Log in to your workspace"}
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

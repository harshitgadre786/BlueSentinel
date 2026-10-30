"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { Compass, Ship, FileCheck, Bot, Sliders, FileText, Leaf, ArrowLeft } from "lucide-react";

export default function WorkspaceNav({ serviceTitle }: { serviceTitle?: string }) {
  const pathname = usePathname();

  const links = [
    { href: "/workspace", label: "Overview", icon: Compass },
    { href: "/workspace/voyage-planner", label: "Voyage Planner", icon: Ship },
    { href: "/workspace/compliance", label: "Compliance", icon: FileCheck },
    { href: "/workspace/blueai", label: "BlueAI Agent", icon: Bot },
    { href: "/workspace/simulator", label: "Simulator", icon: Sliders },
    { href: "/workspace/environment", label: "Environment", icon: Leaf },
    { href: "/workspace/reports", label: "Reports", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-paper-light/95 dark:bg-paper-dark/95 backdrop-blur-sm border-b border-forest/15 dark:border-paper-light/15 px-4 sm:px-8 py-3.5 transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/workspace"
            className="flex items-center gap-2 text-forest/70 dark:text-paper-light/70 hover:text-coral transition-colors text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Workspace</span>
          </Link>
          <span className="text-forest/20 dark:text-paper-light/20">/</span>
          <span className="font-serif font-black text-lg text-forest dark:text-paper-light">
            {serviceTitle || "BlueSentinel"}
          </span>
        </div>

        <nav className="hidden lg:flex items-center gap-1 bg-paper-surface/60 dark:bg-paper-dark-surface/50 p-1 rounded-md border border-forest/10 dark:border-paper-light/10 text-xs">
          {links.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/workspace" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-3 py-1.5 rounded font-medium transition-all ${
                  isActive
                    ? "bg-forest text-paper-light dark:bg-paper-light dark:text-forest font-bold"
                    : "text-forest/70 dark:text-paper-light/70 hover:text-coral"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-[11px] font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium">Fleet Engine Active</span>
          </div>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

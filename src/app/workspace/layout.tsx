"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Loader2 } from "lucide-react";
import { CoralStar } from "@/components/editorial/EditorialMarks";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-paper-light dark:bg-paper-dark flex flex-col items-center justify-center p-6 text-forest dark:text-paper-light font-sans">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center">
          <div className="w-12 h-12 rounded-full border border-forest/20 dark:border-paper-light/20 flex items-center justify-center bg-paper-surface dark:bg-paper-dark-surface shadow-editorial">
            <Loader2 className="w-6 h-6 text-coral animate-spin" />
          </div>
          <div className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-forest/60 dark:text-paper-light/60">
            <CoralStar className="w-3.5 h-3.5 text-coral" />
            <span>Verifying Authorization</span>
          </div>
          <p className="text-sm font-serif text-forest/70 dark:text-paper-light/70">
            Connecting to BlueSentinel fleet decision hub...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}

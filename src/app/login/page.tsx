"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";
import VesselIllustration from "../../components/editorial/VesselIllustration";
import { CoralStar } from "../../components/editorial/EditorialMarks";
import LegalModal from "../../components/LegalModal";
import {
  Compass,
  ArrowLeft,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);
  const router = useRouter();
  const {
    user,
    signInWithGoogle,
  } = useAuth();

  // If already logged in, redirect to workspace
  useEffect(() => {
    if (user) {
      router.push("/workspace");
    }
  }, [user, router]);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Google Sign-in
  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsLoading(true);

    const result = await signInWithGoogle();
    setIsLoading(false);

    if (result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light flex flex-col font-sans transition-colors selection:bg-coral selection:text-paper-light">
      {/* Minimal Top Header */}
      <header className="border-b border-forest/15 dark:border-paper-light/15 px-6 sm:px-10 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-3 text-forest dark:text-paper-light group"
          >
            <div className="w-8 h-8 rounded bg-forest dark:bg-paper-light flex items-center justify-center text-paper-light dark:text-forest">
              <Compass className="w-4 h-4" />
            </div>
            <span className="font-serif font-black text-xl tracking-tight">
              BlueSentinel
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/"
              className="text-xs font-semibold text-forest/70 dark:text-paper-light/70 hover:text-coral transition-colors flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Split Screen */}
      <main className="flex-1 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 min-h-[calc(100vh-77px)]">
        {/* Left Side: Emotional Visual Anchor (Cargo Vessel + Atmospheric Statement) */}
        <section className="lg:col-span-7 bg-paper-surface/50 dark:bg-paper-dark-surface/40 p-8 sm:p-14 lg:p-20 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-forest/15 dark:border-paper-light/15">
          <div className="space-y-4 max-w-md">
            <div className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-forest/60 dark:text-paper-light/60">
              <CoralStar className="w-3.5 h-3.5" />
              <span>Logistics & Fleet Command</span>
            </div>

            <h2 className="font-serif text-3xl sm:text-5xl font-black text-forest dark:text-paper-light leading-tight">
              A clearer course starts here.
            </h2>

            <p className="text-base text-forest/75 dark:text-paper-light/75 leading-relaxed font-normal pt-1">
              Audit port draft limits, evaluate dynamic squat curves, and make
              unimpeachable charter decisions before booking.
            </p>
          </div>

          {/* Large emotional vessel centerpiece */}
          <div className="py-12 my-auto">
            <VesselIllustration variant="login" className="w-full max-w-xl mx-auto" />
          </div>

          <div className="pt-6 border-t border-forest/15 dark:border-paper-light/15 flex items-center justify-between text-xs text-forest/60 dark:text-paper-light/60 font-mono">
            <span>DETERMINISTIC VOYAGE AUDIT</span>
            <span>PORT CIRCULARS VERIFIED</span>
          </div>
        </section>

        {/* Right Side: Distilled, Pristine Authentication Form */}
        <section className="lg:col-span-5 p-8 sm:p-14 lg:p-16 flex flex-col justify-center max-w-md mx-auto w-full">
          <div className="space-y-8">
            {/* Form Heading */}
            <div className="space-y-2">
              <h1 className="font-serif text-3xl sm:text-4xl font-black text-forest dark:text-paper-light tracking-tight">
                Welcome aboard
              </h1>
              <p className="text-sm text-forest/70 dark:text-paper-light/70 font-normal">
                Sign in to your BlueSentinel workspace.
              </p>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                role="alert"
                className="p-3.5 rounded-md bg-coral/10 border border-coral text-coral text-xs flex items-start gap-2.5 animate-fadeIn"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="leading-relaxed">{errorMsg}</div>
              </div>
            )}

            {/* Success / Status Message */}
            {successMsg && (
              <div
                role="status"
                className="p-3.5 rounded-md bg-forest/10 dark:bg-paper-light/10 border border-forest/30 dark:border-paper-light/30 text-forest dark:text-paper-light text-xs flex items-start gap-2.5 animate-fadeIn"
              >
                <div className="leading-relaxed font-medium">{successMsg}</div>
              </div>
            )}

            {/* Authentication Flow - Google OAuth Only */}
            <div className="space-y-6">
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-md bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light text-sm font-semibold border border-forest/30 dark:border-paper-light/30 hover:border-forest dark:hover:border-paper-light transition-all disabled:opacity-50 cursor-pointer shadow-sm hover:shadow"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{isLoading ? "Signing in..." : "Continue with Google"}</span>
              </button>
            </div>

            {/* Small Legal Disclaimer */}
            <p className="text-[11px] text-center text-forest/50 dark:text-paper-light/50 leading-relaxed font-sans pt-4 border-t border-forest/15 dark:border-paper-light/15">
              By continuing, you agree to the{" "}
              <button
                type="button"
                onClick={() => setLegalModal("terms")}
                className="underline hover:text-coral cursor-pointer"
              >
                Terms of Service
              </button>{" "}
              and{" "}
              <button
                type="button"
                onClick={() => setLegalModal("privacy")}
                className="underline hover:text-coral cursor-pointer"
              >
                Privacy Policy
              </button>
              .
            </p>
            <LegalModal
              isOpen={legalModal !== null}
              type={legalModal}
              onClose={() => setLegalModal(null)}
            />
          </div>
        </section>
      </main>
    </div>
  );
}

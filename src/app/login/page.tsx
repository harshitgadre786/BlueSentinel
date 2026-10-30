"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import ThemeToggle from "../../components/ThemeToggle";
import VesselIllustration from "../../components/editorial/VesselIllustration";
import { CoralStar } from "../../components/editorial/EditorialMarks";
import LegalModal from "../../components/LegalModal";
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";

const COUNTRY_CODES = [
  { code: "+91", label: "India (+91)" },
  { code: "+1", label: "US (+1)" },
  { code: "+65", label: "Singapore (+65)" },
  { code: "+44", label: "UK (+44)" },
  { code: "+971", label: "UAE (+971)" },
  { code: "+61", label: "Australia (+61)" },
];

export default function LoginPage() {
  const [legalModal, setLegalModal] = useState<"privacy" | "terms" | null>(null);
  const router = useRouter();
  const {
    user,
    isConfigured,
    signInWithGoogle,
    sendPhoneOtp,
    verifyPhoneOtp,
  } = useAuth();

  // If already logged in, redirect to workspace
  useEffect(() => {
    if (user) {
      router.push("/workspace");
    }
  }, [user, router]);

  // Form State
  const [step, setStep] = useState<"PHONE_ENTRY" | "OTP_VERIFY">("PHONE_ENTRY");
  const [selectedCountryCode, setSelectedCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [activeOtpIndex, setActiveOtpIndex] = useState(0);

  // Status & Feedback States
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Countdown timer for OTP resend
  const [resendTimer, setResendTimer] = useState(45);
  const [canResend, setCanResend] = useState(false);

  // References for the 6 OTP input boxes
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (step === "OTP_VERIFY" && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [step, resendTimer]);

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

  // Helper to sanitize & format E.164 phone number (+919876543210)
  const sanitizeToE164 = (countryCode: string, rawNumber: string) => {
    const cleanCc = countryCode.startsWith("+")
      ? countryCode
      : `+${countryCode.replace(/\D/g, "")}`;
    let cleanDigits = rawNumber.replace(/\D/g, "").replace(/^0+/, "");
    const ccDigits = cleanCc.replace(/\D/g, "");
    if (cleanDigits.startsWith(ccDigits) && cleanDigits.length > 10) {
      cleanDigits = cleanDigits.slice(ccDigits.length);
    }
    const fullPhone = `${cleanCc}${cleanDigits}`;
    const isValid =
      cleanDigits.length >= 7 &&
      cleanDigits.length <= 15 &&
      /^\+[1-9]\d{7,14}$/.test(fullPhone);
    return { fullPhone, cleanDigits, isValid };
  };

  // Handle Phone OTP Request
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const { fullPhone, cleanDigits, isValid } = sanitizeToE164(
      selectedCountryCode,
      phoneNumber
    );

    if (!cleanDigits || cleanDigits.length < 7 || !isValid) {
      setErrorMsg("Please enter a valid mobile number in international format (+919876543210).");
      return;
    }

    try {
      setIsLoading(true);
      const result = await sendPhoneOtp(fullPhone);
      setIsLoading(false);

      if (result.error) {
        setErrorMsg(result.error);
        return;
      }

      if (result.isDemoFallback) {
        setSuccessMsg("Verification code dispatched (Demo Access Code: 123456 ready).");
      } else {
        setSuccessMsg(`Verification code dispatched to ${fullPhone}`);
      }

      setStep("OTP_VERIFY");
      setResendTimer(45);
      setCanResend(false);

      // Auto focus first OTP input box
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: unknown) {
      setIsLoading(false);
      const msg =
        err instanceof Error
          ? err.message
          : "Failed to send verification code. Please check your network and try again.";
      setErrorMsg(msg);
    }
  };

  // Handle OTP digit changes
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newDigits = [...otpDigits];
    const char = value.slice(-1);
    newDigits[index] = char;
    setOtpDigits(newDigits);

    if (char && index < 5) {
      setActiveOtpIndex(index + 1);
      otpInputRefs.current[index + 1]?.focus();
    }

    if (char && index === 5 && newDigits.every((d) => d !== "")) {
      triggerVerifyOtp(newDigits.join(""));
    }
  };

  // Handle OTP backspace navigation
  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
      setActiveOtpIndex(index - 1);
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  // Handle Paste into OTP boxes
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!pasted) return;

    const newDigits = ["", "", "", "", "", ""];
    for (let i = 0; i < pasted.length; i++) {
      newDigits[i] = pasted[i];
    }
    setOtpDigits(newDigits);

    if (pasted.length === 6 || pasted.length === 4) {
      triggerVerifyOtp(pasted);
    } else {
      const nextIdx = Math.min(5, pasted.length);
      setActiveOtpIndex(nextIdx);
      otpInputRefs.current[nextIdx]?.focus();
    }
  };

  const handleQuickFillDemoOtp = () => {
    const demoDigits = ["1", "2", "3", "4", "5", "6"];
    setOtpDigits(demoDigits);
    setErrorMsg(null);
    triggerVerifyOtp("123456");
  };

  // Trigger verification (supports 4 or 6 digits)
  const triggerVerifyOtp = async (codeToVerify?: string) => {
    const rawCode = (codeToVerify || otpDigits.join("")).replace(/\D/g, "");
    if (rawCode.length !== 4 && rawCode.length !== 6) {
      setErrorMsg("Please enter a valid 4 or 6 digit verification code (Demo OTP: 123456).");
      return;
    }
    const code = rawCode;

    const { fullPhone } = sanitizeToE164(selectedCountryCode, phoneNumber);
    const targetPhone = fullPhone.length > 3 ? fullPhone : "+919876543210";

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const result = await verifyPhoneOtp(targetPhone, code);
      setIsLoading(false);

      if (result.error) {
        setErrorMsg(result.error);
      } else {
        router.push("/workspace");
      }
    } catch (err: unknown) {
      setIsLoading(false);
      const msg =
        err instanceof Error
          ? err.message
          : "Verification failed. Please check your credentials and try again.";
      setErrorMsg(msg);
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

            {/* Authentication Flow */}
            {step === "PHONE_ENTRY" ? (
              <div className="space-y-6">
                {/* 1. Official Google OAuth Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-md bg-paper-light dark:bg-paper-dark text-forest dark:text-paper-light text-sm font-semibold border border-forest/30 dark:border-paper-light/30 hover:border-forest dark:hover:border-paper-light transition-all disabled:opacity-50"
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
                  <span>Continue with Google</span>
                </button>

                {/* Delicate Hairline Divider */}
                <div className="relative flex items-center justify-center py-2">
                  <div className="w-full border-t border-forest/15 dark:border-paper-light/15" />
                  <span className="bg-paper-light dark:bg-paper-dark px-3 text-xs uppercase font-medium text-forest/40 dark:text-paper-light/40 font-mono tracking-wider">
                    or continue with phone
                  </span>
                </div>

                {/* 2. Phone Form */}
                <form onSubmit={handleSendOtp} className="space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="phone-input"
                      className="block text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80"
                    >
                      Phone Number
                    </label>

                    <div className="flex rounded-md border border-forest/25 dark:border-paper-light/25 bg-paper-surface/40 dark:bg-paper-dark-surface/40 focus-within:border-forest dark:focus-within:border-paper-light transition-colors">
                      <select
                        value={selectedCountryCode}
                        onChange={(e) => setSelectedCountryCode(e.target.value)}
                        className="bg-transparent text-xs font-semibold text-forest dark:text-paper-light px-3 py-3 border-r border-forest/15 dark:border-paper-light/15 focus:outline-none cursor-pointer"
                        aria-label="Country Code"
                      >
                        {COUNTRY_CODES.map((c) => (
                          <option key={c.code} value={c.code} className="bg-paper-light dark:bg-paper-dark">
                            {c.label}
                          </option>
                        ))}
                      </select>

                      <input
                        id="phone-input"
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="98765 43210"
                        required
                        className="flex-1 bg-transparent px-3 py-3 text-sm text-forest dark:text-paper-light placeholder:text-forest/35 dark:placeholder:text-paper-light/35 focus:outline-none font-mono"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-sm font-bold tracking-wide border border-forest dark:border-paper-light transition-all disabled:opacity-50"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-coral" />
                        <span>Sending secure OTP...</span>
                      </>
                    ) : (
                      <>
                        <span>Send secure OTP</span>
                        <ArrowRight className="w-4 h-4 text-coral" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            ) : (
              /* Step 2: 6 Individual OTP Boxes */
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-forest/15 dark:border-paper-light/15">
                  <button
                    type="button"
                    onClick={() => {
                      setStep("PHONE_ENTRY");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs font-semibold text-forest/70 dark:text-paper-light/70 hover:text-coral flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Change number</span>
                  </button>

                  <span className="text-xs font-mono text-forest/60 dark:text-paper-light/60">
                    {selectedCountryCode} {phoneNumber}
                  </span>
                </div>

                <div className="space-y-3">
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest/80 dark:text-paper-light/80">
                    Enter 4 or 6-Digit Verification Code
                  </label>

                  <div className="grid grid-cols-6 gap-2 sm:gap-3" onPaste={handleOtpPaste}>
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => {
                          otpInputRefs.current[idx] = el;
                        }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-full h-14 sm:h-16 text-center font-serif text-2xl font-bold rounded-md border bg-paper-surface/50 dark:bg-paper-dark-surface/50 text-forest dark:text-paper-light focus:outline-none transition-all ${
                          digit
                            ? "border-forest dark:border-paper-light"
                            : "border-forest/20 dark:border-paper-light/20"
                        }`}
                        aria-label={`Digit ${idx + 1}`}
                      />
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-forest/5 dark:bg-paper-light/5 border border-forest/15 dark:border-paper-light/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs font-mono font-bold text-forest dark:text-paper-light">
                      Demo Access Code: <strong className="text-coral">123456</strong>
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleQuickFillDemoOtp}
                    className="text-xs font-bold text-coral hover:underline cursor-pointer px-2.5 py-1 rounded bg-coral/10 border border-coral/20"
                  >
                    Quick Fill & Enter
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs text-forest/70 dark:text-paper-light/70 font-mono">
                  {canResend ? (
                    <button
                      type="button"
                      onClick={() => handleSendOtp({ preventDefault: () => {} } as React.FormEvent)}
                      className="text-coral hover:underline font-bold cursor-pointer"
                    >
                      Resend code
                    </button>
                  ) : (
                    <span>Resend code in {resendTimer}s</span>
                  )}
                  <span className="text-[11px] text-forest/50 dark:text-paper-light/50">
                    Demo Code: 123456
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => triggerVerifyOtp()}
                  disabled={isLoading || (otpDigits.join("").length !== 4 && otpDigits.join("").length !== 6)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-md bg-forest text-paper-light dark:bg-paper-light dark:text-forest text-sm font-bold tracking-wide border border-forest dark:border-paper-light transition-all disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-coral" />
                      <span>Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span>Verify & Enter Workspace</span>
                      <ArrowRight className="w-4 h-4 text-coral" />
                    </>
                  )}
                </button>
              </div>
            )}

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

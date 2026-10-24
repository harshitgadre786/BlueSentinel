"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase, isSupabaseConfigured } from "../lib/supabase-client";

export interface AuthUser {
  id: string;
  email?: string;
  phone?: string;
  name?: string;
  avatarUrl?: string;
  isDemo?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  isLoading: boolean;
  isConfigured: boolean;
  signInWithGoogle: () => Promise<{ error?: string }>;
  sendPhoneOtp: (phone: string) => Promise<{ error?: string; isDemoFallback?: boolean }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  loginDemoUser: (phone?: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_USER_KEY = "bluesentinel_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state
  useEffect(() => {
    let mounted = true;

    async function checkAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session: currentSession } } = await supabase.auth.getSession();
          if (mounted && currentSession?.user) {
            setSession(currentSession);
            setUser({
              id: currentSession.user.id,
              email: currentSession.user.email,
              phone: currentSession.user.phone,
              name: currentSession.user.user_metadata?.full_name || currentSession.user.email?.split("@")[0] || "Captain",
              avatarUrl: currentSession.user.user_metadata?.avatar_url,
            });
            setIsLoading(false);
            return;
          }

          // Listen for Supabase auth state changes (e.g. OAuth redirects)
          const { data: { subscription } } = supabase.auth.onAuthStateChange(
            (_event, updatedSession) => {
              if (!mounted) return;
              setSession(updatedSession);
              if (updatedSession?.user) {
                setUser({
                  id: updatedSession.user.id,
                  email: updatedSession.user.email,
                  phone: updatedSession.user.phone,
                  name: updatedSession.user.user_metadata?.full_name || updatedSession.user.email?.split("@")[0] || "Captain",
                  avatarUrl: updatedSession.user.user_metadata?.avatar_url,
                });
              } else {
                setUser(null);
              }
              setIsLoading(false);
            }
          );

          return () => {
            subscription.unsubscribe();
          };
        } catch {
          // If Supabase call fails, proceed to fallback
        }
      }

      // Check localStorage for demo/persisted session
      if (typeof window !== "undefined") {
        try {
          const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (mounted) setUser(parsed);
          }
        } catch {
          // Ignore
        }
      }

      if (mounted) setIsLoading(false);
    }

    checkAuth();

    return () => {
      mounted = false;
    };
  }, []);

  const signInWithGoogle = async (): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return {
        error: "Supabase credentials are not configured in .env.local. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to enable live Google OAuth.",
      };
    }

    try {
      const siteUrl =
        process.env.NEXT_PUBLIC_SITE_URL ||
        (typeof window !== "undefined" ? window.location.origin : "");
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${siteUrl}/workspace`,
        },
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to initiate Google sign-in";
      return { error: msg };
    }
  };

  const sendPhoneOtp = async (
    phone: string
  ): Promise<{ error?: string; isDemoFallback?: boolean }> => {
    if (!isSupabaseConfigured || !supabase) {
      // Return clear indication that Supabase is unconfigured, but allow sandbox code for reviewer verification
      return {
        isDemoFallback: true,
      };
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone,
      });

      if (error) {
        return { error: error.message };
      }
      return {};
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to send phone OTP";
      return { error: msg };
    }
  };

  const verifyPhoneOtp = async (
    phone: string,
    token: string
  ): Promise<{ error?: string }> => {
    // Check if token is for live Supabase or sandbox
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.verifyOtp({
          phone,
          token,
          type: "sms",
        });

        if (error) {
          return { error: error.message };
        }

        if (data.user) {
          const newUser: AuthUser = {
            id: data.user.id,
            phone: data.user.phone || phone,
            name: "Captain " + phone.slice(-4),
          };
          setUser(newUser);
          if (typeof window !== "undefined") {
            localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(newUser));
          }
          return {};
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Failed to verify OTP";
        return { error: msg };
      }
    }

    // Demo/Sandbox verification: Accepts 123456 or any 6-digit test code
    if (token.trim() === "123456" || token.length === 6) {
      const demoUser: AuthUser = {
        id: "demo_usr_" + Date.now(),
        phone: phone,
        name: "Captain " + phone.slice(-4),
        isDemo: true,
      };
      setUser(demoUser);
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demoUser));
      }
      return {};
    }

    return { error: "Invalid OTP code. Please enter the 6-digit verification code (Use 123456 for sandbox testing)." };
  };

  const signOut = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Continue to clear local state
      }
    }
    setUser(null);
    setSession(null);
    if (typeof window !== "undefined") {
      localStorage.removeItem(LOCAL_STORAGE_USER_KEY);
    }
  };

  const loginDemoUser = (phone = "+91 98765 43210") => {
    const demo: AuthUser = {
      id: "demo_captain_01",
      phone,
      name: "Captain Arun Sharma",
      isDemo: true,
    };
    setUser(demo);
    if (typeof window !== "undefined") {
      localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(demo));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        isLoading,
        isConfigured: isSupabaseConfigured,
        signInWithGoogle,
        sendPhoneOtp,
        verifyPhoneOtp,
        signOut,
        loginDemoUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

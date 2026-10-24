import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SimulationInputs, VesselCalculationResult, ComparisonVerdict } from "./types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null;

export interface VoyageDecisionLog {
  id?: string;
  created_at?: string;
  cargo_type: string;
  cargo_tonnage: number;
  origin: string;
  destination: string;
  speed_knots: number;
  recommended_vessel: string;
  risk_adjusted_saving_usd: number;
  co2_saving_mt: number;
  status: "SIMULATED" | "APPROVED" | "EXPORTED";
}

const LOCAL_STORAGE_KEY = "bluesentinel_voyage_logs";

export async function saveDecisionLog(
  inputs: SimulationInputs,
  verdict: ComparisonVerdict,
  resultA: VesselCalculationResult,
  resultB: VesselCalculationResult
): Promise<{ success: boolean; id: string }> {
  const log: VoyageDecisionLog = {
    id: "log_" + Date.now(),
    created_at: new Date().toISOString(),
    cargo_type: inputs.cargoType,
    cargo_tonnage: inputs.cargoTonnage,
    origin: inputs.originId,
    destination: inputs.destinationId,
    speed_knots: inputs.speedKnots,
    recommended_vessel: verdict.recommendedVesselId === "vesselB" ? resultB.vesselName : resultA.vesselName,
    risk_adjusted_saving_usd: Math.abs(verdict.costDifferenceUSD),
    co2_saving_mt: Math.abs(verdict.co2DifferenceMT),
    status: "SIMULATED",
  };

  // If live Supabase is configured, persist to database table 'voyage_decisions'
  if (supabase) {
    try {
      const { data, error } = await supabase.from("voyage_decisions").insert([log]).select();
      if (!error && data && data.length > 0) {
        return { success: true, id: data[0].id || log.id! };
      }
    } catch {
      // Fallback to local storage if network or table issue
    }
  }

  // Local storage fallback for seamless client-side experience
  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.unshift(log);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    } catch {
      // Ignore local storage quota limits
    }
  }

  return { success: true, id: log.id! };
}

export async function getDecisionLogs(): Promise<VoyageDecisionLog[]> {
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("voyage_decisions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);
      if (!error && data) return data as VoyageDecisionLog[];
    } catch {
      // fallback
    }
  }

  if (typeof window !== "undefined") {
    try {
      const existing = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (existing) return JSON.parse(existing);
    } catch {
      return [];
    }
  }

  return [];
}

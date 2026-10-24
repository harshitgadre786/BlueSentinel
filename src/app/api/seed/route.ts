import { NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabase-client";

// Pre-packaged Seed Data for Captain Sharma's 75,000 MT Thermal Coal Paradip Voyage
const CAPTAIN_SHARMA_SEED = {
  vessels: [
    {
      id: "vessel_a",
      name: "MV Ocean Titan",
      type: "Capesize Bulker",
      dwt: 82000,
      loaded_draft: 14.8,
      average_speed: 14.0,
      daily_fuel_burn: 36.0,
      freight_daily_rate: 18500,
      emission_factor: 3.114,
    },
    {
      id: "vessel_b",
      name: "MV Nilgiri Wave",
      type: "Modern Kamsarmax",
      dwt: 64000,
      loaded_draft: 13.2,
      average_speed: 12.5,
      daily_fuel_burn: 24.5,
      freight_daily_rate: 21000,
      emission_factor: 3.114,
    },
    {
      id: "vessel_c",
      name: "MV Bengal Pioneer",
      type: "Standard Ultramax",
      dwt: 70000,
      loaded_draft: 13.5,
      average_speed: 11.8,
      daily_fuel_burn: 32.0,
      freight_daily_rate: 16800,
      emission_factor: 3.114,
    },
  ],
  port_rules: [
    {
      id: "INPBD",
      port_name: "Paradip Port",
      country: "India",
      max_draft_cd: 14.5,
      tide_allowance_avg: 1.8,
      required_ukc: 1.0,
      demurrage_rate_usd: 24000,
      lightering_rate_usd: 48000,
      required_documents: [
        "Q88 Vessel Specification",
        "Berth Clearance Application Form C",
        "Tide Window Declaration",
        "Ballast Water Management Plan (D-2 Standard)",
        "Under-Keel Clearance Verification Sheet",
      ],
      berth_conditions: {
        berth: "Mechanized Coal Berth 1 & 2",
        channel_length_nm: 4.2,
        density_sg: 1.025,
        tug_requirement: "3 ASD Tugs mandatory for DWT > 60,000",
      },
    },
    {
      id: "INIXY",
      port_name: "Deendayal / Kandla Port",
      country: "India",
      max_draft_cd: 13.0,
      tide_allowance_avg: 2.5,
      required_ukc: 1.2,
      demurrage_rate_usd: 21000,
      lightering_rate_usd: 42000,
      required_documents: [
        "Q88 Vessel Specification",
        "Kandla Creek Navigation Plan",
        "Tidal Curve Calculation Table",
      ],
    },
    {
      id: "INNSA",
      port_name: "Jawaharlal Nehru Port (JNPT)",
      country: "India",
      max_draft_cd: 14.0,
      tide_allowance_avg: 1.5,
      required_ukc: 1.0,
      demurrage_rate_usd: 28000,
      lightering_rate_usd: 55000,
      required_documents: [
        "Customs Declaration Manifest",
        "Q88 Bulker Specification",
        "Green Port Incentive Compliance Record",
      ],
    },
  ],
  voyage: {
    id: "a0000000-0000-0000-0000-000000000001",
    cargo_type: "Thermal Coal",
    cargo_quantity_mt: 75000,
    origin_port: "Singapore (SGSIN)",
    destination_port: "Paradip (INPBD)",
    laycan_date: "2026-11-02T00:00:00Z",
    fuel_price_usd: 640.0,
    usd_to_inr_rate: 83.5,
    port_waiting_days: 3.5,
    selected_vessel_id: "vessel_b",
    status: "RECOMMENDED_APPROVED",
  },
  recommendation: {
    id: "b0000000-0000-0000-0000-000000000001",
    voyage_id: "a0000000-0000-0000-0000-000000000001",
    recommended_vessel_id: "MV Nilgiri Wave",
    total_landed_cost_usd: 778160,
    risk_adjusted_cost_usd: 808160,
    compliance_status: "PASSED_COMPLIANT",
    draft_margin_m: 1.3,
    overall_risk_score: 18,
    co2_estimate_mt: 457.2,
    rejection_reasons: {
      vessel_a: {
        status: "DRAFT_VIOLATION_FAIL",
        reason:
          "Arrival draft exceeds safe channel depth at Paradip Coal Berth (-0.78m draft violation). High grounding risk & mandatory offshore lightering penalty ($142,000 risk premium).",
      },
      vessel_c: {
        status: "DELAY_RISK_WARNING",
        reason:
          "Severe port congestion exposure due to older auxiliary plant & slow discharge rating, triggering 3.5 days demurrage penalty ($67,200 exposure). Total risk score: 74/100.",
      },
    },
  },
  report: {
    id: "RPT-2026-PBD-001",
    title: "Executive Decision Brief: Singapore to Paradip 75,000 MT Thermal Coal",
    selected_vessel: "MV Nilgiri Wave",
    destination_port: "Paradip (INPBD)",
    total_cost_usd: 778160,
    risk_score: 18,
  },
};

export async function GET() {
  if (!isSupabaseConfigured || !supabase) {
    return NextResponse.json({
      status: "DEMO_MODE",
      isConfigured: false,
      message:
        "Supabase environment variables are unconfigured. BlueSentinel is operating in offline demo sandbox mode with Captain Sharma benchmark data.",
      seedData: CAPTAIN_SHARMA_SEED,
    });
  }

  try {
    // Check if tables exist and attempt seeding
    const results: Record<string, string> = {};

    // 1. Seed Port Rules
    const { error: portErr } = await supabase
      .from("port_rules")
      .upsert(CAPTAIN_SHARMA_SEED.port_rules, { onConflict: "id" });
    results["port_rules"] = portErr ? `Error: ${portErr.message}` : "Seeded successfully";

    // 2. Seed Vessels
    const { error: vesselErr } = await supabase
      .from("vessels")
      .upsert(CAPTAIN_SHARMA_SEED.vessels, { onConflict: "id" });
    results["vessels"] = vesselErr ? `Error: ${vesselErr.message}` : "Seeded successfully";

    // 3. Seed Voyages
    const { error: voyageErr } = await supabase
      .from("voyages")
      .upsert([CAPTAIN_SHARMA_SEED.voyage], { onConflict: "id" });
    results["voyages"] = voyageErr ? `Error: ${voyageErr.message}` : "Seeded successfully";

    // 4. Seed Recommendations
    const { error: recErr } = await supabase
      .from("recommendations")
      .upsert([CAPTAIN_SHARMA_SEED.recommendation], { onConflict: "id" });
    results["recommendations"] = recErr ? `Error: ${recErr.message}` : "Seeded successfully";

    // 5. Seed Report
    const { error: reportErr } = await supabase
      .from("reports")
      .upsert([CAPTAIN_SHARMA_SEED.report], { onConflict: "id" });
    results["reports"] = reportErr ? `Error: ${reportErr.message}` : "Seeded successfully";

    return NextResponse.json({
      status: "CONNECTED",
      isConfigured: true,
      message: "Connected to Supabase. Seed data verified.",
      results,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Failed to seed Supabase";
    return NextResponse.json({
      status: "ERROR",
      isConfigured: true,
      error: errorMsg,
      note: "Ensure tables are created by executing supabase/migrations/20261024_init_schema.sql in the Supabase SQL editor.",
    });
  }
}

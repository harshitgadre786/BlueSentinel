import { NextRequest, NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase-client";
import { createClient } from "@supabase/supabase-js";

// Benchmark Seed Data for Captain Sharma (used for local fallback or verified admin seeding)
const CAPTAIN_SHARMA_BENCHMARK = {  vessels: [
    {
      id: "vessel_b",
      name: "MV Sentinel Carrier",
      type: "Supramax Bulk Carrier",
      imo_number: "9876543",
      mmsi: "563123450",
      flag: "Singapore",
      dwt: 58000,
      loaded_draft: 12.80,
      beam: 32.26,
      average_speed: 13.5,
      daily_fuel_burn: 24.8,
      freight_daily_rate: 21500,
      cargo_capabilities: ["DRY_BULK"],
      current_port: "Singapore Anchorage",
      coordinates: { lat: 1.2902, lng: 103.8519 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_a",
      name: "MV Ocean Pioneer",
      type: "Panamax Bulk Carrier",
      imo_number: "9642318",
      mmsi: "538009871",
      flag: "Marshall Islands",
      dwt: 82500,
      loaded_draft: 15.20,
      beam: 32.26,
      average_speed: 14.0,
      daily_fuel_burn: 32.2,
      freight_daily_rate: 17500,
      cargo_capabilities: ["DRY_BULK"],
      current_port: "Tanjung Pelepas",
      coordinates: { lat: 1.3600, lng: 103.5500 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_c",
      name: "MV Bengal Pioneer",
      type: "Geared Supramax Bulk Carrier",
      imo_number: "9456722",
      mmsi: "419001288",
      flag: "India",
      dwt: 56000,
      loaded_draft: 12.80,
      beam: 32.26,
      average_speed: 12.8,
      daily_fuel_burn: 30.5,
      freight_daily_rate: 16800,
      cargo_capabilities: ["DRY_BULK", "BREAKBULK"],
      current_port: "Haldia Anchorage",
      coordinates: { lat: 22.0200, lng: 88.0600 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_d",
      name: "MV Indira Express",
      type: "Post-Panamax Cellular Container Ship",
      imo_number: "9781204",
      mmsi: "419003410",
      flag: "India",
      dwt: 68000,
      loaded_draft: 13.80,
      beam: 37.30,
      average_speed: 18.0,
      daily_fuel_burn: 46.0,
      freight_daily_rate: 26000,
      cargo_capabilities: ["CONTAINER"],
      current_port: "Port of Colombo",
      coordinates: { lat: 6.9500, lng: 79.8500 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_e",
      name: "MV Malacca Bridge",
      type: "Feedermax Container Ship",
      imo_number: "9814522",
      mmsi: "352002341",
      flag: "Panama",
      dwt: 28500,
      loaded_draft: 11.20,
      beam: 29.80,
      average_speed: 16.5,
      daily_fuel_burn: 28.5,
      freight_daily_rate: 19200,
      cargo_capabilities: ["CONTAINER"],
      current_port: "Port Klang",
      coordinates: { lat: 2.9999, lng: 101.3928 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_f",
      name: "MT Swarna Godavari",
      type: "Aframax / LR2 Coated Tanker",
      imo_number: "9512399",
      mmsi: "419000554",
      flag: "India",
      dwt: 105000,
      loaded_draft: 14.90,
      beam: 42.00,
      average_speed: 14.2,
      daily_fuel_burn: 38.0,
      freight_daily_rate: 34000,
      cargo_capabilities: ["LIQUID_BULK"],
      current_port: "Fujairah Anchorage",
      coordinates: { lat: 25.1288, lng: 56.3265 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_g",
      name: "MT Al-Baraka Chemist",
      type: "IMO Type 2/3 Stainless Chemical Tanker",
      imo_number: "9734185",
      mmsi: "636018921",
      flag: "Liberia",
      dwt: 49800,
      loaded_draft: 12.20,
      beam: 32.20,
      average_speed: 13.8,
      daily_fuel_burn: 25.5,
      freight_daily_rate: 23500,
      cargo_capabilities: ["LIQUID_BULK", "HAZARDOUS"],
      current_port: "Sikka Marine Terminal",
      coordinates: { lat: 22.4300, lng: 69.8300 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_h",
      name: "SS Arctic Sentry",
      type: "Membrane LNG Cryogenic Carrier",
      imo_number: "9823419",
      mmsi: "311000842",
      flag: "Bahamas",
      dwt: 85000,
      loaded_draft: 12.00,
      beam: 44.00,
      average_speed: 16.0,
      daily_fuel_burn: 36.0,
      freight_daily_rate: 68000,
      cargo_capabilities: ["LNG_CRYOGENIC"],
      current_port: "Ras Laffan Terminal",
      coordinates: { lat: 25.9000, lng: 51.5800 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_i",
      name: "MV Pacific Pioneer",
      type: "Heavy Lift & Geared Breakbulk Carrier",
      imo_number: "9621455",
      mmsi: "538004523",
      flag: "Marshall Islands",
      dwt: 32000,
      loaded_draft: 10.50,
      beam: 28.00,
      average_speed: 13.0,
      daily_fuel_burn: 22.0,
      freight_daily_rate: 21000,
      cargo_capabilities: ["BREAKBULK"],
      current_port: "Mumbai Port Trust",
      coordinates: { lat: 18.9400, lng: 72.8500 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_j",
      name: "MV Arabian Highway",
      type: "Pure Car & Truck Ro-Ro Carrier",
      imo_number: "9758901",
      mmsi: "372001455",
      flag: "Panama",
      dwt: 21500,
      loaded_draft: 9.80,
      beam: 32.26,
      average_speed: 17.5,
      daily_fuel_burn: 39.0,
      freight_daily_rate: 29000,
      cargo_capabilities: ["RO_RO"],
      current_port: "Chennai Port",
      coordinates: { lat: 13.0827, lng: 80.2707 },
      emission_factor: 3.114,
    },
    {
      id: "vessel_k",
      name: "MV Sentinel Chemguard",
      type: "IMDG Dangerous Goods Specialist",
      imo_number: "9890123",
      mmsi: "419004510",
      flag: "India",
      dwt: 45000,
      loaded_draft: 11.90,
      beam: 32.20,
      average_speed: 14.0,
      daily_fuel_burn: 26.0,
      freight_daily_rate: 24800,
      cargo_capabilities: ["HAZARDOUS"],
      current_port: "JNPT Anchorage",
      coordinates: { lat: 18.9200, lng: 72.9000 },
      emission_factor: 3.114,
    },
  ],
  cargo_profiles: [
    {
      id: "dry_bulk_coal",
      name: "Dry Bulk (Thermal Coal)",
      category: "DRY_BULK",
      un_number: "N/A (IMSBC Group B - MHB)",
      imdg_class: "Non-IMDG",
      vgm_method: "Certified Belt Conveyor Scale Ticket + Draft Survey",
      default_tonnage_mt: 75000,
    },
    {
      id: "container_intermodal",
      name: "Container / Intermodal",
      category: "CONTAINER",
      un_number: "UN 3480 / UN 3171",
      imdg_class: "Class 9",
      vgm_method: "SOLAS Method 1 (Calibrated Terminal Weighbridge)",
      default_tonnage_mt: 42000,
    },
    {
      id: "liquid_bulk_tanker",
      name: "Liquid Bulk / Crude / Chemicals",
      category: "LIQUID_BULK",
      un_number: "UN 1267 (Petroleum Crude Oil)",
      imdg_class: "Class 3",
      vgm_method: "Shore Tank Radar Gauging & Certified Bill of Lading",
      default_tonnage_mt: 80000,
    },
    {
      id: "hazardous_imdg_special",
      name: "Hazardous / IMDG Special",
      category: "HAZARDOUS",
      un_number: "UN 1760 (Corrosive Liquid, N.O.S.)",
      imdg_class: "Class 8",
      vgm_method: "Verified Gross Mass Certified Scale Slip",
      default_tonnage_mt: 28000,
    },
    {
      id: "lng_cryogenic",
      name: "LNG / Cryogenic Liquefied Gas",
      category: "LNG_CRYOGENIC",
      un_number: "UN 1972 (Methane, Refrigerated Liquid)",
      imdg_class: "Class 2.1",
      vgm_method: "Custody Transfer Measurement System (CTMS)",
      default_tonnage_mt: 68000,
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
    user_id: "00000000-0000-0000-0000-000000000001",
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
    user_id: "00000000-0000-0000-0000-000000000001",
    voyage_id: "a0000000-0000-0000-0000-000000000001",
    recommended_vessel_id: "MV Sentinel Carrier",
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
    user_id: "00000000-0000-0000-0000-000000000001",
    title: "Executive Decision Brief: Singapore to Paradip 75,000 MT Thermal Coal",
    selected_vessel: "MV Nilgiri Wave",
    destination_port: "Paradip (INPBD)",
    total_cost_usd: 778160,
    risk_score: 18,
  },
};

// Verify administrative authorization
function isAuthorizedAdmin(req: NextRequest): boolean {
  const authHeader = req.headers.get("authorization") || "";
  const adminSecretHeader = req.headers.get("x-admin-key") || req.headers.get("x-admin-secret") || "";
  const expectedSecret = process.env.ADMIN_SECRET || process.env.CRON_SECRET || "";

  // If secret configured, verify match
  if (expectedSecret && (adminSecretHeader === expectedSecret || authHeader === `Bearer ${expectedSecret}`)) {
    return true;
  }

  // Also check if server service role key matches authorization
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (serviceRoleKey && authHeader === `Bearer ${serviceRoleKey}`) {
    return true;
  }

  return false;
}

export async function GET(req: NextRequest) {
  // If Supabase is unconfigured, return demo data for offline local storage
  if (!isSupabaseConfigured) {
    return NextResponse.json({
      status: "DEMO_MODE",
      isConfigured: false,
      message:
        "Supabase credentials unconfigured. Operating in isolated local sandbox mode with Captain Sharma benchmark data.",
      benchmarkData: CAPTAIN_SHARMA_BENCHMARK,
    });
  }

  // In production with connected Supabase: Reject anonymous calls
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message:
          "Anonymous access to database seeding is strictly prohibited. Production database mutations require admin authorization.",
      },
      { status: 401 }
    );
  }

  return NextResponse.json({
    status: "AUTHORIZED_READY",
    isConfigured: true,
    message: "Admin authorized. Send POST with administrative credentials to execute seed insertion.",
  });
}

export async function POST(req: NextRequest) {
  // Always reject unauthenticated requests
  if (!isAuthorizedAdmin(req)) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        message: "Forbidden. Administrative authentication required to seed or alter production data.",
      },
      { status: 401 }
    );
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || "";
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json(
      {
        error: "Configuration Error",
        message: "SUPABASE_SERVICE_ROLE_KEY is required on the server to execute admin seed mutations.",
      },
      { status: 500 }
    );
  }

  try {
    // Server-only client using service_role key
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false },
    });

    const results: Record<string, string> = {};

    const { error: pErr } = await adminClient
      .from("port_rules")
      .upsert(CAPTAIN_SHARMA_BENCHMARK.port_rules, { onConflict: "id" });
    results["port_rules"] = pErr ? `Error: ${pErr.message}` : "Success";

    const { error: vErr } = await adminClient
      .from("vessels")
      .upsert(CAPTAIN_SHARMA_BENCHMARK.vessels, { onConflict: "id" });
    results["vessels"] = vErr ? `Error: ${vErr.message}` : "Success";

    const { error: voyErr } = await adminClient
      .from("voyages")
      .upsert([CAPTAIN_SHARMA_BENCHMARK.voyage], { onConflict: "id" });
    results["voyages"] = voyErr ? `Error: ${voyErr.message}` : "Success";

    const { error: rErr } = await adminClient
      .from("recommendations")
      .upsert([CAPTAIN_SHARMA_BENCHMARK.recommendation], { onConflict: "id" });
    results["recommendations"] = rErr ? `Error: ${rErr.message}` : "Success";

    const { error: repErr } = await adminClient
      .from("reports")
      .upsert([CAPTAIN_SHARMA_BENCHMARK.report], { onConflict: "id" });
    results["reports"] = repErr ? `Error: ${repErr.message}` : "Success";

    return NextResponse.json({
      status: "SUCCESS",
      message: "Admin seed executed successfully.",
      results,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}

-- BlueSentinel Seed Data: Captain Arun Sharma's Benchmark Voyage
-- 75,000 MT Thermal Coal from Singapore (SGSIN) to Paradip (INPBD)
-- Highlights: Vessel A Draft Violation, Vessel B Recommended, Vessel C Demurrage Delay Risk

-- 1. Insert/Upsert Reference Port Rules
INSERT INTO public.port_rules (
  id, port_name, country, max_draft_cd, tide_allowance_avg, required_ukc, 
  demurrage_rate_usd, lightering_rate_usd, required_documents, berth_conditions
) VALUES 
(
  'INPBD', 'Paradip Port', 'India', 14.50, 1.80, 1.00, 24000, 48000,
  '["Q88 Vessel Specification", "Berth Clearance Application Form C", "Tide Window Declaration", "Ballast Water Management Plan (D-2 Standard)", "Under-Keel Clearance Verification Sheet"]'::jsonb,
  '{"berth": "Mechanized Coal Berth 1 & 2", "channel_length_nm": 4.2, "density_sg": 1.025, "tug_requirement": "3 ASD Tugs mandatory for DWT > 60,000"}'::jsonb
),
(
  'INIXY', 'Deendayal / Kandla Port', 'India', 13.00, 2.50, 1.20, 21000, 42000,
  '["Q88 Vessel Specification", "Kandla Creek Navigation Plan", "Tidal Curve Calculation Table"]'::jsonb,
  '{"berth": "Cargo Berth 14 (Dry Bulk)", "channel_length_nm": 18.0, "density_sg": 1.023}'::jsonb
),
(
  'INNSA', 'Jawaharlal Nehru Port (JNPT)', 'India', 14.00, 1.50, 1.00, 28000, 55000,
  '["Customs Declaration Manifest", "Q88 Bulker Specification", "Green Port Incentive Compliance Record"]'::jsonb,
  '{"berth": "Shallow Water Berth / Bulk Terminal", "channel_length_nm": 8.5, "density_sg": 1.024}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  max_draft_cd = EXCLUDED.max_draft_cd,
  tide_allowance_avg = EXCLUDED.tide_allowance_avg,
  required_ukc = EXCLUDED.required_ukc,
  demurrage_rate_usd = EXCLUDED.demurrage_rate_usd,
  lightering_rate_usd = EXCLUDED.lightering_rate_usd,
  required_documents = EXCLUDED.required_documents,
  berth_conditions = EXCLUDED.berth_conditions;

-- 2. Insert/Upsert Demo Vessels (A, B, C)
INSERT INTO public.vessels (
  id, name, type, dwt, loaded_draft, average_speed, daily_fuel_burn, freight_daily_rate, emission_factor
) VALUES
(
  'vessel_a', 'MV Ocean Titan', 'Capesize Bulker', 82000, 14.80, 14.0, 36.0, 18500, 3.114
),
(
  'vessel_b', 'MV Nilgiri Wave', 'Modern Kamsarmax', 64000, 13.20, 12.5, 24.5, 21000, 3.114
),
(
  'vessel_c', 'MV Bengal Pioneer', 'Standard Ultramax', 70000, 13.50, 11.8, 32.0, 16800, 3.114
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  type = EXCLUDED.type,
  dwt = EXCLUDED.dwt,
  loaded_draft = EXCLUDED.loaded_draft,
  average_speed = EXCLUDED.average_speed,
  daily_fuel_burn = EXCLUDED.daily_fuel_burn,
  freight_daily_rate = EXCLUDED.freight_daily_rate,
  emission_factor = EXCLUDED.emission_factor;

-- 3. Insert Benchmark Voyage for Captain Arun Sharma
INSERT INTO public.voyages (
  id, cargo_type, cargo_quantity_mt, origin_port, destination_port,
  laycan_date, fuel_price_usd, usd_to_inr_rate, port_waiting_days,
  selected_vessel_id, status
) VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Thermal Coal',
  75000,
  'Singapore (SGSIN)',
  'Paradip (INPBD)',
  NOW() + INTERVAL '5 days',
  640.00,
  83.50,
  3.5,
  'vessel_b',
  'RECOMMENDED_APPROVED'
)
ON CONFLICT (id) DO UPDATE SET
  cargo_type = EXCLUDED.cargo_type,
  cargo_quantity_mt = EXCLUDED.cargo_quantity_mt,
  fuel_price_usd = EXCLUDED.fuel_price_usd,
  usd_to_inr_rate = EXCLUDED.usd_to_inr_rate,
  port_waiting_days = EXCLUDED.port_waiting_days,
  selected_vessel_id = EXCLUDED.selected_vessel_id,
  status = EXCLUDED.status;

-- 4. Insert Deterministic Recommendation Decision Record
INSERT INTO public.recommendations (
  id, voyage_id, recommended_vessel_id, total_landed_cost_usd, risk_adjusted_cost_usd,
  compliance_status, draft_margin_m, overall_risk_score, co2_estimate_mt, rejection_reasons
) VALUES (
  'b0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000001',
  'MV Nilgiri Wave',
  778160.00,
  808160.00,
  'PASSED_COMPLIANT',
  1.30,
  18,
  457.20,
  '{
    "vessel_a": {
      "name": "MV Ocean Titan",
      "status": "DRAFT_VIOLATION_FAIL",
      "draft_margin_m": -0.78,
      "reason": "Arrival draft exceeds safe channel depth at Paradip Coal Berth (-0.78m draft violation). High grounding risk & mandatory offshore lightering penalty ($142,000 risk premium)."
    },
    "vessel_b": {
      "name": "MV Nilgiri Wave",
      "status": "RECOMMENDED_SAFE",
      "draft_margin_m": 1.30,
      "reason": "Optimal draft safety (+1.30m UKC buffer), Tier III electronic engine with 24.5 MT/day low fuel consumption, zero demurrage vulnerability."
    },
    "vessel_c": {
      "name": "MV Bengal Pioneer",
      "status": "DELAY_RISK_WARNING",
      "draft_margin_m": 0.42,
      "reason": "Severe port congestion exposure due to older auxiliary plant & slow discharge rating, triggering 3.5 days demurrage penalty ($67,200 exposure). Total risk score: 74/100."
    }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  recommended_vessel_id = EXCLUDED.recommended_vessel_id,
  total_landed_cost_usd = EXCLUDED.total_landed_cost_usd,
  risk_adjusted_cost_usd = EXCLUDED.risk_adjusted_cost_usd,
  compliance_status = EXCLUDED.compliance_status,
  draft_margin_m = EXCLUDED.draft_margin_m,
  overall_risk_score = EXCLUDED.overall_risk_score,
  co2_estimate_mt = EXCLUDED.co2_estimate_mt,
  rejection_reasons = EXCLUDED.rejection_reasons;

-- 5. Insert Benchmark Executive Report
INSERT INTO public.reports (
  id, voyage_id, title, selected_vessel, destination_port, total_cost_usd, risk_score
) VALUES (
  'RPT-2026-PBD-001',
  'a0000000-0000-0000-0000-000000000001',
  'Executive Decision Brief: Singapore to Paradip (75,000 MT Thermal Coal)',
  'MV Nilgiri Wave',
  'Paradip (INPBD)',
  778160.00,
  18
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  selected_vessel = EXCLUDED.selected_vessel,
  destination_port = EXCLUDED.destination_port,
  total_cost_usd = EXCLUDED.total_cost_usd,
  risk_score = EXCLUDED.risk_score;

-- 6. Insert Uploaded Documents & RAG Knowledge Chunks
INSERT INTO public.uploaded_documents (
  id, filename, file_path, category, size_bytes, page_count
) VALUES 
(
  'c0000000-0000-0000-0000-000000000001',
  'MV_Nilgiri_Wave_Q88_Specification.pdf',
  'vessel_specs/MV_Nilgiri_Wave_Q88_Specification.pdf',
  'VESSEL_SPEC',
  245000,
  4
),
(
  'c0000000-0000-0000-0000-000000000002',
  'Paradip_Harbor_Notice_To_Mariners_Draft_2026.pdf',
  'port_notices/Paradip_Harbor_Notice_To_Mariners_Draft_2026.pdf',
  'PORT_NOTICE',
  412000,
  8
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO public.document_chunks (
  id, document_id, page_number, heading, content, keywords
) VALUES
(
  'd0000000-0000-0000-0000-000000000001',
  'c0000000-0000-0000-0000-000000000002',
  2,
  'Section 3.1: Paradip Inbound Draft and Under-Keel Clearance Limits',
  'All vessels navigating the Paradip approach channel to Mechanized Coal Berths 1 and 2 must observe a maximum permissible arrival draft of 14.50m at Chart Datum (CD). A minimum Under-Keel Clearance (UKC) of 1.00m must be maintained at all states of tide. Any vessel whose arrival draft exceeds 14.50m minus tidal allowance shall be denied entry and subjected to offshore lightering at the outer anchorage.',
  ARRAY['draft', 'UKC', 'Paradip', 'lightering', 'berth depth']
),
(
  'd0000000-0000-0000-0000-000000000002',
  'c0000000-0000-0000-0000-000000000001',
  1,
  'MV Nilgiri Wave: Technical Particulars & Fuel Economy',
  'Vessel Type: Modern Kamsarmax Bulker. Deadweight: 64,000 MT. Summer Loaded Draft: 13.20m. Engine: MAN B&W 6S50ME-C9.7 Tier III with exhaust gas bypass. Daily fuel consumption at 12.5 knots eco-speed: 24.5 MT VLSFO. Certified with IMO Underwater Radiated Noise (URN) quiet notation Q-Class.',
  ARRAY['Nilgiri Wave', 'draft', 'speed', 'fuel consumption', 'URN']
),
(
  'd0000000-0000-0000-0000-000000000003',
  'c0000000-0000-0000-0000-000000000002',
  5,
  'Demurrage Liability & Notice of Readiness (NOR) Validation',
  'Demurrage rate is fixed at $24,000 per running day for bulk carriers exceeding 50,000 DWT. Notice of Readiness (NOR) is only valid once the vessel has dropped anchor inside the port limits and passed all quarantine and customs health clearance. Pre-berthing delays caused by draft deficiency or inadequate documentation will count as owner time.',
  ARRAY['demurrage', 'NOR', 'liability', 'delays']
)
ON CONFLICT (id) DO NOTHING;

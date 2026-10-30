-- ==============================================================================
-- BlueSentinel - IMO Maritime Architecture & Relational Schema
-- Conforms to IMO Standards: MARPOL Annex VI, SOLAS VI & VII, IMSBC, IMDG, IGC
-- ==============================================================================

-- 1. Ports Master Table
CREATE TABLE IF NOT EXISTS public.ports (
  id TEXT PRIMARY KEY,
  locode TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  country TEXT NOT NULL,
  coast TEXT, -- 'East Coast', 'West Coast', 'International'
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  max_berth_draft_m NUMERIC NOT NULL,
  max_loa_m NUMERIC NOT NULL,
  max_beam_m NUMERIC,
  congestion_data JSONB DEFAULT '{}'::jsonb,
  tariff_structure JSONB DEFAULT '{}'::jsonb,
  weather_sea_state JSONB DEFAULT '{}'::jsonb,
  green_corridor JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Cargo Types Master Table
CREATE TABLE IF NOT EXISTS public.cargo_types (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL, -- 'DRY_BULK', 'LIQUID_BULK', 'CONTAINER', 'LNG_CRYOGENIC', 'CHEMICAL_DG', 'BREAKBULK', 'RO_RO'
  imo_convention TEXT NOT NULL,
  hazard_classification TEXT NOT NULL,
  un_number TEXT NOT NULL,
  imdg_class TEXT NOT NULL,
  packing_group TEXT,
  stowage_segregation TEXT NOT NULL,
  storage_parameters TEXT NOT NULL,
  default_tonnage_mt NUMERIC NOT NULL,
  density_t_m3 NUMERIC NOT NULL,
  stowage_factor_m3_mt NUMERIC NOT NULL,
  sds_info JSONB DEFAULT '{}'::jsonb,
  required_declarations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vessels Master Table
CREATE TABLE IF NOT EXISTS public.vessels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  imo_number TEXT NOT NULL UNIQUE,
  call_sign TEXT,
  mmsi TEXT,
  flag TEXT NOT NULL,
  type TEXT NOT NULL,
  dwt NUMERIC NOT NULL,
  gross_tonnage NUMERIC NOT NULL,
  loa_m NUMERIC NOT NULL,
  beam_m NUMERIC NOT NULL,
  loaded_draft NUMERIC NOT NULL,
  average_speed NUMERIC NOT NULL,
  daily_fuel_burn NUMERIC NOT NULL,
  port_fuel_burn NUMERIC DEFAULT 3.5,
  carbon_factor NUMERIC DEFAULT 3.114,
  cii_ref_a NUMERIC DEFAULT 4745,
  cii_ref_c NUMERIC DEFAULT 0.422,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. IMO Regulations Table
CREATE TABLE IF NOT EXISTS public.regulations (
  id TEXT PRIMARY KEY,
  convention_name TEXT NOT NULL,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  scope TEXT NOT NULL,
  enforcement_tier TEXT DEFAULT 'MANDATORY',
  summary TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Shipments Table (Relational entity linking user, ports, cargo, vessel)
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  origin_port_id TEXT NOT NULL REFERENCES public.ports(id) ON DELETE RESTRICT,
  destination_port_id TEXT NOT NULL REFERENCES public.ports(id) ON DELETE RESTRICT,
  cargo_type_id TEXT NOT NULL REFERENCES public.cargo_types(id) ON DELETE RESTRICT,
  vessel_id TEXT REFERENCES public.vessels(id) ON DELETE SET NULL,
  cargo_tonnage_mt NUMERIC NOT NULL,
  laycan_date TIMESTAMPTZ NOT NULL,
  distance_nm NUMERIC NOT NULL,
  transit_hours NUMERIC NOT NULL,
  eta_pilot TIMESTAMPTZ NOT NULL,
  eta_berth TIMESTAMPTZ NOT NULL,
  pre_berthing_wait_hours NUMERIC DEFAULT 0,
  sea_fuel_mt NUMERIC NOT NULL,
  total_co2_mt NUMERIC NOT NULL,
  attained_cii NUMERIC NOT NULL,
  cii_rating TEXT NOT NULL, -- 'A', 'B', 'C', 'D', 'E'
  total_port_tariff_usd NUMERIC NOT NULL,
  statutory_documents JSONB DEFAULT '{}'::jsonb,
  status TEXT DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Indexes for Relational Join Performance
CREATE INDEX IF NOT EXISTS idx_shipments_user_id ON public.shipments(user_id);
CREATE INDEX IF NOT EXISTS idx_shipments_ports ON public.shipments(origin_port_id, destination_port_id);
CREATE INDEX IF NOT EXISTS idx_shipments_cargo_type ON public.shipments(cargo_type_id);
CREATE INDEX IF NOT EXISTS idx_shipments_vessel ON public.shipments(vessel_id);

-- 7. Row Level Security Policies
ALTER TABLE public.ports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cargo_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.regulations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipments ENABLE ROW LEVEL SECURITY;

-- Read policies for public reference data
CREATE POLICY "Allow public read on ports" ON public.ports FOR SELECT USING (true);
CREATE POLICY "Allow public read on cargo_types" ON public.cargo_types FOR SELECT USING (true);
CREATE POLICY "Allow public read on vessels" ON public.vessels FOR SELECT USING (true);
CREATE POLICY "Allow public read on regulations" ON public.regulations FOR SELECT USING (true);

-- User isolation for shipments
CREATE POLICY "Allow authenticated user read shipments" ON public.shipments
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated user insert shipments" ON public.shipments
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated user update shipments" ON public.shipments
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Allow authenticated user delete shipments" ON public.shipments
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

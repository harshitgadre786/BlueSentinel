-- BlueSentinel Database Schema & Migrations
-- Target: Supabase Postgres with pgvector

-- Enable UUID and Vector extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 1. Profiles Table (linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'charterer',
  organization TEXT DEFAULT 'Fleet Operations Desk'
);

-- 2. Port Rules Table
CREATE TABLE IF NOT EXISTS public.port_rules (
  id TEXT PRIMARY KEY,
  port_name TEXT NOT NULL,
  country TEXT NOT NULL,
  max_draft_cd NUMERIC NOT NULL,
  tide_allowance_avg NUMERIC NOT NULL,
  required_ukc NUMERIC NOT NULL,
  demurrage_rate_usd NUMERIC NOT NULL,
  lightering_rate_usd NUMERIC NOT NULL,
  required_documents JSONB DEFAULT '[]'::jsonb,
  berth_conditions JSONB DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Vessels Table
CREATE TABLE IF NOT EXISTS public.vessels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  dwt NUMERIC NOT NULL,
  loaded_draft NUMERIC NOT NULL,
  average_speed NUMERIC NOT NULL,
  daily_fuel_burn NUMERIC NOT NULL,
  freight_daily_rate NUMERIC NOT NULL,
  emission_factor NUMERIC DEFAULT 3.114,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Voyages Table
CREATE TABLE IF NOT EXISTS public.voyages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  cargo_type TEXT NOT NULL,
  cargo_quantity_mt NUMERIC NOT NULL,
  origin_port TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  laycan_date TIMESTAMPTZ NOT NULL,
  fuel_price_usd NUMERIC NOT NULL,
  usd_to_inr_rate NUMERIC DEFAULT 83.50,
  port_waiting_days NUMERIC DEFAULT 3.0,
  selected_vessel_id TEXT,
  status TEXT DEFAULT 'PLANNING',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Recommendations Table
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  voyage_id UUID REFERENCES public.voyages(id) ON DELETE CASCADE,
  recommended_vessel_id TEXT NOT NULL,
  total_landed_cost_usd NUMERIC NOT NULL,
  risk_adjusted_cost_usd NUMERIC NOT NULL,
  compliance_status TEXT NOT NULL,
  draft_margin_m NUMERIC NOT NULL,
  overall_risk_score INTEGER NOT NULL,
  co2_estimate_mt NUMERIC NOT NULL,
  rejection_reasons JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Uploaded Documents Table
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  category TEXT NOT NULL, -- 'VESSEL_SPEC', 'PORT_NOTICE', 'CHARTERPARTY', 'TARIFF'
  size_bytes BIGINT,
  page_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Document Chunks with Vector Embeddings (1536 dim for text-embedding-ada or 768 for gemini)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  document_id UUID REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  heading TEXT,
  content TEXT NOT NULL,
  keywords TEXT[],
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for vector similarity search
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- 8. Reports Table
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  voyage_id UUID REFERENCES public.voyages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  selected_vessel TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  total_cost_usd NUMERIC NOT NULL,
  risk_score INTEGER NOT NULL,
  pdf_storage_path TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

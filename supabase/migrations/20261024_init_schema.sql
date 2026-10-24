-- ==============================================================================
-- BlueSentinel Production Database Schema & Security Architecture
-- Target: Supabase Postgres with pgvector & Supabase Storage
-- Security Audit Hardening: Strict Row Level Security (RLS) & Storage Isolation
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. CORE TABLES

-- Profiles Table (Private: linked 1:1 to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'charterer',
  organization TEXT DEFAULT 'Fleet Operations Desk'
);

-- Port Rules Table (Public Reference: Read-only for all, write restricted to admin/service-role)
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

-- Vessels Table (Public Reference: Read-only for all, write restricted to admin/service-role)
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

-- Voyages Table (Private: strictly owned by user_id)
CREATE TABLE IF NOT EXISTS public.voyages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Recommendations Table (Private: strictly owned by user_id and linked to voyage)
CREATE TABLE IF NOT EXISTS public.recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
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

-- Uploaded Documents Table (Private: strictly owned by user_id)
CREATE TABLE IF NOT EXISTS public.uploaded_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  category TEXT NOT NULL, -- 'VESSEL_SPEC', 'PORT_NOTICE', 'CHARTERPARTY', 'TARIFF'
  size_bytes BIGINT,
  page_count INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Document Chunks Table (Private: strictly owned by user_id and linked to uploaded document)
CREATE TABLE IF NOT EXISTS public.document_chunks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  document_id UUID REFERENCES public.uploaded_documents(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  heading TEXT,
  content TEXT NOT NULL,
  keywords TEXT[],
  embedding vector(768),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx 
ON public.document_chunks 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Reports Table (Private: strictly owned by user_id)
CREATE TABLE IF NOT EXISTS public.reports (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  voyage_id UUID REFERENCES public.voyages(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  selected_vessel TEXT NOT NULL,
  destination_port TEXT NOT NULL,
  total_cost_usd NUMERIC NOT NULL,
  risk_score INTEGER NOT NULL,
  pdf_storage_path TEXT,
  generated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- 3. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.port_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vessels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.voyages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uploaded_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- A. PUBLIC REFERENCE TABLES (port_rules, vessels)
-- Read: Allowed for authenticated and anon users
-- Write: Strictly restricted to service_role (admin) only
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read on port_rules" ON public.port_rules;
DROP POLICY IF EXISTS "Allow write on port_rules" ON public.port_rules;
DROP POLICY IF EXISTS "Allow admin write on port_rules" ON public.port_rules;

CREATE POLICY "Allow public read on port_rules" 
ON public.port_rules 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write on port_rules" 
ON public.port_rules 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public read on vessels" ON public.vessels;
DROP POLICY IF EXISTS "Allow write on vessels" ON public.vessels;
DROP POLICY IF EXISTS "Allow admin write on vessels" ON public.vessels;

CREATE POLICY "Allow public read on vessels" 
ON public.vessels 
FOR SELECT 
USING (true);

CREATE POLICY "Allow admin write on vessels" 
ON public.vessels 
FOR ALL 
TO service_role 
USING (true) 
WITH CHECK (true);

-- ------------------------------------------------------------------------------
-- B. USER PROFILES (profiles)
-- Only authenticated users can access their own profile row (id = auth.uid())
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow users to read and update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Profiles isolation policy" ON public.profiles;

CREATE POLICY "Users can only read own profile" 
ON public.profiles 
FOR SELECT 
TO authenticated 
USING (auth.uid() = id);

CREATE POLICY "Users can only insert own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can only update own profile" 
ON public.profiles 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = id) 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can only delete own profile" 
ON public.profiles 
FOR DELETE 
TO authenticated 
USING (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- C. VOYAGES (voyages)
-- Strict isolation: user_id = auth.uid(). Anonymous users have NO access.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all on voyages" ON public.voyages;
DROP POLICY IF EXISTS "Voyages user isolation" ON public.voyages;

CREATE POLICY "Users can only select own voyages" 
ON public.voyages 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own voyages" 
ON public.voyages 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own voyages" 
ON public.voyages 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete own voyages" 
ON public.voyages 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- D. RECOMMENDATIONS (recommendations)
-- Strict isolation: user_id = auth.uid(). Anonymous users have NO access.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all on recommendations" ON public.recommendations;
DROP POLICY IF EXISTS "Recommendations user isolation" ON public.recommendations;

CREATE POLICY "Users can only select own recommendations" 
ON public.recommendations 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own recommendations" 
ON public.recommendations 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own recommendations" 
ON public.recommendations 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete own recommendations" 
ON public.recommendations 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- E. UPLOADED DOCUMENTS (uploaded_documents)
-- Strict isolation: user_id = auth.uid(). Anonymous users have NO access.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all on uploaded_documents" ON public.uploaded_documents;
DROP POLICY IF EXISTS "Uploaded documents user isolation" ON public.uploaded_documents;

CREATE POLICY "Users can only select own uploaded documents" 
ON public.uploaded_documents 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own uploaded documents" 
ON public.uploaded_documents 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own uploaded documents" 
ON public.uploaded_documents 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete own uploaded documents" 
ON public.uploaded_documents 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- F. DOCUMENT CHUNKS (document_chunks)
-- Strict isolation: user_id = auth.uid(). Anonymous users have NO access.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow public read on document_chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Allow write on document_chunks" ON public.document_chunks;
DROP POLICY IF EXISTS "Document chunks user isolation" ON public.document_chunks;

CREATE POLICY "Users can only select own document chunks" 
ON public.document_chunks 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own document chunks" 
ON public.document_chunks 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own document chunks" 
ON public.document_chunks 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete own document chunks" 
ON public.document_chunks 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- G. REPORTS (reports)
-- Strict isolation: user_id = auth.uid(). Anonymous users have NO access.
-- ------------------------------------------------------------------------------
DROP POLICY IF EXISTS "Allow all on reports" ON public.reports;
DROP POLICY IF EXISTS "Reports user isolation" ON public.reports;

CREATE POLICY "Users can only select own reports" 
ON public.reports 
FOR SELECT 
TO authenticated 
USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert own reports" 
ON public.reports 
FOR INSERT 
TO authenticated 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update own reports" 
ON public.reports 
FOR UPDATE 
TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only delete own reports" 
ON public.reports 
FOR DELETE 
TO authenticated 
USING (auth.uid() = user_id);

-- ==============================================================================
-- 4. SUPABASE STORAGE SECURITY & BUCKET ISOLATION
-- Bucket: documents (private)
-- Policy: Only authenticated users can access objects under their own user folder:
--         "documents/{auth.uid()}/*"
-- ==============================================================================

-- Create private bucket if not exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Clean existing storage policies for documents bucket
DROP POLICY IF EXISTS "User can read own storage files" ON storage.objects;
DROP POLICY IF EXISTS "User can upload to own storage folder" ON storage.objects;
DROP POLICY IF EXISTS "User can update own storage files" ON storage.objects;
DROP POLICY IF EXISTS "User can delete own storage files" ON storage.objects;

-- Storage Policy: SELECT (Read only files in user's folder)
CREATE POLICY "User can read own storage files" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: INSERT (Upload only files inside user's folder)
CREATE POLICY "User can upload to own storage folder" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: UPDATE (Modify only files in user's folder)
CREATE POLICY "User can update own storage files" 
ON storage.objects 
FOR UPDATE 
TO authenticated 
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
) 
WITH CHECK (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage Policy: DELETE (Remove only files in user's folder)
CREATE POLICY "User can delete own storage files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

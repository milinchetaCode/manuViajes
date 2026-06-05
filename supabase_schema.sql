-- =====================================================================
-- SUPABASE / POSTGRESQL SCHEMA FOR MANUVIAJES
-- =====================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------
-- PACKAGES TABLE - Main storage for travel packages
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS packages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_name TEXT NOT NULL,
  ticket_price TEXT,
  flight_info TEXT,
  hotel_info TEXT,
  description TEXT,
  availability_dates TEXT,
  photo_url TEXT,
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

-- Create access policies:
-- 1. Allow public read access for visible packages
CREATE POLICY "Allow public read for visible packages" ON packages
    FOR SELECT USING (visible = true);

-- 2. Allow full control for service_role (admin operations)
CREATE POLICY "Allow full control for service role" ON packages
    FOR ALL USING (true);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_packages_visible ON packages(visible);
CREATE INDEX IF NOT EXISTS idx_packages_created_at ON packages(created_at DESC);

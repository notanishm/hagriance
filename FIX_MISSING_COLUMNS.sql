-- ============================================
-- ADD MISSING COLUMNS TO PROFILES TABLE
-- Run this in Supabase SQL Editor to fix the error
-- ============================================

-- Add bank_account column for businesses
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bank_account TEXT;

-- Add ifsc_code column for businesses
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS ifsc_code TEXT;

-- Add bank_name column (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS bank_name TEXT;

-- Add business_gst column (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_gst TEXT;

-- Add registration_number column (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS registration_number TEXT;

-- Add business_type column (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_type TEXT;

-- Add business_name column (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT;

-- Add full_name column (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Add phone_number column (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS phone_number TEXT;

-- Verify columns were added
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
ORDER BY column_name;

-- ============================================
-- DONE! Missing columns added.
-- ============================================

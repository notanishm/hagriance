-- ============================================
-- AGRIANCE - COMPLETE FRESH SUPABASE SETUP
-- Run this ENTIRE script in Supabase SQL Editor
-- For project: https://yiqxelwzhihqutykmmhl.supabase.co
-- ============================================


-- ============================================
-- SECTION 1: PROFILES TABLE
-- Stores all users: farmers, businesses, banks
-- ============================================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  role TEXT CHECK (role IN ('farmer', 'business', 'bank')),
  kyc_status TEXT DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),

  -- Farmer specific
  land_size DECIMAL,
  location TEXT,
  gps_coordinates TEXT,
  crops_history TEXT[],

  -- Business specific
  company_name TEXT,
  business_name TEXT,
  business_type TEXT,
  business_gst TEXT,
  gst_number TEXT,
  registration_number TEXT,
  bank_name TEXT,
  bank_account TEXT,
  ifsc_code TEXT,

  -- Bank specific
  rbi_license_number TEXT,
  branch_details JSONB,

  -- Scoring & Status
  trust_score INTEGER DEFAULT 50,
  rating DECIMAL(3, 2),
  onboarding_completed BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (during registration)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- *** CRITICAL POLICY ***
-- Business users can view farmer profiles (needed for contract creation)
CREATE POLICY "Business users can view farmer profiles"
  ON profiles FOR SELECT
  USING (
    role = 'farmer'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'business'
    )
  );

-- Bank users can view all profiles (needed for loan review)
CREATE POLICY "Bank users can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'bank'
    )
  );

-- Farmer users can view business profiles (to see who they're contracting with)
CREATE POLICY "Farmer users can view business profiles"
  ON profiles FOR SELECT
  USING (
    role = 'business'
    AND EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'farmer'
    )
  );


-- ============================================
-- SECTION 2: CONTRACTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES profiles(id) NOT NULL,
  farmer_id UUID REFERENCES profiles(id) NOT NULL,
  contract_number TEXT UNIQUE NOT NULL,
  crop_name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT DEFAULT 'Quintals',
  price DECIMAL NOT NULL,
  total_value DECIMAL NOT NULL,
  delivery_date DATE NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'completed', 'cancelled')),
  contract_content TEXT,
  selected_clauses TEXT[],
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Farmers can view their own contracts
CREATE POLICY "Farmers can view their contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = farmer_id);

-- Businesses can view their own contracts
CREATE POLICY "Businesses can view their contracts"
  ON contracts FOR SELECT
  USING (auth.uid() = business_id);

-- Businesses can create contracts
CREATE POLICY "Businesses can create contracts"
  ON contracts FOR INSERT
  WITH CHECK (auth.uid() = business_id);

-- Businesses can update their contracts
CREATE POLICY "Businesses can update their contracts"
  ON contracts FOR UPDATE
  USING (auth.uid() = business_id);

-- Banks can view all contracts (for loan evaluation)
CREATE POLICY "Banks can view all contracts"
  ON contracts FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'bank'
    )
  );


-- ============================================
-- SECTION 3: LOAN APPLICATIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS loan_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  applicant_id UUID REFERENCES profiles(id) NOT NULL,
  application_number TEXT UNIQUE NOT NULL,
  loan_amount DECIMAL NOT NULL,
  tenure_months INTEGER NOT NULL,
  purpose TEXT,
  bank_name TEXT,
  contract_id UUID REFERENCES contracts(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  risk_score INTEGER,
  applicant_type TEXT DEFAULT 'farmer',
  reviewed_by UUID REFERENCES profiles(id),
  review_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- Applicants can view their own loan applications
CREATE POLICY "Users can view own loan applications"
  ON loan_applications FOR SELECT
  USING (auth.uid() = applicant_id);

-- Applicants can create loan applications
CREATE POLICY "Users can create loan applications"
  ON loan_applications FOR INSERT
  WITH CHECK (auth.uid() = applicant_id);

-- Banks can view all loan applications
CREATE POLICY "Banks can view all loan applications"
  ON loan_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'bank'
    )
  );

-- Banks can update loan applications (approve/reject)
CREATE POLICY "Banks can update loan applications"
  ON loan_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'bank'
    )
  );


-- ============================================
-- SECTION 4: KYC DOCUMENTS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS kyc_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  document_type TEXT NOT NULL CHECK (document_type IN ('aadhaar', 'pan', 'gst', 'license')),
  document_number TEXT NOT NULL,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC documents"
  ON kyc_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own KYC documents"
  ON kyc_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- SECTION 5: FILE METADATA TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS file_metadata (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  file_name TEXT NOT NULL,
  original_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  storage_path TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  auth_tag TEXT NOT NULL,
  salt TEXT NOT NULL,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files"
  ON file_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own files"
  ON file_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- ============================================
-- SECTION 6: STORAGE BUCKET
-- ============================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload documents
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

-- Allow users to read their own files
CREATE POLICY "Users can read own documents"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'documents' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================
-- SECTION 7: TRIGGERS & FUNCTIONS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_applications_updated_at
  BEFORE UPDATE ON loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on signup (via auth trigger)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ language 'plpgsql' SECURITY DEFINER;

-- Trigger: automatically create profile when user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================
-- DONE! All tables, policies, and triggers created.
-- 
-- Registration flow:
-- 1. User signs up → auth.users row created
-- 2. Trigger auto-creates profiles row
-- 3. User selects role → profile updated with role
-- 4. Onboarding form → profile updated with details
-- 5. Business users can see farmer profiles ✓
-- 6. Farmers can see business profiles ✓
-- 7. Banks can see all profiles ✓
-- ============================================

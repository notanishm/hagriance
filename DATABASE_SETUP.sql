-- ============================================
-- AURIANCE DATABASE SETUP - MINIMAL VERSION
-- Copy ALL of this and paste into Supabase SQL Editor
-- Run it by clicking the "Run" button
-- ============================================

-- 1. CREATE PROFILES TABLE (Required for user accounts)
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
  gst_number TEXT,
  business_type TEXT,
  -- Bank specific
  bank_name TEXT,
  rbi_license_number TEXT,
  branch_details JSONB,
  -- Common
  trust_score INTEGER DEFAULT 50,
  onboarding_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- 2. ENABLE ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 3. CREATE POLICIES (Security rules)
-- Allow users to read their own profile
CREATE POLICY "Users can read own profile" 
  ON profiles FOR SELECT 
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile" 
  ON profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Allow new users to insert their profile (during registration)
CREATE POLICY "Users can insert own profile" 
  ON profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- 4. CREATE CONTRACTS TABLE
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

-- Enable RLS for contracts
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;

-- Contract policies
CREATE POLICY "Farmers can view their contracts" 
  ON contracts FOR SELECT 
  USING (auth.uid() = farmer_id);

CREATE POLICY "Businesses can view their contracts" 
  ON contracts FOR SELECT 
  USING (auth.uid() = business_id);

CREATE POLICY "Businesses can create contracts" 
  ON contracts FOR INSERT 
  WITH CHECK (auth.uid() = business_id);

-- 5. CREATE LOAN APPLICATIONS TABLE
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enable RLS for loans
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;

-- Loan policies
CREATE POLICY "Users can view their own loan applications" 
  ON loan_applications FOR SELECT 
  USING (auth.uid() = applicant_id);

CREATE POLICY "Users can create loan applications" 
  ON loan_applications FOR INSERT 
  WITH CHECK (auth.uid() = applicant_id);

-- Banks can view all pending loans
CREATE POLICY "Banks can view all loan applications" 
  ON loan_applications FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'bank'
    )
  );

-- 6. CREATE KYC DOCUMENTS TABLE
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

-- Enable RLS for KYC
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own KYC documents" 
  ON kyc_documents FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own KYC documents" 
  ON kyc_documents FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 7. CREATE FILE METADATA TABLE
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

-- Enable RLS for files
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files" 
  ON file_metadata FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can upload own files" 
  ON file_metadata FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- 8. CREATE STORAGE BUCKET FOR FILES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 9. STORAGE POLICIES
-- Allow authenticated users to upload files
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

-- 10. CREATE FUNCTION TO UPDATE UPDATED_AT TIMESTAMP
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
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

-- ============================================
-- DONE! All tables created successfully.
-- ============================================

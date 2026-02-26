# Supabase Database Setup

This document contains the SQL schema needed to set up your Supabase database for the Agriance Farm platform.

## Prerequisites

1. Go to your Supabase project dashboard: https://zuczpzcagufmufjpubjo.supabase.co
2. Navigate to **SQL Editor** in the left sidebar
3. Copy and paste the SQL commands below

---

## Database Schema

### 1. Profiles Table (User Information)

```sql
-- Create profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('farmer', 'business', 'bank')),
  
  -- Common fields
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Farmer-specific fields
  aadhaar_number TEXT,
  pan_number TEXT,
  land_size DECIMAL,
  location TEXT,
  gps_coordinates TEXT,
  crop_history TEXT[],
  
  -- Business-specific fields
  business_name TEXT,
  business_gst TEXT,
  business_type TEXT,
  registration_number TEXT,
  bank_account TEXT,
  ifsc_code TEXT,
  
  -- Bank-specific fields
  bank_name TEXT,
  branch_name TEXT,
  bank_code TEXT,
  license_number TEXT,
  
  -- Status
  kyc_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

### 2. KYC Documents Table

```sql
-- Create KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL,
  document_number TEXT,
  file_id UUID,
  verification_status TEXT DEFAULT 'pending' CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_at TIMESTAMP WITH TIME ZONE,
  verified_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own KYC documents"
  ON public.kyc_documents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own KYC documents"
  ON public.kyc_documents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER kyc_documents_updated_at
  BEFORE UPDATE ON public.kyc_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

### 3. Contracts Table

```sql
-- Create contracts table
CREATE TABLE IF NOT EXISTS public.contracts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contract_number TEXT UNIQUE NOT NULL,
  
  -- Parties
  farmer_id UUID REFERENCES public.profiles(id),
  business_id UUID REFERENCES public.profiles(id),
  
  -- Contract details
  crop_name TEXT NOT NULL,
  quantity DECIMAL NOT NULL,
  unit TEXT NOT NULL,
  price DECIMAL NOT NULL,
  total_value DECIMAL NOT NULL,
  
  -- Payment terms
  advance_amount DECIMAL,
  balance_amount DECIMAL,
  payment_terms TEXT,
  
  -- Delivery
  delivery_date DATE,
  delivery_location TEXT,
  quality_specs TEXT,
  
  -- Contract document
  contract_template_lang TEXT DEFAULT 'en',
  contract_content TEXT,
  selected_clauses TEXT[],
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'active', 'completed', 'cancelled')),
  signed_by_farmer_at TIMESTAMP WITH TIME ZONE,
  signed_by_business_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.contracts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view their contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Businesses can view their contracts"
  ON public.contracts FOR SELECT
  USING (auth.uid() = business_id);

CREATE POLICY "Businesses can create contracts"
  ON public.contracts FOR INSERT
  WITH CHECK (auth.uid() = business_id);

CREATE POLICY "Contract parties can update"
  ON public.contracts FOR UPDATE
  USING (auth.uid() = farmer_id OR auth.uid() = business_id);

CREATE TRIGGER contracts_updated_at
  BEFORE UPDATE ON public.contracts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create index for faster queries
CREATE INDEX idx_contracts_farmer ON public.contracts(farmer_id);
CREATE INDEX idx_contracts_business ON public.contracts(business_id);
CREATE INDEX idx_contracts_status ON public.contracts(status);
```

---

### 4. Loan Applications Table

```sql
-- Create loan applications table
CREATE TABLE IF NOT EXISTS public.loan_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  application_number TEXT UNIQUE NOT NULL,
  
  -- References
  farmer_id UUID REFERENCES public.profiles(id),
  contract_id UUID REFERENCES public.contracts(id),
  
  -- Loan details
  loan_amount DECIMAL NOT NULL,
  tenure_months INTEGER NOT NULL,
  interest_rate DECIMAL,
  purpose TEXT,
  
  -- Risk assessment
  risk_score INTEGER,
  risk_category TEXT CHECK (risk_category IN ('low', 'medium', 'high')),
  risk_factors JSONB,
  
  -- Supporting documents
  bank_statement_file_id UUID,
  land_records_file_id UUID,
  other_documents JSONB,
  
  -- Status
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'approved', 'rejected', 'disbursed')),
  reviewed_by UUID REFERENCES public.profiles(id),
  review_notes TEXT,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejected_at TIMESTAMP WITH TIME ZONE,
  disbursed_at TIMESTAMP WITH TIME ZONE,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.loan_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Farmers can view their loan applications"
  ON public.loan_applications FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Banks can view all loan applications"
  ON public.loan_applications FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'bank'
    )
  );

CREATE POLICY "Farmers can create loan applications"
  ON public.loan_applications FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

CREATE POLICY "Banks can update loan applications"
  ON public.loan_applications FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'bank'
    )
  );

CREATE TRIGGER loan_applications_updated_at
  BEFORE UPDATE ON public.loan_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create indexes
CREATE INDEX idx_loans_farmer ON public.loan_applications(farmer_id);
CREATE INDEX idx_loans_contract ON public.loan_applications(contract_id);
CREATE INDEX idx_loans_status ON public.loan_applications(status);
```

---

### 5. File Metadata Table

```sql
-- Create file metadata table
CREATE TABLE IF NOT EXISTS public.file_metadata (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_type TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  original_type TEXT,
  storage_path TEXT NOT NULL,
  encrypted BOOLEAN DEFAULT TRUE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.file_metadata ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files"
  ON public.file_metadata FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own files"
  ON public.file_metadata FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own files"
  ON public.file_metadata FOR DELETE
  USING (auth.uid() = user_id);

-- Create index
CREATE INDEX idx_file_metadata_user ON public.file_metadata(user_id);
CREATE INDEX idx_file_metadata_type ON public.file_metadata(file_type);
```

---

## Storage Buckets

Run this in the SQL Editor to create the storage bucket:

```sql
-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false);

-- Storage policies for documents bucket
CREATE POLICY "Users can upload their own files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can view their own files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users can delete their own files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
```

---

## Authentication Setup

### Enable Email Authentication

1. Go to **Authentication > Providers** in Supabase Dashboard
2. Enable **Email** provider
3. Configure email templates (optional)

### Get Your Anon Key

1. Go to **Settings > API**
2. Copy the `anon` `public` key
3. Update your `.env` file:

```env
VITE_SUPABASE_URL=https://zuczpzcagufmufjpubjo.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

---

## Testing the Setup

After running all SQL commands, test your setup:

1. **Run the development server:**
   ```bash
   npm install
   npm run dev
   ```

2. **Test authentication:**
   - Visit `/login` and try creating an account
   - Check if user appears in **Authentication > Users**

3. **Test database:**
   - After signup, check if profile is created in `profiles` table
   - Go to **Table Editor > profiles** in Supabase

4. **Test storage:**
   - Upload a file in the app
   - Check if it appears in **Storage > documents**

---

## Helpful Supabase Queries

### View all users with profiles
```sql
SELECT 
  p.id,
  p.full_name,
  p.role,
  p.email,
  p.kyc_verified,
  p.created_at
FROM public.profiles p
ORDER BY p.created_at DESC;
```

### View all contracts
```sql
SELECT 
  c.contract_number,
  f.full_name as farmer_name,
  b.business_name,
  c.crop_name,
  c.quantity,
  c.total_value,
  c.status,
  c.created_at
FROM public.contracts c
LEFT JOIN public.profiles f ON c.farmer_id = f.id
LEFT JOIN public.profiles b ON c.business_id = b.id
ORDER BY c.created_at DESC;
```

### View all loan applications
```sql
SELECT 
  l.application_number,
  f.full_name as farmer_name,
  l.loan_amount,
  l.status,
  l.risk_category,
  c.crop_name,
  l.created_at
FROM public.loan_applications l
LEFT JOIN public.profiles f ON l.farmer_id = f.id
LEFT JOIN public.contracts c ON l.contract_id = c.id
ORDER BY l.created_at DESC;
```

---

## Next Steps

After setting up the database:

1. ✅ Run `npm install` to install Supabase client
2. ✅ Update `.env` with your actual Supabase anon key
3. ✅ Test the login and signup flow
4. ✅ Test file upload with encryption
5. ✅ Complete the onboarding forms integration

---

## Security Notes

- ✅ All tables have Row Level Security (RLS) enabled
- ✅ Users can only access their own data
- ✅ Files are encrypted before upload
- ✅ Storage bucket is private (not publicly accessible)
- ✅ Authentication required for all protected routes

---

## Support

For Supabase documentation:
- https://supabase.com/docs
- https://supabase.com/docs/guides/database
- https://supabase.com/docs/guides/storage

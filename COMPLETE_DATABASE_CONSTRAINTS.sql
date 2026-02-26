-- ============================================
-- AGRIANCE COMPLETE DATABASE CONSTRAINTS
-- Comprehensive SQL with all tables, constraints, indexes, RLS policies
-- Run in Supabase SQL Editor
-- ============================================

-- ============================================
-- SECTION 1: ENUM TYPES
-- ============================================

-- Drop existing enums if they exist (for clean reinstall)
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS kyc_verification_status CASCADE;
DROP TYPE IF EXISTS contract_status CASCADE;
DROP TYPE IF EXISTS loan_status CASCADE;
DROP TYPE IF EXISTS document_type CASCADE;
DROP TYPE IF EXISTS loan_application_type CASCADE;
DROP TYPE IF EXISTS gender_type CASCADE;
DROP TYPE IF EXISTS land_ownership_type CASCADE;
DROP TYPE IF EXISTS irrigation_type CASCADE;
DROP TYPE IF EXISTS soil_type CASCADE;

-- Create enum types
CREATE TYPE user_role AS ENUM ('farmer', 'business', 'bank', 'admin');
CREATE TYPE kyc_verification_status AS ENUM ('pending', 'verified', 'rejected', 'expired');
CREATE TYPE contract_status AS ENUM ('draft', 'pending', 'active', 'in_progress', 'completed', 'cancelled', 'disputed');
CREATE TYPE loan_status AS ENUM ('draft', 'pending', 'under_review', 'approved', 'rejected', 'disbursed', 'repaid', 'defaulted');
CREATE TYPE document_type AS ENUM ('aadhaar', 'pan', 'gst_certificate', 'business_registration', 'land_title', 'bank_statement', 'tax_return', 'license', 'insurance', 'other');
CREATE TYPE loan_application_type AS ENUM ('farmer', 'business', 'aggregation');
CREATE TYPE gender_type AS ENUM ('male', 'female', 'other', 'prefer_not_to_say');
CREATE TYPE land_ownership_type AS ENUM ('owned', 'leased', 'shared', 'government');
CREATE TYPE irrigation_type AS ENUM ('rainfed', 'well', 'borewell', 'canal', 'drip', 'sprinkler', 'other');
CREATE TYPE soil_type AS ENUM ('alluvial', 'black', 'red', 'laterite', 'sandy', 'silty', 'clay', 'mixed');

-- ============================================
-- SECTION 2: DOMAINS (Custom Data Types)
-- ============================================

-- Positive decimal domain
CREATE DOMAIN positive_decimal AS DECIMAL(15, 2) CHECK (VALUE >= 0);

-- Positive integer domain
CREATE DOMAIN positive_int AS INTEGER CHECK (VALUE >= 0);

-- Percentage domain (0-100)
CREATE DOMAIN percentage AS INTEGER CHECK (VALUE >= 0 AND VALUE <= 100);

-- Phone number format (India)
CREATE DOMAIN phone_number AS TEXT CHECK (VALUE ~ '^[0-9]{10}$');

-- GST Number format
CREATE DOMAIN gst_number AS TEXT CHECK (VALUE ~ '^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$');

-- ============================================
-- SECTION 3: MASTER TABLES
-- ============================================

-- 3.1 PROFILES TABLE (Core User Table)
CREATE TABLE profiles (
    -- Primary & Reference
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    
    -- Core Identity
    email TEXT NOT NULL UNIQUE CHECK (email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    phone_number phone_number,
    full_name TEXT NOT NULL,
    alternate_phone phone_number,
    date_of_birth DATE,
    gender gender_type,
    
    -- Role & Verification
    role user_role NOT NULL DEFAULT 'farmer',
    kyc_status kyc_verification_status NOT NULL DEFAULT 'pending',
    kyc_verified_at TIMESTAMP WITH TIME ZONE,
    aadhaar_number TEXT,
    pan_number gst_number,
    
    -- Address
    address_line1 TEXT,
    address_line2 TEXT,
    city TEXT,
    district TEXT,
    state TEXT,
    pincode TEXT CHECK (pincode ~ '^[0-9]{6}$'),
    country TEXT DEFAULT 'India',
    
    -- Location Data
    location TEXT,
    gps_coordinates POINT,
    region TEXT,
    zone TEXT,
    
    -- Farmer Specific
    land_size_hectares positive_decimal,
    land_ownership land_ownership_type,
    irrigation irrigation_type,
    soil_type soil_type,
    crops_history TEXT[],
    current_season_crops TEXT[],
    farming_experience_years positive_int,
    organic_certified BOOLEAN DEFAULT false,
    organic_certification_number TEXT,
    
    -- Business Specific
    company_name TEXT,
    business_name TEXT,
    business_type TEXT,
    business_category TEXT,
    gst_number gst_number,
    business_gst gst_number,
    registration_number TEXT,
    business_email TEXT CHECK (business_email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
    business_phone TEXT,
    business_address TEXT,
    business_city TEXT,
    business_state TEXT,
    business_pincode TEXT,
    year_of_establishment positive_int,
    number_of_employees positive_int,
    annual_turnover positive_decimal,
    bank_name TEXT,
    bank_account TEXT CHECK (bank_account ~ '^[0-9]{9,18}$'),
    ifsc_code TEXT CHECK (ifsc_code ~ '^[A-Z]{4}0[A-Z0-9]{6}$'),
    bank_branch TEXT,
    
    -- Bank Specific
    bank_name_primary TEXT,
    rbi_license_number TEXT,
    bank_category TEXT,
    branch_details JSONB,
    head_office_address TEXT,
    head_office_city TEXT,
    head_office_state TEXT,
    
    -- Trust & Scoring
    trust_score percentage DEFAULT 50,
    credit_score INTEGER CHECK (credit_score >= 0 AND credit_score <= 900),
    platform_rating DECIMAL(3, 2) CHECK (platform_rating >= 0 AND platform_rating <= 5),
    total_contracts_completed positive_int DEFAULT 0,
    total_contracts_value positive_decimal DEFAULT 0,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_suspended BOOLEAN NOT NULL DEFAULT false,
    suspension_reason TEXT,
    suspended_at TIMESTAMP WITH TIME ZONE,
    onboarding_completed BOOLEAN NOT NULL DEFAULT false,
    onboarding_completed_at TIMESTAMP WITH TIME ZONE,
    
    -- Preferences
    preferred_language TEXT DEFAULT 'en',
    communication_preference TEXT DEFAULT 'both',
    notification_settings JSONB DEFAULT '{"email": true, "sms": true, "push": true}',
    
    -- Audit
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    deleted_at TIMESTAMP WITH TIME ZONE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    last_active_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT profiles_email_check CHECK (email <> ''),
    CONSTRAINT profiles_role_check CHECK (role IN ('farmer', 'business', 'bank', 'admin'))
);

-- 3.2 CONTRACTS TABLE
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    business_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    farmer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    
    -- Contract Details
    contract_number TEXT NOT NULL UNIQUE,
    title TEXT,
    crop_name TEXT NOT NULL,
    crop_category TEXT,
    crop_variety TEXT,
    quantity positive_decimal NOT NULL,
    unit TEXT NOT NULL DEFAULT 'Quintals' CHECK (unit IN ('Quintals', 'Kg', 'Tons', 'Bales', 'Boxes')),
    price positive_decimal NOT NULL,
    total_value positive_decimal NOT NULL,
    
    -- Delivery
    delivery_date DATE NOT NULL,
    delivery_location TEXT,
    delivery_terms TEXT,
    
    -- Quality
    quality_standards TEXT,
    quality_check_parameters JSONB,
    min_quality_percentage DECIMAL(5, 2) CHECK (min_quality_percentage >= 0 AND min_quality_percentage <= 100),
    
    -- Payment
    payment_terms TEXT,
    advance_percentage DECIMAL(5, 2) CHECK (advance_percentage >= 0 AND advance_percentage <= 100),
    payment_schedule JSONB,
    
    -- Status
    status contract_status NOT NULL DEFAULT 'draft',
    progress_percentage DECIMAL(5, 2) DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    
    -- Dates
    signed_date DATE,
    start_date DATE,
    end_date DATE,
    completed_date DATE,
    cancelled_date DATE,
    cancellation_reason TEXT,
    
    -- Documents
    contract_document_url TEXT,
    terms_conditions TEXT,
    selected_clauses TEXT[],
    
    -- Escrow
    escrow_amount positive_decimal,
    escrow_status TEXT,
    escrow_released_at TIMESTAMP WITH TIME ZONE,
    
    -- Tracking
    current_milestone TEXT,
    milestones JSONB,
    
    -- Audit
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    
    -- Constraints
    CONSTRAINT contracts_business_farmer_diff CHECK (business_id <> farmer_id),
    CONSTRAINT contracts_delivery_future CHECK (delivery_date >= CURRENT_DATE OR status IN ('completed', 'cancelled')),
    CONSTRAINT contracts_total_value_check CHECK (total_value = quantity * price)
);

-- 3.3 CONTRACT MILESTONES TABLE
CREATE TABLE contract_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    
    milestone_number positive_int NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE NOT NULL,
    amount positive_decimal NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'overdue', 'disputed')),
    completed_date DATE,
    completion_document_url TEXT,
    completion_notes TEXT,
    is_payment_milestone BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    
    CONSTRAINT milestones_contract_order UNIQUE (contract_id, milestone_number)
);

-- 3.4 CONTRACT PAYMENTS TABLE
CREATE TABLE contract_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_id UUID NOT NULL REFERENCES contracts(id) ON DELETE CASCADE,
    milestone_id UUID REFERENCES contract_milestones(id) ON DELETE SET NULL,
    
    payment_number TEXT NOT NULL UNIQUE,
    amount positive_decimal NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('advance', 'milestone', 'final', 'penalty', 'refund')),
    payment_method TEXT CHECK (payment_method IN ('bank_transfer', 'upi', 'escrow', 'check', 'cash')),
    transaction_reference TEXT,
    utr_number TEXT,
    
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'initiated', 'completed', 'failed', 'reversed')),
    payment_date TIMESTAMP WITH TIME ZONE,
    settlement_date TIMESTAMP WITH TIME ZONE,
    
    from_account JSONB,
    to_account JSONB,
    
    remarks TEXT,
    supporting_document_url TEXT,
    
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- 3.5 LOAN APPLICATIONS TABLE
CREATE TABLE loan_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    applicant_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    contract_id UUID REFERENCES contracts(id) ON DELETE SET NULL,
    assigned_bank_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    reviewed_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Application Details
    application_number TEXT NOT NULL UNIQUE,
    loan_type TEXT DEFAULT 'agriculture' CHECK (loan_type IN ('agriculture', 'horticulture', 'farm_equipment', 'irrigation', 'storage', 'processing', 'marketing', 'aggregation')),
    applicant_type loan_application_type NOT NULL DEFAULT 'farmer',
    
    -- Loan Terms
    loan_amount positive_decimal NOT NULL,
    requested_amount positive_decimal NOT NULL,
    approved_amount positive_decimal,
    tenure_months positive_int NOT NULL CHECK (tenure_months BETWEEN 1 AND 360),
    requested_tenure_months positive_int,
    interest_rate DECIMAL(8, 4),
    approved_interest_rate DECIMAL(8, 4),
    processing_fee positive_decimal,
    
    -- Purpose
    purpose TEXT NOT NULL,
    purpose_category TEXT,
    description TEXT,
    
    -- Collateral
    collateral_type TEXT,
    collateral_value positive_decimal,
    collateral_documents JSONB,
    security_pledge_date DATE,
    security_pledge_status TEXT,
    
    -- Risk Assessment
    risk_score INTEGER CHECK (risk_score BETWEEN 0 AND 100),
    risk_category TEXT CHECK (risk_category IN ('low', 'medium', 'high', 'very_high')),
    credit_score INTEGER CHECK (credit_score BETWEEN 0 AND 900),
    
    -- Status
    status loan_status NOT NULL DEFAULT 'draft',
    sub_status TEXT,
    status_reason TEXT,
    
    -- Review
    review_notes TEXT,
    review_date DATE,
    review_outcome TEXT,
    
    -- Disbursement
    disbursement_date DATE,
    disbursement_amount positive_decimal,
    disbursement_reference TEXT,
    
    -- Repayment
    repayment_schedule JSONB,
    total_repaid positive_decimal DEFAULT 0,
    outstanding_balance positive_decimal DEFAULT 0,
    next_payment_date DATE,
    last_payment_date DATE,
    default_date DATE,
    default_reason TEXT,
    
    -- Bank Assignment
    bank_name TEXT,
    bank_reference_number TEXT,
    bank_loan_account_number TEXT,
    bank_approval_date DATE,
    
    -- Audit
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_by UUID REFERENCES profiles(id),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    submitted_at TIMESTAMP WITH TIME ZONE,
    approved_at TIMESTAMP WITH TIME ZONE,
    rejected_at TIMESTAMP WITH TIME ZONE,
    disbursed_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT loan_amount_positive CHECK (loan_amount > 0),
    CONSTRAINT tenure_valid CHECK (tenure_months >= 1 AND tenure_months <= 360),
    CONSTRAINT approved_amount_check CHECK (approved_amount IS NULL OR approved_amount > 0)
);

-- 3.6 LOAN REPAYMENTS TABLE
CREATE TABLE loan_repayments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_id UUID NOT NULL REFERENCES loan_applications(id) ON DELETE CASCADE,
    
    installment_number positive_int NOT NULL,
    due_date DATE NOT NULL,
    amount_due positive_decimal NOT NULL,
    principal_amount positive_decimal NOT NULL,
    interest_amount positive_decimal NOT NULL,
    penalty_amount DECIMAL(15, 2) DEFAULT 0,
    total_amount_due positive_decimal NOT NULL,
    
    amount_paid positive_decimal DEFAULT 0,
    payment_date DATE,
    payment_method TEXT,
    transaction_reference TEXT,
    utr_number TEXT,
    
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue', 'defaulted', 'waived')),
    payment_notes TEXT,
    receipt_url TEXT,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    
    CONSTRAINT repayment_installment_unique UNIQUE (loan_id, installment_number)
);

-- 3.7 KYC DOCUMENTS TABLE
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    document_type document_type NOT NULL,
    document_number TEXT NOT NULL,
    document_name TEXT,
    
    -- File References
    front_image_url TEXT,
    back_image_url TEXT,
    full_document_url TEXT,
    
    -- Status
    verification_status kyc_verification_status NOT NULL DEFAULT 'pending',
    verification_score DECIMAL(5, 2),
    verification_notes TEXT,
    rejection_reason TEXT,
    
    -- Verification
    verified_by UUID REFERENCES profiles(id),
    verified_at TIMESTAMP WITH TIME ZONE,
    expiry_date DATE,
    
    -- Metadata
    ocr_data JSONB,
    extracted_data JSONB,
    face_match_score DECIMAL(5, 2),
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    
    CONSTRAINT kyc_user_document_type_unique UNIQUE (user_id, document_type)
);

-- 3.8 FILE METADATA TABLE
CREATE TABLE file_metadata (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    -- File Details
    file_name TEXT NOT NULL,
    original_name TEXT NOT NULL,
    file_type TEXT NOT NULL,
    file_size INTEGER NOT NULL CHECK (file_size > 0 AND file_size <= 52428800),
    mime_type TEXT NOT NULL,
    extension TEXT NOT NULL,
    
    -- Storage
    storage_provider TEXT DEFAULT 'supabase',
    storage_bucket TEXT NOT NULL DEFAULT 'documents',
    storage_path TEXT NOT NULL,
    public_url TEXT,
    
    -- Encryption
    is_encrypted BOOLEAN NOT NULL DEFAULT true,
    encryption_algorithm TEXT DEFAULT 'AES-256-GCM',
    encryption_key_id TEXT,
    salt TEXT,
    auth_tag TEXT,
    checksum TEXT,
    
    -- Category
    file_category TEXT CHECK (file_category IN ('kyc', 'contract', 'loan', 'payment', 'report', 'image', 'document', 'other')),
    document_type document_type,
    related_entity_type TEXT,
    related_entity_id UUID,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_archived BOOLEAN DEFAULT false,
    archived_at TIMESTAMP WITH TIME ZONE,
    deletion_date DATE,
    
    -- Audit
    uploaded_by UUID REFERENCES profiles(id),
    uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_by UUID REFERENCES profiles(id),
    download_count INTEGER DEFAULT 0,
    
    deleted_at TIMESTAMP WITH TIME ZONE,
    
    -- Constraints
    CONSTRAINT file_size_limit CHECK (file_size <= 52428800),
    CONSTRAINT file_type_allowed CHECK (mime_type IN ('application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'))
);

-- 3.9 AUDIT LOG TABLE
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Action Details
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    action_type TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    
    -- Changes
    old_values JSONB,
    new_values JSONB,
    changed_fields TEXT[],
    
    -- Context
    ip_address INET,
    user_agent TEXT,
    session_id UUID,
    
    -- Metadata
    description TEXT,
    metadata JSONB,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW()),
    
    CONSTRAINT audit_action_type_check CHECK (action_type IN ('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'import', 'approve', 'reject', 'submit', 'cancel', 'suspend', 'activate'))
);

-- 3.10 NOTIFICATIONS TABLE
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    
    type TEXT NOT NULL CHECK (type IN ('contract', 'loan', 'payment', 'kyc', 'system', 'message', 'alert', 'reminder')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    
    -- Reference
    entity_type TEXT,
    entity_id UUID,
    action_url TEXT,
    
    -- Status
    is_read BOOLEAN NOT NULL DEFAULT false,
    is_sent BOOLEAN DEFAULT false,
    sent_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    
    -- Channels
    channel_email BOOLEAN DEFAULT false,
    channel_sms BOOLEAN DEFAULT false,
    channel_push BOOLEAN DEFAULT false,
    channel_in_app BOOLEAN DEFAULT true,
    
    metadata JSONB,
    
    expires_at TIMESTAMP WITH TIME ZONE,
    
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT TIMEZONE('utc', NOW())
);

-- ============================================
-- SECTION 4: INDEXES
-- ============================================

-- Profiles Indexes
CREATE INDEX idx_profiles_auth_user ON profiles(auth_user_id);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_kyc_status ON profiles(kyc_status);
CREATE INDEX idx_profiles_state ON profiles(state);
CREATE INDEX idx_profiles_district ON profiles(district);
CREATE INDEX idx_profiles_created_at ON profiles(created_at DESC);
CREATE INDEX idx_profiles_trust_score ON profiles(trust_score DESC);
CREATE INDEX idx_profiles_location ON profiles USING GIST(gps_coordinates);

-- Contracts Indexes
CREATE INDEX idx_contracts_business ON contracts(business_id);
CREATE INDEX idx_contracts_farmer ON contracts(farmer_id);
CREATE INDEX idx_contracts_status ON contracts(status);
CREATE INDEX idx_contracts_crop_name ON contracts(crop_name);
CREATE INDEX idx_contracts_created_at ON contracts(created_at DESC);
CREATE INDEX idx_contracts_delivery_date ON contracts(delivery_date);
CREATE INDEX idx_contracts_total_value ON contracts(total_value DESC);

-- Contract Milestones Indexes
CREATE INDEX idx_milestones_contract ON contract_milestones(contract_id);
CREATE INDEX idx_milestones_status ON contract_milestones(status);
CREATE INDEX idx_milestones_due_date ON contract_milestones(due_date);

-- Contract Payments Indexes
CREATE INDEX idx_contract_payments_contract ON contract_payments(contract_id);
CREATE INDEX idx_contract_payments_status ON contract_payments(payment_status);

-- Loan Applications Indexes
CREATE INDEX idx_loans_applicant ON loan_applications(applicant_id);
CREATE INDEX idx_loans_status ON loan_applications(status);
CREATE INDEX idx_loans_bank ON loan_applications(assigned_bank_id);
CREATE INDEX idx_loans_created_at ON loan_applications(created_at DESC);
CREATE INDEX idx_loans_amount ON loan_applications(loan_amount DESC);
CREATE INDEX idx_loans_risk_score ON loan_applications(risk_score);

-- Loan Repayments Indexes
CREATE INDEX idx_loan_repayments_loan ON loan_repayments(loan_id);
CREATE INDEX idx_loan_repayments_status ON loan_repayments(payment_status);
CREATE INDEX idx_loan_repayments_due_date ON loan_repayments(due_date);

-- KYC Documents Indexes
CREATE INDEX idx_kyc_user ON kyc_documents(user_id);
CREATE INDEX idx_kyc_type ON kyc_documents(document_type);
CREATE INDEX idx_kyc_status ON kyc_documents(verification_status);

-- File Metadata Indexes
CREATE INDEX idx_files_user ON file_metadata(user_id);
CREATE INDEX idx_files_category ON file_metadata(file_category);
CREATE INDEX idx_files_storage_path ON file_metadata(storage_path);
CREATE INDEX idx_files_created_at ON file_metadata(created_at DESC);
CREATE INDEX idx_files_checksum ON file_metadata(checksum);

-- Audit Logs Indexes
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit_logs(action_type);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

-- Notifications Indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- ============================================
-- SECTION 5: RLS POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE contract_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE loan_repayments ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Admins can manage all profiles" ON profiles FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Public can view active farmer profiles" ON profiles FOR SELECT USING (role = 'farmer' AND is_active = true AND kyc_status = 'verified');

-- Contracts Policies
CREATE POLICY "Farmers can view own contracts" ON contracts FOR SELECT USING (auth.uid() = farmer_id);
CREATE POLICY "Businesses can view own contracts" ON contracts FOR SELECT USING (auth.uid() = business_id);
CREATE POLICY "Businesses can create contracts" ON contracts FOR INSERT WITH CHECK (auth.uid() = business_id);
CREATE POLICY "Businesses can update own contracts" ON contracts FOR UPDATE USING (auth.uid() = business_id);
CREATE POLICY "Contract parties can view contract milestones" ON contract_milestones FOR SELECT USING (EXISTS (SELECT 1 FROM contracts WHERE id = contract_id AND (farmer_id = auth.uid() OR business_id = auth.uid())));
CREATE POLICY "Contract parties can update milestones" ON contract_milestones FOR UPDATE USING (EXISTS (SELECT 1 FROM contracts WHERE id = contract_id AND business_id = auth.uid()));
CREATE POLICY "Contract parties can view payments" ON contract_payments FOR SELECT USING (EXISTS (SELECT 1 FROM contracts WHERE id = contract_id AND (farmer_id = auth.uid() OR business_id = auth.uid())));

-- Loan Applications Policies
CREATE POLICY "Users can view own loan applications" ON loan_applications FOR SELECT USING (auth.uid() = applicant_id);
CREATE POLICY "Users can create loan applications" ON loan_applications FOR INSERT WITH CHECK (auth.uid() = applicant_id);
CREATE POLICY "Users can update own loans" ON loan_applications FOR UPDATE USING (auth.uid() = applicant_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('bank', 'admin')));
CREATE POLICY "Banks can view all loans" ON loan_applications FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'bank'));
CREATE POLICY "Banks can update assigned loans" ON loan_applications FOR UPDATE USING (assigned_bank_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Loan applicants can view repayments" ON loan_repayments FOR SELECT USING (EXISTS (SELECT 1 FROM loan_applications WHERE id = loan_id AND applicant_id = auth.uid()));
CREATE POLICY "Banks can manage repayments" ON loan_repayments FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'bank'));

-- KYC Documents Policies
CREATE POLICY "Users can view own KYC" ON kyc_documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can upload KYC" ON kyc_documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own KYC" ON kyc_documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can verify KYC" ON kyc_documents FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role IN ('bank', 'admin')));

-- File Metadata Policies
CREATE POLICY "Users can view own files" ON file_metadata FOR SELECT USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can upload files" ON file_metadata FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own files" ON file_metadata FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON file_metadata FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage all files" ON file_metadata FOR ALL USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Audit Logs Policies (Admin Only)
CREATE POLICY "Admins can view audit logs" ON audit_logs FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- Notifications Policies
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SECTION 6: TRIGGERS & FUNCTIONS
-- ============================================

-- 6.1 Updated At Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_contracts_updated_at BEFORE UPDATE ON contracts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON contract_milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON contract_payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_loans_updated_at BEFORE UPDATE ON loan_applications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_repayments_updated_at BEFORE UPDATE ON loan_repayments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_updated_at BEFORE UPDATE ON kyc_documents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_files_updated_at BEFORE UPDATE ON file_metadata FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6.2 Soft Delete Trigger Function
CREATE OR REPLACE FUNCTION soft_delete_row()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6.3 Auto-generate Contract Number
CREATE OR REPLACE FUNCTION generate_contract_number()
RETURNS TRIGGER AS $$
DECLARE
    year_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_prefix := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(contract_number FROM 'CRT-' || year_prefix || '-([0-9]+)$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM contracts
    WHERE contract_number LIKE 'CRT-' || year_prefix || '-%';
    
    NEW.contract_number := 'CRT-' || year_prefix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_contract_number_trigger
BEFORE INSERT ON contracts
FOR EACH ROW
WHEN (NEW.contract_number IS NULL)
EXECUTE FUNCTION generate_contract_number();

-- 6.4 Auto-generate Loan Application Number
CREATE OR REPLACE FUNCTION generate_loan_application_number()
RETURNS TRIGGER AS $$
DECLARE
    year_month_prefix TEXT;
    sequence_num INTEGER;
BEGIN
    year_month_prefix := TO_CHAR(CURRENT_DATE, 'YYYYMM');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(application_number FROM 'LN-' || year_month_prefix || '-([0-9]+)$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM loan_applications
    WHERE application_number LIKE 'LN-' || year_month_prefix || '-%';
    
    NEW.application_number := 'LN-' || year_month_prefix || '-' || LPAD(sequence_num::TEXT, 6, '0');
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_loan_number_trigger
BEFORE INSERT ON loan_applications
FOR EACH ROW
WHEN (NEW.application_number IS NULL)
EXECUTE FUNCTION generate_loan_application_number();

-- 6.5 Auto-generate Payment Number
CREATE OR REPLACE FUNCTION generate_payment_number()
RETURNS TRIGGER AS $$
DECLARE
    timestamp_part TEXT;
    sequence_num INTEGER;
BEGIN
    timestamp_part := TO_CHAR(CURRENT_TIMESTAMP, 'YYYYMMDDHH24MISSFF3');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(payment_number FROM 'PAY-([0-9]+)$') AS INTEGER)), 0) + 1
    INTO sequence_num
    FROM contract_payments
    WHERE payment_number LIKE 'PAY-%';
    
    NEW.payment_number := 'PAY-' || timestamp_part || '-' || sequence_num;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER generate_payment_number_trigger
BEFORE INSERT ON contract_payments
FOR EACH ROW
WHEN (NEW.payment_number IS NULL)
EXECUTE FUNCTION generate_payment_number();

-- 6.6 Update Trust Score on Contract Completion
CREATE OR REPLACE FUNCTION update_trust_score_on_contract_complete()
RETURNS TRIGGER AS $$
DECLARE
    farmer_avg_score DECIMAL;
    business_avg_score DECIMAL;
BEGIN
    IF NEW.status = 'completed' AND OLD.status <> 'completed' THEN
        -- Update farmer's average rating from completed contracts
        SELECT AVG(platform_rating)::DECIMAL(3, 2)
        INTO farmer_avg_score
        FROM contracts
        WHERE farmer_id = NEW.farmer_id AND status = 'completed';
        
        UPDATE profiles
        SET platform_rating = COALESCE(farmer_avg_score, 0),
            total_contracts_completed = total_contracts_completed + 1,
            total_contracts_value = total_contracts_value + NEW.total_value
        WHERE id = NEW.farmer_id;
        
        -- Update business's average rating
        SELECT AVG(platform_rating)::DECIMAL(3, 2)
        INTO business_avg_score
        FROM contracts
        WHERE business_id = NEW.business_id AND status = 'completed';
        
        UPDATE profiles
        SET platform_rating = COALESCE(business_avg_score, 0)
        WHERE id = NEW.business_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_trust_score_contract
AFTER UPDATE ON contracts
FOR EACH ROW
EXECUTE FUNCTION update_trust_score_on_contract_complete();

-- 6.7 Calculate Loan Outstanding Balance
CREATE OR REPLACE FUNCTION calculate_loan_outstanding()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE loan_applications
        SET outstanding_balance = loan_amount - NEW.amount_paid
        WHERE id = NEW.loan_id;
    ELSIF TG_OP = 'UPDATE' AND OLD.amount_paid <> NEW.amount_paid THEN
        UPDATE loan_applications
        SET outstanding_balance = loan_amount - NEW.amount_paid,
            last_payment_date = CURRENT_DATE
        WHERE id = NEW.loan_id;
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_loan_balance
AFTER INSERT OR UPDATE ON loan_repayments
FOR EACH ROW
EXECUTE FUNCTION calculate_loan_outstanding();

-- ============================================
-- SECTION 7: STORAGE SETUP
-- ============================================

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('documents', 'documents', false, 52428800, ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png', 'image/webp']),
    ('contracts', 'contracts', false, 10485760, ARRAY['application/pdf']),
    ('kyc', 'kyc', false, 5242880, ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']),
    ('reports', 'reports', false, 10485760, ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'])
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SECTION 8: VIEWS
-- ============================================

-- View: Farmer Summary
CREATE VIEW farmer_summary AS
SELECT 
    p.id,
    p.full_name,
    p.location,
    p.state,
    p.land_size_hectares,
    p.crops_history,
    p.platform_rating,
    p.trust_score,
    p.kyc_status,
    p.total_contracts_completed,
    p.total_contracts_value,
    p.farming_experience_years,
    p.organic_certified,
    COUNT(c.id) FILTER (WHERE c.status IN ('active', 'in_progress')) AS active_contracts,
    SUM(c.total_value) FILTER (WHERE c.status IN ('active', 'in_progress')) AS active_contract_value
FROM profiles p
LEFT JOIN contracts c ON p.id = c.farmer_id
WHERE p.role = 'farmer'
GROUP BY p.id;

-- View: Business Summary
CREATE VIEW business_summary AS
SELECT 
    p.id,
    p.business_name,
    p.company_name,
    p.business_type,
    p.gst_number,
    p.location,
    p.state,
    p.platform_rating,
    p.trust_score,
    p.total_contracts_completed,
    p.total_contracts_value,
    COUNT(c.id) FILTER (WHERE c.status = 'active') AS active_contracts,
    COUNT(DISTINCT c.farmer_id) FILTER (WHERE c.status IN ('active', 'completed')) AS unique_farmers
FROM profiles p
LEFT JOIN contracts c ON p.id = c.business_id
WHERE p.role = 'business'
GROUP BY p.id;

-- View: Loan Summary by Status
CREATE VIEW loan_summary_by_status AS
SELECT 
    status,
    COUNT(*) AS count,
    SUM(loan_amount) AS total_amount,
    AVG(tenure_months) AS avg_tenure,
    AVG(interest_rate) AS avg_interest_rate
FROM loan_applications
WHERE deleted_at IS NULL
GROUP BY status;

-- ============================================
-- SECTION 9: SAMPLE DATA (Optional)
-- ============================================

-- Insert sample partner banks
INSERT INTO profiles (id, email, full_name, role, bank_name, kyc_status, trust_score, is_active)
VALUES 
    ('11111111-1111-1111-1111-111111111111', 'sbi@agriance.com', 'State Bank of India', 'bank', 'State Bank of India', 'verified', 95, true),
    ('22222222-2222-2222-2222-222222222222', 'hdfc@agriance.com', 'HDFC Bank', 'bank', 'HDFC Bank', 'verified', 92, true),
    ('33333333-3333-3333-3333-333333333333', 'icici@agriance.com', 'ICICI Bank', 'bank', 'ICICI Bank', 'verified', 90, true)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- DONE! Run this entire script in Supabase SQL Editor
-- ============================================

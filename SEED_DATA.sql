-- ============================================
-- AGRIANCE - DEMO SEED DATA
-- Run this in Supabase SQL Editor AFTER creating users
-- ============================================

-- INSTRUCTIONS:
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Create these 3 users (Disable email confirmation if possible):
--    - Email: farmer@agriance.com, Password: test1test1
--    - Email: business@agriance.com, Password: test1test1
--    - Email: bank@agriance.com, Password: test1test1
-- 3. Copy their UUIDs and replace the values below if needed, 
--    or this script will try to find them by email.

DO $$
DECLARE
    farmer_id UUID;
    business_id UUID;
    bank_id UUID;
BEGIN
    -- Get UUIDs from auth.users (assuming you created them manually)
    SELECT id INTO farmer_id FROM auth.users WHERE email = 'farmer@agriance.com';
    SELECT id INTO business_id FROM auth.users WHERE email = 'business@agriance.com';
    SELECT id INTO bank_id FROM auth.users WHERE email = 'bank@agriance.com';

    -- 1. SEED PROFILES
    -- Farmer Profile
    INSERT INTO public.profiles (id, email, full_name, role, kyc_status, land_size, location, crops_history, trust_score, rating, onboarding_completed)
    VALUES (farmer_id, 'farmer@agriance.com', 'Ramesh Patil', 'farmer', 'verified', 8.5, 'Sangli, Maharashtra', ARRAY['Wheat', 'Soybean', 'Grapes'], 92, 4.8, true)
    ON CONFLICT (id) DO UPDATE SET 
        role = 'farmer', 
        kyc_status = 'verified', 
        onboarding_completed = true;

    -- Business Profile
    INSERT INTO public.profiles (id, email, full_name, business_name, role, kyc_status, business_gst, location, trust_score, rating, onboarding_completed)
    VALUES (business_id, 'business@agriance.com', 'AgriCorp Manager', 'AgriCorp India Ltd', 'business', 'verified', '27AAAAA0000A1Z5', 'Pune, Maharashtra', 88, 4.5, true)
    ON CONFLICT (id) DO UPDATE SET 
        role = 'business', 
        kyc_status = 'verified', 
        onboarding_completed = true;

    -- Bank Profile
    INSERT INTO public.profiles (id, email, full_name, role, kyc_status, onboarding_completed)
    VALUES (bank_id, 'bank@agriance.com', 'State Agri Bank Manager', 'bank', 'verified', true)
    ON CONFLICT (id) DO UPDATE SET 
        role = 'bank', 
        kyc_status = 'verified', 
        onboarding_completed = true;


    -- 2. SEED CONTRACTS
    INSERT INTO public.contracts (business_id, farmer_id, contract_number, crop_name, quantity, unit, price, total_value, delivery_date, status, progress)
    VALUES 
    (business_id, farmer_id, 'CRT-20250201-4521', 'Organic Wheat', 50, 'Quintals', 2450, 122500, '2025-04-15', 'active', 65),
    (business_id, farmer_id, 'CRT-20250215-8892', 'Soybean', 30, 'Quintals', 4800, 144000, '2025-05-20', 'pending', 0)
    ON CONFLICT (contract_number) DO NOTHING;


    -- 3. SEED LOAN APPLICATIONS
    INSERT INTO public.loan_applications (applicant_id, application_number, loan_amount, tenure_months, purpose, bank_name, status, risk_score, applicant_type)
    VALUES 
    (farmer_id, 'APL-1735123456', 50000, 12, 'Drip Irrigation Equipment', 'State Agri Bank', 'approved', 82, 'farmer'),
    (farmer_id, 'APL-1735987654', 25000, 6, 'Organic Fertilizer Purchase', 'Farmer First Bank', 'pending', 75, 'farmer')
    ON CONFLICT (application_number) DO NOTHING;

END $$;

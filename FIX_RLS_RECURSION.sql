-- AGRIANCE - RLS RECURSION FIX
-- Run this in Supabase SQL Editor to fix 500 errors and infinite recursion

-- 1. Create a security definer function to check roles without triggering RLS
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS text AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE id = auth.uid();
  RETURN user_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop existing problematic policies on profiles table
DROP POLICY IF EXISTS "Business users can view farmer profiles" ON profiles;
DROP POLICY IF EXISTS "Bank users can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Farmer users can view business profiles" ON profiles;

-- 3. Re-create policies using the non-recursive function
CREATE POLICY "Business users can view farmer profiles"
  ON profiles FOR SELECT
  USING (
    role = 'farmer'
    AND public.get_auth_role() = 'business'
  );

CREATE POLICY "Bank users can view all profiles"
  ON profiles FOR SELECT
  USING (
    public.get_auth_role() = 'bank'
  );

CREATE POLICY "Farmer users can view business profiles"
  ON profiles FOR SELECT
  USING (
    role = 'business'
    AND public.get_auth_role() = 'farmer'
  );

-- 4. Fix other tables that might have circular dependencies
DROP POLICY IF EXISTS "Banks can view all contracts" ON contracts;
CREATE POLICY "Banks can view all contracts"
  ON contracts FOR SELECT
  USING (
    public.get_auth_role() = 'bank'
  );

DROP POLICY IF EXISTS "Banks can view all loan applications" ON loan_applications;
CREATE POLICY "Banks can view all loan applications"
  ON loan_applications FOR SELECT
  USING (
    public.get_auth_role() = 'bank'
  );

DROP POLICY IF EXISTS "Banks can update loan applications" ON loan_applications;
CREATE POLICY "Banks can update loan applications"
  ON loan_applications FOR UPDATE
  USING (
    public.get_auth_role() = 'bank'
  );

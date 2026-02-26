-- ============================================
-- FIX RLS POLICIES FOR PROFILES TABLE
-- This fixes the "violates row-level security policy" error
-- ============================================

-- First, let's see what policies exist
SELECT policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'profiles';

-- ============================================
-- DROP EXISTING RESTRICTIVE POLICIES
-- ============================================

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- ============================================
-- CREATE NEW PERMISSIVE POLICIES
-- ============================================

-- Policy 1: Allow users to insert their own profile during registration
CREATE POLICY "Enable insert for authenticated users" 
  ON profiles FOR INSERT 
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Policy 2: Allow users to read their own profile
CREATE POLICY "Enable read for users own profile" 
  ON profiles FOR SELECT 
  TO authenticated
  USING (auth.uid() = id);

-- Policy 3: Allow users to update their own profile
CREATE POLICY "Enable update for users own profile" 
  ON profiles FOR UPDATE 
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Allow public read access (needed for marketplace)
CREATE POLICY "Enable public read for marketplace" 
  ON profiles FOR SELECT 
  TO anon, authenticated
  USING (true);

-- ============================================
-- ALTERNATIVE: DISABLE RLS TEMPORARILY (Not recommended for production)
-- Uncomment the line below only if the above doesn't work
-- ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
-- ============================================

-- ============================================
-- VERIFY POLICIES WERE CREATED
-- ============================================
SELECT policyname, cmd, roles
FROM pg_policies 
WHERE tablename = 'profiles'
ORDER BY policyname;

-- ============================================
-- DONE! RLS policies should now allow registration
-- ============================================

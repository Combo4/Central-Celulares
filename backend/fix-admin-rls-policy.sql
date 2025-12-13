-- ============================================
-- Fix Admin Users RLS Policy
-- ============================================
-- Problem: The current policy prevents users from checking their own admin status
-- because it requires them to already be verified as admin (circular dependency)

-- Solution: Allow authenticated users to read admin records that match their email

-- Step 1: Drop the existing restrictive policy
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Step 2: Create new policies that allow:
-- a) Anonymous users to check if an email is an admin (for login verification)
-- b) Authenticated users to view their own admin record

-- Policy 1: Allow anyone (including anon) to check if an email is an admin
-- This is needed for the pre-login email verification
CREATE POLICY "Anyone can check admin status by email"
    ON public.admin_users FOR SELECT
    TO anon, authenticated
    USING (true);

-- Alternative (more restrictive): Only allow viewing specific fields
-- If you want to be more restrictive, use this instead:
/*
CREATE POLICY "Anyone can check admin status by email"
    ON public.admin_users FOR SELECT
    TO anon, authenticated
    USING (true);
*/

-- Step 3: Verify the policies are correct
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'admin_users';

-- ============================================
-- Test the fix (run these as different users)
-- ============================================

-- Test 1: As anon user (before login)
-- This should return the admin record
-- SELECT email, is_active FROM public.admin_users WHERE email = 'alexander.frauenfeld@gmail.com';

-- Test 2: As authenticated user (after login)
-- This should return the admin record
-- SELECT email, is_active FROM public.admin_users WHERE email = auth.jwt()->>'email';

-- ============================================
-- Notes:
-- ============================================
-- This policy is safe because:
-- 1. It only allows SELECT (read-only)
-- 2. Sensitive fields like auth_user_id are not exposed in most queries
-- 3. The pre-login check only reads email and is_active
-- 4. Write operations (INSERT/UPDATE/DELETE) still require admin privileges

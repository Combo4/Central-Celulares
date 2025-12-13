-- ============================================
-- Fix: Update RLS Policies to Check by Email
-- ============================================
-- Problem: Admins can't write to database from different locations
-- Cause: Policies check auth_user_id which may not be linked
-- Solution: Check email from JWT token instead

-- 1. Drop existing write policies for products
DROP POLICY IF EXISTS "Admins can insert products" ON public.products;
DROP POLICY IF EXISTS "Admins can update products" ON public.products;
DROP POLICY IF EXISTS "Admins can delete products" ON public.products;

-- 2. Create new policies that check by email instead of auth_user_id
CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = auth.jwt()->>'email' AND is_active = true
        )
    );

CREATE POLICY "Admins can update products"
    ON public.products FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = auth.jwt()->>'email' AND is_active = true
        )
    );

CREATE POLICY "Admins can delete products"
    ON public.products FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = auth.jwt()->>'email' AND is_active = true
        )
    );

-- 3. Do the same for site_config
DROP POLICY IF EXISTS "Admins can manage site config" ON public.site_config;

CREATE POLICY "Admins can manage site config"
    ON public.site_config FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = auth.jwt()->>'email' AND is_active = true
        )
    );

-- 4. Update audit log policy
DROP POLICY IF EXISTS "Admins can view audit log" ON public.audit_log;

CREATE POLICY "Admins can view audit log"
    ON public.audit_log FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = auth.jwt()->>'email' AND is_active = true
        )
    );

-- ============================================
-- Verify the fix worked
-- ============================================
SELECT 
    tablename,
    policyname,
    cmd
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('products', 'site_config', 'audit_log')
ORDER BY tablename, policyname;

-- ============================================
-- Test the fix (optional)
-- ============================================
-- Uncomment to test if insert works:
-- INSERT INTO public.products (name, price, category)
-- VALUES ('Test Product', 100.00, 'Test');

-- Clean up test:
-- DELETE FROM public.products WHERE name = 'Test Product';

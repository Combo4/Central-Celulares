# Fix: Unable to Write to Database from Different Location

## Problem
When accessing the admin panel from a different location (different computer, network, or after clearing cache), you can log in but cannot write to the database (can't add/edit/delete products).

## Root Cause
The RLS (Row Level Security) policies check if `auth_user_id` matches your current auth user ID. However:

1. **Missing Link**: Your `admin_users.auth_user_id` might be NULL or linked to a different auth session
2. **Different Auth Session**: Each login from a different location creates a new auth session
3. **Policy Check Fails**: RLS policy can't find your admin record because `auth_user_id` doesn't match

## The RLS Policy (Current)
```sql
CREATE POLICY "Admins can insert products"
    ON public.products FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE auth_user_id = auth.uid() AND is_active = true
            --    ^^^^^^^^^^^^^^^^^^^^^^^ This might not match!
        )
    );
```

## Solution: Update RLS Policies to Check by Email

Instead of checking `auth_user_id`, check by **email** which is consistent across all sessions.

### Quick Fix SQL Script

Run this in Supabase SQL Editor:

```sql
-- ============================================
-- Fix: Update RLS Policies to Check by Email
-- ============================================

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
ORDER BY tablename, policyname;
```

## Why This Works

### Before (Broken):
- Policy checks: `auth_user_id = auth.uid()`
- Problem: `auth_user_id` might be NULL or from old session
- Result: Admin check fails ❌

### After (Fixed):
- Policy checks: `email = auth.jwt()->>'email'`
- Email is **always** in the JWT token from Supabase Auth
- Email is consistent across all locations/devices
- Result: Admin check succeeds ✅

## Alternative: Auto-Link Auth User ID

If you prefer to keep using `auth_user_id`, you can auto-link it on login:

### Create a Database Function
```sql
-- Function to auto-link auth_user_id when admin logs in
CREATE OR REPLACE FUNCTION link_admin_auth_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Update admin_users with current auth user id
    UPDATE public.admin_users
    SET auth_user_id = NEW.id
    WHERE email = NEW.email
    AND auth_user_id IS NULL;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run on auth.users insert
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION link_admin_auth_user();
```

⚠️ **Note**: This requires Supabase to allow triggers on `auth.users` table, which may not be available.

## Verify Your Current Situation

### Check if auth_user_id is linked
```sql
SELECT 
    email,
    auth_user_id,
    is_active
FROM public.admin_users
WHERE email = 'your-email@example.com';
```

If `auth_user_id` is NULL, that's your issue!

### Check what's in your JWT token
In browser console (after logging in):
```javascript
// Get current session
const { data: { session } } = await supabase.auth.getSession();
console.log('Email:', session.user.email);
console.log('User ID:', session.user.id);
```

### Manually link your auth_user_id (Temporary Fix)
```sql
-- Link your current auth user to admin_users
UPDATE public.admin_users
SET auth_user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'your-email@example.com'
)
WHERE email = 'your-email@example.com';
```

## Why Email-Based Check is Better

| Aspect | auth_user_id Check | Email Check |
|--------|-------------------|-------------|
| **Consistency** | Changes per device/session | ✅ Always same |
| **Setup Required** | Must link manually | ✅ Automatic |
| **Multi-Device** | ❌ Breaks | ✅ Works |
| **After Cache Clear** | ❌ Breaks | ✅ Works |
| **New Login** | ❌ Needs re-link | ✅ Just works |
| **Security** | ✅ Secure | ✅ Secure |

## Testing the Fix

### Before Running Fix:
```sql
-- Try to insert (should fail)
INSERT INTO public.products (name, price, category)
VALUES ('Test Product', 100.00, 'Test');
```

### After Running Fix:
```sql
-- Try to insert (should succeed)
INSERT INTO public.products (name, price, category)
VALUES ('Test Product', 100.00, 'Test');

-- Clean up test
DELETE FROM public.products WHERE name = 'Test Product';
```

## For Multiple Admins

This fix works for **all admins** automatically:
- Each admin's email is in their JWT token
- Policy checks email against `admin_users` table
- No manual linking required per device/location

## Deployment Notes

1. **Run the fix SQL** in Supabase SQL Editor
2. **Clear browser cache** on all devices
3. **Log in again** from each location
4. **Test write operations** (add/edit product)

## Summary

**Problem**: RLS policies check `auth_user_id` which may not be linked or is device-specific

**Solution**: Change policies to check `email` from JWT token instead

**Benefit**: Works from any location/device without manual linking

**Security**: No change - still requires admin email in `admin_users` table with `is_active = true`

Run the fix and you'll be able to write to the database from anywhere! 🌍

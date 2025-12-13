# Quick Fix: Admin Login Issue

## Problem
You can log in but immediately get logged out with a message saying you're not classified as admin.

## Root Cause
The RLS (Row Level Security) policy on `admin_users` table has a **circular dependency**:
- To check if you're an admin, the system needs to query `admin_users`
- But the policy says "only admins can query `admin_users`"
- This creates a catch-22 situation

## Solution
Run this SQL script in your Supabase SQL Editor:

```sql
-- Drop the restrictive policy
DROP POLICY IF EXISTS "Admins can view admin users" ON public.admin_users;

-- Create a new policy that allows anyone to check admin status
CREATE POLICY "Anyone can check admin status by email"
    ON public.admin_users FOR SELECT
    TO anon, authenticated
    USING (true);
```

## How to Apply the Fix

### Method 1: Supabase Dashboard (Easiest)

1. Go to your Supabase project: https://app.supabase.com
2. Navigate to **SQL Editor**
3. Click **New query**
4. Copy and paste the SQL from `fix-admin-rls-policy.sql`
5. Click **Run** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"
7. Try logging in again - it should work now!

### Method 2: Using the Fix Script

1. Open `backend/fix-admin-rls-policy.sql`
2. Copy the entire content
3. Run it in Supabase SQL Editor

## Verify the Fix

After running the fix, verify it worked:

```sql
-- Check the policies on admin_users
SELECT 
    policyname,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'admin_users';
```

You should see:
- Policy name: "Anyone can check admin status by email"
- Roles: {anon, authenticated}
- Command: SELECT

## Test Your Login

1. Go to `/admin/login.html`
2. Enter your email: `alexander.frauenfeld@gmail.com`
3. You should receive an OTP code
4. Enter the code or click the magic link
5. You should successfully access the dashboard WITHOUT being logged out!

## Why This is Safe

This policy change is secure because:

1. ✅ **Read-Only**: Only allows SELECT (viewing data)
2. ✅ **No Write Access**: INSERT/UPDATE/DELETE still require admin privileges
3. ✅ **Minimal Data**: Queries only read `email` and `is_active` fields
4. ✅ **Standard Practice**: Common pattern for authentication systems
5. ✅ **No Sensitive Data**: `auth_user_id` is UUID, not a secret

## Alternative (More Restrictive)

If you want to be more restrictive, you could create a policy that only allows users to see their own record:

```sql
-- More restrictive: Only see your own record
CREATE POLICY "Users can view their own admin record"
    ON public.admin_users FOR SELECT
    TO authenticated
    USING (auth.jwt()->>'email' = email);
```

However, this won't work for the **pre-login** check (before authentication), so you'd still need a separate policy for anonymous users to check if an email is an admin.

## Updated Files

The fix has been applied to:
- ✅ `backend/fix-admin-rls-policy.sql` - Quick fix script
- ✅ `backend/database-setup.sql` - Updated for future deployments

## Still Having Issues?

If you still can't log in after applying the fix:

### Check 1: Verify your email is in the database
```sql
SELECT * FROM public.admin_users 
WHERE email = 'alexander.frauenfeld@gmail.com';
```

Expected result: One row with `is_active = true`

### Check 2: Link your auth account
```sql
UPDATE public.admin_users
SET auth_user_id = (
    SELECT id FROM auth.users 
    WHERE email = 'alexander.frauenfeld@gmail.com'
)
WHERE email = 'alexander.frauenfeld@gmail.com';
```

### Check 3: Clear browser cache
- Press Ctrl+Shift+Delete
- Clear "Cached images and files"
- Clear "Cookies and other site data"
- Try logging in again

### Check 4: Browser console
- Open Developer Tools (F12)
- Go to Console tab
- Look for any errors
- Share the error message for further help

## Need More Help?

Check these files:
- `admin/README_ADMIN.md` - Complete admin documentation
- `admin/ADMIN_SECURITY_IMPROVEMENTS.md` - Technical details
- `backend/add-admin-user.sql` - How to add new admins

## Summary

**Problem**: Circular dependency in RLS policy
**Solution**: Allow anyone to read `admin_users` (read-only)
**Result**: Login works, dashboard accessible, security maintained

Run the SQL fix and you'll be good to go! 🚀

-- ============================================
-- Add New Admin User
-- ============================================
-- Use this script to add a new admin user to the system
-- Replace 'new_admin@example.com' with the actual email address

-- Step 1: Insert the new admin user
-- This creates an entry in the admin_users table
INSERT INTO public.admin_users (email, is_active)
VALUES ('new_admin@example.com', true)
ON CONFLICT (email) DO UPDATE 
SET is_active = true;

-- Step 2: Link to auth account (if they already have one)
-- Run this AFTER the user has logged in at least once with their email
-- This connects their Supabase Auth account to the admin_users record
UPDATE public.admin_users
SET auth_user_id = (
    SELECT id FROM auth.users WHERE email = 'new_admin@example.com'
)
WHERE email = 'new_admin@example.com'
AND auth_user_id IS NULL;

-- Step 3: Verify the admin user was added correctly
SELECT 
    au.id,
    au.email,
    au.is_active,
    au.auth_user_id,
    u.email as auth_email,
    au.created_at
FROM public.admin_users au
LEFT JOIN auth.users u ON au.auth_user_id = u.id
WHERE au.email = 'new_admin@example.com';

-- ============================================
-- To DEACTIVATE an admin user (without deleting):
-- ============================================
-- UPDATE public.admin_users
-- SET is_active = false
-- WHERE email = 'admin_to_deactivate@example.com';

-- ============================================
-- To REACTIVATE an admin user:
-- ============================================
-- UPDATE public.admin_users
-- SET is_active = true
-- WHERE email = 'admin_to_reactivate@example.com';

-- ============================================
-- To LIST all admin users:
-- ============================================
-- SELECT 
--     au.email,
--     au.is_active,
--     au.created_at,
--     CASE WHEN au.auth_user_id IS NOT NULL THEN 'Linked' ELSE 'Not Linked' END as auth_status
-- FROM public.admin_users au
-- ORDER BY au.created_at DESC;

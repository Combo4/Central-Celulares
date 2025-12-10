-- ============================================
-- Link Admin User to Auth Account
-- ============================================
-- This script links your admin_users record with your auth.users account

-- First, let's see your auth user ID
SELECT id, email FROM auth.users WHERE email = 'alexander.frauenfeld@gmail.com';

-- Update the admin_users table with your auth_user_id
-- Replace 'YOUR_AUTH_USER_ID_HERE' with the actual ID from the query above
UPDATE public.admin_users
SET auth_user_id = (
    SELECT id FROM auth.users WHERE email = 'alexander.frauenfeld@gmail.com'
)
WHERE email = 'alexander.frauenfeld@gmail.com';

-- Verify the link was created
SELECT 
    au.email,
    au.auth_user_id,
    au.is_active,
    u.email as auth_email
FROM public.admin_users au
LEFT JOIN auth.users u ON au.auth_user_id = u.id
WHERE au.email = 'alexander.frauenfeld@gmail.com';

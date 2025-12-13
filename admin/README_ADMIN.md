# Admin Panel - Central Celulares

## 🔐 Security Features

The admin panel now includes **email authorization checks** to ensure only authorized administrators can access the system.

### How It Works

1. **Pre-Login Verification**: Before sending the OTP (One-Time Password), the system checks if the email exists in the `admin_users` database table.
2. **Active Status Check**: Only users with `is_active = true` can log in.
3. **Post-Login Verification**: After successful authentication, the system verifies admin status on every protected page.
4. **Auto-Logout**: If a user's admin status is revoked, they are automatically logged out.

## 🚫 Access Control

### What Happens When Non-Admin Tries to Login

When someone enters an email that is **not** in the admin_users table:

```
🚫 Acceso Denegado

Este correo no está clasificado para iniciar sesión.

Solo administradores autorizados pueden acceder al panel.
```

The OTP email is **NOT sent**, preventing unauthorized access attempts.

## 👥 Managing Admin Users

### Adding a New Admin User

#### Option 1: Using SQL (Recommended)

1. Open Supabase SQL Editor
2. Use the `add-admin-user.sql` script
3. Replace `new_admin@example.com` with the actual email
4. Run the script

```sql
-- Add new admin
INSERT INTO public.admin_users (email, is_active)
VALUES ('newadmin@example.com', true)
ON CONFLICT (email) DO UPDATE 
SET is_active = true;
```

#### Option 2: Using Supabase Dashboard

1. Go to **Table Editor** → `admin_users`
2. Click **Insert row**
3. Fill in:
   - `email`: The admin's email address
   - `is_active`: `true`
   - Leave `auth_user_id` as `NULL` (will be linked automatically on first login)
4. Click **Save**

### Deactivating an Admin User

To **temporarily** disable an admin without deleting them:

```sql
UPDATE public.admin_users
SET is_active = false
WHERE email = 'admin@example.com';
```

The user will be immediately logged out and cannot log back in until reactivated.

### Reactivating an Admin User

```sql
UPDATE public.admin_users
SET is_active = true
WHERE email = 'admin@example.com';
```

### Viewing All Admin Users

```sql
SELECT 
    au.email,
    au.is_active,
    au.created_at,
    CASE WHEN au.auth_user_id IS NOT NULL THEN 'Linked' ELSE 'Not Linked' END as auth_status
FROM public.admin_users au
ORDER BY au.created_at DESC;
```

## 🔄 Login Flow

### Email + OTP Link Method

1. User enters email on login page
2. **System checks** if email is in `admin_users` table with `is_active = true`
3. If **authorized**: OTP email is sent with magic link + 8-digit code
4. If **not authorized**: Error message shown, no email sent
5. User clicks link or enters code
6. System verifies admin status again before granting access

### 8-Digit Code Method

1. User enters email on login page
2. User enters 8-digit code received in previous email
3. **System checks** if email is in `admin_users` table
4. If **authorized**: Code is verified and user logs in
5. If **not authorized**: Error message shown

## 🛡️ Security Layers

The admin system has **three layers** of security:

### Layer 1: Pre-Login Email Verification
- Checks `admin_users` table before sending OTP
- Prevents unauthorized users from even receiving a login code

### Layer 2: OTP Verification
- Supabase Auth validates the one-time password
- Ensures the person has access to the email account

### Layer 3: Post-Login Admin Status Check
- Verifies admin status on protected pages
- Ensures deactivated admins are logged out immediately

## 📧 Email Requirements

### Authorized Email Format
- Must be a valid email address
- Must exist in `admin_users` table
- Must have `is_active = true`
- Must have `auth_user_id` linked (happens automatically after first login)

### Currently Authorized Admins

To see who can log in:
```sql
SELECT email FROM public.admin_users WHERE is_active = true;
```

## 🔧 Configuration

### Disabling Auth Check (Development Only)

In `admin/js/auth.js`, line 2:

```javascript
const DISABLE_AUTH_CHECK = false; // Set to true to bypass auth during testing
```

⚠️ **WARNING**: Never deploy with `DISABLE_AUTH_CHECK = true` in production!

## 📱 Login Methods

Users can log in using either:

1. **Magic Link**: Click the link in the email to log in instantly
2. **8-Digit Code**: Enter the code manually on the login page

Both methods require the email to be in the `admin_users` table.

## 🐛 Troubleshooting

### Problem: Admin can't log in

**Check:**
1. Email is spelled correctly
2. Email exists in `admin_users` table
   ```sql
   SELECT * FROM public.admin_users WHERE email = 'admin@example.com';
   ```
3. `is_active` is set to `true`
4. Supabase Auth is configured correctly

### Problem: "Este correo no está clasificado para iniciar sesión"

**Solution:** Add the email to the `admin_users` table:
```sql
INSERT INTO public.admin_users (email, is_active)
VALUES ('admin@example.com', true);
```

### Problem: User logged in but sees error on dashboard

**Solution:** Link the auth account:
```sql
UPDATE public.admin_users
SET auth_user_id = (
    SELECT id FROM auth.users WHERE email = 'admin@example.com'
)
WHERE email = 'admin@example.com';
```

## 📊 Database Schema

```sql
CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    auth_user_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Fields Explained

- `id`: Unique identifier for the admin record
- `email`: Admin's email address (must be unique)
- `auth_user_id`: Links to Supabase Auth user (set after first login)
- `is_active`: Controls whether the admin can log in
- `created_at`: When the admin was added
- `updated_at`: Last modification date

## 🔐 Best Practices

1. ✅ **Use strong email addresses** - Avoid generic emails like admin@domain.com
2. ✅ **Regularly review admin list** - Remove inactive admins
3. ✅ **Use `is_active = false`** instead of deleting admins (preserves audit trail)
4. ✅ **Monitor failed login attempts** - Check Supabase Auth logs
5. ✅ **Keep auth check enabled** in production
6. ✅ **Use environment variables** for sensitive config (never commit credentials)

## 🚀 Deployment Checklist

Before deploying to production:

- [ ] `DISABLE_AUTH_CHECK` is set to `false`
- [ ] All test admin accounts removed
- [ ] Production admin emails added to `admin_users` table
- [ ] Supabase RLS policies are enabled
- [ ] Auth redirect URLs are configured in Supabase
- [ ] Frontend URL is whitelisted in backend CORS

## 📞 Support

For issues with admin access:
1. Check Supabase Auth logs
2. Verify `admin_users` table entries
3. Check browser console for errors
4. Review this documentation

## 🔄 Version History

### v2.0 (Current)
- ✅ Added pre-login email verification
- ✅ Added post-login admin status check
- ✅ Improved error messages
- ✅ Added admin management SQL scripts
- ✅ Created comprehensive documentation

### v1.0
- Basic OTP authentication
- No email authorization checks

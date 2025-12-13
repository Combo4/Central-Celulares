-- ============================================
-- Central Celulares Database Setup
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Admin Users Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Products Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.products (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    price NUMERIC(10,2) NOT NULL,
    old_price NUMERIC(10,2),
    image TEXT,
    in_stock BOOLEAN DEFAULT true,
    category TEXT NOT NULL,
    badges JSONB DEFAULT '[]'::jsonb,
    specifications JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Site Configuration Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.site_config (
    id SERIAL PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    updated_by UUID REFERENCES public.admin_users(id),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 4. Audit Log Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.audit_log (
    id SERIAL PRIMARY KEY,
    admin_id UUID REFERENCES public.admin_users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id INTEGER,
    changes JSONB,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_in_stock ON public.products(in_stock);
CREATE INDEX IF NOT EXISTS idx_audit_log_admin_id ON public.audit_log(admin_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON public.audit_log(created_at);

-- ============================================
-- Row Level Security (RLS) Policies
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Products: Allow public read access, admin write access
CREATE POLICY "Anyone can view products"
    ON public.products FOR SELECT
    USING (true);

-- Note: Using email from JWT instead of auth_user_id for location independence
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

-- Admin Users: Allow checking admin status
-- Note: This allows anyone to read admin_users to check if an email is authorized
-- This is safe because:
-- 1. Only SELECT is allowed (read-only)
-- 2. Write operations still require admin privileges
-- 3. Needed for pre-login email verification and post-login status checks
CREATE POLICY "Anyone can check admin status by email"
    ON public.admin_users FOR SELECT
    TO anon, authenticated
    USING (true);

-- Site Config: Public read, admin write
CREATE POLICY "Anyone can view site config"
    ON public.site_config FOR SELECT
    USING (true);

CREATE POLICY "Admins can manage site config"
    ON public.site_config FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.admin_users
            WHERE email = auth.jwt()->>'email' AND is_active = true
        )
    );

-- Audit Log: Only admins can view
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
-- Insert Admin User (alexander.frauenfeld@gmail.com)
-- ============================================
-- Note: You need to get the auth_user_id from Supabase Auth after logging in
-- This will be populated automatically when the user logs in for the first time

-- For now, we'll insert a placeholder that will be updated on first login
INSERT INTO public.admin_users (email, is_active)
VALUES ('alexander.frauenfeld@gmail.com', true)
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- Functions for automatic timestamp updates
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_site_config_updated_at BEFORE UPDATE ON public.site_config
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Grant necessary permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================
-- Setup Complete!
-- ============================================

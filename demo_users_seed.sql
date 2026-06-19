-- ====================================================================
-- SEED DATA UNTUK USER DEMO (PENDAKI, GUIDE, VENDOR, SUPERADMIN)
-- JALANKAN SCRIPT INI DI SQL EDITOR SUPABASE ANDA
-- ====================================================================

-- 1. Tambah Data Users (pendaki, guide, vendor, admin)
-- Catatan: Login prototype hanya memvalidasi email, Anda bisa memasukkan password apa saja saat login.
INSERT INTO users (
    id, 
    name, 
    email, 
    role, 
    phone, 
    verified, 
    avatar, 
    status, 
    email_verified,
    bank_name,
    bank_account,
    bank_holder
) VALUES
(
    'demopendaki', 
    'Pendaki Demo (Zaki)', 
    'pendaki@demo.com', 
    'pendaki', 
    '081299990001', 
    TRUE, 
    'https://api.dicebear.com/7.x/avataaars/svg?seed=demopendaki', 
    'active', 
    TRUE,
    'BCA',
    '1234567890',
    'Pendaki Demo'
),
(
    'demoguide', 
    'Guide Demo (Ahmad)', 
    'guide@demo.com', 
    'guide', 
    '081299990002', 
    TRUE, 
    'https://api.dicebear.com/7.x/avataaars/svg?seed=demoguide', 
    'active', 
    TRUE,
    'Mandiri',
    '900123456789',
    'Guide Demo'
),
(
    'demovendor', 
    'Vendor Demo Store', 
    'vendor@demo.com', 
    'vendor', 
    '081299990003', 
    TRUE, 
    'https://api.dicebear.com/7.x/identicon/svg?seed=demovendor', 
    'active', 
    TRUE,
    'BNI',
    '827123456789',
    'Vendor Demo'
),
(
    'demoadmin', 
    'Superadmin Demo', 
    'admin@demo.com', 
    'admin', 
    '081299990004', 
    TRUE, 
    'https://api.dicebear.com/7.x/bottts/svg?seed=demoadmin', 
    'active', 
    TRUE,
    NULL,
    NULL,
    NULL
)
ON CONFLICT (id) DO UPDATE SET 
    email_verified = TRUE,
    verified = TRUE,
    status = 'active';

-- 2. Inisialisasi Saldo Dompet (Wallets)
INSERT INTO wallets (user_id, balance) VALUES
('demopendaki', 500000),  -- Saldo jaminan awal Rp 500.000
('demoguide', 1000000),   -- Saldo awal Rp 1.000.000
('demovendor', 1500000)   -- Saldo awal Rp 1.500.000
ON CONFLICT (user_id) DO UPDATE SET balance = EXCLUDED.balance;

-- 3. Inisialisasi Profil Khusus Guide
INSERT INTO guides (
    id, 
    specialty, 
    location, 
    experience, 
    trips, 
    rating, 
    price, 
    certifications, 
    status, 
    specialty_mountains, 
    busy_dates, 
    group_discount_enabled, 
    coupon_code, 
    coupon_discount, 
    coupon_deadline
) VALUES (
    'demoguide', 
    'Gunung Semeru', 
    'Kota Malang, Jawa Timur', 
    '5 Tahun', 
    12, 
    4.90, 
    400000, 
    ARRAY['Sertifikasi APIGI', 'Pertolongan Pertama'], 
    'Aktif', 
    ARRAY['Gunung Semeru', 'Gunung Bromo'], 
    '{}', 
    FALSE, 
    'DEMOGUIDE', 
    50000, 
    '2026-12-31'
)
ON CONFLICT (id) DO UPDATE SET 
    specialty = EXCLUDED.specialty,
    experience = EXCLUDED.experience,
    price = EXCLUDED.price,
    coupon_code = EXCLUDED.coupon_code,
    coupon_discount = EXCLUDED.coupon_discount,
    coupon_deadline = EXCLUDED.coupon_deadline;

-- 4. Inisialisasi Profil Khusus Vendor
INSERT INTO vendors (
    id, 
    location, 
    distances, 
    coupon_code, 
    coupon_discount, 
    coupon_deadline
) VALUES (
    'demovendor', 
    'Kota Malang, Jawa Timur', 
    '{}'::jsonb, 
    'DEMOVENDOR', 
    25000, 
    '2026-12-31'
)
ON CONFLICT (id) DO UPDATE SET 
    location = EXCLUDED.location,
    coupon_code = EXCLUDED.coupon_code,
    coupon_discount = EXCLUDED.coupon_discount,
    coupon_deadline = EXCLUDED.coupon_deadline;

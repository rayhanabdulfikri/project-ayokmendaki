-- ==========================================
-- AYOKMENDAKI DATABASE SCHEMA & SEED DATA
-- FOR SUPABASE POSTGRESQL
-- ==========================================

-- Clean up existing tables (drop in correct order to handle foreign keys)
DROP TABLE IF EXISTS user_activities CASCADE;
DROP TABLE IF EXISTS collaboration_proposals CASCADE;
DROP TABLE IF EXISTS user_warnings CASCADE;
DROP TABLE IF EXISTS deposit_transactions CASCADE;
DROP TABLE IF EXISTS wallets CASCADE;
DROP TABLE IF EXISTS verification_requests CASCADE;
DROP TABLE IF EXISTS chat_messages CASCADE;
DROP TABLE IF EXISTS negotiations CASCADE;
DROP TABLE IF EXISTS rental_orders CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS trip_packages CASCADE;
DROP TABLE IF EXISTS equipment_items CASCADE;
DROP TABLE IF EXISTS vendors CASCADE;
DROP TABLE IF EXISTS guides CASCADE;
DROP TABLE IF EXISTS mountains CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS TABLE
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Supports text IDs like 'pendaki1' or Supabase Auth UUIDs
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('pendaki', 'guide', 'vendor', 'admin')),
    phone TEXT,
    verified BOOLEAN DEFAULT FALSE,
    avatar TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. MOUNTAINS TABLE
CREATE TABLE mountains (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    name TEXT UNIQUE NOT NULL,
    location TEXT NOT NULL,
    province TEXT NOT NULL,
    elevation TEXT NOT NULL,
    elevation_m INTEGER NOT NULL,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Mudah', 'Sedang', 'Sulit')),
    image TEXT NOT NULL,
    rating NUMERIC(3,2) DEFAULT 0.0,
    reviews INTEGER DEFAULT 0,
    lat NUMERIC(10, 8) NOT NULL,
    lng NUMERIC(11, 8) NOT NULL,
    status TEXT DEFAULT 'Buka' CHECK (status IN ('Buka', 'Tutup')),
    ticket_price NUMERIC DEFAULT 0,
    admin_contact_method TEXT CHECK (admin_contact_method IN ('Instagram', 'Website Resmi', 'WhatsApp')),
    admin_contact_value TEXT NOT NULL,
    basecamps TEXT[] DEFAULT '{}'::TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. GUIDES TABLE (Profile details linked to Users)
CREATE TABLE guides (
    id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    specialty TEXT NOT NULL,
    location TEXT NOT NULL,
    experience TEXT NOT NULL,
    trips INTEGER DEFAULT 0,
    rating NUMERIC(3,2) DEFAULT 0.0,
    price NUMERIC DEFAULT 0,
    certifications TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Libur', 'Non-Aktif')),
    specialty_mountains TEXT[] DEFAULT '{}'::TEXT[],
    busy_dates DATE[] DEFAULT '{}'::DATE[],
    group_discount_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. VENDORS TABLE (Profile details linked to Users)
CREATE TABLE vendors (
    id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    location TEXT NOT NULL,
    distances JSONB DEFAULT '{}'::jsonb, -- Store distance to different mountains as key-value pairs
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. EQUIPMENT ITEMS TABLE (Vendor Inventory)
CREATE TABLE equipment_items (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price NUMERIC NOT NULL,
    vendor_id TEXT REFERENCES vendors(id) ON DELETE CASCADE,
    rating NUMERIC(3,2) DEFAULT 5.0,
    available INTEGER DEFAULT 0,
    category TEXT CHECK (category IN ('tent', 'carrier', 'other')),
    group_discount_enabled BOOLEAN DEFAULT FALSE,
    damage_terms TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TRIP PACKAGES TABLE
CREATE TABLE trip_packages (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    guide_id TEXT REFERENCES guides(id) ON DELETE CASCADE,
    vendor_id TEXT REFERENCES vendors(id) ON DELETE SET NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    price NUMERIC NOT NULL,
    promo_deadline DATE NOT NULL,
    services TEXT[] DEFAULT '{}'::TEXT[],
    rundown TEXT[] DEFAULT '{}'::TEXT[],
    image TEXT NOT NULL,
    target_mountain TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. BOOKINGS TABLE (Mountain and Guide Bookings)
CREATE TABLE bookings (
    id TEXT PRIMARY KEY,
    mountain_name TEXT NOT NULL,
    basecamp TEXT,
    guide_id TEXT REFERENCES guides(id) ON DELETE SET NULL,
    pendaki_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    booking_date DATE NOT NULL,
    price NUMERIC NOT NULL,
    status TEXT DEFAULT 'Menunggu Konfirmasi' CHECK (status IN (
        'Menunggu Konfirmasi', 'Menunggu Pembayaran', 'Telah Dibayar', 
        'Start', 'Muncak', 'Selesai', 'Dibatalkan', 'Dispute'
    )),
    dispute_notes TEXT,
    official_ticket_booking BOOLEAN DEFAULT FALSE,
    booking_type TEXT NOT NULL CHECK (booking_type IN ('mandiri', 'paket')),
    package_id TEXT REFERENCES trip_packages(id) ON DELETE SET NULL,
    pre_trip_meeting_date DATE,
    pre_trip_meeting_time TEXT,
    pre_trip_meeting_link TEXT,
    climbers_count INTEGER DEFAULT 1,
    deposit_amount NUMERIC DEFAULT 0,
    deposit_status TEXT DEFAULT 'held' CHECK (deposit_status IN ('held', 'refunded', 'forfeited', 'partially_refunded')),
    fine_amount NUMERIC DEFAULT 0,
    fine_notes TEXT,
    pendaki_confirmed BOOLEAN DEFAULT FALSE,
    partner_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. RENTAL ORDERS TABLE
CREATE TABLE rental_orders (
    id TEXT PRIMARY KEY,
    item_id TEXT REFERENCES equipment_items(id) ON DELETE CASCADE,
    vendor_id TEXT REFERENCES vendors(id) ON DELETE CASCADE,
    pendaki_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    qty INTEGER NOT NULL DEFAULT 1,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_price NUMERIC NOT NULL,
    status TEXT DEFAULT 'Menunggu Konfirmasi' CHECK (status IN (
        'Menunggu Konfirmasi', 'Menunggu Pembayaran', 'Telah Dibayar', 
        'Siap Diambil', 'Sedang Disewa', 'Selesai', 'Dibatalkan', 'Dispute'
    )),
    dispute_notes TEXT,
    deposit_amount NUMERIC DEFAULT 0,
    deposit_status TEXT DEFAULT 'held' CHECK (deposit_status IN ('held', 'refunded', 'forfeited', 'partially_refunded')),
    fine_amount NUMERIC DEFAULT 0,
    fine_notes TEXT,
    pendaki_confirmed BOOLEAN DEFAULT FALSE,
    partner_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 9. NEGOTIATIONS TABLE
CREATE TABLE negotiations (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('guide', 'rental')),
    order_id TEXT NOT NULL, -- references booking id or rental order id
    item_name TEXT NOT NULL,
    original_price NUMERIC NOT NULL,
    proposed_price NUMERIC NOT NULL,
    sender_name TEXT NOT NULL,
    recipient_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    recipient_name TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'countered')),
    counter_price NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 10. CHAT MESSAGES TABLE
CREATE TABLE chat_messages (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    sender_name TEXT NOT NULL,
    chat_partner_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    chat_partner_name TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TEXT NOT NULL, -- Matches application representation, e.g., '18:30'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 11. VERIFICATION REQUESTS TABLE (For Guides and Vendors)
CREATE TABLE verification_requests (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('guide', 'vendor')),
    document_name TEXT NOT NULL,
    document_image TEXT NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at DATE NOT NULL DEFAULT CURRENT_DATE
);

-- 12. WALLETS TABLE
CREATE TABLE wallets (
    user_id TEXT PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    balance NUMERIC DEFAULT 0 NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 13. DEPOSIT TRANSACTIONS TABLE (Wallet History)
CREATE TABLE deposit_transactions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('topup', 'withdraw', 'refund', 'fine_deduction')),
    amount NUMERIC NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 14. USER WARNINGS TABLE
CREATE TABLE user_warnings (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 15. COLLABORATION PROPOSALS TABLE (Between Guides and Vendors)
CREATE TABLE collaboration_proposals (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    guide_id TEXT REFERENCES guides(id) ON DELETE CASCADE,
    guide_name TEXT NOT NULL,
    vendor_id TEXT REFERENCES vendors(id) ON DELETE CASCADE,
    vendor_name TEXT NOT NULL,
    description TEXT NOT NULL,
    duration TEXT NOT NULL,
    price NUMERIC NOT NULL,
    target_mountain TEXT NOT NULL,
    rental_mechanism TEXT NOT NULL,
    bundled_equipment_ids TEXT[] DEFAULT '{}'::TEXT[],
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    sender_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 16. USER ACTIVITIES TABLE (Logs)
CREATE TABLE user_activities (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    user_name TEXT NOT NULL,
    user_role TEXT NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================
-- SEED DATA INJECTION (INITIAL MOCK DATA)
-- ==========================================

-- 1. Insert Users (Pendaki, Guides, Vendors, Admin)
INSERT INTO users (id, name, email, role, phone, verified, avatar, status) VALUES
('pendaki1', 'Zaki Firdaus', 'zaki@ayokmendaki.com', 'pendaki', '08123456789', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Zaki', 'active'),
('guide1', 'Ahmad Hidayat', 'ahmad@ayokmendaki.com', 'guide', '08234567890', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad', 'active'),
('guide2', 'Budi Santoso', 'budi@ayokmendaki.com', 'guide', '08123456701', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi', 'active'),
('guide3', 'Candra Wijaya', 'candra@ayokmendaki.com', 'guide', '08123456702', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Candra', 'active'),
('guide4', 'Doni Prasetyo', 'doni@ayokmendaki.com', 'guide', '08123456703', FALSE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Doni', 'active'),
('guide5', 'Eko Wahyudi', 'eko@ayokmendaki.com', 'guide', '08123456704', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Eko', 'active'),
('guide6', 'Fajar Pratama', 'fajar@ayokmendaki.com', 'guide', '08123456705', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fajar', 'active'),
('guide7', 'Gilang Ramadhan', 'gilang@ayokmendaki.com', 'guide', '08123456706', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Gilang', 'active'),
('guide8', 'Hendra Wijaya', 'hendra@ayokmendaki.com', 'guide', '08123456707', TRUE, 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hendra', 'active'),
('vendor1', 'Outdoor Adventure Store', 'outdoor@ayokmendaki.com', 'vendor', '08345678901', TRUE, 'https://api.dicebear.com/7.x/identicon/svg?seed=outdoor', 'active'),
('vendor2', 'Summit Gear Rental', 'summit@ayokmendaki.com', 'vendor', '08345678902', TRUE, 'https://api.dicebear.com/7.x/identicon/svg?seed=summit', 'active'),
('vendor3', 'Mountain Camp Store', 'mountain@ayokmendaki.com', 'vendor', '08345678903', TRUE, 'https://api.dicebear.com/7.x/identicon/svg?seed=mountain', 'active'),
('vendor4', 'Cianjur Lestari Rental', 'cianjur@ayokmendaki.com', 'vendor', '08345678904', FALSE, 'https://api.dicebear.com/7.x/identicon/svg?seed=cianjur', 'active'),
('admin1', 'Super Admin', 'admin@ayokmendaki.com', 'admin', '08567890123', TRUE, 'https://api.dicebear.com/7.x/bottts/svg?seed=admin', 'active');

-- 2. Insert Wallet Balances for Users
INSERT INTO wallets (user_id, balance) VALUES
('pendaki1', 500000),
('guide1', 1500000),
('vendor1', 2000000),
('guide2', 0),
('guide3', 0),
('guide4', 0),
('guide5', 0),
('guide6', 0),
('guide7', 0),
('guide8', 0),
('vendor2', 0),
('vendor3', 0),
('vendor4', 0);

-- 3. Insert Mountains
INSERT INTO mountains (name, location, province, elevation, elevation_m, difficulty, image, rating, reviews, lat, lng, status, ticket_price, admin_contact_method, admin_contact_value, basecamps) VALUES
('Gunung Semeru', 'Jawa Timur', 'Jawa Timur', '3.676 mdpl', 3676, 'Sulit', 'https://images.unsplash.com/photo-1605860632725-fa88d0ce7a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.8, 2341, -8.1077, 112.9224, 'Buka', 35000, 'Instagram', '@semeru_official', ARRAY['Ranupani']),
('Gunung Rinjani', 'Lombok, NTB', 'NTB', '3.726 mdpl', 3726, 'Sulit', 'https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.9, 1876, -8.4119, 116.4675, 'Buka', 150000, 'Website Resmi', 'https://bookingrinjani.id', ARRAY['Sembalun', 'Senaru', 'Timbanuh', 'Aik Berik']),
('Gunung Bromo', 'Jawa Timur', 'Jawa Timur', '2.329 mdpl', 2329, 'Mudah', 'https://images.unsplash.com/photo-1587651687979-77cf05d1b841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.7, 3210, -7.9425, 112.9530, 'Tutup', 29000, 'Website Resmi', 'https://bookingbromo.id', ARRAY['Cemoro Lawang', 'Tosari', 'Ngadas', 'Tumpang']),
('Gunung Prau', 'Jawa Tengah', 'Jawa Tengah', '2.565 mdpl', 2565, 'Sedang', 'https://images.unsplash.com/photo-1568516475772-498b4379829c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.6, 1543, -7.1884, 109.9219, 'Buka', 20000, 'WhatsApp', '+628123456789', ARRAY['Patakbanteng', 'Dieng', 'Kalilembu', 'Wates', 'Igirmranak']),
('Gunung Merbabu', 'Jawa Tengah', 'Jawa Tengah', '3.145 mdpl', 3145, 'Sedang', 'https://images.unsplash.com/photo-1562157778-81d81be57eec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.7, 1987, -7.4549, 110.4332, 'Buka', 25000, 'Website Resmi', 'https://tngmerbabu.id', ARRAY['Selo', 'Suwanting', 'Wekas', 'Cuntel', 'Thekelan']),
('Gunung Gede Pangrango', 'Jawa Barat', 'Jawa Barat', '2.958 mdpl', 2958, 'Sedang', 'https://images.unsplash.com/photo-1510797215324-95aa89f43c33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.5, 2156, -6.7893, 106.9852, 'Buka', 29000, 'Instagram', '@gedepangrango_official', ARRAY['Cibodas', 'Gunung Putri', 'Selabintana']),
('Gunung Slamet', 'Jawa Tengah', 'Jawa Tengah', '3.428 mdpl', 3428, 'Sulit', 'https://images.unsplash.com/photo-1629814249584-bd4d53cf0ee3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.6, 1421, -7.2424, 109.2248, 'Buka', 30000, 'Instagram', '@slamet_official', ARRAY['Bambangan', 'Guci', 'Kaliwadas', 'Baturraden', 'Dipajaya']),
('Gunung Sindoro', 'Jawa Tengah', 'Jawa Tengah', '3.136 mdpl', 3136, 'Sedang', 'https://images.unsplash.com/photo-1600100397608-f010e9723049?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.7, 1120, -7.3016, 109.9972, 'Buka', 25000, 'Website Resmi', 'https://bookingsindoro.id', ARRAY['Kledung', 'Alang-alang Sewu', 'Bansari', 'Sigedang']),
('Gunung Sumbing', 'Jawa Tengah', 'Jawa Tengah', '3.371 mdpl', 3371, 'Sulit', 'https://images.unsplash.com/photo-1620921008688-6f6eb3df2d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.8, 980, -7.3838, 110.0728, 'Buka', 25000, 'Instagram', '@sumbing_official', ARRAY['Garung', 'Bowongso', 'Sipetung', 'Mangli', 'Adipuro']),
('Gunung Lawu', 'Jawa Tengah/Timur', 'Jawa Tengah', '3.265 mdpl', 3265, 'Sedang', 'https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.8, 1860, -7.6258, 111.1947, 'Buka', 20000, 'Website Resmi', 'https://bookinglawu.id', ARRAY['Cemoro Sewu', 'Cemoro Kandang', 'Candi Cetho', 'Singolangu']),
('Gunung Papandayan', 'Garut, Jawa Barat', 'Jawa Barat', '2.665 mdpl', 2665, 'Mudah', 'https://images.unsplash.com/photo-1596464716127-f2a82984de30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.6, 2210, -7.3197, 107.7288, 'Buka', 35000, 'WhatsApp', '+628765432100', ARRAY['Camp David']),
('Gunung Merapi', 'Sleman, Yogyakarta', 'Yogyakarta', '2.910 mdpl', 2910, 'Sedang', 'https://images.unsplash.com/photo-1580137189272-c9379f8864fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 4.5, 1980, -7.5407, 110.4458, 'Tutup', 20000, 'Website Resmi', 'https://tngmerapi.id', ARRAY['Selo', 'Plunyon']);

-- 4. Insert Guides Profiles
INSERT INTO guides (id, specialty, location, experience, trips, rating, price, certifications, status, specialty_mountains, busy_dates) VALUES
('guide1', 'Gunung Semeru & Bromo', 'Malang, Jawa Timur', '8 Tahun', 245, 4.9, 500000, ARRAY['APIGI', 'Pertolongan Pertama'], 'Aktif', ARRAY['Gunung Semeru', 'Gunung Bromo'], ARRAY['2026-07-15'::DATE, '2026-07-20'::DATE]),
('guide2', 'Gunung Rinjani', 'Lombok, NTB', '10 Tahun', 312, 5.0, 650000, ARRAY['APIGI', 'HPI'], 'Libur', ARRAY['Gunung Rinjani'], ARRAY['2026-07-18'::DATE]),
('guide3', 'Pendakian Jawa Tengah', 'Magelang, Jawa Tengah', '6 Tahun', 178, 4.8, 450000, ARRAY['APIGI'], 'Non-Aktif', ARRAY['Gunung Prau', 'Gunung Merbabu'], '{}'::DATE[]),
('guide4', 'Semua Gunung di Indonesia', 'Bogor, Jawa Barat', '7 Tahun', 198, 4.7, 400000, ARRAY['APIGI', 'SAR'], 'Aktif', ARRAY['Semua Gunung'], ARRAY['2026-07-10'::DATE]),
('guide5', 'Gunung Slamet & Sindoro', 'Wonosobo, Jawa Tengah', '5 Tahun', 112, 4.8, 450000, ARRAY['APIGI'], 'Aktif', ARRAY['Gunung Slamet', 'Gunung Sindoro'], '{}'::DATE[]),
('guide6', 'Gunung Lawu & Sumbing', 'Solo, Jawa Tengah', '9 Tahun', 220, 4.9, 500000, ARRAY['APIGI', 'HPI'], 'Aktif', ARRAY['Gunung Lawu', 'Gunung Sumbing'], '{}'::DATE[]),
('guide7', 'Gunung Papandayan & Gede', 'Bandung, Jawa Barat', '4 Tahun', 88, 4.7, 400000, ARRAY['APIGI'], 'Aktif', ARRAY['Gunung Papandayan', 'Gunung Gede Pangrango'], '{}'::DATE[]),
('guide8', 'Gunung Rinjani & Semeru', 'Surabaya, Jawa Timur', '12 Tahun', 410, 5.0, 700000, ARRAY['APIGI', 'SAR', 'HPI'], 'Aktif', ARRAY['Gunung Rinjani', 'Gunung Semeru'], '{}'::DATE[]);

-- 5. Insert Vendors Profiles
INSERT INTO vendors (id, location, distances) VALUES
('vendor1', 'Malang, Jawa Timur', '{"Gunung Semeru": 3.5, "Gunung Bromo": 8.0, "Gunung Rinjani": 380, "Gunung Prau": 350, "Gunung Merbabu": 320, "Gunung Gede Pangrango": 710, "Gunung Slamet": 310, "Gunung Sindoro": 280, "Gunung Sumbing": 270, "Gunung Lawu": 180, "Gunung Papandayan": 610, "Gunung Merapi": 290}'),
('vendor2', 'Lombok, NTB', '{"Gunung Rinjani": 2.1, "Gunung Semeru": 340, "Gunung Bromo": 330, "Gunung Prau": 420, "Gunung Merbabu": 410, "Gunung Gede Pangrango": 890, "Gunung Slamet": 480, "Gunung Sindoro": 450, "Gunung Sumbing": 440, "Gunung Lawu": 350, "Gunung Papandayan": 820, "Gunung Merapi": 400}'),
('vendor3', 'Wonosobo, Jawa Tengah', '{"Gunung Prau": 9.2, "Gunung Merbabu": 28.0, "Gunung Semeru": 280, "Gunung Bromo": 270, "Gunung Rinjani": 520, "Gunung Gede Pangrango": 310, "Gunung Slamet": 45, "Gunung Sindoro": 15, "Gunung Sumbing": 25, "Gunung Lawu": 120, "Gunung Papandayan": 240, "Gunung Merapi": 65}'),
('vendor4', 'Cianjur, Jawa Barat', '{"Gunung Gede Pangrango": 5.4, "Gunung Prau": 290, "Gunung Semeru": 690, "Gunung Bromo": 680, "Gunung Rinjani": 910, "Gunung Merbabu": 410, "Gunung Slamet": 240, "Gunung Sindoro": 270, "Gunung Sumbing": 280, "Gunung Lawu": 380, "Gunung Papandayan": 72, "Gunung Merapi": 300}');

-- 6. Insert Equipment Items (Inventory)
INSERT INTO equipment_items (id, name, description, price, vendor_id, rating, available, category, group_discount_enabled, damage_terms) VALUES
('eq1', 'Tenda Dome 4 Orang', 'Kapasitas 4 orang, waterproof, mudah dipasang', 75000, 'vendor1', 4.8, 5, 'tent', FALSE, NULL),
('eq2', 'Tenda Ultralight 2 Orang', 'Ringan, compact, ideal untuk pendakian solo/duo', 50000, 'vendor2', 4.9, 8, 'tent', FALSE, NULL),
('eq3', 'Tenda Keluarga 6 Orang', 'Kapasitas besar, double layer, ventilasi baik', 100000, 'vendor3', 4.7, 3, 'tent', FALSE, NULL),
('eq4', 'Carrier 60L', 'Kapasitas besar, ergonomis, raincover included', 40000, 'vendor2', 4.7, 12, 'carrier', FALSE, NULL),
('eq5', 'Carrier 50L', 'Medium size, cocok untuk 2-3 hari pendakian', 35000, 'vendor3', 4.6, 15, 'carrier', FALSE, NULL),
('eq6', 'Sleeping Bag -5°C', 'Tahan suhu -5°C, ringan dan hangat', 30000, 'vendor3', 4.8, 20, 'other', FALSE, NULL),
('eq7', 'Kompor Camping + Gas', 'Kompor portable dengan tabung gas 230gr', 25000, 'vendor2', 4.7, 18, 'other', FALSE, NULL),
('eq8', 'Trekking Pole Set', 'Adjustable, anti-slip grip, aluminium', 25000, 'vendor3', 4.5, 15, 'other', FALSE, NULL),
('eq9', 'Cooking Set Nesting', 'Panci camping anti lengket, 1 set isi 4 item', 20000, 'vendor1', 4.8, 10, 'other', FALSE, NULL),
('eq10', 'Headlamp LED Rechargeable', 'Lampu kepala rechargeable, waterproof, 3 mode sinar', 15000, 'vendor3', 4.7, 25, 'other', FALSE, NULL),
('eq11', 'Jaket Windbreaker TNF', 'Jaket windproof & waterproof untuk cuaca dingin', 35000, 'vendor3', 4.6, 12, 'other', FALSE, NULL),
('eq12', 'Matras Angin Eiger', 'Kasur angin tiup manual, empuk & menahan dingin tanah', 20000, 'vendor2', 4.9, 10, 'other', FALSE, NULL),
('eq13', 'Flysheet 3x4 meter', 'Tenda peneduh anti air pelindung tenda utama', 15000, 'vendor1', 4.7, 8, 'other', FALSE, NULL),
('eq14', 'Sleeping Pad Foam', 'Matras busa lipat aluminium foil pemantul panas tubuh', 10000, 'vendor3', 4.5, 30, 'other', FALSE, NULL),
('eq15', 'Portable Gas Refill 230g', 'Tabung gas butana portable untuk memasak', 10000, 'vendor2', 4.8, 50, 'other', FALSE, NULL),
('eq16', 'Peta Navigasi & Kompas', 'Kompas bidik militer beserta peta topografi', 15000, 'vendor3', 4.6, 5, 'other', FALSE, NULL),
('eq17', 'First Aid Kit (P3K) Lengkap', 'Kotak obat standar pendakian dengan perban & antiseptik', 10000, 'vendor3', 4.9, 20, 'other', FALSE, NULL),
('eq18', 'Sepatu Trekking Size 42', 'Sepatu hiking grip kuat, anti selip & water resistant', 50000, 'vendor1', 4.7, 4, 'other', FALSE, NULL);

-- 7. Insert Trip Packages
INSERT INTO trip_packages (id, title, guide_id, vendor_id, description, duration, price, promo_deadline, services, rundown, image, target_mountain) VALUES
('pkg1', 'Paket Rinjani Summit Premium (All-In)', 'guide2', 'vendor2', 'Paket pendakian Rinjani premium lengkap dengan tenda ultralight, makanan mewah selama pendakian, porter tim, dan transportasi PP dari Bandara Lombok.', '3 Hari 2 Malam', 1850000, '2026-07-01', ARRAY['Simaksi & Asuransi Rinjani', 'Tenda Ultralight Double Layer', 'Menu Makan Premium 3x sehari', 'Transport Bandara PP Lombok', 'Sleeping Bag & Matras Angin'], ARRAY['Hari 1: Penjemputan di Bandara, perjalanan ke Sembalun, trekking ke Crater Rim Sembalun', 'Hari 2: Summit Attack 3726m, turun ke Segara Anak (Mancing & Berendam Air Panas)', 'Hari 3: Trekking naik ke Senaru Rim, turun ke basecamp Senaru, transfer Bandara'], 'https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 'Gunung Rinjani'),
('pkg2', 'Paket Hemat Prau Sunrise Trip', 'guide3', 'vendor3', 'Nikmati keindahan sunrise terbaik se-Jawa di Puncak Gunung Prau Dieng. Paket hemat sudah termasuk guide berlisensi, perlengkapan tidur hangat, dan dokumentasi puncak.', '2 Hari 1 Malam', 650000, '2026-06-30', ARRAY['Simaksi Prau', 'Guide Berlisensi APIGI', 'Sleeping Bag Hangat', 'Tenda Dome Sharing', 'Makan Malam & Sarapan Hangat'], ARRAY['Hari 1: Trekking santai lewat Patak Banteng ke Area Camp, hunting Sunset', 'Hari 2: Menikmati Golden Sunrise di sunrise point Prau, sarapan, trekking turun kembali'], 'https://images.unsplash.com/photo-1568516475772-498b4379829c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600', 'Gunung Prau');

-- 8. Insert Bookings
INSERT INTO bookings (id, mountain_name, basecamp, guide_id, pendaki_id, booking_date, price, status, official_ticket_booking, booking_type, package_id, pre_trip_meeting_date, pre_trip_meeting_time, pre_trip_meeting_link, climbers_count, deposit_amount, deposit_status, fine_amount, fine_notes, pendaki_confirmed, partner_confirmed) VALUES
('book_mock1', 'Gunung Semeru', 'Ranupani', 'guide1', 'pendaki1', '2026-07-10', 500000, 'Telah Dibayar', FALSE, 'mandiri', NULL, '2026-07-09', '19:00 - 19:30', 'https://meet.google.com/abc-defg-hij', 1, 100000, 'held', 0, NULL, FALSE, FALSE),
('book_mock2', 'Gunung Semeru', 'Ranupani', NULL, 'pendaki1', '2026-07-10', 35000, 'Telah Dibayar', TRUE, 'mandiri', NULL, NULL, NULL, NULL, 1, 100000, 'held', 0, NULL, FALSE, FALSE);

-- 9. Insert Rental Orders
INSERT INTO rental_orders (id, item_id, vendor_id, pendaki_id, qty, start_date, end_date, total_price, status, deposit_amount, deposit_status) VALUES
('rent_mock1', 'eq1', 'vendor1', 'pendaki1', 2, '2026-07-09', '2026-07-12', 450000, 'Menunggu Konfirmasi', 100000, 'held');

-- 10. Insert Negotiations
INSERT INTO negotiations (id, type, order_id, item_name, original_price, proposed_price, sender_name, recipient_id, recipient_name, status, counter_price, notes) VALUES
('nego_mock1', 'rental', 'rent_mock1', 'Tenda Dome 4 Orang (2 Pcs, 3 Hari)', 450000, 380000, 'Zaki Firdaus', 'vendor1', 'Outdoor Adventure Store', 'pending', NULL, NULL);

-- 11. Insert Chat Messages
INSERT INTO chat_messages (id, sender_id, sender_name, chat_partner_id, chat_partner_name, message, timestamp) VALUES
('chat_mock1', 'pendaki1', 'Zaki Firdaus', 'guide1', 'Ahmad Hidayat', 'Halo mas Ahmad, ready buat tanggal 10 Juli nanti ke Semeru?', '18:30'),
('chat_mock2', 'guide1', 'Ahmad Hidayat', 'pendaki1', 'Zaki Firdaus', 'Halo mas! Siap, jadwal saya kosong tanggal segitu. Silakan diajukan booking ya.', '18:32');

-- 12. Insert Verification Requests
INSERT INTO verification_requests (id, user_id, user_name, role, document_name, document_image, status, created_at) VALUES
('ver_mock1', 'guide4', 'Doni Prasetyo', 'guide', 'Sertifikasi APIGI & SAR', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400', 'pending', '2026-06-15'::DATE);

-- 13. Insert User Warnings
-- None initially

-- 14. Insert Collaboration Proposals
-- None initially

-- 15. Insert Deposit Transactions
INSERT INTO deposit_transactions (id, user_id, type, amount, description, created_at) VALUES
('tx_mock1', 'pendaki1', 'topup', 500000, 'Saldo awal deposit jaminan', '2026-06-15 10:00'::timestamp);

-- 16. Insert User Activities
INSERT INTO user_activities (id, user_id, user_name, user_role, action, timestamp) VALUES
('act_1', 'pendaki1', 'Zaki Firdaus', 'pendaki', 'Membuka aplikasi & Login', '2026-06-17 08:15'::timestamp),
('act_2', 'guide1', 'Ahmad Hidayat', 'guide', 'Mengubah status jadwal trip Semeru menjadi Start', '2026-06-17 07:45'::timestamp),
('act_3', 'vendor1', 'Outdoor Adventure Store', 'vendor', 'Memperbarui stok Tenda Dome 4 Orang menjadi 15 unit', '2026-06-16 16:30'::timestamp),
('act_4', 'pendaki1', 'Zaki Firdaus', 'pendaki', 'Melakukan Top Up Saldo Rp 200.000 via Gopay', '2026-06-16 11:20'::timestamp),
('act_5', 'guide2', 'Budi Santoso', 'guide', 'Menolak proposal kolaborasi dari Summit Gear Rental', '2026-06-15 15:10'::timestamp);

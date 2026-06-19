-- ====================================================================
-- AYOKMENDAKI DATABASE SCHEMA UPGRADE (UPDATED)
-- RUN THIS SCRIPT IN YOUR SUPABASE SQL EDITOR TO SUPPORT NEW FEATURES
-- ====================================================================

-- 1. Alter users table to support email verification and bank details
ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_holder TEXT;

-- 2. Alter guides table to support custom discounts, biodata, ketentuan, and coupons
ALTER TABLE guides ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS biodata TEXT;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS ketentuan TEXT;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS coupon_discount INTEGER DEFAULT 0;
ALTER TABLE guides ADD COLUMN IF NOT EXISTS coupon_deadline TEXT;

-- 3. Alter equipment_items table to support custom discounts
ALTER TABLE equipment_items ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0;

-- 4. Alter vendors table to support promo coupon codes with deadlines
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS coupon_discount INTEGER DEFAULT 0;
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS coupon_deadline TEXT;

-- 5. Alter bookings table to support custom checkout notes
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;

-- 6. Alter rental_orders table to support custom checkout notes
ALTER TABLE rental_orders ADD COLUMN IF NOT EXISTS notes TEXT;

-- 7. Alter trip_packages table to support advertisement approval status
ALTER TABLE trip_packages ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

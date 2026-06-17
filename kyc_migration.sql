-- ==================================================
-- AYOKMENDAKI KYC DATABASE MIGRATION SCRIPT
-- ==================================================

-- 1. Alter users table to support KYC columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS ktp_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS ktp_image TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS selfie_image TEXT;

-- 2. Alter verification_requests table to support KYC columns
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS ktp_number TEXT;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS ktp_image TEXT;
ALTER TABLE verification_requests ADD COLUMN IF NOT EXISTS selfie_image TEXT;

-- 3. Update verification_requests role constraint to support 'pendaki' KYC validation
ALTER TABLE verification_requests DROP CONSTRAINT IF EXISTS verification_requests_role_check;
ALTER TABLE verification_requests ADD CONSTRAINT verification_requests_role_check CHECK (role IN ('pendaki', 'guide', 'vendor'));

-- ====================================================================
-- AYOKMENDAKI SUPABASE STORAGE SETUP FOR KYC DOCUMENTS
-- ====================================================================
-- Jalankan skrip ini di SQL Editor Supabase Dashboard Anda untuk 
-- membuat bucket 'kyc_document' dan mengatur kebijakan aksesnya (RLS).
-- ====================================================================

-- 1. Membuat bucket 'kyc_document' secara publik jika belum ada
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc_document', 'kyc_document', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Memastikan Row Level Security (RLS) aktif untuk tabel objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 3. Menghapus policy lama jika ada untuk menghindari konflik nama
DROP POLICY IF EXISTS "Allow Public Access to KYC Documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow Anonymous Uploads to KYC Documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow Anonymous Updates to KYC Documents" ON storage.objects;
DROP POLICY IF EXISTS "Allow Anonymous Deletes to KYC Documents" ON storage.objects;

-- 4. Kebijakan SELECT: Mengizinkan semua orang (publik) untuk melihat / mengunduh file
CREATE POLICY "Allow Public Access to KYC Documents" ON storage.objects
FOR SELECT TO public USING (bucket_id = 'kyc_document');

-- 5. Kebijakan INSERT: Mengizinkan semua orang (publik) untuk mengunggah file ke bucket kyc_document
CREATE POLICY "Allow Anonymous Uploads to KYC Documents" ON storage.objects
FOR INSERT TO public WITH CHECK (bucket_id = 'kyc_document');

-- 6. Kebijakan UPDATE: Mengizinkan semua orang (publik) untuk memperbarui file di bucket kyc_document
CREATE POLICY "Allow Anonymous Updates to KYC Documents" ON storage.objects
FOR UPDATE TO public WITH CHECK (bucket_id = 'kyc_document');

-- 7. Kebijakan DELETE: Mengizinkan semua orang (publik) untuk menghapus file di bucket kyc_document
CREATE POLICY "Allow Anonymous Deletes to KYC Documents" ON storage.objects
FOR DELETE TO public USING (bucket_id = 'kyc_document');

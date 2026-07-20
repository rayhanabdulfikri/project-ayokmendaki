# INSTRUKSI EVALUASI & REVISI SRS (FORMAT LATEX)

**Petunjuk Penggunaan di Claude.ai:**
1. Unggah (*upload*) dokumen `SRS_AYOKMENDAKITERBARU.docx` Anda ke Claude.ai.
2. Salin seluruh isi teks di bawah garis pembatas di bawah ini dan tempelkan (*copy-paste*) ke dalam kolom prompt chat Claude.ai.
3. Kirim prompt tersebut dan tunggu Claude.ai menghasilkan kode LaTeX lengkap untuk dokumen perbaikan SRS Anda.

---

**PROMPT EVALUASI & GENERATOR KODE LATEX:**

Bertindaklah sebagai Senior Business Analyst dan Technical Architect. Saya telah mengunggah dokumen spesifikasi kebutuhan perangkat lunak (SRS) proyek kami yang berjudul "SRS_AYOKMENDAKITERBARU.docx". 

Tugas Anda adalah mengevaluasi dokumen SRS tersebut secara kritis dan membandingkannya dengan spesifikasi teknis riil dari sistem yang telah selesai dikembangkan saat ini. Berdasarkan hasil evaluasi tersebut, buatlah dokumen "Laporan Evaluasi dan Rencana Perbaikan Dokumen SRS - AyokMendaki" dalam bentuk kode LaTeX lengkap (\documentclass{article} sampai \end{document}) yang siap di-compile di Overleaf.

### Kondisi Riil Sistem Saat Ini (Sebagai Pembanding):
1. **Teknologi Stack:** Menggunakan arsitektur Serverless Single Page Application (SPA) berbasis Vite + React.js (TypeScript) di sisi front-end dan Supabase di sisi back-end/database. Sistem tidak menggunakan Laravel (PHP), VueJS, maupun React Native seperti yang tertulis di SRS lama.
2. **Koneksi Database:** Berinteraksi langsung dari React client ke database Supabase menggunakan `supabase-js` SDK dengan otentikasi JWT dan Row Level Security (RLS) pada tabel-tabel database.
3. **Mekanisme Transaksi & Pajak:** 
   - Transaksi sewa/booking dikenakan PPN 11% secara otomatis pada biaya dasar (`basePrice * 1.11`).
   - Penahanan deposit jaminan Rp 100.000 per transaksi yang akan kembali otomatis 100% setelah trip selesai dan disetujui bersama oleh pendaki dan mitra, atau dipotong jika ada laporan denda kerusakan dari mitra yang disetujui Admin.
4. **Struktur Biaya Admin Penarikan Saldo (Withdrawal):** Biaya admin progresif:
   - Penarikan < Rp 50.000: Admin fee flat Rp 5.000.
   - Penarikan Rp 50.000 s/d Rp 500.000: Admin fee 10% dari nominal penarikan.
   - Penarikan > Rp 500.000: Admin fee 5% dari nominal penarikan.
5. **Validasi Spesialisasi Guide:** Saat pendaki memesan jasa guide, sistem secara ketat memfilter pilihan gunung tujuan hanya pada gunung yang terdaftar pada spesialisasi guide tersebut dan status gunung tersebut "Buka".
6. **Responsivitas Antarmuka (UI/UX):** Penggunaan modal pop-up transaksi yang responsif terhadap resolusi layar kecil (mobile) dengan tinggi maksimum max-h-[85vh], tata letak flex-column, scrollbar vertikal pada form body, dan penutupan modal instan dengan klik backdrop.

### Struktur Penulisan Laporan dalam Kode LaTeX:
- Gunakan package standard: `geometry` (margin 2.5cm), `hyperref`, `booktabs`, `amsmath`, `listings`, dan `xcolor`.
- Cantumkan identitas kelompok berikut pada bagian judul/identitas:
  - Rayhan Abdul Fikri (Project Manager)
  - Muhammad Ubaidillah Rosyid (Full-Stack)
  - Ryan Anugrah (UI/UX)
- Susun bagian-bagian laporan sebagai berikut:
  1. **Bab I: Identitas & Latar Belakang Masalah** (Tabel kelompok berisi Rayhan, Ubaidillah, Ryan).
  2. **Bab II: Mismatch Arsitektur Perangkat Lunak** (Gunakan tabel `\begin{table}` dan `\begin{tabular}` untuk membandingkan secara jelas antara "SRS Lama" vs "Implementasi Riil" pada aspek Tech Stack, Database, API Routing, dan Payment Gateway).
  3. **Bab III: Spesifikasi Logika Keuangan & Escrow** (Gunakan notasi matematika LaTeX untuk menjabarkan formula Pajak PPN 11% dan Biaya Admin Penarikan Progresif).
  4. **Bab IV: Aturan Validasi Khusus** (Menjelaskan logika pemfilteran gunung berdasarkan spesialisasi guide dan status gunung).
  5. **Bab V: Spesifikasi UX Responsif** (Menjelaskan parameter modal scrollable, max-height, dan backdrop clicks).
  6. **Bab VI: Kesimpulan dan Langkah Aksi Revisi Dokumen**.

Pastikan kode LaTeX yang Anda hasilkan lengkap, tidak terpotong (jangan gunakan placeholder atau singkatan seperti "lorem ipsum" atau "..."), bebas dari error sintaks, dan siap di-copy langsung ke Overleaf. Tulis seluruh teks dokumen dalam Bahasa Indonesia yang formal.

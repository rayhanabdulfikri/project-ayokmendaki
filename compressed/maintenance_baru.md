# DOKUMEN RENCANA PEMELIHARAAN SISTEM (MAINTENANCE PLAN) - REVISI TERBARU
**Proyek:** AyokMendaki - Platform Marketplace Pendakian  
**Penyusun:** Tim Pengembang AyokMendaki  

Dokumen ini menyajikan rencana pemeliharaan (*maintenance plan*) sistem AyokMendaki yang disesuaikan secara khusus dengan arsitektur **Vite + React (TypeScript) + Supabase Serverless**.

---

## 1. ANALISIS KEBUTUHAN PEMELIHARAAN SPESIFIK SISTEM

Platform AyokMendaki menggunakan arsitektur **Serverless** di mana sisi front-end dikembangkan menggunakan **Vite + React** dan sisi back-end di-outsource sepenuhnya ke platform **Supabase** (Database PostgreSQL, Storage, Auth, Real-time). 

Analisis karakteristik pemeliharaan untuk sistem ini adalah:

1.  **Beban Pemeliharaan Backend Rendah:** Pengembang tidak perlu memelihara server fisik, sistem operasi Linux, container Docker, maupun routing API terpisah. Pemeliharaan database difokuskan langsung pada **Skema Tabel SQL**, **Row Level Security (RLS) Policies**, dan **Monitoring Quota/Database Performance** pada dashboard Supabase.
2.  **Beban Pemeliharaan Client-Side Tinggi:** Karena seluruh logika transaksi (kalkulasi PPN 11%, biaya admin progresif, validasi spesialisasi guide) dijalankan di browser pengguna menggunakan React state, sistem rentan terhadap error kompatibilitas browser dan pembaruan library NPM. Pemasangan alat pemantau error seperti **Sentry** menjadi sangat krusial.
3.  **Masalah Ukuran Bundling (Vite Chunk Warn):** Proses kompilasi produksi Vite menghasilkan peringatan chunk size > 500 kB. Pengoptimalan bundel JS melalui *Code-splitting* (Lazy Loading) merupakan prioritas pemeliharaan perfektif.

---

## 2. STRATEGI & PROGRAM PEMELIHARAAN SISTEM

Program pemeliharaan dibagi menjadi 4 kategori utama yang disesuaikan dengan kebutuhan riil arsitektur AyokMendaki:

### A. Pemeliharaan Adaptif (*Adaptive Maintenance*) — Prioritas Tinggi
Penyesuaian kode terhadap pembaruan API pihak ketiga dan browser pengguna.
*   **Pembaruan Supabase SDK:** Penyesuaian sintaks query React jika library `@supabase/supabase-js` merilis versi mayor terbaru untuk mencegah ketidakcocokan fungsi.
*   **Kompatibilitas Kebijakan Privasi Browser Klien:** Penyesuaian mekanisme penyimpanan JWT Token (misal beralih dari LocalStorage ke Cookies HttpOnly) jika Chrome/Safari memperketat aturan *Cross-Site Tracking*.
*   **Integrasi BMKG & Maps API:** Penyesuaian jika format endpoint BMKG (cuaca) atau batas kuota Google Maps mengalami perubahan kebijakan.

### B. Pemeliharaan Perfektif (*Perfective Maintenance*) — Prioritas Tinggi
Peningkatan performa kecepatan akses dan skalabilitas data.
*   **Vite Code-Splitting:** Membagi file bundling utama menjadi modul-modul kecil menggunakan `React.lazy()` dan `Suspense` berdasarkan routing halaman. Hal ini memastikan loading awal web sangat cepat (< 3 detik), yang krusial untuk pengguna di area minim sinyal.
*   **Indeks Database PostgreSQL (Supabase):** Membuat indeks pada kolom foreign key yang sering direlasikan (seperti `guide_id`, `vendor_id`, dan `status`) untuk mempercepat pemuatan dashboard transaksi saat jumlah data bertambah banyak.

### C. Pemeliharaan Korektif (*Corrective Maintenance*) — Prioritas Sedang
Perbaikan bug/error fungsionalitas yang muncul setelah sistem dirilis.
*   **Penanganan Error Sinkronisasi Database:** Memperbaiki bug asinkronus Supabase jika ada transaksi saldo yang gagal terkirim karena koneksi internet klien tidak stabil, dengan menerapkan mekanisme *UI rollback* otomatis.
*   **Perbaikan Tampilan Responsif (UI Layout):** Menyempurnakan layout modal form booking yang terpotong pada tipe HP beresolusi sangat kecil (lebar < 320px).

### D. Pemeliharaan Preventif (*Preventive Maintenance*) — Prioritas Sedang
Pencegahan insiden keamanan dan kehilangan data sebelum terjadi.
*   **Audit Kebijakan Row Level Security (RLS) Supabase:** Memastikan aturan RLS di database aktif dan aman, sehingga pengguna biasa tidak bisa memodifikasi atau membaca data keuangan pengguna lain melalui bypass API.
*   **Sistem Log & Pemantau Sentry:** Mengintegrasikan pemantau Sentry di sisi frontend untuk mendeteksi error JavaScript di browser pendaki secara real-time dan melaporkannya secara otomatis ke tim pengembang sebelum dilaporkan oleh pengguna.

---

## 3. PROSEDUR BACKUP & STRATEGI PEMULIHAN (ROLLBACK)

*   **Pencadangan Database:** Mengaktifkan fitur **Automated Daily Backups** dari Supabase. Selain itu, ekspor skema database (.sql) dan data seed penting disimpan secara terpisah di repository privat sebelum melakukan migrasi tabel.
*   **Pencadangan Kode (Git/GitHub):** Seluruh kode aplikasi dikelola melalui repositori GitHub. Setiap fitur baru dikembangkan pada cabang terpisah (`feature-branch`) sebelum di-merge ke cabang utama (`main`).
*   **Strategi Rollback Instan:** Jika perilisan versi baru di server produksi mengalami kegagalan sistem, tim DevOps dapat melakukan *rollback* instan ke versi stabil sebelumnya melalui dashboard deployment Vercel/Netlify dalam waktu < 2 menit tanpa downtime tambahan.

# RENCANA PEMELIHARAAN SISTEM (MAINTENANCE PLAN)
**Proyek:** AyokMendaki - Platform Marketplace Pendakian  
**Penyusun:** Tim Pengembang AyokMendaki  

Laporan ini menyajikan rencana pemeliharaan (*maintenance plan*) sistem AyokMendaki setelah tahap implementasi selesai untuk memastikan kinerja, keamanan, serta keberlanjutan sistem web yang stabil.

---

## 1. STRATEGI & JENIS PEMELIHARAAN

Pemeliharaan sistem AyokMendaki dibagi menjadi 4 jenis pemeliharaan utama sesuai standar rekayasa perangkat lunak:

### A. Pemeliharaan Korektif (*Corrective Maintenance*)
Pemecahan masalah berupa perbaikan bug (*bug fixing*) yang ditemukan saat sistem sudah berjalan aktif di lingkungan produksi (*production*).
*   **Aktivitas Utama:**
    *   Mengatasi masalah sinkronisasi state React lokal dengan tabel database Supabase jika terjadi kegagalan koneksi.
    *   Memperbaiki kesalahan visual (*layouting*) pada browser mobile Safari/Chrome terkait tampilan modal dialog.
    *   Memantau log kegagalan transaksi pembayaran saldo dompet jika terjadi *double charge* atau kegagalan *atomic operation*.
*   **Waktu Respon (SLA):** Bug kritis (transaksi gagal/keamanan bocor) diselesaikan dalam maksimal $2 \times 24$ jam.

### B. Pemeliharaan Adaptif (*Adaptive Maintenance*)
Penyesuaian sistem dengan perubahan lingkungan perangkat keras, sistem operasi, browser, atau pustaka pihak ketiga.
*   **Aktivitas Utama:**
    *   Pembaruan ketergantungan paket (*package dependencies*) pada `package.json` secara berkala (misal: Vite, React, Lucide React, Tailwind CSS).
    *   Penyesuaian konfigurasi Row Level Security (RLS) di Supabase jika terdapat perubahan kebijakan keamanan data privasi pengguna.
    *   Penyesuaian API integrasi dengan layanan eksternal seperti BMKG (cuaca) dan Payment Gateway (Midtrans/Xendit) jika mereka merilis versi API terbaru.

### C. Pemeliharaan Perfektif (*Perfective Maintenance*)
Peningkatan kinerja, kegunaan (*usability*), dan optimasi kode sistem tanpa mengubah fungsi dasar perangkat lunak.
*   **Aktivitas Utama:**
    *   **Penyelesaian Masalah Chunk Size:** Mengatasi peringatan Vite build terkait ukuran file index JS yang besar (> 500 kB) dengan melakukan *code-splitting* menggunakan `React.lazy` dan pembagian chunk dinamis (*dynamic imports*).
    *   **Optimasi Query Supabase:** Menambahkan indeks (*indexes*) pada kolom database yang sering dicari seperti `guide_id`, `vendor_id`, dan `status` untuk mempercepat query select.
    *   Peningkatan kompresi gambar profil (*avatar*) dan katalog peralatan guna menghemat konsumsi kuota server.

### D. Pemeliharaan Preventif (*Preventive Maintenance*)
Tindakan antisipasi untuk mendeteksi dan mencegah potensi kegagalan sistem sebelum benar-benar terjadi di masa mendatang.
*   **Aktivitas Utama:**
    *   Pemasangan tool pemantau error (*error monitoring*) seperti Sentry untuk menangkap crash JavaScript di sisi klien secara real-time.
    *   Pemeriksaan masa aktif domain website dan sertifikat SSL Let's Encrypt secara otomatis (renewal otomatis setiap 90 hari).
    *   Audit keamanan database Supabase untuk memastikan tidak ada celah kebocoran pada skema tabel data pribadi pendaki.

---

## 2. PROSEDUR BACKUP & ROLLBACK (CADANGAN DATA)

Perlindungan data transaksi pendakian, dompet saldo, dan data akun pengguna dikelola dengan skema cadangan bertingkat:

### A. Backup Database Otomatis (Supabase)
*   **Metode:** Pemanfaatan fitur backup otomatis harian (*daily automated backups*) yang disediakan oleh infrastruktur Supabase.
*   **Retensi:** Cadangan data disimpan selama minimal 30 hari terakhir.
*   **Backup Manual:** Sebelum melakukan update struktur tabel (*migration*), developer wajib melakukan ekspor skema database (.sql) melalui Supabase CLI.

### B. Version Control & Backup Kode Aplikasi (GitHub)
*   **Metode:** Seluruh perubahan kode aplikasi wajib dikomit dan didistribusikan melalui repositori GitHub resmi.
*   **Skema Cabang (Branching):**
    *   `main` / `production`: Hanya untuk kode yang sudah siap saji dan stabil.
    *   `development`: Tempat penggabungan fitur-fitur baru sebelum masuk tahap pengujian akhir.
*   **Rollback Strategi:** Jika kode di server produksi mengalami masalah kritis setelah rilis baru, sistem hosting (Vite build) dapat di-rollback secara instan ke *commit hash* versi sebelumnya dalam waktu kurang dari 5 menit menggunakan fitur redeploy di platform Vercel/Netlify.

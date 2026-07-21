# DOKUMEN RENCANA KONVERSI SISTEM (CONVERSION PLAN) - REVISI TERBARU
**Proyek:** AyokMendaki - Platform Marketplace Pendakian  
**Penyusun:** Tim Pengembang AyokMendaki  

Dokumen ini merinci analisis komparatif metode konversi, rekomendasi metode terbaik untuk platform AyokMendaki, serta rencana kontingensi operasional (*contingency plan*) berbasis WhatsApp ketika sistem berada dalam masa pemeliharaan (*maintenance downtime*).

---

## 1. ANALISIS PERBANDINGAN METODE KONVERSI SISTEM

Sebelum menentukan metode perpindahan dari operasional manual lama (WhatsApp/grup koordinasi) ke sistem digital baru (platform AyokMendaki), berikut adalah analisis perbandingan 4 metode konversi sistem yang dipertimbangkan:

| Metode Konversi | Mekanisme Operasional | Kelebihan untuk AyokMendaki | Kekurangan untuk AyokMendaki |
|---|---|---|---|
| **Direct Cut-off** *(Konversi Langsung)* | Sistem lama dihentikan total secara instan pada tanggal rilis, dan operasional beralih 100% ke sistem baru. | - Sangat efisien secara biaya.<br>- Menghindari pencatatan transaksi ganda.<br>- Database transaksi escrow & saldo dompet langsung terpusat (satu pintu). | - Risiko tinggi jika terdapat bug kritis pada sistem pembayaran/escrow di awal rilis. |
| **Parallel** *(Konversi Paralel)* | Menjalankan sistem transaksi manual lama dan sistem digital baru secara bersamaan selama periode tertentu (misal: 1 bulan). | - Sangat aman.<br>- Jika sistem baru mengalami error, operasional tetap berjalan menggunakan sistem manual lama. | - Beban kerja admin, guide, dan vendor menjadi ganda.<br>- Sulit menyinkronkan saldo deposit jaminan Rp 100.000 di dua sistem berbeda. |
| **Phased** *(Konversi Bertahap)* | Fitur-fitur atau modul sistem dirilis secara bertahap (misal: Tahap 1: Discovery & Chat, Tahap 2: Booking, Tahap 3: Escrow). | - Pengguna (pendaki & mitra) dapat beradaptasi dengan fitur secara perlahan. | - Kurang cocok untuk platform marketplace yang alurnya terikat erat (tidak bisa booking tanpa pembayaran escrow). |
| **Pilot** *(Konversi Percontohan)* | Sistem dirilis penuh secara digital, namun **dibatasi hanya untuk satu wilayah uji coba** (misalnya: Jalur Gunung Semeru). | - **Sangat Aman & Terkontrol**.<br>- Risiko bug finansial (escrow & denda deposit) terlokalisasi di wilayah pilot.<br>- Mudah dipantau. | - Membutuhkan filter pembatasan wilayah pendakian di tahap awal perilisan. |

---

## 2. METODE KONVERSI YANG DIREKOMENDASIKAN

Berdasarkan analisis di atas, tim pengembang merancang strategi konversi **Hibrida (Hybrid)** yang menggabungkan keunggulan **Pilot** dan **Direct Cut-off** sebagai berikut:

### A. Rekomendasi Utama (Ideal & Paling Aman): **Pilot Conversion (Percontohan)**
Metode ini dipilih sebagai fase transisi pertama karena platform AyokMendaki melibatkan transaksi uang riil (Escrow, PPN 11%, dan Deposit Jaminan Rp 100.000).
*   **Implementasi:** Platform digital diluncurkan penuh hanya untuk **Jalur Pendakian Gunung Semeru** selama 1 bulan. Seluruh pendakian gunung lain masih dilayani secara manual.
*   **Tujuan:** Menguji stabilitas kalkulasi sistem keuangan, penanganan denda kerusakan barang dari vendor, dan keandalan server sebelum dibuka secara nasional.

### B. Rekomendasi Alternatif (Startup Lean / Hemat Anggaran): **Direct Cut-off dengan Rencana Kontingensi**
Jika sistem lama hanya berupa chat koordinasi WhatsApp sederhana dan tidak ada server database lama yang perlu dimigrasi, maka metode **Direct Cut-off** secara langsung dapat langsung diterapkan untuk menghemat biaya operasional, dengan syarat wajib didukung oleh **Rencana Kontingensi WhatsApp Bot** saat terjadi pemeliharaan (*maintenance*).

---

## 3. RENCANA DARURAT (CONTINGENCY PLAN) SAAT MAINTENANCE DOWNTIME

Ketika sistem utama mengalami *downtime* atau sedang dalam masa pemeliharaan, alur transaksi secara darurat akan dialihkan ke **WhatsApp Channel & WhatsApp Bot Interaktif** agar aktivitas pendaki di lapangan tidak terganggu.

### A. Bagan Alir Kontingensi Darurat (ASCII Flowchart)
```
                  [ SISTEM UTAMA DOWNTIME / MAINTENANCE ]
                                     │
          ┌──────────────────────────┴──────────────────────────┐
          ▼                                                     ▼
 [ WhatsApp Channel ]                                 [ WhatsApp Bot Interaktif ]
(Broadcast & Info Update)                                       │
                                        ┌───────────────────────┼───────────────────────┐
                                        ▼                       ▼                       ▼
                               [ Tiket Gunung ]          [ Jasa Guide ]          [ Sewa Alat ]
                                Form manual ke            Bot mengirim            Bot mengirim
                                 Super Admin            no. WA personal         no. WA personal
                               (Proses Manual)            Guide terkait          Vendor terdekat
```

### B. Detail Operasional Jalur Darurat WhatsApp:
1.  **WhatsApp Channel (Broadcast Informasi):**
    *   Berfungsi memberikan pengumuman status pemeliharaan sistem, estimasi waktu pulih, dan info darurat kepada seluruh pengikut/pendaki secara cepat.
2.  **WhatsApp Bot Tiket Gunung Resmi:**
    *   Pendaki dapat mengirim pesan ke WA Bot resmi. Bot akan mengarahkan pendaki untuk mengisi data rombongan melalui format teks manual.
    *   Super Admin akan memvalidasi data dan mendaftarkannya secara manual ke pihak pengelola gunung, lalu mengirimkan tiket masuk resmi (PDF/QR) kembali via WhatsApp.
3.  **WhatsApp Bot Jasa Guide:**
    *   Bot menyajikan daftar guide aktif di gunung tujuan. Setelah pendaki memilih nama guide, bot akan otomatis mengirimkan **nomor WhatsApp pribadi guide** agar koordinasi pendakian dapat dilanjutkan secara langsung (transaksi manual sementara).
4.  **WhatsApp Bot Sewa Alat (Rental):**
    *   Sama seperti pemesanan guide, bot akan mendeteksi gunung tujuan pendaki dan mengirimkan **kontak WhatsApp pribadi Vendor rental terdekat** dari lokasi basecamp gunung agar sewa alat dapat dikoordinasikan secara mandiri.

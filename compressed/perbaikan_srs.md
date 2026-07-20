# RENCANA PERBAIKAN DOKUMEN SRS (SOFTWARE REQUIREMENT SPECIFICATION)
**Proyek:** AyokMendaki - Platform Marketplace Pendakian  
**Status Peninjauan:** DRAFT REVISI AKHIR  

Setelah membandingkan dokumen `SRS_AYOKMENDAKITERBARU.docx` dengan kondisi riil implementasi kode pada folder project, ditemukan beberapa ketidaksesuaian (*mismatches*) teknis yang mendasar. Laporan ini merinci poin-poin tersebut beserta rencana perbaikan yang harus dituangkan ke dalam dokumen SRS revisi akhir.

---

## POIN-POIN REVISI UTAMA

### 1. Perubahan Arsitektur & Teknologi Stack (Tech Stack)
*   **Kondisi di Dokumen SRS Lama:** 
    *   Backend: Laravel (PHP)
    *   Frontend Web: VueJS
    *   Mobile App: React Native
*   **Kondisi Riil Implementasi Project:**
    *   Sistem dibangun menggunakan arsitektur **Serverless SPA (Single Page Application)**.
    *   Frontend & Client logic: **Vite + React.js (TypeScript)**.
    *   Backend, Database & Real-time State: **Supabase** (tanpa server backend Laravel terpisah, query database dieksekusi langsung dari client menggunakan `supabase-js` SDK dengan memanfaatkan Row Level Security).
*   **Rencana Tindakan Perbaikan SRS:**
    *   Ubah Bab 1 (Tujuan, Ruang Lingkup) dan Bab 2 (Ketergantungan Software, Spesifikasi Pendukung) untuk merefleksikan penggunaan **Vite + React (TypeScript) + Supabase**.

---

### 2. Mekanisme Keuangan & Sistem Escrow Transaksi
*   **Kondisi di Dokumen SRS Lama:**
    *   Pembayaran escrow biasa melalui integrasi Midtrans/Xendit tanpa rincian formula pajak dan jaminan.
*   **Kondisi Riil Implementasi Project:**
    *   **Pajak PPN 11%:** Dihitung otomatis di setiap transaksi booking guide dan sewa alat outdoor (`basePrice * 1.11`).
    *   **Deposit Jaminan Rp 100.000:** Ditahan sementara oleh sistem escrow untuk setiap transaksi booking/rental. Uang ini otomatis kembali 100% setelah status trip "Selesai" disetujui bersama oleh pendaki & mitra, atau dipotong jika ada klaim denda dari mitra yang disetujui Super Admin.
    *   **Sistem Biaya Penarikan (*Withdrawal Fee*):** Admin mengenakan tarif progresif pada setiap penarikan saldo dompet mitra:
        *   Penarikan < Rp 50.000: Admin fee flat Rp 5.000.
        *   Penarikan Rp 50.000 s/d Rp 500.000: Admin fee 10%.
        *   Penarikan > Rp 500.000: Admin fee 5%.
*   **Rencana Tindakan Perbaikan SRS:**
    *   Tambahkan sub-bab baru di Bab 2/3 mengenai **Spesifikasi Aturan Bisnis Keuangan (Business Rules: PPN, Deposit Jaminan, & Biaya Admin Progresif)**.

---

### 3. Logika Validasi Pendaftaran & Spesialisasi Pemandu
*   **Kondisi di Dokumen SRS Lama:**
    *   Pendaki bebas memilih gunung tujuan saat memesan jasa guide apa saja.
*   **Kondisi Riil Implementasi Project:**
    *   **Saringan Spesialisasi Gunung:** Pendaki hanya diperbolehkan memilih gunung tujuan pendakian yang tercantum dalam spesifikasi gunung guide tersebut (misal: Ahmad hanya bisa dipesan untuk Gunung Semeru & Gunung Bromo).
    *   **Validasi Keaktifan Gunung:** Jika seluruh gunung spesialisasi guide berstatus "Tutup" di database, booking otomatis ditolak oleh sistem.
*   **Rencana Tindakan Perbaikan SRS:**
    *   Revisi Skenario Use Case "Booking Guide" di Bab 3 untuk menambahkan *Pre-condition* dan *Exceptions Flow* terkait validasi spesialisasi gunung pemandu.

---

### 4. Responsivitas Antarmuka & Penutupan Modal (UI/UX)
*   **Kondisi di Dokumen SRS Lama:**
    *   Hanya spesifikasi tampilan web/mobile standar.
*   **Kondisi Riil Implementasi Project:**
    *   Seluruh modal transaksi (Booking Guide, Sewa Alat, Tiket Gunung) dirancang dengan batas tinggi maksimal (`max-h-[85vh]`), layout flex vertikal, scroll independen pada bagian form body, serta fitur penutupan instan dengan mengklik area backdrop transparan.
*   **Rencana Tindakan Perbaikan SRS:**
    *   Perbarui Kebutuhan Non-Fungsional pada aspek *Usability* untuk mencantumkan spesifikasi modal pop-up responsif yang mendukung kemudahan gulir (*scrollable*) dan penutupan cepat (*backdrop dismissal*) pada resolusi mobile.

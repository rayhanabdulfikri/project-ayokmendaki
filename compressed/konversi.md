# RENCANA KONVERSI SISTEM (CONVERSION PLAN)
**Proyek:** AyokMendaki - Platform Marketplace Pendakian  
**Penyusun:** Tim Pengembang AyokMendaki  

Laporan ini merinci rencana perpindahan operasional (*sistem konversi*) dari sistem manual ke sistem aplikasi digital terpadu **AyokMendaki**, termasuk penanganan alternatif (*contingency plan*) saat sistem mengalami masa pemeliharaan (*maintenance downtime*).

---

## 1. METODE KONVERSI: DIRECT CUT-OFF (KONVERSI LANGSUNG)

Untuk implementasi platform AyokMendaki, metode konversi yang dipilih adalah **Direct Cut-off (Konversi Langsung)**. Melalui metode ini, sistem lama (pemesanan manual melalui grup chat dan kontak personal) akan dihentikan sepenuhnya pada tanggal rilis yang ditentukan, dan seluruh transaksi pendakian wajib beralih menggunakan aplikasi web/mobile AyokMendaki yang baru.

### Alasan Pemilihan Metode Cut-off:
1.  **Efisiensi Biaya Operasional:** Sebagai startup tahap awal (*early-stage SaaS*), tim pengembang tidak memiliki kapasitas finansial untuk mendanai dua operasional sistem secara paralel (biaya server ganda dan admin operasional tambahan).
2.  **Menghindari Ketidaksinkronan Transaksi Escrow:** Sistem pembayaran escrow, deposit jaminan Rp 100.000, serta perhitungan PPN 11% memerlukan pencatatan database yang terpusat dan satu pintu. Menjalankan sistem paralel akan memicu sengketa (*dispute*) saldo dompet yang sangat berisiko membingungkan pengguna.
3.  **Kesederhanaan Data Awal:** Sistem lama tidak memiliki basis data relasional yang rumit. Transaksi lama didominasi oleh riwayat chat manual, sehingga migrasi data hanya berfokus pada pendaftaran akun pengguna baru dan dokumen verifikasi identitas (KTP/APIGI).

---

## 2. RENCANA DARURAT (CONTINGENCY PLAN) SAAT MAINTENANCE DOWNTIME

Ketika sistem aplikasi web sedang berada dalam masa pemeliharaan (*maintenance mode*) atau mengalami pemadaman tidak terduga (*downtime*), platform AyokMendaki menyediakan jalur alternatif darurat berbasis **WhatsApp Channel & Bot Interaktif** agar aktivitas pendakian tetap berjalan lancar:

```
[Sistem Utama Down/Maintenance]
              │
              ├──> Notifikasi & Info Transaksi: WhatsApp Channel (Broadcast)
              │
              └──> Booking & Rental: WhatsApp Bot Interaktif
                      │
                      ├──> Tiket Gunung: Dilayani Bot, diproses manual oleh Super Admin
                      ├──> Jasa Guide  : Bot mengirimkan nomor WhatsApp Guide pribadi
                      └──> Sewa Alat   : Bot mengirimkan nomor WhatsApp Vendor rental pribadi
```

### Jalur Alternatif Operasional Darurat:
1.  **Pusat Informasi & Broadcast Transaksi:**
    *   Menggunakan **WhatsApp Channel (Saluran WA) Resmi AyokMendaki** untuk menyebarkan informasi darurat, estimasi selesainya pemeliharaan, serta konfirmasi status transaksi yang sedang berjalan.
2.  **Booking Tiket Gunung Resmi:**
    *   Pendaki menghubungi WhatsApp Bot resmi AyokMendaki. Bot akan menyajikan formulir teks interaktif untuk diisi (Nama, NIK, Jumlah Pendaki, Gunung Tujuan, Tanggal).
    *   Data ini akan diteruskan ke Super Admin secara manual. Super Admin akan mendaftarkan pendaki ke pihak pengelola gunung dan mengirimkan tiket PDF secara manual via WA.
3.  **Booking Jasa Guide (Pemandu):**
    *   Jika pendaki membutuhkan guide saat sistem web down, WhatsApp Bot akan menyajikan daftar nama guide aktif berdasarkan gunung tujuan.
    *   Bot kemudian akan mengirimkan **nomor kontak WhatsApp pribadi guide** yang bersangkutan agar pendaki dapat melakukan koordinasi dan pembayaran jasa secara langsung (sementara di luar escrow platform).
4.  **Penyewaan Alat Outdoor (Rental):**
    *   Sama seperti pemesanan guide, WhatsApp Bot akan membagikan lokasi dan **nomor kontak WhatsApp pribadi Vendor rental alat** terdekat dari basecamp gunung tujuan pendaki agar transaksi sewa-menyewa fisik dapat diselesaikan secara manual.

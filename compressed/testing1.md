# LAPORAN PENGUJIAN SISTEM (TESTING) - BAGIAN 1
**Nama:** Rayhan Abdul Fikri  
**NIM:** 2026071901  
**Peran:** Project Manager & Quality Assurance (QA)  

Laporan ini berisi dokumentasi pengujian perangkat lunak sistem **AyokMendaki** menggunakan metode **White-Box Testing** dan **Black-Box Testing** yang berfokus pada logika kontrol transaksi, penghitungan PPN 11%, serta logika biaya administrasi penarikan dana (*withdrawal*).

---

## 1. WHITE-BOX TESTING (PENGUJIAN KOTAK PUTIH)

White-box testing berfokus pada pemeriksaan struktur kode internal, jalur logika, serta kalkulasi matematika dalam fungsi inti sistem.

### A. Pengujian Logika Biaya Penarikan Dana Progresif (*Progressive Withdrawal Fee*)
Pengujian ini memvalidasi percabangan logika (*basis path testing*) dari fungsi `withdrawWallet` yang menggunakan formula biaya admin progresif:
*   Jumlah penarikan $< \text{Rp } 50.000$: Biaya flat $\text{Rp } 5.000$
*   Jumlah penarikan $\text{Rp } 50.000 - \text{Rp } 500.000$: Biaya persentase $10\%$
*   Jumlah penarikan $> \text{Rp } 500.000$: Biaya persentase $5\%$

#### Potongan Kode Sumber (*Source Code Segment* under Test):
```typescript
const withdrawWallet = (role: "pendaki" | "guide" | "vendor", amount: number, description?: string) => {
  let adminFee = 0;
  if (amount < 50000) {
    adminFee = 5000;
  } else if (amount <= 500000) {
    adminFee = Math.round(amount * 0.10);
  } else {
    adminFee = Math.round(amount * 0.05);
  }
  const totalDeduction = amount + adminFee;
  // ... operasi pengurangan saldo dan pencatatan riwayat transaksi ...
}
```

#### Analisis Jalur Logika (Basis Path Analysis):
1.  **Jalur 1 (Amount < 50,000):** Mengeksekusi blok `amount < 50000`. Kondisi bernilai `true`.
2.  **Jalur 2 (50,000 <= Amount <= 500,000):** Kondisi ke-1 bernilai `false`, kondisi ke-2 bernilai `true`.
3.  **Jalur 3 (Amount > 500,000):** Kondisi ke-1 dan ke-2 bernilai `false`, mengeksekusi blok `else`.

#### Jalur Kasus Uji (Test Path Cases):
| ID Uji | Input (Amount) | Jalur yang Dilewati | Ekspektasi Output (Admin Fee) | Ekspektasi Total Potong | Status |
|---|---|---|---|---|---|
| WT-WD-01 | Rp 30.000 | Jalur 1 | Rp 5.000 | Rp 35.000 | Lulus |
| WT-WD-02 | Rp 200.000 | Jalur 2 | Rp 20.000 | Rp 220.000 | Lulus |
| WT-WD-03 | Rp 1.000.000 | Jalur 3 | Rp 50.000 | Rp 1.050.000 | Lulus |

---

## 2. BLACK-BOX TESTING (PENGUJIAN KOTAK HITAM)

Black-box testing berfokus pada pengujian fungsionalitas antarmuka dan alur bisnis sistem tanpa melihat struktur kode di dalamnya.

### A. Skenario Pengujian: Pembayaran Transaksi Terpotong Saldo Dompet & Kalkulasi PPN 11%
Memverifikasi fungsionalitas pembayaran booking/rental oleh pendaki menggunakan saldo dompet (*wallet*), termasuk pemotongan pajak PPN 11%.

| ID Uji | Kondisi Pengujian | Langkah Pengujian | Ekspektasi Hasil | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|---|
| BB-PAY-01 | Saldo Cukup untuk transaksi tiket/sewa | 1. Login sebagai Pendaki (Saldo: Rp 500.000)<br>2. Klik "Bayar" pada Booking senilai Rp 300.000 | 1. Muncul SweetAlert konfirmasi pembayaran.<br>2. Total bayar dihitung: Rp 300k + PPN 11% (Rp 33k) = Rp 333.000.<br>3. Saldo berkurang Rp 333.000.<br>4. Status booking berubah menjadi "Telah Dibayar". | Sesuai Ekspektasi | Lulus |
| BB-PAY-02 | Saldo Kurang untuk transaksi | 1. Login sebagai Pendaki (Saldo: Rp 20.000)<br>2. Klik "Bayar" pada Booking senilai Rp 100.000 | 1. Muncul peringatan error saldo tidak mencukupi via Toast.<br>2. Transaksi ditolak secara aman.<br>3. Pendaki diarahkan ke tab top up saldo. | Sesuai Ekspektasi | Lulus |

### B. Skenario Pengujian: Filter Spesialisasi Gunung saat Booking Guide
Memverifikasi bahwa pendaki hanya dapat memilih gunung tujuan pendakian yang berada di dalam daftar spesialisasi dari guide yang bersangkutan.

| ID Uji | Kondisi Pengujian | Langkah Pengujian | Ekspektasi Hasil | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|---|
| BB-SPEC-01 | Guide dengan spesialisasi tertentu | 1. Buka profil Guide dengan spesialisasi: "Gunung Semeru, Gunung Bromo"<br>2. Klik "Booking Jasa" | 1. Modal booking terbuka.<br>2. Dropdown gunung tujuan hanya memuat "Gunung Semeru" dan "Gunung Bromo".<br>3. Pilihan gunung lain (Rinjani, Merbabu, dll) tidak muncul di antarmuka. | Sesuai Ekspektasi | Lulus |
| BB-SPEC-02 | Gunung spesialisasi sedang ditutup | 1. Pilih Guide spesialisasi "Gunung Semeru"<br>2. Status Gunung Semeru diset "Tutup" oleh admin.<br>3. Klik "Booking Jasa" | 1. Sistem mendeteksi bahwa gunung spesialisasi guide tidak ada yang buka.<br>2. Booking ditolak secara otomatis.<br>3. Muncul notifikasi peringatan bahwa guide tidak bisa dipesan karena gunung spesialisasinya tutup. | Sesuai Ekspektasi | Lulus |

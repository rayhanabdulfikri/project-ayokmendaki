# LAPORAN PENGUJIAN SISTEM (TESTING) - BAGIAN 2
**Nama:** Muhammad Ubaidillah Rosyid  
**NIM:** 2026071902  
**Peran:** Full-Stack Developer  

Laporan ini berisi dokumentasi pengujian perangkat lunak sistem **AyokMendaki** menggunakan metode **White-Box Testing** dan **Black-Box Testing** yang berfokus pada integrasi database Supabase, update asinkronus dengan mekanisme *rollback*, serta alur pencairan dana escrow dan deposit jaminan.

---

## 1. WHITE-BOX TESTING (PENGUJIAN KOTAK PUTIH)

White-box testing difokuskan pada pengujian alur asinkronus Supabase SDK, penanganan kegagalan koneksi database (*database error exception handling*), dan mekanisme pengembalian kondisi awal (*rollback*).

### A. Pengujian Mekanisme Rollback pada Fungsi updateMountain
Pengujian ini memvalidasi integritas data lokal ketika terjadi kegagalan saat eksekusi query update data ke database Supabase.

#### Potongan Kode Sumber (*Source Code Segment* under Test):
```typescript
const updateMountain = async (name: string, fields: Partial<Mountain>) => {
  // 1. Optimistic Update (state lokal diubah dulu demi kecepatan respon UI)
  setMountains((prev) => prev.map((m) => (m.name === name ? { ...m, ...fields } : m)));
  
  try {
    const { error } = await supabase.from("mountains").update(dbFields).eq("name", name);
    if (error) throw error; // Memicu blok catch
  } catch (err: any) {
    // 2. Rollback (Kembalikan data lokal asli dari database)
    const { data: mtnData } = await supabase.from("mountains").select("*");
    if (mtnData) {
      setMountains(mtnData.map((m: any) => ({ ...m }))); // Re-fetch data asli
    }
  }
};
```

#### Jalur Diagram Logika (Control Flow Logic Paths):
*   **Jalur Sukses (Path A):** `setMountains` (Optimistic) $\rightarrow$ `supabase.update()` berhasil $\rightarrow$ Selesai.
*   **Jalur Gagal/Koneksi Putus (Path B):** `setMountains` (Optimistic) $\rightarrow$ `supabase.update()` memicu error $\rightarrow$ Tangkap error di `catch` $\rightarrow$ `supabase.select()` $\rightarrow$ Reset State `setMountains` (Rollback).

#### Jalur Kasus Uji (Test Path Cases):
| ID Uji | Kondisi Input & Jaringan | Skenario Alur | Ekspektasi Status UI | Hasil Akhir Database | Kesimpulan |
|---|---|---|---|---|---|
| WT-DB-01 | Jaringan normal (Online) | Sukses update status Gunung Bromo "Buka" | UI langsung "Buka", DB sukses ter-update. | Ter-update | Lulus |
| WT-DB-02 | Jaringan terputus (Offline) | Gagal update status Gunung Bromo "Buka" | UI sempat berubah "Buka", lalu kembali "Tutup" (Rollback). | Tidak Berubah | Lulus |

---

## 2. BLACK-BOX TESTING (PENGUJIAN KOTAK HITAM)

Black-box testing memvalidasi logika alur dana escrow dan deposit dari sudut pandang siklus data di database.

### A. Skenario Pengujian: Pencairan Dana Escrow & Pengembalian Deposit Otomatis
Memverifikasi fungsionalitas pencairan dana ke Guide/Vendor setelah trip selesai dan pengembalian uang deposit Rp 100.000 ke dompet Pendaki secara otomatis.

| ID Uji | Kondisi Pengujian | Langkah Pengujian | Ekspektasi Hasil | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|---|
| BB-ESC-01 | Pengembalian normal tanpa denda | 1. Admin mencairkan dana trip Gunung Semeru (Biaya Jasa: Rp 400.000, Deposit: Rp 100.000).<br>2. Klik "Cairkan Dana" (tanpa klaim denda dari vendor). | 1. Status transaksi berubah menjadi "Selesai".<br>2. Saldo dompet Guide bertambah Rp 400.000.<br>3. Saldo dompet Pendaki bertambah Rp 100.000 (deposit dikembalikan utuh). | Sesuai Ekspektasi | Lulus |
| BB-ESC-02 | Penyelesaian trip dengan denda kerusakan | 1. Vendor melaporkan denda kerusakan alat Rp 70.000.<br>2. Admin menyetujui klaim denda tersebut. | 1. Saldo deposit pendaki didebet Rp 70.000 untuk denda.<br>2. Sisa deposit Rp 30.000 masuk ke dompet Pendaki.<br>3. Saldo denda Rp 70.000 ditransfer ke dompet Vendor selaku pelapor kerusakan. | Sesuai Ekspektasi | Lulus |

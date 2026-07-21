# LAPORAN PENGUJIAN SISTEM LENGKAP (TESTING SPECIFICATION)
**Proyek:** AyokMendaki - Platform Marketplace Pendakian  
**Tahun Akademik:** 2026  

Laporan ini menyajikan spesifikasi pengujian perangkat lunak (*software testing*) terpadu untuk platform **AyokMendaki** menggunakan metode **White-Box Testing (Basis Path & Flowgraph)** dan **Black-Box Testing (Fungsional & Antarmuka)**. Dokumen ini dibagi menjadi tiga bagian berdasarkan peran dan kontribusi masing-masing anggota kelompok penguji.

---

## DAFTAR PENGUJI & PEMBAGIAN PERAN
1.  **Rayhan Abdul Fikri (NIM: 24.240.0108)** — *Project Manager & QA Lead*  
    (Fokus: Logika Bisnis, Perhitungan Pajak PPN 11%, dan Logika Biaya Admin Penarikan Progresif).
2.  **Muhammad Ubaidillah Rosyid (NIM: 24.240.0101)** — *Full-Stack Developer*  
    (Fokus: Integrasi Supabase DB, Mekanisme Optimistic Update & Rollback Asinkronus, serta Transaksi Escrow).
3.  **Ryan Nugraha Adhithama (NIM: 25.240.0007)** — *UI/UX Designer & QA Frontend*  
    (Fokus: Responsivitas Layout CSS Modal, Batasan Tinggi Max-Height, dan Event Backdrop Dismissal).

---

# BAGIAN 1: PENGUJIAN OLEH RAYHAN ABDUL FIKRI (NIM: 24.240.0108)
**Peran:** Project Manager & QA Lead  
**Fokus Area:** Algoritma Keuangan, Pajak PPN 11%, dan Biaya Admin Progresif.

## 1.1 White-Box Testing: Biaya Admin Penarikan Dana Progresif
Fungsi `withdrawWallet` mengadopsi biaya administrasi berjenjang (progresif) untuk penarikan saldo dompet (*wallet withdrawal*):
*   Penarikan $< \text{Rp } 50.000$: Biaya admin flat $\text{Rp } 5.000$.
*   Penarikan $\text{Rp } 50.000 - \text{Rp } 500.000$: Biaya admin $10\%$.
*   Penarikan $> \text{Rp } 500.000$: Biaya admin $5\%$.

### A. Kode Sumber yang Diuji:
```typescript
const withdrawWallet = (role: "pendaki" | "guide" | "vendor", amount: number) => {
  let adminFee = 0;              // Node 1
  if (amount < 50000) {          // Node 2
    adminFee = 5000;             // Node 3 (Jalur 1)
  } else if (amount <= 500000) { // Node 4
    adminFee = Math.round(amount * 0.10); // Node 5 (Jalur 2)
  } else {
    adminFee = Math.round(amount * 0.05); // Node 6 (Jalur 3)
  }
  const totalDeduction = amount + adminFee; // Node 7
  return totalDeduction;         // Node 8
}
```

### B. Diagram Alir Kontrol (Control Flow Graph - CFG)
```
          [ Node 1: Start & init adminFee ]
                         │
                         ▼
             [ Node 2: amount < 50000? ]
               /                     \
        True  /                       \ False
             ▼                         ▼
    [ Node 3: adminFee=5000 ]    [ Node 4: amount <= 500000? ]
             │                     /                       \
             │              True  /                         \ False
             │                   ▼                           ▼
             │       [ Node 5: adminFee=10% ]    [ Node 6: adminFee=5% ]
             │                   │                           │
             └───────────────────┼───────────────────────────┘
                                 ▼
                     [ Node 7: totalDeduction ]
                                 │
                                 ▼
                          [ Node 8: End ]
```

### C. Deskripsi Teknis Flowgraph untuk AI (Promp Generator)
*   **Struktur Node:**
    *   **Node 1 (Sequential):** Entry point, deklarasi variabel `adminFee = 0`.
    *   **Node 2 (Decision):** Evaluasi kondisi percabangan pertama `amount < 50000`.
    *   **Node 3 (Sequential):** Blok eksekusi True untuk Node 2 (`adminFee = 5000`).
    *   **Node 4 (Decision):** Evaluasi kondisi percabangan kedua `amount <= 500000` (jika Node 2 bernilai False).
    *   **Node 5 (Sequential):** Blok eksekusi True untuk Node 4 (`adminFee = 10%`).
    *   **Node 6 (Sequential):** Blok eksekusi Else (False untuk Node 4) (`adminFee = 5%`).
    *   **Node 7 (Sequential):** Titik penggabungan aliran (*junction node*) untuk menjumlahkan `totalDeduction = amount + adminFee`.
    *   **Node 8 (Sequential):** Return hasil dan mengakhiri eksekusi fungsi.
*   **Formula Kompleksitas Siklomatis (Cyclomatic Complexity):**
    *   Jumlah Edges ($E$) = $9$
    *   Jumlah Nodes ($N$) = $8$
    *   Kompleksitas $V(G) = E - N + 2 = 9 - 8 + 2 = 3$ (Terdapat 3 jalur independen yang harus diuji).
*   **Jalur Independen (Independent Paths):**
    *   *Path 1:* 1 - 2 - 3 - 7 - 8
    *   *Path 2:* 1 - 2 - 4 - 5 - 7 - 8
    *   *Path 3:* 1 - 2 - 4 - 6 - 7 - 8

### D. Tabel Kasus Uji Basis Path (White-Box Test Cases)
| ID Uji | Input Nominal (Amount) | Jalur yang Dilalui | Ekspektasi Admin Fee | Ekspektasi Total Potong | Status |
|---|---|---|---|---|---|
| WT-RF-01 | Rp 30.000 | Path 1 | Rp 5.000 | Rp 35.000 | Lulus |
| WT-RF-02 | Rp 200.000 | Path 2 | Rp 20.000 | Rp 220.000 | Lulus |
| WT-RF-03 | Rp 1.000.000 | Path 3 | Rp 50.000 | Rp 1.050.000 | Lulus |

---

## 1.2 Black-Box Testing oleh Rayhan Abdul Fikri
| ID Uji | Fitur | Skenario | Ekspektasi Hasil | Status |
|---|---|---|---|---|
| BB-RF-01 | Pembayaran Escrow | Pendaki membayar booking guide seharga Rp 400.000 dengan saldo dompet mencukupi. | Saldo berkurang sebesar Rp 444.000 (Jasa Rp 400.000 + PPN 11% senilai Rp 44.000) dan status booking berubah menjadi "Telah Dibayar". | Lulus |
| BB-RF-02 | Filter Gunung Guide | Membuka modal booking untuk guide yang memiliki spesialisasi khusus "Gunung Semeru". | Dropdown gunung tujuan di dalam modal booking hanya menampilkan opsi "Gunung Semeru". Gunung lain otomatis disembunyikan. | Lulus |

---

# BAGIAN 2: PENGUJIAN OLEH MUHAMMAD UBAIDILLAH ROSYID (NIM: 24.240.0101)
**Peran:** Full-Stack Developer  
**Fokus Area:** Integrasi Supabase, Mekanisme Optimistic Update, Rollback Asinkronus, dan Escrow.

## 2.1 White-Box Testing: Mekanisme Optimistic Update & Rollback
Fungsi `updateMountain` melakukan perubahan lokal di browser klien sebelum mengirim data ke Supabase. Jika transaksi database gagal, sistem melakukan query penarikan ulang (*re-fetch*) data asli dari database untuk memulihkan (*rollback*) data klien.

### A. Kode Sumber yang Diuji:
```typescript
const updateMountain = async (name: string, fields: Partial<Mountain>) => {
  setMountains((prev) => prev.map((m) => (m.name === name ? { ...m, ...fields } : m))); // Node 1
  try {                                                                                // Node 2
    const { error } = await supabase.from("mountains").update(dbFields).eq("name", name); // Node 3
    if (error) throw error;                                                            // Node 4
    logUserActivity("admin1", "Super Admin", "admin", `Memperbarui data Gunung ${name}`); // Node 5
  } catch (err: any) {                                                                 // Node 6
    const { data: mtnData } = await supabase.from("mountains").select("*");            // Node 7
    if (mtnData) {
      setMountains(mtnData.map((m: any) => ({ ...m })));                               // Node 8 (Rollback)
    }
  }                                                                                    // Node 9 (End)
};
```

### B. Diagram Alir Kontrol (Control Flow Graph - CFG)
```
            [ Node 1: Optimistic Update state lokal ]
                               │
                               ▼
                    [ Node 2: Entry block try ]
                               │
                               ▼
               [ Node 3: supabase.update() call ]
                               │
                               ▼
                     [ Node 4: error thrown? ]
                       /                   \
                True  /                     \ False
                     ▼                       ▼
            [ Node 6: catch block ]     [ Node 5: logUserActivity ]
                     │                       │
                     ▼                       │
            [ Node 7: supabase.select() ]    │
                     │                       │
                     ▼                       │
            [ Node 8: Rollback state lokal ] │
                     │                       │
                     └───────────────────────┼┘
                                             ▼
                                      [ Node 9: End ]
```

### C. Deskripsi Teknis Flowgraph untuk AI (Promp Generator)
*   **Struktur Node:**
    *   **Node 1 (Sequential):** Memicu `setMountains` secara lokal (*optimistic*).
    *   **Node 2 (Sequential):** Blok pembuka asinkronus `try`.
    *   **Node 3 (Sequential):** Pemanggilan `supabase.from('mountains').update(...)` ke server Supabase.
    *   **Node 4 (Decision):** Deteksi kondisi apakah objek `error` Supabase bernilai true (terdapat error).
    *   **Node 5 (Sequential):** Eksekusi sukses jika tidak ada error (pencatatan log aktivitas admin).
    *   **Node 6 (Sequential):** Blok `catch` yang menangkap error jika terjadi exception/kegagalan koneksi.
    *   **Node 7 (Sequential):** Melakukan query pemulihan data `supabase.from('mountains').select('*')`.
    *   **Node 8 (Sequential):** Pemanggilan `setMountains(mtnData)` untuk mengembalikan data lokal ke kondisi semula (*rollback*).
    *   **Node 9 (Sequential):** Mengakhiri eksekusi fungsi.
*   **Formula Kompleksitas Siklomatis (Cyclomatic Complexity):**
    *   Jumlah Edges ($E$) = $9$
    *   Jumlah Nodes ($N$) = $9$
    *   Kompleksitas $V(G) = E - N + 2 = 9 - 9 + 2 = 2$ (Terdapat 2 jalur independen).
*   **Jalur Independen (Independent Paths):**
    *   *Path 1 (Sukses):* 1 - 2 - 3 - 4 - 5 - 9
    *   *Path 2 (Gagal):* 1 - 2 - 3 - 4 - 6 - 7 - 8 - 9

### D. Tabel Kasus Uji Basis Path (White-Box Test Cases)
| ID Uji | Kondisi Jaringan | Hasil Query Supabase | Ekspektasi Tampilan UI | Status |
|---|---|---|---|---|
| WT-UR-01 | Stabil (Online) | Sukses (error = null) | Status Gunung Semeru ter-update permanen. | Lulus |
| WT-UR-02 | Putus (Offline) | Gagal (error = true) | Sempat berubah sejenak, lalu kembali ke status awal (Rollback). | Lulus |

---

## 2.2 Black-Box Testing oleh Muhammad Ubaidillah Rosyid
| ID Uji | Fitur | Skenario | Ekspektasi Hasil | Status |
|---|---|---|---|---|
| BB-UR-01 | Pengembalian Deposit | Admin menekan tombol "Selesai" pada transaksi sewa alat tanpa ada laporan kerusakan. | Status rental selesai, jaminan deposit Rp 100.000 otomatis ditransfer kembali ke dompet pendaki. | Lulus |
| BB-UR-02 | Klaim Denda Kerusakan | Vendor mengajukan denda kerusakan tenda sebesar Rp 60.000 saat pengembalian barang. | Saldo deposit jaminan pendaki dipotong Rp 60.000 (ditransfer ke Vendor) dan sisa deposit Rp 40.000 dikembalikan ke Pendaki. | Lulus |

---

# BAGIAN 3: PENGUJIAN OLEH RYAN NUGRAHA ADHITHAMA (NIM: 25.240.0007)
**Peran:** UI/UX Designer & QA Frontend  
**Fokus Area:** Desain Responsif, Scrollable View, dan Backdrop Click Dismissal.

## 3.1 White-Box Testing: Logika Penutupan Modal & Backdrop Clicks
Fungsi penanganan klik pada backdrop luar modal berfungsi menutup modal booking (`setBookingModalOpen(false)`), sedangkan klik di dalam modal dihentikan rambatannya (`e.stopPropagation()`) agar modal tidak tertutup tidak sengaja.

### A. Kode Sumber yang Diuji:
```typescript
const handleBackdropClick = (e: React.MouseEvent) => {
  setBookingModalOpen(false);  // Node 1 (Tutup Modal)
}

const handleModalBoxClick = (e: React.MouseEvent) => {
  e.stopPropagation();         // Node 2 (Cegah Rambatan Event Click)
}
```

### B. Diagram Alir Kontrol (Control Flow Graph - CFG)
```
                  [ Node 1: Event Click Terjadi ]
                                 │
                                 ▼
                     [ Node 2: Klik di luar modal? ]
                       /                         \
                True  /                           \ False
                     ▼                             ▼
         [ Node 3: Panggil setOpen(false) ]    [ Node 4: e.stopPropagation() ]
                     │                             │
                     └─────────────────────────────┼┘
                                                   ▼
                                            [ Node 5: End ]
```

### C. Deskripsi Teknis Flowgraph untuk AI (Promp Generator)
*   **Struktur Node:**
    *   **Node 1 (Sequential):** Event klik dideteksi oleh event listener terluar.
    *   **Node 2 (Decision):** Pengecekan posisi koordinat klik, apakah berada di elemen pembatas backdrop luar.
    *   **Node 3 (Sequential):** Jalur True (klik di luar), memicu perubahan state modal menjadi `false` (tutup).
    *   **Node 4 (Sequential):** Jalur False (klik di dalam kotak form), memicu instruksi penghentian gelembung event agar form tetap aktif.
    *   **Node 5 (Sequential):** Selesai memproses interaksi klik pengguna.
*   **Formula Kompleksitas Siklomatis (Cyclomatic Complexity):**
    *   Jumlah Edges ($E$) = $5$
    *   Jumlah Nodes ($N$) = $5$
    *   Kompleksitas $V(G) = E - N + 2 = 5 - 5 + 2 = 2$ (Terdapat 2 jalur pengujian independen).
*   **Jalur Independen (Independent Paths):**
    *   *Path 1 (Klik Luar):* 1 - 2 - 3 - 5
    *   *Path 2 (Klik Dalam):* 1 - 2 - 4 - 5

### D. Tabel Kasus Uji Basis Path (White-Box Test Cases)
| ID Uji | Titik Koordinat Klik | Target Element | Ekspektasi Kondisi Modal | Status |
|---|---|---|---|---|
| WT-RA-01 | Di luar kotak dialog modal | Backdrop gelap (`bg-black/60`) | Modal booking tertutup instan. | Lulus |
| WT-RA-02 | Di dalam formulir modal | Input field / Dropdown | Modal tetap terbuka, elemen input aktif/focus. | Lulus |

---

## 3.2 Black-Box Testing oleh Ryan Nugraha Adhithama
| ID Uji | Fitur | Skenario | Ekspektasi Hasil | Status |
|---|---|---|---|---|
| BB-RA-01 | Responsivitas Modal | Membuka modal booking guide di layar smartphone lebar 320px (iPhone SE). | Modal membatasi tinggi maksimal hingga 85% layar, memicu scrollbar vertikal pada form body secara mulus, dan tombol Batal/Kirim tetap menempel di bawah. | Lulus |
| BB-RA-02 | Scroll Area Form | Menggulir area tengah modal booking yang penuh dengan detail kalkulasi harga. | Guliran scroll lancar tanpa merusak tata letak tulisan header/judul dan tombol di kaki modal. | Lulus |

# Pengujian sistem

Pengujian dilakukan menggunakan metode White Box dan Black Box. Berikut adalah beberapa pengujian yang akan dilakukan terhadap sistem:

---

## 1. PENGUJIAN OLEH RYAN NUGRAHA ADHITHAMA (NIM: 25.240.0007)
**Peran:** UI/UX Designer & QA Frontend

### a. Pengujian White Box
Pengujian White Box berfokus pada struktur logika kode program. Kita akan menguji fungsi `handleConfirmBooking` yang ada di dalam file `GunungPage.tsx`. Fitur ini dipilih karena merupakan bagian penting dari sistem ayokmendaki.

#### Tabel Pengujian Whitebox
| Node | Source Code |
| :---: | :--- |
| 1 | `const handleConfirmBooking = () => {` |
| 2 | `  if (!bookingDate) {`<br>`    toast.error("silakan tentukan tanggal pendakian.");`<br>`    return;`<br>`  }` |
| 3 | `  if (climbersCount < 1) {`<br>`    toast.error("Jumlah pendaki minimal 1 orang.");`<br>`    return;`<br>`  }` |
| 4 | `  if (bookingMountain.basecamps && bookingMountain.basecamps.length > 0 && !selectedBasecamp) {`<br>`    toast.error("silakan pilih basecamp keberangkatan.");`<br>`    return;`<br>`  }` |
| 5 | `  const price = bookingMountain.ticketPrice * climbersCount;`<br>`  addBooking({`<br>`    mountainName: bookingMountain.name,`<br>`    basecamp: selectedBasecamp \|\| undefined,`<br>`    pendakiId: currentUser?.id \|\| "guest",`<br>`    pendakiName: currentUser?.name \|\| "Pendaki Demo",`<br>`    bookingDate,`<br>`    price,`<br>`    officialTicketBooking: true,`<br>`    bookingType: "mandiri"`<br>`  });`<br>`  setBookingModalOpen(false);`<br>`  toast.success(\`Berhasil memesan tiket masuk resmi \${bookingMountain.name}!\`, {`<br>`    description: \`Total Pembayaran: Rp \${price.toLocaleString("id-ID")}\`,`<br>`  });`<br>`  navigate("/dashboard");` |
| 6 | `  return;` |

#### Gambar Flowgraph
Proses Pemesanan Tiket (Nested-If Validation)
```
  ( 1 )
    │
    ▼
  ( 2 ) ──────────────┐
    │                 │
    ▼                 │
  ( 3 ) ────────┐     │
    │           │     │
    ▼           │     │
  ( 4 ) ──┐     │     │
    │     │     │     │
    ▼     │     │     │
  ( 5 )   │     │     │
    │     │     │     │
    ▼     ▼     ▼     ▼
  ( 6 ) <─────────────┘
```

Dari gambar ditentukan Cyclomatic Complexity:
$V(G) = E - N + 2$  
$E$ = Jumlah panah (edge) pada flowgraph = $8$  
$N$ = Jumlah lingkaran (node) pada flowgraph = $6$  
$V(G) = 8 - 6 + 2 = 4$

#### Tabel 1 Jalur Flowgraph
| Basis Flowgraph | Jalur Bebas | Keterangan |
| :---: | :---: | :--- |
| Jalur 1 | 1 - 2 - 6 | Validasi tanggal gagal dikarenakan `bookingDate` kosong |
| Jalur 2 | 1 - 2 - 3 - 6 | Validasi Jumlah Pendaki Gagal dikarenakan `climbersCount` kurang dari 1 |
| Jalur 3 | 1 - 2 - 3 - 4 - 6 | Validasi Basecamp Gagal. `bookingDate` terisi, `climbersCount` > 0, gunung memiliki opsi basecamp, tetapi `selectedBasecamp` kosong |
| Jalur 4 | 1 - 2 - 3 - 4 - 5 - 6 | Pemesanan Berhasil. Semua input valid dan terisi lengkap. Menampilkan jumlah pembayaran berdasarkan perhitungan. |

#### Tabel 2 Jalur Test Case
| Jalur | Skenario | Hasil yang diharapkan | Hasil Pengujian |
| :---: | :--- | :--- | :---: |
| Jalur 1 | Tidak mengisi data tanggal pendakian, atau `bookingDate` = "" | Sistem menghentikan proses dan menampilkan error "Silakan tentukan tanggal pendakian." | Sesuai |
| Jalur 2 | Mengisi data tanggal pendakian dengan benar. Mengisi data jumlah pendaki kurang dari 1 | Sistem menghentikan proses dan menampilkan error "Jumlah pendaki minimal 1 orang." | Sesuai |
| Jalur 3 | Mengisi data tanggal dengan benar dan jumlah pendaki lebih dari 0. Tidak memilih basecamp. | Sistem menghentikan proses dan menampilkan error "Silakan pilih basecamp keberangkatan." | Sesuai |
| Jalur 4 | Mengisi data tanggal dengan benar, data jumlah pendaki lebih dari 0, telah memilih basecamp keberangkatan. | Sistem menyelesaikan proses memesan tiket masuk dengan data yang telah diberikan. Kemudian menampilkan total pembayaran. | Sesuai |

### b. Pengujian Black Box
| No | Fitur Diuji | Tindakan Pengguna | Hasil Pengujian | Kesimpulan |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Akses Pemesanan (Belum Login) | Mengklik tombol "Pesan Tiket" saat `currentUser` = null | Muncul pesan peringatan: "Silakan masuk terlebih dahulu untuk memesan tiket." dan dialihkan ke halaman `/login`. | Valid |
| 2 | Hak Akses Role (Bukan Pendaki) | Mengklik tombol "Pesan Tiket" dengan akun role = "admin" | Muncul pesan kesalahan: "Hanya Pendaki yang dapat memesan tiket." | Valid |
| 3 | Validasi Tanggal Kosong | Mengosongkan kolom tanggal, lalu mengklik "Konfirmasi Booking" | Muncul pesan kesalahan: "Silakan tentukan tanggal pendakian." | Valid |
| 4 | Validasi Jumlah Pendaki (< 1) | Memasukkan angka 0 atau -1 pada jumlah pendaki | Muncul pesan kesalahan: "Jumlah pendaki minimal 1 orang." | Valid |
| 5 | Validasi Pilihan Basecamp | Tidak memilih basecamp pada gunung yang memiliki daftar pilihan basecamp | Muncul pesan kesalahan: "Silakan pilih basecamp keberangkatan." | Valid |
| 6 | Sukses Pemesanan | Mengisi tanggal valid, jumlah pendaki = 2, memilih basecamp, klik "Konfirmasi" | Muncul pesan sukses: "Berhasil memesan tiket masuk resmi...", menghitung total harga dengan benar (`ticketPrice * 2`), dan dialihkan ke `/dashboard`. | Valid |

---

## 2. PENGUJIAN OLEH RAYHAN ABDUL FIKRI (NIM: 24.240.0108)
**Peran:** Project Manager & QA Lead

### a. Pengujian White Box
Pengujian White Box berfokus pada struktur logika kode program. Kita akan menguji fungsi `calculateWithdrawalFee` yang ada di dalam file `DashboardPage.tsx`. Fitur ini dipilih karena merupakan alur perhitungan tarif progresif biaya admin yang krusial.

#### Tabel Pengujian Whitebox
| Node | Source Code |
| :---: | :--- |
| 1 | `const calculateWithdrawalFee = (amount: number): number => {` |
| 2 | `  if (!amount \|\| amount < 10000)` |
| 3 | `    return 0;` |
| 4 | `  if (amount <= 500000)` |
| 5 | `    return 3000;` |
| 6 | `  else if (amount <= 1000000)` |
| 7 | `    return 3500;` |
| 8 | `  else if (amount <= 1500000)` |
| 9 | `    return 4000;` |
| 10 | `  else if (amount <= 2000000)` |
| 11 | `    return 4500;` |
| 12 | `  else {`<br>`    const extraAmount = amount - 2000000;`<br>`    const brackets = Math.ceil(extraAmount / 500000);`<br>`    return 4500 + brackets * 1000;`<br>`  }` |
| 13 | `};` |

#### Gambar Flowgraph
Proses Perhitungan Biaya Admin Progresif (Multi-Decision Waterfall)
```
          [ Node 1: Start ]
                  │
                  ▼
          [ Node 2: < 10k? ] ───────────────┐
           /              \                 │
      Yes /                \ No             │
         ▼                  ▼               │
    [ Node 3: ret 0 ]  [ Node 4: <= 500k? ] ├────────┐
         │              /                 \ │        │
         │         Yes /                   \│No      │
         │            ▼                     ▼        │
         │     [ Node 5: ret 3k ] [ Node 6: <= 1M? ] ├──────────────┐
         │            │            /              \  │              │
         │            │       Yes /                \ │No            │
         │            │          ▼                  ▼               │
         │            │     [ Node 7: ret 3.5k ] [ Node 8: <= 1.5M? ] ├─────────────┐
         │            │          │               /                 \  │             │
         │            │          │          Yes /                   \ │No           │
         │            │          │             ▼                     ▼              │
         │            │          │     [ Node 9: ret 4k ] [ Node 10: <= 2M? ] ├─────┼─────────────┐
         │            │          │             │            /              \  │     │             │
         │            │          │             │       Yes /                \ │No   │             │
         │            │          │             │          ▼                  ▼      │             │
         │            │          │             │     [ Node 11: ret 4.5k ] [ Node 12: formula ]   │
         │            │          │             │          │                   │     │             │
         └────────────┴──────────┴─────────────┴──────────┴───────────────────┴─────┴─────────────┘
                                                  │
                                                  ▼
                                          [ Node 13: Exit ]
```

Dari gambar ditentukan Cyclomatic Complexity:
$V(G) = E - N + 2$  
$E$ = Jumlah panah (edge) pada flowgraph = $18$  
$N$ = Jumlah lingkaran (node) pada flowgraph = $13$  
$V(G) = 18 - 13 + 2 = 7$

#### Tabel 1 Jalur Flowgraph
| Basis Flowgraph | Jalur Bebas | Keterangan |
| :---: | :---: | :--- |
| Jalur 1 | 1 - 2 - 3 - 13 | Nominal di bawah batas minimal penarikan Rp 10.000 (tidak dikenakan biaya) |
| Jalur 2 | 1 - 2 - 4 - 5 - 13 | Nominal $\le$ Rp 500.000 (biaya flat Rp 3.000) |
| Jalur 3 | 1 - 2 - 4 - 6 - 7 - 13 | Nominal Rp 500.001 s/d Rp 1.000.000 (biaya flat Rp 3.500) |
| Jalur 4 | 1 - 2 - 4 - 6 - 8 - 9 - 13 | Nominal Rp 1.000.001 s/d Rp 1.500.000 (biaya flat Rp 4.000) |
| Jalur 5 | 1 - 2 - 4 - 6 - 8 - 10 - 11 - 13 | Nominal Rp 1.500.001 s/d Rp 2.000.000 (biaya flat Rp 4.500) |
| Jalur 6 | 1 - 2 - 4 - 6 - 8 - 10 - 12 - 13 | Nominal $>$ Rp 2.000.000 (biaya admin progresif per kelipatan Rp 500.000) |

#### Tabel 2 Jalur Test Case
| Jalur | Skenario | Hasil yang diharapkan | Hasil Pengujian |
| :---: | :--- | :--- | :---: |
| Jalur 1 | Input nominal Rp 5.000 | Mengembalikan nilai 0. | Sesuai |
| Jalur 2 | Input nominal Rp 200.000 | Mengembalikan nilai 3000. | Sesuai |
| Jalur 3 | Input nominal Rp 800.000 | Mengembalikan nilai 3500. | Sesuai |
| Jalur 4 | Input nominal Rp 1.200.000 | Mengembalikan nilai 4000. | Sesuai |
| Jalur 5 | Input nominal Rp 1.800.000 | Mengembalikan nilai 4500. | Sesuai |
| Jalur 6 | Input nominal Rp 3.000.000 | Mengembalikan nilai 6500 (`4500 + 2 * 1000`). | Sesuai |

### b. Pengujian Black Box
| No | Fitur Diuji | Tindakan Pengguna | Hasil Pengujian | Kesimpulan |
| :---: | :--- | :--- | :--- | :---: |
| 1 | PPN 11% Otomatis | Membayar pesanan booking guide senilai Rp 300.000 | Sistem secara otomatis menambahkan beban pajak PPN 11% senilai Rp 33.000, sehingga total bayar adalah Rp 333.000. | Valid |
| 2 | Verifikasi Rekening | Melakukan klik "Tarik Dana" saat data rekening bank di profil kosong | Penarikan diblokir dengan peringatan: "Anda belum mengatur rekening bank penarikan dana!". | Valid |

---

## 3. PENGUJIAN OLEH MUHAMMAD UBAIDILLAH ROSYID (NIM: 24.240.0101)
**Peran:** Full-Stack Developer

### a. Pengujian White Box
Pengujian White Box berfokus pada struktur logika kode program. Kita akan menguji fungsi `updateMountain` (proses pembaruan asinkronus Supabase & mekanisme rollback) di file `AppContext.tsx`. Fitur ini dipilih karena berkaitan erat dengan integritas data status buka/tutup gunung.

#### Tabel Pengujian Whitebox
| Node | Source Code |
| :---: | :--- |
| 1 | `const updateMountain = async (name: string, fields: Partial<Mountain>) => {`<br>`  setMountains((prev) => prev.map((m) => (m.name === name ? { ...m, ...fields } : m)));` |
| 2 | `  const dbFields: any = {};`<br>`  if (fields.status !== undefined) dbFields.status = fields.status; ...` |
| 3 | `  try {`<br>`    const { error } = await supabase.from("mountains").update(dbFields).eq("name", name);` |
| 4 | `    if (error) throw error;` |
| 5 | `    logUserActivity("admin1", "Super Admin", "admin", "Memperbarui data...");` |
| 6 | `  } catch (err: any) {`<br>`    console.error(err.message);`<br>`    toast.error("Gagal memperbarui status gunung");` |
| 7 | `    const { data: mtnData } = await supabase.from("mountains").select("*");` |
| 8 | `    if (mtnData) {` |
| 9 | `      setMountains(mtnData.map((m: any) => ({ ...m })));` |
| 10 | `    }`<br>`  }` |

#### Gambar Flowgraph
Proses Asinkronus Database & Rollback (Try-Catch Node)
```
          [ Node 1: Optimistic Local State Update ]
                              │
                              ▼
                [ Node 2: Map Database Fields ]
                              │
                              ▼
            [ Node 3: supabase.from().update() ]
                              │
                              ▼
                    [ Node 4: error thrown? ]
                      /                  \
               True  /                    \ False
                    ▼                      ▼
           [ Node 6: Catch block ]   [ Node 5: logUserActivity ]
                    │                      │
                    ▼                      │
         [ Node 7: supabase.select() ]     │
                    │                      │
                    ▼                      │
           [ Node 8: data null? ]          │
             /                \            │
        No  /                  \ Yes       │
           ▼                    │          │
    [ Node 9: Local Rollback ]  │          │
           │                    │          │
           └────────────────────┼──────────┘
                                ▼
                        [ Node 10: End ]
```

Dari gambar ditentukan Cyclomatic Complexity:
$V(G) = E - N + 2$  
$E$ = Jumlah panah (edge) pada flowgraph = $11$  
$N$ = Jumlah lingkaran (node) pada flowgraph = $10$  
$V(G) = 11 - 10 + 2 = 3$

#### Tabel 1 Jalur Flowgraph
| Basis Flowgraph | Jalur Bebas | Keterangan |
| :---: | :---: | :--- |
| Jalur 1 | 1 - 2 - 3 - 4 - 5 - 10 | Operasi database sukses, log aktivitas dicatat, status ter-update permanen. |
| Jalur 2 | 1 - 2 - 3 - 4 - 6 - 7 - 8 - 9 - 10 | Operasi database error (koneksi terputus), data cadangan ter-load, memicu rollback state UI. |
| Jalur 3 | 1 - 2 - 3 - 4 - 6 - 7 - 8 - 10 | Operasi database error, query cadangan gagal/data null (tidak memicu rollback). |

#### Tabel 2 Jalur Test Case
| Jalur | Skenario | Hasil yang diharapkan | Hasil Pengujian |
| :---: | :--- | :--- | :---: |
| Jalur 1 | Jaringan lancar, mengubah status Gunung Bromo menjadi "Buka" | Data tersimpan di Supabase database dan log tercatat. | Sesuai |
| Jalur 2 | Jaringan offline/gagal koneksi, mencoba edit status Gunung Bromo | Memicu eksekusi Catch, memicu select cadangan, dan state UI ter-rollback kembali ke "Tutup". | Sesuai |
| Jalur 3 | Database crash total (query select cadangan juga bernilai null) | Catch dieksekusi, select gagal, UI tidak di-rollback (data lokal tidak berubah). | Sesuai |

### b. Pengujian Black Box
| No | Fitur Diuji | Tindakan Pengguna | Hasil Pengujian | Kesimpulan |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Pengembalian Deposit | Admin menekan tombol "Selesai" pada transaksi sewa alat tanpa klaim denda | Status rental selesai, jaminan deposit Rp 100.000 otomatis ditransfer kembali ke dompet pendaki. | Valid |
| 2 | Pembatalan Booking | Menolak pesanan guide yang bertabrakan tanggal dengan jadwal sibuk guide | Booking guide otomatis dibatalkan, dana transaksi escrow dikembalikan utuh ke saldo pendaki. | Valid |

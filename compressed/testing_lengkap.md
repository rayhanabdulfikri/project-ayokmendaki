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
Proses Pemesanan Tiket
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
Pengujian White Box berfokus pada struktur logika kode program. Kita akan menguji fungsi `handleWithdrawSubmit` yang ada di dalam file `DashboardPage.tsx`. Fitur ini dipilih karena merupakan alur krusial penarikan dana keuangan platform.

#### Tabel Pengujian Whitebox
| Node | Source Code |
| :---: | :--- |
| 1 | `const handleWithdrawSubmit = (e: React.FormEvent) => {`<br>`  e.preventDefault();`<br>`  const amount = parseInt(depositAmountInput);` |
| 2 | `  if (!amount \|\| amount <= 0) {`<br>`    toast.error("Masukkan nominal yang valid!");`<br>`    return;`<br>`  }` |
| 3 | `  const currentBalance = currentUser?.role === "pendaki" ? climberDeposit : ...;`<br>`  if (amount > currentBalance) {`<br>`    toast.error("Saldo tidak mencukupi!");`<br>`    return;`<br>`  }` |
| 4 | `  if (!currentUser?.bank_account) {`<br>`    toast.error("Anda belum mengatur rekening bank penarikan dana!");`<br>`    return;`<br>`  }` |
| 5 | `  const fee = calculateWithdrawalFee(amount);`<br>`  const netReceived = amount - fee;`<br>`  setIsProcessingWd(true);`<br>`  setTimeout(() => {`<br>`    withdrawWallet(currentUser?.role, amount, ...);`<br>`    setIsProcessingWd(false);`<br>`    setWithdrawModalOpen(false);`<br>`    toast.success(\`Berhasil menarik dana sebesar Rp \${amount.toLocaleString("id-ID")}!\`);`<br>`  }, 2000);` |
| 6 | `  return;` |

#### Gambar Flowgraph
Proses Penarikan Dana (Withdrawal)
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
| Jalur 1 | 1 - 2 - 6 | Validasi nominal gagal dikarenakan nilai input kosong atau $\le 0$ |
| Jalur 2 | 1 - 2 - 3 - 6 | Validasi Saldo Gagal dikarenakan nominal penarikan melebihi saldo dompet |
| Jalur 3 | 1 - 2 - 3 - 4 - 6 | Validasi Rekening Gagal dikarenakan pengguna belum mengatur akun bank di profil |
| Jalur 4 | 1 - 2 - 3 - 4 - 5 - 6 | Penarikan Berhasil. Sistem menghitung biaya admin progresif, mendebet saldo, dan memicu status pengiriman. |

#### Tabel 2 Jalur Test Case
| Jalur | Skenario | Hasil yang diharapkan | Hasil Pengujian |
| :---: | :--- | :--- | :---: |
| Jalur 1 | Memasukkan nominal penarikan 0 atau kosong | Sistem menghentikan proses dan menampilkan error "Masukkan nominal yang valid!" | Sesuai |
| Jalur 2 | Nominal penarikan Rp 500.000, sedangkan saldo dompet hanya Rp 200.000 | Sistem menghentikan proses dan menampilkan error "Saldo tidak mencukupi!" | Sesuai |
| Jalur 3 | Saldo mencukupi, namun profil akun tidak memiliki informasi nomor rekening bank | Sistem menghentikan proses dan menampilkan error "Anda belum mengatur rekening bank penarikan dana!" | Sesuai |
| Jalur 4 | Saldo mencukupi, input valid, nomor rekening bank terkonfigurasi | Sistem memproses penarikan, memotong saldo, mengenakan biaya admin sesuai jenjang, dan menampilkan toast sukses. | Sesuai |

### b. Pengujian Black Box
| No | Fitur Diuji | Tindakan Pengguna | Hasil Pengujian | Kesimpulan |
| :---: | :--- | :--- | :--- | :---: |
| 1 | PPN 11% Otomatis | Membayar pesanan booking guide senilai Rp 300.000 | Sistem secara otomatis menambahkan beban pajak PPN 11% senilai Rp 33.000, sehingga total bayar adalah Rp 333.000. | Valid |
| 2 | Biaya Admin Progresif (< 50k) | Melakukan penarikan saldo sebesar Rp 40.000 | Saldo terpotong Rp 45.000 (penarikan Rp 40.000 + biaya flat admin Rp 5.000). | Valid |
| 3 | Biaya Admin Progresif (50k - 500k) | Melakukan penarikan saldo sebesar Rp 200.000 | Saldo terpotong Rp 220.000 (penarikan Rp 200.000 + biaya admin 10% senilai Rp 20.000). | Valid |
| 4 | Biaya Admin Progresif (> 500k) | Melakukan penarikan saldo sebesar Rp 1.000.000 | Saldo terpotong Rp 1.050.000 (penarikan Rp 1.000.000 + biaya admin 5% senilai Rp 50.000). | Valid |

---

## 3. PENGUJIAN OLEH MUHAMMAD UBAIDILLAH ROSYID (NIM: 24.240.0101)
**Peran:** Full-Stack Developer

### a. Pengujian White Box
Pengujian White Box berfokus pada struktur logika kode program. Kita akan menguji fungsi `handleConfirmBooking` pada pemesanan jasa guide di file `GuidePage.tsx`. Fitur ini dipilih karena merupakan alur penting yang menangani jaminan deposit, negosiasi harga, dan validasi jadwal sibuk guide.

#### Tabel Pengujian Whitebox
| Node | Source Code |
| :---: | :--- |
| 1 | `const handleConfirmBooking = () => {` |
| 2 | `  if (!bookingDate) {`<br>`    toast.error("Silakan tentukan tanggal pendakian.");`<br>`    return;`<br>`  }` |
| 3 | `  if (!targetMountain) {`<br>`    toast.error("Silakan pilih gunung tujuan.");`<br>`    return;`<br>`  }` |
| 4 | `  if (bookingGuide.busyDates && bookingGuide.busyDates.includes(bookingDate)) {`<br>`    toast.error("Guide sudah memiliki jadwal trip pada tanggal tersebut.");`<br>`    return;`<br>`  }` |
| 5 | `  if (currentUser && currentUser.role === "pendaki" && (climberDeposit \|\| 0) < 100000) {`<br>`    toast.error("Saldo deposit Anda kurang dari Rp 100.000.");`<br>`    return;`<br>`  }` |
| 6 | `  const basePriceProposed = parseInt(proposedPrice) \|\| bookingGuide.price;`<br>`  const finalPrice = Math.round(basePriceProposed * (1 - (bookingGuide.discountPercentage \|\| 0) / 100));`<br>`  addBooking({`<br>`    mountainName: targetMountain,`<br>`    guideId: bookingGuide.id,`<br>`    price: finalPrice * climbersCount,`<br>`    bookingType: "mandiri"`<br>`  });`<br>`  setBookingModalOpen(false);`<br>`  navigate("/dashboard");` |
| 7 | `  return;` |

#### Gambar Flowgraph
Proses Pemesanan Jasa Guide
```
    ( 1 )
      │
      ▼
    ( 2 ) ────────────────┐
      │                   │
      ▼                   │
    ( 3 ) ──────────┐     │
      │             │     │
      ▼             │     │
    ( 4 ) ────┐     │     │
      │       │     │     │
      ▼       │     │     │
    ( 5 ) ──┐ │     │     │
      │     │ │     │     │
      ▼     │ │     │     │
    ( 6 )   │ │     │     │
      │     │ │     │     │
      ▼     ▼ ▼     ▼     ▼
    ( 7 ) <───────────────┘
```

Dari gambar ditentukan Cyclomatic Complexity:
$V(G) = E - N + 2$  
$E$ = Jumlah panah (edge) pada flowgraph = $10$  
$N$ = Jumlah lingkaran (node) pada flowgraph = $7$  
$V(G) = 10 - 7 + 2 = 5$

#### Tabel 1 Jalur Flowgraph
| Basis Flowgraph | Jalur Bebas | Keterangan |
| :---: | :---: | :--- |
| Jalur 1 | 1 - 2 - 7 | Validasi tanggal gagal dikarenakan `bookingDate` kosong |
| Jalur 2 | 1 - 2 - 3 - 7 | Validasi Gunung Gagal dikarenakan `targetMountain` belum dipilih |
| Jalur 3 | 1 - 2 - 3 - 4 - 7 | Validasi Jadwal Gagal dikarenakan guide berstatus sibuk (*busy*) di tanggal tersebut |
| Jalur 4 | 1 - 2 - 3 - 4 - 5 - 7 | Validasi Deposit Gagal dikarenakan saldo deposit pendaki di bawah batas jaminan Rp 100.000 |
| Jalur 5 | 1 - 2 - 3 - 4 - 5 - 6 - 7 | Pemesanan Jasa Guide Berhasil. Transaksi dibuat dengan status menunggu konfirmasi. |

#### Tabel 2 Jalur Test Case
| Jalur | Skenario | Hasil yang diharapkan | Hasil Pengujian |
| :---: | :--- | :--- | :---: |
| Jalur 1 | Mengosongkan isian tanggal pemesanan | Sistem menghentikan proses dan menampilkan error "Silakan tentukan tanggal pendakian." | Sesuai |
| Jalur 2 | Mengisi tanggal dengan benar, mengosongkan pilihan gunung tujuan | Sistem menghentikan proses dan menampilkan error "Silakan pilih gunung tujuan." | Sesuai |
| Jalur 3 | Mengisi tanggal yang bertabrakan dengan jadwal sibuk (*busy dates*) guide | Sistem menghentikan proses dan menampilkan error "Guide sudah memiliki jadwal trip pada tanggal tersebut." | Sesuai |
| Jalur 4 | Mengisi formulir lengkap, namun saldo jaminan deposit di bawah Rp 100.000 | Sistem menghentikan proses dan menampilkan error "Saldo deposit Anda kurang dari Rp 100.000." | Sesuai |
| Jalur 5 | Seluruh data lengkap dan valid, serta saldo jaminan deposit mencukupi | Sistem berhasil membuat data booking guide baru dan mengarahkan pengguna ke halaman dashboard. | Sesuai |

### b. Pengujian Black Box
| No | Fitur Diuji | Tindakan Pengguna | Hasil Pengujian | Kesimpulan |
| :---: | :--- | :--- | :--- | :---: |
| 1 | Validasi Batas Deposit | Melakukan booking guide saat saldo deposit = Rp 80.000 | Proses ditolak dengan pesan kesalahan: "Saldo deposit Anda kurang dari Rp 100.000." | Valid |
| 2 | Verifikasi Data Admin | Super Admin menyetujui akun Guide pendaftar baru | Status guide berubah menjadi terverifikasi, profil guide langsung terpublikasi di halaman pencarian guide. | Valid |
| 3 | Pembaruan Buka/Tutup Gunung | Admin mengubah status Gunung Bromo dari "Buka" menjadi "Tutup" | Status gunung langsung ter-update di database Supabase dan memicu toast sukses. Perubahan tetap persis saat di-refresh. | Valid |
| 4 | Fitur In-App Chat | Mengirim pesan ke sesama pengguna (pendaki ke guide) | Pesan terkirim secara instan ke database chat dan muncul di sisi penerima secara real-time. | Valid |

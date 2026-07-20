# LAPORAN PENGUJIAN SISTEM (TESTING) - BAGIAN 3
**Nama:** Ryan Anugrah  
**NIM:** 2026071903  
**Peran:** UI/UX Designer & QA Frontend  

Laporan ini berisi dokumentasi pengujian perangkat lunak sistem **AyokMendaki** menggunakan metode **White-Box Testing** dan **Black-Box Testing** yang berfokus pada responsivitas antarmuka, tata letak (*layout*) modal formulir booking, interaksi scroll layar HP/mobile, serta mekanisme penutupan modal via klik backdrop.

---

## 1. WHITE-BOX TESTING (PENGUJIAN KOTAK PUTIH)

White-box testing berfokus pada struktur DOM, komposisi kelas CSS Tailwind/Vanilla, dan logika event handling untuk menjamin fleksibilitas antarmuka pengguna (*UI layout validation*).

### A. Pengujian Struktur Kelas Flexbox dan Batasan Tinggi (*Max-Height Limit*) Modal
Pengujian ini memeriksa apakah modal tersusun atas elemen flexbox yang tepat sehingga bagian header dan footer tetap berada pada posisinya (fixed/shrink-0) sedangkan bagian form body dapat digulirkan (overflow-y-auto) ketika tinggi konten melebihi tinggi layar (viewport).

#### Potongan Kode Layout Modal (*Layout Code Structure* under Test):
```html
<div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
  <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative border border-gray-100 animate-in flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-hidden">
    <!-- Header (shrink-0) -->
    <div className="p-5 pb-3 border-b border-gray-100 relative shrink-0"> ... </div>
    
    <!-- Body (flex-1 overflow-y-auto) -->
    <div className="flex-1 overflow-y-auto p-5 space-y-4"> ... </div>
    
    <!-- Footer (shrink-0) -->
    <div className="p-4 border-t border-gray-100 flex gap-2.5 bg-gray-50/50 shrink-0"> ... </div>
  </div>
</div>
```

#### Jalur Kasus Uji Struktur Antarmuka (UI CSS Path Cases):
| ID Uji | Elemen Antarmuka | CSS Class di-Test | Ekspektasi Fungsi Layout | Status |
|---|---|---|---|---|
| WT-UI-01 | Container Modal Utama | `flex flex-col` | Menumpuk anak elemen (Header, Body, Footer) secara vertikal. | Lulus |
| WT-UI-02 | Frame Pembatas | `max-h-[85vh]` | Tinggi maksimal modal tidak akan melebihi 85% tinggi layar HP. | Lulus |
| WT-UI-03 | Body Form | `flex-1 overflow-y-auto` | Jika form sangat panjang, area body ini secara mandiri memicu scrollbar vertikal. | Lulus |
| WT-UI-04 | Header & Footer | `shrink-0` | Ketinggian header dan footer tetap stabil dan tidak mengecil/menyusut. | Lulus |

---

## 2. BLACK-BOX TESTING (PENGUJIAN KOTAK HITAM)

Black-box testing berfokus pada interaksi fisik pengguna dengan antarmuka modal pada berbagai resolusi layar.

### A. Skenario Pengujian: Interaksi Scroll Modal & Klik Backdrop Dismiss
Memverifikasi kenyamanan penggunaan formulir booking guide pada perangkat HP berlayar kecil serta kemudahan keluar/menutup form (*minimize/dismiss*).

| ID Uji | Perangkat & Kondisi | Langkah Pengujian | Ekspektasi Hasil | Hasil Aktual | Kesimpulan |
|---|---|---|---|---|---|
| BB-UI-01 | Mobile (iPhone SE / Android screen 320px) | 1. Klik "Booking Jasa" pada profil guide.<br>2. Coba gulir/scroll layar ke bawah. | 1. Modal tidak terpotong.<br>2. Area form body dapat di-scroll ke bawah dengan mulus.<br>3. Tombol "Batal" dan "Kirim" tetap terlihat mengapung di bagian bawah modal. | Sesuai Ekspektasi | Lulus |
| BB-UI-02 | Klik Backdrop Dismissal | 1. Buka modal booking.<br>2. Klik di luar area kotak putih modal (pada area abu-abu transparan). | 1. Modal langsung tertutup/hilang secara instan.<br>2. Tidak ada data yang tersimpan. | Sesuai Ekspektasi | Lulus |
| BB-UI-03 | Klik Di Dalam Form (Stop Propagation) | 1. Buka modal booking.<br>2. Klik pada salah satu input (misal input NIK atau jumlah anggota). | 1. Modal tetap terbuka.<br>2. Input field ter-fokus dan siap menerima masukan teks.<br>3. Event click di dalam modal tidak memicu penutupan paksa. | Sesuai Ekspektasi | Lulus |

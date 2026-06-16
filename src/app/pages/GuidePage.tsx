import { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Search,
  Star,
  CheckCircle2,
  Filter,
  MapPin,
  MessageCircle,
  ChevronLeft,
  ChevronRight,
  Users,
  Calendar,
  DollarSign,
  Mountain as MountainIcon,
  X,
  Award
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 4;
export function GuidePage() {
  const { guides, mountains, currentUser, addBooking, createNegotiation, climberDeposit } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("Semua");
  const [currentPage, setCurrentPage] = useState(1);

  // Booking Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingGuide, setBookingGuide] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [targetMountain, setTargetMountain] = useState("");
  const [proposedPrice, setProposedPrice] = useState("");
  const [negoNotes, setNegoNotes] = useState("");
  const [climbersCount, setClimbersCount] = useState(1);
  const [selectedBasecamp, setSelectedBasecamp] = useState("");

  const filterOptions = ["Semua", "Rating Tertinggi", "Harga Terendah", "Paling Berpengalaman", "Jawa Timur", "Jawa Tengah"];

  const filtered = useMemo(() => {
    let result = [...guides];
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (g) => g.name.toLowerCase().includes(q) || g.specialty.toLowerCase().includes(q) || g.location.toLowerCase().includes(q)
      );
    }
    if (activeFilter === "Rating Tertinggi") result.sort((a, b) => b.rating - a.rating);
    else if (activeFilter === "Harga Terendah") result.sort((a, b) => a.price - b.price);
    else if (activeFilter === "Paling Berpengalaman") result.sort((a, b) => parseInt(b.experience) - parseInt(a.experience));
    else if (activeFilter === "Jawa Timur") result = result.filter((g) => g.location.includes("Jawa Timur") || g.location.includes("Malang") || g.location.includes("Probolinggo"));
    else if (activeFilter === "Jawa Tengah") result = result.filter((g) => g.location.includes("Jawa Tengah") || g.location.includes("Solo") || g.location.includes("Boyolali") || g.location.includes("Magelang"));
    return result;
  }, [searchQuery, activeFilter, guides]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (f: string) => {
    setActiveFilter(f);
    setCurrentPage(1);
  };

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setCurrentPage(1);
  };

  const handleOpenBooking = (guide: any) => {
    if (!currentUser) {
      toast.warning("Silakan masuk terlebih dahulu untuk menyewa guide.");
      navigate("/login");
      return;
    }
    
    if (guide.status !== "Aktif") {
      toast.error(`Guide ${guide.name} sedang tidak aktif / libur.`);
      return;
    }

    // Filter open mountains
    const openM = mountains.filter(m => m.status === "Buka");
    if (openM.length === 0) {
      toast.error("Tidak ada gunung yang buka untuk pendakian saat ini.");
      return;
    }

    setBookingGuide(guide);
    setBookingDate("");
    setTargetMountain(openM[0].name);
    setProposedPrice(guide.price.toString());
    setNegoNotes("");
    setClimbersCount(1);
    setSelectedBasecamp("");
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!bookingDate) {
      toast.error("Silakan tentukan tanggal pendakian.");
      return;
    }
    if (!targetMountain) {
      toast.error("Silakan pilih gunung tujuan.");
      return;
    }
    if (bookingGuide.busyDates && bookingGuide.busyDates.includes(bookingDate)) {
      toast.error(`Guide ${bookingGuide.name} sudah memiliki jadwal trip (busy) pada tanggal ${bookingDate}. Silakan pilih tanggal lain.`);
      return;
    }

    const selectedMtnObj = mountains.find((m) => m.name === targetMountain);
    if (selectedMtnObj && selectedMtnObj.basecamps && selectedMtnObj.basecamps.length > 0 && !selectedBasecamp) {
      toast.error("Silakan pilih basecamp keberangkatan.");
      return;
    }

    if (currentUser && currentUser.role === "pendaki" && (climberDeposit || 0) < 100000) {
      toast.error("Saldo deposit Anda kurang dari Rp 100.000. Silakan lakukan Top Up di Dashboard terlebih dahulu.");
      return;
    }

    const basePriceProposed = parseInt(proposedPrice) || bookingGuide.price;
    const discountPercent = bookingGuide.groupDiscountEnabled ? (climbersCount >= 5 ? 30 : climbersCount >= 4 ? 20 : climbersCount >= 2 ? 10 : 0) : 0;
    const finalPricePerPerson = Math.round(basePriceProposed * (1 - discountPercent / 100));
    const finalTotalPrice = finalPricePerPerson * climbersCount;

    // 1. Create Booking in Pending status
    const bookingId = addBooking({
      mountainName: targetMountain,
      basecamp: selectedBasecamp || undefined,
      guideId: bookingGuide.id,
      guideName: bookingGuide.name,
      pendakiId: currentUser?.id || "guest",
      pendakiName: currentUser?.name || "Pendaki Demo",
      bookingDate,
      price: finalTotalPrice,
      bookingType: "mandiri",
      climbersCount: climbersCount
    });

    // 2. If price is different, create negotiation entry
    if (basePriceProposed !== bookingGuide.price) {
      createNegotiation({
        type: "guide",
        orderId: bookingId,
        itemName: `Jasa Guide ${bookingGuide.name} (${targetMountain})`,
        originalPrice: bookingGuide.price,
        proposedPrice: basePriceProposed,
        senderName: currentUser?.name || "Pendaki Demo",
        recipientId: bookingGuide.id,
        recipientName: bookingGuide.name,
        notes: negoNotes || "Tawaran harga dari pendaki."
      });
      toast.success("Pengajuan booking dengan negosiasi harga dikirim!", {
        description: `Menunggu tanggapan dari Guide ${bookingGuide.name}.`,
      });
    } else {
      toast.success("Pengajuan booking terkirim!", {
        description: `Menunggu konfirmasi jadwal dari Guide ${bookingGuide.name}.`,
      });
    }

    setBookingModalOpen(false);
    navigate("/dashboard");
  };

  const handleChatGuide = (guide: any) => {
    if (!currentUser) {
      toast.warning("Silakan masuk terlebih dahulu untuk mengirim pesan.");
      navigate("/login");
      return;
    }
    navigate("/dashboard", {
      state: { activeTab: "chat", partnerId: guide.id, partnerName: guide.name }
    });
  };

  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Guide Profesional Bersertifikasi</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Temukan guide pendakian terpercaya dengan sertifikasi resmi APIGI/HPI dan pengalaman terbukti
          </p>
        </div>
      </section>

      {/* Search & Filter Section */}
      <section className="bg-white border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Cari nama guide atau spesialisasi gunung..."
                className="pl-10 bg-input-background"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            <Button variant="outline" className="sm:w-auto">
              <Filter className="size-4 mr-2" />
              Filter
            </Button>
          </div>

          <div className="flex gap-2 mt-4 flex-wrap">
            {filterOptions.map((f) => (
              <Badge
                key={f}
                variant={activeFilter === f ? "secondary" : "outline"}
                className={`cursor-pointer transition-colors ${
                  activeFilter === f
                    ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                    : "hover:bg-emerald-50"
                }`}
                onClick={() => handleFilterChange(f)}
              >
                {f}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Guides Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Menampilkan{" "}
              <span className="font-medium text-foreground">
                {filtered.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
              </span>{" "}
              dari <span className="font-medium text-foreground">{filtered.length}</span> guide tersedia
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="size-4 text-emerald-600" />
              <span>Semua guide terdaftar telah melewati verifikasi APIGI/HPI</span>
            </div>
          </div>

          {paginated.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              <Users className="size-12 mx-auto mb-4 opacity-30" />
              <p className="text-lg font-medium">Tidak ada guide ditemukan</p>
              <p className="text-sm mt-1">Coba ubah kata kunci atau filter pencarian</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((guide, index) => (
                <Card key={index} className="hover:shadow-lg transition-all flex flex-col justify-between">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <Avatar className="size-16 border border-emerald-50 bg-emerald-50">
                        <AvatarImage src={guide.avatar} alt={guide.name} />
                        <AvatarFallback>{guide.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <CardTitle className="text-lg truncate">{guide.name}</CardTitle>
                          {guide.verified ? (
                            <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 text-[10px] h-5 py-0">
                              <CheckCircle2 className="size-3 mr-0.5" />
                              Verified
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-200 text-[10px] h-5 py-0">
                              Pending Verifikasi
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 font-semibold truncate">{guide.specialty}</p>
                        <p className="text-[10px] text-emerald-800 font-bold bg-emerald-50/50 border border-emerald-100 rounded px-1.5 py-0.5 mt-1 max-w-max">
                          🗻 Spesialisasi: {guide.specialtyMountains.join(", ")}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                          <MapPin className="size-3" />
                          {guide.location}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pt-0">
                    <div className="flex items-center justify-between text-xs border-t border-gray-50 pt-2.5">
                      <span className="text-muted-foreground">Pengalaman</span>
                      <span className="font-bold text-gray-800">{guide.experience}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Total Trip</span>
                      <span className="font-bold text-gray-800">{guide.trips} pendakian</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Rating & Ulasan</span>
                      <div className="flex items-center gap-1">
                        <Star className="size-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="font-bold text-gray-800">{guide.rating}</span>
                      </div>
                    </div>
                    
                    {/* Availability Status Badge */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Status Pemandu</span>
                      <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        guide.status === "Aktif" 
                          ? "bg-green-50 text-green-700 border-green-200" 
                          : guide.status === "Libur" 
                          ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                          : "bg-red-50 text-red-700 border-red-200"
                      }`}>
                        <span className={`size-1.5 rounded-full ${
                          guide.status === "Aktif" ? "bg-green-500" : guide.status === "Libur" ? "bg-yellow-500" : "bg-red-500"
                        }`} />
                        {guide.status === "Aktif" ? "Aktif (Tersedia)" : guide.status === "Libur" ? "Sedang Libur" : "Non-Aktif"}
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-border">
                      <p className="text-[10px] text-muted-foreground mb-1.5 font-semibold">Sertifikasi & Lisensi:</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {guide.certifications.map((cert, i) => (
                          <Badge key={i} variant="outline" className="text-[9px] py-0 px-2 font-medium">
                            {cert}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground leading-none mb-1">Tarif Guide Harian</p>
                          <p className="font-bold text-emerald-600 text-base">Rp {guide.price.toLocaleString("id-ID")}<span className="text-[10px] text-gray-400 font-normal">/hari</span></p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 text-xs"
                          onClick={() => handleChatGuide(guide)}
                        >
                          <MessageCircle className="size-4 mr-1 text-emerald-600" />
                          Chat
                        </Button>
                        <Button 
                          size="sm" 
                          className={`flex-1 text-xs font-semibold ${guide.status === "Aktif" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300"}`}
                          disabled={guide.status !== "Aktif"}
                          onClick={() => handleOpenBooking(guide)}
                        >
                          Booking Jasa
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 mt-12">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="size-4" />
                Sebelumnya
              </Button>

              {getPageNumbers().map((page, i) =>
                page === "..." ? (
                  <span key={`dots-${i}`} className="px-2 text-muted-foreground">...</span>
                ) : (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    className={`min-w-9 ${currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                    onClick={() => setCurrentPage(Number(page))}
                  >
                    {page}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Berikutnya
                <ChevronRight className="size-4" />
              </Button>
            </div>
          )}

          {totalPages > 1 && (
            <p className="text-center text-xs text-muted-foreground mt-3">
              Halaman {currentPage} dari {totalPages}
            </p>
          )}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold mb-4 text-center">Jaminan Layanan Jasa Guide Gunung</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="text-center">
                <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="size-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1.5 text-sm">Terverifikasi Resmi</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Admin memverifikasi lisensi APIGI, HPI, atau K3 Gunung dari setiap guide yang terdaftar</p>
              </div>
              <div className="text-center">
                <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <Star className="size-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1.5 text-sm">Negosiasi Fleksibel</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Anda bebas mengajukan penawaran harga sesuai dengan durasi dan rute pendakian</p>
              </div>
              <div className="text-center">
                <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                  <MessageCircle className="size-6 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-gray-800 mb-1.5 text-sm">Escrow Aman</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Dana Anda ditahan di platform dan baru dicairkan setelah guide menyelesaikan check-in Finish</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Guide Booking & Price Nego Modal ── */}
      {bookingModalOpen && bookingGuide && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200 font-sans">
            <button onClick={() => setBookingModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <Award className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Booking & Nego Jasa Guide</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Kirimkan pengajuan jadwal dan tawarkan harga jasa guide. Guide berhak menyetujui, menolak, atau menawarkan harga balik.
            </p>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <Avatar className="size-11">
                  <AvatarImage src={bookingGuide.avatar} />
                  <AvatarFallback>{bookingGuide.name[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold text-gray-800">{bookingGuide.name}</p>
                  <p className="text-xs text-emerald-700 font-semibold">{bookingGuide.specialty}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Pilih Gunung Tujuan</label>
                  <div className="relative">
                    <MountainIcon className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <select 
                      className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 bg-gray-50 rounded-lg focus:bg-white focus:outline-emerald-500"
                      value={targetMountain}
                      onChange={(e) => setTargetMountain(e.target.value)}
                    >
                      {mountains.filter(m => m.status === "Buka").map((m) => (
                        <option key={m.name} value={m.name}>{m.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Tanggal Pendakian</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <Input 
                      type="date" 
                      className="pl-9 text-xs" 
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>

              {bookingGuide.busyDates && bookingGuide.busyDates.length > 0 && (
                <div className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                  ⚠️ <b>Jadwal Booked / Sibuk Guide:</b>
                  <div className="flex gap-1.5 flex-wrap mt-1">
                    {bookingGuide.busyDates.map((d: string) => (
                      <span key={d} className="bg-white border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-bold text-amber-800">{d}</span>
                    ))}
                  </div>
                  <p className="text-[9px] text-gray-500 mt-1">Guide tidak dapat dipesan pada tanggal-tanggal di atas.</p>
                </div>
              )}
              
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Jumlah Anggota Rombongan</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <Input 
                    type="number" 
                    min={1} 
                    className="pl-9 text-xs bg-white text-gray-800" 
                    value={climbersCount}
                    onChange={(e) => setClimbersCount(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                </div>
              </div>

              {(() => {
                const selectedMtn = mountains.find((m) => m.name === targetMountain);
                if (!selectedMtn || !selectedMtn.basecamps || selectedMtn.basecamps.length === 0) return null;
                return (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">Pilih Jalur / Basecamp Pendakian</label>
                    <select
                      className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500 font-medium"
                      value={selectedBasecamp}
                      onChange={(e) => setSelectedBasecamp(e.target.value)}
                    >
                      <option value="">-- Pilih Basecamp --</option>
                      {selectedMtn.basecamps.map((bc: string) => (
                        <option key={bc} value={bc}>{bc}</option>
                      ))}
                    </select>
                  </div>
                );
              })()}

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Harga Awal Guide (Per Orang / Hari)</label>
                <div className="p-2.5 bg-gray-50 border border-gray-150 rounded-lg text-xs font-bold text-gray-750 flex justify-between">
                  <span>Tarif Normal:</span>
                  <span>Rp {bookingGuide.price.toLocaleString("id-ID")}</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Harga Penawaran Anda Per Orang (Nego)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 font-bold" />
                  <Input 
                    type="number" 
                    placeholder="Masukkan tawaran harga Anda" 
                    className="pl-9 text-xs font-bold text-emerald-700" 
                    value={proposedPrice}
                    onChange={(e) => setProposedPrice(e.target.value)}
                  />
                </div>
                <p className="text-[10px] text-gray-400 mt-1">Isi sama dengan tarif normal jika tidak ingin melakukan negosiasi.</p>
              </div>

              {/* Discount and Deposit Calculation Breakdown */}
              {(() => {
                const base = parseInt(proposedPrice) || bookingGuide.price;
                const isDiscEnabled = bookingGuide.groupDiscountEnabled;
                const disc = isDiscEnabled ? (climbersCount >= 5 ? 30 : climbersCount >= 4 ? 20 : climbersCount >= 2 ? 10 : 0) : 0;
                const ratePerPerson = Math.round(base * (1 - disc / 100));
                const subTotal = ratePerPerson * climbersCount;
                const deposit = 100000;

                return (
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Subtotal Sewa ({climbersCount} Orang):</span>
                      <span className="font-bold text-gray-700">Rp {subTotal.toLocaleString("id-ID")}</span>
                    </div>
                    {isDiscEnabled && disc > 0 && (
                      <div className="flex justify-between items-center text-emerald-700 font-semibold text-[11px]">
                        <span>Diskon Rombongan ({disc}%):</span>
                        <span>- Rp {Math.round(base * disc / 100 * climbersCount).toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-blue-700">
                      <span>Deposit Jaminan (Kembali Penuh):</span>
                      <span className="font-bold">Rp {deposit.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="border-t border-emerald-200/50 pt-2 flex justify-between items-center text-sm font-extrabold text-emerald-800">
                      <span>Total Bayar (Simulasi):</span>
                      <span>Rp {(subTotal + deposit).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                );
              })()}

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Catatan / Pesan Negosiasi</label>
                <textarea 
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500 h-16 resize-none"
                  placeholder="Contoh: Pendakian 2 hari 1 malam, rombongan 4 orang. Nego ya mas..."
                  value={negoNotes}
                  onChange={(e) => setNegoNotes(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setBookingModalOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleConfirmBooking}>Kirim Booking & Nego</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

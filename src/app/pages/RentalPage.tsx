import { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Search,
  Filter,
  CheckCircle2,
  Shield,
  Clock,
  ChevronLeft,
  ChevronRight,
  Package,
  MapPin,
  Calendar,
  MessageCircle,
  X,
  DollarSign,
  Mountain as MountainIcon
} from "lucide-react";
import { useApp, EquipmentItem } from "../context/AppContext";
import { useNavigate } from "react-router";
import { toast } from "sonner";

const ITEMS_PER_PAGE = 3;

export function RentalPage() {
  const { equipment, vendors, mountains, currentUser, addRentalOrder, createNegotiation } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("tent");
  
  // Distance filtering states
  const [selectedMountain, setSelectedMountain] = useState(mountains[0]?.name || "");
  const [filterRadius, setFilterRadius] = useState(false);

  // Pagination states
  const [pages, setPages] = useState<Record<string, number>>({ tent: 1, carrier: 1, other: 1 });

  // Rental Modal States
  const [rentalModalOpen, setRentalModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [proposedPrice, setProposedPrice] = useState("");
  const [negoNotes, setNegoNotes] = useState("");

  const currentPage = pages[activeTab] || 1;

  // Filter & Pagination logic
  const filteredData = useMemo(() => {
    let allItems = equipment.filter((eq) => eq.category === activeTab);

    // 1. Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      allItems = allItems.filter(
        (item) => item.name.toLowerCase().includes(q) || item.vendorName.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
      );
    }

    // 2. Filter by radius distance (max 10km from selected basecamp)
    if (filterRadius && selectedMountain) {
      allItems = allItems.filter((item) => {
        const vendor = vendors.find((v) => v.id === item.vendorId);
        if (!vendor) return false;
        const dist = vendor.distances[selectedMountain];
        return dist !== undefined && dist <= 10;
      });
    }

    return allItems;
  }, [searchQuery, activeTab, filterRadius, selectedMountain, equipment, vendors]);

  const totalPages = Math.ceil(filteredData.length / ITEMS_PER_PAGE);
  const paginated = filteredData.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const setPage = (tab: string, page: number) => setPages((prev) => ({ ...prev, [tab]: page }));

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    setPages({ tent: 1, carrier: 1, other: 1 });
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  const handleOpenRentalModal = (item: EquipmentItem) => {
    if (!currentUser) {
      toast.warning("Silakan masuk terlebih dahulu untuk menyewa alat.");
      navigate("/login");
      return;
    }

    setSelectedItem(item);
    setStartDate("");
    setEndDate("");
    setQuantity(1);
    setProposedPrice(item.price.toString());
    setNegoNotes("");
    setRentalModalOpen(true);
  };

  // Calculate rental days
  const getDaysDiff = (start: string, end: string): number => {
    if (!start || !end) return 1;
    const sDate = new Date(start);
    const eDate = new Date(end);
    const diffTime = Math.abs(eDate.getTime() - sDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  };

  const handleConfirmRental = () => {
    if (!startDate || !endDate) {
      toast.error("Silakan tentukan tanggal sewa.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      toast.error("Tanggal selesai harus setelah tanggal mulai.");
      return;
    }
    if (quantity < 1 || quantity > (selectedItem?.available || 0)) {
      toast.error(`Kuantitas sewa tidak valid (stok tersedia: ${selectedItem?.available}).`);
      return;
    }

    if (!selectedItem) return;

    const days = getDaysDiff(startDate, endDate);
    const originalPriceTotal = selectedItem.price * quantity * days;
    const priceProposedPerDay = parseInt(proposedPrice) || selectedItem.price;
    const proposedPriceTotal = priceProposedPerDay * quantity * days;

    // 1. Create Rental Order in Pending status
    const orderId = addRentalOrder({
      itemId: selectedItem.id,
      itemName: selectedItem.name,
      vendorId: selectedItem.vendorId,
      vendorName: selectedItem.vendorName,
      pendakiId: currentUser?.id || "guest",
      pendakiName: currentUser?.name || "Pendaki Demo",
      qty: quantity,
      startDate,
      endDate,
      totalPrice: proposedPriceTotal
    });

    // 2. If price is negotiated, submit negotiation entry
    if (priceProposedPerDay !== selectedItem.price) {
      createNegotiation({
        type: "rental",
        orderId,
        itemName: `${selectedItem.name} (${quantity} unit, ${days} hari)`,
        originalPrice: originalPriceTotal,
        proposedPrice: proposedPriceTotal,
        senderName: currentUser?.name || "Pendaki Demo",
        recipientId: selectedItem.vendorId,
        recipientName: selectedItem.vendorName,
        notes: negoNotes || `Tawaran sewa Rp ${priceProposedPerDay.toLocaleString()}/hari dari pendaki.`
      });
      toast.success("Pengajuan sewa alat dengan nego harga dikirim!", {
        description: `Menunggu konfirmasi ketersediaan barang dari Vendor.`,
      });
    } else {
      toast.success("Pengajuan sewa alat terkirim!", {
        description: `Menunggu konfirmasi ketersediaan barang dari Vendor.`,
      });
    }

    setRentalModalOpen(false);
    navigate("/dashboard");
  };

  const handleChatVendor = (vendorId: string, vendorName: string) => {
    if (!currentUser) {
      toast.warning("Silakan masuk terlebih dahulu untuk mengirim pesan.");
      navigate("/login");
      return;
    }
    navigate("/dashboard", {
      state: { activeTab: "chat", partnerId: vendorId, partnerName: vendorName }
    });
  };

  const getPageNumbers = () => {
    const pagesArr: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pagesArr.push(i);
    } else {
      pagesArr.push(1);
      if (currentPage > 3) pagesArr.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pagesArr.push(i);
      if (currentPage < totalPages - 2) pagesArr.push("...");
      pagesArr.push(totalPages);
    }
    return pagesArr;
  };

  const EquipmentCard = ({ item }: { item: EquipmentItem }) => {
    const vendor = vendors.find((v) => v.id === item.vendorId);
    const distance = vendor?.distances[selectedMountain] || 0;
    const isNearby = distance <= 10;

    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardContent className="flex flex-col sm:flex-row items-start gap-5 p-6">
          <div className="size-24 bg-emerald-50 text-emerald-600 rounded-2xl flex-shrink-0 overflow-hidden flex items-center justify-center border border-emerald-100 shadow-sm shrink-0">
            <Package className="size-12" />
          </div>
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-start justify-between gap-4 mb-1">
              <div>
                <h4 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 text-xs mb-3.5 mt-2 text-muted-foreground">
              <div className="flex items-center gap-1 font-semibold text-gray-700">
                <span>Vendor:</span>
                <span className="text-emerald-700 hover:underline cursor-pointer" onClick={() => handleChatVendor(item.vendorId, item.vendorName)}>
                  {item.vendorName}
                </span>
                {vendor?.verified && <CheckCircle2 className="size-3 text-emerald-600 inline" />}
              </div>
              <div className="flex items-center gap-1">
                <span className="text-yellow-500 font-bold">★</span>
                <span className="font-bold text-gray-700">{item.rating}</span>
              </div>
              <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-150">
                {item.available} Pcs Ready
              </Badge>
              
              {/* Distance label */}
              {selectedMountain && (
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border ${
                  isNearby ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-600 border-red-200"
                }`}>
                  <MapPin className="size-3 shrink-0" />
                  {distance.toFixed(1)} km dari Basecamp {selectedMountain} {isNearby ? "(<10km)" : "(Jauh)"}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between gap-4 border-t border-gray-50 pt-3">
              <div>
                <p className="text-[10px] text-gray-400 leading-none mb-1">Tarif Sewa</p>
                <span className="font-bold text-emerald-600 text-lg">Rp {item.price.toLocaleString("id-ID")}<span className="text-xs font-normal text-gray-400">/hari</span></span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="text-xs" onClick={() => handleChatVendor(item.vendorId, item.vendorName)}>
                  <MessageCircle className="size-4 mr-1 text-emerald-600" />
                  Chat
                </Button>
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs" onClick={() => handleOpenRentalModal(item)}>
                  Sewa Alat
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <section className="bg-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Rental Alat Pendakian</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Sewa perlengkapan outdoor berkualitas dari vendor terpercaya dengan jarak terdekat dari basecamp pendakian Anda
          </p>
        </div>
      </section>

      {/* Search, Distance & Filter Section */}
      <section className="bg-white border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4 space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Cari alat camping atau vendor..."
                className="pl-10 bg-input-background"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            {/* Mountain Basecamp Selector */}
            <div className="relative md:w-64">
              <MountainIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
              <select 
                className="w-full pl-9 pr-3 py-2 text-xs border border-gray-250 bg-gray-50 rounded-lg focus:bg-white focus:outline-emerald-500 h-10"
                value={selectedMountain}
                onChange={(e) => {
                  setSelectedMountain(e.target.value);
                  setPages({ tent: 1, carrier: 1, other: 1 });
                }}
              >
                {mountains.map((m) => (
                  <option key={m.name} value={m.name}>Basecamp {m.name}</option>
                ))}
              </select>
            </div>

            <Button variant="outline" className="h-10 text-xs shrink-0">
              <Filter className="size-4 mr-2" />
              Filter
            </Button>
          </div>

          {/* Max 10km Filter Switch */}
          <div className="flex items-center gap-2.5 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100 max-w-lg">
            <input 
              type="checkbox" 
              id="radiusFilter" 
              className="size-4 rounded accent-emerald-600 cursor-pointer"
              checked={filterRadius}
              onChange={(e) => {
                setFilterRadius(e.target.checked);
                setPages({ tent: 1, carrier: 1, other: 1 });
              }}
            />
            <label htmlFor="radiusFilter" className="text-xs font-bold text-emerald-800 cursor-pointer leading-tight">
              📍 Tampilkan Hanya Vendor Terdekat (Radius Maks. 10 Km dari basecamp {selectedMountain})
            </label>
          </div>
        </div>
      </section>

      {/* Equipment Tabs */}
      <section className="py-12">
        <div className="container mx-auto px-4 sm:px-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 max-w-md mx-auto">
              <TabsTrigger value="tent">Tenda</TabsTrigger>
              <TabsTrigger value="carrier">Carrier</TabsTrigger>
              <TabsTrigger value="other">Aksesoris/Lainnya</TabsTrigger>
            </TabsList>

            {(["tent", "carrier", "other"] as const).map((tab) => (
              <TabsContent key={tab} value={tab} className="space-y-4">
                <div className="mb-4 text-xs text-muted-foreground flex justify-between">
                  <span>Menampilkan <span className="font-semibold text-gray-800">{filteredData.length}</span> produk alat camping</span>
                  {filterRadius && <span className="text-emerald-700 font-semibold">Filter Radius Aktif (&le; 10 km)</span>}
                </div>
                {paginated.length === 0 ? (
                  <div className="text-center py-16 text-muted-foreground bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                    <Package className="size-12 mx-auto mb-3 opacity-30 text-gray-400" />
                    <p className="text-base font-bold text-gray-700">Tidak ada produk ditemukan</p>
                    <p className="text-xs mt-1 text-gray-400">Coba ubah kata kunci atau nonaktifkan filter radius 10 km</p>
                  </div>
                ) : (
                  paginated.map((item) => <EquipmentCard key={item.id} item={item} />)
                )}
                
                {/* Pagination bar */}
                {totalPages > 1 && (
                  <div className="pt-6">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(activeTab, Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="gap-1 text-xs"
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
                            className={`min-w-9 text-xs ${currentPage === page ? "bg-emerald-600 hover:bg-emerald-700 text-white font-bold" : ""}`}
                            onClick={() => setPage(activeTab, Number(page))}
                          >
                            {page}
                          </Button>
                        )
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage(activeTab, Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="gap-1 text-xs"
                      >
                        Berikutnya
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                    <p className="text-center text-[10px] text-gray-400 mt-2.5">
                      Halaman {currentPage} dari {totalPages} · Menampilkan {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredData.length)} dari {filteredData.length} produk
                    </p>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </section>

      {/* ── Rental Booking & Price Nego Modal ── */}
      {rentalModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200 font-sans">
            <button onClick={() => setRentalModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <Package className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Sewa Alat & Nego Harga</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-normal">
              Tentukan kuantitas, durasi sewa, dan tawarkan harga sewa alternatif. Vendor berhak mengonfirmasi ketersediaan barang dan menyetujui penawaran harga Anda.
            </p>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-white flex items-center justify-center border border-emerald-150">
                  <Package className="size-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 leading-tight">{selectedItem.name}</p>
                  <p className="text-xs text-emerald-800">Vendor: **{selectedItem.vendorName}**</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Tanggal Ambil</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <Input 
                      type="date" 
                      className="pl-9 text-xs" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Tanggal Kembali</label>
                  <div className="relative">
                    <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                    <Input 
                      type="date" 
                      className="pl-9 text-xs" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Jumlah Unit (Sewa)</label>
                  <Input 
                    type="number" 
                    min={1} 
                    max={selectedItem.available}
                    className="text-xs h-9" 
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(selectedItem.available, Math.max(1, parseInt(e.target.value) || 1)))}
                  />
                  <p className="text-[9px] text-emerald-600 mt-1">Maks. {selectedItem.available} unit tersedia</p>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Tawaran Harga Unit (Per Hari)</label>
                  <div className="relative">
                    <DollarSign className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-emerald-600 font-bold" />
                    <Input 
                      type="number" 
                      className="pl-7 text-xs font-bold text-emerald-700 h-9"
                      value={proposedPrice}
                      onChange={(e) => setProposedPrice(e.target.value)}
                    />
                  </div>
                  <p className="text-[9px] text-gray-400 mt-1">Normal: Rp {selectedItem.price.toLocaleString("id-ID")}</p>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Catatan / Keterangan Penawaran</label>
                <textarea 
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500 h-14 resize-none"
                  placeholder="Contoh: Nego tipis ya gan, ambil sekalian 3 item."
                  value={negoNotes}
                  onChange={(e) => setNegoNotes(e.target.value)}
                />
              </div>

              <div className="border-t border-gray-150 pt-3 flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400">Total Durasi & Kuantitas</p>
                  <p className="text-xs font-bold text-gray-700">{quantity} Unit &times; {startDate && endDate ? getDaysDiff(startDate, endDate) : 1} Hari</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-semibold">Estimasi Total Nego</p>
                  <p className="text-base font-bold text-emerald-600">
                    Rp {((parseInt(proposedPrice) || selectedItem.price) * quantity * (startDate && endDate ? getDaysDiff(startDate, endDate) : 1)).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setRentalModalOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleConfirmRental}>Kirim Booking & Nego</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

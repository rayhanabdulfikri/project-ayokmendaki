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
  const { equipment, vendors, mountains, currentUser, addRentalOrder, createNegotiation, climberDeposit } = useApp();
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
  const [couponInput, setCouponInput] = useState("");
  const [checkoutNotes, setCheckoutNotes] = useState("");

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

    if (currentUser.id === item.vendorId) {
      toast.error("Anda tidak dapat menyewa barang dari toko Anda sendiri.");
      return;
    }

    if (currentUser.role !== "pendaki") {
      toast.error("Hanya Pendaki yang dapat menyewa alat.");
      return;
    }

    setSelectedItem(item);
    setStartDate("");
    setEndDate("");
    setQuantity(1);
    setProposedPrice(item.price.toString());
    setNegoNotes("");
    setCouponInput("");
    setCheckoutNotes("");
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

    if (currentUser && currentUser.role === "pendaki" && (climberDeposit || 0) < 100000) {
      toast.error("Saldo deposit Anda kurang dari Rp 100.000. Silakan lakukan Top Up di Dashboard terlebih dahulu.");
      return;
    }

    const days = getDaysDiff(startDate, endDate);
    const isDiscEnabled = selectedItem.groupDiscountEnabled;
    const groupDisc = isDiscEnabled ? (quantity >= 5 ? 30 : quantity >= 4 ? 20 : quantity >= 2 ? 10 : 0) : 0;
    const itemDisc = selectedItem.discountPercentage || 0;
    
    // Base price per unit per day after custom item discount
    const normalPricePerUnitPerDay = Math.round(selectedItem.price * (1 - itemDisc / 100));
    
    // Rate after group discount
    const priceProposedPerDay = parseInt(proposedPrice) || normalPricePerUnitPerDay;
    const ratePerUnitPerDay = Math.round(priceProposedPerDay * (1 - groupDisc / 100));
    let proposedPriceTotal = ratePerUnitPerDay * quantity * days;
    
    const originalRatePerUnitPerDay = Math.round(selectedItem.price * (1 - groupDisc / 100));
    const originalPriceTotal = originalRatePerUnitPerDay * quantity * days;

    // Apply vendor coupon if present
    if (couponInput.trim()) {
      const vendorObj = vendors.find(v => v.id === selectedItem.vendorId);
      if (vendorObj && vendorObj.couponCode && couponInput.trim().toUpperCase() === vendorObj.couponCode.toUpperCase()) {
        const deadline = vendorObj.couponDeadline ? new Date(vendorObj.couponDeadline) : null;
        if (deadline && new Date() > deadline) {
          toast.error("Kupon vendor ini sudah kadaluwarsa!");
        } else {
          proposedPriceTotal = Math.max(0, proposedPriceTotal - (vendorObj.couponDiscount || 0));
          toast.success("Kupon diskon vendor berhasil digunakan!");
        }
      } else {
        toast.error("Kode kupon vendor tidak valid.");
      }
    }

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
      totalPrice: proposedPriceTotal,
      notes: checkoutNotes
    });

    // 2. If price is negotiated, submit negotiation entry
    if (priceProposedPerDay !== normalPricePerUnitPerDay) {
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
    if (currentUser.id === vendorId) {
      toast.error("Anda tidak dapat mengirim pesan ke toko Anda sendiri.");
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
            {item.image ? (
              <img src={item.image} className="w-full h-full object-cover" />
            ) : (
              <Package className="size-12" />
            )}
          </div>
          <div className="flex-1 w-full min-w-0">
            <div className="flex items-start justify-between gap-4 mb-1">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-bold text-gray-800 text-lg leading-tight">{item.name}</h4>
                  {item.discountPercentage !== undefined && item.discountPercentage > 0 && (
                    <Badge className="bg-red-500 text-white text-[9px] py-0">Diskon {item.discountPercentage}%</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">{item.description}</p>
                {vendor?.couponCode && (
                  <div className="inline-flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-150 font-semibold mt-1">
                    🎟️ Kupon Toko: <b>{vendor.couponCode}</b> (Potongan Rp {vendor.couponDiscount?.toLocaleString("id-ID")}){vendor.couponDeadline ? ` s/d ${vendor.couponDeadline}` : ""}
                  </div>
                )}
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
                {item.discountPercentage !== undefined && item.discountPercentage > 0 ? (
                  <div className="flex items-center gap-2">
                    <span className="line-through text-xs text-gray-400">Rp {item.price.toLocaleString("id-ID")}</span>
                    <span className="font-bold text-emerald-600 text-lg">Rp {Math.round(item.price * (1 - item.discountPercentage / 100)).toLocaleString("id-ID")}<span className="text-xs font-normal text-gray-400">/hari</span></span>
                  </div>
                ) : (
                  <span className="font-bold text-emerald-600 text-lg">Rp {item.price.toLocaleString("id-ID")}<span className="text-xs font-normal text-gray-400">/hari</span></span>
                )}
              </div>
              {currentUser?.id === item.vendorId ? (
                <div className="text-xs text-amber-600 font-semibold italic bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
                  Barang milik Anda
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="text-xs" onClick={() => handleChatVendor(item.vendorId, item.vendorName)}>
                    <MessageCircle className="size-4 mr-1 text-emerald-600" />
                    Chat
                  </Button>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs" onClick={() => handleOpenRentalModal(item)}>
                    Sewa Alat
                  </Button>
                </div>
              )}
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
      {rentalModalOpen && selectedItem && (
        <div 
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setRentalModalOpen(false)}
        >
          <div 
            className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200 font-sans flex flex-col max-h-[85vh] md:max-h-[90vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-5 pb-3 border-b border-gray-100 relative shrink-0">
              <button 
                onClick={() => setRentalModalOpen(false)} 
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors"
              >
                <X className="size-5" />
              </button>
              <div className="flex items-center gap-2 text-emerald-800 font-bold">
                <Package className="size-6 text-emerald-600 shrink-0" />
                <h3 className="text-base md:text-lg">Sewa Alat & Nego Harga</h3>
              </div>
              <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">
                Tentukan kuantitas, durasi sewa, dan tawarkan harga sewa alternatif.
              </p>
            </div>

            {/* Scrollable Form Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs md:text-sm">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <div className="size-10 rounded-lg bg-white flex items-center justify-center border border-emerald-150 shrink-0">
                  <Package className="size-6 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-gray-800 leading-tight text-sm">{selectedItem.name}</p>
                  <p className="text-xs text-emerald-800">Vendor: <b>{selectedItem.vendorName}</b></p>
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
                    className="text-xs h-9 bg-white" 
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
                      className="pl-7 text-xs font-bold text-emerald-700 h-9 bg-white"
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
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-55 focus:bg-white focus:outline-emerald-500 h-14 resize-none"
                  placeholder="Contoh: Nego tipis ya gan, ambil sekalian 3 item."
                  value={negoNotes}
                  onChange={(e) => setNegoNotes(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Kupon Diskon Vendor</label>
                  <Input 
                    placeholder="Contoh: SEWAOK"
                    className="text-xs h-9 bg-white" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Catatan Rental/Kirim</label>
                  <Input 
                    placeholder="Catatan tambahan sewa"
                    className="text-xs h-9 bg-white" 
                    value={checkoutNotes}
                    onChange={(e) => setCheckoutNotes(e.target.value)}
                  />
                </div>
              </div>

              {selectedItem.damageTerms && (
                <div className="text-[10px] text-red-700 bg-red-50 p-2.5 rounded-lg border border-red-100/50 leading-tight">
                  ⚠️ <b>Kebijakan Kerusakan/Kehilangan Vendor:</b>
                  <p className="mt-0.5 italic">{selectedItem.damageTerms}</p>
                </div>
              )}

              {(() => {
                const basePricePerDay = parseInt(proposedPrice) || Math.round(selectedItem.price * (1 - (selectedItem.discountPercentage || 0) / 100));
                const days = startDate && endDate ? getDaysDiff(startDate, endDate) : 1;
                const isDiscEnabled = selectedItem.groupDiscountEnabled;
                const groupDisc = isDiscEnabled ? (quantity >= 5 ? 30 : quantity >= 4 ? 20 : quantity >= 2 ? 10 : 0) : 0;
                
                const ratePerUnitPerDay = Math.round(basePricePerDay * (1 - groupDisc / 100));
                let subTotal = ratePerUnitPerDay * quantity * days;
                
                // Coupon discount checking in preview
                let couponDisc = 0;
                if (couponInput.trim()) {
                  const vendorObj = vendors.find(v => v.id === selectedItem.vendorId);
                  if (vendorObj && vendorObj.couponCode && couponInput.trim().toUpperCase() === vendorObj.couponCode.toUpperCase()) {
                    const deadline = vendorObj.couponDeadline ? new Date(vendorObj.couponDeadline) : null;
                    if (!deadline || new Date() <= deadline) {
                      couponDisc = vendorObj.couponDiscount || 0;
                    }
                  }
                }
                const deposit = 100000;

                return (
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100 text-xs space-y-2">
                    <div className="flex justify-between items-center text-gray-500">
                      <span>Subtotal Sewa ({quantity} Unit &times; {days} Hari):</span>
                      <span className="font-bold text-gray-700">Rp {subTotal.toLocaleString("id-ID")}</span>
                    </div>
                    {isDiscEnabled && groupDisc > 0 && (
                      <div className="flex justify-between items-center text-emerald-700 font-semibold text-[11px]">
                        <span>Diskon Rombongan ({groupDisc}%):</span>
                        <span>- Rp {Math.round(basePricePerDay * groupDisc / 100 * quantity * days).toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    {couponDisc > 0 && (
                      <div className="flex justify-between items-center text-amber-700 font-semibold text-[11px]">
                        <span>Kupon Diskon Vendor:</span>
                        <span>- Rp {couponDisc.toLocaleString("id-ID")}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center text-blue-700">
                      <span>Deposit Jaminan (Kembali Penuh):</span>
                      <span className="font-bold">Rp {deposit.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="border-t border-emerald-200/50 pt-2 flex justify-between items-center text-sm font-extrabold text-emerald-800">
                      <span>Total Bayar (Simulasi):</span>
                      <span>Rp {Math.max(0, subTotal - couponDisc + deposit).toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Fixed Footer Actions */}
            <div className="p-4 border-t border-gray-100 flex gap-2.5 bg-gray-50/50 shrink-0">
              <Button type="button" variant="outline" className="flex-1 text-xs rounded-xl" onClick={() => setRentalModalOpen(false)}>Batal</Button>
              <Button type="button" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl" onClick={handleConfirmRental}>Kirim Booking & Sewa</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

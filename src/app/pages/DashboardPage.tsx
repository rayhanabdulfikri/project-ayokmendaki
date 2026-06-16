import { useState, useEffect, useMemo } from "react";
import { useApp, Booking, RentalOrder, Negotiation, UserRole, EquipmentItem, User } from "../context/AppContext";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Calendar,
  Users,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  MessageSquare,
  Send,
  Star,
  FileText,
  DollarSign,
  Mountain as MountainIcon,
  ShieldAlert,
  Plus,
  Trash2,
  Edit2,
  Check,
  X,
  CreditCard,
  Building,
  Activity,
  UserCheck,
  TrendingUp,
  Award,
  Package
} from "lucide-react";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell
} from "recharts";

export function DashboardPage() {
  const {
    currentUser,
    setCurrentUser,
    mountains,
    guides,
    setGuides,
    vendors,
    equipment,
    setEquipment,
    bookings,
    addBooking,
    updateBookingStatus,
    rentalOrders,
    addRentalOrder,
    updateRentalStatus,
    negotiations,
    createNegotiation,
    respondToNegotiation,
    chatMessages,
    sendChatMessage,
    verificationRequests,
    respondToVerification,
    addVerificationRequest,
    addEquipmentItem,
    updateEquipmentItem,
    deleteEquipmentItem,
    submitDispute,
    resolveDispute
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Navigation tabs in dashboard
  const [activeTab, setActiveTab] = useState("bookings");

  // Handle redirect states (from Chat button on guide/rental page)
  useEffect(() => {
    if (location.state && (location.state as any).activeTab) {
      const locState = location.state as any;
      setActiveTab(locState.activeTab);
      if (locState.activeTab === "chat" && locState.partnerId) {
        setSelectedChatPartnerId(locState.partnerId);
        setSelectedChatPartnerName(locState.partnerName);
      }
      // Clear history state to avoid loops
      window.history.replaceState({}, document.title);
    }
  }, [location]);

  // Modal & Temp States
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [activePaymentItem, setActivePaymentItem] = useState<{ id: string; type: "booking" | "rental"; amount: number } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("gopay");
  const [isPaying, setIsPaying] = useState(false);

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewItem, setReviewItem] = useState<{ id: string; name: string; type: "guide" | "rental" } | null>(null);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");

  const [disputeModalOpen, setDisputeModalOpen] = useState(false);
  const [disputeItem, setDisputeItem] = useState<{ id: string; type: "booking" | "rental" } | null>(null);
  const [disputeNotesInput, setDisputeNotesInput] = useState("");

  const [counterModalOpen, setCounterModalOpen] = useState(false);
  const [counterNego, setCounterNego] = useState<Negotiation | null>(null);
  const [counterPriceInput, setCounterPriceInput] = useState("");

  // Catalog Add/Edit states (Vendor)
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<EquipmentItem | null>(null);
  const [catalogForm, setCatalogForm] = useState({
    name: "",
    description: "",
    price: "",
    available: "",
    category: "tent" as "tent" | "carrier" | "other"
  });

  // Chat State
  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState("");
  const [selectedChatPartnerName, setSelectedChatPartnerName] = useState("");
  const [chatInput, setChatInput] = useState("");

  // Verification request form states (Guide/Vendor)
  const [verFormOpen, setVerFormOpen] = useState(false);
  const [verDocName, setVerDocName] = useState("Scan Sertifikasi APIGI");
  const [verDocFile, setVerDocFile] = useState("https://images.unsplash.com/photo-1586075010923-2dd4570fb338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400");

  // Filter messages for current chat session
  const activeChatMessages = useMemo(() => {
    if (!currentUser || !selectedChatPartnerId) return [];
    return chatMessages.filter(
      (m) =>
        (m.senderId === currentUser.id && m.chatPartnerId === selectedChatPartnerId) ||
        (m.senderId === selectedChatPartnerId && m.chatPartnerId === currentUser.id)
    );
  }, [chatMessages, currentUser, selectedChatPartnerId]);

  // Unique chat partners list
  const chatPartnersList = useMemo(() => {
    if (!currentUser) return [];
    const partnersMap = new Map<string, string>();
    chatMessages.forEach((m) => {
      if (m.senderId === currentUser.id) {
        partnersMap.set(m.chatPartnerId, m.chatPartnerName);
      } else if (m.chatPartnerId === currentUser.id) {
        partnersMap.set(m.senderId, m.senderName);
      }
    });
    return Array.from(partnersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [chatMessages, currentUser]);

  // Initialize first chat partner if not set
  useEffect(() => {
    if (chatPartnersList.length > 0 && !selectedChatPartnerId) {
      setSelectedChatPartnerId(chatPartnersList[0].id);
      setSelectedChatPartnerName(chatPartnersList[0].name);
    }
  }, [chatPartnersList, selectedChatPartnerId]);

  // Simulating mock auto reply after sending message
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !currentUser || !selectedChatPartnerId) return;

    sendChatMessage(selectedChatPartnerId, selectedChatPartnerName, chatInput);
    const typedMsg = chatInput;
    setChatInput("");

    // Simulate Guide/Vendor Auto-Reply in 2 seconds
    setTimeout(() => {
      const partnerName = selectedChatPartnerName;
      let reply = "Baik kak, pesan Anda telah diterima. Mohon ditunggu konfirmasinya ya.";
      if (currentUser.role === "pendaki") {
        if (selectedChatPartnerId.startsWith("guide")) {
          reply = `Halo kak! Tentu, saya siap memandu trip Anda ke Gunung terdekat. Detail Simaksi & kesiapan alat akan saya bantu koordinasikan.`;
        } else if (selectedChatPartnerId.startsWith("vendor")) {
          reply = `Halo kak! Stok alat camping yang Kakak tanyakan ready & siap diambil H-1 pendakian. Jaminan bersih & anti bocor.`;
        }
      }
      
      // We append mock message directly by faking partner sending it
      const id = "chat_auto_" + Math.random().toString(36).substring(2, 9);
      const now = new Date();
      const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      
      const newMsg = {
        id,
        chatPartnerId: currentUser.id,
        chatPartnerName: currentUser.name,
        senderId: selectedChatPartnerId,
        senderName: partnerName,
        message: reply,
        timestamp
      };
      
      // Direct state manipulation of localStorage faked by AppContext update message
      const savedChats = localStorage.getItem("ayok_chats");
      const currentChats = savedChats ? JSON.parse(savedChats) : [];
      currentChats.push(newMsg);
      localStorage.setItem("ayok_chats", JSON.stringify(currentChats));
      
      // Dispatch a storage update to force context sync
      window.dispatchEvent(new Event("storage"));
      // Fast page update hook
      toast.info(`Pesan masuk baru dari ${partnerName}`);
    }, 2000);
  };

  // Payment triggers
  const handleOpenPayment = (id: string, type: "booking" | "rental", amount: number) => {
    setActivePaymentItem({ id, type, amount });
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = () => {
    if (!activePaymentItem) return;
    setIsPaying(true);

    setTimeout(() => {
      setIsPaying(false);
      setPaymentModalOpen(false);

      if (activePaymentItem.type === "booking") {
        updateBookingStatus(activePaymentItem.id, "Telah Dibayar");
      } else {
        updateRentalStatus(activePaymentItem.id, "Telah Dibayar");
      }

      toast.success("Pembayaran Berhasil Diverifikasi!", {
        description: `Dana disimpan dengan aman di rekening Escrow AyokMendaki.`,
      });
    }, 2000);
  };

  // Review triggers
  const handleOpenReview = (id: string, name: string, type: "guide" | "rental") => {
    setReviewItem({ id, name, type });
    setRatingInput(5);
    setCommentInput("");
    setReviewModalOpen(true);
  };

  const handleSaveReview = () => {
    if (!reviewItem) return;
    toast.success(`Ulasan Anda untuk ${reviewItem.name} berhasil disimpan!`, {
      description: `Bintang ${ratingInput} - Terima kasih atas ulasan jujur Anda.`,
    });
    setReviewModalOpen(false);
  };

  // Dispute triggers
  const handleOpenDispute = (id: string, type: "booking" | "rental") => {
    setDisputeItem({ id, type });
    setDisputeNotesInput("");
    setDisputeModalOpen(true);
  };

  const handleSaveDispute = () => {
    if (!disputeItem || !disputeNotesInput.trim()) return;
    submitDispute(disputeItem.type, disputeItem.id, disputeNotesInput);
    toast.warning("Laporan dispute diajukan ke Super Admin!", {
      description: "Admin akan segera menghubungi Anda & mitra untuk investigasi sengketa.",
    });
    setDisputeModalOpen(false);
  };

  // Nego counter triggers
  const handleOpenCounter = (nego: Negotiation) => {
    setCounterNego(nego);
    setCounterPriceInput(nego.proposedPrice.toString());
    setCounterModalOpen(true);
  };

  const handleSaveCounter = () => {
    if (!counterNego || !counterPriceInput.trim()) return;
    respondToNegotiation(counterNego.id, "countered", parseInt(counterPriceInput));
    toast.info("Penawaran harga balik (counter offer) dikirimkan!");
    setCounterModalOpen(false);
  };

  // Vendor catalog management
  const handleOpenCatalogForm = (item?: EquipmentItem) => {
    if (item) {
      setEditingItem(item);
      setCatalogForm({
        name: item.name,
        description: item.description,
        price: item.price.toString(),
        available: item.available.toString(),
        category: item.category
      });
    } else {
      setEditingItem(null);
      setCatalogForm({
        name: "",
        description: "",
        price: "",
        available: "",
        category: "tent"
      });
    }
    setItemFormOpen(true);
  };

  const handleSaveCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, price, available, category } = catalogForm;

    if (!name || !price || !available) {
      toast.error("Wajib mengisi nama, tarif, dan jumlah stok.");
      return;
    }

    if (editingItem) {
      updateEquipmentItem(editingItem.id, {
        name,
        description,
        price: parseInt(price),
        available: parseInt(available),
        category
      });
      toast.success("Barang katalog berhasil diperbarui!");
    } else {
      addEquipmentItem({
        name,
        description,
        price: parseInt(price),
        available: parseInt(available),
        category,
        vendorId: currentUser?.id || "vendor1",
        vendorName: currentUser?.name || "Toko Outdoor"
      });
      toast.success("Barang camping baru ditambahkan ke katalog!");
    }

    setItemFormOpen(false);
  };

  // Submit Partnership Verification Document
  const handleSendVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    addVerificationRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      role: currentUser.role as "guide" | "vendor",
      documentName: verDocName,
      documentImage: verDocFile
    });

    setVerFormOpen(false);
    toast.success("Dokumen baru dikirim ke Admin untuk ditinjau!");
  };

  // Status helper colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Menunggu Konfirmasi":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Menunggu Konfirmasi</Badge>;
      case "Menunggu Pembayaran":
        return <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Menunggu Pembayaran</Badge>;
      case "Telah Dibayar":
      case "Siap Diambil":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Escrow Aman (Lunas)</Badge>;
      case "Berangkat":
        return <Badge variant="outline" className="bg-emerald-600 text-white border-emerald-700">Trip: Berangkat</Badge>;
      case "Basecamp":
        return <Badge variant="outline" className="bg-emerald-700 text-white border-emerald-800">Trip: Pos Basecamp</Badge>;
      case "Summit":
        return <Badge variant="outline" className="bg-emerald-800 text-white border-emerald-900 animate-pulse">Trip: Puncak (Summit)</Badge>;
      case "Sedang Disewa":
        return <Badge variant="outline" className="bg-emerald-600 text-white">Sedang Disewa</Badge>;
      case "Selesai":
        return <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-200">Selesai</Badge>;
      case "Dibatalkan":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Dibatalkan</Badge>;
      case "Dispute":
        return <Badge variant="outline" className="bg-red-600 text-white border-red-700 animate-bounce">Sengketa (Dispute)</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-xl p-8 border border-gray-150">
          <ShieldAlert className="size-16 text-amber-500 mx-auto mb-4 animate-bounce" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Akses Terbatas</h2>
          <p className="text-sm text-gray-500 mb-6 leading-relaxed">
            Anda belum masuk ke akun pendaki, guide, vendor, atau admin. Silakan masuk terlebih dahulu atau gunakan Demo Role Switcher di pojok kanan bawah.
          </p>
          <div className="flex gap-3">
            <Button className="flex-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => navigate("/login")}>
              Masuk Akun
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate("/")}>
              Ke Beranda
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // ─── RENDERING conditional views based on user.role ───────────────────────
  return (
    <div className="min-h-screen bg-gray-50/50 pb-16 font-sans">
      
      {/* ── Dashboard Banner ── */}
      <section className="bg-gradient-to-r from-emerald-800 to-emerald-900 text-white py-10 shadow-md">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <img src={currentUser.avatar} alt={currentUser.name} className="size-16 rounded-full bg-white/10 border-2 border-white/20" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">{currentUser.name}</h1>
                <Badge className="bg-emerald-500 text-white uppercase text-[10px] py-0.5 px-2">
                  {currentUser.role}
                </Badge>
              </div>
              <p className="text-sm opacity-75 mt-0.5">{currentUser.email}</p>
            </div>
          </div>
          
          <div className="bg-white/10 rounded-2xl px-5 py-3 border border-white/10 text-center sm:text-right shrink-0">
            <p className="text-xs uppercase tracking-wider text-emerald-300 font-bold">Status Verifikasi</p>
            <p className="text-sm font-semibold flex items-center justify-center sm:justify-end gap-1.5 mt-0.5">
              {currentUser.role === "admin" || currentUser.verified ? (
                <>
                  <CheckCircle2 className="size-4 text-emerald-400" />
                  <span>Terverifikasi (Aktif)</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="size-4 text-amber-400" />
                  <span>Pending Verifikasi Admin</span>
                </>
              )}
            </p>
          </div>
        </div>
      </section>

      {/* ── Dashboard Content Layout ── */}
      <div className="container mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Dashboard Sidebar Tabs */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider px-3 mb-2">Navigasi Fitur</p>
            
            {/* Conditional Tabs based on Role */}
            {currentUser.role === "pendaki" && (
              <>
                {[
                  { id: "bookings", label: "Booking Gunung", icon: <MountainIcon className="size-4" /> },
                  { id: "rentals", label: "Penyewaan Alat", icon: <Package className="size-4" /> },
                  { id: "negos", label: "Negosiasi Harga", icon: <DollarSign className="size-4" /> },
                  { id: "chat", label: "In-App Chat", icon: <MessageSquare className="size-4" /> }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-all ${
                      activeTab === t.id ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-gray-150 text-gray-700 hover:bg-emerald-50/50"
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                    {t.id === "negos" && negotiations.filter(n => n.senderName === currentUser.name && n.status === "countered").length > 0 && (
                      <span className="ml-auto bg-amber-500 text-white size-5 rounded-full flex items-center justify-center text-[10px] animate-pulse">!</span>
                    )}
                  </button>
                ))}
              </>
            )}

            {currentUser.role === "guide" && (
              <>
                {[
                  { id: "bookings", label: "Booking Masuk", icon: <FileText className="size-4" /> },
                  { id: "trips", label: "Trip Lapangan", icon: <Activity className="size-4" /> },
                  { id: "chat", label: "In-App Chat", icon: <MessageSquare className="size-4" /> }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-all ${
                      activeTab === t.id ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-gray-150 text-gray-700 hover:bg-emerald-50/50"
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                    {t.id === "bookings" && negotiations.filter(n => n.recipientId === currentUser.id && n.status === "pending").length > 0 && (
                      <span className="ml-auto bg-amber-500 text-white size-5 rounded-full flex items-center justify-center text-[10px] animate-pulse">
                        {negotiations.filter(n => n.recipientId === currentUser.id && n.status === "pending").length}
                      </span>
                    )}
                  </button>
                ))}
                
                {/* Guide verification request button */}
                {!currentUser.verified && (
                  <Button variant="outline" className="w-full border-dashed border-emerald-400 text-emerald-800 text-xs mt-4" onClick={() => setVerFormOpen(true)}>
                    <Award className="size-4 mr-1" />
                    Ajukan Verifikasi Berkas
                  </Button>
                )}
              </>
            )}

            {currentUser.role === "vendor" && (
              <>
                {[
                  { id: "catalog", label: "Kelola Katalog", icon: <Plus className="size-4" /> },
                  { id: "bookings", label: "Penyewaan Masuk", icon: <FileText className="size-4" /> },
                  { id: "chat", label: "In-App Chat", icon: <MessageSquare className="size-4" /> }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-all ${
                      activeTab === t.id ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-gray-150 text-gray-700 hover:bg-emerald-50/50"
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                    {t.id === "bookings" && negotiations.filter(n => n.recipientId === currentUser.id && n.status === "pending").length > 0 && (
                      <span className="ml-auto bg-amber-500 text-white size-5 rounded-full flex items-center justify-center text-[10px] animate-pulse">
                        {negotiations.filter(n => n.recipientId === currentUser.id && n.status === "pending").length}
                      </span>
                    )}
                  </button>
                ))}

                {!currentUser.verified && (
                  <Button variant="outline" className="w-full border-dashed border-emerald-400 text-emerald-800 text-xs mt-4" onClick={() => setVerFormOpen(true)}>
                    <Building className="size-4 mr-1" />
                    Ajukan NIB / Izin UKM
                  </Button>
                )}
              </>
            )}

            {currentUser.role === "admin" && (
              <>
                {[
                  { id: "verify", label: "Verifikasi Berkas", icon: <UserCheck className="size-4" /> },
                  { id: "escrow", label: "Monitoring Transaksi", icon: <DollarSign className="size-4" /> },
                  { id: "disputes", label: "Penyelesaian Dispute", icon: <ShieldAlert className="size-4" /> },
                  { id: "reports", label: "Laporan Keuangan", icon: <TrendingUp className="size-4" /> }
                ].map(t => (
                  <button
                    key={t.id}
                    onClick={() => setActiveTab(t.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left text-sm font-semibold transition-all ${
                      activeTab === t.id ? "bg-emerald-600 text-white shadow-md" : "bg-white border border-gray-150 text-gray-700 hover:bg-emerald-50/50"
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                    {t.id === "verify" && verificationRequests.filter(r => r.status === "pending").length > 0 && (
                      <span className="ml-auto bg-red-500 text-white size-5 rounded-full flex items-center justify-center text-[10px]">
                        {verificationRequests.filter(r => r.status === "pending").length}
                      </span>
                    )}
                  </button>
                ))}
              </>
            )}
          </div>

          {/* Dashboard Main Workspace */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* ════════════════════ PENDAKI VIEW ════════════════════ */}
            {currentUser.role === "pendaki" && (
              <>
                {/* 1. Tab Bookings (Ticket & Guide) */}
                {activeTab === "bookings" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Daftar Booking Gunung & Guide</CardTitle>
                      <CardDescription className="text-xs">Kelola perizinan simaksi resmi gunung dan sewa guide pendakian Anda.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bookings.filter(b => b.pendakiId === currentUser.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Belum ada pemesanan.</div>
                      ) : (
                        bookings.filter(b => b.pendakiId === currentUser.id).map((b) => (
                          <div key={b.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-shadow">
                            <div>
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h4 className="font-bold text-gray-800">{b.mountainName}</h4>
                                {b.officialTicketBooking ? (
                                  <Badge className="bg-emerald-100 text-emerald-800 text-[9px] py-0">Tiket Masuk Resmi</Badge>
                                ) : (
                                  <Badge className="bg-blue-100 text-blue-800 text-[9px] py-0">Jasa Guide: {b.guideName}</Badge>
                                )}
                              </div>
                              <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="size-3.5" /> Tanggal Pendakian: **{b.bookingDate}**</p>
                              <p className="text-xs text-emerald-700 font-bold mt-1">Total Biaya: Rp {b.price.toLocaleString("id-ID")}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0">
                              <div className="mb-1">{getStatusBadge(b.status)}</div>
                              <div className="flex gap-2 w-full md:w-auto justify-end">
                                {b.status === "Menunggu Pembayaran" && (
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white" onClick={() => handleOpenPayment(b.id, "booking", b.price)}>
                                    <CreditCard className="size-3.5 mr-1" /> Bayar Simulasi
                                  </Button>
                                )}
                                {b.status === "Telah Dibayar" && (
                                  <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleOpenDispute(b.id, "booking")}>
                                    Laporkan Sengketa
                                  </Button>
                                )}
                                {b.status === "Selesai" && (
                                  <Button size="sm" variant="outline" className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50" onClick={() => handleOpenReview(b.id, b.guideName || b.mountainName, "guide")}>
                                    <Star className="size-3.5 mr-1 text-yellow-500 fill-yellow-500" /> Beri Ulasan
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 2. Tab Rentals (Outdoor Tools) */}
                {activeTab === "rentals" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Penyewaan Alat Outdoor</CardTitle>
                      <CardDescription className="text-xs">Daftar alat camping yang disewa dari vendor terverifikasi.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {rentalOrders.filter(r => r.pendakiId === currentUser.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Belum ada penyewaan.</div>
                      ) : (
                        rentalOrders.filter(r => r.pendakiId === currentUser.id).map((r) => (
                          <div key={r.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-shadow">
                            <div>
                              <h4 className="font-bold text-gray-800">{r.itemName}</h4>
                              <p className="text-xs text-gray-500 mt-1">Vendor: **{r.vendorName}** &nbsp;•&nbsp; Jumlah: **{r.qty} Unit**</p>
                              <p className="text-xs text-gray-500 mt-0.5">Tanggal Sewa: **{r.startDate}** s/d **{r.endDate}**</p>
                              <p className="text-xs text-emerald-700 font-bold mt-1">Total Biaya: Rp {r.totalPrice.toLocaleString("id-ID")}</p>
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0">
                              <div className="mb-1">{getStatusBadge(r.status)}</div>
                              <div className="flex gap-2 w-full md:w-auto justify-end">
                                {r.status === "Menunggu Pembayaran" && (
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white" onClick={() => handleOpenPayment(r.id, "rental", r.totalPrice)}>
                                    <CreditCard className="size-3.5 mr-1" /> Bayar Simulasi
                                  </Button>
                                )}
                                {r.status === "Telah Dibayar" && (
                                  <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => handleOpenDispute(r.id, "rental")}>
                                    Laporkan Sengketa
                                  </Button>
                                )}
                                {r.status === "Selesai" && (
                                  <Button size="sm" variant="outline" className="text-xs border-emerald-300 text-emerald-800 hover:bg-emerald-50" onClick={() => handleOpenReview(r.id, r.itemName, "rental")}>
                                    <Star className="size-3.5 mr-1 text-yellow-500 fill-yellow-500" /> Beri Ulasan
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 3. Tab Negosiasi Harga (Client side list) */}
                {activeTab === "negos" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Negosiasi Tarif Aktif</CardTitle>
                      <CardDescription className="text-xs">Pantau status pengajuan penawaran harga Anda ke Guide & Vendor.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {negotiations.filter(n => n.senderName === currentUser.name).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Belum ada pengajuan negosiasi aktif.</div>
                      ) : (
                        negotiations.filter(n => n.senderName === currentUser.name).map((n) => (
                          <div key={n.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                              <h4 className="font-bold text-gray-800 text-sm">{n.itemName}</h4>
                              <p className="text-xs text-gray-500 mt-1">Ditujukan Ke: **{n.recipientName}**</p>
                              <div className="grid grid-cols-2 gap-3 mt-2 text-xs border border-gray-50 p-2 rounded-lg bg-gray-50/50">
                                <div>Harga Awal: <b className="text-gray-500 line-through">Rp {n.originalPrice.toLocaleString()}</b></div>
                                <div>Tawaran Anda: <b className="text-emerald-700 font-bold">Rp {n.proposedPrice.toLocaleString()}</b></div>
                              </div>
                              {n.status === "countered" && (
                                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-100 font-semibold">
                                  ⚠️ Guide/Vendor menawarkan harga balik: **Rp {n.counterPrice?.toLocaleString()}**
                                </p>
                              )}
                            </div>
                            
                            <div className="flex flex-col items-end gap-2 shrink-0 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0">
                              <span className={`text-[10px] font-bold py-1 px-3.5 rounded-full border ${
                                n.status === "pending"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : n.status === "accepted"
                                  ? "bg-green-50 text-green-700 border-green-200"
                                  : n.status === "countered"
                                  ? "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                  : "bg-red-50 text-red-700 border-red-200"
                              }`}>
                                {n.status.toUpperCase()}
                              </span>
                              
                              {n.status === "countered" && (
                                <div className="flex gap-1.5 w-full sm:w-auto">
                                  <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3 text-white h-7 py-1" onClick={() => respondToNegotiation(n.id, "accepted")}>
                                    Setujui
                                  </Button>
                                  <Button size="xs" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50 h-7 py-1" onClick={() => respondToNegotiation(n.id, "rejected")}>
                                    Tolak
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* ════════════════════ GUIDE VIEW ════════════════════ */}
            {currentUser.role === "guide" && (
              <>
                {/* Guide availability settings panel */}
                <Card className="border border-gray-150 shadow-sm">
                  <CardHeader className="py-4 border-b border-gray-100 flex flex-row items-center justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base font-bold">Pengaturan Status Pemandu</CardTitle>
                      <CardDescription className="text-xs">Perbarui ketersediaan jadwal Anda secara instan di platform.</CardDescription>
                    </div>
                    {/* Status radio switch */}
                    <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-white shrink-0">
                      {(["Aktif", "Libur", "Non-Aktif"] as const).map((st) => {
                        const guideObj = guides.find(g => g.id === currentUser.id);
                        const isSelected = guideObj ? guideObj.status === st : st === "Non-Aktif";
                        return (
                          <button
                            key={st}
                            onClick={() => {
                              setGuides(prev => prev.map(g => g.id === currentUser.id ? { ...g, status: st } : g));
                              toast.info(`Status ketersediaan Anda diubah ke: ${st}`);
                            }}
                            className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                              isSelected
                                ? st === "Aktif"
                                  ? "bg-green-600 text-white shadow-sm"
                                  : st === "Libur"
                                  ? "bg-yellow-500 text-white shadow-sm"
                                  : "bg-red-600 text-white shadow-sm"
                                : "text-gray-500 hover:bg-gray-100"
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </CardHeader>
                </Card>

                {/* 1. Tab Booking Masuk (dan Nego) */}
                {activeTab === "bookings" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Booking & Penawaran Masuk</CardTitle>
                      <CardDescription className="text-xs">Tinjau pesanan pendakian dan lakukan tawar-menawar tarif.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bookings.filter(b => b.guideId === currentUser.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Belum ada booking masuk.</div>
                      ) : (
                        bookings.filter(b => b.guideId === currentUser.id).map((b) => {
                          const relevantNego = negotiations.find(n => n.orderId === b.id && n.status === "pending");
                          return (
                            <div key={b.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-bold text-gray-800">{b.pendakiName}</h4>
                                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] py-0">{b.mountainName}</Badge>
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="size-3.5" /> Tanggal Trip: **{b.bookingDate}**</p>
                                <p className="text-xs text-emerald-700 font-bold mt-1">Tarif Diajukan: Rp {b.price.toLocaleString("id-ID")}</p>
                                
                                {relevantNego && (
                                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-100 mt-2 space-y-1 max-w-md">
                                    <p className="font-bold">💬 Negosiasi Harga Masuk:</p>
                                    <p>Pendaki menawar tarif menjadi **Rp {relevantNego.proposedPrice.toLocaleString("id-ID")}** (Tarif Normal Anda: Rp {relevantNego.originalPrice.toLocaleString()})</p>
                                    {relevantNego.notes && <p className="text-gray-500 italic mt-0.5">Pesan: "{relevantNego.notes}"</p>}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0">
                                <div>{getStatusBadge(b.status)}</div>
                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                  {relevantNego ? (
                                    <>
                                      <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3 text-white h-8 py-1" onClick={() => respondToNegotiation(relevantNego.id, "accepted")}>
                                        Terima Nego
                                      </Button>
                                      <Button size="xs" variant="outline" className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50 h-8 py-1" onClick={() => handleOpenCounter(relevantNego)}>
                                        Tawar Balik
                                      </Button>
                                      <Button size="xs" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50 h-8 py-1" onClick={() => respondToNegotiation(relevantNego.id, "rejected")}>
                                        Tolak
                                      </Button>
                                    </>
                                  ) : (
                                    b.status === "Menunggu Konfirmasi" && (
                                      <>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white" onClick={() => updateBookingStatus(b.id, "Menunggu Pembayaran")}>
                                          Konfirmasi Jadwal
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateBookingStatus(b.id, "Dibatalkan")}>
                                          Tolak
                                        </Button>
                                      </>
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 2. Tab Trip Lapangan (Status check-in) */}
                {activeTab === "trips" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Monitoring Trip Aktif & Check-in</CardTitle>
                      <CardDescription className="text-xs">Perbarui titik progres pendakian manual Anda di lapangan untuk notifikasi live pendaki.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bookings.filter(b => b.guideId === currentUser.id && ["Telah Dibayar", "Berangkat", "Basecamp", "Summit"].includes(b.status)).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Tidak ada trip aktif saat ini.</div>
                      ) : (
                        bookings.filter(b => b.guideId === currentUser.id && ["Telah Dibayar", "Berangkat", "Basecamp", "Summit"].includes(b.status)).map((b) => (
                          <div key={b.id} className="p-5 rounded-xl border border-gray-150 bg-white space-y-4">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <div>
                                <h4 className="font-bold text-gray-800 text-base">{b.pendakiName} &middot; Simaksi {b.mountainName}</h4>
                                <p className="text-xs text-gray-500">Tanggal Mulai: **{b.bookingDate}** &nbsp;•&nbsp; Tarif Jasa: **Rp {b.price.toLocaleString("id-ID")}**</p>
                              </div>
                              <div>{getStatusBadge(b.status)}</div>
                            </div>

                            {/* Check-in stepper buttons */}
                            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                              <p className="text-xs font-bold text-emerald-800 mb-3">📍 Papan Kendali Check-in Progres (Manual Guide):</p>
                              <div className="grid grid-cols-4 gap-2">
                                {[
                                  { label: "1. Berangkat", status: "Berangkat" as const, desc: "Basecamp awal" },
                                  { label: "2. Pos Basecamp", status: "Basecamp" as const, desc: "Pos peristirahatan" },
                                  { label: "3. Summit", status: "Summit" as const, desc: "Puncak gunung" },
                                  { label: "4. Finish", status: "Selesai" as const, desc: "Kembali selamat" }
                                ].map((step) => {
                                  const isActiveStep = b.status === step.status;
                                  return (
                                    <button
                                      key={step.status}
                                      onClick={() => {
                                        updateBookingStatus(b.id, step.status);
                                        toast.success(`Check-in titik progres terkirim: ${step.status}!`, {
                                          description: `Pendaki menerima status perjalanan terbaru.`,
                                        });
                                      }}
                                      className={`flex flex-col items-center p-2.5 rounded-xl border text-center transition-all ${
                                        isActiveStep 
                                          ? "bg-emerald-600 border-emerald-600 text-white shadow-md font-bold" 
                                          : "bg-white border-gray-200 text-gray-600 hover:bg-emerald-50/50 hover:border-emerald-200"
                                      }`}
                                    >
                                      <span className="text-xs leading-none">{step.label}</span>
                                      <span className="text-[9px] opacity-75 mt-1 leading-tight">{step.desc}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* ════════════════════ VENDOR VIEW ════════════════════ */}
            {currentUser.role === "vendor" && (
              <>
                {/* 1. Tab Catalog Management */}
                {activeTab === "catalog" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-4 flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-lg">Katalog Produk Rental</CardTitle>
                        <CardDescription className="text-xs">Kelola unit perlengkapan camping dan outdoor toko Anda.</CardDescription>
                      </div>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3 text-white" onClick={() => handleOpenCatalogForm()}>
                        <Plus className="size-3.5 mr-1" /> Tambah Barang
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      
                      {/* Form overlay for add/edit catalog item */}
                      {itemFormOpen && (
                        <form onSubmit={handleSaveCatalogItem} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 space-y-4 mb-4 animate-in slide-in-from-top-3 duration-250">
                          <h4 className="text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-1.5 flex items-center justify-between">
                            <span>{editingItem ? "Edit Barang Katalog" : "Tambah Barang Baru"}</span>
                            <button type="button" onClick={() => setItemFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="size-4" /></button>
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Nama Produk</label>
                              <Input
                                placeholder="Contoh: Tenda Dome 4 Orang"
                                className="bg-white border-gray-200 text-xs"
                                value={catalogForm.name}
                                onChange={(e) => setCatalogForm({ ...catalogForm, name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Kategori</label>
                              <select
                                className="w-full px-3 py-2 text-xs border border-gray-200 bg-white rounded-lg focus:outline-emerald-500 h-10"
                                value={catalogForm.category}
                                onChange={(e) => setCatalogForm({ ...catalogForm, category: e.target.value as any })}
                              >
                                <option value="tent">Tenda</option>
                                <option value="carrier">Carrier</option>
                                <option value="other">Aksesoris/Lainnya</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Tarif Sewa (Rp / Hari)</label>
                              <Input
                                type="number"
                                placeholder="Contoh: 75000"
                                className="bg-white border-gray-200 text-xs"
                                value={catalogForm.price}
                                onChange={(e) => setCatalogForm({ ...catalogForm, price: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Stok Unit Tersedia</label>
                              <Input
                                type="number"
                                placeholder="Contoh: 5"
                                className="bg-white border-gray-200 text-xs"
                                value={catalogForm.available}
                                onChange={(e) => setCatalogForm({ ...catalogForm, available: e.target.value })}
                              />
                            </div>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-gray-700">Deskripsi Barang</label>
                            <Input
                              placeholder=" Waterproof, double layer, alloy pole"
                              className="bg-white border-gray-200 text-xs"
                              value={catalogForm.description}
                              onChange={(e) => setCatalogForm({ ...catalogForm, description: e.target.value })}
                            />
                          </div>
                          
                          <div className="flex gap-2 justify-end pt-1">
                            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setItemFormOpen(false)}>Batal</Button>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white">Simpan Barang</Button>
                          </div>
                        </form>
                      )}

                      {/* Display items from this vendor */}
                      {equipment.filter(eq => eq.vendorId === currentUser.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Belum ada barang di katalog Anda. Silakan tambahkan barang baru.</div>
                      ) : (
                        equipment.filter(eq => eq.vendorId === currentUser.id).map((eq) => (
                          <div key={eq.id} className="p-4 rounded-xl border border-gray-150 bg-white flex justify-between items-center gap-4 hover:shadow-sm transition-shadow">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-800">{eq.name}</h4>
                                <Badge variant="outline" className="text-[9px] uppercase">{eq.category}</Badge>
                              </div>
                              <p className="text-xs text-gray-500">{eq.description}</p>
                              <p className="text-xs text-emerald-700 font-bold mt-1">Rp {eq.price.toLocaleString("id-ID")}/hari &middot; Stok: {eq.available} unit</p>
                            </div>
                            
                            <div className="flex gap-2 shrink-0">
                              <button className="p-2 border border-gray-200 hover:border-emerald-400 text-gray-500 hover:text-emerald-700 rounded-lg transition-colors bg-white" onClick={() => handleOpenCatalogForm(eq)}>
                                <Edit2 className="size-4" />
                              </button>
                              <button className="p-2 border border-gray-200 hover:border-red-400 text-gray-500 hover:text-red-700 rounded-lg transition-colors bg-white" onClick={() => {
                                deleteEquipmentItem(eq.id);
                                toast.success("Barang dihapus dari katalog!");
                              }}>
                                <Trash2 className="size-4" />
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 2. Tab Penyewaan Masuk (dan Nego) */}
                {activeTab === "bookings" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Pesanan Rental & Penawaran Masuk</CardTitle>
                      <CardDescription className="text-xs">Konfirmasi persetujuan unit dan selesaikan tawar-menawar harga sewa alat.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {rentalOrders.filter(r => r.vendorId === currentUser.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Belum ada pesanan sewa masuk.</div>
                      ) : (
                        rentalOrders.filter(r => r.vendorId === currentUser.id).map((r) => {
                          const relevantNego = negotiations.find(n => n.orderId === r.id && n.status === "pending");
                          return (
                            <div key={r.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-sm transition-all">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-bold text-gray-800">{r.itemName}</h4>
                                  <Badge className="bg-emerald-100 text-emerald-800 text-[10px] py-0">Qty: {r.qty} Unit</Badge>
                                </div>
                                <p className="text-xs text-gray-500">Penyewa: **{r.pendakiName}**</p>
                                <p className="text-xs text-gray-500 mt-0.5">Durasi: **{r.startDate}** s/d **{r.endDate}**</p>
                                <p className="text-xs text-emerald-700 font-bold mt-1">Total Tarif: Rp {r.totalPrice.toLocaleString("id-ID")}</p>
                                
                                {relevantNego && (
                                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-100 mt-2 space-y-1 max-w-md">
                                    <p className="font-bold">💬 Negosiasi Harga Masuk:</p>
                                    <p>Pendaki menawar total tarif sewa menjadi **Rp {relevantNego.proposedPrice.toLocaleString("id-ID")}** (Tarif Normal: Rp {relevantNego.originalPrice.toLocaleString()})</p>
                                    {relevantNego.notes && <p className="text-gray-500 italic mt-0.5">Pesan: "{relevantNego.notes}"</p>}
                                  </div>
                                )}
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0">
                                <div>{getStatusBadge(r.status)}</div>
                                <div className="flex gap-2 w-full md:w-auto justify-end">
                                  {relevantNego ? (
                                    <>
                                      <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3 text-white h-8 py-1" onClick={() => respondToNegotiation(relevantNego.id, "accepted")}>
                                        Terima Nego
                                      </Button>
                                      <Button size="xs" variant="outline" className="text-xs border-amber-300 text-amber-800 hover:bg-amber-50 h-8 py-1" onClick={() => handleOpenCounter(relevantNego)}>
                                        Tawar Balik
                                      </Button>
                                      <Button size="xs" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50 h-8 py-1" onClick={() => respondToNegotiation(relevantNego.id, "rejected")}>
                                        Tolak
                                      </Button>
                                    </>
                                  ) : (
                                    r.status === "Menunggu Konfirmasi" ? (
                                      <>
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white animate-pulse" onClick={() => updateRentalStatus(r.id, "Menunggu Pembayaran")}>
                                          Konfirmasi Unit Ready
                                        </Button>
                                        <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => updateRentalStatus(r.id, "Dibatalkan")}>
                                          Tolak
                                        </Button>
                                      </>
                                    ) : (
                                      r.status === "Telah Dibayar" ? (
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white" onClick={() => updateRentalStatus(r.id, "Sedang Disewa")}>
                                          Tandai Diambil Penyewa
                                        </Button>
                                      ) : (
                                        r.status === "Sedang Disewa" && (
                                          <Button size="sm" className="bg-gray-750 hover:bg-gray-800 text-xs px-4 text-white" onClick={() => updateRentalStatus(r.id, "Selesai")}>
                                            Tandai Dikembalikan
                                          </Button>
                                        )
                                      )
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* ════════════════════ SUPER ADMIN VIEW ════════════════════ */}
            {currentUser.role === "admin" && (
              <>
                {/* 1. Tab Verify Documents */}
                {activeTab === "verify" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Verifikasi Berkas Pengguna</CardTitle>
                      <CardDescription className="text-xs">Validasi dokumen lisensi APIGI/HPI milik Guide baru dan legalitas UKM milik Vendor.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {verificationRequests.filter(r => r.status === "pending").length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Tidak ada berkas yang menunggu verifikasi.</div>
                      ) : (
                        verificationRequests.filter(r => r.status === "pending").map((req) => (
                          <div key={req.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-800">{req.userName}</h4>
                                <Badge className="bg-blue-100 text-blue-800 uppercase text-[9px]">{req.role}</Badge>
                              </div>
                              <p className="text-xs text-gray-500 font-semibold">{req.documentName}</p>
                              <a href={req.documentImage} target="_blank" rel="noopener noreferrer" className="text-xs text-emerald-600 underline font-semibold mt-1 inline-block">
                                Lihat Scan Dokumen Lampiran
                              </a>
                            </div>
                            
                            <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-2.5 md:pt-0">
                              <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white" onClick={() => {
                                respondToVerification(req.id, true);
                                toast.success("Mitra disetujui & diverifikasi!");
                              }}>
                                Setujui
                              </Button>
                              <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                                respondToVerification(req.id, false);
                                toast.error("Mitra ditolak verifikasi.");
                              }}>
                                Tolak
                              </Button>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 2. Tab Monitoring Transaksi */}
                {activeTab === "escrow" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Transaksi Rekening Escrow</CardTitle>
                      <CardDescription className="text-xs">Pantau seluruh perputaran dana yang diamankan di rekening penampung escrow AyokMendaki.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Escrow summary banner */}
                      {(() => {
                        const totalPaidBookings = bookings.filter(b => ["Telah Dibayar", "Berangkat", "Basecamp", "Summit", "Dispute"].includes(b.status)).reduce((a, c) => a + c.price, 0);
                        const totalPaidRentals = rentalOrders.filter(r => ["Telah Dibayar", "Sedang Disewa", "Dispute"].includes(r.status)).reduce((a, c) => a + c.totalPrice, 0);
                        const totalEscrowBalance = totalPaidBookings + totalPaidRentals;

                        const totalFinishedBookings = bookings.filter(b => b.status === "Selesai").reduce((a, c) => a + c.price, 0);
                        const totalFinishedRentals = rentalOrders.filter(r => r.status === "Selesai").reduce((a, c) => a + c.totalPrice, 0);
                        const totalPlatformCommission = (totalFinishedBookings + totalFinishedRentals) * 0.1; // 10% platform fee fiktif

                        return (
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                              <p className="text-xs text-emerald-800 font-semibold uppercase tracking-wider">Saldo Escrow Tertahan</p>
                              <p className="text-2xl font-bold text-emerald-600 mt-1">Rp {totalEscrowBalance.toLocaleString("id-ID")}</p>
                            </div>
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-center">
                              <p className="text-xs text-blue-800 font-semibold uppercase tracking-wider">Komisi Platform Terkumpul</p>
                              <p className="text-2xl font-bold text-blue-600 mt-1">Rp {totalPlatformCommission.toLocaleString("id-ID")}</p>
                            </div>
                          </div>
                        );
                      })()}

                      <div className="space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rincian Transaksi</p>
                        {bookings.map((b) => (
                          <div key={`trans_b_${b.id}`} className="p-3 border border-gray-100 rounded-lg text-xs flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-700">Simaksi/Trip {b.mountainName} &middot; {b.pendakiName}</p>
                              <p className="text-gray-400">Penerima Payout: {b.guideName || "Pihak Pengelola Gunung (Official)"}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600">Rp {b.price.toLocaleString("id-ID")}</p>
                              <p className="text-gray-400 capitalize">{b.status}</p>
                            </div>
                          </div>
                        ))}
                        {rentalOrders.map((r) => (
                          <div key={`trans_r_${r.id}`} className="p-3 border border-gray-100 rounded-lg text-xs flex justify-between items-center">
                            <div>
                              <p className="font-bold text-gray-700">Rental {r.itemName} &middot; {r.pendakiName}</p>
                              <p className="text-gray-400">Penerima Payout: {r.vendorName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-emerald-600">Rp {r.totalPrice.toLocaleString("id-ID")}</p>
                              <p className="text-gray-400 capitalize">{r.status}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 3. Tab Disputes Resolution */}
                {activeTab === "disputes" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Perselisihan Layanan (Dispute Resolution)</CardTitle>
                      <CardDescription className="text-xs">Selesaikan keluhan transaksi pendaki. Tentukan pengembalian dana (refund) atau pencairan ke mitra.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {bookings.filter(b => b.status === "Dispute").length === 0 &&
                       rentalOrders.filter(r => r.status === "Dispute").length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Tidak ada sengketa aktif.</div>
                      ) : (
                        <>
                          {bookings.filter(b => b.status === "Dispute").map((b) => (
                            <div key={`dis_b_${b.id}`} className="p-4 rounded-xl border border-red-200 bg-red-50/10 space-y-3">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                  <h4 className="font-bold text-red-800">Trip Gunung/Guide Dispute</h4>
                                  <p className="text-xs text-gray-500">Pendaki: **{b.pendakiName}** &nbsp;•&nbsp; Guide: **{b.guideName}** &nbsp;•&nbsp; Tarif: **Rp {b.price.toLocaleString()}**</p>
                                </div>
                                <Badge className="bg-red-600 text-white">DISPUTE</Badge>
                              </div>
                              <div className="p-2.5 rounded bg-red-50 border border-red-100 text-xs text-red-800">
                                <b>Alasan Keluhan Pendaki:</b> "{b.disputeNotes || "Tidak ada catatan."}"
                              </div>
                              <div className="flex gap-2 justify-end pt-1">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white" onClick={() => {
                                  resolveDispute("booking", b.id, false);
                                  toast.success("Dispute selesai: Dana dilepas ke Guide/Vendor.");
                                }}>
                                  Lepas Dana ke Guide
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                                  resolveDispute("booking", b.id, true);
                                  toast.success("Dispute selesai: Dana direfund ke Pendaki.");
                                }}>
                                  Kembalikan Dana ke Pendaki (Refund)
                                </Button>
                              </div>
                            </div>
                          ))}

                          {rentalOrders.filter(r => r.status === "Dispute").map((r) => (
                            <div key={`dis_r_${r.id}`} className="p-4 rounded-xl border border-red-200 bg-red-50/10 space-y-3">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                  <h4 className="font-bold text-red-800">Rental Alat Dispute</h4>
                                  <p className="text-xs text-gray-500">Penyewa: **{r.pendakiName}** &nbsp;•&nbsp; Vendor: **{r.vendorName}** &nbsp;•&nbsp; Total Tarif: **Rp {r.totalPrice.toLocaleString()}**</p>
                                </div>
                                <Badge className="bg-red-600 text-white">DISPUTE</Badge>
                              </div>
                              <div className="p-2.5 rounded bg-red-50 border border-red-100 text-xs text-red-800">
                                <b>Alasan Keluhan Pendaki:</b> "{r.disputeNotes || "Tidak ada catatan."}"
                              </div>
                              <div className="flex gap-2 justify-end pt-1">
                                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white" onClick={() => {
                                  resolveDispute("rental", r.id, false);
                                  toast.success("Dispute selesai: Dana dilepas ke Vendor.");
                                }}>
                                  Lepas Dana ke Vendor
                                </Button>
                                <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                                  resolveDispute("rental", r.id, true);
                                  toast.success("Dispute selesai: Dana direfund ke Pendaki.");
                                }}>
                                  Kembalikan Dana ke Pendaki (Refund)
                                </Button>
                              </div>
                            </div>
                          ))}
                        </>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* 4. Tab Reports & Analytical Charts (Recharts) */}
                {activeTab === "reports" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Analitik Keuangan Platform</CardTitle>
                      <CardDescription className="text-xs">Distribusi perolehan transaksi escrow bulanan dan data demografis trip fiktif.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-8 pt-6">
                      
                      {/* Metrics cards grid */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {[
                          { label: "Total Transaksi", val: `Rp ${(bookings.reduce((a,c)=>a+c.price, 0) + rentalOrders.reduce((a,c)=>a+c.totalPrice, 0)).toLocaleString("id-ID")}`, color: "border-gray-200 text-gray-800" },
                          { label: "Transaksi Selesai", val: `Rp ${(bookings.filter(b=>b.status==="Selesai").reduce((a,c)=>a+c.price, 0) + rentalOrders.filter(r=>r.status==="Selesai").reduce((a,c)=>a+c.totalPrice, 0)).toLocaleString("id-ID")}`, color: "border-emerald-100 text-emerald-700 bg-emerald-50/20" },
                          { label: "Escrow Pending", val: `Rp ${(bookings.filter(b=>["Telah Dibayar","Berangkat","Basecamp","Summit","Dispute"].includes(b.status)).reduce((a,c)=>a+c.price, 0) + rentalOrders.filter(r=>["Telah Dibayar","Sedang Disewa","Dispute"].includes(r.status)).reduce((a,c)=>a+c.totalPrice, 0)).toLocaleString("id-ID")}`, color: "border-amber-100 text-amber-700 bg-amber-50/20" },
                          { label: "Fee Platform (10%)", val: `Rp ${((bookings.filter(b=>b.status==="Selesai").reduce((a,c)=>a+c.price, 0) + rentalOrders.filter(r=>r.status==="Selesai").reduce((a,c)=>a+c.totalPrice, 0)) * 0.1).toLocaleString("id-ID")}`, color: "border-blue-100 text-blue-700 bg-blue-50/20" }
                        ].map((m, idx) => (
                          <div key={idx} className={`p-4 border rounded-xl shadow-xs text-center ${m.color}`}>
                            <p className="text-[10px] uppercase font-bold tracking-wider opacity-75">{m.label}</p>
                            <p className="text-base font-bold mt-1">{m.val}</p>
                          </div>
                        ))}
                      </div>

                      {/* Visual charts using Recharts */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Bar chart - Revenue breakdown */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-650 uppercase tracking-wider text-center">Komparasi Jasa Guide vs Rental Alat</p>
                          <div className="h-64 bg-white rounded-xl p-3 border border-gray-150">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart
                                data={[
                                  { name: "Total Transaksi", Guide: bookings.reduce((a,c)=>a+c.price, 0), Rental: rentalOrders.reduce((a,c)=>a+c.totalPrice, 0) },
                                  { name: "Lunas / Selesai", Guide: bookings.filter(b=>b.status==="Selesai").reduce((a,c)=>a+c.price, 0), Rental: rentalOrders.filter(r=>r.status==="Selesai").reduce((a,c)=>a+c.totalPrice, 0) }
                                ]}
                                margin={{ top: 10, right: 10, left: -20, bottom: 5 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 11 }} />
                                <Bar dataKey="Guide" fill="#059669" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="Rental" fill="#0284c7" radius={[4, 4, 0, 0]} />
                              </BarChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Pie Chart - Status distribution */}
                        <div className="space-y-2">
                          <p className="text-xs font-bold text-gray-650 uppercase tracking-wider text-center">Distribusi Transaksi Berdasarkan Status</p>
                          <div className="h-64 bg-white rounded-xl p-3 border border-gray-150 flex items-center justify-center">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie
                                  data={[
                                    { name: "Selesai", value: bookings.filter(b=>b.status==="Selesai").length + rentalOrders.filter(r=>r.status==="Selesai").length },
                                    { name: "Sedang Berjalan", value: bookings.filter(b=>["Telah Dibayar","Berangkat","Basecamp","Summit"].includes(b.status)).length + rentalOrders.filter(r=>["Telah Dibayar","Sedang Disewa"].includes(r.status)).length },
                                    { name: "Pending / Baru", value: bookings.filter(b=>["Menunggu Konfirmasi","Menunggu Pembayaran"].includes(b.status)).length + rentalOrders.filter(r=>["Menunggu Konfirmasi","Menunggu Pembayaran"].includes(r.status)).length },
                                    { name: "Sengketa / Dispute", value: bookings.filter(b=>b.status==="Dispute").length + rentalOrders.filter(r=>r.status==="Dispute").length }
                                  ].filter(d => d.value > 0)}
                                  cx="50%"
                                  cy="50%"
                                  innerRadius={50}
                                  outerRadius={75}
                                  paddingAngle={4}
                                  dataKey="value"
                                >
                                  {[
                                    { name: "Selesai", color: "#10b981" },
                                    { name: "Sedang Berjalan", color: "#0ea5e9" },
                                    { name: "Pending / Baru", color: "#f59e0b" },
                                    { name: "Sengketa / Dispute", color: "#ef4444" }
                                  ].map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend wrapperStyle={{ fontSize: 10 }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* ════════════════════ IN-APP CHAT WORKSPACE (COMMON TAB) ════════════════════ */}
            {activeTab === "chat" && (
              <Card className="border border-gray-150 shadow-lg overflow-hidden h-[500px] flex flex-col bg-white">
                <div className="flex-1 flex min-h-0">
                  
                  {/* Chat sidebar list of partners */}
                  <div className="w-1/3 border-r border-gray-100 flex flex-col bg-gray-50/50">
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider p-3 border-b border-gray-100 shrink-0">Daftar Obrolan</p>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                      {chatPartnersList.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-8">Belum ada obrolan aktif.</p>
                      ) : (
                        chatPartnersList.map((p) => {
                          const isActive = p.id === selectedChatPartnerId;
                          return (
                            <button
                              key={p.id}
                              onClick={() => {
                                setSelectedChatPartnerId(p.id);
                                setSelectedChatPartnerName(p.name);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                                isActive ? "bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-xs" : "hover:bg-gray-100 text-gray-700"
                              }`}
                            >
                              <Avatar className="size-8">
                                <AvatarFallback>{p.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="truncate leading-tight">{p.name}</p>
                                <p className="text-[10px] text-gray-400 truncate mt-0.5">Klik untuk melihat pesan</p>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Chat active window */}
                  <div className="w-2/3 flex flex-col bg-white h-full justify-between">
                    {selectedChatPartnerId ? (
                      <>
                        {/* Partner info header */}
                        <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-emerald-50/10 shrink-0">
                          <Avatar className="size-9">
                            <AvatarFallback>{selectedChatPartnerName[0]}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-xs font-bold text-gray-800 leading-tight">{selectedChatPartnerName}</p>
                            <span className="text-[9px] text-gray-400">ID Mitra: {selectedChatPartnerId}</span>
                          </div>
                        </div>

                        {/* Messages logs */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-3">
                          {activeChatMessages.map((msg) => {
                            const isMe = msg.senderId === currentUser.id;
                            return (
                              <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                                <div className={`max-w-[75%] rounded-2xl px-3.5 py-2.5 text-xs shadow-xs ${
                                  isMe
                                    ? "bg-emerald-600 text-white rounded-br-none"
                                    : "bg-gray-100 text-gray-800 rounded-bl-none"
                                }`}>
                                  <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                  <p className={`text-[8px] mt-1 text-right ${isMe ? "text-emerald-200" : "text-gray-400"}`}>{msg.timestamp}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Send input message bar */}
                        <form onSubmit={handleSendChatMessage} className="p-3 border-t border-gray-100 flex gap-2 shrink-0 bg-gray-50/20">
                          <Input
                            placeholder="Tulis pesan obrolan..."
                            className="bg-white border-gray-200 text-xs"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                          />
                          <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                            <Send className="size-4" />
                          </Button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-sm">
                        <MessageSquare className="size-10 mb-2 opacity-30 text-gray-400" />
                        <span>Pilih obrolan aktif dari sidebar kiri untuk bertukar pesan.</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* ─── SIMULATION MODALS ──────────────────────────────────────────────── */}
      
      {/* 1. Mock Midtrans-style Escrow Payment Modal */}
      {paymentModalOpen && activePaymentItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setPaymentModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-4">
              <CreditCard className="size-6 text-emerald-600 shrink-0" />
              <div>
                <h3 className="font-bold text-gray-800">AyokMendaki Payment</h3>
                <p className="text-[10px] text-gray-400 leading-none">Simulasi Escrow Gateway (Grup Midtrans/Xendit)</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-center">
                <p className="text-xs text-emerald-800 font-semibold">Total Tagihan (Escrow Aman)</p>
                <p className="text-xl font-bold text-emerald-700 mt-1">Rp {activePaymentItem.amount.toLocaleString("id-ID")}</p>
                <p className="text-[9px] text-gray-400 mt-1">Dana Anda akan ditahan oleh platform dan baru dilepas ke Mitra setelah trip selesai.</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-2">Pilih Metode Pembayaran Fiktif</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "gopay", label: "GoPay Demo", desc: "Instan QRIS" },
                    { id: "bni", label: "Virtual Account BNI", desc: "Transfer Bank" },
                    { id: "mandiri", label: "Virtual Account Mandiri", desc: "Transfer Bank" },
                    { id: "cc", label: "Kartu Kredit Demo", desc: "Visa / Mastercard" }
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        paymentMethod === method.id 
                          ? "bg-emerald-50 border-emerald-500 text-emerald-700" 
                          : "bg-white border-gray-150 text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <p className="text-xs font-bold leading-none">{method.label}</p>
                      <p className="text-[9px] text-gray-400 mt-1">{method.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setPaymentModalOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleProcessPayment} disabled={isPaying}>
                  {isPaying ? "Memverifikasi Transfer..." : "Konfirmasi & Bayar Lunas"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. Review & Rating Modal */}
      {reviewModalOpen && reviewItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setReviewModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <Star className="size-6 text-emerald-600 fill-emerald-600 shrink-0" />
              <h3 className="text-lg">Berikan Ulasan Layanan</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Tulis ulasan Anda untuk **{reviewItem.name}**. Ulasan Anda bersifat transparan untuk membantu pendaki lainnya.
            </p>
            <div className="space-y-4">
              <div className="text-center">
                <label className="text-xs font-semibold text-gray-700 block mb-2">Pilih Rating Bintang</label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} onClick={() => setRatingInput(star)} className="text-2xl text-yellow-400">
                      {star <= ratingInput ? "★" : "☆"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Catatan Feedback / Ulasan Anda</label>
                <textarea 
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500 h-24 resize-none"
                  placeholder="Ceritakan pengalaman Anda. Apakah layanannya memuaskan, ramah, aman, dll."
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setReviewModalOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleSaveReview}>Simpan Ulasan</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. Dispute Resolution reporting modal */}
      {disputeModalOpen && disputeItem && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setDisputeModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-red-800 font-bold mb-3">
              <AlertTriangle className="size-6 text-red-600 shrink-0 animate-pulse" />
              <h3 className="text-lg">Laporkan Sengketa Layanan</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Ajukan klaim perselisihan atas pesanan **{disputeItem.id}** jika Mitra tidak memenuhi kewajiban trip atau barang sewaan tidak sesuai deskripsi.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Jelaskan Detail Masalah / Alasan Sengketa</label>
                <textarea 
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-55 focus:bg-white focus:outline-red-500 h-24 resize-none"
                  placeholder="Sebutkan alasan sengketa (misal: guide tidak hadir di basecamp tepat waktu, barang sewaan tenda robek/bocor, dll.)"
                  value={disputeNotesInput}
                  onChange={(e) => setDisputeNotesInput(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setDisputeModalOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs bg-red-600 hover:bg-red-750 text-white font-semibold" onClick={handleSaveDispute}>Ajukan Laporan Sengketa</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Negotiation Counter Price Modal (Guide/Vendor side) */}
      {counterModalOpen && counterNego && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setCounterModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <DollarSign className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Kirim Penawaran Balik</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-normal">
              Tawarkan harga baru (counter price) jika Anda keberatan dengan tawaran harga dari pendaki.
            </p>
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 rounded-xl text-xs space-y-1.5">
                <p>Harga Normal Jasa: **Rp {counterNego.originalPrice.toLocaleString()}**</p>
                <p>Tawaran Awal Pendaki: **Rp {counterNego.proposedPrice.toLocaleString()}**</p>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1 font-bold">Harga Penawaran Balik Anda (Rp)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 font-bold" />
                  <Input 
                    type="number" 
                    className="pl-9 text-xs font-bold text-emerald-700 h-9" 
                    value={counterPriceInput}
                    onChange={(e) => setCounterPriceInput(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setCounterModalOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleSaveCounter}>Kirim Penawaran Balik</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. Document verification submission modal (Guide/Vendor) */}
      {verFormOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setVerFormOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <Award className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Ajukan Dokumen Verifikasi</h3>
            </div>
            <form onSubmit={handleSendVerification} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nama Dokumen / Berkas Legalitas</label>
                <Input
                  className="text-xs bg-gray-50"
                  value={verDocName}
                  onChange={(e) => setVerDocName(e.target.value)}
                  placeholder="Contoh: Sertifikasi APIGI Tingkat Madya"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">URL File/Gambar Lampiran</label>
                <Input
                  className="text-xs bg-gray-50"
                  value={verDocFile}
                  onChange={(e) => setVerDocFile(e.target.value)}
                  placeholder="Masukkan link gambar dokumen"
                />
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setVerFormOpen(false)}>Batal</Button>
                <Button type="submit" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Ajukan Berkas</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useMemo } from "react";
import { useApp, Booking, RentalOrder, Negotiation, UserRole, EquipmentItem, User, Mountain } from "../context/AppContext";
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
  Package,
  Wallet
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
    setMountains,
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
    resolveDispute,
    tripPackages,
    setTripPackages,
    addTripPackage,
    toggleGroupDiscount,
    confirmEscrow,
    reportDamage,
    resolveEscrowWithDeposit,
    climberDeposit,
    depositTransactions,
    topUpDeposit,
    withdrawDeposit
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

  const [topUpModalOpen, setTopUpModalOpen] = useState(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [depositAmountInput, setDepositAmountInput] = useState("");

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
    category: "tent" as "tent" | "carrier" | "other",
    groupDiscountEnabled: false,
    damageTerms: ""
  });

  // Fine / Damage Claim Modal states
  const [fineModalOpen, setFineModalOpen] = useState(false);
  const [fineTargetId, setFineTargetId] = useState("");
  const [fineTargetType, setFineTargetType] = useState<"booking" | "rental">("rental");
  const [fineAmountInput, setFineAmountInput] = useState("");
  const [fineNotesInput, setFineNotesInput] = useState("");

  // Chat State
  const [selectedChatPartnerId, setSelectedChatPartnerId] = useState("");
  const [selectedChatPartnerName, setSelectedChatPartnerName] = useState("");
  const [chatInput, setChatInput] = useState("");

  // Verification request form states (Guide/Vendor)
  const [verFormOpen, setVerFormOpen] = useState(false);
  const [verDocName, setVerDocName] = useState("Scan Sertifikasi APIGI");
  const [verDocFile, setVerDocFile] = useState("https://images.unsplash.com/photo-1586075010923-2dd4570fb338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400");

  // Guide Package Ads form states
  const [pkgFormOpen, setPkgFormOpen] = useState(false);
  const [pkgTitle, setPkgTitle] = useState("");
  const [pkgMountain, setPkgMountain] = useState("");
  const [pkgPrice, setPkgPrice] = useState("");
  const [pkgDuration, setPkgDuration] = useState("3 Hari 2 Malam");
  const [pkgDeadline, setPkgDeadline] = useState("");
  const [pkgDesc, setPkgDesc] = useState("");
  const [pkgServices, setPkgServices] = useState<string[]>([]);
  const [pkgRundown, setPkgRundown] = useState("");
  const [pkgVendorId, setPkgVendorId] = useState("");

  // Super Admin Mountain management states
  const [editingMountain, setEditingMountain] = useState<Mountain | null>(null);
  const [mountainForm, setMountainForm] = useState({
    ticketPrice: "",
    adminContactMethod: "Instagram" as "Instagram" | "Website Resmi" | "WhatsApp",
    adminContactValue: "",
    status: "Buka" as "Buka" | "Tutup"
  });

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

  // Initialize package form select values
  useEffect(() => {
    if (mountains.length > 0 && !pkgMountain) {
      setPkgMountain(mountains[0].name);
    }
    if (vendors.length > 0 && !pkgVendorId) {
      setPkgVendorId(vendors[0].id);
    }
  }, [mountains, vendors, pkgMountain, pkgVendorId]);

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
        category: item.category,
        groupDiscountEnabled: item.groupDiscountEnabled || false,
        damageTerms: item.damageTerms || ""
      });
    } else {
      setEditingItem(null);
      setCatalogForm({
        name: "",
        description: "",
        price: "",
        available: "",
        category: "tent",
        groupDiscountEnabled: false,
        damageTerms: ""
      });
    }
    setItemFormOpen(true);
  };

  const handleSaveCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, price, available, category, groupDiscountEnabled, damageTerms } = catalogForm;

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
        category,
        groupDiscountEnabled,
        damageTerms
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
        vendorName: currentUser?.name || "Toko Outdoor",
        groupDiscountEnabled,
        damageTerms
      });
      toast.success("Barang camping baru ditambahkan ke katalog!");
    }

    setItemFormOpen(false);
  };

  const handleOpenFineModal = (id: string, type: "booking" | "rental") => {
    setFineTargetId(id);
    setFineTargetType(type);
    setFineAmountInput("");
    setFineNotesInput("");
    setFineModalOpen(true);
  };

  const handleSaveFine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fineTargetId || !fineAmountInput.trim()) return;

    reportDamage(fineTargetType, fineTargetId, parseInt(fineAmountInput) || 0, fineNotesInput);
    setFineModalOpen(false);
    toast.warning("Klaim denda kerusakan berhasil dikirim ke Super Admin!");
  };

  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(depositAmountInput);
    if (!amount || amount <= 0) {
      toast.error("Masukkan nominal yang valid!");
      return;
    }
    topUpDeposit(amount);
    setTopUpModalOpen(false);
    setDepositAmountInput("");
    toast.success(`Berhasil melakukan top up deposit sebesar Rp ${amount.toLocaleString("id-ID")}!`);
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(depositAmountInput);
    if (!amount || amount <= 0) {
      toast.error("Masukkan nominal yang valid!");
      return;
    }
    if (amount > climberDeposit) {
      toast.error("Saldo deposit tidak mencukupi!");
      return;
    }
    withdrawDeposit(amount);
    setWithdrawModalOpen(false);
    setDepositAmountInput("");
    toast.success(`Berhasil menarik deposit sebesar Rp ${amount.toLocaleString("id-ID")}!`);
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

  // Super Admin Mountain handlers
  const handleOpenMountainEdit = (mountain: Mountain) => {
    setEditingMountain(mountain);
    setMountainForm({
      ticketPrice: mountain.ticketPrice.toString(),
      adminContactMethod: mountain.adminContactMethod,
      adminContactValue: mountain.adminContactValue,
      status: mountain.status
    });
  };

  const handleSaveMountain = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMountain) return;
    
    const { ticketPrice, adminContactMethod, adminContactValue, status } = mountainForm;
    
    setMountains((prev) =>
      prev.map((m) =>
        m.name === editingMountain.name
          ? {
              ...m,
              ticketPrice: parseInt(ticketPrice) || 0,
              adminContactMethod,
              adminContactValue,
              status
            }
          : m
      )
    );
    
    setEditingMountain(null);
    toast.success(`Kontak tiket resmi ${editingMountain.name} berhasil diperbarui!`);
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
      case "Start":
        return <Badge variant="outline" className="bg-emerald-600 text-white border-emerald-700 animate-pulse">Trip: Start (Mendaki)</Badge>;
      case "Muncak":
        return <Badge variant="outline" className="bg-emerald-800 text-white border-emerald-900 animate-bounce">Trip: Muncak (Puncak)</Badge>;
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
                  { id: "deposit_wallet", label: "Deposit & Dompet", icon: <Wallet className="size-4" /> },
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
                  { id: "packages", label: "Iklan Paket (Ads)", icon: <Award className="size-4" /> },
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
                  { id: "collaborations", label: "Kolaborasi Guide", icon: <Users className="size-4" /> },
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
                  { id: "manage_mountains", label: "Kontak Tiket Gunung", icon: <MountainIcon className="size-4" /> },
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
                          <div key={b.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col hover:shadow-md transition-all">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <div className="flex items-center gap-2 flex-wrap mb-1">
                                  <h4 className="font-bold text-gray-800">{b.mountainName}</h4>
                                  {b.officialTicketBooking ? (
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[9px] py-0">Tiket Masuk Resmi (Mandiri)</Badge>
                                  ) : b.bookingType === "paket" ? (
                                    <Badge className="bg-amber-100 text-amber-800 text-[9px] py-0">Paket Kemitraan (Ads)</Badge>
                                  ) : (
                                    <Badge className="bg-blue-100 text-blue-800 text-[9px] py-0">Jasa Guide Mandiri: {b.guideName}</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="size-3.5" /> Tanggal Pendakian: <b>{b.bookingDate}</b></p>
                                <p className="text-xs text-emerald-700 font-bold mt-1">Total Biaya: Rp {b.price.toLocaleString("id-ID")}</p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0">
                                <div className="mb-1">{getStatusBadge(b.status)}</div>
                              </div>
                            </div>

                            {/* 📅 Pre-Trip Meeting 30 Menit */}
                            {b.preTripMeetingDate && ["Telah Dibayar", "Start", "Muncak"].includes(b.status) && (
                              <div className="mt-3 p-3 bg-amber-50 rounded-xl border border-amber-200/50 max-w-lg">
                                <p className="text-[10px] font-bold text-amber-800 flex items-center gap-1">
                                  📅 Pre-Trip Meeting Persiapan (30 Menit) Terjadwal:
                                </p>
                                <p className="text-xs text-gray-700 mt-1 font-semibold">
                                  Jadwal: {b.preTripMeetingDate} &middot; {b.preTripMeetingTime}
                                </p>
                                <p className="text-[9px] text-gray-500 leading-tight mt-0.5">
                                  *Wajib bergabung untuk briefing fisik, peralatan, logistik, rundown, dan koordinasi dengan Guide.*
                                </p>
                                <Button 
                                  size="xs" 
                                  className="mt-2 bg-amber-600 hover:bg-amber-700 text-white text-[10px] h-7 px-3 font-semibold"
                                  onClick={() => {
                                    window.open(b.preTripMeetingLink, "_blank");
                                    toast.success("[Simulasi] Bergabung ke video call Google Meet Pre-Trip persiapan.");
                                  }}
                                >
                                  Gabung Google Meet (30 Menit)
                                </Button>
                              </div>
                            )}

                            {/* 📍 Simplified Stepper */}
                            {["Telah Dibayar", "Start", "Muncak", "Selesai"].includes(b.status) && (
                              <div className="mt-3 p-3 bg-emerald-50/40 rounded-xl border border-emerald-100 max-w-lg">
                                <p className="text-[10px] font-bold text-emerald-800 mb-2">📍 Status Perjalanan Lapangan (Live Status):</p>
                                <div className="flex items-center gap-2">
                                  {[
                                    { label: "1. Start (Mulai)", active: b.status === "Start" || b.status === "Muncak" || b.status === "Selesai" },
                                    { label: "2. Muncak (Puncak)", active: b.status === "Muncak" || b.status === "Selesai" },
                                    { label: "3. Selesai", active: b.status === "Selesai" }
                                  ].map((step, idx) => (
                                    <div key={idx} className="flex items-center gap-2 flex-1">
                                      <div className={`flex-1 text-center py-1 px-1.5 rounded-lg border text-[9px] font-extrabold ${
                                        step.active 
                                          ? "bg-emerald-600 text-white border-emerald-600 shadow-xs" 
                                          : "bg-white text-gray-400 border-gray-250"
                                      }`}>
                                        {step.label}
                                      </div>
                                      {idx < 2 && <span className="text-gray-300 text-[10px] font-bold">➔</span>}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Deposit Jaminan Status */}
                            {b.depositAmount && (
                              <div className="mt-3 flex items-center justify-between text-xs p-2.5 rounded-lg border bg-gray-50/50">
                                <span className="text-gray-500 font-semibold">Deposit Jaminan (Held in Escrow):</span>
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span>Rp {b.depositAmount.toLocaleString("id-ID")}</span>
                                  {b.depositStatus === "held" && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] py-0">Ditahan</Badge>}
                                  {b.depositStatus === "refunded" && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[9px] py-0">Di-refund Penuh</Badge>}
                                  {b.depositStatus === "partially_refunded" && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] py-0">Di-refund Sebagian</Badge>}
                                  {b.depositStatus === "forfeited" && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[9px] py-0">Hangus (Denda)</Badge>}
                                </div>
                              </div>
                            )}

                            {/* Fine notification */}
                            {b.fineAmount && b.fineAmount > 0 && (
                              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200/50 max-w-lg text-xs text-red-800 space-y-1">
                                <p className="font-bold flex items-center gap-1">⚠️ Pelanggaran / Denda Dilaporkan Mitra:</p>
                                <p>Nominal: **Rp {b.fineAmount.toLocaleString("id-ID")}**</p>
                                <p className="italic">Alasan: "{b.fineNotes}"</p>
                                <p className="text-[10px] text-gray-500 mt-1 font-normal leading-tight">Denda ini akan dikonfirmasi oleh Super Admin dan otomatis dipotong dari dana deposit jaminan Anda.</p>
                              </div>
                            )}

                            <div className="flex gap-2 w-full justify-end border-t border-gray-100 pt-3 mt-3">
                                {b.status === "Menunggu Pembayaran" && (
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white" onClick={() => handleOpenPayment(b.id, "booking", b.price)}>
                                    <CreditCard className="size-3.5 mr-1" /> Bayar Simulasi
                                  </Button>
                                )}
                                {["Telah Dibayar", "Start", "Muncak"].includes(b.status) && (
                                  <Button 
                                    size="sm" 
                                    variant={b.pendakiConfirmed ? "outline" : "default"} 
                                    className={`text-xs px-4 ${b.pendakiConfirmed ? "text-gray-400 border-gray-200 bg-white" : "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"}`}
                                    onClick={() => {
                                      confirmEscrow("booking", b.id, "pendaki");
                                      toast.success("Konfirmasi penyelesaian trip Anda terkirim. Menunggu persetujuan Mitra & Admin.");
                                    }}
                                    disabled={b.pendakiConfirmed}
                                  >
                                    {b.pendakiConfirmed ? "✓ Trip Dikonfirmasi Selesai" : "Konfirmasikan Trip Selesai"}
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
                          <div key={r.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col hover:shadow-md transition-shadow">
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                              <div>
                                <h4 className="font-bold text-gray-800">{r.itemName}</h4>
                                <p className="text-xs text-gray-500 mt-1">Vendor: **{r.vendorName}** &nbsp;•&nbsp; Jumlah: **{r.qty} Unit**</p>
                                <p className="text-xs text-gray-500 mt-0.5">Tanggal Sewa: **{r.startDate}** s/d **{r.endDate}**</p>
                                <p className="text-xs text-emerald-700 font-bold mt-1">Total Biaya: Rp {r.totalPrice.toLocaleString("id-ID")}</p>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2 w-full md:w-auto shrink-0 border-t md:border-t-0 pt-2.5 md:pt-0">
                                <div className="mb-1">{getStatusBadge(r.status)}</div>
                              </div>
                            </div>

                            {/* Deposit Jaminan Status */}
                            {r.depositAmount && (
                              <div className="mt-3 flex items-center justify-between text-xs p-2.5 rounded-lg border bg-gray-50/50">
                                <span className="text-gray-500 font-semibold">Deposit Jaminan (Held in Escrow):</span>
                                <div className="flex items-center gap-1.5 font-bold">
                                  <span>Rp {r.depositAmount.toLocaleString("id-ID")}</span>
                                  {r.depositStatus === "held" && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[9px] py-0">Ditahan</Badge>}
                                  {r.depositStatus === "refunded" && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-[9px] py-0">Di-refund Penuh</Badge>}
                                  {r.depositStatus === "partially_refunded" && <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-[9px] py-0">Di-refund Sebagian</Badge>}
                                  {r.depositStatus === "forfeited" && <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 text-[9px] py-0">Hangus (Denda)</Badge>}
                                </div>
                              </div>
                            )}

                            {/* Fine notification */}
                            {r.fineAmount && r.fineAmount > 0 && (
                              <div className="mt-3 p-3 bg-red-50 rounded-xl border border-red-200/50 max-w-lg text-xs text-red-800 space-y-1">
                                <p className="font-bold flex items-center gap-1">⚠️ Pelanggaran / Denda Dilaporkan Vendor:</p>
                                <p>Nominal: **Rp {r.fineAmount.toLocaleString("id-ID")}**</p>
                                <p className="italic">Alasan: "{r.fineNotes}"</p>
                                <p className="text-[10px] text-gray-500 mt-1 font-normal leading-tight">Denda ini akan dikonfirmasi oleh Super Admin dan otomatis dipotong dari dana deposit jaminan Anda.</p>
                              </div>
                            )}

                            <div className="flex gap-2 w-full justify-end border-t border-gray-100 pt-3 mt-3">
                                {r.status === "Menunggu Pembayaran" && (
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white font-semibold" onClick={() => handleOpenPayment(r.id, "rental", r.totalPrice)}>
                                    <CreditCard className="size-3.5 mr-1" /> Bayar Simulasi
                                  </Button>
                                )}
                                {["Telah Dibayar", "Siap Diambil", "Sedang Disewa"].includes(r.status) && (
                                  <Button 
                                    size="sm" 
                                    variant={r.pendakiConfirmed ? "outline" : "default"} 
                                    className={`text-xs px-4 ${r.pendakiConfirmed ? "text-gray-400 border-gray-200 bg-white" : "bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"}`}
                                    onClick={() => {
                                      confirmEscrow("rental", r.id, "pendaki");
                                      toast.success("Konfirmasi pengembalian alat sewaan Anda terkirim. Menunggu persetujuan Vendor & Admin.");
                                    }}
                                    disabled={r.pendakiConfirmed}
                                  >
                                    {r.pendakiConfirmed ? "✓ Alat Dikonfirmasi Kembali" : "Konfirmasikan Alat Dikembalikan"}
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

                {activeTab === "deposit_wallet" && (
                  <Card className="border border-gray-150 shadow-sm overflow-hidden font-sans">
                    <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-100 py-5">
                      <div className="flex justify-between items-center flex-wrap gap-3">
                        <div>
                          <CardTitle className="text-lg font-bold text-gray-800">Dompet & Saldo Deposit Jaminan</CardTitle>
                          <CardDescription className="text-xs text-gray-500">
                            Kelola saldo jaminan pendakian Anda untuk otomatisasi denda pelanggaran atau klaim kerusakan.
                          </CardDescription>
                        </div>
                        <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono px-3 py-1 font-extrabold text-sm shadow-sm flex items-center gap-1.5 rounded-xl">
                          <Wallet className="size-4 shrink-0" />
                          Rp {climberDeposit.toLocaleString("id-ID")}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-6">
                      {/* Action buttons with wallet details */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-xs space-y-3">
                          <h4 className="text-sm font-bold text-gray-700">Manajemen Saldo Deposit</h4>
                          <p className="text-xs text-gray-400 leading-relaxed font-normal">
                            Saldo deposit digunakan untuk menjamin setiap pesanan booking guide atau rental. Pastikan saldo Anda selalu mencukupi (minimal Rp 100.000) sebelum melakukan pemesanan.
                          </p>
                          <div className="flex gap-2 pt-1.5">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1 font-semibold rounded-xl h-9"
                              onClick={() => setTopUpModalOpen(true)}
                            >
                              Top Up Saldo
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-xs flex-1 border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl h-9"
                              onClick={() => setWithdrawModalOpen(true)}
                            >
                              Tarik Dana
                            </Button>
                          </div>
                        </div>

                        <div className="p-4 rounded-2xl border border-red-100 bg-red-50/10 space-y-2.5">
                          <h4 className="text-sm font-bold text-red-800 flex items-center gap-1">
                            <AlertTriangle className="size-4 text-red-655 shrink-0" />
                            Kebijakan Pelanggaran & Denda
                          </h4>
                          <ul className="text-[11px] text-gray-600 list-disc list-inside space-y-1 font-normal leading-relaxed">
                            <li>Setiap transaksi menahan deposit jaminan sebesar <b>Rp 100.000</b>.</li>
                            <li>Jika melanggar aturan gunung (sampah/flora) atau merusak alat, denda akan dilaporkan Mitra.</li>
                            <li>Setelah <b>Super Admin menyetujui denda</b>, denda akan otomatis memotong deposit jaminan Anda.</li>
                            <li>Sisa deposit (jika ada) otomatis dikembalikan penuh ke Saldo Dompet ini.</li>
                          </ul>
                        </div>
                      </div>

                      {/* Transaction log */}
                      <div className="space-y-3">
                        <h4 className="text-sm font-bold text-gray-800">Riwayat Mutasi Saldo & Pelanggaran</h4>
                        <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
                          <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left text-xs">
                              <thead>
                                <tr className="bg-gray-50/70 text-gray-500 font-bold border-b border-gray-100">
                                  <th className="p-3 font-semibold">Tanggal / Waktu</th>
                                  <th className="p-3 font-semibold">Tipe Mutasi</th>
                                  <th className="p-3 font-semibold">Deskripsi / Detail Pelanggaran</th>
                                  <th className="p-3 text-right font-semibold">Nominal</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-100">
                                {depositTransactions.length === 0 ? (
                                  <tr>
                                    <td colSpan={4} className="p-8 text-center text-gray-400 italic font-normal">
                                      Belum ada riwayat transaksi deposit.
                                    </td>
                                  </tr>
                                ) : (
                                  depositTransactions.map((tx) => (
                                    <tr key={tx.id} className="hover:bg-gray-50/50 transition-colors">
                                      <td className="p-3 text-gray-400 whitespace-nowrap font-normal">{tx.createdAt}</td>
                                      <td className="p-3">
                                        {tx.type === "topup" && (
                                          <Badge className="bg-green-50 text-green-700 border-green-200 text-[10px] shadow-none py-0.5 rounded-md" variant="outline">
                                            Top Up
                                          </Badge>
                                        )}
                                        {tx.type === "withdraw" && (
                                          <Badge className="bg-gray-50 text-gray-600 border-gray-200 text-[10px] shadow-none py-0.5 rounded-md" variant="outline">
                                            Penarikan
                                          </Badge>
                                        )}
                                        {tx.type === "refund" && (
                                          <Badge className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] shadow-none py-0.5 rounded-md" variant="outline">
                                            Refund Deposit
                                          </Badge>
                                        )}
                                        {tx.type === "fine_deduction" && (
                                          <Badge className="bg-red-50 text-red-700 border-red-200 text-[10px] shadow-none py-0.5 rounded-md" variant="outline">
                                            Denda / Potongan
                                          </Badge>
                                        )}
                                      </td>
                                      <td className="p-3 text-gray-700 font-medium font-normal">{tx.description}</td>
                                      <td className={`p-3 text-right font-bold font-mono whitespace-nowrap ${
                                        ["topup", "refund"].includes(tx.type) ? "text-green-600" : "text-red-600"
                                      }`}>
                                        {["topup", "refund"].includes(tx.type) ? "+" : "-"}Rp {tx.amount.toLocaleString("id-ID")}
                                      </td>
                                    </tr>
                                  ))
                                )}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      </div>
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
                  <CardContent className="py-3 bg-gray-50/30 flex items-center justify-between text-xs border-t border-gray-100">
                    <div>
                      <p className="font-bold text-gray-800">Diskon Rombongan Otomatis</p>
                      <p className="text-gray-500 text-[10px]">Aktifkan potongan harga rombongan (2-3 pax: 10%, 4-5 pax: 20%, 5+ pax: 30%)</p>
                    </div>
                    {(() => {
                      const guideObj = guides.find(g => g.id === currentUser.id);
                      const isEnabled = guideObj?.groupDiscountEnabled;
                      return (
                        <Button 
                          size="xs" 
                          variant={isEnabled ? "default" : "outline"}
                          className={`font-semibold ${isEnabled ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}`}
                          onClick={() => {
                            toggleGroupDiscount("guide", currentUser.id);
                            toast.success(`Diskon rombongan pemandu berhasil ${!isEnabled ? "diaktifkan" : "dinonaktifkan"}`);
                          }}
                        >
                          {isEnabled ? "✓ Aktif" : "Nonaktif"}
                        </Button>
                      );
                    })()}
                  </CardContent>
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
                      {bookings.filter(b => b.guideId === currentUser.id && ["Telah Dibayar", "Start", "Muncak"].includes(b.status)).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Tidak ada trip aktif saat ini.</div>
                      ) : (
                        bookings.filter(b => b.guideId === currentUser.id && ["Telah Dibayar", "Start", "Muncak"].includes(b.status)).map((b) => (
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
                              <div className="grid grid-cols-3 gap-2">
                                {[
                                  { label: "1. Start", status: "Start" as const, desc: "Mulai trekking" },
                                  { label: "2. Muncak", status: "Muncak" as const, desc: "Sampai puncak" },
                                  { label: "3. Selesai", status: "Selesai" as const, desc: "Kembali ke camp" }
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

                            <div className="flex justify-between items-center text-xs border-t border-gray-100 pt-3">
                              <div className="text-gray-500 text-[11px] font-semibold">
                                <span>Persetujuan Cair Escrow:</span>
                                <Badge variant="outline" className={`ml-1.5 text-[9px] ${b.partnerConfirmed ? "bg-green-50 text-green-700 border-green-200" : "bg-gray-50 text-gray-500"}`}>
                                  {b.partnerConfirmed ? "Selesai Dikonfirmasi" : "Menunggu Konfirmasi Anda"}
                                </Badge>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="xs"
                                  variant={b.partnerConfirmed ? "outline" : "default"}
                                  className={b.partnerConfirmed ? "text-gray-400 border-gray-200 bg-white" : "bg-emerald-600 text-white font-semibold"}
                                  disabled={b.partnerConfirmed}
                                  onClick={() => {
                                    confirmEscrow("booking", b.id, "guide");
                                    toast.success("Trip dikonfirmasi selesai. Menunggu persetujuan Pendaki & Admin.");
                                  }}
                                >
                                  {b.partnerConfirmed ? "✓ Selesai Terkonfirmasi" : "Konfirmasi Selesai"}
                                </Button>
                                
                                <Button 
                                  size="xs" 
                                  variant="outline" 
                                  className="border-red-200 text-red-655 hover:bg-red-50 font-semibold"
                                  onClick={() => handleOpenFineModal(b.id, "booking")}
                                >
                                  {b.fineAmount ? `Pelanggaran: Rp ${b.fineAmount.toLocaleString("id-ID")}` : "Laporkan Pelanggaran"}
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </CardContent>
                  </Card>
                )}

                {activeTab === "packages" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between border-b border-gray-100 py-4 flex-wrap gap-2">
                      <div>
                        <CardTitle className="text-lg font-bold">Kelola Iklan Paket Pendakian (Ads)</CardTitle>
                        <CardDescription className="text-xs">Publish iklan paket trip komplit untuk mempermudah pemesanan pendaki mandiri.</CardDescription>
                      </div>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-3 text-white font-bold" onClick={() => {
                        setPkgTitle("");
                        setPkgPrice("");
                        setPkgDuration("3 Hari 2 Malam");
                        setPkgDeadline("");
                        setPkgDesc("");
                        setPkgServices([]);
                        setPkgRundown("");
                        setPkgFormOpen(true);
                      }}>
                        <Plus className="size-3.5 mr-1" /> Buat Paket Baru
                      </Button>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-6">
                      {/* Package creation form */}
                      {pkgFormOpen && (
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          if (!pkgTitle || !pkgPrice || !pkgDeadline) {
                            toast.error("Wajib mengisi judul, tarif, dan tenggat promo.");
                            return;
                          }
                          const chosenVendor = vendors.find(v => v.id === pkgVendorId);
                          addTripPackage({
                            title: pkgTitle,
                            guideId: currentUser.id,
                            guideName: currentUser.name,
                            vendorId: pkgVendorId || undefined,
                            vendorName: chosenVendor?.name || undefined,
                            description: pkgDesc || "Paket pendakian bersama guide berlisensi.",
                            duration: pkgDuration,
                            price: parseInt(pkgPrice) || 500000,
                            promoDeadline: pkgDeadline,
                            services: pkgServices.length > 0 ? pkgServices : ["Jasa Pemandu"],
                            rundown: pkgRundown ? pkgRundown.split("\n").filter(l => l.trim()) : ["Hari 1: Trekking", "Hari 2: Selesai"],
                            image: "https://images.unsplash.com/photo-1605860632725-fa88d0ce7a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
                            targetMountain: pkgMountain || (mountains[0]?.name || "")
                          });
                          setPkgFormOpen(false);
                          toast.success("Iklan Paket Pendakian baru berhasil dipublish!");
                        }} className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/10 space-y-4 mb-4 animate-in slide-in-from-top-3">
                          <h4 className="text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-1.5 flex items-center justify-between">
                            <span>Buat Paket Ads Pendakian Kolaborasi</span>
                            <button type="button" onClick={() => setPkgFormOpen(false)} className="text-gray-400 hover:text-gray-600"><X className="size-4" /></button>
                          </h4>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Nama/Judul Paket</label>
                              <Input
                                placeholder="Contoh: Paket All-in Semeru Eksklusif"
                                className="bg-white border-gray-255 text-xs text-gray-700 h-9"
                                value={pkgTitle}
                                onChange={(e) => setPkgTitle(e.target.value)}
                              />
                            </div>
                            
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Pilih Gunung Spesialisasi</label>
                              <select
                                className="w-full px-3 py-2 text-xs border border-gray-250 bg-white rounded-lg focus:outline-emerald-500 h-9"
                                value={pkgMountain}
                                onChange={(e) => setPkgMountain(e.target.value)}
                              >
                                <option value="">-- Pilih Gunung --</option>
                                {mountains.map((m) => (
                                  <option key={m.name} value={m.name}>{m.name}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Tarif Per Orang (Rp)</label>
                              <Input
                                type="number"
                                placeholder="Contoh: 1200000"
                                className="bg-white border-gray-255 text-xs text-gray-700 h-9"
                                value={pkgPrice}
                                onChange={(e) => setPkgPrice(e.target.value)}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Durasi Perjalanan</label>
                              <Input
                                placeholder="Contoh: 3 Hari 2 Malam"
                                className="bg-white border-gray-255 text-xs text-gray-700 h-9"
                                value={pkgDuration}
                                onChange={(e) => setPkgDuration(e.target.value)}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Tenggat Promo / Batas Booking</label>
                              <Input
                                type="date"
                                className="bg-white border-gray-255 text-xs text-gray-700 h-9"
                                value={pkgDeadline}
                                onChange={(e) => setPkgDeadline(e.target.value)}
                                min={new Date().toISOString().split("T")[0]}
                              />
                            </div>

                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Mitra Vendor Kolaborasi (Logistik/Alat)</label>
                              <select
                                className="w-full px-3 py-2 text-xs border border-gray-250 bg-white rounded-lg focus:outline-emerald-500 h-9"
                                value={pkgVendorId}
                                onChange={(e) => setPkgVendorId(e.target.value)}
                              >
                                <option value="">Tanpa Vendor (Hanya Guide)</option>
                                {vendors.filter(v => v.verified).map((v) => (
                                  <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div className="space-y-2.5">
                            <label className="text-[11px] font-semibold text-gray-700 block">Fasilitas & Layanan Termasuk</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {[
                                "Simaksi Resmi (Tiket Gunung)",
                                "Jasa Pemandu (Guide APIGI)",
                                "Tenda & Sleeping Bag",
                                "Logistik Makan 3x Sehari",
                                "Transport PP Bandara/Stasiun",
                                "Porter Porter Tim"
                              ].map((serv) => {
                                const isChecked = pkgServices.includes(serv);
                                return (
                                  <label key={serv} className="flex items-center gap-1.5 text-xs text-gray-650 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      className="accent-emerald-600 size-3.5"
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setPkgServices([...pkgServices, serv]);
                                        } else {
                                          setPkgServices(pkgServices.filter(s => s !== serv));
                                        }
                                      }}
                                    />
                                    <span>{serv}</span>
                                  </label>
                                );
                              })}
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-gray-700">Deskripsi Iklan Paket</label>
                            <textarea
                              placeholder="Deskripsikan kelebihan dan detail penawaran paket Anda..."
                              className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-emerald-500 h-16 resize-none text-gray-750"
                              value={pkgDesc}
                              onChange={(e) => setPkgDesc(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-gray-700">Rundown Perjalanan (Satu baris untuk setiap hari/pos)</label>
                            <textarea
                              placeholder="Contoh:&#10;Hari 1: Penjemputan di stasiun & trekking ke pos 2&#10;Hari 2: Summit attack puncak & kemping di danau&#10;Hari 3: Kembali ke basecamp & pengantaran pulang"
                              className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-white focus:outline-emerald-500 h-24 text-gray-750"
                              value={pkgRundown}
                              onChange={(e) => setPkgRundown(e.target.value)}
                            />
                          </div>
                          
                          <div className="flex gap-2 justify-end pt-1">
                            <button type="button" className="px-3 py-1.5 text-xs border border-gray-250 bg-white hover:bg-gray-50 rounded-lg" onClick={() => setPkgFormOpen(false)}>Batal</button>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white">Publish Paket Ads</Button>
                          </div>
                        </form>
                      )}

                      {/* Display Guide's current packages */}
                      {tripPackages.filter(p => p.guideId === currentUser.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">Belum ada paket pendakian yang Anda publish.</div>
                      ) : (
                        tripPackages.filter(p => p.guideId === currentUser.id).map((p) => (
                          <div key={p.id} className="p-4 rounded-xl border border-gray-150 bg-white flex justify-between items-center gap-4 hover:shadow-sm transition-all">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-bold text-gray-800">{p.title}</h4>
                                <Badge variant="outline" className="text-[9px] uppercase">{p.duration}</Badge>
                              </div>
                              <p className="text-xs text-gray-500">Gunung Target: **{p.targetMountain}**</p>
                              {p.vendorName && <p className="text-xs text-emerald-800">⛺ Mitra Vendor: **{p.vendorName}**</p>}
                              <p className="text-xs text-emerald-700 font-bold mt-1">Rp {p.price.toLocaleString("id-ID")} / Orang &middot; Promo s/d: {p.promoDeadline}</p>
                            </div>
                            
                            <div className="flex gap-2 shrink-0">
                              <Button variant="outline" size="sm" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                                setTripPackages(prev => prev.filter(pk => pk.id !== p.id));
                                toast.success("Paket pendakian dihapus!");
                              }}>
                                Hapus
                              </Button>
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

                          <div className="grid grid-cols-1 gap-3 border-t border-gray-100 pt-3">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-750 cursor-pointer">
                              <input 
                                type="checkbox"
                                className="accent-emerald-600 size-4 rounded"
                                checked={catalogForm.groupDiscountEnabled}
                                onChange={(e) => setCatalogForm({ ...catalogForm, groupDiscountEnabled: e.target.checked })}
                              />
                              <span>Aktifkan Diskon Kuantitas Rombongan (2-3 unit: 10%, 4-5 unit: 20%, 5+ unit: 30%)</span>
                            </label>
                            
                            <div className="space-y-1">
                              <label className="text-[11px] font-semibold text-gray-700">Syarat & Ketentuan Denda (Kerusakan/Kehilangan)</label>
                              <Input
                                placeholder="Contoh: Tenda robek denda Rp 75.000, pasak hilang denda Rp 15.000 per unit."
                                className="bg-white border-gray-250 text-xs text-red-800"
                                value={catalogForm.damageTerms}
                                onChange={(e) => setCatalogForm({ ...catalogForm, damageTerms: e.target.value })}
                              />
                            </div>
                          </div>
                          
                          <div className="flex gap-2 justify-end pt-1">
                            <Button type="button" variant="outline" size="sm" className="text-xs" onClick={() => setItemFormOpen(false)}>Batal</Button>
                            <Button type="submit" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-semibold">Simpan Barang</Button>
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
                                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white font-semibold" onClick={() => updateRentalStatus(r.id, "Sedang Disewa")}>
                                          Tandai Diambil Penyewa
                                        </Button>
                                      ) : (
                                        r.status === "Sedang Disewa" && (
                                          <div className="flex gap-2 flex-wrap justify-end">
                                            <Button 
                                              size="sm" 
                                              variant={r.partnerConfirmed ? "outline" : "default"}
                                              className={r.partnerConfirmed ? "text-gray-400 border-gray-250 bg-white" : "bg-emerald-600 text-white font-semibold"}
                                              disabled={r.partnerConfirmed}
                                              onClick={() => {
                                                confirmEscrow("rental", r.id, "vendor");
                                                toast.success("Konfirmasi pengembalian alat selesai terkirim. Menunggu Pendaki & Admin.");
                                              }}
                                            >
                                              {r.partnerConfirmed ? "✓ Pengembalian Dikonfirmasi" : "Konfirmasi Pengembalian Selesai"}
                                            </Button>
                                            
                                            <Button 
                                              size="sm" 
                                              variant="outline" 
                                              className="border-red-200 text-red-655 hover:bg-red-50 font-semibold"
                                              onClick={() => handleOpenFineModal(r.id, "rental")}
                                            >
                                              {r.fineAmount ? `Denda: Rp ${r.fineAmount.toLocaleString("id-ID")}` : "Laporkan Kerusakan (Denda)"}
                                            </Button>
                                          </div>
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

                {/* 3. Tab Kolaborasi Guide */}
                {activeTab === "collaborations" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Kolaborasi Paket Pendakian (Guide Ads)</CardTitle>
                      <CardDescription className="text-xs">
                        Lihat iklan paket trip pendakian aktif hasil kolaborasi toko rental Anda dengan pemandu (guide) profesional.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {tripPackages.filter(p => p.vendorId === currentUser.id).length === 0 ? (
                        <div className="text-center py-12 text-gray-400 text-sm">
                          Belum ada kolaborasi paket pendakian aktif dengan Tour Guide saat ini.
                        </div>
                      ) : (
                        tripPackages.filter(p => p.vendorId === currentUser.id).map((p) => (
                          <div key={p.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all">
                            <div className="flex gap-3 items-start">
                              <img src={p.image} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-100" />
                              <div>
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h4 className="font-bold text-gray-800 text-sm">{p.title}</h4>
                                  <Badge className="bg-emerald-50 text-emerald-800 text-[9px] border-emerald-200 border">{p.duration}</Badge>
                                </div>
                                <p className="text-xs text-gray-500">Pemandu: **{p.guideName}** &middot; Gunung: **{p.targetMountain}**</p>
                                <p className="text-xs text-gray-500 mt-0.5">Tenggat Booking: {p.promoDeadline}</p>
                                <p className="text-xs text-emerald-700 font-bold mt-1">Total Paket: Rp {p.price.toLocaleString("id-ID")}</p>
                              </div>
                            </div>
                            <div className="shrink-0 flex flex-col items-end gap-1.5 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0">
                              <Badge className="bg-emerald-600 text-white text-[10px]">Kolaborasi Aktif</Badge>
                              <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto" onClick={() => {
                                setSelectedChatPartnerId(p.guideId);
                                setSelectedChatPartnerName(p.guideName);
                                setActiveTab("chat");
                                toast.info(`Membuka obrolan dengan ${p.guideName}`);
                              }}>
                                Hubungi Guide
                              </Button>
                            </div>
                          </div>
                        ))
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
                        {bookings.map((b) => {
                          const isPaid = ["Telah Dibayar", "Start", "Muncak", "Selesai"].includes(b.status);
                          const bothConfirmed = b.pendakiConfirmed && b.partnerConfirmed;
                          const hasFine = b.fineAmount && b.fineAmount > 0;
                          
                          return (
                            <div key={`trans_b_${b.id}`} className="p-4 border border-gray-150 rounded-xl text-xs space-y-3 bg-white hover:shadow-xs transition-shadow">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                  <p className="font-bold text-gray-800 text-sm">Simaksi/Trip {b.mountainName} &middot; {b.pendakiName}</p>
                                  <p className="text-gray-500">Penerima Payout: {b.guideName || "Pihak Pengelola Gunung (Official)"}</p>
                                  <p className="text-[10px] text-gray-400">ID: {b.id} &middot; Tanggal: {b.bookingDate}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-emerald-600 text-sm">Rp {b.price.toLocaleString("id-ID")}</p>
                                  <div className="mt-1">{getStatusBadge(b.status)}</div>
                                </div>
                              </div>

                              {isPaid && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-gray-100 pt-3 text-[11px]">
                                  {/* Deposit status */}
                                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-155">
                                    <span className="text-gray-400">Deposit Jaminan:</span>
                                    <div className="font-bold text-gray-750 flex items-center gap-1 mt-0.5">
                                      <span>Rp {b.depositAmount?.toLocaleString()}</span>
                                      <span className="text-[9px] text-emerald-600 uppercase font-semibold capitalize font-mono">({b.depositStatus})</span>
                                    </div>
                                  </div>

                                  {/* Consent statuses */}
                                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-155 flex flex-col justify-center">
                                    <span className="text-gray-400">Consent Penyelesaian (Pihak):</span>
                                    <div className="flex gap-2 items-center mt-1 font-bold">
                                      <span className="flex items-center gap-0.5">
                                        👤 Pendaki: {b.pendakiConfirmed ? "✓" : "✗"}
                                      </span>
                                      <span className="flex items-center gap-0.5">
                                        ⛺ Mitra: {b.partnerConfirmed ? "✓" : "✗"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Fine info or Action */}
                                  <div className="flex flex-col justify-center">
                                    {b.status !== "Selesai" && b.status !== "Dibatalkan" ? (
                                      <div className="flex gap-1.5 justify-end">
                                        {hasFine ? (
                                          <>
                                            <Button 
                                              size="xs" 
                                              className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-7"
                                              onClick={() => {
                                                resolveEscrowWithDeposit("booking", b.id, true);
                                                toast.success("Super Admin menyetujui denda. Deposit dipotong & dana dicairkan!");
                                              }}
                                            >
                                              Setujui Denda ({Math.round((b.fineAmount || 0) / 1000)}k)
                                            </Button>
                                            <Button 
                                              size="xs" 
                                              variant="outline" 
                                              className="text-[10px] h-7"
                                              onClick={() => {
                                                resolveEscrowWithDeposit("booking", b.id, false);
                                                toast.success("Super Admin menolak denda. Escrow dicairkan penuh!");
                                              }}
                                            >
                                              Abaikan Denda
                                            </Button>
                                          </>
                                        ) : (
                                          <Button 
                                            size="xs" 
                                            className={`h-7 text-[10px] ${bothConfirmed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 hover:bg-gray-500"} text-white font-semibold`}
                                            onClick={() => {
                                              resolveEscrowWithDeposit("booking", b.id, false);
                                              toast.success("Escrow & Deposit dicairkan penuh ke masing-masing pihak.");
                                            }}
                                          >
                                            {!bothConfirmed && "⚠️ Payout Paksa "}
                                            Cairkan Dana
                                          </Button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-gray-450 text-right italic text-[10px]">Transaksi Selesai & Ditutup</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {hasFine && b.status !== "Selesai" && (
                                <div className="p-2 bg-red-50 border border-red-150 rounded-lg text-[10px] text-red-800 font-semibold flex items-center gap-1.5">
                                  <span>⚠️ Klaim Denda: Rp {b.fineAmount?.toLocaleString()} &middot; Alasan: "{b.fineNotes}"</span>
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {rentalOrders.map((r) => {
                          const isPaid = ["Telah Dibayar", "Siap Diambil", "Sedang Disewa", "Selesai"].includes(r.status);
                          const bothConfirmed = r.pendakiConfirmed && r.partnerConfirmed;
                          const hasFine = r.fineAmount && r.fineAmount > 0;

                          return (
                            <div key={`trans_r_${r.id}`} className="p-4 border border-gray-150 rounded-xl text-xs space-y-3 bg-white hover:shadow-xs transition-shadow">
                              <div className="flex justify-between items-start flex-wrap gap-2">
                                <div>
                                  <p className="font-bold text-gray-800 text-sm">Rental {r.itemName} &middot; {r.pendakiName}</p>
                                  <p className="text-gray-500">Penerima Payout: {r.vendorName}</p>
                                  <p className="text-[10px] text-gray-400">ID: {r.id} &middot; Qty: {r.qty} unit &middot; Tanggal: {r.startDate} s/d {r.endDate}</p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-emerald-600 text-sm">Rp {r.totalPrice.toLocaleString("id-ID")}</p>
                                  <div className="mt-1">{getStatusBadge(r.status)}</div>
                                </div>
                              </div>

                              {isPaid && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 border-t border-gray-100 pt-3 text-[11px]">
                                  {/* Deposit status */}
                                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-155">
                                    <span className="text-gray-400">Deposit Jaminan:</span>
                                    <div className="font-bold text-gray-750 flex items-center gap-1 mt-0.5">
                                      <span>Rp {r.depositAmount?.toLocaleString()}</span>
                                      <span className="text-[9px] text-emerald-600 uppercase font-semibold capitalize font-mono">({r.depositStatus})</span>
                                    </div>
                                  </div>

                                  {/* Consent statuses */}
                                  <div className="bg-gray-50 p-2 rounded-lg border border-gray-155 flex flex-col justify-center">
                                    <span className="text-gray-400">Consent Penyelesaian (Pihak):</span>
                                    <div className="flex gap-2 items-center mt-1 font-bold">
                                      <span className="flex items-center gap-0.5">
                                        👤 Pendaki: {r.pendakiConfirmed ? "✓" : "✗"}
                                      </span>
                                      <span className="flex items-center gap-0.5">
                                        ⛺ Mitra: {r.partnerConfirmed ? "✓" : "✗"}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Fine info or Action */}
                                  <div className="flex flex-col justify-center">
                                    {r.status !== "Selesai" && r.status !== "Dibatalkan" ? (
                                      <div className="flex gap-1.5 justify-end">
                                        {hasFine ? (
                                          <>
                                            <Button 
                                              size="xs" 
                                              className="bg-red-600 hover:bg-red-700 text-white text-[10px] h-7"
                                              onClick={() => {
                                                resolveEscrowWithDeposit("rental", r.id, true);
                                                toast.success("Super Admin menyetujui denda kerusakan. Deposit dipotong & dana sewa + denda cair ke Vendor!");
                                              }}
                                            >
                                              Setujui Denda ({Math.round((r.fineAmount || 0) / 1000)}k)
                                            </Button>
                                            <Button 
                                              size="xs" 
                                              variant="outline" 
                                              className="text-[10px] h-7"
                                              onClick={() => {
                                                resolveEscrowWithDeposit("rental", r.id, false);
                                                toast.success("Super Admin menolak denda. Escrow dicairkan penuh!");
                                              }}
                                            >
                                              Abaikan Denda
                                            </Button>
                                          </>
                                        ) : (
                                          <Button 
                                            size="xs" 
                                            className={`h-7 text-[10px] ${bothConfirmed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 hover:bg-gray-500"} text-white font-semibold`}
                                            onClick={() => {
                                              resolveEscrowWithDeposit("rental", r.id, false);
                                              toast.success("Escrow & Deposit dicairkan penuh ke masing-masing pihak.");
                                            }}
                                          >
                                            {!bothConfirmed && "⚠️ Payout Paksa "}
                                            Cairkan Dana
                                          </Button>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-gray-450 text-right italic text-[10px]">Transaksi Selesai & Ditutup</span>
                                    )}
                                  </div>
                                </div>
                              )}

                              {hasFine && r.status !== "Selesai" && (
                                <div className="p-2 bg-red-50 border border-red-150 rounded-lg text-[10px] text-red-800 font-semibold flex items-center gap-1.5">
                                  <span>⚠️ Klaim Denda Kerusakan: Rp {r.fineAmount?.toLocaleString()} &middot; Alasan: "{r.fineNotes}"</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
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

                {/* 5. Tab Pengelolaan Kontak Tiket Gunung */}
                {activeTab === "manage_mountains" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Pengelolaan Kontak Tiket Resmi Gunung</CardTitle>
                      <CardDescription className="text-xs">
                        Atur harga tiket masuk (Simaksi) dan link booking/sosial media pengelola resmi untuk masing-masing gunung.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="overflow-x-auto">
                        <table className="w-full text-xs text-left text-gray-500">
                          <thead className="text-[10px] text-gray-400 uppercase bg-gray-50/50">
                            <tr>
                              <th scope="col" className="px-4 py-3">Gunung</th>
                              <th scope="col" className="px-4 py-3">Status</th>
                              <th scope="col" className="px-4 py-3">Harga Tiket</th>
                              <th scope="col" className="px-4 py-3">Metode Kontak</th>
                              <th scope="col" className="px-4 py-3">Nilai Kontak</th>
                              <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {mountains.map((m) => (
                              <tr key={m.name} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-4 py-3 font-bold text-gray-800">{m.name}</td>
                                <td className="px-4 py-3">
                                  <Badge className={m.status === "Buka" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}>
                                    {m.status}
                                  </Badge>
                                </td>
                                <td className="px-4 py-3 font-semibold text-gray-700">Rp {m.ticketPrice.toLocaleString("id-ID")}</td>
                                <td className="px-4 py-3">{m.adminContactMethod}</td>
                                <td className="px-4 py-3 font-mono text-gray-600 max-w-[150px] truncate">{m.adminContactValue}</td>
                                <td className="px-4 py-3 text-right">
                                  <Button size="xs" variant="outline" className="text-emerald-700 border-emerald-200 hover:bg-emerald-50 h-7" onClick={() => handleOpenMountainEdit(m)}>
                                    <Edit2 className="size-3 mr-1" /> Edit
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
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

      {/* 6. Super Admin Mountain Edit Modal */}
      {editingMountain && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setEditingMountain(null)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <MountainIcon className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Edit Kontak Tiket Resmi</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Sesuaikan info tiket resmi untuk **{editingMountain.name}**. Perubahan ini akan langsung diperbarui pada halaman informasi gunung bagi Pendaki.
            </p>
            <form onSubmit={handleSaveMountain} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Status Gunung</label>
                <select
                  className="w-full px-3 py-2 text-xs border border-gray-200 bg-gray-50 rounded-lg focus:outline-emerald-500 h-9"
                  value={mountainForm.status}
                  onChange={(e) => setMountainForm({ ...mountainForm, status: e.target.value as "Buka" | "Tutup" })}
                >
                  <option value="Buka">Buka (Terbuka untuk Booking)</option>
                  <option value="Tutup">Tutup (Ditutup Sementara)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Harga Tiket Masuk (Rp)</label>
                <Input
                  type="number"
                  className="text-xs bg-gray-50"
                  value={mountainForm.ticketPrice}
                  onChange={(e) => setMountainForm({ ...mountainForm, ticketPrice: e.target.value })}
                  placeholder="Contoh: 35000"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Metode Kontak Tiket</label>
                <select
                  className="w-full px-3 py-2 text-xs border border-gray-200 bg-gray-50 rounded-lg focus:outline-emerald-500 h-9"
                  value={mountainForm.adminContactMethod}
                  onChange={(e) => setMountainForm({ ...mountainForm, adminContactMethod: e.target.value as any })}
                >
                  <option value="Instagram">Instagram (DM)</option>
                  <option value="Website Resmi">Website Resmi (Tautan)</option>
                  <option value="WhatsApp">WhatsApp (Chat)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nilai Kontak / Tautan</label>
                <Input
                  className="text-xs bg-gray-50"
                  value={mountainForm.adminContactValue}
                  onChange={(e) => setMountainForm({ ...mountainForm, adminContactValue: e.target.value })}
                  placeholder="Contoh: @semeru_official atau https://bookingsemeru.id"
                />
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setEditingMountain(null)}>Batal</Button>
                <Button type="submit" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Simpan Perubahan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. Vendor Fine / Penalty Submission Modal */}
      {fineModalOpen && fineTargetId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setFineModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-red-800 font-bold mb-3">
              <AlertTriangle className="size-6 text-red-655 shrink-0" />
              <h3 className="text-lg">Laporkan Kerusakan & Klaim Deposit</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-normal">
              Laporkan kerusakan atau unit hilang untuk pesanan sewa **{fineTargetId}**. Klaim ini akan diverifikasi oleh Super Admin dan otomatis dipotong dari dana deposit Pendaki.
            </p>
            <form onSubmit={handleSaveFine} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nominal Denda Kerusakan (Rp)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-red-600 font-bold" />
                  <Input
                    type="number"
                    className="pl-9 text-xs font-bold text-red-700 bg-gray-50"
                    value={fineAmountInput}
                    onChange={(e) => setFineAmountInput(e.target.value)}
                    placeholder="Contoh: 75000"
                    min={1}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Alasan Denda / Pelanggaran</label>
                <textarea
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-red-500 h-20 resize-none"
                  placeholder="Contoh: Tenda robek di bagian cover layer luar karena bara api."
                  value={fineNotesInput}
                  onChange={(e) => setFineNotesInput(e.target.value)}
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setFineModalOpen(false)}>Batal</Button>
                <Button type="submit" className="flex-1 text-xs bg-red-600 hover:bg-red-750 text-white font-semibold">Kirim Klaim Denda</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Top Up Deposit Modal */}
      {topUpModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setTopUpModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <Wallet className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Top Up Saldo Deposit</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-normal">
              Top up saldo deposit jaminan Anda. Saldo ini akan digunakan untuk menjamin pesanan booking/sewa Anda.
            </p>
            <form onSubmit={handleTopUpSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nominal Top Up (Rp)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 font-bold" />
                  <Input
                    type="number"
                    className="pl-9 text-xs font-bold text-emerald-700 bg-gray-50 rounded-xl"
                    value={depositAmountInput}
                    onChange={(e) => setDepositAmountInput(e.target.value)}
                    placeholder="Contoh: 100000"
                    min={10000}
                    step={10000}
                  />
                </div>
              </div>
              <div className="flex gap-2.5 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-xs rounded-xl" onClick={() => setTopUpModalOpen(false)}>Batal</Button>
                <Button type="submit" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">Konfirmasi Top Up</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 9. Withdraw Deposit Modal */}
      {withdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button onClick={() => setWithdrawModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <Wallet className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Tarik Dana Deposit</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-normal">
              Tarik dana deposit jaminan Anda kembali ke rekening/e-wallet Anda. Maksimal penarikan: <b>Rp {climberDeposit.toLocaleString("id-ID")}</b>.
            </p>
            <form onSubmit={handleWithdrawSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nominal Penarikan (Rp)</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-emerald-600 font-bold" />
                  <Input
                    type="number"
                    className="pl-9 text-xs font-bold text-emerald-700 bg-gray-50 rounded-xl"
                    value={depositAmountInput}
                    onChange={(e) => setDepositAmountInput(e.target.value)}
                    placeholder="Contoh: 50000"
                    min={10000}
                    max={climberDeposit}
                    step={10000}
                  />
                </div>
              </div>
              <div className="flex gap-2.5 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-xs rounded-xl" onClick={() => setWithdrawModalOpen(false)}>Batal</Button>
                <Button type="submit" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl">Konfirmasi Penarikan</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

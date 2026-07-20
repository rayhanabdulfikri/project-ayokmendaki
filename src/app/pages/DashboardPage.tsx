import { useState, useEffect, useMemo } from "react";
import { useApp, Booking, RentalOrder, Negotiation, UserRole, EquipmentItem, User, Mountain } from "../context/AppContext";
import { supabase } from "../../supabase";
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
  Shield,
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
  Wallet,
  User as UserIcon,
  Loader2,
  Mail
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

const getFileNameFromUrl = (url: string, defaultName: string) => {
  if (!url) return "";
  try {
    const decoded = decodeURIComponent(url);
    const parts = decoded.split('/');
    const lastPart = parts[parts.length - 1];
    const questionIndex = lastPart.indexOf('?');
    const cleanLastPart = questionIndex !== -1 ? lastPart.substring(0, questionIndex) : lastPart;
    const underscoreIndex = cleanLastPart.indexOf('_');
    if (underscoreIndex !== -1) {
      const remaining = cleanLastPart.substring(underscoreIndex + 1);
      const nextUnderscore = remaining.indexOf('_');
      if (nextUnderscore !== -1) {
        return remaining.substring(nextUnderscore + 1);
      }
      return remaining;
    }
    return cleanLastPart;
  } catch (e) {
    return defaultName;
  }
};

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
    revokeVerification,
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
    topUpWallet,
    withdrawWallet,
    userWarnings,
    addWarning,
    removeWarning,
    guideWallet,
    vendorWallet,
    collaborationProposals,
    addCollaborationProposal,
    respondToCollaborationProposal,
    users,
    updateUserStatus,
    toggleUserVerification,
    userActivities,
    logUserActivity,
    adminMessages,
    sendAdminMessage,
    deleteAdminMessage,
    markAdminMessageAsRead
  } = useApp();

  const location = useLocation();
  const navigate = useNavigate();

  // Profile Completion Form States
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    phone: "",
    password: "",
    confirmPassword: "",
    ktpNumber: "",
    ktpPhotoName: "ktp_identitas.jpg",
    ktpPhotoUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&q=80",
    selfiePhotoName: "selfie_wajah.jpg",
    selfiePhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    bank_name: "",
    bank_account: "",
    bank_holder: "",
    // Guide specific
    specialty: "",
    experience: "",
    price: "450000",
    certifications: [] as string[],
    docName: "Sertifikat APIGI",
    docImage: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    biodata: "",
    ketentuan: "",
    // Vendor specific
    storeName: "",
    nib: "",
    address: "",
    // Common partner coupons
    couponCode: "",
    couponDiscount: "0",
    couponDeadline: ""
  });
  const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});

  // Additional States for KYC Uploads, Bank Details, and Manual User
  const [isUploadingKtp, setIsUploadingKtp] = useState(false);
  const [isUploadingSelfie, setIsUploadingSelfie] = useState(false);
  const [isUploadingDoc, setIsUploadingDoc] = useState(false);
  const [isUploadingCatalog, setIsUploadingCatalog] = useState(false);
  const [ktpUploadError, setKtpUploadError] = useState(false);
  const [selfieUploadError, setSelfieUploadError] = useState(false);
  const [docUploadError, setDocUploadError] = useState(false);
  const [isProcessingWd, setIsProcessingWd] = useState(false);

  const [isEditingBank, setIsEditingBank] = useState(false);
  const [bankForm, setBankForm] = useState({
    bank_name: "",
    bank_account: "",
    bank_holder: ""
  });

  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [selectedUserForWarning, setSelectedUserForWarning] = useState<any>(null);
  const [selectedAdminMessageForView, setSelectedAdminMessageForView] = useState<any>(null);
  const [blastTargetType, setBlastTargetType] = useState<"all" | "individual">("all");
  const [selectedInboxUserForBroadcast, setSelectedInboxUserForBroadcast] = useState<any>(null);
  const [broadcastUserSearchQuery, setBroadcastUserSearchQuery] = useState("");
  const [isBroadcastSearchDropdownOpen, setIsBroadcastSearchDropdownOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState("");
  const [broadcastContent, setBroadcastContent] = useState("");
  const [isSearchDropdownOpen, setIsSearchDropdownOpen] = useState(false);
  const [searchIdentitas, setSearchIdentitas] = useState("");
  const [searchKhusus, setSearchKhusus] = useState("");

  const [manualUserModalOpen, setManualUserModalOpen] = useState(false);
  const [manualUserForm, setManualUserForm] = useState({
    name: "",
    email: "",
    phone: "",
    role: "pendaki" as UserRole,
    verified: false,
    password: ""
  });

  // Prefill the form when user details are fetched
  useEffect(() => {
    if (currentUser) {
      const guideObj = guides.find(g => g.id === currentUser.id);
      const vendorObj = vendors.find(v => v.id === currentUser.id);
      
      setProfileForm(prev => ({
        ...prev,
        name: currentUser.role !== "vendor" ? currentUser.name : "",
        phone: currentUser.phone || "",
        ktpNumber: currentUser.ktp_number || "",
        ktpPhotoName: currentUser.ktp_image ? getFileNameFromUrl(currentUser.ktp_image, "ktp_identitas.jpg") : "",
        ktpPhotoUrl: currentUser.ktp_image || "",
        selfiePhotoName: currentUser.selfie_image ? getFileNameFromUrl(currentUser.selfie_image, "selfie_wajah.jpg") : "",
        selfiePhotoUrl: currentUser.selfie_image || "",
        bank_name: currentUser.bank_name || "",
        bank_account: currentUser.bank_account || "",
        bank_holder: currentUser.bank_holder || "",
        // Guide spec
        specialty: guideObj?.specialty || "",
        experience: guideObj?.experience ? guideObj.experience.replace(" Tahun", "") : "",
        price: guideObj?.price ? guideObj.price.toString() : "450000",
        certifications: guideObj?.certifications || [],
        biodata: guideObj?.biodata || "",
        ketentuan: guideObj?.ketentuan || "",
        couponCode: guideObj?.couponCode || vendorObj?.couponCode || "",
        couponDiscount: guideObj?.couponDiscount ? guideObj.couponDiscount.toString() : vendorObj?.couponDiscount ? vendorObj.couponDiscount.toString() : "0",
        couponDeadline: guideObj?.couponDeadline || vendorObj?.couponDeadline || "",
        // Vendor spec
        storeName: currentUser.role === "vendor" ? currentUser.name : "",
        nib: "",
        address: vendorObj?.location || ""
      }));

      setBankForm({
        bank_name: currentUser.bank_name || "",
        bank_account: currentUser.bank_account || "",
        bank_holder: currentUser.bank_holder || ""
      });
    }
  }, [currentUser, guides, vendors]);

  const handleProfileCheckboxChange = (cert: string, checked: boolean) => {
    const current = [...profileForm.certifications];
    if (checked) {
      current.push(cert);
    } else {
      const idx = current.indexOf(cert);
      if (idx > -1) current.splice(idx, 1);
    }
    setProfileForm(prev => ({ ...prev, certifications: current }));
  };

  const isProfileIncomplete = useMemo(() => {
    // Diubah agar pengguna tidak langsung dipaksa mengisi data setelah daftar,
    // melainkan dapat mengisinya nanti di menu profil saya.
    return false;
  }, []);

  // File Upload Handlers (Google Drive API via Supabase Edge Function)
  const handleFileUpload = async (file: File, type: "ktp" | "selfie" | "doc" | "catalog") => {
    if (!currentUser) return;
    if (type === "ktp") {
      setIsUploadingKtp(true);
      setKtpUploadError(false);
    } else if (type === "selfie") {
      setIsUploadingSelfie(true);
      setSelfieUploadError(false);
    } else if (type === "doc") {
      setIsUploadingDoc(true);
      setDocUploadError(false);
    } else if (type === "catalog") {
      setIsUploadingCatalog(true);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", currentUser.id);
      formData.append("type", type);

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${supabaseUrl}/functions/v1/upload-to-drive`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errText = await response.text();
        let parsedErr;
        try {
          parsedErr = JSON.parse(errText);
        } catch {
          // ignore
        }
        throw new Error(parsedErr?.error || errText || `HTTP error ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.success) {
        throw new Error(data?.error || "Gagal mengunggah berkas ke Google Drive");
      }

      const publicUrl = data.url;

      if (type === "catalog") {
        setCatalogForm((prev) => ({ ...prev, image: publicUrl }));
      } else {
        setProfileForm((prev) => {
          if (type === "ktp") {
            return { ...prev, ktpPhotoName: file.name, ktpPhotoUrl: publicUrl };
          } else if (type === "selfie") {
            return { ...prev, selfiePhotoName: file.name, selfiePhotoUrl: publicUrl };
          } else {
            return { ...prev, docName: file.name, docImage: publicUrl };
          }
        });
      }
      toast.success(`Berhasil mengunggah berkas ${type.toUpperCase()} ke Google Drive`);
    } catch (err: any) {
      console.error("Upload error:", err);
      toast.error(`Gagal mengunggah berkas: ${err.message}`);
      if (type === "ktp") setKtpUploadError(true);
      else if (type === "selfie") setSelfieUploadError(true);
      else if (type === "doc") setDocUploadError(true);
    } finally {
      if (type === "ktp") setIsUploadingKtp(false);
      else if (type === "selfie") setIsUploadingSelfie(false);
      else if (type === "doc") setIsUploadingDoc(false);
      else if (type === "catalog") setIsUploadingCatalog(false);
    }
  };

  const handleSaveBank = async () => {
    if (!currentUser) return;
    if (!bankForm.bank_name.trim() || !bankForm.bank_account.trim() || !bankForm.bank_holder.trim()) {
      toast.error("Semua kolom informasi rekening bank wajib diisi.");
      return;
    }

    try {
      const { error } = await supabase
        .from("users")
        .update({
          bank_name: bankForm.bank_name,
          bank_account: bankForm.bank_account,
          bank_holder: bankForm.bank_holder
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      setCurrentUser({
        ...currentUser,
        bank_name: bankForm.bank_name,
        bank_account: bankForm.bank_account,
        bank_holder: bankForm.bank_holder
      });

      setIsEditingBank(false);
      toast.success("Berhasil memperbarui rekening bank!");
    } catch (err: any) {
      console.error("Error saving bank details:", err);
      toast.error("Gagal menyimpan rekening: " + err.message);
    }
  };

  const handleDeleteBank = async () => {
    if (!currentUser) return;
    try {
      const { error } = await supabase
        .from("users")
        .update({
          bank_name: null,
          bank_account: null,
          bank_holder: null
        })
        .eq("id", currentUser.id);

      if (error) throw error;

      setCurrentUser({
        ...currentUser,
        bank_name: undefined,
        bank_account: undefined,
        bank_holder: undefined
      });

      setBankForm({ bank_name: "", bank_account: "", bank_holder: "" });
      toast.success("Berhasil menghapus rekening bank!");
    } catch (err: any) {
      console.error("Error deleting bank details:", err);
      toast.error("Gagal menghapus rekening: " + err.message);
    }
  };

  const handleCreateManualUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUserForm.name.trim() || !manualUserForm.email.trim() || !manualUserForm.phone.trim()) {
      toast.error("Semua kolom wajib diisi.");
      return;
    }

    try {
      await addManualUser(manualUserForm);
      setManualUserModalOpen(false);
      setManualUserForm({ name: "", email: "", phone: "", role: "pendaki", verified: false, password: "" });
      toast.success("Berhasil menambahkan pengguna baru secara manual!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Error manual user creation:", err);
      toast.error("Gagal menambahkan pengguna: " + err.message);
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    // Validation
    const errs: Record<string, string> = {};
    if (currentUser.role !== "vendor" && !profileForm.name.trim()) {
      errs.name = "Nama lengkap wajib diisi.";
    }
    if (!profileForm.phone.trim()) errs.phone = "Nomor telepon wajib diisi.";
    else if (!/^(\+62|0)[0-9]{8,12}$/.test(profileForm.phone.replace(/\s/g, "")))
      errs.phone = "Nomor telepon tidak valid.";

    if (currentUser.role === "guide" || currentUser.role === "vendor") {
      if (!profileForm.ktpNumber.trim()) {
        errs.ktpNumber = "Nomor NIK KTP wajib diisi.";
      } else if (!/^[0-9]{16}$/.test(profileForm.ktpNumber.trim())) {
        errs.ktpNumber = "Nomor NIK KTP harus 16 digit.";
      }
    } else {
      if (profileForm.ktpNumber.trim() && !/^[0-9]{16}$/.test(profileForm.ktpNumber.trim())) {
        errs.ktpNumber = "Nomor NIK KTP harus 16 digit.";
      }
    }

    if (profileForm.password) {
      if (profileForm.password.length < 8) {
        errs.password = "Kata sandi minimal 8 karakter.";
      }
      if (profileForm.password !== profileForm.confirmPassword) {
        errs.confirmPassword = "Konfirmasi kata sandi tidak cocok.";
      }
    }

    if (currentUser.role === "guide") {
      if (!profileForm.specialty.trim()) errs.specialty = "Spesialisasi gunung wajib diisi.";
      if (!profileForm.experience.trim()) errs.experience = "Pengalaman wajib diisi.";
      if (!profileForm.price.trim()) errs.price = "Tarif harian wajib diisi.";
      if (profileForm.certifications.length === 0) errs.certifications = "Pilih minimal satu sertifikasi.";
    }

    if (currentUser.role === "vendor") {
      if (!profileForm.storeName.trim()) errs.storeName = "Nama toko wajib diisi.";
      if (!profileForm.address.trim()) errs.address = "Alamat toko wajib diisi.";
    }

    if (Object.keys(errs).length > 0) {
      setProfileErrors(errs);
      toast.error("Silakan lengkapi seluruh kolom yang wajib diisi.");
      return;
    }

    const confirmSave = window.confirm("Apakah Anda yakin ingin menyimpan perubahan profil dan data verifikasi Anda?");
    if (!confirmSave) return;

    setProfileLoading(true);

    try {
      // 1. Update password if provided in Supabase Auth
      if (profileForm.password) {
        const { error: pwdErr } = await supabase.auth.updateUser({ password: profileForm.password });
        if (pwdErr) throw pwdErr;
      }

      // Determine if KYC changed
      const isKycChanged = profileForm.ktpNumber !== (currentUser.ktp_number || "") ||
                           profileForm.ktpPhotoUrl !== (currentUser.ktp_image || "") ||
                           profileForm.selfiePhotoUrl !== (currentUser.selfie_image || "");

      // 2. Update users table
      const updatedName = currentUser.role === "vendor" ? profileForm.storeName : profileForm.name;
      const nextVerified = isKycChanged ? false : (currentUser.verified || false);

      const { error: userErr } = await supabase
        .from("users")
        .update({
          phone: profileForm.phone,
          ktp_number: profileForm.ktpNumber,
          ktp_image: profileForm.ktpPhotoUrl,
          selfie_image: profileForm.selfiePhotoUrl,
          avatar: profileForm.selfiePhotoUrl || currentUser.avatar, // Gunakan foto selfie sebagai avatar
          verified: nextVerified,
          name: updatedName,
          bank_name: profileForm.bank_name || null,
          bank_account: profileForm.bank_account || null,
          bank_holder: profileForm.bank_holder || null
        })
        .eq("id", currentUser.id);

      if (userErr) throw userErr;

      // 3. Upsert role profile
      if (currentUser.role === "guide") {
        const { error: guideErr } = await supabase.from("guides").upsert({
          id: currentUser.id,
          specialty: profileForm.specialty,
          location: "Kota Malang, Jawa Timur",
          experience: profileForm.experience + " Tahun",
          price: parseInt(profileForm.price) || 450000,
          certifications: profileForm.certifications,
          status: nextVerified ? "Aktif" : "Non-Aktif",
          specialty_mountains: [profileForm.specialty],
          biodata: profileForm.biodata,
          ketentuan: profileForm.ketentuan,
          coupon_code: profileForm.couponCode || null,
          coupon_discount: parseInt(profileForm.couponDiscount) || 0,
          coupon_deadline: profileForm.couponDeadline || null
        });
        if (guideErr) throw guideErr;

        if (isKycChanged) {
          await addVerificationRequest({
            userId: currentUser.id,
            userName: updatedName,
            role: "guide",
            documentName: `Sertifikasi ${profileForm.certifications.join(" & ")}`,
            documentImage: profileForm.docImage,
            ktpNumber: profileForm.ktpNumber,
            ktpPhoto: profileForm.ktpPhotoUrl,
            selfiePhoto: profileForm.selfiePhotoUrl
          });
        }

      } else if (currentUser.role === "vendor") {
        const { error: vendorErr } = await supabase.from("vendors").upsert({
          id: currentUser.id,
          location: profileForm.address,
          coupon_code: profileForm.couponCode || null,
          coupon_discount: parseInt(profileForm.couponDiscount) || 0,
          coupon_deadline: profileForm.couponDeadline || null
        });
        if (vendorErr) throw vendorErr;

        if (isKycChanged) {
          await addVerificationRequest({
            userId: currentUser.id,
            userName: profileForm.storeName,
            role: "vendor",
            documentName: `NIB / Izin Usaha UKM: ${profileForm.nib || 'N/A'}`,
            documentImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
            ktpNumber: profileForm.ktpNumber,
            ktpPhoto: profileForm.ktpPhotoUrl,
            selfiePhoto: profileForm.selfiePhotoUrl
          });
        }

      } else if (currentUser.role === "pendaki") {
        if (isKycChanged) {
          await addVerificationRequest({
            userId: currentUser.id,
            userName: currentUser.name,
            role: "pendaki",
            documentName: `KYC Pendaki: KTP ${profileForm.ktpNumber}`,
            documentImage: profileForm.ktpPhotoUrl,
            ktpNumber: profileForm.ktpNumber,
            ktpPhoto: profileForm.ktpPhotoUrl,
            selfiePhoto: profileForm.selfiePhotoUrl
          });
        }
      }

      // 4. Update local user context
      setCurrentUser({
        ...currentUser,
        phone: profileForm.phone,
        ktp_number: profileForm.ktpNumber,
        ktp_image: profileForm.ktpPhotoUrl,
        selfie_image: profileForm.selfiePhotoUrl,
        avatar: profileForm.selfiePhotoUrl || currentUser.avatar, // Gunakan foto selfie sebagai avatar
        verified: nextVerified,
        name: updatedName,
        bank_name: profileForm.bank_name || undefined,
        bank_account: profileForm.bank_account || undefined,
        bank_holder: profileForm.bank_holder || undefined
      });

      toast.success("Profil berhasil diperbarui!");
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error("Error saving profile details:", err);
      toast.error("Gagal menyimpan profil: " + err.message);
    } finally {
      setProfileLoading(false);
    }
  };

  // Navigation tabs in dashboard
  const [activeTab, setActiveTab] = useState("bookings");
  const [reportsSubTab, setReportsSubTab] = useState("analytics");

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

  // Payment Gateway Simulated States
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentGatewayAmount, setPaymentGatewayAmount] = useState(0);
  const [paymentGatewayRole, setPaymentGatewayRole] = useState<"pendaki" | "guide" | "vendor">("pendaki");
  const [paymentGatewayMethod, setPaymentGatewayMethod] = useState<"va" | "qris" | "cc">("qris");
  const [paymentGatewayBank, setPaymentGatewayBank] = useState<"bca" | "mandiri" | "bni" | "bri">("bca");

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
    damageTerms: "",
    image: ""
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
  const [prefilledWarningUserId, setPrefilledWarningUserId] = useState("");
  useEffect(() => {
    if (prefilledWarningUserId) {
      const u = users.find(x => x.id === prefilledWarningUserId);
      if (u) {
        setSelectedUserForWarning(u);
        setUserSearchQuery(u.name);
      }
    }
  }, [prefilledWarningUserId, users]);
  const [receiptModalOpen, setReceiptModalOpen] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);

  const [vendorCollabSubTab, setVendorCollabSubTab] = useState("guides");
  const [collabModalOpen, setCollabModalOpen] = useState(false);
  const [selectedCollabPartner, setSelectedCollabPartner] = useState<any>(null);
  const [collabForm, setCollabForm] = useState({
    title: "",
    targetMountain: "",
    duration: "3 Hari 2 Malam",
    price: "1200000",
    description: "",
    rentalMechanism: "",
    bundledEquipmentIds: [] as string[]
  });

  const handleOpenCollabForm = (partner: any) => {
    setSelectedCollabPartner(partner);
    setCollabForm({
      title: "",
      targetMountain: mountains.length > 0 ? mountains[0].name : "",
      duration: "3 Hari 2 Malam",
      price: "1200000",
      description: `Paket trip promo spesial kolaborasi bersama ${partner.name}. Sudah termasuk sewa peralatan kemping lengkap & jasa pemandu profesional.`,
      rentalMechanism: "Alat diambil langsung oleh Guide di toko H-1 sebelum keberangkatan, denda kerusakan ditanggung bersama.",
      bundledEquipmentIds: []
    });
    setCollabModalOpen(true);
  };

  const handleSaveCollabProposal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedCollabPartner) return;

    const priceNum = parseInt(collabForm.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toast.error("Silakan masukkan harga yang valid.");
      return;
    }

    addCollaborationProposal({
      title: collabForm.title || `Paket Spesial ${currentUser.name} & ${selectedCollabPartner.name}`,
      guideId: currentUser.role === "guide" ? currentUser.id : selectedCollabPartner.id,
      guideName: currentUser.role === "guide" ? currentUser.name : selectedCollabPartner.name,
      vendorId: currentUser.role === "vendor" ? currentUser.id : selectedCollabPartner.id,
      vendorName: currentUser.role === "vendor" ? currentUser.name : selectedCollabPartner.name,
      description: collabForm.description,
      duration: collabForm.duration,
      price: priceNum,
      targetMountain: collabForm.targetMountain,
      rentalMechanism: collabForm.rentalMechanism,
      bundledEquipmentIds: collabForm.bundledEquipmentIds,
      senderId: currentUser.id
    });

    setCollabModalOpen(false);
    toast.success("Proposal kerjasama kolaborasi berhasil diajukan ke partner!");
  };

  const renderProposalsCenter = () => {
    if (!currentUser) return null;
    const relevantProposals = collaborationProposals.filter(
      (p) => p.guideId === currentUser.id || p.vendorId === currentUser.id
    );

    if (relevantProposals.length === 0) return null;

    return (
      <Card className="border border-amber-200 bg-amber-50/10 shadow-sm mb-6">
        <CardHeader className="py-4 border-b border-amber-100 flex flex-row items-center gap-2">
          <Award className="size-5 text-amber-605 shrink-0 animate-bounce" />
          <div>
            <CardTitle className="text-sm font-extrabold text-amber-900">Pusat Proposal & Negosiasi Kerjasama Partner</CardTitle>
            <CardDescription className="text-xs text-amber-700">Setujui penawaran kerjasama bundling sewa alat & jasa trip.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-4 space-y-4">
          {relevantProposals.map((p) => {
            const isSender = p.senderId === currentUser.id;
            const partnerName = currentUser.role === "guide" ? p.vendorName : p.guideName;
            return (
              <div key={p.id} className="p-4 rounded-xl border border-gray-150 bg-white shadow-xs flex flex-col gap-3">
                <div className="flex justify-between items-start flex-wrap gap-2">
                  <div>
                    <h4 className="font-extrabold text-gray-800 text-sm">Proposal: {p.title}</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Gunung: <b>{p.targetMountain}</b> &middot; Durasi: <b>{p.duration}</b></p>
                    <p className="text-xs text-gray-500 mt-1 font-semibold">
                      {isSender ? `Mengajukan ke Partner: ${partnerName}` : `Diajukan oleh Partner: ${partnerName}`}
                    </p>
                  </div>
                  <Badge className={`text-[10px] font-bold ${
                    p.status === "pending"
                      ? "bg-blue-50 text-blue-700 border border-blue-200 animate-pulse"
                      : p.status === "accepted"
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                  }`}>
                    {p.status.toUpperCase()}
                  </Badge>
                </div>

                <div className="p-3 bg-gray-55/40 rounded-lg text-xs space-y-2 text-gray-750 font-medium">
                  <p><b>Deskripsi Rencana Trip:</b> {p.description}</p>
                  <p><b>Mekanisme Logistik & Sewa Alat:</b> <span className="font-semibold text-emerald-800">{p.rentalMechanism}</span></p>
                  <p className="font-bold text-gray-800">Harga Kesepakatan Paket: Rp {p.price.toLocaleString("id-ID")}</p>
                </div>

                {p.status === "pending" && !isSender && (
                  <div className="flex gap-2 justify-end pt-1">
                    <Button
                      size="xs"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 h-8"
                      onClick={() => {
                        respondToCollaborationProposal(p.id, "accepted");
                        toast.success("Kerjasama disetujui! Paket promo bundling otomatis diterbitkan.");
                      }}
                    >
                      Terima Kerjasama
                    </Button>
                    <Button
                      size="xs"
                      variant="outline"
                      className="text-xs border-red-200 text-red-600 hover:bg-red-55 h-8 font-semibold"
                      onClick={() => {
                        respondToCollaborationProposal(p.id, "rejected");
                        toast.warning("Proposal kerjasama ditolak.");
                      }}
                    >
                      Tolak
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  };

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
        if (m.chatPartnerId !== currentUser.id) {
          partnersMap.set(m.chatPartnerId, m.chatPartnerName);
        }
      } else if (m.chatPartnerId === currentUser.id) {
        if (m.senderId !== currentUser.id) {
          partnersMap.set(m.senderId, m.senderName);
        }
      }
    });
    return Array.from(partnersMap.entries()).map(([id, name]) => ({ id, name }));
  }, [chatMessages, currentUser]);

  const ledgerEntries = useMemo(() => {
    const entries: Array<{
      id: string;
      date: string;
      description: string;
      details: Array<{ account: string; type: "debit" | "credit"; amount: number }>;
    }> = [];

    // Platform expenses
    entries.push({
      id: "exp_server",
      date: "2026-06-01 00:00",
      description: "Beban Sewa Cloud Server Bulanan",
      details: [
        { account: "Beban Server", type: "debit", amount: 50000 },
        { account: "Kas & Bank Platform", type: "credit", amount: 50000 }
      ]
    });

    entries.push({
      id: "exp_admin",
      date: "2026-06-01 00:00",
      description: "Beban Operasional & Administrasi Platform",
      details: [
        { account: "Beban Operasional & Admin", type: "debit", amount: 30000 },
        { account: "Kas & Bank Platform", type: "credit", amount: 30000 }
      ]
    });

    // 1. Process depositTransactions (topups, withdraws, etc.)
    depositTransactions.forEach((tx) => {
      if (tx.type === "topup") {
        entries.push({
          id: tx.id,
          date: tx.createdAt,
          description: tx.description,
          details: [
            { account: "Kas & Bank Platform", type: "debit", amount: tx.amount },
            { account: "Utang Deposit Pendaki", type: "credit", amount: tx.amount }
          ]
        });
      } else if (tx.type === "withdraw") {
        entries.push({
          id: tx.id,
          date: tx.createdAt,
          description: tx.description,
          details: [
            { account: "Utang Deposit Pendaki", type: "debit", amount: tx.amount },
            { account: "Kas & Bank Platform", type: "credit", amount: tx.amount }
          ]
        });
      } else if (tx.type === "refund" || tx.type === "fine_deduction") {
        if (tx.description.includes("Penarikan Dana Dompet")) {
          const accountName = tx.description.includes("GUIDE") ? "Utang Dompet Guide" : "Utang Dompet Vendor";
          entries.push({
            id: tx.id,
            date: tx.createdAt,
            description: tx.description,
            details: [
              { account: accountName, type: "debit", amount: tx.amount },
              { account: "Kas & Bank Platform", type: "credit", amount: tx.amount }
            ]
          });
        } else if (tx.description.includes("Top Up Saldo Dompet")) {
          const accountName = tx.description.includes("GUIDE") ? "Utang Dompet Guide" : "Utang Dompet Vendor";
          entries.push({
            id: tx.id,
            date: tx.createdAt,
            description: tx.description,
            details: [
              { account: "Kas & Bank Platform", type: "debit", amount: tx.amount },
              { account: accountName, type: "credit", amount: tx.amount }
            ]
          });
        }
      }
    });

    // 2. Bookings (trip bookings)
    bookings.forEach((b) => {
      const isPaid = !["Menunggu Pembayaran", "Menunggu Konfirmasi"].includes(b.status);
      if (isPaid) {
        entries.push({
          id: `book_escrow_${b.id}`,
          date: b.bookingDate,
          description: `Penerimaan Pembayaran Escrow Trip ${b.mountainName} - ${b.pendakiName}`,
          details: [
            { account: "Dana Escrow Platform", type: "debit", amount: b.price },
            { account: "Utang Escrow Titipan", type: "credit", amount: b.price }
          ]
        });
      }

      if (b.status === "Selesai") {
        const platformFee = Math.round(b.price * 0.1);
        const payout = b.price - platformFee;
        entries.push({
          id: `book_resolve_${b.id}`,
          date: b.bookingDate,
          description: `Penyelesaian Escrow & Distribusi Jasa Trip ${b.mountainName} (${b.guideName})`,
          details: [
            { account: "Utang Escrow Titipan", type: "debit", amount: b.price },
            { account: "Kas & Bank Platform", type: "debit", amount: b.price },
            { account: "Dana Escrow Platform", type: "credit", amount: b.price },
            { account: "Utang Dompet Guide", type: "credit", amount: payout },
            { account: "Pendapatan Komisi Platform", type: "credit", amount: platformFee }
          ]
        });
      }
    });

    // 3. Rental Orders
    rentalOrders.forEach((r) => {
      const isPaid = !["Menunggu Pembayaran", "Menunggu Konfirmasi"].includes(r.status);
      if (isPaid) {
        entries.push({
          id: `rent_escrow_${r.id}`,
          date: r.startDate,
          description: `Penerimaan Pembayaran Escrow Rental ${r.itemName} - ${r.pendakiName}`,
          details: [
            { account: "Dana Escrow Platform", type: "debit", amount: r.totalPrice },
            { account: "Utang Escrow Titipan", type: "credit", amount: r.totalPrice }
          ]
        });
      }

      if (r.status === "Selesai") {
        const platformFee = Math.round(r.totalPrice * 0.1);
        const payout = r.totalPrice - platformFee;
        entries.push({
          id: `rent_resolve_${r.id}`,
          date: r.startDate,
          description: `Penyelesaian Escrow & Distribusi Sewa Alat ${r.itemName} (${r.vendorName})`,
          details: [
            { account: "Utang Escrow Titipan", type: "debit", amount: r.totalPrice },
            { account: "Kas & Bank Platform", type: "debit", amount: r.totalPrice },
            { account: "Dana Escrow Platform", type: "credit", amount: r.totalPrice },
            { account: "Utang Dompet Vendor", type: "credit", amount: payout },
            { account: "Pendapatan Komisi Platform", type: "credit", amount: platformFee }
          ]
        });
      }
    });

    return entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [depositTransactions, bookings, rentalOrders]);


  // Initialize first chat partner if not set
  useEffect(() => {
    if (chatPartnersList.length > 0 && !selectedChatPartnerId) {
      setSelectedChatPartnerId(chatPartnersList[0].id);
      setSelectedChatPartnerName(chatPartnersList[0].name);
    }
  }, [chatPartnersList, selectedChatPartnerId]);
  
  // Synchronize collaboration subtab based on active role
  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "guide") {
        setVendorCollabSubTab("vendors");
      } else if (currentUser.role === "vendor") {
        setVendorCollabSubTab("guides");
      }
    }
  }, [currentUser]);

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

  const handlePayWithWallet = (id: string, type: "booking" | "rental", amount: number) => {
    if (!currentUser) return;
    
    if (climberDeposit < amount) {
      toast.error("Saldo Dompet Anda Tidak Mencukupi!", {
        description: `Saldo Anda saat ini Rp ${climberDeposit.toLocaleString("id-ID")}. Silakan lakukan Top Up terlebih dahulu di menu Deposit & Dompet.`,
      });
      setActiveTab("deposit_wallet");
      return;
    }

    // Deduct from climber deposit (wallet balance)
    withdrawWallet("pendaki", amount, `Pembayaran ${type === "booking" ? "Booking Guide" : "Sewa Alat"} (ID: ${id})`);
    logUserActivity(currentUser.id, currentUser.name || "Pendaki", "pendaki", `Melakukan pembayaran ${type === "booking" ? "Booking Guide" : "Sewa Alat"} senilai Rp ${amount.toLocaleString("id-ID")}`);

    if (type === "booking") {
      updateBookingStatus(id, "Telah Dibayar");
      
      // Automatic Rental Order creation for bundle packages!
      const b = bookings.find(item => item.id === id);
      if (b && b.bookingType === "paket" && b.packageId) {
        const pkg = tripPackages.find(p => p.id === b.packageId);
        if (pkg && pkg.vendorId) {
          const startDate = new Date(b.bookingDate);
          const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);
          const endDateStr = endDate.toISOString().split("T")[0];
          
          const rentalId = addRentalOrder({
            itemId: pkg.id,
            itemName: `Alat Bundling: ${pkg.title}`,
            vendorId: pkg.vendorId,
            vendorName: pkg.vendorName || "Vendor Partner",
            pendakiId: currentUser.id,
            pendakiName: currentUser.name || "Pendaki",
            qty: b.climbersCount || 1,
            startDate: b.bookingDate,
            endDate: endDateStr,
            totalPrice: 0, // Included in package bundle
          });
          
          updateRentalStatus(rentalId, "Telah Dibayar");
          logUserActivity(currentUser.id, currentUser.name || "Pendaki", "pendaki", `Otomatis membuat rental order bundling ${pkg.title} ke Vendor ${pkg.vendorName}`);
        }
      }
    } else {
      updateRentalStatus(id, "Telah Dibayar");
    }

    toast.success("Pembayaran Berhasil!", {
      description: `Pembayaran sebesar Rp ${amount.toLocaleString("id-ID")} berhasil didebet dari Saldo Dompet Anda.`,
    });
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
        damageTerms: item.damageTerms || "",
        image: item.image || ""
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
        damageTerms: "",
        image: ""
      });
    }
    setItemFormOpen(true);
  };

  const handleSaveCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, description, price, available, category, groupDiscountEnabled, damageTerms, image } = catalogForm;

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
        damageTerms,
        image
      });
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
        damageTerms,
        image
      });
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
    setPaymentGatewayAmount(amount);
    setPaymentGatewayRole(currentUser?.role as any || "pendaki");
    setTopUpModalOpen(false);
    setDepositAmountInput("");
    setPaymentGatewayMethod("qris");
    setShowPaymentGateway(true);
  };

  const handlePaymentGatewaySuccess = () => {
    topUpWallet(paymentGatewayRole, paymentGatewayAmount);
    logUserActivity(
      currentUser?.id || "unknown",
      currentUser?.name || "User",
      paymentGatewayRole,
      `Melakukan Top Up Saldo Deposit sebesar Rp ${paymentGatewayAmount.toLocaleString("id-ID")} via Payment Gateway (${paymentGatewayMethod.toUpperCase()})`
    );
    setShowPaymentGateway(false);
    toast.success(`Berhasil melakukan top up sebesar Rp ${paymentGatewayAmount.toLocaleString("id-ID")}!`, {
      description: "Saldo dompet Anda berhasil dikreditkan secara instan.",
    });
  };

  const handlePaymentGatewayCancel = () => {
    setShowPaymentGateway(false);
    toast.error("Pembayaran Dibatalkan / Gagal", {
      description: "Saldo dompet Anda tidak bertambah karena transaksi dibatalkan atau tidak terverifikasi.",
    });
  };

  const handleWithdrawSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(depositAmountInput);
    if (!amount || amount <= 0) {
      toast.error("Masukkan nominal yang valid!");
      return;
    }
    const currentBalance = 
      currentUser?.role === "pendaki" ? climberDeposit :
      currentUser?.role === "guide" ? guideWallet : vendorWallet;

    if (amount > currentBalance) {
      toast.error("Saldo tidak mencukupi!");
      return;
    }

    if (!currentUser?.bank_account) {
      toast.error("Anda belum mengatur rekening bank penarikan dana!");
      return;
    }

    setIsProcessingWd(true);
    toast.info("Menghubungkan ke gateway pembayaran (Dummy Midtrans/Xendit payout)...");

    setTimeout(() => {
      withdrawWallet(currentUser?.role as any, amount, `Penarikan Dana ke Rekening ${currentUser.bank_name} (${currentUser.bank_account})`);
      setIsProcessingWd(false);
      setWithdrawModalOpen(false);
      setDepositAmountInput("");
      toast.success(`Berhasil menarik dana sebesar Rp ${amount.toLocaleString("id-ID")}!`, {
        description: `Dana ditransfer ke ${currentUser.bank_name} No. Rek ${currentUser.bank_account} a.n. ${currentUser.bank_holder}.`
      });
    }, 2000);
  };

  // Submit Partnership Verification Document
  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    
    try {
      await addVerificationRequest({
        userId: currentUser.id,
        userName: currentUser.name,
        role: currentUser.role as "guide" | "vendor",
        documentName: verDocName,
        documentImage: verDocFile
      });

      setVerFormOpen(false);
      toast.success("Dokumen baru dikirim ke Admin untuk ditinjau!");
    } catch (err: any) {
      console.error("Error submitting verification doc:", err);
      toast.error("Gagal mengirim dokumen verifikasi.");
    }
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
    const wasSuspended = localStorage.getItem("isSuspendedKicked") === "true";
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center shadow-xl p-8 border border-gray-150 font-sans bg-white">
          <ShieldAlert className={`size-16 mx-auto mb-4 animate-bounce ${wasSuspended ? "text-red-500" : "text-amber-500"}`} />
          <h2 className="text-xl font-bold text-gray-800 mb-2">
            {wasSuspended ? "Akun Ditangguhkan" : "Akses Terbatas"}
          </h2>
          <p className="text-sm text-gray-550 mb-6 leading-relaxed">
            {wasSuspended 
              ? "Akun Anda ditangguhkan. Silakan hubungi email admin@ayokmendaki.com."
              : "Anda belum masuk ke akun pendaki, guide, vendor, atau admin. Silakan masuk terlebih dahulu atau gunakan Demo Role Switcher di pojok kanan bawah."}
          </p>
          <div className="flex gap-3">
            <Button className={`flex-1 ${wasSuspended ? "bg-red-600 hover:bg-red-700" : "bg-emerald-600 hover:bg-emerald-700"} text-white font-semibold text-xs`} onClick={() => {
              localStorage.removeItem("isSuspendedKicked");
              navigate("/login");
            }}>
              {wasSuspended ? "Kembali ke Login" : "Masuk Akun"}
            </Button>
            <Button variant="outline" className="flex-1 text-xs font-semibold" onClick={() => {
              localStorage.removeItem("isSuspendedKicked");
              navigate("/");
            }}>
              Ke Beranda
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isProfileIncomplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12 font-sans">
        <Card className="max-w-2xl w-full shadow-2xl border-0 bg-white rounded-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-emerald-800 text-white p-6 relative">
            <h2 className="text-xl font-bold">Lengkapi Data Diri Anda</h2>
            <p className="text-xs opacity-80 mt-1">
              Harap isi data diri & berkas identitas terlebih dahulu sebelum Anda dapat menggunakan layanan dan dashboard AyokMendaki.
            </p>
          </div>
          <CardContent className="p-6">
            <form onSubmit={handleProfileSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Name */}
                {currentUser.role !== "vendor" && (
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-semibold text-gray-700">Nama Lengkap</label>
                    <Input
                      placeholder="Masukkan nama lengkap Anda"
                      className={`bg-gray-55 border-gray-200 text-xs ${profileErrors.name ? "border-red-400 focus:border-red-400" : ""}`}
                      value={profileForm.name}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                    />
                    {profileErrors.name && <p className="text-[10px] text-red-500">{profileErrors.name}</p>}
                  </div>
                )}
                {/* Phone */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Nomor Telepon (WhatsApp)</label>
                  <Input
                    placeholder="Contoh: 081234567890"
                    className={`bg-gray-55 border-gray-200 text-xs ${profileErrors.phone ? "border-red-400 focus:border-red-400" : ""}`}
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                  />
                  {profileErrors.phone && <p className="text-[10px] text-red-500">{profileErrors.phone}</p>}
                </div>

                {/* NIK */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Nomor NIK KTP (16 Digit)</label>
                  <Input
                    maxLength={16}
                    placeholder="Masukkan 16 digit NIK"
                    className={`bg-gray-55 border-gray-200 text-xs ${profileErrors.ktpNumber ? "border-red-400 focus:border-red-400" : ""}`}
                    value={profileForm.ktpNumber}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, ktpNumber: e.target.value.replace(/[^0-9]/g, "") }))}
                  />
                  {profileErrors.ktpNumber && <p className="text-[10px] text-red-500">{profileErrors.ktpNumber}</p>}
                </div>
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Kata Sandi Baru (Opsional)</label>
                  <Input
                    type="password"
                    placeholder="Min. 8 karakter jika ingin diatur/diubah"
                    className={`bg-gray-55 border-gray-200 text-xs ${profileErrors.password ? "border-red-400 focus:border-red-400" : ""}`}
                    value={profileForm.password}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, password: e.target.value }))}
                  />
                  {profileErrors.password && <p className="text-[10px] text-red-500">{profileErrors.password}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700">Konfirmasi Kata Sandi Baru</label>
                  <Input
                    type="password"
                    placeholder="Ulangi kata sandi baru"
                    className={`bg-gray-55 border-gray-200 text-xs ${profileErrors.confirmPassword ? "border-red-400 focus:border-red-400" : ""}`}
                    value={profileForm.confirmPassword}
                    onChange={(e) => setProfileForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  />
                  {profileErrors.confirmPassword && <p className="text-[10px] text-red-500">{profileErrors.confirmPassword}</p>}
                </div>
              </div>

              {/* KYC Photo Inputs */}
              <div className="bg-emerald-50/20 p-4 rounded-2xl border border-emerald-100/50 space-y-3">
                <div className="flex items-center gap-1.5 border-b border-emerald-100 pb-1.5">
                  <ShieldAlert className="size-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-emerald-800">Verifikasi Identitas (KYC)</h4>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-650">Foto KTP Asli</label>
                    <input 
                      type="file" 
                      id="ktp-upload" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "ktp");
                      }} 
                    />
                    <div 
                      onClick={() => document.getElementById("ktp-upload")?.click()}
                      className={`border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition-all ${
                        isUploadingKtp 
                          ? "border-amber-300 bg-amber-50/10 text-amber-800" 
                          : ktpUploadError
                          ? "border-red-300 bg-red-50/10 text-red-800"
                          : profileForm.ktpPhotoUrl
                          ? "border-emerald-500 bg-emerald-50/20 text-emerald-900"
                          : "border-emerald-300 bg-white hover:bg-emerald-50/20 text-emerald-700"
                      }`}
                    >
                      {isUploadingKtp ? (
                        <>
                          <Loader2 className="size-5 text-amber-600 mx-auto mb-1 animate-spin" />
                          <p className="text-[10px] font-bold text-amber-700">Diproses...</p>
                          <p className="text-[8px] text-amber-600/70">Sedang mengunggah berkas ke Google Drive...</p>
                        </>
                      ) : ktpUploadError ? (
                        <>
                          <AlertTriangle className="size-5 text-red-650 mx-auto mb-1 animate-bounce" />
                          <p className="text-[10px] font-bold text-red-700">Gagal Mengunggah</p>
                          <p className="text-[8px] text-red-600/75">Klik untuk mencoba kembali</p>
                        </>
                      ) : profileForm.ktpPhotoUrl ? (
                        <>
                          <CheckCircle2 className="size-5 text-emerald-600 mx-auto mb-1" />
                          <p className="text-[10px] font-bold text-emerald-800">Selesai</p>
                          <p className="text-[8px] text-emerald-600 font-medium truncate max-w-full px-1">{profileForm.ktpPhotoName || "KTP Berhasil Diunggah"}</p>
                        </>
                      ) : (
                        <>
                          <Award className="size-5 text-emerald-600 mx-auto mb-1" />
                          <p className="text-[10px] font-semibold">Pilih foto KTP</p>
                          <p className="text-[8px] text-gray-400">Format JPG/PNG, klik untuk unggah</p>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-655">Foto Selfie dengan KTP</label>
                    <input 
                      type="file" 
                      id="selfie-upload" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "selfie");
                      }} 
                    />
                    <div 
                      onClick={() => document.getElementById("selfie-upload")?.click()}
                      className={`border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition-all ${
                        isUploadingSelfie 
                          ? "border-amber-300 bg-amber-50/10 text-amber-800" 
                          : selfieUploadError
                          ? "border-red-300 bg-red-50/10 text-red-800"
                          : profileForm.selfiePhotoUrl
                          ? "border-emerald-500 bg-emerald-50/20 text-emerald-900"
                          : "border-emerald-300 bg-white hover:bg-emerald-50/20 text-emerald-700"
                      }`}
                    >
                      {isUploadingSelfie ? (
                        <>
                          <Loader2 className="size-5 text-amber-600 mx-auto mb-1 animate-spin" />
                          <p className="text-[10px] font-bold text-amber-700">Diproses...</p>
                          <p className="text-[8px] text-amber-600/70">Sedang mengunggah berkas ke Google Drive...</p>
                        </>
                      ) : selfieUploadError ? (
                        <>
                          <AlertTriangle className="size-5 text-red-650 mx-auto mb-1 animate-bounce" />
                          <p className="text-[10px] font-bold text-red-700">Gagal Mengunggah</p>
                          <p className="text-[8px] text-red-600/75">Klik untuk mencoba kembali</p>
                        </>
                      ) : profileForm.selfiePhotoUrl ? (
                        <>
                          <CheckCircle2 className="size-5 text-emerald-600 mx-auto mb-1" />
                          <p className="text-[10px] font-bold text-emerald-800">Selesai</p>
                          <p className="text-[8px] text-emerald-600 font-medium truncate max-w-full px-1">{profileForm.selfiePhotoName || "Selfie Berhasil Diunggah"}</p>
                        </>
                      ) : (
                        <>
                          <Award className="size-5 text-emerald-600 mx-auto mb-1" />
                          <p className="text-[10px] font-semibold">Pilih foto selfie</p>
                          <p className="text-[8px] text-gray-400">Foto wajah verified, klik untuk unggah</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide-Specific Fields */}
              {currentUser.role === "guide" && (
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-1.5">Informasi Profesi Guide Gunung</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Spesialisasi Gunung</label>
                      <Input
                        placeholder="Gn. Rinjani, Gn. Semeru"
                        className="bg-white border-gray-200 text-xs"
                        value={profileForm.specialty}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, specialty: e.target.value }))}
                      />
                      {profileErrors.specialty && <p className="text-[10px] text-red-500">{profileErrors.specialty}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Pengalaman (Tahun)</label>
                      <Input
                        type="number"
                        placeholder="Contoh: 5"
                        className="bg-white border-gray-200 text-xs"
                        value={profileForm.experience}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, experience: e.target.value }))}
                      />
                      {profileErrors.experience && <p className="text-[10px] text-red-500">{profileErrors.experience}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Tarif Jasa Harian (Rp)</label>
                      <Input
                        type="number"
                        placeholder="Contoh: 450000"
                        className="bg-white border-gray-200 text-xs"
                        value={profileForm.price}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, price: e.target.value }))}
                      />
                      {profileErrors.price && <p className="text-[10px] text-red-500">{profileErrors.price}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Sertifikasi yang Dimiliki</label>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {["APIGI", "HPI", "SAR", "K3 Gunung"].map((cert) => (
                          <label key={cert} className="flex items-center gap-1 text-xs text-gray-600">
                            <input
                              type="checkbox"
                              checked={profileForm.certifications.includes(cert)}
                              onChange={(e) => handleProfileCheckboxChange(cert, e.target.checked)}
                              className="size-3.5 rounded border-gray-300 accent-emerald-600"
                            />
                            {cert}
                          </label>
                        ))}
                      </div>
                      {profileErrors.certifications && <p className="text-[10px] text-red-500">{profileErrors.certifications}</p>}
                    </div>
                  </div>
                  <div className="space-y-1 pt-1">
                    <label className="text-[11px] font-semibold text-gray-600">Upload Dokumen Sertifikat Resmi</label>
                    <input 
                      type="file" 
                      id="doc-upload" 
                      className="hidden" 
                      accept="image/*,application/pdf" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleFileUpload(file, "doc");
                      }} 
                    />
                    <div 
                      onClick={() => document.getElementById("doc-upload")?.click()}
                      className={`border border-dashed rounded-lg p-3 text-center cursor-pointer transition-all ${
                        isUploadingDoc 
                          ? "border-amber-300 bg-amber-50/10 text-amber-800" 
                          : docUploadError
                          ? "border-red-300 bg-red-50/10 text-red-800"
                          : (profileForm.docImage && !profileForm.docImage.includes("unsplash.com"))
                          ? "border-emerald-500 bg-emerald-50/20 text-emerald-900"
                          : "border-emerald-300 bg-white hover:bg-emerald-50/20 text-emerald-700"
                      }`}
                    >
                      {isUploadingDoc ? (
                        <>
                          <Loader2 className="size-5 text-amber-600 mx-auto mb-1 animate-spin" />
                          <p className="text-[10px] font-bold text-amber-700">Diproses...</p>
                          <p className="text-[8px] text-amber-600/70">Sedang mengunggah berkas ke Google Drive...</p>
                        </>
                      ) : docUploadError ? (
                        <>
                          <AlertTriangle className="size-5 text-red-650 mx-auto mb-1 animate-bounce" />
                          <p className="text-[10px] font-bold text-red-700">Gagal Mengunggah</p>
                          <p className="text-[8px] text-red-600/75">Klik untuk mencoba kembali</p>
                        </>
                      ) : (profileForm.docImage && !profileForm.docImage.includes("unsplash.com")) ? (
                        <>
                          <CheckCircle2 className="size-5 text-emerald-600 mx-auto mb-1" />
                          <p className="text-[10px] font-bold text-emerald-800">Selesai</p>
                          <p className="text-[8px] text-emerald-600 font-medium truncate max-w-full px-1">{profileForm.docName || "Dokumen Berhasil Diunggah"}</p>
                        </>
                      ) : (
                        <>
                          <Award className="size-5 text-emerald-600 mx-auto mb-1" />
                          <p className="text-[10px] font-semibold">Pilih dokumen sertifikat</p>
                          <p className="text-[8px] text-gray-400 mt-0.5">Format PDF/JPG, klik untuk unggah</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor-Specific Fields */}
              {currentUser.role === "vendor" && (
                <div className="bg-emerald-50/30 p-4 rounded-2xl border border-emerald-100 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-1.5">Informasi Vendor Rental Outdoor</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Nama Toko Outdoor</label>
                      <Input
                        placeholder="Contoh: Summit Gear Rental"
                        className="bg-white border-gray-200 text-xs"
                        value={profileForm.storeName}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, storeName: e.target.value }))}
                      />
                      {profileErrors.storeName && <p className="text-[10px] text-red-500">{profileErrors.storeName}</p>}
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">NIB / Izin UKM</label>
                      <Input
                        placeholder="Contoh: 1234567890"
                        className="bg-white border-gray-200 text-xs"
                        value={profileForm.nib}
                        onChange={(e) => setProfileForm(prev => ({ ...prev, nib: e.target.value }))}
                      />
                      {profileErrors.nib && <p className="text-[10px] text-red-500">{profileErrors.nib}</p>}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600">Alamat Toko Fisik</label>
                    <Input
                      placeholder="Contoh: Jl. Pendaki No. 12, Wonosobo, Jawa Tengah"
                      className="bg-white border-gray-200 text-xs"
                      value={profileForm.address}
                      onChange={(e) => setProfileForm(prev => ({ ...prev, address: e.target.value }))}
                    />
                    {profileErrors.address && <p className="text-[10px] text-red-500">{profileErrors.address}</p>}
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="flex gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-xs text-gray-650 h-10 font-bold border-gray-200"
                  onClick={() => setCurrentUser(null)}
                >
                  Keluar Akun (Log Out)
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white h-10 text-xs font-bold shadow-md"
                  disabled={profileLoading}
                >
                  {profileLoading ? "Menyimpan Data..." : "Kirim Data Verifikasi"}
                </Button>
              </div>
            </form>
          </CardContent>
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
                  { id: "chat", label: "In-App Chat", icon: <MessageSquare className="size-4" /> },
                  { id: "inbox", label: "Kotak Pesan", icon: <Mail className="size-4" /> },
                  { id: "profile", label: "Profil Saya", icon: <UserIcon className="size-4" /> }
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
                    {t.id === "inbox" && adminMessages.filter(m => (m.recipientId === currentUser.id || m.recipientId === null) && !m.isRead).length > 0 && (
                      <span className="ml-auto bg-red-500 text-white size-5 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                        {adminMessages.filter(m => (m.recipientId === currentUser.id || m.recipientId === null) && !m.isRead).length}
                      </span>
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
                  { id: "vendor_catalog", label: "Katalog Vendor & Kolaborasi", icon: <Building className="size-4" /> },
                  { id: "deposit_wallet", label: "Dompet Penghasilan", icon: <Wallet className="size-4" /> },
                  { id: "chat", label: "In-App Chat", icon: <MessageSquare className="size-4" /> },
                  { id: "inbox", label: "Kotak Pesan", icon: <Mail className="size-4" /> },
                  { id: "profile", label: "Profil Saya", icon: <UserIcon className="size-4" /> }
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
                    {t.id === "inbox" && adminMessages.filter(m => (m.recipientId === currentUser.id || m.recipientId === null) && !m.isRead).length > 0 && (
                      <span className="ml-auto bg-red-500 text-white size-5 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                        {adminMessages.filter(m => (m.recipientId === currentUser.id || m.recipientId === null) && !m.isRead).length}
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
                  { id: "deposit_wallet", label: "Dompet Penghasilan", icon: <Wallet className="size-4" /> },
                  { id: "chat", label: "In-App Chat", icon: <MessageSquare className="size-4" /> },
                  { id: "inbox", label: "Kotak Pesan", icon: <Mail className="size-4" /> },
                  { id: "profile", label: "Profil Saya", icon: <UserIcon className="size-4" /> }
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
                    {t.id === "inbox" && adminMessages.filter(m => (m.recipientId === currentUser.id || m.recipientId === null) && !m.isRead).length > 0 && (
                      <span className="ml-auto bg-red-500 text-white size-5 rounded-full flex items-center justify-center text-[10px] font-bold animate-pulse">
                        {adminMessages.filter(m => (m.recipientId === currentUser.id || m.recipientId === null) && !m.isRead).length}
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
                   { id: "user_control", label: "Aktivitas & Kontrol User", icon: <Users className="size-4" /> },
                   { id: "verify", label: "Verifikasi Berkas", icon: <UserCheck className="size-4" /> },
                   { id: "manage_ads", label: "Kelola Iklan/Ads", icon: <Award className="size-4" /> },
                   { id: "escrow", label: "Monitoring Transaksi", icon: <DollarSign className="size-4" /> },
                   { id: "disputes", label: "Penyelesaian Dispute", icon: <ShieldAlert className="size-4" /> },
                   { id: "manage_mountains", label: "Kontak Tiket Gunung", icon: <MountainIcon className="size-4" /> },
                   { id: "warnings", label: "Sanksi & Warning", icon: <AlertTriangle className="size-4" /> },
                   { id: "broadcasts", label: "Pesan & Pengumuman", icon: <Mail className="size-4" /> },
                   { id: "reports", label: "Laporan Keuangan", icon: <TrendingUp className="size-4" /> },
                   { id: "profile", label: "Profil Saya", icon: <UserIcon className="size-4" /> }
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
            
            {/* Warnings Banner for Current User */}
            {currentUser && userWarnings.filter((w) => w.userId === currentUser.id).map((w) => (
              <div key={w.id} className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-800 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-300 shadow-sm font-sans">
                <AlertTriangle className="size-5 shrink-0 text-red-655 mt-0.5" />
                <div className="flex-1">
                  <p className="font-extrabold text-xs text-red-950 uppercase tracking-wide">⚠️ Peringatan Pelanggaran dari Super Admin</p>
                  <p className="text-xs font-semibold mt-1 text-red-800">{w.text}</p>
                  <p className="text-[10px] text-gray-400 mt-1.5">Sanksi aktif sejak: {w.date}</p>
                </div>
              </div>
            ))}
            
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
                                <p>Nominal: <b>Rp {b.fineAmount.toLocaleString("id-ID")}</b></p>
                                <p className="italic">Alasan: "{b.fineNotes}"</p>
                                <p className="text-[10px] text-gray-500 mt-1 font-normal leading-tight">Denda ini akan dikonfirmasi oleh Super Admin dan otomatis dipotong dari dana deposit jaminan Anda.</p>
                              </div>
                            )}

                            <div className="flex gap-2 w-full justify-end border-t border-gray-100 pt-3 mt-3">
                                {b.status === "Menunggu Pembayaran" && (
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white font-bold" onClick={() => handlePayWithWallet(b.id, "booking", b.price)}>
                                    <Wallet className="size-3.5 mr-1" /> Bayar dengan Saldo Dompet
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
                                {b.status !== "Menunggu Pembayaran" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs border-gray-250 text-gray-700 hover:bg-gray-50 font-bold"
                                    onClick={() => {
                                      setReceiptData({
                                        id: b.id,
                                        type: "booking",
                                        date: new Date().toISOString(),
                                        amount: b.price,
                                        description: b.officialTicketBooking 
                                          ? `Pemesanan Tiket Resmi Gunung ${b.mountainName}`
                                          : `Booking Layanan Guide Gunung ${b.mountainName}`,
                                        senderName: currentUser.name,
                                        recipientName: b.guideName || "Platform AyokMendaki",
                                        details: `Tanggal Trip: ${b.bookingDate} • Gunung: ${b.mountainName} ${b.bookingType === "paket" ? "• Paket Kemitraan" : ""}`
                                      });
                                      setReceiptModalOpen(true);
                                    }}
                                  >
                                    <FileText className="size-3.5 mr-1 text-slate-500" /> Cetak Resi
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
                                <p className="text-xs text-gray-500 mt-1">Vendor: <b>{r.vendorName}</b> &nbsp;•&nbsp; Jumlah: <b>{r.qty} Unit</b></p>
                                <p className="text-xs text-gray-500 mt-0.5">Tanggal Sewa: <b>{r.startDate}</b> s/d <b>{r.endDate}</b></p>
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
                                <p>Nominal: <b>Rp {r.fineAmount.toLocaleString("id-ID")}</b></p>
                                <p className="italic">Alasan: "{r.fineNotes}"</p>
                                <p className="text-[10px] text-gray-500 mt-1 font-normal leading-tight">Denda ini akan dikonfirmasi oleh Super Admin dan otomatis dipotong dari dana deposit jaminan Anda.</p>
                              </div>
                            )}

                            <div className="flex gap-2 w-full justify-end border-t border-gray-100 pt-3 mt-3">
                                {r.status === "Menunggu Pembayaran" && (
                                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white font-bold" onClick={() => handlePayWithWallet(r.id, "rental", r.totalPrice)}>
                                    <Wallet className="size-3.5 mr-1" /> Bayar dengan Saldo Dompet
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
                                {r.status !== "Menunggu Pembayaran" && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs border-gray-250 text-gray-700 hover:bg-gray-50 font-bold animate-in fade-in duration-200"
                                    onClick={() => {
                                      setReceiptData({
                                        id: r.id,
                                        type: "rental",
                                        date: new Date().toISOString(),
                                        amount: r.totalPrice,
                                        description: `Penyewaan Alat Outdoor: ${r.qty}x ${r.itemName}`,
                                        senderName: currentUser.name,
                                        recipientName: r.vendorName || "Platform AyokMendaki",
                                        details: `Mulai: ${r.startDate} • Selesai: ${r.endDate} • Vendor: ${r.vendorName}`
                                      });
                                      setReceiptModalOpen(true);
                                    }}
                                  >
                                    <FileText className="size-3.5 mr-1 text-slate-500" /> Cetak Resi
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
                              <p className="text-xs text-gray-500 mt-1">Ditujukan Ke: <b>{n.recipientName}</b></p>
                              <div className="grid grid-cols-2 gap-3 mt-2 text-xs border border-gray-50 p-2 rounded-lg bg-gray-50/50">
                                <div>Harga Awal: <b className="text-gray-500 line-through">Rp {n.originalPrice.toLocaleString()}</b></div>
                                <div>Tawaran Anda: <b className="text-emerald-700 font-bold">Rp {n.proposedPrice.toLocaleString()}</b></div>
                              </div>
                              {n.status === "countered" && (
                                <p className="text-xs text-amber-700 bg-amber-50 p-2 rounded mt-2 border border-amber-100 font-semibold">
                                  ⚠️ Guide/Vendor menawarkan harga balik: <b>Rp {n.counterPrice?.toLocaleString()}</b>
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
                      {/* ERP Service Console Summary Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-sans">
                        <div className="bg-white p-3 rounded-xl border border-gray-150/80 shadow-xs text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Job Order</p>
                          <p className="text-lg font-black text-gray-800 mt-1">{bookings.filter(b => b.guideId === currentUser.id).length} Pesanan</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-150/80 shadow-xs text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Pekerjaan Aktif</p>
                          <p className="text-lg font-black text-emerald-700 mt-1">
                            {bookings.filter(b => b.guideId === currentUser.id && b.status !== "cancelled" && b.status !== "done").length} Aktif
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-150/80 shadow-xs text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Negosiasi Deal</p>
                          <p className="text-lg font-black text-amber-700 mt-1">
                            {negotiations.filter(n => n.recipientId === currentUser.id && n.status === "pending").length} Progres
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-150/80 shadow-xs text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Total Omzet (ERP)</p>
                          <p className="text-lg font-black text-emerald-850 mt-1 font-mono">
                            Rp {bookings.filter(b => b.guideId === currentUser.id).reduce((sum, b) => sum + (b.price || 0), 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
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
                                <p className="text-xs text-gray-500 flex items-center gap-1"><Calendar className="size-3.5" /> Tanggal Trip: <b>{b.bookingDate}</b></p>
                                <p className="text-xs text-emerald-700 font-bold mt-1">Tarif Diajukan: Rp {b.price.toLocaleString("id-ID")}</p>
                                
                                {relevantNego && (
                                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-100 mt-2 space-y-1 max-w-md">
                                    <p className="font-bold">💬 Negosiasi Harga Masuk:</p>
                                    <p>Pendaki menawar tarif menjadi <b>Rp {relevantNego.proposedPrice.toLocaleString("id-ID")}</b> (Tarif Normal Anda: Rp {relevantNego.originalPrice.toLocaleString()})</p>
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
                                <p className="text-xs text-gray-500">Tanggal Mulai: <b>{b.bookingDate}</b> &nbsp;•&nbsp; Tarif Jasa: <b>Rp {b.price.toLocaleString("id-ID")}</b></p>
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
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <h4 className="font-bold text-gray-800">{p.title}</h4>
                                <Badge variant="outline" className="text-[9px] uppercase">{p.duration}</Badge>
                                {p.status === "approved" && <Badge className="bg-emerald-100 text-emerald-800 text-[8px] border border-emerald-250 py-0.5 px-1.5 font-bold">Approved</Badge>}
                                {(p.status === "pending" || !p.status) && <Badge className="bg-amber-100 text-amber-800 text-[8px] border border-amber-250 py-0.5 px-1.5 font-bold">Pending Approval</Badge>}
                                {p.status === "rejected" && <Badge className="bg-red-100 text-red-800 text-[8px] border border-red-250 py-0.5 px-1.5 font-bold">Ditolak</Badge>}
                              </div>
                              <p className="text-xs text-gray-500">Gunung Target: <b>{p.targetMountain}</b></p>
                              {p.vendorName && <p className="text-xs text-emerald-800">⛺ Mitra Vendor: <b>{p.vendorName}</b></p>}
                              <p className="text-xs text-emerald-700 font-bold mt-1">Rp {p.price.toLocaleString("id-ID")} / Orang &middot; Promo s/d: {p.promoDeadline}</p>
                            </div>
                            
                            <div className="flex gap-2 shrink-0">
                              <Button variant="outline" size="sm" className="text-xs border-red-200 text-red-650 hover:bg-red-50" onClick={async () => {
                                setTripPackages(prev => prev.filter(pk => pk.id !== p.id));
                                await supabase.from("trip_packages").delete().eq("id", p.id);
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


                {activeTab === "vendor_catalog" && (
                  <>
                    {renderProposalsCenter()}
                    <Card className="border border-gray-150 shadow-sm font-sans bg-white">
                      <CardHeader className="pb-3 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-800">Katalog Vendor &amp; Kolaborasi</CardTitle>
                            <CardDescription className="text-xs">
                              Temukan vendor rental alat kemping untuk diajak berkolaborasi membuat paket trip bundling promo.
                            </CardDescription>
                          </div>
                          <div className="flex gap-1.5 shrink-0 bg-gray-55/40 p-1 rounded-lg border border-gray-200">
                            <button
                              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                                vendorCollabSubTab === "vendors" ? "bg-white shadow-xs text-emerald-700 font-bold" : "text-gray-500 hover:text-gray-805"
                              }`}
                              onClick={() => setVendorCollabSubTab("vendors")}
                            >
                              Daftar Vendor (Sewa Alat)
                            </button>
                            <button
                              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                                vendorCollabSubTab === "packages" ? "bg-white shadow-xs text-emerald-700 font-bold" : "text-gray-500 hover:text-gray-850"
                              }`}
                              onClick={() => setVendorCollabSubTab("packages")}
                            >
                              Paket Aktif ({tripPackages.filter(p => p.guideId === currentUser.id).length})
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-4 font-sans">
                        {vendorCollabSubTab === "vendors" && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            {vendors.map((v) => (
                              <div key={v.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                                <div>
                                  <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
                                    {v.name}
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[9px]">⭐ {v.rating}</Badge>
                                    {v.verified && <Badge className="bg-blue-100 text-blue-800 text-[9px] border border-blue-200 py-0.5">Verified</Badge>}
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">Lokasi: <b>{v.location}</b></p>
                                  <p className="text-xs text-gray-400 mt-0.5 font-normal">Menyediakan berbagai perlengkapan kemping berkualitas.</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex-1 sm:flex-initial rounded-xl"
                                    onClick={() => handleOpenCollabForm(v)}
                                  >
                                    Tawarkan Kolaborasi
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50 font-bold flex-1 sm:flex-initial rounded-xl"
                                    onClick={() => {
                                      if (v.id === currentUser.id) {
                                        toast.error("Anda tidak dapat menghubungi diri Anda sendiri.");
                                        return;
                                      }
                                      setSelectedChatPartnerId(v.id);
                                      setSelectedChatPartnerName(v.name);
                                      setActiveTab("chat");
                                      toast.info(`Membuka obrolan dengan ${v.name}`);
                                    }}
                                  >
                                    Chat Vendor
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {vendorCollabSubTab === "packages" && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            {tripPackages.filter(p => p.guideId === currentUser.id).length === 0 ? (
                              <div className="text-center py-12 text-gray-400 text-xs italic">
                                Belum ada kolaborasi paket pendakian aktif dengan Vendor saat ini.
                              </div>
                            ) : (
                              tripPackages.filter(p => p.guideId === currentUser.id).map((p) => (
                                <div key={p.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all shadow-xs">
                                  <div className="flex gap-3 items-start">
                                    <img src={p.image} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-100" />
                                    <div>
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-bold text-gray-800 text-sm">{p.title}</h4>
                                        <Badge className="bg-emerald-50 text-emerald-800 text-[9px] border-emerald-200 border">{p.duration}</Badge>
                                      </div>
                                      <p className="text-xs text-gray-500">Vendor Partner: <b>{p.vendorName || "Tidak Diketahui"}</b> &middot; Gunung: <b>{p.targetMountain}</b></p>
                                      <p className="text-xs text-emerald-700 font-bold mt-1">Total Harga Paket: Rp {p.price.toLocaleString("id-ID")}</p>
                                    </div>
                                  </div>
                                  <div className="shrink-0 flex flex-col items-end gap-1.5 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0">
                                    <Badge className="bg-emerald-600 text-white text-[10px]">Kolaborasi Aktif</Badge>
                                    {p.vendorId && (
                                      <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto font-bold rounded-xl" onClick={() => {
                                        if (p.vendorId === currentUser.id) {
                                          toast.error("Anda tidak dapat menghubungi diri Anda sendiri.");
                                          return;
                                        }
                                        setSelectedChatPartnerId(p.vendorId!);
                                        setSelectedChatPartnerName(p.vendorName || "Vendor Partner");
                                        setActiveTab("chat");
                                        toast.info(`Membuka obrolan dengan ${p.vendorName}`);
                                      }}>
                                        Hubungi Vendor
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
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

                          <div className="space-y-1">
                            <label className="text-[11px] font-semibold text-gray-750">Gambar / Foto Produk (Simpan ke Google Drive)</label>
                            <div className="flex gap-2 items-center">
                              {catalogForm.image ? (
                                <img src={catalogForm.image} className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                              ) : (
                                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-[9px] text-gray-400 font-sans border border-gray-200">No Img</div>
                              )}
                              <Input
                                type="file"
                                accept="image/*"
                                className="bg-white border-gray-200 text-xs flex-1 cursor-pointer"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(file, "catalog");
                                }}
                              />
                            </div>
                            {isUploadingCatalog && (
                              <p className="text-[10px] text-emerald-600 animate-pulse font-medium">Mengunggah gambar ke Google Drive...</p>
                            )}
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
                            <div className="flex gap-3 items-center">
                              {eq.image ? (
                                <img src={eq.image} className="w-12 h-12 object-cover rounded-lg border border-gray-150 shrink-0" />
                              ) : (
                                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-sans border border-gray-150 shrink-0">No Img</div>
                              )}
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-bold text-gray-800 text-sm">{eq.name}</h4>
                                  <Badge variant="outline" className="text-[9px] uppercase">{eq.category}</Badge>
                                </div>
                                <p className="text-xs text-gray-500">{eq.description}</p>
                                <p className="text-xs text-emerald-700 font-bold mt-1">Rp {eq.price.toLocaleString("id-ID")}/hari &middot; Stok: {eq.available} unit</p>
                              </div>
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
                      {/* ERP Service Console Summary Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100 font-sans">
                        <div className="bg-white p-3 rounded-xl border border-gray-150/80 shadow-xs text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Job Order (Sewa)</p>
                          <p className="text-lg font-black text-gray-800 mt-1">{rentalOrders.filter(r => r.vendorId === currentUser.id).length} Pesanan</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-150/80 shadow-xs text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Unit Disewakan</p>
                          <p className="text-lg font-black text-emerald-700 mt-1">
                            {rentalOrders.filter(r => r.vendorId === currentUser.id && r.status === "approved").reduce((sum, r) => sum + (r.qty || 0), 0)} Unit
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-150/80 shadow-xs text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Tawaran Masuk</p>
                          <p className="text-lg font-black text-amber-700 mt-1">
                            {negotiations.filter(n => n.recipientId === currentUser.id && n.status === "pending").length} Progres
                          </p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-gray-150/80 shadow-xs text-center">
                          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Turnover Rental (ERP)</p>
                          <p className="text-lg font-black text-emerald-850 mt-1 font-mono">
                            Rp {rentalOrders.filter(r => r.vendorId === currentUser.id).reduce((sum, r) => sum + (r.totalPrice || 0), 0).toLocaleString("id-ID")}
                          </p>
                        </div>
                      </div>
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
                                <p className="text-xs text-gray-500">Penyewa: <b>{r.pendakiName}</b></p>
                                <p className="text-xs text-gray-500 mt-0.5">Durasi: <b>{r.startDate}</b> s/d <b>{r.endDate}</b></p>
                                <p className="text-xs text-emerald-700 font-bold mt-1">Total Tarif: Rp {r.totalPrice.toLocaleString("id-ID")}</p>
                                
                                {relevantNego && (
                                  <div className="text-[11px] text-amber-800 bg-amber-50 p-2.5 rounded-lg border border-amber-100 mt-2 space-y-1 max-w-md">
                                    <p className="font-bold">💬 Negosiasi Harga Masuk:</p>
                                    <p>Pendaki menawar total tarif sewa menjadi <b>Rp {relevantNego.proposedPrice.toLocaleString("id-ID")}</b> (Tarif Normal: Rp {relevantNego.originalPrice.toLocaleString()})</p>
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
                  <>
                    {renderProposalsCenter()}
                    <Card className="border border-gray-150 shadow-sm">
                      <CardHeader className="pb-3 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg font-bold">Kolaborasi Paket Pendakian</CardTitle>
                            <CardDescription className="text-xs">
                              Kelola kerjasama paket trip pendakian bundling dengan pemandu (guide) profesional.
                            </CardDescription>
                          </div>
                          <div className="flex gap-1.5 shrink-0 bg-gray-50 p-1 rounded-lg border border-gray-200">
                            <button
                              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                                vendorCollabSubTab === "guides" ? "bg-white shadow-xs text-emerald-700 font-bold" : "text-gray-500 hover:text-gray-800"
                              }`}
                              onClick={() => setVendorCollabSubTab("guides")}
                            >
                              Daftar Pemandu (Guides)
                            </button>
                            <button
                              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all ${
                                vendorCollabSubTab === "packages" ? "bg-white shadow-xs text-emerald-700 font-bold" : "text-gray-500 hover:text-gray-800"
                              }`}
                              onClick={() => setVendorCollabSubTab("packages")}
                            >
                              Paket Aktif ({tripPackages.filter(p => p.vendorId === currentUser.id).length})
                            </button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-4">
                        {vendorCollabSubTab === "guides" && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            {guides.map((g) => (
                              <div key={g.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shadow-xs">
                                <div>
                                  <h4 className="font-extrabold text-gray-800 text-sm flex items-center gap-2">
                                    {g.name}
                                    <Badge className="bg-emerald-100 text-emerald-800 text-[9px]">⭐ {g.rating}</Badge>
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">Spesialis Gunung: <b>{(g.specialtyMountains || []).join(", ")}</b></p>
                                  <p className="text-xs text-emerald-700 font-bold mt-0.5">Tarif Pemandu: Rp {g.price.toLocaleString("id-ID")}/hari &middot; Pengalaman: {g.experience}</p>
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <Button
                                    size="sm"
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs flex-1 sm:flex-initial"
                                    onClick={() => handleOpenCollabForm(g)}
                                  >
                                    Tawarkan Kolaborasi
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="text-xs border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold flex-1 sm:flex-initial"
                                    onClick={() => {
                                      if (g.id === currentUser.id) {
                                        toast.error("Anda tidak dapat menghubungi diri Anda sendiri.");
                                        return;
                                      }
                                      setSelectedChatPartnerId(g.id);
                                      setSelectedChatPartnerName(g.name);
                                      setActiveTab("chat");
                                      toast.info(`Membuka obrolan dengan ${g.name}`);
                                    }}
                                  >
                                    Chat Pemandu
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}

                        {vendorCollabSubTab === "packages" && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            {tripPackages.filter(p => p.vendorId === currentUser.id).length === 0 ? (
                              <div className="text-center py-12 text-gray-400 text-sm">
                                Belum ada kolaborasi paket pendakian aktif dengan Tour Guide saat ini.
                              </div>
                            ) : (
                              tripPackages.filter(p => p.vendorId === currentUser.id).map((p) => (
                                <div key={p.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:shadow-md transition-all shadow-xs">
                                  <div className="flex gap-3 items-start">
                                    <img src={p.image} className="w-16 h-16 object-cover rounded-lg shrink-0 border border-gray-100" />
                                    <div>
                                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                                        <h4 className="font-bold text-gray-800 text-sm">{p.title}</h4>
                                        <Badge className="bg-emerald-50 text-emerald-800 text-[9px] border-emerald-200 border">{p.duration}</Badge>
                                      </div>
                                      <p className="text-xs text-gray-500">Pemandu: <b>{p.guideName}</b> &middot; Gunung: <b>{p.targetMountain}</b></p>
                                      <p className="text-xs text-gray-500 mt-0.5">Tenggat Booking: {p.promoDeadline}</p>
                                      <p className="text-xs text-emerald-700 font-bold mt-1">Total Paket: Rp {p.price.toLocaleString("id-ID")}</p>
                                    </div>
                                  </div>
                                  <div className="shrink-0 flex flex-col items-end gap-1.5 w-full sm:w-auto border-t sm:border-t-0 pt-2.5 sm:pt-0">
                                    <Badge className="bg-emerald-600 text-white text-[10px]">Kolaborasi Aktif</Badge>
                                    <Button variant="outline" size="sm" className="text-xs w-full sm:w-auto" onClick={() => {
                                      if (p.guideId === currentUser.id) {
                                        toast.error("Anda tidak dapat menghubungi diri Anda sendiri.");
                                        return;
                                      }
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
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </>
                )}
              </>
            )}

            {/* ════════════════════ SUPER ADMIN VIEW ════════════════════ */}
            {currentUser.role === "admin" && (
              <>
                {/* Tab Aktivitas & Kontrol User */}
                {activeTab === "user_control" && (
                  <div className="space-y-6 font-sans">
                    {/* Upper Grid: Stats & Activity Timeline */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      
                      {/* Stats Card */}
                      <Card className="lg:col-span-1 border border-gray-150 shadow-sm bg-white">
                        <CardHeader className="pb-3 border-b border-gray-100">
                          <CardTitle className="text-sm font-bold text-gray-800 uppercase tracking-wider">Statistik Platform</CardTitle>
                          <CardDescription className="text-[10px]">Ringkasan jumlah pengguna terdaftar.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 space-y-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center">
                              <p className="text-[10px] font-semibold text-blue-700">Pendaki</p>
                              <p className="text-xl font-extrabold text-blue-900 mt-1">{users.filter(u => u.role === "pendaki").length}</p>
                            </div>
                            <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                              <p className="text-[10px] font-semibold text-emerald-700">Guide</p>
                              <p className="text-xl font-extrabold text-emerald-900 mt-1">{users.filter(u => u.role === "guide").length}</p>
                            </div>
                            <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl text-center col-span-2">
                              <p className="text-[10px] font-semibold text-amber-700">Vendor</p>
                              <p className="text-xl font-extrabold text-amber-900 mt-1">{users.filter(u => u.role === "vendor").length}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Dynamic Timeline Card */}
                      <Card className="lg:col-span-2 border border-gray-150 shadow-sm bg-white flex flex-col max-h-[350px]">
                        <CardHeader className="pb-3 border-b border-gray-100">
                          <CardTitle className="text-sm font-bold text-gray-800 uppercase tracking-wider flex items-center gap-2">
                            <Activity className="size-4 text-emerald-600 animate-pulse" />
                            Log Aktivitas Pengguna (Real-time)
                          </CardTitle>
                          <CardDescription className="text-[10px]">Riwayat tindakan pendaki, guide, vendor & superadmin.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-4 flex-1 overflow-y-auto space-y-3.5 pr-2">
                          {userActivities.length === 0 ? (
                            <div className="text-center py-12 text-gray-400 text-xs">Belum ada log aktivitas tercatat.</div>
                          ) : (
                            userActivities.map((act) => {
                              let badgeColor = "bg-gray-100 text-gray-800";
                              if (act.userRole === "admin") badgeColor = "bg-purple-100 text-purple-800 border border-purple-200";
                              else if (act.userRole === "guide") badgeColor = "bg-emerald-100 text-emerald-800 border border-emerald-200";
                              else if (act.userRole === "vendor") badgeColor = "bg-amber-100 text-amber-800 border border-amber-200";
                              else if (act.userRole === "pendaki") badgeColor = "bg-blue-100 text-blue-800 border border-blue-200";

                              return (
                                <div key={act.id} className="flex items-start gap-3 text-xs border-b border-gray-50 pb-2.5 last:border-b-0 last:pb-0 animate-in fade-in duration-200">
                                  <div className="flex-1">
                                    <div className="flex items-center gap-2 flex-wrap mb-1">
                                      <span className="font-bold text-gray-800">{act.userName}</span>
                                      <Badge className={`${badgeColor} uppercase text-[9px] font-bold px-1.5 py-0.5 rounded-md`}>{act.userRole}</Badge>
                                      <span className="text-[9px] text-gray-400 font-mono ml-auto">{new Date(act.timestamp).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                                    </div>
                                    <p className="text-gray-650 leading-relaxed font-medium">{act.action}</p>
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </CardContent>
                      </Card>

                    </div>

                    {/* Lower Table: Account controls */}
                    <Card className="border border-gray-150 shadow-sm bg-white">
                      <CardHeader className="pb-3 border-b border-gray-100 flex flex-row items-center justify-between flex-wrap gap-4">
                        <div>
                          <CardTitle className="text-base font-bold text-gray-800">Direktori & Pengontrolan Akun Pengguna</CardTitle>
                          <CardDescription className="text-xs">Kelola status aktifasi, verifikasi berkas, dan kirim sanksi warning ke seluruh pengguna.</CardDescription>
                        </div>
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl h-9 flex items-center gap-1.5"
                          onClick={() => setManualUserModalOpen(true)}
                        >
                          <Plus className="size-4" />
                          Tambah Pengguna Baru
                        </Button>
                      </CardHeader>
                      <CardContent className="pt-4 p-0 overflow-x-auto">
                        <table className="w-full text-left text-xs font-semibold text-gray-700">
                          <thead>
                            <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 text-[10px] uppercase tracking-wider">
                              <th className="py-3 px-4">Nama Pengguna</th>
                              <th className="py-3 px-4">Email</th>
                              <th className="py-3 px-4">Role</th>
                              <th className="py-3 px-4 text-center">Status</th>
                              <th className="py-3 px-4 text-center">Verifikasi</th>
                              <th className="py-3 px-4 text-right">Aksi Kontrol</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {users.map((u) => {
                              const isSuspended = u.status === "suspended";
                              const isVerified = u.verified;

                              let roleBadge = "bg-gray-100 text-gray-800";
                              if (u.role === "admin") roleBadge = "bg-purple-100 text-purple-800 border border-purple-200";
                              else if (u.role === "guide") roleBadge = "bg-emerald-100 text-emerald-800 border border-emerald-200";
                              else if (u.role === "vendor") roleBadge = "bg-amber-100 text-amber-800 border border-amber-200";
                              else if (u.role === "pendaki") roleBadge = "bg-blue-100 text-blue-800 border border-blue-200";

                              return (
                                <tr key={u.id} className="hover:bg-gray-55/50 transition-colors">
                                  <td className="py-3.5 px-4 font-bold text-gray-950">{u.name}</td>
                                  <td className="py-3.5 px-4 font-normal text-gray-500">{u.email}</td>
                                  <td className="py-3.5 px-4">
                                    <Badge className={`${roleBadge} uppercase text-[9px] font-extrabold px-2 py-0.5`}>{u.role}</Badge>
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    {isSuspended ? (
                                      <Badge className="bg-red-100 text-red-800 border border-red-200 text-[9px] font-bold">Suspended</Badge>
                                    ) : (
                                      <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-bold">Aktif</Badge>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-center">
                                    {isVerified ? (
                                      <Badge className="bg-blue-100 text-blue-800 border border-blue-200 text-[9px] font-bold">Verified</Badge>
                                    ) : (
                                      <Badge className="bg-gray-100 text-gray-500 border border-gray-200 text-[9px] font-bold">Unverified</Badge>
                                    )}
                                  </td>
                                  <td className="py-3.5 px-4 text-right space-x-1.5 whitespace-nowrap">
                                    {u.role !== "admin" ? (
                                      <>
                                        {/* Status Toggle Button */}
                                        <Button
                                          size="sm"
                                          className={`text-[10px] h-7 font-bold px-2.5 py-1 rounded-lg ${
                                            isSuspended
                                              ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                              : "bg-red-100 text-red-700 hover:bg-red-200 border border-red-200"
                                          }`}
                                          onClick={() => {
                                            const newStatus = isSuspended ? "active" : "suspended";
                                            updateUserStatus(u.id, newStatus);
                                            toast.success(`Akun ${u.name} berhasil di-${newStatus === "active" ? "aktifkan kembali" : "suspend"}`);
                                          }}
                                        >
                                          {isSuspended ? "Aktifkan" : "Suspend"}
                                        </Button>

                                        {/* Verification Toggle Button */}
                                        {(u.role === "guide" || u.role === "vendor" || u.role === "pendaki") && (
                                          <Button
                                            size="sm"
                                            variant="outline"
                                            className={`text-[10px] h-7 font-bold px-2.5 py-1 rounded-lg border ${
                                              isVerified
                                                ? "border-gray-200 text-gray-500 hover:bg-gray-55"
                                                : "border-blue-200 text-blue-700 hover:bg-blue-50"
                                            }`}
                                            onClick={() => {
                                              toggleUserVerification(u.id);
                                              toast.success(`Status verifikasi ${u.name} diperbarui!`);
                                            }}
                                          >
                                            {isVerified ? "Batal Verif" : "Verifikasi"}
                                          </Button>
                                        )}

                                        {/* Warn Button */}
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="text-[10px] h-7 font-bold px-2.5 py-1 rounded-lg border-amber-250 text-amber-700 hover:bg-amber-50"
                                          onClick={() => {
                                            setPrefilledWarningUserId(u.id);
                                            setActiveTab("warnings");
                                            toast.info(`Prefill surat peringatan untuk ${u.name}`);
                                          }}
                                        >
                                          ⚠️ Peringatan
                                        </Button>
                                      </>
                                    ) : (
                                      <span className="text-gray-400 text-[10px] font-normal italic pr-2">Super Admin</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* 1. Tab Verify Documents */}
                {activeTab === "verify" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Verifikasi Berkas Pengguna</CardTitle>
                      <CardDescription className="text-xs">Validasi dokumen lisensi APIGI/HPI milik Guide baru dan legalitas UKM milik Vendor.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {(() => {
                        const pendingIdentitas = verificationRequests.filter(r => r.status === "pending" && (r.ktpPhoto || r.selfiePhoto || r.ktpNumber));
                        const pendingKhusus = verificationRequests.filter(r => r.status === "pending" && (r.role === "guide" || r.role === "vendor") && r.documentImage);

                        const filteredIdentitas = pendingIdentitas.filter(r => 
                          r.userName.toLowerCase().includes(searchIdentitas.toLowerCase()) ||
                          (r.ktpNumber || "").includes(searchIdentitas)
                        );

                        const filteredKhusus = pendingKhusus.filter(r => 
                          r.userName.toLowerCase().includes(searchKhusus.toLowerCase()) ||
                          r.documentName.toLowerCase().includes(searchKhusus.toLowerCase())
                        );

                        return (
                          <div className="space-y-6">
                            {/* ─── Bagian 1: Verifikasi Identitas ─── */}
                            <div className="space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                                <div>
                                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">📁 Verifikasi Identitas (KTP & Selfie)</h4>
                                  <p className="text-[10px] text-gray-500">Daftar pengajuan KYC kartu identitas pendaki, guide, dan vendor.</p>
                                </div>
                                <div className="w-full sm:w-60">
                                  <input
                                    type="text"
                                    placeholder="Cari nama atau NIK..."
                                    value={searchIdentitas}
                                    onChange={(e) => setSearchIdentitas(e.target.value)}
                                    className="w-full p-2 text-[11px] border border-gray-200 rounded-lg bg-white focus:outline-emerald-500 font-medium"
                                  />
                                </div>
                              </div>

                              {filteredIdentitas.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-xs italic bg-white border border-dashed border-gray-200 rounded-xl">
                                  Tidak ada pengajuan verifikasi identitas yang cocok.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {filteredIdentitas.map((req) => (
                                    <div key={`ident_${req.id}`} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xs transition-shadow">
                                      <div className="space-y-1.5 flex-1 font-sans">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-bold text-gray-800 text-xs">{req.userName}</h4>
                                          <Badge className="bg-blue-100 text-blue-800 uppercase text-[8px] font-bold">{req.role}</Badge>
                                        </div>
                                        
                                        {req.ktpNumber && (
                                          <div className="text-xs bg-gray-50 p-3 rounded-xl border border-gray-100 space-y-1.5 max-w-md">
                                            <p className="font-semibold text-gray-700">Nomor NIK KTP: <span className="font-mono font-bold text-gray-900 bg-gray-200/50 px-1.5 py-0.5 rounded">{req.ktpNumber}</span></p>
                                            <div className="flex flex-wrap gap-3 mt-1 pt-1.5 border-t border-gray-200/50">
                                              {req.ktpPhoto && (
                                                <a href={req.ktpPhoto} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg font-bold hover:bg-emerald-100/50 flex items-center gap-1 transition-all">
                                                  📄 Lihat Scan KTP
                                                </a>
                                              )}
                                              {req.selfiePhoto && (
                                                <a href={req.selfiePhoto} target="_blank" rel="noopener noreferrer" className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-1 rounded-lg font-bold hover:bg-emerald-100/50 flex items-center gap-1 transition-all">
                                                  📸 Lihat Foto Selfie
                                                </a>
                                              )}
                                            </div>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-2.5 md:pt-0">
                                        <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white" onClick={() => {
                                          respondToVerification(req.id, true);
                                          toast.success("Identitas disetujui & diverifikasi!");
                                        }}>
                                          Setujui
                                        </Button>
                                        <Button size="xs" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                                          respondToVerification(req.id, false);
                                          toast.error("Identitas ditolak verifikasi.");
                                        }}>
                                          Tolak
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* ─── Bagian 2: Verifikasi Dokumen Khusus ─── */}
                            <div className="pt-4 space-y-4">
                              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-gray-50 p-3.5 rounded-xl border border-gray-150">
                                <div>
                                  <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">📜 Verifikasi Dokumen Khusus (APIGI & NIB)</h4>
                                  <p className="text-[10px] text-gray-500">Dokumen sertifikasi APIGI/HPI milik Guide dan legalitas NIB milik Vendor.</p>
                                </div>
                                <div className="w-full sm:w-60">
                                  <input
                                    type="text"
                                    placeholder="Cari nama atau jenis dokumen..."
                                    value={searchKhusus}
                                    onChange={(e) => setSearchKhusus(e.target.value)}
                                    className="w-full p-2 text-[11px] border border-gray-200 rounded-lg bg-white focus:outline-emerald-500 font-medium"
                                  />
                                </div>
                              </div>

                              {filteredKhusus.length === 0 ? (
                                <div className="text-center py-6 text-gray-400 text-xs italic bg-white border border-dashed border-gray-200 rounded-xl">
                                  Tidak ada dokumen kemitraan khusus yang menunggu verifikasi.
                                </div>
                              ) : (
                                <div className="space-y-3">
                                  {filteredKhusus.map((req) => (
                                    <div key={`khusus_${req.id}`} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:shadow-xs transition-shadow">
                                      <div className="space-y-1.5 flex-1 font-sans">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-bold text-gray-800 text-xs">{req.userName}</h4>
                                          <Badge className="bg-blue-100 text-blue-800 uppercase text-[8px] font-bold">{req.role}</Badge>
                                        </div>
                                        <p className="text-xs text-gray-500 font-semibold">{req.documentName}</p>
                                        
                                        {req.documentImage && (
                                          <div className="pt-1.5">
                                            <a href={req.documentImage} target="_blank" rel="noopener noreferrer" className="text-[10px] text-blue-700 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg font-bold hover:bg-blue-100/50 inline-flex items-center gap-1 transition-all">
                                              📜 Lihat Dokumen Legalitas (APIGI / NIB)
                                            </a>
                                          </div>
                                        )}
                                      </div>

                                      <div className="flex gap-2 shrink-0 w-full md:w-auto justify-end border-t md:border-t-0 pt-2.5 md:pt-0">
                                        <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-xs px-4 text-white" onClick={() => {
                                          respondToVerification(req.id, true);
                                          toast.success("Dokumen khusus disetujui & diverifikasi!");
                                        }}>
                                          Setujui
                                        </Button>
                                        <Button size="xs" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={() => {
                                          respondToVerification(req.id, false);
                                          toast.error("Dokumen khusus ditolak verifikasi.");
                                        }}>
                                          Tolak
                                        </Button>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })()}

                      {/* ─── Riwayat Verifikasi ─── */}
                      <div className="pt-6 border-t border-gray-100 space-y-4">
                        <h4 className="text-sm font-bold text-gray-800">Riwayat Verifikasi</h4>
                        {verificationRequests.filter(r => r.status !== "pending").length === 0 ? (
                          <div className="text-center py-8 text-gray-400 text-xs italic">Belum ada riwayat verifikasi.</div>
                        ) : (
                          <div className="space-y-2">
                            {verificationRequests.filter(r => r.status !== "pending").map((req) => {
                              const isApproved = req.status === "approved";
                              return (
                                <div key={`hist_${req.id}`} className="p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <span className="font-bold text-gray-800 text-xs">{req.userName}</span>
                                      <Badge className="bg-gray-100 text-gray-700 uppercase text-[8px] font-bold">{req.role}</Badge>
                                      <Badge className={`text-[8px] font-bold ${
                                        isApproved ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700 border border-red-100"
                                      }`}>
                                        {isApproved ? "Disetujui" : "Ditolak"}
                                      </Badge>
                                    </div>
                                    <p className="text-[10px] text-gray-500 font-semibold">{req.documentName}</p>
                                    
                                    {req.ktpNumber && (
                                      <div className="flex flex-wrap gap-2 pt-1 text-[9px]">
                                        {req.ktpPhoto && (
                                          <a href={req.ktpPhoto} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                                            📄 Scan KTP
                                          </a>
                                        )}
                                        {req.selfiePhoto && (
                                          <a href={req.selfiePhoto} target="_blank" rel="noopener noreferrer" className="text-emerald-700 hover:underline">
                                            📸 Selfie
                                          </a>
                                        )}
                                        {req.documentImage && req.role !== "pendaki" && (
                                          <a href={req.documentImage} target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline">
                                            📜 Legalitas
                                          </a>
                                        )}
                                      </div>
                                    )}
                                  </div>

                                  <div className="shrink-0 flex gap-2">
                                    <Button
                                      size="xs"
                                      variant="outline"
                                      className="text-[9px] h-6 text-red-600 border-red-100 hover:bg-red-55"
                                      onClick={() => {
                                        const confirmRevoke = window.confirm(`Apakah Anda yakin ingin mencabut verifikasi untuk ${req.userName}?`);
                                        if (confirmRevoke) {
                                          revokeVerification(req.id);
                                          toast.success(`Status verifikasi ${req.userName} dicabut!`);
                                        }
                                      }}
                                    >
                                      Cabut Verifikasi
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tab Kelola Iklan/Ads (Moderation) */}
                {activeTab === "manage_ads" && (
                  <Card className="border border-gray-150 shadow-sm font-sans bg-white">
                    <CardHeader className="py-4 border-b border-gray-100">
                      <CardTitle className="text-base font-bold text-gray-800">Moderasi Iklan & Paket Pendakian (Ads)</CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Setujui atau tolak iklan paket pendakian yang dibuat oleh Guide. Paket yang disetujui akan tayang di Halaman Beranda.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      {tripPackages.length === 0 ? (
                        <p className="text-xs text-gray-400 text-center py-8">Belum ada iklan paket yang didaftarkan.</p>
                      ) : (
                        <div className="space-y-4">
                          {tripPackages.map((pkg) => {
                            const isPending = pkg.status === "pending" || !pkg.status;
                            const isApproved = pkg.status === "approved";
                            const isRejected = pkg.status === "rejected";

                            return (
                              <div key={pkg.id} className="p-4 rounded-xl border border-gray-150 bg-white flex flex-col md:flex-row justify-between items-start gap-4">
                                <div className="flex-1 flex gap-4 items-start flex-wrap sm:flex-nowrap">
                                  <img src={pkg.image} alt={pkg.title} className="w-20 h-20 object-cover rounded-lg border border-gray-100 shrink-0" />
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <h4 className="font-bold text-gray-850 text-xs sm:text-sm">{pkg.title}</h4>
                                      {isPending && <Badge className="bg-amber-100 text-amber-800 text-[8px] border border-amber-250 py-0.5 px-1.5 font-bold">Pending Approval</Badge>}
                                      {isApproved && <Badge className="bg-emerald-100 text-emerald-800 text-[8px] border border-emerald-250 py-0.5 px-1.5 font-bold">Tayang / Approved</Badge>}
                                      {isRejected && <Badge className="bg-red-100 text-red-800 text-[8px] border border-red-250 py-0.5 px-1.5 font-bold">Ditolak / Rejected</Badge>}
                                    </div>
                                    <p className="text-[10px] text-gray-400 font-semibold">⛰️ Gunung: <span className="text-gray-750 font-bold">{pkg.targetMountain}</span> | ⏱️ Durasi: <span className="text-gray-750 font-bold">{pkg.duration}</span></p>
                                    <p className="text-[10px] text-gray-450 leading-relaxed font-normal">{pkg.description}</p>
                                    <div className="flex gap-4 pt-1 text-[10px] font-semibold text-gray-500 flex-wrap">
                                      <p>🙋 Guide: <span className="text-gray-800 font-bold">{pkg.guideName}</span></p>
                                      {pkg.vendorName && <p>⛺ Vendor: <span className="text-gray-800 font-bold">{pkg.vendorName}</span></p>}
                                      <p>💰 Harga: <span className="text-emerald-700 font-bold font-mono">Rp {pkg.price.toLocaleString("id-ID")}</span></p>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-row md:flex-col gap-2 shrink-0 w-full md:w-auto justify-end md:justify-center border-t md:border-t-0 pt-2.5 md:pt-0">
                                  {isPending && (
                                    <>
                                      <Button
                                        size="sm"
                                        className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold h-8 px-3 text-white rounded-lg"
                                        onClick={() => {
                                          updateTripPackageStatus(pkg.id, "approved");
                                          toast.success(`Paket "${pkg.title}" berhasil disetujui & ditayangkan!`);
                                        }}
                                      >
                                        Setujui Iklan
                                      </Button>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="text-[10px] font-bold h-8 px-3 border-red-200 text-red-650 hover:bg-red-50 rounded-lg"
                                        onClick={() => {
                                          updateTripPackageStatus(pkg.id, "rejected");
                                          toast.error(`Paket "${pkg.title}" ditolak.`);
                                        }}
                                      >
                                        Tolak Iklan
                                      </Button>
                                    </>
                                  )}
                                  {isApproved && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="text-[10px] font-bold h-8 px-3 border-red-250 text-red-650 hover:bg-red-50 rounded-lg"
                                      onClick={() => {
                                        updateTripPackageStatus(pkg.id, "rejected");
                                        toast.warning(`Paket "${pkg.title}" diturunkan dari beranda.`);
                                      }}
                                    >
                                      Tarik Tayangan
                                    </Button>
                                  )}
                                  {isRejected && (
                                    <Button
                                      size="sm"
                                      className="bg-emerald-600 hover:bg-emerald-700 text-[10px] font-bold h-8 px-3 text-white rounded-lg"
                                      onClick={() => {
                                        updateTripPackageStatus(pkg.id, "approved");
                                        toast.success(`Paket "${pkg.title}" berhasil disetujui kembali!`);
                                      }}
                                    >
                                      Setujui & Tayangkan
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
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
                                              onClick={async () => {
                                                await resolveEscrowWithDeposit("booking", b.id, true);
                                              }}
                                            >
                                              Setujui Denda ({Math.round((b.fineAmount || 0) / 1000)}k)
                                            </Button>
                                            <Button 
                                              size="xs" 
                                              variant="outline" 
                                              className="text-[10px] h-7"
                                              onClick={async () => {
                                                await resolveEscrowWithDeposit("booking", b.id, false);
                                              }}
                                            >
                                              Abaikan Denda
                                            </Button>
                                          </>
                                        ) : (
                                          <Button 
                                            size="xs" 
                                            className={`h-7 text-[10px] ${bothConfirmed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 hover:bg-gray-500"} text-white font-semibold`}
                                            onClick={async () => {
                                              await resolveEscrowWithDeposit("booking", b.id, false);
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
                                              onClick={async () => {
                                                await resolveEscrowWithDeposit("rental", r.id, true);
                                              }}
                                            >
                                              Setujui Denda ({Math.round((r.fineAmount || 0) / 1000)}k)
                                            </Button>
                                            <Button 
                                              size="xs" 
                                              variant="outline" 
                                              className="text-[10px] h-7"
                                              onClick={async () => {
                                                await resolveEscrowWithDeposit("rental", r.id, false);
                                              }}
                                            >
                                              Abaikan Denda
                                            </Button>
                                          </>
                                        ) : (
                                          <Button 
                                            size="xs" 
                                            className={`h-7 text-[10px] ${bothConfirmed ? "bg-emerald-600 hover:bg-emerald-700" : "bg-gray-400 hover:bg-gray-500"} text-white font-semibold`}
                                            onClick={async () => {
                                              await resolveEscrowWithDeposit("rental", r.id, false);
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
                                  <p className="text-xs text-gray-500">Pendaki: <b>{b.pendakiName}</b> &nbsp;•&nbsp; Guide: <b>{b.guideName}</b> &nbsp;•&nbsp; Tarif: <b>Rp {b.price.toLocaleString()}</b></p>
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
                                  <p className="text-xs text-gray-500">Penyewa: <b>{r.pendakiName}</b> &nbsp;•&nbsp; Vendor: <b>{r.vendorName}</b> &nbsp;•&nbsp; Total Tarif: <b>Rp {r.totalPrice.toLocaleString()}</b></p>
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

                {/* Tab Sanksi & Warning (Super Admin) */}
                {activeTab === "warnings" && (
                  <Card className="border border-gray-150 shadow-sm">
                    <CardHeader>
                      <CardTitle className="text-lg">Kirim Peringatan Sanksi & Pelanggaran</CardTitle>
                      <CardDescription className="text-xs">Kirim surat peringatan resmi secara personal ke pengguna (Pendaki, Guide, Vendor). Peringatan akan tampil persisten di dashboard mereka.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <form onSubmit={(e) => {
                        e.preventDefault();
                        const fd = new FormData(e.currentTarget);
                        const targetUser = selectedUserForWarning?.id;
                        const warnText = fd.get("warnText") as string;
                        if (!targetUser || !warnText.trim()) {
                          toast.error("Wajib mencari & memilih target pengguna dari daftar serta mengisi alasan peringatan.");
                          return;
                        }
                        addWarning(targetUser, warnText);
                        toast.success("Surat peringatan berhasil dikirim!");
                        e.currentTarget.reset();
                        setSelectedUserForWarning(null);
                        setPrefilledWarningUserId("");
                        setUserSearchQuery(""); // reset search
                      }} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="relative">
                            <label className="text-xs font-semibold text-gray-700 block mb-1">Target Pengguna</label>
                            <div className="relative">
                              <input
                                type="text"
                                placeholder="Ketik nama / email untuk mencari..."
                                value={userSearchQuery}
                                onFocus={() => setIsSearchDropdownOpen(true)}
                                onChange={(e) => {
                                  setUserSearchQuery(e.target.value);
                                  setIsSearchDropdownOpen(true);
                                  if (selectedUserForWarning && e.target.value !== selectedUserForWarning.name) {
                                    setSelectedUserForWarning(null);
                                  }
                                }}
                                className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500 font-medium"
                              />
                              {selectedUserForWarning && (
                                <span className="absolute right-3 top-2.5 text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-extrabold uppercase">
                                  {selectedUserForWarning.role}
                                </span>
                              )}
                            </div>

                            {/* Autocomplete Dropdown List */}
                            {isSearchDropdownOpen && userSearchQuery.trim() !== "" && (
                              <>
                                {/* Click-away overlay */}
                                <div 
                                  className="fixed inset-0 z-40 bg-transparent" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setIsSearchDropdownOpen(false);
                                  }} 
                                />
                                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-150 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 font-sans">
                                {users.filter(u =>
                                  u.role !== "admin" && (
                                    u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                    (u.email || "").toLowerCase().includes(userSearchQuery.toLowerCase())
                                  )
                                ).length === 0 ? (
                                  <div className="p-3 text-xs text-gray-400 italic text-center">Tidak ada pengguna ditemukan.</div>
                                ) : (
                                  users.filter(u =>
                                    u.role !== "admin" && (
                                      u.name.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
                                      (u.email || "").toLowerCase().includes(userSearchQuery.toLowerCase())
                                    )
                                  ).map(u => (
                                    <button
                                      key={u.id}
                                      type="button"
                                      onClick={() => {
                                        setSelectedUserForWarning(u);
                                        setUserSearchQuery(u.name);
                                        setIsSearchDropdownOpen(false);
                                      }}
                                      className="w-full text-left p-3 hover:bg-gray-55/70 flex justify-between items-center transition-colors border-none"
                                    >
                                      <div>
                                        <p className="text-xs font-bold text-gray-800">{u.name}</p>
                                        <p className="text-[10px] text-gray-400 font-normal">{u.email}</p>
                                      </div>
                                      <Badge className="bg-gray-100 text-gray-700 uppercase text-[8px] font-bold shrink-0">{u.role}</Badge>
                                    </button>
                                  ))
                                )}
                              </div>
                              </>
                            )}
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-700 block mb-1">Pesan Sanksi / Pelanggaran</label>
                            <Input name="warnText" placeholder="Masukkan alasan pelanggaran (contoh: Membuang sampah di Ranupani, merusak tenda dome)" className="text-xs h-10" />
                          </div>
                        </div>
                        <Button type="submit" className="bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl">
                          <AlertTriangle className="size-4 mr-1.5" /> Kirim Peringatan Resmi
                        </Button>
                      </form>

                      <div className="space-y-3 pt-4 border-t border-gray-100">
                        <h4 className="text-sm font-bold text-gray-805">Daftar Sanksi Aktif</h4>
                        <div className="border border-gray-150 rounded-2xl overflow-hidden bg-white">
                          <table className="w-full text-xs text-left text-gray-500">
                            <thead className="bg-gray-50 text-[10px] text-gray-400 uppercase">
                              <tr>
                                <th scope="col" className="px-4 py-3">Nama Pengguna</th>
                                <th scope="col" className="px-4 py-3">Detail Pelanggaran</th>
                                <th scope="col" className="px-4 py-3">Tanggal Pelanggaran</th>
                                <th scope="col" className="px-4 py-3 text-right">Aksi</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                              {userWarnings.length === 0 ? (
                                <tr>
                                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400 italic">Tidak ada sanksi aktif di platform saat ini.</td>
                                </tr>
                              ) : (
                                userWarnings.map((w) => (
                                  <tr key={w.id} className="hover:bg-gray-50/50">
                                    <td className="px-4 py-3 font-bold text-gray-800">{w.userName}</td>
                                    <td className="px-4 py-3 text-red-700 font-semibold">{w.text}</td>
                                    <td className="px-4 py-3 text-gray-500">{w.date}</td>
                                    <td className="px-4 py-3 text-right">
                                      <Button size="xs" variant="outline" className="text-green-700 border-green-200 hover:bg-green-50 h-7" onClick={() => {
                                        removeWarning(w.id);
                                        toast.success("Sanksi berhasil dicabut!");
                                      }}>
                                        Cabut Sanksi
                                      </Button>
                                    </td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Tab Pesan & Pengumuman Admin (Super Admin) */}
                {activeTab === "broadcasts" && (
                  <Card className="border border-gray-150 shadow-sm bg-white font-sans">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Mail className="size-5 text-emerald-650" />
                        Pesan & Pengumuman Admin (Blast)
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        Kirim pesan pengumuman resmi ke seluruh pengguna platform sekaligus (blast) atau kirim pesan pribadi langsung ke satu pengguna spesifik.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        
                        {/* Send Message Form */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-100 pb-2">Buat Pesan Baru</h3>
                          
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-700 block">Metode Penerima</label>
                            <div className="flex gap-4">
                              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer font-semibold">
                                <input
                                  type="radio"
                                  name="broadcastTargetType"
                                  checked={blastTargetType === "all"}
                                  onChange={() => {
                                    setBlastTargetType("all");
                                    setSelectedInboxUserForBroadcast(null);
                                    setBroadcastUserSearchQuery("");
                                  }}
                                  className="accent-emerald-600 size-4"
                                />
                                📢 Semua Pengguna (Blast)
                              </label>
                              <label className="flex items-center gap-2 text-xs text-gray-700 cursor-pointer font-semibold">
                                <input
                                  type="radio"
                                  name="broadcastTargetType"
                                  checked={blastTargetType === "individual"}
                                  onChange={() => setBlastTargetType("individual")}
                                  className="accent-emerald-600 size-4"
                                />
                                👤 Pengguna Spesifik (Personal)
                              </label>
                            </div>
                          </div>

                          {blastTargetType === "individual" && (
                            <div className="relative">
                              <label className="text-xs font-semibold text-gray-700 block mb-1">Cari Target Pengguna</label>
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Ketik nama / email untuk mencari..."
                                  value={broadcastUserSearchQuery}
                                  onFocus={() => setIsBroadcastSearchDropdownOpen(true)}
                                  onChange={(e) => {
                                    setBroadcastUserSearchQuery(e.target.value);
                                    setIsBroadcastSearchDropdownOpen(true);
                                    if (selectedInboxUserForBroadcast && e.target.value !== selectedInboxUserForBroadcast.name) {
                                      setSelectedInboxUserForBroadcast(null);
                                    }
                                  }}
                                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500 font-medium"
                                />
                                {selectedInboxUserForBroadcast && (
                                  <span className="absolute right-3 top-2.5 text-[9px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-extrabold uppercase">
                                    {selectedInboxUserForBroadcast.role}
                                  </span>
                                )}
                              </div>

                              {/* Autocomplete Dropdown List */}
                              {isBroadcastSearchDropdownOpen && broadcastUserSearchQuery.trim() !== "" && (
                                <>
                                  <div 
                                    className="fixed inset-0 z-40 bg-transparent" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setIsBroadcastSearchDropdownOpen(false);
                                    }} 
                                  />
                                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-150 rounded-xl shadow-lg max-h-60 overflow-y-auto divide-y divide-gray-100 font-sans">
                                    {users.filter(u =>
                                      u.role !== "admin" && (
                                        u.name.toLowerCase().includes(broadcastUserSearchQuery.toLowerCase()) ||
                                        (u.email || "").toLowerCase().includes(broadcastUserSearchQuery.toLowerCase())
                                      )
                                    ).length === 0 ? (
                                      <div className="p-3 text-xs text-gray-400 italic text-center">Tidak ada pengguna ditemukan.</div>
                                    ) : (
                                      users.filter(u =>
                                        u.role !== "admin" && (
                                          u.name.toLowerCase().includes(broadcastUserSearchQuery.toLowerCase()) ||
                                          (u.email || "").toLowerCase().includes(broadcastUserSearchQuery.toLowerCase())
                                        )
                                      ).map(u => (
                                        <button
                                          key={u.id}
                                          type="button"
                                          onClick={() => {
                                            setSelectedInboxUserForBroadcast(u);
                                            setBroadcastUserSearchQuery(u.name);
                                            setIsBroadcastSearchDropdownOpen(false);
                                          }}
                                          className="w-full text-left p-3 hover:bg-gray-50/50 flex justify-between items-center transition-colors border-none"
                                        >
                                          <div>
                                            <p className="text-xs font-bold text-gray-800">{u.name}</p>
                                            <p className="text-[10px] text-gray-450 font-normal">{u.email}</p>
                                          </div>
                                          <Badge className="bg-gray-100 text-gray-700 uppercase text-[8px] font-bold shrink-0">{u.role}</Badge>
                                        </button>
                                      ))
                                    )}
                                  </div>
                                </>
                              )}
                            </div>
                          )}

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 block">Subjek / Judul Pesan</label>
                            <Input
                              type="text"
                              placeholder="Masukkan subjek/judul pesan..."
                              className="text-xs h-10"
                              value={broadcastTitle}
                              onChange={(e) => setBroadcastTitle(e.target.value)}
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-700 block">Isi Pesan Lengkap</label>
                            <textarea
                              rows={5}
                              placeholder="Ketik isi pesan atau pengumuman penting di sini secara lengkap..."
                              className="w-full p-3 text-xs border border-gray-200 rounded-xl bg-gray-50 focus:bg-white focus:outline-emerald-500 font-sans"
                              value={broadcastContent}
                              onChange={(e) => setBroadcastContent(e.target.value)}
                            />
                          </div>

                          <Button
                            onClick={async () => {
                              if (blastTargetType === "individual" && !selectedInboxUserForBroadcast) {
                                toast.error("Penerima personal wajib dicari & dipilih dari rekomendasi.");
                                return;
                              }
                              if (blastTargetType === "individual" && selectedInboxUserForBroadcast.id === currentUser?.id) {
                                toast.error("Anda tidak dapat mengirim pesan ke akun Anda sendiri.");
                                return;
                              }
                              if (!broadcastTitle.trim() || !broadcastContent.trim()) {
                                toast.error("Wajib mengisi judul dan isi pesan.");
                                return;
                              }
                              await sendAdminMessage(
                                blastTargetType === "individual" ? selectedInboxUserForBroadcast.id : null,
                                broadcastTitle,
                                broadcastContent
                              );
                              setBroadcastTitle("");
                              setBroadcastContent("");
                              setSelectedInboxUserForBroadcast(null);
                              setBroadcastUserSearchQuery("");
                            }}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl w-full h-10"
                          >
                            <Send className="size-4 mr-1.5" /> Kirim Pesan Sekarang
                          </Button>
                        </div>

                        {/* Sent Messages History */}
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider block border-b border-gray-100 pb-2">Riwayat Pengiriman</h3>
                          <div className="border border-gray-150 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-[460px] overflow-y-auto bg-gray-50/15">
                            {adminMessages.length === 0 ? (
                              <div className="p-8 text-center text-xs text-gray-400 italic">Belum ada riwayat pesan dikirim.</div>
                            ) : (
                              adminMessages.map(m => {
                                const isBlast = m.recipientId === null;
                                let recipientName = "Semua Pengguna (Blast)";
                                if (!isBlast) {
                                  const targetU = users.find(u => u.id === m.recipientId);
                                  recipientName = targetU ? targetU.name : "Pengguna";
                                }
                                return (
                                  <div key={m.id} className="p-3.5 space-y-2 hover:bg-gray-50/40 transition-colors bg-white">
                                    <div className="flex justify-between items-start">
                                      <div className="space-y-0.5">
                                        <h4 className="text-xs font-bold text-gray-800 line-clamp-1">{m.title}</h4>
                                        <p className="text-[10px] text-gray-450">Kepada: <b>{recipientName}</b></p>
                                      </div>
                                      <div className="flex items-center gap-1.5 shrink-0">
                                        <Badge className={`text-[8px] uppercase tracking-wider font-extrabold h-5 ${isBlast ? "bg-emerald-50 text-emerald-750" : "bg-blue-50 text-blue-750"}`}>
                                          {isBlast ? "Blast" : "Personal"}
                                        </Badge>
                                        <button
                                          onClick={async () => {
                                            if (confirm("Apakah Anda yakin ingin menghapus pesan ini?")) {
                                              await deleteAdminMessage(m.id);
                                            }
                                          }}
                                          className="p-1 hover:bg-red-50 rounded text-red-500 transition-colors"
                                        >
                                          <Trash2 className="size-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                    <p className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed whitespace-pre-wrap">{m.content}</p>
                                    <p className="text-[9px] text-gray-405 text-right">{m.createdAt}</p>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>

                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 4. Tab Reports & Analytical Charts (Recharts) */}
                {activeTab === "reports" && (() => {
                  const completedBookingsPrice = bookings.filter((b) => b.status === "Selesai").reduce((a, c) => a + c.price, 0);
                  const completedRentalsPrice = rentalOrders.filter((r) => r.status === "Selesai").reduce((a, c) => a + c.totalPrice, 0);
                  const totalRevenueCommission = Math.round((completedBookingsPrice + completedRentalsPrice) * 0.1);

                  const serverExpense = 50000;
                  const adminExpense = 30000;
                  const totalExpenses = serverExpense + adminExpense;
                  const netIncome = totalRevenueCommission - totalExpenses;

                  const escrowPending = bookings.filter(b=>["Telah Dibayar","Berangkat","Basecamp","Summit","Dispute"].includes(b.status)).reduce((a,c)=>a+c.price, 0) +
                                         rentalOrders.filter(r=>["Telah Dibayar","Sedang Disewa","Dispute"].includes(r.status)).reduce((a,c)=>a+c.totalPrice, 0);

                  return (
                    <Card className="border border-gray-150 shadow-sm">
                      <CardHeader className="pb-3 border-b border-gray-100">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div>
                            <CardTitle className="text-lg font-bold text-gray-800">ERP Laporan Keuangan Platform</CardTitle>
                            <CardDescription className="text-xs">Sistem akuntansi terpadu double-entry untuk pengelolaan keuangan AyokMendaki.</CardDescription>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {[
                              { id: "analytics", label: "Analitik", icon: <TrendingUp className="size-3.5" /> },
                              { id: "general_ledger", label: "Jurnal Umum", icon: <FileText className="size-3.5" /> },
                              { id: "profit_loss", label: "Laba Rugi", icon: <DollarSign className="size-3.5" /> },
                              { id: "balance_sheet", label: "Neraca", icon: <Building className="size-3.5" /> },
                              { id: "cash_flow", label: "Arus Kas", icon: <Activity className="size-3.5" /> }
                            ].map((t) => (
                              <Button
                                key={t.id}
                                variant={reportsSubTab === t.id ? "default" : "outline"}
                                size="sm"
                                className={`text-xs gap-1.5 h-8 font-semibold transition-all ${
                                  reportsSubTab === t.id
                                    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                    : "text-gray-650 hover:bg-gray-100 border-gray-200"
                                }`}
                                onClick={() => setReportsSubTab(t.id)}
                              >
                                {t.icon}
                                {t.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-6 space-y-6">
                        
                        {/* 1. ANALYTICS SUBTAB */}
                        {reportsSubTab === "analytics" && (
                          <div className="space-y-8 animate-in fade-in duration-200">
                            {/* Metrics cards grid */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                              {[
                                { label: "Total Transaksi", val: `Rp ${(bookings.reduce((a,c)=>a+c.price, 0) + rentalOrders.reduce((a,c)=>a+c.totalPrice, 0)).toLocaleString("id-ID")}`, color: "border-gray-200 text-gray-800" },
                                { label: "Transaksi Selesai", val: `Rp ${(bookings.filter(b=>b.status==="Selesai").reduce((a,c)=>a+c.price, 0) + rentalOrders.filter(r=>r.status==="Selesai").reduce((a,c)=>a+c.totalPrice, 0)).toLocaleString("id-ID")}`, color: "border-emerald-100 text-emerald-700 bg-emerald-50/20" },
                                { label: "Escrow Pending", val: `Rp ${escrowPending.toLocaleString("id-ID")}`, color: "border-amber-100 text-amber-700 bg-amber-50/20" },
                                { label: "Fee Platform (10%)", val: `Rp ${totalRevenueCommission.toLocaleString("id-ID")}`, color: "border-blue-100 text-blue-700 bg-blue-50/20" }
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
                          </div>
                        )}

                        {/* 2. GENERAL LEDGER SUBTAB */}
                        {reportsSubTab === "general_ledger" && (
                          <div className="space-y-4 animate-in fade-in duration-200">
                            <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Daftar Jurnal Umum (Double-Entry Ledger)</h4>
                              <Badge className="bg-emerald-100 text-emerald-800 font-bold">Total Transaksi Jurnal: {ledgerEntries.length}</Badge>
                            </div>
                            <div className="overflow-x-auto border border-gray-150 rounded-xl">
                              <table className="w-full text-xs text-left text-gray-500">
                                <thead className="text-[10px] text-gray-400 uppercase bg-gray-55/50 border-b border-gray-150">
                                  <tr>
                                    <th scope="col" className="px-4 py-3 w-32">Tanggal & ID</th>
                                    <th scope="col" className="px-4 py-3">Uraian / Keterangan</th>
                                    <th scope="col" className="px-4 py-3">Akun Debet / Kredit</th>
                                    <th scope="col" className="px-4 py-3 text-right">Debet (Rp)</th>
                                    <th scope="col" className="px-4 py-3 text-right">Kredit (Rp)</th>
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                  {ledgerEntries.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50/30">
                                      <td className="px-4 py-3 align-top font-medium text-gray-500 whitespace-nowrap">
                                        <p className="font-bold text-gray-750">{entry.date}</p>
                                        <p className="text-[9px] font-mono text-gray-400 mt-0.5">{entry.id.substring(0, 16)}</p>
                                      </td>
                                      <td className="px-4 py-3 align-top text-gray-750 font-semibold max-w-[200px] leading-relaxed">
                                        {entry.description}
                                      </td>
                                      <td className="px-4 py-3 align-top" colSpan={3}>
                                        <table className="w-full text-[11px]">
                                          <tbody>
                                            {entry.details.map((detail, dIdx) => (
                                              <tr key={dIdx} className="border-none">
                                                <td className={`py-1 ${detail.type === "credit" ? "pl-6 text-gray-500 italic" : "font-bold text-emerald-800"}`}>
                                                  {detail.account}
                                                </td>
                                                <td className="text-right py-1 w-28 font-mono font-bold text-gray-700">
                                                  {detail.type === "debit" ? `Rp ${detail.amount.toLocaleString("id-ID")}` : "-"}
                                                </td>
                                                <td className="text-right py-1 w-28 font-mono font-bold text-gray-750">
                                                  {detail.type === "credit" ? `Rp ${detail.amount.toLocaleString("id-ID")}` : "-"}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* 3. PROFIT & LOSS SUBTAB */}
                        {reportsSubTab === "profit_loss" && (
                          <div className="space-y-6 max-w-xl mx-auto p-6 border border-gray-150 rounded-2xl bg-gray-55/10 animate-in fade-in duration-200">
                            <div className="text-center border-b border-gray-200 pb-4">
                              <h4 className="text-sm font-bold text-gray-800">Laporan Laba Rugi</h4>
                              <p className="text-[10px] text-gray-400 mt-1">Periode Juni 2026 &middot; Platform AyokMendaki</p>
                            </div>
                            
                            <div className="space-y-4 text-xs font-semibold text-gray-750 font-sans">
                              {/* Pendapatan */}
                              <div className="border-b border-gray-150 pb-2">
                                <p className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">I. Pendapatan Operasional</p>
                                <div className="flex justify-between mt-2 font-medium">
                                  <span>Komisi Jasa Guide Platform (10% Selesai)</span>
                                  <span>Rp {Math.round(completedBookingsPrice * 0.1).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between mt-1 font-medium">
                                  <span>Komisi Rental Peralatan Platform (10% Selesai)</span>
                                  <span>Rp {Math.round(completedRentalsPrice * 0.1).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-gray-200 font-bold text-gray-800">
                                  <span>Total Pendapatan Bersih</span>
                                  <span>Rp {totalRevenueCommission.toLocaleString("id-ID")}</span>
                                </div>
                              </div>

                              {/* Beban */}
                              <div className="border-b border-gray-150 pb-2">
                                <p className="text-red-700 font-bold uppercase tracking-wider text-[10px]">II. Beban Operasional</p>
                                <div className="flex justify-between mt-2 font-medium">
                                  <span>Beban Sewa Cloud Server Hosting</span>
                                  <span>(Rp {serverExpense.toLocaleString("id-ID")})</span>
                                </div>
                                <div className="flex justify-between mt-1 font-medium">
                                  <span>Beban Operasional & Administrasi Kantor</span>
                                  <span>(Rp {adminExpense.toLocaleString("id-ID")})</span>
                                </div>
                                <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-gray-200 font-bold text-gray-850">
                                  <span>Total Beban Operasional</span>
                                  <span>(Rp {totalExpenses.toLocaleString("id-ID")})</span>
                                </div>
                              </div>

                              {/* Laba / Rugi Bersih */}
                              <div className="flex justify-between p-3.5 bg-emerald-600 rounded-xl text-white font-bold text-sm">
                                <span>LABA BERSIH (NET INCOME)</span>
                                <span>Rp {netIncome.toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* 4. BALANCE SHEET SUBTAB */}
                        {reportsSubTab === "balance_sheet" && (
                          <div className="space-y-6 animate-in fade-in duration-200">
                            <div className="text-center border-b border-gray-100 pb-2">
                              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">Neraca Keuangan (Balance Sheet)</h4>
                              <p className="text-[10px] text-gray-400">Posisi Keuangan Per Tanggal Hari Ini &middot; Platform AyokMendaki</p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                              {/* Aset */}
                              <div className="border border-gray-150 rounded-2xl p-4 bg-white space-y-3 shadow-xs">
                                <p className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider border-b border-gray-100 pb-2">ASET (ASSETS)</p>
                                
                                <div className="space-y-2 text-xs font-semibold text-gray-700">
                                  <div className="flex justify-between font-medium">
                                    <span>Kas & Bank Platform</span>
                                    <span className="font-mono">Rp {(climberDeposit + guideWallet + vendorWallet + netIncome).toLocaleString("id-ID")}</span>
                                  </div>
                                  <div className="flex justify-between font-medium text-gray-500 pl-4 text-[11px] border-l-2 border-emerald-100">
                                    <span>- Saldo Deposit Pendaki</span>
                                    <span className="font-mono">Rp {climberDeposit.toLocaleString("id-ID")}</span>
                                  </div>
                                  <div className="flex justify-between font-medium text-gray-500 pl-4 text-[11px] border-l-2 border-emerald-100">
                                    <span>- Saldo Dompet Mitra (Guide & Vendor)</span>
                                    <span className="font-mono font-bold">Rp {(guideWallet + vendorWallet).toLocaleString("id-ID")}</span>
                                  </div>
                                  <div className="flex justify-between font-medium text-gray-500 pl-4 text-[11px] border-l-2 border-emerald-100">
                                    <span>- Modal / Kas Laba Platform</span>
                                    <span className="font-mono">Rp {netIncome.toLocaleString("id-ID")}</span>
                                  </div>

                                  <div className="flex justify-between font-medium pt-2 border-t border-dashed border-gray-100">
                                    <span>Dana Escrow Platform (Rekening Bersama)</span>
                                    <span className="font-mono">Rp {escrowPending.toLocaleString("id-ID")}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between p-2.5 bg-emerald-50 text-emerald-800 font-bold text-xs rounded-xl border border-emerald-100 pt-2.5">
                                  <span>TOTAL ASET (TOTAL ASSETS)</span>
                                  <span className="font-mono">Rp {((climberDeposit + guideWallet + vendorWallet + netIncome) + escrowPending).toLocaleString("id-ID")}</span>
                                </div>
                              </div>

                              {/* Liabilitas & Ekuitas */}
                              <div className="border border-gray-150 rounded-2xl p-4 bg-white space-y-3 shadow-xs">
                                <p className="text-amber-700 font-bold text-[10px] uppercase tracking-wider border-b border-gray-100 pb-2">KEWAJIBAN & EKUITAS (LIABILITIES & EQUITY)</p>
                                
                                <div className="space-y-2 text-xs font-semibold text-gray-700">
                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Liabilitas Jangka Pendek</div>
                                  <div className="flex justify-between font-medium">
                                    <span>Utang Deposit Pendaki (Kewajiban)</span>
                                    <span className="font-mono">Rp {climberDeposit.toLocaleString("id-ID")}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Utang Dompet Guide & Vendor (Kewajiban)</span>
                                    <span className="font-mono font-bold">Rp {(guideWallet + vendorWallet).toLocaleString("id-ID")}</span>
                                  </div>
                                  <div className="flex justify-between font-medium">
                                    <span>Utang Escrow Titipan (Kewajiban)</span>
                                    <span className="font-mono font-bold">Rp {escrowPending.toLocaleString("id-ID")}</span>
                                  </div>

                                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider pt-2 border-t border-dashed border-gray-100">Ekuitas</div>
                                  <div className="flex justify-between font-medium">
                                    <span>Laba Ditahan / Ekuitas Platform</span>
                                    <span className="font-mono font-bold font-sans text-emerald-700">Rp {netIncome.toLocaleString("id-ID")}</span>
                                  </div>
                                </div>

                                <div className="flex justify-between p-2.5 bg-amber-50 text-amber-800 font-bold text-xs rounded-xl border border-amber-100 pt-2.5">
                                  <span>TOTAL LIABILITAS & EKUITAS</span>
                                  <span className="font-mono">Rp {(climberDeposit + (guideWallet + vendorWallet) + escrowPending + netIncome).toLocaleString("id-ID")}</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 p-3 bg-emerald-50/20 text-emerald-800 text-[10px] font-bold rounded-xl border border-emerald-100/50 justify-center">
                              <Check className="size-4 shrink-0" />
                              <span>Status Neraca: SEIMBANG (BALANCED) &middot; Persamaan Dasar Akuntansi (Aset = Kewajiban + Ekuitas) Terpenuhi.</span>
                            </div>
                          </div>
                        )}

                        {/* 5. CASH FLOW SUBTAB */}
                        {reportsSubTab === "cash_flow" && (
                          <div className="space-y-6 max-w-xl mx-auto p-6 border border-gray-150 rounded-2xl bg-gray-55/10 animate-in fade-in duration-200">
                            <div className="text-center border-b border-gray-200 pb-4">
                              <h4 className="text-sm font-bold text-gray-800">Laporan Arus Kas (Cash Flow Statement)</h4>
                              <p className="text-[10px] text-gray-400 mt-1">Periode Juni 2026 &middot; Metode Langsung (Direct Method)</p>
                            </div>
                            
                            <div className="space-y-4 text-xs font-semibold text-gray-750">
                              {/* Arus Kas dari Aktivitas Operasional */}
                              <div className="border-b border-gray-150 pb-2">
                                <p className="text-emerald-700 font-bold uppercase tracking-wider text-[10px]">1. Arus Kas dari Aktivitas Operasional</p>
                                <div className="flex justify-between mt-2 font-medium">
                                  <span>Penerimaan Komisi Transaksi Selesai (10%)</span>
                                  <span>Rp {totalRevenueCommission.toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between mt-1 font-medium">
                                  <span>Pembayaran Beban Hosting & Server Cloud</span>
                                  <span>(Rp {serverExpense.toLocaleString("id-ID")})</span>
                                </div>
                                <div className="flex justify-between mt-1 font-medium">
                                  <span>Pembayaran Beban Operasional Kantor & Admin</span>
                                  <span>(Rp {adminExpense.toLocaleString("id-ID")})</span>
                                </div>
                                <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-gray-200 font-bold text-gray-800">
                                  <span>Kas Bersih dari Aktivitas Operasional</span>
                                  <span>Rp {(totalRevenueCommission - totalExpenses).toLocaleString("id-ID")}</span>
                                </div>
                              </div>

                              {/* Arus Kas dari Aktivitas Pendanaan */}
                              <div className="border-b border-gray-150 pb-2">
                                <p className="text-amber-700 font-bold uppercase tracking-wider text-[10px]">2. Arus Kas dari Aktivitas Pendanaan (Mutasi Dompet)</p>
                                <div className="flex justify-between mt-2 font-medium">
                                  <span>Perubahan Bersih Deposit Pendaki (Top-Up vs Withdraw)</span>
                                  <span>{climberDeposit - 500000 >= 0 ? "+" : ""} Rp {(climberDeposit - 500000).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between mt-1 font-medium">
                                  <span>Perubahan Bersih Dompet Guide (Payout vs Withdraw)</span>
                                  <span>{guideWallet - 1500000 >= 0 ? "+" : ""} Rp {(guideWallet - 1500000).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between mt-1 font-medium">
                                  <span>Perubahan Bersih Dompet Vendor (Payout vs Withdraw)</span>
                                  <span>{vendorWallet - 2000000 >= 0 ? "+" : ""} Rp {(vendorWallet - 2000000).toLocaleString("id-ID")}</span>
                                </div>
                                <div className="flex justify-between mt-2 pt-2 border-t border-dashed border-gray-200 font-bold text-gray-850">
                                  <span>Kas Bersih dari Aktivitas Pendanaan</span>
                                  <span>
                                    {((climberDeposit - 500000) + (guideWallet - 1500000) + (vendorWallet - 2000000)) >= 0 ? "+" : ""} Rp {((climberDeposit - 500000) + (guideWallet - 1500000) + (vendorWallet - 2000000)).toLocaleString("id-ID")}
                                  </span>
                                </div>
                              </div>

                              {/* Rekonsiliasi Kas */}
                              <div className="space-y-1.5 pt-2 border-b border-gray-150 pb-3">
                                <div className="flex justify-between font-bold text-gray-800">
                                  <span>Kenaikan (Penurunan) Kas Bersih</span>
                                  <span>
                                    {((totalRevenueCommission - totalExpenses) + ((climberDeposit - 500000) + (guideWallet - 1500000) + (vendorWallet - 2000000))) >= 0 ? "+" : ""} Rp {((totalRevenueCommission - totalExpenses) + ((climberDeposit - 500000) + (guideWallet - 1500000) + (vendorWallet - 2000000))).toLocaleString("id-ID")}
                                  </span>
                                </div>
                                <div className="flex justify-between font-medium">
                                  <span>Kas & Setara Kas pada Awal Periode</span>
                                  <span>Rp {(4000000).toLocaleString("id-ID")}</span>
                                </div>
                              </div>

                              <div className="flex justify-between p-3.5 bg-emerald-600 rounded-xl text-white font-bold text-sm">
                                <span>KAS & SETARA KAS AKHIR PERIODE</span>
                                <span>Rp {(climberDeposit + guideWallet + vendorWallet + netIncome).toLocaleString("id-ID")}</span>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })()}

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

            {/* ════════════════════ COMMON WALLET TAB ════════════════════ */}
            {activeTab === "deposit_wallet" && (
              <Card className="border border-gray-150 shadow-sm overflow-hidden font-sans bg-white">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-100 py-5">
                  <div className="flex justify-between items-center flex-wrap gap-3">
                    <div>
                      <CardTitle className="text-lg font-bold">
                        {currentUser.role === "pendaki" ? "Dompet & Saldo Deposit Jaminan" : "Dompet Penghasilan & Saldo"}
                      </CardTitle>
                      <CardDescription className="text-xs text-gray-500">
                        {currentUser.role === "pendaki" && "Kelola saldo jaminan pendakian Anda untuk otomatisasi denda pelanggaran atau klaim kerusakan."}
                        {currentUser.role === "guide" && "Pantau pendapatan jasa trip pendakian Anda. Dana escrow dilepas otomatis setelah trip selesai."}
                        {currentUser.role === "vendor" && "Pantau pendapatan rental peralatan kemping Anda. Dana dilepas otomatis setelah barang dikembalikan."}
                      </CardDescription>
                    </div>
                    <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white font-mono px-3 py-1 font-extrabold text-sm shadow-sm flex items-center gap-1.5 rounded-xl">
                      <Wallet className="size-4 shrink-0" />
                      Rp {(currentUser.role === "pendaki" ? climberDeposit : currentUser.role === "guide" ? guideWallet : vendorWallet).toLocaleString("id-ID")}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-xs space-y-3">
                       <h4 className="text-sm font-bold text-gray-700">
                         {currentUser.role === "pendaki" ? "Manajemen Saldo Deposit" : "Penarikan Dana Penghasilan"}
                       </h4>
                       <p className="text-xs text-gray-400 leading-relaxed font-normal">
                         {currentUser.role === "pendaki" && "Saldo deposit digunakan untuk menjamin setiap pesanan booking guide atau rental. Pastikan saldo Anda selalu mencukupi (minimal Rp 100.000) sebelum melakukan pemesanan."}
                         {currentUser.role === "guide" && "Anda dapat menarik dana hasil memandu pendakian secara langsung ke rekening bank terdaftar Anda."}
                         {currentUser.role === "vendor" && "Anda dapat menarik dana hasil persewaan alat kemping secara langsung ke rekening bank terdaftar Anda."}
                       </p>
                       <div className="flex gap-2 pt-1.5">
                         {currentUser.role === "pendaki" && (
                           <Button
                             size="sm"
                             className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs flex-1 font-semibold rounded-xl h-9"
                             onClick={() => setTopUpModalOpen(true)}
                           >
                             Top Up Saldo
                           </Button>
                         )}
                         <Button
                           size="sm"
                           variant={currentUser.role === "pendaki" ? "outline" : "default"}
                           className={`text-xs flex-1 ${currentUser.role !== "pendaki" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : "border-gray-200 text-gray-700 hover:bg-gray-50"} font-semibold rounded-xl h-9`}
                           onClick={() => setWithdrawModalOpen(true)}
                         >
                           Tarik Dana
                         </Button>
                       </div>
                    </div>

                    {currentUser.role === "pendaki" ? (
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
                     ) : (
                       <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/10 space-y-2.5">
                         <h4 className="text-sm font-bold text-emerald-800 flex items-center gap-1">
                           <CheckCircle2 className="size-4 text-emerald-600 shrink-0" />
                           Ketentuan & Penarikan Dana
                         </h4>
                         <ul className="text-[11px] text-gray-600 list-disc list-inside space-y-1 font-normal leading-relaxed">
                           <li>Penarikan dana diproses fiktif secara instan ke rekening Anda.</li>
                           <li>Batas minimal penarikan adalah <b>Rp 50.000</b>.</li>
                           <li>Pendapatan dipotong fee administrasi bank Rp 0 (Gratis).</li>
                           <li>Pastikan status rekening bank Anda sudah diverifikasi oleh Super Admin.</li>
                          </ul>
                        </div>
                      )}
                    </div>

                    {/* Bank Account Management Section */}
                    <div className="mt-6 p-5 rounded-2xl border border-gray-150 bg-gray-55/40 space-y-4 font-sans text-left">
                      <div className="flex justify-between items-center flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <CreditCard className="size-5 text-emerald-600 shrink-0" />
                          <h4 className="text-sm font-bold text-gray-800">
                            Informasi Rekening Bank Penarikan (WD)
                          </h4>
                        </div>
                        {currentUser?.bank_account && !isEditingBank && (
                          <div className="flex gap-2">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-[10px] h-7 border-emerald-250 text-emerald-700 font-semibold hover:bg-emerald-50/30 animate-in fade-in"
                              onClick={() => {
                                setBankForm({
                                  bank_name: currentUser.bank_name || "",
                                  bank_account: currentUser.bank_account || "",
                                  bank_holder: currentUser.bank_holder || ""
                                });
                                setIsEditingBank(true);
                              }}
                            >
                              Edit Rekening
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="text-[10px] h-7 border-red-200 text-red-655 hover:bg-red-50 font-semibold animate-in fade-in"
                              onClick={handleDeleteBank}
                            >
                              Hapus
                            </Button>
                          </div>
                        )}
                      </div>

                      {!currentUser?.bank_account || isEditingBank ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 items-end p-4 rounded-xl bg-white border border-gray-150 animate-in fade-in duration-200">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-555 uppercase">Nama Bank</label>
                            <Input
                              placeholder="Contoh: BCA, Mandiri, BNI"
                              className="text-xs h-9 bg-gray-50"
                              value={bankForm.bank_name}
                              onChange={(e) => setBankForm({ ...bankForm, bank_name: e.target.value })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-555 uppercase">Nomor Rekening</label>
                            <Input
                              placeholder="Masukkan nomor rekening"
                              className="text-xs h-9 bg-gray-50"
                              value={bankForm.bank_account}
                              onChange={(e) => setBankForm({ ...bankForm, bank_account: e.target.value.replace(/[^0-9]/g, "") })}
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-555 uppercase">Nama Pemilik Rekening</label>
                            <Input
                              placeholder="Sesuai buku tabungan"
                              className="text-xs h-9 bg-gray-50"
                              value={bankForm.bank_holder}
                              onChange={(e) => setBankForm({ ...bankForm, bank_holder: e.target.value })}
                            />
                          </div>
                          <div className="sm:col-span-3 flex justify-end gap-2 pt-2 border-t border-gray-100 mt-2">
                            {isEditingBank && (
                              <Button
                                type="button"
                                size="sm"
                                variant="outline"
                                className="text-xs h-8 rounded-xl"
                                onClick={() => {
                                  setIsEditingBank(false);
                                  setBankForm({
                                    bank_name: currentUser.bank_name || "",
                                    bank_account: currentUser.bank_account || "",
                                    bank_holder: currentUser.bank_holder || ""
                                  });
                                }}
                              >
                                Batal
                              </Button>
                            )}
                            <Button
                              type="button"
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-8 font-semibold rounded-xl"
                              onClick={handleSaveBank}
                            >
                              Simpan Rekening
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-white border border-gray-150 grid grid-cols-3 gap-4 text-xs font-normal animate-in fade-in duration-200">
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nama Bank</p>
                            <p className="font-extrabold text-gray-800 mt-1">{currentUser.bank_name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nomor Rekening</p>
                            <p className="font-mono font-extrabold text-gray-800 mt-1">{currentUser.bank_account}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Nama Pemilik</p>
                            <p className="font-extrabold text-gray-800 mt-1">{currentUser.bank_holder}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
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

            {/* User Inbox Tab (Kotak Pesan) */}
            {activeTab === "inbox" && (
              <Card className="border border-gray-150 shadow-sm font-sans bg-white">
                <CardHeader className="border-b border-gray-100 bg-gray-50/30 py-5">
                  <CardTitle className="text-lg flex items-center gap-2 font-bold text-gray-800">
                    <Mail className="size-5 text-emerald-600 animate-pulse" />
                    Kotak Pesan & Pengumuman
                  </CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Dapatkan informasi terbaru, info pemeliharaan sistem, dan pesan bantuan langsung dari tim Admin AyokMendaki.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {adminMessages.filter(
                    (m) => m.recipientId === currentUser.id || m.recipientId === null
                  ).length === 0 ? (
                    <div className="text-center py-12 text-gray-400 text-sm italic">
                      Tidak ada pesan masuk atau pengumuman dari Admin saat ini.
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100 border border-gray-150 rounded-xl overflow-hidden shadow-sm bg-white">
                      {adminMessages
                        .filter((m) => m.recipientId === currentUser.id || m.recipientId === null)
                        .map((m) => {
                          const isBlast = m.recipientId === null;
                          return (
                            <div
                              key={m.id}
                              onClick={async () => {
                                setSelectedAdminMessageForView(m);
                                if (!m.isRead) {
                                  await markAdminMessageAsRead(m.id);
                                }
                              }}
                              className={`p-4 cursor-pointer hover:bg-emerald-50/5 transition-colors flex justify-between items-start gap-4 ${
                                !m.isRead ? "bg-emerald-50/20 font-medium" : "bg-white"
                              }`}
                            >
                              <div className="space-y-1.5 flex-1">
                                <div className="flex items-center gap-2">
                                  {!m.isRead && (
                                    <span className="size-2 rounded-full bg-emerald-600 shrink-0" />
                                  )}
                                  <h4 className={`text-sm ${!m.isRead ? "font-bold text-gray-900" : "text-gray-800"}`}>
                                    {m.title}
                                  </h4>
                                  {isBlast ? (
                                    <Badge className="bg-emerald-100 text-emerald-700 font-extrabold text-[8px] uppercase tracking-wider h-5">
                                      PENGUMUMAN
                                    </Badge>
                                  ) : (
                                    <Badge className="bg-blue-100 text-blue-700 font-extrabold text-[8px] uppercase tracking-wider h-5">
                                      PERSONAL
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{m.content}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <span className="text-[10px] text-gray-400">{m.createdAt}</span>
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Profile Tab */}
            {activeTab === "profile" && (
              <Card className="border border-gray-150 shadow-sm overflow-hidden font-sans bg-white">
                <CardHeader className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border-b border-gray-100 py-5">
                  <CardTitle className="text-lg font-bold">Profil & Pengaturan Akun</CardTitle>
                  <CardDescription className="text-xs text-gray-500">
                    Kelola data diri, verifikasi berkas KYC identitas, dan rekening bank penarikan dana.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleProfileSubmit} className="space-y-6">
                    {/* Verification Status Card */}
                    <div className="p-5 rounded-2xl border border-gray-150 bg-gray-50/35 space-y-4">
                      <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                        <UserCheck className="size-5 text-emerald-655 animate-pulse" />
                        Status Verifikasi Identitas & Dokumen
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <p className="text-xs text-gray-600 leading-relaxed font-medium">
                            Untuk keamanan ekosistem AyokMendaki, seluruh penyedia jasa wajib mengunggah NIK KTP dan Selfie identitas.
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            {currentUser.verified ? (
                              <Badge className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs py-1 px-3 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="size-4 text-emerald-600" />
                                Terverifikasi (Aktif)
                              </Badge>
                            ) : (
                              <Badge className="bg-amber-100 text-amber-800 border border-amber-250 text-xs py-1 px-3 rounded-full flex items-center gap-1">
                                <AlertTriangle className="size-4 text-amber-600 animate-pulse" />
                                Pending Verifikasi / Belum Terverifikasi
                              </Badge>
                            )}
                          </div>
                        </div>
                        {/* KYC upload display */}
                        {currentUser.role !== "admin" && (
                          <div className="bg-white p-3 rounded-xl border border-gray-100 shadow-xs space-y-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-gray-500 uppercase">Nomor NIK KTP</label>
                              <Input
                                placeholder="16 digit NIK"
                                className="text-xs h-9"
                                value={profileForm.ktpNumber}
                                onChange={(e) => setProfileForm({ ...profileForm, ktpNumber: e.target.value.replace(/[^0-9]/g, "") })}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div>
                                <input
                                  type="file"
                                  id="profile-ktp-upload"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, "ktp");
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById("profile-ktp-upload")?.click()}
                                  className={`w-full text-[10px] h-9 border-dashed flex items-center justify-center gap-1 truncate ${
                                    isUploadingKtp 
                                      ? "border-amber-300 text-amber-800 bg-amber-50/30" 
                                      : ktpUploadError
                                      ? "border-red-300 text-red-800 bg-red-50/30"
                                      : profileForm.ktpPhotoUrl
                                      ? "border-emerald-500 text-emerald-800 bg-emerald-50/30 font-semibold"
                                      : "border-emerald-300 text-emerald-850 hover:bg-emerald-50/20"
                                  }`}
                                >
                                  {isUploadingKtp ? (
                                    <>
                                      <Loader2 className="size-3.5 animate-spin text-amber-600 animate-duration-1000" />
                                      <span>Diproses...</span>
                                    </>
                                  ) : ktpUploadError ? (
                                    <>
                                      <AlertTriangle className="size-3.5 text-red-650" />
                                      <span>Gagal</span>
                                    </>
                                  ) : profileForm.ktpPhotoUrl ? (
                                    <>
                                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                                      <span>Selesai</span>
                                    </>
                                  ) : (
                                    <span>Unggah KTP</span>
                                  )}
                                </Button>
                              </div>
                              <div>
                                <input
                                  type="file"
                                  id="profile-selfie-upload"
                                  className="hidden"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) handleFileUpload(file, "selfie");
                                  }}
                                />
                                <Button
                                  type="button"
                                  variant="outline"
                                  onClick={() => document.getElementById("profile-selfie-upload")?.click()}
                                  className={`w-full text-[10px] h-9 border-dashed flex items-center justify-center gap-1 truncate ${
                                    isUploadingSelfie 
                                      ? "border-amber-300 text-amber-800 bg-amber-50/30" 
                                      : selfieUploadError
                                      ? "border-red-300 text-red-800 bg-red-50/30"
                                      : profileForm.selfiePhotoUrl
                                      ? "border-emerald-500 text-emerald-800 bg-emerald-50/30 font-semibold"
                                      : "border-emerald-300 text-emerald-850 hover:bg-emerald-50/20"
                                  }`}
                                >
                                  {isUploadingSelfie ? (
                                    <>
                                      <Loader2 className="size-3.5 animate-spin text-amber-600 animate-duration-1000" />
                                      <span>Diproses...</span>
                                    </>
                                  ) : selfieUploadError ? (
                                    <>
                                      <AlertTriangle className="size-3.5 text-red-650" />
                                      <span>Gagal</span>
                                    </>
                                  ) : profileForm.selfiePhotoUrl ? (
                                    <>
                                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                                      <span>Selesai</span>
                                    </>
                                  ) : (
                                    <span>Unggah Selfie</span>
                                  )}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column: Personal Info & Passwords */}
                      <div className="space-y-4">
                        <h4 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Informasi Akun</h4>
                        
                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700">Nama Lengkap</label>
                          <Input
                            placeholder="Nama Lengkap"
                            className="text-xs h-9"
                            value={profileForm.name}
                            onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700">Alamat Email (Read-Only)</label>
                          <Input
                            disabled
                            className="text-xs h-9 bg-gray-50 text-gray-400"
                            value={currentUser.email}
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-semibold text-gray-700">Nomor Telepon (WhatsApp)</label>
                          <Input
                            placeholder="08123456789"
                            className="text-xs h-9"
                            value={profileForm.phone}
                            onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-gray-750">Ubah Kata Sandi (Opsional)</label>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              type="password"
                              placeholder="Password Baru"
                              className="text-xs h-9"
                              value={profileForm.password}
                              onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })}
                            />
                            <Input
                              type="password"
                              placeholder="Konfirmasi"
                              className="text-xs h-9"
                              value={profileForm.confirmPassword}
                              onChange={(e) => setProfileForm({ ...profileForm, confirmPassword: e.target.value })}
                            />
                          </div>
                        </div>

                        {/* Bank Details section */}
                        <div className="pt-2">
                          <label className="text-xs font-bold text-gray-700 block mb-2">Informasi Rekening Bank Penarikan</label>
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 p-3 bg-gray-55/65 rounded-xl border border-gray-150">
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-gray-450 uppercase">Bank</span>
                              <Input
                                placeholder="BCA/Mandiri"
                                className="text-[10px] h-8"
                                value={profileForm.bank_name}
                                onChange={(e) => setProfileForm({ ...profileForm, bank_name: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-gray-450 uppercase">No. Rekening</span>
                              <Input
                                placeholder="1234567"
                                className="text-[10px] h-8"
                                value={profileForm.bank_account}
                                onChange={(e) => setProfileForm({ ...profileForm, bank_account: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <span className="text-[9px] font-bold text-gray-450 uppercase">Pemilik</span>
                              <Input
                                placeholder="Nama Pemilik"
                                className="text-[10px] h-8"
                                value={profileForm.bank_holder}
                                onChange={(e) => setProfileForm({ ...profileForm, bank_holder: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Right Column: Custom Guide / Vendor settings */}
                      <div className="space-y-4">
                        {currentUser.role === "guide" && (
                          <>
                            <h4 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Pengaturan Profesional Guide</h4>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Gunung Spesialisasi</label>
                                <Input
                                  placeholder="Contoh: Gn. Semeru"
                                  className="text-xs h-9"
                                  value={profileForm.specialty}
                                  onChange={(e) => setProfileForm({ ...profileForm, specialty: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-xs font-semibold text-gray-700">Pengalaman (Tahun)</label>
                                <Input
                                  type="number"
                                  placeholder="Contoh: 5"
                                  className="text-xs h-9"
                                  value={profileForm.experience}
                                  onChange={(e) => setProfileForm({ ...profileForm, experience: e.target.value })}
                                />
                              </div>
                              <div className="space-y-1 col-span-2">
                                <label className="text-xs font-semibold text-gray-700">Tarif Layanan Harian (Rp)</label>
                                <Input
                                  type="number"
                                  placeholder="Contoh: 400000"
                                  className="text-xs h-9"
                                  value={profileForm.price}
                                  onChange={(e) => setProfileForm({ ...profileForm, price: e.target.value })}
                                />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-700">Biodata Singkat</label>
                              <textarea
                                placeholder="Tuliskan perkenalan singkat Anda..."
                                className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500 h-20 resize-none"
                                value={profileForm.biodata}
                                onChange={(e) => setProfileForm({ ...profileForm, biodata: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-700">Ketentuan Layanan Jasa</label>
                              <textarea
                                placeholder="Contoh: Maksimal rombongan 5 orang, sewa minimal 2 hari..."
                                className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500 h-20 resize-none"
                                value={profileForm.ketentuan}
                                onChange={(e) => setProfileForm({ ...profileForm, ketentuan: e.target.value })}
                              />
                            </div>
                            {/* Coupon Setup */}
                            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/15 space-y-3">
                              <h5 className="text-xs font-extrabold text-emerald-850">Manajemen Kupon Diskon Layanan</h5>
                              <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Kode Kupon</label>
                                  <Input
                                    placeholder="Contoh: GUIDEMURAH"
                                    className="text-xs h-8 font-mono font-bold"
                                    value={profileForm.couponCode}
                                    onChange={(e) => setProfileForm({ ...profileForm, couponCode: e.target.value.toUpperCase().replace(/\s/g, "") })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Potongan Diskon (Rp)</label>
                                  <Input
                                    type="number"
                                    placeholder="Contoh: 50000"
                                    className="text-xs h-8"
                                    value={profileForm.couponDiscount}
                                    onChange={(e) => setProfileForm({ ...profileForm, couponDiscount: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Tanggal Kedaluwarsa Kupon</label>
                                  <Input
                                    type="date"
                                    className="text-xs h-8"
                                    value={profileForm.couponDeadline}
                                    onChange={(e) => setProfileForm({ ...profileForm, couponDeadline: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {currentUser.role === "vendor" && (
                          <>
                            <h4 className="text-sm font-bold text-gray-800 border-b border-gray-100 pb-2">Informasi Toko Vendor</h4>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-700">Nama Toko Rental</label>
                              <Input
                                placeholder="Nama Toko"
                                className="text-xs h-9"
                                value={profileForm.storeName}
                                onChange={(e) => setProfileForm({ ...profileForm, storeName: e.target.value })}
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-semibold text-gray-700">Alamat Fisik Toko</label>
                              <Input
                                placeholder="Kota Malang, Jawa Timur"
                                className="text-xs h-9"
                                value={profileForm.address}
                                onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                              />
                            </div>
                            {/* Coupon Setup */}
                            <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/15 space-y-3 pt-4">
                              <h5 className="text-xs font-extrabold text-emerald-850">Manajemen Kupon Diskon Sewa</h5>
                              <div className="grid grid-cols-2 gap-2.5">
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Kode Kupon Toko</label>
                                  <Input
                                    placeholder="Contoh: SEWAHEMAT"
                                    className="text-xs h-8 font-mono font-bold"
                                    value={profileForm.couponCode}
                                    onChange={(e) => setProfileForm({ ...profileForm, couponCode: e.target.value.toUpperCase().replace(/\s/g, "") })}
                                  />
                                </div>
                                <div className="space-y-1">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Potongan Diskon (Rp)</label>
                                  <Input
                                    type="number"
                                    placeholder="Contoh: 20000"
                                    className="text-xs h-8"
                                    value={profileForm.couponDiscount}
                                    onChange={(e) => setProfileForm({ ...profileForm, couponDiscount: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-1 col-span-2">
                                  <label className="text-[10px] font-bold text-gray-500 uppercase">Tanggal Kedaluwarsa Kupon</label>
                                  <Input
                                    type="date"
                                    className="text-xs h-8"
                                    value={profileForm.couponDeadline}
                                    onChange={(e) => setProfileForm({ ...profileForm, couponDeadline: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                          </>
                        )}

                        {currentUser.role === "pendaki" && (
                          <div className="p-4 rounded-2xl bg-blue-50/20 border border-blue-100 text-xs text-blue-900 space-y-2">
                            <h5 className="font-extrabold flex items-center gap-1"><Shield className="size-4 shrink-0 text-blue-650 animate-pulse" /> Perlindungan Data & KYC Pendaki</h5>
                            <p className="font-medium leading-relaxed">Data KTP dan selfie wajah Anda dienkripsi secara aman dan hanya dapat diakses oleh Super Admin untuk keperluan validasi asuransi pendakian dan pencocokan basecamp gunung.</p>
                          </div>
                        )}
                        
                        {currentUser.role === "admin" && (
                          <div className="p-4 rounded-2xl bg-purple-50/20 border border-purple-100 text-xs text-purple-900 space-y-2">
                            <h5 className="font-extrabold flex items-center gap-1"><Shield className="size-4 shrink-0 text-purple-650" /> Pengamanan Super Admin</h5>
                            <p className="font-medium leading-relaxed">Sebagai administrator utama platform, Anda memiliki akses penuh ke seluruh direktori database. Pastikan untuk selalu menjaga keamanan kredensial akun Anda.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                      <Button
                        type="submit"
                        disabled={profileLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-6 h-9 rounded-xl shadow-sm"
                      >
                        {profileLoading ? "Menyimpan Perubahan..." : "Simpan Profil Saya"}
                      </Button>
                    </div>
                  </form>
                </CardContent>
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
              Tulis ulasan Anda untuk <b>{reviewItem.name}</b>. Ulasan Anda bersifat transparan untuk membantu pendaki lainnya.
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
              Ajukan klaim perselisihan atas pesanan <b>{disputeItem.id}</b> jika Mitra tidak memenuhi kewajiban trip atau barang sewaan tidak sesuai deskripsi.
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
                <p>Harga Normal Jasa: <b>Rp {counterNego.originalPrice.toLocaleString()}</b></p>
                <p>Tawaran Awal Pendaki: <b>Rp {counterNego.proposedPrice.toLocaleString()}</b></p>
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
              Sesuaikan info tiket resmi untuk <b>{editingMountain.name}</b>. Perubahan ini akan langsung diperbarui pada halaman informasi gunung bagi Pendaki.
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
              Laporkan kerusakan atau unit hilang untuk pesanan sewa <b>{fineTargetId}</b>. Klaim ini akan diverifikasi oleh Super Admin dan otomatis dipotong dari dana deposit Pendaki.
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
      {/* Simulated Payment Gateway Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl relative border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-6 relative">
              <button 
                onClick={handlePaymentGatewayCancel}
                className="absolute top-5 right-5 p-1 rounded-full bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                <X className="size-4" />
              </button>
              <div className="flex items-center gap-2 mb-2">
                <div className="bg-emerald-500 rounded-lg p-1.5 shrink-0">
                  <MountainIcon className="size-5 text-slate-950 font-bold" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-200">Secure Payment Gateway</h3>
                  <p className="text-[10px] text-emerald-400 font-semibold">AyokMendaki Escrow System</p>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-end">
                <div>
                  <p className="text-[10px] text-slate-400 font-medium">TOTAL PEMBAYARAN</p>
                  <p className="text-2xl font-black text-emerald-400 font-mono">Rp {paymentGatewayAmount.toLocaleString("id-ID")}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 font-medium">ORDER ID</p>
                  <p className="text-xs font-bold font-mono text-slate-200">AM-TOPUP-{Math.random().toString(36).substring(2, 8).toUpperCase()}</p>
                </div>
              </div>
            </div>
            
            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              {/* Payment Methods Tabs */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">Pilih Metode Pembayaran</label>
                <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-200">
                  {[
                    { id: "qris", label: "QRIS / E-Wallet", icon: "📱" },
                    { id: "va", label: "Virtual Account", icon: "🏦" },
                    { id: "cc", label: "Kartu Kredit", icon: "💳" }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setPaymentGatewayMethod(m.id as any)}
                      className={`py-2 px-1 rounded-lg text-center text-xs font-bold transition-all ${
                        paymentGatewayMethod === m.id 
                          ? "bg-white text-slate-900 shadow-sm border border-slate-200/50" 
                          : "text-slate-500 hover:text-slate-850"
                      }`}
                    >
                      <div className="text-lg mb-0.5">{m.icon}</div>
                      <div>{m.label}</div>
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Payment Method Details */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex-1">
                {paymentGatewayMethod === "qris" && (
                  <div className="text-center space-y-3">
                    <p className="text-xs font-bold text-slate-700">Scan Kode QR menggunakan GoPay, ShopeePay, Dana, dll.</p>
                    <div className="inline-block bg-white p-3 rounded-2xl border border-slate-150/50 shadow-xs">
                      {/* SVG mockup of QR code */}
                      <svg width="150" height="150" viewBox="0 0 100 100" className="mx-auto">
                        <rect width="100" height="100" fill="white" />
                        <rect x="5" y="5" width="25" height="25" fill="#1e293b" />
                        <rect x="10" y="10" width="15" height="15" fill="white" />
                        <rect x="12" y="12" width="11" height="11" fill="#10b981" />
                        
                        <rect x="70" y="5" width="25" height="25" fill="#1e293b" />
                        <rect x="75" y="10" width="15" height="15" fill="white" />
                        <rect x="77" y="12" width="11" height="11" fill="#10b981" />
                        
                        <rect x="5" y="70" width="25" height="25" fill="#1e293b" />
                        <rect x="10" y="75" width="15" height="15" fill="white" />
                        <rect x="12" y="77" width="11" height="11" fill="#10b981" />
                        
                        <path d="M 40 10 H 50 V 20 H 40 Z M 55 5 H 65 V 15 H 55 Z M 45 30 H 60 V 35 H 45 Z M 10 40 H 20 V 45 H 10 Z M 30 50 H 35 V 60 H 30 Z M 40 45 H 55 V 55 H 40 Z M 60 40 H 75 V 50 H 60 Z M 80 40 H 90 V 60 H 80 Z M 70 70 H 85 V 80 H 70 Z M 80 80 H 95 V 95 H 80 Z M 45 70 H 60 V 90 H 45 Z M 20 85 H 35 V 95 H 20 Z" fill="#334155" />
                        <path d="M 40 25 H 45 V 30 H 40 Z M 50 60 H 55 V 65 H 50 Z" fill="#10b981" />
                      </svg>
                    </div>
                    <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-emerald-600 animate-pulse">
                      <span className="inline-block size-2 rounded-full bg-emerald-500"></span>
                      <span>Menunggu Pembayaran Dipindai...</span>
                    </div>
                  </div>
                )}
                
                {paymentGatewayMethod === "va" && (
                  <div className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Pilih Bank Penerima</label>
                      <div className="grid grid-cols-4 gap-2">
                        {["BCA", "Mandiri", "BNI", "BRI"].map(b => (
                          <button
                            key={b}
                            type="button"
                            onClick={() => setPaymentGatewayBank(b.toLowerCase() as any)}
                            className={`py-1.5 rounded-lg border text-center text-xs font-bold transition-all ${
                              paymentGatewayBank === b.toLowerCase() 
                                ? "bg-emerald-50 text-emerald-800 border-emerald-300" 
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            {b}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="p-3 bg-white rounded-xl border border-slate-200/50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-slate-400">NOMOR VIRTUAL ACCOUNT</span>
                        <Badge className="bg-slate-100 text-slate-700 text-[9px]">Salin</Badge>
                      </div>
                      <p className="text-sm font-black font-mono tracking-widest text-slate-800">
                        {paymentGatewayBank === "bca" ? "880123456789" :
                         paymentGatewayBank === "mandiri" ? "900123456789" :
                         paymentGatewayBank === "bni" ? "827123456789" : "112123456789"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">Batas Pembayaran: 23 jam dari sekarang.</p>
                    </div>
                  </div>
                )}
                
                {paymentGatewayMethod === "cc" && (
                  <div className="space-y-3 font-sans">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-0.5">NOMOR KARTU</label>
                      <Input placeholder="4111 2222 3333 4444" className="text-xs h-9 bg-white font-mono" />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">EXPIRED DATE</label>
                        <Input placeholder="MM/YY" className="text-xs h-9 bg-white font-mono" />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-0.5">CVV</label>
                        <Input type="password" placeholder="***" className="text-xs h-9 bg-white font-mono" maxLength={3} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Payment Gateway Actions */}
              <div className="space-y-2.5">
                <Button 
                  onClick={handlePaymentGatewaySuccess}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 rounded-xl shadow-md flex items-center justify-center gap-1.5 animate-pulse"
                >
                  Simulasikan Pembayaran Sukses
                </Button>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handlePaymentGatewayCancel}
                    className="flex-1 border-red-200 text-red-600 hover:bg-red-50 font-bold text-xs h-10 rounded-xl"
                  >
                    Simulasikan Gagal
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handlePaymentGatewayCancel}
                    className="flex-1 border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold text-xs h-10 rounded-xl"
                  >
                    Batal
                  </Button>
                </div>
              </div>
              
            </div>
            
            {/* Footer note */}
            <div className="bg-slate-50 border-t border-slate-100 px-6 py-4 text-center">
              <p className="text-[9px] text-slate-400 font-medium">Platform AyokMendaki bermitra resmi dengan Midtrans & Xendit Indonesia. Seluruh data transaksi dilindungi enkripsi SSL 256-bit.</p>
            </div>
            
          </div>
        </div>
      )}

      {/* 9. Withdraw Deposit Modal */}
      {withdrawModalOpen && (() => {
        const currentBalance = 
          currentUser?.role === "pendaki" ? climberDeposit :
          currentUser?.role === "guide" ? guideWallet : vendorWallet;
        return (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
              <button onClick={() => setWithdrawModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
                <X className="size-5" />
              </button>
              <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
                <Wallet className="size-6 text-emerald-600 shrink-0" />
                <h3 className="text-lg">Tarik Dana & Saldo</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed font-normal">
                Tarik dana deposit atau penghasilan Anda ke rekening bank terdaftar. Maksimal penarikan: <b>Rp {currentBalance.toLocaleString("id-ID")}</b>.
              </p>

              {!currentUser?.bank_account ? (
                <div className="space-y-4">
                  <div className="p-4 bg-amber-50 border border-amber-250 rounded-xl text-xs text-amber-800 space-y-1.5">
                    <p className="font-extrabold flex items-center gap-1"><AlertTriangle className="size-4 shrink-0" /> Rekening Bank Belum Diatur</p>
                    <p className="font-medium leading-relaxed">Anda harus mendaftarkan nomor rekening bank Anda terlebih dahulu di bagian **Informasi Rekening** sebelum dapat melakukan penarikan dana.</p>
                  </div>
                  <Button className="w-full text-xs bg-gray-100 text-gray-450 cursor-not-allowed" disabled>Penarikan Dinonaktifkan</Button>
                </div>
              ) : (
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
                        max={currentBalance}
                        step={10000}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2.5 pt-2">
                    <Button type="button" variant="outline" className="flex-1 text-xs rounded-xl" onClick={() => setWithdrawModalOpen(false)}>Batal</Button>
                    <Button type="submit" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl" disabled={isProcessingWd}>
                      {isProcessingWd ? "Memproses Transfer..." : "Konfirmasi Penarikan"}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        );
      })()}
      {/* 10. Collaboration Proposal Submission Modal */}
      {collabModalOpen && selectedCollabPartner && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <button onClick={() => setCollabModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3 border-b border-gray-100 pb-2">
              <Award className="size-6 text-emerald-600 shrink-0 animate-pulse" />
              <div>
                <h3 className="text-lg">Ajukan Kerjasama & Make a Deal</h3>
                <p className="text-[10px] text-gray-400 font-normal leading-tight">Buat proposal promo paket pendakian terintegrasi dengan partner.</p>
              </div>
            </div>

            <form onSubmit={handleSaveCollabProposal} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Judul Paket Kerjasama</label>
                  <Input
                    required
                    className="text-xs font-semibold"
                    placeholder="Contoh: Open Trip Merbabu Super Bundling"
                    value={collabForm.title}
                    onChange={(e) => setCollabForm({ ...collabForm, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Target Gunung</label>
                  <select
                    className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500 font-semibold"
                    value={collabForm.targetMountain}
                    onChange={(e) => setCollabForm({ ...collabForm, targetMountain: e.target.value })}
                  >
                    {mountains.map((m) => (
                      <option key={m.name} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Durasi Rencana Trip</label>
                  <Input
                    required
                    className="text-xs font-semibold"
                    placeholder="Contoh: 3 Hari 2 Malam"
                    value={collabForm.duration}
                    onChange={(e) => setCollabForm({ ...collabForm, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 block mb-1">Total Harga Paket Promo (Rp)</label>
                  <Input
                    required
                    type="number"
                    className="text-xs font-bold font-mono text-emerald-700"
                    placeholder="Contoh: 1200000"
                    value={collabForm.price}
                    onChange={(e) => setCollabForm({ ...collabForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Pilih Alat Kemping yang Di-bundle</label>
                <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto border border-gray-150 rounded-lg p-2.5 bg-gray-55/40 rounded-xl">
                  {(() => {
                    const partnerId = currentUser.role === "guide" ? selectedCollabPartner.id : currentUser.id;
                    const partnerEq = equipment.filter(eq => eq.vendorId === partnerId);
                    if (partnerEq.length === 0) return <p className="text-[10px] text-gray-400 col-span-2 text-center py-4">Tidak ada barang katalog.</p>;
                    return partnerEq.map((item) => (
                      <label key={item.id} className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          checked={collabForm.bundledEquipmentIds.includes(item.id)}
                          onChange={(e) => {
                            const ids = e.target.checked
                              ? [...collabForm.bundledEquipmentIds, item.id]
                              : collabForm.bundledEquipmentIds.filter((id) => id !== item.id);
                            setCollabForm({ ...collabForm, bundledEquipmentIds: ids });
                          }}
                        />
                        <span>{item.name} (Rp {item.price.toLocaleString("id-ID")})</span>
                      </label>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Deskripsi Paket Rencana Perjalanan</label>
                <textarea
                  required
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 h-16 resize-none"
                  placeholder="Ceritakan detail trip dan fasilitas lainnya..."
                  value={collabForm.description}
                  onChange={(e) => setCollabForm({ ...collabForm, description: e.target.value })}
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Mekanisme Serah Terima & Sewa Alat</label>
                <textarea
                  required
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 h-16 resize-none font-semibold text-emerald-800"
                  placeholder="Bagaimana alat rental dikirim/diambil dan denda jika rusak..."
                  value={collabForm.rentalMechanism}
                  onChange={(e) => setCollabForm({ ...collabForm, rentalMechanism: e.target.value })}
                />
              </div>

              <div className="flex gap-2.5 pt-2">
                <Button type="button" variant="outline" className="flex-1 text-xs" onClick={() => setCollabModalOpen(false)}>Batal</Button>
                <Button type="submit" className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">Ajukan Penawaran Deal</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 11. Transaction Receipt / Invoice Modal */}
      {receiptModalOpen && receiptData && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200 no-print">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl relative border border-gray-100 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col print-receipt-container max-h-[90vh]">
            
            {/* Modal Actions Header - hidden on print */}
            <div className="bg-gray-50 border-b border-gray-100 px-6 py-4 flex items-center justify-between no-print">
              <h3 className="font-bold text-gray-800 text-sm">Resi Pembayaran Resmi</h3>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  onClick={() => window.print()} 
                  className="bg-emerald-600 hover:bg-emerald-700 text-xs text-white font-bold rounded-xl"
                >
                  Cetak / Simpan PDF
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => {
                    setReceiptModalOpen(false);
                    setReceiptData(null);
                  }}
                  className="text-xs border-gray-200 rounded-xl"
                >
                  Tutup
                </Button>
              </div>
            </div>

            {/* Print Styling Injection */}
            <style dangerouslySetInnerHTML={{__html: `
              @media print {
                body * {
                  visibility: hidden !important;
                }
                .print-receipt-container, .print-receipt-container * {
                  visibility: visible !important;
                }
                .print-receipt-container {
                  position: absolute !important;
                  left: 0 !important;
                  top: 0 !important;
                  width: 100% !important;
                  max-width: 100% !important;
                  height: auto !important;
                  border: none !important;
                  box-shadow: none !important;
                  background: white !important;
                  color: black !important;
                  margin: 0 !important;
                  padding: 10mm !important;
                }
                .no-print {
                  display: none !important;
                }
              }
            `}} />

            {/* Receipt Printable Contents */}
            <div className="p-6 md:p-8 space-y-6 flex-1 overflow-y-auto bg-white text-gray-800">
              
              {/* Receipt Header */}
              <div className="text-center border-b border-dashed border-gray-200 pb-5">
                <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 font-extrabold px-3 py-1 rounded-full text-xs mb-3 border border-emerald-100">
                  <MountainIcon className="size-3.5 text-emerald-650" />
                  <span>AYOKMENDAKI</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">KUITANSI PEMBAYARAN RESMI</h2>
                <p className="text-[10px] text-gray-400 mt-1 uppercase font-semibold">No. Invoice: {receiptData.id}</p>
                <p className="text-[10px] text-gray-400 font-semibold">Tanggal Cetak: {new Date(receiptData.date).toLocaleString("id-ID")}</p>
              </div>

              {/* Receipt Info Body */}
              <div className="space-y-4">
                
                {/* Meta info */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-gray-50/50 p-4 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Tipe Transaksi</span>
                    <span className="font-bold text-gray-800 uppercase">{receiptData.type}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Status</span>
                    <span className="font-extrabold text-emerald-600 flex items-center gap-1">
                      <span className="size-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      SUKSES / PAID
                    </span>
                  </div>
                  <div className="col-span-2 border-t border-gray-100 pt-2 mt-1">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block">Deskripsi</span>
                    <span className="font-semibold text-gray-700">{receiptData.description || "Pembayaran Layanan AyokMendaki"}</span>
                  </div>
                </div>

                {/* Party Details */}
                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Dibayar Oleh:</span>
                    <span className="font-extrabold text-gray-900 block">{receiptData.senderName || "Pendaki / Member"}</span>
                    <span className="text-[10px] text-gray-400 font-normal">Pengguna Terdaftar AyokMendaki</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 uppercase font-bold block mb-1">Diterima Oleh:</span>
                    <span className="font-extrabold text-gray-900 block">{receiptData.recipientName || "Platform AyokMendaki"}</span>
                    <span className="text-[10px] text-gray-400 font-normal">{receiptData.type === "topup" ? "Virtual Gateway Receiver" : "Mitra Penyedia Jasa"}</span>
                  </div>
                </div>

                {/* Amount breakdown table */}
                <div className="border border-gray-150 rounded-2xl overflow-hidden mt-4">
                  <div className="bg-gray-50 px-4 py-2 text-[10px] text-gray-500 font-bold uppercase tracking-wider flex justify-between border-b border-gray-100">
                    <span>Rincian Transaksi</span>
                    <span>Subtotal</span>
                  </div>
                  <div className="divide-y divide-gray-100 bg-white">
                    <div className="px-4 py-3 flex justify-between text-xs">
                      <div>
                        <span className="font-bold text-gray-800">{receiptData.description || "Biaya Layanan"}</span>
                        {receiptData.details && <span className="text-[10px] text-gray-450 block font-normal mt-0.5">{receiptData.details}</span>}
                      </div>
                      <span className="font-bold font-mono text-gray-755">Rp {receiptData.amount.toLocaleString("id-ID")}</span>
                    </div>
                    {receiptData.type === "booking" && (
                      <div className="px-4 py-2 flex justify-between text-[11px] text-gray-500">
                        <span>Platform Escrow Fee</span>
                        <span className="font-mono">Rp 0 (FREE)</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-emerald-50/50 px-4 py-3 border-t border-gray-150 flex justify-between items-center">
                    <span className="text-xs font-extrabold text-emerald-800">TOTAL DIBAYARKAN</span>
                    <span className="text-sm font-black font-mono text-emerald-700">Rp {receiptData.amount.toLocaleString("id-ID")}</span>
                  </div>
                </div>

              </div>

              {/* Receipt Footer */}
              <div className="text-center pt-5 border-t border-dashed border-gray-200">
                <p className="text-[10px] text-gray-400 font-semibold leading-relaxed">
                  Ini adalah kuitansi digital sah yang diterbitkan oleh sistem AyokMendaki. Seluruh transaksi bersifat final, aman, dan dilindungi oleh garansi jaminan deposit escrow.
                </p>
                <div className="mt-4 flex items-center justify-center gap-1.5 text-[9px] font-bold text-emerald-750">
                  <CheckCircle2 className="size-3 text-emerald-600" />
                  <span>PROSES TRANSAKSI 100% AMAN &amp; VERIFIED</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {/* 12. Manual Add User Modal */}
      {manualUserModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setManualUserModalOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400"
            >
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <UserCheck className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Tambah Pengguna Baru</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-normal">
              Buat akun pengguna baru (Pendaki, Tour Guide, atau Vendor) secara manual. Akun akan langsung aktif dan terdaftar di database.
            </p>
            <form onSubmit={handleCreateManualUserSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nama Lengkap</label>
                <Input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  className="text-xs"
                  value={manualUserForm.name}
                  onChange={(e) => setManualUserForm({ ...manualUserForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Alamat Email</label>
                <Input
                  type="email"
                  required
                  placeholder="Contoh: budi@gmail.com"
                  className="text-xs"
                  value={manualUserForm.email}
                  onChange={(e) => setManualUserForm({ ...manualUserForm, email: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nomor Telepon / WA</label>
                <Input
                  type="tel"
                  required
                  placeholder="Contoh: 08123456789"
                  className="text-xs"
                  value={manualUserForm.phone}
                  onChange={(e) => setManualUserForm({ ...manualUserForm, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Pilih Peran (Role)</label>
                <select
                  className="w-full p-2.5 text-xs border border-gray-200 rounded-lg bg-gray-50 focus:bg-white focus:outline-emerald-500"
                  value={manualUserForm.role}
                  onChange={(e) => setManualUserForm({ ...manualUserForm, role: e.target.value as UserRole })}
                >
                  <option value="pendaki">Pendaki</option>
                  <option value="guide">Tour Guide (Pemandu)</option>
                  <option value="vendor">Vendor Rental Alat</option>
                </select>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="manualVerified"
                  checked={manualUserForm.verified}
                  onChange={(e) => setManualUserForm({ ...manualUserForm, verified: e.target.checked })}
                  className="size-4 rounded border-gray-300 accent-emerald-600"
                />
                <label htmlFor="manualVerified" className="text-xs text-gray-700 font-semibold cursor-pointer">
                  Tandai Akun sebagai Terverifikasi Langsung (Verified)
                </label>
              </div>
              <div className="flex gap-2.5 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 text-xs rounded-xl"
                  onClick={() => setManualUserModalOpen(false)}
                >
                  Batal
                </Button>
                <Button
                  type="submit"
                  className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl"
                >
                  Simpan Pengguna
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal View Admin Message */}
      {selectedAdminMessageForView && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-gray-150 overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Mail className="size-5 text-emerald-600 animate-pulse" />
                <span className="font-bold text-sm text-gray-850">Detail Pesan Masuk</span>
              </div>
              <button
                onClick={() => setSelectedAdminMessageForView(null)}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="size-5 text-gray-500" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-base font-extrabold text-gray-900">{selectedAdminMessageForView.title}</h3>
                  {selectedAdminMessageForView.recipientId === null ? (
                    <Badge className="bg-emerald-100 text-emerald-700 text-[8px] font-extrabold">PENGUMUMAN (ALL)</Badge>
                  ) : (
                    <Badge className="bg-blue-100 text-blue-700 text-[8px] font-extrabold">PESAN PRIBADI</Badge>
                  )}
                </div>
                <div className="text-[10px] text-gray-400">
                  Dikirim pada: <b>{selectedAdminMessageForView.createdAt}</b> · Pengirim: <b>Super Admin</b>
                </div>
              </div>
              
              <div className="p-4 rounded-xl bg-gray-50 text-xs text-gray-700 leading-relaxed border border-gray-100 whitespace-pre-wrap font-medium">
                {selectedAdminMessageForView.content}
              </div>
            </div>
            <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
              <Button
                onClick={() => setSelectedAdminMessageForView(null)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl"
              >
                Tutup Pesan
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

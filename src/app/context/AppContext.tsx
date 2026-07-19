import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "../../supabase";

// ─── Types ────────────────────────────────────────────────────────────────────
export type UserRole = "pendaki" | "guide" | "vendor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  verified?: boolean;
  avatar?: string;
  status?: "active" | "suspended";
  ktp_number?: string;
  ktp_image?: string;
  selfie_image?: string;
  email_verified?: boolean;
  bank_name?: string;
  bank_account?: string;
  bank_holder?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  timestamp: string;
}

export interface Mountain {
  name: string;
  location: string;
  province: string;
  elevation: string;
  elevationM: number;
  difficulty: "Mudah" | "Sedang" | "Sulit";
  image: string;
  rating: number;
  reviews: number;
  lat: number;
  lng: number;
  status: "Buka" | "Tutup";
  ticketPrice: number;
  adminContactMethod: "Instagram" | "Website Resmi" | "WhatsApp";
  adminContactValue: string;
  basecamps: string[];
}

export interface Guide {
  id: string;
  name: string;
  specialty: string;
  location: string;
  experience: string;
  trips: number;
  rating: number;
  price: number; // in Rp
  avatar: string;
  certifications: string[];
  status: "Aktif" | "Libur" | "Non-Aktif";
  verified: boolean;
  specialtyMountains: string[];
  busyDates: string[];
  groupDiscountEnabled?: boolean;
  discountPercentage?: number;
  biodata?: string;
  ketentuan?: string;
  couponCode?: string;
  couponDiscount?: number;
  couponDeadline?: string;
}

export interface Vendor {
  id: string;
  name: string;
  location: string;
  rating: number;
  verified: boolean;
  avatar: string;
  // distances in km from mountain basecamp
  distances: Record<string, number>;
  couponCode?: string;
  couponDiscount?: number;
  couponDeadline?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  description: string;
  price: number; // in Rp/day
  vendorId: string;
  vendorName: string;
  rating: number;
  available: number;
  category: "tent" | "carrier" | "other";
  groupDiscountEnabled?: boolean;
  damageTerms?: string;
  discountPercentage?: number;
}

export interface TripPackage {
  id: string;
  title: string;
  guideId: string;
  guideName: string;
  vendorId?: string;
  vendorName?: string;
  description: string;
  duration: string; // e.g. "3 Hari 2 Malam"
  price: number;
  promoDeadline: string; // date string
  services: string[];
  rundown: string[];
  image: string;
  targetMountain: string;
  status?: "pending" | "approved" | "rejected";
}

export interface Booking {
  id: string;
  mountainName: string;
  basecamp?: string;
  guideId?: string;
  guideName?: string;
  pendakiName: string;
  pendakiId: string;
  bookingDate: string; // trip date
  createdAt: string;
  price: number; // fixed ticket or nego guide price
  status: "Menunggu Konfirmasi" | "Menunggu Pembayaran" | "Telah Dibayar" | "Start" | "Muncak" | "Selesai" | "Dibatalkan" | "Dispute";
  disputeNotes?: string;
  officialTicketBooking?: boolean;
  bookingType: "mandiri" | "paket";
  packageId?: string;
  preTripMeetingDate?: string;
  preTripMeetingTime?: string;
  preTripMeetingLink?: string;
  climbersCount?: number;
  depositAmount?: number;
  depositStatus?: "held" | "refunded" | "forfeited" | "partially_refunded";
  fineAmount?: number;
  fineNotes?: string;
  pendakiConfirmed?: boolean;
  partnerConfirmed?: boolean;
  notes?: string;
}

export interface UserWarning {
  id: string;
  userId: string;
  userName: string;
  text: string;
  date: string;
}

export interface RentalOrder {
  id: string;
  itemId: string;
  itemName: string;
  vendorId: string;
  vendorName: string;
  pendakiId: string;
  pendakiName: string;
  qty: number;
  startDate: string;
  endDate: string;
  totalPrice: number;
  status: "Menunggu Konfirmasi" | "Menunggu Pembayaran" | "Telah Dibayar" | "Siap Diambil" | "Sedang Disewa" | "Selesai" | "Dibatalkan" | "Dispute";
  disputeNotes?: string;
  depositAmount?: number;
  depositStatus?: "held" | "refunded" | "forfeited" | "partially_refunded";
  fineAmount?: number;
  fineNotes?: string;
  pendakiConfirmed?: boolean;
  partnerConfirmed?: boolean;
  notes?: string;
}

export interface Negotiation {
  id: string;
  type: "guide" | "rental";
  orderId: string; // bookingId atau rentalOrderId
  itemName: string;
  originalPrice: number;
  proposedPrice: number;
  senderName: string;
  recipientId: string; // guideId atau vendorId
  recipientName: string;
  status: "pending" | "accepted" | "rejected" | "countered";
  counterPrice?: number;
  notes?: string;
}

export interface ChatMessage {
  id: string;
  chatPartnerId: string;
  chatPartnerName: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: string;
}

export interface VerificationRequest {
  id: string;
  userId: string;
  userName: string;
  role: "pendaki" | "guide" | "vendor";
  documentName: string; // e.g., APIGI License, UKM Permit
  documentImage: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  ktpNumber?: string;
  ktpPhoto?: string;
  selfiePhoto?: string;
}

export interface DepositTransaction {
  id: string;
  type: "topup" | "withdraw" | "refund" | "fine_deduction";
  amount: number;
  description: string;
  createdAt: string;
}

export interface CollaborationProposal {
  id: string;
  title: string;
  guideId: string;
  guideName: string;
  vendorId: string;
  vendorName: string;
  description: string;
  duration: string;
  price: number;
  targetMountain: string;
  rentalMechanism: string;
  bundledEquipmentIds: string[];
  status: "pending" | "accepted" | "rejected";
  senderId: string;
  createdAt: string;
}

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  mountains: Mountain[];
  setMountains: React.Dispatch<React.SetStateAction<Mountain[]>>;
  guides: Guide[];
  setGuides: React.Dispatch<React.SetStateAction<Guide[]>>;
  vendors: Vendor[];
  equipment: EquipmentItem[];
  setEquipment: React.Dispatch<React.SetStateAction<EquipmentItem[]>>;
  tripPackages: TripPackage[];
  setTripPackages: React.Dispatch<React.SetStateAction<TripPackage[]>>;
  addTripPackage: (pkg: Omit<TripPackage, "id">) => void;
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, "id" | "createdAt" | "status">) => string;
  updateBookingStatus: (id: string, status: Booking["status"]) => void;
  rentalOrders: RentalOrder[];
  addRentalOrder: (order: Omit<RentalOrder, "id" | "status">) => string;
  updateRentalStatus: (id: string, status: RentalOrder["status"]) => void;
  negotiations: Negotiation[];
  createNegotiation: (nego: Omit<Negotiation, "id" | "status">) => void;
  respondToNegotiation: (id: string, action: "accepted" | "rejected" | "countered", counterPrice?: number) => void;
  chatMessages: ChatMessage[];
  sendChatMessage: (partnerId: string, partnerName: string, message: string) => void;
  verificationRequests: VerificationRequest[];
  respondToVerification: (id: string, approve: boolean) => void;
  revokeVerification: (id: string) => Promise<void>;
  addVerificationRequest: (req: Omit<VerificationRequest, "id" | "status" | "createdAt">) => Promise<void>;
  addEquipmentItem: (item: Omit<EquipmentItem, "id" | "rating">) => void;
  updateEquipmentItem: (id: string, item: Partial<EquipmentItem>) => void;
  deleteEquipmentItem: (id: string) => void;
  submitDispute: (type: "booking" | "rental", id: string, notes: string) => void;
  resolveDispute: (type: "booking" | "rental", id: string, refund: boolean) => void;
  toggleGroupDiscount: (role: "guide" | "vendor", id: string) => void;
  confirmEscrow: (type: "booking" | "rental", id: string, role: "pendaki" | "guide" | "vendor") => void;
  reportDamage: (type: "booking" | "rental", id: string, fineAmount: number, fineNotes: string) => void;
  resolveEscrowWithDeposit: (type: "booking" | "rental", id: string, approveFine: boolean) => void;
  climberDeposit: number;
  guideWallet: number;
  vendorWallet: number;
  depositTransactions: DepositTransaction[];
  userWarnings: UserWarning[];
  topUpWallet: (role: "pendaki" | "guide" | "vendor", amount: number) => void;
  withdrawWallet: (role: "pendaki" | "guide" | "vendor", amount: number, description?: string) => void;
  addWarning: (userId: string, text: string) => void;
  removeWarning: (id: string) => void;
  collaborationProposals: CollaborationProposal[];
  addCollaborationProposal: (proposal: Omit<CollaborationProposal, "id" | "status" | "createdAt">) => void;
  respondToCollaborationProposal: (id: string, status: "accepted" | "rejected") => void;
  users: User[];
  updateUserStatus: (id: string, status: "active" | "suspended") => void;
  toggleUserVerification: (id: string) => void;
  addManualUser: (userData: Omit<User, "id" | "avatar" | "status"> & { password?: string }) => Promise<void>;
  updateTripPackageStatus: (id: string, status: "approved" | "rejected") => void;
  userActivities: UserActivity[];
  logUserActivity: (userId: string, userName: string, role: UserActivity["userRole"], action: string) => void;
  ensureMockUserExists: (user: User) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const cached = localStorage.getItem("currentUser");
    return cached ? JSON.parse(cached) : null;
  });
  
  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
    if (user === null) {
      localStorage.removeItem("currentUser");
      supabase.auth.signOut();
    } else {
      localStorage.setItem("currentUser", JSON.stringify(user));
    }
  };

  // Keep localStorage in sync with currentUser changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem("currentUser", JSON.stringify(currentUser));
    } else {
      localStorage.removeItem("currentUser");
    }
  }, [currentUser]);

  const [mountains, setMountains] = useState<Mountain[]>([]);
  const [guides, setGuides] = useState<Guide[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [equipment, setEquipment] = useState<EquipmentItem[]>([]);
  const [tripPackages, setTripPackages] = useState<TripPackage[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [userActivities, setUserActivities] = useState<UserActivity[]>([]);
  const [userWarnings, setUserWarnings] = useState<UserWarning[]>([]);
  const [collaborationProposals, setCollaborationProposals] = useState<CollaborationProposal[]>([]);
  const [depositTransactions, setDepositTransactions] = useState<DepositTransaction[]>([]);
  
  const [climberDeposit, setClimberDeposit] = useState<number>(500000);
  const [guideWallet, setGuideWallet] = useState<number>(1500000);
  const [vendorWallet, setVendorWallet] = useState<number>(2000000);

  // ─── Fetching Data From Supabase & User Session ─────────────────────────────────
  useEffect(() => {
    const loadData = async () => {
      try {
        const { data: usersData } = await supabase.from("users").select("*");
        let currentUsersList = usersData || [];
        if (usersData) setUsers(usersData);

        // 1. Check if cached user in localStorage is suspended
        const cachedUserStr = localStorage.getItem("currentUser");
        if (cachedUserStr) {
          const cachedUser = JSON.parse(cachedUserStr);
          const freshUser = currentUsersList.find((u: any) => u.id === cachedUser.id);
          if (freshUser && freshUser.status === "suspended") {
            setCurrentUserState(null);
            localStorage.removeItem("currentUser");
            await supabase.auth.signOut();
            toast.error("Akun Anda ditangguhkan. Silakan hubungi email admin@ayokmendaki.com");
            if (window.location.pathname.includes("/dashboard") || window.location.pathname.includes("/admin")) {
              window.location.href = "/login";
            }
            return;
          }
        }

        // Check active Supabase Auth session
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.user) {
          const email = session.user.email?.toLowerCase();
          const userId = session.user.id;

          // Find user in public.users
          let matchedUser = currentUsersList.find((u: any) => u.id === userId || u.email?.toLowerCase() === email);

          if (matchedUser && matchedUser.status === "suspended") {
            setCurrentUserState(null);
            localStorage.removeItem("currentUser");
            await supabase.auth.signOut();
            toast.error("Akun Anda ditangguhkan. Silakan hubungi email admin@ayokmendaki.com");
            if (window.location.pathname.includes("/dashboard") || window.location.pathname.includes("/admin")) {
              window.location.href = "/login";
            }
            return;
          }

          if (!matchedUser) {
            // Check if there is a pending registration in localStorage
            const pendingRegStr = localStorage.getItem("pending_oauth_register");
            if (pendingRegStr) {
              const pendingReg = JSON.parse(pendingRegStr);
              const emailFromGoogle = session.user.email?.toLowerCase();
              const nameFromGoogle = session.user.user_metadata?.full_name || session.user.user_metadata?.name || emailFromGoogle?.split("@")[0] || "User Google";

              const newUserObj = {
                id: userId,
                name: pendingReg.role === "vendor" ? (pendingReg.storeName || nameFromGoogle) : (pendingReg.name || nameFromGoogle),
                email: pendingReg.email || emailFromGoogle,
                role: pendingReg.role || "pendaki",
                phone: pendingReg.phone || null,
                verified: false,
                avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${nameFromGoogle}`,
                status: "active",
                ktp_number: pendingReg.ktpNumber || null,
                ktp_image: pendingReg.ktpPhotoUrl || null,
                selfie_image: pendingReg.selfiePhotoUrl || null,
                email_verified: true
              };

              await supabase.from("users").insert(newUserObj);

              // 2. Initialize wallet balance
              await supabase.from("wallets").insert({
                user_id: userId,
                balance: 0
              });

              // 3. Create role-specific records
              if (pendingReg.role === "guide") {
                await supabase.from("guides").insert({
                  id: userId,
                  specialty: pendingReg.specialty || "Gn. Semeru",
                  location: "Kota Malang, Jawa Timur",
                  experience: (pendingReg.experience || "0") + " Tahun",
                  trips: 0,
                  rating: 5.0,
                  price: parseInt(pendingReg.price) || 450000,
                  certifications: pendingReg.certifications || [],
                  status: "Non-Aktif",
                  specialty_mountains: pendingReg.specialty ? [pendingReg.specialty] : ["Gn. Semeru"],
                  busy_dates: [],
                  group_discount_enabled: false
                });
              } else if (pendingReg.role === "vendor") {
                await supabase.from("vendors").insert({
                  id: userId,
                  location: pendingReg.address || "Jawa Timur",
                  distances: {}
                });
              }

              // 4. Submit verification request if they have KYC (only for regular registration cached details)
              if (pendingReg.ktpNumber && pendingReg.ktpPhotoUrl) {
                await supabase.from("verification_requests").insert({
                  user_id: userId,
                  user_name: pendingReg.role === "vendor" ? pendingReg.storeName : pendingReg.name,
                  role: pendingReg.role,
                  document_name: pendingReg.role === "vendor" ? `NIB: ${pendingReg.nib}` : `KYC: KTP ${pendingReg.ktpNumber}`,
                  document_image: pendingReg.role === "guide" ? pendingReg.docImage : pendingReg.ktpPhotoUrl,
                  ktp_number: pendingReg.ktpNumber,
                  ktp_photo: pendingReg.ktpPhotoUrl,
                  selfie_photo: pendingReg.selfiePhotoUrl,
                  status: "pending"
                });
              }

              matchedUser = {
                id: newUserObj.id,
                name: newUserObj.name,
                email: newUserObj.email,
                role: newUserObj.role,
                phone: newUserObj.phone,
                verified: newUserObj.verified,
                avatar: newUserObj.avatar,
                status: newUserObj.status
              };

              setUsers(prev => [newUserObj, ...prev]);
              localStorage.removeItem("pending_oauth_register");
            } else {
              // Create a default climber profile if logged in via OAuth without registering
              const defaultName = session.user.user_metadata?.full_name || email?.split("@")[0] || "User Google";
              const newUserObj = {
                id: userId,
                name: defaultName,
                email: email,
                role: "pendaki",
                phone: "08120000000",
                verified: true,
                avatar: session.user.user_metadata?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${defaultName}`,
                status: "active",
                email_verified: true
              };

              await supabase.from("users").insert(newUserObj);
              await supabase.from("wallets").insert({
                user_id: userId,
                balance: 500000
              });

              matchedUser = newUserObj;
              setUsers(prev => [newUserObj, ...prev]);
            }
          }

          if (matchedUser) {
            setCurrentUserState(matchedUser);
            localStorage.setItem("currentUser", JSON.stringify(matchedUser));

            // Clean up the Google OAuth token hash and redirect to dashboard
            if (window.location.hash && (window.location.hash.includes("access_token") || window.location.hash.includes("id_token"))) {
              window.history.replaceState(null, "", window.location.pathname);
              window.location.href = window.location.origin + "/dashboard";
            }
          }
        }

        const { data: mtnData } = await supabase.from("mountains").select("*");
        if (mtnData) {
          setMountains(
            mtnData.map((m: any) => ({
              name: m.name,
              location: m.location,
              province: m.province,
              elevation: m.elevation,
              elevationM: m.elevation_m,
              difficulty: m.difficulty,
              image: m.image,
              rating: Number(m.rating),
              reviews: m.reviews,
              lat: Number(m.lat),
              lng: Number(m.lng),
              status: m.status,
              ticketPrice: Number(m.ticket_price),
              adminContactMethod: m.admin_contact_method,
              adminContactValue: m.admin_contact_value,
              basecamps: m.basecamps || [],
            }))
          );
        }

        const { data: guidesData } = await supabase.from("guides").select("*");
        if (guidesData && usersData) {
          setGuides(
            guidesData.map((g: any) => {
              const user = usersData.find((u: any) => u.id === g.id);
              return {
                id: g.id,
                name: user?.name || "Guide Name",
                specialty: g.specialty,
                location: g.location,
                experience: g.experience,
                trips: g.trips,
                rating: Number(g.rating),
                price: Number(g.price),
                avatar: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg",
                certifications: g.certifications || [],
                status: g.status,
                verified: user?.verified || false,
                specialtyMountains: g.specialty_mountains || [],
                busyDates: (g.busy_dates || []).map((d: any) => String(d)),
                groupDiscountEnabled: g.group_discount_enabled || false,
                discountPercentage: Number(g.discount_percentage || 0),
                biodata: g.biodata || "",
                ketentuan: g.ketentuan || "",
                couponCode: g.coupon_code || "",
                couponDiscount: Number(g.coupon_discount || 0),
                couponDeadline: g.coupon_deadline || ""
              };
            })
          );
        }

        const { data: vendorsData } = await supabase.from("vendors").select("*");
        if (vendorsData && usersData) {
          setVendors(
            vendorsData.map((v: any) => {
              const user = usersData.find((u: any) => u.id === v.id);
              return {
                id: v.id,
                name: user?.name || "Vendor Name",
                location: v.location,
                verified: user?.verified || false,
                avatar: user?.avatar || "https://api.dicebear.com/7.x/identicon/svg",
                distances: v.distances || {},
                couponCode: v.coupon_code || "",
                couponDiscount: Number(v.coupon_discount || 0),
                couponDeadline: v.coupon_deadline || ""
              };
            })
          );
        }

        const { data: eqData } = await supabase.from("equipment_items").select("*");
        if (eqData && usersData) {
          setEquipment(
            eqData.map((eq: any) => {
              const user = usersData.find((u: any) => u.id === eq.vendor_id);
              return {
                id: eq.id,
                name: eq.name,
                description: eq.description,
                price: Number(eq.price),
                vendorId: eq.vendor_id,
                vendorName: user?.name || "Vendor Name",
                rating: Number(eq.rating),
                available: eq.available,
                category: eq.category,
                groupDiscountEnabled: eq.group_discount_enabled || false,
                damageTerms: eq.damage_terms,
                discountPercentage: Number(eq.discount_percentage || 0)
              };
            })
          );
        }

        const { data: pkgsData } = await supabase.from("trip_packages").select("*");
        if (pkgsData && usersData) {
          setTripPackages(
            pkgsData.map((p: any) => {
              const guideUser = usersData.find((u: any) => u.id === p.guide_id);
              const vendorUser = usersData.find((u: any) => u.id === p.vendor_id);
              return {
                id: p.id,
                title: p.title,
                guideId: p.guide_id,
                guideName: guideUser?.name || "Guide Name",
                vendorId: p.vendor_id,
                vendorName: vendorUser?.name || undefined,
                description: p.description,
                duration: p.duration,
                price: Number(p.price),
                promoDeadline: p.promo_deadline,
                services: p.services || [],
                rundown: p.rundown || [],
                image: p.image,
                targetMountain: p.target_mountain,
                status: p.status || "approved"
              };
            })
          );
        }

        const { data: bookingsData } = await supabase.from("bookings").select("*");
        if (bookingsData && usersData) {
          setBookings(
            bookingsData.map((b: any) => {
              const guideUser = usersData.find((u: any) => u.id === b.guide_id);
              const pendakiUser = usersData.find((u: any) => u.id === b.pendaki_id);
              return {
                id: b.id,
                mountainName: b.mountain_name,
                basecamp: b.basecamp,
                guideId: b.guide_id,
                guideName: guideUser?.name || undefined,
                pendakiName: pendakiUser?.name || "Pendaki Name",
                pendakiId: b.pendaki_id,
                bookingDate: b.booking_date,
                createdAt: b.created_at ? new Date(b.created_at).toISOString().split("T")[0] : "",
                price: Number(b.price),
                status: b.status,
                disputeNotes: b.dispute_notes,
                officialTicketBooking: b.official_ticket_booking,
                bookingType: b.booking_type,
                packageId: b.package_id,
                preTripMeetingDate: b.pre_trip_meeting_date,
                preTripMeetingTime: b.pre_trip_meeting_time,
                preTripMeetingLink: b.pre_trip_meeting_link,
                climbersCount: b.climbers_count,
                depositAmount: Number(b.deposit_amount),
                depositStatus: b.deposit_status,
                fineAmount: Number(b.fine_amount),
                fineNotes: b.fine_notes,
                pendakiConfirmed: b.pendaki_confirmed,
                partnerConfirmed: b.partner_confirmed,
                notes: b.notes || ""
              };
            })
          );
        }

        const { data: rentalsData } = await supabase.from("rental_orders").select("*");
        if (rentalsData && eqData && usersData) {
          setRentalOrders(
            rentalsData.map((r: any) => {
              const eqItem = eqData.find((eq: any) => eq.id === r.item_id);
              const vendorUser = usersData.find((u: any) => u.id === r.vendor_id);
              const pendakiUser = usersData.find((u: any) => u.id === r.pendaki_id);
              return {
                id: r.id,
                itemId: r.item_id,
                itemName: eqItem?.name || "Equipment Item",
                vendorId: r.vendor_id,
                vendorName: vendorUser?.name || "Vendor Name",
                pendakiId: r.pendaki_id,
                pendakiName: pendakiUser?.name || "Pendaki Name",
                qty: r.qty,
                startDate: r.start_date,
                endDate: r.end_date,
                totalPrice: Number(r.total_price),
                status: r.status,
                disputeNotes: r.dispute_notes,
                depositAmount: Number(r.deposit_amount),
                depositStatus: r.deposit_status,
                fineAmount: Number(r.fine_amount),
                fineNotes: r.fine_notes,
                pendakiConfirmed: r.pendaki_confirmed,
                partnerConfirmed: r.partner_confirmed,
                notes: r.notes || ""
              };
            })
          );
        }

        const { data: negosData } = await supabase.from("negotiations").select("*");
        if (negosData) {
          setNegotiations(
            negosData.map((n: any) => ({
              id: n.id,
              type: n.type,
              orderId: n.order_id,
              itemName: n.item_name,
              originalPrice: Number(n.original_price),
              proposedPrice: Number(n.proposed_price),
              senderName: n.sender_name,
              recipientId: n.recipient_id,
              recipientName: n.recipient_name,
              status: n.status,
              counterPrice: n.counter_price ? Number(n.counter_price) : undefined,
              notes: n.notes,
            }))
          );
        }

        const { data: chatsData } = await supabase.from("chat_messages").select("*");
        if (chatsData) {
          setChatMessages(
            chatsData.map((c: any) => ({
              id: c.id,
              chatPartnerId: c.chat_partner_id,
              chatPartnerName: c.chat_partner_name,
              senderId: c.sender_id,
              senderName: c.sender_name,
              message: c.message,
              timestamp: c.timestamp,
            }))
          );
        }

        const { data: verData } = await supabase.from("verification_requests").select("*");
        if (verData) {
          setVerificationRequests(
            verData.map((v: any) => ({
              id: v.id,
              userId: v.user_id,
              userName: v.user_name,
              role: v.role,
              documentName: v.document_name,
              documentImage: v.document_image,
              status: v.status,
              createdAt: v.created_at ? new Date(v.created_at).toISOString().split("T")[0] : "",
              ktpNumber: v.ktp_number || undefined,
              ktpPhoto: v.ktp_image || undefined,
              selfiePhoto: v.selfie_image || undefined
            }))
          );
        }

        const { data: warnData } = await supabase.from("user_warnings").select("*");
        if (warnData) {
          setUserWarnings(
            warnData.map((w: any) => ({
              id: w.id,
              userId: w.user_id,
              userName: w.user_name,
              text: w.text,
              date: w.created_at ? new Date(w.created_at).toISOString().split("T")[0] : "",
            }))
          );
        }

        const { data: propData } = await supabase.from("collaboration_proposals").select("*");
        if (propData) {
          setCollaborationProposals(
            propData.map((p: any) => ({
              id: p.id,
              title: p.title,
              guideId: p.guide_id,
              guideName: p.guide_name,
              vendorId: p.vendor_id,
              vendorName: p.vendor_name,
              description: p.description,
              duration: p.duration,
              price: Number(p.price),
              targetMountain: p.target_mountain,
              rentalMechanism: p.rental_mechanism,
              bundledEquipmentIds: p.bundled_equipment_ids || [],
              status: p.status,
              senderId: p.sender_id,
              createdAt: p.created_at,
            }))
          );
        }

        const { data: txData } = await supabase.from("deposit_transactions").select("*");
        if (txData) {
          setDepositTransactions(
            txData.map((t: any) => ({
              id: t.id,
              type: t.type,
              amount: Number(t.amount),
              description: t.description,
              createdAt: t.created_at ? new Date(t.created_at).toISOString().split("T")[0] : "",
            }))
          );
        }

        const { data: actData } = await supabase.from("user_activities").select("*");
        if (actData) {
          setUserActivities(
            actData.map((a: any) => ({
              id: a.id,
              userId: a.user_id,
              userName: a.user_name,
              userRole: a.user_role as UserRole,
              action: a.action,
              timestamp: a.timestamp ? new Date(a.timestamp).toISOString().replace("T", " ").substring(0, 16) : "",
            }))
          );
        }
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      }
    };
    loadData();
  }, []);

  // Fetch wallets on currentUser change
  useEffect(() => {
    if (!currentUser) return;
    const loadWallet = async () => {
      try {
        const { data } = await supabase
          .from("wallets")
          .select("balance")
          .eq("user_id", currentUser.id)
          .single();

        if (data) {
          const bal = Number(data.balance);
          if (currentUser.role === "pendaki") {
            setClimberDeposit(bal);
          } else if (currentUser.role === "guide") {
            setGuideWallet(bal);
          } else if (currentUser.role === "vendor") {
            setVendorWallet(bal);
          }
        }
      } catch (err) {
        console.error("Error loading wallet balance:", err);
      }
    };
    loadWallet();
  }, [currentUser]);

  // ─── Booking Actions ────────────────────────────────────────────────────────
  const addBooking = (bookingData: Omit<Booking, "id" | "createdAt" | "status">) => {
    const id = "book_" + Math.random().toString(36).substring(2, 9);
    
    let preTripDate = "";
    let preTripTime = "";
    let preTripLink = "";
    if (bookingData.guideId) {
      const bDate = new Date(bookingData.bookingDate);
      const mDate = new Date(bDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before
      preTripDate = mDate.toISOString().split("T")[0];
      preTripTime = "19:30 - 20:00 WIB";
      preTripLink = "https://meet.google.com/yok-mend-meet";
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    const newStatus = bookingData.guideId && bookingData.bookingType === "mandiri" ? "Menunggu Konfirmasi" : "Menunggu Pembayaran";

    // Deduct deposit locally
    setClimberDeposit((prev) => Math.max(0, prev - 100000));
    setDepositTransactions((prev) => [
      {
        id: "tx_" + Math.random().toString(36).substring(2, 9),
        type: "withdraw",
        amount: 100000,
        description: `Deposit jaminan dikunci untuk booking ${bookingData.mountainName}`,
        createdAt: dateStr
      },
      ...prev
    ]);

    const newBooking: Booking = {
      ...bookingData,
      id,
      createdAt: new Date().toISOString().split("T")[0],
      status: newStatus,
      preTripMeetingDate: preTripDate || undefined,
      preTripMeetingTime: preTripTime || undefined,
      preTripMeetingLink: preTripLink || undefined,
      depositAmount: 100000,
      depositStatus: "held"
    };

    setBookings((prev) => [newBooking, ...prev]);

    // Supabase Sync
    supabase.from("bookings").insert({
      id,
      mountain_name: bookingData.mountainName,
      basecamp: bookingData.basecamp,
      guide_id: bookingData.guideId,
      pendaki_id: bookingData.pendakiId,
      booking_date: bookingData.bookingDate,
      price: bookingData.price,
      status: newStatus,
      official_ticket_booking: bookingData.officialTicketBooking || false,
      booking_type: bookingData.bookingType,
      package_id: bookingData.packageId,
      pre_trip_meeting_date: preTripDate || null,
      pre_trip_meeting_time: preTripTime || null,
      pre_trip_meeting_link: preTripLink || null,
      climbers_count: bookingData.climbersCount || 1,
      deposit_amount: 100000,
      deposit_status: "held",
      fine_amount: 0,
      fine_notes: null,
      pendaki_confirmed: false,
      partner_confirmed: false
    }).then(({ error }) => {
      if (error) console.error("Error syncing booking:", error);
    });

    const climberId = bookingData.pendakiId || "pendaki1";
    supabase.from("wallets").select("balance").eq("user_id", climberId).single().then(({ data }) => {
      const bal = data ? Number(data.balance) : 0;
      const newBal = Math.max(0, bal - 100000);
      supabase.from("wallets").update({ balance: newBal }).eq("user_id", climberId).then(() => {
        supabase.from("deposit_transactions").insert({
          id: "tx_" + Math.random().toString(36).substring(2, 9),
          user_id: climberId,
          type: "withdraw",
          amount: 100000,
          description: `Deposit jaminan dikunci untuk booking ${bookingData.mountainName}`
        });
      });
    });

    return id;
  };

  const updateBookingStatus = (id: string, status: Booking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
    supabase.from("bookings").update({ status }).eq("id", id).then(({ error }) => {
      if (error) console.error("Error updating booking status:", error);
    });
  };

  // ─── Rental Actions ─────────────────────────────────────────────────────────
  const addRentalOrder = (orderData: Omit<RentalOrder, "id" | "status">) => {
    const id = "rent_" + Math.random().toString(36).substring(2, 9);
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    setClimberDeposit((prev) => Math.max(0, prev - 100000));
    setDepositTransactions((prev) => [
      {
        id: "tx_" + Math.random().toString(36).substring(2, 9),
        type: "withdraw",
        amount: 100000,
        description: `Deposit jaminan dikunci untuk rental ${orderData.itemName}`,
        createdAt: dateStr
      },
      ...prev
    ]);

    const newOrder: RentalOrder = {
      ...orderData,
      id,
      status: "Menunggu Konfirmasi",
      depositAmount: 100000,
      depositStatus: "held"
    };

    setRentalOrders((prev) => [newOrder, ...prev]);

    // Supabase Sync
    supabase.from("rental_orders").insert({
      id,
      item_id: orderData.itemId,
      vendor_id: orderData.vendorId,
      pendaki_id: orderData.pendakiId,
      qty: orderData.qty,
      start_date: orderData.startDate,
      end_date: orderData.endDate,
      total_price: orderData.totalPrice,
      status: "Menunggu Konfirmasi",
      deposit_amount: 100000,
      deposit_status: "held",
      fine_amount: 0,
      fine_notes: null,
      pendaki_confirmed: false,
      partner_confirmed: false
    }).then(({ error }) => {
      if (error) console.error("Error syncing rental order:", error);
    });

    const climberId = orderData.pendakiId || "pendaki1";
    supabase.from("wallets").select("balance").eq("user_id", climberId).single().then(({ data }) => {
      const bal = data ? Number(data.balance) : 0;
      const newBal = Math.max(0, bal - 100000);
      supabase.from("wallets").update({ balance: newBal }).eq("user_id", climberId).then(() => {
        supabase.from("deposit_transactions").insert({
          id: "tx_" + Math.random().toString(36).substring(2, 9),
          user_id: climberId,
          type: "withdraw",
          amount: 100000,
          description: `Deposit jaminan dikunci untuk rental ${orderData.itemName}`
        });
      });
    });

    return id;
  };

  const updateRentalStatus = (id: string, status: RentalOrder["status"]) => {
    setRentalOrders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
    supabase.from("rental_orders").update({ status }).eq("id", id).then(({ error }) => {
      if (error) console.error("Error updating rental status:", error);
    });
  };

  // ─── Negotiation Actions ───────────────────────────────────────────────────
  const createNegotiation = (negoData: Omit<Negotiation, "id" | "status">) => {
    const id = "nego_" + Math.random().toString(36).substring(2, 9);
    const newNego: Negotiation = {
      ...negoData,
      id,
      status: "pending",
    };
    setNegotiations((prev) => [newNego, ...prev]);

    if (negoData.type === "guide") {
      updateBookingStatus(negoData.orderId, "Menunggu Konfirmasi");
    } else {
      updateRentalStatus(negoData.orderId, "Menunggu Konfirmasi");
    }

    supabase.from("negotiations").insert({
      id,
      type: negoData.type,
      order_id: negoData.orderId,
      item_name: negoData.itemName,
      original_price: negoData.originalPrice,
      proposed_price: negoData.proposedPrice,
      sender_name: negoData.senderName,
      recipient_id: negoData.recipientId,
      recipient_name: negoData.recipientName,
      status: "pending"
    }).then(({ error }) => {
      if (error) console.error("Error syncing negotiation:", error);
    });
  };

  const respondToNegotiation = (id: string, action: "accepted" | "rejected" | "countered", counterPrice?: number) => {
    setNegotiations((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;

        const updatedNego: Negotiation = {
          ...n,
          status: action,
          counterPrice: action === "countered" ? counterPrice : n.counterPrice,
        };

        if (action === "accepted") {
          const finalPrice = n.status === "countered" && n.counterPrice ? n.counterPrice : n.proposedPrice;
          if (n.type === "guide") {
            setBookings((prevBookings) =>
              prevBookings.map((b) =>
                b.id === n.orderId
                  ? { ...b, price: finalPrice, status: "Menunggu Pembayaran" }
                  : b
              )
            );
            supabase.from("bookings").update({ price: finalPrice, status: "Menunggu Pembayaran" }).eq("id", n.orderId);
          } else {
            setRentalOrders((prevRentals) =>
              prevRentals.map((r) =>
                r.id === n.orderId
                  ? { ...r, totalPrice: finalPrice, status: "Menunggu Pembayaran" }
                  : r
              )
            );
            supabase.from("rental_orders").update({ total_price: finalPrice, status: "Menunggu Pembayaran" }).eq("id", n.orderId);
          }
        } else if (action === "countered" && counterPrice) {
          if (n.type === "guide") {
            setBookings((prevBookings) =>
              prevBookings.map((b) =>
                b.id === n.orderId ? { ...b, price: counterPrice } : b
              )
            );
            supabase.from("bookings").update({ price: counterPrice }).eq("id", n.orderId);
          } else {
            setRentalOrders((prevRentals) =>
              prevRentals.map((r) =>
                r.id === n.orderId ? { ...r, totalPrice: counterPrice } : r
              )
            );
            supabase.from("rental_orders").update({ total_price: counterPrice }).eq("id", n.orderId);
          }
        } else if (action === "rejected") {
          if (n.type === "guide") {
            updateBookingStatus(n.orderId, "Dibatalkan");
          } else {
            updateRentalStatus(n.orderId, "Dibatalkan");
          }
        }

        supabase.from("negotiations").update({
          status: action,
          counter_price: action === "countered" ? counterPrice : undefined
        }).eq("id", id);

        return updatedNego;
      })
    );
  };

  // ─── Chat Actions ───────────────────────────────────────────────────────────
  const sendChatMessage = (partnerId: string, partnerName: string, message: string) => {
    if (!currentUser) return;
    const id = "chat_" + Math.random().toString(36).substring(2, 9);
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
    const newMsg: ChatMessage = {
      id,
      chatPartnerId: partnerId,
      chatPartnerName: partnerName,
      senderId: currentUser.id,
      senderName: currentUser.name,
      message,
      timestamp,
    };
    setChatMessages((prev) => [...prev, newMsg]);

    supabase.from("chat_messages").insert({
      id,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      chat_partner_id: partnerId,
      chat_partner_name: partnerName,
      message,
      timestamp
    });
  };

  // ─── Admin Verification Actions ─────────────────────────────────────────────
  const respondToVerification = async (id: string, approve: boolean) => {
    const req = verificationRequests.find((r) => r.id === id);
    if (!req) {
      console.error(`Verification request with ID ${id} not found in state!`);
      return;
    }

    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: approve ? "approved" : "rejected" } : r))
    );

    if (req.role === "guide") {
      setGuides((prev) =>
        prev.map((g) => (g.id === req.userId ? { ...g, verified: approve, status: approve ? "Aktif" : g.status } : g))
      );
      const { error: guideErr } = await supabase.from("guides").update({ status: approve ? "Aktif" : "Non-Aktif" }).eq("id", req.userId);
      if (guideErr) console.error("Error updating guide status in Supabase:", guideErr.message);
    } else if (req.role === "vendor") {
      setVendors((prev) =>
        prev.map((v) => (v.id === req.userId ? { ...v, verified: approve } : v))
      );
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === req.userId ? { ...u, verified: approve } : u))
    );
    const { error: userErr } = await supabase.from("users").update({ verified: approve }).eq("id", req.userId);
    if (userErr) console.error("Error updating user verified status in Supabase:", userErr.message);

    const { error: reqErr } = await supabase.from("verification_requests").update({ status: approve ? "approved" : "rejected" }).eq("id", id);
    if (reqErr) console.error("Error updating verification request in Supabase:", reqErr.message);
  };

  const revokeVerification = async (id: string) => {
    const req = verificationRequests.find((r) => r.id === id);
    if (!req) return;

    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: "pending" } : r))
    );

    if (req.role === "guide") {
      setGuides((prev) =>
        prev.map((g) => (g.id === req.userId ? { ...g, verified: false, status: "Non-Aktif" } : g))
      );
      await supabase.from("guides").update({ status: "Non-Aktif" }).eq("id", req.userId);
    } else if (req.role === "vendor") {
      setVendors((prev) =>
        prev.map((v) => (v.id === req.userId ? { ...v, verified: false } : v))
      );
    }

    setUsers((prev) =>
      prev.map((u) => (u.id === req.userId ? { ...u, verified: false } : u))
    );
    await supabase.from("users").update({ verified: false }).eq("id", req.userId);

    await supabase.from("verification_requests").update({ status: "pending" }).eq("id", id);
  };

  const addVerificationRequest = async (reqData: Omit<VerificationRequest, "id" | "status" | "createdAt">) => {
    const id = "ver_" + Math.random().toString(36).substring(2, 9);
    const newReq: VerificationRequest = {
      ...reqData,
      id,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setVerificationRequests((prev) => [newReq, ...prev]);

    const { error } = await supabase.from("verification_requests").insert({
      id,
      user_id: reqData.userId,
      user_name: reqData.userName,
      role: reqData.role,
      document_name: reqData.documentName,
      document_image: reqData.documentImage || "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&q=80",
      status: "pending",
      ktp_number: reqData.ktpNumber || null,
      ktp_image: reqData.ktpPhoto || null,
      selfie_image: reqData.selfiePhoto || null
    });

    if (error) {
      console.error("Error inserting verification request:", error.message);
      throw error;
    }
  };

  // ─── Vendor Catalog Actions ─────────────────────────────────────────────────
  const addEquipmentItem = (itemData: Omit<EquipmentItem, "id" | "rating">) => {
    const id = "eq_" + Math.random().toString(36).substring(2, 9);
    const newItem: EquipmentItem = {
      ...itemData,
      id,
      rating: 5.0,
    };
    setEquipment((prev) => [newItem, ...prev]);

    supabase.from("equipment_items").insert({
      id,
      name: itemData.name,
      description: itemData.description,
      price: itemData.price,
      vendor_id: itemData.vendorId,
      rating: 5.0,
      available: itemData.available,
      category: itemData.category,
      group_discount_enabled: itemData.groupDiscountEnabled || false,
      damage_terms: itemData.damageTerms || null
    });
  };

  const updateEquipmentItem = (id: string, itemData: Partial<EquipmentItem>) => {
    setEquipment((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, ...itemData } : eq))
    );

    const payload: any = {};
    if (itemData.name !== undefined) payload.name = itemData.name;
    if (itemData.description !== undefined) payload.description = itemData.description;
    if (itemData.price !== undefined) payload.price = itemData.price;
    if (itemData.available !== undefined) payload.available = itemData.available;
    if (itemData.category !== undefined) payload.category = itemData.category;
    if (itemData.groupDiscountEnabled !== undefined) payload.group_discount_enabled = itemData.groupDiscountEnabled;
    if (itemData.damageTerms !== undefined) payload.damage_terms = itemData.damageTerms;

    supabase.from("equipment_items").update(payload).eq("id", id);
  };

  const deleteEquipmentItem = (id: string) => {
    setEquipment((prev) => prev.filter((eq) => eq.id !== id));
    supabase.from("equipment_items").delete().eq("id", id);
  };

  // ─── Trip Package Actions ───────────────────────────────────────────────────
  const addTripPackage = (pkgData: Omit<TripPackage, "id">) => {
    const id = "pkg_" + Math.random().toString(36).substring(2, 9);
    const newPkg: TripPackage = {
      ...pkgData,
      id,
      status: pkgData.status || "pending"
    };
    setTripPackages((prev) => [newPkg, ...prev]);

    supabase.from("trip_packages").insert({
      id,
      title: pkgData.title,
      guide_id: pkgData.guideId,
      vendor_id: pkgData.vendorId || null,
      description: pkgData.description,
      duration: pkgData.duration,
      price: pkgData.price,
      promo_deadline: pkgData.promoDeadline,
      services: pkgData.services || [],
      rundown: pkgData.rundown || [],
      image: pkgData.image,
      target_mountain: pkgData.targetMountain,
      status: pkgData.status || "pending"
    });
  };

  const updateTripPackageStatus = (id: string, status: "approved" | "rejected") => {
    setTripPackages((prev) =>
      prev.map((pkg) => (pkg.id === id ? { ...pkg, status } : pkg))
    );
    supabase.from("trip_packages").update({ status }).eq("id", id);
    logUserActivity("admin1", "Super Admin", "admin", `Mengubah status iklan paket ID ${id} menjadi ${status.toUpperCase()}`);
  };

  const addManualUser = async (userData: Omit<User, "id" | "avatar" | "status"> & { password?: string }) => {
    const newUserId = "user_" + Math.random().toString(36).substring(2, 9);
    const newUserObj: User = {
      id: newUserId,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      phone: userData.phone || null,
      verified: userData.verified || false,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.name}`,
      status: "active",
      ktp_number: userData.ktp_number || null,
      ktp_image: userData.ktp_image || null,
      selfie_image: userData.selfie_image || null,
      email_verified: true
    };

    // 1. Insert into users table
    const { error: userErr } = await supabase.from("users").insert(newUserObj);
    if (userErr) throw userErr;

    // 2. Initialize wallet
    const { error: walletErr } = await supabase.from("wallets").insert({
      user_id: newUserId,
      balance: 0
    });
    if (walletErr) throw walletErr;

    // 3. Initialize role-specific profiles if guide/vendor
    if (userData.role === "guide") {
      await supabase.from("guides").insert({
        id: newUserId,
        specialty: "Gn. Semeru & Bromo",
        location: "Malang, Jawa Timur",
        experience: "3 Tahun",
        trips: 0,
        rating: 5.0,
        price: 500000,
        certifications: ["APIGI", "Pertolongan Pertama"],
        status: "Aktif",
        specialty_mountains: ["Gn. Semeru", "Gn. Bromo"],
        busy_dates: [],
        group_discount_enabled: false,
        discount_percentage: 0,
        biodata: "Halo, saya pemandu pendakian baru.",
        ketentuan: "Rombongan maksimal 5 orang."
      });
      
      setGuides(prev => [
        ...prev,
        {
          id: newUserId,
          name: userData.name,
          specialty: "Gn. Semeru & Bromo",
          location: "Malang, Jawa Timur",
          experience: "3 Tahun",
          trips: 0,
          rating: 5.0,
          price: 500000,
          avatar: newUserObj.avatar!,
          certifications: ["APIGI", "Pertolongan Pertama"],
          status: "Aktif",
          verified: userData.verified || false,
          specialtyMountains: ["Gn. Semeru", "Gn. Bromo"],
          busyDates: [],
          discountPercentage: 0,
          biodata: "Halo, saya pemandu pendakian baru.",
          ketentuan: "Rombongan maksimal 5 orang."
        }
      ]);
    } else if (userData.role === "vendor") {
      await supabase.from("vendors").insert({
        id: newUserId,
        location: "Jawa Timur",
        distances: {},
        coupon_code: "SEWAOK",
        coupon_discount: 10
      });

      setVendors(prev => [
        ...prev,
        {
          id: newUserId,
          name: userData.name,
          location: "Jawa Timur",
          verified: userData.verified || false,
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${userData.name}`,
          distances: {},
          couponCode: "SEWAOK",
          couponDiscount: 10
        }
      ]);
    }

    setUsers(prev => [newUserObj, ...prev]);
    logUserActivity("admin1", "Super Admin", "admin", `Membuat akun pengguna baru secara manual: ${userData.name} (${userData.role.toUpperCase()})`);
  };

  // ─── Dispute Actions ────────────────────────────────────────────────────────
  const submitDispute = (type: "booking" | "rental", id: string, notes: string) => {
    if (type === "booking") {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "Dispute", disputeNotes: notes } : b))
      );
      supabase.from("bookings").update({ status: "Dispute", dispute_notes: notes }).eq("id", id);
    } else {
      setRentalOrders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Dispute", disputeNotes: notes } : r))
      );
      supabase.from("rental_orders").update({ status: "Dispute", dispute_notes: notes }).eq("id", id);
    }
  };

  const resolveDispute = (type: "booking" | "rental", id: string, refund: boolean) => {
    if (type === "booking") {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: refund ? "Dibatalkan" : "Selesai", depositStatus: refund ? "refunded" : "held" } : b))
      );
      supabase.from("bookings").update({ status: refund ? "Dibatalkan" : "Selesai", deposit_status: refund ? "refunded" : "held" }).eq("id", id);
    } else {
      setRentalOrders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: refund ? "Dibatalkan" : "Selesai", depositStatus: refund ? "refunded" : "held" } : r))
      );
      supabase.from("rental_orders").update({ status: refund ? "Dibatalkan" : "Selesai", deposit_status: refund ? "refunded" : "held" }).eq("id", id);
    }
  };

  const toggleGroupDiscount = (role: "guide" | "vendor", id: string) => {
    if (role === "guide") {
      setGuides((prev) =>
        prev.map((g) => {
          if (g.id === id) {
            const nextVal = !g.groupDiscountEnabled;
            supabase.from("guides").update({ group_discount_enabled: nextVal }).eq("id", id);
            return { ...g, groupDiscountEnabled: nextVal };
          }
          return g;
        })
      );
    } else {
      setEquipment((prev) =>
        prev.map((eq) => {
          if (eq.id === id) {
            const nextVal = !eq.groupDiscountEnabled;
            supabase.from("equipment_items").update({ group_discount_enabled: nextVal }).eq("id", id);
            return { ...eq, groupDiscountEnabled: nextVal };
          }
          return eq;
        })
      );
    }
  };

  const confirmEscrow = (type: "booking" | "rental", id: string, role: "pendaki" | "guide" | "vendor") => {
    if (type === "booking") {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          const updated = { ...b };
          if (role === "pendaki") {
            updated.pendakiConfirmed = true;
            supabase.from("bookings").update({ pendaki_confirmed: true }).eq("id", id);
          } else {
            updated.partnerConfirmed = true;
            supabase.from("bookings").update({ partner_confirmed: true }).eq("id", id);
          }
          return updated;
        })
      );
    } else {
      setRentalOrders((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const updated = { ...r };
          if (role === "pendaki") {
            updated.pendakiConfirmed = true;
            supabase.from("rental_orders").update({ pendaki_confirmed: true }).eq("id", id);
          } else {
            updated.partnerConfirmed = true;
            supabase.from("rental_orders").update({ partner_confirmed: true }).eq("id", id);
          }
          return updated;
        })
      );
    }
  };

  const reportDamage = (type: "booking" | "rental", id: string, fineAmount: number, fineNotes: string) => {
    if (type === "booking") {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, fineAmount, fineNotes } : b))
      );
      supabase.from("bookings").update({ fine_amount: fineAmount, fine_notes: fineNotes }).eq("id", id);
    } else {
      setRentalOrders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, fineAmount, fineNotes } : r))
      );
      supabase.from("rental_orders").update({ fine_amount: fineAmount, fine_notes: fineNotes }).eq("id", id);
    }
  };

  const resolveEscrowWithDeposit = (type: "booking" | "rental", id: string, approveFine: boolean) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    if (type === "booking") {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          const fine = b.fineAmount || 0;
          const dep = b.depositAmount || 0;
          let depStatus: Booking["depositStatus"] = "refunded";
          
          let climberBalChange = 0;
          const climberId = b.pendakiId || "pendaki1";

          if (approveFine && fine > 0) {
            if (fine >= dep) {
              depStatus = "forfeited";
              const excess = fine - dep;
              climberBalChange = -excess;
            } else {
              depStatus = "partially_refunded";
              climberBalChange = dep - fine;
            }
          } else {
            climberBalChange = dep;
          }

          const platformFee = Math.round(b.price * 0.1);
          const basePayout = b.price - platformFee;
          const finalPayout = basePayout + (approveFine ? fine : 0);

          if (climberId) {
            setClimberDeposit((prevDep) => Math.max(0, prevDep + climberBalChange));
          }
          setGuideWallet((prev) => prev + finalPayout);

          // Database Sync
          supabase.from("bookings").update({
            status: "Selesai",
            deposit_status: depStatus,
            fine_amount: approveFine ? fine : 0
          }).eq("id", id);
          if (climberBalChange !== 0) {
            supabase.from("wallets").select("balance").eq("user_id", climberId).single().then(({ data }) => {
              const current = data ? Number(data.balance) : 0;
              supabase.from("wallets").update({ balance: Math.max(0, current + climberBalChange) }).eq("user_id", climberId);
            });
          }

          if (b.guideId) {
            supabase.from("wallets").select("balance").eq("user_id", b.guideId).single().then(({ data }) => {
              const current = data ? Number(data.balance) : 0;
              supabase.from("wallets").update({ balance: current + finalPayout }).eq("user_id", b.guideId);
            });
          }

          if (approveFine && fine > 0) {
            const excess = fine - dep;
            if (excess > 0) {
              supabase.from("deposit_transactions").insert({
                id: "tx_" + Math.random().toString(36).substring(2, 9),
                user_id: climberId,
                type: "fine_deduction",
                amount: excess,
                description: `Kekurangan denda pelanggaran booking ${b.mountainName}: ${b.fineNotes || ""}`
              });
            } else {
              supabase.from("deposit_transactions").insert({
                id: "tx_" + Math.random().toString(36).substring(2, 9),
                user_id: climberId,
                type: "refund",
                amount: dep - fine,
                description: `Sisa pengembalian deposit jaminan booking ${b.mountainName}`
              });
            }
            supabase.from("deposit_transactions").insert({
              id: "tx_" + Math.random().toString(36).substring(2, 9),
              user_id: climberId,
              type: "fine_deduction",
              amount: Math.min(fine, dep),
              description: `Denda pelanggaran booking ${b.mountainName}: ${b.fineNotes || ""}`
            });
          } else {
            supabase.from("deposit_transactions").insert({
              id: "tx_" + Math.random().toString(36).substring(2, 9),
              user_id: climberId,
              type: "refund",
              amount: dep,
              description: `Pengembalian penuh deposit jaminan booking ${b.mountainName}`
            });
          }

          if (b.guideId) {
            supabase.from("deposit_transactions").insert({
              id: "tx_" + Math.random().toString(36).substring(2, 9),
              user_id: b.guideId,
              type: "refund",
              amount: finalPayout,
              description: `Penerimaan sewa jasa trip ${b.mountainName} · Pendaki: ${b.pendakiName} ${approveFine ? `(Termasuk denda Rp ${fine.toLocaleString("id-ID")})` : ""}`
            });
          }

          return {
            ...b,
            status: "Selesai",
            depositStatus: depStatus,
            fineAmount: approveFine ? fine : 0
          };
        })
      );
    } else {
      setRentalOrders((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const fine = r.fineAmount || 0;
          const dep = r.depositAmount || 0;
          let depStatus: RentalOrder["depositStatus"] = "refunded";
          
          let climberBalChange = 0;
          if (approveFine && fine > 0) {
            if (fine >= dep) {
              depStatus = "forfeited";
              const excess = fine - dep;
              climberBalChange = -excess;
            } else {
              depStatus = "partially_refunded";
              climberBalChange = dep - fine;
            }
          } else {
            climberBalChange = dep;
          }

          const platformFee = Math.round(r.totalPrice * 0.1);
          const basePayout = r.totalPrice - platformFee;
          const finalPayout = basePayout + (approveFine ? fine : 0);

          setClimberDeposit((prevDep) => Math.max(0, prevDep + climberBalChange));
          setVendorWallet((prev) => prev + finalPayout);

          // Database Sync
          supabase.from("rental_orders").update({
            status: "Selesai",
            deposit_status: depStatus,
            fine_amount: approveFine ? fine : 0
          }).eq("id", id);

          const climberId = r.pendakiId || "pendaki1";
          if (climberBalChange !== 0) {
            supabase.from("wallets").select("balance").eq("user_id", climberId).single().then(({ data }) => {
              const current = data ? Number(data.balance) : 0;
              supabase.from("wallets").update({ balance: Math.max(0, current + climberBalChange) }).eq("user_id", climberId);
            });
          }

          if (r.vendorId) {
            supabase.from("wallets").select("balance").eq("user_id", r.vendorId).single().then(({ data }) => {
              const current = data ? Number(data.balance) : 0;
              supabase.from("wallets").update({ balance: current + finalPayout }).eq("user_id", r.vendorId);
            });
          }

          if (approveFine && fine > 0) {
            const excess = fine - dep;
            if (excess > 0) {
              supabase.from("deposit_transactions").insert({
                id: "tx_" + Math.random().toString(36).substring(2, 9),
                user_id: climberId,
                type: "fine_deduction",
                amount: excess,
                description: `Kekurangan denda kerusakan rental ${r.itemName}: ${r.fineNotes || ""}`
              });
            } else {
              supabase.from("deposit_transactions").insert({
                id: "tx_" + Math.random().toString(36).substring(2, 9),
                user_id: climberId,
                type: "refund",
                amount: dep - fine,
                description: `Sisa pengembalian deposit jaminan rental ${r.itemName}`
              });
            }
            supabase.from("deposit_transactions").insert({
              id: "tx_" + Math.random().toString(36).substring(2, 9),
              user_id: climberId,
              type: "fine_deduction",
              amount: Math.min(fine, dep),
              description: `Denda kerusakan rental ${r.itemName}: ${r.fineNotes || ""}`
            });
          } else {
            supabase.from("deposit_transactions").insert({
              id: "tx_" + Math.random().toString(36).substring(2, 9),
              user_id: climberId,
              type: "refund",
              amount: dep,
              description: `Pengembalian penuh deposit jaminan rental ${r.itemName}`
            });
          }

          if (r.vendorId) {
            supabase.from("deposit_transactions").insert({
              id: "tx_" + Math.random().toString(36).substring(2, 9),
              user_id: r.vendorId,
              type: "refund",
              amount: finalPayout,
              description: `Penerimaan sewa alat ${r.itemName} · Pendaki: ${r.pendakiName} ${approveFine ? `(Termasuk denda Rp ${fine.toLocaleString("id-ID")})` : ""}`
            });
          }

          return {
            ...r,
            status: "Selesai",
            depositStatus: depStatus,
            fineAmount: approveFine ? fine : 0
          };
        })
      );
    }
  };

  const topUpWallet = (role: "pendaki" | "guide" | "vendor", amount: number) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (role === "pendaki") {
      setClimberDeposit((prev) => prev + amount);
    } else if (role === "guide") {
      setGuideWallet((prev) => prev + amount);
    } else {
      setVendorWallet((prev) => prev + amount);
    }

    setDepositTransactions((prev) => [
      {
        id: "tx_" + Math.random().toString(36).substring(2, 9),
        type: "topup",
        amount,
        description: `Top Up Saldo Dompet (${role.toUpperCase()})`,
        createdAt: dateStr
      },
      ...prev
    ]);

    let targetUserId = "";
    if (role === "pendaki") targetUserId = "pendaki1";
    else if (role === "guide") targetUserId = "guide1";
    else if (role === "vendor") targetUserId = "vendor1";

    if (targetUserId) {
      supabase.from("wallets").select("balance").eq("user_id", targetUserId).single().then(({ data }) => {
        const currentBal = data ? Number(data.balance) : 0;
        const newBal = currentBal + amount;
        supabase.from("wallets").update({ balance: newBal }).eq("user_id", targetUserId).then(() => {
          supabase.from("deposit_transactions").insert({
            id: "tx_" + Math.random().toString(36).substring(2, 9),
            user_id: targetUserId,
            type: "topup",
            amount,
            description: `Top Up Saldo Dompet (${role.toUpperCase()})`
          });
        });
      });
    }
  };

  const withdrawWallet = (role: "pendaki" | "guide" | "vendor", amount: number, description?: string) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    if (role === "pendaki") {
      setClimberDeposit((prev) => Math.max(0, prev - amount));
    } else if (role === "guide") {
      setGuideWallet((prev) => Math.max(0, prev - amount));
    } else {
      setVendorWallet((prev) => Math.max(0, prev - amount));
    }

    setDepositTransactions((prev) => [
      {
        id: "tx_" + Math.random().toString(36).substring(2, 9),
        type: "withdraw",
        amount,
        description: description || `Penarikan Dana Dompet (${role.toUpperCase()})`,
        createdAt: dateStr
      },
      ...prev
    ]);

    let targetUserId = "";
    if (role === "pendaki") targetUserId = "pendaki1";
    else if (role === "guide") targetUserId = "guide1";
    else if (role === "vendor") targetUserId = "vendor1";

    if (targetUserId) {
      supabase.from("wallets").select("balance").eq("user_id", targetUserId).single().then(({ data }) => {
        const currentBal = data ? Number(data.balance) : 0;
        const newBal = Math.max(0, currentBal - amount);
        supabase.from("wallets").update({ balance: newBal }).eq("user_id", targetUserId).then(() => {
          supabase.from("deposit_transactions").insert({
            id: "tx_" + Math.random().toString(36).substring(2, 9),
            user_id: targetUserId,
            type: "withdraw",
            amount,
            description: description || `Penarikan Dana Dompet (${role.toUpperCase()})`
          });
        });
      });
    }
  };

  const addWarning = (userId: string, text: string) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    let uName = "Pengguna";
    if (userId === "pendaki1") uName = "Zaki Firdaus";
    else if (userId === "guide1") uName = "Ahmad Hidayat";
    else if (userId === "vendor1") uName = "Outdoor Adventure Store";
    else {
      const g = guides.find((x) => x.id === userId);
      if (g) uName = g.name;
    }

    const newWarning: UserWarning = {
      id: "warn_" + Math.random().toString(36).substring(2, 9),
      userId,
      userName: uName,
      text,
      date: dateStr
    };
    setUserWarnings((prev) => [newWarning, ...prev]);

    supabase.from("user_warnings").insert({
      id: newWarning.id,
      user_id: userId,
      user_name: uName,
      text
    });
  };

  const removeWarning = (id: string) => {
    setUserWarnings((prev) => prev.filter((w) => w.id !== id));
    supabase.from("user_warnings").delete().eq("id", id);
  };

  const addCollaborationProposal = (propData: Omit<CollaborationProposal, "id" | "status" | "createdAt">) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const id = "prop_" + Math.random().toString(36).substring(2, 9);
    const newProposal: CollaborationProposal = {
      ...propData,
      id,
      status: "pending",
      createdAt: dateStr
    };
    setCollaborationProposals((prev) => [newProposal, ...prev]);

    supabase.from("collaboration_proposals").insert({
      id,
      title: propData.title,
      guide_id: propData.guideId,
      guide_name: propData.guideName,
      vendor_id: propData.vendorId,
      vendor_name: propData.vendorName,
      description: propData.description,
      duration: propData.duration,
      price: propData.price,
      target_mountain: propData.targetMountain,
      rental_mechanism: propData.rentalMechanism,
      bundled_equipment_ids: propData.bundledEquipmentIds || [],
      status: "pending",
      sender_id: propData.senderId
    });
  };

  const respondToCollaborationProposal = (id: string, status: "accepted" | "rejected") => {
    setCollaborationProposals((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const updated = { ...p, status };
          if (status === "accepted") {
            addTripPackage({
              title: p.title,
              guideId: p.guideId,
              guideName: p.guideName,
              vendorId: p.vendorId,
              vendorName: p.vendorName,
              description: p.description,
              duration: p.duration,
              price: p.price,
              promoDeadline: "2026-07-31",
              services: [
                "Jasa Pemandu Gunung Bersertifikat",
                "Penyewaan Alat Bundling (Tenda, Carrier, Nesting)",
                "Mekanisme Sewa: " + p.rentalMechanism
              ],
              rundown: [
                "Hari 1: Penjemputan di basecamp & persiapan peralatan bersama Vendor",
                "Hari 2: Trekking & camp malam bersama Pemandu",
                "Hari 3: Summit attack & pengembalian peralatan ke Vendor"
              ],
              image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&auto=format&fit=crop&q=80",
              targetMountain: p.targetMountain
            });
          }
          return updated;
        }
        return p;
      })
    );

    supabase.from("collaboration_proposals").update({ status }).eq("id", id);
  };

  const logUserActivity = (userId: string, userName: string, role: UserActivity["userRole"], action: string) => {
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    const id = "act_" + Math.random().toString(36).substring(2, 9);
    const newAct: UserActivity = {
      id,
      userId,
      userName,
      userRole: role,
      action,
      timestamp: dateStr
    };
    
    setUserActivities((prev) => [newAct, ...prev]);

    supabase.from("user_activities").insert({
      id,
      user_id: userId,
      user_name: userName,
      user_role: role,
      action
    });
  };

  const updateUserStatus = (id: string, status: "active" | "suspended") => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, status } : u))
    );
    const u = users.find(x => x.id === id);
    if (u) {
      logUserActivity("admin1", "Super Admin", "admin", `Mengubah status akun ${u.name} (${u.role.toUpperCase()}) menjadi ${status === "active" ? "Aktif" : "Suspended"}`);
    }

    supabase.from("users")
      .update({ status })
      .eq("id", id)
      .then(({ error }) => {
        if (error) {
          console.error("Failed to update user status in Supabase:", error.message);
          toast.error(`Gagal memperbarui status di database: ${error.message}`);
        }
      });
  };

  const toggleUserVerification = async (id: string) => {
    const u = users.find(x => x.id === id);
    if (!u) {
      console.error(`User with ID ${id} not found in state!`);
      return;
    }

    const nextVerified = !u.verified;
    const uRole = u.role;
    const uName = u.name;

    logUserActivity("admin1", "Super Admin", "admin", `Mengubah status verifikasi ${uName} menjadi ${nextVerified ? "Verified" : "Unverified"}`);

    setUsers((prev) =>
      prev.map((user) => (user.id === id ? { ...user, verified: nextVerified } : user))
    );
    setGuides((prev) => prev.map(g => g.id === id ? { ...g, verified: nextVerified } : g));
    setVendors((prev) => prev.map(v => v.id === id ? { ...v, verified: nextVerified } : v));

    const { error: userErr } = await supabase.from("users").update({ verified: nextVerified }).eq("id", id);
    if (userErr) {
      console.error("Error updating user verification in Supabase:", userErr.message);
    }
  };

  const ensureMockUserExists = async (user: User) => {
    try {
      const { data: existingUser } = await supabase
        .from("users")
        .select("id")
        .eq("id", user.id)
        .single();

      if (existingUser) return;

      console.log(`Auto-creating mock user: ${user.name} (${user.role})...`);

      const { error: userErr } = await supabase.from("users").insert({
        id: user.id,
        name: user.name.includes(" (") ? user.name.split(" (")[0] : user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || "08123456789",
        verified: true,
        avatar: user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}`,
        status: "active",
        email_verified: true
      });

      if (userErr) throw userErr;

      const balance = user.role === "vendor" ? 2000000 : (user.role === "guide" ? 1500000 : 500000);
      await supabase.from("wallets").insert({
        user_id: user.id,
        balance: balance
      });

      if (user.role === "guide") {
        await supabase.from("guides").insert({
          id: user.id,
          specialty: "Gunung Semeru & Bromo",
          location: "Malang, Jawa Timur",
          experience: "8 Tahun",
          trips: 245,
          rating: 4.9,
          price: 500000,
          certifications: ["APIGI", "Pertolongan Pertama"],
          status: "Aktif",
          specialty_mountains: ["Gunung Semeru", "Gunung Bromo"],
          busy_dates: []
        });
      } else if (user.role === "vendor") {
        await supabase.from("vendors").insert({
          id: user.id,
          location: "Malang, Jawa Timur",
          distances: {
            "Gunung Semeru": 3.5,
            "Gunung Bromo": 8.0,
            "Gunung Rinjani": 380,
            "Gunung Prau": 350,
            "Gunung Merbabu": 320,
            "Gunung Gede Pangrango": 710,
            "Gunung Slamet": 310,
            "Gunung Sindoro": 280,
            "Gunung Sumbing": 270,
            "Gunung Lawu": 180,
            "Gunung Papandayan": 610,
            "Gunung Merapi": 290
          }
        });

        await supabase.from("equipment_items").insert([
          {
            id: "eq1",
            name: "Tenda Dome 4 Orang",
            description: "Kapasitas 4 orang, waterproof, mudah dipasang",
            price: 75000,
            vendor_id: user.id,
            rating: 4.8,
            available: 5,
            category: "tent",
            group_discount_enabled: false,
            damage_terms: null
          },
          {
            id: "eq9",
            name: "Cooking Set Nesting",
            description: "Panci camping anti lengket, 1 set isi 4 item",
            price: 20000,
            vendor_id: user.id,
            rating: 4.8,
            available: 10,
            category: "other",
            group_discount_enabled: false,
            damage_terms: null
          },
          {
            id: "eq13",
            name: "Flysheet 3x4 meter",
            description: "Tenda peneduh anti air pelindung tenda utama",
            price: 15000,
            vendor_id: user.id,
            rating: 4.7,
            available: 8,
            category: "other",
            group_discount_enabled: false,
            damage_terms: null
          },
          {
            id: "eq18",
            name: "Sepatu Trekking Size 42",
            description: "Sepatu hiking grip kuat, anti selip & water resistant",
            price: 50000,
            vendor_id: user.id,
            rating: 4.7,
            available: 4,
            category: "other",
            group_discount_enabled: false,
            damage_terms: null
          }
        ]);
      }

      const { data: updatedUsers } = await supabase.from("users").select("*");
      if (updatedUsers) setUsers(updatedUsers);

      if (user.role === "guide") {
        const { data: updatedGuides } = await supabase.from("guides").select("*");
        if (updatedGuides && updatedUsers) {
          setGuides(
            updatedGuides.map((g: any) => {
              const u = updatedUsers.find((x: any) => x.id === g.id);
              return {
                id: g.id,
                name: u?.name || "Guide Name",
                specialty: g.specialty,
                location: g.location,
                experience: g.experience,
                trips: g.trips,
                rating: Number(g.rating),
                price: Number(g.price),
                avatar: u?.avatar || "https://api.dicebear.com/7.x/avataaars/svg",
                certifications: g.certifications || [],
                status: g.status,
                verified: u?.verified || false,
                specialtyMountains: g.specialty_mountains || [],
                busyDates: (g.busy_dates || []).map((d: any) => String(d)),
                groupDiscountEnabled: g.group_discount_enabled || false,
                discountPercentage: Number(g.discount_percentage || 0),
                biodata: g.biodata || "",
                ketentuan: g.ketentuan || "",
                couponCode: g.coupon_code || "",
                couponDiscount: Number(g.coupon_discount || 0),
                couponDeadline: g.coupon_deadline || ""
              };
            })
          );
        }
      } else if (user.role === "vendor") {
        const { data: updatedVendors } = await supabase.from("vendors").select("*");
        const { data: updatedEq } = await supabase.from("equipment_items").select("*");
        if (updatedVendors && updatedUsers) {
          setVendors(
            updatedVendors.map((v: any) => {
              const u = updatedUsers.find((x: any) => x.id === v.id);
              return {
                id: v.id,
                name: u?.name || "Vendor Name",
                location: v.location,
                verified: u?.verified || false,
                avatar: u?.avatar || "https://api.dicebear.com/7.x/identicon/svg",
                distances: v.distances || {},
                couponCode: v.coupon_code || "",
                couponDiscount: Number(v.coupon_discount || 0),
                couponDeadline: v.coupon_deadline || ""
              };
            })
          );
        }
        if (updatedEq && updatedUsers) {
          setEquipment(
            updatedEq.map((eq: any) => {
              const u = updatedUsers.find((x: any) => x.id === eq.vendor_id);
              return {
                id: eq.id,
                name: eq.name,
                description: eq.description,
                price: Number(eq.price),
                vendorId: eq.vendor_id,
                vendorName: u?.name || "Vendor Name",
                rating: Number(eq.rating),
                available: eq.available,
                category: eq.category,
                groupDiscountEnabled: eq.group_discount_enabled || false,
                damageTerms: eq.damage_terms,
                discountPercentage: Number(eq.discount_percentage || 0)
              };
            })
          );
        }
      }
    } catch (err) {
      console.error("Error auto-creating mock user:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        mountains,
        setMountains,
        guides,
        setGuides,
        vendors,
        equipment,
        setEquipment,
        tripPackages,
        setTripPackages,
        addTripPackage,
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
        toggleGroupDiscount,
        confirmEscrow,
        reportDamage,
        resolveEscrowWithDeposit,
        climberDeposit,
        guideWallet,
        vendorWallet,
        depositTransactions,
        userWarnings,
        topUpWallet,
        withdrawWallet,
        addWarning,
        removeWarning,
        collaborationProposals,
        addCollaborationProposal,
        respondToCollaborationProposal,
        users,
        updateUserStatus,
        toggleUserVerification,
        addManualUser,
        updateTripPackageStatus,
        userActivities,
        logUserActivity,
        ensureMockUserExists,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp must be used within AppProvider");
  return context;
};

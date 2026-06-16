import React, { createContext, useContext, useState, useEffect } from "react";

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
  role: "guide" | "vendor";
  documentName: string; // e.g., APIGI License, UKM Permit
  documentImage: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
}

export interface DepositTransaction {
  id: string;
  type: "topup" | "withdraw" | "refund" | "fine_deduction";
  amount: number;
  description: string;
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
  addVerificationRequest: (req: Omit<VerificationRequest, "id" | "status" | "createdAt">) => void;
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
  withdrawWallet: (role: "pendaki" | "guide" | "vendor", amount: number) => void;
  addWarning: (userId: string, text: string) => void;
  removeWarning: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// ─── Initial Mock Data ────────────────────────────────────────────────────────
const INITIAL_MOUNTAINS: Mountain[] = [
  { name: "Gunung Semeru", location: "Jawa Timur", province: "Jawa Timur", elevation: "3.676 mdpl", elevationM: 3676, difficulty: "Sulit", image: "https://images.unsplash.com/photo-1605860632725-fa88d0ce7a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.8, reviews: 2341, lat: -8.1077, lng: 112.9224, status: "Buka", ticketPrice: 35000, adminContactMethod: "Instagram", adminContactValue: "@semeru_official", basecamps: ["Ranupani"] },
  { name: "Gunung Rinjani", location: "Lombok, NTB", province: "NTB", elevation: "3.726 mdpl", elevationM: 3726, difficulty: "Sulit", image: "https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.9, reviews: 1876, lat: -8.4119, lng: 116.4675, status: "Buka", ticketPrice: 150000, adminContactMethod: "Website Resmi", adminContactValue: "https://bookingrinjani.id", basecamps: ["Sembalun", "Senaru", "Timbanuh", "Aik Berik"] },
  { name: "Gunung Bromo", location: "Jawa Timur", province: "Jawa Timur", elevation: "2.329 mdpl", elevationM: 2329, difficulty: "Mudah", image: "https://images.unsplash.com/photo-1587651687979-77cf05d1b841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.7, reviews: 3210, lat: -7.9425, lng: 112.9530, status: "Tutup", ticketPrice: 29000, adminContactMethod: "Website Resmi", adminContactValue: "https://bookingbromo.id", basecamps: ["Cemoro Lawang", "Tosari", "Ngadas", "Tumpang"] },
  { name: "Gunung Prau", location: "Jawa Tengah", province: "Jawa Tengah", elevation: "2.565 mdpl", elevationM: 2565, difficulty: "Sedang", image: "https://images.unsplash.com/photo-1568516475772-498b4379829c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.6, reviews: 1543, lat: -7.1884, lng: 109.9219, status: "Buka", ticketPrice: 20000, adminContactMethod: "WhatsApp", adminContactValue: "+628123456789", basecamps: ["Patakbanteng", "Dieng", "Kalilembu", "Wates", "Igirmranak"] },
  { name: "Gunung Merbabu", location: "Jawa Tengah", province: "Jawa Tengah", elevation: "3.145 mdpl", elevationM: 3145, difficulty: "Sedang", image: "https://images.unsplash.com/photo-1562157778-81d81be57eec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.7, reviews: 1987, lat: -7.4549, lng: 110.4332, status: "Buka", ticketPrice: 25000, adminContactMethod: "Website Resmi", adminContactValue: "https://tngmerbabu.id", basecamps: ["Selo", "Suwanting", "Wekas", "Cuntel", "Thekelan"] },
  { name: "Gunung Gede Pangrango", location: "Jawa Barat", province: "Jawa Barat", elevation: "2.958 mdpl", elevationM: 2958, difficulty: "Sedang", image: "https://images.unsplash.com/photo-1510797215324-95aa89f43c33?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.5, reviews: 2156, lat: -6.7893, lng: 106.9852, status: "Buka", ticketPrice: 29000, adminContactMethod: "Instagram", adminContactValue: "@gedepangrango_official", basecamps: ["Cibodas", "Gunung Putri", "Selabintana"] },
  { name: "Gunung Slamet", location: "Jawa Tengah", province: "Jawa Tengah", elevation: "3.428 mdpl", elevationM: 3428, difficulty: "Sulit", image: "https://images.unsplash.com/photo-1629814249584-bd4d53cf0ee3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.6, reviews: 1421, lat: -7.2424, lng: 109.2248, status: "Buka", ticketPrice: 30000, adminContactMethod: "Instagram", adminContactValue: "@slamet_official", basecamps: ["Bambangan", "Guci", "Kaliwadas", "Baturraden", "Dipajaya"] },
  { name: "Gunung Sindoro", location: "Jawa Tengah", province: "Jawa Tengah", elevation: "3.136 mdpl", elevationM: 3136, difficulty: "Sedang", image: "https://images.unsplash.com/photo-1600100397608-f010e9723049?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.7, reviews: 1120, lat: -7.3016, lng: 109.9972, status: "Buka", ticketPrice: 25000, adminContactMethod: "Website Resmi", adminContactValue: "https://bookingsindoro.id", basecamps: ["Kledung", "Alang-alang Sewu", "Bansari", "Sigedang"] },
  { name: "Gunung Sumbing", location: "Jawa Tengah", province: "Jawa Tengah", elevation: "3.371 mdpl", elevationM: 3371, difficulty: "Sulit", image: "https://images.unsplash.com/photo-1620921008688-6f6eb3df2d59?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.8, reviews: 980, lat: -7.3838, lng: 110.0728, status: "Buka", ticketPrice: 25000, adminContactMethod: "Instagram", adminContactValue: "@sumbing_official", basecamps: ["Garung", "Bowongso", "Sipetung", "Mangli", "Adipuro"] },
  { name: "Gunung Lawu", location: "Jawa Tengah/Timur", province: "Jawa Tengah", elevation: "3.265 mdpl", elevationM: 3265, difficulty: "Sedang", image: "https://images.unsplash.com/photo-1610890716171-6b1bb98ffd09?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.8, reviews: 1860, lat: -7.6258, lng: 111.1947, status: "Buka", ticketPrice: 20000, adminContactMethod: "Website Resmi", adminContactValue: "https://bookinglawu.id", basecamps: ["Cemoro Sewu", "Cemoro Kandang", "Candi Cetho", "Singolangu"] },
  { name: "Gunung Papandayan", location: "Garut, Jawa Barat", province: "Jawa Barat", elevation: "2.665 mdpl", elevationM: 2665, difficulty: "Mudah", image: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.6, reviews: 2210, lat: -7.3197, lng: 107.7288, status: "Buka", ticketPrice: 35000, adminContactMethod: "WhatsApp", adminContactValue: "+628765432100", basecamps: ["Camp David"] },
  { name: "Gunung Merapi", location: "Sleman, Yogyakarta", province: "Yogyakarta", elevation: "2.910 mdpl", elevationM: 2910, difficulty: "Sedang", image: "https://images.unsplash.com/photo-1580137189272-c9379f8864fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600", rating: 4.5, reviews: 1980, lat: -7.5407, lng: 110.4458, status: "Tutup", ticketPrice: 20000, adminContactMethod: "Website Resmi", adminContactValue: "https://tngmerapi.id", basecamps: ["Selo", "Plunyon"] }
];

const INITIAL_GUIDES: Guide[] = [
  { id: "guide1", name: "Ahmad Hidayat", specialty: "Gunung Semeru & Bromo", location: "Malang, Jawa Timur", experience: "8 Tahun", trips: 245, rating: 4.9, verified: true, price: 500000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad", certifications: ["APIGI", "Pertolongan Pertama"], status: "Aktif", specialtyMountains: ["Gunung Semeru", "Gunung Bromo"], busyDates: ["2026-07-15", "2026-07-20"] },
  { id: "guide2", name: "Budi Santoso", specialty: "Gunung Rinjani", location: "Lombok, NTB", experience: "10 Tahun", trips: 312, rating: 5.0, verified: true, price: 650000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi", certifications: ["APIGI", "HPI"], status: "Libur", specialtyMountains: ["Gunung Rinjani"], busyDates: ["2026-07-18"] },
  { id: "guide3", name: "Candra Wijaya", specialty: "Pendakian Jawa Tengah", location: "Magelang, Jawa Tengah", experience: "6 Tahun", trips: 178, rating: 4.8, verified: true, price: 450000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Candra", certifications: ["APIGI"], status: "Non-Aktif", specialtyMountains: ["Gunung Prau", "Gunung Merbabu"], busyDates: [] },
  { id: "guide4", name: "Doni Prasetyo", specialty: "Semua Gunung di Indonesia", location: "Bogor, Jawa Barat", experience: "7 Tahun", trips: 198, rating: 4.7, verified: false, price: 400000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Doni", certifications: ["APIGI", "SAR"], status: "Aktif", specialtyMountains: ["Semua Gunung"], busyDates: ["2026-07-10"] },
  { id: "guide5", name: "Eko Wahyudi", specialty: "Gunung Slamet & Sindoro", location: "Wonosobo, Jawa Tengah", experience: "5 Tahun", trips: 112, rating: 4.8, verified: true, price: 450000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Eko", certifications: ["APIGI"], status: "Aktif", specialtyMountains: ["Gunung Slamet", "Gunung Sindoro"], busyDates: [] },
  { id: "guide6", name: "Fajar Pratama", specialty: "Gunung Lawu & Sumbing", location: "Solo, Jawa Tengah", experience: "9 Tahun", trips: 220, rating: 4.9, verified: true, price: 500000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fajar", certifications: ["APIGI", "HPI"], status: "Aktif", specialtyMountains: ["Gunung Lawu", "Gunung Sumbing"], busyDates: [] },
  { id: "guide7", name: "Gilang Ramadhan", specialty: "Gunung Papandayan & Gede", location: "Bandung, Jawa Barat", experience: "4 Tahun", trips: 88, rating: 4.7, verified: true, price: 400000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Gilang", certifications: ["APIGI"], status: "Aktif", specialtyMountains: ["Gunung Papandayan", "Gunung Gede Pangrango"], busyDates: [] },
  { id: "guide8", name: "Hendra Wijaya", specialty: "Gunung Rinjani & Semeru", location: "Surabaya, Jawa Timur", experience: "12 Tahun", trips: 410, rating: 5.0, verified: true, price: 700000, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hendra", certifications: ["APIGI", "SAR", "HPI"], status: "Aktif", specialtyMountains: ["Gunung Rinjani", "Gunung Semeru"], busyDates: [] }
];

const INITIAL_VENDORS: Vendor[] = [
  { id: "vendor1", name: "Outdoor Adventure Store", location: "Malang, Jawa Timur", rating: 4.8, verified: true, avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=outdoor", distances: { "Gunung Semeru": 3.5, "Gunung Bromo": 8.0, "Gunung Rinjani": 380, "Gunung Prau": 350, "Gunung Merbabu": 320, "Gunung Gede Pangrango": 710, "Gunung Slamet": 310, "Gunung Sindoro": 280, "Gunung Sumbing": 270, "Gunung Lawu": 180, "Gunung Papandayan": 610, "Gunung Merapi": 290 } },
  { id: "vendor2", name: "Summit Gear Rental", location: "Lombok, NTB", rating: 4.9, verified: true, avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=summit", distances: { "Gunung Rinjani": 2.1, "Gunung Semeru": 340, "Gunung Bromo": 330, "Gunung Prau": 420, "Gunung Merbabu": 410, "Gunung Gede Pangrango": 890, "Gunung Slamet": 480, "Gunung Sindoro": 450, "Gunung Sumbing": 440, "Gunung Lawu": 350, "Gunung Papandayan": 820, "Gunung Merapi": 400 } },
  { id: "vendor3", name: "Mountain Camp Store", location: "Wonosobo, Jawa Tengah", rating: 4.7, verified: true, avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=mountain", distances: { "Gunung Prau": 9.2, "Gunung Merbabu": 28.0, "Gunung Semeru": 280, "Gunung Bromo": 270, "Gunung Rinjani": 520, "Gunung Gede Pangrango": 310, "Gunung Slamet": 45, "Gunung Sindoro": 15, "Gunung Sumbing": 25, "Gunung Lawu": 120, "Gunung Papandayan": 240, "Gunung Merapi": 65 } },
  { id: "vendor4", name: "Cianjur Lestari Rental", location: "Cianjur, Jawa Barat", rating: 4.5, verified: false, avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=cianjur", distances: { "Gunung Gede Pangrango": 5.4, "Gunung Prau": 290, "Gunung Semeru": 690, "Gunung Bromo": 680, "Gunung Rinjani": 910, "Gunung Merbabu": 410, "Gunung Slamet": 240, "Gunung Sindoro": 270, "Gunung Sumbing": 280, "Gunung Lawu": 380, "Gunung Papandayan": 72, "Gunung Merapi": 300 } },
];

const INITIAL_EQUIPMENT: EquipmentItem[] = [
  { id: "eq1", name: "Tenda Dome 4 Orang", description: "Kapasitas 4 orang, waterproof, mudah dipasang", price: 75000, vendorId: "vendor1", vendorName: "Outdoor Adventure Store", rating: 4.8, available: 5, category: "tent" },
  { id: "eq2", name: "Tenda Ultralight 2 Orang", description: "Ringan, compact, ideal untuk pendakian solo/duo", price: 50000, vendorId: "vendor2", vendorName: "Summit Gear Rental", rating: 4.9, available: 8, category: "tent" },
  { id: "eq3", name: "Tenda Keluarga 6 Orang", description: "Kapasitas besar, double layer, ventilasi baik", price: 100000, vendorId: "vendor3", vendorName: "Mountain Camp Store", rating: 4.7, available: 3, category: "tent" },
  { id: "eq4", name: "Carrier 60L", description: "Kapasitas besar, ergonomis, raincover included", price: 40000, vendorId: "vendor2", vendorName: "Summit Gear Rental", rating: 4.7, available: 12, category: "carrier" },
  { id: "eq5", name: "Carrier 50L", description: "Medium size, cocok untuk 2-3 hari pendakian", price: 35000, vendorId: "vendor3", vendorName: "Mountain Camp Store", rating: 4.6, available: 15, category: "carrier" },
  { id: "eq6", name: "Sleeping Bag -5°C", description: "Tahan suhu -5°C, ringan dan hangat", price: 30000, vendorId: "vendor3", vendorName: "Mountain Camp Store", rating: 4.8, available: 20, category: "other" },
  { id: "eq7", name: "Kompor Camping + Gas", description: "Kompor portable dengan tabung gas 230gr", price: 25000, vendorId: "vendor2", vendorName: "Summit Gear Rental", rating: 4.7, available: 18, category: "other" },
  { id: "eq8", name: "Trekking Pole Set", description: "Adjustable, anti-slip grip, aluminium", price: 25000, vendorId: "vendor3", vendorName: "Mountain Camp Store", rating: 4.5, available: 15, category: "other" },
  { id: "eq9", name: "Cooking Set Nesting", description: "Panci camping anti lengket, 1 set isi 4 item", price: 20000, vendorId: "vendor1", vendorName: "Outdoor Adventure Store", rating: 4.8, available: 10, category: "other" },
  { id: "eq10", name: "Headlamp LED Rechargeable", description: "Lampu kepala rechargeable, waterproof, 3 mode sinar", price: 15000, vendorId: "vendor3", vendorName: "Mountain Camp Store", rating: 4.7, available: 25, category: "other" },
  { id: "eq11", name: "Jaket Windbreaker TNF", description: "Jaket windproof & waterproof untuk cuaca dingin", price: 35000, vendorId: "vendor3", vendorName: "Mountain Camp Store", rating: 4.6, available: 12, category: "other" },
  { id: "eq12", name: "Matras Angin Eiger", description: "Kasur angin tiup manual, empuk & menahan dingin tanah", price: 20000, vendorId: "vendor2", vendorName: "Summit Gear Rental", rating: 4.9, available: 10, category: "other" },
  { id: "eq13", name: "Flysheet 3x4 meter", description: "Tenda peneduh anti air pelindung tenda utama", price: 15000, vendorId: "vendor1", vendorName: "Outdoor Adventure Store", rating: 4.7, available: 8, category: "other" },
  { id: "eq14", name: "Sleeping Pad Foam", description: "Matras busa lipat aluminium foil pemantul panas tubuh", price: 10000, vendorId: "vendor3", vendorName: "Mountain Camp Store", rating: 4.5, available: 30, category: "other" },
  { id: "eq15", name: "Portable Gas Refill 230g", description: "Tabung gas butana portable untuk memasak", price: 10000, vendorId: "vendor2", vendorName: "Summit Gear Rental", rating: 4.8, available: 50, category: "other" },
  { id: "eq16", name: "Peta Navigasi & Kompas", description: "Kompas bidik militer beserta peta topografi", price: 15000, vendorId: "vendor3", vendorName: "Mountain Camp Store", rating: 4.6, available: 5, category: "other" },
  { id: "eq17", name: "First Aid Kit (P3K) Lengkap", description: "Kotak obat standar pendakian dengan perban & antiseptik", price: 10000, vendorId: "vendor3", vendorName: "Mountain Camp Store", rating: 4.9, available: 20, category: "other" },
  { id: "eq18", name: "Sepatu Trekking Size 42", description: "Sepatu hiking grip kuat, anti selip & water resistant", price: 50000, vendorId: "vendor1", vendorName: "Outdoor Adventure Store", rating: 4.7, available: 4, category: "other" }
];

const INITIAL_PACKAGES: TripPackage[] = [
  {
    id: "pkg1",
    title: "Paket Rinjani Summit Premium (All-In)",
    guideId: "guide2",
    guideName: "Budi Santoso",
    vendorId: "vendor2",
    vendorName: "Summit Gear Rental",
    description: "Paket pendakian Rinjani premium lengkap dengan tenda ultralight, makanan mewah selama pendakian, porter tim, dan transportasi PP dari Bandara Lombok.",
    duration: "3 Hari 2 Malam",
    price: 1850000,
    promoDeadline: "2026-07-01",
    services: ["Simaksi & Asuransi Rinjani", "Tenda Ultralight Double Layer", "Menu Makan Premium 3x sehari", "Transport Bandara PP Lombok", "Sleeping Bag & Matras Angin"],
    rundown: ["Hari 1: Penjemputan di Bandara, perjalanan ke Sembalun, trekking ke Crater Rim Sembalun", "Hari 2: Summit Attack 3726m, turun ke Segara Anak (Mancing & Berendam Air Panas)", "Hari 3: Trekking naik ke Senaru Rim, turun ke basecamp Senaru, transfer Bandara"],
    image: "https://images.unsplash.com/photo-1589309736404-2e142a2acdf0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    targetMountain: "Gunung Rinjani"
  },
  {
    id: "pkg2",
    title: "Paket Hemat Prau Sunrise Trip",
    guideId: "guide3",
    guideName: "Candra Wijaya",
    vendorId: "vendor3",
    vendorName: "Mountain Camp Store",
    description: "Nikmati keindahan sunrise terbaik se-Jawa di Puncak Gunung Prau Dieng. Paket hemat sudah termasuk guide berlisensi, perlengkapan tidur hangat, dan dokumentasi puncak.",
    duration: "2 Hari 1 Malam",
    price: 650000,
    promoDeadline: "2026-06-30",
    services: ["Simaksi Prau", "Guide Berlisensi APIGI", "Sleeping Bag Hangat", "Tenda Dome Sharing", "Makan Malam & Sarapan Hangat"],
    rundown: ["Hari 1: Trekking santai lewat Patak Banteng ke Area Camp, hunting Sunset", "Hari 2: Menikmati Golden Sunrise di sunrise point Prau, sarapan, trekking turun kembali"],
    image: "https://images.unsplash.com/photo-1568516475772-498b4379829c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600",
    targetMountain: "Gunung Prau"
  }
];

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [mountains, setMountains] = useState<Mountain[]>(INITIAL_MOUNTAINS);
  const [guides, setGuides] = useState<Guide[]>(INITIAL_GUIDES);
  const [equipment, setEquipment] = useState<EquipmentItem[]>(INITIAL_EQUIPMENT);

  const [climberDeposit, setClimberDeposit] = useState<number>(() => {
    const saved = localStorage.getItem("ayok_climber_deposit");
    return saved ? parseInt(saved) : 500000;
  });

  const [guideWallet, setGuideWallet] = useState<number>(() => {
    const saved = localStorage.getItem("ayok_guide_wallet");
    return saved ? parseInt(saved) : 1500000;
  });

  const [vendorWallet, setVendorWallet] = useState<number>(() => {
    const saved = localStorage.getItem("ayok_vendor_wallet");
    return saved ? parseInt(saved) : 2000000;
  });

  const [userWarnings, setUserWarnings] = useState<UserWarning[]>(() => {
    const saved = localStorage.getItem("ayok_user_warnings");
    return saved ? JSON.parse(saved) : [];
  });

  const [depositTransactions, setDepositTransactions] = useState<DepositTransaction[]>(() => {
    const saved = localStorage.getItem("ayok_deposit_transactions");
    return saved ? JSON.parse(saved) : [
      { id: "tx_mock1", type: "topup", amount: 500000, description: "Saldo awal deposit jaminan", createdAt: "2026-06-15 10:00" }
    ];
  });

  // Load dynamically created data from LocalStorage or use defaults
  const [tripPackages, setTripPackages] = useState<TripPackage[]>(() => {
    const saved = localStorage.getItem("ayok_packages");
    return saved ? JSON.parse(saved) : INITIAL_PACKAGES;
  });

  const [bookings, setBookings] = useState<Booking[]>(() => {
    const saved = localStorage.getItem("ayok_bookings");
    return saved ? JSON.parse(saved) : [
      { id: "book_mock1", mountainName: "Gunung Semeru", guideId: "guide1", guideName: "Ahmad Hidayat", pendakiName: "Zaki Firdaus", pendakiId: "pendaki1", bookingDate: "2026-07-10", createdAt: "2026-06-15", price: 500000, status: "Telah Dibayar", bookingType: "mandiri", preTripMeetingDate: "2026-07-09", preTripMeetingTime: "19:00 - 19:30", preTripMeetingLink: "https://meet.google.com/abc-defg-hij", depositAmount: 100000, depositStatus: "held", climbersCount: 1 },
      { id: "book_mock2", mountainName: "Gunung Semeru", pendakiName: "Zaki Firdaus", pendakiId: "pendaki1", bookingDate: "2026-07-10", createdAt: "2026-06-15", price: 35000, status: "Telah Dibayar", officialTicketBooking: true, bookingType: "mandiri", depositAmount: 100000, depositStatus: "held" }
    ];
  });

  const [rentalOrders, setRentalOrders] = useState<RentalOrder[]>(() => {
    const saved = localStorage.getItem("ayok_rentals");
    return saved ? JSON.parse(saved) : [
      { id: "rent_mock1", itemId: "eq1", itemName: "Tenda Dome 4 Orang", vendorId: "vendor1", vendorName: "Outdoor Adventure Store", pendakiId: "pendaki1", pendakiName: "Zaki Firdaus", qty: 2, startDate: "2026-07-09", endDate: "2026-07-12", totalPrice: 450000, status: "Menunggu Konfirmasi", depositAmount: 100000, depositStatus: "held" }
    ];
  });

  const [negotiations, setNegotiations] = useState<Negotiation[]>(() => {
    const saved = localStorage.getItem("ayok_negos");
    return saved ? JSON.parse(saved) : [
      { id: "nego_mock1", type: "rental", orderId: "rent_mock1", itemName: "Tenda Dome 4 Orang (2 Pcs, 3 Hari)", originalPrice: 450000, proposedPrice: 380000, senderName: "Zaki Firdaus", recipientId: "vendor1", recipientName: "Outdoor Adventure Store", status: "pending" }
    ];
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    const saved = localStorage.getItem("ayok_chats");
    return saved ? JSON.parse(saved) : [
      { id: "chat_mock1", chatPartnerId: "guide1", chatPartnerName: "Ahmad Hidayat", senderId: "pendaki1", senderName: "Zaki Firdaus", message: "Halo mas Ahmad, ready buat tanggal 10 Juli nanti ke Semeru?", timestamp: "18:30" },
      { id: "chat_mock2", chatPartnerId: "guide1", chatPartnerName: "Ahmad Hidayat", senderId: "guide1", senderName: "Ahmad Hidayat", message: "Halo mas! Siap, jadwal saya kosong tanggal segitu. Silakan diajukan booking ya.", timestamp: "18:32" }
    ];
  });

  const [verificationRequests, setVerificationRequests] = useState<VerificationRequest[]>(() => {
    const saved = localStorage.getItem("ayok_verifications");
    return saved ? JSON.parse(saved) : [
      { id: "ver_mock1", userId: "guide4", userName: "Doni Prasetyo", role: "guide", documentName: "Sertifikasi APIGI & SAR", documentImage: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400", status: "pending", createdAt: "2026-06-15" }
    ];
  });

  // Save changes to localStorage
  useEffect(() => { localStorage.setItem("ayok_packages", JSON.stringify(tripPackages)); }, [tripPackages]);
  useEffect(() => { localStorage.setItem("ayok_bookings", JSON.stringify(bookings)); }, [bookings]);
  useEffect(() => { localStorage.setItem("ayok_rentals", JSON.stringify(rentalOrders)); }, [rentalOrders]);
  useEffect(() => { localStorage.setItem("ayok_negos", JSON.stringify(negotiations)); }, [negotiations]);
  useEffect(() => { localStorage.setItem("ayok_chats", JSON.stringify(chatMessages)); }, [chatMessages]);
  useEffect(() => { localStorage.setItem("ayok_verifications", JSON.stringify(verificationRequests)); }, [verificationRequests]);
  useEffect(() => { localStorage.setItem("ayok_climber_deposit", climberDeposit.toString()); }, [climberDeposit]);
  useEffect(() => { localStorage.setItem("ayok_guide_wallet", guideWallet.toString()); }, [guideWallet]);
  useEffect(() => { localStorage.setItem("ayok_vendor_wallet", vendorWallet.toString()); }, [vendorWallet]);
  useEffect(() => { localStorage.setItem("ayok_user_warnings", JSON.stringify(userWarnings)); }, [userWarnings]);
  useEffect(() => { localStorage.setItem("ayok_deposit_transactions", JSON.stringify(depositTransactions)); }, [depositTransactions]);

  // ─── Booking Actions ────────────────────────────────────────────────────────
  const addBooking = (bookingData: Omit<Booking, "id" | "createdAt" | "status">) => {
    const id = "book_" + Math.random().toString(36).substring(2, 9);
    
    // Automatically pre-populate pre-trip meeting link & date for guide booking
    let preTripDate = "";
    let preTripTime = "";
    let preTripLink = "";
    if (bookingData.guideId) {
      const bDate = new Date(bookingData.bookingDate);
      const mDate = new Date(bDate.getTime() - 24 * 60 * 60 * 1000); // 1 day before trip
      preTripDate = mDate.toISOString().split("T")[0];
      preTripTime = "19:30 - 20:00 WIB";
      preTripLink = "https://meet.google.com/yok-mend-meet";
    }

    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Deduct deposit from climber wallet
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
      status: bookingData.guideId && bookingData.bookingType === "mandiri" ? "Menunggu Konfirmasi" : "Menunggu Pembayaran",
      preTripMeetingDate: preTripDate || undefined,
      preTripMeetingTime: preTripTime || undefined,
      preTripMeetingLink: preTripLink || undefined,
      depositAmount: 100000,
      depositStatus: "held"
    };
    setBookings((prev) => [newBooking, ...prev]);
    return id;
  };

  const updateBookingStatus = (id: string, status: Booking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  // ─── Rental Actions ─────────────────────────────────────────────────────────
  const addRentalOrder = (orderData: Omit<RentalOrder, "id" | "status">) => {
    const id = "rent_" + Math.random().toString(36).substring(2, 9);
    
    const now = new Date();
    const dateStr = `${now.getFullYear()}-${(now.getMonth()+1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

    // Deduct deposit from climber wallet
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
    return id;
  };

  const updateRentalStatus = (id: string, status: RentalOrder["status"]) => {
    setRentalOrders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status } : r))
    );
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

    // Update status pemesanan
    if (negoData.type === "guide") {
      updateBookingStatus(negoData.orderId, "Menunggu Konfirmasi");
    } else {
      updateRentalStatus(negoData.orderId, "Menunggu Konfirmasi");
    }
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

        // Sync with related booking/rental status
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
          } else {
            setRentalOrders((prevRentals) =>
              prevRentals.map((r) =>
                r.id === n.orderId
                  ? { ...r, totalPrice: finalPrice, status: "Menunggu Pembayaran" }
                  : r
              )
            );
          }
        } else if (action === "countered" && counterPrice) {
          if (n.type === "guide") {
            setBookings((prevBookings) =>
              prevBookings.map((b) =>
                b.id === n.orderId ? { ...b, price: counterPrice } : b
              )
            );
          } else {
            setRentalOrders((prevRentals) =>
              prevRentals.map((r) =>
                r.id === n.orderId ? { ...r, totalPrice: counterPrice } : r
              )
            );
          }
        } else if (action === "rejected") {
          if (n.type === "guide") {
            updateBookingStatus(n.orderId, "Dibatalkan");
          } else {
            updateRentalStatus(n.orderId, "Dibatalkan");
          }
        }

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
  };

  // ─── Admin Verification Actions ─────────────────────────────────────────────
  const respondToVerification = (id: string, approve: boolean) => {
    setVerificationRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: approve ? "approved" : "rejected" } : r))
    );

    const req = verificationRequests.find((r) => r.id === id);
    if (!req) return;

    if (req.role === "guide") {
      setGuides((prev) =>
        prev.map((g) => (g.id === req.userId ? { ...g, verified: approve, status: approve ? "Aktif" : g.status } : g))
      );
    }
  };

  const addVerificationRequest = (reqData: Omit<VerificationRequest, "id" | "status" | "createdAt">) => {
    const id = "ver_" + Math.random().toString(36).substring(2, 9);
    const newReq: VerificationRequest = {
      ...reqData,
      id,
      status: "pending",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setVerificationRequests((prev) => [newReq, ...prev]);
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
  };

  const updateEquipmentItem = (id: string, itemData: Partial<EquipmentItem>) => {
    setEquipment((prev) =>
      prev.map((eq) => (eq.id === id ? { ...eq, ...itemData } : eq))
    );
  };

  const deleteEquipmentItem = (id: string) => {
    setEquipment((prev) => prev.filter((eq) => eq.id !== id));
  };

  // ─── Trip Package Actions ───────────────────────────────────────────────────
  const addTripPackage = (pkgData: Omit<TripPackage, "id">) => {
    const id = "pkg_" + Math.random().toString(36).substring(2, 9);
    const newPkg: TripPackage = {
      ...pkgData,
      id
    };
    setTripPackages((prev) => [newPkg, ...prev]);
  };

  // ─── Dispute Actions ────────────────────────────────────────────────────────
  const submitDispute = (type: "booking" | "rental", id: string, notes: string) => {
    if (type === "booking") {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: "Dispute", disputeNotes: notes } : b))
      );
    } else {
      setRentalOrders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "Dispute", disputeNotes: notes } : r))
      );
    }
  };

  const resolveDispute = (type: "booking" | "rental", id: string, refund: boolean) => {
    if (type === "booking") {
      setBookings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, status: refund ? "Dibatalkan" : "Selesai", depositStatus: refund ? "refunded" : "held" } : b))
      );
    } else {
      setRentalOrders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: refund ? "Dibatalkan" : "Selesai", depositStatus: refund ? "refunded" : "held" } : r))
      );
    }
  };

  const toggleGroupDiscount = (role: "guide" | "vendor", id: string) => {
    if (role === "guide") {
      setGuides((prev) =>
        prev.map((g) => (g.id === id ? { ...g, groupDiscountEnabled: !g.groupDiscountEnabled } : g))
      );
    } else {
      setEquipment((prev) =>
        prev.map((eq) => (eq.id === id ? { ...eq, groupDiscountEnabled: !eq.groupDiscountEnabled } : eq))
      );
    }
  };

  const confirmEscrow = (type: "booking" | "rental", id: string, role: "pendaki" | "guide" | "vendor") => {
    if (type === "booking") {
      setBookings((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          const updated = { ...b };
          if (role === "pendaki") updated.pendakiConfirmed = true;
          else updated.partnerConfirmed = true;
          return updated;
        })
      );
    } else {
      setRentalOrders((prev) =>
        prev.map((r) => {
          if (r.id !== id) return r;
          const updated = { ...r };
          if (role === "pendaki") updated.pendakiConfirmed = true;
          else updated.partnerConfirmed = true;
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
    } else {
      setRentalOrders((prev) =>
        prev.map((r) => (r.id === id ? { ...r, fineAmount, fineNotes } : r))
      );
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
          
          if (approveFine && fine > 0) {
            if (fine >= dep) {
              depStatus = "forfeited";
              const excess = fine - dep;
              if (excess > 0) {
                setClimberDeposit((prevDep) => Math.max(0, prevDep - excess));
                setDepositTransactions((prevTx) => [
                  {
                    id: "tx_" + Math.random().toString(36).substring(2, 9),
                    type: "fine_deduction",
                    amount: excess,
                    description: `Kekurangan denda pelanggaran booking ${b.mountainName}: ${b.fineNotes || ""}`,
                    createdAt: dateStr
                  },
                  ...prevTx
                ]);
              }
            } else {
              depStatus = "partially_refunded";
              const refundAmount = dep - fine;
              setClimberDeposit((prevDep) => prevDep + refundAmount);
              setDepositTransactions((prevTx) => [
                {
                  id: "tx_" + Math.random().toString(36).substring(2, 9),
                  type: "refund",
                  amount: refundAmount,
                  description: `Sisa pengembalian deposit jaminan booking ${b.mountainName}`,
                  createdAt: dateStr
                },
                ...prevTx
              ]);
            }
            // Log the main fine deduction
            setDepositTransactions((prevTx) => [
              {
                id: "tx_" + Math.random().toString(36).substring(2, 9),
                type: "fine_deduction",
                amount: Math.min(fine, dep),
                description: `Denda pelanggaran booking ${b.mountainName}: ${b.fineNotes || ""}`,
                createdAt: dateStr
              },
              ...prevTx
            ]);
          } else {
            // Refund full deposit
            setClimberDeposit((prevDep) => prevDep + dep);
            setDepositTransactions((prevTx) => [
              {
                id: "tx_" + Math.random().toString(36).substring(2, 9),
                type: "refund",
                amount: dep,
                description: `Pengembalian penuh deposit jaminan booking ${b.mountainName}`,
                createdAt: dateStr
              },
              ...prevTx
            ]);
          }

          // Payout to Guide (90% + fine)
          const platformFee = Math.round(b.price * 0.1);
          const basePayout = b.price - platformFee;
          const finalPayout = basePayout + (approveFine ? fine : 0);
          setGuideWallet((prev) => prev + finalPayout);
          setDepositTransactions((prevTx) => [
            {
              id: "tx_" + Math.random().toString(36).substring(2, 9),
              type: "refund",
              amount: finalPayout,
              description: `Penerimaan sewa jasa trip ${b.mountainName} &middot; Pendaki: ${b.pendakiName} ${approveFine ? `(Termasuk denda Rp ${fine.toLocaleString("id-ID")})` : ""}`,
              createdAt: dateStr
            },
            ...prevTx
          ]);
          
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
          
          if (approveFine && fine > 0) {
            if (fine >= dep) {
              depStatus = "forfeited";
              const excess = fine - dep;
              if (excess > 0) {
                setClimberDeposit((prevDep) => Math.max(0, prevDep - excess));
                setDepositTransactions((prevTx) => [
                  {
                    id: "tx_" + Math.random().toString(36).substring(2, 9),
                    type: "fine_deduction",
                    amount: excess,
                    description: `Kekurangan denda kerusakan rental ${r.itemName}: ${r.fineNotes || ""}`,
                    createdAt: dateStr
                  },
                  ...prevTx
                ]);
              }
            } else {
              depStatus = "partially_refunded";
              const refundAmount = dep - fine;
              setClimberDeposit((prevDep) => prevDep + refundAmount);
              setDepositTransactions((prevTx) => [
                {
                  id: "tx_" + Math.random().toString(36).substring(2, 9),
                  type: "refund",
                  amount: refundAmount,
                  description: `Sisa pengembalian deposit jaminan rental ${r.itemName}`,
                  createdAt: dateStr
                },
                ...prevTx
              ]);
            }
            // Log the main fine deduction
            setDepositTransactions((prevTx) => [
              {
                id: "tx_" + Math.random().toString(36).substring(2, 9),
                type: "fine_deduction",
                amount: Math.min(fine, dep),
                description: `Denda kerusakan rental ${r.itemName}: ${r.fineNotes || ""}`,
                createdAt: dateStr
              },
              ...prevTx
            ]);
          } else {
            // Refund full deposit
            setClimberDeposit((prevDep) => prevDep + dep);
            setDepositTransactions((prevTx) => [
              {
                id: "tx_" + Math.random().toString(36).substring(2, 9),
                type: "refund",
                amount: dep,
                description: `Pengembalian penuh deposit jaminan rental ${r.itemName}`,
                createdAt: dateStr
              },
              ...prevTx
            ]);
          }

          // Payout to Vendor (90% + fine)
          const platformFee = Math.round(r.totalPrice * 0.1);
          const basePayout = r.totalPrice - platformFee;
          const finalPayout = basePayout + (approveFine ? fine : 0);
          setVendorWallet((prev) => prev + finalPayout);
          setDepositTransactions((prevTx) => [
            {
              id: "tx_" + Math.random().toString(36).substring(2, 9),
              type: "refund",
              amount: finalPayout,
              description: `Penerimaan sewa alat ${r.itemName} &middot; Pendaki: ${r.pendakiName} ${approveFine ? `(Termasuk denda Rp ${fine.toLocaleString("id-ID")})` : ""}`,
              createdAt: dateStr
            },
            ...prevTx
          ]);
          
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
  };

  const withdrawWallet = (role: "pendaki" | "guide" | "vendor", amount: number) => {
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
        description: `Penarikan Dana Dompet (${role.toUpperCase()})`,
        createdAt: dateStr
      },
      ...prev
    ]);
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
  };

  const removeWarning = (id: string) => {
    setUserWarnings((prev) => prev.filter((w) => w.id !== id));
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
        vendors: INITIAL_VENDORS,
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

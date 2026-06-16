import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Mountain,
  Search,
  Shield,
  CreditCard,
  MessageCircle,
  Star,
  Users,
  Package,
  CheckCircle2,
  ChevronRight,
  Calendar,
  Clock,
  Award,
  X,
  Ticket
} from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useApp, TripPackage } from "../context/AppContext";
import { toast } from "sonner";

export function HomePage() {
  const { tripPackages, addBooking, currentUser } = useApp();
  const navigate = useNavigate();

  // Booking Package Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedPkg, setSelectedPkg] = useState<TripPackage | null>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [climbersCount, setClimbersCount] = useState(1);

  const features = [
    {
      icon: Mountain,
      title: "Discovery Gunung",
      description: "Temukan informasi lengkap gunung, jalur pendakian, tingkat kesulitan, dan perkiraan cuaca terkini"
    },
    {
      icon: Users,
      title: "Booking Guide Profesional",
      description: "Guide bersertifikasi APIGI/HPI dengan verifikasi dokumen dan sistem review transparan"
    },
    {
      icon: Package,
      title: "Sewa Alat Outdoor",
      description: "Penyewaan perlengkapan pendakian dari vendor terverifikasi dengan harga kompetitif"
    },
    {
      icon: CreditCard,
      title: "Pembayaran Escrow Aman",
      description: "Dana ditahan platform dan diteruskan setelah layanan selesai untuk perlindungan maksimal"
    },
    {
      icon: MessageCircle,
      title: "In-App Chat",
      description: "Komunikasi langsung dengan guide dan vendor untuk koordinasi perjalanan"
    },
    {
      icon: Shield,
      title: "Verifikasi Terpercaya",
      description: "Semua guide dan vendor melalui proses verifikasi dokumen ketat oleh admin"
    }
  ];

  const testimonials = [
    {
      name: "Rina Wijayanti",
      location: "Jakarta",
      rating: 5,
      comment: "Pengalaman mendaki Rinjani jadi lebih mudah dengan AyokMendaki. Guide profesional dan alat rental sangat lengkap!",
      trip: "Gunung Rinjani"
    },
    {
      name: "Dedi Prasetyo",
      location: "Bandung",
      rating: 5,
      comment: "Sistem escrow bikin tenang, payment gateway juga mudah. Recommended banget untuk pendaki pemula!",
      trip: "Gunung Prau"
    },
    {
      name: "Lisa Maharani",
      location: "Surabaya",
      rating: 4,
      comment: "Platform yang sangat membantu. Informasi gunung lengkap dan guide sangat berpengalaman.",
      trip: "Gunung Semeru"
    }
  ];

  const handleOpenBookingPkg = (pkg: TripPackage) => {
    if (!currentUser) {
      toast.warning("Silakan masuk terlebih dahulu untuk memesan paket pendakian.");
      navigate("/login");
      return;
    }
    setSelectedPkg(pkg);
    setBookingDate("");
    setClimbersCount(1);
    setBookingModalOpen(true);
  };

  const handleConfirmPkgBooking = () => {
    if (!bookingDate) {
      toast.error("Silakan tentukan tanggal pendakian.");
      return;
    }
    if (climbersCount < 1) {
      toast.error("Jumlah pendaki minimal 1 orang.");
      return;
    }
    if (!selectedPkg) return;

    const totalPrice = selectedPkg.price * climbersCount;

    // Add booking to global state
    addBooking({
      mountainName: selectedPkg.targetMountain,
      guideId: selectedPkg.guideId,
      guideName: selectedPkg.guideName,
      pendakiId: currentUser?.id || "guest",
      pendakiName: currentUser?.name || "Pendaki Demo",
      bookingDate,
      price: totalPrice,
      bookingType: "paket",
      packageId: selectedPkg.id
    });

    setBookingModalOpen(false);
    toast.success(`Booking paket "${selectedPkg.title}" berhasil diajukan!`, {
      description: `Rundown & Pre-trip meeting 30 menit sudah terjadwal di dashboard Anda.`,
    });
    navigate("/dashboard");
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('https://images.unsplash.com/photo-1558005530-a7958896ec60?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center text-white">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
            Jelajahi Puncak Indonesia<br />Bersama Guide Terpercaya
          </h1>
          <p className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto">
            Platform marketplace pendakian gunung yang menghubungkan pendaki dengan guide profesional dan vendor rental alat terpercaya
          </p>

          <div className="max-w-2xl mx-auto bg-white rounded-lg p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Cari gunung, guide, atau alat..."
                className="pl-10 bg-input-background border-0 text-gray-700"
              />
            </div>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => navigate("/gunung")}>
              Cari Sekarang
            </Button>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-400" />
              <span>Guide Terverifikasi</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-400" />
              <span>Pembayaran Aman</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="size-5 text-emerald-400" />
              <span>Review Transparan</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">Fitur Unggulan</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              AyokMendaki menyediakan semua yang Anda butuhkan untuk pengalaman pendakian yang aman dan menyenangkan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow bg-white">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                    <feature.icon className="size-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-lg font-bold">{feature.title}</CardTitle>
                  <CardDescription className="text-xs text-gray-500 leading-relaxed">{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trip Packages (Ads / Iklan) Section */}
      <section className="py-20 bg-gradient-to-b from-white to-emerald-50/20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Iklan Kemitraan / Featured Ads</span>
            <h2 className="text-3xl sm:text-4xl font-bold mb-3 mt-2 text-gray-800">Paket Pendakian Populer (Ads)</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-sm">
              Pilihan paket all-in-one hasil kolaborasi eksklusif Tour Guide & Vendor Rental setempat untuk pendakian yang bebas ribet.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {tripPackages.map((pkg) => (
              <Card key={pkg.id} className="overflow-hidden bg-white border border-gray-150 hover:shadow-xl transition-all flex flex-col md:flex-row">
                <div className="relative md:w-2/5 h-48 md:h-auto shrink-0">
                  <img src={pkg.image} alt={pkg.title} className="w-full h-full object-cover" />
                  <span className="absolute top-3 left-3 bg-emerald-600 text-white font-bold text-[10px] px-2 py-0.5 rounded shadow-sm">
                    {pkg.duration}
                  </span>
                </div>
                <CardContent className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-bold text-gray-800 text-base leading-tight hover:text-emerald-700 transition-colors">
                      {pkg.title}
                    </h3>
                    <p className="text-[10px] text-gray-400 mt-1 flex items-center gap-1">
                      ⛰️ Destinasi: <span className="font-bold text-gray-700">{pkg.targetMountain}</span>
                    </p>
                    
                    <div className="mt-2.5 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100/50 text-[10px] space-y-1">
                      <p className="font-semibold text-emerald-800">🤝 Mitra Kolaborasi:</p>
                      <p className="text-gray-650">🙋 Guide: **{pkg.guideName}**</p>
                      {pkg.vendorName && <p className="text-gray-650">⛺ Vendor: **{pkg.vendorName}**</p>}
                    </div>

                    <p className="text-xs text-gray-500 mt-2.5 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>

                    <div className="mt-3">
                      <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide">Fasilitas Termasuk:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {pkg.services.slice(0, 3).map((serv, idx) => (
                          <span key={idx} className="bg-gray-100 text-gray-750 text-[9px] px-2 py-0.5 rounded font-medium">{serv}</span>
                        ))}
                        {pkg.services.length > 3 && <span className="bg-gray-100 text-gray-750 text-[9px] px-2 py-0.5 rounded font-medium">+{pkg.services.length - 3} lainnya</span>}
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3 mt-4 flex items-center justify-between">
                    <div>
                      <p className="text-[9px] text-gray-400 leading-none">Mulai Dari</p>
                      <p className="font-extrabold text-emerald-600 text-base">Rp {pkg.price.toLocaleString("id-ID")}<span className="text-[9px] text-gray-400 font-normal">/pax</span></p>
                    </div>
                    <Button size="xs" className="bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] h-8 px-3 font-bold" onClick={() => handleOpenBookingPkg(pkg)}>
                      Booking Paket
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20 bg-gray-50/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-800">Booking Mandiri / Modular</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto mt-2">
              Ingin kelola pendakian sendiri? Cari tiket gunung saja, guide saja, atau rental alat camping terpisah sesuai perbekalan Anda.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/gunung" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all bg-white">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1605860632725-fa88d0ce7a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    alt="Gunung"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">Tiket Gunung</h3>
                    <p className="text-sm opacity-90">Beli tiket masuk resmi pengelola gunung</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/guide" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all bg-white">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1587651687979-77cf05d1b841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    alt="Guide"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">Sewa Guide Mandiri</h3>
                    <p className="text-sm opacity-90">Sewa pemandu lokal tersertifikasi</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/rental" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all bg-white">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1568516475772-498b4379829c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    alt="Rental"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">Rental Alat Camping</h3>
                    <p className="text-sm opacity-90">Sewa tenda, carrier & perlengkapan dekat basecamp</p>
                  </div>
                </div>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4 text-gray-800">Apa Kata Mereka?</h2>
            <p className="text-muted-foreground text-sm">Pengalaman nyata dari para pendaki yang telah menggunakan AyokMendaki</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white">
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base text-foreground leading-relaxed">
                    "{testimonial.comment}"
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-800">{testimonial.name}</p>
                      <p className="text-xs text-muted-foreground">{testimonial.location} • {testimonial.trip}</p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Siap Memulai Petualangan Anda?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90 text-sm">
            Bergabunglah dengan ribuan pendaki yang telah mempercayai AyokMendaki untuk pengalaman pendakian terbaik
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100 border-0" onClick={() => navigate("/register")}>
              Daftar Sebagai Pendaki
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" onClick={() => navigate("/register")}>
              Daftar Sebagai Guide
            </Button>
          </div>
        </div>
      </section>

      {/* ── Package Booking Modal ── */}
      {bookingModalOpen && selectedPkg && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200 font-sans">
            <button onClick={() => setBookingModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <Award className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Booking Paket Pendakian (Ads)</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-normal">
              Anda memesan paket pendakian **{selectedPkg.title}** yang dipandu oleh Guide **{selectedPkg.guideName}**.
            </p>
            <div className="space-y-4 text-sm">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center gap-3">
                <img src={selectedPkg.image} className="w-12 h-12 object-cover rounded-lg shrink-0" />
                <div>
                  <p className="font-bold text-gray-800 leading-tight">{selectedPkg.title}</p>
                  <p className="text-xs text-emerald-700 font-semibold">{selectedPkg.duration}</p>
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Pilih Tanggal Mulai Trip</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <Input 
                    type="date" 
                    className="pl-9 text-xs text-gray-700 bg-white" 
                    value={bookingDate} 
                    onChange={(e) => setBookingDate(e.target.value)} 
                    min={new Date().toISOString().split("T")[0]} 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Jumlah Anggota Rombongan</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <Input 
                    type="number" 
                    min={1} 
                    className="pl-9 text-xs text-gray-700 bg-white" 
                    value={climbersCount} 
                    onChange={(e) => setClimbersCount(parseInt(e.target.value) || 1)} 
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-150 pt-3 flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-gray-100">
                <div>
                  <p className="text-[10px] text-gray-400 leading-none">Harga Per Pax</p>
                  <p className="text-xs font-bold text-gray-700">Rp {selectedPkg.price.toLocaleString("id-ID")}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-semibold">Total Pembayaran</p>
                  <p className="text-base font-extrabold text-emerald-600">Rp {(selectedPkg.price * climbersCount).toLocaleString("id-ID")}</p>
                </div>
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setBookingModalOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleConfirmPkgBooking}>Konfirmasi Booking Paket</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

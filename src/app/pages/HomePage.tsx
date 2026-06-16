import { Button } from "../components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
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
  ChevronRight
} from "lucide-react";
import { Link } from "react-router";

export function HomePage() {
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
                className="pl-10 bg-input-background border-0"
              />
            </div>
            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700">
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Fitur Unggulan</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              AyokMendaki menyediakan semua yang Anda butuhkan untuk pengalaman pendakian yang aman dan menyenangkan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-border hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="size-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                    <feature.icon className="size-6 text-emerald-600" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/gunung" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1605860632725-fa88d0ce7a07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    alt="Gunung"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">Jelajahi Gunung</h3>
                    <p className="text-sm opacity-90">Temukan destinasi pendakian terbaik</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/guide" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1587651687979-77cf05d1b841?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    alt="Guide"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">Cari Guide</h3>
                    <p className="text-sm opacity-90">Guide profesional bersertifikasi</p>
                  </div>
                </div>
              </Card>
            </Link>

            <Link to="/rental" className="group">
              <Card className="overflow-hidden hover:shadow-xl transition-all">
                <div className="relative h-48 overflow-hidden">
                  <img
                    src="https://images.unsplash.com/photo-1568516475772-498b4379829c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=600"
                    alt="Rental"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <h3 className="text-xl font-bold mb-1">Rental Alat</h3>
                    <p className="text-sm opacity-90">Perlengkapan pendakian lengkap</p>
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
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">Apa Kata Mereka?</h2>
            <p className="text-muted-foreground">Pengalaman nyata dari para pendaki yang telah menggunakan AyokMendaki</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <CardDescription className="text-base text-foreground">
                    "{testimonial.comment}"
                  </CardDescription>
                </CardHeader>
                <div className="px-6 pb-6">
                  <div className="flex items-center gap-3">
                    <Avatar>
                      <AvatarFallback>{testimonial.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.location} • {testimonial.trip}</p>
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
          <p className="text-lg mb-8 max-w-2xl mx-auto opacity-90">
            Bergabunglah dengan ribuan pendaki yang telah mempercayai AyokMendaki untuk pengalaman pendakian terbaik
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              Daftar Sebagai Pendaki
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Daftar Sebagai Guide
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}

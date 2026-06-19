import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
  Mountain,
  Users,
  Shield,
  Target,
  Heart,
  TrendingUp,
  CheckCircle2,
  Mail,
  Phone,
  MapPin
} from "lucide-react";
import logoIcon from "../../assets/logo_icon.jpeg";

export function TentangPage() {
  const stats = [
    { label: "Pendaki Terdaftar", value: "10,000+", icon: Users },
    { label: "Guide Profesional", value: "500+", icon: Shield },
    { label: "Gunung Terdaftar", value: "150+", icon: Mountain },
    { label: "Trip Selesai", value: "25,000+", icon: CheckCircle2 }
  ];

  const team = [
    {
      name: "Rayhan Abdul Fikri",
      role: "Project Manager",
      description: "Memimpin visi dan strategi produk AyokMendaki"
    },
    {
      name: "Muhammad Ubaidillah Rosyid",
      role: "Full-Stack Developer",
      description: "Mengembangkan platform web dan mobile yang robust"
    },
    {
      name: "Ryan Anugrah",
      role: "UI/UX Designer",
      description: "Merancang pengalaman pengguna yang intuitif dan menarik"
    }
  ];

  const values = [
    {
      icon: Shield,
      title: "Keamanan & Kepercayaan",
      description: "Kami memprioritaskan keamanan transaksi dan memverifikasi semua guide serta vendor untuk memastikan pengalaman pendakian yang aman."
    },
    {
      icon: Heart,
      title: "Cinta Alam",
      description: "Kami berkomitmen untuk mempromosikan pendakian yang bertanggung jawab dan menjaga kelestarian alam Indonesia."
    },
    {
      icon: Users,
      title: "Komunitas Solid",
      description: "Membangun ekosistem yang menghubungkan pendaki, guide, dan vendor dalam satu platform terpercaya."
    },
    {
      icon: TrendingUp,
      title: "Inovasi Berkelanjutan",
      description: "Terus berinovasi untuk memberikan fitur dan layanan terbaik bagi komunitas pendaki Indonesia."
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-emerald-600 text-white py-20">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <img src={logoIcon} alt="Logo" className="size-16 mx-auto mb-6 opacity-90 object-contain rounded-2xl shadow-md bg-white p-2" />
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Tentang AyokMendaki
          </h1>
          <p className="text-lg opacity-90 max-w-3xl mx-auto">
            Platform marketplace pendakian gunung terpercaya yang menghubungkan pendaki dengan guide profesional dan vendor rental alat di seluruh Indonesia
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <Card className="border-2 border-emerald-200">
              <CardHeader>
                <div className="size-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Target className="size-6 text-emerald-600" />
                </div>
                <CardTitle>Misi Kami</CardTitle>
                <CardDescription className="text-base">
                  Menjadi platform terpercaya yang memudahkan setiap orang untuk merencanakan pendakian yang aman, menyenangkan, dan berkesan dengan menghubungkan mereka kepada guide profesional dan penyedia layanan terbaik.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-2 border-emerald-200">
              <CardHeader>
                <div className="size-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                  <Mountain className="size-6 text-emerald-600" />
                </div>
                <CardTitle>Visi Kami</CardTitle>
                <CardDescription className="text-base">
                  Menjadi ekosistem digital terlengkap untuk aktivitas pendakian gunung di Indonesia, dengan standar keamanan tertinggi dan pengalaman pengguna yang unggul.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-12">AyokMendaki dalam Angka</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="size-12 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="size-6 text-emerald-600" />
                  </div>
                  <CardTitle className="text-3xl text-emerald-600">{stat.value}</CardTitle>
                  <CardDescription>{stat.label}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Nilai-Nilai Kami</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Prinsip yang memandu setiap langkah kami dalam melayani komunitas pendaki Indonesia
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {values.map((value, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="size-12 rounded-lg bg-emerald-100 flex items-center justify-center mb-4">
                    <value.icon className="size-6 text-emerald-600" />
                  </div>
                  <CardTitle>{value.title}</CardTitle>
                  <CardDescription className="text-base">
                    {value.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4 sm:px-6">
          <h2 className="text-3xl font-bold text-center mb-4">Tim Kami</h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            Orang-orang di balik AyokMendaki yang berdedikasi untuk memberikan pengalaman terbaik
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {team.map((member, index) => (
              <Card key={index}>
                <CardHeader className="text-center">
                  <div className="size-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                    <Users className="size-10 text-emerald-600" />
                  </div>
                  <CardTitle>{member.name}</CardTitle>
                  <p className="text-sm font-medium text-emerald-600 mb-2">{member.role}</p>
                  <CardDescription>{member.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-6 text-center">Cerita Kami</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-muted-foreground mb-4">
                AyokMendaki lahir dari pengalaman pribadi para founder yang sering menghadapi kesulitan dalam merencanakan pendakian gunung. Sulitnya menemukan guide yang terpercaya, keterbatasan informasi jalur pendakian, dan tidak adanya platform terpadu untuk menyewa perlengkapan membuat pengalaman pendakian menjadi kurang optimal.
              </p>
              <p className="text-muted-foreground mb-4">
                Pada Mei 2026, kami memutuskan untuk membangun solusi yang mengatasi semua masalah tersebut. AyokMendaki hadir sebagai marketplace connector yang menghubungkan Pendaki, Guide Profesional, dan Vendor Rental Alat dalam satu ekosistem digital yang aman dan terpercaya.
              </p>
              <p className="text-muted-foreground">
                Dengan sistem verifikasi ketat, pembayaran escrow, dan review transparan, kami berkomitmen untuk menjadikan setiap pendakian sebagai pengalaman yang aman, menyenangkan, dan berkesan. Kami percaya bahwa keindahan alam Indonesia harus dapat dinikmati oleh semua orang dengan cara yang bertanggung jawab.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-emerald-600 text-white">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Hubungi Kami</h2>
            <p className="text-lg opacity-90 mb-8">
              Ada pertanyaan atau ingin bekerja sama? Kami siap membantu Anda
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="flex flex-col items-center">
                <Mail className="size-8 mb-2" />
                <p className="font-medium">Email</p>
                <p className="text-sm opacity-90">info@ayokmendaki.id</p>
              </div>
              <div className="flex flex-col items-center">
                <Phone className="size-8 mb-2" />
                <p className="font-medium">Telepon</p>
                <p className="text-sm opacity-90">+62 812-3456-7890</p>
              </div>
              <div className="flex flex-col items-center">
                <MapPin className="size-8 mb-2" />
                <p className="font-medium">Alamat</p>
                <p className="text-sm opacity-90">Jakarta, Indonesia</p>
              </div>
            </div>
            <Button size="lg" variant="secondary" className="bg-white text-emerald-600 hover:bg-gray-100">
              Kirim Pesan
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

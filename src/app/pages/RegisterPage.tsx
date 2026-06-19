import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Mountain, Eye, EyeOff, Lock, Mail, User, Phone, AlertCircle, CheckCircle2, Shield, Award } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useApp, UserRole } from "../context/AppContext";
import { toast } from "sonner";
import { supabase } from "../../supabase";

interface PasswordStrength {
  score: number;
  label: string;
  color: string;
}

function getPasswordStrength(password: string): PasswordStrength {
  if (!password) return { score: 0, label: "", color: "" };
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const levels = [
    { score: 0, label: "", color: "" },
    { score: 1, label: "Lemah", color: "bg-red-400" },
    { score: 2, label: "Cukup", color: "bg-yellow-400" },
    { score: 3, label: "Kuat", color: "bg-blue-400" },
    { score: 4, label: "Sangat Kuat", color: "bg-emerald-500" },
  ];
  return levels[score] || levels[0];
}

export function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>("pendaki");
  
  // OTP Verification States
  const [showVerificationScreen, setShowVerificationScreen] = useState(false);
  const [sentCode, setSentCode] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama lengkap wajib diisi.";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Format email tidak valid.";
    if (!form.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi.";
    else if (!/^(\+62|0)[0-9]{8,14}$/.test(form.phone.replace(/\s/g, "")))
      newErrors.phone = "Nomor telepon wajib diisi.";

    if (!form.password) newErrors.password = "Kata sandi wajib diisi.";
    else if (form.password.length < 8) newErrors.password = "Kata sandi minimal 8 karakter.";

    if (!form.confirmPassword) newErrors.confirmPassword = "Konfirmasi kata sandi wajib diisi.";
    else if (form.password !== form.confirmPassword)
      newErrors.confirmPassword = "Kata sandi tidak cocok.";
    if (!form.agreeTerms) newErrors.agreeTerms = "Kamu harus menyetujui syarat & ketentuan.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);

    setTimeout(() => {
      // Check if email already registered in standard user table
      supabase.from("users").select("email").eq("email", form.email.toLowerCase()).single().then(({ data }) => {
        if (data) {
          setLoading(false);
          setErrors({ email: "Email sudah terdaftar. Silakan masuk atau gunakan email lain." });
          toast.error("Email sudah terdaftar!");
          return;
        }

        // Generate OTP
        const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
        setSentCode(randomCode);
        setLoading(false);
        setShowVerificationScreen(true);
        toast.success("Kode verifikasi OTP dikirim ke email!");
      });
    }, 1000);
  };

  const handleVerifyAndRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode !== sentCode) {
      toast.error("Kode verifikasi salah! Cek kembali email Anda.");
      return;
    }

    setLoading(true);
    const newUserId = "user_" + Math.random().toString(36).substring(2, 9);
    
    setTimeout(async () => {
      try {
        // 1. Create User in Supabase with email_verified: true
        const { error: userErr } = await supabase.from("users").insert({
          id: newUserId,
          name: form.name,
          email: form.email.toLowerCase(),
          role: selectedRole,
          phone: form.phone,
          verified: false,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name}`,
          status: "active",
          email_verified: true,
          ktp_number: null,
          ktp_image: null,
          selfie_image: null
        });

        if (userErr) throw userErr;

        // 2. Initialize Wallet
        await supabase.from("wallets").insert({
          user_id: newUserId,
          balance: 0
        });

        setLoading(false);
        setSuccess(true);
        toast.success("Verifikasi email berhasil & akun terdaftar!");
      } catch (err: any) {
        setLoading(false);
        console.error("Error registering user:", err);
        toast.error("Gagal mendaftarkan akun: " + err.message);
      }
    }, 1200);
  };

  const handleGoogleRegister = async () => {
    setLoading(true);
    try {
      const pendingData = {
        role: selectedRole,
      };
      
      localStorage.setItem("pending_oauth_register", JSON.stringify(pendingData));
      
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) throw error;
    } catch (err: any) {
      console.error("Error registering with Google:", err);
      toast.error("Gagal mendaftar dengan Google: " + err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
          <div className="size-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="size-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
          
          <p className="text-gray-500 mb-6 text-sm">
            Akun Anda (**{selectedRole.toUpperCase()}**) telah berhasil dibuat dan email terverifikasi. Silakan login ke dashboard untuk melengkapi data diri Anda terlebih dahulu agar akun dapat diaktifkan dan digunakan.
          </p>

          <div className="space-y-3">
            <Link to="/login">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base font-semibold shadow-sm">
                Masuk Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (showVerificationScreen) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
        <Card className="w-full max-w-md shadow-xl border-0 bg-white font-sans rounded-2xl overflow-hidden">
          <div className="bg-emerald-800 text-white p-6">
            <h2 className="text-xl font-bold flex items-center justify-center gap-2">
              <Mail className="size-5 text-emerald-300" />
              Verifikasi Email Anda
            </h2>
            <p className="text-xs opacity-80 mt-1 text-center">
              Kode OTP telah dikirimkan ke <span className="font-bold text-emerald-200">{form.email}</span>.
            </p>
          </div>
          <CardContent className="p-6 space-y-4">
            <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center">
              <p className="text-[10px] text-emerald-800 font-bold uppercase tracking-wider">Simulasi Kotak Masuk Email</p>
              <p className="text-xs text-gray-650 mt-1 font-medium">Platform mendeteksi kode verifikasi berikut:</p>
              <p className="text-xl font-mono font-black text-emerald-750 bg-emerald-200/40 px-3 py-1 mt-1.5 rounded-lg inline-block tracking-wider">
                {sentCode}
              </p>
            </div>

            <form onSubmit={handleVerifyAndRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-700">Masukkan 6 Digit OTP</label>
                <Input
                  maxLength={6}
                  placeholder="••••••"
                  className="text-center font-mono font-bold text-lg tracking-widest h-11 bg-gray-50 border-gray-200 focus:bg-white"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ""))}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base font-semibold shadow-sm transition-all"
                disabled={loading}
              >
                {loading ? "Memproses Verifikasi..." : "Verifikasi & Daftarkan Akun"}
              </Button>
            </form>

            <button
              onClick={() => setShowVerificationScreen(false)}
              className="w-full text-center text-xs text-gray-500 hover:text-emerald-600 transition-colors pt-2"
            >
              ← Kembali ke Form Registrasi
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100 opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-100 opacity-30" />
      </div>

      <div className="w-full max-w-lg relative">
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="size-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg group-hover:bg-emerald-700 transition-colors">
              <Mountain className="size-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">AyokMendaki</span>
          </Link>
          <p className="mt-2 text-gray-500 text-sm">Bergabung dan mulai petualanganmu!</p>
        </div>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Buat Akun Baru</CardTitle>
            <CardDescription className="text-center">
              Daftar dan pilih peran Anda di ekosistem AyokMendaki
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Role Radio Cards */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              {[
                { id: "pendaki" as UserRole, label: "Pendaki", desc: "Sewa guide & alat", icon: <Mountain className="size-4" /> },
                { id: "guide" as UserRole, label: "Tour Guide", desc: "Jasa pemandu trip", icon: <Award className="size-4" /> },
                { id: "vendor" as UserRole, label: "Vendor Rental", desc: "Sewa alat camping", icon: <Shield className="size-4" /> },
              ].map((role) => (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => setSelectedRole(role.id)}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    selectedRole === role.id
                      ? "bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm"
                      : "bg-gray-55 border-gray-150 hover:bg-gray-100/50 text-gray-650"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg mb-1.5 ${selectedRole === role.id ? "bg-emerald-600 text-white" : "bg-gray-200 text-gray-500"}`}>
                    {role.icon}
                  </div>
                  <span className="text-xs font-bold">{role.label}</span>
                  <span className="text-[9px] text-gray-400 mt-0.5 leading-tight">{role.desc}</span>
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="space-y-1">
                <label htmlFor="name" className="text-xs font-semibold text-gray-700">
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Nama lengkap Anda"
                    className={`pl-9 bg-gray-50 border-gray-200 text-sm ${errors.name ? "border-red-400 focus:border-red-400" : ""}`}
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                  />
                </div>
                {errors.name && <p className="text-[10px] text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-gray-700">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    className={`pl-9 bg-gray-50 border-gray-200 text-sm ${errors.email ? "border-red-400 focus:border-red-400" : ""}`}
                    value={form.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
              </div>

              {/* Phone */}
              <div className="space-y-1">
                <label htmlFor="phone" className="text-xs font-semibold text-gray-700">
                  Nomor Telepon (WhatsApp)
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="08xxxxxxxxxx"
                    className={`pl-9 bg-gray-55 border-gray-200 text-sm ${errors.phone ? "border-red-400 focus:border-red-400" : ""}`}
                    value={form.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                  />
                </div>
                {errors.phone && <p className="text-[10px] text-red-500">{errors.phone}</p>}
              </div>

              {/* Password Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div className="space-y-1.5">
                  <label htmlFor="password" className="text-xs font-semibold text-gray-700">
                    Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Min. 8 karakter"
                      className={`pl-9 pr-9 bg-gray-55 border-gray-200 text-sm ${errors.password ? "border-red-400 focus:border-red-400" : ""}`}
                      value={form.password}
                      onChange={(e) => handleChange("password", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {form.password && (
                    <div className="space-y-1 mt-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map((i) => (
                          <div
                            key={i}
                            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                              i <= passwordStrength.score ? passwordStrength.color : "bg-gray-200"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label htmlFor="confirmPassword" className="text-xs font-semibold text-gray-700">
                    Konfirmasi Kata Sandi
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Ulangi kata sandi"
                      className={`pl-9 pr-9 bg-gray-55 border-gray-200 text-sm ${errors.confirmPassword ? "border-red-400 focus:border-red-400" : ""}`}
                      value={form.confirmPassword}
                      onChange={(e) => handleChange("confirmPassword", e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="text-[10px] text-red-500">{errors.confirmPassword}</p>}
                </div>
              </div>

              {/* Scrollable Terms & Conditions Box */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-gray-700">Syarat & Ketentuan Layanan</label>
                <div className="h-28 overflow-y-auto p-2.5 border border-gray-200 bg-gray-50 rounded-lg text-[10px] text-gray-500 leading-normal font-medium space-y-1.5 scrollbar-thin">
                  <p className="font-extrabold text-gray-700">1. Ketentuan Umum Penggunaan Platform</p>
                  <p>AyokMendaki adalah platform aggregator independen yang menghubungkan Pendaki dengan Tour Guide (Pemandu Gunung) dan Vendor Persewaan Alat Gunung. Seluruh pengguna wajib berusia minimal 17 tahun dan memiliki KTP resmi yang valid.</p>
                  <p className="font-extrabold text-gray-700">2. Verifikasi Data & Keamanan Akun</p>
                  <p>Mitra Tour Guide dan Vendor wajib melampirkan berkas identitas asli (KTP, Selfie Wajah, Sertifikat APIGI/HPI, NIB) untuk ditinjau oleh Admin. Platform berhak membatalkan status verifikasi atau menangguhkan akun jika terbukti melanggar aturan.</p>
                  <p className="font-extrabold text-gray-700">3. Ketentuan Pemesanan & Pembayaran Escrow</p>
                  <p>Seluruh transaksi pembayaran booking guide dan rental alat wajib melalui rekening penampung aman (Escrow) AyokMendaki. Dana baru diteruskan ke mitra setelah trip selesai dilaksanakan atau barang dikembalikan dengan aman.</p>
                  <p className="font-extrabold text-gray-700">4. Kebijakan Sanksi, Dispute, & Denda</p>
                  <p>Pelanggaran aturan keselamatan pendakian, vandalisme, atau pembatalan sepihak tanpa alasan mendesak akan dikenai sanksi peringatan hingga pembekuan saldo jaminan oleh admin melalui sidang penyelesaian sengketa (Dispute).</p>
                </div>
              </div>

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-1">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={form.agreeTerms}
                  onChange={(e) => handleChange("agreeTerms", e.target.checked)}
                  className="size-4 mt-0.5 rounded border-gray-300 accent-emerald-600"
                />
                <label htmlFor="agreeTerms" className="text-xs text-gray-650 leading-relaxed">
                  Saya menyetujui Syarat & Ketentuan serta Kebijakan Privasi AyokMendaki di atas.
                </label>
              </div>
              {errors.agreeTerms && <p className="text-[10px] text-red-500">{errors.agreeTerms}</p>}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base font-semibold shadow-sm transition-all"
                disabled={loading}
              >
                {loading ? "Mendaftarkan Akun..." : "Buat Akun & Verifikasi Email"}
              </Button>

              {/* Divider */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase">
                  <span className="bg-white px-2 text-gray-400 font-medium">atau daftar dengan</span>
                </div>
              </div>

              {/* Google Register Button */}
              <Button
                type="button"
                variant="outline"
                className="w-full h-11 border-gray-200 hover:bg-gray-50 text-sm font-semibold shadow-sm transition-all"
                onClick={handleGoogleRegister}
                disabled={loading}
              >
                <svg className="size-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Daftar dengan Google (Bypass Verifikasi)
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-650">
              Sudah punya akun?{" "}
              <Link to="/login" className="font-semibold text-emerald-600 hover:text-emerald-700">
                Masuk di sini
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

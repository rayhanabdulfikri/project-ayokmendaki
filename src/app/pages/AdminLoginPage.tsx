import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Mountain, Eye, EyeOff, Lock, Mail, AlertCircle, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useApp, User } from "../context/AppContext";
import logoIcon from "../../assets/logo_icon.jpeg";
import { toast } from "sonner";
import { supabase } from "../../supabase";

export function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setCurrentUser, ensureMockUserExists } = useApp();

  const handleQuickAdminLogin = async () => {
    setLoading(true);
    const adminUser: User = {
      id: "demoadmin",
      name: "Superadmin Demo",
      email: "admin@demo.com",
      role: "admin",
      phone: "08567890123",
      verified: true,
      avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin"
    };
    try {
      await ensureMockUserExists(adminUser);
      setCurrentUser(adminUser);
      toast.success("Selamat datang di Konsol Super Admin!");
      navigate("/dashboard");
    } catch (err: any) {
      console.error(err);
      toast.error("Gagal Quick Login: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Email dan kata sandi wajib diisi.");
      return;
    }

    setLoading(true);
    
    setTimeout(async () => {
      try {
        const { data: matchedUser, error: queryErr } = await supabase
          .from("users")
          .select("*")
          .eq("email", email.toLowerCase())
          .single();

        if (queryErr && queryErr.code !== "PGRST116") {
          throw queryErr;
        }

        if (matchedUser) {
          if (matchedUser.role !== "admin") {
            setError("Akses ditolak. Halaman ini hanya untuk akun Super Admin.");
            setLoading(false);
            return;
          }
          if (matchedUser.status === "suspended") {
            setError("Akun Admin ditangguhkan. Silakan hubungi pengembang sistem.");
            setLoading(false);
            return;
          }
          setCurrentUser({
            id: matchedUser.id,
            name: matchedUser.name,
            email: matchedUser.email,
            role: matchedUser.role,
            phone: matchedUser.phone,
            verified: matchedUser.verified,
            avatar: matchedUser.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${matchedUser.name}`,
            status: matchedUser.status,
            email_verified: matchedUser.email_verified,
            bank_name: matchedUser.bank_name,
            bank_account: matchedUser.bank_account,
            bank_holder: matchedUser.bank_holder
          });
          setLoading(false);
          toast.success("Selamat datang di Konsol Super Admin!");
          navigate("/dashboard");
        } else {
          setError("Akun Admin tidak ditemukan. Pastikan email Anda terdaftar sebagai admin.");
          setLoading(false);
        }
      } catch (err: any) {
        setLoading(false);
        console.error("Error logging in admin:", err);
        setError("Gagal masuk: " + err.message);
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Admin dashboard style background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-teal-500/5 blur-[100px]" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="size-12 rounded-2xl overflow-hidden flex items-center justify-center shadow-lg transition-colors">
              <img src={logoIcon} alt="Logo" className="size-full object-cover" />
            </div>
            <span className="text-2xl font-bold text-white font-mono tracking-wide">AyokMendaki <span className="text-emerald-500 text-xs uppercase bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">Admin</span></span>
          </Link>
          <p className="mt-2 text-slate-400 text-sm">Konsol Otentikasi Super Admin Platform</p>
        </div>

        <Card className="shadow-2xl border border-slate-800 bg-slate-950 text-slate-200">
          <CardHeader className="pb-4 border-b border-slate-900">
            <CardTitle className="text-xl text-center text-white flex items-center justify-center gap-2">
              <ShieldAlert className="size-5 text-emerald-500" />
              Sign In Admin
            </CardTitle>
            <CardDescription className="text-center text-slate-400 text-xs">
              Masukkan kredensial superadmin untuk mengelola direktori, moderasi iklan, & verifikasi berkas.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-950/50 border border-red-900 text-red-400 text-sm">
                  <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-xs font-semibold text-slate-300">
                  Email Super Admin
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@ayokmendaki.com"
                    className="pl-9 bg-slate-900 border-slate-800 focus:border-emerald-500 text-white placeholder-slate-500 text-sm h-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-xs font-semibold text-slate-300">
                    Kata Sandi
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className="pl-9 pr-9 bg-slate-900 border-slate-800 focus:border-emerald-500 text-white placeholder-slate-500 text-sm h-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white h-10 text-sm font-semibold shadow-md transition-all border border-emerald-500/20"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin size-4 text-white" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Mengecek Kredensial...
                  </span>
                ) : (
                  "Masuk Konsol Admin"
                )}
              </Button>

              {/* Quick Login for Demo/Developer */}
              <div className="pt-2 border-t border-slate-900 mt-4">
                <Button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  disabled={loading}
                  className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-850 text-xs h-9 font-semibold"
                >
                  ⚡ Masuk Cepat (Akun Demo Super Admin)
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Back Link */}
        <div className="text-center mt-6">
          <Link to="/login" className="text-xs text-slate-500 hover:text-emerald-400 transition-colors">
            ← Kembali ke Halaman Login Pengguna
          </Link>
        </div>
      </div>
    </div>
  );
}

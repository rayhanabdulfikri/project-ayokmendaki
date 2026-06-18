import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Mountain, Eye, EyeOff, Lock, Mail, AlertCircle, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router";
import { useApp, User } from "../context/AppContext";
import { toast } from "sonner";
import { supabase } from "../../supabase";


const DEMO_ACCOUNTS: User[] = [
  { id: "pendaki1", name: "Zaki Firdaus", email: "zaki@ayokmendaki.com", role: "pendaki", phone: "08123456789", verified: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zaki" },
  { id: "guide1", name: "Ahmad Hidayat", email: "ahmad@ayokmendaki.com", role: "guide", phone: "08234567890", verified: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad" },
  { id: "vendor1", name: "Outdoor Store", email: "outdoor@ayokmendaki.com", role: "vendor", phone: "08345678901", verified: true, avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=outdoor" },
  { id: "admin1", name: "Super Admin", email: "admin@ayokmendaki.com", role: "admin", phone: "08567890123", verified: true, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin" },
];

export function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { setCurrentUser } = useApp();

  const handleQuickLogin = (user: User) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentUser(user);
      setLoading(false);
      toast.success(`Selamat datang kembali, ${user.name}!`);
      navigate("/dashboard");
    }, 800);
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
        // 1. Query Supabase users table
        const { data: matchedUser, error: queryErr } = await supabase
          .from("users")
          .select("*")
          .eq("email", email.toLowerCase())
          .single();

        if (queryErr && queryErr.code !== "PGRST116") {
          throw queryErr;
        }

        if (matchedUser) {
          if (matchedUser.status === "suspended") {
            setError("Akun Anda ditangguhkan. Silakan hubungi admin.");
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
            avatar: matchedUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${matchedUser.name}`,
            status: matchedUser.status
          });
          setLoading(false);
          toast.success(`Selamat datang kembali, ${matchedUser.name}!`);
          navigate("/dashboard");
        } else {
          setError("Akun tidak ditemukan. Silakan daftar terlebih dahulu.");
          setLoading(false);
        }
      } catch (err: any) {
        setLoading(false);
        console.error("Error logging in:", err);
        setError("Gagal masuk: " + err.message);
      }
    }, 1200);
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    try {
      const { error: authErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (authErr) throw authErr;
    } catch (err: any) {
      console.error("Error signing in with Google:", err);
      setError("Gagal masuk dengan Google: " + err.message);
      toast.error("Gagal masuk dengan Google: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full bg-emerald-100 opacity-40" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-emerald-100 opacity-30" />
      </div>

      <div className="w-full max-w-md relative">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="size-12 rounded-2xl bg-emerald-600 flex items-center justify-center shadow-lg group-hover:bg-emerald-700 transition-colors">
              <Mountain className="size-7 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">AyokMendaki</span>
          </Link>
          <p className="mt-2 text-gray-500 text-sm">Selamat datang kembali, pendaki!</p>
        </div>

        {/* Demo Fast Login Panel */}
        <Card className="shadow-lg border border-emerald-100 mb-6 bg-white">
          <CardHeader className="py-3 px-4 flex flex-row items-center gap-2 border-b border-gray-50">
            <Sparkles className="size-4 text-emerald-600 animate-pulse" />
            <CardTitle className="text-xs font-bold text-gray-700">Demo Quick Login (Pilih Peran)</CardTitle>
          </CardHeader>
          <CardContent className="p-3 grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map((user) => (
              <Button
                key={user.id}
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickLogin(user)}
                className="text-xs h-9 justify-start font-semibold text-gray-700 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-all"
              >
                <img src={user.avatar} alt={user.name} className="size-5 rounded-full mr-1.5 bg-gray-100 shrink-0" />
                <span className="truncate">{user.name.split(" ")[0]} ({user.role})</span>
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-xl border-0 bg-white">
          <CardHeader className="pb-4">
            <CardTitle className="text-xl text-center">Masuk ke Akun</CardTitle>
            <CardDescription className="text-center">
              Masuk untuk mulai menjelajahi gunung Indonesia
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-700 text-sm">
                  <AlertCircle className="size-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="contoh@email.com"
                    className="pl-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Kata Sandi
                  </label>
                  <a
                    href="#"
                    className="text-xs text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
                  >
                    Lupa kata sandi?
                  </a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan kata sandi"
                    className="pl-9 pr-9 bg-gray-50 border-gray-200 focus:bg-white transition-colors"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="size-4 rounded border-gray-300 accent-emerald-600"
                />
                <label htmlFor="remember" className="text-sm text-gray-600">
                  Ingat saya selama 30 hari
                </label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base font-semibold shadow-sm transition-all"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin size-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Memproses...
                  </span>
                ) : (
                  "Masuk"
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-3 text-gray-400 font-medium">atau masuk dengan</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-11 border-gray-200 hover:bg-gray-50 text-sm font-semibold shadow-sm transition-all"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="size-5 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Masuk dengan Google
                </Button>
              </div>
            </form>

            {/* Register Link */}
            <p className="mt-6 text-center text-sm text-gray-600">
              Belum punya akun?{" "}
              <Link
                to="/register"
                className="font-semibold text-emerald-600 hover:text-emerald-700 transition-colors"
              >
                Daftar sekarang
              </Link>
            </p>
          </CardContent>
        </Card>

        {/* Footer note */}
        <p className="mt-6 text-center text-xs text-gray-400">
          Dengan masuk, kamu setuju dengan{" "}
          <a href="#" className="underline hover:text-gray-600">Syarat & Ketentuan</a>{" "}
          dan{" "}
          <a href="#" className="underline hover:text-gray-600">Kebijakan Privasi</a>{" "}
          AyokMendaki
        </p>
      </div>
    </div>
  );
}


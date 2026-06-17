import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/card";
import { Mountain, Eye, EyeOff, Lock, Mail, User, Phone, AlertCircle, CheckCircle2, Shield, Award, MapPin } from "lucide-react";
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
  const navigate = useNavigate();
  const { addVerificationRequest, setGuides } = useApp();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
    // KYC fields
    ktpNumber: "",
    ktpPhotoName: "ktp_identitas.jpg",
    ktpPhotoUrl: "https://images.unsplash.com/photo-1554774853-aae0a22c8aa4?w=400&q=80",
    selfiePhotoName: "selfie_wajah.jpg",
    selfiePhotoUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    // Guide specific
    specialty: "",
    experience: "",
    price: "",
    certifications: [] as string[],
    docName: "Sertifikat APIGI",
    docImage: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
    // Vendor specific
    storeName: "",
    nib: "",
    address: "",
  });

  const passwordStrength = getPasswordStrength(form.password);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleCheckboxChange = (cert: string, checked: boolean) => {
    const current = [...form.certifications];
    if (checked) {
      current.push(cert);
    } else {
      const idx = current.indexOf(cert);
      if (idx > -1) current.splice(idx, 1);
    }
    handleChange("certifications", current);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name.trim()) newErrors.name = "Nama lengkap wajib diisi.";
    if (!form.email.trim()) newErrors.email = "Email wajib diisi.";
    else if (!/\S+@\S+\.\S+/.test(form.email)) newErrors.email = "Format email tidak valid.";
    if (!form.phone.trim()) newErrors.phone = "Nomor telepon wajib diisi.";
    else if (!/^(\+62|0)[0-9]{8,12}$/.test(form.phone.replace(/\s/g, "")))
      newErrors.phone = "Masukkan nomor telepon Indonesia yang valid.";
    
    if (selectedRole === "guide") {
      if (!form.specialty.trim()) newErrors.specialty = "Spesialisasi gunung wajib diisi.";
      if (!form.experience.trim()) newErrors.experience = "Pengalaman kerja wajib diisi.";
      if (!form.price.trim()) newErrors.price = "Tarif harian wajib diisi.";
      if (form.certifications.length === 0) newErrors.certifications = "Pilih minimal satu sertifikasi.";
    }
    
    if (selectedRole === "vendor") {
      if (!form.storeName.trim()) newErrors.storeName = "Nama toko outdoor wajib diisi.";
      if (!form.nib.trim()) newErrors.nib = "NIB/Izin UKM wajib diisi.";
      if (!form.address.trim()) newErrors.address = "Alamat toko wajib diisi.";
    }

    if (!form.password) newErrors.password = "Kata sandi wajib diisi.";
    else if (form.password.length < 8) newErrors.password = "Kata sandi minimal 8 karakter.";
    
    // KYC validation
    if (!form.ktpNumber.trim()) newErrors.ktpNumber = "Nomor NIK KTP wajib diisi.";
    else if (!/^[0-9]{16}$/.test(form.ktpNumber.trim())) newErrors.ktpNumber = "Nomor NIK KTP harus 16 digit angka.";

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

    setTimeout(async () => {
      const newUserId = "user_" + Math.random().toString(36).substring(2, 9);
      
      try {
        // 1. Create User in Supabase with KYC columns
        const { error: userErr } = await supabase.from("users").insert({
          id: newUserId,
          name: selectedRole === "vendor" ? form.storeName : form.name,
          email: form.email,
          role: selectedRole,
          phone: form.phone,
          verified: false, // All start as unverified until admin approves KYC
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name}`,
          status: "active",
          ktp_number: form.ktpNumber,
          ktp_image: form.ktpPhotoUrl,
          selfie_image: form.selfiePhotoUrl
        });

        if (userErr) throw userErr;

        // 2. Initialize Wallet
        await supabase.from("wallets").insert({
          user_id: newUserId,
          balance: 0
        });

        if (selectedRole === "pendaki") {
          // Submit verification request for pendaki KYC
          addVerificationRequest({
            userId: newUserId,
            userName: form.name,
            role: "pendaki",
            documentName: `KYC Pendaki: KTP ${form.ktpNumber}`,
            documentImage: form.ktpPhotoUrl,
            ktpNumber: form.ktpNumber,
            ktpPhoto: form.ktpPhotoUrl,
            selfiePhoto: form.selfiePhotoUrl
          });
        } else if (selectedRole === "guide") {
          // Add Guide profile
          const { error: guideErr } = await supabase.from("guides").insert({
            id: newUserId,
            specialty: form.specialty,
            location: "Kota Malang, Jawa Timur",
            experience: form.experience + " Tahun",
            trips: 0,
            rating: 5.0,
            price: parseInt(form.price) || 450000,
            certifications: form.certifications,
            status: "Non-Aktif",
            specialty_mountains: [form.specialty],
            busy_dates: [],
            group_discount_enabled: false
          });

          if (guideErr) throw guideErr;

          // Add to local state (optimistic)
          const newGuideObj = {
            id: newUserId,
            name: form.name,
            specialty: form.specialty,
            location: "Kota Malang, Jawa Timur",
            experience: form.experience + " Tahun",
            trips: 0,
            rating: 5.0,
            price: parseInt(form.price) || 450000,
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.name}`,
            certifications: form.certifications,
            status: "Non-Aktif" as const,
            verified: false
          };
          setGuides((prev) => [newGuideObj, ...prev]);

          // Submit verification request
          addVerificationRequest({
            userId: newUserId,
            userName: form.name,
            role: "guide",
            documentName: `Sertifikasi ${form.certifications.join(" & ")}`,
            documentImage: form.docImage,
            ktpNumber: form.ktpNumber,
            ktpPhoto: form.ktpPhotoUrl,
            selfiePhoto: form.selfiePhotoUrl
          });
        } else if (selectedRole === "vendor") {
          // Add Vendor profile
          const { error: vendorErr } = await supabase.from("vendors").insert({
            id: newUserId,
            location: form.address,
            distances: {}
          });

          if (vendorErr) throw vendorErr;

          // Submit verification request for vendor
          addVerificationRequest({
            userId: newUserId,
            userName: form.storeName,
            role: "vendor",
            documentName: `NIB / Izin Usaha UKM: ${form.nib}`,
            documentImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=400",
            ktpNumber: form.ktpNumber,
            ktpPhoto: form.ktpPhotoUrl,
            selfiePhoto: form.selfiePhotoUrl
          });
        }

        setLoading(false);
        setSuccess(true);
        toast.success("Registrasi berhasil diajukan!");
      } catch (err: any) {
        setLoading(false);
        console.error("Error registering user:", err);
        toast.error("Gagal mendaftarkan akun: " + err.message);
      }
    }, 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md text-center bg-white p-8 rounded-2xl shadow-xl">
          <div className="size-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-bounce">
            <CheckCircle2 className="size-10 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Pendaftaran Berhasil!</h2>
          
          {selectedRole === "pendaki" ? (
            <p className="text-gray-500 mb-6 text-sm">
              Akun Anda telah berhasil dibuat. Silakan login menggunakan email Anda untuk mulai mendaki gunung Indonesia.
            </p>
          ) : (
            <div className="mb-6 space-y-3">
              <p className="text-gray-600 text-sm">
                Akun Kemitraan (**{selectedRole.toUpperCase()}**) berhasil didaftarkan.
              </p>
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 text-left">
                ⚠️ **Menunggu Verifikasi Admin:** Berkas Anda (Sertifikat/NIB UKM) sedang ditinjau oleh Admin. Akun Anda akan aktif setelah disetujui.
              </div>
              <p className="text-xs text-gray-400">
                Tip Demo: Anda dapat masuk sebagai **Super Admin** menggunakan demo widget untuk langsung menyetujui pengajuan pendaftaran ini!
              </p>
            </div>
          )}

          <div className="space-y-3">
            <Link to="/login">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-11 text-base font-semibold shadow-sm">
                Masuk Sekarang
              </Button>
            </Link>
            {selectedRole !== "pendaki" && (
              <Button
                variant="outline"
                className="w-full text-xs"
                onClick={() => {
                  // Instant login as admin to make testing easy
                  const adminAcc: User = { id: "admin1", name: "Super Admin", email: "admin@ayokmendaki.com", role: "admin", verified: true, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin" };
                  navigate("/login");
                  toast.info("Gunakan tombol 'Super Admin' di halaman login untuk memverifikasi akun ini.");
                }}
              >
                Buka Halaman Login &rarr; Verifikasi sebagai Admin
              </Button>
            )}
          </div>
        </div>
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

        <Card className="shadow-xl border-0 bg-white/95 backdrop-blur-sm">
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
                      : "bg-gray-50 border-gray-150 hover:bg-gray-100/50 text-gray-600"
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
              {/* Common Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                <div className="space-y-1 sm:col-span-2">
                  <label htmlFor="phone" className="text-xs font-semibold text-gray-700">
                    Nomor Telepon (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="08xxxxxxxxxx"
                      className={`pl-9 bg-gray-50 border-gray-200 text-sm ${errors.phone ? "border-red-400 focus:border-red-400" : ""}`}
                      value={form.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                    />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-500">{errors.phone}</p>}
                </div>
              </div>

              {/* KYC Verification Section (Required for all roles) */}
              <div className="bg-emerald-50/30 p-4 rounded-xl border border-emerald-100 space-y-3">
                <div className="flex items-center gap-1.5 border-b border-emerald-100 pb-1.5">
                  <Shield className="size-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-emerald-800">Verifikasi Identitas (KYC)</h4>
                </div>

                <div className="space-y-1">
                  <label htmlFor="ktpNumber" className="text-xs font-semibold text-gray-700">
                    Nomor NIK KTP (16 Digit)
                  </label>
                  <Input
                    id="ktpNumber"
                    type="text"
                    maxLength={16}
                    placeholder="Masukkan 16 digit nomor NIK Anda"
                    className={`bg-white border-gray-200 text-xs ${errors.ktpNumber ? "border-red-400 focus:border-red-400" : ""}`}
                    value={form.ktpNumber}
                    onChange={(e) => handleChange("ktpNumber", e.target.value.replace(/[^0-9]/g, ""))}
                  />
                  {errors.ktpNumber && <p className="text-[10px] text-red-500">{errors.ktpNumber}</p>}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {/* KTP Photo upload */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600">Foto KTP Asli</label>
                    <div className="border border-dashed border-emerald-300 rounded-lg p-2.5 text-center bg-white cursor-pointer hover:bg-emerald-50/20 transition-colors">
                      <Award className="size-5 text-emerald-600 mx-auto mb-1" />
                      <p className="text-[10px] text-emerald-700 font-semibold">{form.ktpPhotoName}</p>
                      <p className="text-[8px] text-gray-400">File KTP terdeteksi otomatis</p>
                    </div>
                  </div>

                  {/* Selfie photo upload */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600">Foto Selfie dengan KTP</label>
                    <div className="border border-dashed border-emerald-300 rounded-lg p-2.5 text-center bg-white cursor-pointer hover:bg-emerald-50/20 transition-colors">
                      <Award className="size-5 text-emerald-600 mx-auto mb-1" />
                      <p className="text-[10px] text-emerald-700 font-semibold">{form.selfiePhotoName}</p>
                      <p className="text-[8px] text-gray-400">Foto wajah verified</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Guide-Specific Fields */}
              {selectedRole === "guide" && (
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-1.5">Informasi Profesi Guide Gunung</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Spesialisasi Gunung</label>
                      <Input
                        placeholder="Contoh: Gn. Rinjani, Gn. Semeru"
                        className="bg-white border-gray-200 text-xs h-9"
                        value={form.specialty}
                        onChange={(e) => handleChange("specialty", e.target.value)}
                      />
                      {errors.specialty && <p className="text-[10px] text-red-500">{errors.specialty}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Pengalaman (Tahun)</label>
                      <Input
                        type="number"
                        placeholder="Contoh: 5"
                        className="bg-white border-gray-200 text-xs h-9"
                        value={form.experience}
                        onChange={(e) => handleChange("experience", e.target.value)}
                      />
                      {errors.experience && <p className="text-[10px] text-red-500">{errors.experience}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Tarif Jasa Harian (Rp)</label>
                      <Input
                        type="number"
                        placeholder="Contoh: 450000"
                        className="bg-white border-gray-200 text-xs h-9"
                        value={form.price}
                        onChange={(e) => handleChange("price", e.target.value)}
                      />
                      {errors.price && <p className="text-[10px] text-red-500">{errors.price}</p>}
                    </div>

                    {/* Certifications checkboxes */}
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Sertifikasi yang Dimiliki</label>
                      <div className="flex flex-wrap gap-3 mt-1.5">
                        {["APIGI", "HPI", "SAR", "K3 Gunung"].map((cert) => (
                          <label key={cert} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <input
                              type="checkbox"
                              checked={form.certifications.includes(cert)}
                              onChange={(e) => handleCheckboxChange(cert, e.target.checked)}
                              className="size-3.5 rounded border-gray-300 accent-emerald-600"
                            />
                            {cert}
                          </label>
                        ))}
                      </div>
                      {errors.certifications && <p className="text-[10px] text-red-500">{errors.certifications}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600">Upload Dokumen Sertifikat Resmi</label>
                    <div className="border border-dashed border-emerald-300 rounded-lg p-3 text-center bg-white">
                      <Award className="size-6 text-emerald-600 mx-auto mb-1" />
                      <p className="text-[10px] text-emerald-700 font-semibold">{form.docName}</p>
                      <p className="text-[9px] text-gray-400 mt-0.5">Format PDF/JPG, maks. 5MB (Disimulasikan)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Vendor-Specific Fields */}
              {selectedRole === "vendor" && (
                <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 space-y-3 animate-in fade-in duration-200">
                  <h4 className="text-xs font-bold text-emerald-800 border-b border-emerald-100 pb-1.5">Informasi Vendor Rental Outdoor</h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">Nama Toko Outdoor</label>
                      <Input
                        placeholder="Contoh: Summit Gear Rental"
                        className="bg-white border-gray-200 text-xs h-9"
                        value={form.storeName}
                        onChange={(e) => handleChange("storeName", e.target.value)}
                      />
                      {errors.storeName && <p className="text-[10px] text-red-500">{errors.storeName}</p>}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-semibold text-gray-600">NIB / Izin UKM</label>
                      <Input
                        placeholder="Contoh: 1234567890"
                        className="bg-white border-gray-200 text-xs h-9"
                        value={form.nib}
                        onChange={(e) => handleChange("nib", e.target.value)}
                      />
                      {errors.nib && <p className="text-[10px] text-red-500">{errors.nib}</p>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-600">Alamat Toko Fisik</label>
                    <div className="relative">
                      <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-gray-400" />
                      <Input
                        placeholder="Jl. Pendaki No. 12, Wonosobo, Jawa Tengah"
                        className="bg-white border-gray-200 pl-8 text-xs h-9"
                        value={form.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                      />
                    </div>
                    {errors.address && <p className="text-[10px] text-red-500">{errors.address}</p>}
                  </div>
                </div>
              )}

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
                      className={`pl-9 pr-9 bg-gray-50 border-gray-200 text-sm ${errors.password ? "border-red-400 focus:border-red-400" : ""}`}
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
                      className={`pl-9 pr-9 bg-gray-50 border-gray-200 text-sm ${errors.confirmPassword ? "border-red-400 focus:border-red-400" : ""}`}
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

              {/* Terms Checkbox */}
              <div className="flex items-start gap-2 pt-2">
                <input
                  type="checkbox"
                  id="agreeTerms"
                  checked={form.agreeTerms}
                  onChange={(e) => handleChange("agreeTerms", e.target.checked)}
                  className="size-4 mt-0.5 rounded border-gray-300 accent-emerald-600"
                />
                <label htmlFor="agreeTerms" className="text-xs text-gray-600 leading-relaxed">
                  Saya menyetujui{" "}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Syarat & Ketentuan</a>{" "}
                  dan{" "}
                  <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">Kebijakan Privasi</a>{" "}
                  AyokMendaki
                </label>
              </div>
              {errors.agreeTerms && <p className="text-[10px] text-red-500">{errors.agreeTerms}</p>}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white h-11 text-base font-semibold shadow-sm transition-all"
                disabled={loading}
              >
                {loading ? "Mendaftarkan Akun..." : "Buat Akun Gratis"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
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


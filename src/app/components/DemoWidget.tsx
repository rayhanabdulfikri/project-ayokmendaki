import { useState } from "react";
import { useApp, User } from "../context/AppContext";
import { UserCheck, ShieldAlert, Sparkles, UserCheck2, RefreshCw } from "lucide-react";
import { toast, Toaster } from "sonner";
import { useNavigate, useLocation } from "react-router";

const MOCK_USERS: User[] = [
  { id: "pendaki1", name: "Zaki Firdaus (Pendaki)", email: "zaki@ayokmendaki.com", role: "pendaki", phone: "08123456789", verified: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zaki" },
  { id: "guide1", name: "Ahmad Hidayat (Guide)", email: "ahmad@ayokmendaki.com", role: "guide", phone: "08234567890", verified: true, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad" },
  { id: "vendor1", name: "Outdoor Store (Vendor)", email: "outdoor@ayokmendaki.com", role: "vendor", phone: "08345678901", verified: true, avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=outdoor" },
  { id: "admin1", name: "Super Admin (Admin)", email: "admin@ayokmendaki.com", role: "admin", phone: "08567890123", verified: true, avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=admin" },
];

export function DemoWidget() {
  const { currentUser, setCurrentUser } = useApp();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSwitch = (user: User) => {
    setCurrentUser(user);
    setOpen(false);
    toast.success(`Berhasil berpindah ke akun: ${user.name}`, {
      description: `Role Anda sekarang: ${user.role.toUpperCase()}`,
      duration: 3000,
    });
    
    // If user is on dashboard, refresh or stay. If not, ask to go to dashboard.
    if (!location.pathname.startsWith("/dashboard")) {
      toast.info("Ingin membuka dashboard peran ini?", {
        action: {
          label: "Buka Dashboard",
          onClick: () => navigate("/dashboard")
        }
      });
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setOpen(false);
    toast.info("Anda telah keluar (Mode Tamu)");
    navigate("/");
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2 font-sans">
      <Toaster position="top-right" richColors />
      
      {open && (
        <div className="bg-white/90 backdrop-blur-md border border-emerald-100 rounded-2xl p-4 shadow-2xl w-72 mb-2 animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className="flex items-center gap-2 mb-3 border-b border-gray-100 pb-2">
            <Sparkles className="size-5 text-emerald-600 animate-pulse" />
            <h3 className="font-bold text-sm text-gray-800">Demo Role Switcher</h3>
          </div>
          
          <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
            Ganti akun instan untuk mensimulasikan interaksi multi-role pendaki, guide, vendor, dan admin sesuai SRS.
          </p>
          
          <div className="space-y-1.5">
            {MOCK_USERS.map((user) => {
              const isActive = currentUser?.id === user.id;
              return (
                <button
                  key={user.id}
                  onClick={() => handleSwitch(user)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left text-xs font-semibold transition-all border ${
                    isActive
                      ? "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm"
                      : "bg-gray-50 border-gray-100 hover:bg-emerald-50/50 hover:border-emerald-100 text-gray-700"
                  }`}
                >
                  <img src={user.avatar} alt={user.name} className="size-6 rounded-full bg-emerald-100 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate leading-tight">{user.name.split(" (")[0]}</p>
                    <p className="text-[10px] text-gray-400 capitalize truncate">{user.role}</p>
                  </div>
                  {isActive && <UserCheck2 className="size-4 text-emerald-600 shrink-0 animate-bounce" />}
                </button>
              );
            })}
          </div>
          
          {currentUser && (
            <button
              onClick={handleLogout}
              className="w-full mt-3 py-1.5 rounded-lg border border-red-200 text-center text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
            >
              Keluar (Mode Tamu)
            </button>
          )}
        </div>
      )}
      
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold text-xs py-3 px-4 rounded-full shadow-lg hover:shadow-xl transition-all scale-100 hover:scale-105 active:scale-95 group border border-white/20"
      >
        <RefreshCw className={`size-4 ${open ? "rotate-180" : ""} transition-transform duration-500`} />
        <span>{currentUser ? `Role: ${currentUser.role.toUpperCase()}` : "Ganti Akun Demo"}</span>
      </button>
    </div>
  );
}

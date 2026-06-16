import { Button } from "./ui/button";
import { Mountain, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { useApp } from "../context/AppContext";

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useApp();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    setCurrentUser(null);
    setMobileMenuOpen(false);
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2">
            <Mountain className="size-8 text-emerald-600" />
            <span className="text-xl font-bold text-foreground">AyokMendaki</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm transition-colors ${
                isActive("/") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
              }`}
            >
              Beranda
            </Link>
            <Link
              to="/gunung"
              className={`text-sm transition-colors ${
                isActive("/gunung") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
              }`}
            >
              Gunung
            </Link>
            <Link
              to="/guide"
              className={`text-sm transition-colors ${
                isActive("/guide") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
              }`}
            >
              Guide
            </Link>
            <Link
              to="/rental"
              className={`text-sm transition-colors ${
                isActive("/rental") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
              }`}
            >
              Rental Alat
            </Link>
            <Link
              to="/tentang"
              className={`text-sm transition-colors ${
                isActive("/tentang") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
              }`}
            >
              Tentang
            </Link>
            {currentUser && (
              <Link
                to="/dashboard"
                className={`text-sm transition-colors flex items-center gap-1.5 ${
                  isActive("/dashboard") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
                }`}
              >
                <LayoutDashboard className="size-4" />
                Dashboard
              </Link>
            )}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {currentUser ? (
              <div className="flex items-center gap-4 border border-emerald-100 rounded-full pl-2 pr-3 py-1.5 bg-emerald-50/50">
                <img
                  src={currentUser.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"}
                  alt={currentUser.name}
                  className="size-7 rounded-full bg-emerald-100 border border-emerald-200 shrink-0"
                />
                <div className="text-left leading-none">
                  <p className="text-xs font-bold text-gray-800 truncate max-w-28">{currentUser.name.split(" (")[0]}</p>
                  <span className="text-[9px] font-semibold uppercase px-1 py-0.2 rounded bg-emerald-600 text-white leading-none inline-block mt-0.5">
                    {currentUser.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors text-gray-400"
                  title="Keluar"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Masuk</Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-emerald-600 hover:bg-emerald-700">Daftar</Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-in slide-in-from-top-4 duration-200">
            <div className="flex flex-col gap-4">
              <Link
                to="/"
                className={`text-sm transition-colors ${
                  isActive("/") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Beranda
              </Link>
              <Link
                to="/gunung"
                className={`text-sm transition-colors ${
                  isActive("/gunung") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Gunung
              </Link>
              <Link
                to="/guide"
                className={`text-sm transition-colors ${
                  isActive("/guide") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Guide
              </Link>
              <Link
                to="/rental"
                className={`text-sm transition-colors ${
                  isActive("/rental") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Rental Alat
              </Link>
              <Link
                to="/tentang"
                className={`text-sm transition-colors ${
                  isActive("/tentang") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
                }`}
                onClick={() => setMobileMenuOpen(false)}
              >
                Tentang
              </Link>
              {currentUser && (
                <Link
                  to="/dashboard"
                  className={`text-sm transition-colors ${
                    isActive("/dashboard") ? "text-emerald-600 font-medium" : "hover:text-emerald-600"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard ({currentUser.role.toUpperCase()})
                </Link>
              )}
              <div className="flex flex-col gap-2 pt-4 border-t border-border">
                {currentUser ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 px-2">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="size-9 rounded-full bg-emerald-100"
                      />
                      <div>
                        <p className="text-sm font-bold text-gray-800">{currentUser.name}</p>
                        <p className="text-xs text-gray-400">{currentUser.email}</p>
                      </div>
                    </div>
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-600"
                    >
                      <LogOut className="size-4 mr-2" />
                      Keluar
                    </Button>
                  </div>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button variant="ghost" className="w-full">Masuk</Button>
                    </Link>
                    <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                      <Button className="w-full bg-emerald-600 hover:bg-emerald-700">Daftar</Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}


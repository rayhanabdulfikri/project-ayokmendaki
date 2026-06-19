import { Mountain } from "lucide-react";
import { Link } from "react-router";
import logoIcon from "../../assets/logo_icon.jpeg";

export function Footer() {
  return (
    <footer className="bg-slate-900 text-white py-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <img src={logoIcon} alt="Logo" className="size-8 object-contain rounded-lg" />
              <span className="text-xl font-bold">AyokMendaki</span>
            </div>
            <p className="text-sm text-gray-400">
              Platform marketplace pendakian gunung terpercaya di Indonesia
            </p>
          </div>

          <div>
            <h4 className="font-bold mb-4">Layanan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/gunung" className="hover:text-white transition-colors">Cari Gunung</Link></li>
              <li><Link to="/guide" className="hover:text-white transition-colors">Booking Guide</Link></li>
              <li><Link to="/rental" className="hover:text-white transition-colors">Sewa Alat</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Community Trip</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Perusahaan</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/tentang" className="hover:text-white transition-colors">Tentang Kami</Link></li>
              <li><a href="#" className="hover:text-white transition-colors">Karir</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Hubungi Kami</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Kebijakan Privasi</a></li>
              <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 PT. AyokMendaki Teknologi Indonesia. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

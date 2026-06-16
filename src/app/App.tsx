import { BrowserRouter, Routes, Route } from "react-router";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { HomePage } from "./pages/HomePage";
import { GunungPage } from "./pages/GunungPage";
import { GuidePage } from "./pages/GuidePage";
import { RentalPage } from "./pages/RentalPage";
import { TentangPage } from "./pages/TentangPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AppProvider } from "./context/AppContext";
import { DemoWidget } from "./components/DemoWidget";

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth pages — no Navbar/Footer */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Main pages — with Navbar/Footer */}
          <Route
            path="/*"
            element={
              <div className="min-h-screen bg-background flex flex-col relative">
                <Navbar />
                <main className="flex-1">
                  <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/gunung" element={<GunungPage />} />
                    <Route path="/guide" element={<GuidePage />} />
                    <Route path="/rental" element={<RentalPage />} />
                    <Route path="/tentang" element={<TentangPage />} />
                    <Route path="/dashboard" element={<DashboardPage />} />
                  </Routes>
                </main>
                <Footer />
                <DemoWidget />
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}


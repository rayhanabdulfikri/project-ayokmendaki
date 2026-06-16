import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import { Button } from "../components/ui/button";
import { Card, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Search,
  Star,
  MapPin,
  TrendingUp,
  Cloud,
  Thermometer,
  ChevronLeft,
  ChevronRight,
  Wind,
  Droplets,
  Map,
  List,
  RefreshCw,
  X,
  Calendar,
  Users,
  Ticket
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { toast } from "sonner";
import { useNavigate } from "react-router";

// ─── Types ────────────────────────────────────────────────────────────────────
interface WeatherData {
  temp: string;
  tempRaw: number;
  weather: string;
  humidity: string;
  windSpeed: string;
  weatherCode: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_PER_PAGE = 4;

// ─── Helpers ──────────────────────────────────────────────────────────────────
function interpretWeather(code: number): string {
  if (code === 0) return "Cerah";
  if (code <= 3)  return "Berawan Sebagian";
  if (code <= 49) return "Berkabut";
  if (code <= 59) return "Gerimis";
  if (code <= 69) return "Hujan";
  if (code <= 79) return "Salju";
  if (code <= 82) return "Hujan Lebat";
  if (code <= 86) return "Salju Lebat";
  if (code <= 99) return "Badai Petir";
  return "—";
}

function weatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3)  return "⛅";
  if (code <= 49) return "🌫️";
  if (code <= 69) return "🌧️";
  if (code <= 82) return "⛈️";
  return "🌩️";
}

function difficultyColor(d: string): string {
  if (d === "Mudah")  return "bg-green-100 text-green-700 border-green-200";
  if (d === "Sedang") return "bg-yellow-100 text-yellow-700 border-yellow-200";
  return "bg-red-100 text-red-700 border-red-200";
}

async function fetchWeather(lat: number, lng: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m` +
    `&wind_speed_unit=kmh&timezone=Asia%2FJakarta`;
  const res  = await fetch(url);
  const data = await res.json();
  const c    = data.current;
  const code = c.weather_code as number;
  return {
    temp:      `${Math.round(c.temperature_2m)}°C`,
    tempRaw:   Math.round(c.temperature_2m),
    humidity:  `${c.relative_humidity_2m}%`,
    windSpeed: `${Math.round(c.wind_speed_10m)} km/h`,
    weather:   interpretWeather(code),
    weatherCode: code,
  };
}

// ─── Leaflet map loader (CDN, no npm install needed) ─────────────────────────
function loadLeaflet(): Promise<void> {
  return new Promise((resolve) => {
    if ((window as any).L) { resolve(); return; }

    // CSS
    if (!document.getElementById("leaflet-css")) {
      const link  = document.createElement("link");
      link.id     = "leaflet-css";
      link.rel    = "stylesheet";
      link.href   = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // JS
    if (!document.getElementById("leaflet-js")) {
      const script    = document.createElement("script");
      script.id       = "leaflet-js";
      script.src      = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload   = () => resolve();
      document.head.appendChild(script);
    } else {
      // Already added but might still be loading
      const check = setInterval(() => {
        if ((window as any).L) { clearInterval(check); resolve(); }
      }, 50);
    }
  });
}

// ─── Component ────────────────────────────────────────────────────────────────
export function GunungPage() {
  const { mountains, addBooking, currentUser } = useApp();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery]     = useState("");
  const [activeFilter, setActiveFilter]   = useState("Semua");
  const [currentPage, setCurrentPage]     = useState(1);
  const [viewMode, setViewMode]           = useState<"list" | "map">("list");
  const [weatherMap, setWeatherMap]       = useState<Record<string, WeatherData>>({});
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [lastUpdated, setLastUpdated]     = useState<Date | null>(null);
  const [selectedMountain, setSelectedMountain] = useState<any>(null);

  // Booking Modal States
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [bookingMountain, setBookingMountain] = useState<any>(null);
  const [bookingDate, setBookingDate] = useState("");
  const [climbersCount, setClimbersCount] = useState(1);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const leafletMapRef   = useRef<any>(null);
  const markersRef      = useRef<any[]>([]);

  const filters = ["Semua", "Mudah", "Sedang", "Sulit", "Jawa Timur", "Jawa Tengah", "Jawa Barat"];

  // Booking handlers
  const handleOpenBookingModal = (mountain: any) => {
    if (!currentUser) {
      toast.warning("Silakan masuk terlebih dahulu untuk memesan tiket.");
      navigate("/login");
      return;
    }
    setBookingMountain(mountain);
    setBookingDate("");
    setClimbersCount(1);
    setBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!bookingDate) {
      toast.error("Silakan tentukan tanggal pendakian.");
      return;
    }
    if (climbersCount < 1) {
      toast.error("Jumlah pendaki minimal 1 orang.");
      return;
    }

    const price = bookingMountain.ticketPrice * climbersCount;
    
    addBooking({
      mountainName: bookingMountain.name,
      pendakiId: currentUser?.id || "guest",
      pendakiName: currentUser?.name || "Pendaki Demo",
      bookingDate,
      price,
      officialTicketBooking: true
    });

    setBookingModalOpen(false);
    toast.success(`Berhasil memesan tiket masuk resmi ${bookingMountain.name}!`, {
      description: `Total Pembayaran: Rp ${price.toLocaleString("id-ID")}`,
    });
    navigate("/dashboard");
  };

  // ── Fetch weather for all mountains ────────────────────────────────────────
  const fetchAllWeather = useCallback(async () => {
    setLoadingWeather(true);
    try {
      const pairs = await Promise.all(
        mountains.map(async (m) => {
          try {
            const w = await fetchWeather(m.lat, m.lng);
            return [m.name, w] as [string, WeatherData];
          } catch {
            return [m.name, { temp: "--°C", tempRaw: 0, weather: "Tidak tersedia", humidity: "--%", windSpeed: "-- km/h", weatherCode: -1 }] as [string, WeatherData];
          }
        })
      );
      setWeatherMap(Object.fromEntries(pairs));
      setLastUpdated(new Date());
    } finally {
      setLoadingWeather(false);
    }
  }, [mountains]);

  useEffect(() => { fetchAllWeather(); }, [fetchAllWeather]);


  // ── Filter + paginate ───────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let r = mountains;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      r = r.filter((m) => m.name.toLowerCase().includes(q) || m.location.toLowerCase().includes(q));
    }
    if (activeFilter !== "Semua") {
      r = r.filter((m) => m.difficulty === activeFilter || m.location.includes(activeFilter));
    }
    return r;
  }, [searchQuery, activeFilter, mountains]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleFilterChange = (f: string) => { setActiveFilter(f); setCurrentPage(1); };
  const handleSearch       = (q: string) => { setSearchQuery(q);  setCurrentPage(1); };

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  // ── Leaflet map init ────────────────────────────────────────────────────────
  useEffect(() => {
    if (viewMode !== "map") return;

    let cancelled = false;

    const init = async () => {
      await loadLeaflet();
      if (cancelled || !mapContainerRef.current) return;

      const L = (window as any).L;

      // Destroy previous instance
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersRef.current    = [];
      }

      const map = L.map(mapContainerRef.current, {
        center:    [-7.5, 110.5],
        zoom:      7,
        zoomControl: true,
      });
      leafletMapRef.current = map;

      // OpenStreetMap tile (100% free, no key)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      // Add markers
      mountains.forEach((mountain) => {
        const w = weatherMap[mountain.name];

        const diffColor =
          mountain.difficulty === "Mudah"  ? "#16a34a" :
          mountain.difficulty === "Sedang" ? "#ca8a04" : "#dc2626";

        const markerHtml = `
          <div style="
            background: ${mountain.status === "Tutup" ? "#6b7280" : "#059669"};
            color: white;
            border-radius: 10px;
            padding: 5px 9px;
            font-size: 11px;
            font-weight: 700;
            white-space: nowrap;
            box-shadow: 0 3px 10px rgba(0,0,0,0.35);
            border: 2px solid white;
            display: flex;
            align-items: center;
            gap: 4px;
            cursor: pointer;
          ">
            <span>⛰️</span>
            <span>${w ? w.temp : "..."}</span>
          </div>
        `;

        const icon = L.divIcon({
          html:       markerHtml,
          className:  "",
          iconAnchor: [40, 18],
        });

        const marker = L.marker([mountain.lat, mountain.lng], { icon })
          .addTo(map)
          .on("click", () => setSelectedMountain(mountain));

        // Popup
        const popupContent = `
          <div style="font-family:system-ui,sans-serif;min-width:220px;padding:4px">
            <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:3px">
              <span style="font-weight:700;font-size:14px;color:#065f46">${mountain.name}</span>
              <span style="font-size:9px;font-weight:bold;padding:1px 4px;border-radius:3px;background:${mountain.status === 'Buka' ? '#d1fae5;color:#065f46' : '#fee2e2;color:#991b1b'}">
                ${mountain.status === 'Buka' ? 'Ready' : 'Tutup'}
              </span>
            </div>
            <div style="color:#6b7280;font-size:11px;margin-bottom:8px">
              📍 ${mountain.location} &nbsp;•&nbsp; 📈 ${mountain.elevation}
            </div>
            <div style="background:#f0fdf4;border-radius:8px;padding:8px">
              <div style="font-weight:600;color:#065f46;font-size:12px;margin-bottom:5px">
                ${w ? weatherEmoji(w.weatherCode) : "🔄"} Cuaca Sekarang
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px">
                <div>🌡️ <b>${w?.temp ?? "..."}</b></div>
                <div>💧 <b>${w?.humidity ?? "..."}</b></div>
                <div>💨 <b>${w?.windSpeed ?? "..."}</b></div>
                <div>☁️ <b>${w?.weather ?? "..."}</b></div>
              </div>
            </div>
            <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
              <span style="
                background:${diffColor}22;
                color:${diffColor};
                padding:2px 8px;
                border-radius:4px;
                font-size:10px;
                font-weight:700;
                border:1px solid ${diffColor}44;
              ">${mountain.difficulty}</span>
              <span style="font-size:11px">⭐ ${mountain.rating} (${mountain.reviews.toLocaleString()})</span>
            </div>
          </div>
        `;
        marker.bindPopup(L.popup({ maxWidth: 260 }).setContent(popupContent));

        markersRef.current.push({ marker, mountain });
      });
    };

    init();

    return () => {
      cancelled = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
        markersRef.current    = [];
      }
    };
  }, [viewMode, mountains]); // intentionally NOT include weatherMap here — updated separately below

  // ── Update marker icons when weather loads ──────────────────────────────────
  useEffect(() => {
    if (!leafletMapRef.current || Object.keys(weatherMap).length === 0) return;
    const L = (window as any).L;
    if (!L) return;

    markersRef.current.forEach(({ marker, mountain }) => {
      const w = weatherMap[mountain.name];
      if (!w) return;
      const newHtml = `
        <div style="
          background: ${mountain.status === "Tutup" ? "#6b7280" : "#059669"};color:white;border-radius:10px;padding:5px 9px;
          font-size:11px;font-weight:700;white-space:nowrap;
          box-shadow:0 3px 10px rgba(0,0,0,0.35);border:2px solid white;
          display:flex;align-items:center;gap:4px;cursor:pointer;
        ">
          <span>${weatherEmoji(w.weatherCode)}</span>
          <span>${w.temp}</span>
        </div>
      `;
      marker.setIcon(L.divIcon({ html: newHtml, className: "", iconAnchor: [40, 18] }));

      // Refresh popup content too
      const diffColor =
        mountain.difficulty === "Mudah"  ? "#16a34a" :
        mountain.difficulty === "Sedang" ? "#ca8a04" : "#dc2626";
      marker.setPopupContent(`
        <div style="font-family:system-ui,sans-serif;min-width:220px;padding:4px">
          <div style="font-weight:700;font-size:14px;color:#065f46;margin-bottom:3px">${mountain.name}</div>
          <div style="color:#6b7280;font-size:11px;margin-bottom:8px">
            📍 ${mountain.location} &nbsp;•&nbsp; 📈 ${mountain.elevation}
          </div>
          <div style="background:#f0fdf4;border-radius:8px;padding:8px">
            <div style="font-weight:600;color:#065f46;font-size:12px;margin-bottom:5px">
              ${weatherEmoji(w.weatherCode)} Cuaca Sekarang
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:11px">
              <div>🌡️ <b>${w.temp}</b></div>
              <div>💧 <b>${w.humidity}</b></div>
              <div>💨 <b>${w.windSpeed}</b></div>
              <div>☁️ <b>${w.weather}</b></div>
            </div>
          </div>
          <div style="margin-top:8px;display:flex;align-items:center;gap:6px">
            <span style="background:${diffColor}22;color:${diffColor};padding:2px 8px;border-radius:4px;font-size:10px;font-weight:700;border:1px solid ${diffColor}44">${mountain.difficulty}</span>
            <span style="font-size:11px">⭐ ${mountain.rating} (${mountain.reviews.toLocaleString()})</span>
          </div>
        </div>
      `);
    });
  }, [weatherMap]);

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen">

      {/* ── Header ── */}
      <section className="bg-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">Jelajahi Gunung Indonesia</h1>
          <p className="text-lg opacity-90 max-w-2xl">
            Temukan destinasi pendakian terbaik dengan informasi lengkap jalur, tingkat kesulitan, dan kondisi cuaca terkini
          </p>
          {lastUpdated && (
            <p className="text-sm opacity-70 mt-2">
              🕒 Cuaca diperbarui: {lastUpdated.toLocaleTimeString("id-ID")}
            </p>
          )}
        </div>
      </section>

      {/* ── Search + Filter bar ── */}
      <section className="bg-white border-b border-border sticky top-16 z-40">
        <div className="container mx-auto px-4 sm:px-6 py-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
              <Input
                placeholder="Cari nama gunung atau lokasi..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>

            {/* Refresh weather */}
            <Button
              variant="outline"
              onClick={fetchAllWeather}
              disabled={loadingWeather}
              className="gap-2 shrink-0"
            >
              <RefreshCw className={`size-4 ${loadingWeather ? "animate-spin" : ""}`} />
              {loadingWeather ? "Memperbarui..." : "Update Cuaca"}
            </Button>

            {/* View toggle */}
            <div className="flex border border-border rounded-lg overflow-hidden shrink-0">
              <button
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  viewMode === "list"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setViewMode("list")}
              >
                <List className="size-4" /> Daftar
              </button>
              <button
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors border-l border-border ${
                  viewMode === "map"
                    ? "bg-emerald-600 text-white"
                    : "bg-white text-muted-foreground hover:bg-muted"
                }`}
                onClick={() => setViewMode("map")}
              >
                <Map className="size-4" /> Peta
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex gap-2 mt-3 flex-wrap">
            {filters.map((f) => (
              <Badge
                key={f}
                variant={activeFilter === f ? "secondary" : "outline"}
                className={`cursor-pointer transition-colors ${
                  activeFilter === f
                    ? "bg-emerald-100 text-emerald-700 border-emerald-300 hover:bg-emerald-100"
                    : "hover:bg-emerald-50"
                }`}
                onClick={() => handleFilterChange(f)}
              >
                {f}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ MAP VIEW ══════════════ */}
      {viewMode === "map" && (
        <section className="py-6">
          <div className="container mx-auto px-4 sm:px-6">

            {/* Map container */}
            <div
              className="rounded-xl overflow-hidden border border-border shadow-lg"
              style={{ height: "55vh", minHeight: 380 }}
            >
              <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
            </div>

            {/* Scrollable mini weather strip */}
            <div className="mt-3 bg-white rounded-xl border border-border p-3 overflow-x-auto">
              <p className="text-xs font-semibold text-emerald-700 mb-2">
                ⛰️ Klik marker atau kartu untuk detail cuaca:
              </p>
              <div className="flex gap-2" style={{ minWidth: "max-content" }}>
                {mountains.map((m, i) => {
                  const w = weatherMap[m.name];
                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedMountain(m);
                        if (leafletMapRef.current) {
                          leafletMapRef.current.flyTo([m.lat, m.lng], 11, { duration: 1 });
                        }
                      }}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left transition-all shrink-0 hover:shadow-md ${
                        selectedMountain?.name === m.name
                          ? "border-emerald-500 bg-emerald-50 shadow-sm"
                          : "border-border bg-white"
                      }`}
                    >
                      <span className="text-base">{w ? weatherEmoji(w.weatherCode) : "🔄"}</span>
                      <div>
                        <p className="text-xs font-semibold text-foreground leading-tight">{m.name}</p>
                        <p className="text-xs text-emerald-700 font-bold">
                          {w ? w.temp : <span className="text-muted-foreground animate-pulse">...</span>}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selected mountain detail panel */}
            {selectedMountain && (
              <div className="mt-3 bg-white rounded-xl border border-border p-5 shadow-sm relative animate-in slide-in-from-bottom-2 duration-300">
                <button
                  onClick={() => setSelectedMountain(null)}
                  className="absolute top-4 right-4 p-1 rounded-full hover:bg-muted text-muted-foreground"
                >
                  <X className="size-4" />
                </button>

                <div className="flex flex-col sm:flex-row gap-5">
                  <img
                    src={selectedMountain.image}
                    alt={selectedMountain.name}
                    className="w-full sm:w-52 h-36 object-cover rounded-lg shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-xl font-bold">{selectedMountain.name}</h3>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded border ${difficultyColor(selectedMountain.difficulty)}`}>
                        {selectedMountain.difficulty}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${selectedMountain.status === "Buka" ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}`}>
                        {selectedMountain.status === "Buka" ? "Ready" : "Tutup"}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mb-4">
                      <span className="flex items-center gap-1"><MapPin className="size-3" />{selectedMountain.location}</span>
                      <span className="flex items-center gap-1"><TrendingUp className="size-3" />{selectedMountain.elevation}</span>
                      <span className="flex items-center gap-1">
                        <Star className="size-3 fill-yellow-400 text-yellow-400" />
                        {selectedMountain.rating}
                        <span className="text-xs">({selectedMountain.reviews.toLocaleString()} ulasan)</span>
                      </span>
                    </div>

                    {/* Live weather grid */}
                    {(() => {
                      const w = weatherMap[selectedMountain.name];
                      return (
                        <div className="bg-emerald-50 rounded-lg p-4 mb-3 border border-emerald-100">
                          <p className="text-xs font-semibold text-emerald-700 mb-3">
                            {w ? weatherEmoji(w.weatherCode) : "🔄"} Cuaca Real-Time — Open-Meteo
                          </p>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                              { icon: <Thermometer className="size-4 text-orange-500" />, label: "Suhu",       val: w?.temp      },
                              { icon: <Cloud        className="size-4 text-blue-500"   />, label: "Kondisi",   val: w?.weather   },
                              { icon: <Droplets     className="size-4 text-sky-400"    />, label: "Kelembapan",val: w?.humidity  },
                              { icon: <Wind         className="size-4 text-slate-500"  />, label: "Angin",     val: w?.windSpeed },
                            ].map((item, idx) => (
                              <div key={idx} className="bg-white rounded-lg p-3 text-center shadow-sm border border-emerald-50">
                                <div className="flex justify-center mb-1">{item.icon}</div>
                                <p className="text-[10px] text-muted-foreground">{item.label}</p>
                                <p className="text-sm font-bold">
                                  {item.val ?? <span className="text-muted-foreground animate-pulse text-xs">Memuat...</span>}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })()}

                    <div className="flex gap-2">
                      <Button
                        className={`text-sm ${selectedMountain.status === "Tutup" ? "bg-gray-200 text-gray-400 cursor-not-allowed border-gray-300" : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"}`}
                        disabled={selectedMountain.status === "Tutup"}
                        onClick={() => handleOpenBookingModal(selectedMountain)}
                      >
                        {selectedMountain.status === "Tutup" ? "Gunung Tutup" : "Pesan Tiket Masuk Resmi"}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Attribution */}
            <p className="text-[11px] text-muted-foreground mt-2">
              🗺️ Peta: <a href="https://www.openstreetmap.org" target="_blank" rel="noopener noreferrer" className="underline">OpenStreetMap</a> via Leaflet
              &nbsp;•&nbsp;
              🌡️ Cuaca: <a href="https://open-meteo.com" target="_blank" rel="noopener noreferrer" className="underline">Open-Meteo</a>
              &nbsp;— keduanya gratis & tanpa API key
            </p>
          </div>
        </section>
      )}

      {/* ══════════════ LIST VIEW ══════════════ */}
      {viewMode === "list" && (
        <section className="py-12">
          <div className="container mx-auto px-4 sm:px-6">

            <div className="mb-6 flex items-center justify-between flex-wrap gap-2">
              <p className="text-sm text-muted-foreground">
                Menampilkan{" "}
                <span className="font-medium text-foreground">
                  {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filtered.length)}
                </span>{" "}
                dari{" "}
                <span className="font-medium text-foreground">{filtered.length}</span> gunung
              </p>
              {loadingWeather && (
                <span className="text-xs text-emerald-600 flex items-center gap-1.5">
                  <RefreshCw className="size-3 animate-spin" /> Memuat data cuaca...
                </span>
              )}
            </div>

            {paginated.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <p className="text-lg font-medium">Tidak ada gunung ditemukan</p>
                <p className="text-sm mt-1">Coba ubah kata kunci atau filter pencarian</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {paginated.map((mountain, index) => {
                  const w = weatherMap[mountain.name];
                  return (
                    <Card
                      key={index}
                      className="overflow-hidden hover:shadow-xl transition-shadow cursor-pointer group flex flex-col justify-between"
                      onClick={() => { setSelectedMountain(mountain); setViewMode("map"); }}
                    >
                      <div className="relative h-48 overflow-hidden shrink-0">
                        <img
                          src={mountain.image}
                          alt={mountain.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        {/* Difficulty badge */}
                        <span className={`absolute top-3 left-3 text-xs font-semibold px-2 py-0.5 rounded border ${difficultyColor(mountain.difficulty)}`}>
                          {mountain.difficulty}
                        </span>
                        {/* Status badge */}
                        <span className={`absolute bottom-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded border shadow-sm ${mountain.status === "Buka" ? "bg-green-500 text-white border-green-400" : "bg-red-500 text-white border-red-400"}`}>
                          {mountain.status === "Buka" ? "Buka (Ready)" : "Tutup"}
                        </span>
                        {/* Live temp badge */}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1.5 shadow">
                          <span className="text-sm">{w ? weatherEmoji(w.weatherCode) : "🔄"}</span>
                          <span className="text-xs font-bold text-foreground">
                            {w ? w.temp : <span className="text-gray-400 animate-pulse">...</span>}
                          </span>
                        </div>
                      </div>

                      <CardHeader className="flex-1 flex flex-col justify-between p-5">
                        <div>
                          <CardTitle className="text-lg">{mountain.name}</CardTitle>
                          <div className="space-y-2 text-sm text-muted-foreground mt-2">
                            <div className="flex items-center gap-2">
                              <MapPin className="size-4 shrink-0" /> {mountain.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <TrendingUp className="size-4 shrink-0" /> {mountain.elevation}
                            </div>
                            <div className="flex items-center gap-2">
                              <Star className="size-4 fill-yellow-400 text-yellow-400 shrink-0" />
                              <span className="font-medium text-foreground">{mountain.rating}</span>
                              <span className="text-xs">({mountain.reviews.toLocaleString()} ulasan)</span>
                            </div>
                            
                            <div className="text-xs font-semibold text-emerald-650 bg-emerald-50 px-2 py-1 rounded">
                              🎟️ Tiket Resmi: Rp {mountain.ticketPrice.toLocaleString("id-ID")}
                            </div>

                            {/* Live weather strip */}
                            <div className="pt-2 border-t border-border space-y-1.5">
                              <div className="flex items-center gap-2">
                                <Cloud className="size-4 shrink-0" />
                                <span className="text-xs">{w?.weather ?? <span className="animate-pulse">Memuat...</span>}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-1 text-xs">
                                <div className="flex items-center gap-1">
                                  <Thermometer className="size-3 text-orange-500" />
                                  <span className="font-semibold text-emerald-700">{w?.temp ?? "—"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Droplets className="size-3 text-sky-500" />
                                  <span>{w?.humidity ?? "—"}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Wind className="size-3 text-slate-500" />
                                  <span>{w?.windSpeed ?? "—"}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            className="flex-1 text-xs"
                            onClick={(e) => { e.stopPropagation(); setSelectedMountain(mountain); setViewMode("map"); }}
                          >
                            Peta
                          </Button>
                          <Button
                            className={`flex-1 text-xs ${mountain.status === "Tutup" ? "bg-gray-200 text-gray-400 cursor-not-allowed" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                            disabled={mountain.status === "Tutup"}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenBookingModal(mountain);
                            }}
                          >
                            {mountain.status === "Tutup" ? "Tutup" : "Pesan Tiket"}
                          </Button>
                        </div>
                      </CardHeader>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <>
                <div className="flex items-center justify-center gap-1 mt-12">
                  <Button
                    variant="outline" size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="gap-1"
                  >
                    <ChevronLeft className="size-4" /> Sebelumnya
                  </Button>

                  {getPageNumbers().map((page, i) =>
                    page === "..." ? (
                      <span key={`dots-${i}`} className="px-2 text-muted-foreground">...</span>
                    ) : (
                      <Button
                        key={page}
                        variant={currentPage === page ? "default" : "outline"}
                        size="sm"
                        className={`min-w-9 ${currentPage === page ? "bg-emerald-600 hover:bg-emerald-700" : ""}`}
                        onClick={() => setCurrentPage(Number(page))}
                      >
                        {page}
                      </Button>
                    )
                  )}

                  <Button
                    variant="outline" size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="gap-1"
                  >
                    Berikutnya <ChevronRight className="size-4" />
                  </Button>
                </div>
                <p className="text-center text-xs text-muted-foreground mt-3">
                  Halaman {currentPage} dari {totalPages}
                </p>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── Official Booking Modal ── */}
      {bookingModalOpen && bookingMountain && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200 font-sans">
            <button onClick={() => setBookingModalOpen(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-gray-100 text-gray-400 transition-colors">
              <X className="size-5" />
            </button>
            <div className="flex items-center gap-2 text-emerald-800 font-bold mb-3">
              <Ticket className="size-6 text-emerald-600 shrink-0" />
              <h3 className="text-lg">Pesan Tiket Masuk Gunung</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed font-normal">
              Anda memesan tiket masuk/izin pendakian resmi untuk **{bookingMountain.name}**. Biaya tiket bersifat pas (fixed) dan langsung diteruskan ke instansi pengelola.
            </p>
            <div className="space-y-4 text-sm">
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                <p className="text-xs text-emerald-800 font-semibold">Tujuan Pendakian</p>
                <p className="font-bold text-gray-800 text-base">{bookingMountain.name}</p>
                <p className="text-xs text-gray-500">📍 {bookingMountain.location}</p>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Tanggal Mulai Mendaki</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <Input 
                    type="date" 
                    className="pl-9 text-xs" 
                    value={bookingDate} 
                    onChange={(e) => setBookingDate(e.target.value)} 
                    min={new Date().toISOString().split("T")[0]} 
                  />
                </div>
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Jumlah Pendaki (Anggota Rombongan)</label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none" />
                  <Input 
                    type="number" 
                    min={1} 
                    className="pl-9 text-xs" 
                    value={climbersCount} 
                    onChange={(e) => setClimbersCount(parseInt(e.target.value) || 1)} 
                  />
                </div>
              </div>
              
              <div className="border-t border-gray-150 pt-3 flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-400">Harga Tiket Satuan</p>
                  <p className="text-xs font-bold text-gray-700">Rp {bookingMountain.ticketPrice.toLocaleString("id-ID")} / Orang</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500 font-semibold">Total Pembayaran</p>
                  <p className="text-lg font-bold text-emerald-600">Rp {(bookingMountain.ticketPrice * climbersCount).toLocaleString("id-ID")}</p>
                </div>
              </div>
              
              <div className="flex gap-2.5 pt-2">
                <Button variant="outline" className="flex-1 text-xs" onClick={() => setBookingModalOpen(false)}>Batal</Button>
                <Button className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold" onClick={handleConfirmBooking}>Konfirmasi Booking</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

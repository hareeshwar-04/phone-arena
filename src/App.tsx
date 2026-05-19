import { useState, useMemo, useCallback, useEffect } from "react";
import { Smartphone, Trophy, X, SlidersHorizontal, Monitor, Layers, Search, Sparkles, BookOpen, Sun, Moon, Palette, Zap, Camera, Scale, Gamepad2, BatteryCharging, Coins, ExternalLink } from "lucide-react";
import type { PhoneSpec, WeightConfig, FilterConfig, UserPhoneSpecs } from "./types";
import { mockPhones, DEFAULT_FILTERS } from "./types";
import { usePhoneRatings, useWeightedSort, useShareBattle, getRamStorage } from "./hooks";
import { PhoneCard, SkeletonCard } from "./PhoneCard";
import { FilterSidebar } from "./FilterSidebar";
import { ComparisonMatrix } from "./ComparisonMatrix";
import { PhoneDetail } from "./PhoneDetail";
import { PhoneImage } from "./PhoneImage";
import { OnboardingWizard } from "./OnboardingWizard";
import { SpecGuideModal } from "./SpecGuideModal";
import { LegalModal } from "./LegalModal";

const SHEET_URL = "https://opensheet.elk.sh/1yhvi3qx40ijUz2RyQ7Vojfxx3ZGoyWcaUgTisWfOGmM/Sheet1";
type ViewMode = "discover" | "compare";
type SortOption = "match" | "price_asc" | "price_desc" | "performance" | "camera" | "os" | "battery" | "newest" | "ram" | "storage";

const PERSONAS = [
  {
    name: "Balanced",
    icon: <Scale size={16} className="text-neutral-500" />,
    desc: "Equal priorities for all attributes",
    weights: { performance: 50, reliability: 50, camera: 50, os: 50 }
  },
  {
    name: "Ultimate Gamer",
    icon: <Gamepad2 size={16} className="text-indigo-500" />,
    desc: "Speed & charging speed focused",
    weights: { performance: 100, reliability: 50, camera: 10, os: 10 }
  },
  {
    name: "Content Creator",
    icon: <Camera size={16} className="text-pink-500" />,
    desc: "Top-tier camera & media focus",
    weights: { performance: 50, reliability: 10, camera: 100, os: 50 }
  },
  {
    name: "Road Warrior",
    icon: <BatteryCharging size={16} className="text-green-500" />,
    desc: "Long durability & maximum battery",
    weights: { performance: 10, reliability: 100, camera: 10, os: 50 }
  },
  {
    name: "Smart Buyer",
    icon: <Coins size={16} className="text-amber-500" />,
    desc: "Highest hardware value per rupee",
    weights: { performance: 50, reliability: 50, camera: 10, os: 100 }
  }
];



const CPU_ANTUTU_MAP: Record<string, number> = {
  // Flagships (3M+)
  "Snapdragon 8 Elite Gen 5": 3300000,
  "Snapdragon 8 Gen 5": 3000000,
  "Snapdragon 8 Elite": 2850000,
  "Dimensity 9500": 3000000,
  "Dimensity 9400": 2750000,
  "Exynos 2600": 2500000,

  // High-End (1.5M - 2.5M)
  "Bionic A18 Pro": 1800000,
  "Apple A19 Pro": 2150000,
  "Apple A19": 1900000,
  "Bionic A18": 1600000,
  "Bionic A17 Pro": 1550000,
  "Bionic A16": 1400000,
  "Bionic A15": 1150000,
  "Apple A18 Pro": 1800000,
  "Apple A18": 1600000,
  "Apple A16": 1400000,
  "Apple A15": 1150000,
  "Snapdragon 8 Gen 3": 2050000,
  "Snapdragon 8s Gen 4": 1750000,
  "Snapdragon 8s Gen 3": 1550000,
  "Snapdragon 8 Gen 2": 1600000,
  "Snapdragon 8+ Gen 1": 1350000,
  "Snapdragon 8 Gen 1": 1150000,
  "Dimensity 9300": 2200000,
  "Dimensity 9300+": 2250000,
  "Dimensity 9200": 1450000,
  "Dimensity 9200+": 1500000,
  "Dimensity 8500 Ultra": 1500000,
  "Dimensity 8500 Extreme": 1500000,
  "Dimensity 8500": 1450000,
  "Dimensity 8450": 1350000,
  "Dimensity 8400 Ultra": 1450000,
  "Dimensity 8400": 1400000,
  "Dimensity 8350": 1400000,
  "Dimensity 8300-Ultra": 1400000,
  "Dimensity 8300": 1350000,
  "Exynos 2400": 1700000,
  "Tensor G4": 1250000,
  "Tensor G3": 1050000,

  // Upper Mid-Range (700K - 1.5M)
  "Snapdragon 7+ Gen 3": 1360000,
  "Snapdragon 7s Gen 4": 950000,
  "Snapdragon 7 Gen 4": 1150000,
  "Snapdragon 7 Gen4": 1150000,
  "Snapdragon 7 Gen 3": 850000,
  "Snapdragon 7s Gen 3": 800000,
  "Snapdragon 7+ Gen 2": 1100000,
  "Snapdragon 7s Gen 2": 610000,
  "Dimensity 8200": 950000,
  "Dimensity 7400 Turbo": 850000,
  "Dimensity 7400 Apex": 850000,
  "Dimensity 7400 Ultra": 850000,
  "Dimensity 7400": 800000,
  "Dimensity 7360 Turbo": 780000,
  "Dimensity 7300 Ultra": 750000,
  "Dimensity 7300": 740000,
  "Dimensity 7200 Ultra": 720000,
  "Dimensity 7200": 700000,
  "Exynos 1480": 710000,
  "Exynos 1580": 900000,

  // Mid-Range & Budget (Below 700K)
  "Snapdragon 6 Gen 4": 750000,
  "Snapdragon 6S Gen4": 750000,
  "Snapdragon 6 Gen 3": 620000,
  "Snapdragon 6 Gen 1": 550000,
  "Snapdragon 6s Gen 3": 480000,
  "Dimensity 7050": 580000,
  "Dimensity 7025 Ultra": 500000,
  "Dimensity 7025": 480000,
  "Dimensity 6400 Max": 460000,
  "Dimensity 6400 Turbo": 460000,
  "Dimensity 6400": 450000,
  "Dimensity 6360 Max": 450000,
  "Dimensity 6300": 420000,
  "Dimensity 6100+": 400000,
  "Dimensity 6080": 420000,
  "Exynos 1680": 580000,
  "Exynos 1380": 560000,
  "Exynos 1330": 430000,
  "Snapdragon 4 Gen 2": 450000,
  "Snapdragon 4s Gen 2": 400000,
  "Snapdragon 4 Gen 1": 380000,
  "Snapdragon 695": 450000,
  "Unisoc T8300": 310000,
  "Unisoc T760": 360000,
  "Unisoc T7250": 250000,
  "Helio G85": 240000,
  "Helio G99": 420000
};

function getReliableAnTuTu(cpu: string, currentScore: number): number {
  const cleanCpu = cpu.trim();
  if (CPU_ANTUTU_MAP[cleanCpu] !== undefined) {
    return CPU_ANTUTU_MAP[cleanCpu];
  }
  
  // Regex fallback logic
  const c = cleanCpu.toLowerCase();
  if (c.includes("elite gen 5") || c.includes("gen 5")) return 3200000;
  if (c.includes("elite")) return 2850000;
  if (c.includes("9500")) return 3000000;
  if (c.includes("9400")) return 2750000;
  if (c.includes("9300")) return 2200000;
  if (c.includes("a19 pro")) return 2150000;
  if (c.includes("a19")) return 1900000;
  if (c.includes("a18 pro")) return 1800000;
  if (c.includes("a18")) return 1600000;
  if (c.includes("a17 pro")) return 1550000;
  if (c.includes("a16")) return 1400000;
  if (c.includes("8 gen 3")) return 2050000;
  if (c.includes("8s gen 4")) return 1750000;
  if (c.includes("8s gen 3")) return 1550000;
  if (c.includes("8 gen 2")) return 1600000;
  if (c.includes("7 gen 4")) return 1150000;
  if (c.includes("7s gen 4")) return 950000;
  if (c.includes("7 gen 3")) return 850000;
  if (c.includes("7s gen 3")) return 800000;
  if (c.includes("7400")) return 850000;
  if (c.includes("7300")) return 740000;
  if (c.includes("7025")) return 500000;
  if (c.includes("6400")) return 450000;
  if (c.includes("6300")) return 420000;
  
  return currentScore || 500000;
}

function getReliableLaunchDate(name: string, sheetDate: string): string {
  if (sheetDate && /^\d{4}-\d{2}$/.test(sheetDate)) {
    return sheetDate;
  }

  const n = name.toLowerCase();
  
  // iPhone Series
  if (n.includes("iphone 17") || n.includes("iphone air")) return "2025-09";
  if (n.includes("iphone 16")) return "2024-09";
  if (n.includes("iphone 15")) return "2023-09";
  if (n.includes("iphone 14")) return "2022-09";
  if (n.includes("iphone 13")) return "2021-09";
  
  // Samsung S Series
  if (n.includes("s26 ultra") || n.includes("s26 5g") || n.includes("s26+")) return "2026-01";
  if (n.includes("s25 ultra") || n.includes("s25 5g") || n.includes("s25+")) return "2025-01";
  if (n.includes("s25 fe")) return "2025-10";
  if (n.includes("s24 ultra") || n.includes("s24 5g") || n.includes("s24 (snapdragon)") || n.includes("s24+")) return "2024-01";
  if (n.includes("s23 ultra") || n.includes("s23 5g") || n.includes("s23+")) return "2023-02";
  
  // Samsung A/M/F series
  if (n.includes("galaxy m56")) return "2025-04";
  if (n.includes("galaxy m17")) return "2026-03";
  if (n.includes("galaxy a37")) return "2026-03";
  if (n.includes("galaxy a17")) return "2026-03";
  if (n.includes("galaxy a07")) return "2026-01";
  if (n.includes("galaxy f56")) return "2025-04";
  if (n.includes("galaxy f70e")) return "2025-09";
  if (n.includes("galaxy a36")) return "2025-03";
  if (n.includes("galaxy a57")) return "2026-03";
  if (n.includes("galaxy f36")) return "2025-03";
  
  // OnePlus Series
  if (n.includes("oneplus 15")) return "2025-01";
  if (n.includes("oneplus 15r")) return "2025-10";
  if (n.includes("oneplus 13") || n.includes("oneplus 13r")) return "2025-01";
  if (n.includes("oneplus 13s")) return "2025-05";
  if (n.includes("oneplus nord 6")) return "2025-07";
  if (n.includes("oneplus nord 5")) return "2024-07";
  if (n.includes("oneplus nord ce 6")) return "2025-04";
  if (n.includes("oneplus nord ce 5")) return "2024-04";
  if (n.includes("oneplus nord ce 4")) return "2024-04";
  
  // POCO Series
  if (n.includes("poco x8 pro max") || n.includes("poco x8 pro") || n.includes("poco x8")) return "2026-01";
  if (n.includes("poco x7 pro") || n.includes("poco x7")) return "2025-01";
  if (n.includes("poco f7")) return "2025-05";
  if (n.includes("poco m8")) return "2025-05";
  if (n.includes("poco m7 pro") || n.includes("poco m7 plus") || n.includes("poco m7")) return "2024-09";
  if (n.includes("poco c85")) return "2025-09";
  if (n.includes("poco c75")) return "2024-11";
  
  // iQOO Series
  if (n.includes("iqoo 15r") || n.includes("iqoo 15")) return "2025-12";
  if (n.includes("iqoo 13")) return "2024-12";
  if (n.includes("neo 10")) return "2024-12";
  if (n.includes("iqoo z10")) return "2024-09";
  if (n.includes("iqoo z11")) return "2025-04";
  
  // Vivo Series
  if (n.includes("vivo x300")) return "2025-11";
  if (n.includes("vivo x200")) return "2024-10";
  if (n.includes("vivo v70")) return "2025-09";
  if (n.includes("vivo v60")) return "2025-03";
  if (n.includes("vivo t5 pro") || n.includes("vivo t5x")) return "2025-02";
  if (n.includes("vivo t4 pro") || n.includes("vivo t4 ultra") || n.includes("vivo t4 lite") || n.includes("vivo t4")) return "2024-09";
  
  // OPPO Series
  if (n.includes("oppo find x9")) return "2025-11";
  if (n.includes("oppo reno 15")) return "2025-06";
  if (n.includes("oppo reno 14")) return "2025-01";
  if (n.includes("oppo k13")) return "2024-11";
  if (n.includes("oppo k14")) return "2025-05";
  if (n.includes("oppo f33")) return "2025-03";
  if (n.includes("oppo f31")) return "2024-09";
  
  // Realme Series
  if (n.includes("realme gt 7t") || n.includes("realme gt 7 pro")) return "2024-11";
  if (n.includes("realme 15 pro") || n.includes("realme 15")) return "2025-01";
  if (n.includes("realme 16 pro") || n.includes("realme 16")) return "2025-07";
  if (n.includes("realme p4")) return "2025-04";
  if (n.includes("realme p3")) return "2025-04";
  if (n.includes("realme p1")) return "2024-04";
  if (n.includes("realme narzo 90")) return "2025-03";
  if (n.includes("realme narzo 80")) return "2024-09";
  
  // Motorola Series
  if (n.includes("edge 70")) return "2025-05";
  if (n.includes("edge 60")) return "2024-09";
  if (n.includes("moto g67")) return "2025-01";
  if (n.includes("moto g86")) return "2025-09";
  if (n.includes("moto g45")) return "2024-08";
  if (n.includes("moto g64")) return "2024-04";
  if (n.includes("moto g35")) return "2024-09";
  if (n.includes("razr fold")) return "2025-07";
  if (n.includes("motorola signature")) return "2025-10";

  return "2024-09";
}

function parseSheetRow(row: Record<string, string>): PhoneSpec {
  let brand = (row.brand || "").trim();
  const b = brand.toUpperCase();
  if (b === "OPPO") brand = "OPPO";
  else if (b === "IQOO") brand = "iQOO";
  else if (b === "POCO") brand = "POCO";
  else if (b === "APPLE") brand = "Apple";
  else if (b === "GOOGLE") brand = "Google";
  else if (b === "SAMSUNG") brand = "Samsung";
  else if (b === "ONEPLUS") brand = "OnePlus";
  else if (b === "REALME") brand = "Realme";
  else if (b === "MOTOROLA" || b === "MOTO") brand = "Motorola";
  else if (b === "NOTHING") brand = "Nothing";
  else if (b === "VIVO") brand = "Vivo";
  else if (b === "XIAOMI") brand = "Xiaomi";
  else if (b === "INFINIX") brand = "Infinix";
  else if (b === "TECNO") brand = "Tecno";

  let name = (row.name || "").trim();
  // Strip 5G case-insensitively
  name = name.replace(/\b5G\b/gi, "").replace(/\s+/g, " ").trim();

  // Also fix name prefix to match clean brand name
  const oldBrandPrefix = (row.brand || "").trim() + " ";
  const newBrandPrefix = brand + " ";
  if (name.toLowerCase().startsWith(oldBrandPrefix.toLowerCase())) {
    name = newBrandPrefix + name.slice(oldBrandPrefix.length);
  }

  const rawAntutu = Number(row.antutu_score) || 0;
  const antutu_score = getReliableAnTuTu(row.cpu_name || "", rawAntutu);

  const derivedCpuScore = Math.max(1, Math.min(10, (antutu_score / 3300000) * 9 + 1));
  const raw_cpu_score = Number(row.raw_cpu_score) || derivedCpuScore;

  const launch_date = getReliableLaunchDate(name, row.launch_date || "");

  return {
    id: row.id || "", name: name, brand: brand,
    price_inr: Number(row.price_inr) || 0, image_url: row.image_url || "",
    launch_date: launch_date, cpu_name: row.cpu_name || "",
    raw_cpu_score: raw_cpu_score, raw_ui_score: Number(row.raw_ui_score) || 0,
    os_updates_years: Number(row.os_updates_years) || 0, battery_mah: Number(row.battery_mah) || 0,
    charging_w: Number(row.charging_w) || 0, main_camera_score: Number(row.main_camera_score) || 0,
    front_camera_score: Number(row.front_camera_score) || 0,
    display_refresh_hz: Number(row.display_refresh_hz) || 0,
    build_quality_score: Number(row.build_quality_score) || 0,
    antutu_score: antutu_score,
    storage_type: row.storage_type || "UFS 2.2",
    ram_type: row.ram_type || "LPDDR4X",
    screen_type: row.screen_type || "IPS LCD",
    charging_mins: Number(row.charging_mins) || 60,
  };
}

export default function App() {
  const [rawPhones, setRawPhones] = useState<PhoneSpec[]>(mockPhones);
  const [userPhone, setUserPhone] = useState<UserPhoneSpecs | null>(() => {
    const saved = localStorage.getItem("pa_user_phone");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("discover");
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("match");
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [highlightCompare, setHighlightCompare] = useState(false);
  const [showComparePopup, setShowComparePopup] = useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(() => !localStorage.getItem("pa_wizard_done"));
  const [showSpecGuide, setShowSpecGuide] = useState(false);
  const [legalModalOpen, setLegalModalOpen] = useState(false);
  const [legalModalTab, setLegalModalTab] = useState<"terms" | "privacy" | "affiliate">("terms");
  const [showTooltip, setShowTooltip] = useState(() => !localStorage.getItem("pa_spec_tooltip_v3"));
  const [showWizardTooltip, setShowWizardTooltip] = useState(() => !localStorage.getItem("pa_wizard_tooltip_v3"));
  const [theme, setTheme] = useState<"light" | "dark">(() => (localStorage.getItem("pa_theme") as "light" | "dark") || "light");
  const [styleMode, setStyleMode] = useState<"colorful" | "stealth">(() => (localStorage.getItem("pa_style_mode") as "colorful" | "stealth") || "colorful");
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);
  const [visibleCount, setVisibleCount] = useState(15);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If we scroll down past 80px and position is greater than last scroll position, hide header
      if (currentScrollY > lastScrollY && currentScrollY > 80) {
        setShowHeader(false);
      } 
      // If we scroll up by any amount, show header
      else if (currentScrollY < lastScrollY) {
        setShowHeader(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("pa_theme", theme);
  }, [theme]);

  useEffect(() => {
    if (styleMode === "stealth") {
      document.documentElement.classList.add("stealth-mode");
    } else {
      document.documentElement.classList.remove("stealth-mode");
    }
    localStorage.setItem("pa_style_mode", styleMode);
  }, [styleMode]);

  const [filters, setFilters] = useState<FilterConfig>(() => {
    const saved = localStorage.getItem("pa_filters_v2");
    if (!saved) return { ...DEFAULT_FILTERS };
    try {
      const parsed = JSON.parse(saved);
      const weights = { ...DEFAULT_FILTERS.weights, ...parsed.weights };
      // Migrate old weight keys if they exist
      if (parsed.weights?.gaming !== undefined && parsed.weights?.performance === undefined) {
        weights.performance = parsed.weights.gaming;
      }
      if (parsed.weights?.durability !== undefined && parsed.weights?.reliability === undefined) {
        weights.reliability = parsed.weights.durability;
      }
      return { ...DEFAULT_FILTERS, ...parsed, weights };
    } catch {
      return { ...DEFAULT_FILTERS };
    }
  });

  useEffect(() => {
    setVisibleCount(15);
  }, [filters, searchQuery, sortBy]);

  // Persist filters
  useEffect(() => { localStorage.setItem("pa_filters_v2", JSON.stringify(filters)); }, [filters]);

  const activePersona = useMemo(() => {
    const w = filters.weights;
    const allEnabled = w.performanceEnabled !== false && w.reliabilityEnabled !== false && w.cameraEnabled !== false && w.osEnabled !== false;
    if (!allEnabled) return "Custom";
    return PERSONAS.find(p => 
      Object.keys(p.weights).every(k => w[k as keyof WeightConfig] === p.weights[k as keyof typeof p.weights])
    )?.name || "Custom";
  }, [filters.weights]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(SHEET_URL)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((data: Record<string, string>[]) => {
        if (cancelled) return;
        const parsed = data.map(parseSheetRow).filter((p) => p.id && p.name);
        if (parsed.length > 0) { setRawPhones(parsed); setFetchError(null); }
        else { setFetchError("Sheet returned no valid rows. Showing demo data."); setRawPhones(mockPhones); }
      })
      .catch(() => { if (!cancelled) { setFetchError("Live data unavailable — showing demo devices."); setRawPhones(mockPhones); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const phonesWithRatings = usePhoneRatings(rawPhones);
  const allIds = useMemo(() => rawPhones.map((p) => p.id), [rawPhones]);
  const brands = useMemo(() => [...new Set(rawPhones.map((p) => p.brand))].sort(), [rawPhones]);

  // Extract available filter options from the database
  const availableScreenTypes = useMemo(() => [...new Set(rawPhones.map(p => p.screen_type).filter(Boolean))].sort(), [rawPhones]);
  const availableRamTypes = useMemo(() => [...new Set(rawPhones.map(p => p.ram_type).filter(Boolean))].sort(), [rawPhones]);
  const availableStorageTypes = useMemo(() => [...new Set(rawPhones.map(p => p.storage_type).filter(Boolean))].sort(), [rawPhones]);
  
  const availableStorageCapacities = useMemo(() => {
    const capacities = new Set<number>();
    rawPhones.forEach(p => {
      const { storage } = getRamStorage(p.name);
      if (storage > 0) capacities.add(storage);
    });
    return [...capacities].sort((a, b) => a - b);
  }, [rawPhones]);

  const availableRamCapacities = useMemo(() => {
    const capacities = new Set<number>();
    rawPhones.forEach(p => {
      const { ram } = getRamStorage(p.name);
      if (ram > 0) capacities.add(ram);
    });
    return [...capacities].sort((a, b) => a - b);
  }, [rawPhones]);
  const availableProcessorTiers = useMemo(() => {
    const tiers = new Set<string>();
    rawPhones.forEach(p => {
      if (p.cpu_name.includes("Snapdragon 8")) tiers.add("Snapdragon 8 Series");
      else if (p.cpu_name.includes("Snapdragon 7")) tiers.add("Snapdragon 7 Series");
      else if (p.cpu_name.includes("Dimensity 9")) tiers.add("Dimensity 9000+");
      else if (p.cpu_name.includes("Dimensity 8")) tiers.add("Dimensity 8000+");
      else if (p.cpu_name.includes("A1")) tiers.add("Apple A-Series");
      else if (p.cpu_name.includes("Exynos")) tiers.add("Exynos");
      else if (p.cpu_name.includes("Tensor")) tiers.add("Google Tensor");
    });
    return [...tiers].sort();
  }, [rawPhones]);

  useShareBattle(comparedIds, (ids) => { setComparedIds(ids); setView("compare"); }, allIds);

  // Apply all filters
  const filteredPhones = useMemo(() => {
    return phonesWithRatings.filter((p) => {
      if (filters.selectedBrands.length > 0 && !filters.selectedBrands.includes(p.brand)) return false;
      if (p.price_inr < filters.priceRange[0] || p.price_inr > filters.priceRange[1]) return false;
      if (filters.batteryMin > 0 && p.battery_mah < filters.batteryMin) return false;
      if (filters.chargingMin > 0 && p.charging_w < filters.chargingMin) return false;
      if (filters.refreshRateMin > 0 && p.display_refresh_hz < filters.refreshRateMin) return false;
      if (filters.screenTypes.length > 0 && !filters.screenTypes.some(st => p.screen_type.includes(st))) return false;
      if (filters.ramTypes.length > 0 && !filters.ramTypes.includes(p.ram_type)) return false;
      if (filters.storageTypes.length > 0 && !filters.storageTypes.includes(p.storage_type)) return false;
      
      if (filters.storageCapacities && filters.storageCapacities.length > 0) {
        const { storage } = getRamStorage(p.name);
        if (!filters.storageCapacities.includes(storage)) return false;
      }
      
      if (filters.ramCapacities && filters.ramCapacities.length > 0) {
        const { ram } = getRamStorage(p.name);
        if (!filters.ramCapacities.includes(ram)) return false;
      }

      if (filters.minCameraScore > 0 && p.ratings.camera < filters.minCameraScore) return false;
      if (filters.minOsYears > 0 && p.os_updates_years < filters.minOsYears) return false;
      // Search
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        if (!p.name.toLowerCase().includes(q) && !p.brand.toLowerCase().includes(q) && !p.cpu_name.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [phonesWithRatings, filters, searchQuery]);

  const sortedPhones = useWeightedSort(filteredPhones, filters.weights);

  const finalSortedPhones = useMemo(() => {
    const list = [...sortedPhones];
    if (sortBy === "match") return list;
    if (sortBy === "price_asc") return list.sort((a, b) => a.price_inr - b.price_inr);
    if (sortBy === "price_desc") return list.sort((a, b) => b.price_inr - a.price_inr);
    if (sortBy === "performance") return list.sort((a, b) => b.ratings.performance - a.ratings.performance);
    if (sortBy === "camera") return list.sort((a, b) => b.ratings.camera - a.ratings.camera);
    if (sortBy === "os") return list.sort((a, b) => b.ratings.os - a.ratings.os);
    if (sortBy === "battery") return list.sort((a, b) => b.battery_mah - a.battery_mah);
    if (sortBy === "newest") return list.sort((a, b) => b.launch_date.localeCompare(a.launch_date));
    if (sortBy === "ram") return list.sort((a, b) => getRamStorage(b.name).ram - getRamStorage(a.name).ram);
    if (sortBy === "storage") return list.sort((a, b) => getRamStorage(b.name).storage - getRamStorage(a.name).storage);
    return list;
  }, [sortedPhones, sortBy]);

  // Smart recommendation badges
  const badges = useMemo(() => {
    if (filteredPhones.length < 2) return {};
    const map: Record<string, string[]> = {};
    const addBadge = (id: string, badge: string) => { map[id] = [...(map[id] || []), badge]; };
    const best = (key: (p: typeof filteredPhones[0]) => number, badge: string) => {
      if (filteredPhones.length === 0) return;
      const topScore = Math.max(...filteredPhones.map(key));
      filteredPhones.forEach(p => {
        if (key(p) === topScore) addBadge(p.id, badge);
      });
    };
    best(p => p.ratings.performance, "⚡ Best Performance");
    best(p => p.ratings.camera, "📸 Best Camera");
    best(p => p.ratings.vfm, "💎 Best Value");
    best(p => p.battery_mah, "🔋 Best Battery");
    return map;
  }, [filteredPhones]);

  const comparedPhones = useMemo(() => phonesWithRatings.filter((p) => comparedIds.includes(p.id)), [phonesWithRatings, comparedIds]);

  const toggleCompare = useCallback((id: string) => {
    setComparedIds((prev) => {
      const isAdding = !prev.includes(id);
      if (isAdding && prev.length < 4) {
        setHighlightCompare(true);
        setShowComparePopup(true);
        // Reset wiggle highlight after 800ms
        setTimeout(() => {
          setHighlightCompare(false);
        }, 800);
        // Automatically hide popup after 4 seconds
        setTimeout(() => {
          setShowComparePopup(false);
        }, 4000);
      }
      return isAdding ? (prev.length < 4 ? [...prev, id] : prev) : prev.filter((x) => x !== id);
    });
  }, []);

  const handleWizardComplete = useCallback((wizardFilters: FilterConfig, userPhoneSpecs: UserPhoneSpecs | null) => {
    setFilters(wizardFilters);
    if (userPhoneSpecs) {
      setUserPhone(userPhoneSpecs);
      localStorage.setItem("pa_user_phone", JSON.stringify(userPhoneSpecs));
    }
    setShowWizard(false);
    localStorage.setItem("pa_wizard_done", "true");
  }, []);

  const handleWizardSkip = useCallback(() => {
    setShowWizard(false);
    localStorage.setItem("pa_wizard_done", "true");
  }, []);

  // Active filter pills
  const activeFilterPills = useMemo(() => {
    const pills: { label: string; onRemove: () => void }[] = [];
    filters.selectedBrands.forEach(b => pills.push({
      label: b, onRemove: () => setFilters(f => ({ ...f, selectedBrands: f.selectedBrands.filter(x => x !== b) }))
    }));
    if (filters.priceRange[0] > 5000 || filters.priceRange[1] < 200000)
      pills.push({ label: `₹${(filters.priceRange[0]/1000).toFixed(0)}K – ₹${(filters.priceRange[1]/1000).toFixed(0)}K`, onRemove: () => setFilters(f => ({ ...f, priceRange: [5000, 200000] })) });
    if (filters.batteryMin > 0) pills.push({ label: `${filters.batteryMin}+ mAh`, onRemove: () => setFilters(f => ({ ...f, batteryMin: 0 })) });
    if (filters.chargingMin > 0) pills.push({ label: `${filters.chargingMin}W+`, onRemove: () => setFilters(f => ({ ...f, chargingMin: 0 })) });
    if (filters.refreshRateMin > 0) pills.push({ label: `${filters.refreshRateMin}Hz+`, onRemove: () => setFilters(f => ({ ...f, refreshRateMin: 0 })) });
    filters.screenTypes.forEach(st => pills.push({ label: st, onRemove: () => setFilters(f => ({ ...f, screenTypes: f.screenTypes.filter(x => x !== st) })) }));
    filters.ramTypes.forEach(rt => pills.push({ label: rt, onRemove: () => setFilters(f => ({ ...f, ramTypes: f.ramTypes.filter(x => x !== rt) })) }));
    filters.storageTypes.forEach(st => pills.push({ label: st, onRemove: () => setFilters(f => ({ ...f, storageTypes: f.storageTypes.filter(x => x !== st) })) }));
    (filters.storageCapacities || []).forEach(sc => pills.push({ 
      label: sc >= 1024 ? `${sc/1024}TB Storage` : `${sc}GB Storage`, 
      onRemove: () => setFilters(f => ({ ...f, storageCapacities: f.storageCapacities.filter(x => x !== sc) })) 
    }));
    (filters.ramCapacities || []).forEach(rc => pills.push({ 
      label: `${rc}GB RAM`, 
      onRemove: () => setFilters(f => ({ ...f, ramCapacities: f.ramCapacities.filter(x => x !== rc) })) 
    }));
    if (filters.minCameraScore > 0) pills.push({ label: `Camera ${filters.minCameraScore}+`, onRemove: () => setFilters(f => ({ ...f, minCameraScore: 0 })) });
    if (filters.minOsYears > 0) pills.push({ label: `${filters.minOsYears}yr+ updates`, onRemove: () => setFilters(f => ({ ...f, minOsYears: 0 })) });
    return pills;
  }, [filters]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased selection:bg-blue-500/20 selection:text-blue-900">
      {/* Onboarding Wizard */}
      {showWizard && !loading && <OnboardingWizard phones={rawPhones} onComplete={handleWizardComplete} onSkip={handleWizardSkip} />}

      {/* Header */}
      <header className={`sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("discover")}>
            <div className="relative w-10 h-10 flex items-center justify-center flex-shrink-0 scale-95 group-hover:scale-100 transition-transform duration-300">
              {/* Overlapping back device shadow layer */}
              <div className="absolute w-5 h-7 rounded-[4px] bg-gradient-to-br from-indigo-500/20 to-purple-600/20 blur-[2px] -rotate-12 translate-x-[-3px] translate-y-[-1px]" />
              {/* Back Device Glass Layer */}
              <div className="absolute w-5.5 h-7.5 rounded-[5px] bg-gradient-to-br from-indigo-600 to-purple-600 -rotate-12 translate-x-[-3px] translate-y-[-1px] transition-transform duration-300 group-hover:rotate-[-6deg] group-hover:translate-x-[-4px] shadow-sm" />
              {/* Front Device Glass Layer */}
              <div className="absolute w-5.5 h-7.5 rounded-[5px] bg-gradient-to-tr from-blue-500 to-cyan-400 rotate-12 translate-x-[3px] translate-y-[1px] border border-white/20 shadow-md backdrop-blur-[2px] flex items-center justify-center transition-transform duration-300 group-hover:rotate-[6deg] group-hover:translate-x-[4px]">
                {/* Micro-lens details representing camera module */}
                <div className="w-1.5 h-1.5 rounded-full bg-white/90 shadow-[0_0_4px_#fff] animate-pulse" />
              </div>
            </div>
            <div className="leading-none flex flex-col justify-center">
              <h1 className="text-sm font-black tracking-tight text-neutral-900 dark:text-white flex items-center gap-1.5">
                <span className="font-black tracking-tighter text-neutral-800 dark:text-neutral-100">PHONE</span>
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-indigo-400 dark:to-purple-400 bg-clip-text text-transparent font-black tracking-[0.1em] text-[13px]">ARENA</span>
                <span className="text-[7.5px] bg-blue-600 text-white dark:bg-blue-500 px-1 py-0.5 rounded font-black tracking-wider uppercase">IN</span>
              </h1>
              <p className="text-[7px] font-black uppercase tracking-[0.25em] text-neutral-400 dark:text-neutral-500 mt-1">Smart Comparison Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden md:flex items-center bg-neutral-50 dark:bg-neutral-850 border border-neutral-200/70 dark:border-neutral-800 rounded-xl px-3 py-1.5 gap-2 w-48 lg:w-64 focus-within:w-56 lg:focus-within:w-72 focus-within:ring-4 focus-within:ring-blue-500/5 focus-within:border-blue-500/50 focus-within:bg-white dark:focus-within:bg-neutral-900 transition-all duration-300 shadow-sm">
              <Search size={13} className="text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
              <input
                type="text" placeholder="Search smartphones..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-xs text-neutral-800 dark:text-neutral-250 outline-none w-full placeholder:text-neutral-400 font-semibold"
              />
              {searchQuery ? (
                <button onClick={() => setSearchQuery("")} className="text-neutral-400 hover:text-neutral-600"><X size={12} /></button>
              ) : (
                <span className="text-[8px] font-black text-neutral-400 dark:text-neutral-500 border border-neutral-200 dark:border-neutral-700/60 rounded px-1.5 py-0.5 select-none tracking-widest bg-neutral-100/50 dark:bg-neutral-800/40">⌘K</span>
              )}
            </div>

            {/* View Tabs */}
            <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-neutral-100 dark:bg-neutral-800 p-1 shadow-sm border border-neutral-200/40 dark:border-neutral-750/30">
              <button 
                onClick={() => { setView("discover"); setSelectedPhoneId(null); }} 
                className={`px-7 py-3 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all duration-200 ${
                  view === "discover" 
                    ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-md shadow-neutral-200/40 dark:shadow-none scale-[1.01]" 
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:scale-[1.01]"
                }`}
              >
                <span className="flex items-center gap-2.5"><Search size={15} /> Browse</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => { setView("compare"); setSelectedPhoneId(null); }} 
                  className={`relative px-7 py-3 rounded-xl text-[13px] font-black uppercase tracking-wider transition-all duration-200 ${
                    view === "compare" 
                      ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-md shadow-neutral-200/40 dark:shadow-none scale-[1.01]" 
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:scale-[1.01]"
                  } ${highlightCompare ? "animate-wiggle bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 shadow-lg" : ""}`}
                >
                  <span className="flex items-center gap-2.5"><Layers size={15} /> Compare</span>
                  {comparedIds.length > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-blue-600 text-[10px] font-black text-white flex items-center justify-center border-2 border-white dark:border-neutral-850 shadow-md">
                      {comparedIds.length}
                    </span>
                  )}
                </button>

                {showComparePopup && (
                  <div className="absolute top-full mt-3 right-0 w-64 bg-blue-600 text-white rounded-xl p-3.5 shadow-2xl z-[999] border border-blue-500 animate-fade-in-up">
                    <div className="absolute bottom-full right-8 w-3 h-3 bg-blue-600 rotate-45 transform translate-y-1.5" />
                    <div className="flex items-start justify-between gap-2.5">
                      <p className="text-[11px] font-bold leading-relaxed">
                        ✨ Device added! Click here to open the Comparison Matrix and view the head-to-head battle.
                      </p>
                      <button 
                        onClick={() => setShowComparePopup(false)} 
                        className="text-blue-200 hover:text-white flex-shrink-0"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Spec Guide Trigger (Desktop) */}
            <button 
              onClick={() => setShowSpecGuide(true)}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 hover:from-blue-100 dark:hover:from-blue-900/30 hover:to-indigo-100 dark:hover:to-indigo-900/30 transition-all duration-200 text-xs font-extrabold uppercase tracking-wider shadow-sm"
            >
              <BookOpen size={13} className="text-blue-600 dark:text-blue-400" />
              <span>Specs Guide</span>
            </button>
            {/* Mobile tabs */}
            <div className="flex sm:hidden items-center gap-1.5 relative">
              <button 
                onClick={() => { setShowSpecGuide(true); setShowTooltip(false); localStorage.setItem("pa_spec_tooltip_v3", "true"); }} 
                className="p-2 rounded text-neutral-500 hover:bg-neutral-100 transition-colors" 
                title="Spec Guide"
              >
                <BookOpen size={18} />
              </button>
              {showTooltip && !showWizard && (
                <div className="absolute top-full mt-2.5 left-0 w-52 bg-neutral-900 text-white rounded-xl p-2.5 shadow-xl z-50 border border-neutral-800 animate-float-subtle">
                  <div className="absolute bottom-full left-3 w-2.5 h-2.5 bg-neutral-900 rotate-45 border-l border-t border-neutral-800 transform translate-y-1.5" />
                  <div className="flex items-start justify-between gap-1.5">
                    <p className="text-[10px] font-semibold leading-relaxed">
                      New to tech? Prefer reading this first! 📖
                    </p>
                    <button 
                      onClick={() => { setShowTooltip(false); localStorage.setItem("pa_spec_tooltip_v3", "true"); }} 
                      className="text-neutral-400 hover:text-white flex-shrink-0"
                    >
                      <X size={10} />
                    </button>
                  </div>
                </div>
              )}
              <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl border border-neutral-200/40 dark:border-neutral-750/30 gap-1">
                <button 
                  onClick={() => { setView("discover"); setSelectedPhoneId(null); }} 
                  className={`px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                    view === "discover" 
                      ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-md font-black" 
                      : "text-neutral-500 dark:text-neutral-400 font-bold hover:text-neutral-800 dark:hover:text-neutral-200"
                  }`}
                >
                  Browse
                </button>
                <div className="relative">
                  <button 
                    onClick={() => { setView("compare"); setSelectedPhoneId(null); }} 
                    className={`relative px-5 py-2.5 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 ${
                      view === "compare" 
                        ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-md font-black" 
                        : "text-neutral-500 dark:text-neutral-400 font-bold hover:text-neutral-800 dark:hover:text-neutral-200"
                    } ${highlightCompare ? "animate-wiggle bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" : ""}`}
                  >
                    Compare
                    {comparedIds.length > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-blue-600 text-[9px] font-black text-white flex items-center justify-center border-2 border-white dark:border-neutral-850 shadow-md">
                        {comparedIds.length}
                      </span>
                    )}
                  </button>

                  {showComparePopup && (
                    <div className="absolute top-full mt-3 right-0 w-48 bg-blue-600 text-white rounded-xl p-2.5 shadow-2xl z-[999] border border-blue-500 animate-fade-in-up">
                      <div className="absolute bottom-full right-3.5 w-2.5 h-2.5 bg-blue-600 rotate-45 transform translate-y-1.5" />
                      <div className="flex items-start justify-between gap-1.5">
                        <p className="text-[10px] font-bold leading-normal">
                          Added! Tap here to compare.
                        </p>
                        <button 
                          onClick={() => setShowComparePopup(false)} 
                          className="text-blue-200 hover:text-white flex-shrink-0"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <button onClick={() => setMobileFilterOpen(!mobileFilterOpen)} className="lg:hidden p-2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
              <SlidersHorizontal size={20} />
            </button>
            {/* Re-open wizard */}
            <div className="relative">
              <button 
                onClick={() => { setShowWizard(true); setShowWizardTooltip(false); localStorage.setItem("pa_wizard_tooltip_v3", "true"); }} 
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-50 to-violet-50 border border-blue-200/50 text-xs font-semibold text-blue-700 hover:from-blue-100 hover:to-violet-100 transition-colors" 
                title="Re-run phone finder wizard"
              >
                <Sparkles size={14} /> Find My Phone
              </button>
              {showWizardTooltip && !showTooltip && !showWizard && (
                <div className="absolute top-full mt-2.5 right-0 w-60 bg-gradient-to-br from-blue-600 to-indigo-650 text-white rounded-xl p-3 shadow-xl z-50 border border-blue-700 animate-float-subtle">
                  <div className="absolute bottom-full right-6 w-3 h-3 bg-blue-600 rotate-45 border-l border-t border-blue-700 transform translate-y-1.5" />
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold leading-relaxed">
                      Need to find a phone fast? Use our smart finder wizard! ⚡
                    </p>
                    <button 
                      onClick={() => { setShowWizardTooltip(false); localStorage.setItem("pa_wizard_tooltip_v3", "true"); }} 
                      className="text-blue-200 hover:text-white flex-shrink-0 mt-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Theme & Style Controls Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setShowThemeDropdown(!showThemeDropdown)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-100 dark:bg-neutral-800 hover:bg-neutral-200 dark:hover:bg-neutral-700 text-xs font-semibold text-neutral-600 dark:text-neutral-300 transition-all border border-neutral-200 dark:border-neutral-700"
                title="Theme Settings"
              >
                <Palette size={14} className="text-neutral-500 dark:text-neutral-400" />
                <span>Theme</span>
              </button>

              {showThemeDropdown && (
                <>
                  {/* Click outside overlay */}
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemeDropdown(false)} />
                  
                  {/* Dropdown panel */}
                  <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-4 shadow-xl z-50 animate-fade-in text-neutral-900 dark:text-white">
                    {/* Section 1: Base Theme */}
                    <div className="space-y-2 mb-3">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Appearance</span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button 
                          onClick={() => { setTheme("light"); setShowThemeDropdown(false); }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                            theme === "light" 
                              ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50" 
                              : "bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700/55"
                          }`}
                        >
                          <Sun size={12} /> Light
                        </button>
                        <button 
                          onClick={() => { setTheme("dark"); setShowThemeDropdown(false); }}
                          className={`py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all border ${
                            theme === "dark" 
                              ? "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-900/50" 
                              : "bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400 border-transparent hover:bg-neutral-100 dark:hover:bg-neutral-700/55"
                          }`}
                        >
                          <Moon size={12} /> Dark <span className="text-[7px] px-1 py-0.2 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold uppercase scale-90">Beta</span>
                        </button>
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="h-[1px] bg-neutral-100 dark:bg-neutral-800 my-2.5" />

                    {/* Section 2: Accent Preset */}
                    <div className="space-y-2">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Style Mode</span>
                      <div className="flex flex-col gap-1">
                        <button 
                          onClick={() => { setStyleMode("colorful"); setShowThemeDropdown(false); }}
                          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all border ${
                            styleMode === "colorful"
                              ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-850 dark:text-white border-neutral-200 dark:border-neutral-700/80"
                              : "bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                          }`}
                        >
                          <span className="flex items-center gap-2">🌈 Colorful Accents</span>
                          {styleMode === "colorful" && <span className="w-1.5 h-1.5 rounded-full bg-blue-650 dark:bg-blue-400" />}
                        </button>
                        <button 
                          onClick={() => { setStyleMode("stealth"); setShowThemeDropdown(false); }}
                          className={`py-2 px-2.5 rounded-lg text-xs font-bold flex items-center justify-between transition-all border ${
                            styleMode === "stealth"
                              ? "bg-neutral-100 text-neutral-900 dark:bg-neutral-850 dark:text-white border-neutral-200 dark:border-neutral-700/80"
                              : "bg-transparent text-neutral-600 dark:text-neutral-400 border-transparent hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                          }`}
                        >
                          <span className="flex items-center gap-2">🥷 Stealth Mode <span className="text-[7px] px-1 py-0.2 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-extrabold uppercase scale-90">Beta</span></span>
                          {styleMode === "stealth" && <span className="w-1.5 h-1.5 rounded-full bg-neutral-950 dark:bg-neutral-100" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <div className="flex items-center bg-neutral-100 dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-750 px-3 py-2 gap-2 text-neutral-900 dark:text-white">
            <Search size={14} className="text-neutral-400 dark:text-neutral-500" />
            <input 
              type="text" 
              placeholder="Search phones..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
              className="bg-transparent text-sm text-neutral-750 dark:text-neutral-200 outline-none w-full placeholder:text-neutral-450 dark:placeholder:text-neutral-500" 
            />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"><X size={14} /></button>}
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      {showDisclaimer && (
        <div className="bg-yellow-50 dark:bg-yellow-950/20 border-b border-yellow-200 dark:border-yellow-900/35 px-4 py-2 text-center text-xs font-medium text-yellow-800 dark:text-yellow-400 relative z-40">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold uppercase tracking-wider text-[10px] bg-yellow-200 dark:bg-yellow-900/40 px-1.5 py-0.5 rounded text-yellow-900 dark:text-yellow-350">Disclaimer</span>
            <span>There might be a few inaccuracies in the specs. Please cross-check before making any final decisions.</span>
            <button 
              onClick={() => setShowDisclaimer(false)}
              className="ml-2 text-yellow-600 dark:text-yellow-500 hover:text-yellow-900 dark:hover:text-yellow-300 transition-colors flex-shrink-0"
              title="Dismiss"
            >
              <X size={14} />
            </button>
          </div>
          <p className="text-[10px] text-yellow-700/70 dark:text-yellow-500/60 mt-0.5 font-semibold">
            Predicted launch dates may vary by 0–1 quarter from actual release dates.
          </p>
        </div>
      )}

      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="rounded bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-red-700 font-medium">{fetchError}</span>
            <button onClick={() => setFetchError(null)} className="text-red-500 hover:text-red-700"><X size={18} /></button>
          </div>
        </div>
      )}

      {selectedPhoneId ? (
        <PhoneDetail 
          phone={phonesWithRatings.find(p => p.id === selectedPhoneId)!} 
          onClose={() => setSelectedPhoneId(null)} 
          allPhones={phonesWithRatings}
          onSelectPhone={setSelectedPhoneId}
          weights={filters.weights}
          onCompareAll={(ids) => {
            setComparedIds(ids);
            setView("compare");
            setSelectedPhoneId(null);
          }}
          userPhone={userPhone}
        />
      ) : (
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {view === "compare" && (
          <div>
            {comparedPhones.length === 0 ? (
              <div className="text-center py-20 bg-white border border-neutral-200 rounded p-10">
                <Layers size={40} className="mx-auto text-neutral-300 mb-4" />
                <h3 className="text-lg font-bold text-neutral-800 mb-2">No Devices Selected</h3>
                <p className="text-neutral-500 mb-6">Go back to the database and select devices to compare side-by-side.</p>
                <button onClick={() => setView("discover")} className="px-6 py-2.5 rounded bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors">Browse Database</button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-end gap-2 mb-4">
                  <button
                    onClick={() => {
                      const text = comparedPhones.map(p => 
                        `${p.name} — Perf: ${p.ratings.performance.toFixed(1)} | Cam: ${p.ratings.camera.toFixed(1)} | VFM: ${p.ratings.vfm.toFixed(1)} | ₹${(p.price_inr/1000).toFixed(0)}K`
                      ).join("\n");
                      const shareText = `Phone Comparison via PhoneArena India:\n\n${text}\n\nCompare more at ${window.location.origin}`;
                      
                      if (navigator.share) {
                        navigator.share({ title: "Phone Comparison", text: shareText }).catch(() => {});
                      } else {
                        navigator.clipboard.writeText(shareText).then(() => {
                          alert("Comparison copied to clipboard!");
                        });
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                  >
                    <ExternalLink size={13} /> Share Comparison
                  </button>
                </div>
                <ComparisonMatrix phones={comparedPhones} onRemove={toggleCompare} weights={filters.weights} />
              </>
            )}
          </div>
        )}

        {view === "discover" && (
          <div className="flex gap-8">
            {/* Sidebar — Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800/80 rounded-2xl p-5 shadow-sm max-h-[calc(100vh-7rem)] overflow-y-auto hide-scrollbar">
                <FilterSidebar
                  brands={brands} filters={filters} onFilterChange={setFilters}
                  availableScreenTypes={availableScreenTypes} availableRamTypes={availableRamTypes}
                  availableStorageTypes={availableStorageTypes} 
                  availableStorageCapacities={availableStorageCapacities} availableRamCapacities={availableRamCapacities}
                  availableProcessorTiers={availableProcessorTiers}
                  phoneCount={finalSortedPhones.length}
                  userPhone={userPhone} setUserPhone={setUserPhone} phones={rawPhones}
                />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-neutral-950/60 backdrop-blur-[4px]" onClick={() => setMobileFilterOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white dark:bg-neutral-900 rounded-t-3xl p-6 overflow-y-auto border-t border-neutral-200/30 dark:border-neutral-800 shadow-2xl flex flex-col transition-all duration-300">
                  <div className="flex items-center justify-between mb-4 flex-shrink-0 relative">
                    <div className="w-12 h-1 bg-neutral-250 dark:bg-neutral-700 rounded-full mx-auto" />
                    <button 
                      onClick={() => setMobileFilterOpen(false)}
                      className="absolute -top-1 right-0 p-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-500 hover:text-neutral-700 dark:text-neutral-450 dark:hover:text-neutral-200 transition-colors"
                      title="Close Filters"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex-1 mt-2">
                    <FilterSidebar
                      brands={brands} filters={filters} onFilterChange={setFilters}
                      availableScreenTypes={availableScreenTypes} availableRamTypes={availableRamTypes}
                      availableStorageTypes={availableStorageTypes} 
                      availableStorageCapacities={availableStorageCapacities} availableRamCapacities={availableRamCapacities}
                      availableProcessorTiers={availableProcessorTiers}
                      phoneCount={finalSortedPhones.length}
                      userPhone={userPhone} setUserPhone={setUserPhone} phones={rawPhones}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Phone Grid */}
            <div className="flex-1 min-w-0">
              {/* Persona presets row */}
              <div className="mb-6 bg-gradient-to-r from-neutral-50 to-neutral-100/50 dark:from-neutral-900 dark:to-neutral-950 p-4 rounded-2xl border border-neutral-250/60 dark:border-neutral-800 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={16} className="text-blue-500 animate-pulse" />
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">Quick Match Personas</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {PERSONAS.map(p => {
                    const isActive = activePersona === p.name;
                    return (
                      <button
                        key={p.name}
                        onClick={() => {
                          const nextFilters = {
                            ...filters,
                            weights: {
                              ...filters.weights,
                              ...p.weights,
                              performanceEnabled: true,
                              reliabilityEnabled: true,
                              cameraEnabled: true,
                              osEnabled: true
                            }
                          };

                          if (p.name === "Ultimate Gamer") {
                            nextFilters.ramTypes = ["LPDDR5X", "LPDDR5"];
                            nextFilters.storageTypes = ["UFS 4.0", "UFS 3.1"];
                            nextFilters.refreshRateMin = 120;
                            nextFilters.chargingMin = 60;
                            nextFilters.batteryMin = 0;
                            nextFilters.minCameraScore = 0;
                            nextFilters.minOsYears = 0;
                            nextFilters.priceRange = [5000, 200000];
                          } else if (p.name === "Content Creator") {
                            nextFilters.ramTypes = [];
                            nextFilters.storageTypes = [];
                            nextFilters.refreshRateMin = 0;
                            nextFilters.chargingMin = 0;
                            nextFilters.batteryMin = 0;
                            nextFilters.minCameraScore = 8;
                            nextFilters.minOsYears = 0;
                            nextFilters.priceRange = [30000, 200000];
                          } else if (p.name === "Road Warrior") {
                            nextFilters.ramTypes = [];
                            nextFilters.storageTypes = [];
                            nextFilters.refreshRateMin = 0;
                            nextFilters.chargingMin = 44;
                            nextFilters.batteryMin = 5000;
                            nextFilters.minCameraScore = 0;
                            nextFilters.minOsYears = 0;
                            nextFilters.priceRange = [5000, 200000];
                          } else if (p.name === "Smart Buyer") {
                            nextFilters.ramTypes = [];
                            nextFilters.storageTypes = [];
                            nextFilters.refreshRateMin = 90;
                            nextFilters.chargingMin = 0;
                            nextFilters.batteryMin = 0;
                            nextFilters.minCameraScore = 0;
                            nextFilters.minOsYears = 4;
                            nextFilters.priceRange = [5000, 45000];
                          } else if (p.name === "Balanced") {
                            nextFilters.ramTypes = [];
                            nextFilters.storageTypes = [];
                            nextFilters.refreshRateMin = 0;
                            nextFilters.chargingMin = 0;
                            nextFilters.batteryMin = 0;
                            nextFilters.minCameraScore = 0;
                            nextFilters.minOsYears = 0;
                            nextFilters.priceRange = [5000, 200000];
                            nextFilters.ramCapacities = [];
                            nextFilters.storageCapacities = [];
                            nextFilters.selectedBrands = [];
                          }

                          setFilters(nextFilters);
                        }}
                        className={`flex flex-col items-start text-left p-3 rounded-xl border transition-all duration-300 relative overflow-hidden ${
                          isActive 
                            ? "bg-white dark:bg-neutral-850 border-blue-500 ring-2 ring-blue-500/20 shadow-md translate-y-[-2px]" 
                            : "bg-white/60 dark:bg-neutral-900/60 border-neutral-200/80 dark:border-neutral-800/80 hover:bg-white dark:hover:bg-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-700"
                        }`}
                      >
                        {isActive && (
                          <div className="absolute top-0 right-0 w-6 h-6 bg-blue-500 text-white flex items-center justify-center rounded-bl-lg">
                            <Trophy size={10} />
                          </div>
                        )}
                        <div className={`p-2 rounded-xl mb-1.5 transition-colors ${
                          isActive 
                            ? "bg-neutral-100 dark:bg-neutral-800 text-blue-500" 
                            : "bg-neutral-50 dark:bg-neutral-900 text-neutral-400"
                        }`}>
                          {p.icon}
                        </div>
                        <span className="text-[11px] font-black text-neutral-800 dark:text-neutral-200">{p.name}</span>
                        <span className="text-[9px] text-neutral-450 dark:text-neutral-500 mt-0.5 line-clamp-1 leading-normal">{p.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active filter pills */}
              {activeFilterPills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {activeFilterPills.map((pill, i) => (
                    <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 text-[11px] font-semibold text-blue-800">
                      {pill.label}
                      <button onClick={pill.onRemove} className="text-blue-400 hover:text-blue-700 ml-0.5"><X size={12} /></button>
                    </span>
                  ))}
                  <button onClick={() => setFilters({ ...DEFAULT_FILTERS })} className="px-2.5 py-1 rounded-full text-[11px] font-semibold text-red-500 hover:bg-red-50 transition-colors">Clear all</button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 pb-4 border-b border-neutral-200 gap-4">
                <div className="flex items-center gap-4 flex-wrap">
                  <p className="font-semibold text-neutral-700 text-sm sm:text-base">{loading ? "Loading..." : `${finalSortedPhones.length} matches`}</p>
                  
                  {/* Quick Sort Tabs */}
                  <div className="hidden md:flex items-center bg-neutral-100 p-1 rounded-lg border border-neutral-200/60">
                    {[
                      { id: "performance", label: "Processor", icon: <Zap size={12} /> },
                      { id: "camera", label: "Camera", icon: <Camera size={12} /> },
                      { id: "os", label: "OS", icon: <Smartphone size={12} /> },
                      { id: "price_asc", label: "Price (Low)", icon: <span className="text-[10px] font-extrabold">₹</span> },
                    ].map(tab => (
                      <button
                        key={tab.id}
                        onClick={() => setSortBy(tab.id as SortOption)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-md transition-all ${sortBy === tab.id ? "bg-white text-blue-700 shadow-sm ring-1 ring-neutral-200" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"}`}
                      >
                        {tab.icon} {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <span className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest font-semibold hidden sm:inline">Other sorts:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="text-[10px] sm:text-xs font-bold p-1.5 rounded border border-neutral-200 bg-white text-neutral-700 outline-none cursor-pointer">
                    <option value="match">Match Score</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="battery">Largest Battery</option>
                    <option value="newest">Newest First</option>
                    <option value="ram">Highest RAM</option>
                    <option value="storage">Highest Storage</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                  <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    {finalSortedPhones.slice(0, visibleCount).map((phone) => (
                      <PhoneCard key={phone.id} phone={phone} isCompared={comparedIds.includes(phone.id)} onToggle={toggleCompare} weights={filters.weights} onSelect={() => setSelectedPhoneId(phone.id)} badges={badges[phone.id]} userPhone={userPhone} />
                    ))}
                  </div>
                  {finalSortedPhones.length > visibleCount && (
                    <div className="flex justify-center mt-8 mb-4">
                      <button 
                        onClick={() => setVisibleCount(prev => prev + 15)} 
                        className="px-6 py-3 rounded-xl bg-blue-600 dark:bg-blue-700 text-white font-extrabold text-xs sm:text-sm uppercase tracking-wider hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-md active:scale-95 border border-transparent hover:border-blue-500/20"
                      >
                        Load More Devices ({finalSortedPhones.length - visibleCount} remaining)
                      </button>
                    </div>
                  )}
                </>
              )}

              {!loading && finalSortedPhones.length === 0 && (
                <div className="text-center py-20 bg-white border border-neutral-200 rounded mt-4">
                  <Monitor size={48} className="mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-800 mb-1">No matches found</h3>
                  <p className="text-neutral-500 mb-4">Adjust your filters or try a different search.</p>
                  <button onClick={() => { setFilters({ ...DEFAULT_FILTERS }); setSearchQuery(""); }} className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">Reset All Filters</button>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      )}

      {/* Footer & Professional Disclaimer Section */}
      <footer className="mt-auto border-t border-neutral-200 dark:border-neutral-800 bg-neutral-900 text-neutral-400 py-12 px-4 sm:px-6 relative z-30">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 mb-8">
          <div className="md:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative w-8 h-8 flex items-center justify-center flex-shrink-0">
                <div className="absolute w-4 h-6 rounded-[3px] bg-gradient-to-br from-indigo-500 to-purple-600 -rotate-12 translate-x-[-2px] shadow-sm" />
                <div className="absolute w-4 h-6 rounded-[3px] bg-gradient-to-tr from-blue-500 to-cyan-400 rotate-12 translate-x-[2px] border border-white/20 shadow-md backdrop-blur-[2px] flex items-center justify-center">
                  <div className="w-1 h-1 rounded-full bg-white animate-pulse" />
                </div>
              </div>
              <h2 className="text-sm font-black tracking-tight text-white flex items-center gap-1">
                <span className="font-extrabold tracking-tighter">PHONE</span>
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent font-black tracking-[0.1em] text-[11px]">ARENA</span>
                <span className="text-[7px] bg-blue-600 text-white px-1 py-0.5 rounded font-black tracking-wider uppercase">IN</span>
              </h2>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              India's premier independent smartphone discovery & hardware evaluation engine. Empowering buyers with objective ratings, value metrics, and side-by-side spec diagnostics.
            </p>
            <p className="text-[10px] text-neutral-500">
              © {new Date().getFullYear()} PhoneArena India. All rights reserved.
            </p>
          </div>
          
          <div className="md:col-span-8 space-y-4 md:border-l md:border-neutral-800 md:pl-8">
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-neutral-300 block">Legal & Disclaimer Notices</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-neutral-450 leading-relaxed">
              <div className="space-y-2">
                <p className="font-bold text-neutral-350 dark:text-neutral-300">Independent Platform</p>
                <p>
                  <strong>PhoneArena India</strong> is a fully independent product comparison engine. It is not affiliated, associated, authorized, endorsed by, or in any way officially connected with Apple Inc., Samsung Electronics, Google, OnePlus, Xiaomi, Vivo, Oppo, Nothing, or any other smartphone manufacturer or their subsidiaries.
                </p>
              </div>
              <div className="space-y-2">
                <p className="font-bold text-neutral-350 dark:text-neutral-300">Data Accuracy & Estimates</p>
                <p>
                  All hardware ratings, camera benchmarks, launch dates, and price representations are estimated metrics or collected from public domain search sources. Actual retail specifications, pre-installed apps (bloatware), and street pricing may fluctuate. Cross-reference exact details with authorized brand channels before committing to any purchases.
                </p>
              </div>
            </div>
            <div className="pt-4 border-t border-neutral-800/60 text-[9px] text-neutral-500 flex flex-wrap gap-x-6 gap-y-2">
              <span>Not affiliated with PhoneArena.com or any foreign entities.</span>
              <button 
                onClick={() => { setLegalModalTab("terms"); setLegalModalOpen(true); }}
                className="hover:text-blue-400 transition-colors bg-transparent border-0 cursor-pointer p-0 font-medium"
              >
                Terms of Service
              </button>
              <button 
                onClick={() => { setLegalModalTab("privacy"); setLegalModalOpen(true); }}
                className="hover:text-blue-400 transition-colors bg-transparent border-0 cursor-pointer p-0 font-medium"
              >
                Privacy Policy
              </button>
              <button 
                onClick={() => { setLegalModalTab("affiliate"); setLegalModalOpen(true); }}
                className="hover:text-blue-400 transition-colors bg-transparent border-0 cursor-pointer p-0 font-medium"
              >
                Affiliate Disclosure
              </button>
            </div>
          </div>
        </div>
      </footer>

      <SpecGuideModal isOpen={showSpecGuide} onClose={() => setShowSpecGuide(false)} />
      <LegalModal isOpen={legalModalOpen} onClose={() => setLegalModalOpen(false)} initialTab={legalModalTab} />
    </div>
  );
}

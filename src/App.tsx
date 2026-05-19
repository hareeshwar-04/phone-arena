import { useState, useMemo, useCallback, useEffect } from "react";
import { Smartphone, Trophy, X, SlidersHorizontal, Monitor, Layers, Search, Sparkles, BookOpen, Sun, Moon } from "lucide-react";
import type { PhoneSpec, WeightConfig, FilterConfig } from "./types";
import { mockPhones, DEFAULT_FILTERS } from "./types";
import { usePhoneRatings, useWeightedSort, useShareBattle } from "./hooks";
import { PhoneCard, SkeletonCard } from "./PhoneCard";
import { FilterSidebar } from "./FilterSidebar";
import { ComparisonMatrix } from "./ComparisonMatrix";
import { PhoneDetail } from "./PhoneDetail";
import { OnboardingWizard } from "./OnboardingWizard";
import { SpecGuideModal } from "./SpecGuideModal";

const SHEET_URL = "https://opensheet.elk.sh/1yhvi3qx40ijUz2RyQ7Vojfxx3ZGoyWcaUgTisWfOGmM/Sheet1";
type ViewMode = "discover" | "compare";
type SortOption = "match" | "price_asc" | "price_desc" | "performance" | "camera" | "os" | "battery" | "newest";

function parseSheetRow(row: Record<string, string>): PhoneSpec {
  return {
    id: row.id || "", name: row.name || "", brand: row.brand || "",
    price_inr: Number(row.price_inr) || 0, image_url: row.image_url || "",
    launch_date: row.launch_date || "", cpu_name: row.cpu_name || "",
    raw_cpu_score: Number(row.raw_cpu_score) || 0, raw_ui_score: Number(row.raw_ui_score) || 0,
    os_updates_years: Number(row.os_updates_years) || 0, battery_mah: Number(row.battery_mah) || 0,
    charging_w: Number(row.charging_w) || 0, main_camera_score: Number(row.main_camera_score) || 0,
    front_camera_score: Number(row.front_camera_score) || 0,
    display_refresh_hz: Number(row.display_refresh_hz) || 0,
    build_quality_score: Number(row.build_quality_score) || 0,
    antutu_score: Number(row.antutu_score) || 0,
    storage_type: row.storage_type || "UFS 2.2",
    ram_type: row.ram_type || "LPDDR4X",
    screen_type: row.screen_type || "IPS LCD",
    charging_mins: Number(row.charging_mins) || 60,
  };
}

export default function App() {
  const [rawPhones, setRawPhones] = useState<PhoneSpec[]>(mockPhones);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("discover");
  const [selectedPhoneId, setSelectedPhoneId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>("match");
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showWizard, setShowWizard] = useState(() => !localStorage.getItem("pa_wizard_done"));
  const [showSpecGuide, setShowSpecGuide] = useState(false);
  const [showTooltip, setShowTooltip] = useState(() => !localStorage.getItem("pa_spec_tooltip_v3"));
  const [showWizardTooltip, setShowWizardTooltip] = useState(() => !localStorage.getItem("pa_wizard_tooltip_v3"));
  const [theme, setTheme] = useState<"light" | "dark">(() => (localStorage.getItem("pa_theme") as "light" | "dark") || "light");
  const [styleMode, setStyleMode] = useState<"colorful" | "stealth">(() => (localStorage.getItem("pa_style_mode") as "colorful" | "stealth") || "colorful");
  const [showHeader, setShowHeader] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

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

  // Persist filters
  useEffect(() => { localStorage.setItem("pa_filters_v2", JSON.stringify(filters)); }, [filters]);

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
      if (filters.minCameraScore > 0 && p.main_camera_score < filters.minCameraScore) return false;
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
    return list;
  }, [sortedPhones, sortBy]);

  // Smart recommendation badges
  const badges = useMemo(() => {
    if (filteredPhones.length < 2) return {};
    const map: Record<string, string[]> = {};
    const addBadge = (id: string, badge: string) => { map[id] = [...(map[id] || []), badge]; };
    const best = (key: (p: typeof filteredPhones[0]) => number, badge: string) => {
      const sorted = [...filteredPhones].sort((a, b) => key(b) - key(a));
      if (sorted[0]) addBadge(sorted[0].id, badge);
    };
    best(p => p.ratings.performance, "⚡ Best Performance");
    best(p => p.ratings.camera, "📸 Best Camera");
    best(p => p.ratings.vfm, "💎 Best Value");
    best(p => p.battery_mah, "🔋 Best Battery");
    return map;
  }, [filteredPhones]);

  const comparedPhones = useMemo(() => phonesWithRatings.filter((p) => comparedIds.includes(p.id)), [phonesWithRatings, comparedIds]);

  const toggleCompare = useCallback((id: string) => {
    setComparedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  }, []);

  const handleWizardComplete = useCallback((wizardFilters: FilterConfig) => {
    setFilters(wizardFilters);
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
    if (filters.minCameraScore > 0) pills.push({ label: `Camera ${filters.minCameraScore}+`, onRemove: () => setFilters(f => ({ ...f, minCameraScore: 0 })) });
    if (filters.minOsYears > 0) pills.push({ label: `${filters.minOsYears}yr+ updates`, onRemove: () => setFilters(f => ({ ...f, minOsYears: 0 })) });
    return pills;
  }, [filters]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased selection:bg-blue-500/20 selection:text-blue-900">
      {/* Onboarding Wizard */}
      {showWizard && !loading && <OnboardingWizard onComplete={handleWizardComplete} onSkip={handleWizardSkip} />}

      {/* Header */}
      <header className={`sticky top-0 z-50 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md border-b border-neutral-200 dark:border-neutral-800 transition-transform duration-300 ${
        showHeader ? "translate-y-0" : "-translate-y-full"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setView("discover")}>
            <div className="w-10 h-10 rounded-xl animate-spin-gradient flex items-center justify-center shadow-md relative overflow-hidden group-hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
              <Smartphone size={20} className="text-white relative z-10 animate-bounce-subtle" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tight text-neutral-900 flex items-center gap-1">
                <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">PhoneArena</span>
                <span className="text-[9px] bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-1.5 py-0.5 rounded font-black uppercase">India</span>
              </h1>
              <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400">Smart Comparison Engine</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="hidden sm:flex items-center bg-neutral-100 rounded-lg border border-neutral-200 px-3 py-1.5 gap-2 w-48 lg:w-64">
              <Search size={14} className="text-neutral-400 flex-shrink-0" />
              <input
                type="text" placeholder="Search phones..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-neutral-700 outline-none w-full placeholder:text-neutral-400"
              />
              {searchQuery && <button onClick={() => setSearchQuery("")} className="text-neutral-400 hover:text-neutral-600"><X size={14} /></button>}
            </div>
            {/* View Tabs */}
            <div className="hidden sm:flex items-center rounded bg-neutral-100 p-1 border border-neutral-200">
              <button onClick={() => setView("discover")} className={`px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${view === "discover" ? "bg-white text-blue-600 shadow-sm border border-neutral-200/50" : "text-neutral-500 hover:text-neutral-700"}`}>
                <span className="flex items-center gap-2"><Search size={14} /> Browse</span>
              </button>
              <button onClick={() => setView("compare")} className={`relative px-4 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${view === "compare" ? "bg-white text-blue-600 shadow-sm border border-neutral-200/50" : "text-neutral-500 hover:text-neutral-700"}`}>
                <span className="flex items-center gap-2"><Layers size={14} /> Compare</span>
                {comparedIds.length > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center">{comparedIds.length}</span>}
              </button>
            </div>
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
              <button onClick={() => setView("discover")} className={`p-2 rounded transition-colors ${view === "discover" ? "bg-blue-50 text-blue-600" : "text-neutral-500"}`}><Search size={18} /></button>
              <button onClick={() => setView("compare")} className={`relative p-2 rounded transition-colors ${view === "compare" ? "bg-blue-50 text-blue-600" : "text-neutral-500"}`}>
                <Layers size={18} />
                {comparedIds.length > 0 && <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-blue-600 text-[8px] font-bold text-white flex items-center justify-center">{comparedIds.length}</span>}
              </button>
            </div>
            <button onClick={() => setMobileFilterOpen(!mobileFilterOpen)} className="lg:hidden p-2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
              <SlidersHorizontal size={20} />
            </button>
            {/* Spec Guide */}
            <div className="relative">
              <button 
                onClick={() => { setShowSpecGuide(true); setShowTooltip(false); localStorage.setItem("pa_spec_tooltip_v3", "true"); }} 
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-neutral-200 text-xs font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors" 
                title="Learn what smartphone specs mean"
              >
                <BookOpen size={14} className="text-neutral-500" /> Spec Guide
              </button>
              {showTooltip && !showWizard && (
                <div className="absolute top-full mt-2.5 right-0 w-64 bg-neutral-900 text-white rounded-xl p-3 shadow-xl z-50 border border-neutral-800 animate-float-subtle">
                  <div className="absolute bottom-full right-6 w-3 h-3 bg-neutral-900 rotate-45 border-l border-t border-neutral-800 transform translate-y-1.5" />
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[11px] font-semibold leading-relaxed">
                      New to tech? We highly recommend reading this spec guide first! 📖
                    </p>
                    <button 
                      onClick={() => { setShowTooltip(false); localStorage.setItem("pa_spec_tooltip_v3", "true"); }} 
                      className="text-neutral-400 hover:text-white flex-shrink-0 mt-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </div>
              )}
            </div>
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

            {/* Theme & Style Controls */}
            <div className="flex items-center gap-1.5 bg-neutral-100 dark:bg-neutral-800 rounded-xl p-1 border border-neutral-200 dark:border-neutral-700/80">
              {/* Light / Dark Toggle */}
              <button 
                onClick={() => setTheme(theme === "light" ? "dark" : "light")} 
                className="p-1.5 rounded-lg bg-white dark:bg-neutral-900 text-neutral-600 dark:text-neutral-300 hover:text-neutral-950 dark:hover:text-white transition-all shadow-sm flex items-center justify-center border border-neutral-200/40 dark:border-neutral-700/40" 
                title={theme === "light" ? "Switch to Dark Theme" : "Switch to Light Theme"}
              >
                {theme === "light" ? <Moon size={13} /> : <Sun size={13} className="text-amber-500 fill-amber-500" />}
              </button>
              
              <div className="w-[1px] h-4 bg-neutral-200 dark:bg-neutral-700 self-center" />
              
              {/* Style Preset Selector */}
              <button 
                onClick={() => setStyleMode(styleMode === "colorful" ? "stealth" : "colorful")}
                className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all duration-200 flex items-center gap-1 shadow-sm border ${
                  styleMode === "stealth"
                    ? "bg-neutral-900 text-white border-neutral-950 dark:bg-white dark:text-neutral-900 dark:border-neutral-100"
                    : "bg-white text-blue-600 border-neutral-200/50 dark:bg-neutral-900 dark:text-blue-400 dark:border-neutral-700/50"
                }`}
                title={styleMode === "colorful" ? "Switch to Stealth Mode (Classy Black & White)" : "Switch to Colorful Mode"}
              >
                {styleMode === "colorful" ? "🌈 Colorful" : "🥷 Stealth"}
              </button>
            </div>
          </div>
        </div>
        {/* Mobile search */}
        <div className="sm:hidden px-4 pb-3">
          <div className="flex items-center bg-neutral-100 rounded-lg border border-neutral-200 px-3 py-2 gap-2">
            <Search size={14} className="text-neutral-400" />
            <input type="text" placeholder="Search phones..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="bg-transparent text-sm text-neutral-700 outline-none w-full placeholder:text-neutral-400" />
            {searchQuery && <button onClick={() => setSearchQuery("")} className="text-neutral-400 hover:text-neutral-600"><X size={14} /></button>}
          </div>
        </div>
      </header>

      {/* Disclaimer */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2.5 text-center text-xs font-medium text-yellow-800 flex items-center justify-center gap-2 shadow-sm relative z-40">
        <span className="font-bold uppercase tracking-wider text-[10px] bg-yellow-200 px-1.5 py-0.5 rounded text-yellow-900">Disclaimer</span>
        <span>There might be a few inaccuracies in the specs. Please cross-check before making any final decisions.</span>
      </div>

      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="rounded bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-red-700 font-medium">{fetchError}</span>
            <button onClick={() => setFetchError(null)} className="text-red-500 hover:text-red-700"><X size={18} /></button>
          </div>
        </div>
      )}

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
              <ComparisonMatrix phones={comparedPhones} onRemove={toggleCompare} />
            )}
          </div>
        )}

        {view === "discover" && (
          <div className="flex gap-8">
            {/* Sidebar — Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white border border-neutral-200 rounded p-5 shadow-sm max-h-[calc(100vh-7rem)] overflow-y-auto hide-scrollbar">
                <FilterSidebar
                  brands={brands} filters={filters} onFilterChange={setFilters}
                  availableScreenTypes={availableScreenTypes} availableRamTypes={availableRamTypes}
                  availableStorageTypes={availableStorageTypes} availableProcessorTiers={availableProcessorTiers}
                  phoneCount={finalSortedPhones.length}
                />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-xl p-6 overflow-y-auto">
                  <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-6" />
                  <FilterSidebar
                    brands={brands} filters={filters} onFilterChange={setFilters}
                    availableScreenTypes={availableScreenTypes} availableRamTypes={availableRamTypes}
                    availableStorageTypes={availableStorageTypes} availableProcessorTiers={availableProcessorTiers}
                    phoneCount={finalSortedPhones.length}
                  />
                </div>
              </div>
            )}

            {/* Phone Grid */}
            <div className="flex-1 min-w-0">
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

              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
                <p className="font-semibold text-neutral-700 text-sm sm:text-base">{loading ? "Loading database..." : `${finalSortedPhones.length} matches found`}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest font-semibold hidden sm:inline">Sort by:</span>
                  <select value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)} className="text-[10px] sm:text-xs font-bold p-1 sm:p-1.5 rounded border border-neutral-200 bg-white text-neutral-700 outline-none cursor-pointer">
                    <option value="match">Match Score</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="performance">Best Performance</option>
                    <option value="camera">Best Camera</option>
                    <option value="os">Best Operating System</option>
                    <option value="battery">Largest Battery</option>
                    <option value="newest">Newest First</option>
                  </select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {finalSortedPhones.map((phone) => (
                    <PhoneCard key={phone.id} phone={phone} isCompared={comparedIds.includes(phone.id)} onToggle={toggleCompare} weights={filters.weights} onSelect={() => setSelectedPhoneId(phone.id)} badges={badges[phone.id]} />
                  ))}
                </div>
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

      {selectedPhoneId && (
        <PhoneDetail phone={phonesWithRatings.find(p => p.id === selectedPhoneId)!} onClose={() => setSelectedPhoneId(null)} />
      )}

      <SpecGuideModal isOpen={showSpecGuide} onClose={() => setShowSpecGuide(false)} />
    </div>
  );
}

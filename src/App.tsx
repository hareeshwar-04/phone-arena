import { useState, useMemo, useCallback, useEffect } from "react";
import { Smartphone, Trophy, X, SlidersHorizontal, Monitor, Layers, Search } from "lucide-react";
import type { PhoneSpec, WeightConfig } from "./types";
import { mockPhones } from "./types";
import { usePhoneRatings, useWeightedSort, useShareBattle } from "./hooks";
import { PhoneCard, SkeletonCard } from "./PhoneCard";
import { FilterSidebar } from "./FilterSidebar";
import { ComparisonMatrix } from "./ComparisonMatrix";

const SHEET_URL = "https://opensheet.elk.sh/1yhvi3qx40ijUz2RyQ7Vojfxx3ZGoyWcaUgTisWfOGmM/Sheet1";
type ViewMode = "discover" | "compare";
type SortOption = "match" | "price_asc" | "price_desc" | "performance" | "camera" | "battery";

function parseSheetRow(row: Record<string, string>): PhoneSpec {
  return {
    id: row.id || "",
    name: row.name || "",
    brand: row.brand || "",
    price_inr: Number(row.price_inr) || 0,
    image_url: row.image_url || "",
    launch_date: row.launch_date || "",
    cpu_name: row.cpu_name || "",
    raw_cpu_score: Number(row.raw_cpu_score) || 0,
    raw_ui_score: Number(row.raw_ui_score) || 0,
    os_updates_years: Number(row.os_updates_years) || 0,
    battery_mah: Number(row.battery_mah) || 0,
    charging_w: Number(row.charging_w) || 0,
    main_camera_score: Number(row.main_camera_score) || 0,
    front_camera_score: Number(row.front_camera_score) || 0,
    display_refresh_hz: Number(row.display_refresh_hz) || 0,
    build_quality_score: Number(row.build_quality_score) || 0,
    antutu_score: Number(row.antutu_score) || 0,
    storage_type: row.storage_type || "UFS 2.2",
    ram_type: row.ram_type || "LPDDR4X",
    screen_type: row.screen_type || "IPS LCD",
    product_url: row.product_url || "",
  };
}

export default function App() {
  const [rawPhones, setRawPhones] = useState<PhoneSpec[]>(mockPhones);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("discover");
  const [sortBy, setSortBy] = useState<SortOption>("match");
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([10000, 200000]);
  const [weights, setWeights] = useState<WeightConfig>({ gaming: 50, durability: 50, camera: 50 });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

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
  const brands = useMemo(() => [...new Set(rawPhones.map((p) => p.brand))], [rawPhones]);

  useShareBattle(comparedIds, (ids) => { setComparedIds(ids); setView("compare"); }, allIds);

  const filteredPhones = useMemo(() => {
    return phonesWithRatings.filter((p) => {
      if (selectedBrands.length > 0 && !selectedBrands.includes(p.brand)) return false;
      if (p.price_inr > priceRange[1]) return false;
      return true;
    });
  }, [phonesWithRatings, selectedBrands, priceRange]);

  const sortedPhones = useWeightedSort(filteredPhones, weights);
  
  const finalSortedPhones = useMemo(() => {
    const list = [...sortedPhones];
    if (sortBy === "match") return list;
    if (sortBy === "price_asc") return list.sort((a, b) => a.price_inr - b.price_inr);
    if (sortBy === "price_desc") return list.sort((a, b) => b.price_inr - a.price_inr);
    if (sortBy === "performance") return list.sort((a, b) => b.raw_cpu_score - a.raw_cpu_score);
    if (sortBy === "camera") return list.sort((a, b) => b.main_camera_score - a.main_camera_score);
    if (sortBy === "battery") return list.sort((a, b) => b.battery_mah - a.battery_mah);
    return list;
  }, [sortedPhones, sortBy]);

  const comparedPhones = useMemo(() => phonesWithRatings.filter((p) => comparedIds.includes(p.id)), [phonesWithRatings, comparedIds]);

  const toggleCompare = useCallback((id: string) => {
    setComparedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  }, []);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans antialiased selection:bg-blue-500/20 selection:text-blue-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-blue-600 flex items-center justify-center shadow-sm">
              <Smartphone size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-neutral-900">PhoneArena</h1>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-500">Database</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
            <div className="flex sm:hidden items-center gap-2">
              <button onClick={() => setView("discover")} className={`p-2 rounded transition-colors ${view === "discover" ? "bg-blue-50 text-blue-600" : "text-neutral-500"}`}><Search size={20} /></button>
              <button onClick={() => setView("compare")} className={`relative p-2 rounded transition-colors ${view === "compare" ? "bg-blue-50 text-blue-600" : "text-neutral-500"}`}>
                <Layers size={20} />
                {comparedIds.length > 0 && <span className="absolute 0 -right-0 w-4 h-4 rounded-full bg-blue-600 text-[9px] font-bold text-white flex items-center justify-center">{comparedIds.length}</span>}
              </button>
            </div>
            <button onClick={() => setMobileFilterOpen(!mobileFilterOpen)} className="lg:hidden p-2 rounded bg-neutral-100 text-neutral-600 border border-neutral-200">
              <SlidersHorizontal size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Constant Disclaimer */}
      <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2.5 text-center text-xs font-medium text-yellow-800 flex items-center justify-center gap-2 shadow-sm relative z-40">
        <span className="font-bold uppercase tracking-wider text-[10px] bg-yellow-200 px-1.5 py-0.5 rounded text-yellow-900">Disclaimer</span> 
        <span>There might be a few inaccuracies in the specs. Please cross-check before making any final decisions.</span>
      </div>

      {/* Error banner */}
      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="rounded bg-red-50 border border-red-200 px-4 py-3 flex items-center justify-between">
            <span className="text-sm text-red-700 font-medium">{fetchError}</span>
            <button onClick={() => setFetchError(null)} className="text-red-500 hover:text-red-700"><X size={18} /></button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ===== COMPARE MATRIX VIEW ===== */}
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

        {/* ===== DISCOVER HUB VIEW ===== */}
        {view === "discover" && (
          <div className="flex gap-8">
            {/* Sidebar — Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 bg-white border border-neutral-200 rounded p-6 shadow-sm">
                <FilterSidebar brands={brands} selectedBrands={selectedBrands} onToggleBrand={toggleBrand} priceRange={priceRange} onPriceChange={setPriceRange} weights={weights} onWeightChange={setWeights} />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-neutral-900/40 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] bg-white rounded-t-xl p-6 overflow-y-auto">
                  <div className="w-12 h-1.5 bg-neutral-200 rounded-full mx-auto mb-6" />
                  <FilterSidebar brands={brands} selectedBrands={selectedBrands} onToggleBrand={toggleBrand} priceRange={priceRange} onPriceChange={setPriceRange} weights={weights} onWeightChange={setWeights} />
                </div>
              </div>
            )}

            {/* Phone Grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-neutral-200">
                <p className="font-semibold text-neutral-700 text-sm sm:text-base">{loading ? "Loading database..." : `${finalSortedPhones.length} matches found`}</p>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] sm:text-xs text-neutral-500 uppercase tracking-widest font-semibold hidden sm:inline">Sort by:</span>
                  <select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="text-[10px] sm:text-xs font-bold p-1 sm:p-1.5 rounded border border-neutral-200 bg-white text-neutral-700 outline-none cursor-pointer"
                  >
                    <option value="match">Match Score</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="performance">Best Performance</option>
                    <option value="camera">Best Camera</option>
                    <option value="battery">Largest Battery</option>
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
                    <PhoneCard key={phone.id} phone={phone} isCompared={comparedIds.includes(phone.id)} onToggle={toggleCompare} weights={weights} />
                  ))}
                </div>
              )}
              
              {!loading && finalSortedPhones.length === 0 && (
                <div className="text-center py-20 bg-white border border-neutral-200 rounded mt-4">
                  <Monitor size={48} className="mx-auto text-neutral-300 mb-4" />
                  <h3 className="text-lg font-bold text-neutral-800 mb-1">No matches found</h3>
                  <p className="text-neutral-500">Adjust your price filters or brand selections.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
      {/* Tutorial Toast */}
      <TutorialToast />
    </div>
  );
}

function TutorialToast() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShow(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 bg-neutral-900 text-white p-5 rounded-xl shadow-2xl border border-neutral-700 max-w-xs animate-fade-in-up">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-bold text-sm flex items-center gap-2"><Smartphone size={16} className="text-blue-400" /> Quick Guide</h4>
        <button onClick={() => setShow(false)} className="text-neutral-400 hover:text-white"><X size={14} /></button>
      </div>
      <ul className="text-xs text-neutral-300 space-y-2 ml-1 border-l-2 border-blue-500/30 pl-3 font-medium">
        <li>• Tune the weights in the sidebar to match your needs.</li>
        <li>• Click <b className="text-white">+ Compare</b> to view devices side-by-side.</li>
      </ul>
    </div>
  );
}

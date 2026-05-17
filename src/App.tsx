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
  };
}

export default function App() {
  const [rawPhones, setRawPhones] = useState<PhoneSpec[]>(mockPhones);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [view, setView] = useState<ViewMode>("discover");
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([10000, 200000]);
  const [weights, setWeights] = useState<WeightConfig>({ gaming: 34, durability: 33, camera: 33 });
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
  const comparedPhones = useMemo(() => phonesWithRatings.filter((p) => comparedIds.includes(p.id)), [phonesWithRatings, comparedIds]);

  const toggleCompare = useCallback((id: string) => {
    setComparedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 4 ? [...prev, id] : prev);
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setSelectedBrands((prev) => prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-violet-500/30 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-zinc-950/80 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/20 border border-white/10">
              <Smartphone size={18} className="text-white" />
            </div>
            <div>
              <h1 className="text-base font-extrabold tracking-tight text-white">PhoneArena<span className="text-violet-500">.</span></h1>
              <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-zinc-500 mt-0.5">India 2026 Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* View Tabs */}
            <div className="hidden sm:flex items-center rounded-xl bg-zinc-900/80 border border-zinc-800/80 p-1 shadow-inner">
              <button onClick={() => setView("discover")} className={`px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${view === "discover" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
                <span className="flex items-center gap-2"><Search size={13} /> Discover</span>
              </button>
              <button onClick={() => setView("compare")} className={`relative px-4 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-300 ${view === "compare" ? "bg-zinc-800 text-white shadow-sm" : "text-zinc-500 hover:text-zinc-300"}`}>
                <span className="flex items-center gap-2"><Layers size={13} /> Matrix</span>
                {comparedIds.length > 0 && <span className="absolute -top-1 -right-1.5 w-4 h-4 rounded-full bg-fuchsia-500 border-2 border-zinc-900 text-[9px] font-bold text-white flex items-center justify-center shadow-lg">{comparedIds.length}</span>}
              </button>
            </div>
            {/* Mobile tabs */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button onClick={() => setView("discover")} className={`p-2 rounded-xl transition-all ${view === "discover" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}><Search size={18} /></button>
              <button onClick={() => setView("compare")} className={`relative p-2 rounded-xl transition-all ${view === "compare" ? "bg-zinc-800 text-white" : "text-zinc-500"}`}>
                <Layers size={18} />
                {comparedIds.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-fuchsia-500 border-2 border-zinc-900 text-[8px] font-bold text-white flex items-center justify-center">{comparedIds.length}</span>}
              </button>
            </div>
            <button onClick={() => setMobileFilterOpen(!mobileFilterOpen)} className="lg:hidden p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white transition-colors border border-zinc-800">
              <SlidersHorizontal size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-6">
          <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 px-4 py-3 flex items-center justify-between backdrop-blur-md">
            <span className="text-xs text-rose-400 font-semibold">{fetchError}</span>
            <button onClick={() => setFetchError(null)} className="text-rose-500/60 hover:text-rose-400"><X size={16} /></button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {/* ===== COMPARE MATRIX VIEW ===== */}
        {view === "compare" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {comparedPhones.length === 0 ? (
              <div className="text-center py-32">
                <div className="w-20 h-20 bg-zinc-900 border border-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-black/20">
                  <Layers size={32} className="text-zinc-600" />
                </div>
                <h3 className="text-lg font-bold text-zinc-200 mb-2">Matrix is empty</h3>
                <p className="text-sm text-zinc-500 font-medium mb-6">Switch to Discover and add up to 4 devices to compare.</p>
                <button onClick={() => setView("discover")} className="px-6 py-3 rounded-xl bg-white text-zinc-950 text-xs font-bold uppercase tracking-wider hover:bg-zinc-200 transition-colors shadow-lg shadow-white/10">Browse Phones</button>
              </div>
            ) : (
              <ComparisonMatrix phones={comparedPhones} onRemove={toggleCompare} />
            )}
          </div>
        )}

        {/* ===== DISCOVER HUB VIEW ===== */}
        {view === "discover" && (
          <div className="flex gap-8 animate-in fade-in duration-500">
            {/* Sidebar — Desktop */}
            <aside className="hidden lg:block w-64 flex-shrink-0">
              <div className="sticky top-24 rounded-3xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-6 shadow-2xl shadow-black/40">
                <FilterSidebar brands={brands} selectedBrands={selectedBrands} onToggleBrand={toggleBrand} priceRange={priceRange} onPriceChange={setPriceRange} weights={weights} onWeightChange={setWeights} />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setMobileFilterOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 max-h-[85vh] rounded-t-[2rem] bg-zinc-950 border-t border-zinc-800 p-6 overflow-y-auto shadow-2xl">
                  <div className="w-12 h-1.5 bg-zinc-800 rounded-full mx-auto mb-6" />
                  <FilterSidebar brands={brands} selectedBrands={selectedBrands} onToggleBrand={toggleBrand} priceRange={priceRange} onPriceChange={setPriceRange} weights={weights} onWeightChange={setWeights} />
                </div>
              </div>
            )}

            {/* Phone Grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-6 bg-zinc-900/50 backdrop-blur-md border border-zinc-800/50 rounded-xl px-4 py-3">
                <p className="text-xs text-zinc-400 font-bold tracking-wide">{loading ? "Fetching live market data…" : `Showing ${sortedPhones.length} device${sortedPhones.length !== 1 ? "s" : ""}`}</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.8)] animate-pulse" />
                  <p className="text-[10px] text-zinc-500 font-mono uppercase tracking-[0.15em] font-bold">Live AI Rank</p>
                </div>
              </div>
              
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
                  {sortedPhones.map((phone) => (
                    <PhoneCard key={phone.id} phone={phone} isCompared={comparedIds.includes(phone.id)} onToggle={toggleCompare} weights={weights} />
                  ))}
                </div>
              )}
              
              {!loading && sortedPhones.length === 0 && (
                <div className="text-center py-24 bg-zinc-900/20 border border-zinc-800/50 rounded-3xl mt-4">
                  <Monitor size={48} className="mx-auto text-zinc-800 mb-4" />
                  <h3 className="text-lg font-bold text-zinc-300 mb-1">No matches found</h3>
                  <p className="text-sm text-zinc-500 font-medium">Try adjusting your filters or budget cap.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-zinc-900 mt-20 bg-black/20">
        <div className="max-w-7xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[10px] text-zinc-600 font-semibold tracking-widest uppercase">PhoneArena India © 2026</p>
          <div className="flex items-center gap-4 text-[10px] font-mono text-zinc-600 uppercase tracking-widest">
            <span>Live Aggregation</span>
            <span className="w-1 h-1 rounded-full bg-zinc-700" />
            <span>AI Ranked</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

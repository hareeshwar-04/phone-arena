import { useState, useMemo, useCallback, useEffect } from "react";
import { Smartphone, Trophy, X, SlidersHorizontal, Monitor, RefreshCw, Layers, Search } from "lucide-react";
import type { PhoneSpec, WeightConfig } from "./types";
import { mockPhones, formatINR } from "./types";
import { usePhoneRatings, useWeightedSort, useShareBattle } from "./hooks";
import { PhoneCard, SkeletonCard } from "./PhoneCard";
import { FilterSidebar } from "./FilterSidebar";
import { ComparisonMatrix } from "./ComparisonMatrix";

const SHEET_URL = "https://opensheet.elk.sh/YOUR_SPREADSHEET_ID/Sheet1";
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
  const [priceRange, setPriceRange] = useState<[number, number]>([15000, 50000]);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-2xl bg-slate-950/70 border-b border-slate-800/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-emerald-400 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Smartphone size={17} className="text-slate-950" />
            </div>
            <div>
              <h1 className="text-sm font-extrabold tracking-tight text-slate-100">PhoneArena<span className="text-cyan-400">.</span></h1>
              <p className="text-[9px] font-semibold uppercase tracking-[0.25em] text-slate-600">India • 2026 Edition</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* View Tabs */}
            <div className="hidden sm:flex items-center rounded-xl bg-slate-900/50 border border-slate-800/40 p-0.5">
              <button onClick={() => setView("discover")} className={`px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${view === "discover" ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950" : "text-slate-500 hover:text-slate-300"}`}>
                <span className="flex items-center gap-1.5"><Search size={12} /> Discover</span>
              </button>
              <button onClick={() => setView("compare")} className={`relative px-3.5 py-1.5 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all duration-200 ${view === "compare" ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950" : "text-slate-500 hover:text-slate-300"}`}>
                <span className="flex items-center gap-1.5"><Layers size={12} /> Matrix</span>
                {comparedIds.length > 0 && <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-pink-500 text-[9px] font-bold text-white flex items-center justify-center">{comparedIds.length}</span>}
              </button>
            </div>
            {/* Mobile tabs */}
            <div className="flex sm:hidden items-center gap-1.5">
              <button onClick={() => setView("discover")} className={`p-2 rounded-lg transition-all ${view === "discover" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-600"}`}><Search size={16} /></button>
              <button onClick={() => setView("compare")} className={`relative p-2 rounded-lg transition-all ${view === "compare" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-600"}`}>
                <Layers size={16} />
                {comparedIds.length > 0 && <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-pink-500 text-[8px] font-bold text-white flex items-center justify-center">{comparedIds.length}</span>}
              </button>
            </div>
            <button onClick={() => setMobileFilterOpen(!mobileFilterOpen)} className="lg:hidden p-2 rounded-lg bg-slate-800/40 text-slate-500 hover:text-slate-300 transition-colors border border-slate-800/40">
              <SlidersHorizontal size={16} />
            </button>
          </div>
        </div>
      </header>

      {/* Error banner */}
      {fetchError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-4">
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 flex items-center justify-between">
            <span className="text-xs text-amber-400/90 font-medium">{fetchError}</span>
            <button onClick={() => setFetchError(null)} className="text-amber-500/50 hover:text-amber-400"><X size={14} /></button>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* ===== COMPARE MATRIX VIEW ===== */}
        {view === "compare" && (
          <div>
            {comparedPhones.length === 0 ? (
              <div className="text-center py-24">
                <Layers size={48} className="mx-auto text-slate-800 mb-4" />
                <p className="text-sm text-slate-500 font-medium">No devices in the arena yet.</p>
                <p className="text-xs text-slate-600 mt-1">Switch to Discover and add phones to compare.</p>
                <button onClick={() => setView("discover")} className="mt-4 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 text-xs font-bold uppercase tracking-wider">Browse Phones</button>
              </div>
            ) : (
              <ComparisonMatrix phones={comparedPhones} onRemove={toggleCompare} />
            )}
          </div>
        )}

        {/* ===== DISCOVER HUB VIEW ===== */}
        {view === "discover" && (
          <div className="flex gap-6">
            {/* Sidebar — Desktop */}
            <aside className="hidden lg:block w-60 flex-shrink-0">
              <div className="sticky top-20 rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-5 shadow-2xl shadow-cyan-900/5">
                <FilterSidebar brands={brands} selectedBrands={selectedBrands} onToggleBrand={toggleBrand} priceRange={priceRange} onPriceChange={setPriceRange} weights={weights} onWeightChange={setWeights} />
              </div>
            </aside>

            {/* Mobile Filter Drawer */}
            {mobileFilterOpen && (
              <div className="fixed inset-0 z-50 lg:hidden">
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileFilterOpen(false)} />
                <div className="absolute bottom-0 left-0 right-0 max-h-[75vh] rounded-t-3xl bg-slate-900/95 backdrop-blur-2xl border-t border-slate-800/50 p-6 overflow-y-auto shadow-2xl">
                  <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto mb-4" />
                  <FilterSidebar brands={brands} selectedBrands={selectedBrands} onToggleBrand={toggleBrand} priceRange={priceRange} onPriceChange={setPriceRange} weights={weights} onWeightChange={setWeights} />
                </div>
              </div>
            )}

            {/* Phone Grid */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs text-slate-500 font-medium tracking-wide">{loading ? "Loading…" : `${sortedPhones.length} device${sortedPhones.length !== 1 ? "s" : ""}`}</p>
                <p className="text-[10px] text-slate-700 font-mono uppercase tracking-widest">Weighted Rank</p>
              </div>
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {sortedPhones.map((phone) => (
                    <PhoneCard key={phone.id} phone={phone} isCompared={comparedIds.includes(phone.id)} onToggle={toggleCompare} weights={weights} />
                  ))}
                </div>
              )}
              {!loading && sortedPhones.length === 0 && (
                <div className="text-center py-20">
                  <Monitor size={40} className="mx-auto text-slate-800 mb-3" />
                  <p className="text-sm text-slate-500 font-medium">No devices match your filters.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-slate-800/30 mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6 text-center">
          <p className="text-[10px] text-slate-700 tracking-wider">PhoneArena India © 2026 • Benchmark data from public sources • Independent project</p>
        </div>
      </footer>
    </div>
  );
}

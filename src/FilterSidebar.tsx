import {
  SlidersHorizontal, Zap, Shield, Camera, Wrench, ChevronDown,
  Battery, Monitor, Cpu, HardDrive, MemoryStick, RefreshCw, Sparkles, Smartphone
} from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import type { WeightConfig, FilterConfig, PhoneSpec, UserPhoneSpecs } from "./types";
import { formatINR, DEFAULT_FILTERS, predictUserPhoneSpecs } from "./types";

interface FilterSidebarProps {
  brands: string[];
  filters: FilterConfig;
  onFilterChange: (f: FilterConfig) => void;
  /** Available options extracted from the phone database */
  availableScreenTypes: string[];
  availableRamTypes: string[];
  availableStorageTypes: string[];
  availableStorageCapacities: number[];
  availableRamCapacities: number[];
  availableProcessorTiers: string[];
  phoneCount: number;
  userPhone: UserPhoneSpecs | null;
  setUserPhone: (u: UserPhoneSpecs | null) => void;
  phones: PhoneSpec[];
}

function CollapsibleSection({ title, icon, forceOpen = false, defaultOpen = false, children }: {
  title: string; icon: React.ReactNode; forceOpen?: boolean; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  useEffect(() => {
    if (forceOpen) {
      setOpen(true);
    }
  }, [forceOpen]);

  return (
    <div className="pt-4 border-t border-neutral-200 dark:border-neutral-800 first:border-t-0 first:pt-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs font-bold text-neutral-800 dark:text-neutral-300 uppercase tracking-wider mb-3 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
      >
        <span className="flex items-center gap-2">{icon} {title}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
        <div className="overflow-hidden">{children}</div>
      </div>
    </div>
  );
}

function ChipSelect({ options, selected, onToggle, color = "blue" }: {
  options: string[]; selected: string[]; onToggle: (v: string) => void; color?: string;
}) {
  const colorMap: Record<string, { active: string; inactive: string }> = {
    blue: { active: "bg-blue-600 text-white", inactive: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-800/80" },
    violet: { active: "bg-violet-600 text-white", inactive: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-800/80" },
    green: { active: "bg-green-600 text-white", inactive: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-800/80" },
    orange: { active: "bg-orange-500 text-white", inactive: "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-800/80" },
  };
  const c = colorMap[color] || colorMap.blue;
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((opt) => (
        <button
          key={opt}
          onClick={() => onToggle(opt)}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-colors ${selected.includes(opt) ? c.active : c.inactive}`}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

function RangeSlider({ label, min, max, step, value, onChange, formatValue }: {
  label: string; min: number; max: number; step: number; value: number;
  onChange: (v: number) => void; formatValue?: (v: number) => string;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">{label}</span>
        <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">
          {formatValue ? formatValue(value) : value}{value === min ? " (Any)" : ""}
        </span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="w-full accent-blue-600"
      />
    </div>
  );
}

export function FilterSidebar({
  brands, filters, onFilterChange,
  availableScreenTypes, availableRamTypes, availableStorageTypes, availableProcessorTiers,
  availableStorageCapacities, availableRamCapacities,
  phoneCount, userPhone, setUserPhone, phones
}: FilterSidebarProps) {
  const update = useCallback((partial: Partial<FilterConfig>) => {
    onFilterChange({ ...filters, ...partial });
  }, [filters, onFilterChange]);

  const updateWeights = useCallback((partial: Partial<WeightConfig>) => {
    onFilterChange({ ...filters, weights: { ...filters.weights, ...partial } });
  }, [filters, onFilterChange]);

  const toggleBrand = useCallback((b: string) => {
    const next = filters.selectedBrands.includes(b)
      ? filters.selectedBrands.filter((x) => x !== b)
      : [...filters.selectedBrands, b];
    update({ selectedBrands: next });
  }, [filters.selectedBrands, update]);

  const toggleInArray = useCallback((key: keyof FilterConfig, value: string) => {
    const current = (filters[key] as string[]) || [];
    const next = current.includes(value) ? current.filter((x) => x !== value) : [...current, value];
    update({ [key]: next });
  }, [filters, update]);

  const resetAll = useCallback(() => {
    onFilterChange({ ...DEFAULT_FILTERS });
  }, [onFilterChange]);

  const [isEditingPhone, setIsEditingPhone] = useState(false);
  
  const [editBrand, setEditBrand] = useState("Samsung");
  const [editBattery, setEditBattery] = useState(5000);
  const [editAntutu, setEditAntutu] = useState("");

  const startEditing = () => {
    setEditBrand("Samsung");
    setEditAntutu(userPhone?.antutu_score?.toString() || "");
    setEditBattery(userPhone?.battery_mah || 5000);
    setIsEditingPhone(true);
  };

  const handleSave = () => {
    const antutu = parseInt(editAntutu) || 0;
    if (antutu <= 0) return;
    
    const newPhone = predictUserPhoneSpecs({
      brand: editBrand,
      antutuScore: antutu,
      batteryMah: editBattery
    });
    setUserPhone(newPhone);
    localStorage.setItem("pa_user_phone", JSON.stringify(newPhone));
    setIsEditingPhone(false);
  };

  const handleClear = () => {
    setUserPhone(null);
    localStorage.removeItem("pa_user_phone");
    setEditBrand("Samsung");
    setEditAntutu("");
    setEditBattery(5000);
    setIsEditingPhone(false);
  };

  const hasActiveFilters = filters.selectedBrands.length > 0 ||
    filters.priceRange[1] < 200000 || filters.priceRange[0] > 5000 ||
    filters.batteryMin > 0 || filters.chargingMin > 0 ||
    filters.refreshRateMin > 0 || filters.screenTypes.length > 0 ||
    filters.processorTiers.length > 0 || filters.ramTypes.length > 0 ||
    filters.storageTypes.length > 0 || (filters.storageCapacities || []).length > 0 || (filters.ramCapacities || []).length > 0 || filters.minCameraScore > 0 ||
    filters.minOsYears > 0;

  return (
    <div className="space-y-0 text-neutral-900 dark:text-neutral-100 bg-transparent">
      {/* Result Count + Reset */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
          {phoneCount} phones
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition-colors"
          >
            <RefreshCw size={10} /> Reset
          </button>
        )}
      </div>

      {/* Current Phone Widget */}
      <div className="mb-5 pb-5 border-b border-neutral-200 dark:border-neutral-800">
        {!isEditingPhone ? (
          userPhone ? (
            <div className="rounded-2xl bg-indigo-50/40 dark:bg-indigo-950/10 border border-indigo-100/60 dark:border-indigo-900/30 p-3.5">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
                  <Smartphone size={12} /> Current Device
                </span>
                <div className="flex gap-2">
                  <button 
                    onClick={startEditing} 
                    className="text-[10px] font-bold text-neutral-500 hover:text-neutral-750 dark:hover:text-neutral-355 transition-colors uppercase tracking-wider"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={handleClear} 
                    className="text-[10px] font-bold text-rose-500 hover:text-rose-700 dark:hover:text-rose-455 transition-colors uppercase tracking-wider"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <p className="text-xs font-black text-neutral-800 dark:text-neutral-250 truncate">{userPhone.name}</p>
              
              <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-indigo-100/30 dark:border-indigo-900/20 text-[10px]">
                <div className="flex justify-between text-neutral-500 dark:text-neutral-450">
                  <span>AnTuTu:</span>
                  <span className="font-extrabold text-neutral-750 dark:text-neutral-200">
                    {userPhone.antutu_score > 0 ? (userPhone.antutu_score / 1000).toFixed(0) + "K" : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-450">
                  <span>Camera:</span>
                  <span className="font-extrabold text-neutral-750 dark:text-neutral-200">
                    {userPhone.main_camera_score > 0 ? userPhone.main_camera_score.toFixed(1) + "/10" : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-450">
                  <span>Battery:</span>
                  <span className="font-extrabold text-neutral-750 dark:text-neutral-200">
                    {userPhone.battery_mah > 0 ? userPhone.battery_mah + " mAh" : "—"}
                  </span>
                </div>
                <div className="flex justify-between text-neutral-500 dark:text-neutral-450">
                  <span>OS Updates:</span>
                  <span className="font-extrabold text-neutral-750 dark:text-neutral-200">
                    {userPhone.os_updates_years > 0 ? userPhone.os_updates_years + " yrs" : "—"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <button 
              onClick={startEditing}
              className="w-full py-2.5 rounded-xl border border-dashed border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/10 dark:bg-indigo-950/5 text-indigo-600 dark:text-indigo-450 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/15 transition-all duration-200 text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm"
            >
              <Smartphone size={13} /> Compare Current Phone
            </button>
          )
        ) : (
          <div className="rounded-2xl bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 p-3.5 space-y-2.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-750 dark:text-indigo-400 block mb-1">
              Configure current phone
            </span>
            
            {/* Brand Dropdown */}
            <div>
              <span className="block text-[8px] font-bold text-neutral-450 uppercase tracking-wide mb-0.5">Brand</span>
              <select
                value={editBrand}
                onChange={(e) => setEditBrand(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 text-xs rounded-lg text-neutral-800 dark:text-neutral-250 outline-none appearance-none cursor-pointer"
              >
                {["Samsung", "Apple", "OnePlus", "Xiaomi", "Realme", "POCO", "Vivo", "OPPO", "Motorola", "Nothing", "iQOO", "Google", "Honor", "Asus", "Sony", "Other"].map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Battery Dropdown */}
            <div>
              <span className="block text-[8px] font-bold text-neutral-450 uppercase tracking-wide mb-0.5">Battery (mAh)</span>
              <select
                value={editBattery}
                onChange={(e) => setEditBattery(parseInt(e.target.value))}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 text-xs rounded-lg text-neutral-800 dark:text-neutral-250 outline-none appearance-none cursor-pointer"
              >
                <option value={3000}>~3,000 mAh</option>
                <option value={3500}>~3,500 mAh</option>
                <option value={4000}>~4,000 mAh</option>
                <option value={4500}>~4,500 mAh</option>
                <option value={5000}>~5,000 mAh</option>
                <option value={5500}>~5,500 mAh</option>
                <option value={6000}>~6,000 mAh</option>
                <option value={7000}>~7,000 mAh</option>
              </select>
            </div>

            {/* AnTuTu Dropdown */}
            <div>
              <span className="block text-[8px] font-bold text-neutral-450 uppercase tracking-wide mb-0.5">AnTuTu Score</span>
              <select
                value={editAntutu}
                onChange={(e) => setEditAntutu(e.target.value)}
                className="w-full bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-1.5 text-xs rounded-lg text-neutral-800 dark:text-neutral-250 outline-none appearance-none cursor-pointer"
              >
                <option value="">— Select —</option>
                <option value="150000">~150K (Entry)</option>
                <option value="300000">~300K (Budget)</option>
                <option value="450000">~450K (Mid)</option>
                <option value="600000">~600K (Upper-mid)</option>
                <option value="800000">~800K (Flagship '22)</option>
                <option value="1000000">~1M (Flagship '23)</option>
                <option value="1200000">~1.2M (Flagship '24)</option>
                <option value="1500000">~1.5M (2025)</option>
                <option value="2000000">~2M (2025–26)</option>
                <option value="2500000">~2.5M+ (2026)</option>
              </select>
              <p className="text-[8px] text-indigo-600 dark:text-indigo-450 mt-1 font-semibold">
                💡 Google: "your phone model" AnTuTu score
              </p>
            </div>

            <div className="flex gap-2 pt-1 flex-shrink-0">
              <button 
                onClick={handleSave}
                className="flex-1 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold uppercase tracking-wider text-[10px]"
              >
                Save
              </button>
              <button 
                onClick={() => setIsEditingPhone(false)}
                className="flex-1 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 dark:bg-neutral-800 dark:hover:bg-neutral-750 text-neutral-600 dark:text-neutral-300 font-extrabold uppercase tracking-wider text-[10px]"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Brands */}
      <CollapsibleSection title="Brands" icon={<SlidersHorizontal size={14} />} defaultOpen={true}>
        <div className="flex flex-wrap gap-1.5 pb-1">
          {brands.map((b) => (
            <button
              key={b}
              onClick={() => toggleBrand(b)}
              className={`px-2.5 py-1.5 rounded text-[11px] font-semibold transition-colors ${
                filters.selectedBrands.includes(b)
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-800/80"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Price Range */}
      <CollapsibleSection title="Budget" icon={<span className="text-sm font-bold">₹</span>} defaultOpen={true}>
        <div className="pb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">Min Price</span>
            <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">{formatINR(filters.priceRange[0])}</span>
          </div>
          <input
            type="range" min={5000} max={100000} step={5000}
            value={filters.priceRange[0]}
            onChange={(e) => {
              const val = +e.target.value;
              if (val < filters.priceRange[1]) update({ priceRange: [val, filters.priceRange[1]] });
            }}
            className="w-full accent-blue-600"
          />
          <div className="flex items-center justify-between mb-1.5 mt-3">
            <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400">Max Price</span>
            <span className="text-[11px] font-bold text-neutral-800 dark:text-neutral-200">{formatINR(filters.priceRange[1])}</span>
          </div>
          <input
            type="range" min={5000} max={200000} step={5000}
            value={filters.priceRange[1]}
            onChange={(e) => {
              const val = +e.target.value;
              if (val > filters.priceRange[0]) update({ priceRange: [filters.priceRange[0], val] });
            }}
            className="w-full accent-blue-600"
          />
          <div className="flex justify-between text-[10px] text-neutral-400 dark:text-neutral-500 mt-1 font-medium">
            <span>{formatINR(5000)}</span><span>{formatINR(200000)}</span>
          </div>
        </div>
      </CollapsibleSection>

      {/* Memory & Storage Capacity */}
      <CollapsibleSection title="RAM and Storage" icon={<HardDrive size={14} />} defaultOpen={true} forceOpen={(filters.ramCapacities || []).length > 0 || (filters.storageCapacities || []).length > 0}>
        <div className="pb-1">
          {availableRamCapacities && availableRamCapacities.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">RAM Size</span>
              <ChipSelect
                options={availableRamCapacities.map(c => `${c}GB`)}
                selected={(filters.ramCapacities || []).map(c => `${c}GB`)}
                onToggle={(v) => {
                  const val = parseInt(v);
                  const current = filters.ramCapacities || [];
                  const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
                  update({ ramCapacities: next });
                }}
                color="green"
              />
            </div>
          )}
          {availableStorageCapacities && availableStorageCapacities.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Storage Size</span>
              <ChipSelect
                options={availableStorageCapacities.map(c => c >= 1024 ? `${c/1024}TB` : `${c}GB`)}
                selected={(filters.storageCapacities || []).map(c => c >= 1024 ? `${c/1024}TB` : `${c}GB`)}
                onToggle={(v) => {
                  const val = v.includes('TB') ? parseInt(v) * 1024 : parseInt(v);
                  const current = filters.storageCapacities || [];
                  const next = current.includes(val) ? current.filter((x) => x !== val) : [...current, val];
                  update({ storageCapacities: next });
                }}
                color="blue"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Tuning Priority" icon={<Wrench size={14} />} defaultOpen={true}>
        <div className="pb-1">
          {[
            { key: "performance" as const, label: "Performance", icon: <Zap size={14} />, },
            { key: "reliability" as const, label: "Reliability", icon: <Shield size={14} />, },
            { key: "camera" as const, label: "Camera", icon: <Camera size={14} />, },
            { key: "os" as const, label: "OS Rating", icon: <Smartphone size={14} />, },
          ].map((s) => {
            const enabledKey = `${s.key}Enabled` as keyof WeightConfig;
            const isEnabled = filters.weights[enabledKey] !== false;
            return (
              <div key={s.key} className="mb-3.5 last:mb-0">
                <div className="flex items-center justify-between mb-1.5">
                  <span className={`text-[11px] font-semibold flex items-center gap-1.5 transition-colors duration-200 ${isEnabled ? "text-neutral-700 dark:text-neutral-350" : "text-neutral-400 dark:text-neutral-500"}`}>
                    {s.icon} {s.label}
                  </span>
                  <button
                    onClick={() => updateWeights({ [enabledKey]: !isEnabled } as any)}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all duration-200 uppercase tracking-wider border cursor-pointer ${
                      isEnabled 
                        ? "bg-blue-50 dark:bg-blue-950/45 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-900/40 hover:bg-blue-100 dark:hover:bg-blue-900/30" 
                        : "bg-neutral-50 dark:bg-neutral-900 text-neutral-400 dark:text-neutral-500 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                    }`}
                  >
                    {isEnabled ? "Active" : "Off"}
                  </button>
                </div>
                <div className={`flex rounded-lg bg-neutral-100 dark:bg-neutral-800 p-0.5 border border-neutral-200/50 dark:border-neutral-800/40 transition-all duration-200 ${!isEnabled ? "opacity-35 pointer-events-none select-none" : ""}`}>
                  {[
                    { label: "Low", value: 10 },
                    { label: "Med", value: 50 },
                    { label: "High", value: 100 }
                  ].map((level) => {
                    const isSelected = Math.abs(filters.weights[s.key] - level.value) <= 20 || filters.weights[s.key] === level.value;
                    return (
                      <button
                        key={level.label}
                        disabled={!isEnabled}
                        onClick={() => updateWeights({ [s.key]: level.value })}
                        className={`flex-1 text-[10px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all duration-200 ${
                          isSelected
                            ? "bg-white dark:bg-neutral-700 text-blue-600 dark:text-blue-400 shadow-sm ring-1 ring-neutral-200/50 dark:ring-neutral-600/40"
                            : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-200/40 dark:hover:bg-neutral-700/30"
                        }`}
                      >
                        {level.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleSection>

      {/* Battery & Charging */}
      <CollapsibleSection title="Battery & Charging" icon={<Battery size={14} />} forceOpen={filters.batteryMin > 0 || filters.chargingMin > 0}>
        <div className="pb-1">
          <RangeSlider
            label="Min Battery"
            min={0} max={7000} step={500}
            value={filters.batteryMin}
            onChange={(v) => update({ batteryMin: v })}
            formatValue={(v) => v === 0 ? "Any" : `${v}+ mAh`}
          />
          <RangeSlider
            label="Min Charging Speed"
            min={0} max={120} step={5}
            value={filters.chargingMin}
            onChange={(v) => update({ chargingMin: v })}
            formatValue={(v) => v === 0 ? "Any" : `${v}W+`}
          />
        </div>
      </CollapsibleSection>

      {/* Display */}
      <CollapsibleSection title="Display" icon={<Monitor size={14} />} forceOpen={filters.refreshRateMin > 0 || filters.screenTypes.length > 0}>
        <div className="pb-1">
          <RangeSlider
            label="Min Refresh Rate"
            min={0} max={144} step={30}
            value={filters.refreshRateMin}
            onChange={(v) => update({ refreshRateMin: v })}
            formatValue={(v) => v === 0 ? "Any" : `${v}Hz+`}
          />
          {availableScreenTypes.length > 0 && (
            <div className="mt-3">
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Screen Type</span>
              <ChipSelect
                options={availableScreenTypes}
                selected={filters.screenTypes}
                onToggle={(v) => toggleInArray("screenTypes", v)}
                color="violet"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Processor & Memory */}
      <CollapsibleSection title="Processor & Memory" icon={<Cpu size={14} />} forceOpen={filters.ramTypes.length > 0 || filters.storageTypes.length > 0 || filters.processorTiers.length > 0}>
        <div className="pb-1">
          {availableRamTypes.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">RAM Type</span>
              <ChipSelect
                options={availableRamTypes}
                selected={filters.ramTypes}
                onToggle={(v) => toggleInArray("ramTypes", v)}
                color="green"
              />
            </div>
          )}
          {availableStorageTypes.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] font-medium text-neutral-600 dark:text-neutral-400 mb-1.5 block">Storage Type</span>
              <ChipSelect
                options={availableStorageTypes}
                selected={filters.storageTypes}
                onToggle={(v) => toggleInArray("storageTypes", v)}
                color="orange"
              />
            </div>
          )}
        </div>
      </CollapsibleSection>

      {/* Camera */}
      <CollapsibleSection title="Camera" icon={<Camera size={14} />} forceOpen={filters.minCameraScore > 0}>
        <div className="pb-1">
          <RangeSlider
            label="Min Camera Score"
            min={0} max={10} step={1}
            value={filters.minCameraScore}
            onChange={(v) => update({ minCameraScore: v })}
            formatValue={(v) => v === 0 ? "Any" : `${v}+ / 10`}
          />
        </div>
      </CollapsibleSection>

      {/* Software */}
      <CollapsibleSection title="Software & Updates" icon={<Shield size={14} />} forceOpen={filters.minOsYears > 0}>
        <div className="pb-1">
          <RangeSlider
            label="Min OS Update Years"
            min={0} max={7} step={1}
            value={filters.minOsYears}
            onChange={(v) => update({ minOsYears: v })}
            formatValue={(v) => v === 0 ? "Any" : `${v}+ years`}
          />
        </div>
      </CollapsibleSection>
    </div>
  );
}

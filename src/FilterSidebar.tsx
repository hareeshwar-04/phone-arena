import {
  SlidersHorizontal, Zap, Shield, Camera, Wrench, ChevronDown,
  Battery, Monitor, Cpu, HardDrive, MemoryStick, RefreshCw, Sparkles, Smartphone
} from "lucide-react";
import { useState, useCallback } from "react";
import type { WeightConfig, FilterConfig } from "./types";
import { formatINR, DEFAULT_FILTERS } from "./types";

interface FilterSidebarProps {
  brands: string[];
  filters: FilterConfig;
  onFilterChange: (f: FilterConfig) => void;
  /** Available options extracted from the phone database */
  availableScreenTypes: string[];
  availableRamTypes: string[];
  availableStorageTypes: string[];
  availableProcessorTiers: string[];
  phoneCount: number;
}

function CollapsibleSection({ title, icon, defaultOpen = false, children }: {
  title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="pt-4 border-t border-neutral-200 first:border-t-0 first:pt-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3 hover:text-blue-600 transition-colors"
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
    blue: { active: "bg-blue-600 text-white", inactive: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200" },
    violet: { active: "bg-violet-600 text-white", inactive: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200" },
    green: { active: "bg-green-600 text-white", inactive: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200" },
    orange: { active: "bg-orange-500 text-white", inactive: "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200" },
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
        <span className="text-[11px] font-medium text-neutral-600">{label}</span>
        <span className="text-[11px] font-bold text-neutral-800">
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
  phoneCount
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

  const hasActiveFilters = filters.selectedBrands.length > 0 ||
    filters.priceRange[1] < 200000 || filters.priceRange[0] > 5000 ||
    filters.batteryMin > 0 || filters.chargingMin > 0 ||
    filters.refreshRateMin > 0 || filters.screenTypes.length > 0 ||
    filters.processorTiers.length > 0 || filters.ramTypes.length > 0 ||
    filters.storageTypes.length > 0 || filters.minCameraScore > 0 ||
    filters.minOsYears > 0;

  return (
    <div className="space-y-0">
      {/* Result Count + Reset */}
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
          {phoneCount} phones
        </span>
        {hasActiveFilters && (
          <button
            onClick={resetAll}
            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors"
          >
            <RefreshCw size={10} /> Reset
          </button>
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
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200"
              }`}
            >
              {b}
            </button>
          ))}
        </div>
      </CollapsibleSection>

      {/* Price Range */}
      <CollapsibleSection title="Budget" icon={<span className="text-sm">₹</span>} defaultOpen={true}>
        <div className="pb-1">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-medium text-neutral-600">Min Price</span>
            <span className="text-[11px] font-bold text-neutral-800">{formatINR(filters.priceRange[0])}</span>
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
            <span className="text-[11px] font-medium text-neutral-600">Max Price</span>
            <span className="text-[11px] font-bold text-neutral-800">{formatINR(filters.priceRange[1])}</span>
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
          <div className="flex justify-between text-[10px] text-neutral-400 mt-1 font-medium">
            <span>{formatINR(5000)}</span><span>{formatINR(200000)}</span>
          </div>
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
                  <span className={`text-[11px] font-semibold flex items-center gap-1.5 transition-colors duration-200 ${isEnabled ? "text-neutral-700" : "text-neutral-400"}`}>
                    {s.icon} {s.label}
                  </span>
                  <button
                    onClick={() => updateWeights({ [enabledKey]: !isEnabled } as any)}
                    className={`text-[9px] font-bold px-2 py-0.5 rounded transition-all duration-200 uppercase tracking-wider border cursor-pointer ${
                      isEnabled 
                        ? "bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100" 
                        : "bg-neutral-50 text-neutral-400 border-neutral-200 hover:bg-neutral-100"
                    }`}
                  >
                    {isEnabled ? "Active" : "Off"}
                  </button>
                </div>
                <div className={`flex rounded-lg bg-neutral-100 p-0.5 border border-neutral-200/50 transition-all duration-200 ${!isEnabled ? "opacity-35 pointer-events-none select-none" : ""}`}>
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
                            ? "bg-white text-blue-600 shadow-sm ring-1 ring-neutral-200/50"
                            : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-200/50"
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
      <CollapsibleSection title="Battery & Charging" icon={<Battery size={14} />}>
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
      <CollapsibleSection title="Display" icon={<Monitor size={14} />}>
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
              <span className="text-[11px] font-medium text-neutral-600 mb-1.5 block">Screen Type</span>
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
      <CollapsibleSection title="Processor & Memory" icon={<Cpu size={14} />}>
        <div className="pb-1">
          {availableRamTypes.length > 0 && (
            <div className="mb-3">
              <span className="text-[11px] font-medium text-neutral-600 mb-1.5 block">RAM Type</span>
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
              <span className="text-[11px] font-medium text-neutral-600 mb-1.5 block">Storage Type</span>
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
      <CollapsibleSection title="Camera" icon={<Camera size={14} />}>
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
      <CollapsibleSection title="Software & Updates" icon={<Shield size={14} />}>
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

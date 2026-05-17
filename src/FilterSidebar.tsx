import { SlidersHorizontal, Zap, Shield, Camera, Wrench, ChevronDown } from "lucide-react";
import { useState } from "react";
import type { WeightConfig } from "./types";
import { formatINR } from "./types";

export function FilterSidebar({ brands, selectedBrands, onToggleBrand, priceRange, onPriceChange, weights, onWeightChange }: {
  brands: string[]; selectedBrands: string[];
  onToggleBrand: (b: string) => void;
  priceRange: [number, number]; onPriceChange: (v: [number, number]) => void;
  weights: WeightConfig; onWeightChange: (w: WeightConfig) => void;
}) {
  const [tuningOpen, setTuningOpen] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-3 flex items-center gap-2">
          <SlidersHorizontal size={14} /> Brands
        </h3>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <button key={b} onClick={() => onToggleBrand(b)} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${selectedBrands.includes(b) ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 border border-neutral-200"}`}>
              {b}
            </button>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t border-neutral-200">
        <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider mb-4">Max Budget</h3>
        <input type="range" min={10000} max={200000} step={5000} value={priceRange[1]} onChange={(e) => onPriceChange([priceRange[0], +e.target.value])} className="w-full accent-blue-600" />
        <div className="flex justify-between text-xs text-neutral-500 mt-2 font-medium">
          <span>{formatINR(priceRange[0])}</span><span>{formatINR(priceRange[1])}</span>
        </div>
      </div>
      <div className="pt-4 border-t border-neutral-200">
        <button onClick={() => setTuningOpen(!tuningOpen)} className="w-full flex items-center justify-between text-xs font-bold text-neutral-800 uppercase tracking-wider mb-4 hover:text-blue-600 transition-colors">
          <span className="flex items-center gap-2"><Wrench size={14} /> Tuning Weights</span>
          <ChevronDown size={16} className={`transition-transform duration-300 ${tuningOpen ? "rotate-180" : ""}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-out ${tuningOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
          {[
            { key: "gaming" as const, label: "Performance", icon: <Zap size={14} />, color: "text-neutral-700" },
            { key: "durability" as const, label: "Reliability", icon: <Shield size={14} />, color: "text-neutral-700" },
            { key: "camera" as const, label: "Camera", icon: <Camera size={14} />, color: "text-neutral-700" },
          ].map((s) => (
            <div key={s.key} className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className={`text-sm font-medium flex items-center gap-1.5 ${s.color}`}>{s.icon} {s.label}</span>
                <span className="text-xs text-neutral-500 font-semibold">{weights[s.key]}%</span>
              </div>
              <input type="range" min={0} max={100} value={weights[s.key]} onChange={(e) => onWeightChange({ ...weights, [s.key]: +e.target.value })} className="w-full accent-blue-600" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

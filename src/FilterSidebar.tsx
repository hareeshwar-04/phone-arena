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
          <span className="flex items-center gap-2"><Wrench size={14} /> Tuning Priority</span>
          <ChevronDown size={16} className={`transition-transform duration-300 ${tuningOpen ? "rotate-180" : ""}`} />
        </button>
        <div className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out ${tuningOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="overflow-hidden">
            <div className="pt-2">
              {[
                { key: "gaming" as const, label: "Performance", icon: <Zap size={14} />, color: "text-neutral-700" },
                { key: "durability" as const, label: "Reliability", icon: <Shield size={14} />, color: "text-neutral-700" },
                { key: "camera" as const, label: "Camera", icon: <Camera size={14} />, color: "text-neutral-700" },
              ].map((s) => (
                <div key={s.key} className="mb-4 last:mb-0">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium flex items-center gap-1.5 ${s.color}`}>{s.icon} {s.label}</span>
                  </div>
                  <div className="flex rounded-lg bg-neutral-100 p-1 border border-neutral-200/50">
                    {[
                      { label: "Low", value: 10 },
                      { label: "Med", value: 50 },
                      { label: "High", value: 100 }
                    ].map((level) => {
                      // Match closest level to handle initial state gracefully
                      const isSelected = Math.abs(weights[s.key] - level.value) <= 20 || weights[s.key] === level.value;
                      return (
                        <button
                          key={level.label}
                          onClick={() => onWeightChange({ ...weights, [s.key]: level.value })}
                          className={`flex-1 text-[11px] font-bold uppercase tracking-wider py-1.5 rounded-md transition-all duration-200 ${
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
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

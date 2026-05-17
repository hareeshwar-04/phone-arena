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
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
          <SlidersHorizontal size={12} /> Brands
        </h3>
        <div className="flex flex-wrap gap-2">
          {brands.map((b) => (
            <button key={b} onClick={() => onToggleBrand(b)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all duration-200 ${selectedBrands.includes(b) ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950" : "bg-slate-800/40 text-slate-400 hover:bg-slate-700/50 border border-slate-800/50"}`}>
              {b}
            </button>
          ))}
        </div>
      </div>
      <div>
        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3">Budget Cap</h3>
        <input type="range" min={15000} max={50000} step={1000} value={priceRange[1]} onChange={(e) => onPriceChange([priceRange[0], +e.target.value])} className="w-full" />
        <div className="flex justify-between text-[11px] text-slate-600 mt-1.5 font-mono">
          <span>{formatINR(priceRange[0])}</span><span>{formatINR(priceRange[1])}</span>
        </div>
      </div>
      <div>
        <button onClick={() => setTuningOpen(!tuningOpen)} className="w-full flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-3 hover:text-slate-300 transition-colors">
          <span className="flex items-center gap-2"><Wrench size={12} /> Performance Tuning</span>
          <ChevronDown size={14} className={`transition-transform duration-300 ${tuningOpen ? "rotate-180" : ""}`} />
        </button>
        <div className={`overflow-hidden transition-all duration-300 ease-out ${tuningOpen ? "max-h-60 opacity-100" : "max-h-0 opacity-0"}`}>
          {[
            { key: "gaming" as const, label: "Gaming", icon: <Zap size={11} />, color: "text-red-400" },
            { key: "durability" as const, label: "Durability", icon: <Shield size={11} />, color: "text-blue-400" },
            { key: "camera" as const, label: "Camera", icon: <Camera size={11} />, color: "text-purple-400" },
          ].map((s) => (
            <div key={s.key} className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className={`text-[11px] font-semibold flex items-center gap-1 ${s.color}`}>{s.icon} {s.label}</span>
                <span className="text-[11px] text-slate-600 font-mono font-bold">{weights[s.key]}%</span>
              </div>
              <input type="range" min={0} max={100} value={weights[s.key]} onChange={(e) => onWeightChange({ ...weights, [s.key]: +e.target.value })} className="w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

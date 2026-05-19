import { Zap, Shield, Camera, Star, Cpu, Battery, AlertTriangle, Plus, X, Monitor, ExternalLink } from "lucide-react";
import type { PhoneWithRatings, WeightConfig } from "./types";
import { formatINR } from "./types";

export function SkeletonCard() {
  return (
    <div className="rounded border border-neutral-200 bg-white p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-20 rounded bg-neutral-200" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-16 bg-neutral-200 rounded" />
          <div className="h-4 w-32 bg-neutral-200 rounded" />
          <div className="h-5 w-24 bg-neutral-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-14 bg-neutral-100 rounded" />
        <div className="h-14 bg-neutral-100 rounded" />
        <div className="h-14 bg-neutral-100 rounded" />
        <div className="h-14 bg-neutral-100 rounded" />
      </div>
      <div className="h-10 bg-neutral-200 rounded" />
    </div>
  );
}

export function PhoneCard({ phone, isCompared, onToggle, weights, onSelect }: {
  phone: PhoneWithRatings; isCompared: boolean;
  onToggle: (id: string) => void; weights: WeightConfig;
  onSelect?: () => void;
}) {
  const total = weights.gaming + weights.durability + weights.camera || 1;
  const customScore = Math.round(((phone.ratings.gaming * weights.gaming + phone.ratings.durability * weights.durability + phone.ratings.creator * weights.camera) / total) * 10) / 10;
  const hasBloat = phone.raw_ui_score < 6.0;

  return (
    <div className={`relative group rounded border bg-white transition-shadow duration-200 hover:shadow-md animate-fade-in-up cursor-pointer ${isCompared ? "border-blue-500 shadow-sm" : "border-neutral-200"}`} onClick={onSelect}>
      {hasBloat && (
        <div className="absolute top-3 right-3 z-10 group/bloat cursor-help">
          <div className="flex items-center gap-1 rounded bg-red-50 border border-red-200 px-2 py-1 text-[10px] uppercase font-bold text-red-600">
            <AlertTriangle size={12} /> Bloat Risk
          </div>
          <div className="absolute right-0 top-8 w-56 rounded bg-neutral-900 p-3 text-xs text-white opacity-0 group-hover/bloat:opacity-100 transition-opacity pointer-events-none z-20 shadow-lg">
            Notice: Software experience may include heavy pre-installed applications or intrusive ads.
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4 border-b border-neutral-100 pb-4">
          <div className="w-16 h-20 bg-neutral-50 flex items-center justify-center flex-shrink-0">
            <img src={phone.image_url} alt={phone.name} className="max-w-full max-h-full object-contain mix-blend-multiply" loading="lazy" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{phone.brand}</p>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight truncate mt-0.5">{phone.name}</h3>
            <p className="text-lg font-extrabold text-blue-600 mt-1">{formatINR(phone.price_inr)}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5 text-[11px] text-neutral-600 mb-4 font-medium">
          <div className="flex items-center gap-2">
            <Cpu size={13} className="text-neutral-400" /> <span className="truncate">{phone.cpu_name}</span>
            <span className="text-neutral-300">•</span>
            <span className="font-bold text-neutral-800">{(phone.antutu_score / 100000).toFixed(1)}L AnTuTu</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-neutral-400" /> <span>{phone.ram_type}</span>
            <span className="text-neutral-300">•</span>
            <span>{phone.storage_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor size={13} className="text-neutral-400" /> <span>{phone.display_refresh_hz}Hz Display</span>
            <span className="text-neutral-300">•</span>
            <Battery size={13} className="text-neutral-400" /> <span>{phone.battery_mah}mAh</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: "Performance", value: phone.ratings.gaming, color: "text-neutral-700" },
            { label: "Reliability", value: phone.ratings.durability, color: "text-neutral-700" },
            { label: "Camera", value: phone.ratings.creator, color: "text-neutral-700" },
            { label: "Value", value: phone.ratings.vfm, color: "text-neutral-700" },
          ].map((r) => (
            <div key={r.label} className="rounded bg-neutral-50 border border-neutral-100 px-3 py-2">
              <div className={`text-[10px] font-bold uppercase tracking-wider ${r.color} mb-1`}>{r.label}</div>
              <div className="text-sm font-bold text-neutral-900">{r.value.toFixed(1)}<span className="text-neutral-400 text-[10px]">/10</span></div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between rounded bg-blue-50/50 border border-blue-100 px-3 py-2.5 mb-4">
          <span className="text-[10px] uppercase tracking-wider font-bold text-blue-800">Match Score</span>
          <span className="text-base font-extrabold text-blue-700">{customScore.toFixed(1)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <button onClick={(e) => { e.stopPropagation(); onToggle(phone.id); }} className={`w-full py-2.5 rounded text-xs font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-2 ${isCompared ? "bg-neutral-100 text-neutral-700 hover:bg-neutral-200" : "bg-blue-600 text-white hover:bg-blue-700"}`}>
            {isCompared ? <><X size={14} /> Remove</> : <><Plus size={14} /> Compare</>}
          </button>
        </div>
      </div>
    </div>
  );
}

import { Zap, Shield, Camera, Star, Cpu, Battery, AlertTriangle, Plus, X } from "lucide-react";
import type { PhoneWithRatings, WeightConfig } from "./types";
import { formatINR } from "./types";

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-xl p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-20 rounded-xl bg-zinc-800" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-16 bg-zinc-800 rounded" />
          <div className="h-4 w-32 bg-zinc-800 rounded" />
          <div className="h-5 w-24 bg-zinc-800 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-14 bg-zinc-800/60 rounded-lg" />
        <div className="h-14 bg-zinc-800/60 rounded-lg" />
        <div className="h-14 bg-zinc-800/60 rounded-lg" />
        <div className="h-14 bg-zinc-800/60 rounded-lg" />
      </div>
      <div className="h-10 bg-zinc-800 rounded-xl" />
    </div>
  );
}

export function PhoneCard({ phone, isCompared, onToggle, weights }: {
  phone: PhoneWithRatings; isCompared: boolean;
  onToggle: (id: string) => void; weights: WeightConfig;
}) {
  const total = weights.gaming + weights.durability + weights.camera || 1;
  const customScore = Math.round(((phone.ratings.gaming * weights.gaming + phone.ratings.durability * weights.durability + phone.ratings.creator * weights.camera) / total) * 10) / 10;
  const hasBloat = phone.raw_ui_score < 6.0;

  return (
    <div className={`relative group rounded-2xl border backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden shadow-xl ${isCompared ? "border-violet-500/50 bg-zinc-900/80 shadow-violet-900/20" : "border-zinc-800/80 bg-zinc-900/30 hover:border-zinc-700/80 hover:bg-zinc-900/60 shadow-black/40"}`}>
      {hasBloat && (
        <div className="absolute top-3 right-3 z-10 group/bloat cursor-help">
          <div className="flex items-center gap-1 rounded-full bg-rose-500/10 border border-rose-500/20 px-2.5 py-1 text-xs font-medium text-rose-400 backdrop-blur-md">
            <AlertTriangle size={11} /> Bloat Risk
          </div>
          <div className="absolute right-0 top-8 w-64 rounded-xl bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 p-3 text-xs text-zinc-300 leading-relaxed opacity-0 group-hover/bloat:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-2xl">
            Notice: Software experience may include heavy pre-installed applications, background battery optimizations, or lock screen promotional content.
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 border border-zinc-700/50 shadow-inner">
            <img src={phone.image_url} alt={phone.name} className="w-full h-full object-cover rounded-xl" loading="lazy" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-500">{phone.brand}</p>
            <h3 className="text-sm font-bold text-zinc-100 tracking-tight truncate mt-0.5">{phone.name}</h3>
            <p className="text-lg font-extrabold tracking-tight text-white mt-1">{formatINR(phone.price_inr)}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-[11px] text-zinc-400 mb-4 font-medium bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-zinc-800/50">
          <Cpu size={12} className="text-zinc-500" /> <span className="truncate">{phone.cpu_name}</span>
          <span className="mx-0.5 text-zinc-700">|</span>
          <Battery size={12} className="text-zinc-500" /> <span className="font-mono">{phone.battery_mah}mAh</span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: "Gaming", value: phone.ratings.gaming, icon: <Zap size={11} />, color: "text-rose-400" },
            { label: "Durability", value: phone.ratings.durability, icon: <Shield size={11} />, color: "text-blue-400" },
            { label: "Camera", value: phone.ratings.creator, icon: <Camera size={11} />, color: "text-amber-400" },
            { label: "VFM", value: phone.ratings.vfm, icon: <Star size={11} />, color: "text-emerald-400" },
          ].map((r) => (
            <div key={r.label} className="rounded-xl bg-zinc-950/40 border border-zinc-800/60 px-3 py-2 shadow-inner">
              <div className={`flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider ${r.color} mb-1`}>{r.icon} {r.label}</div>
              <div className="text-sm font-bold text-zinc-100 font-mono">{r.value}<span className="text-zinc-600 text-[10px]">/10</span></div>
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between rounded-xl bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10 border border-violet-500/20 px-3 py-2.5 mb-4 backdrop-blur-md">
          <span className="text-[10px] uppercase tracking-[0.15em] font-bold text-violet-300/80">Match Score</span>
          <span className="text-sm font-extrabold font-mono text-white">{customScore}</span>
        </div>
        
        <button onClick={() => onToggle(phone.id)} className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${isCompared ? "bg-white text-zinc-950 hover:bg-zinc-200 shadow-lg shadow-white/10" : "bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700 hover:text-white border border-zinc-700"}`}>
          {isCompared ? <><X size={14} /> Remove</> : <><Plus size={14} /> Compare</>}
        </button>
      </div>
    </div>
  );
}

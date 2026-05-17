import { Zap, Shield, Camera, Star, Cpu, Battery, AlertTriangle, Plus, X } from "lucide-react";
import type { PhoneWithRatings, WeightConfig } from "./types";
import { formatINR } from "./types";

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-slate-800/50 bg-slate-900/30 backdrop-blur-xl p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-20 rounded-xl bg-slate-800" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-16 bg-slate-800 rounded" />
          <div className="h-4 w-32 bg-slate-800 rounded" />
          <div className="h-5 w-24 bg-slate-800 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="h-14 bg-slate-800/60 rounded-lg" />
        <div className="h-14 bg-slate-800/60 rounded-lg" />
        <div className="h-14 bg-slate-800/60 rounded-lg" />
        <div className="h-14 bg-slate-800/60 rounded-lg" />
      </div>
      <div className="h-10 bg-slate-800 rounded-xl" />
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
    <div className={`relative group rounded-2xl border backdrop-blur-xl transition-all duration-300 ease-out hover:-translate-y-1 overflow-hidden shadow-2xl ${isCompared ? "border-cyan-500/40 bg-slate-900/50 shadow-cyan-900/20" : "border-slate-800/50 bg-slate-900/30 hover:border-slate-700/60 shadow-cyan-900/5"}`}>
      {hasBloat && (
        <div className="absolute top-3 right-3 z-10 group/bloat cursor-help">
          <div className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 text-xs font-medium text-amber-400">
            <AlertTriangle size={11} /> Bloatware Risk
          </div>
          <div className="absolute right-0 top-8 w-64 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-slate-700/60 p-3 text-xs text-slate-300 leading-relaxed opacity-0 group-hover/bloat:opacity-100 transition-opacity duration-200 pointer-events-none z-20 shadow-2xl">
            Notice: Software experience may include heavy pre-installed applications, background battery optimizations, or lock screen promotional content.
          </div>
        </div>
      )}
      <div className="p-5">
        <div className="flex items-start gap-4 mb-4">
          <div className="w-16 h-20 rounded-xl bg-gradient-to-br from-slate-800/80 to-slate-700/40 flex items-center justify-center overflow-hidden flex-shrink-0 border border-slate-700/30">
            <img src={phone.image_url} alt={phone.name} className="w-full h-full object-cover rounded-xl" loading="lazy" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.15em] text-cyan-400/80">{phone.brand}</p>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight truncate mt-0.5">{phone.name}</h3>
            <p className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mt-1">{formatINR(phone.price_inr)}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-4 font-medium">
          <Cpu size={11} /> <span>{phone.cpu_name}</span>
          <span className="mx-0.5 text-slate-700">•</span>
          <Battery size={11} /> <span className="font-mono">{phone.battery_mah}mAh</span>
        </div>
        <div className="grid grid-cols-2 gap-2 mb-4">
          {[
            { label: "Gaming", value: phone.ratings.gaming, icon: <Zap size={11} />, color: "text-red-400" },
            { label: "Durability", value: phone.ratings.durability, icon: <Shield size={11} />, color: "text-blue-400" },
            { label: "Camera", value: phone.ratings.creator, icon: <Camera size={11} />, color: "text-purple-400" },
            { label: "VFM", value: phone.ratings.vfm, icon: <Star size={11} />, color: "text-amber-400" },
          ].map((r) => (
            <div key={r.label} className="rounded-lg bg-slate-800/30 border border-slate-800/40 px-3 py-2">
              <div className={`flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider ${r.color} mb-1`}>{r.icon} {r.label}</div>
              <div className="text-sm font-bold text-slate-100 font-mono">{r.value}<span className="text-slate-600 text-[10px]">/10</span></div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-cyan-500/5 to-emerald-500/5 border border-cyan-500/15 px-3 py-2 mb-4">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400/70">Weighted</span>
          <span className="text-sm font-extrabold font-mono bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">{customScore}</span>
        </div>
        <button onClick={() => onToggle(phone.id)} className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2 ${isCompared ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-slate-950 hover:shadow-lg hover:shadow-cyan-500/20" : "bg-slate-800/60 text-slate-400 hover:bg-slate-700/60 border border-slate-700/40 hover:text-slate-200"}`}>
          {isCompared ? <><X size={13} /> Remove</> : <><Plus size={13} /> Compare</>}
        </button>
      </div>
    </div>
  );
}

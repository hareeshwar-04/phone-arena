import { Trophy, ChevronRight, X, Zap, Camera, Shield, Star } from "lucide-react";
import type { PhoneWithRatings } from "./types";
import { formatINR } from "./types";
import { useVerdict } from "./hooks";

export function ComparisonMatrix({ phones, onRemove }: { phones: PhoneWithRatings[]; onRemove: (id: string) => void }) {
  const verdicts = useVerdict(phones);

  const rows: { label: string; key: string; getValue: (p: PhoneWithRatings) => number; fmt?: (v: number) => string; higherBetter: boolean }[] = [
    { label: "Price", key: "price", getValue: (p) => p.price_inr, fmt: formatINR, higherBetter: false },
    { label: "CPU Score", key: "cpu", getValue: (p) => p.raw_cpu_score, higherBetter: true },
    { label: "UI Score", key: "ui", getValue: (p) => p.raw_ui_score, higherBetter: true },
    { label: "Battery", key: "bat", getValue: (p) => p.battery_mah, fmt: (v) => `${v} mAh`, higherBetter: true },
    { label: "Charging", key: "chg", getValue: (p) => p.charging_w, fmt: (v) => `${v}W`, higherBetter: true },
    { label: "Main Camera", key: "cam", getValue: (p) => p.main_camera_score, higherBetter: true },
    { label: "Selfie", key: "sel", getValue: (p) => p.front_camera_score, higherBetter: true },
    { label: "Refresh Rate", key: "ref", getValue: (p) => p.display_refresh_hz, fmt: (v) => `${v}Hz`, higherBetter: true },
    { label: "Build", key: "bld", getValue: (p) => p.build_quality_score, higherBetter: true },
    { label: "Updates", key: "upd", getValue: (p) => p.os_updates_years, fmt: (v) => `${v} yrs`, higherBetter: true },
    { label: "Gaming ⚡", key: "g", getValue: (p) => p.ratings.gaming, higherBetter: true },
    { label: "Durability 🛡️", key: "d", getValue: (p) => p.ratings.durability, higherBetter: true },
    { label: "Camera 📸", key: "c", getValue: (p) => p.ratings.creator, higherBetter: true },
    { label: "VFM 💰", key: "v", getValue: (p) => p.ratings.vfm, higherBetter: true },
  ];

  if (phones.length === 0) return null;

  // Calculate Winners
  const gamingWinner = phones.reduce((prev, curr) => (prev.raw_cpu_score > curr.raw_cpu_score) ? prev : curr);
  const cameraWinner = phones.reduce((prev, curr) => (prev.main_camera_score > curr.main_camera_score) ? prev : curr);
  const durabilityWinner = phones.reduce((prev, curr) => (prev.os_updates_years + prev.build_quality_score > curr.os_updates_years + curr.build_quality_score) ? prev : curr);
  const vfmWinner = phones.reduce((prev, curr) => (prev.ratings.vfm > curr.ratings.vfm) ? prev : curr);

  return (
    <div className="space-y-6">
      {verdicts.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-violet-500/10 via-fuchsia-500/5 to-violet-500/10 border border-violet-500/20 backdrop-blur-xl p-5 shadow-2xl shadow-violet-900/10">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-violet-400 to-fuchsia-400 bg-clip-text text-transparent mb-3 flex items-center gap-2">
            <Trophy size={14} className="text-violet-400" /> AI Verdict
          </h3>
          <ul className="space-y-2">
            {verdicts.map((v, i) => (
              <li key={i} className="text-sm text-zinc-300 leading-relaxed flex items-start gap-2">
                <ChevronRight size={13} className="text-violet-400/60 mt-0.5 flex-shrink-0" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Comparison Table */}
      <div className="rounded-2xl border border-zinc-800/80 overflow-hidden backdrop-blur-xl bg-zinc-900/40 shadow-2xl shadow-black/50">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-zinc-800/80">
                <th className="sticky left-0 z-10 bg-zinc-950/95 backdrop-blur-xl px-4 py-3 text-left text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] w-36 min-w-[144px]">Spec</th>
                {phones.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-center min-w-[140px] bg-zinc-900/20">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-xs font-bold text-zinc-100 tracking-tight truncate max-w-[120px]">{p.name}</span>
                      <button onClick={() => onRemove(p.id)} className="text-zinc-500 hover:text-rose-400 transition-colors"><X size={11} /></button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const vals = phones.map((p) => row.getValue(p));
                const best = row.higherBetter ? Math.max(...vals) : Math.min(...vals);
                
                return (
                  <tr key={row.key} className="border-b border-zinc-800/40 hover:bg-zinc-800/30 transition-colors">
                    <td className="sticky left-0 z-10 bg-zinc-950/95 backdrop-blur-xl px-4 py-3 text-[11px] font-semibold text-zinc-400 tracking-wide border-r border-zinc-800/50">{row.label}</td>
                    {phones.map((p, idx) => {
                      const v = vals[idx];
                      const isWin = v === best && phones.length > 1;
                      const display = row.fmt ? row.fmt(v) : v.toString();
                      
                      return (
                        <td key={p.id} className={`px-4 py-2.5 text-center text-sm font-bold font-mono transition-all duration-200 ${isWin ? "text-violet-400 border border-violet-500/30 bg-violet-500/10 rounded-lg" : "text-zinc-300"}`}>
                          {display}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Rankings List */}
      {phones.length > 1 && (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            Category Rankings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gaming & Performance */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl transition-all hover:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-rose-400 mb-3">
                <Zap size={16} /> <span className="font-bold text-[10px] uppercase tracking-widest">Best for Gaming & Performance</span>
              </div>
              <p className="text-zinc-100 font-extrabold text-xl tracking-tight">{gamingWinner.name}</p>
              <p className="text-zinc-400 text-xs mt-1">Powered by <strong className="text-zinc-300">{gamingWinner.cpu_name}</strong></p>
              <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-3">
                <span>Source: AnTuTu / Geekbench 6</span>
                <span className="bg-rose-500/10 text-rose-300 px-2 py-1 rounded">Score: {gamingWinner.raw_cpu_score.toFixed(1)}/10</span>
              </div>
            </div>

            {/* Camera */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl transition-all hover:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <Camera size={16} /> <span className="font-bold text-[10px] uppercase tracking-widest">Best for Photography</span>
              </div>
              <p className="text-zinc-100 font-extrabold text-xl tracking-tight">{cameraWinner.name}</p>
              <p className="text-zinc-400 text-xs mt-1">Hardware capability normalized</p>
              <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-3">
                <span>Source: DXOMARK / DPReview Standards</span>
                <span className="bg-amber-500/10 text-amber-300 px-2 py-1 rounded">Score: {cameraWinner.main_camera_score.toFixed(1)}/10</span>
              </div>
            </div>
            
            {/* Durability */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl transition-all hover:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-blue-400 mb-3">
                <Shield size={16} /> <span className="font-bold text-[10px] uppercase tracking-widest">Long-Term Reliability</span>
              </div>
              <p className="text-zinc-100 font-extrabold text-xl tracking-tight">{durabilityWinner.name}</p>
              <p className="text-zinc-400 text-xs mt-1">{durabilityWinner.os_updates_years} Years OS Updates + Build Quality</p>
              <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-3">
                <span>Source: JerryRigEverything / OEM Policies</span>
                <span className="bg-blue-500/10 text-blue-300 px-2 py-1 rounded">Score: {durabilityWinner.build_quality_score.toFixed(1)}/10</span>
              </div>
            </div>

            {/* VFM */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/60 p-5 backdrop-blur-md shadow-xl transition-all hover:bg-zinc-800/50">
              <div className="flex items-center gap-2 text-emerald-400 mb-3">
                <Star size={16} /> <span className="font-bold text-[10px] uppercase tracking-widest">Value For Money</span>
              </div>
              <p className="text-zinc-100 font-extrabold text-xl tracking-tight">{vfmWinner.name}</p>
              <p className="text-zinc-400 text-xs mt-1">Best specification-to-price ratio</p>
              <div className="mt-4 flex items-center justify-between text-[10px] font-mono text-zinc-500 border-t border-zinc-800/80 pt-3">
                <span>Source: Market Aggregation (Smartprix)</span>
                <span className="bg-emerald-500/10 text-emerald-300 px-2 py-1 rounded">Score: {vfmWinner.ratings.vfm.toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

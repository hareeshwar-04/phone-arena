import { Trophy, ChevronRight, X } from "lucide-react";
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

  return (
    <div className="space-y-4">
      {verdicts.length > 0 && (
        <div className="rounded-2xl bg-gradient-to-r from-cyan-500/5 via-emerald-500/5 to-cyan-500/5 border border-cyan-500/15 backdrop-blur-xl p-5 shadow-2xl shadow-cyan-900/10">
          <h3 className="text-xs font-bold uppercase tracking-[0.2em] bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent mb-3 flex items-center gap-2">
            <Trophy size={14} className="text-cyan-400" /> AI Verdict
          </h3>
          <ul className="space-y-2">
            {verdicts.map((v, i) => (
              <li key={i} className="text-sm text-slate-300 leading-relaxed flex items-start gap-2">
                <ChevronRight size={13} className="text-cyan-400/60 mt-0.5 flex-shrink-0" />
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      <div className="rounded-2xl border border-slate-800/50 overflow-hidden backdrop-blur-xl bg-slate-900/20 shadow-2xl shadow-cyan-900/5">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-slate-800/60">
                <th className="sticky left-0 z-10 bg-slate-950/95 backdrop-blur-xl px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] w-36 min-w-[144px]">Spec</th>
                {phones.map((p) => (
                  <th key={p.id} className="px-4 py-3 text-center min-w-[140px]">
                    <div className="flex flex-col items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-200 tracking-tight truncate max-w-[120px]">{p.name}</span>
                      <button onClick={() => onRemove(p.id)} className="text-slate-600 hover:text-red-400 transition-colors"><X size={11} /></button>
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
                  <tr key={row.key} className="border-b border-slate-800/30 hover:bg-slate-800/10 transition-colors">
                    <td className="sticky left-0 z-10 bg-slate-950/95 backdrop-blur-xl px-4 py-2.5 text-[11px] font-semibold text-slate-400 tracking-wide">{row.label}</td>
                    {phones.map((p, idx) => {
                      const v = vals[idx];
                      const isWin = v === best && phones.length > 1;
                      const display = row.fmt ? row.fmt(v) : v.toString();
                      return (
                        <td key={p.id} className={`px-4 py-2.5 text-center text-sm font-bold font-mono transition-all duration-200 ${isWin ? "text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 rounded-lg" : "text-slate-300"}`}>
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
    </div>
  );
}

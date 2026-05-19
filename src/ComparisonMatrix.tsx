import { useState } from "react";
import { X, Zap, Camera, Shield, Star, BookOpen, Smartphone } from "lucide-react";
import type { PhoneWithRatings } from "./types";
import { formatINR } from "./types";
import { useVerdict } from "./hooks";

export function ComparisonMatrix({ phones, onRemove }: { phones: PhoneWithRatings[]; onRemove: (id: string) => void }) {
  const [variants, setVariants] = useState<Record<string, number>>({});

  const virtualPhones = phones.map(p => {
    const v = variants[p.id] || 0;
    if (v === 0) return p;
    
    // Hardware upgrades: v=1 is +128GB, v=2 is +384GB
    let addedPrice = v === 1 ? 4000 : 9000;
    if (p.price_inr > 60000) addedPrice = v === 1 ? 10000 : 20000; // Premium brand tax
    
    let newStorage = p.storage_type;
    
    if (v === 1) {
      newStorage = `${newStorage.split('/')[0].trim()} / 256GB`;
    } else if (v === 2) {
      // 512GB variants often force UFS 4.0 if the base was 3.1
      if (newStorage.includes("3.1")) newStorage = "UFS 4.0 / 512GB";
      else newStorage = `${newStorage.split('/')[0].trim()} / 512GB`;
    }
    
    // VFM naturally decreases as you pay more for just storage
    const vfmPenalty = (addedPrice / p.price_inr) * 10; 
    const newVfm = Math.max(4.0, p.ratings.vfm - vfmPenalty);

    return { 
      ...p, 
      price_inr: p.price_inr + addedPrice, 
      storage_type: newStorage,
      ratings: { ...p.ratings, vfm: newVfm }
    };
  });

  const verdicts = useVerdict(virtualPhones);

  const rows: { label: string; key: string; getValue: (p: PhoneWithRatings) => number | string; fmt?: (v: any) => string; higherBetter?: boolean }[] = [
    { label: "Price", key: "price", getValue: (p) => p.price_inr, fmt: formatINR, higherBetter: false },
    { label: "CPU Name", key: "cpu_name", getValue: (p) => p.cpu_name },
    { label: "AnTuTu Score", key: "antutu", getValue: (p) => p.antutu_score, fmt: (v) => v.toLocaleString(), higherBetter: true },
    { label: "RAM Type", key: "ram", getValue: (p) => p.ram_type },
    { label: "Storage", key: "storage", getValue: (p) => p.storage_type },

    { label: "Refresh Rate", key: "ref", getValue: (p) => p.display_refresh_hz, fmt: (v) => `${v}Hz`, higherBetter: true },
    { label: "Battery", key: "bat", getValue: (p) => p.battery_mah, fmt: (v) => `${v} mAh`, higherBetter: true },
    { label: "Charging", key: "chg", getValue: (p) => p.charging_w, fmt: (v) => `${v}W`, higherBetter: true },
    { label: "Main Camera", key: "cam", getValue: (p) => p.main_camera_score, fmt: (v) => `${Number(v).toFixed(1)}/10`, higherBetter: true },
    { label: "Selfie Camera", key: "sel", getValue: (p) => p.front_camera_score, fmt: (v) => `${Number(v).toFixed(1)}/10`, higherBetter: true },
    { label: "Build Quality", key: "bld", getValue: (p) => p.build_quality_score, fmt: (v) => `${Number(v).toFixed(1)}/10`, higherBetter: true },
    { label: "OS Updates", key: "upd", getValue: (p) => p.os_updates_years, fmt: (v) => `${v} yrs`, higherBetter: true },
    { label: "Performance Score", key: "g", getValue: (p) => p.ratings.performance, fmt: (v) => Number(v).toFixed(1), higherBetter: true },
    { label: "Reliability", key: "d", getValue: (p) => p.ratings.reliability, fmt: (v) => Number(v).toFixed(1), higherBetter: true },
    { label: "Camera Score", key: "c", getValue: (p) => p.ratings.camera, fmt: (v) => Number(v).toFixed(1), higherBetter: true },
    { label: "OS Rating", key: "os", getValue: (p) => p.ratings.os, fmt: (v) => Number(v).toFixed(1), higherBetter: true },
    { label: "Value Score", key: "v", getValue: (p) => p.ratings.vfm, fmt: (v) => Number(v).toFixed(1), higherBetter: true },
  ];

  if (virtualPhones.length === 0) return null;

  // Calculate Winners
  const performanceWinner = virtualPhones.reduce((prev, curr) => (prev.ratings.performance > curr.ratings.performance) ? prev : curr);
  const cameraWinner = virtualPhones.reduce((prev, curr) => (prev.ratings.camera > curr.ratings.camera) ? prev : curr);
  const reliabilityWinner = virtualPhones.reduce((prev, curr) => (prev.ratings.reliability > curr.ratings.reliability) ? prev : curr);
  const osWinner = virtualPhones.reduce((prev, curr) => (prev.ratings.os > curr.ratings.os) ? prev : curr);
  const vfmWinner = virtualPhones.reduce((prev, curr) => (prev.ratings.vfm > curr.ratings.vfm) ? prev : curr);

  return (
    <div className="space-y-8">
      {verdicts.length > 0 && (
        <div className="rounded bg-blue-50 border border-blue-200 p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-blue-800 mb-3 flex items-center gap-2">
            <BookOpen size={16} /> Editorial Verdict
          </h3>
          <ul className="space-y-2">
            {verdicts.map((v, i) => (
              <li key={i} className="text-sm text-blue-900 font-medium flex items-start gap-2">
                <span className="text-blue-500 font-bold mr-1">•</span>
                <span>{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Comparison Table */}
      <div className="rounded border border-neutral-200 overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto hide-scrollbar">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="sticky left-0 z-10 bg-neutral-50 px-2 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider w-24 min-w-[96px] sm:w-40 sm:min-w-[160px] border-r border-neutral-200">Specification</th>
                {virtualPhones.map((p) => (
                  <th key={p.id} className="px-2 sm:px-4 py-3 sm:py-4 text-center min-w-[120px] sm:min-w-[160px]">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-sm font-bold text-neutral-900 tracking-tight">{p.name}</span>
                      <select 
                        value={variants[p.id] || 0}
                        onChange={(e) => setVariants({...variants, [p.id]: Number(e.target.value)})}
                        className="text-[10px] font-bold p-1 rounded border border-neutral-200 bg-neutral-50 text-neutral-700 outline-none w-full cursor-pointer hover:bg-neutral-100 transition-colors"
                      >
                        <option value={0}>Base Variant</option>
                        <option value={1}>256GB Upgrade</option>
                        <option value={2}>512GB Upgrade</option>
                      </select>
                      <button onClick={() => onRemove(p.id)} className="text-neutral-400 hover:text-red-500 transition-colors bg-white border border-neutral-200 rounded px-2 py-1 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1"><X size={10} /> Remove</button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const vals = virtualPhones.map((p) => row.getValue(p));
                const best = row.higherBetter ? Math.max(...(vals as number[])) : Math.min(...(vals as number[]));
                
                return (
                  <tr key={row.key} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-neutral-600 border-r border-neutral-200">{row.label}</td>
                    {virtualPhones.map((p, idx) => {
                      const v = vals[idx];
                      const isWin = v === best && virtualPhones.length > 1;
                      const display = row.fmt ? row.fmt(v) : v.toString();
                      
                      return (
                        <td key={p.id} className={`px-2 sm:px-4 py-2 sm:py-3 text-center text-xs sm:text-sm font-medium transition-colors ${isWin ? "text-blue-700 bg-blue-50/50" : "text-neutral-700"}`}>
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
        <div>
          <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider mb-4 border-b border-neutral-200 pb-2">
            Category Rankings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gaming & Performance */}
            <div className="rounded border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow">
               <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <Zap size={16} /> <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">Best for Performance</span>
              </div>
              <p className="text-neutral-900 font-extrabold text-lg">{performanceWinner.name}</p>
              <p className="text-neutral-500 text-xs mt-1">Powered by <strong className="text-neutral-700">{performanceWinner.cpu_name}</strong></p>
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold text-neutral-400 border-t border-neutral-100 pt-3">
                <span>Source: AnTuTu / Geekbench</span>
                <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded">Score: {performanceWinner.ratings.performance.toFixed(1)}/10</span>
              </div>
            </div>

            {/* Camera */}
            <div className="rounded border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <Camera size={16} /> <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">Best for Photography</span>
              </div>
              <p className="text-neutral-900 font-extrabold text-lg">{cameraWinner.name}</p>
              <p className="text-neutral-500 text-xs mt-1">Highest hardware capability</p>
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold text-neutral-400 border-t border-neutral-100 pt-3">
                <span>Source: DXOMARK Standards</span>
                <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded">Score: {cameraWinner.ratings.camera.toFixed(1)}/10</span>
              </div>
            </div>
            
            {/* Durability */}
            <div className="rounded border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <Shield size={16} /> <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">Long-Term Reliability</span>
              </div>
              <p className="text-neutral-900 font-extrabold text-lg">{reliabilityWinner.name}</p>
              <p className="text-neutral-500 text-xs mt-1">{reliabilityWinner.os_updates_years} Years OS Updates + Top Build</p>
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold text-neutral-400 border-t border-neutral-100 pt-3">
                <span>Source: OEM Policies</span>
                <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded">Score: {reliabilityWinner.ratings.reliability.toFixed(1)}/10</span>
              </div>
            </div>

            {/* OS Experience */}
            <div className="rounded border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <Smartphone size={16} /> <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">Best OS Experience</span>
              </div>
              <p className="text-neutral-900 font-extrabold text-lg">{osWinner.name}</p>
              <p className="text-neutral-500 text-xs mt-1">Premium and bloat-free UI tier rating</p>
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold text-neutral-400 border-t border-neutral-100 pt-3">
                <span>Source: OS Curation Matrix</span>
                <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded">Score: {osWinner.ratings.os.toFixed(1)}/10</span>
              </div>
            </div>

            {/* VFM */}
            <div className="rounded border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-2 text-neutral-500 mb-3">
                <Star size={16} /> <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">Value For Money</span>
              </div>
              <p className="text-neutral-900 font-extrabold text-lg">{vfmWinner.name}</p>
              <p className="text-neutral-500 text-xs mt-1">Best specification-to-price ratio</p>
              <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold text-neutral-400 border-t border-neutral-100 pt-3">
                <span>Source: Market Aggregation</span>
                <span className="bg-neutral-100 text-neutral-600 px-2 py-1 rounded">Score: {vfmWinner.ratings.vfm.toFixed(1)}/10</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

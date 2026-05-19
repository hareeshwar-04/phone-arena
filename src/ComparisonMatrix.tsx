import { useState } from "react";
import { X, Zap, Camera, Shield, Star, BookOpen, Smartphone, Trophy, Sparkles, Medal } from "lucide-react";
import type { PhoneWithRatings, WeightConfig } from "./types";
import { formatINR } from "./types";
import { useVerdict, getOSUpdatesStatus, calcMatchScore, getRamStorage, formatLaunchDate } from "./hooks";
import { PhoneImage } from "./PhoneImage";

function getVariantConfig(p: PhoneWithRatings, v: number) {
  const base = getRamStorage(p.name);
  const baseRam = base.ram || 8;
  const baseStorage = base.storage || 128;
  
  let targetRam = baseRam;
  let targetStorage = baseStorage;
  let addedPrice = 0;
  
  if (v === 1) {
    if (baseStorage === 64) {
      targetStorage = 128;
      targetRam = baseRam === 4 ? 6 : baseRam;
      addedPrice = 2000;
    } else if (baseStorage === 128) {
      targetStorage = 256;
      targetRam = baseRam === 6 ? 8 : baseRam;
      addedPrice = p.price_inr > 60000 ? 10000 : 4000;
    } else if (baseStorage === 256) {
      targetStorage = 512;
      targetRam = baseRam === 8 ? 12 : baseRam;
      addedPrice = p.price_inr > 60000 ? 20000 : 9000;
    } else if (baseStorage === 512) {
      targetStorage = 1024;
      targetRam = baseRam === 12 ? 16 : baseRam;
      addedPrice = p.price_inr > 60000 ? 30000 : 15000;
    }
  } else if (v === 2) {
    if (baseStorage === 64) {
      targetStorage = 256;
      targetRam = 8;
      addedPrice = 5000;
    } else if (baseStorage === 128) {
      targetStorage = 512;
      targetRam = baseRam <= 8 ? 12 : baseRam;
      addedPrice = p.price_inr > 60000 ? 20000 : 9000;
    } else if (baseStorage === 256) {
      targetStorage = 1024;
      targetRam = baseRam <= 12 ? 16 : baseRam;
      addedPrice = p.price_inr > 60000 ? 40000 : 18000;
    } else if (baseStorage === 512) {
      targetStorage = 1024;
      targetRam = 16;
      addedPrice = p.price_inr > 60000 ? 30000 : 15000;
    }
  }
  return { targetRam, targetStorage, addedPrice };
}

function calculateUpgradeVerdict(phoneA: PhoneWithRatings, phoneB: PhoneWithRatings) {
  let current = phoneA;
  let target = phoneB;
  
  if (phoneA.launch_date.localeCompare(phoneB.launch_date) > 0) {
    current = phoneB;
    target = phoneA;
  } else if (phoneA.launch_date === phoneB.launch_date && phoneA.price_inr > phoneB.price_inr) {
    current = phoneB;
    target = phoneA;
  }
  
  const perfDelta = target.ratings.performance - current.ratings.performance;
  const camDelta = target.ratings.camera - current.ratings.camera;
  const relDelta = target.ratings.reliability - current.ratings.reliability;
  const osDelta = target.ratings.os - current.ratings.os;
  
  const scoreDiff = (perfDelta * 0.4) + (camDelta * 0.3) + (relDelta * 0.15) + (osDelta * 0.15);
  const upgradePercent = Math.min(100, Math.max(0, Math.round(scoreDiff * 25)));
  
  let verdictTitle = "";
  let verdictDesc = "";
  let badgeColor = "";
  let textColor = "";
  let ringColor = "";
  
  if (upgradePercent < 25) {
    verdictTitle = "Skip Upgrade (Not Recommended)";
    verdictDesc = `Upgrading from the ${current.name} to the ${target.name} yields a minor ${upgradePercent}% improvement. The differences are minimal in daily usage. Save your money or skip this generation.`;
    badgeColor = "bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50";
    textColor = "text-red-650 dark:text-red-450";
    ringColor = "ring-red-100 dark:ring-red-900/20";
  } else if (upgradePercent < 55) {
    verdictTitle = "Incremental Upgrade (Optional)";
    verdictDesc = `Upgrading to the ${target.name} offers a moderate ${upgradePercent}% boost. You will see decent improvements in camera details and battery efficiency, but everyday speed will feel similar. Only upgrade if you need these specific features.`;
    badgeColor = "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
    textColor = "text-amber-600 dark:text-amber-450";
    ringColor = "ring-amber-100 dark:ring-amber-900/20";
  } else {
    verdictTitle = "Strong Upgrade (Highly Recommended)";
    verdictDesc = `Upgrading to the ${target.name} offers a massive ${upgradePercent}% leap. You will experience vastly superior performance, double the camera capabilities, longer software longevity, and faster charging. A very worthwhile switch!`;
    badgeColor = "bg-green-50 dark:bg-green-950/40 text-green-700 dark:text-green-400 border-green-200 dark:border-green-900/50";
    textColor = "text-green-600 dark:text-green-400";
    ringColor = "ring-green-100 dark:ring-green-900/20";
  }
  
  return { current, target, upgradePercent, verdictTitle, verdictDesc, badgeColor, textColor, ringColor, perfDelta, camDelta, osDelta };
}

function renderMedal(index: number, showText: boolean = false) {
  if (index === 0) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-amber-600 dark:text-amber-450">
        <Trophy size={11} className="text-amber-500 fill-amber-500/25" />
        {showText && <span>1st</span>}
      </span>
    );
  }
  if (index === 1) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-slate-500 dark:text-slate-400">
        <Medal size={11} className="text-slate-400 fill-slate-400/25" />
        {showText && <span>2nd</span>}
      </span>
    );
  }
  if (index === 2) {
    return (
      <span className="inline-flex items-center gap-1 font-bold text-amber-850 dark:text-amber-600">
        <Medal size={11} className="text-amber-700 fill-amber-700/25" />
        {showText && <span>3rd</span>}
      </span>
    );
  }
  return <span className="text-neutral-500 dark:text-neutral-400 font-bold text-[10px]">{index + 1}.</span>;
}

export function ComparisonMatrix({ phones, onRemove, weights }: { phones: PhoneWithRatings[]; onRemove: (id: string) => void; weights: WeightConfig }) {
  const [variants, setVariants] = useState<Record<string, number>>({});

  const virtualPhones = phones.map(p => {
    const v = variants[p.id] || 0;
    const { targetRam, targetStorage, addedPrice } = getVariantConfig(p, v);
    
    const displayStorage = targetStorage >= 1024 ? "1TB" : `${targetStorage}GB`;
    const newName = p.name.replace(/\(.*?\)/, `(${targetRam}GB/${displayStorage})`);
    
    const ufsVersion = p.storage_type.split('/')[0].trim();
    let finalUfs = ufsVersion;
    if (targetStorage >= 512 && ufsVersion.includes("3.1")) {
      finalUfs = "UFS 4.0";
    }
    const newStorage = `${finalUfs} / ${displayStorage}`;
    
    const vfmPenalty = (addedPrice / p.price_inr) * 10; 
    const newVfm = Math.max(4.0, p.ratings.vfm - vfmPenalty);

    return { 
      ...p, 
      name: newName,
      price_inr: p.price_inr + addedPrice, 
      storage_type: newStorage,
      ratings: { ...p.ratings, vfm: newVfm }
    };
  });

  const verdicts = useVerdict(virtualPhones);

  const rows: { label: string; key: string; getValue: (p: PhoneWithRatings) => any; fmt?: (v: any, p: PhoneWithRatings) => string; higherBetter?: boolean }[] = [
    { label: "Price", key: "price", getValue: (p) => p.price_inr, fmt: formatINR, higherBetter: false },
    { label: "CPU Name", key: "cpu_name", getValue: (p) => p.cpu_name },
    { label: "AnTuTu Score", key: "antutu", getValue: (p) => p.antutu_score, fmt: (v) => v.toLocaleString(), higherBetter: true },
    { label: "RAM Type", key: "ram", getValue: (p) => p.ram_type },
    { label: "Storage", key: "storage", getValue: (p) => p.storage_type },

    { label: "Refresh Rate", key: "ref", getValue: (p) => p.display_refresh_hz, fmt: (v) => `${v}Hz`, higherBetter: true },
    { label: "Battery", key: "bat", getValue: (p) => p.battery_mah, fmt: (v) => `${v} mAh`, higherBetter: true },
    { label: "Charging Speed", key: "chg", getValue: (p) => p.charging_w, fmt: (v) => `${v}W`, higherBetter: true },
    { label: "Est. Full Charge Time", key: "chg_time", getValue: (p) => p.charging_mins, fmt: (v) => `${v} mins`, higherBetter: false },
    { label: "Camera Rating", key: "cam", getValue: (p) => p.ratings.camera, fmt: (v) => `${Number(v).toFixed(1)}/10`, higherBetter: true },
    { label: "Build Quality", key: "bld", getValue: (p) => p.build_quality_score, fmt: (v) => `${Number(v).toFixed(1)}/10`, higherBetter: true },
    { label: "OS Updates", key: "upd", getValue: (p) => p.os_updates_years, fmt: (v) => `${v} yrs`, higherBetter: true },
    { label: "Launch Date", key: "launch", getValue: (p) => p.launch_date, fmt: (v) => formatLaunchDate(v as string) },
    { 
      label: "Updates Remaining", 
      key: "upd_left", 
      getValue: (p) => {
        const status = getOSUpdatesStatus(p.launch_date, p.os_updates_years);
        return status.message;
      }
    },
    { 
      label: "Software Cost of Ownership", 
      key: "cost_ownership", 
      getValue: (p) => {
        const status = getOSUpdatesStatus(p.launch_date, p.os_updates_years);
        const years = Math.max(0.5, status.yearsLeft);
        return p.price_inr / years;
      },
      fmt: (v) => `${formatINR(Math.round(v))} / yr`,
      higherBetter: false
    },
    { label: "Your Match Score", key: "match", getValue: (p) => calcMatchScore(p, weights), fmt: (v) => Number(v).toFixed(1), higherBetter: true },
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

  const rankedAllRounders = [...virtualPhones].map(p => {
    const avgScore = (p.ratings.performance + p.ratings.camera + p.ratings.reliability + p.ratings.os + p.ratings.vfm) / 5;
    return { phone: p, avgScore };
  }).sort((a, b) => b.avgScore - a.avgScore);

  const allRounderWinner = rankedAllRounders[0]?.phone;

  return (
    <div className="space-y-8">
      {virtualPhones.length === 2 && (() => {
        const u = calculateUpgradeVerdict(virtualPhones[0], virtualPhones[1]);
        return (
          <div className="bg-gradient-to-br from-neutral-50 to-neutral-100 dark:from-neutral-900 dark:to-neutral-950 p-6 rounded-2xl border border-neutral-250/60 dark:border-neutral-800 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200 dark:border-neutral-800">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">Upgrade Recommendation Engine</span>
                <h3 className="text-lg font-bold text-neutral-800 dark:text-neutral-100 mt-1">Upgrade Verdict</h3>
              </div>
              <div className={`px-4 py-2 rounded-xl border text-xs font-extrabold text-center ${u.badgeColor}`}>
                {u.verdictTitle}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* Radial Score Indicator */}
              <div className="flex flex-col items-center justify-center p-4 bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200/60 dark:border-neutral-800 shadow-inner">
                <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 ring-8 ${u.ringColor} border-blue-555/80`}>
                  <span className="text-3xl font-extrabold text-neutral-800 dark:text-neutral-150">{u.upgradePercent}%</span>
                  <span className="text-[9px] font-bold text-neutral-400 dark:text-neutral-500 uppercase tracking-widest mt-0.5">Upgrade Value</span>
                </div>
              </div>

              {/* Explanatory text */}
              <div className="md:col-span-2 space-y-4">
                <p className="text-sm font-semibold text-neutral-700 dark:text-neutral-300 leading-relaxed">
                  {u.verdictDesc}
                </p>
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">Performance</span>
                    <span className={`text-sm font-black ${u.perfDelta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                      {u.perfDelta >= 0 ? "+" : ""}{u.perfDelta.toFixed(1)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">Camera</span>
                    <span className={`text-sm font-black ${u.camDelta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                      {u.camDelta >= 0 ? "+" : ""}{u.camDelta.toFixed(1)}
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-white dark:bg-neutral-900 border border-neutral-200/60 dark:border-neutral-800 text-center">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 dark:text-neutral-500 block mb-1">OS Support</span>
                    <span className={`text-sm font-black ${u.osDelta >= 0 ? "text-green-600 dark:text-green-400" : "text-red-500"}`}>
                      {u.osDelta >= 0 ? "+" : ""}{u.osDelta.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

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
              <tr className="border-b border-neutral-200 bg-neutral-50/75">
                <th className="sticky left-0 z-10 bg-neutral-50 px-2 sm:px-4 py-3 text-left text-[10px] sm:text-xs font-bold text-neutral-500 uppercase tracking-wider w-24 min-w-[96px] sm:w-40 sm:min-w-[160px] border-r border-neutral-200">Specification</th>
                {virtualPhones.map((p) => {
                  const originalPhone = phones.find(orig => orig.id === p.id) || p;
                  return (
                    <th key={p.id} className="px-2 sm:px-4 py-4 sm:py-6 text-center min-w-[140px] sm:min-w-[180px] border-r border-neutral-200 last:border-r-0">
                      <div className="flex flex-col items-center gap-2">
                        {/* Close Button at top corner */}
                        <button 
                          onClick={() => onRemove(p.id)} 
                          className="self-end text-neutral-400 hover:text-red-500 transition-colors p-1 bg-white border border-neutral-200 rounded-full hover:shadow-sm"
                          title="Remove from comparison"
                        >
                          <X size={10} />
                        </button>

                        {/* Device Image */}
                        <div className="w-20 h-24 image-container-bg flex items-center justify-center rounded-xl p-1.5 border border-neutral-200/60 shadow-sm mb-1.5 relative overflow-hidden">
                          <PhoneImage 
                            imageUrl={p.image_url} 
                            name={p.name} 
                            brand={p.brand} 
                            className="max-w-full max-h-full object-contain hover:scale-105 transition-transform duration-300"
                            iconSize={22}
                          />
                        </div>

                        {/* Device Name */}
                        <span className="text-xs sm:text-sm font-black text-neutral-900 tracking-tight leading-snug line-clamp-2 h-9 flex items-center justify-center text-center px-1" title={p.name}>
                          {p.name}
                        </span>

                        {/* Variant Segmented Pills */}
                        <div className="flex flex-col sm:flex-row items-center gap-0.5 bg-neutral-100 dark:bg-neutral-800 rounded-lg p-0.5 border border-neutral-200/80 w-full mt-1">
                          {[0, 1, 2].map((val) => {
                            const { targetRam, targetStorage } = getVariantConfig(originalPhone, val);
                            const displayStorage = targetStorage >= 1024 ? "1TB" : `${targetStorage}GB`;
                            const label = `${targetRam}GB/${displayStorage}`;
                            const isSel = (variants[p.id] || 0) === val;
                            return (
                              <button
                                key={val}
                                onClick={() => setVariants({ ...variants, [p.id]: val })}
                                className={`flex-1 w-full text-[8px] sm:text-[9px] font-black py-1 rounded transition-all leading-none ${
                                  isSel
                                    ? "bg-blue-600 text-white shadow-sm font-black"
                                    : "text-neutral-555 hover:text-neutral-855 dark:text-neutral-400 dark:hover:text-neutral-200"
                                }`}
                              >
                                {label}
                              </button>
                            );
                          })}
                        </div>

                        {/* Buying links */}
                        <div className="flex gap-1.5 w-full mt-1.5">
                          <a 
                            href={`https://www.amazon.in/s?k=${encodeURIComponent(p.name)}&tag=phonearena04-21`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 py-1 rounded bg-orange-50 hover:bg-orange-100 border border-orange-200/50 text-[8px] sm:text-[9px] font-bold text-orange-700 transition-colors uppercase tracking-wider flex items-center justify-center gap-0.5"
                            title="Buy on Amazon"
                          >
                            Amazon
                          </a>
                          <a 
                            href={`https://www.flipkart.com/search?q=${encodeURIComponent(p.name)}&affid=phonearena04`} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="flex-1 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-200/50 text-[8px] sm:text-[9px] font-bold text-blue-700 transition-colors uppercase tracking-wider flex items-center justify-center gap-0.5"
                            title="Buy on Flipkart"
                          >
                            Flipkart
                          </a>
                        </div>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const vals = virtualPhones.map((p) => row.getValue(p));
                const isNumeric = vals.every(v => typeof v === 'number');
                const best = (row.higherBetter !== undefined && isNumeric)
                  ? (row.higherBetter ? Math.max(...(vals as number[])) : Math.min(...(vals as number[])))
                  : null;
                
                return (
                  <tr key={row.key} className="border-b border-neutral-100 hover:bg-neutral-50/50 transition-colors">
                    <td className="sticky left-0 z-10 bg-white px-2 sm:px-4 py-2 sm:py-3 text-[10px] sm:text-xs font-semibold text-neutral-600 border-r border-neutral-200">{row.label}</td>
                    {virtualPhones.map((p, idx) => {
                      const v = vals[idx];
                      const isWin = best !== null && v === best && virtualPhones.length > 1;
                      const display = row.fmt ? row.fmt(v, p) : v.toString();
                      
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
            Category Rankings & Verdict
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Overall All-Rounder */}
            <div className="col-span-1 md:col-span-2 rounded-xl border-2 border-amber-300 bg-amber-50/20 p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-amber-500 text-white font-extrabold text-[10px] uppercase px-3 py-1 rounded-bl-lg tracking-wider flex items-center gap-1">
                <Trophy size={12} /> Gold Standard
              </div>
              <div className="flex items-center gap-2 text-amber-600 mb-3">
                <Sparkles size={18} /> <span className="font-extrabold text-xs uppercase tracking-wider text-amber-800">Overall All-Rounder</span>
              </div>
              <p className="text-neutral-900 font-black text-xl sm:text-2xl">{allRounderWinner.name}</p>
              <p className="text-neutral-600 text-xs sm:text-sm mt-1">The most balanced smartphone choice across performance, camera, reliability, OS experience, and value.</p>
              
              {rankedAllRounders.length > 1 && (
                <div className="mt-4 pt-3 border-t border-amber-200/60">
                  <span className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block mb-2">Overall Rankings</span>
                  <div className="space-y-1.5">
                    {rankedAllRounders.slice(0, 3).map((item, index) => {
                      const badgeBg = index === 0 ? "bg-amber-100 text-amber-900 border-amber-200" : index === 1 ? "bg-slate-100 text-slate-800 border-slate-200" : "bg-orange-50 text-orange-850 border-orange-100";
                      return (
                        <div key={item.phone.id} className="flex items-center justify-between bg-white/60 hover:bg-white/90 border border-neutral-100 rounded-lg p-2 transition-colors">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase tracking-wider ${badgeBg} flex items-center gap-1`}>
                              {renderMedal(index, true)}
                            </span>
                            <span className="text-xs font-bold text-neutral-800">{item.phone.name}</span>
                          </div>
                          <span className="text-xs font-bold text-neutral-600">{item.avgScore.toFixed(1)}/10</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="mt-4 flex items-center justify-between text-[10px] uppercase font-bold text-neutral-500 border-t border-amber-100 pt-3">
                <span>Calculated overall spec balance</span>
                <span className="bg-amber-100 text-amber-800 px-2 py-1 rounded">Avg Score: {((allRounderWinner.ratings.performance + allRounderWinner.ratings.camera + allRounderWinner.ratings.reliability + allRounderWinner.ratings.os + allRounderWinner.ratings.vfm) / 5).toFixed(1)}/10</span>
              </div>
            </div>
            {/* Category Cards */}
            {[
              {
                id: "perf",
                title: "Gaming & Performance",
                icon: <Zap size={16} />,
                source: "AnTuTu / Geekbench",
                key: (p: PhoneWithRatings) => p.ratings.performance,
                getLabel: (p: PhoneWithRatings) => ({
                  bold: p.cpu_name,
                  normal: p.name
                })
              },
              {
                id: "cam",
                title: "Photography & Video",
                icon: <Camera size={16} />,
                source: "DXOMARK Standards",
                key: (p: PhoneWithRatings) => p.ratings.camera,
                getLabel: undefined
              },
              {
                id: "rel",
                title: "Long-Term Reliability",
                icon: <Shield size={16} />,
                source: "OEM Policies",
                key: (p: PhoneWithRatings) => p.ratings.reliability,
                getLabel: undefined
              },
              {
                id: "os",
                title: "OS Experience",
                icon: <Smartphone size={16} />,
                source: "OS Curation Matrix",
                key: (p: PhoneWithRatings) => p.ratings.os,
                getLabel: (p: PhoneWithRatings) => {
                  const isApple = p.brand.toLowerCase() === "apple";
                  const n = p.name.toLowerCase();
                  let osVer = isApple ? "iOS 19" : "Android 15";
                  if (n.includes("s24") || n.includes("pixel 8") || n.includes("12")) {
                    osVer = isApple ? "iOS 18" : "Android 14";
                  } else if (n.includes("s25") || n.includes("pixel 9") || n.includes("13") || n.includes("15")) {
                    osVer = isApple ? "iOS 19" : "Android 15";
                  } else if (n.includes("s26") || n.includes("pixel 10") || n.includes("14")) {
                    osVer = isApple ? "iOS 20" : "Android 16";
                  }
                  return {
                    bold: osVer,
                    normal: p.name
                  };
                }
              },
              {
                id: "vfm",
                title: "Value For Money",
                icon: <Star size={16} />,
                source: "Market Aggregation",
                key: (p: PhoneWithRatings) => p.ratings.vfm,
                getLabel: undefined
              }
            ].map(cat => {
              const ranked = [...virtualPhones].sort((a, b) => cat.key(b) - cat.key(a));
              return (
                <div key={cat.id} className="rounded border border-neutral-200 bg-white p-5 hover:shadow-md transition-shadow flex flex-col h-full">
                  <div className="flex items-center gap-2 text-neutral-500 mb-3">
                    {cat.icon} <span className="font-bold text-xs uppercase tracking-wider text-neutral-700">{cat.title}</span>
                  </div>
                  
                  {/* Detailed Ranking List */}
                  <div className="flex-1 space-y-2 mt-2">
                    {ranked.map((p, index) => {
                      const isWinner = index === 0;

                      let labelNode: React.ReactNode;
                      let tooltipText = p.name;
                      if (cat.getLabel) {
                        const { bold, normal } = cat.getLabel(p);
                        tooltipText = `${bold} (${normal})`;
                        labelNode = (
                          <span className="text-[11px] truncate" title={tooltipText}>
                            <strong className={`${isWinner ? 'font-extrabold text-blue-900' : 'font-bold text-neutral-800'}`}>{bold}</strong>{" "}
                            <span className="font-normal text-neutral-500">({normal})</span>
                          </span>
                        );
                      } else {
                        labelNode = (
                          <span className={`text-[11px] truncate ${isWinner ? 'font-extrabold text-blue-900' : 'font-semibold text-neutral-700'}`} title={p.name}>
                            {p.name}
                          </span>
                        );
                      }

                      return (
                        <div key={p.id} className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors ${isWinner ? 'bg-blue-50/60 border-blue-200 shadow-sm' : 'bg-neutral-50/50 border-neutral-100 hover:bg-neutral-50'}`}>
                          <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
                            <span className="text-[11px] w-5 text-center flex-shrink-0 flex items-center justify-center">{renderMedal(index)}</span>
                            {labelNode}
                          </div>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${isWinner ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-neutral-600 border border-neutral-200 shadow-sm'}`}>{cat.key(p).toFixed(1)}/10</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  <div className="mt-5 flex items-center justify-between text-[9px] uppercase font-bold text-neutral-400 border-t border-neutral-100 pt-3">
                    <span>Source: {cat.source}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

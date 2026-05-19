import { useState } from "react";
import { Zap, Shield, Camera, Star, Cpu, Battery, AlertTriangle, Plus, X, Monitor, ShoppingCart, Smartphone, Calendar, Clock } from "lucide-react";
import type { PhoneWithRatings, WeightConfig } from "./types";
import { formatINR } from "./types";
import { getOSUpdatesStatus } from "./hooks";

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-20 rounded-xl bg-neutral-100" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-12 bg-neutral-100 rounded" />
          <div className="h-4 w-28 bg-neutral-100 rounded" />
          <div className="h-4 w-16 bg-neutral-100 rounded" />
        </div>
      </div>
      <div className="space-y-2.5">
        <div className="h-3 bg-neutral-100 rounded w-full" />
        <div className="h-3 bg-neutral-100 rounded w-5/6" />
        <div className="h-3 bg-neutral-100 rounded w-4/5" />
      </div>
    </div>
  );
}

export function PhoneCard({ phone, isCompared, onToggle, weights, onSelect, badges }: {
  phone: PhoneWithRatings; isCompared: boolean;
  onToggle: (id: string) => void; weights: WeightConfig;
  onSelect?: () => void;
  badges?: string[];
}) {
  const [showBuyOptions, setShowBuyOptions] = useState(false);
  const total = 
    (weights.performanceEnabled ? weights.performance : 0) +
    (weights.reliabilityEnabled ? weights.reliability : 0) +
    (weights.cameraEnabled ? weights.camera : 0) +
    (weights.osEnabled ? weights.os : 0) || 1;
    
  const customScore = Math.round(((
    (weights.performanceEnabled ? phone.ratings.performance * weights.performance : 0) +
    (weights.reliabilityEnabled ? phone.ratings.reliability * weights.reliability : 0) +
    (weights.cameraEnabled ? phone.ratings.camera * weights.camera : 0) +
    (weights.osEnabled ? phone.ratings.os * weights.os : 0)
  ) / total) * 10) / 10;
  const hasBloat = phone.raw_ui_score < 6.0;
  const osStatus = getOSUpdatesStatus(phone.launch_date, phone.os_updates_years);

  return (
    <div 
      className={`relative group rounded-2xl border bg-white transition-all duration-300 hover:shadow-[0_12px_30px_rgba(0,0,0,0.04)] animate-fade-in-up cursor-pointer flex flex-col justify-between overflow-hidden ${
        isCompared ? "border-neutral-900 ring-1 ring-neutral-900 shadow-sm" : "border-neutral-200/70"
      }`} 
      onClick={onSelect}
    >
      {/* Top Floating Tags */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center pointer-events-none z-10">
        <div className="flex gap-1.5">
          {badges && badges.slice(0, 1).map((badge) => (
            <span key={badge} className="px-2.5 py-0.5 rounded-full text-[9px] font-semibold uppercase tracking-wider bg-neutral-900 text-white shadow-sm">
              {badge}
            </span>
          ))}
          {/* Match Score Capsule */}
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 border border-blue-100">
            {customScore.toFixed(1)} Match
          </span>
        </div>

        {hasBloat && (
          <div className="pointer-events-auto group/bloat cursor-help">
            <div className="flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2 py-0.5 text-[9px] font-bold uppercase text-rose-600 shadow-sm">
              <AlertTriangle size={10} className="fill-rose-100" /> Bloat Alert
            </div>
            <div className="absolute right-0 top-6 w-52 rounded-xl bg-neutral-900 p-2.5 text-[10px] text-neutral-300 opacity-0 group-hover/bloat:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-relaxed">
              Software has pre-installed junk apps or advertisements.
            </div>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 flex flex-col justify-between">
        {/* Info Header */}
        <div className="flex items-start gap-4 mb-5 pt-4">
          <div className="w-16 h-20 bg-neutral-50 flex items-center justify-center flex-shrink-0 rounded-xl p-1.5 border border-neutral-100/80">
            <img 
              src={phone.image_url} 
              alt={phone.name} 
              className="max-w-full max-h-full object-contain mix-blend-multiply" 
              loading="lazy" 
            />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {phone.brand}
            </p>
            <h3 className="text-base font-bold text-neutral-800 tracking-tight leading-tight mt-1 truncate" title={phone.name}>
              {phone.name}
            </h3>
            <p className="text-lg font-black text-neutral-900 mt-1">{formatINR(phone.price_inr)}</p>
          </div>
        </div>

        {/* Clean Spec List */}
        <div className="space-y-2.5 text-xs text-neutral-500 mb-5 border-t border-neutral-100 pt-4">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Cpu size={12} className="text-neutral-400" /> {phone.cpu_name}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Monitor size={12} className="text-neutral-400" /> {phone.display_refresh_hz}Hz {phone.screen_type}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 font-medium">
              <Battery size={12} className="text-neutral-400" /> {phone.battery_mah} mAh
            </span>
          </div>
          
          {/* Estimated Charge Time */}
          <div className="flex items-center justify-between text-[11px] text-neutral-450 border-t border-neutral-100/50 pt-2.5">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[9px] text-neutral-400">
              <Clock size={11} /> Estimated Charge Time
            </span>
            <span className="font-extrabold text-neutral-700">{phone.charging_mins} mins</span>
          </div>
        </div>

        {/* Unified, Classy Spec Ratings (Slate/Indigo Colorway) */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 mb-5 border-t border-neutral-100 pt-4">
          {[
            { label: "Performance", value: phone.ratings.performance, icon: <Zap size={10} /> },
            { label: "Camera", value: phone.ratings.camera, icon: <Camera size={10} /> },
            { label: "Reliability", value: phone.ratings.reliability, icon: <Shield size={10} /> },
            { label: "OS Rating", value: phone.ratings.os, icon: <Smartphone size={10} /> },
            { label: "Value For Money", value: phone.ratings.vfm, icon: <Star size={10} />, isFullWidth: true },
          ].map((r) => {
            return (
              <div key={r.label} className={`flex flex-col gap-1 ${r.isFullWidth ? "col-span-2 mt-0.5" : ""}`}>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider text-neutral-400">
                  <span className="flex items-center gap-1">{r.icon} {r.label}</span>
                  <span className="text-neutral-700">{r.value.toFixed(1)}</span>
                </div>
                <div className="h-[3px] w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-neutral-800 transition-all duration-300" 
                    style={{ width: `${(r.value / 10) * 100}%` }} 
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* EOL / Longevity Flag */}
        <div className="mb-5">
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-bold leading-none ${
            osStatus.yearsLeft === 0 
              ? "bg-red-50 text-red-700 border-red-100" 
              : osStatus.yearsLeft <= 1.25 
                ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse" 
                : "bg-neutral-50 text-neutral-500 border-neutral-200/50"
          }`}>
            <Calendar size={11} className="text-neutral-400" />
            <span>
              {osStatus.yearsLeft === 0 
                ? "EOL: No future security updates left" 
                : osStatus.yearsLeft <= 1.25 
                  ? `Warning: Only ${osStatus.yearsLeft.toFixed(1)} yrs updates remaining!` 
                  : `${Math.ceil(osStatus.yearsLeft)} OS updates left (${phone.launch_date.split(" ")[1] || "Launched"})`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(phone.id); }} 
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 ${
              isCompared 
                ? "bg-neutral-900 text-white hover:bg-neutral-800" 
                : "bg-neutral-50 text-neutral-700 hover:bg-neutral-100 border border-neutral-200"
            }`}
          >
            {isCompared ? <><X size={11} /> Remove</> : <><Plus size={11} /> Compare</>}
          </button>
          
          {showBuyOptions ? (
            <div className="flex-1 flex gap-1 animate-fade-in">
              <a 
                href={`https://www.amazon.in/s?k=${encodeURIComponent(phone.name)}&tag=YOUR_AMAZON_AFFILIATE_ID_HERE`} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()} 
                className="flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200" 
                title="Buy on Amazon"
              >
                Amazon
              </a>
              <a 
                href={`https://www.flipkart.com/search?q=${encodeURIComponent(phone.name)}&affid=YOUR_FLIPKART_AFFILIATE_ID_HERE`} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()} 
                className="flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200" 
                title="Buy on Flipkart"
              >
                Flipkart
              </a>
            </div>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBuyOptions(true); }} 
              className="flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 bg-neutral-900 text-white hover:bg-neutral-800 shadow-sm"
            >
              <ShoppingCart size={13} /> Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Zap, Shield, Camera, Star, Cpu, Battery, AlertTriangle, Plus, X, Monitor, ShoppingCart, Smartphone, Calendar, Clock } from "lucide-react";
import type { PhoneWithRatings, WeightConfig } from "./types";
import { formatINR } from "./types";
import { getOSUpdatesStatus } from "./hooks";

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="w-16 h-20 rounded-xl bg-neutral-200" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-16 bg-neutral-200 rounded" />
          <div className="h-4 w-32 bg-neutral-200 rounded" />
          <div className="h-5 w-24 bg-neutral-200 rounded" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="h-12 bg-neutral-100 rounded-lg" />
        <div className="h-12 bg-neutral-100 rounded-lg" />
        <div className="h-12 bg-neutral-100 rounded-lg" />
        <div className="h-12 bg-neutral-100 rounded-lg" />
      </div>
      <div className="h-10 bg-neutral-200 rounded-xl" />
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
      className={`relative group rounded-2xl border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up cursor-pointer flex flex-col justify-between overflow-hidden ${
        isCompared ? "border-blue-500 ring-2 ring-blue-500/20 shadow-md" : "border-neutral-200"
      }`} 
      onClick={onSelect}
    >
      {/* Header Badges Overlay */}
      <div className="absolute top-3 left-3 right-3 flex justify-between items-start pointer-events-none z-10">
        <div className="flex flex-wrap gap-1">
          {badges && badges.slice(0, 2).map((badge) => (
            <span key={badge} className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
              {badge}
            </span>
          ))}
        </div>
        {hasBloat && (
          <div className="pointer-events-auto group/bloat cursor-help">
            <div className="flex items-center gap-1 rounded-full bg-rose-50 border border-rose-250 px-2 py-0.5 text-[9px] uppercase font-black text-rose-600 shadow-sm">
              <AlertTriangle size={10} className="fill-rose-100" /> Bloat Risk
            </div>
            <div className="absolute right-0 top-6 w-56 rounded-xl bg-neutral-900 p-2.5 text-[10px] text-neutral-300 opacity-0 group-hover/bloat:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-relaxed">
              Software experience includes heavy pre-installed junk apps or intrusive advertisements.
            </div>
          </div>
        )}
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between">
        {/* Phone Info Header */}
        <div className="flex items-start gap-4 mb-4 pt-4">
          <div className="w-16 h-20 bg-neutral-50 flex items-center justify-center flex-shrink-0 rounded-xl p-1 border border-neutral-100 group-hover:scale-105 transition-transform duration-300">
            <img 
              src={phone.image_url} 
              alt={phone.name} 
              className="max-w-full max-h-full object-contain mix-blend-multiply" 
              loading="lazy" 
            />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 flex items-center gap-1">
              <span>{phone.brand}</span>
              <span>•</span>
              <span className="text-neutral-500 font-medium normal-case">{phone.launch_date || "N/A"}</span>
            </p>
            <h3 className="text-sm font-black text-neutral-900 tracking-tight leading-tight mt-1 truncate" title={phone.name}>
              {phone.name}
            </h3>
            <p className="text-base font-black text-blue-600 mt-1">{formatINR(phone.price_inr)}</p>
          </div>
        </div>

        {/* 2x2 Grid of Key Technical Specs */}
        <div className="grid grid-cols-2 gap-2 mb-4">
          <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100/50 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
              <Cpu size={10} /> Processor
            </span>
            <span className="text-[11px] font-bold text-neutral-700 truncate mt-0.5">{phone.cpu_name}</span>
          </div>

          <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100/50 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
              <Monitor size={10} /> Display
            </span>
            <span className="text-[11px] font-bold text-neutral-700 truncate mt-0.5">{phone.display_refresh_hz}Hz {phone.screen_type.split(" ")[0]}</span>
          </div>

          <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100/50 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
              <Zap size={10} /> RAM & UFS
            </span>
            <span className="text-[11px] font-bold text-neutral-700 truncate mt-0.5">{phone.ram_type.split(" ")[0]} • {phone.storage_type.split(" ")[0]}</span>
          </div>

          <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-100/50 flex flex-col justify-center">
            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-wide flex items-center gap-1">
              <Battery size={10} /> Battery
            </span>
            <span className="text-[11px] font-bold text-neutral-700 truncate mt-0.5">{phone.battery_mah}mAh</span>
          </div>
        </div>

        {/* Estimated Charge Time Indicator */}
        <div className="bg-neutral-50/70 border border-neutral-150 rounded-xl p-2.5 mb-4 flex items-center justify-between text-xs">
          <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider flex items-center gap-1">
            <Clock size={12} className="text-neutral-400" /> Estimated Charge Time
          </span>
          <span className="font-extrabold text-neutral-700">{phone.charging_mins} mins</span>
        </div>

        {/* Dynamic Spec Ratings in 2 Columns */}
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 mb-4 border-t border-neutral-100 pt-3">
          {[
            { label: "Performance", value: phone.ratings.performance, icon: <Zap size={10} className="text-blue-500" /> },
            { label: "Camera", value: phone.ratings.camera, icon: <Camera size={10} className="text-pink-500" /> },
            { label: "Reliability", value: phone.ratings.reliability, icon: <Shield size={10} className="text-emerald-500" /> },
            { label: "OS Experience", value: phone.ratings.os, icon: <Smartphone size={10} className="text-indigo-500" /> },
            { label: "Value For Money", value: phone.ratings.vfm, icon: <Star size={10} className="text-amber-500 fill-amber-500" />, isFullWidth: true },
          ].map((r) => {
            const color = r.value >= 8.5 ? 'bg-emerald-500' : r.value >= 7.0 ? 'bg-amber-400' : 'bg-rose-450';
            const textColor = r.value >= 8.5 ? 'text-emerald-700' : r.value >= 7.0 ? 'text-amber-600' : 'text-rose-600';
            
            return (
              <div key={r.label} className={`flex flex-col gap-0.5 ${r.isFullWidth ? "col-span-2 mt-0.5" : ""}`}>
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-neutral-500">{r.icon} {r.label}</span>
                  <span className={textColor}>{r.value.toFixed(1)}</span>
                </div>
                <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${(r.value / 10) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* OS update alerts */}
        <div className="mb-4">
          <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-[10px] font-bold leading-none ${
            osStatus.yearsLeft === 0 
              ? "bg-red-50 text-red-700 border-red-100" 
              : osStatus.yearsLeft <= 1.25 
                ? "bg-amber-50 text-amber-700 border-amber-100 animate-pulse" 
                : "bg-emerald-50 text-emerald-700 border-emerald-100"
          }`}>
            <Calendar size={11} />
            <span>
              {osStatus.yearsLeft === 0 
                ? "EOL: No future security/OS updates left" 
                : osStatus.yearsLeft <= 1.25 
                  ? `Warning: Only ${osStatus.yearsLeft.toFixed(1)} years of updates left!` 
                  : `${Math.ceil(osStatus.yearsLeft)} OS updates remaining`}
            </span>
          </div>
        </div>

        {/* Match Score */}
        <div className="flex items-center justify-between rounded-xl bg-blue-50/50 border border-blue-100/50 px-3.5 py-2.5 mb-4">
          <span className="text-[10px] uppercase tracking-wider font-extrabold text-blue-800 flex items-center gap-1">
            🎯 Match Score
          </span>
          <span className="text-sm font-black text-blue-700">{customScore.toFixed(1)}/10</span>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(phone.id); }} 
            className={`flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 ${
              isCompared 
                ? "bg-red-50 text-red-650 hover:bg-red-100 border border-red-150" 
                : "bg-neutral-150 text-neutral-700 hover:bg-neutral-200 border border-neutral-200"
            }`}
          >
            {isCompared ? <><X size={11} /> Remove</> : <><Plus size={11} /> Compare</>}
          </button>
          
          {showBuyOptions ? (
            <div className="flex-1 flex gap-1">
              <a 
                href={`https://www.amazon.in/s?k=${encodeURIComponent(phone.name)}&tag=YOUR_AMAZON_AFFILIATE_ID_HERE`} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()} 
                className="flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/60 animate-fade-in" 
                title="Buy on Amazon"
              >
                Amazon
              </a>
              <a 
                href={`https://www.flipkart.com/search?q=${encodeURIComponent(phone.name)}&affid=YOUR_FLIPKART_AFFILIATE_ID_HERE`} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()} 
                className="flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 animate-fade-in" 
                title="Buy on Flipkart"
              >
                Flipkart
              </a>
            </div>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBuyOptions(true); }} 
              className="flex-1 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              <ShoppingCart size={13} /> Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

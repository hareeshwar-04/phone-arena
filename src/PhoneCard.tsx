import { useState } from "react";
import { Zap, Shield, Camera, Star, Cpu, Battery, AlertTriangle, Plus, X, Monitor, ExternalLink, ShoppingCart, Smartphone, Calendar } from "lucide-react";
import type { PhoneWithRatings, WeightConfig } from "./types";
import { formatINR } from "./types";
import { getOSUpdatesStatus } from "./hooks";

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
        {/* Recommendation Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {badges.map((badge) => (
              <span key={badge} className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-800">
                {badge}
              </span>
            ))}
          </div>
        )}
        <div className="flex items-start gap-4 mb-4 border-b border-neutral-100 pb-4">
          <div className="w-16 h-20 bg-neutral-50 flex items-center justify-center flex-shrink-0">
            <img src={phone.image_url} alt={phone.name} className="max-w-full max-h-full object-contain mix-blend-multiply" loading="lazy" />
          </div>
          <div className="flex-1 min-w-0 pt-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5">
              <span>{phone.brand}</span>
              <span className="text-neutral-300">•</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-normal uppercase ${
                phone.screen_type.includes("AMOLED") || phone.screen_type.includes("OLED")
                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                  : "bg-neutral-50 text-neutral-600 border border-neutral-200/60"
              }`}>{phone.screen_type}</span>
            </p>
            <h3 className="text-base font-bold text-neutral-900 tracking-tight leading-tight mt-0.5">{phone.name}</h3>
            <p className="text-lg font-extrabold text-blue-600 mt-1">{formatINR(phone.price_inr)}</p>
          </div>
        </div>
        
        <div className="flex flex-col gap-1.5 text-[11px] text-neutral-600 mb-4 font-medium">
          <div className="flex items-center gap-2">
            <Cpu size={13} className="text-neutral-400" /> <span className="truncate">{phone.cpu_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-neutral-400" /> <span>{phone.ram_type}</span>
            <span className="text-neutral-300">•</span>
            <span>{phone.storage_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor size={13} className="text-neutral-400" /> <span>{phone.display_refresh_hz}Hz {phone.screen_type}</span>
            <span className="text-neutral-300">•</span>
            <Battery size={13} className="text-neutral-400" /> <span>{phone.battery_mah}mAh</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar size={13} className="text-neutral-400" />
            <span className={
              osStatus.yearsLeft === 0 
                ? "text-[10px] font-bold bg-red-50 text-red-650 px-1.5 py-0.5 rounded border border-red-150" 
                : osStatus.yearsLeft <= 1.25 
                  ? "text-[10px] font-bold bg-amber-50 text-amber-750 px-1.5 py-0.5 rounded border border-amber-250 animate-pulse" 
                  : "text-neutral-500 text-[11px]"
            }>
              {osStatus.yearsLeft === 0 ? "EOL: No updates left" : osStatus.yearsLeft <= 1.25 ? "Warning: Only 1 year of updates left!" : `${Math.ceil(osStatus.yearsLeft)} OS updates left`}
            </span>
          </div>
        </div>
        
        <div className="space-y-2 mb-5">
          {[
            { label: "Performance", value: phone.ratings.performance, icon: <Zap size={12}/> },
            { label: "Camera", value: phone.ratings.camera, icon: <Camera size={12}/> },
            { label: "Reliability", value: phone.ratings.reliability, icon: <Shield size={12}/> },
            { label: "OS Rating", value: phone.ratings.os, icon: <Smartphone size={12}/> },
            { label: "Value", value: phone.ratings.vfm, icon: <Star size={12}/> },
          ].map((r) => {
            const color = r.value >= 8.5 ? 'bg-emerald-500' : r.value >= 7.0 ? 'bg-amber-400' : 'bg-red-400';
            const textColor = r.value >= 8.5 ? 'text-emerald-700' : r.value >= 7.0 ? 'text-amber-600' : 'text-red-600';
            return (
              <div key={r.label} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1 text-neutral-500">{r.icon} {r.label}</span>
                  <span className={textColor}>{r.value.toFixed(1)}/10</span>
                </div>
                <div className="h-1.5 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${(r.value / 10) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="flex items-center justify-between rounded bg-blue-50/50 border border-blue-100 px-3 py-2.5 mb-4">
          <span className="text-[10px] uppercase tracking-wider font-bold text-blue-800">Match Score</span>
          <span className="text-base font-extrabold text-blue-700">{customScore.toFixed(1)}</span>
        </div>
        
        <div className="flex items-center gap-1.5">
          <button onClick={(e) => { e.stopPropagation(); onToggle(phone.id); }} className={`flex-[2] py-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1 ${isCompared ? "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100" : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200/50"}`}>
            {isCompared ? <><X size={12} /> Remove</> : <><Plus size={12} /> Compare</>}
          </button>
          
          {showBuyOptions ? (
            <>
              <a href={`https://www.amazon.in/s?k=${encodeURIComponent(phone.name)}&tag=YOUR_AMAZON_AFFILIATE_ID_HERE`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 py-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/60 animate-fade-in" title="Buy on Amazon">
                Amazon
              </a>
              <a href={`https://www.flipkart.com/search?q=${encodeURIComponent(phone.name)}&affid=YOUR_FLIPKART_AFFILIATE_ID_HERE`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="flex-1 py-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 animate-fade-in" title="Buy on Flipkart">
                Flipkart
              </a>
            </>
          ) : (
            <button onClick={(e) => { e.stopPropagation(); setShowBuyOptions(true); }} className="flex-[2] py-2.5 rounded text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 shadow-sm animate-fade-in">
              <ShoppingCart size={14} /> Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

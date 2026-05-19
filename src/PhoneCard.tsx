import { useState } from "react";
import { Zap, Shield, Camera, Star, Cpu, Battery, AlertTriangle, Plus, X, Monitor, ShoppingCart, Smartphone, Calendar } from "lucide-react";
import type { PhoneWithRatings, WeightConfig } from "./types";
import { formatINR } from "./types";
import { getOSUpdatesStatus, calcMatchScore } from "./hooks";
export function BrandLogo({ brand, className = "" }: { brand: string; className?: string }) {
  const b = brand.toLowerCase().trim();
  
  if (b === "apple" || b.includes("iphone")) {
    return (
      <span className={`inline-flex items-center font-extrabold tracking-tight text-neutral-850 dark:text-neutral-100 ${className}`}>
        <svg viewBox="0 0 170 170" className="w-3 h-3 fill-current mr-0.5" xmlns="http://www.w3.org/2000/svg">
          <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.34.13-9.04-1.92-14.12-6.12-3.09-2.52-6.87-7.05-11.34-13.56-4.69-6.81-8.52-14.88-11.5-24.22-3.8-11.95-5.71-23.27-5.71-33.96 0-14.23 3.6-25.75 10.79-34.56 7.19-8.81 16.27-13.22 27.23-13.22 4.69 0 9.8 1.28 15.33 3.85 5.53 2.57 9.17 3.85 10.93 3.85 1.4 0 5.09-1.28 11.08-3.85 5.99-2.57 10.74-3.74 14.25-3.5 13 .8 23 5.4 30 13.8-11.3 6.8-16.9 16.4-16.8 28.8.1 9.9 3.8 18.2 11.1 24.8 7.3 6.6 16.1 10.1 26.4 10.5 1.5 3.8.5 7.6-3 12.3zm-32.9-106.87c0 8-2.9 15.5-8.7 22.5-6 7.1-13.2 11.3-21.7 12.6-.2-1.7-.3-3.2-.3-4.8 0-7.7 3-15.6 9-23.7 6.1-8.1 13.6-12.7 22.4-13.7.1 1.7.3 3.4.3 5.2z"/>
        </svg>
        <span>Apple</span>
      </span>
    );
  }
  
  if (b === "samsung") {
    return (
      <span className={`inline-flex items-center font-black tracking-wider text-blue-700 dark:text-blue-400 text-[10px] uppercase ${className}`} style={{ fontFamily: "sans-serif" }}>
        Samsung
      </span>
    );
  }
  
  if (b === "oneplus") {
    return (
      <span className={`inline-flex items-center bg-red-600 text-white font-extrabold text-[8px] px-1.5 py-0.5 rounded tracking-wide ${className}`}>
        <span className="text-[10px] leading-none mr-0.5 font-black">+</span>1PLUS
      </span>
    );
  }
  
  if (b === "google") {
    return (
      <span className={`inline-flex items-center font-black tracking-tight text-[10px] ${className}`}>
        <span className="text-blue-500">G</span>
        <span className="text-red-500">o</span>
        <span className="text-yellow-500">o</span>
        <span className="text-blue-500">g</span>
        <span className="text-green-500">l</span>
        <span className="text-red-500">e</span>
      </span>
    );
  }
  
  if (b === "xiaomi") {
    return (
      <span className={`inline-flex items-center bg-orange-500 text-white font-black text-[9px] px-1.5 py-0.5 rounded-md ${className}`}>
        mi
      </span>
    );
  }
  
  if (b === "nothing") {
    return (
      <span className={`inline-flex items-center font-black tracking-[0.2em] uppercase text-[8px] text-neutral-900 dark:text-white bg-neutral-100 dark:bg-neutral-800 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 ${className}`}>
        NTHNG
      </span>
    );
  }
  
  if (b === "vivo") {
    return (
      <span className={`inline-flex items-center text-blue-600 dark:text-blue-450 font-black italic tracking-tight text-[10px] uppercase ${className}`}>
        vivo
      </span>
    );
  }
  
  if (b === "oppo") {
    return (
      <span className={`inline-flex items-center text-emerald-600 dark:text-emerald-500 font-extrabold tracking-widest text-[9px] uppercase ${className}`}>
        oppo
      </span>
    );
  }

  if (b === "motorola" || b === "moto") {
    return (
      <span className={`inline-flex items-center font-bold text-teal-600 dark:text-teal-400 gap-1 ${className}`}>
        <span className="w-3.5 h-3.5 rounded-full border border-teal-500 flex items-center justify-center font-black text-[8px] bg-teal-50 dark:bg-teal-900/30">M</span>
        <span>Moto</span>
      </span>
    );
  }
  
  if (b === "iqoo") {
    return (
      <span className={`inline-flex items-center bg-yellow-400 text-neutral-900 font-black tracking-widest text-[8px] px-1.5 py-0.5 rounded italic border border-yellow-500 ${className}`}>
        iQOO
      </span>
    );
  }
  
  if (b === "poco") {
    return (
      <span className={`inline-flex items-center bg-yellow-450 text-neutral-950 font-black tracking-wide text-[8px] px-1.5 py-0.5 rounded border border-neutral-300 ${className}`}>
        POCO
      </span>
    );
  }

  if (b === "realme") {
    return (
      <span className={`inline-flex items-center font-extrabold text-amber-500 tracking-tight text-[10px] gap-0.5 ${className}`}>
        <span className="text-neutral-900 dark:text-white font-black">r</span>ealme
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center font-extrabold text-[9px] text-neutral-500 dark:text-neutral-400 uppercase tracking-wider bg-neutral-100 dark:bg-neutral-850 px-1.5 py-0.5 rounded border border-neutral-200 dark:border-neutral-800 ${className}`}>
      {brand}
    </span>
  );
}
export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 animate-pulse">
      <div className="flex gap-4 mb-5">
        <div className="w-16 h-20 rounded-xl bg-neutral-100" />
        <div className="flex-1 space-y-2 pt-1">
          <div className="h-3 w-16 bg-neutral-100 rounded" />
          <div className="h-4 w-32 bg-neutral-100 rounded" />
          <div className="h-5 w-24 bg-neutral-100 rounded" />
        </div>
      </div>
      <div className="space-y-3 mb-5">
        <div className="h-4 bg-neutral-50 rounded" />
        <div className="h-4 bg-neutral-50 rounded" />
        <div className="h-4 bg-neutral-50 rounded" />
      </div>
      <div className="h-10 bg-neutral-100 rounded-xl" />
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
  const customScore = calcMatchScore(phone, weights);
  const hasBloat = phone.raw_ui_score < 6.0;
  const osStatus = getOSUpdatesStatus(phone.launch_date, phone.os_updates_years);

  return (
    <div 
      className={`relative group rounded-2xl border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 animate-fade-in-up cursor-pointer flex flex-col justify-between overflow-hidden ${
        isCompared ? "border-blue-500 ring-1 ring-blue-500 shadow-sm" : "border-neutral-200/70"
      }`} 
      onClick={onSelect}
    >
      {hasBloat && (
        <div className="absolute top-4 right-4 z-10 group/bloat cursor-help">
          <div className="flex items-center gap-1 rounded-full bg-rose-50 border border-rose-100 px-2.5 py-0.5 text-[9px] uppercase font-bold text-rose-600 shadow-sm">
            <AlertTriangle size={11} className="fill-rose-50" /> Bloat Risk
          </div>
          <div className="absolute right-0 top-6 w-56 rounded-xl bg-neutral-900 p-2.5 text-[10px] text-neutral-300 opacity-0 group-hover/bloat:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-relaxed">
            Notice: Software experience may include heavy pre-installed applications or intrusive ads.
          </div>
        </div>
      )}
      
      <div className="p-6 flex-1 flex flex-col justify-between">
        {/* Recommendation Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {badges.map((badge) => (
              <span key={badge} className="inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm">
                {badge}
              </span>
            ))}
          </div>
        )}

        {/* Product Details Header */}
        <div className="flex items-start gap-4 mb-4 border-b border-neutral-100 pb-4">
          <div className="w-16 h-20 image-container-bg flex items-center justify-center flex-shrink-0 rounded-xl p-1 border border-neutral-100 dark:border-neutral-700">
            <img 
              src={phone.image_url} 
              alt={phone.name} 
              className="max-w-full max-h-full object-contain" 
              loading="lazy" 
            />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 flex items-center gap-1">
              <BrandLogo brand={phone.brand} />
              <span>•</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-normal uppercase ${
                phone.screen_type.includes("AMOLED") || phone.screen_type.includes("OLED")
                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                  : "bg-neutral-50 text-neutral-600 border border-neutral-200/60"
              }`}>{phone.screen_type.split(" ")[0]}</span>
            </p>
            <h3 className="text-sm font-black text-neutral-900 tracking-tight leading-tight mt-1" title={phone.name}>
              {phone.name}
            </h3>
            <p className="text-base font-black text-blue-600 mt-1">{formatINR(phone.price_inr)}</p>
          </div>
        </div>
        
        {/* Specifications List */}
        <div className="flex flex-col gap-2.5 text-[11px] text-neutral-650 mb-5 font-medium">
          <div className="flex items-center gap-2">
            <Cpu size={13} className="text-neutral-400 flex-shrink-0" /> 
            <span className="truncate">{phone.cpu_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-neutral-400 flex-shrink-0" /> 
            <span>{phone.ram_type} • {phone.storage_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor size={13} className="text-neutral-400 flex-shrink-0" /> 
            <span>{phone.display_refresh_hz}Hz {phone.screen_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Battery size={13} className="text-neutral-400 flex-shrink-0" /> 
            <span>{phone.battery_mah}mAh ({phone.charging_mins}m estimated charge time)</span>
          </div>
          <div className="flex items-center gap-2 border-t border-neutral-100 pt-2.5 mt-0.5">
            <Calendar size={13} className="text-neutral-400 flex-shrink-0" />
            <span className={
              osStatus.yearsLeft === 0 
                ? "text-[10px] font-bold bg-red-50 text-red-650 px-1.5 py-0.5 rounded border border-red-150" 
                : osStatus.yearsLeft <= 1.25 
                  ? "text-[10px] font-bold bg-amber-50 text-amber-750 px-1.5 py-0.5 rounded border border-amber-250 animate-pulse" 
                  : "text-neutral-500 text-[11px]"
            }>
              {osStatus.yearsLeft === 0 
                ? "EOL: No updates left" 
                : osStatus.yearsLeft <= 1.25 
                  ? `Warning: Only ${osStatus.yearsLeft.toFixed(1)} yrs updates remaining!` 
                  : `${Math.ceil(osStatus.yearsLeft)} OS updates left`}
            </span>
          </div>
        </div>
        
        {/* Dynamic Category Ratings */}
        <div className="space-y-2.5 mb-5 border-t border-neutral-100 pt-4">
          {[
            { label: "Performance", value: phone.ratings.performance, icon: <Zap size={11} className="text-neutral-400" /> },
            { label: "Camera", value: phone.ratings.camera, icon: <Camera size={11} className="text-neutral-400" /> },
            { label: "Reliability", value: phone.ratings.reliability, icon: <Shield size={11} className="text-neutral-400" /> },
            { label: "OS Rating", value: phone.ratings.os, icon: <Smartphone size={11} className="text-neutral-400" /> },
            { label: "Value For Money", value: phone.ratings.vfm, icon: <Star size={11} className="text-neutral-400" /> },
          ].map((r) => {
            const color = r.value >= 8.5 ? 'bg-emerald-500' : r.value >= 7.0 ? 'bg-amber-400' : 'bg-rose-400';
            const textColor = r.value >= 8.5 ? 'text-emerald-700' : r.value >= 7.0 ? 'text-amber-600' : 'text-rose-600';
            return (
              <div key={r.label} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-neutral-500">{r.icon} {r.label}</span>
                  <span className={textColor}>{r.value.toFixed(1)}/10</span>
                </div>
                <div className="h-1 w-full bg-neutral-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${(r.value / 10) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Match Score */}
        <div className="flex items-center justify-between rounded-xl bg-blue-50/40 border border-blue-100/50 px-3.5 py-2.5 mb-5">
          <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-800">Match Score</span>
          <span className="text-base font-black text-blue-700">{customScore.toFixed(1)}</span>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(phone.id); }} 
            className={`flex-[4] py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 ${
              isCompared 
                ? "bg-red-50 text-red-650 hover:bg-red-100 border border-red-150" 
                : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200/50"
            }`}
          >
            {isCompared ? <><X size={12} /> Remove</> : <><Plus size={12} /> Compare</>}
          </button>
          
          {showBuyOptions ? (
            <div className="flex-[5] flex gap-1.5 animate-fade-in">
              <a 
                href={`https://www.amazon.in/s?k=${encodeURIComponent(phone.name)}&tag=YOUR_AMAZON_AFFILIATE_ID_HERE`} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()} 
                className="flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/60 shadow-sm" 
                title="Buy on Amazon"
              >
                Amazon
              </a>
              <a 
                href={`https://www.flipkart.com/search?q=${encodeURIComponent(phone.name)}&affid=YOUR_FLIPKART_AFFILIATE_ID_HERE`} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()} 
                className="flex-1 py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60 shadow-sm" 
                title="Buy on Flipkart"
              >
                Flipkart
              </a>
            </div>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBuyOptions(true); }} 
              className="flex-[4] py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            >
              <ShoppingCart size={13} /> Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

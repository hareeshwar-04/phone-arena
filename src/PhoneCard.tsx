import { useState } from "react";
import { Zap, Shield, Camera, Star, Cpu, Battery, AlertTriangle, Plus, X, Monitor, ShoppingCart, Smartphone, Calendar } from "lucide-react";
import type { PhoneWithRatings, WeightConfig, UserPhoneSpecs } from "./types";
import { formatINR } from "./types";
import { getOSUpdatesStatus, calcMatchScore } from "./hooks";
import { PhoneImage } from "./PhoneImage";

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

function renderBadgeWithIcon(badge: string) {
  let text = badge;
  let icon: React.ReactNode = null;
  let classes = "";
  
  if (badge.includes("Best Performance")) {
    text = "Performance King";
    icon = <Zap size={10} className="fill-current" />;
    classes = "bg-gradient-to-r from-violet-500/10 to-indigo-500/10 text-indigo-700 dark:text-indigo-355 border border-indigo-200/60 dark:border-indigo-850/50 shadow-[0_1px_2px_rgba(99,102,241,0.05)]";
  } else if (badge.includes("Best Camera")) {
    text = "Pro Camera";
    icon = <Camera size={10} className="fill-current" />;
    classes = "bg-gradient-to-r from-rose-500/10 to-pink-500/10 text-rose-700 dark:text-rose-355 border border-rose-200/60 dark:border-rose-850/50 shadow-[0_1px_2px_rgba(244,63,94,0.05)]";
  } else if (badge.includes("Best Value")) {
    text = "Value Champion";
    icon = <Star size={10} className="fill-current" />;
    classes = "bg-gradient-to-r from-amber-500/10 to-yellow-500/10 text-amber-700 dark:text-amber-400 border border-amber-250/60 dark:border-amber-800/50 shadow-[0_1px_2px_rgba(245,158,11,0.05)]";
  } else if (badge.includes("Best Battery")) {
    text = "Battery Monster";
    icon = <Battery size={10} className="fill-current" />;
    classes = "bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-700 dark:text-emerald-355 border border-emerald-200/60 dark:border-emerald-850/50 shadow-[0_1px_2px_rgba(16,185,129,0.05)]";
  } else {
    classes = "bg-neutral-50 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-400 border border-neutral-200 dark:border-neutral-800";
  }
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider backdrop-blur-md ${classes}`}>
      {icon}
      <span>{text}</span>
    </span>
  );
}

export function PhoneCard({ phone, isCompared, onToggle, weights, onSelect, badges, userPhone }: {
  phone: PhoneWithRatings; isCompared: boolean;
  onToggle: (id: string) => void; weights: WeightConfig;
  onSelect?: () => void;
  badges?: string[];
  userPhone?: UserPhoneSpecs | null;
}) {
  const [showBuyOptions, setShowBuyOptions] = useState(false);
  const customScore = calcMatchScore(phone, weights);
  const hasBloat = phone.raw_ui_score < 6.0;
  const osStatus = getOSUpdatesStatus(phone.launch_date, phone.os_updates_years);

  // Upgrade calculations
  const upgradeInfo = userPhone ? (() => {
    const perf = userPhone.antutu_score > 0 ? ((phone.antutu_score - userPhone.antutu_score) / userPhone.antutu_score) * 100 : 0;
    const camera = userPhone.main_camera_score > 0 ? ((phone.main_camera_score - userPhone.main_camera_score) / userPhone.main_camera_score) * 100 : 0;
    const battery = userPhone.battery_mah > 0 ? ((phone.battery_mah - userPhone.battery_mah) / userPhone.battery_mah) * 100 : 0;
    const osDiff = phone.os_updates_years - userPhone.os_updates_years;
    
    // Overall is average of all spec changes (including downgrades)
    const overall = (perf + camera + battery) / 3;
    
    return { overall, perf, camera, battery, osDiff };
  })() : null;

  return (
    <div 
      className={`relative group rounded-2xl border bg-white dark:bg-neutral-900 transition-all duration-300 hover:shadow-lg dark:hover:shadow-neutral-950/30 hover:-translate-y-0.5 animate-fade-in-up cursor-pointer flex flex-col justify-between overflow-hidden ${
        isCompared ? "border-blue-500 ring-1 ring-blue-500 shadow-sm" : "border-neutral-200/70 dark:border-neutral-800"
      }`} 
      onClick={onSelect}
    >
      {hasBloat && (
        <div className="absolute top-4 right-4 z-10 group/bloat cursor-help">
          <div className="flex items-center gap-1 rounded-full bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 px-2.5 py-0.5 text-[9px] uppercase font-bold text-rose-600 dark:text-rose-400 shadow-sm">
            <AlertTriangle size={11} className="fill-rose-50 dark:fill-none" /> Bloat Risk
          </div>
          <div className="absolute right-0 top-6 w-56 rounded-xl bg-neutral-900 p-2.5 text-[10px] text-neutral-300 opacity-0 group-hover/bloat:opacity-100 transition-opacity pointer-events-none z-20 shadow-xl leading-relaxed">
            Notice: Software experience may include heavy pre-installed applications or intrusive ads.
          </div>
        </div>
      )}
      
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* Recommendation Badges */}
        {badges && badges.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {badges.map((badge) => (
              <span key={badge} className="inline-block">
                {renderBadgeWithIcon(badge)}
              </span>
            ))}
          </div>
        )}

        {/* Product Details Header */}
        <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4 border-b border-neutral-100 dark:border-neutral-800 pb-3 sm:pb-4">
          <div className="w-14 h-[72px] sm:w-16 sm:h-20 image-container-bg flex items-center justify-center flex-shrink-0 rounded-xl p-1 border border-neutral-100 dark:border-neutral-850">
            <PhoneImage 
              imageUrl={phone.image_url} 
              name={phone.name} 
              brand={phone.brand} 
              iconSize={20}
            />
          </div>
          <div className="flex-1 min-w-0 pt-0.5">
            <p className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 dark:text-neutral-500 flex items-center gap-1">
              <span>{phone.brand}</span>
              <span>•</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-normal uppercase ${
                phone.screen_type.includes("AMOLED") || phone.screen_type.includes("OLED")
                  ? "bg-purple-50 dark:bg-purple-950/30 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-900/40"
                  : "bg-neutral-50 dark:bg-neutral-850 text-neutral-600 dark:text-neutral-450 border border-neutral-200/60 dark:border-neutral-800/40"
              }`}>{phone.screen_type.split(" ")[0]}</span>
            </p>
            <h3 className="text-[13px] sm:text-sm font-black text-neutral-900 dark:text-white tracking-tight leading-tight mt-1" title={phone.name}>
              {phone.name}
            </h3>
            <p className="text-[15px] sm:text-base font-black text-blue-600 dark:text-blue-400 mt-1">{formatINR(phone.price_inr)}</p>
          </div>
        </div>
        
        {/* Specifications List */}
        <div className="flex flex-col gap-2 sm:gap-2.5 text-[11px] text-neutral-650 dark:text-neutral-400 mb-4 sm:mb-5 font-medium">
          <div className="flex items-center gap-2">
            <Cpu size={13} className="text-neutral-400 dark:text-neutral-500 flex-shrink-0" /> 
            <span className="truncate text-neutral-700 dark:text-neutral-350">{phone.cpu_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap size={13} className="text-neutral-400 dark:text-neutral-500 flex-shrink-0" /> 
            <span className="text-neutral-700 dark:text-neutral-350">{phone.ram_type} • {phone.storage_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Monitor size={13} className="text-neutral-400 dark:text-neutral-500 flex-shrink-0" /> 
            <span className="text-neutral-700 dark:text-neutral-350">{phone.display_refresh_hz}Hz {phone.screen_type}</span>
          </div>
          <div className="flex items-center gap-2">
            <Battery size={13} className="text-neutral-400 dark:text-neutral-500 flex-shrink-0" /> 
            <span className="text-neutral-700 dark:text-neutral-350">{phone.battery_mah}mAh • {phone.charging_w}W • ~{phone.charging_mins}min</span>
          </div>
          <div className="flex items-center gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-2 sm:pt-2.5 mt-0.5">
            <Calendar size={13} className="text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
            <span className={
              osStatus.yearsLeft === 0 
                ? "text-[10px] font-bold bg-red-50 dark:bg-red-950/20 text-red-650 dark:text-red-400 px-1.5 py-0.5 rounded border border-red-150 dark:border-red-900/30" 
                : osStatus.yearsLeft <= 1.25 
                  ? "text-[10px] font-bold bg-amber-50 dark:bg-amber-950/20 text-amber-750 dark:text-amber-400 px-1.5 py-0.5 rounded border border-amber-250 dark:border-amber-900/30 animate-pulse" 
                  : "text-neutral-500 dark:text-neutral-450 text-[11px]"
            }>
              {osStatus.yearsLeft === 0 
                ? "EOL: No updates left" 
                : osStatus.yearsLeft <= 1.25 
                  ? `Only ${osStatus.yearsLeft.toFixed(1)} yrs left!` 
                  : `${Math.ceil(osStatus.yearsLeft)} OS updates left`}
            </span>
          </div>
        </div>
        
        {/* Dynamic Category Ratings */}
        <div className="space-y-2 sm:space-y-2.5 mb-4 sm:mb-5 border-t border-neutral-100 dark:border-neutral-800 pt-3 sm:pt-4">
          {[
            { label: "Performance", value: phone.ratings.performance, icon: <Zap size={11} className="text-neutral-400 dark:text-neutral-500" /> },
            { label: "Camera", value: phone.ratings.camera, icon: <Camera size={11} className="text-neutral-400 dark:text-neutral-500" /> },
            { label: "Reliability", value: phone.ratings.reliability, icon: <Shield size={11} className="text-neutral-400 dark:text-neutral-500" /> },
            { label: "OS Rating", value: phone.ratings.os, icon: <Smartphone size={11} className="text-neutral-400 dark:text-neutral-500" /> },
            { label: "Value For Money", value: phone.ratings.vfm, icon: <Star size={11} className="text-neutral-400 dark:text-neutral-500" /> },
          ].map((r) => {
            const color = r.value >= 8.5 ? 'bg-emerald-500' : r.value >= 7.0 ? 'bg-amber-400' : 'bg-rose-400';
            const textColor = r.value >= 8.5 ? 'text-emerald-700 dark:text-emerald-450' : r.value >= 7.0 ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-450';
            return (
              <div key={r.label} className="flex flex-col gap-1">
                <div className="flex justify-between items-center text-[9px] font-bold uppercase tracking-wider">
                  <span className="flex items-center gap-1.5 text-neutral-500 dark:text-neutral-400">{r.icon} {r.label}</span>
                  <span className={textColor}>{r.value.toFixed(1)}/10</span>
                </div>
                <div className="h-1 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-300 ${color}`} style={{ width: `${(r.value / 10) * 100}%` }} />
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Match / Upgrade Scores */}
        <div className="flex gap-2.5 mb-5">
          <div className={`flex items-center justify-between rounded-xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-100/50 dark:border-blue-900/30 px-3.5 py-2.5 ${upgradeInfo ? "flex-1" : "w-full"}`}>
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-blue-800 dark:text-blue-400">Match Score</span>
            <span className="text-base font-black text-blue-700 dark:text-blue-300">{customScore.toFixed(1)}</span>
          </div>
          {upgradeInfo && (
            <div className={`flex-1 flex items-center justify-between rounded-xl ${upgradeInfo.overall >= 0 ? "bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-100/50 dark:border-emerald-900/30" : "bg-rose-50/40 dark:bg-rose-950/20 border-rose-100/50 dark:border-rose-900/30"} border px-3 py-2.5 relative group/upgrade cursor-help`}>
              <div className="flex flex-col items-start w-full">
                <span className={`text-[8px] sm:text-[9px] uppercase tracking-wider font-extrabold ${upgradeInfo.overall >= 0 ? "text-emerald-800 dark:text-emerald-450" : "text-rose-800 dark:text-rose-400"}`}>{upgradeInfo.overall >= 0 ? "Est. Upgrade" : "Est. Downgrade"}</span>
                <span className={`text-sm font-black mt-0.5 ${upgradeInfo.overall > 5 ? "text-emerald-600 dark:text-emerald-400" : upgradeInfo.overall < -5 ? "text-rose-600 dark:text-rose-400" : "text-neutral-500"}`}>
                  {upgradeInfo.overall > 5 ? `+${upgradeInfo.overall.toFixed(0)}%` : upgradeInfo.overall < -5 ? `${upgradeInfo.overall.toFixed(0)}%` : "~Similar"}
                </span>
              </div>
              
              {/* Tooltip on hover */}
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-56 bg-neutral-900 dark:bg-neutral-950 text-white rounded-xl p-3 shadow-xl opacity-0 group-hover/upgrade:opacity-100 transition-opacity pointer-events-none z-30 border border-neutral-800 text-[10px] space-y-1.5 leading-normal">
                <p className="font-extrabold border-b border-neutral-800 pb-1 text-neutral-300">
                  Upgrade over {userPhone?.name || "current phone"}:
                </p>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-neutral-450">Processor:</span>
                    <span className={`font-bold ${upgradeInfo.perf > 5 ? "text-emerald-400" : upgradeInfo.perf < -5 ? "text-rose-400" : "text-neutral-400"}`}>
                      {upgradeInfo.perf > 5 ? `+${upgradeInfo.perf.toFixed(0)}%` : upgradeInfo.perf < -5 ? `${upgradeInfo.perf.toFixed(0)}%` : "~Same"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-450">Camera:</span>
                    <span className={`font-bold ${upgradeInfo.camera > 3 ? "text-emerald-400" : upgradeInfo.camera < -3 ? "text-rose-400" : "text-neutral-400"}`}>
                      {upgradeInfo.camera > 3 ? `+${upgradeInfo.camera.toFixed(0)}%` : upgradeInfo.camera < -3 ? `${upgradeInfo.camera.toFixed(0)}%` : "~Same"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-450">Battery:</span>
                    <span className={`font-bold ${upgradeInfo.battery > 5 ? "text-emerald-400" : upgradeInfo.battery < -5 ? "text-rose-400" : "text-neutral-400"}`}>
                      {upgradeInfo.battery > 5 ? `+${upgradeInfo.battery.toFixed(0)}%` : upgradeInfo.battery < -5 ? `${upgradeInfo.battery.toFixed(0)}%` : "~Same"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-450">OS Support:</span>
                    <span className={`font-bold ${upgradeInfo.osDiff > 0 ? "text-emerald-400" : upgradeInfo.osDiff < 0 ? "text-rose-400" : "text-neutral-400"}`}>
                      {upgradeInfo.osDiff > 0 ? `+${upgradeInfo.osDiff} yrs` : upgradeInfo.osDiff < 0 ? `${upgradeInfo.osDiff} yrs` : "Same updates"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(phone.id); }} 
            className={`flex-[4] py-3 sm:py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1 ${
              isCompared 
                ? "bg-red-50 dark:bg-red-950/30 text-red-650 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 border border-red-150 dark:border-red-900/30" 
                : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-350 hover:bg-neutral-200 dark:hover:bg-neutral-750 border border-neutral-200/50 dark:border-neutral-800/40"
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
                className="flex-1 py-3 sm:py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-orange-50 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-900/20 border border-orange-200/60 dark:border-orange-900/30 shadow-sm" 
                title="Buy on Amazon"
              >
                Amazon
              </a>
              <a 
                href={`https://www.flipkart.com/search?q=${encodeURIComponent(phone.name)}&affid=YOUR_FLIPKART_AFFILIATE_ID_HERE`} 
                target="_blank" 
                rel="noopener noreferrer" 
                onClick={(e) => e.stopPropagation()} 
                className="flex-1 py-3 sm:py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center bg-blue-50 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 border border-blue-200/60 dark:border-blue-900/30 shadow-sm" 
                title="Buy on Flipkart"
              >
                Flipkart
              </a>
            </div>
          ) : (
            <button 
              onClick={(e) => { e.stopPropagation(); setShowBuyOptions(true); }} 
              className="flex-[4] py-3 sm:py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 shadow-sm"
            >
              <ShoppingCart size={13} /> Buy Now
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

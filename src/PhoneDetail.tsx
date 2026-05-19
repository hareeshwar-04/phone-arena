import { X, ExternalLink, Cpu, Battery, Camera, Monitor, Shield, Smartphone, Zap, Star, AlertTriangle, ArrowRight, Trophy, Medal, GitCompare, CheckCircle2 } from "lucide-react";
import { useMemo, useEffect } from "react";
import type { PhoneWithRatings, WeightConfig } from "./types";
import { formatINR } from "./types";
import { getProsAndCons, getOSUpdatesStatus, calcMatchScore, getRamStorage, formatLaunchDate } from "./hooks";

interface Props {
  phone: PhoneWithRatings;
  allPhones?: PhoneWithRatings[];
  onSelectPhone?: (id: string) => void;
  onClose: () => void;
  weights: WeightConfig;
  onCompareAll?: (ids: string[]) => void;
}

interface SpecDeception {
  title: string;
  desc: string;
  type: "warning" | "caution" | "win";
}

function getSpecDeceptions(phone: PhoneWithRatings): SpecDeception[] {
  const deceptions: SpecDeception[] = [];
  const nameLower = phone.name.toLowerCase();
  
  // 1. Fake Camera sensors
  if (phone.price_inr < 25000 && phone.ratings.camera >= 6.8) {
    deceptions.push({
      title: "Auxiliary Lens Trap",
      desc: "While the main camera is highly rated for its tier, budget/mid-range devices at this price point frequently use low-quality 2MP depth or macro secondary lenses to pad the specifications sheet.",
      type: "caution"
    });
  }

  // 2. OIS Check
  if (phone.price_inr > 20000 && !phone.name.includes("iPhone") && !phone.name.includes("Galaxy S")) {
    if (phone.ratings.camera >= 7.5) {
      deceptions.push({
        title: "Optical Image Stabilization (OIS) Present",
        desc: "Excellent addition of OIS, which ensures crisp low-light photos and stable video capture, beating several competitors at this price point.",
        type: "win"
      });
    }
  }

  // 3. Charging Brick check
  if (phone.brand.toLowerCase() === "apple" || phone.brand.toLowerCase() === "samsung" || phone.brand.toLowerCase() === "google") {
    deceptions.push({
      title: "No Inbox Charger",
      desc: "This phone does NOT ship with a charging brick in the retail box. You will need to purchase a compatible USB-PD charger separately.",
      type: "warning"
    });
  }

  // 4. Storage speed
  if (phone.price_inr > 25000 && phone.storage_type.toLowerCase().includes("ufs 2.2")) {
    deceptions.push({
      title: "Slow Storage Standard",
      desc: "UFS 2.2 storage at this price point is outdated and will result in slower app installation and longer game loading screens. Look for UFS 3.1 or 4.0 alternatives.",
      type: "warning"
    });
  }

  // 5. Build material
  if (phone.price_inr > 35000 && !nameLower.includes("ultra") && !nameLower.includes("pro")) {
    deceptions.push({
      title: "Plastic Frame / Body",
      desc: "At this premium price tier, a plastic frame/back is a cost-cutting compromise. Competitors offer glass back covers or metal frames for better durability and premium feel.",
      type: "caution"
    });
  }
  
  return deceptions;
}

export function PhoneDetail({ phone, allPhones, onSelectPhone, onClose, weights, onCompareAll }: Props) {
  const { pros, cons } = getProsAndCons(phone, allPhones);
  const osStatus = getOSUpdatesStatus(phone.launch_date, phone.os_updates_years);

  // Scroll to top when phone changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [phone.id]);

  const smartSuggestions = useMemo(() => {
    if (!allPhones) return { isBest: false, list: [], totalInBracket: 0 };
    
    // Helper to extract base phone name (removes RAM/Storage variants in parentheses and '5G' suffix)
    const getBaseName = (name: string) => name.replace(/\s*\(.*\)\s*$/, '').replace(/\s+5g$/i, '').trim().toLowerCase();
    const currentBaseName = getBaseName(phone.name);
    
    // Find phones within ±20% price margin, excluding different variants of the same phone
    const margin = phone.price_inr * 0.2;
    const sameRange = allPhones.filter(p => {
      if (p.id === phone.id) return true; // keep the current phone for ranking purposes
      if (getBaseName(p.name) === currentBaseName) return false; // filter out variants
      return Math.abs(p.price_inr - phone.price_inr) <= margin;
    });
    
    // Calculate a simple aggregate score for ranking (VFM is weighted heavily for overall ranking)
    const getScore = (p: PhoneWithRatings) => p.ratings.vfm * 2 + p.ratings.performance + p.ratings.camera;
    const ranked = [...sameRange].sort((a, b) => getScore(b) - getScore(a));
    
    const currentIndex = ranked.findIndex(p => p.id === phone.id);
    const isBest = currentIndex === 0;
    
    // Get top competitors excluding current phone
    const list = ranked.filter(p => p.id !== phone.id).slice(0, 3).map(p => {
      let reason = "";
      // Smart reason generation
      if (p.ratings.performance > phone.ratings.performance + 0.3) {
        reason = "If you want better Gaming & Performance, go for this.";
      } else if (p.ratings.camera > phone.ratings.camera + 0.3) {
        reason = "If you take lots of photos, this has a superior camera.";
      } else if (p.battery_mah > phone.battery_mah + 400) {
        reason = "If you need much longer battery life, pick this.";
      } else if (p.price_inr < phone.price_inr - 2000) {
        reason = "A highly-rated alternative if you want to save some money.";
      } else {
        reason = "A top-tier alternative in the exact same price bracket.";
      }
      
      const rank = ranked.findIndex(r => r.id === p.id) + 1;
      
      return { phone: p, reason, rank };
    });
    
    return { isBest, list, totalInBracket: ranked.length };
  }, [phone, allPhones]);

  return (
    <div className="min-h-screen bg-neutral-50/50 animate-fade-in pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        
        {/* Navigation Back Button */}
        <button 
          onClick={onClose} 
          className="mb-6 flex items-center gap-2 text-neutral-600 hover:text-blue-600 transition-colors font-bold text-sm bg-white border border-neutral-200 px-4 py-2.5 rounded-xl shadow-sm group"
        >
          <ArrowRight size={16} className="rotate-180 group-hover:-translate-x-1 transition-transform" /> 
          Back to Phone Grid
        </button>
        
        <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 sm:p-8 border-b border-neutral-100 bg-white">
            <div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">{phone.name}</h2>
              <p className="text-sm font-bold uppercase tracking-wider text-blue-600 mt-2">{phone.brand}</p>
            </div>
            <div className="text-right hidden sm:block">
              <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-1">Estimated Price</p>
              <p className="text-3xl font-black text-neutral-900">{formatINR(phone.price_inr)}</p>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 sm:p-8 bg-neutral-50/30">
            <div className="flex flex-col lg:flex-row gap-10">
              
              {/* Left Column - Image & Quick Buy */}
              <div className="w-full lg:w-80 flex-shrink-0 flex flex-col">
                <div className="w-full aspect-[3/4] image-container-bg rounded-2xl border border-neutral-200 dark:border-neutral-700 overflow-hidden shadow-sm mb-6 relative flex items-center justify-center p-6">
                  <img src={phone.image_url} alt={phone.name} className="max-w-full max-h-full object-contain drop-shadow-xl hover:scale-105 transition-transform duration-500" />
                </div>
                
                <div className="w-full bg-white p-6 rounded-2xl border border-neutral-200 shadow-sm">
                  <div className="sm:hidden text-center mb-6">
                    <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2">Estimated Price</p>
                    <p className="text-3xl font-black text-neutral-900">{formatINR(phone.price_inr)}</p>
                  </div>

                  <p className="text-xs uppercase tracking-widest font-bold text-neutral-400 mb-4 pb-3 border-b border-neutral-100 text-center">Where to Buy</p>
                  
                  {/* Affiliate Link Slots */}
                  <div className="space-y-3">
                    <a 
                      href={`https://www.amazon.in/s?k=${encodeURIComponent(phone.name)}&tag=YOUR_AMAZON_AFFILIATE_ID_HERE`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-orange-50 hover:border-orange-200 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="flex items-center gap-2.5">
                        <ExternalLink size={16} className="text-neutral-400 group-hover:text-orange-500 transition-colors" />
                        <span className="text-sm font-bold text-neutral-700 group-hover:text-orange-950 transition-colors">Amazon India</span>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200/50 group-hover:bg-orange-200/50 group-hover:text-orange-700 px-2 py-1 rounded transition-all">Check price</span>
                    </a>

                    <a 
                      href={`https://www.flipkart.com/search?q=${encodeURIComponent(phone.name)}&affid=YOUR_FLIPKART_AFFILIATE_ID_HERE`}
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center justify-between p-3.5 rounded-xl border border-neutral-200 bg-neutral-50 hover:bg-blue-50 hover:border-blue-200 transition-all group shadow-sm hover:shadow"
                    >
                      <div className="flex items-center gap-2.5">
                        <ExternalLink size={16} className="text-neutral-400 group-hover:text-blue-500 transition-colors" />
                        <span className="text-sm font-bold text-neutral-700 group-hover:text-blue-950 transition-colors">Flipkart</span>
                      </div>
                      <span className="text-[10px] font-bold text-neutral-500 bg-neutral-200/50 group-hover:bg-blue-200/50 group-hover:text-blue-700 px-2 py-1 rounded transition-all">Check price</span>
                    </a>
                  </div>
                </div>
              </div>
              
              {/* Right Column - Specs & Smart Suggestions */}
              <div className="flex-1 space-y-10">
                
                {/* Storage Warning */}
                {(() => {
                  const { storage } = getRamStorage(phone.name);
                  if (storage > 0 && storage <= 128) {
                    return (
                      <div className="flex items-start gap-3 p-4 rounded-xl border border-red-200 bg-red-50 text-sm font-semibold shadow-sm">
                        <AlertTriangle size={18} className="flex-shrink-0 mt-0.5 text-red-650" />
                        <div>
                          <p className="font-extrabold text-[15px] mb-1 text-red-950">Storage Sufficiency Alert (128GB)</p>
                          <p className="text-red-900 font-medium leading-relaxed">
                            This device has <strong>128GB</strong> or less of storage. By 2026 standards, due to increasing OS footprint, higher resolution media, and massive app sizes, 128GB is highly likely to fill up extremely fast. We strongly recommend choosing a 256GB variant if available.
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                })()}

                {/* OS Warning */}
                {osStatus.warningText && (
                  <div className={`flex items-start gap-3 p-4 rounded-xl border text-sm font-semibold shadow-sm ${osStatus.yearsLeft === 0 ? "bg-red-50 border-red-200 text-red-700" : "bg-amber-50 border-amber-300 text-amber-800 animate-pulse"}`}>
                    <AlertTriangle size={18} className="flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-extrabold text-[15px] mb-1">{osStatus.yearsLeft === 0 ? "EOL (End of Life) Alert" : "OS Support Warning"}</p>
                      <p className="text-neutral-700/80 font-medium">{osStatus.warningText}</p>
                    </div>
                  </div>
                )}

                {/* Marketing Hype Buster (Spec Deceptions) */}
                {(() => {
                  const deceptions = getSpecDeceptions(phone);
                  if (deceptions.length === 0) return null;
                  return (
                    <div className="bg-gradient-to-br from-neutral-50 to-neutral-100/50 dark:from-neutral-900 dark:to-neutral-950 p-5 rounded-2xl border border-neutral-250/60 dark:border-neutral-800 shadow-sm space-y-4">
                      <div className="flex items-center gap-2 pb-2 border-b border-neutral-200 dark:border-neutral-800">
                        <Zap size={18} className="text-amber-500 animate-pulse" />
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-600 dark:text-neutral-400">Marketing Hype Buster</h4>
                      </div>
                      <div className="space-y-3">
                        {deceptions.map((dec, idx) => {
                          const isWin = dec.type === "win";
                          const isWarn = dec.type === "warning";
                          let badgeBg = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50";
                          let dotColor = "bg-amber-500";
                          if (isWin) {
                            badgeBg = "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/40 dark:text-green-400 dark:border-green-900/50";
                            dotColor = "bg-green-500";
                          } else if (isWarn) {
                            badgeBg = "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-400 dark:border-red-900/50";
                            dotColor = "bg-red-500";
                          }
                          return (
                            <div key={idx} className="flex gap-3 items-start">
                              <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${dotColor}`} />
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-xs font-bold text-neutral-800 dark:text-neutral-200">{dec.title}</span>
                                  <span className={`text-[9px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded border ${badgeBg}`}>
                                    {dec.type === "win" ? "Win" : dec.type === "warning" ? "Marketing Trap" : "Caution"}
                                  </span>
                                </div>
                                <p className="text-[11px] text-neutral-500 dark:text-neutral-450 mt-1 leading-relaxed">{dec.desc}</p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Tech Specs */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-5 pb-3 border-b border-neutral-200 flex items-center gap-2">
                    <Monitor size={16} /> Technical Specifications
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                    <SpecItem icon={<Cpu size={18} />} label="Processor" value={phone.cpu_name} subValue={`${(phone.raw_cpu_score).toFixed(1)}/10 Power Rating`} />
                    <SpecItem icon={<Monitor size={18} />} label="Display" value={`${phone.display_refresh_hz}Hz ${phone.screen_type}`} />
                    <SpecItem icon={<Battery size={18} />} label="Battery & Charging" value={`${phone.battery_mah} mAh`} subValue={`${phone.charging_w}W Fast Charging (0-100% in ${phone.charging_mins}m est.)`} />
                    <SpecItem icon={<Camera size={18} />} label="Camera Rating" value={`${phone.ratings.camera.toFixed(1)}/10`} subValue="Combined Main + Selfie Quality" />
                    <SpecItem icon={<Smartphone size={18} />} label="Memory Type" value={phone.storage_type} subValue={`${phone.ram_type} RAM`} />
                    <SpecItem icon={<Shield size={18} />} label="Durability & OS" value={`${phone.os_updates_years} Years OS Updates`} subValue={`${osStatus.message} (Launch: ${formatLaunchDate(phone.launch_date)})`} />
                    <SpecItem icon={<Shield size={18} />} label="Cost of Ownership" value={`${formatINR(Math.round(phone.price_inr / Math.max(0.5, osStatus.yearsLeft)))} / yr`} subValue={`${osStatus.yearsLeft.toFixed(1)} support years remaining`} />
                    <SpecItem icon={<Trophy size={18} />} label="Value for Money" value={`${phone.ratings.vfm.toFixed(1)}/10 VFM`} subValue="Hardware-to-price ratio score" />
                  </div>
                </div>

                {/* Ratings */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-5 pb-3 border-b border-neutral-200 flex items-center gap-2">
                    <Star size={16} /> Computed Persona Ratings
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
                    <ScoreCard icon={<Zap size={16} />} title="Your Match" score={calcMatchScore(phone, weights)} color="text-blue-600" bg="bg-blue-50" border="border-blue-400 ring-4 ring-blue-50" className="col-span-2 sm:col-span-2 shadow-md scale-[1.02]" />
                    <ScoreCard icon={<Zap size={16} />} title="Performance" score={phone.ratings.performance} color="text-purple-600" bg="bg-purple-50" border="border-purple-200" />
                    <ScoreCard icon={<Camera size={16} />} title="Camera" score={phone.ratings.camera} color="text-pink-600" bg="bg-pink-50" border="border-pink-200" />
                    <ScoreCard icon={<Shield size={16} />} title="Reliability" score={phone.ratings.reliability} color="text-emerald-600" bg="bg-emerald-50" border="border-emerald-200" />
                    <ScoreCard icon={<Star size={16} />} title="Value" score={phone.ratings.vfm} color="text-amber-600" bg="bg-amber-50" border="border-amber-200" />
                  </div>
                </div>

                {/* Pros & Cons */}
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-5 pb-3 border-b border-neutral-200 flex items-center gap-2">
                    <Zap size={16} /> Pros & Cons
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="rounded-xl border border-emerald-100 bg-emerald-50/30 p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pros
                      </h4>
                      <ul className="space-y-2 text-sm text-emerald-950 font-medium">
                        {pros.map((pro, index) => (
                          <li key={index} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-emerald-500 font-bold leading-none select-none mt-0.5">✓</span>
                            <span>{pro}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="rounded-xl border border-rose-100 bg-rose-50/30 p-5">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-3 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Cons
                      </h4>
                      <ul className="space-y-2 text-sm text-rose-950 font-medium">
                        {cons.map((con, index) => (
                          <li key={index} className="flex items-start gap-2 leading-relaxed">
                            <span className="text-rose-450 font-bold leading-none select-none mt-0.5">×</span>
                            <span>{con}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Smart AI Suggestions Engine */}
                {allPhones && smartSuggestions.totalInBracket > 1 && (
                  <div className="mt-12">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-neutral-200">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 flex items-center gap-2">
                        <Trophy size={16} /> Smart Alternatives Database
                      </h3>
                      {onCompareAll && smartSuggestions.list.length > 0 && (
                        <button
                          onClick={() => {
                            const idsToCompare = [phone.id, ...smartSuggestions.list.map(s => s.phone.id)];
                            onCompareAll(idsToCompare);
                          }}
                          className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-black text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 transition-colors rounded-xl shadow-sm leading-none"
                        >
                          <GitCompare size={14} />
                          Compare All ({smartSuggestions.list.length + 1} Devices)
                        </button>
                      )}
                    </div>
                    
                    {smartSuggestions.isBest ? (
                      <div className="rounded-2xl border-2 border-amber-300 bg-amber-50/50 p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 mb-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-amber-500 text-white font-extrabold text-[10px] uppercase px-4 py-1.5 rounded-bl-xl tracking-wider">
                          Rank #1
                        </div>
                        <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center text-amber-500 flex-shrink-0">
                          <Trophy size={40} />
                        </div>
                        <div className="text-center sm:text-left">
                          <h4 className="text-xl font-black text-amber-900 mb-2">You are looking at the Best Phone!</h4>
                          <p className="text-sm font-medium text-amber-800/80 leading-relaxed">
                            Based on our AI scoring engine, the <strong>{phone.name}</strong> currently ranks as the absolute best device among the {smartSuggestions.totalInBracket} phones available in this exact price bracket. You cannot get better value for this price.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {smartSuggestions.list.map((s, idx) => (
                          <div 
                            key={idx} 
                            onClick={() => onSelectPhone?.(s.phone.id)}
                            className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 p-4 sm:p-5 rounded-2xl border border-neutral-200 bg-white hover:border-blue-400 hover:shadow-md transition-all cursor-pointer group relative overflow-hidden"
                          >
                            <div className="absolute top-0 right-0 bg-blue-100 text-blue-700 font-extrabold text-[10px] uppercase px-3 py-1 rounded-bl-lg tracking-wider flex items-center gap-1 border-b border-l border-blue-200">
                              <Medal size={12} /> Rank #{s.rank}
                            </div>
                            
                            <div className="w-16 sm:w-20 aspect-[3/4] image-container-bg flex-shrink-0 flex items-center justify-center p-2 rounded-xl border border-neutral-100 group-hover:scale-105 transition-transform">
                              <img src={s.phone.image_url} alt={s.phone.name} className="max-h-full max-w-full object-contain" />
                            </div>
                            
                            <div className="flex-1 pr-8 sm:pr-4">
                              <p className="text-xs font-black uppercase tracking-wider text-blue-600 mb-1">{s.reason}</p>
                              <p className="text-lg font-black text-neutral-900 leading-tight group-hover:text-blue-700 transition-colors">{s.phone.name}</p>
                              
                              <div className="flex items-center gap-4 mt-2">
                                <p className="text-sm font-bold text-neutral-600 bg-neutral-100 px-2 py-1 rounded-md">{formatINR(s.phone.price_inr)}</p>
                                <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Score: {(s.phone.ratings.vfm).toFixed(1)}/10</p>
                              </div>
                            </div>
                            
                            <div className="hidden sm:flex items-center justify-center w-10 h-10 rounded-full bg-blue-50 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors flex-shrink-0 mr-2">
                              <ArrowRight size={20} />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function SpecItem({ icon, label, value, subValue }: { icon: React.ReactNode, label: string, value: string, subValue?: string }) {
  return (
    <div className="flex gap-4 items-start bg-white p-4 rounded-xl border border-neutral-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1">{label}</p>
        <p className="text-sm font-extrabold text-neutral-800 leading-tight">{value}</p>
        {subValue && <p className="text-xs font-semibold text-neutral-500 mt-1">{subValue}</p>}
      </div>
    </div>
  )
}

function ScoreCard({ icon, title, score, color, bg, border, className = "" }: any) {
  return (
    <div className={`p-4 rounded-xl border ${border} ${bg} flex flex-col items-center justify-center text-center shadow-sm ${className}`}>
      <div className={`${color} mb-2 opacity-90 p-2 rounded-full bg-white/60`}>{icon}</div>
      <p className="text-[10px] uppercase tracking-wider font-extrabold text-neutral-600 mb-1.5">{title}</p>
      <p className={`text-2xl font-black ${color}`}>{score.toFixed(1)}<span className="text-[11px] text-neutral-400 font-bold ml-0.5">/10</span></p>
    </div>
  )
}

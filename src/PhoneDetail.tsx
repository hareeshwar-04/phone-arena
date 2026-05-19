import { X, ExternalLink, Cpu, Battery, Camera, Monitor, Shield, Smartphone, Zap, Star, ShoppingCart } from "lucide-react";
import type { PhoneWithRatings } from "./types";
import { formatINR } from "./types";
import { getProsAndCons } from "./hooks";

interface Props {
  phone: PhoneWithRatings;
  onClose: () => void;
}

export function PhoneDetail({ phone, onClose }: Props) {
  const { pros, cons } = getProsAndCons(phone);
  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 md:p-6 bg-neutral-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white sm:rounded-xl shadow-2xl w-full h-[95dvh] sm:h-auto max-w-3xl sm:max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up rounded-t-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-neutral-100 bg-white">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">{phone.name}</h2>
            <p className="text-xs font-bold uppercase tracking-wider text-blue-600 mt-1">{phone.brand}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-neutral-100 text-neutral-500 transition-colors bg-neutral-50 border border-neutral-200">
            <X size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-neutral-50/50 hide-scrollbar">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Left Column - Image & Price */}
            <div className="w-full md:w-1/3 flex-shrink-0 flex flex-col items-center">
              <div className="w-48 sm:w-64 md:w-full aspect-[3/4] bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm mb-6 relative">
                <img src={phone.image_url} alt={phone.name} className="w-full h-full object-contain mix-blend-multiply p-4" />
              </div>
              
              <div className="text-center w-full bg-white p-5 rounded-xl border border-neutral-200 shadow-sm min-h-[160px]">
                <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-2">Estimated Price</p>
                <p className="text-3xl font-black text-neutral-900 mb-4">{formatINR(phone.price_inr)}</p>
                
                <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-3 pb-2 border-b border-neutral-100">Buy Now</p>
                
                {/* Affiliate Link Slots */}
                <div className="space-y-2.5">
                  <a 
                    href={`https://www.amazon.in/s?k=${encodeURIComponent(phone.name)}&tag=YOUR_AMAZON_AFFILIATE_ID_HERE`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-orange-50 hover:border-orange-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white border border-neutral-200 p-0.5 flex items-center justify-center">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" alt="Amazon" className="max-w-full max-h-full object-contain" />
                      </div>
                      <span className="text-xs font-bold text-neutral-700 group-hover:text-orange-700">Amazon</span>
                    </div>
                    <ExternalLink size={14} className="text-neutral-400 group-hover:text-orange-500" />
                  </a>

                  <a 
                    href={`https://www.flipkart.com/search?q=${encodeURIComponent(phone.name)}&affid=YOUR_FLIPKART_AFFILIATE_ID_HERE`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-between p-2.5 rounded-lg border border-neutral-200 bg-neutral-50 hover:bg-blue-50 hover:border-blue-200 transition-colors group"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded bg-white border border-neutral-200 p-0.5 flex items-center justify-center">
                        <img src="https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg" alt="Flipkart" className="max-w-full max-h-full object-contain" />
                      </div>
                      <span className="text-xs font-bold text-neutral-700 group-hover:text-blue-700">Flipkart</span>
                    </div>
                    <ExternalLink size={14} className="text-neutral-400 group-hover:text-blue-500" />
                  </a>
                </div>

              </div>
            </div>
            
            {/* Right Column - Specs */}
            <div className="flex-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-4 pb-2 border-b border-neutral-200">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                <SpecItem icon={<Cpu size={18} />} label="Processor" value={phone.cpu_name} subValue={`${(phone.raw_cpu_score).toFixed(1)}/10 Power Rating`} />
                <SpecItem icon={<Monitor size={18} />} label="Display" value={`${phone.display_refresh_hz}Hz ${phone.screen_type}`} />
                <SpecItem icon={<Battery size={18} />} label="Battery" value={`${phone.battery_mah} mAh`} subValue={`${phone.charging_w}W Fast Charging`} />
                <SpecItem icon={<Camera size={18} />} label="Cameras" value={`${phone.main_camera_score.toFixed(1)}/10 Main`} subValue={`${phone.front_camera_score.toFixed(1)}/10 Selfie`} />
                <SpecItem icon={<Smartphone size={18} />} label="Memory Type" value={phone.storage_type} subValue={`${phone.ram_type} RAM`} />
                <SpecItem icon={<Shield size={18} />} label="Durability" value={`${phone.os_updates_years} Years OS Updates`} subValue={`${phone.build_quality_score.toFixed(1)}/10 Build Quality`} />
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mt-8 mb-4 pb-2 border-b border-neutral-200">Computed Persona Ratings</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <ScoreCard icon={<Zap size={16} />} title="Performance" score={phone.ratings.performance} color="text-purple-600" bg="bg-purple-50" border="border-purple-200" />
                <ScoreCard icon={<Camera size={16} />} title="Camera" score={phone.ratings.camera} color="text-pink-600" bg="bg-pink-50" border="border-pink-200" />
                <ScoreCard icon={<Shield size={16} />} title="Reliability" score={phone.ratings.reliability} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" />
                <ScoreCard icon={<Smartphone size={16} />} title="OS Rating" score={phone.ratings.os} color="text-teal-600" bg="bg-teal-50" border="border-teal-200" />
                <ScoreCard icon={<Star size={16} />} title="Value" score={phone.ratings.vfm} color="text-amber-600" bg="bg-amber-50" border="border-amber-200" className="col-span-2 sm:col-span-1" />
              </div>

              {/* Pros & Cons */}
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mt-8 mb-4 pb-2 border-b border-neutral-200">Pros & Cons</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-800 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Pros
                  </h4>
                  <ul className="space-y-1.5 text-xs text-emerald-950 font-medium">
                    {pros.map((pro, index) => (
                      <li key={index} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-emerald-500 font-bold leading-none select-none">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-rose-100 bg-rose-50/20 p-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-800 mb-2 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" /> Cons
                  </h4>
                  <ul className="space-y-1.5 text-xs text-rose-950 font-medium">
                    {cons.map((con, index) => (
                      <li key={index} className="flex items-start gap-1.5 leading-relaxed">
                        <span className="text-rose-450 font-bold leading-none select-none">×</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
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
    <div className="flex gap-3 items-start">
      <div className="p-2.5 rounded-lg bg-white border border-neutral-200 text-blue-600 shadow-sm shrink-0">{icon}</div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-0.5">{label}</p>
        <p className="text-sm font-bold text-neutral-800">{value}</p>
        {subValue && <p className="text-xs font-semibold text-neutral-500 mt-0.5">{subValue}</p>}
      </div>
    </div>
  )
}

function ScoreCard({ icon, title, score, color, bg, border, className = "" }: any) {
  return (
    <div className={`p-3 rounded-xl border ${border} ${bg} flex flex-col items-center justify-center text-center ${className}`}>
      <div className={`${color} mb-1 opacity-80`}>{icon}</div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 mb-1">{title}</p>
      <p className={`text-xl font-black ${color}`}>{score.toFixed(1)}<span className="text-[10px] text-neutral-400 font-bold ml-0.5">/10</span></p>
    </div>
  )
}

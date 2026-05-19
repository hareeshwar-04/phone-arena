import { X, ExternalLink, Cpu, Battery, Camera, Monitor, Shield, Smartphone, Zap, Star } from "lucide-react";
import type { PhoneWithRatings } from "./types";
import { formatINR } from "./types";

interface Props {
  phone: PhoneWithRatings;
  onClose: () => void;
}

export function PhoneDetail({ phone, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-neutral-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-fade-in-up" onClick={e => e.stopPropagation()}>
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
              <div className="w-full aspect-[3/4] bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm mb-6 relative">
                <img src={phone.image_url} alt={phone.name} className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-neutral-900/80 backdrop-blur text-white text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded">
                  {phone.antutu_score.toLocaleString()} AnTuTu
                </div>
              </div>
              
              <div className="text-center w-full bg-white p-5 rounded-xl border border-neutral-200 shadow-sm min-h-[160px]">
                <p className="text-[10px] uppercase tracking-widest font-bold text-neutral-400 mb-4 pb-2 border-b border-neutral-100">Live Web Pricing</p>
                <LivePriceFetcher phoneName={phone.name} />
              </div>
            </div>
            
            {/* Right Column - Specs */}
            <div className="flex-1">
              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mb-4 pb-2 border-b border-neutral-200">Technical Specifications</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-6">
                <SpecItem icon={<Cpu size={18} />} label="Processor" value={phone.cpu_name} subValue={`${(phone.raw_cpu_score).toFixed(1)}/10 Power Rating`} />
                <SpecItem icon={<Monitor size={18} />} label="Display" value={`${phone.display_refresh_hz}Hz Refresh Rate`} />
                <SpecItem icon={<Battery size={18} />} label="Battery" value={`${phone.battery_mah} mAh`} subValue={`${phone.charging_w}W Fast Charging`} />
                <SpecItem icon={<Camera size={18} />} label="Cameras" value={`${phone.main_camera_score.toFixed(1)}/10 Main`} subValue={`${phone.front_camera_score.toFixed(1)}/10 Selfie`} />
                <SpecItem icon={<Smartphone size={18} />} label="Memory Type" value={phone.storage_type} subValue={`${phone.ram_type} RAM`} />
                <SpecItem icon={<Shield size={18} />} label="Durability" value={`${phone.os_updates_years} Years OS Updates`} subValue={`${phone.build_quality_score.toFixed(1)}/10 Build Quality`} />
              </div>

              <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800 mt-8 mb-4 pb-2 border-b border-neutral-200">Computed Persona Ratings</h3>
              <div className="grid grid-cols-2 gap-4">
                <ScoreCard icon={<Zap size={16} />} title="Gaming" score={phone.ratings.gaming} color="text-purple-600" bg="bg-purple-50" border="border-purple-200" />
                <ScoreCard icon={<Camera size={16} />} title="Creator" score={phone.ratings.creator} color="text-pink-600" bg="bg-pink-50" border="border-pink-200" />
                <ScoreCard icon={<Shield size={16} />} title="Reliability" score={phone.ratings.durability} color="text-blue-600" bg="bg-blue-50" border="border-blue-200" />
                <ScoreCard icon={<Star size={16} />} title="Value" score={phone.ratings.vfm} color="text-amber-600" bg="bg-amber-50" border="border-amber-200" />
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

function ScoreCard({ icon, title, score, color, bg, border }: any) {
  return (
    <div className={`p-3 rounded-xl border ${border} ${bg} flex flex-col items-center justify-center text-center`}>
      <div className={`${color} mb-1 opacity-80`}>{icon}</div>
      <p className="text-[10px] uppercase tracking-wider font-bold text-neutral-600 mb-1">{title}</p>
      <p className={`text-xl font-black ${color}`}>{score.toFixed(1)}<span className="text-[10px] text-neutral-400 font-bold ml-0.5">/10</span></p>
    </div>
  )
}

import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";

function LivePriceFetcher({ phoneName }: { phoneName: string }) {
  const [loading, setLoading] = useState(true);
  const [prices, setPrices] = useState<any[]>([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`http://localhost:8000/api/live-prices?q=${encodeURIComponent(phoneName)}`)
      .then(res => res.json())
      .then(data => {
        if (data && data.results) {
          setPrices(data.results);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [phoneName]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-24 gap-3">
        <Loader2 size={24} className="text-blue-500 animate-spin" />
        <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest animate-pulse">Running live web scraper...</p>
      </div>
    );
  }

  if (error || prices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-24">
        <p className="text-xs font-bold text-neutral-500 mb-2">No live prices found.</p>
        <p className="text-[10px] text-neutral-400">Please check stores manually.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {prices.map((p, i) => (
        <a key={i} href={p.link} target="_blank" rel="noopener noreferrer" className={`flex items-center justify-between p-2.5 rounded-lg border transition-colors group ${i === 0 ? "border-green-200 bg-green-50 hover:bg-green-100" : "border-neutral-200 bg-neutral-50 hover:bg-neutral-100"}`}>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white border border-neutral-200 p-0.5 flex items-center justify-center">
              <img src={p.logo} alt={p.store} className="max-w-full max-h-full object-contain" />
            </div>
            <span className="text-xs font-bold text-neutral-700">{p.store}</span>
          </div>
          <div className="text-right">
            <span className={`text-sm font-black ${i === 0 ? "text-green-700" : "text-neutral-900"}`}>{formatINR(p.price)}</span>
            {i === 0 && <span className="block text-[8px] font-bold uppercase tracking-widest text-green-600 mt-0.5">Lowest</span>}
          </div>
        </a>
      ))}
    </div>
  );
}

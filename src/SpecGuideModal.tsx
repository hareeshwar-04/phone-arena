import React from "react";
import { X, Cpu, Monitor, Battery, Camera, Shield, Star, BookOpen, HardDrive, Zap, CheckCircle2 } from "lucide-react";

interface SpecGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpecGuideModal({ isOpen, onClose }: SpecGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200" onClick={onClose} />
      
      {/* Modal Box */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col relative z-10 border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm">
              <BookOpen size={22} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black tracking-tight">Smartphone Specs Made Simple 💡</h2>
              <p className="text-xs text-blue-100/90 font-medium">Cut through the marketing jargon and pick like a pro</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-neutral-50/50 max-h-[calc(85vh-8rem)]">
          
          {/* Quick Analogy Banner */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm flex flex-col sm:flex-row gap-4 items-start">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl flex-shrink-0">
              <Zap size={24} className="fill-amber-100" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">The "Workstation" Analogy</h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Think of a phone like an office desk: The <strong>Processor</strong> is the speed of the worker's brain, the <strong>RAM</strong> is the actual physical size of the desk, and <strong>Storage</strong> is how fast they can fetch items from the filing cabinet. If any of these are slow, the entire desk slows down!
              </p>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* 1. Processor (The Engine) */}
            <div className="bg-white rounded-xl border-l-4 border-blue-500 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-blue-600">
                    <Cpu size={20} />
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-850">Processor (Engine Power)</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">Speed Limit</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Runs all apps and games. High power means zero stuttering and faster photo loading.
                </p>
                <div className="bg-neutral-50 rounded-lg p-3 space-y-2 border border-neutral-100">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>1.5 Million+ (AnTuTu):</strong> Flagship gaming, no heating.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>600K - 1M (AnTuTu):</strong> Fast daily multitasking.</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                <strong>Practical Tip:</strong> Snapdragon 8/Dimensity 9 are speed kings. Avoid under 400K.
              </div>
            </div>

            {/* 2. RAM (Active Multitasking) */}
            <div className="bg-white rounded-xl border-l-4 border-indigo-500 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-indigo-650">
                    <HardDrive size={20} />
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-850">RAM (Desk Space)</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full">Multitasking</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Determines how many apps stay open in the background without refreshing.
                </p>
                <div className="bg-neutral-50 rounded-lg p-3 space-y-2 border border-neutral-100">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>LPDDR5 / 5X:</strong> Lightning-fast. Instantly switches apps.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>8GB - 12GB:</strong> Sweet spot for keeping games suspended.</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                <strong>Practical Tip:</strong> Avoid 4GB/6GB RAM with older LPDDR4X if you switch apps often.
              </div>
            </div>

            {/* 3. Storage Type (Filing Cabinet Speed) */}
            <div className="bg-white rounded-xl border-l-4 border-violet-500 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-violet-650">
                    <HardDrive size={20} className="rotate-90" />
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-850">Storage Type (App Loads)</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-violet-50 text-violet-700 px-2 py-0.5 rounded-full">App Installs</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Determines how fast games load and files copy. Older standards slow down over time.
                </p>
                <div className="bg-neutral-50 rounded-lg p-3 space-y-2 border border-neutral-100">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>UFS 4.0:</strong> Next-gen standard. Apps install in 2 seconds.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>UFS 3.1:</strong> Premium baseline. Great long-term reliability.</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                <strong>Practical Tip:</strong> Avoid UFS 2.2 on high-budget phones; it bottlenecks overall speed.
              </div>
            </div>

            {/* 4. Display & Refresh Rate (Screen Fluidity) */}
            <div className="bg-white rounded-xl border-l-4 border-emerald-500 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-emerald-600">
                    <Monitor size={20} />
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-850">Screen & Fluidity</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">Visuals</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  High refresh rates make scrolling look smooth like butter, instead of laggy slides.
                </p>
                <div className="bg-neutral-50 rounded-lg p-3 space-y-2 border border-neutral-100">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>AMOLED / OLED:</strong> Vibrant colors, deep blacks, saves battery.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>120Hz / 144Hz:</strong> Scrolling feels ultra-smooth and premium.</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                <strong>Practical Tip:</strong> Once you use 120Hz AMOLED, standard 60Hz LCD screens look laggy.
              </div>
            </div>

            {/* 5. Battery & Charging Speed (Fuel) */}
            <div className="bg-white rounded-xl border-l-4 border-amber-500 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-amber-600">
                    <Battery size={20} />
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-850">Charging & Endurance</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full">Battery Life</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  A big battery is great, but ultra-fast charging completely removes battery anxiety.
                </p>
                <div className="bg-neutral-50 rounded-lg p-3 space-y-2 border border-neutral-100">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>5000mAh+:</strong> Standard size. Easily lasts a full day.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>Fast Charging (67W-120W):</strong> Zero-to-full in 20-35 mins.</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                <strong>Practical Tip:</strong> Look at our estimated charge time. Under 40 mins is a game-changer.
              </div>
            </div>

            {/* 6. Software Longevity & Bloat */}
            <div className="bg-white rounded-xl border-l-4 border-rose-500 shadow-sm p-5 hover:shadow-md transition-shadow flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-rose-600">
                    <Shield size={20} />
                    <h3 className="font-extrabold text-sm uppercase tracking-wider text-neutral-850">OS Longevity & Bloat</h3>
                  </div>
                  <span className="text-[10px] font-bold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full">Software</span>
                </div>
                <p className="text-xs text-neutral-600 leading-relaxed mb-4">
                  Clean software doesn't show spam ads. Updates ensure bank apps keep working.
                </p>
                <div className="bg-neutral-50 rounded-lg p-3 space-y-2 border border-neutral-100">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>Updates (4-7 Yrs):</strong> Phone remains secure and updated for years.</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span><strong>Clean UI:</strong> No pre-installed junk apps or pop-up ads.</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 text-[11px] text-neutral-500">
                <strong>Practical Tip:</strong> Pixel, Apple, and Nothing offer the cleanest bloat-free systems.
              </div>
            </div>

          </div>

          {/* Quick Score Helper */}
          <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
            <h3 className="font-extrabold text-sm text-neutral-800 mb-3 flex items-center gap-2">
              <Star size={16} className="text-amber-500 fill-amber-500 animate-pulse" /> Decoding Our 10-Point Spec Ratings
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-black text-neutral-800 block uppercase tracking-wider text-[10px]">Gaming & Speed</span>
                <span className="text-neutral-500">AnTuTu raw benchmark + LPDDR type + UFS storage standard + screen refresh rate.</span>
              </div>
              <div className="space-y-1">
                <span className="font-black text-neutral-800 block uppercase tracking-wider text-[10px]">Photography</span>
                <span className="text-neutral-500">DXOMARK baseline + camera stabilizer presence + megapixel count + front selfie capability.</span>
              </div>
              <div className="space-y-1">
                <span className="font-black text-neutral-800 block uppercase tracking-wider text-[10px]">Reliability & Life</span>
                <span className="text-neutral-500">OS updates left + UI bloat factor + battery capacity + physical materials build quality.</span>
              </div>
              <div className="space-y-1">
                <span className="font-black text-neutral-800 block uppercase tracking-wider text-[10px]">Value For Money</span>
                <span className="text-neutral-500">Calculates overall hardware features divided by actual price in Indian Rupees.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end bg-neutral-50">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            I'm Ready to Find a Phone!
          </button>
        </div>

      </div>
    </div>
  );
}

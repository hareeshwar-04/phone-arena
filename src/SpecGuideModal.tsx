import { 
  X, Cpu, Monitor, Battery, Shield, Star, BookOpen, HardDrive, 
  Zap, Coffee, AlertTriangle, Check, Info, Trash2, Sliders, Camera 
} from "lucide-react";

interface SpecGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpecGuideModal({ isOpen, onClose }: SpecGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Box */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col relative z-10 border border-neutral-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-900 to-neutral-800 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-lg">
              <BookOpen size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5">
                Smartphone Specs Made Simple <Zap size={16} className="text-yellow-400 fill-yellow-400" />
              </h2>
              <p className="text-[11px] text-neutral-300 font-medium">Buy Smarter. Ignore the Marketing Noise.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-neutral-50/50 max-h-[calc(85vh-8rem)] text-neutral-800 hide-scrollbar">
          
          {/* Intro Section */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-neutral-600 leading-relaxed max-w-2xl">
              Phones today throw around fancy terms like <em className="text-neutral-900 font-semibold bg-neutral-100 px-1 rounded">“AI Engine,”</em> <em className="text-neutral-900 font-semibold bg-neutral-100 px-1 rounded">“HyperCharge,”</em> or <em className="text-neutral-900 font-semibold bg-neutral-100 px-1 rounded">“Gaming Chipset”</em> — but what actually matters?
            </p>
            <p className="text-xs text-neutral-500 font-semibold">
              This guide breaks specs into simple real-world explanations so you can instantly tell whether a phone is a beast… or just good advertising.
            </p>
          </div>

          {/* Desk Analogy Box */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
              🧠 Think of Your Phone Like a Workstation Desk
            </h3>
            <p className="text-xs text-neutral-650 leading-relaxed">
              Imagine a busy office desk:
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 pt-2">
              <div className="bg-blue-50/50 border border-blue-100/50 rounded-xl p-3 text-center space-y-1.5">
                <Cpu className="mx-auto text-blue-600" size={20} />
                <span className="block text-xs font-bold text-neutral-800">Processor</span>
                <span className="block text-[10px] text-neutral-500 font-medium">Worker's brain speed</span>
              </div>
              <div className="bg-indigo-50/50 border border-indigo-100/50 rounded-xl p-3 text-center space-y-1.5">
                <HardDrive className="mx-auto text-indigo-600" size={20} />
                <span className="block text-xs font-bold text-neutral-800">RAM</span>
                <span className="block text-[10px] text-neutral-500 font-medium">Desk space to keep files open</span>
              </div>
              <div className="bg-violet-50/50 border border-violet-100/50 rounded-xl p-3 text-center space-y-1.5">
                <HardDrive className="mx-auto text-violet-600 rotate-90" size={20} />
                <span className="block text-xs font-bold text-neutral-800">Storage</span>
                <span className="block text-[10px] text-neutral-500 font-medium">Filing cabinet speed</span>
              </div>
              <div className="bg-emerald-50/50 border border-emerald-100/50 rounded-xl p-3 text-center space-y-1.5">
                <Monitor className="mx-auto text-emerald-600" size={20} />
                <span className="block text-xs font-bold text-neutral-800">Display</span>
                <span className="block text-[10px] text-neutral-500 font-medium">The monitor you look at all day</span>
              </div>
              <div className="bg-amber-50/50 border border-amber-100/50 rounded-xl p-3 text-center space-y-1.5">
                <Coffee className="mx-auto text-amber-600" size={20} />
                <span className="block text-xs font-bold text-neutral-800">Battery</span>
                <span className="block text-[10px] text-neutral-500 font-medium">Energy before needing coffee ☕</span>
              </div>
            </div>
            
            <p className="text-[11px] text-neutral-500 italic text-center pt-1 font-medium border-t border-neutral-100">
              "If one single part is slow, the entire experience feels slow."
            </p>
          </div>

          {/* Detailed Spec Cards */}
          <div className="space-y-6">
            
            {/* 1. Processor */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Cpu size={18} /></div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">🚀 Processor (The Engine)</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full tracking-wider">Engine Power</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">What it does:</span>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Runs games, apps, camera processing, multitasking — basically everything.
                  </p>
                  <div className="text-xs text-neutral-700 space-y-1">
                    <p>• <strong>Fast processor:</strong> smooth gaming, instant app launches, zero lag.</p>
                    <p>• <strong>Weak processor:</strong> stutters, heating, slow camera opening.</p>
                  </div>
                </div>
                <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-2">🔥 Performance Levels:</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-800 flex items-center gap-1.5">🥇 1.5M+ AnTuTu</span>
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">Flagship Monster</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-800 flex items-center gap-1.5">⚡ 600K – 1M AnTuTu</span>
                      <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-bold">Perfect for Most</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-800 flex items-center gap-1.5">🚫 Below 400K AnTuTu</span>
                      <span className="text-[10px] bg-red-100 text-red-800 px-1.5 py-0.5 rounded font-bold">Feels Outdated</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-blue-50/40 p-3 rounded-lg border border-blue-100 text-[11px] text-blue-800 flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Pro Tip:</strong> Snapdragon 8-series & Dimensity 9000+ chips are the absolute kings right now. Don’t get fooled by simple "octa-core" marketing labels!
                </div>
              </div>
            </div>

            {/* 2. RAM */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-indigo-50 text-indigo-650 rounded-lg"><HardDrive size={18} /></div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">🧠 RAM (Your Multitasking Power)</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full tracking-wider">Active Memory</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">What it does:</span>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Keeps apps open in the background. Ever switched back to Instagram and it fully refreshed? That’s low RAM struggling.
                  </p>
                </div>
                <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-2">🔥 Sweet Spot Guidelines:</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">✅ 8GB – 12GB RAM</span>
                      <span className="text-[10px] font-bold text-neutral-500">Perfect Balance</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">⚡ LPDDR5 / LPDDR5X</span>
                      <span className="text-[10px] font-bold text-emerald-600">Ultra-Fast Standard</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">😬 4GB / Older LPDDR4X</span>
                      <span className="text-[10px] font-bold text-red-500">Cramped in 2026</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-indigo-50/40 p-3 rounded-lg border border-indigo-100 text-[11px] text-indigo-800 flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Pro Tip:</strong> Heavy multitaskers should prioritize RAM speeds and standard version tiers more than raw camera megapixels.
                </div>
              </div>
            </div>

            {/* 3. Storage Type */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-violet-50 text-violet-650 rounded-lg"><HardDrive size={18} className="rotate-90" /></div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">⚡ Storage Type (Hidden Speed Secret)</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase text-violet-700 bg-violet-50 px-2.5 py-0.5 rounded-full tracking-wider">Filing Speed</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">What it does:</span>
                  <p className="text-xs text-neutral-650 leading-relaxed">
                    Controls app install speed, game loading, file transfer speeds, and long-term system responsiveness. A powerful processor with slow storage still feels sluggish.
                  </p>
                </div>
                <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-2">🔥 Storage Standards:</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">🚀 UFS 4.0</span>
                      <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 rounded">Blazing Fast (Installs in Secs)</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">✅ UFS 3.1</span>
                      <span className="text-[10px] bg-blue-50 text-blue-700 font-bold px-1.5 rounded">Excellent & Reliable</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">🚫 UFS 2.2</span>
                      <span className="text-[10px] bg-red-50 text-red-700 font-bold px-1.5 rounded">Budget Speed (Avoid on Premium)</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-violet-50/40 p-3 rounded-lg border border-violet-100 text-[11px] text-violet-800 flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Pro Tip:</strong> Storage type standard (like UFS 3.1 or 4.0) matters WAY more than most people realize to prevent phone lag over 2-3 years.
                </div>
              </div>
            </div>

            {/* 4. Display */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg"><Monitor size={18} /></div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">📱 Display (What You Actually Experience)</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full tracking-wider">Screen Panel</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">Why it matters:</span>
                  <p className="text-xs text-neutral-655 leading-relaxed">
                    You stare at the screen all day long — this impacts daily satisfaction more than raw benchmark scores.
                  </p>
                </div>
                <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-2">🔥 Best Screen Combination:</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">🌈 AMOLED / OLED</span>
                      <span className="text-[10px] font-bold text-emerald-600">Deep Blacks, Rich Contrast & Energy Saving</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">⚡ 120Hz / 144Hz</span>
                      <span className="text-[10px] font-bold text-emerald-600">Ultra-Smooth Scrolling</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-emerald-50/40 p-3 rounded-lg border border-emerald-100 text-[11px] text-emerald-800 flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Pro Tip:</strong> Once you get used to a 120Hz refresh rate, a standard 60Hz screen feels ancient and laggy.
                </div>
              </div>
            </div>

            {/* 5. Battery & Charging */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-amber-50 text-amber-600 rounded-lg"><Battery size={18} /></div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">🔋 Battery & Charging (Daily Survival)</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full tracking-wider">Endurance</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">The balance:</span>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    How long your phone lasts vs. how fast it returns to full charge. Fast charging mitigates small batteries.
                  </p>
                </div>
                <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-2">🔥 Battery Sweet Spot:</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">✅ 5000mAh+</span>
                      <span className="text-[10px] font-bold text-neutral-500">Easy all-day battery life</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">⚡ 67W – 120W Fast Charging</span>
                      <span className="text-[10px] font-bold text-emerald-600">20–40 min full charges</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-amber-50/40 p-3 rounded-lg border border-amber-100 text-[11px] text-amber-800 flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Pro Tip:</strong> Ultra-fast charging often matters more than a slightly larger battery size, as it changes your entire charging habit.
                </div>
              </div>
            </div>

            {/* 6. Software Experience */}
            <div className="bg-white rounded-xl border border-neutral-200 p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-rose-50 text-rose-600 rounded-lg"><Shield size={18} /></div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">🧼 Software Experience (Underrated)</h3>
                </div>
                <span className="text-[10px] font-extrabold uppercase text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full tracking-wider">UI Quality</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">Why it matters:</span>
                  <p className="text-xs text-neutral-600 leading-relaxed">
                    Specs mean nothing if the software feels annoying. System ads, notifications, and slow updates will ruin a fast phone.
                  </p>
                </div>
                <div className="space-y-2 bg-neutral-50 p-4 rounded-xl border border-neutral-100">
                  <span className="text-xs font-bold text-neutral-600 uppercase tracking-wider block mb-2">🔥 Best Software Experiences:</span>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">✨ Clean & Smooth UI</span>
                      <span className="text-[10px] font-bold text-emerald-600">Pixel / Nothing / Apple</span>
                    </div>
                    <div className="flex items-center justify-between bg-white px-2.5 py-1.5 rounded border border-neutral-200">
                      <span className="text-xs font-extrabold text-neutral-850">📅 Long Update Commitments</span>
                      <span className="text-[10px] font-bold text-emerald-600">4–7 years support lifespan</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-rose-50/40 p-3 rounded-lg border border-rose-100 text-[11px] text-rose-800 flex items-start gap-2">
                <Info size={14} className="mt-0.5 flex-shrink-0" />
                <div>
                  <strong>Pro Tip:</strong> Good software keeps even mid-range devices feeling smooth and premium years down the line.
                </div>
              </div>
            </div>

          </div>

          {/* 10-Point Ratings breakdown */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              🎯 Our Simple 10-Point Ratings Explained
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-neutral-900 block flex items-center gap-1">
                  <Zap size={14} className="text-blue-500" /> Gaming & Speed
                </span>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Calculated based on AnTuTu score, RAM type, Storage type (UFS), and refresh rate.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-neutral-900 block flex items-center gap-1">
                  <Camera size={14} className="text-pink-500" /> Camera Quality
                </span>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Based on main camera stabilization, sensor quality, low-light ratings, and selfie scores.
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-xs font-extrabold text-neutral-900 block flex items-center gap-1">
                  <Shield size={14} className="text-indigo-500" /> Reliability & Lifespan
                </span>
                <p className="text-[11px] text-neutral-500 leading-relaxed">
                  Focuses on software updates commitment, remaining years, battery capacity, and UI bloatware rating.
                </p>
              </div>
              <div className="space-y-2 font-semibold">
                <span className="text-xs font-extrabold text-neutral-900 block flex items-center gap-1">
                  <Star size={14} className="text-amber-500 fill-amber-500" /> Value for Money
                </span>
                <p className="text-[11px] text-neutral-500 leading-relaxed font-normal">
                  Our most critical score. Measures: <em className="text-amber-800 bg-amber-50 px-1 rounded font-semibold not-italic">“How much hardware are you REALLY getting for the price?”</em>
                </p>
              </div>
            </div>
          </div>

          {/* Quick Buying Cheat Sheet Table */}
          <div className="bg-white border border-neutral-200 rounded-xl p-5 shadow-sm space-y-3 overflow-hidden">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
              🧠 Quick Buying Cheat Sheet
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">If You Want...</th>
                    <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">Prioritize...</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-neutral-800">Gaming</td>
                    <td className="py-2.5 px-3"><span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full font-semibold">Processor + Cooling</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-neutral-800">Multitasking</td>
                    <td className="py-2.5 px-3"><span className="bg-indigo-50 text-indigo-800 px-2 py-0.5 rounded-full font-semibold">RAM + Storage Standard</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-neutral-800">Smooth Feel</td>
                    <td className="py-2.5 px-3"><span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full font-semibold">AMOLED + 120Hz</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-neutral-800">Long-Term Use</td>
                    <td className="py-2.5 px-3"><span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full font-semibold">Software Updates</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-neutral-800">Fast Daily Usage</td>
                    <td className="py-2.5 px-3"><span className="bg-violet-50 text-violet-800 px-2 py-0.5 rounded-full font-semibold">UFS 3.1/4.0</span></td>
                  </tr>
                  <tr>
                    <td className="py-2.5 px-3 font-bold text-neutral-800">Best Value</td>
                    <td className="py-2.5 px-3"><span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full font-semibold">Balanced Specs</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Biggest Mistakes */}
          <div className="bg-red-50/50 border border-red-200 rounded-xl p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-wider text-red-800 flex items-center gap-1.5">
              <AlertTriangle size={16} /> 🚨 Biggest Mistakes Buyers Make
            </h3>
            <ul className="space-y-2 text-xs text-red-950 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">❌</span>
                <span>Buying based only on megapixel counts.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">❌</span>
                <span>Ignoring the storage type standard (UFS 2.2 vs. 3.1/4.0).</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">❌</span>
                <span>Choosing small 4GB RAM configurations in 2026.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">❌</span>
                <span>Falling for “AI Camera”/”AI Engine” marketing jargon.</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-red-500 font-bold">❌</span>
                <span>Ignoring how many years of software updates are left.</span>
              </li>
            </ul>
          </div>

          {/* Final Rule Banner */}
          <div className="bg-gradient-to-br from-indigo-900 to-violet-950 text-white rounded-xl p-5 text-center space-y-3 border border-indigo-950 relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-300 block">🏁 The Final Rule</span>
            <blockquote className="text-sm font-bold text-indigo-50 leading-relaxed italic max-w-xl mx-auto">
              "A great phone isn’t about one huge spec. It’s about balance: Fast processor + good RAM + fast storage + clean software + good display. That’s what makes a phone feel truly premium every single day."
            </blockquote>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end bg-neutral-50">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs uppercase tracking-wider transition-all duration-200 transform active:scale-95 shadow-sm"
          >
            I'm Ready to Find a Phone!
          </button>
        </div>

      </div>
    </div>
  );
}

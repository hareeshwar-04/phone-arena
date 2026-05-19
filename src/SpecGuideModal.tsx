import { useState } from "react";
import { 
  X, Cpu, Monitor, Battery, Shield, Star, BookOpen, HardDrive, 
  Zap, Coffee, AlertTriangle, Check, Info, Trash2, Sliders, Camera, Flame,
  Rocket, Trophy, Ban
} from "lucide-react";

interface SpecGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpecGuideModal({ isOpen, onClose }: SpecGuideModalProps) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!isOpen) return null;

  const tabs = [
    { id: "overview", label: "Overview", desc: "The desk analogy & golden rule", icon: BookOpen },
    { id: "hardware", label: "Core Engine", desc: "CPU, RAM & Storage speed", icon: Cpu },
    { id: "display_software", label: "UI & Screen", desc: "Display, OS updates & bloatware", icon: Monitor },
    { id: "battery", label: "Battery Power", desc: "Capacity & charging speeds", icon: Battery },
    { id: "cheatsheet", label: "Cheat Sheet", desc: "Buying rules & biggest mistakes", icon: Sliders },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/70 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Box */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-[90vh] md:h-[80vh] overflow-hidden flex flex-col relative z-10 border border-neutral-200/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-950 via-neutral-900 to-indigo-950 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-full bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/10">
              <BookOpen size={20} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 uppercase">
                Smartphone Specs Guide <Zap size={14} className="text-yellow-400 fill-yellow-400" />
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-300 font-medium">Clear metrics to bypass marketing hype and buy smart.</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Main Workspace Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-0">
          
          {/* Sidebar Tabs */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-100 bg-neutral-50/70 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible md:overflow-y-auto select-none shrink-0 hide-scrollbar">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all duration-200 text-left shrink-0 md:shrink ${
                    isActive 
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/15" 
                      : "hover:bg-neutral-200/50 text-neutral-600 hover:text-neutral-900"
                  }`}
                >
                  <TabIcon size={18} className={isActive ? "text-white" : "text-neutral-500"} />
                  <div className="hidden md:block">
                    <p className="text-xs font-black uppercase tracking-tight">{tab.label}</p>
                    <p className={`text-[9px] ${isActive ? "text-blue-100" : "text-neutral-400"} font-medium`}>{tab.desc}</p>
                  </div>
                  <span className="md:hidden text-xs font-bold">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-neutral-50/30 hide-scrollbar space-y-6">
            
            {/* TAB: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-6 animate-fade-in">
                {/* Intro message */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-3">
                  <h3 className="text-lg font-black text-neutral-900">Bypass the Marketing Jargon</h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    Smartphones today throw around empty buzzwords like <em className="text-blue-600 font-bold bg-blue-50/50 px-1.5 py-0.5 rounded not-italic">“AI HyperEngine,”</em> <em className="text-blue-600 font-bold bg-blue-50/50 px-1.5 py-0.5 rounded not-italic">“SuperCharge,”</em> or <em className="text-blue-600 font-bold bg-blue-50/50 px-1.5 py-0.5 rounded not-italic">“108MP UltraSensing.”</em> This guide translates technical jargon into objective hardware metrics so you can judge real-world speed and lifespan instantly.
                  </p>
                </div>

                {/* Desk analogy visual */}
                <div className="bg-white rounded-2xl p-5 border border-neutral-200/80 shadow-sm space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    🧠 The Workstation Desk Analogy
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                    Think of your smartphone's speed like an office desk setup:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-2">
                    <div className="bg-blue-50/80 border border-blue-100 rounded-2xl p-4 text-center space-y-2 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mx-auto text-blue-600">
                        <Cpu size={20} />
                      </div>
                      <span className="block text-xs font-black text-neutral-800 uppercase tracking-tight">Processor</span>
                      <span className="block text-[10px] text-neutral-500 font-semibold leading-tight">Your brain speed & efficiency</span>
                    </div>

                    <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 text-center space-y-2 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center mx-auto text-indigo-600">
                        <HardDrive size={20} />
                      </div>
                      <span className="block text-xs font-black text-neutral-800 uppercase tracking-tight">RAM</span>
                      <span className="block text-[10px] text-neutral-500 font-semibold leading-tight">Desktop size to keep files open</span>
                    </div>

                    <div className="bg-purple-50/80 border border-purple-100 rounded-2xl p-4 text-center space-y-2 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mx-auto text-purple-600">
                        <HardDrive size={20} className="rotate-90" />
                      </div>
                      <span className="block text-xs font-black text-neutral-800 uppercase tracking-tight">Storage</span>
                      <span className="block text-[10px] text-neutral-500 font-semibold leading-tight">Filing cabinet storage speed</span>
                    </div>

                    <div className="bg-emerald-50/80 border border-emerald-100 rounded-2xl p-4 text-center space-y-2 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mx-auto text-emerald-600">
                        <Monitor size={20} />
                      </div>
                      <span className="block text-xs font-black text-neutral-800 uppercase tracking-tight">Display</span>
                      <span className="block text-[10px] text-neutral-500 font-semibold leading-tight">Monitor clarity and refresh speed</span>
                    </div>

                    <div className="bg-amber-50/80 border border-amber-100 rounded-2xl p-4 text-center space-y-2 hover:shadow-md transition-shadow">
                      <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-500">
                        <Coffee size={20} />
                      </div>
                      <span className="block text-xs font-black text-neutral-800 uppercase tracking-tight">Battery</span>
                      <span className="block text-[10px] text-neutral-500 font-semibold leading-tight">Worker energy limit before a recharge</span>
                    </div>
                  </div>

                  <p className="text-[10px] text-neutral-400 italic text-center pt-2 font-semibold border-t border-neutral-100">
                    "If one single component bottlenecks, the entire phone feels laggy."
                  </p>
                </div>

                {/* Golden/Final Rule */}
                <div className="bg-gradient-to-br from-indigo-900 to-violet-950 text-white rounded-2xl p-6 text-center space-y-3 border border-indigo-950 relative overflow-hidden shadow-lg">
                  <div className="absolute -top-10 -left-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
                  <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-violet-500/10 rounded-full blur-2xl" />
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-300 block">🏁 The Golden Rule</span>
                  <blockquote className="text-xs sm:text-sm font-bold text-indigo-50 leading-relaxed italic max-w-2xl mx-auto">
                    "A great phone isn’t about one massive spec. It’s about balance: a fast processor + fast RAM type + fast storage standard + clean software + an AMOLED display. Balanced configurations are what feel premium every single day."
                  </blockquote>
                </div>
              </div>
            )}

            {/* TAB: CORE ENGINE */}
            {activeTab === "hardware" && (
              <div className="space-y-6 animate-fade-in">
                {/* 1. Processor */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-50 text-blue-600 rounded-xl"><Cpu size={18} /></div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Processor (The Engine)</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full tracking-wider border border-blue-100">Core Performance</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">What it does:</p>
                      <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                        Runs games, system tasks, photo processing, and AI apps. A weak processor creates lag, thermal heating, and makes the phone feel slow within a year.
                      </p>
                      <div className="text-xs text-neutral-700 space-y-1.5 font-semibold bg-neutral-50 p-3.5 rounded-xl border border-neutral-100">
                        <p className="flex items-center gap-1.5 text-neutral-700"><Rocket size={14} className="text-blue-500" /> <span className="font-bold text-neutral-800">Flagships:</span> Instant loads & max-settings gaming.</p>
                        <p className="flex items-center gap-1.5 text-neutral-700"><AlertTriangle size={14} className="text-amber-500" /> <span className="font-bold text-neutral-800">Budget chips:</span> Slow camera opening, micro-stutters.</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2.5">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Performance Benchmarks:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5"><Trophy size={14} className="text-amber-500 fill-amber-500/20" /> 1.5M+ AnTuTu (Flagship)</span>
                          <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Top Tier</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-blue-950 flex items-center gap-1.5"><Zap size={14} className="text-blue-500 fill-blue-500/20" /> 600K – 1M AnTuTu (Mid-Range)</span>
                          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Sweet Spot</span>
                        </div>
                        <div className="flex items-center justify-between bg-rose-50/50 border border-rose-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-rose-950 flex items-center gap-1.5"><Ban size={14} className="text-rose-500" /> Below 400K AnTuTu (Budget)</span>
                          <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Avoid if possible</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-xl text-[11px] text-blue-900 leading-relaxed font-medium">
                    <strong>Pro Tip:</strong> Look at benchmarks like AnTuTu rather than core counts. An "Octa-core" processor in a budget phone is often 4x slower than a flagship "Octa-core".
                  </div>
                </div>

                {/* 2. RAM Type */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-50 text-indigo-650 rounded-xl"><HardDrive size={18} /></div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">RAM Version Type</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full tracking-wider border border-indigo-100">Speed Standard</span>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Why it matters:</p>
                      <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                        RAM speed dictates how fast your phone swaps apps and loads data. RAM capacity (like 8GB or 12GB) gives space, but the **RAM Type** (LPDDR4X vs LPDDR5X) determines the speed limit.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">RAM Type Standards:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-emerald-950">🚀 LPDDR5X</span>
                          <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold">10/10 Rating</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-blue-950">✅ LPDDR5</span>
                          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold">6/10 Rating</span>
                        </div>
                        <div className="flex items-center justify-between bg-orange-50/50 border border-orange-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-orange-950">⚠️ LPDDR4X (Older)</span>
                          <span className="text-[9px] bg-orange-600 text-white px-2 py-0.5 rounded-md font-bold">3/10 Rating</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Storage Speed */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-50 text-purple-650 rounded-xl"><HardDrive size={18} className="rotate-90" /></div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Storage Standards (Read/Write Speed)</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full tracking-wider border border-purple-100">Filing Cabinet Speed</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">What it does:</p>
                      <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                        Determines how fast your phone installs apps, copies files, saves photos, and starts games. High CPU speed bottlenecked by slow storage version feels laggy and sluggish.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">UFS Versions Performance:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-emerald-950">🚀 UFS 4.0</span>
                          <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold">Blazing Fast</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-blue-950">✅ UFS 3.1</span>
                          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold">Excellent Choice</span>
                        </div>
                        <div className="flex items-center justify-between bg-rose-50/50 border border-rose-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-rose-950">🚫 UFS 2.2 / eMMC</span>
                          <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-bold">Budget & Slow</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: UI & SCREEN */}
            {activeTab === "display_software" && (
              <div className="space-y-6 animate-fade-in">
                {/* 1. Display Screen */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl"><Monitor size={18} /></div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Display panel & smoothness</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full tracking-wider border border-emerald-100">Visual Quality</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Why it matters:</p>
                      <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                        You look at the screen all day. Display technology has a higher impact on daily satisfaction than raw benchmarking numbers.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">The Display Standard:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-emerald-950">🌈 AMOLED / OLED</span>
                          <span className="text-[9px] text-emerald-700 bg-emerald-55 font-bold px-2 py-0.5 rounded-md">Vibrant Colors & True Blacks</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-blue-950">⚡ 120Hz+ Refresh Rate</span>
                          <span className="text-[9px] text-blue-700 bg-blue-55 font-bold px-2 py-0.5 rounded-md">Ultra-Smooth Scrolling</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Software Cleanliness */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-xl"><Shield size={18} /></div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Software UI experience</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full tracking-wider border border-rose-100">Cleanliness</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">The UI impact:</p>
                      <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                        Intrusive lockscreen ads, push spam notifications, duplicate app stores, and unremovable bloatware ruin even flagship hardware speed.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">UI Tiers Ranking:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-emerald-950">🧼 Clean & Spam-Free</span>
                          <span className="text-[9px] bg-emerald-600 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Pixel / Nothing / Apple</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-blue-950">⚠️ Moderate (Removable Bloat)</span>
                          <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">OneUI / OxygenOS</span>
                        </div>
                        <div className="flex items-center justify-between bg-rose-50/50 border border-rose-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-rose-950">🚨 Heavy Ads & Spam Ads</span>
                          <span className="text-[9px] bg-rose-600 text-white px-2 py-0.5 rounded-md font-bold uppercase tracking-wider">Tecno / Infinix / HyperOS</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: BATTERY POWER */}
            {activeTab === "battery" && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl"><Battery size={18} /></div>
                      <h4 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Battery Endurance & Charging</h4>
                    </div>
                    <span className="text-[9px] font-black uppercase text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full tracking-wider border border-amber-100">Endurance</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Battery capacity vs Speed:</p>
                      <p className="text-xs text-neutral-600 leading-relaxed font-medium">
                        Capacity (mAh) determines how long the phone runs, whereas Charging Speed (Watts) determines how quickly it refills. Fast charging changes how you use your phone — a 20-minute top-up can replace overnight charging habits.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Ideal Sweet Spots:</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between bg-emerald-50/50 border border-emerald-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-emerald-950 flex items-center gap-1.5"><Battery size={14} className="text-emerald-600 fill-emerald-600/20" /> 5000mAh+ Capacity</span>
                          <span className="text-[9px] text-emerald-700 bg-emerald-55 font-bold px-2 py-0.5 rounded-md">Easy All-Day Lifespan</span>
                        </div>
                        <div className="flex items-center justify-between bg-blue-50/50 border border-blue-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-blue-950 flex items-center gap-1.5"><Zap size={14} className="text-blue-500 fill-blue-500/20" /> 67W – 120W+ Fast Charge</span>
                          <span className="text-[9px] text-blue-700 bg-blue-55 font-bold px-2 py-0.5 rounded-md">Fully Charged in 25 Mins</span>
                        </div>
                        <div className="flex items-center justify-between bg-rose-50/50 border border-rose-100 px-3 py-2 rounded-xl">
                          <span className="text-xs font-black text-rose-950 flex items-center gap-1.5"><Ban size={14} className="text-rose-500" /> 15W – 25W Charging</span>
                          <span className="text-[9px] text-rose-700 bg-rose-55 font-bold px-2 py-0.5 rounded-md">Takes ~2 Hours</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: CHEAT SHEET */}
            {activeTab === "cheatsheet" && (
              <div className="space-y-6 animate-fade-in">
                {/* 10-Point Score System */}
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-sm space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-550 flex items-center gap-1.5">
                    🎯 Our 10-Point Score Guidelines
                  </h4>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-1.5">
                      <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1">
                        <Zap size={14} className="text-blue-500" /> Gaming & Speed
                      </span>
                      <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">
                        Determined solely by Chipset (AnTuTu score) and RAM speed version type.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-1.5">
                      <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1">
                        <Camera size={14} className="text-pink-500" /> Camera Score
                      </span>
                      <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">
                        Weights optical image stabilization (OIS), sensor size, low-light capacity, and front cam.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-1.5">
                      <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1">
                        <Shield size={14} className="text-indigo-500" /> Reliability
                      </span>
                      <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">
                        Based on software update commitment years, UI spam level, and battery lifespan capacity.
                      </p>
                    </div>

                    <div className="bg-neutral-50 p-4 rounded-xl border border-neutral-100 space-y-1.5">
                      <span className="text-xs font-extrabold text-neutral-900 flex items-center gap-1">
                        <Star size={14} className="text-amber-500 fill-amber-500" /> Value (VFM)
                      </span>
                      <p className="text-[10px] text-neutral-500 leading-relaxed font-semibold">
                        Calculates how much hardware performance you receive for the price you pay.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Quick Cheat Sheet table */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-5 shadow-sm space-y-3 overflow-hidden">
                  <h4 className="text-xs font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1.5">
                    📋 Quick Buying Rules
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-500">
                          <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">If You Want...</th>
                          <th className="py-2.5 px-3 font-bold uppercase tracking-wider text-[10px]">Prioritize...</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100 font-semibold text-neutral-700">
                        <tr>
                          <td className="py-2.5 px-3 font-black text-neutral-900">Gaming</td>
                          <td className="py-2.5 px-3"><span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded-full text-[10px]">Processor + LPDDR5X RAM</span></td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-black text-neutral-900">Long-term Use</td>
                          <td className="py-2.5 px-3"><span className="bg-rose-50 text-rose-800 px-2 py-0.5 rounded-full text-[10px]">4+ Years OS Updates + Clean UI</span></td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-black text-neutral-900">Smooth Fluidity</td>
                          <td className="py-2.5 px-3"><span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-full text-[10px]">AMOLED Panel + 120Hz Refresh</span></td>
                        </tr>
                        <tr>
                          <td className="py-2.5 px-3 font-black text-neutral-900">Fast Storage</td>
                          <td className="py-2.5 px-3"><span className="bg-purple-50 text-purple-800 px-2 py-0.5 rounded-full text-[10px]">UFS 3.1 or UFS 4.0 Standard</span></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Biggest Mistakes panel */}
                <div className="bg-rose-50/60 border border-rose-100 rounded-2xl p-5 space-y-3">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle size={16} /> 🚨 Biggest Mistakes Buyers Make
                  </h4>
                  <ul className="space-y-2 text-xs text-rose-950 font-semibold">
                    <li className="flex items-center gap-2">
                      <span className="text-rose-500 font-bold">❌</span>
                      <span>Buying based only on megapixel counts instead of optical sensor stabilization (OIS).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-500 font-bold">❌</span>
                      <span>Ignoring the storage version type (UFS 2.2 will bottleneck flagship processors).</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-500 font-bold">❌</span>
                      <span>Opting for budget devices with heavy adware systems that spam lockscreens.</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-rose-500 font-bold">❌</span>
                      <span>Ignoring remaining update commitment years on older flagships.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex justify-between items-center bg-neutral-50 shrink-0 select-none">
          <div className="flex items-center gap-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
            <Flame size={12} className="text-orange-500 fill-orange-500 animate-pulse" /> Tech Reviewer Grade
          </div>
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-700 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-500/10"
          >
            I'm Ready!
          </button>
        </div>

      </div>
    </div>
  );
}

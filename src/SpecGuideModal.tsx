import React from "react";
import { X, Cpu, Monitor, Battery, Camera, Shield, Star, BookOpen, HelpCircle, HardDrive, Smartphone } from "lucide-react";

interface SpecGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpecGuideModal({ isOpen, onClose }: SpecGuideModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col relative z-10 border border-neutral-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-150 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-violet-50/50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <BookOpen size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-neutral-900 leading-tight">Smartphone Specs Demystified</h2>
              <p className="text-xs text-neutral-500 font-medium">A simplified guide to choosing the perfect device</p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 max-h-[calc(85vh-8rem)]">
          
          {/* Quick Intro */}
          <div className="bg-gradient-to-br from-blue-50 to-violet-50 rounded-xl p-4 border border-blue-100/50 text-xs text-blue-900 font-medium leading-relaxed">
            <span className="font-extrabold uppercase bg-blue-200/60 text-blue-800 px-1.5 py-0.5 rounded mr-2">Analogy Guide</span>
            Don't get lost in megahertz and gigabytes! Think of a phone like a workstation: the <strong>Processor</strong> is the worker's brain speed, <strong>RAM</strong> is the size of their desk, <strong>Storage</strong> is the speed of their filing cabinet, and <strong>Battery</strong> is how long they can work before needing to rest.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Processor / CPU */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/30 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-blue-600 mb-2">
                <Cpu size={18} />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Processor & Performance</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                The engine of the phone. We rate processors on a <strong>1 to 10 scale</strong> mapped from industry-standard AnTuTu benchmark scores.
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>AnTuTu Score:</strong> Represents absolute raw power. 1.5M+ is flagship (gaming/heavy workloads), while 400K-800K is ideal for daily social media and multitasking.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-blue-500 font-bold">•</span>
                  <span><strong>Processor Tiers:</strong> Snapdragon 8/Dimensity 9 are premium powerhouses. Snapdragon 7/Dimensity 8 offer high-end performance at affordable mid-range prices.</span>
                </li>
              </ul>
            </div>

            {/* RAM & Storage */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/30 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-violet-600 mb-2">
                <HardDrive size={18} />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">RAM & Storage Types</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Determines multitasking smoothness and load times. Look beyond capacity (e.g. 128GB/256GB) to the technology standard.
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>RAM Type (LPDDR5X vs LPDDR4X):</strong> LPDDR5/5X operates at double the speed of older LPDDR4X, keeping background apps open longer without lag.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-violet-500 font-bold">•</span>
                  <span><strong>Storage Type (UFS 4.0 vs UFS 2.2):</strong> UFS 4.0 reads/writes files 4x faster than UFS 2.2. A phone with UFS 4.0 will install apps and load games significantly faster.</span>
                </li>
              </ul>
            </div>

            {/* Display & Refresh Rate */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/30 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <Monitor size={18} />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Screen & Fluidity</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Directly impacts everything you see and touch. A high-quality display makes the phone feel twice as responsive.
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong>AMOLED/OLED vs LCD:</strong> AMOLED displays light up pixels individually, providing pitch-black dark modes, infinite contrast, and better battery efficiency. LCD is found in entry-level phones.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span><strong>Refresh Rate (Hz):</strong> Higher refresh rates (90Hz, 120Hz, 144Hz) refresh the screen more times per second, rendering scrolling and app animations butter-smooth.</span>
                </li>
              </ul>
            </div>

            {/* Battery & Charging */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/30 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <Battery size={18} />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Battery & Charging Speed</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Determines how long your phone stays alive and how long you are tethered to a wall outlet.
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Battery Capacity (mAh):</strong> The fuel tank. 5000mAh is the standard mid-range capacity, providing 1 to 1.5 days of typical use. 6000mAh+ easily pushes into 2 days.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-500 font-bold">•</span>
                  <span><strong>Fast Charging (W) & Est. Charge Time:</strong> Higher wattage (W) pumps energy faster. We calculate estimated minutes to 100% using an engineering curve formula based on battery capacity and charging wattage.</span>
                </li>
              </ul>
            </div>

            {/* Camera Scores */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/30 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-pink-650 mb-2">
                <Camera size={18} />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Camera Quality Ratings</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Megapixels (MP) are highly misleading marketing tricks. High MP doesn't guarantee a good image.
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="text-pink-500 font-bold">•</span>
                  <span><strong>Camera Score (1-10):</strong> Calculated using a complex matrix of real-world DXOMARK ratings (for reviewed flagships) and detailed camera hardware specs (sensor size, lens aperture, optical image stabilization).</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-pink-500 font-bold">•</span>
                  <span><strong>Selfie Score:</strong> Focuses specifically on front sensor size and capability, critical for video calling and clean social media shots.</span>
                </li>
              </ul>
            </div>

            {/* OS Support & Software Experience */}
            <div className="p-4 rounded-xl border border-neutral-200/80 bg-neutral-50/30 hover:border-blue-200 transition-colors">
              <div className="flex items-center gap-2 text-indigo-650 mb-2">
                <Shield size={18} />
                <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-800">Longevity, UI & OS Updates</h3>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed">
                Determines how many years of security and features you get, and whether the operating system is clean or cluttered.
              </p>
              <ul className="mt-3 space-y-2 text-xs">
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span><strong>OS Updates Commitment:</strong> Apple (6 yrs), Google (7 yrs), and Samsung (4-7 yrs) lead the industry. Budget brands often offer only 1-2 years of updates.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-indigo-500 font-bold">•</span>
                  <span><strong>OS Rating & UI Bloat:</strong> Clean, ad-free operating systems (iOS, Pixel UI, Nothing OS) score highest. Cluttered interfaces loaded with third-party pre-installed apps (like Poco/Redmi) receive lower scores.</span>
                </li>
              </ul>
            </div>

          </div>

          {/* Curation Scoring Matrix explained */}
          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-5">
            <h3 className="font-extrabold text-sm text-neutral-800 mb-3 flex items-center gap-1.5">
              <Star size={16} className="text-amber-500 fill-amber-500" /> How Our Spec Ratings Work
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-extrabold text-neutral-800 block uppercase tracking-wider text-[10px]">Performance Score</span>
                <span className="text-neutral-500 font-medium">AnTuTu raw benchmark + LPDDR type + UFS storage standard + screen refresh rate.</span>
              </div>
              <div className="space-y-1">
                <span className="font-extrabold text-neutral-800 block uppercase tracking-wider text-[10px]">Camera Score</span>
                <span className="text-neutral-500 font-medium">DXOMARK tier + Main MP + Front MP + optical stabilizer presence + price tier adjustment.</span>
              </div>
              <div className="space-y-1">
                <span className="font-extrabold text-neutral-800 block uppercase tracking-wider text-[10px]">Reliability Score</span>
                <span className="text-neutral-500 font-medium">OS updates left + UI bloat factor + battery capacity + physical materials build quality.</span>
              </div>
              <div className="space-y-1">
                <span className="font-extrabold text-neutral-800 block uppercase tracking-wider text-[10px]">Value (VFM) Score</span>
                <span className="text-neutral-500 font-medium">Calculates overall hardware features divided by actual price in Indian Rupees.</span>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-150 flex justify-end bg-neutral-50">
          <button 
            onClick={onClose} 
            className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs uppercase tracking-wider transition-colors shadow-sm"
          >
            Got It, Thanks!
          </button>
        </div>

      </div>
    </div>
  );
}

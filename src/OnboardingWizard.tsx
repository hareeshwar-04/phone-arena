import { useState, useCallback } from "react";
import {
  Smartphone, Gamepad2, Camera, Shield, BatteryFull, Zap,
  Monitor, ChevronRight, ChevronLeft, Sparkles, X, Check,
  IndianRupee, Cpu, RefreshCw
} from "lucide-react";
import type { FilterConfig } from "./types";
import { DEFAULT_FILTERS } from "./types";

import type { PhoneSpec, UserPhoneSpecs } from "./types";
import { predictUserPhoneSpecs } from "./types";

interface WizardProps {
  phones: PhoneSpec[];
  onComplete: (filters: FilterConfig, userPhone: UserPhoneSpecs | null) => void;
  onSkip: () => void;
}

type UsageType = "gaming" | "photography" | "daily" | "work" | "student";
type BudgetTier = "entry" | "budget" | "mid" | "uppermid" | "premium" | "flagship";

interface WizardState {
  usage: UsageType[];
  budget: BudgetTier | null;
  priorityBattery: boolean;
  priorityCamera: boolean;
  priorityPerformance: boolean;
  priorityDisplay: boolean;
  priorityDurability: boolean;
  fastCharging: boolean;
  preferredBrands: string[];
}

const USAGE_OPTIONS: { key: UsageType; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "gaming", label: "Gaming", desc: "BGMI, Genshin, COD Mobile", icon: <Gamepad2 size={22} /> },
  { key: "photography", label: "Photography", desc: "Instagram, vlogs, reels", icon: <Camera size={22} /> },
  { key: "daily", label: "Daily Driver", desc: "Social media, streaming, calls", icon: <Smartphone size={22} /> },
  { key: "work", label: "Productivity", desc: "Email, docs, multitasking", icon: <Monitor size={22} /> },
  { key: "student", label: "Student", desc: "Notes, PDFs, long battery life", icon: <Shield size={22} /> },
];

const BUDGET_OPTIONS: { key: BudgetTier; label: string; range: string; emoji: string }[] = [
  { key: "entry", label: "Entry Level", range: "Under ₹10,000", emoji: "🪙" },
  { key: "budget", label: "Budget", range: "₹10,000 – ₹20,000", emoji: "💰" },
  { key: "mid", label: "Mid-Range", range: "₹20,000 – ₹35,000", emoji: "⚡" },
  { key: "uppermid", label: "Upper Mid", range: "₹35,000 – ₹55,000", emoji: "🔥" },
  { key: "premium", label: "Premium", range: "₹55,000 – ₹85,000", emoji: "✨" },
  { key: "flagship", label: "Flagship", range: "₹85,000+", emoji: "👑" },
];

const BRAND_OPTIONS = [
  "Samsung", "Apple", "OnePlus", "Xiaomi", "Realme", "POCO",
  "Vivo", "OPPO", "Motorola", "Nothing", "iQOO", "Google"
];

const PRIORITY_OPTIONS: { key: string; label: string; desc: string; icon: React.ReactNode }[] = [
  { key: "priorityPerformance", label: "Raw Power", desc: "Fastest processor & RAM", icon: <Cpu size={20} /> },
  { key: "priorityCamera", label: "Camera Quality", desc: "Best photos & videos", icon: <Camera size={20} /> },
  { key: "priorityBattery", label: "Battery Life", desc: "All-day endurance", icon: <BatteryFull size={20} /> },
  { key: "priorityDisplay", label: "Display", desc: "Smooth, vibrant screen", icon: <Monitor size={20} /> },
  { key: "priorityDurability", label: "Long-term Use", desc: "Updates & build quality", icon: <Shield size={20} /> },
  { key: "fastCharging", label: "Fast Charging", desc: "65W+ charging speed", icon: <Zap size={20} /> },
];

function buildFiltersFromWizard(state: WizardState): FilterConfig {
  const filters: FilterConfig = { ...DEFAULT_FILTERS };

  // Budget mapping
  switch (state.budget) {
    case "entry":
      filters.priceRange = [5000, 10000];
      break;
    case "budget":
      filters.priceRange = [10000, 20000];
      break;
    case "mid":
      filters.priceRange = [20000, 35000];
      break;
    case "uppermid":
      filters.priceRange = [35000, 55000];
      break;
    case "premium":
      filters.priceRange = [55000, 85000];
      break;
    case "flagship":
      filters.priceRange = [85000, 250000];
      break;
    default:
      filters.priceRange = [5000, 250000];
  }

  // Usage → weight mapping
  let performanceW = 50, reliabilityW = 50, cameraW = 50, osW = 50;

  if (state.usage.includes("gaming")) { performanceW = 100; }
  if (state.usage.includes("photography")) { cameraW = 100; }
  if (state.usage.includes("daily")) { reliabilityW = 70; cameraW = 70; osW = 80; }
  if (state.usage.includes("work")) { reliabilityW = 80; osW = 80; }
  if (state.usage.includes("student")) { reliabilityW = 90; }

  // Priority overrides
  if (state.priorityPerformance) { performanceW = Math.max(performanceW, 100); }
  if (state.priorityCamera) { cameraW = Math.max(cameraW, 100); }
  if (state.priorityDurability) { reliabilityW = Math.max(reliabilityW, 100); osW = Math.max(osW, 100); }
  if (state.priorityBattery) { filters.batteryMin = 5000; }
  if (state.fastCharging) { filters.chargingMin = 65; }
  if (state.priorityDisplay) { filters.refreshRateMin = 120; }

  const perfEnabled = state.priorityPerformance || state.usage.includes("gaming");
  const relEnabled = state.priorityDurability || state.usage.includes("student");
  const camEnabled = state.priorityCamera || state.usage.includes("photography");
  const osEnabled = state.priorityDurability || state.usage.includes("daily") || state.usage.includes("work");
  const hasAnyEnabled = perfEnabled || relEnabled || camEnabled || osEnabled;

  filters.weights = { 
    performance: performanceW, 
    reliability: reliabilityW, 
    camera: cameraW, 
    os: osW,
    performanceEnabled: perfEnabled || !hasAnyEnabled,
    reliabilityEnabled: relEnabled,
    cameraEnabled: camEnabled,
    osEnabled: osEnabled
  };

  // Brand preference
  if (state.preferredBrands.length > 0) {
    filters.selectedBrands = [...state.preferredBrands];
  }

  return filters;
}

export function OnboardingWizard({ phones, onComplete, onSkip }: WizardProps) {
  const [step, setStep] = useState(0);
  const [state, setState] = useState<WizardState>({
    usage: [],
    budget: null,
    priorityBattery: false,
    priorityCamera: false,
    priorityPerformance: false,
    priorityDisplay: false,
    priorityDurability: false,
    fastCharging: false,
    preferredBrands: [],
  });

  // Current Phone Specs States (Streamlined prediction model)
  const [currentPhoneBrand, setCurrentPhoneBrand] = useState("Samsung");
  const [currentPhoneBattery, setCurrentPhoneBattery] = useState(5000);
  const [currentPhoneAntutu, setCurrentPhoneAntutu] = useState("");

  const totalSteps = 5;

  const toggleUsage = useCallback((key: UsageType) => {
    setState((s) => ({
      ...s,
      usage: s.usage.includes(key) ? s.usage.filter((u) => u !== key) : [...s.usage, key],
    }));
  }, []);

  const togglePriority = useCallback((key: string) => {
    setState((s) => ({ ...s, [key]: !(s as any)[key] }));
  }, []);

  const toggleBrand = useCallback((brand: string) => {
    setState((s) => ({
      ...s,
      preferredBrands: s.preferredBrands.includes(brand)
        ? s.preferredBrands.filter((b) => b !== brand)
        : [...s.preferredBrands, brand],
    }));
  }, []);

  const handleFinish = useCallback(() => {
    const filters = buildFiltersFromWizard(state);
    
    let userPhone: UserPhoneSpecs | null = null;
    const antutu = parseInt(currentPhoneAntutu) || 0;
    
    if (antutu > 0) {
      userPhone = predictUserPhoneSpecs({
        brand: currentPhoneBrand,
        antutuScore: antutu,
        batteryMah: currentPhoneBattery
      });
    }
    
    onComplete(filters, userPhone);
  }, [state, onComplete, currentPhoneBrand, currentPhoneBattery, currentPhoneAntutu]);

  const canProceed = () => {
    if (step === 0) return state.usage.length > 0;
    if (step === 1) return state.budget !== null;
    return true;
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-neutral-900/80 via-neutral-900/90 to-neutral-900/80 backdrop-blur-md" />

      {/* Wizard Card */}
      <div className="relative w-full max-w-xl bg-white dark:bg-neutral-900 sm:rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up rounded-t-2xl max-h-[90dvh] flex flex-col border border-transparent dark:border-neutral-800">
        {/* Header Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />

        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 z-10 text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-350 transition-colors p-1"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-6 pb-6 overflow-y-auto hide-scrollbar">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-neutral-100 dark:bg-neutral-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${
                    i < step ? "bg-blue-600 w-full" : i === step ? "bg-blue-500 w-full animate-pulse" : "w-0"
                  }`}
                  style={{ width: i <= step ? "100%" : "0%" }}
                />
              </div>
            ))}
          </div>

          {/* Step 0: Usage */}
          {step === 0 && (
            <div className="wizard-step">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">What will you use your phone for?</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Select all that apply</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                {USAGE_OPTIONS.map((opt) => {
                  const selected = state.usage.includes(opt.key);
                  return (
                    <button
                      key={opt.key}
                      onClick={() => toggleUsage(opt.key)}
                      className={`relative flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 ${
                        selected
                          ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20 shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                      }`}
                    >
                      <div className={`flex-shrink-0 ${selected ? "text-blue-600 dark:text-blue-400" : "text-neutral-400 dark:text-neutral-500"}`}>
                        {opt.icon}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold ${selected ? "text-blue-900 dark:text-blue-200" : "text-neutral-800 dark:text-neutral-200"}`}>{opt.label}</div>
                        <div className="text-[11px] text-neutral-500 dark:text-neutral-450 truncate">{opt.desc}</div>
                      </div>
                      {selected && (
                        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Budget */}
          {step === 1 && (
            <div className="wizard-step">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-950/30 flex items-center justify-center text-green-600 dark:text-green-400">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">What's your budget?</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">We'll filter phones in this range</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mt-5">
                {BUDGET_OPTIONS.map((opt) => {
                  const selected = state.budget === opt.key;
                  return (
                    <button
                      key={opt.key}
                      onClick={() => setState((s) => ({ ...s, budget: opt.key }))}
                      className={`flex flex-col items-center gap-1.5 px-4 py-4 rounded-xl border-2 transition-all duration-200 ${
                        selected
                          ? "border-green-500 bg-green-50 dark:bg-green-950/20 shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className={`text-sm font-bold ${selected ? "text-green-900 dark:text-green-200" : "text-neutral-800 dark:text-neutral-200"}`}>{opt.label}</span>
                      <span className="text-[11px] text-neutral-500 dark:text-neutral-450">{opt.range}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 2: Priorities */}
          {step === 2 && (
            <div className="wizard-step">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-950/30 flex items-center justify-center text-violet-600 dark:text-violet-400">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">What matters most to you?</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Select your top priorities</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-5">
                {PRIORITY_OPTIONS.map((opt) => {
                  const selected = (state as any)[opt.key];
                  return (
                    <button
                      key={opt.key}
                      onClick={() => togglePriority(opt.key)}
                      className={`relative flex flex-col items-center gap-2 px-3 py-4 rounded-xl border-2 transition-all duration-200 ${
                        selected
                          ? "border-violet-500 bg-violet-50 dark:bg-violet-950/20 shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                      }`}
                    >
                      <div className={`${selected ? "text-violet-600 dark:text-violet-400" : "text-neutral-400 dark:text-neutral-500"}`}>
                        {opt.icon}
                      </div>
                      <span className={`text-xs font-bold text-center ${selected ? "text-violet-900 dark:text-violet-200" : "text-neutral-700 dark:text-neutral-200"}`}>{opt.label}</span>
                      <span className="text-[10px] text-neutral-500 dark:text-neutral-450 text-center leading-tight">{opt.desc}</span>
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-violet-600 flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Brands */}
          {step === 3 && (
            <div className="wizard-step">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-orange-600 dark:text-orange-400">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Any brand preference?</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Optional — leave empty to see all brands</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  key="any-brand"
                  onClick={() => setState((s) => ({ ...s, preferredBrands: [] }))}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                    state.preferredBrands.length === 0
                      ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20 text-orange-850 dark:text-orange-300 shadow-sm"
                      : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-300 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                  }`}
                >
                  {state.preferredBrands.length === 0 && <Check size={12} className="inline mr-1.5 -mt-0.5" />}
                  Any Brand
                </button>
                {BRAND_OPTIONS.map((brand) => {
                  const selected = state.preferredBrands.includes(brand);
                  return (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className={`px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 cursor-pointer ${
                        selected
                          ? "border-orange-400 bg-orange-50 dark:bg-orange-950/20 text-orange-800 dark:text-orange-300 shadow-sm"
                          : "border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-850 text-neutral-600 dark:text-neutral-350 hover:border-neutral-300 dark:hover:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-800/40"
                      }`}
                    >
                      {selected && <Check size={12} className="inline mr-1.5 -mt-0.5" />}
                      {brand}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 4: Current Phone (Optional Upgrade Comparison) */}
          {step === 4 && (
            <div className="wizard-step space-y-5">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900 dark:text-white">Compare with your current phone?</h2>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">Optional — we'll predict your phone's specs and show upgrade %</p>
                </div>
              </div>

              {/* Brand Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Phone Brand
                </label>
                <select
                  value={currentPhoneBrand}
                  onChange={(e) => setCurrentPhoneBrand(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 px-3 py-2.5 text-sm rounded-xl text-neutral-800 dark:text-neutral-200 outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  {["Samsung", "Apple", "OnePlus", "Xiaomi", "Realme", "POCO", "Vivo", "OPPO", "Motorola", "Nothing", "iQOO", "Google", "Honor", "Asus", "Sony", "Other"].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Battery mAh Range Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  Battery Size (mAh)
                </label>
                <select
                  value={currentPhoneBattery}
                  onChange={(e) => setCurrentPhoneBattery(parseInt(e.target.value))}
                  className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 px-3 py-2.5 text-sm rounded-xl text-neutral-800 dark:text-neutral-200 outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value={3000}>~3,000 mAh (iPhone SE / Older)</option>
                  <option value={3500}>~3,500 mAh (Compact flagships)</option>
                  <option value={4000}>~4,000 mAh (iPhones / Mid-range)</option>
                  <option value={4500}>~4,500 mAh (Standard 2023–24)</option>
                  <option value={5000}>~5,000 mAh (Standard 2024–25)</option>
                  <option value={5500}>~5,500 mAh (Large battery)</option>
                  <option value={6000}>~6,000 mAh (Power devices)</option>
                  <option value={7000}>~7,000 mAh (Ultra endurance)</option>
                </select>
              </div>

              {/* AnTuTu Score Range Dropdown */}
              <div>
                <label className="block text-[10px] font-bold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider mb-1.5">
                  AnTuTu Score Range
                </label>
                <select
                  value={currentPhoneAntutu}
                  onChange={(e) => setCurrentPhoneAntutu(e.target.value)}
                  className="w-full bg-neutral-50 dark:bg-neutral-850 border border-neutral-200 dark:border-neutral-800 px-3 py-2.5 text-sm rounded-xl text-neutral-800 dark:text-neutral-200 outline-none focus:border-indigo-500 appearance-none cursor-pointer"
                >
                  <option value="">— Select AnTuTu range —</option>
                  <option value="150000">~150K (Entry-level / 2020 budget)</option>
                  <option value="300000">~300K (Budget 2022–23)</option>
                  <option value="450000">~450K (Mid-range 2022–23)</option>
                  <option value="600000">~600K (Upper-mid 2023)</option>
                  <option value="800000">~800K (Flagship 2022–23)</option>
                  <option value="1000000">~1M (Flagship 2023–24)</option>
                  <option value="1200000">~1.2M (Flagship 2024)</option>
                  <option value="1500000">~1.5M (Flagship 2025)</option>
                  <option value="2000000">~2M (Top-tier 2025–26)</option>
                  <option value="2500000">~2.5M+ (Latest flagships 2026)</option>
                </select>
                {/* Tip */}
                <div className="mt-2.5 px-3 py-2 rounded-lg bg-indigo-50/50 dark:bg-indigo-950/15 border border-indigo-100/50 dark:border-indigo-900/25">
                  <p className="text-[10px] text-indigo-700 dark:text-indigo-400 font-semibold leading-relaxed">
                    💡 <strong>Don't know your AnTuTu score?</strong> Google: <span className="font-mono bg-white/60 dark:bg-neutral-900/50 px-1 py-0.5 rounded text-[9px]">"your phone model" AnTuTu score</span> — e.g. "OnePlus Nord CE 3 AnTuTu score"
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <div>
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 dark:text-neutral-350 hover:text-neutral-900 dark:hover:text-white transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <button
                  onClick={onSkip}
                  className="text-sm font-medium text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors px-4 py-2"
                >
                  Skip for now
                </button>
              )}
            </div>
            <div>
              {step < totalSteps - 1 ? (
                <button
                  onClick={() => canProceed() && setStep(step + 1)}
                  disabled={!canProceed()}
                  className={`flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 ${
                    canProceed()
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-400 dark:text-neutral-500 cursor-not-allowed"
                  }`}
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 shadow-sm transition-all duration-200"
                >
                  <Sparkles size={16} /> Find My Perfect Phone
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

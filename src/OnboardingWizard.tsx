import { useState, useCallback } from "react";
import {
  Smartphone, Gamepad2, Camera, Shield, BatteryFull, Zap,
  Monitor, ChevronRight, ChevronLeft, Sparkles, X, Check,
  IndianRupee, Cpu, RefreshCw
} from "lucide-react";
import type { FilterConfig } from "./types";
import { DEFAULT_FILTERS } from "./types";

interface WizardProps {
  onComplete: (filters: FilterConfig) => void;
  onSkip: () => void;
}

type UsageType = "gaming" | "photography" | "daily" | "work" | "student";
type BudgetTier = "budget" | "mid" | "premium" | "flagship";

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
  { key: "budget", label: "Budget", range: "Under ₹20,000", emoji: "💰" },
  { key: "mid", label: "Mid-Range", range: "₹20,000 – ₹45,000", emoji: "⚡" },
  { key: "premium", label: "Premium", range: "₹45,000 – ₹85,000", emoji: "✨" },
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
    case "budget":
      filters.priceRange = [5000, 20000];
      break;
    case "mid":
      filters.priceRange = [15000, 45000];
      break;
    case "premium":
      filters.priceRange = [35000, 85000];
      break;
    case "flagship":
      filters.priceRange = [75000, 250000];
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

export function OnboardingWizard({ onComplete, onSkip }: WizardProps) {
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

  const totalSteps = 4;

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
    onComplete(filters);
  }, [state, onComplete]);

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
      <div className="relative w-full max-w-xl bg-white sm:rounded-2xl shadow-2xl overflow-hidden animate-fade-in-up rounded-t-2xl max-h-[90dvh] flex flex-col">
        {/* Header Gradient Bar */}
        <div className="h-1.5 bg-gradient-to-r from-blue-500 via-violet-500 to-pink-500" />

        {/* Skip Button */}
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 z-10 text-neutral-400 hover:text-neutral-600 transition-colors p-1"
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="px-5 sm:px-8 pt-5 sm:pt-6 pb-6 overflow-y-auto hide-scrollbar">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-6">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-neutral-100">
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
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">What will you use your phone for?</h2>
                  <p className="text-xs text-neutral-500">Select all that apply</p>
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
                          ? "border-blue-500 bg-blue-50 shadow-sm"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <div className={`flex-shrink-0 ${selected ? "text-blue-600" : "text-neutral-400"}`}>
                        {opt.icon}
                      </div>
                      <div className="min-w-0">
                        <div className={`text-sm font-semibold ${selected ? "text-blue-900" : "text-neutral-800"}`}>{opt.label}</div>
                        <div className="text-[11px] text-neutral-500 truncate">{opt.desc}</div>
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
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center text-green-600">
                  <IndianRupee size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">What's your budget?</h2>
                  <p className="text-xs text-neutral-500">We'll filter phones in this range</p>
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
                          ? "border-green-500 bg-green-50 shadow-sm"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className={`text-sm font-bold ${selected ? "text-green-900" : "text-neutral-800"}`}>{opt.label}</span>
                      <span className="text-[11px] text-neutral-500">{opt.range}</span>
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
                <div className="w-10 h-10 rounded-xl bg-violet-50 flex items-center justify-center text-violet-600">
                  <RefreshCw size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">What matters most to you?</h2>
                  <p className="text-xs text-neutral-500">Select your top priorities</p>
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
                          ? "border-violet-500 bg-violet-50 shadow-sm"
                          : "border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50"
                      }`}
                    >
                      <div className={`${selected ? "text-violet-600" : "text-neutral-400"}`}>
                        {opt.icon}
                      </div>
                      <span className={`text-xs font-bold text-center ${selected ? "text-violet-900" : "text-neutral-700"}`}>{opt.label}</span>
                      <span className="text-[10px] text-neutral-500 text-center leading-tight">{opt.desc}</span>
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
                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                  <Smartphone size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">Any brand preference?</h2>
                  <p className="text-xs text-neutral-500">Optional — leave empty to see all brands</p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 mt-5">
                <button
                  key="any-brand"
                  onClick={() => setState((s) => ({ ...s, preferredBrands: [] }))}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-all duration-200 cursor-pointer ${
                    state.preferredBrands.length === 0
                      ? "border-orange-400 bg-orange-50 text-orange-850 shadow-sm"
                      : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
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
                          ? "border-orange-400 bg-orange-50 text-orange-800 shadow-sm"
                          : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:bg-neutral-50"
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

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-4 border-t border-neutral-100">
            <div>
              {step > 0 ? (
                <button
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                >
                  <ChevronLeft size={16} /> Back
                </button>
              ) : (
                <button
                  onClick={onSkip}
                  className="text-sm font-medium text-neutral-400 hover:text-neutral-600 transition-colors px-4 py-2"
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
                      ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm shadow-blue-200"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  }`}
                >
                  Continue <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold bg-gradient-to-r from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 shadow-sm shadow-blue-200 transition-all duration-200"
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

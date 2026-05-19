import { useState } from "react";
import { X, ShieldCheck, FileText, BadgePercent, Scale } from "lucide-react";

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: "terms" | "privacy" | "affiliate";
}

export function LegalModal({ isOpen, onClose, initialTab = "terms" }: LegalModalProps) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync state if initialTab changes while closed/opened
  useState(() => {
    setActiveTab(initialTab);
  });

  if (!isOpen) return null;

  const tabs = [
    { id: "terms", label: "Terms of Service", desc: "User agreement & site rules", icon: Scale },
    { id: "privacy", label: "Privacy Policy", desc: "Data collection & cookies", icon: ShieldCheck },
    { id: "affiliate", label: "Affiliate Disclosure", desc: "Monetization details", icon: BadgePercent },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-neutral-900/70 backdrop-blur-md transition-opacity duration-300" 
        onClick={onClose} 
      />
      
      {/* Modal Box */}
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl h-[85vh] md:h-[75vh] overflow-hidden flex flex-col relative z-10 border border-neutral-200/80 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-gradient-to-r from-neutral-950 via-neutral-900 to-indigo-950 text-white relative">
          <div className="absolute top-0 right-0 w-32 h-full bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/10 rounded-xl border border-white/10">
              <FileText size={20} className="text-indigo-400" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-black tracking-tight flex items-center gap-1.5 uppercase">
                Legal & Policy Center
              </h2>
              <p className="text-[10px] sm:text-xs text-neutral-300 font-medium">Compliance, user safety, and affiliate disclosures.</p>
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
          <div className="w-full md:w-60 border-b md:border-b-0 md:border-r border-neutral-100 bg-neutral-50/70 p-3 flex md:flex-col gap-1.5 overflow-x-auto md:overflow-x-visible md:overflow-y-auto select-none shrink-0 hide-scrollbar">
            {tabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
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
            
            {/* TAB: TERMS OF SERVICE */}
            {activeTab === "terms" && (
              <div className="space-y-4 animate-fade-in text-xs text-neutral-600 leading-relaxed font-medium">
                <h3 className="text-base font-black text-neutral-900 border-b border-neutral-100 pb-2">Terms of Service</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Last updated: May 2026</p>
                
                <p>
                  Welcome to <strong>PhoneArena India</strong> ("we," "us," or "our"). By accessing or using our smartphone comparison engine website, you agree to comply with and be bound by the following terms and conditions. If you do not agree, please do not use our services.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">1. Use of the Site</h4>
                <p>
                  Our platform provides free smartphone specifications, estimated benchmark evaluations, price aggregates, and custom comparison rankings. This information is for personal, non-commercial evaluation purposes only. You agree not to scrape, copy, or redistribute our computational score engines or data matrices without written consent.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">2. Independent Evaluation Policy</h4>
                <p>
                  All performance (AnTuTu), camera, and reliability scores are derived through our custom evaluation formulas and public metrics. We make no guarantee of exact performance match. We are not officially affiliated with Apple, Samsung, Google, OnePlus, Xiaomi, Oppo, Vivo, or any other trademark owner listed on this platform.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">3. Disclaimers & Warranties</h4>
                <p>
                  This website is provided on an "as-is" and "as-available" basis. While we strive to maintain the absolute accuracy of technical specifications and live prices, we do not warrant that details are error-free or current. Retail pricing, specifications, and regional availability may fluctuate.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">4. Limitation of Liability</h4>
                <p>
                  Under no circumstances will PhoneArena India, its creators, or partners be held liable for any direct, indirect, incidental, or consequential damages resulting from purchase decisions, information discrepancies, or website downtime.
                </p>
              </div>
            )}

            {/* TAB: PRIVACY POLICY */}
            {activeTab === "privacy" && (
              <div className="space-y-4 animate-fade-in text-xs text-neutral-600 leading-relaxed font-medium">
                <h3 className="text-base font-black text-neutral-900 border-b border-neutral-100 pb-2">Privacy Policy</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Last updated: May 2026</p>
                
                <p>
                  Your privacy is important to us. This policy outlines how <strong>PhoneArena India</strong> handles user data.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">1. Information We Collect</h4>
                <p>
                  We are a privacy-first platform. We do not require account registration, and we do not collect or store your name, email, location, or sensitive personal identifiers on our servers.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">2. Local Browser Storage</h4>
                <p>
                  We utilize standard browser storage (such as `localStorage`) to save your custom theme options, style mode selections, and comparison queues. This data is stored locally in your browser cache and is never sent to our servers.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">3. External Links & Third-Party Cookies</h4>
                <p>
                  Our site contains affiliate links to third-party e-commerce sites (such as Amazon India, Flipkart, etc.). Clicking these links redirects you to their platform, where third-party cookies may track referrals to reward commissions. We have no access to or control over these third-party trackers or cookies.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">4. Security</h4>
                <p>
                  We host our platform over secure HTTPS protocols to safeguard search queries and filter adjustments. We advise clearing your local browser storage if using shared devices.
                </p>
              </div>
            )}

            {/* TAB: AFFILIATE DISCLOSURE */}
            {activeTab === "affiliate" && (
              <div className="space-y-4 animate-fade-in text-xs text-neutral-600 leading-relaxed font-medium">
                <h3 className="text-base font-black text-neutral-900 border-b border-neutral-100 pb-2">Affiliate Disclosure</h3>
                <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Compliance Notice</p>
                
                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 text-blue-900 font-semibold mb-4 leading-relaxed">
                  <strong>How we keep the lights on:</strong> PhoneArena India is a free platform. We receive small referral commissions when you purchase items through our product links, at absolutely zero additional cost to you.
                </div>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">1. Amazon Associate Program</h4>
                <p>
                  PhoneArena India is a participant in the Amazon Services LLC Associates Program, an affiliate advertising program designed to provide a means for sites to earn advertising fees by advertising and linking to Amazon.in.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">2. Price and Offer Integrity</h4>
                <p>
                  Our search engine processes live pricing data aggregates. We do not manually adjust or increase prices to generate referral revenue. The price you see on the merchant website is the exact market rate.
                </p>

                <h4 className="font-extrabold text-neutral-800 uppercase tracking-wider mt-4">3. Editorial Independence</h4>
                <p>
                  Affiliate partnerships do not influence our computational scoring algorithm. The "Value for Money" ratio and hardware ratings are calculated programmatically using objective hardware specs and live market prices, keeping the platform unbiased.
                </p>
              </div>
            )}

          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-100 flex justify-end items-center bg-neutral-50 shrink-0 select-none">
          <button 
            onClick={onClose} 
            className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white font-extrabold text-xs uppercase tracking-wider transition-all"
          >
            Dismiss
          </button>
        </div>

      </div>
    </div>
  );
}

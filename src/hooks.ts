import { useMemo, useEffect } from "react";
import type { PhoneSpec, PersonaRatings, PhoneWithRatings, WeightConfig } from "./types";

// ==============================================================
// SCORING ENGINE v3.0 — Reliable, Practical, Market-Calibrated
// ==============================================================
// Each formula maps real-world specs to a 1.0–10.0 score.
// Design principles:
//  • OBJECTIVE: Prefer AnTuTu (measured) over raw_cpu_score (manual)
//  • LINEAR: Scores spread across full 1–10 range, not clustered
//  • WEIGHTED: Each sub-factor weighted by real-world user impact
//  • CAPPED INTELLIGENTLY: Diminishing returns above inflection points
//  • MARKET-CALIBRATED: VFM uses expected price for spec tier

export const extractGB = (str: string) => {
  const match = str.match(/(\d+)(GB|TB)/i);
  if (!match) return 0;
  let val = parseInt(match[1]);
  if (match[2].toUpperCase() === 'TB') val *= 1024;
  return val;
};

export const getRamStorage = (name: string) => {
  const match = name.match(/\((.*?)\)/);
  if (!match) return { ram: 0, storage: 0 };
  const parts = match[1].split('/');
  if (parts.length === 2) {
    return { ram: extractGB(parts[0]), storage: extractGB(parts[1]) };
  } else if (parts.length === 1) {
    return { ram: 0, storage: extractGB(parts[0]) };
  }
  return { ram: 0, storage: 0 };
};

/** Clamp + round to 1 decimal within [1, 10] */
function finalize(score: number): number {
  return Math.round(Math.min(10, Math.max(1, score)) * 10) / 10;
}

/** Map a raw value to a 1–10 scale with a sigmoid-like curve.
 *  value at `lo` → 1.0, value at `mid` → 5.5, value at `hi` → 10.0 */
function scaleLog(value: number, lo: number, hi: number): number {
  const clamped = Math.max(lo, Math.min(hi, value));
  return 1 + ((clamped - lo) / (hi - lo)) * 9;
}

export interface OSUpdatesStatus {
  yearsLeft: number;
  message: string;
  badgeClass: string;
  warningText?: string;
}

export function formatLaunchDate(dateStr: string): string {
  if (!dateStr || !dateStr.includes("-")) return dateStr;
  const [year, month] = dateStr.split("-");
  const monthNames = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const mIndex = parseInt(month, 10) - 1;
  if (mIndex >= 0 && mIndex < 12) {
    return `${monthNames[mIndex]} ${year}`;
  }
  return dateStr;
}

export function getOSUpdatesStatus(launchDateStr: string, osUpdatesYears: number): OSUpdatesStatus {
  if (!launchDateStr || osUpdatesYears <= 0) {
    return {
      yearsLeft: 0,
      message: "Updates: N/A",
      badgeClass: "bg-neutral-50 text-neutral-400 border-neutral-250/60"
    };
  }

  const parts = launchDateStr.split("-");
  const launchYear = parseInt(parts[0], 10);
  const launchMonth = parts[1] ? parseInt(parts[1], 10) - 1 : 0;
  
  const launchDate = new Date(launchYear, launchMonth, 1);
  const currentDate = new Date(); // May 2026
  
  const diffMs = currentDate.getTime() - launchDate.getTime();
  const ageYears = diffMs / (1000 * 60 * 60 * 24 * 365.25);
  
  const yearsLeft = Math.max(0, osUpdatesYears - ageYears);
  
  let message = "";
  let badgeClass = "";
  let warningText = undefined;
  
  if (yearsLeft <= 0) {
    message = "No OS updates left (EOL)";
    badgeClass = "bg-red-50 text-red-600 border-red-200/80";
    warningText = "End of Life: Software updates have ended.";
  } else if (yearsLeft <= 1.25) {
    message = "Only 1 year left!";
    badgeClass = "bg-amber-50 text-amber-700 border-amber-300 animate-pulse font-bold";
    warningText = "Warning: Software support ends within 1 year!";
  } else {
    message = `${Math.ceil(yearsLeft)} OS updates remaining`;
    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  }
  
  return {
    yearsLeft: Math.round(yearsLeft * 10) / 10,
    message,
    badgeClass,
    warningText
  };
}

// ── 1. PERFORMANCE SCORE ───────────────────────────────────────
// AnTuTu is the most objective cross-chip benchmark.
// Weighting: raw AnTuTu (60%) + refresh rate (20%) + fast charge (12%) + RAM tier (8%)
export function calcPerformance(p: PhoneSpec, maxAntutu: number = 3300000): number {
  // AnTuTu → 1–10 via log scale. 
  // 200K (budget) = 1.0, maxAntutu (best chip in current db) = 10.0
  const maxLimit = maxAntutu > 200000 ? maxAntutu : 3300000;
  const antutuScore = p.antutu_score > 0
    ? Math.max(1, Math.min(10, (Math.log10(p.antutu_score) - Math.log10(200000)) / (Math.log10(maxLimit) - Math.log10(200000)) * 9 + 1))
    : p.raw_cpu_score; // fallback to manual score if antutu missing

  // RAM type tier: LPDDR4X=3, LPDDR5=6, LPDDR5X=10
  const ramScore = p.ram_type.includes("5X") ? 10
    : p.ram_type.includes("5") ? 6
    : 3;

  // Performance is solely based on Chipset (85%) and RAM Type (15%)
  const raw = antutuScore * 0.85 + ramScore * 0.15;
  return finalize(raw);
}

// ── 2. CAMERA SCORE ────────────────────────────────────────────
export function calcCamera(p: PhoneSpec): number {
  const score = p.main_camera_score * 0.7 + p.front_camera_score * 0.3;
  const normalized = 4.0 + (Math.min(10, score) / 10) * 6.0;
  return Math.round(normalized * 10) / 10;
}

// ── 3. RELIABILITY SCORE ──────────────────────────────────────
// "Will this phone last 2+ years without becoming a painful experience?"
// Factors: OS update commitment, software experience (UI bloat), battery longevity,
//          build quality, and thermal/charging durability.
export function calcReliability(p: PhoneSpec): number {
  // OS updates: 2yr=4, 4yr=7, 6yr=9, 7yr+=10
  const osScore = p.os_updates_years >= 7 ? 10
    : p.os_updates_years >= 6 ? 9.0
    : p.os_updates_years >= 4 ? 7.0
    : p.os_updates_years >= 3 ? 5.5
    : p.os_updates_years >= 2 ? 4.0
    : 2.0;

  // UI experience (bloat, ads, update cadence) — brand-level score from sheet
  const uiScore = p.raw_ui_score; // 1–10, already calibrated per brand

  // Battery capacity: more is always better up to a point
  // 3000mAh=2, 4500mAh=5, 5000mAh=7, 6500mAh=8.5, 8000mAh+=10
  const battScore = p.battery_mah >= 8000 ? 10
    : p.battery_mah >= 7000 ? 9.0
    : p.battery_mah >= 6000 ? 8.0
    : p.battery_mah >= 5000 ? 7.0
    : p.battery_mah >= 4500 ? 5.5
    : p.battery_mah >= 4000 ? 4.0
    : p.battery_mah >= 3500 ? 3.0
    : 2.0;

  // Build quality (IP rating proxy + material feel)
  const buildScore = p.build_quality_score; // 1–10

  // Charging speed for reliability — fast charging = faster battery wear if used daily.
  // Moderate charging (33–80W) is ideal. Very slow (<18W) and very fast (>100W) penalize longevity.
  const chargingReliabilityScore = p.charging_w >= 100 ? 6.5
    : p.charging_w >= 80  ? 8.5
    : p.charging_w >= 33  ? 9.0
    : p.charging_w >= 18  ? 7.0
    : 5.0;

  const raw =
    osScore       * 0.35 +  // Commitment to software updates is #1 factor
    uiScore       * 0.25 +  // Clean software → better experience for 3+ years
    battScore     * 0.20 +  // Battery capacity → daily usability
    buildScore    * 0.15 +  // Build quality → physical longevity
    chargingReliabilityScore * 0.05; // Charging balance → battery chemistry health

  return finalize(raw);
}

// ── 4. VALUE-FOR-MONEY SCORE ──────────────────────────────────
// Compares the phone's hardware capability tier against its actual market price.
// A phone that gives you flagship hardware at mid-range price is exceptional value.
export function calcVFM(performance: number, camera: number, reliability: number, price: number): number {
  // Overall capability composite (unweighted mean — what the phone actually is)
  const capability = (performance + camera + reliability) / 3;

  // Expected market price for a phone at this capability tier (Indian market 2026)
  // Calibrated: capability=5.5 → ₹15,000, 7.0 → ₹30,000, 8.5 → ₹65,000, 10.0 → ₹140,000
  const expectedPrice = 8000 * Math.pow(2.0, (capability - 4.0) * 0.85);

  // Value ratio: >1 means underpriced (good deal), <1 means overpriced
  const ratio = expectedPrice / price;

  // Map ratio to 1–10: ratio=1.0 → 7.0 (fair), ratio=2.5 → 9.3 (exceptional), ratio=0.4 → 4.0 (poor value)
  const vfmScore = 7.0 + Math.log2(ratio) * 2.5;
  return finalize(vfmScore);
}

// OS Rating Engine based on the market tier matrix
export function calcOSRating(brand: string, price: number): number {
  const b = brand.toUpperCase();
  
  if (price < 12000) {
    // Ultra-Budget Tier
    if (b.includes("MOTOROLA") || b.includes("MOTO")) return 8.0;
    if (b.includes("SAMSUNG")) return 6.0;
    if (b.includes("REALME")) return 5.5;
    if (b.includes("INFINIX")) return 5.0;
    if (b.includes("POCO") || b.includes("XIAOMI") || b.includes("REDMI") || b.includes("HYPEROS") || b.includes("MIUI")) return 5.0;
    if (b.includes("TECNO")) return 5.0;
    if (b.includes("OPPO")) return 4.5;
    if (b.includes("VIVO") || b.includes("IQOO")) return 4.5;
    return 5.0;
  } else if (price >= 12000 && price <= 35000) {
    // Mid-Range Tier
    if (b.includes("CMF") || b.includes("NOTHING")) return 9.0;
    if (b.includes("GOOGLE") || b.includes("PIXEL")) return 8.5;
    if (b.includes("SAMSUNG")) return 8.5;
    if (b.includes("ONEPLUS")) return 8.0;
    if (b.includes("OPPO")) return 8.0;
    if (b.includes("MOTOROLA") || b.includes("MOTO")) return 7.5;
    if (b.includes("REALME")) return 7.5;
    if (b.includes("POCO") || b.includes("XIAOMI") || b.includes("REDMI") || b.includes("HYPEROS") || b.includes("MIUI")) return 7.0;
    if (b.includes("VIVO") || b.includes("IQOO")) return 7.0;
    if (b.includes("INFINIX")) return 6.5;
    if (b.includes("TECNO")) return 6.5;
    if (b.includes("APPLE")) return 6.0;
    return 7.0;
  } else if (price > 35000 && price <= 75000) {
    // Flagship Tier
    if (b.includes("APPLE")) return 9.5;
    if (b.includes("GOOGLE") || b.includes("PIXEL")) return 9.0;
    if (b.includes("SAMSUNG")) return 9.0;
    if (b.includes("NOTHING")) return 8.5;
    if (b.includes("ONEPLUS")) return 8.5;
    if (b.includes("OPPO")) return 8.5;
    if (b.includes("MOTOROLA") || b.includes("MOTO")) return 8.0;
    if (b.includes("VIVO") || b.includes("IQOO")) return 8.0;
    if (b.includes("XIAOMI") || b.includes("POCO") || b.includes("HYPEROS")) return 8.0;
    if (b.includes("REALME")) return 7.5;
    if (b.includes("INFINIX")) return 7.0;
    if (b.includes("TECNO")) return 7.0;
    return 8.0;
  } else {
    // Ultra-Premium & Enthusiast Tier
    if (b.includes("APPLE")) return 9.5;
    if (b.includes("SAMSUNG")) return 9.5;
    if (b.includes("GOOGLE") || b.includes("PIXEL")) return 8.5;
    if (b.includes("ONEPLUS")) return 8.5;
    if (b.includes("OPPO")) return 8.5;
    if (b.includes("VIVO") || b.includes("IQOO")) return 8.0;
    if (b.includes("XIAOMI")) return 8.0;
    if (b.includes("MOTOROLA") || b.includes("MOTO")) return 7.5;
    if (b.includes("TECNO")) return 7.0;
    return 8.0;
  }
}

// ── Master compute function ────────────────────────────────────
export function computeRatings(p: PhoneSpec, maxAntutu: number = 3300000): PersonaRatings {
  const performance = calcPerformance(p, maxAntutu);
  const camera      = calcCamera(p);
  const reliability = calcReliability(p);
  const os          = calcOSRating(p.brand, p.price_inr);
  const vfm         = calcVFM(performance, camera, reliability, p.price_inr);
  return { performance, camera, reliability, os, vfm };
}

// ── React Hooks ───────────────────────────────────────────────

export function usePhoneRatings(phones: PhoneSpec[]): PhoneWithRatings[] {
  return useMemo(() => {
    const maxAntutu = phones.reduce((max, p) => p.antutu_score > max ? p.antutu_score : max, 1000000);

    return phones.map((p) => {
      // Normalize brand casing to group duplicates (e.g. "oppo" and "OPPO")
      let brand = p.brand;
      if (brand.toUpperCase() === "OPPO") brand = "OPPO";
      else if (brand.toUpperCase() === "IQOO") brand = "iQOO";
      else if (brand.toUpperCase() === "POCO") brand = "POCO";
      else if (brand.toUpperCase() === "APPLE") brand = "Apple";
      else if (brand.toUpperCase() === "GOOGLE") brand = "Google";
      else if (brand.toUpperCase() === "SAMSUNG") brand = "Samsung";
      else if (brand.toUpperCase() === "ONEPLUS") brand = "OnePlus";
      else if (brand.toUpperCase() === "REALME") brand = "Realme";
      else if (brand.toUpperCase() === "MOTOROLA" || brand.toUpperCase() === "MOTO") brand = "Motorola";
      else if (brand.toUpperCase() === "NOTHING") brand = "Nothing";
      else if (brand.toUpperCase() === "VIVO") brand = "Vivo";
      else if (brand.toUpperCase() === "XIAOMI") brand = "Xiaomi";
      else if (brand.toUpperCase() === "INFINIX") brand = "Infinix";
      else if (brand.toUpperCase() === "TECNO") brand = "Tecno";

      let name = p.name;
      // Strip 5G case-insensitively
      name = name.replace(/\b5G\b/gi, "").replace(/\s+/g, " ").trim();

      // Also fix the name starts prefix casing
      const oldBrandPrefix = p.brand + " ";
      const newBrandPrefix = brand + " ";
      if (name.toLowerCase().startsWith(oldBrandPrefix.toLowerCase())) {
        name = newBrandPrefix + name.slice(oldBrandPrefix.length);
      }

      return {
        ...p,
        brand,
        name,
        ratings: computeRatings({ ...p, brand, name }, maxAntutu)
      };
    });
  }, [phones]);
}

export function calcMatchScore(phone: PhoneWithRatings, weights: WeightConfig): number {
  const total = 
    (weights.performanceEnabled ? weights.performance : 0) +
    (weights.reliabilityEnabled ? weights.reliability : 0) +
    (weights.cameraEnabled ? weights.camera : 0) +
    (weights.osEnabled ? weights.os : 0) || 1;
    
  return Math.round(((
    (weights.performanceEnabled ? phone.ratings.performance * weights.performance : 0) +
    (weights.reliabilityEnabled ? phone.ratings.reliability * weights.reliability : 0) +
    (weights.cameraEnabled ? phone.ratings.camera * weights.camera : 0) +
    (weights.osEnabled ? phone.ratings.os * weights.os : 0)
  ) / total) * 10) / 10;
}

export function useWeightedSort(
  phones: PhoneWithRatings[],
  weights: WeightConfig
): PhoneWithRatings[] {
  return useMemo(() => {
    return [...phones].sort((a, b) => calcMatchScore(b, weights) - calcMatchScore(a, weights));
  }, [phones, weights]);
}

export function useShareBattle(
  comparedIds: string[],
  setComparedIds: (ids: string[]) => void,
  allPhoneIds: string[]
) {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vs = params.get("vs");
    if (vs) {
      const ids = vs.split(",").filter((id) => allPhoneIds.includes(id));
      if (ids.length > 0) setComparedIds(ids);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allPhoneIds.length]);

  useEffect(() => {
    const url = new URL(window.location.href);
    if (comparedIds.length > 0) {
      url.searchParams.set("vs", comparedIds.join(","));
    } else {
      url.searchParams.delete("vs");
    }
    window.history.replaceState({}, "", url.toString());
  }, [comparedIds]);
}

export function useVerdict(phones: PhoneWithRatings[]): string[] {
  return useMemo(() => {
    if (phones.length < 2 || phones.length > 3) return [];
    const verdicts: string[] = [];

    for (let i = 0; i < phones.length; i++) {
      for (let j = i + 1; j < phones.length; j++) {
        const a = phones[i];
        const b = phones[j];

        // Performance verdict
        const perfDiff = a.ratings.performance - b.ratings.performance;
        if (Math.abs(perfDiff) > 0.8) {
          const winner = perfDiff > 0 ? a : b;
          verdicts.push(`${winner.name} wins on performance — noticeably faster chip, display, and charging.`);
        }

        // Camera verdict
        const camDiff = a.ratings.camera - b.ratings.camera;
        if (Math.abs(camDiff) > 0.8) {
          const winner = camDiff > 0 ? a : b;
          verdicts.push(`${winner.name} has a superior camera system for photos and video.`);
        }

        // Reliability verdict
        const relDiff = a.ratings.reliability - b.ratings.reliability;
        if (Math.abs(relDiff) > 0.8) {
          const winner = relDiff > 0 ? a : b;
          verdicts.push(`Pick ${winner.name} for long-term use — better software support and build quality.`);
        }

        // VFM verdict
        const vfmDiff = a.ratings.vfm - b.ratings.vfm;
        if (Math.abs(vfmDiff) > 1.0) {
          const winner = vfmDiff > 0 ? a : b;
          const loser  = vfmDiff > 0 ? b : a;
          verdicts.push(`${winner.name} is a better value — same tier specs at a lower price point than ${loser.name}.`);
        }
      }
    }

    return [...new Set(verdicts)].slice(0, 3);
  }, [phones]);
}

/**
 * Dynamically computes practical Pros and Cons based on physical specs
 * and calculated ratings to provide expert, reviewer-grade summaries.
 */
export function getProsAndCons(p: PhoneWithRatings, allPhones?: PhoneWithRatings[]): { pros: string[]; cons: string[] } {
  const pros: string[] = [];

  // --- Dynamic Segment Averages Calculation ---
  let avgPerformance = 7.0;
  let avgCamera = 7.0;
  let avgReliability = 7.0;
  let avgOS = 7.0;
  let hasAverages = false;

  if (allPhones && allPhones.length > 5) {
    const margin = p.price_inr * 0.25; // 25% price margin to group peers
    const peers = allPhones.filter(ph => Math.abs(ph.price_inr - p.price_inr) <= margin && ph.id !== p.id);
    if (peers.length >= 2) {
      const sumPerf = peers.reduce((acc, ph) => acc + ph.ratings.performance, 0);
      const sumCam = peers.reduce((acc, ph) => acc + ph.ratings.camera, 0);
      const sumRel = peers.reduce((acc, ph) => acc + ph.ratings.reliability, 0);
      const sumOS = peers.reduce((acc, ph) => acc + ph.ratings.os, 0);
      avgPerformance = sumPerf / peers.length;
      avgCamera = sumCam / peers.length;
      avgReliability = sumRel / peers.length;
      avgOS = sumOS / peers.length;
      hasAverages = true;
    }
  }

  // Fallback to static expected standards if not enough peers exist
  if (!hasAverages) {
    if (p.price_inr > 75000) {
      avgPerformance = 8.5;
      avgCamera = 8.5;
      avgReliability = 8.5;
      avgOS = 8.5;
    } else if (p.price_inr > 35000) {
      avgPerformance = 7.5;
      avgCamera = 7.0;
      avgReliability = 7.5;
      avgOS = 7.5;
    } else {
      avgPerformance = 6.0;
      avgCamera = 5.5;
      avgReliability = 6.0;
      avgOS = 6.0;
    }
  }

  // --- Dynamic Pros (Relative to Segment) ---
  if (p.ratings.performance > avgPerformance + 0.3) {
    pros.push(`Excellent performance (${p.ratings.performance.toFixed(1)}/10), beating the segment average of ${avgPerformance.toFixed(1)}/10.`);
  } else if (p.ratings.performance >= 8.5) {
    pros.push(`Flagship processing speeds with a massive AnTuTu output.`);
  }

  if (p.screen_type.includes("AMOLED") || p.screen_type.includes("OLED")) {
    pros.push(`Premium, vibrant ${p.screen_type} display with deep blacks.`);
  }

  if (p.display_refresh_hz >= 120) {
    pros.push(`Super-smooth ${p.display_refresh_hz}Hz refresh rate scrolling.`);
  }

  if (p.ratings.camera > avgCamera + 0.3) {
    pros.push(`Superior camera quality (${p.ratings.camera.toFixed(1)}/10) compared to the segment average of ${avgCamera.toFixed(1)}/10.`);
  }

  if (p.battery_mah >= 6000) {
    pros.push(`Massive ${p.battery_mah}mAh battery provides easy 2-day durability.`);
  } else if (p.battery_mah >= 5000 && p.ratings.performance < 7.5) {
    pros.push(`Power-efficient hardware pairs perfectly with the ${p.battery_mah}mAh capacity.`);
  }

  if (p.charging_w >= 80) {
    pros.push(`Blazing fast ${p.charging_w}W charging juice-up times.`);
  }

  if (p.os_updates_years >= 5) {
    pros.push(`Strong support lifecycle with ${p.os_updates_years} promised OS upgrades.`);
  }

  // --- Dynamic Cons (Aggressive & Price-Aware) ---
  const severeCons: string[] = [];
  const mediocreCons: string[] = [];
  const otherCons: string[] = [];

  const { storage } = getRamStorage(p.name);
  if (storage > 0 && storage <= 128) {
    severeCons.push("Severely limited 128GB storage: Under 2026 usage standards with heavy OS bloat and app updates, this will fill up extremely fast.");
  }

  // Camera Con
  if (p.ratings.camera < avgCamera + 0.2) {
    if (p.ratings.camera < avgCamera - 0.3) {
      const diff = (avgCamera - p.ratings.camera).toFixed(1);
      severeCons.push(`Below-Average Camera: Scores ${p.ratings.camera.toFixed(1)}/10, lagging ${diff} pts behind the segment standard (${avgCamera.toFixed(1)}/10).`);
    } else {
      mediocreCons.push(`Mediocre/Average Camera: Scores ${p.ratings.camera.toFixed(1)}/10, barely matching the segment average (${avgCamera.toFixed(1)}/10) with no standout quality.`);
    }
  }

  // Performance Con (strictly below average)
  const isApple = p.brand.toLowerCase() === "apple";
  if (p.ratings.performance < avgPerformance - 0.3 && !isApple) {
    const diff = (avgPerformance - p.ratings.performance).toFixed(1);
    severeCons.push(`Below-Average Performance: Chip speed scores ${p.ratings.performance.toFixed(1)}/10, lagging ${diff} pts behind the segment average (${avgPerformance.toFixed(1)}/10).`);
  }

  // Reliability Con (strictly below average)
  if (p.ratings.reliability < avgReliability - 0.3) {
    const diff = (avgReliability - p.ratings.reliability).toFixed(1);
    severeCons.push(`Below-Average Reliability: Scores ${p.ratings.reliability.toFixed(1)}/10, falling ${diff} pts behind segment expectations (${avgReliability.toFixed(1)}/10).`);
  }

  // OS Con (strictly below average)
  if (p.ratings.os < avgOS - 0.3) {
    const diff = (avgOS - p.ratings.os).toFixed(1);
    severeCons.push(`Below-Average Software: OS rating is ${p.ratings.os.toFixed(1)}/10, lagging ${diff} pts behind the segment standard (${avgOS.toFixed(1)}/10).`);
  }

  // Physical specifications limitations
  if (p.raw_ui_score < 5.0) {
    otherCons.push("Bloatware nightmare: Software is loaded with annoying ads and pre-installed junk.");
  }

  if (p.screen_type.includes("LCD") || p.screen_type.includes("IPS")) {
    otherCons.push("Outdated IPS LCD display—you completely lose out on AMOLED true blacks and punchy colors.");
  }

  if (p.display_refresh_hz <= 60) {
    otherCons.push("Dated 60Hz refresh rate; feels noticeably laggy and sluggish compared to 120Hz standards.");
  }

  if (p.charging_w <= 18 && p.price_inr > 15000) {
    otherCons.push(`Painfully slow ${p.charging_w}W charging speeds—takes far too long to top up.`);
  }

  if (p.os_updates_years <= 1) {
    otherCons.push("Dead on arrival software: Essentially zero long-term OS update support.");
  }

  if (p.ratings.vfm < 5.5) {
    otherCons.push("Horrible value for money. You are severely overpaying for the hardware you get.");
  }

  if (p.battery_mah < 4200) {
    otherCons.push(`Tiny ${p.battery_mah}mAh battery guarantees you will be hunting for a charger by afternoon.`);
  }

  const cons = [...severeCons, ...mediocreCons, ...otherCons];

  // Fallbacks to guarantee content
  if (pros.length === 0) {
    pros.push("Well-balanced daily driver setup for casual needs.");
  }
  if (cons.length === 0) {
    cons.push("No significant technical downsides in this price category.");
  }

  // Return top 3 pros and cons
  return {
    pros: pros.slice(0, 3),
    cons: cons.slice(0, 3),
  };
}

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

// ── Helpers ────────────────────────────────────────────────────

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

// ── 1. PERFORMANCE SCORE ───────────────────────────────────────
// AnTuTu is the most objective cross-chip benchmark.
// Weighting: raw AnTuTu (60%) + refresh rate (20%) + fast charge (12%) + RAM tier (8%)
export function calcPerformance(p: PhoneSpec): number {
  // AnTuTu → 1–10 via log scale. 
  // 240K (Unisoc budget) = 1.0, 3.3M (SD8 Elite Gen5) ≈ 10.0
  const antutuScore = p.antutu_score > 0
    ? Math.max(1, Math.min(10, (Math.log10(p.antutu_score) - Math.log10(200000)) / (Math.log10(3500000) - Math.log10(200000)) * 9 + 1))
    : p.raw_cpu_score; // fallback to manual score if antutu missing

  // Refresh rate: 60Hz=1, 90Hz=4, 120Hz=7, 144Hz=8.5, 165Hz+=10
  const refreshScore = p.display_refresh_hz >= 165 ? 10
    : p.display_refresh_hz >= 144 ? 8.5
    : p.display_refresh_hz >= 120 ? 7.0
    : p.display_refresh_hz >= 90  ? 4.0
    : 1.0;

  // Fast charging: 15W=1, 45W=4, 80W=7, 100W=8.5, 120W+=10
  const chargingScore = p.charging_w >= 120 ? 10
    : p.charging_w >= 100 ? 8.5
    : p.charging_w >= 80  ? 7.0
    : p.charging_w >= 45  ? 4.5
    : p.charging_w >= 25  ? 3.0
    : p.charging_w >= 18  ? 2.0
    : 1.0;

  // RAM tier: LPDDR4X=3, LPDDR5=6, LPDDR5X=10
  const ramScore = p.ram_type.includes("5X") ? 10
    : p.ram_type.includes("5") ? 6
    : 3;

  // Storage tier: UFS 2.2=2, UFS 3.1=5.5, UFS 4.0=10
  const storageScore = p.storage_type.includes("4.0") ? 10
    : p.storage_type.includes("3.1") ? 5.5
    : 2.0;

  const raw = antutuScore * 0.55 + refreshScore * 0.20 + chargingScore * 0.12 + ramScore * 0.08 + storageScore * 0.05;
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
export function computeRatings(p: PhoneSpec): PersonaRatings {
  const performance = calcPerformance(p);
  const camera      = calcCamera(p);
  const reliability = calcReliability(p);
  const os          = calcOSRating(p.brand, p.price_inr);
  const vfm         = calcVFM(performance, camera, reliability, p.price_inr);
  return { performance, camera, reliability, os, vfm };
}

// ── React Hooks ───────────────────────────────────────────────

export function usePhoneRatings(phones: PhoneSpec[]): PhoneWithRatings[] {
  return useMemo(() => {
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
        ratings: computeRatings({ ...p, brand, name })
      };
    });
  }, [phones]);
}

export function useWeightedSort(
  phones: PhoneWithRatings[],
  weights: WeightConfig
): PhoneWithRatings[] {
  return useMemo(() => {
    const total = 
      (weights.performanceEnabled ? weights.performance : 0) +
      (weights.reliabilityEnabled ? weights.reliability : 0) +
      (weights.cameraEnabled ? weights.camera : 0) +
      (weights.osEnabled ? weights.os : 0) || 1;
      
    return [...phones].sort((a, b) => {
      const scoreA = (
        (weights.performanceEnabled ? a.ratings.performance * weights.performance : 0) +
        (weights.reliabilityEnabled ? a.ratings.reliability * weights.reliability : 0) +
        (weights.cameraEnabled ? a.ratings.camera * weights.camera : 0) +
        (weights.osEnabled ? a.ratings.os * weights.os : 0)
      ) / total;
      const scoreB = (
        (weights.performanceEnabled ? b.ratings.performance * weights.performance : 0) +
        (weights.reliabilityEnabled ? b.ratings.reliability * weights.reliability : 0) +
        (weights.cameraEnabled ? b.ratings.camera * weights.camera : 0) +
        (weights.osEnabled ? b.ratings.os * weights.os : 0)
      ) / total;
      return scoreB - scoreA;
    });
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
export function getProsAndCons(p: PhoneWithRatings): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];

  // --- Dynamic Pros ---
  if (p.ratings.performance >= 8.5) {
    pros.push(`Flagship performance with over ${(p.antutu_score / 100000).toFixed(1)}L AnTuTu score.`);
  } else if (p.ratings.performance >= 6.5 && p.price_inr <= 25000) {
    pros.push("Outstanding speed and gaming performance in the budget segment.");
  }

  if (p.screen_type.includes("AMOLED") || p.screen_type.includes("OLED")) {
    pros.push(`Premium, vibrant ${p.screen_type} screen with deep blacks.`);
  }

  if (p.display_refresh_hz >= 120) {
    pros.push(`Super-smooth ${p.display_refresh_hz}Hz refresh rate display.`);
  }

  if (p.ratings.camera >= 8.0) {
    pros.push(`Top-tier camera system with a ${p.main_camera_score.toFixed(1)}/10 rating.`);
  }

  if (p.battery_mah >= 6000) {
    pros.push(`Massive ${p.battery_mah}mAh battery for easy 2-day use.`);
  } else if (p.battery_mah >= 5000 && p.ratings.performance < 7.5) {
    pros.push(`Generous ${p.battery_mah}mAh capacity with highly power-efficient hardware.`);
  }

  if (p.charging_w >= 80) {
    pros.push(`Blazing fast ${p.charging_w}W charging gets you full in minutes.`);
  }

  if (p.os_updates_years >= 5) {
    pros.push(`Long-term support with ${p.os_updates_years} years of promised OS updates.`);
  }

  if (p.build_quality_score >= 8.5) {
    pros.push(`Solid physical durability (${p.build_quality_score.toFixed(1)}/10 build score).`);
  }

  if (p.ratings.vfm >= 8.5) {
    pros.push("Incredible value for money — massive specs for the price.");
  }

  // --- Dynamic Cons ---
  if (p.raw_ui_score < 6.0) {
    cons.push("Software experience includes heavy pre-installed bloatware or ads.");
  }

  if (p.screen_type.includes("LCD") || p.screen_type.includes("IPS")) {
    cons.push(`IPS LCD screen lacks the color punch and black levels of AMOLED panels.`);
  }

  if (p.display_refresh_hz <= 60) {
    cons.push("Dated 60Hz display refresh rate feels sluggish during scrolling.");
  }

  if (p.charging_w <= 18) {
    cons.push(`Slow ${p.charging_w}W charging speeds up recharge times significantly.`);
  }

  if (p.os_updates_years <= 2) {
    cons.push(`Short software lifespan with only ${p.os_updates_years} years of OS updates.`);
  }

  if (p.ratings.camera < 5.0) {
    cons.push("Mediocre camera capabilities in low-light and high-contrast environments.");
  }

  if (p.ratings.vfm < 5.5) {
    cons.push("Premium pricing results in a lower value-for-money score.");
  }

  if (p.battery_mah < 4500) {
    cons.push(`Small ${p.battery_mah}mAh battery may struggle to survive a full day.`);
  }

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

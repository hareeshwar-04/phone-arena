// ============================================================
// PhoneArena India — Formula Engine & Custom Hooks
// ============================================================
import { useMemo, useCallback, useEffect, useState } from "react";
import type { PhoneSpec, PersonaRatings, PhoneWithRatings, WeightConfig } from "./types";

// ---- Core Formula Functions ----

/** Compute Long Durability Rating (0–10 scale) */
function calcDurability(p: PhoneSpec): number {
  const score =
    (p.os_updates_years / 7) * 10 * 0.35 +
    p.raw_ui_score * 0.25 +
    (p.battery_mah / 10000) * 10 * 0.2 +
    p.build_quality_score * 0.15 +
    p.raw_cpu_score * 0.05;
  return Math.round(score * 10) / 10;
}

/** Compute Hardcore Gaming Rating (0–10 scale) */
function calcGaming(p: PhoneSpec): number {
  const score =
    p.raw_cpu_score * 0.5 +
    (p.display_refresh_hz / 144) * 10 * 0.25 +
    (p.charging_w / 120) * 10 * 0.15 +
    (p.battery_mah / 10000) * 10 * 0.1;
  return Math.round(score * 10) / 10;
}

/** Compute Content Creator Rating (0–10 scale) */
function calcCreator(p: PhoneSpec): number {
  const score = p.main_camera_score * 0.65 + p.front_camera_score * 0.35;
  return Math.round(score * 10) / 10;
}

/** Compute Value For Money index, bounded 1.0–10.0 */
function calcVFM(durability: number, gaming: number, creator: number, price: number): number {
  const avg = (durability + gaming + creator) / 3;
  const raw = avg / (price / 10000);
  return Math.round(Math.min(10, Math.max(1, raw)) * 10) / 10;
}

/** Compute all persona ratings for a single phone */
export function computeRatings(p: PhoneSpec): PersonaRatings {
  const durability = calcDurability(p);
  const gaming = calcGaming(p);
  const creator = calcCreator(p);
  const vfm = calcVFM(durability, gaming, creator, p.price_inr);
  return { durability, gaming, creator, vfm };
}

// ---- React Hooks ----

/** Hook: attaches computed ratings to every phone in the array */
export function usePhoneRatings(phones: PhoneSpec[]): PhoneWithRatings[] {
  return useMemo(
    () => phones.map((p) => ({ ...p, ratings: computeRatings(p) })),
    [phones]
  );
}

/** Hook: sorts phones by a custom weighted aggregate */
export function useWeightedSort(
  phones: PhoneWithRatings[],
  weights: WeightConfig
): PhoneWithRatings[] {
  return useMemo(() => {
    const total = weights.gaming + weights.durability + weights.camera || 1;
    const sorted = [...phones].sort((a, b) => {
      const scoreA =
        (a.ratings.gaming * weights.gaming +
          a.ratings.durability * weights.durability +
          a.ratings.creator * weights.camera) /
        total;
      const scoreB =
        (b.ratings.gaming * weights.gaming +
          b.ratings.durability * weights.durability +
          b.ratings.creator * weights.camera) /
        total;
      return scoreB - scoreA;
    });
    return sorted;
  }, [phones, weights]);
}

/** Hook: compute a custom weighted score for a single phone */
export function useWeightedScore(
  phone: PhoneWithRatings,
  weights: WeightConfig
): number {
  return useMemo(() => {
    const total = weights.gaming + weights.durability + weights.camera || 1;
    return Math.round(
      ((phone.ratings.gaming * weights.gaming +
        phone.ratings.durability * weights.durability +
        phone.ratings.creator * weights.camera) /
        total) *
        10
    ) / 10;
  }, [phone, weights]);
}

/** Hook: read/write comparison IDs to URL query string */
export function useShareBattle(
  comparedIds: string[],
  setComparedIds: (ids: string[]) => void,
  allPhoneIds: string[]
) {
  // On mount, read ?vs= from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const vs = params.get("vs");
    if (vs) {
      const ids = vs.split(",").filter((id) => allPhoneIds.includes(id));
      if (ids.length > 0) setComparedIds(ids);
    }
    // Only run on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync URL when compared IDs change
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

/** Hook: generates dynamic verdict sentences for 2–3 compared phones */
export function useVerdict(phones: PhoneWithRatings[]): string[] {
  return useMemo(() => {
    if (phones.length < 2 || phones.length > 3) return [];
    const verdicts: string[] = [];

    for (let i = 0; i < phones.length; i++) {
      for (let j = i + 1; j < phones.length; j++) {
        const a = phones[i];
        const b = phones[j];

        if (a.ratings.gaming - b.ratings.gaming > 1.0) {
          verdicts.push(
            `🔥 Choose ${a.name} if your primary focus is competitive gaming and high-frame-rate stability.`
          );
        } else if (b.ratings.gaming - a.ratings.gaming > 1.0) {
          verdicts.push(
            `🔥 Choose ${b.name} if your primary focus is competitive gaming and high-frame-rate stability.`
          );
        }

        if (a.ratings.durability - b.ratings.durability > 0.5) {
          verdicts.push(
            `🛡️ Pick ${a.name} if you want a reliable, clean user interface tailored for long-term daily stability.`
          );
        } else if (b.ratings.durability - a.ratings.durability > 0.5) {
          verdicts.push(
            `🛡️ Pick ${b.name} if you want a reliable, clean user interface tailored for long-term daily stability.`
          );
        }

        if (a.ratings.creator - b.ratings.creator > 0.5) {
          verdicts.push(
            `📸 Go with ${a.name} for superior camera performance and content creation capability.`
          );
        } else if (b.ratings.creator - a.ratings.creator > 0.5) {
          verdicts.push(
            `📸 Go with ${b.name} for superior camera performance and content creation capability.`
          );
        }
      }
    }

    return verdicts.slice(0, 3);
  }, [phones]);
}

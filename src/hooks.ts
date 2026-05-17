import { useMemo, useCallback, useEffect } from "react";
import type { PhoneSpec, PersonaRatings, PhoneWithRatings, WeightConfig } from "./types";

// ---- Core Formula Functions ----

function calcDurability(p: PhoneSpec): number {
  const score =
    (Math.min(p.os_updates_years, 7) / 7) * 10 * 0.35 +
    p.raw_ui_score * 0.25 +
    (Math.min(p.battery_mah, 6500) / 6500) * 10 * 0.2 +
    p.build_quality_score * 0.15 +
    p.raw_cpu_score * 0.05;
  const normalized = 4.0 + (Math.min(10, score) / 10) * 6.0;
  return Math.round(normalized * 10) / 10;
}

function calcGaming(p: PhoneSpec): number {
  const score =
    p.raw_cpu_score * 0.5 +
    (Math.min(p.display_refresh_hz, 144) / 144) * 10 * 0.25 +
    (Math.min(p.charging_w, 120) / 120) * 10 * 0.15 +
    (Math.min(p.battery_mah, 6500) / 6500) * 10 * 0.1;
  const normalized = 4.0 + (Math.min(10, score) / 10) * 6.0;
  return Math.round(normalized * 10) / 10;
}

function calcCreator(p: PhoneSpec): number {
  const score = p.main_camera_score * 0.7 + p.front_camera_score * 0.3;
  const normalized = 4.0 + (Math.min(10, score) / 10) * 6.0;
  return Math.round(normalized * 10) / 10;
}

function calcVFM(durability: number, gaming: number, creator: number, price: number): number {
  const avg = (durability + gaming + creator) / 3;
  // Convert price into a 1-10 score using a logarithmic scale
  // 10,000 INR -> score ~10.0
  // 30,000 INR -> score ~7.3
  // 100,000 INR -> score ~4.5
  // 150,000 INR -> score ~3.5
  const priceScore = 10 - (Math.log10(price / 10000) * 5.5);
  const normalizedPriceScore = Math.max(1, Math.min(10, priceScore));
  
  // VFM is the average of the specs quality and the price score.
  const vfmScore = (avg * 0.6) + (normalizedPriceScore * 0.4);
  return Math.round(Math.min(10, Math.max(1, vfmScore)) * 10) / 10;
}

export function computeRatings(p: PhoneSpec): PersonaRatings {
  const durability = calcDurability(p);
  const gaming = calcGaming(p);
  const creator = calcCreator(p);
  const vfm = calcVFM(durability, gaming, creator, p.price_inr);
  return { durability, gaming, creator, vfm };
}

// ---- React Hooks ----

export function usePhoneRatings(phones: PhoneSpec[]): PhoneWithRatings[] {
  return useMemo(
    () => phones.map((p) => ({ ...p, ratings: computeRatings(p) })),
    [phones]
  );
}

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

        if (a.ratings.gaming - b.ratings.gaming > 0.8) {
          verdicts.push(
            `Choose ${a.name} for better gaming and raw performance.`
          );
        } else if (b.ratings.gaming - a.ratings.gaming > 0.8) {
          verdicts.push(
            `Choose ${b.name} for better gaming and raw performance.`
          );
        }

        if (a.ratings.durability - b.ratings.durability > 0.8) {
          verdicts.push(
            `Pick ${a.name} for long-term software reliability and battery life.`
          );
        } else if (b.ratings.durability - a.ratings.durability > 0.8) {
          verdicts.push(
            `Pick ${b.name} for long-term software reliability and battery life.`
          );
        }

        if (a.ratings.creator - b.ratings.creator > 0.8) {
          verdicts.push(
            `${a.name} offers a noticeably superior camera system.`
          );
        } else if (b.ratings.creator - a.ratings.creator > 0.8) {
          verdicts.push(
            `${b.name} offers a noticeably superior camera system.`
          );
        }
      }
    }

    return [...new Set(verdicts)].slice(0, 3);
  }, [phones]);
}

/** Extended filter configuration for the sidebar */
export interface FilterConfig {
  selectedBrands: string[];
  priceRange: [number, number];
  weights: WeightConfig;
  batteryMin: number;
  chargingMin: number;
  refreshRateMin: number;
  screenTypes: string[];
  processorTiers: string[];
  minCameraScore: number;
  minOsYears: number;
  ramTypes: string[];
  storageTypes: string[];
}

export const DEFAULT_FILTERS: FilterConfig = {
  selectedBrands: [],
  priceRange: [5000, 200000],
  weights: {
    performance: 50,
    reliability: 50,
    camera: 50,
    os: 50,
    performanceEnabled: true,
    reliabilityEnabled: false,
    cameraEnabled: false,
    osEnabled: false
  },
  batteryMin: 0,
  chargingMin: 0,
  refreshRateMin: 0,
  screenTypes: [],
  processorTiers: [],
  minCameraScore: 0,
  minOsYears: 0,
  ramTypes: [],
  storageTypes: [],
};

// ============================================================
// PhoneArena India — Type Definitions & Mock Data (2026 Market)
// ============================================================

/** Raw specification schema matching the Google Sheets structure */
export interface PhoneSpec {
  id: string;
  name: string;
  brand: string;
  price_inr: number;
  image_url: string;
  launch_date: string;
  cpu_name: string;
  raw_cpu_score: number;
  raw_ui_score: number;
  os_updates_years: number;
  battery_mah: number;
  charging_w: number;
  main_camera_score: number;
  front_camera_score: number;
  display_refresh_hz: number;
  build_quality_score: number;
  antutu_score: number;
  storage_type: string;
  ram_type: string;
  screen_type: string;
  sot_hours: number;
  charging_mins: number;
}

/** Computed persona ratings derived from the formula engine (v3 scoring) */
export interface PersonaRatings {
  performance: number;   // AnTuTu + refresh rate + charging speed + RAM/storage tier
  camera: number;        // Main + front camera quality + display quality bonus
  reliability: number;   // OS updates + UI quality + battery life + build quality
  os: number;            // Dedicated operating system rating from tier matrix
  vfm: number;           // Market-calibrated value: specs-per-rupee ratio
}

/** A phone with its computed ratings attached */
export interface PhoneWithRatings extends PhoneSpec {
  ratings: PersonaRatings;
}

/** Weight configuration for custom sorting */
export interface WeightConfig {
  performance: number;
  reliability: number;
  camera: number;
  os: number;
  performanceEnabled: boolean;
  reliabilityEnabled: boolean;
  cameraEnabled: boolean;
  osEnabled: boolean;
}

// ============================================================
// Mock Data — 4 Competitive Indian Mid-Range Devices (2026)
// ============================================================
export const mockPhones: PhoneSpec[] = [
  {
    id: "oneplus-nord-6",
    name: "OnePlus Nord 6 (12GB/256GB)",
    brand: "OnePlus",
    price_inr: 36999,
    image_url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=600&fit=crop&q=80",
    launch_date: "2026-03",
    cpu_name: "Snapdragon 8s Gen 4",
    raw_cpu_score: 9.1,
    raw_ui_score: 8.5,
    os_updates_years: 4,
    battery_mah: 9000,
    charging_w: 80,
    main_camera_score: 8.2,
    front_camera_score: 7.5,
    display_refresh_hz: 144,
    build_quality_score: 8.0,
    antutu_score: 1800000,
    storage_type: "UFS 4.0",
    ram_type: "LPDDR5X",
    screen_type: "AMOLED",
    sot_hours: 15.2,
    charging_mins: 38,
  },
  {
    id: "poco-x8-pro-max",
    name: "POCO X8 Pro Max (8GB/256GB)",
    brand: "POCO",
    price_inr: 28999,
    image_url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=600&fit=crop&q=80",
    launch_date: "2026-01",
    cpu_name: "Dimensity 8400 Ultra",
    raw_cpu_score: 8.8,
    raw_ui_score: 5.5,
    os_updates_years: 2,
    battery_mah: 7500,
    charging_w: 120,
    main_camera_score: 7.0,
    front_camera_score: 6.0,
    display_refresh_hz: 144,
    build_quality_score: 6.5,
    antutu_score: 1600000,
    storage_type: "UFS 3.1",
    ram_type: "LPDDR5",
    screen_type: "AMOLED",
    sot_hours: 13.8,
    charging_mins: 25,
  },
  {
    id: "vivo-t5-pro",
    name: "Vivo T5 Pro (12GB/512GB)",
    brand: "Vivo",
    price_inr: 29997,
    image_url: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=600&fit=crop&q=80",
    launch_date: "2026-02",
    cpu_name: "Snapdragon 7s Gen 4",
    raw_cpu_score: 8.3,
    raw_ui_score: 7.0,
    os_updates_years: 3,
    battery_mah: 9020,
    charging_w: 90,
    main_camera_score: 8.8,
    front_camera_score: 8.5,
    display_refresh_hz: 144,
    build_quality_score: 7.5,
    antutu_score: 1100000,
    storage_type: "UFS 3.1",
    ram_type: "LPDDR5",
    screen_type: "AMOLED",
    sot_hours: 16.5,
    charging_mins: 42,
  },
  {
    id: "iqoo-z11",
    name: "iQOO Z11 5G (8GB/128GB)",
    brand: "iQOO",
    price_inr: 24999,
    image_url: "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&h=600&fit=crop&q=80",
    launch_date: "2026-04",
    cpu_name: "Dimensity 8500",
    raw_cpu_score: 9.0,
    raw_ui_score: 6.0,
    os_updates_years: 2,
    battery_mah: 9020,
    charging_w: 90,
    main_camera_score: 7.5,
    front_camera_score: 6.5,
    display_refresh_hz: 144,
    build_quality_score: 7.0,
    antutu_score: 1550000,
    storage_type: "UFS 3.1",
    ram_type: "LPDDR5",
    screen_type: "AMOLED",
    sot_hours: 15.9,
    charging_mins: 40,
  },
];

/** Indian Rupee currency formatter */
export const formatINR = (value: number): string =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

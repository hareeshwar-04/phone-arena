#!/usr/bin/env python3
"""
PhoneArena India — Automated Google Sheet Updater Bot
=====================================================
Fetches latest smartphone specs for the competitive Indian mid-range market,
normalizes raw benchmarks into 1.0–10.0 persona scores, and bulk-writes
the processed rows to a published Google Sheet.

Environment Variables Required:
  GOOGLE_CREDENTIALS_JSON  — Full JSON string of the Service Account key
  SPREADSHEET_ID           — Google Sheet ID (the long string from the URL)

Usage:
  python scripts/auto_update_sheet.py
"""

import os
import sys
import json
import logging
import math
from datetime import datetime
from typing import Any

# ── Logging ──────────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("sheet_bot")

# ── Dependency check ─────────────────────────────────────────────────────────
try:
    import gspread
    from google.oauth2.service_account import Credentials
except ImportError:
    logger.error("Missing dependencies. Run: pip install gspread google-auth")
    sys.exit(1)


# ═══════════════════════════════════════════════════════════════════════════════
# 1. RAW DATA SOURCE — Simulated Live Market Fetch
# ═══════════════════════════════════════════════════════════════════════════════
# In production, replace this with real API calls to pricing aggregators
# (e.g., Smartprix, 91mobiles, PriceTracker) and benchmark databases
# (AnTuTu, Geekbench, DXOMARK). The structure below mirrors what those
# APIs would return after extraction.

def fetch_raw_device_data() -> list[dict[str, Any]]:
    """
    Simulate fetching the latest device specs from market sources.
    Each entry contains raw hardware specs and benchmark numbers.
    Replace the hardcoded list with real API calls in production.
    """
    logger.info("Fetching latest device data from market sources...")

    raw_devices = [
        {
            "id": "oneplus-nord-6",
            "brand": "OnePlus",
            "name": "OnePlus Nord 6",
            "price_inr": 36999,
            "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=600&fit=crop&q=80",
            "launch_date": "2026-03",
            "cpu_name": "Snapdragon 8s Gen 4",
            # Raw benchmark numbers (not yet normalized)
            "antutu_score": 1420000,        # AnTuTu v11 total
            "software_bloat_count": 5,      # Number of pre-installed non-removable apps
            "skin_heaviness": 2,            # 1=Stock-like, 5=Very heavy skin
            "os_updates_years": 4,
            "battery_mah": 9000,
            "charging_w": 80,
            "dxomark_rear": 138,            # DXOMARK rear score
            "dxomark_selfie": 112,          # DXOMARK selfie score
            "has_ois": True,
            "display_refresh_hz": 144,
            "frame_material": "aluminum",   # plastic / aluminum / titanium
            "glass_protection": "GG Victus 2",
            "ip_rating": "IP65",
        },
        {
            "id": "poco-x8-pro-max",
            "brand": "POCO",
            "name": "POCO X8 Pro Max",
            "price_inr": 28999,
            "image_url": "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=400&h=600&fit=crop&q=80",
            "launch_date": "2026-01",
            "cpu_name": "Dimensity 8400 Ultra",
            "antutu_score": 1350000,
            "software_bloat_count": 22,
            "skin_heaviness": 4,
            "os_updates_years": 2,
            "battery_mah": 7500,
            "charging_w": 120,
            "dxomark_rear": 118,
            "dxomark_selfie": 95,
            "has_ois": False,
            "display_refresh_hz": 144,
            "frame_material": "plastic",
            "glass_protection": "GG5",
            "ip_rating": "IP53",
        },
        {
            "id": "vivo-t5-pro",
            "brand": "Vivo",
            "name": "Vivo T5 Pro",
            "price_inr": 29997,
            "image_url": "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400&h=600&fit=crop&q=80",
            "launch_date": "2026-02",
            "cpu_name": "Snapdragon 7s Gen 4",
            "antutu_score": 1180000,
            "software_bloat_count": 12,
            "skin_heaviness": 3,
            "os_updates_years": 3,
            "battery_mah": 9020,
            "charging_w": 90,
            "dxomark_rear": 142,
            "dxomark_selfie": 120,
            "has_ois": True,
            "display_refresh_hz": 144,
            "frame_material": "aluminum",
            "glass_protection": "GG7i",
            "ip_rating": "IP64",
        },
        {
            "id": "iqoo-z11",
            "brand": "iQOO",
            "name": "iQOO Z11 5G",
            "price_inr": 24999,
            "image_url": "https://images.unsplash.com/photo-1585060544812-6b45742d762f?w=400&h=600&fit=crop&q=80",
            "launch_date": "2026-04",
            "cpu_name": "Dimensity 8500",
            "antutu_score": 1400000,
            "software_bloat_count": 15,
            "skin_heaviness": 3,
            "os_updates_years": 2,
            "battery_mah": 9020,
            "charging_w": 90,
            "dxomark_rear": 125,
            "dxomark_selfie": 100,
            "has_ois": True,
            "display_refresh_hz": 144,
            "frame_material": "plastic",
            "glass_protection": "GG5",
            "ip_rating": "IP54",
        },
        {
            "id": "samsung-m56",
            "brand": "Samsung",
            "name": "Samsung Galaxy M56",
            "price_inr": 27999,
            "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=400&h=600&fit=crop&q=80",
            "launch_date": "2026-04",
            "cpu_name": "Exynos 1580",
            "antutu_score": 1100000,
            "software_bloat_count": 10,
            "skin_heaviness": 3,
            "os_updates_years": 4,
            "battery_mah": 6500,
            "charging_w": 45,
            "dxomark_rear": 130,
            "dxomark_selfie": 108,
            "has_ois": True,
            "display_refresh_hz": 120,
            "frame_material": "aluminum",
            "glass_protection": "GG Victus+",
            "ip_rating": "IP67",
        },
        {
            "id": "realme-14-pro-plus",
            "brand": "Realme",
            "name": "Realme 14 Pro+",
            "price_inr": 31999,
            "image_url": "https://images.unsplash.com/photo-1605236453806-6ff36851218e?w=400&h=600&fit=crop&q=80",
            "launch_date": "2026-03",
            "cpu_name": "Snapdragon 7+ Gen 4",
            "antutu_score": 1300000,
            "software_bloat_count": 14,
            "skin_heaviness": 3,
            "os_updates_years": 3,
            "battery_mah": 8500,
            "charging_w": 100,
            "dxomark_rear": 135,
            "dxomark_selfie": 110,
            "has_ois": True,
            "display_refresh_hz": 144,
            "frame_material": "aluminum",
            "glass_protection": "GG7i",
            "ip_rating": "IP66",
        },
    ]

    logger.info(f"Retrieved {len(raw_devices)} devices from market sources.")
    return raw_devices


# ═══════════════════════════════════════════════════════════════════════════════
# 2. NORMALIZATION ENGINE — Raw Benchmarks → 1.0–10.0 Scores
# ═══════════════════════════════════════════════════════════════════════════════

# Calibration baselines (updated for 2026 mid-range market)
ANTUTU_FLOOR = 600000       # Lowest relevant mid-range score
ANTUTU_CEILING = 1600000    # Flagship-tier ceiling
DXOMARK_REAR_FLOOR = 80
DXOMARK_REAR_CEILING = 155
DXOMARK_SELFIE_FLOOR = 60
DXOMARK_SELFIE_CEILING = 130

# Build quality scoring tables
FRAME_SCORES = {"plastic": 0.3, "aluminum": 0.7, "titanium": 1.0}
GLASS_SCORES = {
    "GG3": 0.3, "GG5": 0.5, "GG6": 0.6, "GG7i": 0.7,
    "GG Victus": 0.8, "GG Victus+": 0.85, "GG Victus 2": 0.9,
    "Ceramic Shield": 0.9,
}
IP_SCORES = {
    "none": 0.0, "IP52": 0.2, "IP53": 0.3, "IP54": 0.4,
    "IP55": 0.5, "IP64": 0.5, "IP65": 0.6, "IP66": 0.7,
    "IP67": 0.8, "IP68": 1.0,
}


def clamp(value: float, lo: float = 1.0, hi: float = 10.0) -> float:
    """Clamp a value to the [lo, hi] range and round to 1 decimal."""
    return round(min(hi, max(lo, value)), 1)


def normalize_linear(raw: float, floor: float, ceiling: float) -> float:
    """Map a raw value from [floor, ceiling] onto [1.0, 10.0]."""
    ratio = (raw - floor) / (ceiling - floor) if ceiling != floor else 0.5
    return clamp(1.0 + ratio * 9.0)


def calc_cpu_score(antutu: int) -> float:
    """Normalize AnTuTu score to 1.0–10.0 scale."""
    return normalize_linear(antutu, ANTUTU_FLOOR, ANTUTU_CEILING)


def calc_ui_score(bloat_count: int, skin_heaviness: int) -> float:
    """
    Score software cleanliness inversely proportional to bloat.
    bloat_count: number of non-removable pre-installed apps (0–30 range)
    skin_heaviness: 1 (stock-like) to 5 (very heavy modifications)
    """
    bloat_penalty = min(bloat_count / 30.0, 1.0)      # 0.0 = clean, 1.0 = max bloat
    skin_penalty = (skin_heaviness - 1) / 4.0          # 0.0 = stock, 1.0 = heaviest
    combined = 1.0 - (bloat_penalty * 0.6 + skin_penalty * 0.4)
    return clamp(1.0 + combined * 9.0)


def calc_camera_main(dxomark_rear: int, has_ois: bool) -> float:
    """Normalize DXOMARK rear score with OIS bonus."""
    base = normalize_linear(dxomark_rear, DXOMARK_REAR_FLOOR, DXOMARK_REAR_CEILING)
    ois_bonus = 0.3 if has_ois else 0.0
    return clamp(base + ois_bonus)


def calc_camera_front(dxomark_selfie: int) -> float:
    """Normalize DXOMARK selfie score."""
    return normalize_linear(dxomark_selfie, DXOMARK_SELFIE_FLOOR, DXOMARK_SELFIE_CEILING)


def calc_build_quality(frame: str, glass: str, ip: str) -> float:
    """
    Composite build quality from frame material, glass protection, and IP rating.
    Each component weighted: frame 35%, glass 35%, IP 30%.
    """
    f = FRAME_SCORES.get(frame, 0.3)
    g = GLASS_SCORES.get(glass, 0.3)
    i = IP_SCORES.get(ip, 0.0)
    composite = f * 0.35 + g * 0.35 + i * 0.30
    return clamp(1.0 + composite * 9.0)


def normalize_device(raw: dict[str, Any]) -> dict[str, Any]:
    """Convert a raw device dict into the Google Sheet row schema."""
    return {
        "id": raw["id"],
        "brand": raw["brand"],
        "name": raw["name"],
        "price_inr": raw["price_inr"],
        "image_url": raw["image_url"],
        "launch_date": raw["launch_date"],
        "cpu_name": raw["cpu_name"],
        "raw_cpu_score": calc_cpu_score(raw["antutu_score"]),
        "raw_ui_score": calc_ui_score(raw["software_bloat_count"], raw["skin_heaviness"]),
        "os_updates_years": raw["os_updates_years"],
        "battery_mah": raw["battery_mah"],
        "charging_w": raw["charging_w"],
        "main_camera_score": calc_camera_main(raw["dxomark_rear"], raw["has_ois"]),
        "front_camera_score": calc_camera_front(raw["dxomark_selfie"]),
        "display_refresh_hz": raw["display_refresh_hz"],
        "build_quality_score": calc_build_quality(
            raw["frame_material"], raw["glass_protection"], raw["ip_rating"]
        ),
    }


# ═══════════════════════════════════════════════════════════════════════════════
# 3. GOOGLE SHEETS WRITER
# ═══════════════════════════════════════════════════════════════════════════════

# The exact header order matching the frontend schema
SHEET_HEADERS = [
    "id", "brand", "name", "price_inr", "image_url", "launch_date",
    "cpu_name", "raw_cpu_score", "raw_ui_score", "os_updates_years",
    "battery_mah", "charging_w", "main_camera_score", "front_camera_score",
    "display_refresh_hz", "build_quality_score",
]


def authenticate_gsheets() -> gspread.Client:
    """Authenticate to Google Sheets API using a Service Account."""
    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if not creds_json:
        logger.error("GOOGLE_CREDENTIALS_JSON environment variable is not set.")
        sys.exit(1)

    try:
        creds_dict = json.loads(creds_json)
    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse GOOGLE_CREDENTIALS_JSON: {e}")
        sys.exit(1)

    scopes = [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
    ]
    credentials = Credentials.from_service_account_info(creds_dict, scopes=scopes)
    client = gspread.authorize(credentials)
    logger.info("Authenticated with Google Sheets API successfully.")
    return client


def push_to_sheet(client: gspread.Client, rows: list[dict[str, Any]]) -> None:
    """Clear existing data and bulk-insert new rows into the Google Sheet."""
    sheet_id = os.environ.get("SPREADSHEET_ID")
    if not sheet_id:
        logger.error("SPREADSHEET_ID environment variable is not set.")
        sys.exit(1)

    try:
        spreadsheet = client.open_by_key(sheet_id)
        worksheet = spreadsheet.sheet1
    except gspread.exceptions.SpreadsheetNotFound:
        logger.error(f"Spreadsheet with ID '{sheet_id}' not found. Check sharing permissions.")
        sys.exit(1)
    except Exception as e:
        logger.error(f"Failed to open spreadsheet: {e}")
        sys.exit(1)

    # Ensure headers exist in row 1
    existing_headers = worksheet.row_values(1)
    if existing_headers != SHEET_HEADERS:
        logger.info("Writing header row...")
        worksheet.update("A1", [SHEET_HEADERS])

    # Clear all data rows (keep header in row 1)
    row_count = worksheet.row_count
    if row_count > 1:
        logger.info(f"Clearing {row_count - 1} existing data rows...")
        worksheet.batch_clear([f"A2:P{row_count}"])

    # Build the 2D values array in header order
    values = []
    for row in rows:
        values.append([row.get(h, "") for h in SHEET_HEADERS])

    # Bulk insert starting at row 2
    if values:
        cell_range = f"A2:P{1 + len(values)}"
        worksheet.update(cell_range, values)
        logger.info(f"Inserted {len(values)} rows into the sheet.")
    else:
        logger.warning("No rows to insert.")


# ═══════════════════════════════════════════════════════════════════════════════
# 4. MAIN EXECUTION
# ═══════════════════════════════════════════════════════════════════════════════

def main() -> None:
    logger.info("=" * 60)
    logger.info("PhoneArena Sheet Bot — Starting update cycle")
    logger.info(f"Timestamp: {datetime.utcnow().isoformat()}Z")
    logger.info("=" * 60)

    # Step 1: Fetch raw device data
    raw_devices = fetch_raw_device_data()

    # Step 2: Normalize all specs into 1.0–10.0 scores
    logger.info("Normalizing benchmark data...")
    normalized = [normalize_device(d) for d in raw_devices]

    for device in normalized:
        logger.info(
            f"  {device['name']:25s} | CPU: {device['raw_cpu_score']} | "
            f"UI: {device['raw_ui_score']} | Cam: {device['main_camera_score']} | "
            f"Build: {device['build_quality_score']}"
        )

    # Step 3: Authenticate and push to Google Sheets
    client = authenticate_gsheets()
    push_to_sheet(client, normalized)

    logger.info("=" * 60)
    logger.info("Update cycle complete. Sheet is now live.")
    logger.info("=" * 60)


if __name__ == "__main__":
    main()

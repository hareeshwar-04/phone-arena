#!/usr/bin/env python3
"""
PhoneArena India — Live Top 100 Trending Phones Scraper & Sheet Updater
Scrapes 91mobiles/Smartprix for trending phones, normalizes specs, pushes to Google Sheets.
"""
import os, sys, json, logging, re, time, random
from datetime import datetime
from typing import Any

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("sheet_bot")

try:
    import gspread
    from google.oauth2.service_account import Credentials
    import requests
    from bs4 import BeautifulSoup
except ImportError:
    logger.error("Missing deps. Run: pip install gspread google-auth requests beautifulsoup4")
    sys.exit(1)

HEADERS = {"User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36"}
SESSION = requests.Session()
SESSION.headers.update(HEADERS)

# ── CPU Benchmark Lookup (AnTuTu v11 approximations, 2025-2026) ──────────────
CPU_ANTUTU = {
    "snapdragon 8 elite": 2400000, "snapdragon 8s elite": 2100000,
    "snapdragon 8 gen 3": 2100000, "snapdragon 8s gen 3": 1500000,
    "snapdragon 8 gen 2": 1600000, "snapdragon 8+ gen 1": 1300000,
    "snapdragon 8 gen 1": 1200000, "snapdragon 8s gen 4": 1800000,
    "snapdragon 7+ gen 3": 1300000, "snapdragon 7+ gen 4": 1400000,
    "snapdragon 7s gen 3": 900000, "snapdragon 7s gen 4": 1100000,
    "snapdragon 7 gen 3": 1000000, "snapdragon 7 gen 1": 750000,
    "snapdragon 6 gen 4": 850000, "snapdragon 6 gen 3": 700000,
    "snapdragon 6 gen 1": 650000, "snapdragon 695": 500000,
    "snapdragon 4 gen 2": 550000, "snapdragon 4s gen 2": 500000,
    "snapdragon 4 gen 1": 450000, "snapdragon 480+": 420000,
    "dimensity 9400": 2500000, "dimensity 9300+": 2300000,
    "dimensity 9300": 2200000, "dimensity 9200+": 1800000,
    "dimensity 9200": 1600000, "dimensity 8500": 1400000,
    "dimensity 8400": 1350000, "dimensity 8400 ultra": 1350000,
    "dimensity 8350": 1200000, "dimensity 8300": 1150000,
    "dimensity 8300 ultra": 1200000, "dimensity 8200": 1100000,
    "dimensity 8200 ultra": 1100000, "dimensity 8100": 1000000,
    "dimensity 7350": 850000, "dimensity 7300": 800000,
    "dimensity 7200": 750000, "dimensity 7025": 550000,
    "dimensity 7050": 600000, "dimensity 6300": 500000,
    "dimensity 6100+": 450000, "dimensity 6080": 430000,
    "exynos 2400": 1600000, "exynos 2500": 1800000,
    "exynos 1580": 1100000, "exynos 1480": 900000,
    "exynos 1380": 750000, "exynos 1330": 600000,
    "tensor g4": 1500000, "tensor g3": 1400000,
    "a18 pro": 2600000, "a18": 2300000, "a17 pro": 2100000, "a16": 1800000,
    "helio g99": 450000, "helio g99 ultimate": 480000,
    "helio g88": 350000, "helio g85": 320000,
    "unisoc t820": 650000, "unisoc t616": 350000,
    "kirin 9010": 1400000, "kirin 9000s": 1000000,
}

def match_cpu_score(cpu_name: str) -> int:
    """Fuzzy-match a CPU name against the lookup table."""
    name = cpu_name.lower().strip()
    for key, score in CPU_ANTUTU.items():
        if key in name:
            return score
    # Fallback heuristic based on keywords
    if "snapdragon 8" in name: return 1500000
    if "snapdragon 7" in name: return 900000
    if "snapdragon 6" in name: return 650000
    if "snapdragon 4" in name: return 450000
    if "dimensity 9" in name: return 2000000
    if "dimensity 8" in name: return 1100000
    if "dimensity 7" in name: return 700000
    if "dimensity 6" in name: return 450000
    if "exynos" in name: return 900000
    if "helio" in name: return 400000
    if "tensor" in name: return 1400000
    if "unisoc" in name: return 400000
    return 600000

# ── Normalization Engine (kept from original) ────────────────────────────────
ANTUTU_FLOOR, ANTUTU_CEILING = 600000, 2500000
FRAME_SCORES = {"plastic": 0.3, "polycarbonate": 0.3, "aluminum": 0.7, "glass": 0.6, "metal": 0.7, "titanium": 1.0}
IP_SCORES = {"none": 0.0, "ip52": 0.2, "ip53": 0.3, "ip54": 0.4, "ip55": 0.5, "ip64": 0.5, "ip65": 0.6, "ip66": 0.7, "ip67": 0.8, "ip68": 1.0}

def clamp(v, lo=1.0, hi=10.0): return round(min(hi, max(lo, v)), 1)
def norm_linear(raw, floor, ceil): return clamp(1.0 + ((raw - floor) / (ceil - floor) if ceil != floor else 0.5) * 9.0)

def calc_cpu(antutu): return norm_linear(antutu, ANTUTU_FLOOR, ANTUTU_CEILING)
def calc_ui(bloat, skin): return clamp(1.0 + (1.0 - (min(bloat/30,1)*0.6 + (skin-1)/4*0.4)) * 9.0)
def calc_cam_main(mp, has_ois):
    base = clamp(1.0 + (min(mp, 200) / 200) * 7.0)
    return clamp(base + (0.5 if has_ois else 0.0) + (1.0 if mp >= 50 else 0.0))
def calc_cam_front(mp): return clamp(1.0 + (min(mp, 50) / 50) * 7.0)
def calc_build(frame, ip_str):
    f = FRAME_SCORES.get(frame.lower().strip() if frame else "plastic", 0.3)
    i = IP_SCORES.get(ip_str.lower().strip() if ip_str else "none", 0.0)
    return clamp(1.0 + (f * 0.5 + i * 0.5) * 9.0)

def estimate_bloat_from_brand(brand):
    """Estimate software bloat and skin heaviness by brand reputation."""
    b = brand.lower()
    bloat_map = {
        "apple": (2, 1), "google": (3, 1), "motorola": (4, 1), "nothing": (3, 1),
        "oneplus": (6, 2), "samsung": (10, 3), "realme": (14, 3), "oppo": (14, 3),
        "vivo": (12, 3), "iqoo": (13, 3), "xiaomi": (18, 4), "poco": (20, 4),
        "redmi": (20, 4), "tecno": (16, 4), "infinix": (16, 4), "lava": (8, 2),
        "nokia": (5, 1), "huawei": (15, 4), "honor": (12, 3),
    }
    for key, val in bloat_map.items():
        if key in b:
            return val
    return (12, 3)

# ── Scraper: 91mobiles Trending Phones ───────────────────────────────────────
def parse_number(text: str) -> int:
    """Extract first number from a string like '5000 mAh' -> 5000."""
    nums = re.findall(r'[\d,]+', text.replace(",", ""))
    return int(nums[0]) if nums else 0

def scrape_smartprix_trending(limit=100) -> list[dict]:
    """Scrape phone listings from Smartprix popular phones page."""
    phones = []
    page = 1
    while len(phones) < limit:
        url = f"https://www.smartprix.com/mobiles?price=7000-100000&sort=pop&page={page}"
        logger.info(f"Scraping page {page}: {url}")
        try:
            resp = SESSION.get(url, timeout=20)
            resp.raise_for_status()
        except Exception as e:
            logger.warning(f"Failed to fetch page {page}: {e}")
            break
        soup = BeautifulSoup(resp.text, "html.parser")
        cards = soup.select("div.sm-product") or soup.select("div.product-card") or soup.select("[class*='product']")
        if not cards:
            logger.info(f"No more cards found on page {page}")
            break
        for card in cards:
            if len(phones) >= limit:
                break
            try:
                name_el = card.select_one("h2") or card.select_one("h3") or card.select_one("[class*='name']")
                price_el = card.select_one("[class*='price']") or card.select_one("span.price")
                if not name_el:
                    continue
                name = name_el.get_text(strip=True)
                price_text = price_el.get_text(strip=True) if price_el else "0"
                price = parse_number(price_text)
                if price < 5000:
                    price = 15000  # fallback
                brand = name.split()[0] if name else "Unknown"
                slug = re.sub(r'[^a-z0-9]+', '-', name.lower()).strip('-')
                phones.append({"id": slug, "brand": brand, "name": name, "price_inr": price})
            except Exception:
                continue
        page += 1
        time.sleep(random.uniform(1.0, 2.5))
    logger.info(f"Scraped {len(phones)} phone listings")
    return phones

def scrape_phone_specs(phone: dict) -> dict:
    """Try to get specs for a phone from Smartprix search."""
    slug = phone.get("id", "")
    search_name = phone.get("name", "").replace(" ", "+")
    try:
        url = f"https://www.smartprix.com/search?s={search_name}"
        resp = SESSION.get(url, timeout=15)
        soup = BeautifulSoup(resp.text, "html.parser")
        # Look for spec snippets in search results
        text = soup.get_text(" ", strip=True).lower()
        # Extract battery
        bat_match = re.search(r'(\d{3,5})\s*mah', text)
        phone["battery_mah"] = int(bat_match.group(1)) if bat_match else 5000
        # Extract charging
        chg_match = re.search(r'(\d{1,3})\s*w\s*(?:fast|charge|warp|dart|turbo)', text)
        if not chg_match:
            chg_match = re.search(r'(\d{2,3})\s*w\b', text)
        phone["charging_w"] = int(chg_match.group(1)) if chg_match else 33
        # Extract refresh rate
        ref_match = re.search(r'(\d{2,3})\s*hz', text)
        phone["display_refresh_hz"] = int(ref_match.group(1)) if ref_match else 90
        # Extract CPU
        cpu_patterns = [
            r'(snapdragon\s+\d+\w*(?:\s+gen\s+\d+)?)',
            r'(dimensity\s+\d+\w*(?:\s+ultra)?)',
            r'(exynos\s+\d+\w*)', r'(helio\s+\w+\d+\w*)',
            r'(tensor\s+\w+\d*)', r'(unisoc\s+\w+\d+)',
            r'(a\d{2}\s*pro)', r'(kirin\s+\d+\w*)',
        ]
        cpu_name = ""
        for pat in cpu_patterns:
            m = re.search(pat, text)
            if m:
                cpu_name = m.group(1).strip().title()
                break
        phone["cpu_name"] = cpu_name or "Unknown"
        # Camera MP
        cam_matches = re.findall(r'(\d{1,3})\s*mp', text)
        cam_mps = sorted([int(x) for x in cam_matches], reverse=True)
        phone["main_camera_mp"] = cam_mps[0] if cam_mps else 50
        phone["front_camera_mp"] = cam_mps[1] if len(cam_mps) > 1 else (cam_mps[0] // 3 if cam_mps else 16)
        phone["has_ois"] = "ois" in text
        # IP rating
        ip_match = re.search(r'(ip\d{2})', text)
        phone["ip_rating"] = ip_match.group(1).upper() if ip_match else "none"
        # Frame
        if "titanium" in text: phone["frame"] = "titanium"
        elif "aluminum" in text or "aluminium" in text or "metal" in text: phone["frame"] = "aluminum"
        elif "glass" in text and "back" in text: phone["frame"] = "glass"
        else: phone["frame"] = "plastic"
    except Exception as e:
        logger.warning(f"Spec scrape failed for {phone.get('name')}: {e}")
        # Defaults
        phone.setdefault("battery_mah", 5000)
        phone.setdefault("charging_w", 33)
        phone.setdefault("display_refresh_hz", 90)
        phone.setdefault("cpu_name", "Unknown")
        phone.setdefault("main_camera_mp", 50)
        phone.setdefault("front_camera_mp", 16)
        phone.setdefault("has_ois", False)
        phone.setdefault("ip_rating", "none")
        phone.setdefault("frame", "plastic")
    time.sleep(random.uniform(0.5, 1.5))
    return phone

# ── Fallback: Built-in Top Indian Phones (if scraping fails) ─────────────────
def get_fallback_phones() -> list[dict]:
    """Hardcoded fallback of popular Indian phones if scraping is blocked."""
    base = [
        ("oneplus-13r", "OnePlus", "OnePlus 13R", 42999, "Snapdragon 8s Elite", 9000, 80, 144, 50, 16, True, "IP65", "aluminum", "2026-01"),
        ("oneplus-nord-6", "OnePlus", "OnePlus Nord 6", 36999, "Snapdragon 8s Gen 4", 9000, 80, 144, 50, 32, True, "IP65", "aluminum", "2026-03"),
        ("samsung-s25", "Samsung", "Samsung Galaxy S25", 79999, "Snapdragon 8 Elite", 4000, 25, 120, 50, 12, True, "IP68", "aluminum", "2025-01"),
        ("samsung-a56", "Samsung", "Samsung Galaxy A56", 32999, "Exynos 1580", 5000, 45, 120, 50, 12, True, "IP67", "aluminum", "2025-03"),
        ("samsung-m56", "Samsung", "Samsung Galaxy M56", 27999, "Exynos 1580", 6500, 45, 120, 50, 16, True, "IP67", "aluminum", "2026-04"),
        ("poco-x8-pro-max", "POCO", "POCO X8 Pro Max", 28999, "Dimensity 8400 Ultra", 7500, 120, 144, 108, 20, False, "IP53", "plastic", "2026-01"),
        ("poco-f7", "POCO", "POCO F7", 27999, "Snapdragon 8s Gen 3", 5500, 90, 120, 50, 20, True, "IP54", "plastic", "2025-11"),
        ("vivo-t5-pro", "Vivo", "Vivo T5 Pro", 29997, "Snapdragon 7s Gen 4", 9020, 90, 144, 64, 16, True, "IP64", "aluminum", "2026-02"),
        ("vivo-v50", "Vivo", "Vivo V50", 34999, "Snapdragon 7 Gen 3", 6000, 90, 120, 50, 32, True, "IP68", "aluminum", "2025-04"),
        ("iqoo-z11", "iQOO", "iQOO Z11 5G", 24999, "Dimensity 8500", 9020, 90, 144, 50, 16, True, "IP54", "plastic", "2026-04"),
        ("iqoo-neo-10", "iQOO", "iQOO Neo 10", 33999, "Dimensity 9300", 6000, 120, 144, 50, 16, True, "IP65", "aluminum", "2025-06"),
        ("realme-14-pro-plus", "Realme", "Realme 14 Pro+", 31999, "Snapdragon 7+ Gen 4", 8500, 100, 144, 50, 32, True, "IP66", "aluminum", "2026-03"),
        ("realme-gt-7-pro", "Realme", "Realme GT 7 Pro", 54999, "Snapdragon 8 Elite", 6500, 120, 120, 50, 16, True, "IP68", "aluminum", "2025-01"),
        ("redmi-note-14-pro-plus", "Redmi", "Redmi Note 14 Pro+", 23999, "Dimensity 7300", 6200, 45, 120, 200, 20, True, "IP68", "glass", "2025-01"),
        ("redmi-note-15-pro", "Redmi", "Redmi Note 15 Pro", 24999, "Dimensity 8350", 5500, 67, 120, 200, 16, True, "IP64", "plastic", "2026-02"),
        ("xiaomi-15", "Xiaomi", "Xiaomi 15", 69999, "Snapdragon 8 Elite", 5400, 90, 120, 50, 32, True, "IP68", "aluminum", "2025-02"),
        ("nothing-phone-3a", "Nothing", "Nothing Phone (3a)", 24999, "Snapdragon 7s Gen 3", 5000, 45, 120, 50, 32, True, "IP54", "aluminum", "2025-03"),
        ("nothing-phone-2a-plus", "Nothing", "Nothing Phone (2a) Plus", 27999, "Dimensity 7350", 5000, 50, 120, 50, 16, True, "none", "aluminum", "2025-01"),
        ("motorola-edge-60", "Motorola", "Motorola Edge 60", 31999, "Dimensity 8400", 5500, 68, 120, 50, 32, True, "IP68", "aluminum", "2026-03"),
        ("motorola-g85", "Motorola", "Motorola G85", 17999, "Snapdragon 6 Gen 3", 5000, 33, 120, 50, 16, False, "IP52", "plastic", "2025-06"),
        ("oppo-reno-13-pro", "OPPO", "OPPO Reno 13 Pro", 36999, "Dimensity 8350", 5800, 80, 120, 50, 32, True, "IP66", "aluminum", "2025-01"),
        ("oppo-a5-pro", "OPPO", "OPPO A5 Pro", 17999, "Dimensity 7300", 6000, 45, 120, 50, 8, False, "IP66", "plastic", "2025-04"),
        ("honor-x9c", "Honor", "Honor X9c", 22999, "Snapdragon 6 Gen 4", 6600, 45, 120, 108, 16, False, "IP65", "aluminum", "2025-12"),
        ("tecno-spark-30-pro", "Tecno", "Tecno Spark 30 Pro", 12999, "Helio G99", 5000, 33, 120, 108, 8, False, "none", "plastic", "2025-06"),
        ("infinix-note-41-pro", "Infinix", "Infinix Note 41 Pro", 14999, "Dimensity 7025", 5000, 45, 90, 108, 16, False, "none", "plastic", "2025-09"),
        ("lava-agni-3", "Lava", "Lava Agni 3", 19999, "Dimensity 7300", 5000, 67, 120, 50, 16, True, "IP64", "aluminum", "2025-08"),
        ("google-pixel-9a", "Google", "Google Pixel 9a", 42999, "Tensor G4", 5000, 23, 120, 48, 13, True, "IP67", "aluminum", "2025-05"),
    ]
    result = []
    for b in base:
        result.append({
            "id": b[0], "brand": b[1], "name": b[2], "price_inr": b[3], "cpu_name": b[4],
            "battery_mah": b[5], "charging_w": b[6], "display_refresh_hz": b[7],
            "main_camera_mp": b[8], "front_camera_mp": b[9], "has_ois": b[10],
            "ip_rating": b[11], "frame": b[12], "launch_date": b[13],
            "image_url": f"https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=600&fit=crop&q=80",
        })
    return result

# ── Build final sheet row ────────────────────────────────────────────────────
def build_sheet_row(phone: dict) -> dict:
    """Convert a scraped/fallback phone dict into the normalized sheet schema."""
    brand = phone.get("brand", "Unknown")
    bloat, skin = estimate_bloat_from_brand(brand)
    antutu = match_cpu_score(phone.get("cpu_name", ""))
    return {
        "id": phone.get("id", "unknown"),
        "brand": brand,
        "name": phone.get("name", "Unknown"),
        "price_inr": phone.get("price_inr", 20000),
        "image_url": phone.get("image_url", "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&h=600&fit=crop&q=80"),
        "launch_date": phone.get("launch_date", datetime.now().strftime("%Y-%m")),
        "cpu_name": phone.get("cpu_name", "Unknown"),
        "raw_cpu_score": calc_cpu(antutu),
        "raw_ui_score": calc_ui(bloat, skin),
        "os_updates_years": {"apple": 6, "samsung": 4, "google": 7, "oneplus": 4, "nothing": 3, "motorola": 3, "oppo": 3, "vivo": 3, "realme": 3, "honor": 3}.get(brand.lower(), 2),
        "battery_mah": phone.get("battery_mah", 5000),
        "charging_w": phone.get("charging_w", 33),
        "main_camera_score": calc_cam_main(phone.get("main_camera_mp", 50), phone.get("has_ois", False)),
        "front_camera_score": calc_cam_front(phone.get("front_camera_mp", 16)),
        "display_refresh_hz": phone.get("display_refresh_hz", 90),
        "build_quality_score": calc_build(phone.get("frame", "plastic"), phone.get("ip_rating", "none")),
    }

# ── Google Sheets Writer ─────────────────────────────────────────────────────
SHEET_HEADERS = [
    "id", "brand", "name", "price_inr", "image_url", "launch_date",
    "cpu_name", "raw_cpu_score", "raw_ui_score", "os_updates_years",
    "battery_mah", "charging_w", "main_camera_score", "front_camera_score",
    "display_refresh_hz", "build_quality_score",
]

def authenticate():
    creds_json = os.environ.get("GOOGLE_CREDENTIALS_JSON")
    if not creds_json:
        logger.error("GOOGLE_CREDENTIALS_JSON not set."); sys.exit(1)
    creds = Credentials.from_service_account_info(json.loads(creds_json), scopes=[
        "https://www.googleapis.com/auth/spreadsheets", "https://www.googleapis.com/auth/drive"])
    client = gspread.authorize(creds)
    logger.info("Google Sheets authenticated.")
    return client

def push_to_sheet(client, rows):
    sheet_id = os.environ.get("SPREADSHEET_ID")
    if not sheet_id:
        logger.error("SPREADSHEET_ID not set."); sys.exit(1)
    ws = client.open_by_key(sheet_id).sheet1
    if ws.row_values(1) != SHEET_HEADERS:
        ws.update("A1", [SHEET_HEADERS])
    if ws.row_count > 1:
        ws.batch_clear([f"A2:P{ws.row_count}"])
    values = [[row.get(h, "") for h in SHEET_HEADERS] for row in rows]
    if values:
        ws.update(f"A2:P{1 + len(values)}", values)
        logger.info(f"Pushed {len(values)} rows to Google Sheet.")

# ── Main ─────────────────────────────────────────────────────────────────────
def main():
    logger.info("=" * 60)
    logger.info(f"PhoneArena Bot — {datetime.utcnow().isoformat()}Z")
    logger.info("=" * 60)

    # Try scraping live data
    phones = []
    try:
        listings = scrape_smartprix_trending(limit=100)
        if len(listings) >= 10:
            logger.info(f"Got {len(listings)} listings, scraping specs...")
            for i, phone in enumerate(listings):
                logger.info(f"  [{i+1}/{len(listings)}] {phone.get('name', '?')}")
                scrape_phone_specs(phone)
            phones = listings
    except Exception as e:
        logger.warning(f"Live scraping failed: {e}")

    # Fallback if scraping yielded too few results
    if len(phones) < 10:
        logger.info("Using fallback device database.")
        phones = get_fallback_phones()

    # Deduplicate by ID
    seen = set()
    unique = []
    for p in phones:
        pid = p.get("id", "")
        if pid and pid not in seen:
            seen.add(pid)
            unique.append(p)
    phones = unique[:100]

    # Normalize all phones
    logger.info(f"Normalizing {len(phones)} devices...")
    rows = [build_sheet_row(p) for p in phones]
    for r in rows[:5]:
        logger.info(f"  {r['name']:30s} CPU:{r['raw_cpu_score']} UI:{r['raw_ui_score']} Cam:{r['main_camera_score']} Build:{r['build_quality_score']}")
    if len(rows) > 5:
        logger.info(f"  ... and {len(rows)-5} more")

    # Push to sheet
    client = authenticate()
    push_to_sheet(client, rows)
    logger.info("Done. Sheet is live.")

if __name__ == "__main__":
    main()

# 🤖 PhoneArena Sheet Automation — Setup Guide

This guide walks you through connecting the automated Python bot to your Google Sheet so it can push fresh device data daily via GitHub Actions.

---

## Prerequisites

- A Google account
- A GitHub repository with this project pushed to it
- ~10 minutes

---

## Step 1: Create the Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a **new blank spreadsheet**
2. Name it something like `PhoneArena Data`
3. **Copy the Spreadsheet ID** from the URL bar:
   ```
   https://docs.google.com/spreadsheets/d/  ← THIS_LONG_STRING_HERE →  /edit
   ```
   Save this ID — you'll need it in Step 4.

4. **Publish the sheet** so the frontend can read it:
   - Go to **File → Share → Publish to web**
   - Select **Entire Document** → **Web page**
   - Click **Publish**

> [!NOTE]
> You do NOT need to manually add headers or data. The bot writes everything automatically, including the header row.

---

## Step 2: Create a Google Cloud Service Account

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a **new project** (or select an existing one)
3. Enable the **Google Sheets API**:
   - Navigate to **APIs & Services → Library**
   - Search for `Google Sheets API`
   - Click **Enable**
4. Enable the **Google Drive API** (same process — search for `Google Drive API` → Enable)

5. Create a **Service Account**:
   - Go to **APIs & Services → Credentials**
   - Click **+ CREATE CREDENTIALS → Service Account**
   - Name: `phonearena-bot`
   - Click **Create and Continue** → Skip optional steps → **Done**

6. Generate a **JSON Key**:
   - Click on the service account you just created
   - Go to the **Keys** tab
   - Click **ADD KEY → Create new key → JSON**
   - A `.json` file will download — **keep this safe, you need the contents**

---

## Step 3: Share the Sheet with the Bot

1. Open the JSON key file and find the `client_email` field. It looks like:
   ```
   phonearena-bot@your-project.iam.gserviceaccount.com
   ```

2. Go back to your Google Sheet
3. Click the **Share** button (top-right)
4. Paste the `client_email` address
5. Set permission to **Editor**
6. Uncheck "Notify people" and click **Share**

> [!IMPORTANT]
> If you skip this step, the bot will get a `SpreadsheetNotFound` error because the Service Account can't access sheets it hasn't been invited to.

---

## Step 4: Add Secrets to GitHub

1. Go to your GitHub repository → **Settings → Secrets and variables → Actions**
2. Click **New repository secret** and add these two:

| Secret Name | Value |
|---|---|
| `GOOGLE_CREDENTIALS_JSON` | Paste the **entire contents** of the downloaded JSON key file |
| `SPREADSHEET_ID` | The spreadsheet ID you copied in Step 1 |

> [!CAUTION]
> Never commit the JSON key file to your repository. Always use GitHub Secrets.

---

## Step 5: Update the Frontend

In `src/App.tsx`, replace the placeholder spreadsheet ID on **line 10**:

```ts
// Replace YOUR_SPREADSHEET_ID with your actual ID
const SHEET_URL = "https://opensheet.elk.sh/YOUR_SPREADSHEET_ID/Sheet1";
```

---

## Step 6: Test It

### Manual trigger (recommended first):
1. Go to your GitHub repo → **Actions** tab
2. Select **📊 Sheet Bot — Daily Data Sync** from the left sidebar
3. Click **Run workflow → Run workflow**
4. Watch the logs — you should see the bot authenticate, normalize scores, and push rows

### Verify the sheet:
- Open your Google Sheet — you should see 16 columns of headers and rows of phone data
- Open your deployed frontend — it should display the phones from the sheet

### Automatic schedule:
- The bot runs **daily at midnight UTC** automatically
- No further action needed — it will keep the sheet fresh

---

## Architecture Overview

```
┌─────────────────────┐     cron: daily      ┌──────────────────────────┐
│   GitHub Actions     │ ──────────────────── │  scripts/auto_update_    │
│   (sheet_bot.yml)    │                      │  sheet.py                │
└─────────────────────┘                      └────────────┬─────────────┘
                                                          │
                                              normalize   │  gspread API
                                              AnTuTu,     │
                                              DXOMARK,    ▼
                                              bloat    ┌──────────────────┐
                                              scores   │  Google Sheet    │
                                                       │  (Published)     │
                                                       └────────┬─────────┘
                                                                │
                                                    opensheet.elk.sh JSON
                                                                │
                                                                ▼
                                                       ┌────────────────┐
                                                       │  PhoneArena    │
                                                       │  React SPA     │
                                                       └────────────────┘
```

---

## Customizing the Device List

Edit `scripts/auto_update_sheet.py` → `fetch_raw_device_data()` function. To add a new phone, append a dict with these fields:

```python
{
    "id": "brand-model-slug",          # URL-safe unique slug
    "brand": "Brand",
    "name": "Full Display Name",
    "price_inr": 29999,
    "image_url": "https://...",
    "launch_date": "2026-05",
    "cpu_name": "Chipset Name",
    "antutu_score": 1200000,           # AnTuTu v11 benchmark
    "software_bloat_count": 10,        # Pre-installed apps count
    "skin_heaviness": 3,               # 1=Stock to 5=Heavy
    "os_updates_years": 3,
    "battery_mah": 5000,
    "charging_w": 67,
    "dxomark_rear": 125,              # DXOMARK camera score
    "dxomark_selfie": 100,
    "has_ois": True,
    "display_refresh_hz": 120,
    "frame_material": "aluminum",      # plastic/aluminum/titanium
    "glass_protection": "GG Victus",
    "ip_rating": "IP65",
}
```

The normalization engine automatically converts these raw specs into 1.0–10.0 scores.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| `SpreadsheetNotFound` | Share the sheet with the Service Account email (Step 3) |
| `GOOGLE_CREDENTIALS_JSON not set` | Add the secret in GitHub repo settings (Step 4) |
| `Failed to parse JSON` | Ensure you pasted the *entire* JSON file contents, not just the key |
| Sheet not updating on frontend | Verify the spreadsheet is published to web (Step 1.4) |
| Scores look wrong | Check the calibration baselines in the normalization engine |

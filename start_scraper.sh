#!/bin/bash
while pgrep -f "oopBrowserDownload.js" > /dev/null; do
  sleep 5
done
nohup venv/bin/python scripts/scraper_api.py > scraper.log 2>&1 &
echo "Live scraper API started in background."

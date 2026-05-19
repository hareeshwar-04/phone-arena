from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from curl_cffi.requests import AsyncSession
import asyncio
import urllib.parse
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


async def fetch_smartprix(phone_name: str) -> list:
    results = []
    try:
        # Impersonate Chrome 120 perfectly to bypass Cloudflare
        async with AsyncSession(impersonate="chrome120") as s:
            search_url = f"https://www.smartprix.com/products/?q={urllib.parse.quote(phone_name)}"
            resp = await s.get(search_url)
            if resp.status_code != 200:
                return results

            from bs4 import BeautifulSoup
            soup = BeautifulSoup(resp.text, "html.parser")

            product_link = None
            for link in soup.select("a[href*='/mobiles/']"):
                href = link.get("href", "")
                if any(part in href.lower() for part in phone_name.lower().split()[:2]):
                    product_link = href
                    if not product_link.startswith("http"):
                        product_link = "https://www.smartprix.com" + product_link
                    break

            if product_link:
                resp2 = await s.get(product_link)
                if resp2.status_code == 200:
                    soup2 = BeautifulSoup(resp2.text, "html.parser")
                    price_cards = soup2.select("li.sm-prc-row, div.store-price, div.prc-row, li[class*='price']")
                    
                    for card in price_cards[:5]:
                        price_el = card.select_one("[class*='price'], .amount, .val")
                        store_el = card.select_one("[class*='store'], [class*='name'], img[alt]")
                        link_el = card.select_one("a[href]")

                        if price_el:
                            price_text = price_el.get_text(strip=True)
                            match = re.search(r'[\d,]+', price_text)
                            if match:
                                price = int(match.group().replace(',', ''))
                                if 3000 < price < 300000:
                                    store = "Online Store"
                                    if store_el:
                                        if store_el.name == "img":
                                            store = store_el.get("alt", "Online Store")
                                        else:
                                            store = store_el.get_text(strip=True)
                                    link = link_el.get("href", "") if link_el else ""
                                    if link and not link.startswith("http"):
                                        link = "https://www.smartprix.com" + link
                                    results.append({
                                        "store": store,
                                        "price": price,
                                        "link": link or product_link,
                                        "logo": ""
                                    })
    except Exception as e:
        print(f"Smartprix error: {e}")
    return results


async def fetch_amazon_direct(phone_name: str) -> list:
    """Try hitting Amazon directly with curl_cffi."""
    results = []
    try:
        async with AsyncSession(impersonate="chrome120") as s:
            url = f"https://www.amazon.in/s?k={urllib.parse.quote(phone_name)}&i=electronics"
            resp = await s.get(url)
            
            if resp.status_code == 200 and "captcha" not in resp.text.lower():
                from bs4 import BeautifulSoup
                soup = BeautifulSoup(resp.text, "html.parser")
                items = soup.select('div[data-component-type="s-search-result"]')
                
                for item in items:
                    title_el = item.select_one("h2 a span")
                    price_el = item.select_one(".a-price-whole")
                    link_el = item.select_one("h2 a")

                    if title_el and price_el and link_el:
                        title = title_el.get_text(strip=True)
                        if any(w in title.lower() for w in ["case", "cover", "protector"]):
                            continue
                        price = int(re.sub(r'[^\d]', '', price_el.get_text(strip=True)))
                        if price > 3000:
                            link = link_el.get("href", "")
                            results.append({
                                "store": "Amazon",
                                "price": price,
                                "link": "https://www.amazon.in" + link,
                                "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                            })
                            break
    except Exception as e:
        pass
    return results


@app.get("/api/live-prices")
async def get_live_prices(q: str):
    # Run concurrent fetches
    smartprix_res, amazon_res = await asyncio.gather(
        fetch_smartprix(q),
        fetch_amazon_direct(q),
        return_exceptions=True
    )

    valid_results = []
    if isinstance(amazon_res, list) and amazon_res:
        valid_results.extend(amazon_res)
    if isinstance(smartprix_res, list) and smartprix_res:
        valid_results.extend(smartprix_res)

    # Deduplicate
    seen = {}
    for r in valid_results:
        store = r["store"].lower().strip()
        if store not in seen or r["price"] < seen[store]["price"]:
            seen[store] = r

    final_results = list(seen.values())
    final_results.sort(key=lambda x: x["price"])

    return {"query": q, "results": final_results[:5]}

@app.get("/api/debug-prices")
async def debug_prices(q: str):
    debug_data = {}
    try:
        async with AsyncSession(impersonate="chrome120") as s:
            # Test Amazon
            url_amz = f"https://www.amazon.in/s?k={urllib.parse.quote(q)}&i=electronics"
            r_amz = await s.get(url_amz)
            debug_data["amazon"] = {
                "status": r_amz.status_code,
                "html_snippet": r_amz.text[:500] if r_amz.text else "EMPTY"
            }
            
            # Test Smartprix
            url_sp = f"https://www.smartprix.com/products/?q={urllib.parse.quote(q)}"
            r_sp = await s.get(url_sp)
            debug_data["smartprix"] = {
                "status": r_sp.status_code,
                "html_snippet": r_sp.text[:500] if r_sp.text else "EMPTY"
            }
    except Exception as e:
        debug_data["error"] = str(e)

    return {"query": q, "debug": debug_data}

@app.get("/")
async def root():
    return {"status": "ok", "version": "5.1", "message": "PhoneArena Scraper v5.1 — Debugging HTML"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)

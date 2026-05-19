from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from playwright.async_api import async_playwright
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

async def scrape_amazon(context, phone_name):
    page = await context.new_page()
    try:
        url = f"https://www.amazon.in/s?k={urllib.parse.quote(phone_name)}"
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        
        # Wait for search results
        await page.wait_for_selector('div[data-component-type="s-search-result"]', timeout=5000)
        items = await page.query_selector_all('div[data-component-type="s-search-result"]')
        
        for item in items:
            title_el = await item.query_selector('h2 a span')
            price_el = await item.query_selector('.a-price-whole')
            link_el = await item.query_selector('h2 a')
            
            if title_el and price_el and link_el:
                title = await title_el.inner_text()
                # Basic check to ensure it's a phone, not a case
                if "case" not in title.lower() and "cover" not in title.lower():
                    price_text = await price_el.inner_text()
                    price = int(re.sub(r'[^\d]', '', price_text))
                    link = await link_el.get_attribute('href')
                    return {
                        "store": "Amazon",
                        "price": price,
                        "link": "https://www.amazon.in" + link,
                        "logo": "https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg"
                    }
    except Exception as e:
        print(f"Amazon scrape failed: {e}")
    finally:
        await page.close()
    return None

async def scrape_flipkart(context, phone_name):
    page = await context.new_page()
    try:
        url = f"https://www.flipkart.com/search?q={urllib.parse.quote(phone_name)}"
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        
        await page.wait_for_selector('div[data-id]', timeout=5000)
        items = await page.query_selector_all('a[target="_blank"]')
        
        for item in items:
            title_el = await item.query_selector('div.KzDlHZ') # Flipkart's title class often changes, but usually exists
            price_el = await item.query_selector('div.Nx9bqj')
            
            if title_el and price_el:
                title = await title_el.inner_text()
                price_text = await price_el.inner_text()
                price = int(re.sub(r'[^\d]', '', price_text))
                link = await item.get_attribute('href')
                return {
                    "store": "Flipkart",
                    "price": price,
                    "link": "https://www.flipkart.com" + link,
                    "logo": "https://static-assets-web.flixcart.com/batman-returns/batman-returns/p/images/fkheaderlogo_exploreplus-44005d.svg"
                }
    except Exception as e:
        print(f"Flipkart scrape failed: {e}")
    finally:
        await page.close()
    return None

async def scrape_croma(context, phone_name):
    page = await context.new_page()
    try:
        url = f"https://www.croma.com/searchB?q={urllib.parse.quote(phone_name)}%3Arelevance&text={urllib.parse.quote(phone_name)}"
        await page.goto(url, wait_until="domcontentloaded", timeout=15000)
        
        await page.wait_for_selector('.product-title', timeout=5000)
        title_el = await page.query_selector('.product-title')
        price_el = await page.query_selector('.amount')
        link_el = await page.query_selector('h3.product-title a')
        
        if title_el and price_el and link_el:
            price_text = await price_el.inner_text()
            price = int(re.sub(r'[^\d]', '', price_text))
            link = await link_el.get_attribute('href')
            return {
                "store": "Croma",
                "price": price,
                "link": "https://www.croma.com" + link,
                "logo": "https://media.croma.com/image/upload/v1637759004/Croma%20Assets/UI%20Assets/croma_logo.svg"
            }
    except Exception as e:
        print(f"Croma scrape failed: {e}")
    finally:
        await page.close()
    return None


@app.get("/api/live-prices")
async def get_live_prices(q: str):
    # This is the most efficient parallel scraping technique using Playwright.
    # It opens a single browser instance, and spawns parallel tabs (pages) for each site.
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        )
        
        # Run all scraping functions concurrently
        results = await asyncio.gather(
            scrape_amazon(context, q),
            scrape_flipkart(context, q),
            scrape_croma(context, q),
            return_exceptions=True
        )
        
        await browser.close()
        
        # Filter out Nones and exceptions
        valid_results = [res for res in results if res and not isinstance(res, Exception)]
        
        # Sort by lowest price
        valid_results.sort(key=lambda x: x["price"])
        
        return {"query": q, "results": valid_results}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

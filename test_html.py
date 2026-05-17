import urllib.request
from bs4 import BeautifulSoup
import json

url = "https://www.smartprix.com/mobiles?price=7000-150000&sort=pop&page=1"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
resp = urllib.request.urlopen(req)
html = resp.read().decode('utf-8')
soup = BeautifulSoup(html, "html.parser")
cards = soup.select("div.sm-product")

if cards:
    card = cards[0]
    print(card.prettify())

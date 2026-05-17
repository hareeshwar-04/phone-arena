import requests
from bs4 import BeautifulSoup
url = "https://www.91mobiles.com/top-10-mobiles-in-india"
headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
resp = requests.get(url, headers=headers)
print("Status:", resp.status_code)
soup = BeautifulSoup(resp.text, "html.parser")
items = soup.select(".hover_blue_link")
for item in items[:5]:
    print(item.text)

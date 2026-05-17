import urllib.request
import json

url = "https://www.smartprix.com/mobiles?price=7000-150000&sort=pop&page=1"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'})
try:
    resp = urllib.request.urlopen(req)
    html = resp.read().decode('utf-8')
    print("Length:", len(html))
    if "sm-product" in html:
        print("Found sm-product")
except Exception as e:
    print("Error:", e)

from playwright.sync_api import sync_playwright
import requests, json, time

api_base = "http://localhost:3000/api/v1"

print("登录获取token...")
r = requests.post(f"{api_base}/user/login", json={"phone": "13900139099"})
data = r.json()
token = data.get("token", "")
print(f"Token: {token[:30]}...")

if token:
    # 确保有一个伴侣
    pr = requests.get(f"{api_base}/partner", headers={"Authorization": f"Bearer {token}"})
    partners = pr.json()
    partners_list = partners.get("data", partners) if isinstance(partners, dict) else partners
    
    if not partners_list or len(partners_list) == 0:
        print("创建测试伴侣...")
        requests.post(f"{api_base}/partner/create", 
            headers={"Authorization": f"Bearer {token}"},
            json={"name": "沈清欢", "coreType": "pursuer", "relationshipType": "青梅竹马"})

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    
    page.goto("http://localhost:8080", wait_until="domcontentloaded", timeout=20000)
    time.sleep(2)
    
    # 注入token
    page.evaluate(f"""() => {{
        window.localStorage.setItem('auth_token', '{token}');
    }}""")
    
    page.reload(wait_until="domcontentloaded", timeout=20000)
    time.sleep(3)
    
    page.screenshot(path=r"F:\openclaw文件\与你\screenshot_w3_home.png", full_page=True)
    print("OK - 首页(登录)")
    
    # 伴侣页
    buttons = page.locator("button").all()
    for b in buttons:
        t = b.text_content()
        if t and "伴侣" in t:
            b.click()
            break
    time.sleep(3)
    page.screenshot(path=r"F:\openclaw文件\与你\screenshot_w3_partner.png", full_page=True)
    print("OK - 伴侣页")
    
    browser.close()

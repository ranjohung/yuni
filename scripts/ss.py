import requests, json, time
from playwright.sync_api import sync_playwright

output_dir = r"F:\openclaw文件\与你"
api_base = "http://localhost:3000/api/v1"

# 注册/登录
print("注册用户...")
r = requests.post(f"{api_base}/register", json={
    "phone": "13900999002",
    "nickname": "测试用户",
    "birthDate": "2000-01-01"
})
print(f"注册: {r.status_code}")
if not r.ok:
    # 可能已存在，尝试登录
    r = requests.post(f"{api_base}/login", json={"phone": "13900999002"})
    print(f"登录: {r.status_code}")

data = r.json()
token = data.get("token", "")
print(f"Token: {token[:50]}...")

# 创建伴侣
partner_r = requests.post(f"{api_base}/partners", 
    headers={"Authorization": f"Bearer {token}"},
    json={"name": "沈清欢", "coreType": "pursuer", "relationshipType": "青梅竹马"})
print(f"创建伴侣: {partner_r.status_code} - {partner_r.json().get('message', '')}")

# 训练记录
train_r = requests.post(f"{api_base}/training/record",
    headers={"Authorization": f"Bearer {token}"},
    json={"scenarioId": 1, "score": 75, "choices": [0, 1, 2], "affinityChange": 5})
print(f"训练: {train_r.status_code}")

# 浏览器截图
print("截图登录后效果...")
with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    
    page.goto("http://localhost:8080", wait_until="domcontentloaded", timeout=10000)
    page.evaluate(f"""() => {{
        window.localStorage.setItem('auth_token', '{token}');
    }}""")
    page.reload(wait_until="networkidle", timeout=15000)
    time.sleep(3)
    
    page.screenshot(path=f"{output_dir}\\screenshot_home_in.png", full_page=True)
    print("OK - 首页(已登录)")
    
    browser.close()
print("完成")

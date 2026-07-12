import requests, json, time
from playwright.sync_api import sync_playwright

output_dir = r"F:\openclaw文件\与你"
api_base = "http://localhost:3000/api/v1"

# 1. 注册/登录获取token
print("登录后端获取token...")
r = requests.post(f"{api_base}/login", json={"phone": "13900999001"})
if r.ok:
    data = r.json()
    token = data.get("token", "")
    print(f"Token: {token[:40]}...")

    # 2. 创建伴侣
    partner_r = requests.post(f"{api_base}/partners", 
        headers={"Authorization": f"Bearer {token}"},
        json={
            "name": "沈清欢",
            "coreType": "pursuer",
            "relationshipType": "青梅竹马"
        })
    print(f"创建伴侣: {partner_r.status_code}")
    
    # 3. 触发一次训练
    train_r = requests.post(f"{api_base}/training/record",
        headers={"Authorization": f"Bearer {token}"},
        json={"scenarioId": 1, "score": 75, "choices": [0, 1, 2], "affinityChange": 5})
    print(f"训练记录: {train_r.status_code}")

    # 4. 设置token到本地存储（通过浏览器注入）
    print("用浏览器截图登录态...")
    with sync_playwright() as p:
        browser = p.chromium.launch(channel="msedge", headless=True)
        context = browser.new_context(
            viewport={"width": 390, "height": 844},
            storage_state=None
        )
        page = context.new_page()
        
        # 先打开页面，注入localStorage token
        page.goto("http://localhost:8080", wait_until="domcontentloaded", timeout=10000)
        
        # 注入token到localStorage
        page.evaluate(f"""() => {{
            window.localStorage.setItem('auth_token', '{token}');
        }}""")
        
        # 刷新页面
        page.reload(wait_until="networkidle", timeout=15000)
        time.sleep(3)
        
        # 截图首页
        page.screenshot(path=f"{output_dir}\\screenshot_home_loggedin.png", full_page=True)
        print("OK - 登录首页")
        
        # 伴侣页
        buttons = page.locator("button").all()
        for b in buttons:
            t = b.text_content()
            if t and "伴侣" in t:
                b.click()
                break
        time.sleep(2)
        page.screenshot(path=f"{output_dir}\\screenshot_partner_loggedin.png", full_page=True)
        print("OK - 登录伴侣页")
        
        # 模拟页
        buttons = page.locator("button").all()
        for b in buttons:
            t = b.text_content()
            if t and "模拟" in t:
                b.click()
                break
        time.sleep(2)
        page.screenshot(path=f"{output_dir}\\screenshot_simulation_loggedin.png", full_page=True)
        print("OK - 登录模拟页")
        
        browser.close()
        print("全部完成!")
else:
    print(f"登录失败: {r.status_code} {r.text}")

from playwright.sync_api import sync_playwright
import time

output_dir = r"F:\openclaw文件\与你"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    page.goto("http://localhost:8080", wait_until="networkidle", timeout=15000)
    time.sleep(3)
    page.screenshot(path=f"{output_dir}\\screenshot_week2_login.png", full_page=True)
    print("OK - 登录页截图")
    
    # 点击"去注册"切换
    buttons = page.locator("button").all()
    for b in buttons:
        t = b.text_content()
        if t and "注册" in t:
            b.click()
            break
    time.sleep(1)
    page.screenshot(path=f"{output_dir}\\screenshot_week2_register.png", full_page=True)
    print("OK - 注册页截图")
    
    browser.close()
    print("完成")

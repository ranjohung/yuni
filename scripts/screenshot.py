import time
from playwright.sync_api import sync_playwright

output_dir = r"F:\openclaw文件\与你"

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    
    print("截图首页中...")
    page.goto("http://localhost:8080", wait_until="networkidle", timeout=30000)
    time.sleep(3)
    page.screenshot(path=f"{output_dir}\\screenshot_home.png", full_page=True)
    print("OK - 首页")
    
    print("截图伴侣页中...")
    # 在NavigationBar中找到第2个项（伴侣）
    buttons = page.locator("button").all()
    for b in buttons:
        text = b.text_content()
        if text and "伴侣" in text:
            b.click()
            break
    time.sleep(2)
    page.screenshot(path=f"{output_dir}\\screenshot_partner.png", full_page=True)
    print("OK - 伴侣页")
    
    print("截图模拟页中...")
    buttons = page.locator("button").all()
    for b in buttons:
        text = b.text_content()
        if text and "模拟" in text:
            b.click()
            break
    time.sleep(2)
    page.screenshot(path=f"{output_dir}\\screenshot_simulation.png", full_page=True)
    print("OK - 模拟页")
    
    browser.close()
    print("全部截图完成!")

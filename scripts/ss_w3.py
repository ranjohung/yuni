from playwright.sync_api import sync_playwright
import time

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge", headless=True)
    page = browser.new_page(viewport={"width": 390, "height": 844})
    
    page.goto("http://localhost:8080", wait_until="domcontentloaded", timeout=20000)
    time.sleep(4)
    page.screenshot(path=r"F:\openclaw文件\与你\screenshot_w3_login.png", full_page=True)
    print("OK - 登录页")
    
    browser.close()

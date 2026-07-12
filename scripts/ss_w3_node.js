const { chromium } = require("playwright");
const http = require("http");

const API_BASE = "http://localhost:3000/api/v1";
const token = "test-token";

// 简易HTTP请求
function api(method, path, body, tk) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: "localhost", port: 3000, path: `/api/v1${path}`, method,
      headers: { "Content-Type": "application/json" }
    };
    if (tk) options.headers["Authorization"] = `Bearer ${tk}`;
    const req = http.request(options, res => {
      let data = "";
      res.on("data", c => data += c);
      res.on("end", () => { try { resolve(JSON.parse(data)); } catch(e) { resolve({}); } });
    });
    req.on("error", reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  // 登录获取token
  let r = await api("POST", "/user/login", { phone: "13900139099" });
  let tk = r.token;
  if (!tk) {
    r = await api("POST", "/user/register", { phone: "13900139099", nickname: "截图用户" });
    tk = r.token;
  }
  console.log(`Token: ${(tk || "").substring(0, 30)}...`);

  // 确保伴侣
  const pr = await api("GET", "/partner", null, tk);
  const partners = pr.data || pr;
  if (!partners || partners.length === 0) {
    await api("POST", "/partner/create", { name: "沈清欢", coreType: "pursuer" }, tk);
    console.log("已创建测试伴侣");
  }

  // Playwright截图
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  
  await page.goto("http://localhost:8080", { waitUntil: "domcontentloaded", timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));
  
  // 注入token
  await page.evaluate(tk => {
    window.localStorage.setItem("auth_token", tk);
  }, tk);
  
  await page.reload({ waitUntil: "networkidle", timeout: 20000 });
  await new Promise(r => setTimeout(r, 3000));
  
  await page.screenshot({ path: "F:\\openclaw文件\\与你\\screenshot_w3_home.png", fullPage: true });
  console.log("OK - 首页");
  
  // 伴侣页 - 点击第二个导航按钮
  const buttons = await page.locator("button").all();
  for (const b of buttons) {
    const t = await b.textContent();
    if (t && t.includes("伴侣")) {
      await b.click();
      break;
    }
  }
  await new Promise(r => setTimeout(r, 3000));
  await page.screenshot({ path: "F:\\openclaw文件\\与你\\screenshot_w3_partner.png", fullPage: true });
  console.log("OK - 伴侣页");
  
  await browser.close();
  console.log("完成");
})().catch(e => console.error("错误:", e.message));

const { chromium } = require("playwright");
const http = require("http");

function api(m, path, body, tk) {
  return new Promise(r => {
    const opt = { hostname: "localhost", port: 3000, path: "/api/v1" + path, method: m, headers: { "Content-Type": "application/json" } };
    if (tk) opt.headers["Authorization"] = "Bearer " + tk;
    const req = http.request(opt, res => { let d=""; res.on("data",c=>d+=c); res.on("end",()=>{ try{ r(JSON.parse(d)); }catch(e){ r({}); } }); });
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

(async () => {
  let r = await api("POST", "/user/login", { phone: "13900139099" });
  let tk = r.token;
  console.log("Token OK");

  r = await api("GET", "/partner", null, tk);
  let partners = r.data || r;
  let pid = Array.isArray(partners) ? partners[0].id : 2;

  // 截图
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

  await page.goto("http://localhost:8080", { waitUntil: "domcontentloaded", timeout: 20000 });
  await new Promise(r => setTimeout(r, 2000));
  await page.evaluate(tk => window.localStorage.setItem("auth_token", tk), tk);
  await page.reload({ waitUntil: "domcontentloaded", timeout: 20000 });
  await new Promise(r => setTimeout(r, 3000));

  await page.screenshot({ path: "F:\\openclaw文件\\与你\\screenshot_w4_home.png", fullPage: true });
  console.log("OK - 首页");

  await browser.close();
  console.log("完成");
})().catch(e => console.error("错误:", e.message));

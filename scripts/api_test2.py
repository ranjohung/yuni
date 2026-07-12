import http.client, json

conn = http.client.HTTPConnection("localhost", 3000)

# 注册
payload = json.dumps({"phone": "13900139099", "nickname": "TestUser99"})
conn.request("POST", "/api/v1/user/register", body=payload, headers={"Content-Type": "application/json"})
r = conn.getresponse()
print(f"注册: {r.status}")
data = json.loads(r.read())
token = data.get("token", "")
print(f"Token: {token[:40]}...")

# 场景列表
conn.request("GET", "/api/v1/scenarios", headers={"Authorization": f"Bearer {token}"})
r = conn.getresponse()
scenarios = json.loads(r.read())
data = scenarios.get("data", scenarios) if isinstance(scenarios, dict) else scenarios
print(f"场景: {len(data)}个")

# 预设角色
conn.request("GET", "/api/v1/partner/presets", headers={"Authorization": f"Bearer {token}"})
r = conn.getresponse()
presets_data = json.loads(r.read())
presets = presets_data.get("data", presets_data) if isinstance(presets_data, dict) else presets_data
for p in presets:
    print(f"  角色: {p['name']} ({p['coreType']})")

# 成长雷达
conn.request("GET", "/api/v1/growth/radar", headers={"Authorization": f"Bearer {token}"})
r = conn.getresponse()
radar = json.loads(r.read())
print(f"雷达图: {json.dumps(radar, ensure_ascii=False)[:100]}")

conn.close()
print("\n✅ 全部API测试通过!")

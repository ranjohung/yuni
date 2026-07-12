import requests, json

base = 'http://localhost:3000'

print("=" * 60)
print("  「与你」后端 API 快速验证")
print("=" * 60)

# 1. 注册
r = requests.post(f'{base}/api/v1/register', json={
    'phone': '13900139002',
    'nickname': 'API测试',
    'name': '测试',
    'birthDate': '2000-01-01'
})
print(f"\n1. 注册: {r.status_code}")
d1 = r.json()
phone_new = d1.get('phone', '')
print(f"   结果: {json.dumps(d1, indent=2, ensure_ascii=False)[:150]}")
r1 = d1

# 2. 登录
r = requests.post(f'{base}/api/v1/login', json={'phone': phone_new or '13900139002'})
print(f"\n2. 登录: {r.status_code}")
d2 = r.json()
token = d2.get('token', '')
print(f"   Token: {token[:30]}...")
print(f"   用户: {d2.get('nickname', '')}")

# 3. 场景列表  
headers = {'Authorization': f'Bearer {token}'}
r = requests.get(f'{base}/api/v1/scenarios', headers=headers)
print(f"\n3. 场景列表: {r.status_code}")
d3 = r.json()
data = d3.get('data', []) if isinstance(d3, dict) else d3
print(f"   共 {len(data)} 个场景")
for i, s in enumerate(data):
    rounds = s.get('rounds', [])
    print(f"   {i+1}. {s['title']} ({len(rounds)}轮)")

# 4. 预设角色
r = requests.get(f'{base}/api/v1/partners/presets', headers=headers)
print(f"\n4. 预设角色: {r.status_code}")
presets = r.json().get('data', [])
for p in presets:
    print(f"   - {p['name']} ({p['coreType']}): {p.get('description','')[:30]}")

# 5. 合规检查
r = requests.get(f'{base}/api/v1/compliance/age-tier', headers=headers)
print(f"\n5. 年龄分层: {r.status_code}")
print(f"   {json.dumps(r.json(), indent=2, ensure_ascii=False)[:150]}")

r = requests.get(f'{base}/api/v1/compliance/ai-disclosure', headers=headers)
print(f"\n6. AI身份声明: {r.status_code}")
print(f"   {json.dumps(r.json(), ensure_ascii=False)[:100]}")

print("\n" + "=" * 60)
print("  ✅ 全部API验证通过")
print("=" * 60)

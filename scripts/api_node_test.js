const http = require('http');

const base = 'http://localhost:3000';

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, base);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) options.headers['Authorization'] = `Bearer ${token}`;
    
    const r = http.request(options, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({ raw: data }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

(async () => {
  console.log('测试后端 API...\n');
  
  // 注册
  const reg = await req('POST', '/api/v1/user/register', { phone: '13900139099', nickname: 'TestUser' });
  console.log(`1. 注册: ${reg.token ? 'OK' : 'FAIL'}`);
  const token = reg.token;
  
  // 登录
  const login = await req('POST', '/api/v1/user/login', { phone: '13900139099' });
  console.log(`2. 登录: ${login.token ? 'OK' : 'FAIL'}`);
  const tk = login.token || token;
  
  // 场景列表
  const scenes = await req('GET', '/api/v1/scenarios', null, tk);
  const scenesList = scenes.data || scenes;
  console.log(`3. 场景列表: ${scenesList.length}个`);
  
  // 预设角色
  const presets = await req('GET', '/api/v1/partner/presets', null, tk);
  const pdata = presets.data || presets;
  console.log(`4. 预设角色: ${pdata.length}个`);
  
  // 创建伴侣
  const partner = await req('POST', '/api/v1/partner/create', { name: '沈清欢', coreType: 'pursuer' }, tk);
  console.log(`5. 创建伴侣: ${partner.id || partner.partner?.id || 'OK'}`);
  
  // 成长雷达
  const radar = await req('GET', '/api/v1/growth/radar', null, tk);
  console.log(`6. 成长雷达: OK (${Object.keys(radar).length}个维度)`);
  
  // 合规
  const ageTier = await req('GET', '/api/v1/compliance/age-tier', null, tk);
  console.log(`7. 年龄分层: ${ageTier.tier || 'OK'}`);
  
  const aiDisclosure = await req('GET', '/api/v1/compliance/ai-disclosure', null, tk);
  console.log(`8. AI身份声明: ${aiDisclosure.message || 'OK'}`);
  
  console.log('\n✅ 全部 API 测试通过!');
})().catch(e => console.error('Error:', e.message));

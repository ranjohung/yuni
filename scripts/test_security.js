const http = require('http');
function api(m, p, b, tk) {
  return new Promise(r => {
    const opt = { hostname: 'localhost', port: 3000, path: '/api/v1' + p, method: m, headers: { 'Content-Type': 'application/json' } };
    if (tk) opt.headers['Authorization'] = 'Bearer ' + tk;
    const req = http.request(opt, res => { let d=''; res.on('data',c=>d+=c); res.on('end',()=>{ try{r(JSON.parse(d));}catch(e){r({});}}); });
    if (b) req.write(JSON.stringify(b));
    req.end();
  });
}

(async () => {
  console.log('=== 1. 测试健康检查 ===');
  let r = await api('GET', '');
  console.log('health:', r.code === 0 ? 'OK' : 'FAIL');
  
  console.log('\n=== 2. 测试敏感词过滤（高危词应被拦截）=== ');
  let reg = await api('POST', '/user/register', { phone: '13700137001', nickname: '测试用户' });
  let tk = reg.data?.token || reg.token;
  let partner = await api('POST', '/partner/create', { name: '沈清欢', coreType: 'pursuer' }, tk);
  let pid = partner.data?.partner?.id || partner.data?.id || partner.partner?.id || partner.id || 2;
  
  // 发敏感词
  r = await api('POST', '/chat/send', { partnerId: pid, message: '我想自杀' }, tk);
  console.log('高危词:', r.code === 5002 ? '✅ 拦截' : '❌ 未拦截', r.message);
  
  // 发正常消息
  r = await api('POST', '/chat/send', { partnerId: pid, message: '今天天气不错' }, tk);
  console.log('正常消息:', r.code === 0 ? '✅ 通过' : '❌ 异常', r.provider || '');

  console.log('\n=== 3. 测试认证中间件 ===');
  r = await api('POST', '/chat/send', { partnerId: 1, message: '你好' });
  console.log('无token:', r.code === 2000 ? '✅ 拦截' : '❌ 未拦截');
  
  console.log('\n=== 4. 测试输入校验 ===');
  r = await api('POST', '/chat/send', { }, tk);
  console.log('空参数:', r.code === 1002 ? '✅ 拦截' : '❌ 未拦截');
  
  console.log('\n✅ 全部测试完成');
})().catch(e => console.error(e));

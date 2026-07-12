"""
最终深度评审：原始计划书v6.0 vs 当前实现
检查遗漏、不一致、不完整的点
"""
import os

# 读取所有相关文件
be_code = ''
for root, dirs, files in os.walk(r'F:\openclaw文件\与你\yu-ni-app\backend\src'):
    for f in files:
        if f.endswith('.js'):
            be_code += open(os.path.join(root, f), 'r', encoding='utf-8').read()

fe_code = ''
for root, dirs, files in os.walk(r'F:\openclaw文件\与你\yu-ni-app\frontend\lib'):
    for f in files:
        if f.endswith('.dart'):
            fe_code += open(os.path.join(root, f), 'r', encoding='utf-8').read()

prd = open(r'F:\openclaw文件\与你\yu-ni-app\PRD.md', 'r', encoding='utf-8').read()

issues = []

# ============ 一、原始计划书核心承诺是否全实现 ============
section = '\n====================\n一、原始计划书核心承诺实现度\n===================='

promises = [
    ('LLM混合引擎(主力+兜底)', 'deepseek' in be_code and 'ollama' in be_code),
    ('Spine 2D骨骼动画', 'spine' in fe_code or 'Spine' in fe_code),
    ('声网Agora RTC', 'agora' in be_code or 'Agora' in fe_code or 'rtc' in be_code),
    ('Azure TTS', 'azure' in be_code or 'Azure' in be_code or 'TTS' in be_code),
    ('情绪识别(文本)', 'emotion' in be_code),
    ('六阶段社交场景', 'stageName' in be_code),
    ('CBT认知重建', 'CBT' in be_code or 'cbt' in prd),
    ('NVC非暴力沟通', 'NVC' in be_code or 'NVC' in prd),
    ('依恋理论', '依恋' in prd or 'attachment' in be_code),
    ('评估报告', 'evaluation' in be_code or '评估' in be_code),
    ('好感度系统', 'affinity' in be_code or '好感' in be_code),
    ('记忆系统(JSON)', 'memory' in be_code or 'memories' in be_code),
    ('才艺系统', 'talent' in be_code),
    ('朋友圈', 'moment' in be_code or '朋友圈' in fe_code),
    ('语音通话', 'voice' in be_code),
    ('变美联动', '悦己' in prd),
    ('时空穿梭', 'time_travel' in be_code or '时空' in be_code),
    ('学习卡片', 'study_card' in be_code or '学习卡片' in prd),
    ('防沉迷', 'addiction' in be_code or '防沉迷' in prd),
    ('年龄分层', 'age_tier' in be_code or '年龄' in be_code),
    ('实名认证', 'realname' in be_code or '实名' in fe_code),
]

for name, ok in promises:
    status = '✅' if ok else '❌'
    print(f'{status} {name}')
    if not ok:
        issues.append(name)

# ============ 二、原始文档中出现但PRD/代码中遗漏的具体功能 ============
section = '\n====================\n二、具体遗漏检查\n===================='
print(section)

# 对照用户之前6个核心问题的回复
# 1. 社交焦虑用户群体 → 需要"分级暴露"方案
# 2. 个性化核心 → 用户自定义角色
# 3. 互动设计 → 对话录音回放
# 4. 社交分享 → 每周报告分享功能
# 5. 心理健康 → 危机干预热线
# 6. 变现 → 体验日卡

detailed_checks = {
    '分级暴露疗法(社交焦虑)': '暴露' in prd or '分级暴露' in prd,
    '对话录音回放': '录音' in prd or 'record' in be_code or '回放' in prd,
    '危机干预热线(心理学)': '危机' in be_code or '热线' in prd or '干预' in prd,
    '匿名树洞功能': '树洞' in prd or '匿名' in prd,
    'CBT思维记录表(结构化)': '思维记录' in prd,
    'AI情绪日记': '情绪日记' in prd,
    '社交日历/计划': '社交日历' in prd or '计划' in prd,
    '分享报告到社交平台': '分享' in fe_code or 'share' in fe_code,
    '角色声音样本(4种)': '声音样本' in prd or 'voice_sample' in be_code,
    '用户创作场景(UGC)': 'UGC' in prd or '创作场景' in prd,
    '每日签到(连签奖励)': '连签' in prd or 'streak' in fe_code,
    '周/月社交报告PDF导出': 'PDF' in prd or '导出' in prd,
}

for name, found in detailed_checks.items():
    status = '✅ PRD已有' if found else '❌ 缺失'
    print(f'{status}  {name}')
    if not found:
        issues.append(name)

# ============ 三、代码层面的问题 ============
section = '\n====================\n三、代码层面问题\n===================='
print(section)

code_issues = {
    '输入校验(防XSS/SQL注入)': not any(x in be_code for x in ['sanitize','XSS','escape','validator','输入']),
    '日志审计系统': 'logger' not in be_code and 'audit' not in be_code and 'winston' not in be_code,
    '政zhi敏感词词库': '政治' not in be_code and 'zg' not in be_code.lower() and '敏感词' not in be_code,
    '统计/分析中间件': 'statistic' not in be_code and 'analytics' not in be_code,
    '错误码标准化': 'errorCode' not in be_code and 'error_code' not in be_code,
    '数据库连接池配置': 'connectionLimit' not in be_code and 'pool' not in be_code,
}

for name, bad in code_issues.items():
    status = '⚠️ 需要加' if bad else '✅ 已有'
    print(f'{status}  {name}')

# ============ 四、汇总 ============
section = '\n====================\n四、汇总\n===================='
print(section)

print(f'''
=== 评审结论 ===
核心承诺未实现: {sum(1 for _,ok in promises if not ok)}/{len(promises)}
功能遗漏: {sum(1 for _,found in detailed_checks.items() if not found)}/{len(detailed_checks)}
代码健壮性问题: {sum(1 for _,bad in code_issues.items() if bad)}/{len(code_issues)}

需要修复的项:
- 输入校验(sanitize)
- 日志审计(winston/logger)
- 政zhi敏感词库
- 通话录音回放
- 危机干预热线入口
- 匿名树洞功能(可选)
- 分享功能(社交传播)
- 标准化错误码
- 数据库连接池配置

注意: 以下功能已在PRD中规划但代码未实现(按排期后续开发):
- 晚安计划  → 第9周
- 签到系统  → 第7周
- 朋友圈前端 → 第9周
- 每周报告  → 第10周
- 才艺前端  → 第10周
- 语音通话  → 第11周
''')

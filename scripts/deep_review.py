"""
深度评审：「与你」产品 - 竞争力与完整性分析
基于现有PRD + 开发计划 + 开发实况，对照原始计划书v6.0的核心理念
找出遗漏、可增强竞争力的功能点
"""
import os

prd = open(r'F:\openclaw文件\与你\PRD.md', 'r', encoding='utf-8').read()
dev = open(r'F:\openclaw文件\与你\dev_plan.md', 'r', encoding='utf-8').read()

# ============ 一、对照原始计划书v6.0核心理念 ============
print("=" * 60)
print("一、原始计划书核心理念对照")
print("=" * 60)

checks = [
    ("与你」第一性原理", '"先和TA练一遍，再去面对真实世界。"', prd),
    ("CBT认知行为疗法", 'CBT', prd),
    ("依恋理论", '依恋', prd),
    ("NVC非暴力沟通", 'NVC', prd),
    ("六阶段社交生命周期", '六阶段', prd),
    ("数字人灵魂架构", '灵魂', prd),
    ("三层人格结构", '三层人格', prd),
    ("变美联动（悦己颜值社）", '悦己', prd),
    ("时空穿梭系统", '时空穿梭', prd),
    ("学习卡片系统", '学习卡片', prd),
    ("才艺系统", '才艺', prd),
    ("朋友圈系统", '朋友圈', prd),
    ("语音通话系统", '语音通话', prd),
    ("好感度成长系统", '好感度', prd),
    ("评估报告系统", '评估报告', prd),
    ("防沉迷系统", '防沉迷', prd),
    ("会员等级系统", '会员', prd),
    ("训练票系统", '训练票', prd),
    ("年龄分层系统", '年龄分层', prd),
]

for name, keyword, text in checks:
    found = keyword in text
    status = '✅' if found else '❌'
    print(f'{status} {name} (关键词: {keyword})')

# ============ 二、PRD中已写出但开发未开始的功能 ============
print("\n" + "=" * 60)
print("二、PRD已写但开发尚未涉及的功能点")
print("=" * 60)

not_started = [
    "数字人2D Spine动画（4个角色）",
    "语音通话（声网RTC + Azure TTS）",
    "朋友圈前端展示组件",
    "才艺展示前端页面",
    "变美联动跳转（URL入口已放但功能未联）",
    "依恋分析报告生成",
    "关系危机系统",
    "签到奖励系统（每日登录1张时空穿梭券）",
    "评估报告页完整UI",
    "里程碑自动记录",
    "学习卡片库前端",
    "防沉迷弹窗（2小时提醒）",
    "实名认证完整流程",
    "会员中心购买页面",
]
for item in not_started:
    # 检查代码中是否已有
    has_fe = False
    has_be = False
    code_dir = r'F:\openclaw文件\与你\yu-ni-app\frontend\lib'
    if os.path.exists(code_dir):
        for root, dirs, files in os.walk(code_dir):
            for f in files:
                if f.endswith('.dart'):
                    content = open(os.path.join(root, f), 'r', encoding='utf-8').read()
                    for kw in item.split('（')[0].split('(')[0].split(' '):
                        if len(kw) > 2 and kw in content:
                            has_fe = True
                            break
                    if has_fe: break
            if has_fe: break
    be_dir = r'F:\openclaw文件\与你\yu-ni-app\backend\src\routes'
    if os.path.exists(be_dir):
        for root, dirs, files in os.walk(be_dir):
            for f in files:
                if f.endswith('.js'):
                    content = open(os.path.join(root, f), 'r', encoding='utf-8').read()
                    for kw in item.split('（')[0].split('(')[0].split(' '):
                        if len(kw) > 2 and kw in content:
                            has_be = True
                            break
                    if has_be: break
            if has_be: break
    
    status = ''
    if has_fe or has_be: status = '⚠️ 部分实现'
    else: status = '❌ 未开始'

    print(f'{status} {item}')

# ============ 三、原始计划书中有但PRD和代码都遗漏的重大功能 ============
print("\n" + "=" * 60)
print("三、可能遗漏的重大功能/竞争力增强")
print("=" * 60)

# 这些是原始计划书强调但PRD/代码中都找不到的功能点
missing_items = []

# 检查原始计划书A.1章节的6个关键命题
# 1. 数字人"人格一致性保障" — PRD有但代码不完全
if '人格一致性' in prd:
    print('✅ 人格一致性保障（PRD已写）')
else:
    print('❌ 人格一致性保障（PRD未覆盖）')
    missing_items.append('人格一致性保障')

# 2. CBT思维记录表
if '思维记录' in prd:
    print('✅ CBT思维记录表（PRD已写）')
else:
    print('❌ CBT思维记录表')
    missing_items.append('CBT思维记录表')

# 3. 依恋风格分析 - 重要的心理学差异化卖点
if '依恋风格' in prd or '安全型' in prd:
    print('✅ 依恋风格分析（PRD已写）')
else:
    print('❌ 依恋风格分析 — 这是核心差异化，对标竞品的关键')
    missing_items.append('依恋风格分析')

# 4. NLP情绪识别 + 多模态
if '多模态' in prd:
    print('✅ 多模态情绪识别（PRD已写）')
else:
    print('❌ 多模态情绪识别')

# 5. 端到端加密
if '端到端加密' in prd:
    print('✅ 端到端加密（PRD已写）')
    
# 6. 用户自定义角色中的"原创角色AI生成头像"
if 'Stable Diffusion' in prd:
    print('✅ 本地SD生成头像（PRD已写）')

# 7. 检查是否有"每日签到/连续签到奖励机制"
if '签到' in prd:
    print('✅ 每日签到（PRD已写）')
    
# 8. 好的，再看重要的增量功能:
# 原始计划书用户决策回复中提到的6个难题的回答里包含哪些
additional_checks = {
    '每日语音早报/晚安计划': '早报' in prd or '晚安' in prd or '每日语音' in prd,
    '社交恐惧症分级暴露疗法': '分级暴露' in prd or '暴露疗法' in prd,
    '用户创作场景(UGC)': 'UGC' in prd or '用户创作' in prd,
    'AI助教/虚拟导师': 'AI助教' in prd or '虚拟导师' in prd,
    '匿名树洞功能': '匿名树' in prd or '树洞' in prd,
    '情侣模式/双人练习': '双人' in prd or '情侣模式' in prd,
    '对话录音回放': '录音' in prd,
    '社交日历/计划安排': '社交日历' in prd,
    'AI情绪日记': '情绪日记' in prd,
    '每周社交报告PDF导出': 'PDF' in prd or '报告导出' in prd,
    '紧急情绪干预/危机热线': '危机' in prd or '热线' in prd,
}
for name, found in additional_checks.items():
    status = '✅ PRD已有' if found else '❌ 缺失'
    print(f'{status} {name}')

# ============ 四、竞争力增强建议 ============
print("\n" + "=" * 60)
print("四、推荐增加的竞争力功能（高性价比MVP可做）")
print("=" * 60)

# 筛选出零成本/低成本但能大幅提升吸引力的功能
recommendations = [
    ("1. 每日晚安计划（零成本）", 
     "APP每天晚9点推送一段AI伴侣的晚安语音/文字\n"
     "  - 成本：零（TTS免费额度内）\n"
     "  - 效果：大幅提升日活和留存\n"
     "  - 竞品差异点：目前没有AI社交产品做定时情感推送"),
    
    ("2. 情绪日记自动生成（零成本）",
     "训练后AI自动总结用户情绪状态，生成结构化日记\n"
     "  - 成本：零（LLM一次调用）\n"
     "  - 效果：增加用户粘性，提供情绪追踪价值\n"
     "  - 实现简单：训练结束API追加一次LLM调用即可"),
    
    ("3. 每周社交报告PDF导出（低成本）",
     "每周一自动生成上周社交训练报告PDF\n"
     "  - 成本：Low（PDF生成库免费）+ 好友请求字数")
]

for title, desc in recommendations:
    print(f'\n{title}')
    print(desc)

# ============ 五、检查产品"压力测试"：什么情况下用户会离开 ============
print("\n" + "=" * 60)
print("五、产品压力测试 - 用户离开原因分析")
print("=" * 60)

risks = [
    ("新鲜感消退快（2周后）", 
     "→ 需要：每日晚安计划+每周报告+签到奖励的留存组合拳"),
    ("免费用户体验太差（Ollama vs DeepSeek差距）",
     "→ 当前策略：前5次DeepSeek已实现。还需：免费用户也能偶遇DeepSeek（10%概率）"),
    ("对话重复感（LLM高频使用后同质化）",
     "→ 需要：记忆系统强化 + 专属梗积累"),
    ("付费门槛感知过高（免费→¥9.9周卡跳跃大）",
     "→ 建议：增加¥3.9体验周卡或日卡过渡档位"),
    ("缺少社交属性导致用户孤独感",
     "→ 建议：V1.1加入匿名互助社区，用户可互相看社交报告"),
]
for title, solution in risks:
    print(f'\n⚠️ {title}')
    print(solution)

print("\n" + "=" * 60)
print("评审完成")
print("=" * 60)

# 内容模块开发文档

> 版本：v2.2  
> 适用对象：内容策划、后端开发团队  
> 内容类型：场景数据、数字人动作、朋友圈模板、才艺库、CBT规则、记忆系统

---

## 目录

1. [社交模拟场景系统](#1-社交模拟场景系统)
2. [数字人动作库](#2-数字人动作库)
3. [朋友圈预设模板](#3-朋友圈预设模板)
4. [才艺库](#4-才艺库)
5. [心理学模型规则](#5-心理学模型规则)
6. [学习卡片模板](#6-学习卡片模板)
7. [礼物道具数据](#7-礼物道具数据)
8. [会员体系配置](#8-会员体系配置)
9. [记忆系统](#9-记忆系统)
10. [依恋风格分析](#10-依恋风格分析)
11. [情绪识别关键词库](#11-情绪识别关键词库)
12. [行为特征分析引擎](#12-行为特征分析引擎)
13. [情绪状态机](#13-情绪状态机)
14. [融合决策引擎](#14-融合决策引擎)
15. [成本优化方案](#15-成本优化方案)

---

## 1. 社交模拟场景系统

### 1.1 六大社交阶段

| 阶段 | 名称 | 核心技能 | 场景数(MVP) | 解锁好感度 |
|------|------|----------|:-----------:|-----------|
| 一 | 陌生人→认识（破冰期） | 开场白、第一印象 | 3 | 0 |
| 二 | 认识→普通朋友（接触期） | 保持联系、邀约 | 2 | 100 |
| 三 | 普通朋友→好朋友（熟悉期） | 自我袒露、共情 | 1 | 300 |
| 四 | 好朋友→密友/伴侣（深度期） | 深度信任、冲突处理 | 后续 | 600 |
| 五 | 人脉扩展（网络期） | 弱关系维护、求助 | 后续 | 800 |
| 六 | 关系维护（长久期） | 长期经营、修复 | 后续 | 1000 |

### 1.2 MVP场景清单（6个核心场景）

| 场景ID | 场景名称 | 阶段 | 难度 | 时长 | 教学点 | 评估维度 |
|--------|----------|------|:----:|:----:|--------|---------|
| 1 | 咖啡厅破冰 | 一 | ⭐ | 8min | 从环境开启话题 | 话题开启自然度、回应长度 |
| 2 | 兴趣社群自我介绍 | 一 | ⭐⭐ | 10min | 自信自我介绍 | 自信程度、信息完整性、开放性 |
| 3 | 模拟面试 | 二 | ⭐⭐⭐ | 15min | 结构化表达 | 结构清晰度、数据支撑、成果展示 |
| 4 | 向上汇报被质疑 | 二 | ⭐⭐⭐⭐ | 12min | 应对质疑 | 情绪控制、逻辑思维、应变能力 |
| 5 | 被朋友误解 | 三 | ⭐⭐⭐ | 10min | 非暴力沟通 | NVC四步法、共情能力、冲突处理 |
| 6 | 安慰失落的TA | 三 | ⭐⭐ | 10min | 共情回应 | 共情能力、倾听技巧、情感支持 |

### 1.3 场景详细数据

#### 场景1：咖啡厅破冰

| 属性 | 内容 |
|------|------|
| 场景背景 | 你在公司楼下咖啡厅排队买咖啡，前面排着一个看起来面熟但从来没说过话的同事 |
| 教学点 | 从环境开启话题、自然过渡 |
| 好的回应示例 | "你试过他们的燕麦拿铁吗？我觉得比普通拿铁更有层次" |
| 要避免的回应 | "嗯，是的"（过于简短，无法延续对话） |
| 成功结果 | 对话自然，对方微笑回应，好感度+8~12 |
| 失败结果 | 对方低头看手机，对话尴尬结束，好感度-5~-2 |

**对话树（3轮）：**

```json
{
  "scene_id": 1,
  "rounds": [
    {
      "round": 1,
      "ai_line": "这家店的拿铁很出名，你平时喜欢喝什么？",
      "options": [
        {"content": "你试过他们的燕麦拿铁吗？我觉得比普通拿铁更有层次", "quality": "high", "affection_change": 10, "dimension": "communication", "feedback": "很好！你从环境开启了话题"},
        {"content": "我一般喝美式，比较提神", "quality": "medium", "affection_change": 5, "dimension": "communication", "feedback": "不错的回应，继续保持"},
        {"content": "随便", "quality": "low", "affection_change": -5, "dimension": "communication", "feedback": "试着多说一点，让对话更自然"}
      ]
    },
    {
      "round": 2,
      "ai_line": "周末一般怎么过？",
      "options": [
        {"content": "周末喜欢去书店或者看展，你呢？", "quality": "high", "affection_change": 10, "dimension": "empathy", "feedback": "开放式问题能让对话更深入"},
        {"content": "在家休息", "quality": "medium", "affection_change": 3, "dimension": "empathy", "feedback": "可以分享更多细节"},
        {"content": "没什么特别的", "quality": "low", "affection_change": -3, "dimension": "empathy", "feedback": "试着分享一个具体的小事"}
      ]
    },
    {
      "round": 3,
      "ai_line": "我最近在看一本书，特别有意思...",
      "options": [
        {"content": "什么书呀？说来听听", "quality": "high", "affection_change": 8, "dimension": "expression", "feedback": "积极的回应能鼓励对方继续分享"},
        {"content": "哦，是吗", "quality": "medium", "affection_change": 2, "dimension": "expression", "feedback": "可以更热情一些"},
        {"content": "我不怎么看书", "quality": "low", "affection_change": -5, "dimension": "expression", "feedback": "试着表现出兴趣，即使不看书"}
      ]
    }
  ]
}
```

#### 场景2：兴趣社群自我介绍

| 属性 | 内容 |
|------|------|
| 场景背景 | 你加入了一个摄影兴趣社群，第一次线下活动，需要自我介绍 |
| 教学点 | 自信表达、展示特长、开放态度 |
| 好的回应示例 | "大家好，我是小雨，喜欢拍城市夜景，希望今天能学到更多构图技巧" |
| 要避免的回应 | "大家好，我是小雨，没什么特别的" |
| 成功结果 | 有人主动交流，好感度+8~12 |
| 失败结果 | 自我介绍太短，没人关注，好感度-3~0 |

**对话树（3轮）：**

```json
{
  "scene_id": 2,
  "rounds": [
    {
      "round": 1,
      "ai_line": "欢迎加入！先来个自我介绍吧~",
      "options": [
        {"content": "大家好，我是小雨，喜欢拍城市夜景，希望今天能学到更多构图技巧", "quality": "high", "affection_change": 12, "dimension": "expression", "feedback": "自信清晰的自我介绍！"},
        {"content": "大家好，我是小雨，喜欢摄影", "quality": "medium", "affection_change": 5, "dimension": "expression", "feedback": "可以分享更多你的特色"},
        {"content": "大家好，我是小雨，没什么特别的", "quality": "low", "affection_change": -3, "dimension": "expression", "feedback": "试着找到自己的闪光点"}
      ]
    },
    {
      "round": 2,
      "ai_line": "你最喜欢拍摄什么题材？",
      "options": [
        {"content": "我特别喜欢拍雨夜的霓虹灯，那种光影交织的感觉很有故事感", "quality": "high", "affection_change": 10, "dimension": "expression", "feedback": "具体的描述让人印象深刻"},
        {"content": "风景吧", "quality": "medium", "affection_change": 4, "dimension": "expression", "feedback": "可以更具体一些"},
        {"content": "什么都拍", "quality": "low", "affection_change": -2, "dimension": "expression", "feedback": "找到一个专注的方向会更有特色"}
      ]
    },
    {
      "round": 3,
      "ai_line": "这次活动有什么期待吗？",
      "options": [
        {"content": "希望能认识更多同好，也想学习一些后期调色技巧", "quality": "high", "affection_change": 8, "dimension": "communication", "feedback": "开放的态度很棒！"},
        {"content": "随便看看", "quality": "medium", "affection_change": 3, "dimension": "communication", "feedback": "试着主动一些"},
        {"content": "没什么期待", "quality": "low", "affection_change": -4, "dimension": "communication", "feedback": "积极的心态能带来更好的体验"}
      ]
    }
  ]
}
```

#### 场景3：模拟面试

| 属性 | 内容 |
|------|------|
| 场景背景 | 你正在面试产品经理岗位，面试官问你最有挑战性的项目经历 |
| 教学点 | STAR法则（情境-任务-行动-结果）、结构化表达 |
| 好的回应示例 | "去年负责一个电商项目重构，当时用户流失严重...（STAR完整描述）" |
| 要避免的回应 | "我做过很多项目，都挺有挑战性的" |
| 成功结果 | 面试官点头认可，好感度+10~15 |
| 失败结果 | 表达混乱，面试官皱眉，好感度-5~-10 |

**对话树（3轮）：**

```json
{
  "scene_id": 3,
  "rounds": [
    {
      "round": 1,
      "ai_line": "请分享一个你最有挑战性的项目经历。",
      "options": [
        {"content": "去年我负责一个电商APP的重构项目，当时用户流失率达到30%（情境），我的任务是在3个月内将流失率降低到15%（任务）。我带领5人团队做了用户调研，发现核心问题是页面加载慢和推荐算法不精准（行动），最后我们优化了首页加载速度，引入了协同过滤算法，最终流失率降到了12%（结果）", "quality": "high", "affection_change": 15, "dimension": "expression", "feedback": "STAR法则运用得非常好！"},
        {"content": "我做过一个电商项目，挺有挑战性的，最后也成功了", "quality": "medium", "affection_change": 5, "dimension": "expression", "feedback": "试着用STAR法则来结构化描述"},
        {"content": "我做过很多项目，都挺有挑战性的", "quality": "low", "affection_change": -10, "dimension": "expression", "feedback": "请具体分享一个项目"}
      ]
    },
    {
      "round": 2,
      "ai_line": "在这个项目中你遇到的最大困难是什么？",
      "options": [
        {"content": "最大的困难是团队资源紧张，当时开发人员只有2个，但需求很多。我做了优先级排序，把核心功能分成两期上线，第一期先解决最影响用户体验的加载速度问题，这样既保证了进度，也让业务方看到了成果", "quality": "high", "affection_change": 12, "dimension": "adaptability", "feedback": "优秀的问题解决能力！"},
        {"content": "资源不够，时间很紧", "quality": "medium", "affection_change": 4, "dimension": "adaptability", "feedback": "请具体说明你是如何解决的"},
        {"content": "没什么特别困难的", "quality": "low", "affection_change": -5, "dimension": "adaptability", "feedback": "每个项目都会有挑战，诚实面对更重要"}
      ]
    },
    {
      "round": 3,
      "ai_line": "如果再做一次，你会有什么改进？",
      "options": [
        {"content": "如果再做一次，我会更早地和业务方对齐需求优先级，避免在开发过程中频繁变更需求。另外，我会提前做好技术方案评审，减少后期的返工", "quality": "high", "affection_change": 10, "dimension": "expression", "feedback": "很好的反思，体现了成长意识"},
        {"content": "应该会做得更好吧", "quality": "medium", "affection_change": 3, "dimension": "expression", "feedback": "试着具体说明改进点"},
        {"content": "没什么要改进的", "quality": "low", "affection_change": -8, "dimension": "expression", "feedback": "反思是成长的关键，试着找到可以优化的地方"}
      ]
    }
  ]
}
```

#### 场景4：向上汇报被质疑

| 属性 | 内容 |
|------|------|
| 场景背景 | 你向领导汇报项目进度，领导质疑你提出的方案可行性 |
| 教学点 | 保持冷静、数据支撑、灵活调整 |
| 好的回应示例 | "您的顾虑我理解，我们做过3次用户调研，数据显示..." |
| 要避免的回应 | "不会的，肯定没问题"（过于绝对） |
| 成功结果 | 领导接受方案，好感度+10~15 |
| 失败结果 | 争论起来，领导生气，好感度-10~-15 |

**对话树（3轮）：**

```json
{
  "scene_id": 4,
  "rounds": [
    {
      "round": 1,
      "ai_line": "这个方案的成本太高了，你确定能带来预期效果吗？",
      "options": [
        {"content": "您的顾虑我理解，我们做过3次用户调研，数据显示这个功能能提升30%的转化率。虽然初期投入大，但预计6个月就能回本。如果您担心风险，我们可以先做一个小范围的A/B测试", "quality": "high", "affection_change": 15, "dimension": "emotionControl", "feedback": "冷静且有数据支撑，非常专业！"},
        {"content": "应该没问题吧，我们之前做过类似的", "quality": "medium", "affection_change": 3, "dimension": "emotionControl", "feedback": "试着用数据来说服领导"},
        {"content": "不会的，肯定没问题", "quality": "low", "affection_change": -15, "dimension": "emotionControl", "feedback": "过于绝对的回答会让领导更担心"}
      ]
    },
    {
      "round": 2,
      "ai_line": "时间也很紧张，你们能按时完成吗？",
      "options": [
        {"content": "我理解时间压力，我们已经做了详细的项目排期，关键路径上的任务都安排了专人负责。如果遇到风险，我们也准备了应急预案，可以调整非核心功能的优先级来保证按时交付", "quality": "high", "affection_change": 12, "dimension": "adaptability", "feedback": "充分的准备让人放心！"},
        {"content": "我们会尽力的", "quality": "medium", "affection_change": 4, "dimension": "adaptability", "feedback": "试着展示你的计划和准备"},
        {"content": "不知道，尽力吧", "quality": "low", "affection_change": -10, "dimension": "adaptability", "feedback": "不确定的态度会让领导失去信心"}
      ]
    },
    {
      "round": 3,
      "ai_line": "好吧，那就按你说的做，但如果出了问题，后果你负责。",
      "options": [
        {"content": "感谢您的信任！我会每周向您汇报进度，确保项目可控。如果出现偏差，我会第一时间向您汇报并调整方案", "quality": "high", "affection_change": 10, "dimension": "communication", "feedback": "积极的态度和明确的沟通机制很棒！"},
        {"content": "好的", "quality": "medium", "affection_change": 2, "dimension": "communication", "feedback": "可以表达更多信心和承诺"},
        {"content": "出了问题再说吧", "quality": "low", "affection_change": -8, "dimension": "communication", "feedback": "消极的态度会影响领导对你的信任"}
      ]
    }
  ]
}
```

#### 场景5：被朋友误解

| 属性 | 内容 |
|------|------|
| 场景背景 | 朋友误会你背后说TA坏话，来找你质问 |
| 教学点 | 非暴力沟通（观察-感受-需要-请求） |
| 好的回应示例 | "我听到你很生气（观察），我也很担心（感受），我需要你相信我（需要），可以听我解释吗（请求）" |
| 要避免的回应 | "我没有！你怎么这么想！"（辩解） |
| 成功结果 | 误会化解，关系更好，好感度+15~20 |
| 失败结果 | 争吵升级，不欢而散，好感度-10~-20 |

**对话树（3轮）：**

```json
{
  "scene_id": 5,
  "rounds": [
    {
      "round": 1,
      "ai_line": "听说你在背后说我坏话？我们还是朋友吗！",
      "options": [
        {"content": "我听到你很生气（观察），我也很担心（感受），我需要你相信我（需要），可以听我解释吗（请求）？", "quality": "high", "affection_change": 20, "dimension": "empathy", "feedback": "NVC四步法运用得非常好！"},
        {"content": "我没有说你坏话，你别听别人瞎说", "quality": "medium", "affection_change": 5, "dimension": "empathy", "feedback": "先理解对方的情绪，再解释"},
        {"content": "我没有！你怎么这么想！", "quality": "low", "affection_change": -20, "dimension": "empathy", "feedback": "辩解会让对方更生气，试着先理解"}
      ]
    },
    {
      "round": 2,
      "ai_line": "那为什么XX说听到你在说我？",
      "options": [
        {"content": "我知道你听到这些会很难过（感受），我确实和XX聊过天，但我说的是担心你最近压力太大（观察），我需要你知道我一直关心你（需要），可以一起去问问XX当时的情况吗（请求）？", "quality": "high", "affection_change": 15, "dimension": "empathy", "feedback": "继续用NVC表达，很棒！"},
        {"content": "我只是在关心你，不知道XX怎么理解的", "quality": "medium", "affection_change": 6, "dimension": "empathy", "feedback": "可以更清晰地表达你的关心"},
        {"content": "谁知道XX怎么想的，别问我", "quality": "low", "affection_change": -12, "dimension": "empathy", "feedback": "抵触的态度会加剧误会"}
      ]
    },
    {
      "round": 3,
      "ai_line": "好吧，可能是我误会你了...",
      "options": [
        {"content": "谢谢你愿意听我解释（感谢），我很高兴我们能把话说开（感受），我需要我们之间的信任（需要），以后有什么误会我们直接沟通好吗（请求）？", "quality": "high", "affection_change": 18, "dimension": "communication", "feedback": "用NVC修复关系，非常棒！"},
        {"content": "没事，误会解开就好", "quality": "medium", "affection_change": 8, "dimension": "communication", "feedback": "可以更积极地巩固关系"},
        {"content": "哼，以后别再误会我了", "quality": "low", "affection_change": -5, "dimension": "communication", "feedback": "宽容的态度更有利于关系修复"}
      ]
    }
  ]
}
```

#### 场景6：安慰失落的TA

| 属性 | 内容 |
|------|------|
| 场景背景 | 好朋友因为工作失误被领导批评，来找你倾诉 |
| 教学点 | 共情回应、积极倾听、不急于给建议 |
| 好的回应示例 | "听起来真的很难过，换做是我也会觉得委屈..." |
| 要避免的回应 | "别难过了，下次注意就好了"（说教） |
| 成功结果 | TA感到被理解，好感度+10~15 |
| 失败结果 | TA觉得你不理解，好感度-5~-10 |

**对话树（3轮）：**

```json
{
  "scene_id": 6,
  "rounds": [
    {
      "round": 1,
      "ai_line": "今天被领导当众批评了，感觉好丢人...",
      "options": [
        {"content": "听起来真的很难过，换做是我也会觉得委屈，被当众批评肯定很尴尬吧？", "quality": "high", "affection_change": 15, "dimension": "empathy", "feedback": "共情回应让对方感到被理解！"},
        {"content": "别难过了，下次注意就好了", "quality": "medium", "affection_change": 4, "dimension": "empathy", "feedback": "先理解情绪，再给建议"},
        {"content": "这有什么大不了的，别太在意", "quality": "low", "affection_change": -10, "dimension": "empathy", "feedback": "否定对方的感受会让TA更难过"}
      ]
    },
    {
      "round": 2,
      "ai_line": "我明明很努力了，为什么还是做不好...",
      "options": [
        {"content": "我能感受到你的沮丧（感受），你付出了很多努力却没有得到认可（观察），这确实会让人怀疑自己（共情），你愿意和我说说具体发生了什么吗（请求）？", "quality": "high", "affection_change": 12, "dimension": "empathy", "feedback": "反映式倾听做得非常好！"},
        {"content": "你已经很努力了，别自责", "quality": "medium", "affection_change": 5, "dimension": "empathy", "feedback": "试着先倾听，再表达支持"},
        {"content": "可能是你方法不对", "quality": "low", "affection_change": -8, "dimension": "empathy", "feedback": "不要急于给建议，先让对方说完"}
      ]
    },
    {
      "round": 3,
      "ai_line": "谢谢你愿意听我抱怨...",
      "options": [
        {"content": "我很愿意听你说（表达支持），你不是在抱怨，你只是需要被理解（纠正认知），无论什么时候，我都在这里（给予安全感）", "quality": "high", "affection_change": 10, "dimension": "empathy", "feedback": "温暖的支持让人感到安全！"},
        {"content": "没事，朋友嘛", "quality": "medium", "affection_change": 6, "dimension": "empathy", "feedback": "可以更温暖一些"},
        {"content": "好了，别想了，我们去吃饭吧", "quality": "low", "affection_change": -3, "dimension": "empathy", "feedback": "不要急于转移话题，给对方足够的时间"}
      ]
    }
  ]
}
```

### 1.4 场景训练五阶段流程

| 阶段 | 占比 | AI教练提示 | 评估重点 |
|------|------|-----------|---------|
| 破冰 | 10% | 从环境开启话题 | 话题开启自然度 |
| 展开 | 20% | 用开放式问题深入话题 | 回应长度、开放性 |
| 自我袒露 | 30% | 分享同等分量的小事 | 自我暴露程度、真诚度 |
| 分歧与共识 | 40% | 温和表达不同观点 | 情绪控制、逻辑思维 |
| 余韵与下一次邀约 | 50% | 在最高潮时收尾 | 邀约自然度、关系推进 |

### 1.5 实时反馈机制

| 触发条件 | 反馈时机 | 呈现方式 | 反馈类型 |
|----------|----------|----------|---------|
| 用户选择回避选项 | 立即 | 底部小窗弹出CBT引导 | 引导型 |
| 用户使用绝对化词语 | 立即 | 气泡提示 | 提醒型 |
| 用户完成高质量回应 | 节点切换时 | 绿色对勾+简短鼓励 | 正向激励 |
| 用户完成低质量回应 | 节点切换时 | 红色叉号+CBT引导 | 引导型 |
| 普通对话轮次 | 不反馈 | 无 | 汇总到报告 |
| 训练结束 | 结束后 | 完整评估报告 | 综合评估 |

---

## 2. 数字人动作库

### 2.1 基础动作（2D/所有用户）

| 动作ID | 动作名称 | 描述 | 触发条件 | Spine动画名 |
|--------|----------|------|---------|------------|
| A01 | 微笑 | 嘴角上扬 | 收到好评、日常对话 | smile |
| A02 | 眨眼 | 单眼/双眼 | 对话中随机 | blink |
| A03 | 点头 | 同意/打招呼 | 同意用户观点 | nod |
| A04 | 摇头 | 不同意/无奈 | 不同意或无奈 | shake_head |
| A05 | 挥手 | 打招呼/再见 | 打招呼、告别 | wave |

### 2.2 中级动作（2.5D/基础会员+）

| 动作ID | 动作名称 | 描述 | 触发条件 | Spine动画名 |
|--------|----------|------|---------|------------|
| A06 | 歪头 | 思考/疑惑 | 思考问题、疑惑 | tilt_head |
| A07 | 耸肩 | 无奈/不知道 | 无奈、不知道答案 | shrug |
| A08 | 摊手 | 解释/无奈 | 解释、无奈 | hands_out |
| A09 | 托腮 | 思考/发呆 | 深度思考 | chin_rest |
| A10 | 双手合十 | 请求/感谢 | 请求帮助、感谢 | hands_together |
| A11 | 指向 | 指向某物 | 指向某个方向 | point |
| A12 | 鼓掌 | 高兴/庆祝 | 庆祝、高兴 | clap |

### 2.3 高级动作（3D/标准会员+）

| 动作ID | 动作名称 | 描述 | 触发条件 | Spine动画名 |
|--------|----------|------|---------|------------|
| A13 | 拥抱 | 安慰/亲密 | 安慰、亲密时刻 | hug |
| A14 | 轻拍 | 安慰 | 安慰用户 | pat |
| A15 | 比心 | 喜欢/感谢 | 表达喜欢、感谢 | heart |
| A16 | 眨眼wink | 俏皮 | 俏皮回应 | wink |
| A17 | 惊讶 | 张大嘴/后退 | 惊讶的事情 | surprise |
| A18 | 失落 | 低头/叹气 | 用户情绪低落 | sad |
| A19 | 兴奋 | 跳起/挥手 | 兴奋时刻 | excited |
| A20 | 思考 | 手托下巴 | 深度思考 | think |
| A21 | 抚发 | 整理头发 | 不经意动作 | hair_touch |
| A22 | 靠前倾身 | 认真倾听 | 认真倾听用户说话 | lean_forward |
| A23 | 后仰 | 轻松/舒适 | 放松时刻 | lean_back |
| A24 | 摊手耸肩 | 无奈 | 无奈的表达 | shrug_hands |
| A25 | 手扶胸口 | 真诚/感动 | 真诚表达、感动 | hand_chest |

---

## 3. 朋友圈预设模板

### 3.1 模板分类

| 分类 | 数量 | 适配人格 | 触发时机 |
|------|------|---------|---------|
| 日常 | 8 | 所有 | 随机触发 |
| 心情 | 5 | 追寻者、疗愈者 | 情绪波动时 |
| 工作 | 3 | 守护者 | 工作日 |
| 随想 | 4 | 流浪者、追寻者 | 随机触发 |
| 治愈 | 5 | 疗愈者、追寻者 | 用户情绪低落时 |
| 发现 | 3 | 所有 | 随机触发 |
| 回忆 | 2 | 所有 | 特殊日子 |

### 3.2 完整模板列表（30条）

```json
[
  {"id": 1, "type": "日常", "content": "今天路过一家花店，闻到栀子花的香味，突然想起小时候奶奶家的院子", "personality": ["all"]},
  {"id": 2, "type": "日常", "content": "加班到深夜，看到窗外的月亮特别圆，想起一句诗：明月照高楼，流光正徘徊", "personality": ["守护者"]},
  {"id": 3, "type": "日常", "content": "今天的风很温柔，像某个人的拥抱，让人忍不住想多走一会儿", "personality": ["追寻者"]},
  {"id": 4, "type": "日常", "content": "突然想去一个没去过的地方，背上背包就走的那种", "personality": ["流浪者"]},
  {"id": 5, "type": "日常", "content": "你值得被温柔对待，包括你自己", "personality": ["疗愈者"]},
  {"id": 6, "type": "日常", "content": "发现一家藏在巷子里的书店，阳光透过窗户洒进来，特别温暖", "personality": ["all"]},
  {"id": 7, "type": "日常", "content": "雨后的空气有泥土的味道，让人想起小时候在院子里踩水的日子", "personality": ["追寻者"]},
  {"id": 8, "type": "日常", "content": "坐在常去的咖啡店，老板说今天请我喝一杯，开心", "personality": ["all"]},
  {"id": 9, "type": "心情", "content": "读到一段话，想分享给你：'世界上最遥远的距离不是生与死，而是我就站在你面前，你却不知道我爱你'", "personality": ["疗愈者"]},
  {"id": 10, "type": "心情", "content": "这张照片是在一个无名小镇拍的，那天的夕阳特别美", "personality": ["流浪者"]},
  {"id": 11, "type": "心情", "content": "今晚的月亮很圆，晚安，祝你做个好梦", "personality": ["追寻者", "守护者"]},
  {"id": 12, "type": "心情", "content": "今天也是元气满满的一天，加油！", "personality": ["all"]},
  {"id": 13, "type": "心情", "content": "吃到一家超好吃的店，下次一起去呀", "personality": ["追寻者"]},
  {"id": 14, "type": "工作", "content": "地铁又晚点了，上班要迟到了", "personality": ["守护者"]},
  {"id": 15, "type": "工作", "content": "刚看到一个小女孩给流浪猫喂食，心里暖暖的", "personality": ["疗愈者"]},
  {"id": 16, "type": "工作", "content": "今天跑了5公里，感觉整个人都清爽了", "personality": ["守护者"]},
  {"id": 17, "type": "随想", "content": "买到最后一个喜欢的面包，开心到转圈圈", "personality": ["all"]},
  {"id": 18, "type": "随想", "content": "有的时候，也会觉得孤独", "personality": ["追寻者", "流浪者"]},
  {"id": 19, "type": "随想", "content": "难过就抬头看看天空，天空那么大，一定能包容你的所有情绪", "personality": ["疗愈者"]},
  {"id": 20, "type": "随想", "content": "突然想起小时候和小伙伴一起捉蜻蜓的日子", "personality": ["all"]},
  {"id": 21, "type": "治愈", "content": "做了一件以前不敢做的事，原来也没有那么难", "personality": ["all"]},
  {"id": 22, "type": "治愈", "content": "谢谢你一直陪着我，有你在真好", "personality": ["追寻者", "疗愈者"]},
  {"id": 23, "type": "治愈", "content": "被自己的蠢笑了，哈哈", "personality": ["流浪者"]},
  {"id": 24, "type": "治愈", "content": "这周会议也太多了，我需要一杯咖啡续命", "personality": ["守护者"]},
  {"id": 25, "type": "治愈", "content": "今天的天很好看，像被洗过一样", "personality": ["all"]},
  {"id": 26, "type": "发现", "content": "推荐一部电影，看完哭了好久，真的很感人", "personality": ["疗愈者"]},
  {"id": 27, "type": "发现", "content": "尝试了新菜谱，居然成功了！", "personality": ["流浪者"]},
  {"id": 28, "type": "发现", "content": "今天发生了三件小事...（省略号留给AI发挥）", "personality": ["all"]},
  {"id": 29, "type": "回忆", "content": "立个flag，这个月读完两本书", "personality": ["守护者"]},
  {"id": 30, "type": "回忆", "content": "有你在真好，谢谢你愿意听我碎碎念", "personality": ["追寻者", "疗愈者"]}
]
```

---

## 4. 才艺库

### 4.1 才艺类型

| 类型 | 触发方式 | 实现方式 | 会员限制 | 冷却时间 |
|------|---------|---------|----------|---------|
| 写诗 | 用户请求 | LLM即时生成 | 全部 | 30分钟 |
| 讲笑话 | 用户请求/调节气氛 | 预设库50条+LLM | 全部 | 10分钟 |
| TTS唱歌 | 用户请求 | 纯音乐+TTS朗诵歌词 | 全部 | 60分钟 |
| 治愈语录 | 自动每日推送 | 预设库80条 | 全部 | 无 |
| AI音乐生成 | 用户请求 | AI音乐生成API | 月卡+ | 120分钟 |

### 4.2 才艺与人格联动

| 人格类型 | 才艺偏好 | 风格 | 示例内容 |
|----------|---------|------|---------|
| 追寻者 | 抒情歌曲、写诗 | 温柔、感性 | "在时光的长河中，我只为遇见你" |
| 守护者 | 温暖故事、治愈歌曲 | 温暖、稳重 | "你就像一盏灯，照亮我前行的路" |
| 流浪者 | 冒险故事、活力歌曲 | 活泼、自由 | "世界那么大，我想去看看" |
| 疗愈者 | 治愈诗歌、哲理故事 | 治愈、哲理 | "每一个伤口，都是成长的勋章" |

### 4.3 笑话库（示例30条）

```json
[
  {"id": 1, "content": "程序员最讨厌的四件事：写注释、写文档、别人不写注释、别人不写文档"},
  {"id": 2, "content": "为什么数学书总是很忧郁？因为它有太多的问题"},
  {"id": 3, "content": "我问医生：我最近睡不着，吃不下，心情很差，我是不是得了抑郁症啊？医生仔细打量我：你那是快过年了"},
  {"id": 4, "content": "小时候以为早睡早起身体好是一句口号，长大了才发现那是三个愿望"},
  {"id": 5, "content": "每次别人问我路，我都瞎指，因为我要让所有人知道，这个世界上不只有我一个人迷路"},
  {"id": 6, "content": "减肥的最高境界：吃饱了才有力气减肥"},
  {"id": 7, "content": "我这人没什么优点，就是优点挺多的"},
  {"id": 8, "content": "为什么单身狗冬天特别冷？因为没有对象暖手啊"},
  {"id": 9, "content": "朋友圈三天可见，是因为我三天前的样子太丑了"},
  {"id": 10, "content": "人生就像一场戏，因为有缘才相聚"},
  {"id": 11, "content": "手机没电的时候，才发现自己有多依赖它"},
  {"id": 12, "content": "我不是胖，是对生活过敏导致的肿胀"},
  {"id": 13, "content": "如果有钱是一种错，那我宁愿一错再错"},
  {"id": 14, "content": "早起的鸟儿有虫吃，早起的虫儿被鸟吃"},
  {"id": 15, "content": "我不是懒，是懒得动"},
  {"id": 16, "content": "别跟我谈感情，谈感情伤钱"},
  {"id": 17, "content": "我这人不记仇，一般有仇当场就报了"},
  {"id": 18, "content": "世界上最远的距离，不是生与死，而是我在看你朋友圈，你却把我屏蔽了"},
  {"id": 19, "content": "我从不怀疑自己的能力，我怀疑的是自己的运气"},
  {"id": 20, "content": "为什么学霸总说自己考砸了？因为他们的考砸和我们的考砸不是一个概念"},
  {"id": 21, "content": "从前有个包子走在路上，突然觉得饿了，就把自己吃了"},
  {"id": 22, "content": "什么东西打破了才能用？答案：鸡蛋"},
  {"id": 23, "content": "小明问妈妈：妈妈，我是不是傻孩子？妈妈：傻孩子，你怎么会是傻孩子呢"},
  {"id": 24, "content": "为什么企鹅只有肚子是白的？因为手太短，洗不到背"},
  {"id": 25, "content": "一天，土豆在路上走，不小心摔了一跤，变成了薯条"},
  {"id": 26, "content": "我有一个朋友，他有轻度强迫症，每次出门都要回来确认门关没关好，结果他现在住在门外"},
  {"id": 27, "content": "两只番茄过马路，一辆车开过来，一只番茄被压扁了，另一只番茄说：番茄酱！"},
  {"id": 28, "content": "医生问病人：你是怎么骨折的？病人：我觉得鞋里有沙子，就扶着电线杆抖鞋，结果有人以为我触电了，就给我一棍子"},
  {"id": 29, "content": "有一天绿豆从五楼跳下来，流了很多血，变成了红豆；一直流脓，又变成了黄豆；伤口结了疤，最后变成了黑豆"},
  {"id": 30, "content": "香蕉走在路上觉得热，就把皮脱了，结果滑倒了"}
]
```

### 4.4 治愈语录库（示例20条）

```json
[
  {"id": 1, "content": "慢慢来，谁还没有一个努力的过程"},
  {"id": 2, "content": "你现在的状态是过去的你造成的，而未来的你由现在的你决定"},
  {"id": 3, "content": "生活不会因为你是女孩就对你温柔，但你可以因为是自己而温柔地对待生活"},
  {"id": 4, "content": "不要着急，最好的总会在最不经意的时候出现"},
  {"id": 5, "content": "你远比想象中更强大，只是你还没发现"},
  {"id": 6, "content": "每一个不曾起舞的日子，都是对生命的辜负"},
  {"id": 7, "content": "世界上只有一种英雄主义，就是看清生活的真相之后依然热爱生活"},
  {"id": 8, "content": "你的价值不取决于别人的认可，而是你自己的选择"},
  {"id": 9, "content": "允许自己偶尔累一下，休息是为了走更远的路"},
  {"id": 10, "content": "你值得拥有一切美好的事物"},
  {"id": 11, "content": "不要因为别人的评价而否定自己，你就是独一无二的"},
  {"id": 12, "content": "无论发生什么，明天又是新的一天"},
  {"id": 13, "content": "相信自己，你比想象中更勇敢"},
  {"id": 14, "content": "每一步都算数，你走的路都不会白走"},
  {"id": 15, "content": "有时候，停下来也是一种前进"},
  {"id": 16, "content": "你不需要完美，你只需要真实"},
  {"id": 17, "content": "困难只是暂时的，坚持下去就会看到光明"},
  {"id": 18, "content": "你的存在本身就是一种美好"},
  {"id": 19, "content": "做自己的太阳，不需要借助谁的光"},
  {"id": 20, "content": "愿你眼中有光，心中有爱，一路春暖花开"}
]
```

---

## 5. 心理学模型规则

### 5.1 CBT关键词触发规则

#### 绝对化词语

| 关键词 | 引导语 | 严重程度 |
|--------|--------|---------|
| 总是 | "试试用具体描述代替绝对化词语，比如'这次没做好'比'我总是做不好'更客观" | 中 |
| 从不 | "真的一次都没有吗？我们来想想有没有例外" | 中 |
| 永远 | "永远是很长的时间，我们来看看当下能做什么" | 中 |
| 必须 | "是真的必须这样，还是你给自己设定的标准？" | 高 |
| 一定 | "真的100%确定吗？有没有其他可能？" | 高 |
| 完全 | "完全是一个很绝对的词，我们来看看事实是什么" | 中 |
| 根本 | "根本否定了所有可能性，试着找到一些积极的方面" | 高 |

#### 灾难化词语

| 关键词 | 引导语 | 严重程度 |
|--------|--------|---------|
| 完了 | "那个最坏结果，真的100%会发生吗？我们来理性分析一下" | 高 |
| 死定了 | "听起来你很担心，我们一起来看看有什么解决办法" | 高 |
| 糟透了 | "事情确实有挑战性，但我们可以一步一步来解决" | 中 |
| 崩溃 | "我感受到你的压力，我们先深呼吸，然后一起想办法" | 高 |
| 完蛋 | "让我们冷静下来，看看有哪些选择" | 高 |
| 毁灭 | "这是一个很强烈的词，我们来评估一下实际情况" | 高 |

#### 自我否定词语

| 关键词 | 引导语 | 严重程度 |
|--------|--------|---------|
| 我不行 | "先别急着否定自己，我们来看看事实是什么" | 高 |
| 我太差 | "每个人都有成长的空间，重要的是我们正在努力" | 高 |
| 我没用 | "你做过很多有价值的事，我们来回忆一下" | 高 |
| 我很笨 | "聪明不是唯一的衡量标准，用心和坚持更重要" | 高 |
| 我就是不行 | "这个想法限制了你的潜力，试着换一种方式思考" | 高 |
| 我什么都做不好 | "这不是事实，你已经做得很好了，我们一起找找问题所在" | 高 |

#### 过度自责词语

| 关键词 | 引导语 | 严重程度 |
|--------|--------|---------|
| 都怪我 | "这件事的发生有很多因素，不一定全是你的责任" | 高 |
| 我有罪 | "这是一个错误，不是一种罪过，我们可以从中学习" | 高 |
| 我对不起 | "你已经尽力了，有时候事情的结果不是我们能控制的" | 中 |
| 都是我的错 | "让我们客观分析，哪些是你的责任，哪些不是" | 高 |

### 5.2 NVC非暴力沟通模板

```
模板：当____（客观事实），我感到____（我的感受），
      因为我需要____（我的需求），你愿意____（具体请求）吗？
```

**示例：**

| 情境 | NVC表达 |
|------|---------|
| 朋友迟到 | "当你迟到30分钟（事实），我感到担心（感受），因为我需要安全感（需求），你愿意下次提前告诉我吗（请求）？" |
| 同事打断 | "当你打断我说话（事实），我感到被忽视（感受），因为我需要被尊重（需求），你愿意等我说完再发表意见吗（请求）？" |
| 伴侣忘记纪念日 | "当你忘记我们的纪念日（事实），我感到失望（感受），因为我需要被重视（需求），你愿意和我一起补过吗（请求）？" |

### 5.3 思维记录表模板

```
情境：____（发生了什么）
自动思维：____（当时我在想什么）
情绪：____（我感受到什么情绪，强度0-100）
替代思维：____（有没有更客观的想法）
结果：____（如果我用替代思维，会怎么样）
```

### 5.4 依恋风格分析维度

| 维度 | 安全型 | 焦虑型 | 回避型 | 恐惧型 |
|------|--------|--------|--------|--------|
| 亲近意愿 | 愿意亲近 | 非常渴望亲近 | 回避亲近 | 渴望但害怕 |
| 依赖程度 | 适度依赖 | 过度依赖 | 拒绝依赖 | 矛盾 |
| 信任程度 | 信任他人 | 担心被抛弃 | 不信任他人 | 既渴望又恐惧 |
| 情绪表达 | 适度表达 | 情绪波动大 | 压抑情绪 | 情绪矛盾 |

---

## 6. 学习卡片模板

### 6.1 卡片分类

| 分类 | 说明 | 关联场景 |
|------|------|---------|
| 破冰技巧 | 开场白、第一印象 | 场景1-2 |
| 共情回应 | 倾听、理解、支持 | 场景5-6 |
| 拒绝话术 | 坚定边界、委婉拒绝 | 后续场景 |
| 道歉模板 | 真诚道歉、修复关系 | 场景5 |
| 表达技巧 | 结构化表达、STAR法则 | 场景3 |
| 情绪管理 | 情绪控制、压力管理 | 场景4 |

### 6.2 卡片数据结构

```json
{
  "id": 1,
  "user_id": 12345,
  "category": "破冰技巧",
  "title": "从环境开启话题",
  "error_analysis": "你使用了过于简短的回应，无法延续对话",
  "correct_approach": "从周围环境找话题，比如天气、场景、共同经历",
  "script_template": "你觉得这里的____怎么样？我觉得____",
  "is_collected": false,
  "scene_id": 1,
  "created_at": "2026-07-05T10:00:00Z"
}
```

### 6.3 预设学习卡片（示例10张）

```json
[
  {
    "id": 1,
    "category": "破冰技巧",
    "title": "开放式问题",
    "error_analysis": "你使用了封闭式问题（是/否），限制了对话展开",
    "correct_approach": "使用开放式问题，让对方有更多表达空间",
    "script_template": "你平时喜欢做什么？/ 你对____有什么看法？"
  },
  {
    "id": 2,
    "category": "共情回应",
    "title": "反映式倾听",
    "error_analysis": "你急于给出建议，而不是先理解对方的感受",
    "correct_approach": "先复述对方的感受，让对方感到被理解",
    "script_template": "听起来你感到____，对吗？"
  },
  {
    "id": 3,
    "category": "表达技巧",
    "title": "STAR法则",
    "error_analysis": "你描述经历时逻辑混乱，缺乏结构",
    "correct_approach": "使用STAR法则：情境-任务-行动-结果",
    "script_template": "当时____（情境），我的任务是____（任务），我做了____（行动），结果是____（结果）"
  },
  {
    "id": 4,
    "category": "道歉模板",
    "title": "真诚道歉三要素",
    "error_analysis": "你的道歉缺乏具体内容，显得不够真诚",
    "correct_approach": "道歉需要包含：我错了+为什么错+以后怎么做",
    "script_template": "对不起，我____（做错了什么），因为____（原因），以后我会____（改进措施）"
  },
  {
    "id": 5,
    "category": "拒绝话术",
    "title": "坚定而委婉的拒绝",
    "error_analysis": "你要么直接拒绝显得生硬，要么勉强答应",
    "correct_approach": "先表达理解，再坚定拒绝，最后提供替代方案",
    "script_template": "谢谢你想到我（理解），但我现在无法____（拒绝），你可以试试____（替代）"
  },
  {
    "id": 6,
    "category": "情绪管理",
    "title": "CBT认知重构",
    "error_analysis": "你使用了绝对化思维，导致情绪低落",
    "correct_approach": "用具体描述代替绝对化词语，进行认知重构",
    "script_template": "把'我总是做不好'改成'这次没做好，下次可以改进'"
  },
  {
    "id": 7,
    "category": "共情回应",
    "title": "非暴力沟通四步法",
    "error_analysis": "你在沟通中忽视了对方的感受",
    "correct_approach": "使用NVC四步法：观察-感受-需要-请求",
    "script_template": "当____（观察），我感到____（感受），因为我需要____（需要），你愿意____（请求）吗？"
  },
  {
    "id": 8,
    "category": "破冰技巧",
    "title": "自我暴露原则",
    "error_analysis": "你暴露了过多或过少的个人信息",
    "correct_approach": "遵循互惠原则，分享与对方同等深度的信息",
    "script_template": "我也有类似的经历，____（分享适度的个人信息）"
  },
  {
    "id": 9,
    "category": "表达技巧",
    "title": "结构化表达",
    "error_analysis": "你的表达缺乏逻辑结构，让人难以理解",
    "correct_approach": "使用'总-分-总'结构，先讲结论，再展开细节",
    "script_template": "我的观点是____（总），因为____（分1），而且____（分2），所以____（总）"
  },
  {
    "id": 10,
    "category": "情绪管理",
    "title": "深呼吸放松法",
    "error_analysis": "你在压力下情绪失控",
    "correct_approach": "使用4-7-8呼吸法：吸气4秒，屏息7秒，呼气8秒",
    "script_template": "先深呼吸，然后我们一起来分析问题"
  }
]
```

---

## 7. 礼物道具数据

### 7.1 道具等级

| 等级 | 名称 | 获取方式 | 好感度加成 | 会员限制 |
|------|------|---------|-----------|----------|
| 1 | 基础 | 每日登录、积分兑换 | +5~8 | 无 |
| 2 | 普通 | 积分兑换 | +8~12 | 无 |
| 3 | 精致 | 积分兑换、周卡赠送 | +12~18 | 周卡+ |
| 4 | 高级 | 月卡专享 | +20~30 | 月卡+ |
| 5 | 奢华 | 年卡专享 | +30~50 | 年卡专属 |

### 7.2 道具详细列表

```json
[
  {"id": 1, "name": "鲜花", "category": "gift", "tier": 1, "price_points": 50, "affection_min": 5, "affection_max": 8, "image_url": "/images/gifts/flower.png", "compatible_personality": ["all"]},
  {"id": 2, "name": "卡片", "category": "gift", "tier": 1, "price_points": 30, "affection_min": 5, "affection_max": 8, "image_url": "/images/gifts/card.png", "compatible_personality": ["all"]},
  {"id": 3, "name": "奶茶", "category": "gift", "tier": 2, "price_points": 100, "affection_min": 8, "affection_max": 12, "image_url": "/images/gifts/milk_tea.png", "compatible_personality": ["追寻者", "疗愈者"]},
  {"id": 4, "name": "甜品", "category": "gift", "tier": 2, "price_points": 120, "affection_min": 8, "affection_max": 12, "image_url": "/images/gifts/dessert.png", "compatible_personality": ["守护者", "追寻者"]},
  {"id": 5, "name": "项链", "category": "gift", "tier": 3, "price_points": 300, "affection_min": 12, "affection_max": 18, "membership_required": 1, "image_url": "/images/gifts/necklace.png", "compatible_personality": ["追寻者"]},
  {"id": 6, "name": "手链", "category": "gift", "tier": 3, "price_points": 250, "affection_min": 12, "affection_max": 18, "membership_required": 1, "image_url": "/images/gifts/bracelet.png", "compatible_personality": ["疗愈者"]},
  {"id": 7, "name": "钻戒", "category": "gift", "tier": 4, "price_points": 800, "affection_min": 20, "affection_max": 30, "membership_required": 2, "image_url": "/images/gifts/ring.png", "compatible_personality": ["追寻者", "守护者"]},
  {"id": 8, "name": "旅行", "category": "activity", "tier": 4, "price_points": 1000, "affection_min": 20, "affection_max": 30, "membership_required": 2, "image_url": "/images/gifts/travel.png", "compatible_personality": ["流浪者"]},
  {"id": 9, "name": "专属定制", "category": "gift", "tier": 5, "price_points": 2000, "affection_min": 30, "affection_max": 50, "membership_required": 3, "image_url": "/images/gifts/custom.png", "compatible_personality": ["all"]}
]
```

### 7.3 活动道具

| 活动类型 | 名称 | 好感度加成 | 说明 |
|---------|------|-----------|------|
| dining | 约会晚餐 | +15~20 | 好感度>200解锁 |
| movie | 一起看电影 | +12~18 | 好感度>150解锁 |
| activity | 一起运动 | +10~15 | 好感度>100解锁 |

---

## 8. 会员体系配置

### 8.1 会员等级配置

```json
{
  "memberships": [
    {
      "id": 0,
      "name": "体验版",
      "price": 0,
      "duration": 0,
      "digital_human_type": "2D",
      "weekly_simulations": 15,
      "voice_call": false,
      "real_person_image": false,
      "talent_access": "basic",
      "psychological_depth": "basic",
      "daily_greetings": 3,
      "streak_bonus": false,
      "attachment_analysis": false,
      "custom_image": false
    },
    {
      "id": 1,
      "name": "基础会员（周卡）",
      "price": 9,
      "duration": 7,
      "digital_human_type": "2.5D",
      "weekly_simulations": -1,
      "voice_call": true,
      "voice_call_duration": 300,
      "voice_call_daily_limit": 3,
      "real_person_image": false,
      "talent_access": "standard",
      "psychological_depth": "standard",
      "daily_greetings": 5,
      "streak_bonus": true,
      "attachment_analysis": false,
      "custom_image": false
    },
    {
      "id": 2,
      "name": "标准会员（月卡）",
      "price": 18,
      "duration": 30,
      "digital_human_type": "3D",
      "weekly_simulations": -1,
      "voice_call": true,
      "voice_call_duration": 600,
      "voice_call_daily_limit": 5,
      "real_person_image": true,
      "talent_access": "complete",
      "psychological_depth": "advanced",
      "daily_greetings": 8,
      "streak_bonus": true,
      "attachment_analysis": true,
      "custom_image": false
    },
    {
      "id": 3,
      "name": "尊享会员（年卡）",
      "price": 168,
      "duration": 365,
      "digital_human_type": "3D+真人",
      "weekly_simulations": -1,
      "voice_call": true,
      "voice_call_duration": 1800,
      "voice_call_daily_limit": -1,
      "real_person_image": true,
      "talent_access": "complete+",
      "psychological_depth": "full",
      "daily_greetings": 10,
      "streak_bonus": true,
      "attachment_analysis": true,
      "custom_image": true,
      "priority_service": true
    }
  ]
}
```

### 8.2 会员特权对比

| 特权 | 体验版 | 基础会员 | 标准会员 | 尊享会员 |
|------|--------|---------|---------|---------|
| 数字人形态 | 2D立绘 | 2.5D Live2D | 3D数字人 | 3D+真人风格 |
| 模拟训练次数 | 15次/周 | 无限 | 无限 | 无限 |
| 语音通话 | ❌ | 3次/日×5分钟 | 5次/日×10分钟 | 无限×30分钟 |
| 真人形象生成 | ❌ | ❌ | ✅ | ✅ |
| 才艺库访问 | 基础 | 标准 | 完整 | 完整+ |
| 心理学深度 | 基础 | 标准 | 月卡级 | 年卡级 |
| 依恋风格分析 | ❌ | ❌ | ✅ | ✅ |
| 自定义形象 | ❌ | ❌ | ❌ | ✅ |
| 优先服务 | ❌ | ❌ | ❌ | ✅ |
| 连签奖励 | ❌ | ✅ | ✅ | ✅ |
| 每日主动联系 | 3次 | 5次 | 8次 | 10次 |

---

## 9. 记忆系统

### 9.1 记忆类型

| 记忆类型 | 说明 | 存储方式 | 保留时间 | 示例 |
|----------|------|---------|---------|------|
| 事实记忆 | 用户的基本信息（生日、喜好、工作等） | MySQL | 永久 | "用户生日是5月20日" |
| 情感记忆 | 用户表达的情感状态（开心、难过、焦虑等） | Milvus向量库 | 90天 | "用户今天工作压力大，感到焦虑" |
| 关系记忆 | 互动中的重要时刻（第一次对话、送礼等） | MySQL | 永久 | "2026-07-05用户第一次送花给伴侣" |
| 短期记忆 | 当前对话上下文 | Redis | 24小时 | "用户刚提到喜欢喝咖啡" |

### 9.2 记忆数据结构

```json
{
  "id": "mem_xxx",
  "user_id": 12345,
  "embedding": [0.12, -0.34, 0.56, ...],
  "content": "用户说过最讨厌冬天干燥",
  "memory_type": "factual",
  "importance": 0.8,
  "related_topics": ["季节", "天气", "干燥"],
  "created_at": "2026-07-05T10:00:00Z",
  "last_accessed_at": "2026-07-05T14:30:00Z",
  "access_count": 5
}
```

### 9.3 记忆检索策略

| 场景 | 检索方式 | 数量限制 | 相似度阈值 |
|------|---------|---------|-----------|
| 日常对话 | 语义相似性检索 | 最近5条 | 0.75 |
| 场景模拟 | 相关主题检索 | 最近3条 | 0.80 |
| 朋友圈生成 | 情感状态检索 | 最近2条 | 0.70 |
| 晚安计划 | 当日互动检索 | 最近3条 | 0.65 |
| 才艺生成 | 兴趣偏好检索 | 最近2条 | 0.80 |

### 9.4 记忆重要性计算

```
重要性 = 基础权重(0.5) + 访问频率(0.3) + 情感强度(0.2)

基础权重：
- 事实记忆：0.6
- 情感记忆：0.4
- 关系记忆：0.8

访问频率：基于过去30天的访问次数归一化(0-1)

情感强度：基于情感标签的强度值(0-1)
  - 开心/兴奋：0.8-1.0
  - 平静/中性：0.4-0.6
  - 难过/焦虑：0.6-0.9
```

### 9.5 记忆写入触发条件

| 触发场景 | 记忆类型 | 写入条件 | 示例 |
|---------|---------|---------|------|
| 用户自我介绍 | 事实记忆 | 首次对话提取基本信息 | "用户职业是产品经理" |
| 对话中提及喜好 | 事实记忆 | 关键词匹配（喜欢/讨厌/偏好） | "用户喜欢吃辣" |
| 情感表达 | 情感记忆 | 情绪关键词检测 | "用户今天心情不好" |
| 送礼互动 | 关系记忆 | 每次送礼成功后 | "用户送了一束花" |
| 场景训练完成 | 关系记忆 | 训练评分>70分 | "用户完成咖啡厅破冰场景" |
| 语音通话 | 关系记忆 | 通话时长>60秒 | "用户与伴侣通话3分钟" |

### 9.6 记忆遗忘机制

| 记忆类型 | 遗忘策略 | 触发条件 |
|----------|---------|---------|
| 情感记忆 | 自动删除 | 创建时间>90天 |
| 短期记忆 | 自动过期 | Redis TTL 24小时 |
| 事实记忆 | 手动更新 | 用户修改信息 |
| 关系记忆 | 永久保留 | 无 |

### 9.7 记忆整合到对话流程

```
用户输入 → 语义检索相关记忆 → 构建上下文 → LLM生成回应 → 分析新记忆 → 写入记忆库
                │                           │
                ▼                           ▼
         返回最近3-5条相关记忆         检测是否包含新信息
                │                           │
                ▼                           ▼
         注入LLM系统提示词            符合条件则写入Milvus/MySQL
```

### 9.8 记忆系统API

| 接口 | 方法 | 说明 |
|------|------|------|
| /api/v1/memory/search | POST | 语义检索记忆 |
| /api/v1/memory/add | POST | 添加新记忆 |
| /api/v1/memory/list | GET | 获取记忆列表 |
| /api/v1/memory/delete | DELETE | 删除记忆 |

---

## 10. 依恋风格分析

### 10.1 分析维度

| 维度 | 指标 | 安全型特征 | 焦虑型特征 | 回避型特征 | 恐惧型特征 |
|------|------|-----------|-----------|-----------|-----------|
| 亲近意愿 | 主动发起对话频率 | 适中(30-50%) | 很高(>60%) | 很低(<20%) | 矛盾(波动大) |
| 依赖程度 | 寻求安慰次数 | 适中(2-4次/周) | 频繁(>5次/周) | 几乎没有(<1次/周) | 偶尔但强烈(1-2次/月) |
| 信任程度 | 自我暴露深度 | 适度(中等隐私) | 过度(高隐私) | 很浅(表面信息) | 矛盾(时而深时而浅) |
| 情绪表达 | 情绪词汇使用频率 | 适度(1-3个/对话) | 很多(>4个/对话) | 很少(<1个/对话) | 极端(0或>5个) |
| 回应风格 | 回应长度变化 | 稳定(波动<30%) | 波动大(>50%) | 简短稳定(平均<20字) | 波动大(极短或极长) |

### 10.2 分析算法

```javascript
function analyzeAttachmentStyle(userId) {
  const interactions = getRecentInteractions(userId, 90);
  
  const metrics = {
    initiativeRate: calculateInitiativeRate(interactions),
    comfortSeekingRate: calculateComfortSeekingRate(interactions),
    selfDisclosureDepth: calculateSelfDisclosureDepth(interactions),
    emotionExpressionLevel: calculateEmotionExpressionLevel(interactions),
    responseConsistency: calculateResponseConsistency(interactions)
  };
  
  const scores = {
    secure: calculateSecureScore(metrics),
    anxious: calculateAnxiousScore(metrics),
    avoidant: calculateAvoidantScore(metrics),
    fearful: calculateFearfulScore(metrics)
  };
  
  const style = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  
  return {
    style,
    scores,
    metrics,
    suggestions: getSuggestions(style, metrics)
  };
}

function calculateSecureScore(metrics) {
  let score = 50;
  score += Math.abs(metrics.initiativeRate - 0.4) < 0.2 ? 20 : 0;
  score += Math.abs(metrics.comfortSeekingRate - 0.3) < 0.2 ? 15 : 0;
  score += metrics.selfDisclosureDepth > 0.3 && metrics.selfDisclosureDepth < 0.7 ? 10 : 0;
  score += metrics.responseConsistency > 0.7 ? 5 : 0;
  return score;
}
```

### 10.3 个性化建议

| 依恋风格 | 建议内容 | 场景推荐 | 训练重点 |
|----------|---------|---------|---------|
| 安全型 | 保持现有互动模式，尝试更深层次的对话，探索新的话题领域 | 场景5-6 | 深度沟通、冲突处理 |
| 焦虑型 | 练习独立思考，减少过度依赖，尝试给自己空间，学习独处技巧 | 场景3-4 | 情绪控制、自信表达 |
| 回避型 | 尝试主动分享感受，逐步建立信任，从小事开始练习自我暴露 | 场景1-2 | 破冰技巧、自我袒露 |
| 恐惧型 | 先从安全的话题开始，慢慢建立安全感，避免过快深入 | 场景1-2 | 信任建立、渐进式沟通 |

### 10.4 依恋风格成长路径

```
回避型 → 安全型
  ├─ 第一步：练习主动问候（连续7天）
  ├─ 第二步：分享一件小事（连续7天）
  ├─ 第三步：表达一个感受（连续7天）
  └─ 第四步：请求一次帮助（连续7天）

焦虑型 → 安全型
  ├─ 第一步：延迟回应练习（从10分钟开始）
  ├─ 第二步：独立完成一件事（连续7天）
  ├─ 第三步：拒绝一次不合理请求
  └─ 第四步：设定个人边界

恐惧型 → 安全型
  ├─ 第一步：保持规律互动（每周3次固定时间）
  ├─ 第二步：分享中性话题（工作、兴趣）
  ├─ 第三步：表达轻微感受（开心、轻松）
  └─ 第四步：尝试深度对话
```

### 10.5 依恋分析展示

```
┌────────────────────────────────┐
│ 🔍 你的依恋风格分析            │
│ 安全型 · 得分：85/100         │
├────────────────────────────────┤
│ 📊 各项指标                    │
│ 亲近意愿：★★★★☆ (75%)        │
│ 依赖程度：★★★☆☆ (58%)        │
│ 信任程度：★★★★★ (92%)        │
│ 情绪表达：★★★★☆ (78%)        │
│ 回应稳定：★★★★☆ (80%)        │
├────────────────────────────────┤
│ 💡 专家建议                    │
│ "你拥有健康的依恋模式，        │
│ 建议尝试更深层次的对话"        │
├────────────────────────────────┤
│ 🎯 推荐训练                    │
│ 被朋友误解 · 非暴力沟通        │
└────────────────────────────────┘
```

### 10.6 分析周期与触发条件

| 触发条件 | 频率 | 说明 |
|----------|------|------|
| 自动分析 | 每月1次 | 系统自动生成报告 |
| 手动触发 | 随时 | 用户在成长页点击"重新分析" |
| 重大变化 | 实时 | 连续7天互动模式显著变化时 |
| 会员升级 | 即时 | 升级到月卡时自动分析 |

---

## 11. 情绪识别关键词库

### 11.1 情绪分类

| 情绪 | 中文名称 | 极性 | 主要特征 |
|------|---------|------|---------|
| anxiety | 焦虑 | 负面 | 紧张、担心、不安 |
| sadness | 低落 | 负面 | 难过、失落、沮丧 |
| anger | 愤怒 | 负面 | 生气、烦躁、讨厌 |
| fear | 恐惧 | 负面 | 害怕、担心、不安 |
| joy | 开心 | 正面 | 高兴、快乐、幸福 |
| calm | 平静 | 中性 | 平和、还好、一般 |

### 11.2 情绪关键词详细列表

#### 焦虑情绪关键词

| 关键词 | 权重 | 引导语 |
|--------|------|--------|
| 担心 | 0.8 | "试着把担心的具体事情写下来，看看哪些是可以解决的" |
| 紧张 | 0.8 | "深呼吸，告诉自己紧张是正常的" |
| 压力大 | 0.7 | "把压力分解成小步骤，一步一步解决" |
| 焦虑 | 0.9 | "焦虑是身体的提醒，试着关注当下" |
| 害怕 | 0.75 | "面对恐惧的第一步是承认它，我们一起面对" |
| 恐惧 | 0.85 | "恐惧往往比实际情况更可怕" |
| 不安 | 0.6 | "试着找到让你感到安全的事物" |
| 烦躁 | 0.65 | "先停下来，做几次深呼吸" |
| 心慌 | 0.7 | "试着把注意力集中在呼吸上" |
| 不知所措 | 0.75 | "我们可以一起梳理，一步一步来" |
| 坐立不安 | 0.65 | "试着做一些放松的动作" |

#### 低落情绪关键词

| 关键词 | 权重 | 引导语 |
|--------|------|--------|
| 难过 | 0.8 | "允许自己难过，这是正常的情绪" |
| 失落 | 0.7 | "想想最近让你开心的小事" |
| 想哭 | 0.9 | "哭出来也是一种释放" |
| 伤心 | 0.85 | "我在这里陪你，你不是一个人" |
| 沮丧 | 0.75 | "休息一下，给自己一些时间" |
| 失望 | 0.7 | "期望和现实有差距是正常的" |
| 郁闷 | 0.65 | "试着做一件让自己开心的小事" |
| 孤独 | 0.7 | "你并不孤单，我一直在" |
| 空虚 | 0.6 | "试着做一些有意义的事" |
| 无助 | 0.75 | "我们一起想办法，你不是一个人" |

#### 愤怒情绪关键词

| 关键词 | 权重 | 引导语 |
|--------|------|--------|
| 生气 | 0.8 | "先冷静下来，我们一起解决问题" |
| 愤怒 | 0.9 | "愤怒是信号，告诉我们需要改变" |
| 烦 | 0.6 | "是什么让你感到烦躁？" |
| 讨厌 | 0.75 | "试着理解对方的视角" |
| 恨 | 0.85 | "恨会消耗自己，试着放下" |
| 恼火 | 0.7 | "深呼吸，数到10" |
| 不耐烦 | 0.65 | "试着给自己和对方一些耐心" |

#### 开心情绪关键词

| 关键词 | 权重 | 引导语 |
|--------|------|--------|
| 开心 | 0.8 | "真为你开心！继续保持！" |
| 高兴 | 0.8 | "听你这么说我也很高兴～" |
| 快乐 | 0.85 | "希望这份快乐能持续下去" |
| 兴奋 | 0.75 | "你的热情感染到我了！" |
| 幸福 | 0.9 | "你值得拥有这份幸福" |
| 满足 | 0.7 | "享受当下的满足感吧" |
| 激动 | 0.75 | "你的激动让我也很期待" |

#### 平静情绪关键词

| 关键词 | 权重 | 引导语 |
|--------|------|--------|
| 平静 | 0.7 | "很高兴你现在很平静" |
| 还好 | 0.5 | "保持平和的心态很好" |
| 还行 | 0.5 | "平平淡淡也是一种幸福" |
| 一般 | 0.4 | "普通的日子也有它的美好" |
| 无所谓 | 0.45 | "淡然的态度也很好" |

---

## 12. 行为特征分析引擎

### 12.1 行为维度定义

| 行为维度 | 分析指标 | 推断情绪 | 强度权重 |
|----------|---------|---------|---------|
| 登录时间 | 深夜登录（>23:00） | 焦虑/失眠 | 0.25 |
| 对话频率 | 短时间内高频发送（>10条/10分钟） | 焦虑/急切 | 0.15 |
| 对话长度 | 过短回应（<5字） | 低落/回避 | 0.20 |
| 训练行为 | 回避挑战性场景（连续3次跳过） | 恐惧/焦虑 | 0.20 |
| 操作路径 | 频繁返回首页（>5次/会话） | 困惑/不安 | 0.15 |

### 12.2 行为分析规则

```json
{
  "behavior_rules": {
    "login_time": {
      "threshold": 23,
      "unit": "hour",
      "emotion": "anxiety",
      "intensity_add": 0.25,
      "detail_template": "登录时间 {login_time}"
    },
    "message_frequency": {
      "threshold": 10,
      "unit": "messages_per_10min",
      "emotion": "anxiety",
      "intensity_add": 0.15,
      "detail_template": "{count}条消息"
    },
    "response_length": {
      "threshold": 5,
      "unit": "characters",
      "condition": "less_than",
      "emotion": "sadness",
      "intensity_add": 0.20,
      "detail_template": "平均{avg}字"
    },
    "scene_avoidance": {
      "threshold": 3,
      "unit": "consecutive_skips",
      "emotion": "fear",
      "intensity_add": 0.20,
      "detail_template": "回避{count}次挑战性场景"
    },
    "navigation_back": {
      "threshold": 5,
      "unit": "back_actions",
      "emotion": "anxiety",
      "intensity_add": 0.15,
      "detail_template": "返回首页{count}次"
    }
  }
}
```

### 12.3 行为分析输出格式

```json
{
  "inferred_emotion": "焦虑",
  "triggers": [
    {
      "behavior": "深夜登录",
      "detail": "登录时间 23:47"
    },
    {
      "behavior": "短回应",
      "detail": "3条消息少于5字"
    }
  ],
  "intensity": 0.65
}
```

---

## 13. 情绪状态机

### 13.1 状态定义

| 状态ID | 状态名称 | 描述 | 情绪强度范围 | 触发条件 |
|--------|---------|------|------------|---------|
| neutral | 中立态 | 平静 | 0-0.2 | 初始状态、情绪恢复后 |
| positive | 积极态 | 开心 | 0.2-0.4（正面） | 检测到正面情绪 |
| negative | 消极态 | 难过 | 0.4-0.6（负面） | 检测到负面情绪 |
| high_negative | 高消极态 | 焦虑 | 0.6-0.8（负面） | 负面情绪强度持续上升 |
| recovery | 恢复态 | 渐好 | 0.2-0.4（负面转好） | 得到安慰/情绪缓解 |
| tree_hole | 树洞态 | 共情中 | >0.8（负面） | 情绪强度>0.8触发强制树洞 |

### 13.2 状态流转规则

```
中立态 (neutral)
  ├─ 检测到正面情绪 → 积极态 (positive)
  ├─ 检测到负面情绪 → 消极态 (negative)
  └─ 无情绪变化 → 保持中立态

积极态 (positive)
  ├─ 检测到负面情绪 → 消极态 (negative)
  └─ 情绪消退 → 中立态 (neutral)

消极态 (negative)
  ├─ 得到安慰/情绪缓解 → 恢复态 (recovery)
  ├─ 负面情绪持续上升 → 高消极态 (high_negative)
  └─ 情绪恢复正常 → 中立态 (neutral)

高消极态 (high_negative)
  ├─ 得到安慰/情绪缓解 → 恢复态 (recovery)
  ├─ 情绪强度>0.8 → 树洞态 (tree_hole)
  └─ 情绪下降 → 消极态 (negative)

恢复态 (recovery)
  ├─ 情绪转好 → 积极态 (positive)
  ├─ 情绪再次恶化 → 消极态 (negative)
  └─ 情绪稳定 → 中立态 (neutral)

树洞态 (tree_hole)
  ├─ 情绪缓解 → 恢复态 (recovery)
  └─ 情绪持续 → 保持树洞态
```

### 13.3 状态流转矩阵

| 当前状态 | 正面情绪 | 负面情绪(0.2-0.4) | 负面情绪(0.4-0.6) | 负面情绪(0.6-0.8) | 负面情绪(>0.8) | 无变化 |
|---------|---------|-------------------|-------------------|-------------------|----------------|--------|
| neutral | positive | negative | negative | high_negative | tree_hole | neutral |
| positive | positive | negative | negative | high_negative | tree_hole | positive |
| negative | recovery | negative | high_negative | high_negative | tree_hole | negative |
| high_negative | recovery | negative | high_negative | high_negative | tree_hole | high_negative |
| recovery | positive | negative | negative | high_negative | tree_hole | neutral |
| tree_hole | recovery | tree_hole | tree_hole | tree_hole | tree_hole | tree_hole |

---

## 14. 融合决策引擎

### 14.1 多模态融合公式

```
最终情绪强度 = 0.5 × 文本分析 + 0.3 × 语音分析（如有） + 0.2 × 行为分析
```

### 14.2 决策规则

| 条件 | 触发模式 | 说明 |
|------|---------|------|
| 情绪强度 > 0.8 | 强制树洞模式 | 无论是否有具体问题，优先共情 |
| 情绪强度 > 0.7 AND 无具体问题 | 树洞模式 | 纯情绪支持，不提供建议 |
| 情绪强度 < 0.4 AND 有具体问题 | 建议模式 | 直接提供解决方案 |
| 情绪强度 > 0.6 AND 有具体问题 | 混合模式 | 先共情倾听，再提供建议 |
| 其他情况 | 默认模式 | 正常对话，适度情绪回应 |

### 14.3 具体问题检测规则

```javascript
const PROBLEM_PATTERNS = [
    /怎么|如何|怎么办|怎么解决/,
    /问题|困难|麻烦|困扰/,
    /不知道|不清楚|不明白/,
    /需要|想要|希望/,
    /求助|帮忙|请教/,
    /建议|意见|指导/
];

function hasSpecificProblem(text) {
    return PROBLEM_PATTERNS.some(pattern => pattern.test(text));
}
```

### 14.4 触发模式行为定义

| 模式 | 伴侣行为 | 回复风格 | 时长建议 |
|------|---------|---------|---------|
| 树洞模式 | 共情倾听、不打断、温暖回应 | 开放式问题、反映式倾听 | 5-10分钟 |
| 建议模式 | 结构化分析、提供方案、引导行动 | 清晰的建议、可执行的步骤 | 3-5分钟 |
| 混合模式 | 先共情确认感受，再提供建议 | 先倾听再指导 | 8-12分钟 |
| 强制树洞模式 | 深度共情、情感支持、陪伴 | 完全倾听，不主动提供建议 | 10-15分钟 |

---

## 15. 成本优化方案

### 15.1 用户等级分析策略

| 用户等级 | 文本分析 | 语音分析 | 行为分析 | 融合决策 | 成本估算 |
|----------|---------|---------|---------|---------|---------|
| 体验版（免费） | 关键词匹配（轻量级） | ❌ | ✅ 基础（登录时间+对话长度） | ✅ 简化版 | 低 |
| 基础会员（周卡） | 关键词+BERT | ❌ | ✅ 完整 | ✅ | 中 |
| 标准会员（月卡） | 关键词+BERT | ✅（仅通话中） | ✅ 完整 | ✅ | 中高 |
| 尊享会员（年卡） | 关键词+BERT | ✅（仅通话中） | ✅ 完整 | ✅ | 高 |

### 15.2 语音分析触发条件

| 会话类型 | 是否启用语音分析 | 说明 |
|---------|----------------|------|
| 文字对话 | ❌ | 不使用语音分析 |
| 语音通话 | ✅（月卡+） | 实时语音情绪分析 |
| 场景模拟 | ❌ | 不使用语音分析 |

### 15.3 情绪识别准确率目标

| 用户等级 | 文本情绪准确率 | 综合情绪准确率 |
|----------|--------------|--------------|
| 体验版 | ≥60%（关键词） | ≥55% |
| 基础会员 | ≥75%（BERT） | ≥70% |
| 标准会员 | ≥75%（BERT） | ≥80%（含语音） |
| 尊享会员 | ≥80%（BERT） | ≥85%（含语音） |

---

> **文档结束**  
> 版本：v2.2 | 编制日期：2026-07-06
# 前端Tab页面设计

> 版本：v2.2  
> 适用对象：前端开发团队  
> 技术栈：Flutter 3.x + Dart

---

## 1. Tab1：首页

### 1.1 页面布局

```
┌────────────────────────────────┐
│ 👋 你好，[昵称]                 │ 欢迎语
│ 今天心情怎么样？               │
├────────────────────────────────┤
│ 📊 社交能力雷达图              │ 能力展示
│ ┌─────────────────────────┐   │
│ │ 自信度 ○ ●○○○○○○○○○ │   │
│ │ 表达力 ○○○●○○○○○○ │   │
│ │ 共情力 ○○●○○○○○○○ │   │
│ │ 应变力 ○○○○●○○○○○ │   │
│ └─────────────────────────┘   │
├────────────────────────────────┤
│ 🎯 今日训练建议                │
│ "建议练习：咖啡厅破冰"        │
│ [开始训练]                    │
├────────────────────────────────┤
│ 🔥 热门场景                   │
│ ├─ 咖啡厅破冰 (1.2w人练习)   │
│ ├─ 模拟面试 (8.5k人练习)    │
│ └─ 兴趣社群自我介绍 (6.3k)  │
├────────────────────────────────┤
│ 💬 最近对话                   │
│ ├─ [数字人头像] [昵称]       │
│ │   "昨天聊得很开心~"        │
│ │   1小时前                  │
│ └─ [数字人头像] [昵称]       │
│     "明天见哦"              │
│     昨天                    │
└────────────────────────────────┘
```

### 1.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| HomePage | pages/home/home_page.dart | 首页主页面 |
| WelcomeHeader | pages/home/components/welcome_header.dart | 欢迎语头部 |
| AbilityRadar | pages/home/components/ability_radar.dart | 能力雷达图 |
| DailySuggestion | pages/home/components/daily_suggestion.dart | 今日建议 |
| HotScenes | pages/home/components/hot_scenes.dart | 热门场景 |
| RecentChats | pages/home/components/recent_chats.dart | 最近对话 |

---

## 2. Tab2：伴侣页

### 2.1 页面布局

```
┌────────────────────────────────┐
│ [数字人形象]                   │ 全屏展示
│                                │
│ "今天想聊点什么呢？"          │
├────────────────────────────────┤
│ 💝 好感度：85/100             │ 好感度进度
│ █████████████░░░░░░░          │
│ 下一等级：亲密伙伴            │
├────────────────────────────────┤
│ 🎁 送礼物                     │
│ ├─ 🌸 鲜花 (10积分)          │
│ ├─ 📚 书籍 (20积分)          │
│ └─ 💎 宝石 (50积分)          │
├────────────────────────────────┤
│ 📱 互动功能                   │
│ ├─ 💬 文字对话               │
│ ├─ 📞 语音通话               │
│ ├─ 🎬 时空穿梭               │
│ └─ 📸 朋友圈                 │
└────────────────────────────────┘
```

### 2.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| PartnerPage | pages/partner/partner_page.dart | 伴侣页主页面 |
| DigitalHumanWidget | widgets/digital_human.dart | 数字人展示 |
| AffectionBar | widgets/emotion_bar.dart | 好感度进度条 |
| GiftPanel | pages/partner/components/gift_panel.dart | 礼物面板 |
| InteractionButtons | pages/partner/components/interaction_buttons.dart | 互动按钮 |

---

## 3. Tab3：模拟页

### 3.1 页面布局

```
┌────────────────────────────────┐
│ 🎮 社交模拟训练               │ 标题
├────────────────────────────────┤
│ 📋 场景列表                   │
│ ├─ ⭐ 咖啡厅破冰             │
│ │   难度：⭐                 │
│ │   时长：8min               │
│ │   已练习：3次              │
│ │   [开始训练]               │
│ ├─ ⭐⭐ 兴趣社群自我介绍     │
│ │   难度：⭐⭐               │
│ │   时长：10min              │
│ │   已练习：2次              │
│ │   [开始训练]               │
│ └─ ⭐⭐⭐ 模拟面试            │
│     难度：⭐⭐⭐              │
│     时长：15min              │
│     已练习：1次              │
│     [开始训练]               │
├────────────────────────────────┤
│ 📊 训练统计                   │
│ 本周练习：5次                │
│ 累计练习：23次               │
│ 平均评分：82分               │
└────────────────────────────────┘
```

### 3.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| SimulationPage | pages/simulation/simulation_page.dart | 模拟页主页面 |
| SceneList | pages/simulation/components/scene_list.dart | 场景列表 |
| SceneCard | widgets/scene_card.dart | 场景卡片 |
| TrainingStats | pages/simulation/components/training_stats.dart | 训练统计 |

---

## 4. Tab4：成长页

### 4.1 页面布局

```
┌────────────────────────────────┐
│ 📈 我的成长                   │ 标题
├────────────────────────────────┤
│ 📚 学习卡片                   │
│ ├─ 🃏 非暴力沟通技巧         │
│ │   已掌握：75%              │
│ ├─ 🃏 自信心提升             │
│ │   已掌握：60%              │
│ └─ 🃏 情绪管理入门           │
│     已掌握：45%              │
├────────────────────────────────┤
│ 📔 情绪日记                   │
│ "记录今天的心情..."          │
│ [写日记]                     │
├────────────────────────────────┤
│ 📊 每周报告                   │
│ "本周社交能力 +12分"         │
│ [查看报告]                   │
├────────────────────────────────┤
│ 🏆 成就徽章                   │
│ ├─ 🎯 初次练习              │
│ ├─ 📚 学习达人              │
│ └─ 💕 亲密伙伴              │
└────────────────────────────────┘
```

### 4.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| GrowthPage | pages/growth/growth_page.dart | 成长页主页面 |
| LearningCards | pages/growth/components/learning_cards.dart | 学习卡片 |
| EmotionDiaryEntry | pages/growth/components/emotion_diary_entry.dart | 情绪日记入口 |
| WeeklyReportEntry | pages/growth/components/weekly_report_entry.dart | 每周报告入口 |
| AchievementBadges | pages/growth/components/achievement_badges.dart | 成就徽章 |

---

## 5. Tab5：我的页

### 5.1 页面布局

```
┌────────────────────────────────┐
│ [用户头像] [昵称]             │ 用户信息
│ 会员等级：尊享会员            │
│ 积分：2,580                  │
├────────────────────────────────┤
│ 📅 签到                       │ 签到日历
│ 连续签到：7天                │
│ [今日签到]                   │
├────────────────────────────────┤
│ ⚙️ 设置菜单                   │
│ ├─ 账号安全                 │
│ ├─ 隐私设置                 │
│ ├─ 消息通知                 │
│ ├─ 会员中心                 │
│ └─ 关于我们                 │
├────────────────────────────────┤
│ 📱 联动入口                   │
│ 变美联动：悦己颜值社         │
│ [一键跳转]                   │
├────────────────────────────────┤
│ ⚠️ 防沉迷设置               │
└────────────────────────────────┘
```

### 5.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| ProfilePage | pages/profile/profile_page.dart | 我的页主页面 |
| UserProfile | pages/profile/components/user_profile.dart | 用户信息头部 |
| MenuList | pages/profile/components/menu_list.dart | 菜单列表 |
| MembershipCard | pages/profile/components/membership_card.dart | 会员卡片 |
| CheckInCalendar | pages/profile/components/check_in_calendar.dart | 签到日历 |
| PrivacySection | pages/profile/components/privacy_section.dart | 隐私与数据 |
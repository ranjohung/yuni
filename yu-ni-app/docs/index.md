# "与你" AI伴侣应用 - 开发文档索引

> 版本：v1.0  
> 更新日期：2024年1月  
> 适用对象：所有团队成员

---

## 📋 文档结构总览

```
docs/
├── index.md                    # 本文档 - 索引
├── product/                    # 产品文档
│   ├── 01_product_overview.md  # 产品概述
│   └── 02_membership_system.md # 会员体系设计
├── frontend/                   # 前端开发文档
│   ├── 01_tech_architecture.md # 技术架构
│   ├── 02_api_client.md        # API客户端
│   ├── 03_ui_design.md         # UI设计规范
│   ├── 04_pages_tab.md         # Tab页面设计
│   ├── 05_pages_special.md     # 特殊页面设计
│   └── 06_pages_psychology.md  # 心理学模块页面
├── backend/                    # 后端开发文档
│   ├── 01_tech_architecture.md # 技术架构
│   ├── 02_database_design.md   # 数据库设计
│   ├── 03_core_engines.md      # 核心引擎
│   ├── 04_api_design.md        # API接口设计
│   └── 05_compliance_security.md # 合规与安全
└── content/                    # 内容模块文档
    ├── 01_personality_system.md # 伴侣人格设定系统
    └── 02_simulation_scenarios.md # 模拟训练场景设计
```

---

## 🎯 产品文档

| 文件 | 版本 | 适用对象 | 核心内容 |
|------|------|---------|---------|
| [01_product_overview.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/product/01_product_overview.md) | v1.0 | 产品、运营、开发 | 产品定位、架构、路线图、指标 |
| [02_membership_system.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/product/02_membership_system.md) | v1.0 | 产品、运营 | 会员等级、定价、权益、运营策略 |

---

## 📱 前端开发文档

| 文件 | 版本 | 适用对象 | 核心内容 |
|------|------|---------|---------|
| [01_tech_architecture.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/frontend/01_tech_architecture.md) | v2.2 | 前端开发 | 技术栈、项目结构、路由、状态管理 |
| [02_api_client.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/frontend/02_api_client.md) | v2.2 | 前端开发 | API配置、WebSocket、接口封装 |
| [03_ui_design.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/frontend/03_ui_design.md) | v2.2 | 前端开发、设计 | 颜色系统、排版、间距、组件规范 |
| [04_pages_tab.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/frontend/04_pages_tab.md) | v2.2 | 前端开发 | 首页、伴侣、模拟、成长、个人中心 |
| [05_pages_special.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/frontend/05_pages_special.md) | v2.2 | 前端开发 | 冷启动、自定义角色、数字人、语音通话、时空穿梭 |
| [06_pages_psychology.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/frontend/06_pages_psychology.md) | v2.2 | 前端开发 | CBT、NVC、情绪识别、情绪日记、每周报告 |

---

## 🔧 后端开发文档

| 文件 | 版本 | 适用对象 | 核心内容 |
|------|------|---------|---------|
| [01_tech_architecture.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/backend/01_tech_architecture.md) | v3.2 | 后端开发 | 技术架构、项目结构、中间件、环境配置 |
| [02_database_design.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/backend/02_database_design.md) | v3.2 | 后端开发 | 19张核心表、Redis缓存、Milvus向量数据库 |
| [03_core_engines.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/backend/03_core_engines.md) | v3.2 | 后端开发 | LLM路由、数字人、模拟、好感度、记忆、情绪识别、决策引擎 |
| [04_api_design.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/backend/04_api_design.md) | v3.2 | 前后端开发 | 12个模块的API接口定义 |
| [05_compliance_security.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/backend/05_compliance_security.md) | v3.2 | 后端开发、运维 | 数据安全、未成年人保护、隐私保护、内容安全、API安全 |

---

## 📝 内容模块文档

| 文件 | 版本 | 适用对象 | 核心内容 |
|------|------|---------|---------|
| [01_personality_system.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/content/01_personality_system.md) | v1.0 | 内容、产品 | 人格类型、自定义角色、情绪表达、对话风格 |
| [02_simulation_scenarios.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/content/02_simulation_scenarios.md) | v1.0 | 内容、产品 | 场景设计规范、4个阶段20个场景、评估标准、学习卡片 |

---

## 🚀 开发计划

| 文件 | 版本 | 适用对象 | 核心内容 |
|------|------|---------|---------|
| [dev_plan.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/dev_plan.md) | v1.0 | 所有团队 | Flutter + Express 原开发计划 |
| [dev_plan_nextjs.md](file:///f:/openclaw文件/与你/yu-ni-app/docs/dev_plan_nextjs.md) | v1.0 | 所有团队 | Next.js 全栈开发计划（推荐） |

---

## 📚 快速导航

### 按角色查找

| 角色 | 推荐文档 |
|------|---------|
| **产品经理** | product/\* |
| **前端开发** | frontend/\* |
| **后端开发** | backend/\* |
| **内容运营** | content/\* |
| **运维工程师** | backend/05_compliance_security.md |
| **设计师** | frontend/03_ui_design.md |

### 按主题查找

| 主题 | 相关文档 |
|------|---------|
| **技术架构** | frontend/01、backend/01 |
| **数据库** | backend/02 |
| **API接口** | frontend/02、backend/04 |
| **UI设计** | frontend/03-06 |
| **核心引擎** | backend/03 |
| **合规安全** | backend/05 |
| **会员体系** | product/02 |
| **场景设计** | content/02 |
| **人格设定** | content/01 |

---

## 📈 版本变更记录

| 版本 | 日期 | 变更内容 |
|------|------|---------|
| v1.0 | 2024-01 | 初始版本，拆分完成所有文档 |

---

## 📌 注意事项

1. 所有文档均为在线协作版本，请在修改前确认最新版本
2. 文档中的代码示例仅供参考，实际实现请以项目代码为准
3. 如发现文档与代码不一致，请优先以代码为准，并通知文档维护者更新
4. 文档更新后请同步更新版本号和变更记录
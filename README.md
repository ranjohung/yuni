# 「与你」App - AI数字人社交模拟训练平台

## 快速启动

### 后端

```bash
cd backend
cp .env.example .env
# 编辑 .env 填入配置
npm install
npm start
```

### API 文档

| 模块 | 基础路径 | 说明 |
|------|---------|------|
| 用户 | `/api/v1/user` | 注册/登录/实名/数据管理 |
| 伴侣 | `/api/v1/partner` | 创建/管理/预设角色 |
| 对话 | `/api/v1/chat` | 文字/流式对话 |
| 场景 | `/api/v1/scenarios` | 6个社交模拟场景 |
| 训练 | `/api/v1/training` | 训练记录/评分/时空穿梭 |
| 成长 | `/api/v1/growth` | 雷达图/趋势/里程碑/依恋分析 |
| 才艺 | `/api/v1/talent` | 才艺库/LLM生成 |
| 会员 | `/api/v1/membership` | 购买/续费/状态 |
| 合规 | `/api/v1/compliance` | 年龄分层/防沉迷/数据管理 |

### 部署

- 数据库：MySQL 8.0
- 缓存：Redis 7.0
- LLM：DeepSeek API（主力）+ Ollama Qwen2.5:14B（兜底）

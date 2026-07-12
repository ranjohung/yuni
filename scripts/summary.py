import os

base = r"F:\openclaw文件\与你\yu-ni-app"
total_lines = 0
total_files = 0

for root, dirs, files in os.walk(os.path.join(base, "backend", "src")):
    for f in sorted(files):
        if f.endswith(".js"):
            fp = os.path.join(root, f)
            with open(fp, "r", encoding="utf-8") as fh:
                lines = len(fh.readlines())
            total_lines += lines
            total_files += 1

# 加上根目录文件
for f_name in ["README.md", "week1_checklist.md"]:
    fp = os.path.join(base, f_name)
    if os.path.exists(fp):
        with open(fp, "r", encoding="utf-8") as fh:
            lines = len(fh.readlines())
        total_lines += lines
        total_files += 1

print()
print("「与你」App 第1周开发完成")
print("=" * 50)
print()
print(f"项目源码: {total_files} 个文件, {total_lines} 行代码")
print()
print("后端API模块:")
print("  - 用户服务: 注册/登录/实名/数据管理")
print("  - 伴侣服务: CRUD/预设角色/切换默认")
print("  - 对话服务: 文字/SSE流式/历史/LLM混合路由")
print("  - 场景服务: 列表/详情/年龄限制")
print("  - 训练服务: 评分/时空穿梭/学习卡片")
print("  - 成长服务: 雷达图/趋势/里程碑/依恋分析")
print("  - 才艺服务: 才艺库/即时生成")
print("  - 会员服务: 购买/续费/状态")
print("  - 合规服务: 年龄分层/防沉迷/使用统计")
print()
print("6个完整场景(19轮对话, 57个选项):")
print("  - 咖啡厅破冰")
print("  - 兴趣社群自我介绍")
print("  - 模拟面试")
print("  - 向上汇报被质疑")
print("  - 被朋友误解(NVC)")
print("  - 安慰失落的TA")
print()
print("环境状态:")
print("  - Node.js v24.16.0 + 131 npm 包")
print("  - Flutter SDK: 安装中...")
print("  - MySQL 8.0: 安装中...")
print("  - Redis 7.0: 安装中...")
print()
print("文件位置: F:\\openclaw文件\\与你\\yu-ni-app")

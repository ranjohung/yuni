# 前端UI设计规范

> 版本：v2.2  
> 适用对象：前端开发团队、UI设计师  
> 技术栈：Flutter 3.x + Dart

---

## 1. 颜色系统

| 颜色名称 | 颜色值 | 用途 |
|----------|--------|------|
| Primary | #6366f1 | 主色调、按钮、重要元素 |
| PrimaryContainer | #e0e7ff | 主色背景、卡片高亮 |
| Secondary | #f472b6 | 次色调、强调元素 |
| Background | #ffffff | 页面背景 |
| Surface | #f8fafc | 卡片背景 |
| SurfaceVariant | #f1f5f9 | 次要卡片背景 |
| Error | #ef4444 | 错误提示、低质量回应 |
| Success | #22c55e | 成功提示、高质量回应 |
| Warning | #f59e0b | 警告提示、中等质量 |
| TextPrimary | #1e293b | 主要文字 |
| TextSecondary | #64748b | 次要文字 |

---

## 2. 字体规范

| 字号 | 字重 | 用途 |
|------|------|------|
| 24px | Bold | 页面标题 |
| 20px | Semibold | 副标题、卡片标题 |
| 16px | Regular | 正文、按钮文字 |
| 14px | Regular | 辅助文字、标签 |
| 12px | Medium | 提示文字、时间戳 |

---

## 3. 间距规范

| 间距 | 大小 | 用途 |
|------|------|------|
| xs | 4px | 元素内间距 |
| sm | 8px | 小间距 |
| md | 16px | 中等间距、卡片内边距 |
| lg | 24px | 大间距、页面边距 |
| xl | 32px | 超大间距 |

---

## 4. 圆角规范

| 圆角 | 大小 | 用途 |
|------|------|------|
| sm | 8px | 小按钮、标签 |
| md | 12px | 卡片、输入框 |
| lg | 16px | 大卡片、模态框 |
| xl | 24px | 特殊卡片 |

---

## 5. 阴影规范

| 阴影 | 效果 | 用途 |
|------|------|------|
| sm | 0 2px 4px rgba(0,0,0,0.05) | 轻微悬浮 |
| md | 0 4px 12px rgba(0,0,0,0.08) | 卡片悬浮 |
| lg | 0 8px 24px rgba(0,0,0,0.12) | 弹窗、模态框 |

---

## 6. 按钮规范

### 6.1 主按钮

```dart
ElevatedButton(
  onPressed: () {},
  style: ElevatedButton.styleFrom(
    backgroundColor: const Color(0xFF6366f1),
    foregroundColor: Colors.white,
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
    borderRadius: BorderRadius.circular(12),
    elevation: 0,
  ),
  child: const Text('确认'),
)
```

### 6.2 次要按钮

```dart
OutlinedButton(
  onPressed: () {},
  style: OutlinedButton.styleFrom(
    side: const BorderSide(color: Color(0xFF6366f1)),
    foregroundColor: const Color(0xFF6366f1),
    padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
    borderRadius: BorderRadius.circular(12),
  ),
  child: const Text('取消'),
)
```

### 6.3 文本按钮

```dart
TextButton(
  onPressed: () {},
  style: TextButton.styleFrom(
    foregroundColor: const Color(0xFF64748b),
    padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
  ),
  child: const Text('更多'),
)
```

---

## 7. 输入框规范

```dart
TextField(
  decoration: InputDecoration(
    hintText: '请输入内容',
    hintStyle: const TextStyle(color: Color(0xFF94a3b8)),
    border: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFFe2e8f0)),
    ),
    focusedBorder: OutlineInputBorder(
      borderRadius: BorderRadius.circular(12),
      borderSide: const BorderSide(color: Color(0xFF6366f1)),
    ),
    contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
  ),
)
```

---

## 8. 卡片规范

```dart
Card(
  elevation: 0,
  shape: RoundedRectangleBorder(
    borderRadius: BorderRadius.circular(16),
  ),
  color: const Color(0xFFf8fafc),
  child: const Padding(
    padding: EdgeInsets.all(16),
    child: Text('卡片内容'),
  ),
)
```

---

## 9. 图标规范

| 图标 | 用途 |
|------|------|
| home | 首页 |
| heart | 伴侣页 |
| play_circle | 模拟页 |
| bar_chart | 成长页 |
| person | 我的页 |

---

## 10. 动效规范

### 10.1 页面切换

```dart
PageRouteBuilder(
  pageBuilder: (context, animation, secondaryAnimation) => const TargetPage(),
  transitionsBuilder: (context, animation, secondaryAnimation, child) {
    const begin = Offset(1.0, 0.0);
    const end = Offset.zero;
    const curve = Curves.ease;
    var tween = Tween(begin: begin, end: end).chain(CurveTween(curve: curve));
    return SlideTransition(
      position: animation.drive(tween),
      child: child,
    );
  },
)
```

### 10.2 列表进入

```dart
AnimatedList(
  initialItemCount: items.length,
  itemBuilder: (context, index, animation) {
    return SlideTransition(
      position: animation.drive(
        Tween<Offset>(
          begin: const Offset(0, 20),
          end: Offset.zero,
        ).chain(CurveTween(curve: Curves.easeOut)),
      ),
      child: FadeTransition(
        opacity: animation.drive(
          Tween<double>(begin: 0, end: 1).chain(CurveTween(curve: Curves.easeOut)),
        ),
        child: ItemCard(item: items[index]),
      ),
    );
  },
)
```

---

## 11. 响应式适配

```dart
class ResponsiveUtils {
  static double screenWidth(BuildContext context) => MediaQuery.of(context).size.width;
  
  static double screenHeight(BuildContext context) => MediaQuery.of(context).size.height;
  
  static double adaptiveSize(BuildContext context, double baseSize) {
    return baseSize * (screenWidth(context) / 375);
  }
  
  static bool isLargeScreen(BuildContext context) => screenWidth(context) > 600;
}
```
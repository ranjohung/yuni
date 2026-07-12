# 前端技术架构

> 版本：v2.2  
> 适用对象：前端开发团队  
> 技术栈：Flutter 3.x + Dart

---

## 1. 技术选型

| 层级 | 技术选型 | 说明 |
|------|---------|------|
| 框架 | Flutter 3.x | 跨端开发，iOS/Android一套代码 |
| 状态管理 | Provider | 轻量状态管理 |
| 路由 | go_router | 声明式路由 |
| 图表 | fl_chart | 雷达图/折线图 |
| HTTP | http | 网络请求 |
| WebSocket | web_socket_channel | 实时对话 |
| 数据库 | hive | 本地缓存 |
| 音频 | audioplayers | TTS语音播放 |
| 实时音视频 | 声网Agora RTC SDK | 语音通话 |

## 2. 架构模式

```
┌─────────────────────────────────────────┐
│              UI层 (Widgets)             │
│  Pages / Components / Dialogs / Screens │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│            状态管理层 (Provider)        │
│  AuthProvider / UserProvider            │
│  PartnerProvider / SceneProvider        │
│  GrowthProvider / CheckInProvider       │
└────────────────────┬────────────────────┘
                     │
┌────────────────────▼────────────────────┐
│            API客户端层                  │
│  ApiClient / WebSocketManager / AudioService │
└────────────────────┬────────────────────┘
                     │ HTTP/WSS/RTC
┌────────────────────▼────────────────────┐
│            后端服务                      │
└─────────────────────────────────────────┘
```

---

## 3. 项目结构

```
lib/
├── main.dart                    # 入口文件
├── routes/                      # 路由配置
│   └── app_router.dart
├── providers/                   # 状态管理
│   ├── auth_provider.dart       # 认证状态
│   ├── user_provider.dart       # 用户信息
│   ├── partner_provider.dart    # 伴侣状态
│   ├── scene_provider.dart      # 场景管理
│   ├── growth_provider.dart     # 成长数据
│   ├── checkin_provider.dart    # 签到状态
│   └── timetravel_provider.dart # 时空穿梭
├── services/                    # 服务层
│   ├── api_client.dart          # HTTP请求
│   ├── websocket_manager.dart   # WebSocket连接
│   ├── audio_service.dart       # 音频播放
│   └── rtc_service.dart         # RTC语音通话
├── pages/                       # 页面
│   ├── onboarding/              # 冷启动
│   ├── home/                    # Tab1首页
│   ├── partner/                 # Tab2伴侣
│   ├── simulation/              # Tab3模拟
│   ├── growth/                  # Tab4成长
│   ├── profile/                 # Tab5我的
│   ├── chat/                    # 对话页
│   ├── voice_call/              # 语音通话
│   ├── timetravel/              # 时空穿梭
│   └── auth/                    # 认证页
├── widgets/                     # 通用组件
│   ├── digital_human.dart       # 数字人展示
│   ├── emotion_bar.dart         # 好感度进度条
│   ├── progress_card.dart       # 进度卡片
│   ├── learning_card.dart       # 学习卡片
│   ├── scene_card.dart          # 场景卡片
│   └── moment_card.dart         # 朋友圈卡片
├── models/                      # 数据模型
│   ├── user.dart
│   ├── partner.dart
│   ├── scene.dart
│   ├── growth.dart
│   ├── chat.dart
│   └── timetravel.dart
├── utils/                       # 工具类
│   ├── date_utils.dart
│   ├── emotion_utils.dart
│   └── constants.dart
└── assets/                      # 静态资源
    ├── images/
    ├── animations/
    └── fonts/
```

---

## 4. 路由设计

```dart
final routes = [
  GoRoute(
    path: '/',
    name: 'splash',
    builder: (context, state) => const SplashPage(),
  ),
  GoRoute(
    path: '/quick-experience',
    name: 'quick_experience',
    builder: (context, state) => const QuickExperiencePage(),
  ),
  GoRoute(
    path: '/login',
    name: 'login',
    builder: (context, state) => const LoginPage(),
  ),
  GoRoute(
    path: '/create-partner',
    name: 'create_partner',
    builder: (context, state) => const CreatePartnerPage(),
  ),
  ShellRoute(
    builder: (context, state, child) => MainScaffold(child: child),
    routes: [
      GoRoute(
        path: '/home',
        name: 'home',
        builder: (context, state) => const HomePage(),
      ),
      GoRoute(
        path: '/partner',
        name: 'partner',
        builder: (context, state) => const PartnerPage(),
      ),
      GoRoute(
        path: '/simulation',
        name: 'simulation',
        builder: (context, state) => const SimulationPage(),
      ),
      GoRoute(
        path: '/growth',
        name: 'growth',
        builder: (context, state) => const GrowthPage(),
      ),
      GoRoute(
        path: '/profile',
        name: 'profile',
        builder: (context, state) => const ProfilePage(),
      ),
    ],
  ),
];
```

---

## 5. 状态管理

### 5.1 Provider列表

| Provider | 文件路径 | 职责 |
|----------|---------|------|
| AuthProvider | providers/auth_provider.dart | 登录状态、Token管理 |
| UserProvider | providers/user_provider.dart | 用户信息、会员状态 |
| PartnerProvider | providers/partner_provider.dart | 伴侣配置、好感度 |
| SceneProvider | providers/scene_provider.dart | 场景列表、训练状态 |
| GrowthProvider | providers/growth_provider.dart | 成长数据、学习卡片 |
| CheckInProvider | providers/checkin_provider.dart | 签到状态、连续签到 |
| TimeTravelProvider | providers/timetravel_provider.dart | 穿梭券、历史记录 |

### 5.2 Provider使用模式

```dart
class AuthProvider extends ChangeNotifier {
  String? _token;
  
  String? get token => _token;
  
  void login(String token) {
    _token = token;
    notifyListeners();
  }
  
  void logout() {
    _token = null;
    notifyListeners();
  }
  
  bool get isLoggedIn => _token != null;
}
```
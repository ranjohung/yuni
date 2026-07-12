# 前端开发文档

> 版本：v2.2  
> 适用对象：前端开发团队  
> 技术栈：Flutter 3.x + Dart

---

## 目录

1. [技术架构](#1-技术架构)
2. [项目结构](#2-项目结构)
3. [路由设计](#3-路由设计)
4. [状态管理](#4-状态管理)
5. [API客户端](#5-api客户端)
6. [UI设计规范](#6-ui设计规范)
7. [冷启动与快速体验](#7-冷启动与快速体验)
8. [用户自定义角色系统](#8-用户自定义角色系统)
9. [Tab1：首页](#9-tab1首页)
10. [Tab2：伴侣页](#10-tab2伴侣页)
11. [Tab3：模拟页](#11-tab3模拟页)
12. [Tab4：成长页](#12-tab4成长页)
13. [Tab5：我的页](#13-tab5我的页)
14. [数字人渲染](#14-数字人渲染)
15. [语音通话](#15-语音通话)
16. [时空穿梭](#16-时空穿梭)
17. [变美联动](#17-变美联动)
18. [合规功能](#18-合规功能)
19. [情绪识别模块](#19-情绪识别模块)
20. [数据模型](#20-数据模型)
21. [CBT思维记录表页面](#21-cbt思维记录表页面)
22. [NVC可视化引导页面](#22-nvc可视化引导页面)
23. [情绪识别服务组件](#23-情绪识别服务组件)
24. [情绪历史页面](#24-情绪历史页面)
25. [晚安计划](#25-晚安计划)
26. [情绪日记](#26-情绪日记)
27. [每周社交报告](#27-每周社交报告)
28. [三个模块的联动关系](#28-三个模块的联动关系)

---

## 1. 技术架构

### 1.1 技术选型

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

### 1.2 架构模式

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

## 2. 项目结构

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
│   │   ├── splash_page.dart
│   │   └── quick_experience_page.dart
│   ├── home/                    # Tab1首页
│   │   ├── home_page.dart
│   │   └── components/
│   ├── partner/                 # Tab2伴侣
│   │   ├── partner_page.dart
│   │   ├── create_partner_page.dart
│   │   └── components/
│   ├── simulation/              # Tab3模拟
│   │   ├── scene_list_page.dart
│   │   ├── scene_detail_page.dart
│   │   └── components/
│   ├── growth/                  # Tab4成长
│   │   ├── growth_page.dart
│   │   └── components/
│   ├── profile/                 # Tab5我的
│   │   ├── profile_page.dart
│   │   └── components/
│   ├── chat/                    # 对话页
│   │   └── chat_page.dart
│   ├── voice_call/              # 语音通话
│   │   └── voice_call_page.dart
│   ├── timetravel/              # 时空穿梭
│   │   └── timetravel_page.dart
│   └── auth/                    # 认证页
│       ├── login_page.dart
│       └── realname_page.dart
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

## 3. 路由设计

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
        builder: (context, state) => const SceneListPage(),
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
  GoRoute(
    path: '/scene/:id',
    name: 'scene_detail',
    builder: (context, state) => SceneDetailPage(id: state.pathParameters['id']!),
  ),
  GoRoute(
    path: '/chat',
    name: 'chat',
    builder: (context, state) => const ChatPage(),
  ),
  GoRoute(
    path: '/voice-call',
    name: 'voice_call',
    builder: (context, state) => const VoiceCallPage(),
  ),
  GoRoute(
    path: '/timetravel',
    name: 'timetravel',
    builder: (context, state) => const TimeTravelPage(),
  ),
  GoRoute(
    path: '/realname',
    name: 'realname',
    builder: (context, state) => const RealNamePage(),
  ),
];
```

---

## 4. 状态管理

### 4.1 Provider列表

| Provider | 职责 | 关键状态 |
|----------|------|---------|
| AuthProvider | 用户认证 | token, isLoggedIn, isLoading |
| UserProvider | 用户信息 | user, membership, points, tickets |
| PartnerProvider | 伴侣状态 | partner, affection, moments, dailyTask |
| SceneProvider | 场景管理 | scenes, currentScene, simulationState |
| GrowthProvider | 成长数据 | radarData, trendData, milestones, diary |
| CheckInProvider | 签到状态 | streak, todayChecked, history |
| TimeTravelProvider | 时空穿梭 | tickets, learningCards, isTraveling |

### 4.2 Provider详细定义

#### AuthProvider

```dart
class AuthProvider extends ChangeNotifier {
  String _token = '';
  String _refreshToken = '';
  bool _isLoggedIn = false;
  bool _isLoading = false;

  String get token => _token;
  bool get isLoggedIn => _isLoggedIn;
  bool get isLoading => _isLoading;

  Future<void> login(String phone, String code) async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final response = await apiClient.post('/auth/login', body: {
        'phone': phone,
        'code': code,
      });
      
      final data = jsonDecode(response.body);
      _token = data['token'];
      _refreshToken = data['refresh_token'];
      _isLoggedIn = true;
      apiClient.setToken(_token);
      
      await Hive.box('auth').put('token', _token);
      await Hive.box('auth').put('refresh_token', _refreshToken);
    } catch (e) {
      rethrow;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<void> refreshToken() async {
    try {
      final response = await apiClient.post('/auth/refresh', body: {
        'refresh_token': _refreshToken,
      });
      
      final data = jsonDecode(response.body);
      _token = data['token'];
      _refreshToken = data['refresh_token'];
      apiClient.setToken(_token);
      
      await Hive.box('auth').put('token', _token);
      await Hive.box('auth').put('refresh_token', _refreshToken);
    } catch (e) {
      _isLoggedIn = false;
      _token = '';
      await Hive.box('auth').clear();
    }
    notifyListeners();
  }

  void logout() {
    _isLoggedIn = false;
    _token = '';
    _refreshToken = '';
    apiClient.setToken('');
    Hive.box('auth').clear();
    notifyListeners();
  }
}
```

#### UserProvider

```dart
class UserProvider extends ChangeNotifier {
  User? _user;
  Map<String, dynamic>? _membership;
  int _points = 0;
  int _tickets = 0;

  User? get user => _user;
  Map<String, dynamic>? get membership => _membership;
  int get points => _points;
  int get tickets => _tickets;

  Future<void> fetchUserInfo() async {
    try {
      final response = await apiClient.get('/user/info');
      final data = jsonDecode(response.body);
      
      _user = User.fromJson(data['user']);
      _membership = data['membership'];
      _points = data['points'];
      _tickets = data['tickets'];
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  void updatePoints(int delta) {
    _points += delta;
    notifyListeners();
  }

  void updateTickets(int delta) {
    _tickets += delta;
    notifyListeners();
  }
}
```

#### PartnerProvider

```dart
class PartnerProvider extends ChangeNotifier {
  Partner? _partner;
  Affection? _affection;
  List<Moment> _moments = [];
  String? _dailyTask;
  bool _isOnline = true;

  Partner? get partner => _partner;
  Affection? get affection => _affection;
  List<Moment> get moments => _moments;
  String? get dailyTask => _dailyTask;
  bool get isOnline => _isOnline;

  Future<void> fetchPartnerInfo() async {
    try {
      final response = await apiClient.get('/companion/info');
      final data = jsonDecode(response.body);
      _partner = Partner.fromJson(data['companion']);
      _affection = Affection.fromJson(data['affection']);
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  Future<void> fetchPartnerStatus() async {
    try {
      final response = await apiClient.get('/companion/status');
      final data = jsonDecode(response.body);
      _isOnline = data['online'];
      _dailyTask = data['daily_task'];
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  void updateAffection(Affection affection) {
    _affection = affection;
    notifyListeners();
  }

  void addMoment(Moment moment) {
    _moments.insert(0, moment);
    notifyListeners();
  }

  void updateMomentLikes(int momentId, int newCount) {
    final index = _moments.indexWhere((m) => m.id == momentId);
    if (index != -1) {
      _moments[index] = _moments[index].copyWith(likesCount: newCount);
      notifyListeners();
    }
  }
}
```

#### SceneProvider

```dart
class SceneProvider extends ChangeNotifier {
  List<Scene> _scenes = [];
  Scene? _currentScene;
  int? _currentRound;
  List<DialogueOption> _currentOptions = [];
  bool _isSimulating = false;

  List<Scene> get scenes => _scenes;
  Scene? get currentScene => _currentScene;
  int? get currentRound => _currentRound;
  List<DialogueOption> get currentOptions => _currentOptions;
  bool get isSimulating => _isSimulating;

  Future<void> fetchScenes({int? stage, int? difficulty}) async {
    try {
      String path = '/scenes';
      if (stage != null || difficulty != null) {
        path += '?';
        if (stage != null) path += 'stage=$stage&';
        if (difficulty != null) path += 'difficulty=$difficulty';
      }
      
      final response = await apiClient.get(path);
      final data = jsonDecode(response.body);
      _scenes = (data['scenes'] as List).map((e) => Scene.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  Future<void> startSimulation(int sceneId) async {
    try {
      final response = await apiClient.post('/simulation/start', body: {
        'scene_id': sceneId,
      });
      final data = jsonDecode(response.body);
      
      _currentScene = _scenes.firstWhere((s) => s.id == sceneId);
      _currentRound = 1;
      _isSimulating = true;
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  void setCurrentOptions(List<DialogueOption> options) {
    _currentOptions = options;
    notifyListeners();
  }

  void advanceRound(int round) {
    _currentRound = round;
    notifyListeners();
  }

  void endSimulation() {
    _currentScene = null;
    _currentRound = null;
    _currentOptions = [];
    _isSimulating = false;
    notifyListeners();
  }
}
```

#### GrowthProvider

```dart
class GrowthProvider extends ChangeNotifier {
  GrowthData? _growthData;
  List<Milestone> _milestones = [];
  List<EmotionDiary> _diaries = [];
  WeeklyReport? _weeklyReport;

  GrowthData? get growthData => _growthData;
  List<Milestone> get milestones => _milestones;
  List<EmotionDiary> get diaries => _diaries;
  WeeklyReport? get weeklyReport => _weeklyReport;

  Future<void> fetchGrowthData() async {
    try {
      final response = await apiClient.get('/growth');
      final data = jsonDecode(response.body);
      _growthData = GrowthData.fromJson(data);
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  Future<void> fetchMilestones() async {
    try {
      final response = await apiClient.get('/growth/milestones');
      final data = jsonDecode(response.body);
      _milestones = (data['milestones'] as List).map((e) => Milestone.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  Future<void> fetchDiaries() async {
    try {
      final response = await apiClient.get('/growth/diary');
      final data = jsonDecode(response.body);
      _diaries = (data['diaries'] as List).map((e) => EmotionDiary.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  Future<void> fetchWeeklyReport() async {
    try {
      final response = await apiClient.get('/growth/weekly');
      final data = jsonDecode(response.body);
      _weeklyReport = WeeklyReport.fromJson(data['report']);
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }
}
```

#### CheckInProvider

```dart
class CheckInProvider extends ChangeNotifier {
  int _streak = 0;
  bool _todayChecked = false;
  List<CheckInRecord> _history = [];

  int get streak => _streak;
  bool get todayChecked => _todayChecked;
  List<CheckInRecord> get history => _history;

  Future<void> fetchCheckInStats() async {
    try {
      final response = await apiClient.get('/checkin/stats');
      final data = jsonDecode(response.body);
      _streak = data['current_streak'];
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  Future<void> dailyCheckIn() async {
    try {
      final response = await apiClient.post('/checkin/daily');
      final data = jsonDecode(response.body);
      _streak = data['streak'];
      _todayChecked = true;
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  Future<void> fetchHistory() async {
    try {
      final response = await apiClient.get('/checkin/history');
      final data = jsonDecode(response.body);
      _history = (data['records'] as List).map((e) => CheckInRecord.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }
}
```

#### TimeTravelProvider

```dart
class TimeTravelProvider extends ChangeNotifier {
  int _tickets = 0;
  List<LearningCard> _learningCards = [];
  bool _isTraveling = false;

  int get tickets => _tickets;
  List<LearningCard> get learningCards => _learningCards;
  bool get isTraveling => _isTraveling;

  Future<void> fetchTickets() async {
    try {
      final response = await apiClient.get('/timetravel/tickets');
      final data = jsonDecode(response.body);
      _tickets = data['tickets'];
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  Future<void> fetchLearningCards({String? category}) async {
    try {
      String path = '/timetravel/cards';
      if (category != null) path += '?category=$category';
      
      final response = await apiClient.get(path);
      final data = jsonDecode(response.body);
      _learningCards = (data['cards'] as List).map((e) => LearningCard.fromJson(e)).toList();
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }

  Future<void> executeTravel(int interactionId) async {
    _isTraveling = true;
    notifyListeners();
    
    try {
      final response = await apiClient.post('/timetravel/execute', body: {
        'interaction_id': interactionId,
      });
      final data = jsonDecode(response.body);
      _tickets = data['remaining_tickets'];
      
      final learningCard = LearningCard.fromJson(data['learning_card']);
      _learningCards.insert(0, learningCard);
    } catch (e) {
      rethrow;
    } finally {
      _isTraveling = false;
      notifyListeners();
    }
  }

  Future<void> collectCard(int cardId) async {
    try {
      await apiClient.post('/timetravel/cards/collect', body: {
        'card_id': cardId,
      });
      
      final index = _learningCards.indexWhere((c) => c.id == cardId);
      if (index != -1) {
        _learningCards[index] = _learningCards[index].copyWith(isCollected: true);
      }
    } catch (e) {
      rethrow;
    }
    notifyListeners();
  }
}
```

### 4.3 使用示例

```dart
Consumer<PartnerProvider>(
  builder: (context, provider, child) {
    return Column(
      children: [
        Text(provider.partner?.name ?? '未创建伴侣'),
        EmotionBar(value: provider.affection.score),
      ],
    );
  },
);
```

---

## 5. API客户端

### 5.1 基础配置

```dart
class ApiClient {
  static const String baseUrlDev = 'http://localhost:3000/api/v1';
  static const String baseUrlProd = 'https://api.yuni.app/api/v1';
  
  String get baseUrl {
    if (kReleaseMode) return baseUrlProd;
    return baseUrlDev;
  }
  
  String _token = '';
  
  void setToken(String token) => _token = token;
  
  Map<String, String> get headers => {
    'Authorization': 'Bearer $_token',
    'Content-Type': 'application/json',
  };
  
  Future<Response> get(String path) {
    return http.get(Uri.parse('$baseUrl$path'), headers: headers);
  }
  
  Future<Response> post(String path, {dynamic body}) {
    return http.post(Uri.parse('$baseUrl$path'), body: jsonEncode(body), headers: headers);
  }
  
  Future<Response> put(String path, {dynamic body}) {
    return http.put(Uri.parse('$baseUrl$path'), body: jsonEncode(body), headers: headers);
  }
}
```

### 5.2 WebSocket连接

```dart
class WebSocketManager {
  WebSocketChannel? _channel;
  final StreamController<dynamic> _messageController = StreamController.broadcast();
  
  void connect(String sessionType) {
    _channel = WebSocketChannel.connect(
      Uri.parse('wss://api.yuni.app/ws/$sessionType'),
    );
    _channel?.stream.listen((message) {
      _messageController.add(jsonDecode(message));
    });
  }
  
  Stream<dynamic> get stream => _messageController.stream;
  
  void send(Map<String, dynamic> message) {
    _channel?.sink.add(jsonEncode(message));
  }
  
  void close() {
    _channel?.sink.close();
    _messageController.close();
  }
}
```

---

## 6. UI设计规范

### 6.1 颜色系统

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

### 6.2 字体规范

| 字号 | 字重 | 用途 |
|------|------|------|
| 24px | Bold | 页面标题 |
| 20px | Semibold | 副标题、卡片标题 |
| 16px | Regular | 正文、按钮文字 |
| 14px | Regular | 辅助文字、标签 |
| 12px | Medium | 提示文字、时间戳 |

### 6.3 间距规范

| 间距 | 用途 |
|------|------|
| 8px | 紧凑间距、元素内部 |
| 12px | 标准间距、卡片内边距 |
| 16px | 宽松间距、模块间距 |
| 24px | 大间距、页面边距 |
| 32px | 超大间距、重要分隔 |

### 6.4 圆角规范

| 圆角 | 用途 |
|------|------|
| 8px | 按钮、小卡片 |
| 12px | 卡片、对话框 |
| 16px | 大卡片、模态框 |
| 24px | 页面容器、头像 |

---

## 7. 冷启动与快速体验

### 7.1 启动流程

```
App启动
    │
    ▼
SplashPage（2秒）
    │
    ▼
检测是否首次安装
    │
    ├─ 是首次安装 → QuickExperiencePage（快速体验）
    │       │
    │       ▼
    │   体验结束 → CreatePartnerPage（3步创建）
    │       │
    │       ▼
    │   进入首页
    │
    └─ 非首次安装 → 检测登录状态
            │
            ├─ 已登录 → 进入首页
            │
            └─ 未登录 → LoginPage
```

### 7.2 快速体验页面

#### 页面布局

```
┌────────────────────────────────┐
│ 🎬 快速体验                    │ 标题区
│ "咖啡厅破冰"                   │
├────────────────────────────────┤
│ [场景介绍动画]                 │ 动画展示
│ "你在咖啡厅排队..."            │
├────────────────────────────────┤
│ 对话区域（3轮）                │ 对话交互
│ AI："你试过他们的燕麦拿铁吗？" │
│ 用户选择：A/B/C选项            │
├────────────────────────────────┤
│ 💝 送礼环节                   │ 好感度体验
│ "看你有点累，送你杯奶茶吧"     │
│ 好感度 +10                    │
├────────────────────────────────┤
│ 😊 情绪时刻                   │ 情绪感知
│ "今天心情怎么样？"             │
├────────────────────────────────┤
│ ✨ 体验结束                    │ 引导创建
│ [创建我的伴侣] [稍后再说]      │
└────────────────────────────────┘
```

#### 交互逻辑

| 环节 | 内容 | 教学点 |
|------|------|--------|
| 对话1 | "这家店的拿铁很出名，你平时喜欢喝什么？" | 从环境开启话题 |
| 对话2 | "周末一般怎么过？" | 用开放式问题深入 |
| 对话3 | "我最近在看一本书，特别有意思..." | 自我袒露+共鸣 |
| 送礼 | "看你有点累，送你杯奶茶吧" | 好感度变化体验 |
| 情绪 | "今天心情怎么样？" | 情绪感知能力展示 |

#### 组件清单

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| QuickExperiencePage | pages/onboarding/quick_experience_page.dart | 主页面 |
| ExperienceDialog | pages/onboarding/components/experience_dialog.dart | 对话组件 |
| GiftSection | pages/onboarding/components/gift_section.dart | 送礼环节 |
| EmotionSection | pages/onboarding/components/emotion_section.dart | 情绪时刻 |

### 7.3 创建伴侣页面（3步）

#### Step 1：选择核心风格

```
┌────────────────────────────────┐
│ 🎯 选择TA的核心风格            │
│ ┌──────────┐ ┌──────────┐     │
│ │ 追寻者   │ │ 守护者   │     │
│ │ 渴望连接 │ │ 渴望保护 │     │
│ └──────────┘ └──────────┘     │
│ ┌──────────┐ ┌──────────┐     │
│ │ 流浪者   │ │ 疗愈者   │     │
│ │ 追逐新鲜 │ │ 极度共情 │     │
│ └──────────┘ └──────────┘     │
│            [下一步 →]          │
└────────────────────────────────┘
```

#### Step 2：关系起点 + 命名

```
┌────────────────────────────────┐
│ 💑 你们的关系                  │
│ ├─ 青梅竹马                   │
│ ├─ 大学同学                   │
│ ├─ 职场前辈                   │
│ └─ 陌生人                     │
│ 请输入TA的名字：[________]     │
│            [下一步 →]          │
└────────────────────────────────┘
```

#### Step 3：AI生成形象

```
┌────────────────────────────────┐
│ 🤖 AI正在生成形象...           │
│ [加载动画]                     │
│            [完成 →]            │
└────────────────────────────────┘
```

---

## 8. 用户自定义角色系统

### 8.1 六维自定义模型

```dart
class CustomRoleConfig {
  final String roleName;
  final String gender;
  final int age;
  final List<String> corePersonality;
  final String relationship;
  final String nicknameForUser;
  final String catchphrase;
  final String voiceType;
  final String avatarStyle;
  final Map<String, int> personalityDimensions;

  CustomRoleConfig({
    required this.roleName,
    required this.gender,
    required this.age,
    required this.corePersonality,
    required this.relationship,
    required this.nicknameForUser,
    this.catchphrase = '',
    this.voiceType = 'warm',
    this.avatarStyle = 'default',
    required this.personalityDimensions,
  });

  factory CustomRoleConfig.fromJson(Map<String, dynamic> json) => CustomRoleConfig(
    roleName: json['role_name'],
    gender: json['gender'],
    age: json['age'],
    corePersonality: List<String>.from(json['core_personality']),
    relationship: json['relationship'],
    nicknameForUser: json['nickname_for_user'],
    catchphrase: json['catchphrase'] ?? '',
    voiceType: json['voice_type'] ?? 'warm',
    avatarStyle: json['avatar_style'] ?? 'default',
    personalityDimensions: Map<String, int>.from(json['personality_dimensions'] ?? {}),
  );

  Map<String, dynamic> toJson() => {
    'role_name': roleName,
    'gender': gender,
    'age': age,
    'core_personality': corePersonality,
    'relationship': relationship,
    'nickname_for_user': nicknameForUser,
    'catchphrase': catchphrase,
    'voice_type': voiceType,
    'avatar_style': avatarStyle,
    'personality_dimensions': personalityDimensions,
  };
}
```

### 8.2 六维人格维度

| 维度 | 描述 | 取值范围 | 示例 |
|------|------|---------|------|
| 外向性 | 社交活跃度 | 1-100 | 高：喜欢聚会，低：喜欢独处 |
| 神经质 | 情绪稳定性 | 1-100 | 高：情绪波动大，低：情绪稳定 |
| 开放性 | 接受新事物程度 | 1-100 | 高：喜欢冒险，低：喜欢稳定 |
| 宜人性 | 友善合作程度 | 1-100 | 高：乐于助人，低：较为冷漠 |
| 尽责性 | 自律可靠程度 | 1-100 | 高：按时完成，低：随性而为 |
| 共情力 | 理解他人情绪 | 1-100 | 高：善解人意，低：理性冷静 |

### 8.3 自定义角色创建流程

```
┌─────────────────────────────────────────────────────────────┐
│                    自定义角色创建流程                        │
├─────────────────────────────────────────────────────────────┤
│  Step 1: 基础信息                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 📝 角色名称：[__________]                           │   │
│  │ 👤 性别：○男 ○女                                    │   │
│  │ 🎂 年龄：[____] 岁                                  │   │
│  │ [下一步 →]                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  Step 2: 人格设定                                            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🎯 六维人格滑块                                       │   │
│  │ 外向性：███░░░░░░░ 35%                              │   │
│  │ 神经质：████░░░░░░ 45%                              │   │
│  │ 开放性：█████░░░░░ 55%                              │   │
│  │ 宜人性：██████░░░░ 65%                              │   │
│  │ 尽责性：████░░░░░░ 45%                              │   │
│  │ 共情力：███████░░░ 75%                              │   │
│  │ [下一步 →]                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  Step 3: 关系与口头禅                                         │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 💑 关系类型：青梅竹马 / 大学同学 / 职场前辈 / 陌生人   │   │
│  │ 🏷️ 称呼你为：[__________]                           │   │
│  │ 🗣️ 口头禅：[__________]                             │   │
│  │ [下一步 →]                                          │   │
│  └─────────────────────────────────────────────────────┘   │
│                           │                                 │
│                           ▼                                 │
│  Step 4: 语音与形象                                          │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ 🔊 声音类型：温暖 / 活力 / 沉稳 / 甜美               │   │
│  │ 🎭 形象风格：清新 / 复古 / 潮流 / 简约               │   │
│  │ [试听声音] [预览形象]                                │   │
│  │ [创建完成 →]                                        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### 8.4 预设人格模板

| 模板名称 | 外向性 | 神经质 | 开放性 | 宜人性 | 尽责性 | 共情力 | 口头禅 |
|---------|--------|--------|--------|--------|--------|--------|--------|
| 温暖学长 | 70 | 30 | 60 | 80 | 70 | 85 | "没事，有我呢" |
| 元气少女 | 85 | 50 | 80 | 75 | 50 | 70 | "一起加油吧！" |
| 高冷御姐 | 40 | 35 | 70 | 50 | 80 | 60 | "嗯，我知道了" |
| 邻家弟弟 | 80 | 60 | 75 | 85 | 45 | 80 | "姐姐/哥哥好~" |
| 成熟大叔 | 60 | 25 | 55 | 70 | 85 | 75 | "慢慢来，不急" |

### 8.5 组件与页面

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| CustomRolePage | pages/onboarding/custom_role_page.dart | 自定义角色主页面 |
| PersonalitySlider | pages/onboarding/components/personality_slider.dart | 六维滑块组件 |
| VoicePreview | pages/onboarding/components/voice_preview.dart | 声音预览 |
| AvatarPreview | pages/onboarding/components/avatar_preview.dart | 形象预览 |

### 8.6 路由配置

```dart
GoRoute(
  path: '/onboarding/custom-role',
  name: 'custom_role',
  builder: (context, state) => const CustomRolePage(),
),
```

### 8.7 API调用

```dart
Future<Partner> createCustomRole(CustomRoleConfig config) async {
  final response = await apiClient.post('/companion/customize', body: config.toJson());
  final data = jsonDecode(response.body);
  return Partner.fromJson(data['companion']);
}

Future<List<CustomRoleConfig>> getPresetTemplates() async {
  final response = await apiClient.get('/companion/presets');
  final data = jsonDecode(response.body);
  return (data['presets'] as List).map((e) => CustomRoleConfig.fromJson(e)).toList();
}
```

---

## 9. Tab1：首页

### 9.1 页面布局

```
┌────────────────────────────────┐
│ 🦞 晚上好，小雨 ✨ 羁绊Lv.3   │ 顶部问候
│    [伴侣头像 在线]  [签到]    │ 签到入口
├────────────────────────────────┤
│ 📌 今日推荐训练                 │ 推荐卡片
│ 咖啡厅破冰 ⭐ 8min [开始训练]  │
├────────────────────────────────┤
│ 🕐 最近训练                    │ 横向滚动
│ [卡片1] [卡片2] [卡片3] [+更多]│
├────────────────────────────────┤
│ 📊 本周进度                    │ 进度条
│ 训练天数：3/7 ██████░░░░ 43%  │
│ 沟通力 +12% ↑                 │
├────────────────────────────────┤
│ 🌙 今晚晚安计划                │ 晚安卡片(20:00-01:00)
│ "今天辛苦了，睡前想听点什么？" │
│ [听TA说晚安 →]                │
├────────────────────────────────┤
│ 💄 想从形象上提升社交自信？    │ 变美联动
│ [去悦己颜值社看看 →]          │
└────────────────────────────────┘
```

### 9.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| HeaderSection | home/components/header_section.dart | 问候+头像+签到 |
| DailyRecommend | home/components/daily_recommend.dart | 今日推荐卡片 |
| RecentTrainings | home/components/recent_trainings.dart | 横向滚动列表 |
| WeeklyProgress | home/components/weekly_progress.dart | 进度条+能力提升 |
| NightlyCard | home/components/nightly_card.dart | 晚安计划入口 |
| BeautyLink | home/components/beauty_link.dart | 变美联动入口 |

### 9.3 交互逻辑

| 操作 | 目标 |
|------|------|
| 点击签到 | 调用签到API，更新签到状态 |
| 点击推荐场景 | 跳转到场景详情页 |
| 点击最近训练 | 跳转到训练报告页 |
| 点击晚安卡片 | 跳转到晚安页面 |
| 点击变美联动 | 唤起悦己颜值社或跳转应用商店 |

---

## 10. Tab2：伴侣页

### 10.1 页面布局

```
┌────────────────────────────────┐
│     [数字人全屏展示]           │ 占屏幕70%
│       [点击触发互动]           │
├────────────────────────────────┤
│ 沈清欢 · 青梅竹马 · ❤️ 知己   │ 名字+关系+等级
│ ████████████░░░░░ 65%        │ 亲密度进度条
├────────────────────────────────┤
│ [💬 聊天]    [🎯 模拟训练]    │ 主按钮
├────────────────────────────────┤
│ 📱 朋友圈 (展开▼)              │ 可折叠
│ "今天路过一家花店..."         │
├────────────────────────────────┤
│ 📋 今日任务：完成一次场景训练  │ 底部悬浮
└────────────────────────────────┘
```

### 10.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| DigitalHuman | widgets/digital_human.dart | 数字人展示+互动动画 |
| PartnerInfo | partner/components/partner_info.dart | 名字+关系+进度条 |
| ActionButtons | partner/components/action_buttons.dart | 聊天+训练按钮 |
| MomentsSection | partner/components/moments_section.dart | 朋友圈动态 |
| DailyTask | partner/components/daily_task.dart | 今日任务提醒 |

### 10.3 交互逻辑

| 操作 | 目标 |
|------|------|
| 点击数字人 | 触发随机互动动画（微笑/眨眼/挥手） |
| 点击聊天 | 进入全屏对话页 |
| 点击模拟训练 | 跳转到Tab3模拟页 |
| 点击朋友圈展开 | 展开/收起朋友圈列表 |
| 点击今日任务 | 跳转到对应场景 |

---

## 11. Tab3：模拟页

### 11.1 页面布局（场景列表）

```
┌────────────────────────────────┐
│ 社交场景训练库                 │ 标题
│ 阶段一：破冰期（已解锁）        │ 分组标题
│ ┌────────────────────────────┐ │
│ │ 咖啡厅破冰 ⭐ 8min ✓        │ │ 场景卡片
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ 兴趣社群自我介绍 ⭐⭐        │ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ 阶段二：接触期（已解锁）        │
│ ...                           │
├────────────────────────────────┤
│ 阶段三：熟悉期（已解锁）        │
│ ...                           │
└────────────────────────────────┘
```

### 11.2 场景详情页（对话模式）

```
┌────────────────────────────────┐
│ 咖啡厅破冰 · ⭐ · 第1轮        │ 场景信息
├────────────────────────────────┤
│ [场景背景图]                   │
│ "你在咖啡厅排队，前面是..."    │
├────────────────────────────────┤
│ AI："你试过他们的燕麦拿铁吗？" │ AI对话气泡
├────────────────────────────────┤
│ ┌──────────────────────────┐  │
│ │ A. "是的，我经常来这里"   │  │ 选项A
│ │    👍 质量：高            │  │
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ B. "没喝过"              │  │ 选项B
│ │    ➖ 质量：中            │  │
│ └──────────────────────────┘  │
│ ┌──────────────────────────┐  │
│ │ C. "嗯"                  │  │ 选项C
│ │    👎 质量：低            │  │
│ └──────────────────────────┘  │
├────────────────────────────────┤
│ 💡 提示：从环境开启话题更容易 │ 实时反馈
└────────────────────────────────┘
```

### 11.3 训练报告页

```
┌────────────────────────────────┐
│ 🎉 训练完成！                  │ 标题
│ 咖啡厅破冰 · 得分：75/100      │
├────────────────────────────────┤
│ ⭐⭐⭐⭐⭐ 五星评价             │
├────────────────────────────────┤
│ 📊 分项得分                   │
│ 沟通力：85 表达力：70          │
│ 共情力：75 情绪控制：65        │
│ 应变力：80                    │
├────────────────────────────────┤
│ 💡 改进建议                   │
│ "下次试着用更多开放式问题"     │
├────────────────────────────────┤
│ 🃏 生成学习卡片               │
│ [收藏此卡片]                  │
├────────────────────────────────┤
│ 💄 在这个场景中，形象也很重要 │ 变美联动
│ [去悦己颜值社看看 →]          │
└────────────────────────────────┘
```

### 11.4 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| SceneList | simulation/components/scene_list.dart | 场景分组列表 |
| SceneCard | simulation/components/scene_card.dart | 单个场景卡片 |
| DialogFlow | simulation/components/dialog_flow.dart | 对话流程管理 |
| OptionButton | simulation/components/option_button.dart | A/B/C选项按钮 |
| FeedbackBubble | simulation/components/feedback_bubble.dart | 实时反馈提示 |
| TrainingReport | simulation/components/training_report.dart | 训练报告 |

---

## 12. Tab4：成长页

### 12.1 页面布局

```
┌────────────────────────────────┐
│ 📈 成长轨迹                    │ 标题
├────────────────────────────────┤
│ 能力雷达图（五边形）           │
│ 综合得分：72                   │
├────────────────────────────────┤
│ 📊 进步曲线（近7天）折线图     │ 可切换30天
├────────────────────────────────┤
│ 📖 情绪日记                    │ 训练后自动生成
│ "模拟面试虽然紧张但完成得不错" │
│ [查看全部 →]                  │
├────────────────────────────────┤
│ 🏆 里程碑                      │ 时间轴
│ ✓第一次训练  ✓连签7天          │
├────────────────────────────────┤
│ 🃏 学习卡片库（已收藏5张）     │
├────────────────────────────────┤
│ 💌 伴侣寄语                    │
└────────────────────────────────┘
```

### 13.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| RadarChart | growth/components/radar_chart.dart | 五维能力雷达图 |
| TrendChart | growth/components/trend_chart.dart | 进步曲线折线图 |
| EmotionDiary | growth/components/emotion_diary.dart | 情绪日记列表 |
| Milestones | growth/components/milestones.dart | 里程碑时间轴 |
| LearningCards | growth/components/learning_cards.dart | 学习卡片库 |
| PartnerMessage | growth/components/partner_message.dart | 伴侣寄语 |

### 12.3 能力维度说明

| 维度 | 计算方式 | 说明 |
|------|---------|------|
| 沟通力 | 话题开启自然度+回应长度 | 从环境开启话题的能力 |
| 表达力 | STAR法则运用+结构化程度 | 清晰表达观点的能力 |
| 共情力 | 反映式倾听+情感支持 | 理解他人感受的能力 |
| 情绪控制 | CBT关键词使用频率 | 控制负面思维的能力 |
| 应变力 | 应对质疑+灵活调整 | 处理突发情况的能力 |

---

## 13. Tab5：我的页

### 13.1 页面布局

```
┌────────────────────────────────┐
│ [头像] 小雨 · 月卡会员         │ 用户信息
│ 🎫 穿梭券：5张                │
├────────────────────────────────┤
│ 📋 我的形象                   │ 入口列表
│ ├─ 预设角色                   │
│ ├─ 自定义原创                 │
│ └─ 从悦己颜值社同步           │
├────────────────────────────────┤
│ 💑 伴侣设置                   │
│ ├─ 重新编辑人设               │
│ └─ 关系回忆录                 │
├────────────────────────────────┤
│ 💎 会员中心                   │
│ ├─ 升级会员                   │
│ └─ 会员特权                   │
├────────────────────────────────┤
│ 📅 签到记录                   │
├────────────────────────────────┤
│ 🃏 学习卡片库                 │
├────────────────────────────────┤
│ 💄 变美联动                   │
├────────────────────────────────┤
│ 🔒 隐私与数据                 │
│ ├─ 端到端加密说明             │
│ └─ 数据销毁                   │
├────────────────────────────────┤
│ ⚠️ 防沉迷设置                 │
└────────────────────────────────┘
```

### 13.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| UserProfile | profile/components/user_profile.dart | 用户信息头部 |
| MenuList | profile/components/menu_list.dart | 菜单列表 |
| MembershipCard | profile/components/membership_card.dart | 会员卡片 |
| CheckInCalendar | profile/components/check_in_calendar.dart | 签到日历 |
| PrivacySection | profile/components/privacy_section.dart | 隐私与数据 |

---

## 14. 数字人渲染

### 14.1 分级渲染策略

| 会员等级 | 渲染方式 | 实现方案 | 动作数量 |
|---------|---------|---------|---------|
| 体验版/免费 | 2D动态立绘 | Spine 2D骨骼动画 | 5个基础动作 |
| 基础会员（周卡） | 2.5D Live2D | Live2D Flutter插件 | 12个动作 |
| 标准会员（月卡） | 3D数字人 | Three.js WebView | 25个动作 |
| 尊享会员（年卡） | 3D+真人风格 | Three.js + 自定义材质 | 25个动作+自定义 |

### 14.2 MVP实现：Spine 2D

```dart
class DigitalHuman extends StatefulWidget {
  final Partner partner;
  final String? action;
  
  const DigitalHuman({super.key, required this.partner, this.action});
  
  @override
  _DigitalHumanState createState() => _DigitalHumanState();
}

class _DigitalHumanState extends State<DigitalHuman> {
  late SkeletonAnimation _skeletonAnimation;
  
  @override
  void initState() {
    super.initState();
    _skeletonAnimation = SkeletonAnimation(
      skeletonDataAsset: 'assets/spine/${widget.partner.id}/skeleton.json',
      atlasAsset: 'assets/spine/${widget.partner.id}/atlas.atlas',
    );
    
    if (widget.action != null) {
      triggerAction(widget.action!);
    }
  }
  
  void triggerAction(String action) {
    _skeletonAnimation.state.setAnimation(0, action, false);
    _skeletonAnimation.state.addAnimation(0, 'idle', true, 0.5);
  }
  
  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {
        final actions = ['smile', 'blink', 'wave', 'nod'];
        triggerAction(actions[Random().nextInt(actions.length)]);
      },
      child: _skeletonAnimation,
    );
  }
}
```

### 14.3 动作列表

| 动作ID | 动作名称 | 会员等级 | 触发条件 |
|--------|----------|---------|---------|
| A01 | 微笑 | 全部 | 收到好评、日常对话 |
| A02 | 眨眼 | 全部 | 对话中随机 |
| A03 | 点头 | 全部 | 同意用户观点 |
| A04 | 摇头 | 全部 | 不同意或无奈 |
| A05 | 挥手 | 全部 | 打招呼、告别 |
| A06 | 歪头 | 周卡+ | 思考问题、疑惑 |
| A07 | 耸肩 | 周卡+ | 无奈、不知道答案 |
| A08 | 摊手 | 周卡+ | 解释、无奈 |
| A09 | 托腮 | 周卡+ | 深度思考 |
| A10 | 双手合十 | 周卡+ | 请求帮助、感谢 |
| A11 | 指向 | 周卡+ | 指向某个方向 |
| A12 | 鼓掌 | 周卡+ | 庆祝、高兴 |
| A13 | 拥抱 | 月卡+ | 安慰、亲密时刻 |
| A14 | 轻拍 | 月卡+ | 安慰用户 |
| A15 | 比心 | 月卡+ | 表达喜欢、感谢 |
| A16 | 眨眼wink | 月卡+ | 俏皮回应 |
| A17 | 惊讶 | 月卡+ | 惊讶的事情 |
| A18 | 失落 | 月卡+ | 用户情绪低落 |
| A19 | 兴奋 | 月卡+ | 兴奋时刻 |
| A20 | 思考 | 月卡+ | 深度思考 |
| A21 | 抚发 | 月卡+ | 不经意动作 |
| A22 | 靠前倾身 | 月卡+ | 认真倾听用户说话 |
| A23 | 后仰 | 月卡+ | 放松时刻 |
| A24 | 摊手耸肩 | 月卡+ | 无奈的表达 |
| A25 | 手扶胸口 | 月卡+ | 真诚表达、感动 |

---

## 15. 语音通话

### 15.1 技术方案

| 组件 | 实现 | 说明 |
|------|------|------|
| 实时音视频 | 声网Agora RTC SDK | 全双工语音通话 |
| 语音合成 | Azure TTS | 实时转语音 |
| 语音识别 | 声网ASR | 识别用户说话 |

### 15.2 通话界面

```
┌────────────────────────────────┐
│     [数字人全屏展示]           │
│       [通话中...]              │
├────────────────────────────────┤
│ 通话时长：00:03                │
│ 好感度：♥♥♥♥♥ (85/100)        │
├────────────────────────────────┤
│ [🎙️ 麦克风] [🔇 静音]         │ 控制按钮
│ [📞 挂断]                     │
├────────────────────────────────┤
│ 💬 文字转写区                  │
│ "你好呀，今天心情怎么样？"     │
└────────────────────────────────┘
```

### 15.3 通话流程

```
用户点击语音通话按钮
    │
    ▼
检查通话权限（会员等级+好感度+今日次数）
    │
    ▼
前端初始化RTC引擎，获取Token
    │
    ▼
加入RTC房间，开启麦克风
    │
    ▼
通话循环：用户说话 → ASR识别 → LLM生成 → TTS合成 → RTC播放
    │
    ▼
通话结束 → 生成通话报告
```

### 15.4 好感度与伴侣语气

| 好感度范围 | 伴侣语气 | 视觉反馈 |
|-----------|---------|---------|
| 80-100 | 热情亲密 | 红色爱心跳动 |
| 60-79 | 温暖友好 | 橙色爱心 |
| 40-59 | 平淡礼貌 | 黄色爱心 |
| 20-39 | 冷淡疏离 | 灰色爱心 |
| 0-19 | 准备挂断 | 爱心破碎动画 |

---

## 16. 时空穿梭

### 16.1 功能流程

```
好感度下降（用户说错话/选错礼物）
    │
    ▼
AI弹出提示："这次互动可能需要调整一下"
    │
    ├─ 【时空穿梭】（消耗1张穿梭券）
    │   ├─ 学习时刻：AI分析错误原因+示范正确做法
    │   ├─ 回到选择前重新选择
    │   └─ 选择正确 → 好感度恢复+额外奖励(+10~20)
    │
    └─ 【继续前进】（不消耗穿梭券）
        ├─ 好感度保持降低
        ├─ 结束后生成学习卡片
        └─ 提示：明天可重新挑战该场景
```

### 16.2 穿梭券获取方式

| 获取方式 | 数量 | 频率 |
|---------|------|------|
| 每日登录赠送 | 1张 | 每日 |
| 完成模拟训练 | 1张 | 每日限1次 |
| 积分兑换 | 1张 | 100积分 |
| 看广告 | 1张 | 每日限2次 |
| 会员赠送 | 3-10张 | 周/月/年 |

### 16.3 学习卡片展示

```
┌────────────────────────────────┐
│ 🃏 学习卡片                   │
│ 分类：破冰技巧                │
│ 标题：从环境开启话题          │
├────────────────────────────────┤
│ ❌ 错误分析                  │
│ "你使用了过于简短的回应"      │
├────────────────────────────────┤
│ ✅ 正确做法                  │
│ "从周围环境找话题"           │
├────────────────────────────────┤
│ 📝 话术模板                  │
│ "你觉得这里的____怎么样？"    │
├────────────────────────────────┤
│ [收藏此卡片]                  │
└────────────────────────────────┘
```

---

## 17. 变美联动

### 17.1 联动入口位置

| 位置 | 话术 | 文件路径 |
|------|------|---------|
| 首页底部 | "想从形象上提升社交自信？" | home/components/beauty_link.dart |
| 训练报告页 | "在XX场景中，形象也很重要哦" | simulation/components/training_report.dart |
| 成长页 | "变美也能提升综合分" | growth/components/beauty_link.dart |
| 我的页 | "悦己颜值社（已联动✓）" | profile/components/menu_list.dart |

### 17.2 跳转逻辑

```
用户点击联动按钮
    │
    ├─ 检测是否安装悦己颜值社App
    │   ├─ 未安装 → 跳转应用商店下载页（带追踪参数）
    │   └─ 已安装 → 唤起悦己颜值社App
    │       ├─ 未登录 → 跳转登录页
    │       └─ 已登录 → 跳转首页，传递「与你」用户ID
    │
    └─ 数据互通（用户授权后）
        ├─ 共享社交场景偏好
        └─ 共享用户形象数据
```

---

## 18. 合规功能

### 18.1 实名认证页面

```
┌────────────────────────────────┐
│ 📝 实名认证                    │
│ 为了保护您的隐私安全           │
├────────────────────────────────┤
│ 真实姓名：[______________]     │
│ 身份证号：[________________]   │
│            [提交认证]          │
└────────────────────────────────┘
```

### 18.2 防沉迷提示

```
┌────────────────────────────────┐
│ ⚠️ 温馨提示                    │
│ 您已使用2小时，请休息一下       │
│ [继续使用] [退出休息]          │
└────────────────────────────────┘
```

### 18.3 AI身份透明

- 对话界面始终显示AI标识
- 数字人卡片标注"AI伴侣"
- 设置中可查看AI说明

### 18.4 年龄分层限制

| 年龄 | 功能限制 | 每日时长 |
|------|---------|---------|
| <14岁 | 仅开放基础场景，屏蔽亲密功能 | 30分钟 |
| 14-18岁 | 限制亲密剧情 | 30分钟 |
| ≥18岁 | 全部功能开放 | 无限制（2小时提醒） |

---

## 19. 情绪识别模块

### 19.1 情绪历史页面

#### 页面布局

```
┌────────────────────────────────┐
│ 📊 情绪历史                    │ 标题
├────────────────────────────────┤
│ 📅 时间筛选                    │
│ [近7天] [近30天] [自定义]       │
├────────────────────────────────┤
│ 📈 情绪趋势图表（折线图）        │
│ 焦虑  ████████████░░░░░ 78%    │
│ 平静  ████████░░░░░░░░░░ 45%    │
│ 开心  ██████░░░░░░░░░░░░ 30%    │
├────────────────────────────────┤
│ 🎯 当前情绪状态                │
│ 状态：中立态 → 积极态          │
│ 主情绪：焦虑  强度：0.78       │
├────────────────────────────────┤
│ 📋 情绪记录列表                │
│ ┌────────────────────────────┐ │
│ │ 2026-07-05 23:47           │ │
│ │ 焦虑 强度：0.78            │ │
│ │ 触发：深夜登录+高频发送      │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ 2026-07-05 18:30           │ │
│ │ 平静 强度：0.42            │ │
│ │ 触发：正常对话              │ │
│ └────────────────────────────┘ │
└────────────────────────────────┘
```

#### 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| EmotionHistoryPage | pages/emotion/emotion_history_page.dart | 情绪历史主页面 |
| EmotionTrendChart | emotion/components/emotion_trend_chart.dart | 情绪趋势折线图 |
| EmotionStateCard | emotion/components/emotion_state_card.dart | 当前状态机状态展示 |
| EmotionRecordItem | emotion/components/emotion_record_item.dart | 情绪记录列表项 |

#### 交互逻辑

| 操作 | 目标 |
|------|------|
| 点击时间筛选 | 切换时间范围，刷新图表和列表 |
| 点击情绪记录 | 展开详情，显示分析维度贡献度 |
| 点击状态卡片 | 展示状态机流转图 |

### 18.2 情绪状态机展示

```
┌─────────────────────────────────────────────────────────────────┐
│                         情绪状态流转                           │
│                                                               │
│  ┌─────────┐    检测到正面情绪    ┌─────────┐               │
│  │  中立态 │ ──────────────────▶ │ 积极态  │               │
│  │  (平静) │                     │  (开心)  │               │
│  └────┬────┘                     └────┬────┘               │
│       │                               │                       │
│       │ 检测到负面情绪                  │                       │
│       ▼                               ▼                       │
│  ┌─────────┐                     ┌─────────┐               │
│  │ 消极态  │ ─────────────────▶ │ 高消极态 │               │
│  │ (难过)   │    强度持续上升    │ (焦虑)   │               │
│  └────┬────┘                     └────┬────┘               │
│       │                               │                       │
│       │ 得到安慰/情绪缓解               │ 触发树洞模式          │
│       ▼                               ▼                       │
│  ┌─────────┐                     ┌─────────┐               │
│  │ 恢复态  │                     │ 树洞态  │               │
│  │ (渐好)   │                     │ (共情中) │               │
│  └─────────┘                     └─────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### 18.3 数据模型

#### EmotionData模型

```dart
class EmotionData {
  final String id;
  final String primaryEmotion;
  final List<String> secondaryEmotions;
  final double intensity;
  final String polarity;
  final double confidence;
  final String triggerMode;
  final String recommendedResponse;
  final AnalysisDetail analysisDetail;
  final DateTime createdAt;

  EmotionData({
    required this.id,
    required this.primaryEmotion,
    required this.secondaryEmotions,
    required this.intensity,
    required this.polarity,
    required this.confidence,
    required this.triggerMode,
    required this.recommendedResponse,
    required this.analysisDetail,
    required this.createdAt,
  });

  factory EmotionData.fromJson(Map<String, dynamic> json) => EmotionData(
    id: json['id'],
    primaryEmotion: json['emotion']['primary'],
    secondaryEmotions: List<String>.from(json['emotion']['secondary'] ?? []),
    intensity: (json['emotion']['intensity'] as num).toDouble(),
    polarity: json['emotion']['polarity'],
    confidence: (json['emotion']['confidence'] as num).toDouble(),
    triggerMode: json['trigger_mode'],
    recommendedResponse: json['recommended_response'],
    analysisDetail: AnalysisDetail.fromJson(json['analysis_detail']),
    createdAt: DateTime.parse(json['created_at']),
  );
}

class AnalysisDetail {
  final double textContribution;
  final double behaviorContribution;
  final double voiceContribution;

  AnalysisDetail({
    required this.textContribution,
    required this.behaviorContribution,
    required this.voiceContribution,
  });

  factory AnalysisDetail.fromJson(Map<String, dynamic> json) => AnalysisDetail(
    textContribution: (json['text_contribution'] as num).toDouble(),
    behaviorContribution: (json['behavior_contribution'] as num).toDouble(),
    voiceContribution: (json['voice_contribution'] as num).toDouble(),
  );
}
```

#### EmotionState模型

```dart
enum EmotionStateType {
  neutral,
  positive,
  negative,
  highNegative,
  recovery,
  treeHole
}

class EmotionState {
  final EmotionStateType state;
  final String stateName;
  final String currentEmotion;
  final double intensity;
  final DateTime lastTransition;
  final String nextStateHint;

  EmotionState({
    required this.state,
    required this.stateName,
    required this.currentEmotion,
    required this.intensity,
    required this.lastTransition,
    required this.nextStateHint,
  });

  factory EmotionState.fromJson(Map<String, dynamic> json) {
    final stateMap = {
      'neutral': EmotionStateType.neutral,
      'positive': EmotionStateType.positive,
      'negative': EmotionStateType.negative,
      'high_negative': EmotionStateType.highNegative,
      'recovery': EmotionStateType.recovery,
      'tree_hole': EmotionStateType.treeHole,
    };

    return EmotionState(
      state: stateMap[json['state']] ?? EmotionStateType.neutral,
      stateName: json['state_name'],
      currentEmotion: json['current_emotion'],
      intensity: (json['intensity'] as num).toDouble(),
      lastTransition: DateTime.parse(json['last_transition']),
      nextStateHint: json['next_state_hint'],
    );
  }
}
```

#### BehaviorData模型

```dart
class BehaviorData {
  final String loginTime;
  final int recentMessages;
  final int avgLength;
  final int sceneAvoidanceCount;
  final int homePageReturns;

  BehaviorData({
    required this.loginTime,
    required this.recentMessages,
    required this.avgLength,
    this.sceneAvoidanceCount = 0,
    this.homePageReturns = 0,
  });

  Map<String, dynamic> toJson() => {
    'login_time': loginTime,
    'recent_messages': recentMessages,
    'avg_length': avgLength,
    'scene_avoidance_count': sceneAvoidanceCount,
    'home_page_returns': homePageReturns,
  };
}
```

---

## 20. 数据模型

### 20.1 User模型

```dart
class User {
  final int id;
  final String phone;
  final String? nickname;
  final String? avatarUrl;
  final int membershipType;
  final DateTime? membershipExpire;
  final int points;
  final int weeklySimulations;
  final int tickets;
  final bool isMinor;
  final int age;
  
  User({
    required this.id,
    required this.phone,
    this.nickname,
    this.avatarUrl,
    this.membershipType = 0,
    this.membershipExpire,
    this.points = 0,
    this.weeklySimulations = 15,
    this.tickets = 0,
    this.isMinor = false,
    this.age = 0,
  });
  
  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'],
    phone: json['phone'],
    nickname: json['nickname'],
    avatarUrl: json['avatar_url'],
    membershipType: json['membership_type'] ?? 0,
    membershipExpire: json['membership_expire'] != null 
        ? DateTime.parse(json['membership_expire']) 
        : null,
    points: json['points'] ?? 0,
    weeklySimulations: json['weekly_simulations'] ?? 15,
    tickets: json['tickets'] ?? 0,
    isMinor: json['is_minor'] ?? false,
    age: json['age'] ?? 0,
  );
}
```

### 18.2 Partner模型

```dart
class Partner {
  final int id;
  final String name;
  final String coreType;
  final String relationshipOrigin;
  final String voiceType;
  final Affection affection;
  final List<Moment> moments;
  
  Partner({
    required this.id,
    required this.name,
    required this.coreType,
    required this.relationshipOrigin,
    this.voiceType = 'default',
    required this.affection,
    this.moments = const [],
  });
  
  factory Partner.fromJson(Map<String, dynamic> json) => Partner(
    id: json['id'],
    name: json['name'],
    coreType: json['core_type'],
    relationshipOrigin: json['relationship_origin'],
    voiceType: json['voice_type'] ?? 'default',
    affection: Affection.fromJson(json['affection']),
    moments: (json['moments'] as List?)?.map((e) => Moment.fromJson(e)).toList() ?? [],
  );
}
```

### 18.3 Affection模型

```dart
class Affection {
  final int level;
  final int score;
  final int trustScore;
  final int attractionScore;
  final int rapportScore;
  
  Affection({
    this.level = 1,
    this.score = 0,
    this.trustScore = 0,
    this.attractionScore = 0,
    this.rapportScore = 0,
  });
  
  factory Affection.fromJson(Map<String, dynamic> json) => Affection(
    level: json['level'] ?? 1,
    score: json['score'] ?? 0,
    trustScore: json['trust_score'] ?? 0,
    attractionScore: json['attraction_score'] ?? 0,
    rapportScore: json['rapport_score'] ?? 0,
  );
  
  String get levelName {
    switch (level) {
      case 1: return '初识';
      case 2: return '熟络';
      case 3: return '知己';
      case 4: return '依赖';
      case 5: return '羁绊';
      default: return '初识';
    }
  }
}
```

### 18.4 Scene模型

```dart
class Scene {
  final int id;
  final String name;
  final int stage;
  final int difficulty;
  final int estimatedTime;
  final String description;
  final String background;
  final bool isUnlocked;
  final List<String> teachingPoints;
  final String goodExample;
  final String badExample;
  final List<DialogueRound> dialogueFlow;
  
  Scene({
    required this.id,
    required this.name,
    required this.stage,
    required this.difficulty,
    required this.estimatedTime,
    required this.description,
    required this.background,
    this.isUnlocked = true,
    this.teachingPoints = const [],
    this.goodExample = '',
    this.badExample = '',
    this.dialogueFlow = const [],
  });
  
  factory Scene.fromJson(Map<String, dynamic> json) => Scene(
    id: json['id'],
    name: json['scene_name'],
    stage: json['stage'],
    difficulty: json['difficulty'] ?? 1,
    estimatedTime: json['estimated_time'] ?? 10,
    description: json['description'] ?? '',
    background: json['background'] ?? '',
    isUnlocked: json['is_unlocked'] ?? true,
    teachingPoints: (json['teaching_points'] as List?)?.cast<String>() ?? [],
    goodExample: json['good_example'] ?? '',
    badExample: json['bad_example'] ?? '',
    dialogueFlow: (json['dialogue_flow'] as List?)?.map((e) => DialogueRound.fromJson(e)).toList() ?? [],
  );
}

class DialogueRound {
  final int round;
  final String aiLine;
  final List<DialogueOption> options;
  
  DialogueRound({
    required this.round,
    required this.aiLine,
    required this.options,
  });
  
  factory DialogueRound.fromJson(Map<String, dynamic> json) => DialogueRound(
    round: json['round'],
    aiLine: json['ai_line'],
    options: (json['options'] as List).map((e) => DialogueOption.fromJson(e)).toList(),
  );
}

class DialogueOption {
  final String id;
  final String content;
  final String quality;
  final int affectionChange;
  final String dimension;
  final String feedback;
  
  DialogueOption({
    required this.id,
    required this.content,
    required this.quality,
    required this.affectionChange,
    required this.dimension,
    required this.feedback,
  });
  
  factory DialogueOption.fromJson(Map<String, dynamic> json) => DialogueOption(
    id: json['id'] ?? 'opt_${json['round']}_${json['content'].hashCode}',
    content: json['content'],
    quality: json['quality'],
    affectionChange: json['affection_change'],
    dimension: json['dimension'],
    feedback: json['feedback'],
  );
}
```

### 18.5 TrainingResult模型

```dart
class TrainingResult {
  final int sceneId;
  final int score;
  final Map<String, int> dimensions;
  final String feedback;
  final int affectionChange;
  final int learningCardId;
  final int duration;
  
  TrainingResult({
    required this.sceneId,
    required this.score,
    required this.dimensions,
    required this.feedback,
    required this.affectionChange,
    required this.learningCardId,
    required this.duration,
  });
  
  factory TrainingResult.fromJson(Map<String, dynamic> json) => TrainingResult(
    sceneId: json['scene_id'],
    score: json['score'],
    dimensions: Map<String, int>.from(json['dimensions'] ?? {}),
    feedback: json['feedback'],
    affectionChange: json['affection_change'],
    learningCardId: json['learning_card_id'],
    duration: json['duration'],
  );
}
```

### 18.6 LearningCard模型

```dart
class LearningCard {
  final int id;
  final String category;
  final String title;
  final String errorAnalysis;
  final String correctApproach;
  final String scriptTemplate;
  final bool isCollected;
  final int sceneId;
  
  LearningCard({
    required this.id,
    required this.category,
    required this.title,
    required this.errorAnalysis,
    required this.correctApproach,
    required this.scriptTemplate,
    this.isCollected = false,
    this.sceneId = 0,
  });
  
  factory LearningCard.fromJson(Map<String, dynamic> json) => LearningCard(
    id: json['id'],
    category: json['category'],
    title: json['title'],
    errorAnalysis: json['error_analysis'],
    correctApproach: json['correct_approach'],
    scriptTemplate: json['script_template'],
    isCollected: json['is_collected'] ?? false,
    sceneId: json['scene_id'] ?? 0,
  );
}
```

### 18.7 Moment模型

```dart
class Moment {
  final int id;
  final String content;
  final int templateId;
  final int likesCount;
  final List<Comment> comments;
  final DateTime createdAt;
  
  Moment({
    required this.id,
    required this.content,
    required this.templateId,
    this.likesCount = 0,
    this.comments = const [],
    required this.createdAt,
  });
  
  factory Moment.fromJson(Map<String, dynamic> json) => Moment(
    id: json['id'],
    content: json['content'],
    templateId: json['template_id'],
    likesCount: json['likes_count'] ?? 0,
    comments: (json['comments'] as List?)?.map((e) => Comment.fromJson(e)).toList() ?? [],
    createdAt: DateTime.parse(json['created_at']),
  );
}

class Comment {
  final String content;
  final bool isAi;
  final DateTime createdAt;
  
  Comment({
    required this.content,
    this.isAi = false,
    required this.createdAt,
  });
  
  factory Comment.fromJson(Map<String, dynamic> json) => Comment(
    content: json['content'],
    isAi: json['is_ai'] ?? false,
    createdAt: DateTime.parse(json['created_at']),
  );
}
```

### 18.8 GrowthData模型

```dart
class GrowthData {
  final RadarData radar;
  final List<TrendPoint> trend;
  
  GrowthData({
    required this.radar,
    required this.trend,
  });
  
  factory GrowthData.fromJson(Map<String, dynamic> json) => GrowthData(
    radar: RadarData.fromJson(json['radar']),
    trend: (json['trend'] as List).map((e) => TrendPoint.fromJson(e)).toList(),
  );
}

class RadarData {
  final List<String> dimensions;
  final List<int> scores;
  final int total;
  
  RadarData({
    required this.dimensions,
    required this.scores,
    required this.total,
  });
  
  factory RadarData.fromJson(Map<String, dynamic> json) => RadarData(
    dimensions: List<String>.from(json['dimensions']),
    scores: List<int>.from(json['scores']),
    total: json['total'],
  );
}

class TrendPoint {
  final String date;
  final int? score;
  final int count;
  
  TrendPoint({
    required this.date,
    this.score,
    this.count = 0,
  });
  
  factory TrendPoint.fromJson(Map<String, dynamic> json) => TrendPoint(
    date: json['date'],
    score: json['score'],
    count: json['count'] ?? 0,
  );
}
```

### 18.9 AttachmentAnalysis模型

```dart
class AttachmentAnalysis {
  final String style;
  final Map<String, int> scores;
  final List<String> suggestions;
  
  AttachmentAnalysis({
    required this.style,
    required this.scores,
    required this.suggestions,
  });
  
  factory AttachmentAnalysis.fromJson(Map<String, dynamic> json) => AttachmentAnalysis(
    style: json['style'],
    scores: Map<String, int>.from(json['scores']),
    suggestions: List<String>.from(json['suggestions']),
  );
  
  String get styleName {
    switch (style) {
      case 'secure': return '安全型';
      case 'anxious': return '焦虑型';
      case 'avoidant': return '回避型';
      case 'fearful': return '恐惧型';
      default: return '未知';
    }
  }
}
```

### 18.10 Milestone模型

```dart
class Milestone {
  final int id;
  final String title;
  final DateTime date;
  final String icon;
  
  Milestone({
    required this.id,
    required this.title,
    required this.date,
    required this.icon,
  });
  
  factory Milestone.fromJson(Map<String, dynamic> json) => Milestone(
    id: json['id'],
    title: json['title'],
    date: DateTime.parse(json['date']),
    icon: json['icon'],
  );
}
```

### 18.11 EmotionDiary模型

```dart
class EmotionDiary {
  final int id;
  final String content;
  final int emotionScore;
  final String insights;
  final DateTime createdAt;
  
  EmotionDiary({
    required this.id,
    required this.content,
    required this.emotionScore,
    this.insights = '',
    required this.createdAt,
  });
  
  factory EmotionDiary.fromJson(Map<String, dynamic> json) => EmotionDiary(
    id: json['id'],
    content: json['content'],
    emotionScore: json['emotion_score'],
    insights: json['insights'] ?? '',
    createdAt: DateTime.parse(json['created_at']),
  );
}
```

### 18.12 WeeklyReport模型

```dart
class WeeklyReport {
  final String weekStart;
  final int totalTrainings;
  final int averageScore;
  final Map<String, String> abilityChanges;
  final String partnerMessage;
  final List<String> recommendations;
  
  WeeklyReport({
    required this.weekStart,
    required this.totalTrainings,
    required this.averageScore,
    required this.abilityChanges,
    required this.partnerMessage,
    required this.recommendations,
  });
  
  factory WeeklyReport.fromJson(Map<String, dynamic> json) => WeeklyReport(
    weekStart: json['week_start'],
    totalTrainings: json['total_trainings'],
    averageScore: json['average_score'],
    abilityChanges: Map<String, String>.from(json['ability_changes'] ?? {}),
    partnerMessage: json['partner_message'],
    recommendations: List<String>.from(json['recommendations'] ?? []),
  );
}
```

### 18.13 CheckInRecord模型

```dart
class CheckInRecord {
  final String date;
  final int streak;
  final int rewardPoints;
  
  CheckInRecord({
    required this.date,
    required this.streak,
    required this.rewardPoints,
  });
  
  factory CheckInRecord.fromJson(Map<String, dynamic> json) => CheckInRecord(
    date: json['date'],
    streak: json['streak'],
    rewardPoints: json['reward_points'],
  );
}
```

### 18.14 GiftItem模型

```dart
class GiftItem {
  final int id;
  final String name;
  final int tier;
  final int pricePoints;
  final int affectionMin;
  final int affectionMax;
  final String imageUrl;
  final int membershipRequired;
  
  GiftItem({
    required this.id,
    required this.name,
    required this.tier,
    required this.pricePoints,
    required this.affectionMin,
    required this.affectionMax,
    required this.imageUrl,
    this.membershipRequired = 0,
  });
  
  factory GiftItem.fromJson(Map<String, dynamic> json) => GiftItem(
    id: json['id'],
    name: json['name'],
    tier: json['tier'],
    pricePoints: json['price_points'],
    affectionMin: json['affection_min'],
    affectionMax: json['affection_max'],
    imageUrl: json['image_url'],
    membershipRequired: json['membership_required'] ?? 0,
  );
}
```

### 18.15 Talent模型

```dart
class Talent {
  final String type;
  final String name;
  final String description;
  final int cooldown;
  final String style;
  
  Talent({
    required this.type,
    required this.name,
    required this.description,
    this.cooldown = 0,
    this.style = '',
  });
  
  factory Talent.fromJson(Map<String, dynamic> json) => Talent(
    type: json['type'],
    name: json['name'],
    description: json['description'],
    cooldown: json['cooldown'] ?? 0,
    style: json['style'] ?? '',
  );
}
```

### 18.16 TalentResult模型

```dart
class TalentResult {
  final String content;
  final String? audioUrl;
  final String style;
  
  TalentResult({
    required this.content,
    this.audioUrl,
    this.style = '',
  });
  
  factory TalentResult.fromJson(Map<String, dynamic> json) => TalentResult(
    content: json['content'],
    audioUrl: json['audio_url'],
    style: json['style'] ?? '',
  );
}
```

### 18.17 CallRecord模型

```dart
class CallRecord {
  final int id;
  final int duration;
  final int affectionChange;
  final DateTime createdAt;
  
  CallRecord({
    required this.id,
    required this.duration,
    required this.affectionChange,
    required this.createdAt,
  });
  
  factory CallRecord.fromJson(Map<String, dynamic> json) => CallRecord(
    id: json['id'],
    duration: json['duration'],
    affectionChange: json['affection_change'],
    createdAt: DateTime.parse(json['created_at']),
  );
}
```

### 18.18 CallPermission模型

```dart
class CallPermission {
  final bool canCall;
  final int remainingToday;
  final int maxDuration;
  final String? reason;
  
  CallPermission({
    required this.canCall,
    required this.remainingToday,
    required this.maxDuration,
    this.reason,
  });
  
  factory CallPermission.fromJson(Map<String, dynamic> json) => CallPermission(
    canCall: json['can_call'],
    remainingToday: json['remaining_today'],
    maxDuration: json['max_duration'],
    reason: json['reason'],
  );
}
```

### 18.19 NightlyGreeting模型

```dart
class NightlyGreeting {
  final String content;
  final String audioUrl;
  final DateTime createdAt;
  
  NightlyGreeting({
    required this.content,
    required this.audioUrl,
    required this.createdAt,
  });
  
  factory NightlyGreeting.fromJson(Map<String, dynamic> json) => NightlyGreeting(
    content: json['content'],
    audioUrl: json['audio_url'],
    createdAt: DateTime.parse(json['created_at']),
  );
}
```

### 18.20 CBTRecord模型

```dart
class CBTRecord {
  final String id;
  final String situation;
  final String thought;
  final List<String> emotions;
  final int emotionIntensityBefore;
  final String evidenceFor;
  final String evidenceAgainst;
  final String alternativeThought;
  final int emotionIntensityAfter;
  final List<CBTFinding> distortions;
  final String status;
  final DateTime createdAt;

  CBTRecord({
    required this.id,
    required this.situation,
    required this.thought,
    required this.emotions,
    required this.emotionIntensityBefore,
    required this.evidenceFor,
    required this.evidenceAgainst,
    required this.alternativeThought,
    required this.emotionIntensityAfter,
    required this.distortions,
    this.status = 'draft',
    required this.createdAt,
  });

  factory CBTRecord.fromJson(Map<String, dynamic> json) => CBTRecord(
    id: json['id'],
    situation: json['situation'],
    thought: json['thought'],
    emotions: List<String>.from(json['emotions']),
    emotionIntensityBefore: json['emotion_intensity_before'],
    evidenceFor: json['evidence_for'],
    evidenceAgainst: json['evidence_against'],
    alternativeThought: json['alternative_thought'],
    emotionIntensityAfter: json['emotion_intensity_after'],
    distortions: (json['detected_distortions'] as List).map((e) => CBTFinding.fromJson(e)).toList(),
    status: json['status'],
    createdAt: DateTime.parse(json['created_at']),
  );
}

class CBTFinding {
  final String keyword;
  final String category;
  final String guidance;
  final String severity;

  CBTFinding({
    required this.keyword,
    required this.category,
    required this.guidance,
    required this.severity,
  });

  factory CBTFinding.fromJson(Map<String, dynamic> json) => CBTFinding(
    keyword: json['keyword'],
    category: json['category'],
    guidance: json['guidance'],
    severity: json['severity'],
  );
}
```

### 18.21 NVCGuide模型

```dart
class NVCGuide {
  final String id;
  final String observation;
  final String feeling;
  final String need;
  final String request;
  final String originalText;
  final String revisedText;
  final String status;
  final NVCCorrection? correction;
  final DateTime createdAt;

  NVCGuide({
    required this.id,
    required this.observation,
    required this.feeling,
    required this.need,
    required this.request,
    required this.originalText,
    required this.revisedText,
    this.status = 'draft',
    this.correction,
    required this.createdAt,
  });

  factory NVCGuide.fromJson(Map<String, dynamic> json) => NVCGuide(
    id: json['id'],
    observation: json['observation'],
    feeling: json['feeling'],
    need: json['need'],
    request: json['request'],
    originalText: json['original_text'],
    revisedText: json['revised_text'],
    status: json['status'],
    correction: json['correction'] != null ? NVCCorrection.fromJson(json['correction']) : null,
    createdAt: DateTime.parse(json['created_at']),
  );
}

class NVCCorrection {
  final String type;
  final String message;
  final String suggestion;

  NVCCorrection({
    required this.type,
    required this.message,
    required this.suggestion,
  });

  factory NVCCorrection.fromJson(Map<String, dynamic> json) => NVCCorrection(
    type: json['type'],
    message: json['message'],
    suggestion: json['suggestion'],
  );
}
```

### 18.22 EmotionData模型

```dart
class EmotionData {
  final String primary;
  final List<String> secondary;
  final double intensity;
  final String polarity;
  final double confidence;
  final String triggerMode;
  final String recommendedResponse;
  final AnalysisDetail analysisDetail;

  EmotionData({
    required this.primary,
    required this.secondary,
    required this.intensity,
    required this.polarity,
    required this.confidence,
    required this.triggerMode,
    required this.recommendedResponse,
    required this.analysisDetail,
  });

  factory EmotionData.fromJson(Map<String, dynamic> json) => EmotionData(
    primary: json['primary'],
    secondary: List<String>.from(json['secondary']),
    intensity: json['intensity'].toDouble(),
    polarity: json['polarity'],
    confidence: json['confidence'].toDouble(),
    triggerMode: json['trigger_mode'],
    recommendedResponse: json['recommended_response'],
    analysisDetail: AnalysisDetail.fromJson(json['analysis_detail']),
  );
}

class AnalysisDetail {
  final double textContribution;
  final double behaviorContribution;
  final double voiceContribution;

  AnalysisDetail({
    required this.textContribution,
    required this.behaviorContribution,
    required this.voiceContribution,
  });

  factory AnalysisDetail.fromJson(Map<String, dynamic> json) => AnalysisDetail(
    textContribution: json['text_contribution'].toDouble(),
    behaviorContribution: json['behavior_contribution'].toDouble(),
    voiceContribution: json['voice_contribution'].toDouble(),
  );
}
```

### 18.23 EmotionHistory模型

```dart
class EmotionHistory {
  final String date;
  final String primaryEmotion;
  final double intensity;
  final String sourceType;

  EmotionHistory({
    required this.date,
    required this.primaryEmotion,
    required this.intensity,
    required this.sourceType,
  });

  factory EmotionHistory.fromJson(Map<String, dynamic> json) => EmotionHistory(
    date: json['date'],
    primaryEmotion: json['primary_emotion'],
    intensity: json['intensity'].toDouble(),
    sourceType: json['source_type'],
  );
}
```

### 18.24 BehaviorTrigger模型

```dart
class BehaviorTrigger {
  final String behavior;
  final String detail;

  BehaviorTrigger({
    required this.behavior,
    required this.detail,
  });

  factory BehaviorTrigger.fromJson(Map<String, dynamic> json) => BehaviorTrigger(
    behavior: json['behavior'],
    detail: json['detail'],
  );
}
```

---

## 21. CBT思维记录表页面

### 21.1 页面定位

CBT思维记录表是认知行为疗法的核心工具，帮助用户识别和挑战自动化负面思维。当用户在模拟训练或日常对话中出现绝对化词语、灾难化词语、自我否定时，AI会建议用户填写思维记录表。

### 22.2 触发入口

| 触发方式 | 入口位置 | 触发条件 |
|---------|---------|---------|
| 实时对话弹出 | 对话页 | 检测到负面思维关键词 |
| 训练报告页 | 训练报告底部 | 训练中出现3次以上负面思维 |
| 成长页入口 | 成长页→学习工具 | 用户主动进入 |

### 19.3 页面布局

```
┌────────────────────────────────┐
│ 📝 CBT思维记录表               │ 标题
├────────────────────────────────┤
│ 第一步：情境                    │
│ [__________________________]   │ 输入框
│ "发生了什么具体事情？"          │ 提示文字
├────────────────────────────────┤
│ 第二步：自动思维                │
│ [__________________________]   │ 输入框
│ "当时你在想什么？"             │ 提示文字
│ 🔍 检测到认知扭曲：绝对化思维   │ AI检测提示
├────────────────────────────────┤
│ 第三步：情绪                    │
│ 情绪选择：[]焦虑 []难过 []愤怒  │ 多选框
│ 情绪强度：[████████░░] 70%     │ 滑块
├────────────────────────────────┤
│ 第四步：证据                    │
│ ✅ 支持想法的证据：             │
│ [__________________________]   │ 输入框
│ ❌ 反对想法的证据：             │
│ [__________________________]   │ 输入框
├────────────────────────────────┤
│ 第五步：替代思维                │
│ [__________________________]   │ 输入框
│ 💡 AI建议："试试用具体描述..."  │ AI建议
├────────────────────────────────┤
│ 情绪变化对比                    │
│ 之前：70% → 之后：40% ↓30%    │ 可视化对比
├────────────────────────────────┤
│ [保存记录] [重新开始] [返回]    │ 操作按钮
└────────────────────────────────┘
```

### 19.4 交互逻辑

| 操作 | 行为 |
|------|------|
| 输入自动思维 | AI实时检测认知扭曲并给出提示 |
| 滑动情绪强度 | 实时显示强度百分比 |
| 点击保存记录 | 调用API保存，返回列表页 |
| 点击重新开始 | 清空所有输入 |

### 19.5 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| CBTFormPage | pages/cbt/cbt_form_page.dart | 主表单页面 |
| CBTHistoryPage | pages/cbt/cbt_history_page.dart | 历史记录列表 |
| CBTSection | pages/cbt/components/cbt_section.dart | 步骤区块组件 |
| CognitionDetector | pages/cbt/components/cognition_detector.dart | 认知扭曲检测提示 |
| EmotionSlider | pages/cbt/components/emotion_slider.dart | 情绪强度滑块 |

### 19.6 路由配置

```dart
GoRoute(
  path: '/cbt/form',
  name: 'cbt_form',
  builder: (context, state) => const CBTFormPage(),
),
GoRoute(
  path: '/cbt/history',
  name: 'cbt_history',
  builder: (context, state) => const CBTHistoryPage(),
),
GoRoute(
  path: '/cbt/detail/:id',
  name: 'cbt_detail',
  builder: (context, state) => CBTDetailPage(id: state.pathParameters['id']!),
),
```

---

## 22. NVC可视化引导页面

### 22.1 页面定位

非暴力沟通（NVC）可视化引导帮助用户学习和实践NVC四步法：观察→感受→需要→请求。适用于冲突场景和日常沟通训练。

### 22.2 触发入口

| 触发方式 | 入口位置 | 触发条件 |
|---------|---------|---------|
| 场景训练 | 场景5"被朋友误解" | NVC教学点场景 |
| 训练报告 | 训练报告页 | 涉及冲突处理场景 |
| 成长页入口 | 成长页→学习工具 | 用户主动进入 |

### 20.3 页面布局

```
┌────────────────────────────────┐
│ 🗣️ NVC非暴力沟通引导            │ 标题
├────────────────────────────────┤
│ 你的原始表达：                  │
│ [__________________________]   │ 输入框
│ "你总是不理我！"               │ 示例文字
├────────────────────────────────┤
│ NVC四步法                      │
│ ┌───────┐ ┌───────┐           │
│ │ 观察  │ │ 感受  │           │
│ │ 你迟  │ │ 我担  │           │
│ │ 到30  │ │ 心    │           │
│ │ 分钟  │ │       │           │
│ └───┬───┘ └───┬───┘           │
│     │         │                │
│ ┌───▼───┐ ┌───▼───┐           │
│ │ 需要  │ │ 请求  │           │
│ │ 安全  │ │ 提前  │           │
│ │ 感    │ │ 告知  │           │
│ └───────┘ └───────┘           │
├────────────────────────────────┤
│ ✅ 修正后的表达：               │
│ "当你迟到30分钟，我感到担心，  │
│ 因为我需要安全感，你愿意下次   │
│ 提前告诉我吗？"                │
├────────────────────────────────┤
│ ❌ 常见错误：                  │
│ - "你总是..." → 使用绝对化词语 │
│ - 混淆感受与想法               │
├────────────────────────────────┤
│ [保存记录] [重新练习] [返回]    │ 操作按钮
└────────────────────────────────┘
```

### 20.4 交互逻辑

| 操作 | 行为 |
|------|------|
| 输入原始表达 | AI实时解析并拆分四步法 |
| 填写观察 | AI验证是否客观事实 |
| 填写感受 | AI验证是否真实感受 |
| 填写需要 | AI匹配需求词汇 |
| 填写请求 | AI验证是否具体可行 |
| 点击保存记录 | 调用API保存，返回列表页 |

### 20.5 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| NVCGuidePage | pages/nvc/nvc_guide_page.dart | 主引导页面 |
| NVCHistoryPage | pages/nvc/nvc_history_page.dart | 历史记录列表 |
| NVCStepCard | pages/nvc/components/nvc_step_card.dart | 四步卡片组件 |
| NVCCorrection | pages/nvc/components/nvc_correction.dart | 错误修正提示 |
| NVCVisualizer | pages/nvc/components/nvc_visualizer.dart | 可视化流程图 |

### 20.6 路由配置

```dart
GoRoute(
  path: '/nvc/guide',
  name: 'nvc_guide',
  builder: (context, state) => const NVCGuidePage(),
),
GoRoute(
  path: '/nvc/history',
  name: 'nvc_history',
  builder: (context, state) => const NVCHistoryPage(),
),
```

---

## 23. 情绪识别服务组件

### 23.1 功能定位

情绪识别服务通过多模态融合（文本+语音+行为）分析用户情绪状态，决定触发模式（树洞/建议/混合）。

### 23.2 成本优化策略

| 用户等级 | 文本分析 | 语音分析 | 行为分析 | 融合决策 |
|---------|---------|---------|---------|---------|
| 体验版 | 关键词匹配 | ❌ | ✅ 基础 | ✅ |
| 基础会员 | 关键词+BERT | ❌ | ✅ 完整 | ✅ |
| 标准会员 | 关键词+BERT | ✅ | ✅ 完整 | ✅ |
| 尊享会员 | 关键词+BERT | ✅ | ✅ 完整 | ✅ |

### 21.3 情绪状态机

```
中立态(平静) ──检测到正面情绪──▶ 积极态(开心)
    │                                   │
    │ 检测到负面情绪                    │
    ▼                                   ▼
消极态(难过) ──强度持续上升──▶ 高消极态(焦虑)
    │                                   │
    │ 得到安慰/情绪缓解                   │ 触发树洞模式
    ▼                                   ▼
恢复态(渐好)                        树洞态(共情中)
```

### 21.4 决策规则

| 条件 | 触发模式 |
|------|---------|
| 情绪强度 > 0.7 AND 无具体问题 | 树洞模式 |
| 情绪强度 < 0.4 AND 有具体问题 | 建议模式 |
| 情绪强度 > 0.6 AND 有具体问题 | 混合模式（先树洞后建议） |
| 情绪强度 > 0.8 | 强制树洞模式 |

### 21.5 行为特征分析维度

| 行为 | 分析维度 | 推断情绪 | 触发阈值 |
|------|---------|---------|---------|
| 登录时间 | 深夜登录（>23:00） | 焦虑/失眠 | 连续3天 |
| 对话频率 | 短时间内高频发送（>5条/5分钟） | 焦虑/急切 | 单次检测 |
| 对话长度 | 过短回应（<5字） | 低落/回避 | 连续3条 |
| 训练行为 | 回避挑战性场景（难度>3） | 恐惧/焦虑 | 连续跳过2次 |
| 操作路径 | 频繁返回首页（>5次/分钟） | 困惑/不安 | 单次检测 |

### 21.6 融合决策公式

```
最终情绪强度 = 0.5 × 文本分析 + 0.3 × 语音分析（如有） + 0.2 × 行为分析
```

### 21.7 组件设计

#### EmotionBadge组件

```dart
class EmotionBadge extends StatelessWidget {
  final String emotion;
  final double intensity;
  final String triggerMode;

  const EmotionBadge({
    super.key,
    required this.emotion,
    required this.intensity,
    required this.triggerMode,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
      decoration: BoxDecoration(
        color: _getEmotionColor(),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(
        children: [
          Text(emotion, style: const TextStyle(color: Colors.white, fontSize: 14)),
          const SizedBox(width: 8),
          Container(
            width: 20,
            height: 20,
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: Center(
              child: Text(
                '${(intensity * 100).round()}%',
                style: const TextStyle(fontSize: 10, color: Colors.black),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Color _getEmotionColor() {
    switch (emotion) {
      case '焦虑': return Colors.orange;
      case '难过': return Colors.blue;
      case '愤怒': return Colors.red;
      case '恐惧': return Colors.purple;
      case '开心': return Colors.green;
      case '平静': return Colors.teal;
      default: return Colors.grey;
    }
  }
}
```

#### BehaviorAnalyzer组件

```dart
class BehaviorAnalyzer extends StatelessWidget {
  final List<BehaviorTrigger> triggers;
  final double intensity;

  const BehaviorAnalyzer({
    super.key,
    required this.triggers,
    required this.intensity,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        boxShadow: const [BoxShadow(color: Colors.black12, blurRadius: 4)],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('行为特征分析', style: TextStyle(fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ...triggers.map((trigger) => ListTile(
            leading: const Icon(Icons.bolt, color: Colors.orange),
            title: Text(trigger.behavior),
            subtitle: Text(trigger.detail),
          )),
          const SizedBox(height: 12),
          const Text('推断情绪强度'),
          LinearProgressIndicator(value: intensity),
        ],
      ),
    );
  }
}
```

### 21.6 API调用封装

```dart
class EmotionService {
  static Future<EmotionData> analyzeText(String text) async {
    final response = await apiClient.post('/emotion/text', body: {'text': text});
    final data = jsonDecode(response.body);
    return EmotionData.fromJson(data['emotion']);
  }

  static Future<EmotionData> analyzeFusion({
    required String text,
    Map<String, dynamic>? voiceFeatures,
    required Map<String, dynamic> behaviorData,
    Map<String, dynamic>? sessionContext,
  }) async {
    final response = await apiClient.post('/emotion/fusion', body: {
      'text': text,
      'voice_features': voiceFeatures,
      'behavior_data': behaviorData,
      'session_context': sessionContext,
    });
    final data = jsonDecode(response.body);
    return EmotionData.fromJson(data['emotion']);
  }

  static Future<List<EmotionHistory>> getHistory(int days) async {
    final response = await apiClient.get('/emotion/history?days=$days');
    final data = jsonDecode(response.body);
    return (data['history'] as List).map((e) => EmotionHistory.fromJson(e)).toList();
  }
}
```

---

## 24. 情绪历史页面

### 24.1 页面定位

情绪历史页面展示用户近期情绪变化趋势，帮助用户了解自己的情绪波动规律，辅助自我觉察和情绪管理。

### 24.2 页面布局

```
┌────────────────────────────────┐
│ 📊 情绪变化趋势                  │ 标题
│ 近7天情绪变化                    │ 副标题
├────────────────────────────────┤
│ [折线图：日期→情绪强度]          │ 趋势图表
│ 焦虑 ■ 难过 □ 开心 ▲ 平静 ●     │ 图例
├────────────────────────────────┤
│ 今日情绪：焦虑 78%              │ 当前状态
│ 触发模式：混合模式               │
├────────────────────────────────┤
│ 📋 情绪记录列表                  │
│ ┌────────────────────────────┐ │
│ │ 07-06 焦虑 强度:0.78        │ │
│ │ 来源:文本+行为               │ │
│ └────────────────────────────┘ │
│ ┌────────────────────────────┐ │
│ │ 07-05 平静 强度:0.32        │ │
│ │ 来源:文本                    │ │
│ └────────────────────────────┘ │
├────────────────────────────────┤
│ [查看全部] [生成报告]            │ 操作按钮
└────────────────────────────────┘
```

### 24.3 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| EmotionHistoryPage | pages/emotion/emotion_history_page.dart | 情绪历史主页面 |
| EmotionTrendChart | pages/emotion/components/emotion_trend_chart.dart | 情绪趋势折线图 |
| EmotionRecordCard | pages/emotion/components/emotion_record_card.dart | 情绪记录卡片 |
| EmotionStatusBadge | pages/emotion/components/emotion_status_badge.dart | 当前情绪状态徽章 |

### 24.4 路由配置

```dart
GoRoute(
  path: '/emotion/history',
  name: 'emotion_history',
  builder: (context, state) => const EmotionHistoryPage(),
),
GoRoute(
  path: '/emotion/detail/:id',
  name: 'emotion_detail',
  builder: (context, state) => EmotionDetailPage(id: state.pathParameters['id']!),
),
```

### 24.5 数据交互

| 操作 | API调用 | 说明 |
|------|---------|------|
| 页面加载 | GET /emotion/history?days=7 | 获取近7天情绪记录 |
| 切换时间范围 | GET /emotion/history?days=30 | 获取近30天情绪记录 |
| 点击记录 | GET /emotion/detail/:id | 获取情绪分析详情 |
| 生成报告 | POST /growth/weekly | 生成情绪分析周报 |

---

## 25. 晚安计划

### 25.1 页面布局

```
┌────────────────────────────────┐
│ 🌙 晚安时刻                    │ 标题
│ 当前时间：22:30                │
├────────────────────────────────┤
│ [数字人形象]                   │ 温馨姿态
│ "今天辛苦了，早点休息哦"       │
├────────────────────────────────┤
│ 🎵 晚安语音                    │ 播放区域
│ [▶ 播放] [⏸ 暂停] [⏹ 停止]   │
│ 时长：03:45                   │
├────────────────────────────────┤
│ 📖 晚安故事                   │ 故事卡片
│ "想听一个关于星星的故事吗？"   │
│ [播放故事]                    │
├────────────────────────────────┤
│ 💤 助眠音乐                   │ 音乐列表
│ ├─ 雨声 (30min)               │
│ ├─ 海浪 (45min)               │
│ ├─ 森林 (60min)               │
│ └─ 白噪音 (90min)             │
├────────────────────────────────┤
│ 🌌 星空背景                   │ 动态背景
├────────────────────────────────┤
│ [🌙 明天见]                   │ 关闭按钮
└────────────────────────────────┘
```

### 25.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| NightlyPage | pages/nightly/nightly_page.dart | 晚安计划主页面 |
| NightlyVoicePlayer | pages/nightly/components/voice_player.dart | 语音播放器 |
| StoryCard | pages/nightly/components/story_card.dart | 晚安故事卡片 |
| SleepMusicList | pages/nightly/components/sleep_music_list.dart | 助眠音乐列表 |
| StarryBackground | pages/nightly/components/starry_background.dart | 星空动态背景 |

### 25.3 语音内容生成策略

| 时段 | 内容类型 | 示例 |
|------|---------|------|
| 20:00-22:00 | 日常关心 | "今天辛苦了，早点休息哦。晚安，做个好梦～" |
| 22:00-23:30 | 温馨陪伴 | "很晚了哦，注意身体，晚安～" |
| 23:30-01:00 | 催睡提醒 | "已经很晚啦，快点睡吧，晚安～" |

### 25.4 路由配置

```dart
GoRoute(
  path: '/nightly',
  name: 'nightly',
  builder: (context, state) => const NightlyPage(),
),
```

### 25.5 API调用

```dart
Future<NightlyGreeting> getNightlyGreeting() async {
  final response = await apiClient.get('/nightly/greeting');
  final data = jsonDecode(response.body);
  return NightlyGreeting.fromJson(data);
}

Future<void> recordNightly(Listened listened) async {
  await apiClient.post('/nightly/record', body: listened.toJson());
}
```

---

## 26. 情绪日记

### 26.1 页面布局

```
┌────────────────────────────────┐
│ 📔 情绪日记                    │ 标题
│ 2026年7月6日 星期日           │ 日期
├────────────────────────────────┤
│ 😊 今日心情：[选择情绪]        │ 情绪选择
│ 开心 / 平静 / 焦虑 / 难过 / 愤怒 │
├────────────────────────────────┤
│ 📝 今日记录                    │ 文本输入
│ [__________________________]   │
│ [__________________________]   │
│ [__________________________]   │
│ [__________________________]   │
│ 字数：45/500                   │ 字数限制
├────────────────────────────────┤
│ 💡 AI分析                      │ AI生成
│ "今天你提到工作压力较大，..."   │
├────────────────────────────────┤
│ [保存日记] [生成报告]           │ 操作按钮
└────────────────────────────────┘
```

### 26.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| EmotionDiaryPage | pages/growth/emotion_diary_page.dart | 情绪日记主页面 |
| EmotionSelector | pages/growth/components/emotion_selector.dart | 情绪选择器 |
| DiaryEditor | pages/growth/components/diary_editor.dart | 日记编辑器 |
| AiAnalysis | pages/growth/components/ai_analysis.dart | AI分析展示 |

### 26.3 数据模型

```dart
class EmotionDiary {
  final int id;
  final String content;
  final String emotion;
  final int emotionScore;
  final String insights;
  final DateTime createdAt;

  EmotionDiary({
    required this.id,
    required this.content,
    required this.emotion,
    required this.emotionScore,
    this.insights = '',
    required this.createdAt,
  });

  factory EmotionDiary.fromJson(Map<String, dynamic> json) => EmotionDiary(
    id: json['id'],
    content: json['content'],
    emotion: json['emotion'],
    emotionScore: json['emotion_score'],
    insights: json['insights'] ?? '',
    createdAt: DateTime.parse(json['created_at']),
  );

  Map<String, dynamic> toJson() => {
    'content': content,
    'emotion': emotion,
    'emotion_score': emotionScore,
  };
}
```

### 26.4 路由配置

```dart
GoRoute(
  path: '/growth/diary',
  name: 'emotion_diary',
  builder: (context, state) => const EmotionDiaryPage(),
),
GoRoute(
  path: '/growth/diary/:id',
  name: 'diary_detail',
  builder: (context, state) => DiaryDetailPage(id: state.pathParameters['id']!),
),
```

---

## 27. 每周社交报告

### 27.1 页面布局

```
┌────────────────────────────────┐
│ 📊 本周社交报告                │ 标题
│ 2026-07-01 ~ 2026-07-07       │ 时间范围
├────────────────────────────────┤
│ 🎯 总体表现                    │
│ 综合得分：72分                 │
│ 较上周：+5分 ↑                 │
├────────────────────────────────┤
│ 📈 能力变化                    │ 雷达图/柱状图
│ 沟通力：68 → 75 (+7)           │
│ 表达力：70 → 73 (+3)           │
│ 共情力：75 → 78 (+3)           │
│ 情绪控制：65 → 70 (+5)         │
│ 应变力：72 → 74 (+2)           │
├────────────────────────────────┤
│ 📝 训练统计                    │
│ 本周训练：8次                  │
│ 平均得分：78分                 │
│ 完成场景：咖啡厅破冰、初次约会  │
├────────────────────────────────┤
│ 💡 改进建议                    │
│ "建议多练习开放式问题"         │
│ "在倾听方面表现出色"           │
├────────────────────────────────┤
│ 🎁 奖励                        │
│ +100 积分                      │
│ +1 学习卡片                    │
└────────────────────────────────┘
```

### 27.2 功能组件

| 组件 | 文件路径 | 说明 |
|------|---------|------|
| WeeklyReportPage | pages/growth/weekly_report_page.dart | 每周报告主页面 |
| AbilityChart | pages/growth/components/ability_chart.dart | 能力变化图表 |
| TrainingStats | pages/growth/components/training_stats.dart | 训练统计 |
| ImprovementSuggestions | pages/growth/components/suggestions.dart | 改进建议 |

### 27.3 数据模型

```dart
class WeeklyReport {
  final String weekStart;
  final String weekEnd;
  final int totalScore;
  final int scoreChange;
  final Map<String, AbilityChange> abilities;
  final int trainingCount;
  final int averageScore;
  final List<String> completedScenes;
  final List<String> suggestions;
  final Map<String, int> rewards;

  WeeklyReport({
    required this.weekStart,
    required this.weekEnd,
    required this.totalScore,
    this.scoreChange = 0,
    required this.abilities,
    this.trainingCount = 0,
    this.averageScore = 0,
    this.completedScenes = const [],
    this.suggestions = const [],
    this.rewards = const {},
  });

  factory WeeklyReport.fromJson(Map<String, dynamic> json) => WeeklyReport(
    weekStart: json['week_start'],
    weekEnd: json['week_end'],
    totalScore: json['total_score'],
    scoreChange: json['score_change'] ?? 0,
    abilities: Map<String, dynamic>.from(json['abilities'] ?? {}).map(
      (key, value) => MapEntry(key, AbilityChange.fromJson(value)),
    ),
    trainingCount: json['training_count'] ?? 0,
    averageScore: json['average_score'] ?? 0,
    completedScenes: List<String>.from(json['completed_scenes'] ?? []),
    suggestions: List<String>.from(json['suggestions'] ?? []),
    rewards: Map<String, int>.from(json['rewards'] ?? {}),
  );
}

class AbilityChange {
  final int previous;
  final int current;
  final int change;

  AbilityChange({
    required this.previous,
    required this.current,
    required this.change,
  });

  factory AbilityChange.fromJson(Map<String, dynamic> json) => AbilityChange(
    previous: json['previous'],
    current: json['current'],
    change: json['change'],
  );
}
```

### 27.4 路由配置

```dart
GoRoute(
  path: '/growth/weekly',
  name: 'weekly_report',
  builder: (context, state) => const WeeklyReportPage(),
),
```

---

## 28. 三个模块的联动关系

```
用户输入 → 情绪识别服务 → 判断触发模式
    │
    ├─ 树洞模式 → 伴侣共情倾听 → 情绪缓解
    │
    ├─ 建议模式 → 检测到认知扭曲 → 触发CBT思维记录表
    │
    └─ 混合模式 → 先树洞后建议 → 情绪缓解后 → NVC引导（冲突场景）
```

### 联动触发条件

| 触发模式 | 后续流程 | 适用场景 |
|---------|---------|---------|
| 树洞模式 | 伴侣共情回应，不给出建议 | 用户情绪强度高，需要情感支持 |
| 建议模式 | 检测认知扭曲，引导填写CBT表 | 用户有具体问题，情绪稳定 |
| 混合模式 | 先共情倾听，再引导CBT/NVC | 用户情绪较高且有具体问题 |
| 强制树洞 | 伴侣强制进入共情模式 | 情绪强度>0.8，需优先安抚 |

---

> **文档结束**  
> 版本：v2.2 | 编制日期：2026-07-06
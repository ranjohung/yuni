# 前端API客户端

> 版本：v2.2  
> 适用对象：前端开发团队  
> 技术栈：Flutter 3.x + Dart

---

## 1. API客户端基础配置

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
  
  Future<Response> delete(String path) {
    return http.delete(Uri.parse('$baseUrl$path'), headers: headers);
  }
}
```

---

## 2. WebSocket连接管理

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

## 3. API接口汇总

### 3.1 用户认证

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 注册 | POST | /auth/register | 用户注册 |
| 登录 | POST | /auth/login | 用户登录 |
| 验证码 | POST | /auth/sms/send | 发送验证码 |
| 实名认证 | POST | /auth/realname | 实名认证 |

### 3.2 伴侣管理

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 创建伴侣 | POST | /partner/create | 创建AI伴侣 |
| 获取伴侣 | GET | /partner | 获取伴侣信息 |
| 更新伴侣 | PUT | /partner | 更新伴侣配置 |
| 自定义角色 | POST | /partner/custom | 自定义角色 |

### 3.3 对话服务

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 开始对话 | POST | /chat/start | 开始对话会话 |
| 发送消息 | POST | /chat/message | 发送消息 |
| 对话历史 | GET | /chat/history | 获取对话历史 |

### 3.4 模拟训练

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 场景列表 | GET | /scene/list | 获取场景列表 |
| 开始训练 | POST | /scene/start | 开始场景训练 |
| 训练报告 | GET | /scene/report | 获取训练报告 |

### 3.5 成长系统

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 学习卡片 | GET | /growth/cards | 获取学习卡片 |
| 情绪日记 | POST | /growth/diary | 记录情绪日记 |
| 每周报告 | GET | /growth/weekly | 获取每周报告 |

### 3.6 好感度

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 好感度 | GET | /affection | 获取好感度 |
| 送礼 | POST | /affection/gift | 送礼物 |

### 3.7 晚安计划

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 晚安问候 | GET | /nightly/greeting | 获取晚安问候 |
| 晚安故事 | GET | /nightly/story | 获取晚安故事 |

### 3.8 情绪识别

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 情绪分析 | POST | /emotion/analyze | 分析用户情绪 |
| 情绪历史 | GET | /emotion/history | 获取情绪历史 |

### 3.9 CBT/NVC

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| CBT记录 | POST | /cbt/record | 记录CBT思维 |
| NVC引导 | POST | /nvc/guide | NVC引导对话 |

### 3.10 朋友圈

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 朋友圈列表 | GET | /moments | 获取朋友圈 |
| 点赞 | POST | /moments/like | 点赞朋友圈 |
| 评论 | POST | /moments/comment | 评论朋友圈 |

### 3.11 会员

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 会员状态 | GET | /membership | 获取会员状态 |
| 购买会员 | POST | /membership/buy | 购买会员 |

### 3.12 时空穿梭

| 接口 | 方法 | 路径 | 说明 |
|------|------|------|------|
| 穿梭券 | GET | /timetravel/tickets | 获取穿梭券 |
| 历史记录 | GET | /timetravel/history | 获取历史记录 |
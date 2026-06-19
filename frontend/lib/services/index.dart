import 'api_client.dart';

class UserService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> register(String phone, String nickname) async {
    final result = await _api.post('/user/register', body: {
      'phone': phone,
      'nickname': nickname,
    });
    await _api.setToken(result['token']);
    return result;
  }

  Future<Map<String, dynamic>> login(String phone) async {
    final result = await _api.post('/user/login', body: {'phone': phone});
    await _api.setToken(result['token']);
    return result;
  }

  Future<Map<String, dynamic>> getProfile() => _api.get('/user/profile');

  Future<void> updateProfile({String? nickname, String? avatarUrl}) {
    return _api.put('/user/profile', body: {
      if (nickname != null) 'nickname': nickname,
      if (avatarUrl != null) 'avatar_url': avatarUrl,
    });
  }

  Future<Map<String, dynamic>> verifyRealName(String realName, String idCard) {
    return _api.post('/user/verify-realname', body: {
      'realName': realName,
      'idCard': idCard,
    });
  }

  Future<void> deleteAllData() => _api.delete('/user/data');

  Future<void> logout() async {
    await _api.clearToken();
  }
}

class PartnerService {
  final ApiClient _api = ApiClient();

  Future<List<dynamic>> getPresets() async {
    final result = await _api.get('/partner/presets');
    return result as List<dynamic>; // 直接返回列表
  }

  Future<Map<String, dynamic>> createPartner({
    required String name,
    required String coreType,
    Map<String, dynamic>? personalityTraits,
    String? relationshipType,
    String? nicknameForUser,
  }) {
    return _api.post('/partner/create', body: {
      'name': name,
      'coreType': coreType,
      'personalityTraits': personalityTraits ?? {},
      'relationshipType': relationshipType ?? '',
      'nicknameForUser': nicknameForUser ?? '',
    });
  }

  Future<List<dynamic>> getPartners() async {
    final result = await _api.get('/partner');
    return result as List<dynamic>;
  }

  Future<Map<String, dynamic>> getPartnerDetail(int id) {
    return _api.get('/partner/$id');
  }

  Future<void> updatePartner(int id, Map<String, dynamic> data) {
    return _api.put('/partner/$id', body: data);
  }

  Future<void> deletePartner(int id) => _api.delete('/partner/$id');

  Future<void> setDefault(int id) => _api.post('/partner/$id/default');
}

class ChatService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> sendMessage(int partnerId, String message) {
    return _api.post('/chat/send', body: {
      'partnerId': partnerId,
      'message': message,
    });
  }

  Stream<Map<String, dynamic>> streamChat(int partnerId, String message) {
    return _api.chatStream(partnerId, message);
  }

  Future<List<dynamic>> getHistory(int partnerId, {int? before, int limit = 50}) async {
    final result = await _api.get('/chat/history/$partnerId', query: {
      'limit': limit.toString(),
      if (before != null) 'before': before.toString(),
    });
    return result as List<dynamic>;
  }
}

class ScenarioService {
  final ApiClient _api = ApiClient();

  Future<List<dynamic>> getScenarios() async {
    final result = await _api.get('/scenarios');
    return result as List<dynamic>;
  }

  Future<Map<String, dynamic>> getScenarioDetail(int id) {
    return _api.get('/scenarios/$id');
  }
}

class TrainingService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> startTraining(int scenarioId, int partnerId) {
    return _api.post('/training/start', body: {
      'scenarioId': scenarioId,
      'partnerId': partnerId,
    });
  }

  Future<Map<String, dynamic>> submitChoice(int trainingId, int roundIndex, int choiceIndex) {
    return _api.post('/training/choice', body: {
      'trainingId': trainingId,
      'roundIndex': roundIndex,
      'choiceIndex': choiceIndex,
    });
  }

  Future<Map<String, dynamic>> completeTraining(int trainingId, {int durationSeconds = 0}) {
    return _api.post('/training/complete', body: {
      'trainingId': trainingId,
      'durationSeconds': durationSeconds,
    });
  }

  Future<Map<String, dynamic>> getReport(int id) {
    return _api.get('/training/report/$id');
  }

  Future<Map<String, dynamic>> timeShift(int trainingId, int roundIndex) {
    return _api.post('/training/timeshift', body: {
      'trainingId': trainingId,
      'roundIndex': roundIndex,
    });
  }
}

class GrowthService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getRadar() => _api.get('/growth/radar');
  Future<Map<String, dynamic>> getTrend(int days) => _api.get('/growth/trend/$days');
  Future<List<dynamic>> getMilestones() async {
    final result = await _api.get('/growth/milestones');
    return result as List<dynamic>;
  }
  Future<Map<String, dynamic>> getAttachmentReport() => _api.get('/growth/attachment-report');
}

class MembershipService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getStatus() => _api.get('/membership/status');
  Future<Map<String, dynamic>> purchase(int level) => _api.post('/membership/purchase', body: {'level': level});
  Future<Map<String, dynamic>> renew(int level) => _api.post('/membership/renew', body: {'level': level});
}

class ComplianceService {
  final ApiClient _api = ApiClient();

  Future<Map<String, dynamic>> getAgeTier() => _api.get('/compliance/age-tier');
  Future<Map<String, dynamic>> getDailyUsage() => _api.get('/compliance/daily-usage');
  Future<void> logUsage(int minutes) => _api.post('/compliance/log-usage', body: {'minutes': minutes});
}

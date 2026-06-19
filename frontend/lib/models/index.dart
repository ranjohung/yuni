class User {
  final int id;
  final String phone;
  final String nickname;
  final String avatarUrl;
  final bool realNameVerified;
  final int membershipLevel;
  final int ticketsBalance;

  User({
    required this.id,
    required this.phone,
    this.nickname = '',
    this.avatarUrl = '',
    this.realNameVerified = false,
    this.membershipLevel = 0,
    this.ticketsBalance = 3,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id: json['id'] ?? 0,
    phone: json['phone'] ?? '',
    nickname: json['nickname'] ?? '',
    avatarUrl: json['avatar_url'] ?? '',
    realNameVerified: json['real_name_verified'] ?? false,
    membershipLevel: json['membership_level'] ?? 0,
    ticketsBalance: json['ticketsBalance'] ?? 3,
  );
}

class Partner {
  final int id;
  final String name;
  final String coreType;
  final String relationshipType;
  final int affinityScore;
  final int affinityLevel;
  final String status;
  final bool isDefault;
  final String? nicknameForUser;

  Partner({
    required this.id,
    required this.name,
    required this.coreType,
    this.relationshipType = '',
    this.affinityScore = 0,
    this.affinityLevel = 1,
    this.status = 'active',
    this.isDefault = false,
    this.nicknameForUser,
  });

  factory Partner.fromJson(Map<String, dynamic> json) => Partner(
    id: json['id'] ?? 0,
    name: json['name'] ?? '',
    coreType: json['core_type'] ?? json['coreType'] ?? 'healer',
    relationshipType: json['relationship_type'] ?? '',
    affinityScore: json['affinity_score'] ?? json['affinityScore'] ?? 0,
    affinityLevel: json['affinity_level'] ?? json['affinityLevel'] ?? 1,
    status: json['status'] ?? 'active',
    isDefault: json['is_default'] ?? false,
    nicknameForUser: json['nickname_for_user'] ?? json['nicknameForUser'],
  );

  String get coreTypeName {
    switch (coreType) {
      case 'pursuer': return '追寻者';
      case 'guardian': return '守护者';
      case 'wanderer': return '流浪者';
      case 'healer': return '疗愈者';
      default: return '未知';
    }
  }

  String get affinityLevelName {
    switch (affinityLevel) {
      case 1: return '初识';
      case 2: return '熟络';
      case 3: return '知己';
      case 4: return '依赖';
      case 5: return '羁绊';
      default: return '初识';
    }
  }
}

class Scenario {
  final int id;
  final String title;
  final int stage;
  final String stageName;
  final int difficulty;
  final int durationMinutes;
  final String skill;
  final String background;
  final int bestScore;
  final bool completed;
  final double progress;
  final bool locked;

  Scenario({
    required this.id,
    required this.title,
    required this.stage,
    this.stageName = '',
    this.difficulty = 1,
    this.durationMinutes = 10,
    this.skill = '',
    this.background = '',
    this.bestScore = 0,
    this.completed = false,
    this.progress = 0.0,
    this.locked = false,
  });

  factory Scenario.fromJson(Map<String, dynamic> json) => Scenario(
    id: json['id'] ?? 0,
    title: json['title'] ?? '',
    stage: json['stage'] ?? 1,
    stageName: json['stageName'] ?? '',
    difficulty: json['difficulty'] ?? 1,
    durationMinutes: json['durationMinutes'] ?? 10,
    skill: json['skill'] ?? '',
    background: json['background'] ?? '',
    bestScore: json['bestScore'] ?? 0,
    completed: json['completed'] ?? false,
    progress: (json['progress'] ?? 0).toDouble(),
    locked: json['locked'] ?? false,
  );

  String get difficultyStars => '⭐' * difficulty;

  String get stageEmoji {
    switch (stage) {
      case 1: return '👋';
      case 2: return '🤝';
      case 3: return '❤️';
      default: return '🎯';
    }
  }
}

class TrainingRecord {
  final int id;
  final int scenarioId;
  final int totalScore;
  final Map<String, int> scores;
  final int durationSeconds;
  final String completedAt;

  TrainingRecord({
    required this.id,
    required this.scenarioId,
    this.totalScore = 0,
    this.scores = const {},
    this.durationSeconds = 0,
    this.completedAt = '',
  });

  factory TrainingRecord.fromJson(Map<String, dynamic> json) => TrainingRecord(
    id: json['id'] ?? 0,
    scenarioId: json['scenarioId'] ?? json['scenario_id'] ?? 0,
    totalScore: json['totalScore'] ?? json['total_score'] ?? 0,
    scores: json['scores'] != null
      ? Map<String, int>.from(json['scores'].map((k, v) => MapEntry(k, v as int)))
      : {},
    durationSeconds: json['durationSeconds'] ?? 0,
    completedAt: json['completedAt'] ?? json['created_at'] ?? '',
  );

  String get level {
    if (totalScore >= 90) return '优秀';
    if (totalScore >= 75) return '良好';
    if (totalScore >= 60) return '一般';
    if (totalScore >= 40) return '需要加强';
    return '待提升';
  }
}

class StudyCard {
  final int id;
  final int scenarioId;
  final String originalChoice;
  final String errorAnalysis;
  final String correctApproach;
  final bool isFavorite;

  StudyCard({
    required this.id,
    required this.scenarioId,
    this.originalChoice = '',
    this.errorAnalysis = '',
    this.correctApproach = '',
    this.isFavorite = false,
  });

  factory StudyCard.fromJson(Map<String, dynamic> json) => StudyCard(
    id: json['id'] ?? 0,
    scenarioId: json['scenario_id'] ?? 0,
    originalChoice: json['original_choice'] ?? '',
    errorAnalysis: json['error_analysis'] ?? '',
    correctApproach: json['correct_approach'] ?? '',
    isFavorite: json['is_favorite'] ?? false,
  );
}

class ChatMessage {
  final int id;
  final String role;
  final String content;
  final int affinityChange;
  final String createdAt;

  ChatMessage({
    required this.id,
    required this.role,
    required this.content,
    this.affinityChange = 0,
    this.createdAt = '',
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) => ChatMessage(
    id: json['id'] ?? 0,
    role: json['role'] ?? 'user',
    content: json['content'] ?? '',
    affinityChange: json['affinity_change'] ?? 0,
    createdAt: json['created_at'] ?? '',
  );

  bool get isUser => role == 'user';
  bool get isAssistant => role == 'assistant';
}

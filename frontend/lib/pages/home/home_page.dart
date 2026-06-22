import 'package:flutter/material.dart';
import '../../services/index.dart';
import '../../models/index.dart';
import '../../widgets/digital_human.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  Partner? _defaultPartner;
  List<Scenario> _scenarios = [];
  Map<String, dynamic>? _growthData;
  Map<String, dynamic>? _dashboardData;
  Map<String, dynamic>? _membershipData;
  User? _currentUser;
  bool _loading = true;
  bool _checkInSuccess = false;
  int _streakDays = 0;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final partnerService = PartnerService();
      final scenarioService = ScenarioService();
      final growthService = GrowthService();
      final userService = UserService();
      final membershipService = MembershipService();

      final partnersList = await partnerService.getPartners();
      Partner? defaultPartner;
      if (partnersList.isNotEmpty) {
        final dataList = partnersList as List<dynamic>;
        final typedList = dataList.cast<Map<String, dynamic>>();
        final defaultData = typedList.firstWhere(
          (p) => p['is_default'] == true,
          orElse: () => typedList.first,
        );
        defaultPartner = Partner.fromJson(defaultData);
      }

      final scenarios = await scenarioService.getScenarios();
      Map<String, dynamic>? growth;
      Map<String, dynamic>? dashboard;
      Map<String, dynamic>? membership;
      User? user;
      try {
        growth = await growthService.getRadar();
        dashboard = await _fetchDashboard();
        membership = await membershipService.getStatus();
        final userData = await userService.getProfile();
        user = User.fromJson(userData);
      } catch (_) {}

      setState(() {
        _defaultPartner = defaultPartner;
        _scenarios = scenarios.map((s) => Scenario.fromJson(s as Map<String, dynamic>)).toList();
        _growthData = growth;
        _dashboardData = dashboard;
        _membershipData = membership;
        _currentUser = user;
        _streakDays = dashboard?['streakDays'] ?? 0;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<Map<String, dynamic>> _fetchDashboard() async {
    try {
      final api = ApiClient();
      return await api.get('/home/dashboard');
    } catch (_) {
      return {
        'streakDays': 0,
        'todayTraining': false,
        'weeklyProgress': 0,
        'recommendedScenario': null,
      };
    }
  }

  Future<void> _handleCheckIn() async {
    try {
      final api = ApiClient();
      await api.post('/checkin/daily');
      setState(() {
        _checkInSuccess = true;
        _streakDays += 1;
      });
      await Future.delayed(const Duration(2000), () {
        setState(() => _checkInSuccess = false);
      });
    } catch (e) {
      // 已签到或其他错误
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final now = DateTime.now();
    final greeting = now.hour < 12 ? '早上好' : (now.hour < 18 ? '下午好' : '晚上好');
    final completedScenarios = _scenarios.where((s) => s.completed).toList();

    return Scaffold(
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _loadData,
            child: ListView(
              children: [
                // 顶部区域
                _buildHeader(theme, greeting),

                // 快捷功能入口
                _buildQuickActions(theme),
                const SizedBox(height: 16),

                // 今日推荐训练
                if (_scenarios.isNotEmpty)
                  _buildRecommendedCard(theme),
                const SizedBox(height: 16),

                // 最近训练
                if (completedScenarios.isNotEmpty) ...[
                  _buildSectionTitle('🕐 最近训练'),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 120,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      children: completedScenarios.map((s) => _buildMiniCard(theme, s)).toList(),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // 本周进度
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _buildWeeklyProgress(theme),
                ),
                const SizedBox(height: 16),

                // 晚安计划入口（晚上时段显示）
                if (now.hour >= 20 || now.hour < 1) ...[
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildNightlyPlanCard(theme),
                  ),
                  const SizedBox(height: 16),
                ],

                // 会员特权提示
                if (_membershipData != null && _membershipData!['level'] > 0)
                  Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    child: _buildMembershipCard(theme),
                  ),
                const SizedBox(height: 16),

                // 变美联动入口
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _buildBeautyLinkCard(theme),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
    );
  }

  Widget _buildHeader(ThemeData theme, String greeting) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(16, 60, 16, 24),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          colors: [
            theme.colorScheme.primaryContainer,
            Colors.white,
          ],
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              // 数字人头像
              if (_defaultPartner != null)
                _buildPartnerAvatar(),
              const SizedBox(width: 16),
              // 问候语和用户信息
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          '$greeting，',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.onPrimaryContainer,
                          ),
                        ),
                        Text(
                          _currentUser?.nickname ?? '朋友',
                          style: TextStyle(
                            fontSize: 20,
                            fontWeight: FontWeight.w600,
                            color: theme.colorScheme.onPrimaryContainer,
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        Text(
                          _defaultPartner?.nicknameForUser ?? '今天也要加油哦',
                          style: TextStyle(
                            fontSize: 14,
                            color: theme.colorScheme.onPrimaryContainer.withOpacity(0.7),
                          ),
                        ),
                        if (_currentUser?.ticketsBalance != null && _currentUser!.ticketsBalance > 0)
                          Padding(
                            padding: const EdgeInsets.only(left: 8),
                            child: Row(
                              children: [
                                const Text('🎫', style: TextStyle(fontSize: 14)),
                                Text(
                                  '${_currentUser!.ticketsBalance}',
                                  style: TextStyle(
                                    fontSize: 14,
                                    color: Colors.orange[600],
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
                  ],
                ),
              ),
              // 签到按钮
              _buildCheckInButton(theme),
            ],
          ),
          // 好感度进度条
          if (_defaultPartner != null)
            _buildAffinityBar(theme),
        ],
      ),
    );
  }

  Widget _buildPartnerAvatar() {
    return Container(
      width: 64,
      height: 64,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        border: Border.all(color: Colors.white, width: 3),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.1),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: DigitalHumanWidget(
        name: _defaultPartner!.name,
        coreType: _defaultPartner!.coreType,
        emotion: 'happy',
        size: 60,
      ),
    );
  }

  Widget _buildCheckInButton(ThemeData theme) {
    return InkWell(
      onTap: _handleCheckIn,
      borderRadius: BorderRadius.circular(20),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: _checkInSuccess ? Colors.green[100] : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: _checkInSuccess ? Colors.green : Colors.grey[200]),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.05),
              blurRadius: 4,
            ),
          ],
        ),
        child: Row(
          children: [
            Icon(
              _checkInSuccess ? Icons.check : Icons.calendar_today,
              size: 16,
              color: _checkInSuccess ? Colors.green : theme.colorScheme.primary,
            ),
            const SizedBox(width: 4),
            Text(
              _checkInSuccess ? '已签到' : '签到',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: _checkInSuccess ? Colors.green : theme.colorScheme.primary,
              ),
            ),
            if (_streakDays > 0 && !_checkInSuccess)
              Padding(
                padding: const EdgeInsets.only(left: 4),
                child: Text(
                  '$_streakDays天',
                  style: TextStyle(fontSize: 11, color: Colors.grey[500]),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildAffinityBar(ThemeData theme) {
    return Padding(
      padding: const EdgeInsets.only(top: 12),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.favorite, size: 14, color: Colors.red[300]),
              const SizedBox(width: 4),
              Text(
                '好感度',
                style: TextStyle(fontSize: 12, color: Colors.grey[600]),
              ),
              const Spacer(),
              Text(
                '${_defaultPartner!.affinityScore}/1000',
                style: TextStyle(fontSize: 12, color: Colors.red[400]),
              ),
              const SizedBox(width: 8),
              Text(
                _defaultPartner!.affinityLevelName,
                style: TextStyle(fontSize: 12, color: theme.colorScheme.primary),
              ),
            ],
          ),
          const SizedBox(height: 4),
          ClipRRect(
            borderRadius: BorderRadius.circular(4),
            child: LinearProgressIndicator(
              value: (_defaultPartner!.affinityScore / 1000).clamp(0.0, 1.0),
              minHeight: 6,
              color: Colors.red[300],
              backgroundColor: Colors.red[50],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRecommendedCard(ThemeData theme) {
    // 获取推荐场景（优先未完成的低难度场景）
    final recommended = _scenarios.firstWhere(
      (s) => !s.completed && s.difficulty <= 2,
      orElse: () => _scenarios.first,
    );

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                    decoration: BoxDecoration(
                      color: theme.colorScheme.primary.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Text(
                      '📌 今日推荐',
                      style: TextStyle(
                        fontWeight: FontWeight.w600,
                        color: theme.colorScheme.primary,
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Text(recommended.difficultyStars),
                      const SizedBox(width: 8),
                      Text(
                        '${recommended.durationMinutes}min',
                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                      ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                recommended.title,
                style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
              ),
              const SizedBox(height: 4),
              Row(
                children: [
                  Text(
                    recommended.skill,
                    style: TextStyle(color: Colors.grey[600]),
                  ),
                  const SizedBox(width: 8),
                  if (recommended.completed)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                      decoration: BoxDecoration(
                        color: Colors.green[100],
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        '已完成',
                        style: TextStyle(color: Colors.green[600], fontSize: 10),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                height: 44,
                child: FilledButton(
                  onPressed: () {
                    Navigator.pushNamed(context, '/simulation/detail', arguments: recommended.id);
                  },
                  style: FilledButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('开始训练'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildWeeklyProgress(ThemeData theme) {
    final trainingDays = _growthData?['totalTrainings'] ?? 0;
    final weeklyProgress = (trainingDays / 7 * 100).toInt();

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Text('📊 本周进度', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                const Spacer(),
                Text(
                  '$weeklyProgress%',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: theme.colorScheme.primary),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Text('训练天数：$trainingDays/7', style: TextStyle(color: Colors.grey[600])),
                const Spacer(),
                if (_growthData != null)
                  Text(
                    '沟通力 +${_growthData!['communication'] ?? 0} ↑',
                    style: TextStyle(color: Colors.green[600], fontSize: 12),
                  ),
              ],
            ),
            const SizedBox(height: 8),
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: LinearProgressIndicator(
                value: (trainingDays / 7).clamp(0.0, 1.0),
                minHeight: 10,
                color: theme.colorScheme.primary,
                backgroundColor: Colors.grey[100],
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                _buildProgressChip('周一', trainingDays > 0),
                _buildProgressChip('周二', trainingDays > 1),
                _buildProgressChip('周三', trainingDays > 2),
                _buildProgressChip('周四', trainingDays > 3),
                _buildProgressChip('周五', trainingDays > 4),
                _buildProgressChip('周六', trainingDays > 5),
                _buildProgressChip('周日', trainingDays > 6),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildProgressChip(String day, bool completed) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 2),
        padding: const EdgeInsets.symmetric(vertical: 4),
        decoration: BoxDecoration(
          color: completed ? Colors.green[100] : Colors.grey[100],
          borderRadius: BorderRadius.circular(4),
        ),
        child: Text(
          day,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontSize: 10,
            color: completed ? Colors.green[600] : Colors.grey[400],
          ),
        ),
      ),
    );
  }

  Widget _buildNightlyPlanCard(ThemeData theme) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.indigo[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: Colors.indigo[200],
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Center(child: Text('🌙', style: TextStyle(fontSize: 24))),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '晚安计划',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '让${_defaultPartner?.name ?? 'TA'}陪你入睡',
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
          ],
        ),
      ),
    );
  }

  Widget _buildBeautyLinkCard(ThemeData theme) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.pink[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Row(
          children: [
            Container(
              width: 56,
              height: 56,
              decoration: BoxDecoration(
                color: Colors.pink[200],
                borderRadius: BorderRadius.circular(14),
              ),
              child: const Center(child: Text('💅', style: TextStyle(fontSize: 24))),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    '想从形象上提升社交自信？',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '一键跳转悦己颜值社，获取专属变美方案',
                    style: TextStyle(color: Colors.grey[600], fontSize: 14),
                  ),
                ],
              ),
            ),
            const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.pink[400]),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniCard(ThemeData theme, Scenario scenario) {
    return InkWell(
      onTap: () {
        Navigator.pushNamed(context, '/simulation/detail', arguments: scenario.id);
      },
      child: Container(
        width: 120,
        margin: const EdgeInsets.only(right: 12),
        child: Card(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: theme.colorScheme.primary.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Center(
                    child: Text(scenario.stageEmoji, style: const TextStyle(fontSize: 20)),
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  scenario.title,
                  style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
                  textAlign: TextAlign.center,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 4),
                if (scenario.bestScore > 0)
                  Text(
                    '最高 ${scenario.bestScore}分',
                    style: TextStyle(color: Colors.green[600], fontSize: 11),
                  ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
    );
  }

  Widget _buildQuickActions(ThemeData theme) {
    final actions = [
      {'icon': '💬', 'label': '聊天', 'route': '/chat', 'badge': null},
      {'icon': '🎯', 'label': '训练', 'route': '/simulation', 'badge': null},
      {'icon': '📈', 'label': '成长', 'route': '/growth', 'badge': null},
      {'icon': '👤', 'label': '我的', 'route': '/profile', 'badge': null},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Row(
        children: actions.map((action) {
          return Expanded(
            child: InkWell(
              onTap: () => Navigator.pushNamed(context, action['route']!),
              child: Container(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Column(
                  children: [
                    Container(
                      width: 52,
                      height: 52,
                      decoration: BoxDecoration(
                        color: theme.colorScheme.primary.withOpacity(0.1),
                        borderRadius: BorderRadius.circular(14),
                      ),
                      child: Center(
                        child: Text(action['icon']!, style: const TextStyle(fontSize: 24)),
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      action['label']!,
                      style: TextStyle(fontSize: 12, color: Colors.grey[600]),
                    ),
                    if (action['badge'] != null)
                      Container(
                        margin: const EdgeInsets.only(top: 2),
                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: Colors.red,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          action['badge']!,
                          style: const TextStyle(fontSize: 10, color: Colors.white),
                        ),
                      ),
                  ],
                ),
              ),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildMembershipCard(ThemeData theme) {
    final level = _membershipData!['level'] ?? 1;
    final expiresAt = _membershipData!['expires_at'] ?? '';
    final levelNames = ['', '月卡会员', '季卡会员', '年卡会员', '终身会员'];
    final benefits = [
      {'icon': '🔄', 'text': '无限对话次数'},
      {'icon': '✨', 'text': '高级AI模型'},
      {'icon': '📚', 'text': '专属训练场景'},
      {'icon': '🎁', 'text': '额外奖励'},
    ];

    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
      color: Colors.purple[50],
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.purple[200],
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Text('👑', style: TextStyle(fontSize: 24)),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        levelNames[level] ?? '会员',
                        style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: Colors.purple[700]),
                      ),
                      if (expiresAt.isNotEmpty)
                        Text(
                          '有效期至 $expiresAt',
                          style: TextStyle(color: Colors.grey[600], fontSize: 12),
                        ),
                    ],
                  ),
                ),
                const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey[400]),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: benefits.map((benefit) {
                return Expanded(
                  child: Center(
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(benefit['icon']!),
                        const SizedBox(width: 4),
                        Text(benefit['text']!, style: TextStyle(fontSize: 11, color: Colors.grey[600])),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

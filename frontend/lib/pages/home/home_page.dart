import 'package:flutter/material.dart';
import '../../services/index.dart';
import '../../models/index.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  Partner? _defaultPartner;
  List<Scenario> _scenarios = [];
  Map<String, dynamic>? _growthData;
  bool _loading = true;

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
      try {
        growth = await growthService.getRadar();
      } catch (_) {}

      setState(() {
        _defaultPartner = defaultPartner;
        _scenarios = scenarios.map((s) => Scenario.fromJson(s as Map<String, dynamic>)).toList();
        _growthData = growth;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final now = DateTime.now();
    final greeting = now.hour < 12 ? '早上好' : (now.hour < 18 ? '下午好' : '晚上好');

    return Scaffold(
      appBar: AppBar(
        title: Text(
          '$greeting${_defaultPartner?.nicknameForUser ?? ""}',
          style: TextStyle(fontSize: 20, fontWeight: FontWeight.w600),
        ),
        actions: [
          if (_defaultPartner != null)
            Padding(
              padding: const EdgeInsets.only(right: 12),
              child: Chip(
                avatar: Icon(Icons.favorite, size: 16, color: Colors.red[300]),
                label: Text('${_defaultPartner!.affinityLevelName}'),
                visualDensity: VisualDensity.compact,
              ),
            ),
        ],
      ),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _loadData,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // 今日推荐训练
                if (_scenarios.isNotEmpty)
                  _buildRecommendedCard(theme, _scenarios.first),
                const SizedBox(height: 16),

                // 最近训练
                if (_scenarios.where((s) => s.completed).isNotEmpty) ...[
                  _buildSectionTitle('🕐 最近训练'),
                  const SizedBox(height: 8),
                  SizedBox(
                    height: 100,
                    child: ListView(
                      scrollDirection: Axis.horizontal,
                      children: _scenarios.where((s) => s.completed).map((s) => 
                        _buildMiniCard(theme, s)
                      ).toList(),
                    ),
                  ),
                  const SizedBox(height: 16),
                ],

                // 本周进度
                _buildSectionTitle('📊 本周进度'),
                const SizedBox(height: 8),
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('训练天数：${_growthData?['totalTrainings'] ?? 0}/7'),
                        const SizedBox(height: 8),
                        ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: ((_growthData?['totalTrainings'] ?? 0) / 7).clamp(0.0, 1.0),
                            minHeight: 8,
                          ),
                        ),
                        const SizedBox(height: 8),
                        if (_growthData != null) ...[
                          Text('沟通力 +${(_growthData!['communication'] ?? 0).toString()} ↑',
                            style: TextStyle(color: Colors.green[600])),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 变美联动入口
                Card(
                  color: Colors.pink[50],
                  child: ListTile(
                    leading: const Icon(Icons.auto_awesome, color: Colors.pink),
                    title: const Text('想从形象上提升社交自信？'),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () {
                      // 跳转悦己颜值社
                    },
                  ),
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildRecommendedCard(ThemeData theme, Scenario scenario) {
    return Card(
      elevation: 2,
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Text('📌 今日推荐训练',
                  style: TextStyle(fontWeight: FontWeight.w600, color: theme.colorScheme.primary)),
                const Spacer(),
                Text(scenario.difficultyStars, style: const TextStyle(fontSize: 14)),
                const SizedBox(width: 4),
                Text('${scenario.durationMinutes}min', style: TextStyle(color: Colors.grey[500])),
              ],
            ),
            const SizedBox(height: 12),
            Text(scenario.title, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 4),
            Text(scenario.skill, style: TextStyle(color: Colors.grey[600])),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton(
                onPressed: () {
                  Navigator.pushNamed(context, '/simulation/detail', arguments: scenario.id);
                },
                child: const Text('开始训练'),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildMiniCard(ThemeData theme, Scenario scenario) {
    return Container(
      width: 120,
      margin: const EdgeInsets.only(right: 8),
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(8),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Text(scenario.stageEmoji, style: const TextStyle(fontSize: 24)),
              const SizedBox(height: 4),
              Text(scenario.title, style: const TextStyle(fontSize: 12), textAlign: TextAlign.center),
              Text('${scenario.bestScore}分', style: TextStyle(color: Colors.green[600], fontSize: 11)),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600));
  }
}

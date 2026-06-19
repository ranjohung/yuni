import 'package:flutter/material.dart';
import '../../services/index.dart';

class ScenarioDetailPage extends StatefulWidget {
  final int scenarioId;
  const ScenarioDetailPage({super.key, required this.scenarioId});

  @override
  State<ScenarioDetailPage> createState() => _ScenarioDetailPageState();
}

class _ScenarioDetailPageState extends State<ScenarioDetailPage> {
  Map<String, dynamic>? _scenario;
  bool _loading = true;
  int _currentRound = 0;
  bool _started = false;
  bool _completed = false;
  int _totalScore = 0;

  @override
  void initState() {
    super.initState();
    _loadScenario();
  }

  Future<void> _loadScenario() async {
    try {
      final service = ScenarioService();
      final data = await service.getScenarioDetail(widget.scenarioId);
      setState(() {
        _scenario = data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  void _startTraining() {
    setState(() => _started = true);
  }

  void _selectChoice(int choiceIndex) {
    final rounds = _scenario!['rounds'] as List;
    final currentRoundData = rounds[_currentRound];
    final choices = currentRoundData['choices'] as List;
    final selected = choices[choiceIndex];

    final affinityChange = selected['affinity'] ?? 0;
    _totalScore += affinityChange > 0 ? 15 : (affinityChange == 0 ? 5 : -10);

    if (_currentRound < rounds.length - 1) {
      setState(() {
        _currentRound++;
      });
    } else {
      // 训练完成
      setState(() => _completed = true);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: Text(_scenario?['title'] ?? '场景训练')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : _completed
          ? _buildReport(theme)
          : _started
            ? _buildTraining(theme)
            : _buildIntro(theme),
    );
  }

  Widget _buildIntro(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // 场景氛围
        Container(
          height: 160,
          decoration: BoxDecoration(
            gradient: LinearGradient(
              colors: [theme.colorScheme.primaryContainer, Colors.white],
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
            ),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Text('${_scenario!['difficulty']}⭐',
                  style: const TextStyle(fontSize: 32)),
                const SizedBox(height: 8),
                Text('${_scenario!['durationMinutes']} 分钟',
                  style: TextStyle(color: Colors.grey[600])),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // 场景标题
        Text(_scenario!['title'],
          style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),

        // 教学点
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.blue[50],
            borderRadius: BorderRadius.circular(12),
          ),
          child: Row(
            children: [
              Icon(Icons.lightbulb_outline, color: Colors.blue[700]),
              const SizedBox(width: 8),
              Expanded(child: Text('教学点：${_scenario!['skill']}',
                style: TextStyle(color: Colors.blue[700]))),
            ],
          ),
        ),
        const SizedBox(height: 12),

        // 背景介绍
        Text('场景背景',
          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: Colors.grey[700])),
        const SizedBox(height: 4),
        Text(_scenario!['background'] ?? '',
          style: TextStyle(color: Colors.grey[600], height: 1.5)),
        const SizedBox(height: 24),

        // 开始按钮
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: _startTraining,
            child: const Text('开始训练', style: TextStyle(fontSize: 16)),
          ),
        ),
      ],
    );
  }

  Widget _buildTraining(ThemeData theme) {
    final rounds = _scenario!['rounds'] as List;
    final round = rounds[_currentRound];
    final choices = round['choices'] as List;

    return Column(
      children: [
        // 进度
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('第 ${_currentRound + 1}/${rounds.length} 轮',
                style: TextStyle(color: Colors.grey[600], fontSize: 13)),
              const SizedBox(height: 4),
              ClipRRect(
                borderRadius: BorderRadius.circular(3),
                child: LinearProgressIndicator(
                  value: (_currentRound + 1) / rounds.length,
                  minHeight: 6,
                ),
              ),
            ],
          ),
        ),

        // AI台词
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(16),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 16,
                    backgroundColor: theme.colorScheme.primaryContainer,
                    child: Icon(Icons.person, size: 18, color: theme.colorScheme.primary),
                  ),
                  const SizedBox(width: 8),
                  Text('伴侣', style: TextStyle(fontWeight: FontWeight.w600)),
                ],
              ),
              const SizedBox(height: 8),
              Text(round['aiLine'] ?? '', style: TextStyle(fontSize: 15, height: 1.5)),
            ],
          ),
        ),
        const SizedBox(height: 8),

        // 教学提示
        Container(
          margin: const EdgeInsets.symmetric(horizontal: 16),
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.amber[50],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            children: [
              Icon(Icons.lightbulb_outline, size: 16, color: Colors.amber[800]),
              const SizedBox(width: 8),
              Expanded(child: Text(round['teaching'] ?? '',
                style: TextStyle(fontSize: 13, color: Colors.amber[900]))),
            ],
          ),
        ),

        const Spacer(),

        // 选项
        Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            children: List.generate(choices.length, (i) {
              final choice = choices[i];
              return Padding(
                padding: const EdgeInsets.only(bottom: 8),
                child: SizedBox(
                  width: double.infinity,
                  child: OutlinedButton(
                    onPressed: () => _selectChoice(i),
                    style: OutlinedButton.styleFrom(
                      padding: const EdgeInsets.all(16),
                      side: BorderSide(color: Colors.grey[300]!),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                    ),
                    child: Text(choice['text'] ?? ''),
                  ),
                ),
              );
            }),
          ),
        ),
      ],
    );
  }

  Widget _buildReport(ThemeData theme) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const SizedBox(height: 24),
        Icon(Icons.check_circle, size: 64, color: Colors.green[400]),
        const SizedBox(height: 8),
        const Text('训练完成', textAlign: TextAlign.center,
          style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
        const SizedBox(height: 24),

        // 分数
        Center(
          child: SizedBox(
            width: 120,
            height: 120,
            child: Stack(
              alignment: Alignment.center,
              children: [
                SizedBox(
                  width: 120, height: 120,
                  child: CircularProgressIndicator(
                    value: _totalScore / 100,
                    strokeWidth: 8,
                    color: _totalScore >= 60 ? Colors.green : Colors.orange,
                  ),
                ),
                Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('$_totalScore',
                      style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: theme.colorScheme.primary)),
                    Text('分', style: TextStyle(color: Colors.grey[500])),
                  ],
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 8),
        Center(
          child: Text(_getLevel(), style: TextStyle(
            fontSize: 16,
            color: _totalScore >= 60 ? Colors.green[700] : Colors.orange[700],
            fontWeight: FontWeight.w500,
          )),
        ),
        const SizedBox(height: 24),

        // 能力得分
        _buildScoreRow('沟通力', _totalScore + 5),
        _buildScoreRow('表达力', _totalScore - 3),
        _buildScoreRow('共情力', _totalScore + 10),
        _buildScoreRow('情绪控制', _totalScore),
        _buildScoreRow('应变力', _totalScore + 2),
        const SizedBox(height: 24),

        // 按钮
        SizedBox(
          width: double.infinity,
          child: FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('返回场景列表'),
          ),
        ),
        const SizedBox(height: 8),
        SizedBox(
          width: double.infinity,
          child: TextButton(
            onPressed: () {
              setState(() {
                _started = false;
                _completed = false;
                _currentRound = 0;
                _totalScore = 0;
              });
            },
            child: const Text('重新挑战'),
          ),
        ),
      ],
    );
  }

  String _getLevel() {
    if (_totalScore >= 90) return '优秀';
    if (_totalScore >= 75) return '良好';
    if (_totalScore >= 60) return '一般';
    if (_totalScore >= 40) return '需要加强';
    return '待提升';
  }

  Widget _buildScoreRow(String label, int score) {
    final clamped = score.clamp(0, 100);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(width: 80, child: Text(label, style: TextStyle(color: Colors.grey[600]))),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: clamped / 100,
                minHeight: 8,
              ),
            ),
          ),
          SizedBox(width: 40, child: Text('$clamped', textAlign: TextAlign.right,
            style: TextStyle(fontWeight: FontWeight.w600))),
        ],
      ),
    );
  }
}

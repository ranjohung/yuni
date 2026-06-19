import 'package:flutter/material.dart';
import '../../services/index.dart';
import '../../models/index.dart';

class SimulationPage extends StatefulWidget {
  const SimulationPage({super.key});

  @override
  State<SimulationPage> createState() => _SimulationPageState();
}

class _SimulationPageState extends State<SimulationPage> {
  List<Scenario> _scenarios = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadScenarios();
  }

  Future<void> _loadScenarios() async {
    try {
      final service = ScenarioService();
      final data = await service.getScenarios();
      setState(() {
        _scenarios = data.map((s) => Scenario.fromJson(s as Map<String, dynamic>)).toList();
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('🎯 社交模拟训练')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _loadScenarios,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: _buildScenarioGroups(),
            ),
          ),
    );
  }

  List<Widget> _buildScenarioGroups() {
    final groups = <int, List<Scenario>>{};
    for (final s in _scenarios) {
      groups.putIfAbsent(s.stage, () => []);
      groups[s.stage]!.add(s);
    }

    final stageNames = {
      1: '阶段一：陌生人→认识',
      2: '阶段二：认识→普通朋友',
      3: '阶段三：普通朋友→好朋友',
    };

    final widgets = <Widget>[];
    for (final stage in groups.keys.toList()..sort()) {
      widgets.add(Padding(
        padding: const EdgeInsets.only(bottom: 8),
        child: Text(stageNames[stage] ?? '阶段$stage',
          style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
      ));

      for (final scenario in groups[stage]!) {
        widgets.add(_buildScenarioCard(context, scenario));
        widgets.add(const SizedBox(height: 8));
      }
      widgets.add(const SizedBox(height: 16));
    }

    return widgets;
  }

  Widget _buildScenarioCard(BuildContext context, Scenario scenario) {
    return Card(
      child: InkWell(
        borderRadius: BorderRadius.circular(12),
        onTap: scenario.locked ? null : () {
          Navigator.pushNamed(context, '/simulation/detail', arguments: scenario.id);
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              // 场景信息
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: scenario.locked ? Colors.grey[200] : Colors.green[50],
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(scenario.difficultyStars,
                            style: const TextStyle(fontSize: 12)),
                        ),
                        const SizedBox(width: 8),
                        Text('${scenario.durationMinutes}min',
                          style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text(scenario.title,
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text('「${scenario.skill}」',
                      style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                    if (scenario.progress > 0) ...[
                      const SizedBox(height: 8),
                      ClipRRect(
                        borderRadius: BorderRadius.circular(2),
                        child: LinearProgressIndicator(
                          value: scenario.progress,
                          minHeight: 4,
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              // 状态图标
              if (scenario.locked)
                Icon(Icons.lock_outline, color: Colors.grey[400], size: 28)
              else if (scenario.completed)
                Icon(Icons.check_circle, color: Colors.green[400], size: 28)
              else
                const Icon(Icons.play_circle_outline, size: 28),
            ],
          ),
        ),
      ),
    );
  }
}

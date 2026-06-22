import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';
import '../../services/index.dart';

class GrowthPage extends StatefulWidget {
  const GrowthPage({super.key});

  @override
  State<GrowthPage> createState() => _GrowthPageState();
}

class _GrowthPageState extends State<GrowthPage> {
  Map<String, dynamic>? _radarData;
  List<dynamic> _milestones = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      final service = GrowthService();
      final radar = await service.getRadar();
      final milestones = await service.getMilestones();
      setState(() {
        _radarData = radar;
        _milestones = milestones;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('📈 成长轨迹')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : RefreshIndicator(
            onRefresh: _loadData,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                // 能力雷达图
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      children: [
                        const Text('能力雷达图', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 16),
                        SizedBox(
                          height: 240,
                          child: _radarData != null
                            ? _buildRadarChart()
                            : const Center(child: Text('暂无数据')),
                        ),
                        const SizedBox(height: 12),
                        if (_radarData != null) ...[
                          Text('综合得分', style: TextStyle(color: Colors.grey[500])),
                          Text('${_radarData!['overall'] ?? 0}',
                            style: TextStyle(
                              fontSize: 32,
                              fontWeight: FontWeight.bold,
                              color: theme.colorScheme.primary,
                            )),
                        ],
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 上进曲线
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          children: [
                            const Text('📊 进步曲线', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                            const Spacer(),
                            TextButton(onPressed: () {}, child: const Text('近7天')),
                          ],
                        ),
                        const SizedBox(height: 40, child: Center(child: Text('暂无训练数据'))),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 里程碑
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('🏆 里程碑', style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                        const SizedBox(height: 12),
                        if (_milestones.isEmpty)
                          const Text('还没有里程碑，完成训练后会自动记录',
                            style: TextStyle(color: Colors.grey)),
                        ..._milestones.map((m) => ListTile(
                          leading: const Icon(Icons.check_circle, color: Colors.green),
                          title: Text(m['label'] ?? ''),
                          dense: true,
                        )),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // 学习卡片
                Card(
                  child: ListTile(
                    leading: const Icon(Icons.collections_bookmark),
                    title: const Text('学习卡片库'),
                    trailing: const Icon(Icons.arrow_forward_ios, size: 16),
                    onTap: () {},
                  ),
                ),
              ],
            ),
          ),
    );
  }

  Widget _buildRadarChart() {
    final theme = Theme.of(context);
    final labels = ['沟通', '表达', '共情', '情绪', '应变'];
    final values = [
      (_radarData!['communication'] ?? 0) / 100,
      (_radarData!['expression'] ?? 0) / 100,
      (_radarData!['empathy'] ?? 0) / 100,
      (_radarData!['emotionControl'] ?? 0) / 100,
      (_radarData!['adaptability'] ?? 0) / 100,
    ];

    return RadarChart(
      RadarChartData(
        radarShape: RadarShape.polygon,
        radarBorderData: RadarBorderData(show: false),
        titleTextStyle: const TextStyle(fontSize: 12),
        dataSets: [
          RadarDataSet(
            entries: List.generate(5, (i) => RadarEntry(value: values[i])),
            borderColor: theme.colorScheme.primary,
            borderWidth: 2,
            fillColor: theme.colorScheme.primary.withOpacity(0.2),
            entryRadius: 4,
          ),
        ],
        labels: RadarChartLabels(
          labels: labels,
          angleToLabelAlignment: RadarAngleToLabelAlignment.start,
          labelTextStyle: TextStyle(color: Colors.grey[600], fontSize: 12),
        ),
        ticks: const RadarTicks(
          show: true,
          tickCount: 5,
          tickLength: 4,
          tickColor: Colors.grey[200],
        ),
        gridBorderData: const GridBorderData(show: true, color: Colors.grey[200]),
      ),
    );
  }

  Widget _buildScoreChip(String label, int score, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('$label ', style: TextStyle(color: color, fontSize: 12)),
          Text('$score', style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}

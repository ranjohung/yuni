import 'package:flutter/material.dart';
import '../../services/index.dart';
import '../../models/index.dart';
import '../../widgets/digital_human.dart';

class PartnerPage extends StatefulWidget {
  const PartnerPage({super.key});

  @override
  State<PartnerPage> createState() => _PartnerPageState();
}

class _PartnerPageState extends State<PartnerPage> with TickerProviderStateMixin {
  Partner? _partner;
  Map<String, dynamic>? _detail;
  bool _loading = true;
  String _currentEmotion = 'neutral';
  int _interactionCount = 0;
  late AnimationController _pulseController;
  late Animation<double> _pulseAnimation;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2000),
    )..repeat(reverse: true);
    _pulseAnimation = Tween<double>(begin: 0.95, end: 1.05).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
    _loadPartner();
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

  Future<void> _loadPartner() async {
    try {
      final service = PartnerService();
      final partners = await service.getPartners();
      if (partners.isNotEmpty) {
        final list = partners as List<dynamic>;
        final first = list.firstWhere(
          (p) => p['is_default'] == true,
          orElse: () => list[0],
        ) as Map<String, dynamic>;
        final detail = await service.getPartnerDetail(first['id'] as int);
        setState(() {
          _partner = Partner.fromJson(detail);
          _detail = detail;
          _loading = false;
        });
      } else {
        setState(() => _loading = false);
      }
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  void _onTapInteraction() {
    setState(() {
      _interactionCount++;
      final emotions = ['happy', 'neutral', 'surprised', 'comforting', 'happy'];
      _currentEmotion = emotions[_interactionCount % emotions.length];
    });

    // 互动好感度增长动画
    if (_partner != null && _interactionCount % 3 == 0) {
      setState(() {
        _partner = Partner(
          id: _partner!.id,
          name: _partner!.name,
          coreType: _partner!.coreType,
          relationshipType: _partner!.relationshipType,
          affinityScore: (_partner!.affinityScore + 10).clamp(0, 1000),
          affinityLevel: _partner!.affinityLevel,
          isDefault: _partner!.isDefault,
          nicknameForUser: _partner!.nicknameForUser,
        );
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    if (_loading) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (_partner == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('伴侣')),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.favorite_outline, size: 64, color: Colors.grey[300]),
              const SizedBox(height: 16),
              Text('还没有伴侣', style: TextStyle(color: Colors.grey[500], fontSize: 16)),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: () => Navigator.pushNamed(context, '/partner/create'),
                icon: const Icon(Icons.add),
                label: const Text('创建伴侣'),
              ),
            ],
          ),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(_partner!.name),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadPartner,
            tooltip: '刷新',
          ),
        ],
      ),
      body: SingleChildScrollView(
        child: Column(
          children: [
            // 数字人展示区
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 40),
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
              child: AnimatedBuilder(
                animation: _pulseAnimation,
                builder: (context, child) {
                  return Transform.scale(
                    scale: _pulseAnimation.value,
                    child: child,
                  );
                },
                child: DigitalHumanWidget(
                  name: _partner!.name,
                  coreType: _partner!.coreType,
                  emotion: _currentEmotion,
                  size: 180,
                ),
              ),
            ),

            // 情绪互动提示
            GestureDetector(
              onTap: _onTapInteraction,
              child: Container(
                margin: const EdgeInsets.symmetric(horizontal: 40),
                padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(24),
                  boxShadow: [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.05),
                      blurRadius: 10,
                      offset: const Offset(0, 2),
                    ),
                  ],
                ),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text(_interactionHint, style: TextStyle(color: Colors.grey[600])),
                    const SizedBox(width: 8),
                    Icon(Icons.touch_app, size: 16, color: Colors.grey[400]),
                  ],
                ),
              ),
            ),

            const SizedBox(height: 20),

            // 信息卡片
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 16),
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 10,
                  ),
                ],
              ),
              child: Column(
                children: [
                  // 名称+类型
                  Row(
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Text(_partner!.name,
                                  style: const TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
                                const SizedBox(width: 8),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: theme.colorScheme.primaryContainer,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(_partner!.coreTypeName,
                                    style: TextStyle(fontSize: 12, color: theme.colorScheme.primary)),
                                ),
                              ],
                            ),
                            const SizedBox(height: 4),
                            Text(_partner!.relationshipType, style: TextStyle(color: Colors.grey[500])),
                          ],
                        ),
                      ),
                    ],
                  ),

                  const SizedBox(height: 20),

                  // 好感度进度
                  Row(
                    children: [
                      Text('好感度', style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(width: 8),
                      Expanded(
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: (_partner!.affinityScore / 1000).clamp(0.0, 1.0),
                            minHeight: 8,
                            color: Colors.red[300],
                            backgroundColor: Colors.red[50],
                          ),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Text('${_partner!.affinityScore}/1000', style: TextStyle(
                        color: Colors.red[400], fontWeight: FontWeight.w600, fontSize: 13)),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      const Spacer(),
                      Text('当前关系：${_partner!.affinityLevelName}',
                        style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                    ],
                  ),

                  const SizedBox(height: 24),

                  // 能力维度
                  if (_detail != null) ...[
                    _buildStatRow('沟通力', _detail!['communication'] ?? 30),
                    _buildStatRow('表达力', _detail!['expression'] ?? 30),
                    _buildStatRow('共情力', _detail!['empathy'] ?? 30),
                  ],
                ],
              ),
            ),

            const SizedBox(height: 20),

            // 操作按钮
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: FilledButton.icon(
                        onPressed: () => Navigator.pushNamed(context, '/chat', arguments: _partner!.id),
                        icon: const Icon(Icons.chat_bubble),
                        label: const Text('聊天'),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: SizedBox(
                      height: 48,
                      child: OutlinedButton.icon(
                        onPressed: () => Navigator.pushNamed(context, '/simulation'),
                        icon: const Icon(Icons.sports_esports),
                        label: const Text('模拟训练'),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 32),
          ],
        ),
      ),
    );
  }

  String get _interactionHint {
    final hints = [
      '点我互动 ✨',
      '戳戳看 👋', 
      '说点什么吧 💬',
      '我在听 👂',
    ];
    return hints[_interactionCount % hints.length];
  }

  Widget _buildStatRow(String label, int value) {
    final clamped = value.clamp(0, 100);
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Row(
        children: [
          SizedBox(width: 60, child: Text(label, style: TextStyle(color: Colors.grey[600], fontSize: 13))),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(3),
              child: LinearProgressIndicator(
                value: clamped / 100,
                minHeight: 6,
                color: clamped > 60 ? Colors.green[400] : Colors.orange[400],
                backgroundColor: Colors.grey[100],
              ),
            ),
          ),
          SizedBox(width: 30, child: Text('$clamped', textAlign: TextAlign.right,
            style: TextStyle(fontWeight: FontWeight.w600, fontSize: 13))),
        ],
      ),
    );
  }
}

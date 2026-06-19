import 'package:flutter/material.dart';
import '../../services/index.dart';
import '../../models/index.dart';

class PartnerPage extends StatefulWidget {
  const PartnerPage({super.key});

  @override
  State<PartnerPage> createState() => _PartnerPageState();
}

class _PartnerPageState extends State<PartnerPage> {
  Partner? _partner;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadPartner();
  }

  Future<void> _loadPartner() async {
    try {
      final service = PartnerService();
      final partners = await service.getPartners();
      if (partners.isNotEmpty) {
        final defaultPartner = partners.cast<Map<String, dynamic>>().firstWhere(
          (p) => p['is_default'] == true,
          orElse: () => partners[0] as Map<String, dynamic>,
        );
        final detail = await service.getPartnerDetail(defaultPartner['id']);
        setState(() {
          _partner = Partner.fromJson(detail);
          _loading = false;
        });
      } else {
        setState(() => _loading = false);
      }
    } catch (e) {
      setState(() => _loading = false);
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
            icon: const Icon(Icons.edit_outlined),
            onPressed: () => Navigator.pushNamed(context, '/partner/edit', arguments: _partner!.id),
          ),
        ],
      ),
      body: Column(
        children: [
          // 数字人展示区
          Expanded(
            flex: 7,
            child: Container(
              width: double.infinity,
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
              child: Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    CircleAvatar(
                      radius: 60,
                      backgroundColor: theme.colorScheme.primary.withOpacity(0.1),
                      child: Icon(Icons.person, size: 60, color: theme.colorScheme.primary),
                    ),
                    const SizedBox(height: 8),
                    GestureDetector(
                      onTap: () {
                        // 触发随机互动
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.8),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text('点击互动 👋', style: TextStyle(color: Colors.grey[500])),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),

          // 信息区
          Expanded(
            flex: 3,
            child: Container(
              padding: const EdgeInsets.all(16),
              decoration: const BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Text(_partner!.name,
                        style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
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
                      const Spacer(),
                      Text('❤️ ${_partner!.affinityLevelName}',
                        style: TextStyle(color: Colors.red[400], fontWeight: FontWeight.w500)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  // 好感度进度条
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: (_partner!.affinityScore / 1000).clamp(0.0, 1.0),
                      minHeight: 6,
                      color: Colors.red[300],
                    ),
                  ),
                  const SizedBox(height: 16),
                  // 按钮
                  Row(
                    children: [
                      Expanded(
                        child: FilledButton.icon(
                          onPressed: () {
                            Navigator.pushNamed(context, '/chat', arguments: _partner!.id);
                          },
                          icon: const Icon(Icons.chat),
                          label: const Text('💬 聊天'),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: OutlinedButton.icon(
                          onPressed: () {
                            Navigator.pushNamed(context, '/simulation');
                          },
                          icon: const Icon(Icons.sports_esports),
                          label: const Text('🎯 模拟训练'),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

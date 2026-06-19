import 'package:flutter/material.dart';
import '../../services/index.dart';

class CreatePartnerPage extends StatefulWidget {
  const CreatePartnerPage({super.key});

  @override
  State<CreatePartnerPage> createState() => _CreatePartnerPageState();
}

class _CreatePartnerPageState extends State<CreatePartnerPage> {
  final PartnerService _service = PartnerService();
  List<dynamic> _presets = [];
  bool _loading = true;
  int? _selectedIndex;
  final _nameController = TextEditingController();
  final _nicknameController = TextEditingController();

  @override
  void initState() {
    super.initState();
    _loadPresets();
  }

  Future<void> _loadPresets() async {
    try {
      final data = await _service.getPresets();
      setState(() {
        _presets = data;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
    }
  }

  Future<void> _createPartner() async {
    if (_selectedIndex == null) return;
    final preset = _presets[_selectedIndex!];

    try {
      await _service.createPartner(
        name: _nameController.text.isNotEmpty ? _nameController.text : preset['name'],
        coreType: preset['coreType'],
        relationshipType: '朋友',
        nicknameForUser: _nicknameController.text.isNotEmpty ? _nicknameController.text : null,
      );
      
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('伴侣创建成功！')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('创建失败: $e')),
        );
      }
    }
  }

  String _coreTypeName(String type) {
    switch (type) {
      case 'pursuer': return '追寻者';
      case 'guardian': return '守护者';
      case 'wanderer': return '流浪者';
      case 'healer': return '疗愈者';
      default: return type;
    }
  }

  String _coreTypeEmoji(String type) {
    switch (type) {
      case 'pursuer': return '🔍';
      case 'guardian': return '🛡️';
      case 'wanderer': return '🌊';
      case 'healer': return '💚';
      default: return '🤖';
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('创建伴侣')),
      body: _loading
        ? const Center(child: CircularProgressIndicator())
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const Text('选择核心风格',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
              const SizedBox(height: 4),
              Text('每个伴侣都有独特的性格和互动方式',
                style: TextStyle(color: Colors.grey[500])),
              const SizedBox(height: 16),

              // 预设角色选择
              ...List.generate(_presets.length, (i) {
                final p = _presets[i];
                final selected = _selectedIndex == i;
                return Card(
                  color: selected ? theme.colorScheme.primaryContainer : null,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(12),
                    onTap: () => setState(() => _selectedIndex = i),
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 24,
                            backgroundColor: selected
                              ? theme.colorScheme.primary
                              : Colors.grey[200],
                            child: Text(_coreTypeEmoji(p['coreType']),
                              style: const TextStyle(fontSize: 22)),
                          ),
                          const SizedBox(width: 16),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    Text(p['name'],
                                      style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 16,
                                        color: selected ? theme.colorScheme.primary : null,
                                      )),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                                      decoration: BoxDecoration(
                                        color: theme.colorScheme.secondaryContainer,
                                        borderRadius: BorderRadius.circular(8),
                                      ),
                                      child: Text(_coreTypeName(p['coreType']),
                                        style: TextStyle(fontSize: 11, color: theme.colorScheme.secondary)),
                                    ),
                                  ],
                                ),
                                const SizedBox(height: 2),
                                Text(p['description'] ?? '',
                                  style: TextStyle(color: Colors.grey[600], fontSize: 13)),
                              ],
                            ),
                          ),
                          if (selected)
                            Icon(Icons.check_circle, color: theme.colorScheme.primary),
                        ],
                      ),
                    ),
                  ),
                );
              }),

              if (_selectedIndex != null) ...[
                const SizedBox(height: 24),
                const Text('自定义设置（可选）',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600)),
                const SizedBox(height: 12),
                TextField(
                  controller: _nameController,
                  decoration: InputDecoration(
                    labelText: '伴侣昵称',
                    hintText: _presets[_selectedIndex!]['name'],
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 12),
                TextField(
                  controller: _nicknameController,
                  decoration: InputDecoration(
                    labelText: 'TA怎么称呼你',
                    hintText: '输入TA对你的昵称',
                    border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
                const SizedBox(height: 24),
                SizedBox(
                  width: double.infinity,
                  child: FilledButton(
                    onPressed: _createPartner,
                    child: const Text('创建伴侣', style: TextStyle(fontSize: 16)),
                  ),
                ),
              ],
            ],
          ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _nicknameController.dispose();
    super.dispose();
  }
}

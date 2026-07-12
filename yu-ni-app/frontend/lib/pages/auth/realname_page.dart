import 'package:flutter/material.dart';
import '../../services/index.dart';

class RealNameVerifyPage extends StatefulWidget {
  const RealNameVerifyPage({super.key});

  @override
  State<RealNameVerifyPage> createState() => _RealNameVerifyPageState();
}

class _RealNameVerifyPageState extends State<RealNameVerifyPage> {
  final _nameController = TextEditingController();
  final _idController = TextEditingController();
  bool _loading = false;
  bool _verified = false;

  Future<void> _submit() async {
    final name = _nameController.text.trim();
    final idCard = _idController.text.trim();

    if (name.isEmpty || idCard.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('请填写姓名和身份证号')),
      );
      return;
    }

    setState(() => _loading = true);

    try {
      await UserService().verifyRealName(name, idCard);
      setState(() {
        _verified = true;
        _loading = false;
      });
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('实名认证成功')),
        );
        Navigator.pop(context, true);
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('认证失败，请检查信息')),
        );
      }
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('实名认证')),
      body: _verified
        ? Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(Icons.check_circle, size: 64, color: Colors.green[400]),
                const SizedBox(height: 16),
                const Text('认证成功', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('你可以使用全部功能了', style: TextStyle(color: Colors.grey[600])),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () => Navigator.pop(context, true),
                  child: const Text('完成'),
                ),
              ],
            ),
          )
        : ListView(
            padding: const EdgeInsets.all(16),
            children: [
              const SizedBox(height: 16),
              const Icon(Icons.verified, size: 48, color: Colors.blue),
              const SizedBox(height: 16),
              const Text('身份验证', textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              Text('根据法规要求，使用亲密功能需要实名认证',
                textAlign: TextAlign.center, style: TextStyle(color: Colors.grey[600])),
              const SizedBox(height: 32),
              TextField(
                controller: _nameController,
                decoration: InputDecoration(
                  labelText: '真实姓名',
                  prefixIcon: const Icon(Icons.person),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 16),
              TextField(
                controller: _idController,
                decoration: InputDecoration(
                  labelText: '身份证号',
                  prefixIcon: const Icon(Icons.badge),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
              const SizedBox(height: 8),
              Text('信息仅用于实名验证，不会存储明文',
                style: TextStyle(color: Colors.grey[400], fontSize: 12)),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity, height: 50,
                child: FilledButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                    ? const CircularProgressIndicator(strokeWidth: 2, color: Colors.white)
                    : const Text('提交验证', style: TextStyle(fontSize: 16)),
                ),
              ),
            ],
          ),
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _idController.dispose();
    super.dispose();
  }
}

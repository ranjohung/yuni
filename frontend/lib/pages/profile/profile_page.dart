import 'package:flutter/material.dart';

class ProfilePage extends StatelessWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(title: const Text('我的')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          // 用户信息
          Card(
            child: ListTile(
              leading: CircleAvatar(
                radius: 24,
                backgroundColor: theme.colorScheme.primaryContainer,
                child: Icon(Icons.person, color: theme.colorScheme.primary),
              ),
              title: const Text('用户昵称'),
              subtitle: const Text('体验版'),
              trailing: TextButton(
                onPressed: () => Navigator.pushNamed(context, '/membership'),
                child: const Text('升级'),
              ),
            ),
          ),
          const SizedBox(height: 16),

          // 功能列表
          Card(
            child: Column(
              children: [
                _buildMenuItem(context, Icons.face, '我的形象', () => Navigator.pushNamed(context, '/profile/avatar')),
                const Divider(height: 1),
                _buildMenuItem(context, Icons.favorite_outline, '伴侣设置', () => Navigator.pushNamed(context, '/partner')),
                const Divider(height: 1),
                _buildMenuItem(context, Icons.auto_stories, '关系回忆录', () {}),
                const Divider(height: 1),
                _buildMenuItem(context, Icons.collections_bookmark, '学习卡片库', () {}),
                const Divider(height: 1),
                _buildMenuItem(context, Icons.auto_awesome, '变美联动', () {}),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 会员中心
          Card(
            child: ListTile(
              leading: Icon(Icons.workspace_premium, color: Colors.amber[700]),
              title: const Text('会员中心'),
              subtitle: const Text('查看会员权益对比'),
              trailing: const Icon(Icons.arrow_forward_ios, size: 16),
              onTap: () => Navigator.pushNamed(context, '/membership'),
            ),
          ),
          const SizedBox(height: 16),

          // 设置
          Card(
            child: Column(
              children: [
                _buildMenuItem(context, Icons.privacy_tip_outlined, '隐私与数据', () {}),
                const Divider(height: 1),
                _buildMenuItem(context, Icons.info_outline, '关于', () {}),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // 退出登录
          SizedBox(
            width: double.infinity,
            child: OutlinedButton(
              onPressed: () {},
              style: OutlinedButton.styleFrom(foregroundColor: Colors.red),
              child: const Text('退出登录'),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, IconData icon, String title, VoidCallback onTap) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      trailing: const Icon(Icons.arrow_forward_ios, size: 16),
      onTap: onTap,
    );
  }
}

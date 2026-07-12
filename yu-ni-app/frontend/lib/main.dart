import 'package:flutter/material.dart';
import 'services/api_client.dart';
import 'pages/auth/login_page.dart';
import 'pages/home/home_page.dart';
import 'pages/partner/partner_page.dart';
import 'pages/simulation/simulation_page.dart';
import 'pages/growth/growth_page.dart';
import 'pages/profile/profile_page.dart';

import 'pages/chat/chat_page.dart';
import 'pages/simulation/scenario_detail_page.dart';
import 'pages/partner/create_partner_page.dart';
import 'pages/auth/realname_page.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiClient().init();
  runApp(const YuNiApp());
}

class YuNiApp extends StatelessWidget {
  const YuNiApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: '与你',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF7C6CF8),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        fontFamily: 'PingFang SC',
        appBarTheme: const AppBarTheme(
          centerTitle: true,
          elevation: 0,
        ),
      ),
      // 如果有token直接进主页，否则去登录
      home: ApiClient().hasToken ? const MainScaffold() : const LoginPage(),
      onGenerateRoute: (settings) {
        switch (settings.name) {
          case '/home':
            return MaterialPageRoute(builder: (_) => const MainScaffold());
          case '/chat':
            final args = settings.arguments as int;
            return MaterialPageRoute(builder: (_) => ChatPage(partnerId: args));
          case '/simulation/detail':
            final args = settings.arguments as int;
            return MaterialPageRoute(builder: (_) => ScenarioDetailPage(scenarioId: args));
          case '/partner/create':
            return MaterialPageRoute(builder: (_) => const CreatePartnerPage());
          case '/realname':
            return MaterialPageRoute(builder: (_) => const RealNameVerifyPage());
          default:
            return MaterialPageRoute(builder: (_) => const LoginPage());
        }
      },
    );
  }
}

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _currentIndex = 0;

  final List<Widget> _pages = const [
    HomePage(),
    PartnerPage(),
    SimulationPage(),
    GrowthPage(),
    ProfilePage(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        onDestinationSelected: (index) {
          setState(() => _currentIndex = index);
        },
        destinations: const [
          NavigationDestination(icon: Icon(Icons.home_outlined), selectedIcon: Icon(Icons.home), label: '首页'),
          NavigationDestination(icon: Icon(Icons.favorite_outline), selectedIcon: Icon(Icons.favorite), label: '伴侣'),
          NavigationDestination(icon: Icon(Icons.sports_esports_outlined), selectedIcon: Icon(Icons.sports_esports), label: '模拟'),
          NavigationDestination(icon: Icon(Icons.trending_up_outlined), selectedIcon: Icon(Icons.trending_up), label: '成长'),
          NavigationDestination(icon: Icon(Icons.person_outline), selectedIcon: Icon(Icons.person), label: '我的'),
        ],
      ),
    );
  }
}

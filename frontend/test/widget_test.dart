import 'package:flutter_test/flutter_test.dart';
import 'package:yu_ni_app/main.dart';

void main() {
  testWidgets('App should build successfully', (WidgetTester tester) async {
    await tester.pumpWidget(const YuNiApp());
    await tester.pump();
    // 验证底部导航栏存在（5个Tab）
    expect(find.text('首页'), findsOneWidget);
    expect(find.text('伴侣'), findsOneWidget);
    expect(find.text('模拟'), findsOneWidget);
    expect(find.text('成长'), findsOneWidget);
    expect(find.text('我的'), findsOneWidget);
  });
}

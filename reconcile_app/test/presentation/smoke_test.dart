import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:reconcile_app/main.dart';

void main() {
  testWidgets('ReconcileApp launches cleanly with Home Dashboard', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: ReconcileApp(),
      ),
    );
    await tester.pumpAndSettle();

    // Verify Reconcile Header and Home Dashboard elements
    expect(find.text('RECONCILE'), findsOneWidget);
    expect(find.text('Your subscriptions'), findsOneWidget);
    expect(find.text('Total monthly spend'), findsOneWidget);
    expect(find.text('Upcoming this week'), findsOneWidget);
    expect(find.text('Netflix'), findsWidgets);
    expect(find.text('Spotify'), findsWidgets);

    // Verify Bottom Navigation items
    expect(find.text('Home'), findsOneWidget);
    expect(find.text('Explore'), findsOneWidget);
    expect(find.text('Saved'), findsOneWidget);
    expect(find.text('Profile'), findsOneWidget);
  });
}

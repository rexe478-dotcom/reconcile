import 'package:flutter_test/flutter_test.dart';
import 'package:reconcile_app/core/utils/currency_formatter.dart';

void main() {
  group('CurrencyFormatter', () {
    test('formats whole Naira numbers without decimal places', () {
      expect(CurrencyFormatter.format(24500), '₦24,500');
      expect(CurrencyFormatter.format(7500), '₦7,500');
      expect(CurrencyFormatter.format(2500), '₦2,500');
      expect(CurrencyFormatter.format(14000), '₦14,000');
      expect(CurrencyFormatter.format(4000), '₦4,000');
    });

    test('formats fractional numbers with decimal places', () {
      expect(CurrencyFormatter.format(24500.50), '₦24,500.50');
    });

    test('supports custom currency symbols', () {
      expect(CurrencyFormatter.format(15.99, currencySymbol: '\$'), '\$15.99');
    });
  });
}

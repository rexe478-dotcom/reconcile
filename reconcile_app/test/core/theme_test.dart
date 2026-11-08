import 'package:flutter_test/flutter_test.dart';
import 'package:reconcile_app/core/theme/app_colors.dart';
import 'package:reconcile_app/core/theme/app_theme.dart';

void main() {
  group('AppTheme & Color Tokens', () {
    test('theme colors are properly defined', () {
      final theme = AppTheme.lightTheme;
      expect(theme.scaffoldBackgroundColor, AppColors.background);
      expect(theme.colorScheme.primary, AppColors.accent);
      expect(theme.colorScheme.surface, AppColors.surface);
      expect(theme.colorScheme.error, AppColors.error);
    });

    test('primary accent matches expected palette value', () {
      expect(AppColors.accent.toARGB32(), 0xFF3D5438);
      expect(AppColors.background.toARGB32(), 0xFFFAF8F5);
    });
  });
}

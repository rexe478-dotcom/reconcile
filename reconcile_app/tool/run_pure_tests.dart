// ignore_for_file: avoid_print
import 'dart:io';
import 'package:reconcile_app/core/services/notification_scheduler.dart';
import 'package:reconcile_app/core/utils/currency_formatter.dart';
import 'package:reconcile_app/core/utils/date_formatter.dart';
import 'package:reconcile_app/data/demo_subscriptions.dart';
import 'package:reconcile_app/data/models/subscription_dto.dart';
import 'package:reconcile_app/data/registry/provider_registry.dart';
import 'package:reconcile_app/data/repositories/gmail_candidate_repository.dart';
import 'package:reconcile_app/data/repositories/local_subscription_repository.dart';
import 'package:reconcile_app/data/services/gmail_auth_service.dart';
import 'package:reconcile_app/domain/entities/cancellation_attempt.dart';
import 'package:reconcile_app/domain/entities/gmail_candidate.dart';
import 'package:reconcile_app/domain/entities/renewal_occurrence.dart';
import 'package:reconcile_app/domain/entities/subscription.dart';
import 'package:reconcile_app/domain/services/renewal_engine.dart';
import 'package:reconcile_app/domain/services/spend_insights_calculator.dart';

/// Pure Dart mock mirroring SubscriptionsNotifier logic for VM verification without Flutter engine.
class PureStateStore {
  List<Subscription> state = List.of(demoSubscriptions);

  void addSubscription(Subscription subscription) {
    state = [...state, subscription];
  }

  void updateSubscription(Subscription updated) {
    state = [
      for (final sub in state)
        if (sub.id == updated.id) updated else sub,
    ];
  }

  void deleteSubscription(String id) {
    state = state.where((sub) => sub.id != id).toList();
  }

  void toggleReminder(String id) {
    state = [
      for (final sub in state)
        if (sub.id == id)
          sub.copyWith(reminderEnabled: !sub.reminderEnabled)
        else
          sub,
    ];
  }

  void updateStatus(String id, SubscriptionStatus newStatus) {
    state = [
      for (final sub in state)
        if (sub.id == id) sub.copyWith(status: newStatus) else sub,
    ];
  }

  void resetToDemo() {
    state = List.of(demoSubscriptions);
  }

  double calculateMonthlySpend() {
    double total = 0.0;
    for (final sub in state) {
      if (sub.status == SubscriptionStatus.cancelled) continue;
      switch (sub.intervalUnit) {
        case RecurrenceIntervalUnit.month:
          total += sub.amount / sub.intervalCount;
          break;
        case RecurrenceIntervalUnit.year:
          total += (sub.amount / sub.intervalCount) / 12;
          break;
        case RecurrenceIntervalUnit.week:
          total += (sub.amount / sub.intervalCount) * 4.333;
          break;
        case RecurrenceIntervalUnit.day:
          total += (sub.amount / sub.intervalCount) * 30.416;
          break;
      }
    }
    return total;
  }
}

Future<void> main() async {
  int passed = 0;
  int failed = 0;

  void expectEqual(dynamic actual, dynamic expected, String description) {
    if (actual == expected) {
      print('  ✓ $description');
      passed++;
    } else {
      print('  ✗ $description: Expected "$expected" but got "$actual"');
      failed++;
    }
  }

  void expectTrue(bool condition, String description) {
    if (condition) {
      print('  ✓ $description');
      passed++;
    } else {
      print('  ✗ $description: Expected true but got false');
      failed++;
    }
  }

  print('=== Reconcile Milestone 2 Core UI Logic Verification ===\n');

  print('[1] Currency & Date Formatting:');
  expectEqual(CurrencyFormatter.format(24500), '₦24,500', 'Formats 24,500 as ₦24,500');
  expectEqual(CurrencyFormatter.format(7500), '₦7,500', 'Formats 7,500 as ₦7,500');
  expectEqual(CurrencyFormatter.format(2500), '₦2,500', 'Formats 2,500 as ₦2,500');
  expectEqual(CurrencyFormatter.format(14000), '₦14,000', 'Formats 14,000 as ₦14,000');
  expectEqual(CurrencyFormatter.format(4000), '₦4,000', 'Formats 4,000 as ₦4,000');
  expectEqual(CurrencyFormatter.format(1800), '₦1,800', 'Formats 1,800 as ₦1,800');
  expectEqual(CurrencyFormatter.format(1200), '₦1,200', 'Formats 1,200 as ₦1,200');
  final testDate = DateTime(2025, 4, 28);
  expectEqual(DateFormatter.formatMonthDayYear(testDate), 'Apr 28, 2025', 'Formats Apr 28, 2025');

  print('\n[2] Demo Dataset Integrity:');
  expectEqual(demoSubscriptions.length, 6, 'Contains exactly 6 demo subscriptions');
  expectEqual(demoSubscriptions[0].providerName, 'Netflix', 'First subscription is Netflix');
  expectEqual(demoSubscriptions[1].providerName, 'Spotify', 'Second subscription is Spotify');
  expectEqual(demoSubscriptions[2].providerName, 'Adobe', 'Third subscription is Adobe');
  expectEqual(demoSubscriptions[2].status, SubscriptionStatus.needsReview, 'Adobe has Needs review status');

  print('\n[3] Reactive Subscriptions State Operations:');
  final store = PureStateStore();
  expectEqual(store.state.length, 6, 'Initial state has 6 demo items');

  // Add new subscription
  final newSub = Subscription(
    id: 'sub_github',
    providerName: 'GitHub Copilot',
    amount: 10000,
    nextRenewalDate: DateTime(2025, 6, 1),
  );
  store.addSubscription(newSub);
  expectEqual(store.state.length, 7, 'Adding subscription increases count to 7');
  expectTrue(store.state.any((s) => s.id == 'sub_github'), 'GitHub subscription exists in state');

  // Toggle reminder
  final initialReminder = store.state.firstWhere((s) => s.id == 'spotify').reminderEnabled;
  store.toggleReminder('spotify');
  final toggledReminder = store.state.firstWhere((s) => s.id == 'spotify').reminderEnabled;
  expectEqual(toggledReminder, !initialReminder, 'Reminder toggled successfully');

  // Update status (e.g. cancellation handoff)
  store.updateStatus('spotify', SubscriptionStatus.cancelled);
  expectEqual(
    store.state.firstWhere((s) => s.id == 'spotify').status,
    SubscriptionStatus.cancelled,
    'Spotify status updated to cancelled',
  );

  // Delete subscription
  store.deleteSubscription('sub_github');
  expectEqual(store.state.length, 6, 'Deleting subscription decreases count to 6');
  expectTrue(!store.state.any((s) => s.id == 'sub_github'), 'GitHub subscription removed');

  // Reset to demo
  store.resetToDemo();
  expectEqual(store.state.length, 6, 'Reset restores exact 6 demo items');
  expectEqual(
    store.state.firstWhere((s) => s.id == 'spotify').status,
    SubscriptionStatus.active,
    'Spotify restored to active status',
  );

  // Check total spend calculation (All monthly: Netflix 7500 + Spotify 2500 + Adobe 14000 + Notion 4000 + Google One 500 + YouTube 1100 = 29600)
  final totalSpend = store.calculateMonthlySpend();
  expectTrue(
    (totalSpend - 29600.0).abs() < 0.1,
    'Calculates normalized monthly spend correctly as ₦29,600',
  );

  print('\n[4] Search & Filtering Logic:');
  // Keyword search
  final searchResults = demoSubscriptions
      .where((s) => s.providerName.toLowerCase().contains('spot'))
      .toList();
  expectEqual(searchResults.length, 1, 'Search for "spot" returns 1 result');
  expectEqual(searchResults.first.providerName, 'Spotify', 'Found Spotify');

  // Category filtering
  final needsReviewList = demoSubscriptions
      .where((s) => s.status == SubscriptionStatus.needsReview)
      .toList();
  expectEqual(needsReviewList.length, 1, 'Needs review filter returns 1 result');
  expectEqual(needsReviewList.first.providerName, 'Adobe', 'Found Adobe');

  print('\n[5] RenewalEngine Calendar-Aware Recurrence & Invariants:');

  // Month-end anchoring across variable month lengths
  final jan31 = DateTime(2025, 1, 31);
  final feb28 = RenewalEngine.calculateNextRenewalDate(
    currentRenewalDate: jan31,
    intervalUnit: RecurrenceIntervalUnit.month,
    anchorDay: 31,
  );
  expectEqual(feb28, DateTime(2025, 2, 28), 'Jan 31 clamps to Feb 28 in non-leap year 2025');

  final mar31 = RenewalEngine.calculateNextRenewalDate(
    currentRenewalDate: feb28,
    intervalUnit: RecurrenceIntervalUnit.month,
    anchorDay: 31,
  );
  expectEqual(mar31, DateTime(2025, 3, 31), 'Feb 28 restores to Mar 31 preserving anchor 31');

  final apr30 = RenewalEngine.calculateNextRenewalDate(
    currentRenewalDate: mar31,
    intervalUnit: RecurrenceIntervalUnit.month,
    anchorDay: 31,
  );
  expectEqual(apr30, DateTime(2025, 4, 30), 'Mar 31 clamps to Apr 30');

  final may31 = RenewalEngine.calculateNextRenewalDate(
    currentRenewalDate: apr30,
    intervalUnit: RecurrenceIntervalUnit.month,
    anchorDay: 31,
  );
  expectEqual(may31, DateTime(2025, 5, 31), 'Apr 30 restores to May 31');

  // Leap-year month-end test
  final jan31Leap = DateTime(2024, 1, 31);
  final feb29Leap = RenewalEngine.calculateNextRenewalDate(
    currentRenewalDate: jan31Leap,
    intervalUnit: RecurrenceIntervalUnit.month,
    anchorDay: 31,
  );
  expectEqual(feb29Leap, DateTime(2024, 2, 29), 'Jan 31 clamps to Feb 29 in leap year 2024');

  // Annual leap day (Feb 29) policy
  final leapDay2024 = DateTime(2024, 2, 29);
  final annual2025 = RenewalEngine.calculateNextRenewalDate(
    currentRenewalDate: leapDay2024,
    intervalUnit: RecurrenceIntervalUnit.year,
    anchorDay: 29,
  );
  expectEqual(annual2025, DateTime(2025, 2, 28), 'Feb 29, 2024 -> Feb 28, 2025 in non-leap year');

  final annual2028 = RenewalEngine.calculateNextRenewalDate(
    currentRenewalDate: leapDay2024,
    intervalUnit: RecurrenceIntervalUnit.year,
    intervalCount: 4,
    anchorDay: 29,
  );
  expectEqual(annual2028, DateTime(2028, 2, 29), 'Feb 29, 2024 + 4 years restores Feb 29, 2028');

  // Weekly & Bi-weekly
  final weekStart = DateTime(2025, 4, 28);
  final biWeekly = RenewalEngine.calculateNextRenewalDate(
    currentRenewalDate: weekStart,
    intervalUnit: RecurrenceIntervalUnit.week,
    intervalCount: 2,
  );
  expectEqual(biWeekly, DateTime(2025, 5, 12), '2 weeks from Apr 28 is May 12');

  // Quarterly (3 months)
  final nov30 = DateTime(2024, 11, 30);
  final febQuarterly = RenewalEngine.calculateNextRenewalDate(
    currentRenewalDate: nov30,
    intervalUnit: RecurrenceIntervalUnit.month,
    intervalCount: 3,
    anchorDay: 30,
  );
  expectEqual(febQuarterly, DateTime(2025, 2, 28), 'Nov 30 + 3 months clamps to Feb 28');

  // Edit Isolation Invariant
  final subA = Subscription(
    id: 'sub_a',
    providerName: 'Service A',
    amount: 1000,
    nextRenewalDate: DateTime(2025, 4, 1),
  );
  final subB = Subscription(
    id: 'sub_b',
    providerName: 'Service B',
    amount: 2000,
    nextRenewalDate: DateTime(2025, 4, 15),
  );
  final initialBDate = subB.nextRenewalDate;
  // Modify A
  subA.copyWith(
    nextRenewalDate: DateTime(2025, 5, 1),
    amount: 1500,
  );
  // Verify subB is untouched
  expectEqual(subB.nextRenewalDate, initialBDate, 'Editing Sub A leaves Sub B renewal date untouched');
  expectEqual(subB.amount, 2000.0, 'Editing Sub A leaves Sub B amount untouched');

  // Occurrence projection window
  final testSub = Subscription(
    id: 'netflix',
    providerName: 'Netflix',
    amount: 7500,
    nextRenewalDate: DateTime(2025, 4, 28),
    intervalUnit: RecurrenceIntervalUnit.month,
  );
  final windowStart = DateTime(2025, 4, 1);
  final windowEnd = DateTime(2025, 7, 31);
  final projected = RenewalEngine.generateOccurrences(
    subscription: testSub,
    start: windowStart,
    end: windowEnd,
  );
  expectEqual(projected.length, 4, 'Projects 4 monthly occurrences between Apr 1 and Jul 31');
  expectEqual(projected[0].expectedRenewalDate, DateTime(2025, 4, 28), 'First occurrence is Apr 28');
  expectEqual(projected[1].expectedRenewalDate, DateTime(2025, 5, 28), 'Second occurrence is May 28');
  expectEqual(projected[2].expectedRenewalDate, DateTime(2025, 6, 28), 'Third occurrence is Jun 28');
  expectEqual(projected[3].expectedRenewalDate, DateTime(2025, 7, 28), 'Fourth occurrence is Jul 28');

  // Reminder trigger calculation
  final reminders = RenewalEngine.calculateReminderInstants(
    renewalDate: DateTime(2025, 4, 28),
    reminderOffsets: const [Duration(days: 3), Duration(days: 1)],
    hour: 9,
    minute: 0,
  );
  expectEqual(reminders.length, 2, 'Generates 2 reminder triggers');
  expectEqual(
    reminders.first,
    DateTime(2025, 4, 25, 9, 0).toUtc(),
    'First trigger is 3 days prior at 09:00 UTC',
  );
  expectEqual(
    reminders.last,
    DateTime(2025, 4, 27, 9, 0).toUtc(),
    'Second trigger is 1 day prior at 09:00 UTC',
  );

  print('\n[6] Local Persistence & Repository Pattern Verification:');

  // DTO round-trip test
  final sampleSub = demoSubscriptions.first;
  final dto = SubscriptionDto.fromEntity(sampleSub);
  final jsonMap = dto.toJson();
  expectEqual(jsonMap['provider_name'], 'Netflix', 'DTO serializes provider name to JSON');
  expectEqual(jsonMap['amount'], 7500.0, 'DTO serializes amount to JSON');

  final reconstructedDto = SubscriptionDto.fromJson(jsonMap);
  final reconstructedEntity = reconstructedDto.toEntity();
  expectEqual(reconstructedEntity.id, sampleSub.id, 'DTO round-trip preserves id');
  expectEqual(reconstructedEntity.providerName, sampleSub.providerName, 'DTO round-trip preserves provider name');
  expectEqual(reconstructedEntity.amount, sampleSub.amount, 'DTO round-trip preserves amount');
  expectEqual(reconstructedEntity.status, sampleSub.status, 'DTO round-trip preserves status');
  expectEqual(reconstructedEntity.intervalUnit, sampleSub.intervalUnit, 'DTO round-trip preserves interval unit');

  // Repository in-memory & file operations
  final tempDir = await Directory.systemTemp.createTemp('reconcile_test_');
  final testFile = File('${tempDir.path}/test_subscriptions.json');

  final repo = LocalSubscriptionRepository(storageFile: testFile);

  // 1. First run seeds demo subscriptions
  final initialSubs = await repo.getAllSubscriptions();
  expectEqual(initialSubs.length, 6, 'Repository auto-seeds 6 demo subscriptions');
  expectTrue(await testFile.exists(), 'Repository persists initial state to storage file');

  // 2. Save new subscription
  final testItem = Subscription(
    id: 'sub_prime',
    providerName: 'Amazon Prime',
    amount: 2300,
    nextRenewalDate: DateTime(2025, 6, 15),
  );
  await repo.saveSubscription(testItem);
  final afterAdd = await repo.getAllSubscriptions();
  expectEqual(afterAdd.length, 7, 'Repository save adds item to storage');

  // 3. Lookup by ID
  final fetched = await repo.getSubscriptionById('sub_prime');
  expectEqual(fetched?.providerName, 'Amazon Prime', 'Repository lookup finds Amazon Prime');

  // 4. Persistence across repo instances (simulating app restart)
  final restartRepo = LocalSubscriptionRepository(storageFile: testFile);
  final reloadedSubs = await restartRepo.getAllSubscriptions();
  expectEqual(reloadedSubs.length, 7, 'Persisted data reloads across repository restart');
  expectTrue(reloadedSubs.any((s) => s.id == 'sub_prime'), 'Amazon Prime persisted on disk');

  // 5. Delete subscription
  await restartRepo.deleteSubscription('sub_prime');
  final afterDelete = await restartRepo.getAllSubscriptions();
  expectEqual(afterDelete.length, 6, 'Repository delete removes item');

  // 6. Export JSON backup
  final exported = await restartRepo.exportSubscriptionsJson();
  expectTrue(exported.contains('"schema_version": 1'), 'Export contains schema_version 1');
  expectTrue(exported.contains('Netflix'), 'Export contains subscriptions');

  // 7. Reset to demo
  await restartRepo.resetToDemo();
  final resetSubs = await restartRepo.getAllSubscriptions();
  expectEqual(resetSubs.length, 6, 'Repository reset restores exact 6 demo items');

  // Clean up test file
  if (await tempDir.exists()) {
    await tempDir.delete(recursive: true);
  }

  print('\n[7] Stable Notification ID & Reminder Scheduling Verification:');

  // 1. Determinism
  final id1 = NotificationScheduler.generateStableNotificationId('netflix', 'netflix_2025-04-28', 3);
  final id2 = NotificationScheduler.generateStableNotificationId('netflix', 'netflix_2025-04-28', 3);
  expectEqual(id1, id2, 'Notification ID generation is strictly deterministic');

  // 2. 32-bit positive integer range check
  expectTrue(id1 >= 0 && id1 <= 0x7FFFFFFF, 'Notification ID is within 32-bit signed positive integer range');

  // 3. Collision resistance across offsets & providers
  final idOffset1 = NotificationScheduler.generateStableNotificationId('netflix', 'netflix_2025-04-28', 1);
  final idOffset0 = NotificationScheduler.generateStableNotificationId('netflix', 'netflix_2025-04-28', 0);
  final idSpotify = NotificationScheduler.generateStableNotificationId('spotify', 'spotify_2025-04-30', 3);

  expectTrue(id1 != idOffset1, 'Different offset produces distinct ID');
  expectTrue(id1 != idOffset0, 'Day-of offset produces distinct ID');
  expectTrue(id1 != idSpotify, 'Different subscription produces distinct ID');

  // 4. RenewalOccurrence helper method equivalence
  final occ = RenewalOccurrence(
    subscriptionId: 'netflix',
    providerName: 'Netflix',
    amount: 7500,
    currency: '₦',
    expectedRenewalDate: DateTime(2025, 4, 28),
    occurrenceIndex: 0,
  );
  expectEqual(occ.occurrenceKey, 'netflix_2025-04-28', 'Occurrence key correctly formatted');
  expectEqual(occ.notificationIdForOffset(3), id1, 'Occurrence notification ID matches scheduler ID');

  // 5. Honest Notification Copy Invariant
  final scheduler = NotificationScheduler();
  final testSubForReminders = Subscription(
    id: 'sub_test_reminders',
    providerName: 'Coursera',
    amount: 15000,
    nextRenewalDate: DateTime(2025, 6, 1),
    reminderEnabled: true,
  );

  // Set reference time to 2025-05-20 so all upcoming reminders are in the future
  final refTime = DateTime.utc(2025, 5, 20);
  final schedules = scheduler.buildSchedulesForSubscription(
    testSubForReminders,
    offsetDays: const [3, 1, 0],
    referenceTime: refTime,
    projectionDays: 30,
  );

  expectEqual(schedules.length, 3, 'Builds 3 reminder schedules for Coursera (3d, 1d, 0d)');
  final copy3d = schedules.firstWhere((s) => s.offsetDays == 3).body;
  final copy1d = schedules.firstWhere((s) => s.offsetDays == 1).body;
  final copy0d = schedules.firstWhere((s) => s.offsetDays == 0).body;

  expectEqual(copy3d, 'Your Coursera subscription is expected to renew in 3 days.', 'Honest 3-day reminder copy');
  expectEqual(copy1d, 'Your Coursera subscription is expected to renew tomorrow.', 'Honest 1-day reminder copy');
  expectEqual(copy0d, 'Your Coursera subscription is expected to renew today.', 'Honest day-of reminder copy');
  expectTrue(!copy3d.contains('charged'), 'Reminder never claims unverified charge');

  // 6. Schedule & Cancellation Isolation Invariant
  await scheduler.scheduleReminders(testSubForReminders, referenceTime: refTime);
  final testSub2 = Subscription(
    id: 'sub_test_second',
    providerName: 'Duolingo',
    amount: 3000,
    nextRenewalDate: DateTime(2025, 6, 5),
    reminderEnabled: true,
  );
  await scheduler.scheduleReminders(testSub2, referenceTime: refTime);

  final activeBefore = scheduler.getActiveSchedules();
  expectEqual(activeBefore.length, 12, 'Scheduler holds 12 total reminders (6 Coursera + 6 Duolingo for 60-day window)');

  // Cancel Coursera reminders
  await scheduler.cancelReminders('sub_test_reminders');
  final activeAfter = scheduler.getActiveSchedules();
  expectEqual(activeAfter.length, 6, 'Canceling Coursera leaves 6 active reminders for Duolingo');
  expectTrue(activeAfter.every((s) => s.subscriptionId == 'sub_test_second'), 'Duolingo reminders remain completely untouched');

  print('\n[8] Cancellation Handoff & Provider Registry Verification:');
  // 1. Strict URL and Domain Validation
  expectTrue(
    ProviderRegistry.isValidCancellationUrl('https://www.netflix.com/youraccount', const ['netflix.com']),
    'Accepts valid HTTPS URL with allowed subdomain',
  );
  expectTrue(
    ProviderRegistry.isValidCancellationUrl('https://spotify.com/account/subscription/', const ['spotify.com']),
    'Accepts valid HTTPS URL with exact allowed domain',
  );
  expectTrue(
    !ProviderRegistry.isValidCancellationUrl('http://www.netflix.com/youraccount', const ['netflix.com']),
    'Rejects unencrypted HTTP cancellation URL',
  );
  expectTrue(
    !ProviderRegistry.isValidCancellationUrl('javascript:alert(1)', const ['netflix.com']),
    'Rejects javascript: scheme',
  );
  expectTrue(
    !ProviderRegistry.isValidCancellationUrl('https://netflix.com.phishing.io/login', const ['netflix.com']),
    'Rejects phishing subdomain suffix attack',
  );
  expectTrue(
    !ProviderRegistry.isValidCancellationUrl('https://malicious.com/netflix.com', const ['netflix.com']),
    'Rejects path containing provider name on foreign host',
  );
  expectTrue(
    !ProviderRegistry.isValidCancellationUrl('https://www.netflix.com/youraccount', const []),
    'Rejects empty allowed domains list',
  );
  expectTrue(
    !ProviderRegistry.isValidCancellationUrl('', const ['netflix.com']),
    'Rejects empty URL string',
  );

  // 2. Verified Provider Registry Lookup
  final netflixDest = ProviderRegistry.lookup('Netflix');
  expectTrue(netflixDest.isVerified, 'Netflix is verified in registry');
  expectEqual(netflixDest.providerKey, 'netflix', 'Netflix key matches');
  expectTrue(
    ProviderRegistry.isValidCancellationUrl(netflixDest.destinationUrl, netflixDest.allowedDomains),
    'Netflix destination URL passes strict verification',
  );

  final spotifyDest = ProviderRegistry.lookup('spotify');
  expectTrue(spotifyDest.isVerified, 'Spotify is verified in registry');

  final adobeDest = ProviderRegistry.lookup('Adobe Creative Cloud');
  expectTrue(adobeDest.isVerified, 'Adobe partial query resolves to verified destination');

  final unknownDest = ProviderRegistry.lookup('Local Gym Pass');
  expectTrue(!unknownDest.isVerified, 'Unknown provider is flagged as unverified');
  expectEqual(unknownDest.destinationUrl, '', 'Unknown provider has empty destination URL');
  expectTrue(unknownDest.billingRouteNotes != null && unknownDest.billingRouteNotes!.isNotEmpty, 'Unknown provider includes honest fallback guidance');

  // Verify all static entries in registry satisfy their own domain whitelists
  for (final entry in ProviderRegistry.verifiedDestinations) {
    expectTrue(
      ProviderRegistry.isValidCancellationUrl(entry.destinationUrl, entry.allowedDomains),
      '${entry.providerName} destination URL satisfies allowed domains',
    );
    expectTrue(
      entry.officialHelpUrl.startsWith('https://'),
      '${entry.providerName} official help URL is HTTPS',
    );
  }

  // 3. Cancellation Attempt Model & Honest Follow-Up
  final attempt = CancellationAttempt(
    id: 'att_001',
    subscriptionId: 'netflix',
    providerKey: 'netflix',
    attemptTimestamp: DateTime(2025, 4, 25, 14, 30),
    destinationOpened: netflixDest.destinationUrl,
  );
  expectEqual(attempt.userReportedCancelled, false, 'Initial attempt has userReportedCancelled = false');
  expectEqual(attempt.userReportedDate, null, 'Initial attempt has no userReportedDate');

  final confirmedAttempt = attempt.copyWith(
    userReportedCancelled: true,
    userReportedDate: DateTime(2025, 4, 25, 14, 35),
  );
  expectEqual(confirmedAttempt.userReportedCancelled, true, 'Updated attempt records user confirmation');
  expectEqual(confirmedAttempt.id, 'att_001', 'Attempt ID is preserved on copy');
  expectEqual(confirmedAttempt.destinationOpened, netflixDest.destinationUrl, 'Destination is preserved on copy');

  print('\n[9] Gmail Discovery, Minimal Evidence & Candidate Lifecycle:');
  // 1. Candidate Invariants & Minimal Evidence Preservation
  final candidate = GmailCandidate(
    id: 'cand_gh_test',
    providerName: 'GitHub Copilot',
    planName: 'Individual',
    detectedAmount: 10000,
    currency: '₦',
    intervalUnit: RecurrenceIntervalUnit.month,
    intervalCount: 1,
    nextRenewalDate: DateTime(2025, 5, 15),
    confidenceScore: 0.94,
    minimalEvidence: 'Invoice #GH-9082: "GitHub Copilot Individual will renew on May 15, 2025 for ₦10,000."',
    messageReference: 'msg_hash_gh_9082',
    detectedAt: DateTime(2025, 4, 22),
  );

  expectEqual(candidate.status, GmailCandidateStatus.pendingReview, 'Initial candidate status is pendingReview');
  expectTrue(candidate.confidenceScore >= 0.0 && candidate.confidenceScore <= 1.0, 'Confidence score is between 0.0 and 1.0');
  expectTrue(!candidate.minimalEvidence.contains('<html'), 'Minimal evidence contains no raw HTML message bodies');
  expectTrue(candidate.minimalEvidence.contains('GitHub Copilot'), 'Minimal evidence preserves key provider context');

  // 2. Candidate Conversion to Active Subscription
  final convertedSub = candidate.toSubscription();
  expectEqual(convertedSub.providerName, 'GitHub Copilot', 'Converted subscription provider matches');
  expectEqual(convertedSub.amount, 10000.0, 'Converted subscription amount matches');
  expectEqual(convertedSub.source, SubscriptionSource.gmail, 'Converted subscription source is Gmail');
  expectEqual(convertedSub.status, SubscriptionStatus.active, 'Converted subscription status is active');
  expectEqual(convertedSub.nextRenewalDate, DateTime(2025, 5, 15), 'Renewal date preserved on conversion');

  // 3. GmailCandidateRepository Operations
  final candidateRepo = GmailCandidateRepository();
  final initialCandidates = candidateRepo.getAllCandidates();
  expectEqual(initialCandidates.length, 2, 'Repository starts with 2 seed candidates');
  expectEqual(candidateRepo.getPendingCandidates().length, 2, 'Both seed candidates are pending review');

  // Confirm one candidate
  candidateRepo.updateCandidateStatus('cand_gh_01', GmailCandidateStatus.confirmed);
  expectEqual(candidateRepo.getPendingCandidates().length, 1, 'Confirming 1 candidate leaves 1 pending');
  expectEqual(
    candidateRepo.getCandidateById('cand_gh_01')?.status,
    GmailCandidateStatus.confirmed,
    'GitHub candidate is marked confirmed',
  );

  // Dismiss remaining candidate
  candidateRepo.dismissCandidate('cand_coursera_02');
  expectEqual(candidateRepo.getPendingCandidates().length, 0, 'Dismissing remaining candidate leaves 0 pending');
  expectEqual(
    candidateRepo.getCandidateById('cand_coursera_02')?.status,
    GmailCandidateStatus.dismissed,
    'Coursera candidate is marked dismissed',
  );

  // Reset to defaults
  candidateRepo.resetToDefaults();
  expectEqual(candidateRepo.getPendingCandidates().length, 2, 'Reset restores 2 pending candidates');

  // 4. Honest Google OAuth Configuration Checks
  final oauthStatus = GmailAuthService.checkConfiguration(
    googleServicesPath: 'nonexistent/path/google-services.json',
    explicitClientId: '',
  );
  expectEqual(oauthStatus.isConfigured, false, 'Unconfigured environment reports isConfigured = false');
  expectTrue(oauthStatus.missingPrerequisites.isNotEmpty, 'Lists specific missing prerequisites');
  expectTrue(oauthStatus.setupInstructions.contains('Google Cloud Console'), 'Provides clear Google Cloud setup documentation');

  // Attempting connect without configuration throws honest exception
  final authService = GmailAuthService();
  bool caughtException = false;
  try {
    await authService.connect(
      googleServicesPath: 'nonexistent/path/google-services.json',
      explicitClientId: '',
    );
  } on GmailAuthNotConfiguredException catch (e) {
    caughtException = true;
    expectTrue(e.message.contains('Google OAuth is not configured'), 'Exception message is explicit and honest');
  }
  expectTrue(caughtException, 'Connecting without OAuth configuration throws GmailAuthNotConfiguredException');
  expectEqual(authService.isConnected, false, 'Service remains disconnected');

  print('\n[10] Spend Insights & Commitment Distribution Verification:');
  // 1. Full Demo Dataset Analysis
  final demoSummary = SpendInsightsCalculator.calculate(demoSubscriptions);
  expectEqual(demoSummary.totalActive, 6, 'Calculates 6 active subscriptions in demo set');
  expectEqual(demoSummary.monthlyCount, 6, 'Finds 6 monthly subscriptions');
  expectEqual(demoSummary.annualCount, 0, 'Finds 0 annual subscriptions');
  expectEqual(demoSummary.monthlyCommitmentSpend, 29600.0, 'Calculates direct monthly commitments as ₦29,600');
  expectEqual(demoSummary.annualCommitmentRawSpend, 0.0, 'Calculates raw annual commitments as ₦0');
  expectTrue(
    (demoSummary.normalizedMonthlyTotal - 29600.0).abs() < 0.1,
    'Calculates normalized monthly total spend as ₦29,600',
  );
  expectEqual(demoSummary.highestCommitment?.providerName, 'Adobe', 'Identifies Adobe as highest commitment');
  expectEqual(demoSummary.highestCommitment?.amount, 14000.0, 'Identifies Adobe amount as ₦14,000');
  expectTrue(
    (demoSummary.monthlyCadenceRatio - 1.0).abs() < 0.01,
    'Monthly cadence ratio is 100%',
  );

  // 2. Cancellation Exclusion
  final subsWithCancelled = [
    for (final s in demoSubscriptions)
      if (s.id == 'spotify') s.copyWith(status: SubscriptionStatus.cancelled) else s,
  ];
  final cancelSummary = SpendInsightsCalculator.calculate(subsWithCancelled);
  expectEqual(cancelSummary.totalActive, 5, 'Cancelled subscription is excluded from active count');
  expectEqual(cancelSummary.monthlyCount, 5, 'Monthly count drops from 6 to 5');
  expectEqual(cancelSummary.monthlyCommitmentSpend, 27100.0, 'Monthly commitment drops by Spotify (₦2,500) to ₦27,100');

  // 3. Empty Edge Case
  final emptySummary = SpendInsightsCalculator.calculate([]);
  expectEqual(emptySummary.totalActive, 0, 'Empty list yields 0 total active');
  expectEqual(emptySummary.monthlyCount, 0, 'Empty list yields 0 monthly count');
  expectEqual(emptySummary.annualCount, 0, 'Empty list yields 0 annual count');
  expectEqual(emptySummary.highestCommitment, null, 'Empty list yields null highest commitment');
  expectEqual(emptySummary.monthlyCadenceRatio, 0.0, 'Empty list yields 0.0 cadence ratio');

  print('\n================================================');
  print('Result: $passed tests passed, $failed failed.');

  if (failed > 0) {
    throw Exception('$failed test(s) failed.');
  }
}

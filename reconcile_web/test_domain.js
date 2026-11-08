// Pure Node.js verification test for Reconcile Web domain services

function isLeapYear(year) {
  return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
}

function getDaysInMonth(year, month) {
  if (month === 2) {
    return isLeapYear(year) ? 29 : 28;
  }
  if ([4, 6, 9, 11].includes(month)) {
    return 30;
  }
  return 31;
}

function calculateNextRenewal(sub) {
  const current = new Date(sub.nextRenewalDate + 'T00:00:00Z');
  let year = current.getUTCFullYear();
  let month = current.getUTCMonth() + 1;
  let day = current.getUTCDate();
  const anchor = sub.anchorDay ?? day;

  switch (sub.interval) {
    case 'day': {
      current.setUTCDate(day + sub.intervalCount);
      return current.toISOString().split('T')[0];
    }
    case 'week': {
      current.setUTCDate(day + sub.intervalCount * 7);
      return current.toISOString().split('T')[0];
    }
    case 'month': {
      const totalMonths = month + sub.intervalCount;
      year += Math.floor((totalMonths - 1) / 12);
      month = ((totalMonths - 1) % 12) + 1;
      const maxDay = getDaysInMonth(year, month);
      day = Math.min(anchor, maxDay);
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
    case 'year': {
      year += sub.intervalCount;
      const maxDay = getDaysInMonth(year, month);
      day = Math.min(anchor, maxDay);
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    }
  }
}

function normalizeToMonthly(amount, interval, intervalCount) {
  const count = Math.max(1, intervalCount);
  switch (interval) {
    case 'month': return amount / count;
    case 'year': return amount / (count * 12);
    case 'week': return (amount * 52) / (count * 12);
    case 'day': return (amount * 365) / (count * 12);
    default: return amount;
  }
}

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  [PASS] ${message}`);
    passed++;
  } else {
    console.error(`  [FAIL] ${message}`);
    failed++;
  }
}

console.log('Testing Gregorian Calendar Math:');
// Jan 31 -> Feb 28 in non-leap year (2025)
const subJan31 = { nextRenewalDate: '2025-01-31', interval: 'month', intervalCount: 1, anchorDay: 31 };
const nextFeb = calculateNextRenewal(subJan31);
assert(nextFeb === '2025-02-28', 'Jan 31 clamps to Feb 28 in non-leap year 2025');

// Feb 28 -> Mar 31 with anchor 31 (anchor retention)
const subFeb28 = { nextRenewalDate: '2025-02-28', interval: 'month', intervalCount: 1, anchorDay: 31 };
const nextMar = calculateNextRenewal(subFeb28);
assert(nextMar === '2025-03-31', 'Feb 28 with anchor 31 returns to Mar 31');

// Leap year leap day: 2024-02-29 -> 2025-02-28 -> 2028-02-29
const subLeapDay = { nextRenewalDate: '2024-02-29', interval: 'year', intervalCount: 1, anchorDay: 29 };
const nextNonLeap = calculateNextRenewal(subLeapDay);
assert(nextNonLeap === '2025-02-28', 'Feb 29 leaps to Feb 28 in non-leap year 2025');

const subLeap4Year = { nextRenewalDate: '2024-02-29', interval: 'year', intervalCount: 4, anchorDay: 29 };
const nextLeap4 = calculateNextRenewal(subLeap4Year);
assert(nextLeap4 === '2028-02-29', 'Feb 29 preserved across 4-year leap cycle to 2028-02-29');

console.log('\nTesting Spend Normalization:');
const netflixMonthly = normalizeToMonthly(4500, 'month', 1);
assert(netflixMonthly === 4500, 'Netflix monthly normalized is 4500');

const adobeYearly = normalizeToMonthly(14000, 'year', 1);
assert(Math.round(adobeYearly * 100) / 100 === 1166.67, 'Adobe 14000/yr normalized is 1166.67/mo');

console.log(`\nResults: ${passed} passed, ${failed} failed.`);
if (failed > 0) process.exit(1);

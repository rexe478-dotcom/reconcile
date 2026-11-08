import calendar
from datetime import date, timedelta
from typing import List, Dict, Any

class RenewalEngine:
    """
    Gregorian-calendar recurrence arithmetic engine matching the Dart RenewalEngine invariants.
    Strictly handles leap years, month-end anchoring (e.g. Jan 31 -> Feb 28 -> Mar 31),
    and prevents date drift.
    """

    @staticmethod
    def is_leap_year(year: int) -> bool:
        return (year % 4 == 0 and year % 100 != 0) or (year % 400 == 0)

    @staticmethod
    def days_in_month(year: int, month: int) -> int:
        return calendar.monthrange(year, month)[1]

    @classmethod
    def calculate_next_renewal_date(
        cls,
        current_renewal_date: date,
        interval_unit: str = "month",
        interval_count: int = 1,
        anchor_day: int = None
    ) -> date:
        count = max(1, interval_count)
        anchor = anchor_day if anchor_day is not None else current_renewal_date.day

        if interval_unit == "day":
            return current_renewal_date + timedelta(days=count)

        elif interval_unit == "week":
            return current_renewal_date + timedelta(weeks=count)

        elif interval_unit == "month":
            total_months = current_renewal_date.month - 1 + count
            target_year = current_renewal_date.year + (total_months // 12)
            target_month = (total_months % 12) + 1
            max_days = cls.days_in_month(target_year, target_month)
            target_day = min(anchor, max_days)
            return date(target_year, target_month, target_day)

        elif interval_unit == "year":
            target_year = current_renewal_date.year + count
            target_month = current_renewal_date.month
            max_days = cls.days_in_month(target_year, target_month)
            target_day = min(anchor, max_days)
            return date(target_year, target_month, target_day)

        return current_renewal_date + timedelta(days=30)

    @classmethod
    def project_occurrences(
        cls,
        current_renewal_date: date,
        interval_unit: str,
        interval_count: int,
        from_date: date,
        to_date: date,
        max_occurrences: int = 24
    ) -> List[date]:
        occurrences = []
        curr = current_renewal_date
        anchor = current_renewal_date.day

        # Fast forward if in past
        while curr < from_date and len(occurrences) < 100:
            curr = cls.calculate_next_renewal_date(curr, interval_unit, interval_count, anchor)

        while curr <= to_date and len(occurrences) < max_occurrences:
            if curr >= from_date:
                occurrences.append(curr)
            curr = cls.calculate_next_renewal_date(curr, interval_unit, interval_count, anchor)

        return occurrences

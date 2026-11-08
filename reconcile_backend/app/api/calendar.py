from datetime import date, datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Subscription
from app.services.renewal_engine import RenewalEngine

router = APIRouter(prefix="/calendar", tags=["Calendar Projections"])

@router.get("")
async def get_calendar_projections(
    from_date: date = Query(..., alias="from"),
    to_date: date = Query(..., alias="to"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    if to_date < from_date:
        raise HTTPException(status_code=400, detail="'to' date must be on or after 'from' date.")

    result = await db.execute(
        select(Subscription).where(
            and_(Subscription.user_id == current_user.id, Subscription.status != "cancelled")
        )
    )
    subs = result.scalars().all()

    occurrences = []
    for s in subs:
        projected = RenewalEngine.project_occurrences(
            current_renewal_date=s.next_renewal_date,
            interval_unit=s.interval_unit,
            interval_count=s.interval_count,
            from_date=from_date,
            to_date=to_date
        )
        for dt in projected:
            occurrences.append({
                "subscription_id": s.id,
                "provider_name": s.provider_name,
                "plan_name": s.plan_name,
                "amount": float(s.amount),
                "currency": s.currency,
                "expected_renewal_date": dt.isoformat(),
                "status": s.status,
                "reminder_enabled": s.reminder_enabled
            })

    # Sort chronologically
    occurrences.sort(key=lambda x: x["expected_renewal_date"])
    return {
        "from": from_date.isoformat(),
        "to": to_date.isoformat(),
        "total_occurrences": len(occurrences),
        "occurrences": occurrences
    }

from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, and_, desc
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Subscription, CancellationAttempt
from app.schemas.schemas import (
    CancellationAttemptCreate,
    CancellationAttemptResponse,
    CancellationReportCreate,
    SubscriptionResponse
)

router = APIRouter(prefix="/subscriptions", tags=["Cancellation Handoff"])

@router.post("/{subscription_id}/cancellation-attempts", response_model=CancellationAttemptResponse, status_code=status.HTTP_201_CREATED)
async def log_cancellation_attempt(
    subscription_id: str,
    payload: CancellationAttemptCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Subscription).where(
            and_(Subscription.id == subscription_id, Subscription.user_id == current_user.id)
        )
    )
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    attempt = CancellationAttempt(
        subscription_id=sub.id,
        user_id=current_user.id,
        destination_url=payload.destination_url,
        attempted_at=datetime.utcnow()
    )
    db.add(attempt)
    await db.commit()
    await db.refresh(attempt)
    return CancellationAttemptResponse.model_validate(attempt)

@router.post("/{subscription_id}/cancellation-report", response_model=SubscriptionResponse)
async def report_cancellation_outcome(
    subscription_id: str,
    payload: CancellationReportCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Subscription).where(
            and_(Subscription.id == subscription_id, Subscription.user_id == current_user.id)
        )
    )
    sub = result.scalar_one_or_none()
    if not sub:
        raise HTTPException(status_code=404, detail="Subscription not found.")

    if payload.outcome == "cancelled":
        sub.status = "cancelled"
        sub.reminder_enabled = False
    elif payload.outcome == "kept_active":
        sub.status = "active"

    # Query and update the most recent CancellationAttempt for this subscription and user
    attempt_result = await db.execute(
        select(CancellationAttempt)
        .where(
            and_(
                CancellationAttempt.subscription_id == subscription_id,
                CancellationAttempt.user_id == current_user.id
            )
        )
        .order_by(desc(CancellationAttempt.attempted_at))
        .limit(1)
    )
    attempt = attempt_result.scalar_one_or_none()
    if attempt:
        attempt.user_reported_outcome = payload.outcome
        attempt.reported_at = datetime.utcnow()

    await db.commit()
    await db.refresh(sub)
    return SubscriptionResponse.model_validate(sub)

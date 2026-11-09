from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.models import User, Subscription
from app.schemas.schemas import (
    SubscriptionCreate,
    SubscriptionUpdate,
    SubscriptionResponse,
    SpendInsightsResponse
)

router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])

@router.get("", response_model=List[SubscriptionResponse])
async def list_subscriptions(
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    query = select(Subscription).where(Subscription.user_id == current_user.id)

    if status_filter:
        query = query.where(Subscription.status == status_filter)

    result = await db.execute(query.order_by(Subscription.next_renewal_date.asc()))
    items = result.scalars().all()

    if search and search.strip():
        q = search.strip().lower()
        items = [
            s for s in items
            if q in s.provider_name.lower() or (s.plan_name and q in s.plan_name.lower()) or (s.notes and q in s.notes.lower())
        ]

    return [SubscriptionResponse.model_validate(s) for s in items]

@router.post("", response_model=SubscriptionResponse, status_code=status.HTTP_201_CREATED)
async def create_subscription(
    payload: SubscriptionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    sub = Subscription(
        user_id=current_user.id,
        **payload.model_dump()
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return SubscriptionResponse.model_validate(sub)

@router.get("/insights/summary", response_model=SpendInsightsResponse)
async def get_spend_insights(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    result = await db.execute(
        select(Subscription).where(
            and_(Subscription.user_id == current_user.id, Subscription.status != "cancelled")
        )
    )
    active_subs = result.scalars().all()

    total_monthly = 0.0
    monthly_count = 0
    annual_count = 0
    highest_provider = None
    highest_amount = -1.0

    for s in active_subs:
        amt = float(s.amount)
        unit = s.interval_unit.lower()
        count = max(1, s.interval_count)

        if unit == "month":
            monthly_val = amt / count
            monthly_count += 1
        elif unit == "year":
            monthly_val = amt / (count * 12)
            annual_count += 1
        elif unit == "quarter":
            monthly_val = amt / (count * 3)
        elif unit == "week":
            monthly_val = (amt * 52) / (count * 12)
        else:
            monthly_val = amt

        total_monthly += monthly_val

        if monthly_val > highest_amount:
            highest_amount = monthly_val
            highest_provider = s.provider_name

    return SpendInsightsResponse(
        total_monthly_normalized=round(total_monthly, 2),
        total_annual_normalized=round(total_monthly * 12, 2),
        total_active_subscriptions=len(active_subs),
        monthly_commitment_count=monthly_count,
        annual_commitment_count=annual_count,
        highest_commitment_provider=highest_provider,
        highest_commitment_amount=highest_amount if highest_amount >= 0 else None
    )

@router.get("/{subscription_id}", response_model=SubscriptionResponse)
async def get_subscription(
    subscription_id: str,
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")
    return SubscriptionResponse.model_validate(sub)

@router.patch("/{subscription_id}", response_model=SubscriptionResponse)
async def update_subscription(
    subscription_id: str,
    payload: SubscriptionUpdate,
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(sub, field, val)

    await db.commit()
    await db.refresh(sub)
    return SubscriptionResponse.model_validate(sub)

@router.delete("/{subscription_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_subscription(
    subscription_id: str,
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
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Subscription not found.")

    await db.delete(sub)
    await db.commit()
    return None

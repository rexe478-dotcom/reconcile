from datetime import date, datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, Field

# ----------------- User Schemas -----------------
class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=6)
    preferred_timezone: Optional[str] = "UTC"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class GoogleLoginRequest(BaseModel):
    access_token: str

class UserResponse(BaseModel):
    id: str
    email: EmailStr
    preferred_timezone: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# ----------------- Subscription Schemas -----------------
class SubscriptionBase(BaseModel):
    provider_name: str
    plan_name: Optional[str] = None
    category: Optional[str] = "General"
    amount: float = Field(..., ge=0)
    currency: str = "₦"
    interval_unit: str = "month"  # month, year, week, day, quarter
    interval_count: int = 1
    next_renewal_date: date
    status: str = "active"  # active, needs_review, cancelled, paused
    source: str = "manual"  # manual
    reminder_enabled: bool = True
    notes: Optional[str] = None
    last_payment_date: Optional[date] = None
    last_payment_amount: Optional[float] = None
    cancellation_url: Optional[str] = None

class SubscriptionCreate(SubscriptionBase):
    pass

class SubscriptionUpdate(BaseModel):
    provider_name: Optional[str] = None
    plan_name: Optional[str] = None
    category: Optional[str] = None
    amount: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = None
    interval_unit: Optional[str] = None
    interval_count: Optional[int] = None
    next_renewal_date: Optional[date] = None
    status: Optional[str] = None
    source: Optional[str] = None
    reminder_enabled: Optional[bool] = None
    notes: Optional[str] = None
    last_payment_date: Optional[date] = None
    last_payment_amount: Optional[float] = None
    cancellation_url: Optional[str] = None

class SubscriptionResponse(SubscriptionBase):
    id: str
    user_id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SpendInsightsResponse(BaseModel):
    total_monthly_normalized: float
    total_annual_normalized: float
    total_active_subscriptions: int
    monthly_commitment_count: int
    annual_commitment_count: int
    highest_commitment_provider: Optional[str] = None
    highest_commitment_amount: Optional[float] = None

# ----------------- Cancellation Schemas -----------------
class CancellationAttemptCreate(BaseModel):
    destination_url: str

class CancellationAttemptResponse(BaseModel):
    id: str
    subscription_id: str
    user_id: str
    destination_url: str
    attempted_at: datetime
    user_reported_outcome: str

    class Config:
        from_attributes = True

class CancellationReportCreate(BaseModel):
    outcome: str = Field(..., pattern="^(cancelled|kept_active)$")

# ----------------- Provider Registry Schemas -----------------
class ProviderDestinationResponse(BaseModel):
    provider_key: str
    provider_name: str
    destination_url: str
    allowed_domains: List[str]
    is_verified: bool
    official_support_url: Optional[str] = None
    billing_route_notes: Optional[str] = None

    class Config:
        from_attributes = True

# ----------------- Clerk Authentication Sync -----------------
class ClerkSyncRequest(BaseModel):
    clerk_id: str = Field(..., min_length=1)
    email: EmailStr
    preferred_timezone: Optional[str] = "UTC"



import uuid
from datetime import datetime, date
from sqlalchemy import Column, String, Numeric, Integer, Boolean, Text, Date, DateTime, ForeignKey, ARRAY
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, default=lambda: f"usr_{uuid.uuid4().hex[:12]}")
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    preferred_timezone = Column(String(64), default="UTC")
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    subscriptions = relationship("Subscription", back_populates="user", cascade="all, delete-orphan")
    cancellation_attempts = relationship("CancellationAttempt", back_populates="user", cascade="all, delete-orphan")
    gmail_credential = relationship("GmailCredential", back_populates="user", uselist=False, cascade="all, delete-orphan")

class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(String(64), primary_key=True, default=lambda: f"sub_{uuid.uuid4().hex[:12]}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    provider_name = Column(String(128), nullable=False, index=True)
    plan_name = Column(String(128), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(16), default="₦")
    interval_unit = Column(String(16), nullable=False, default="month") # month, year, week, day
    interval_count = Column(Integer, default=1)
    next_renewal_date = Column(Date, nullable=False, index=True)
    status = Column(String(32), default="active", index=True) # active, needs_review, cancelled, paused
    source = Column(String(32), default="manual") # manual, gmail
    reminder_enabled = Column(Boolean, default=True)
    notes = Column(Text, nullable=True)
    last_payment_date = Column(Date, nullable=True)
    last_payment_amount = Column(Numeric(12, 2), nullable=True)
    cancellation_url = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="subscriptions")
    cancellation_attempts = relationship("CancellationAttempt", back_populates="subscription", cascade="all, delete-orphan")

class CancellationAttempt(Base):
    __tablename__ = "cancellation_attempts"

    id = Column(String(64), primary_key=True, default=lambda: f"att_{uuid.uuid4().hex[:12]}")
    subscription_id = Column(String(64), ForeignKey("subscriptions.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    destination_url = Column(Text, nullable=False)
    attempted_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    user_reported_outcome = Column(String(32), default="pending") # pending, cancelled, kept_active
    reported_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="cancellation_attempts")
    subscription = relationship("Subscription", back_populates="cancellation_attempts")

class ProviderDestination(Base):
    __tablename__ = "provider_destinations"

    provider_key = Column(String(64), primary_key=True)
    provider_name = Column(String(128), nullable=False)
    destination_url = Column(Text, nullable=False)
    allowed_domains = Column(ARRAY(String), nullable=False)
    is_verified = Column(Boolean, default=True)
    official_support_url = Column(Text, nullable=True)
    billing_route_notes = Column(Text, nullable=True)

class GmailCredential(Base):
    __tablename__ = "gmail_credentials"

    id = Column(String(64), primary_key=True, default=lambda: f"gmc_{uuid.uuid4().hex[:12]}")
    user_id = Column(String(64), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True)
    google_email = Column(String(255), nullable=True)
    access_token_encrypted = Column(Text, nullable=False)
    refresh_token_encrypted = Column(Text, nullable=True)
    token_expiry = Column(DateTime(timezone=True), nullable=True)
    scopes = Column(Text, nullable=True)
    is_connected = Column(Boolean, default=True)
    last_sync_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", back_populates="gmail_credential")


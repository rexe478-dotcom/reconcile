import logging
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import ProviderDestination

logger = logging.getLogger(__name__)

INITIAL_PROVIDERS = [
    {
        "provider_key": "netflix",
        "provider_name": "Netflix",
        "destination_url": "https://www.netflix.com/youraccount",
        "allowed_domains": ["netflix.com", "www.netflix.com"],
        "is_verified": True,
        "official_support_url": "https://help.netflix.com",
        "billing_route_notes": "Under Membership & Billing section, select Cancel Membership.",
    },
    {
        "provider_key": "spotify",
        "provider_name": "Spotify",
        "destination_url": "https://www.spotify.com/account/overview/",
        "allowed_domains": ["spotify.com", "www.spotify.com"],
        "is_verified": True,
        "official_support_url": "https://support.spotify.com",
        "billing_route_notes": "Log into Spotify account overview, go to Your plan > Change plan > Cancel Premium.",
    },
    {
        "provider_key": "apple",
        "provider_name": "Apple iCloud+",
        "destination_url": "https://support.apple.com/HT202039",
        "allowed_domains": ["apple.com", "support.apple.com"],
        "is_verified": True,
        "official_support_url": "https://support.apple.com/HT202039",
        "billing_route_notes": "Open Settings on iOS device > Apple ID > Subscriptions.",
    },
    {
        "provider_key": "adobe",
        "provider_name": "Adobe Creative Cloud",
        "destination_url": "https://account.adobe.com/plans",
        "allowed_domains": ["adobe.com", "account.adobe.com"],
        "is_verified": True,
        "official_support_url": "https://helpx.adobe.com/manage-account/using/cancel-subscription.html",
        "billing_route_notes": "Sign in at account.adobe.com/plans > Manage plan > Cancel your plan.",
    },
    {
        "provider_key": "youtube",
        "provider_name": "YouTube Premium",
        "destination_url": "https://www.youtube.com/paid_memberships",
        "allowed_domains": ["youtube.com", "www.youtube.com"],
        "is_verified": True,
        "official_support_url": "https://support.google.com/youtube/answer/6308278",
        "billing_route_notes": "Visit youtube.com/paid_memberships > Manage membership > Deactivate.",
    },
    {
        "provider_key": "chatgpt",
        "provider_name": "ChatGPT Plus",
        "destination_url": "https://chatgpt.com/#settings/Subscription",
        "allowed_domains": ["chatgpt.com", "openai.com"],
        "is_verified": True,
        "official_support_url": "https://help.openai.com",
        "billing_route_notes": "Open Settings > Subscription > Manage my subscription.",
    },
    {
        "provider_key": "dstv",
        "provider_name": "DSTV Stream",
        "destination_url": "https://eazy.dstv.com/",
        "allowed_domains": ["dstv.com", "eazy.dstv.com"],
        "is_verified": True,
        "official_support_url": "https://eazy.dstv.com/",
        "billing_route_notes": "Self-service portal > Manage Subscriptions > Disconnect / Change Package.",
    },
    {
        "provider_key": "google_one",
        "provider_name": "Google One",
        "destination_url": "https://one.google.com/settings",
        "allowed_domains": ["one.google.com", "google.com"],
        "is_verified": True,
        "official_support_url": "https://support.google.com/googleone/answer/9056360",
        "billing_route_notes": "Manage membership at one.google.com/settings or Google Play Subscriptions.",
    },
    {
        "provider_key": "notion",
        "provider_name": "Notion",
        "destination_url": "https://www.notion.so/my-account",
        "allowed_domains": ["notion.so", "www.notion.so"],
        "is_verified": True,
        "official_support_url": "https://www.notion.so/help/billing-and-payment",
        "billing_route_notes": "Settings & members > Upgrade / Plan > Cancel subscription.",
    },
]

async def seed_providers(db: AsyncSession) -> None:
    result = await db.execute(select(func.count()).select_from(ProviderDestination))
    count = result.scalar() or 0
    if count == 0:
        logger.info("Provider destination registry is empty. Seeding initial verified providers...")
        for p in INITIAL_PROVIDERS:
            db.add(ProviderDestination(**p))
        await db.commit()
        logger.info(f"Successfully seeded {len(INITIAL_PROVIDERS)} provider destinations.")

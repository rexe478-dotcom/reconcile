import logging
import os
from typing import List, Optional
from pydantic_settings import BaseSettings

logger = logging.getLogger(__name__)

class Settings(BaseSettings):
    PROJECT_NAME: str = "Reconcile Subscription Tracker API"
    VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "production")
    PORT: int = int(os.getenv("PORT", 8000))

    # PostgreSQL Database URL (Neon / Supabase cloud connection string)
    DATABASE_URL: str

    # JWT Authentication configuration
    JWT_SECRET_KEY: str = "dev-insecure-jwt-secret-key-change-in-production"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # CORS configuration for Frontend origins (GitHub Pages + Local dev)
    CORS_ORIGINS: str = os.getenv(
        "CORS_ORIGINS",
        "http://localhost:3000,http://127.0.0.1:3000,http://localhost:5173,https://*.github.io"
    )

    # Google OAuth 2.0 Credentials (for independent Gmail authorization-code flow)
    GOOGLE_CLIENT_ID: str = os.getenv("GOOGLE_CLIENT_ID", "")
    GOOGLE_CLIENT_SECRET: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    GOOGLE_REDIRECT_URI: str = os.getenv(
        "GOOGLE_REDIRECT_URI",
        "https://reconcile-api-9htz.onrender.com/api/v1/gmail/callback"
    )

    # Frontend URL for redirecting post-OAuth
    FRONTEND_URL: str = os.getenv(
        "FRONTEND_URL",
        "https://rexe478-dotcom.github.io/reconcile"
    )

    # Dedicated encryption key for token encryption at rest (falls back to JWT_SECRET_KEY)
    GMAIL_ENCRYPTION_KEY: Optional[str] = os.getenv("GMAIL_ENCRYPTION_KEY", None)

    @property
    def cors_origins_list(self) -> List[str]:
        origins = [orig.strip() for orig in self.CORS_ORIGINS.split(",") if orig.strip()]
        # Add wildcard or standard GitHub Pages origins if not explicitly present
        return origins

    @property
    def async_database_url(self) -> str:
        url = self.DATABASE_URL
        if url.startswith("postgres://"):
            url = url.replace("postgres://", "postgresql+asyncpg://", 1)
        elif url.startswith("postgresql://") and not url.startswith("postgresql+asyncpg://"):
            url = url.replace("postgresql://", "postgresql+asyncpg://", 1)
        # Handle asyncpg ssl query parameter if needed
        if "sslmode=" in url:
            url = url.replace("sslmode=require", "ssl=require")
        if "channel_binding=" in url:
            # asyncpg doesn't support channel_binding in URL query directly
            import re
            url = re.sub(r'[&?]channel_binding=[^&]*', '', url)
        return url

    class Config:
        case_sensitive = True
        env_file = ".env"

settings = Settings()

if settings.ENVIRONMENT == "production" and "dev-insecure" in settings.JWT_SECRET_KEY:
    logger.warning(
        "SECURITY WARNING: Using dev-only JWT_SECRET_KEY in production! "
        "Set JWT_SECRET_KEY in environment or .env file."
    )

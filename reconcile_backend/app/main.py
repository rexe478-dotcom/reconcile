from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base, AsyncSessionLocal
from app.services.seed_providers import seed_providers
from app.api import health, auth, subscriptions, calendar, providers, cancellation, gmail

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Ensure database schema is initialized on startup
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    # Seed provider registry if empty
    async with AsyncSessionLocal() as db:
        await seed_providers(db)
    yield
    # Cleanup on shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Production REST API for Reconcile Subscription Tracker PWA",
    lifespan=lifespan
)

# CORS configuration allowing GitHub Pages origins and local environments
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=r"^https?:\/\/.*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API Routers
app.include_router(health.router)
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(subscriptions.router, prefix=settings.API_V1_STR)
app.include_router(calendar.router, prefix=settings.API_V1_STR)
app.include_router(providers.router, prefix=settings.API_V1_STR)
app.include_router(cancellation.router, prefix=settings.API_V1_STR)
app.include_router(gmail.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "message": "Reconcile Subscription Tracker API is running.",
        "health": "/health",
        "docs": "/docs",
        "version": settings.VERSION
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=settings.PORT, reload=True)

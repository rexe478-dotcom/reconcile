from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.models.models import ProviderDestination
from app.schemas.schemas import ProviderDestinationResponse

router = APIRouter(prefix="/providers", tags=["Provider Registry"])

@router.get("", response_model=List[ProviderDestinationResponse])
async def list_providers(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(ProviderDestination).order_by(ProviderDestination.provider_name.asc()))
    providers = result.scalars().all()
    return [ProviderDestinationResponse.model_validate(p) for p in providers]

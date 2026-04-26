import uuid
from datetime import datetime

from pydantic import BaseModel

from app.domains.features.models import FeatureKey


class FeatureFlagUpsert(BaseModel):
    feature_key: FeatureKey
    enabled: bool
    escola_id: uuid.UUID | None = None


class FeatureFlagResponse(BaseModel):
    id: uuid.UUID
    feature_key: FeatureKey
    secretaria_id: uuid.UUID
    escola_id: uuid.UUID | None
    enabled: bool
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class FeatureStatusResponse(BaseModel):
    """Resposta rápida para verificar se uma feature está ativa."""
    feature_key: FeatureKey
    secretaria_id: uuid.UUID
    escola_id: uuid.UUID | None
    enabled: bool

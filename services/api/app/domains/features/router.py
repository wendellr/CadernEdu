import uuid

from fastapi import APIRouter, Query, status

from app.core.deps import CurrentUserIdDep, SessionDep
from app.domains.features.models import FeatureKey
from app.domains.features.schemas import (
    FeatureFlagResponse,
    FeatureFlagUpsert,
    FeatureStatusResponse,
)
from app.domains.features.service import FeatureFlagService

router = APIRouter(prefix="/features", tags=["features"])


@router.put(
    "/secretarias/{secretaria_id}",
    response_model=FeatureFlagResponse,
    status_code=status.HTTP_200_OK,
    summary="Habilitar ou desabilitar uma feature para uma secretaria (ou escola específica)",
)
async def upsert_feature_flag(
    secretaria_id: uuid.UUID,
    data: FeatureFlagUpsert,
    session: SessionDep,
    _: CurrentUserIdDep,
):
    return await FeatureFlagService(session).upsert(secretaria_id, data)


@router.get(
    "/secretarias/{secretaria_id}",
    response_model=list[FeatureFlagResponse],
    summary="Listar todas as flags de uma secretaria (com override por escola se informada)",
)
async def listar_flags(
    secretaria_id: uuid.UUID,
    session: SessionDep,
    _: CurrentUserIdDep,
    escola_id: uuid.UUID | None = Query(default=None),
):
    return await FeatureFlagService(session).listar(secretaria_id, escola_id)


@router.get(
    "/secretarias/{secretaria_id}/check/{feature_key}",
    response_model=FeatureStatusResponse,
    summary="Verificar se uma feature específica está ativa",
)
async def check_feature(
    secretaria_id: uuid.UUID,
    feature_key: FeatureKey,
    session: SessionDep,
    _: CurrentUserIdDep,
    escola_id: uuid.UUID | None = Query(default=None),
):
    return await FeatureFlagService(session).is_enabled(feature_key, secretaria_id, escola_id)

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.features.models import FeatureFlag, FeatureKey
from app.domains.features.repository import FeatureFlagRepository
from app.domains.features.schemas import FeatureFlagUpsert, FeatureStatusResponse


class FeatureFlagService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = FeatureFlagRepository(session)

    async def upsert(self, secretaria_id: uuid.UUID, data: FeatureFlagUpsert) -> FeatureFlag:
        return await self.repo.upsert(
            feature_key=data.feature_key,
            secretaria_id=secretaria_id,
            escola_id=data.escola_id,
            enabled=data.enabled,
        )

    async def listar(
        self, secretaria_id: uuid.UUID, escola_id: uuid.UUID | None = None
    ) -> list[FeatureFlag]:
        return await self.repo.list_by_secretaria(secretaria_id, escola_id)

    async def is_enabled(
        self,
        feature_key: FeatureKey,
        secretaria_id: uuid.UUID,
        escola_id: uuid.UUID | None = None,
    ) -> FeatureStatusResponse:
        """
        Resolve a flag com a hierarquia correta:
        override de escola > flag da secretaria > desabilitado
        """
        enabled = False

        # 1. Tenta flag específica de escola
        if escola_id:
            flag = await self.repo.get(feature_key, secretaria_id, escola_id)
            if flag is not None:
                enabled = flag.enabled
                return FeatureStatusResponse(
                    feature_key=feature_key,
                    secretaria_id=secretaria_id,
                    escola_id=escola_id,
                    enabled=enabled,
                )

        # 2. Cai no nível da secretaria
        flag = await self.repo.get(feature_key, secretaria_id, None)
        if flag is not None:
            enabled = flag.enabled

        return FeatureStatusResponse(
            feature_key=feature_key,
            secretaria_id=secretaria_id,
            escola_id=escola_id,
            enabled=enabled,
        )

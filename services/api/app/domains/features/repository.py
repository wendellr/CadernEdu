import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.features.models import FeatureFlag, FeatureKey


class FeatureFlagRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(
        self,
        feature_key: FeatureKey,
        secretaria_id: uuid.UUID,
        escola_id: uuid.UUID | None,
    ) -> FeatureFlag | None:
        result = await self.session.execute(
            select(FeatureFlag).where(
                FeatureFlag.feature_key == feature_key,
                FeatureFlag.secretaria_id == secretaria_id,
                FeatureFlag.escola_id == escola_id,
            )
        )
        return result.scalar_one_or_none()

    async def list_by_secretaria(
        self, secretaria_id: uuid.UUID, escola_id: uuid.UUID | None = None
    ) -> list[FeatureFlag]:
        """Retorna flags da secretaria + override específico de escola (se informado)."""
        conditions = [FeatureFlag.secretaria_id == secretaria_id]

        if escola_id is not None:
            conditions.append(
                (FeatureFlag.escola_id == escola_id) | (FeatureFlag.escola_id.is_(None))
            )
        else:
            conditions.append(FeatureFlag.escola_id.is_(None))

        result = await self.session.execute(
            select(FeatureFlag).where(*conditions).order_by(FeatureFlag.feature_key)
        )
        return list(result.scalars().all())

    async def upsert(
        self,
        feature_key: FeatureKey,
        secretaria_id: uuid.UUID,
        escola_id: uuid.UUID | None,
        enabled: bool,
    ) -> FeatureFlag:
        flag = await self.get(feature_key, secretaria_id, escola_id)
        if flag:
            flag.enabled = enabled
        else:
            flag = FeatureFlag(
                feature_key=feature_key,
                secretaria_id=secretaria_id,
                escola_id=escola_id,
                enabled=enabled,
            )
            self.session.add(flag)
        await self.session.flush()
        return flag

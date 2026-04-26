import uuid
from collections import defaultdict
from datetime import date

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.features.models import FeatureKey
from app.domains.features.service import FeatureFlagService
from app.domains.identity.repository import TurmaRepository
from app.domains.pedagogico.models import AtividadeDeCasa, Aula
from app.domains.pedagogico.repository import AtividadeRepository, AulaRepository
from app.domains.pedagogico.schemas import (
    AgendaDiaResponse,
    AtividadeCreate,
    AtividadeUpdate,
    AulaCreate,
    AulaUpdate,
)
from app.shared.exceptions import NotFoundError


async def _verificar_agenda_online(
    session: AsyncSession,
    secretaria_id: uuid.UUID,
    escola_id: uuid.UUID | None = None,
) -> None:
    """Lança 403 se o módulo agenda_online não estiver habilitado."""
    svc = FeatureFlagService(session)
    flag = await svc.is_enabled(FeatureKey.agenda_online, secretaria_id, escola_id)
    if not flag.enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Módulo Agenda Online não habilitado para esta secretaria/escola.",
        )


class AulaService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AulaRepository(session)
        self.turma_repo = TurmaRepository(session)

    async def criar(
        self,
        turma_id: uuid.UUID,
        professor_id: uuid.UUID,
        secretaria_id: uuid.UUID,
        data: AulaCreate,
    ) -> Aula:
        turma = await self.turma_repo.get(turma_id)
        if not turma:
            raise NotFoundError("Turma", turma_id)

        await _verificar_agenda_online(self.repo.session, secretaria_id, turma.escola_id)

        aula = Aula(
            turma_id=turma_id,
            professor_id=professor_id,
            **data.model_dump(),
        )
        return await self.repo.create(aula)

    async def get_or_404(self, aula_id: uuid.UUID) -> Aula:
        aula = await self.repo.get(aula_id)
        if not aula:
            raise NotFoundError("Aula", aula_id)
        return aula

    async def listar(
        self,
        turma_id: uuid.UUID,
        secretaria_id: uuid.UUID,
        data_inicio: date | None = None,
        data_fim: date | None = None,
    ) -> list[Aula]:
        turma = await self.turma_repo.get(turma_id)
        if not turma:
            raise NotFoundError("Turma", turma_id)

        await _verificar_agenda_online(self.repo.session, secretaria_id, turma.escola_id)
        return await self.repo.list_by_turma(turma_id, data_inicio, data_fim)

    async def atualizar(self, aula_id: uuid.UUID, data: AulaUpdate) -> Aula:
        aula = await self.get_or_404(aula_id)
        for campo, valor in data.model_dump(exclude_none=True).items():
            setattr(aula, campo, valor)
        await self.repo.session.flush()
        return aula

    async def remover(self, aula_id: uuid.UUID) -> None:
        aula = await self.get_or_404(aula_id)
        await self.repo.delete(aula)


class AtividadeService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AtividadeRepository(session)
        self.turma_repo = TurmaRepository(session)

    async def criar(
        self,
        turma_id: uuid.UUID,
        professor_id: uuid.UUID,
        secretaria_id: uuid.UUID,
        data: AtividadeCreate,
    ) -> AtividadeDeCasa:
        turma = await self.turma_repo.get(turma_id)
        if not turma:
            raise NotFoundError("Turma", turma_id)

        await _verificar_agenda_online(self.repo.session, secretaria_id, turma.escola_id)

        atividade = AtividadeDeCasa(
            turma_id=turma_id,
            professor_id=professor_id,
            **data.model_dump(),
        )
        return await self.repo.create(atividade)

    async def get_or_404(self, atividade_id: uuid.UUID) -> AtividadeDeCasa:
        atividade = await self.repo.get(atividade_id)
        if not atividade:
            raise NotFoundError("AtividadeDeCasa", atividade_id)
        return atividade

    async def listar(
        self,
        turma_id: uuid.UUID,
        secretaria_id: uuid.UUID,
        data_inicio: date | None = None,
        data_fim: date | None = None,
    ) -> list[AtividadeDeCasa]:
        turma = await self.turma_repo.get(turma_id)
        if not turma:
            raise NotFoundError("Turma", turma_id)

        await _verificar_agenda_online(self.repo.session, secretaria_id, turma.escola_id)
        return await self.repo.list_by_turma(turma_id, data_inicio, data_fim)

    async def atualizar(self, atividade_id: uuid.UUID, data: AtividadeUpdate) -> AtividadeDeCasa:
        atividade = await self.get_or_404(atividade_id)
        for campo, valor in data.model_dump(exclude_none=True).items():
            setattr(atividade, campo, valor)
        await self.repo.session.flush()
        return atividade

    async def remover(self, atividade_id: uuid.UUID) -> None:
        atividade = await self.get_or_404(atividade_id)
        await self.repo.delete(atividade)


class AgendaService:
    def __init__(self, session: AsyncSession) -> None:
        self.aula_repo = AulaRepository(session)
        self.atividade_repo = AtividadeRepository(session)
        self.turma_repo = TurmaRepository(session)
        self._session = session

    async def agenda_por_periodo(
        self,
        turma_id: uuid.UUID,
        secretaria_id: uuid.UUID,
        data_inicio: date,
        data_fim: date,
    ) -> list[AgendaDiaResponse]:
        turma = await self.turma_repo.get(turma_id)
        if not turma:
            raise NotFoundError("Turma", turma_id)

        await _verificar_agenda_online(self._session, secretaria_id, turma.escola_id)

        aulas = await self.aula_repo.list_by_turma(turma_id, data_inicio, data_fim)
        atividades = await self.atividade_repo.list_by_turma(turma_id, data_inicio, data_fim)

        # Agrupa por data
        aulas_por_dia: dict[date, list[Aula]] = defaultdict(list)
        for aula in aulas:
            aulas_por_dia[aula.data].append(aula)

        atividades_por_dia: dict[date, list[AtividadeDeCasa]] = defaultdict(list)
        for atividade in atividades:
            atividades_por_dia[atividade.prazo].append(atividade)

        todas_datas = sorted(set(aulas_por_dia) | set(atividades_por_dia))
        return [
            AgendaDiaResponse(
                data=d,
                aulas=aulas_por_dia.get(d, []),  # type: ignore[arg-type]
                atividades=atividades_por_dia.get(d, []),  # type: ignore[arg-type]
            )
            for d in todas_datas
        ]

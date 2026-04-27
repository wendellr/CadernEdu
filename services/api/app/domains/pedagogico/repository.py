import uuid
from datetime import date

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.pedagogico.models import AtividadeDeCasa, Aula, Presenca


class AulaRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, aula_id: uuid.UUID) -> Aula | None:
        return await self.session.get(Aula, aula_id)

    async def list_by_turma(
        self,
        turma_id: uuid.UUID,
        data_inicio: date | None = None,
        data_fim: date | None = None,
    ) -> list[Aula]:
        q = select(Aula).where(Aula.turma_id == turma_id)
        if data_inicio:
            q = q.where(Aula.data >= data_inicio)
        if data_fim:
            q = q.where(Aula.data <= data_fim)
        result = await self.session.execute(q.order_by(Aula.data))
        return list(result.scalars().all())

    async def create(self, aula: Aula) -> Aula:
        self.session.add(aula)
        await self.session.flush()
        return aula

    async def delete(self, aula: Aula) -> None:
        await self.session.delete(aula)
        await self.session.flush()


class AtividadeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, atividade_id: uuid.UUID) -> AtividadeDeCasa | None:
        return await self.session.get(AtividadeDeCasa, atividade_id)

    async def list_by_turma(
        self,
        turma_id: uuid.UUID,
        data_inicio: date | None = None,
        data_fim: date | None = None,
    ) -> list[AtividadeDeCasa]:
        q = select(AtividadeDeCasa).where(AtividadeDeCasa.turma_id == turma_id)
        if data_inicio:
            q = q.where(AtividadeDeCasa.prazo >= data_inicio)
        if data_fim:
            q = q.where(AtividadeDeCasa.prazo <= data_fim)
        result = await self.session.execute(q.order_by(AtividadeDeCasa.prazo))
        return list(result.scalars().all())

    async def create(self, atividade: AtividadeDeCasa) -> AtividadeDeCasa:
        self.session.add(atividade)
        await self.session.flush()
        return atividade

    async def delete(self, atividade: AtividadeDeCasa) -> None:
        await self.session.delete(atividade)
        await self.session.flush()


class PresencaRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_turma_data(
        self, turma_id: uuid.UUID, data: date
    ) -> list[Presenca]:
        result = await self.session.execute(
            select(Presenca)
            .where(Presenca.turma_id == turma_id, Presenca.data == data)
            .order_by(Presenca.aluno_id)
        )
        return list(result.scalars().all())

    async def upsert_many(self, presencas: list[Presenca]) -> list[Presenca]:
        """Insere ou atualiza registros de presença (upsert por turma+aluno+data)."""
        from sqlalchemy.dialects.postgresql import insert

        if not presencas:
            return []

        values = [
            {
                "id": p.id,
                "turma_id": p.turma_id,
                "aluno_id": p.aluno_id,
                "professor_id": p.professor_id,
                "secretaria_id": p.secretaria_id,
                "data": p.data,
                "status": p.status,
                "observacoes": p.observacoes,
            }
            for p in presencas
        ]

        stmt = insert(Presenca).values(values)
        stmt = stmt.on_conflict_do_update(
            constraint="uq_presenca_turma_aluno_data",
            set_={"status": stmt.excluded.status, "observacoes": stmt.excluded.observacoes},
        )
        await self.session.execute(stmt)
        await self.session.flush()

        return await self.get_by_turma_data(presencas[0].turma_id, presencas[0].data)

import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.domains.comunicacao.models import Anexo, Mensagem
from app.domains.gestao.models import Matricula
from app.domains.identity.models import ResponsavelAluno


class MensagemRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _base_options(self):
        return [
            selectinload(Mensagem.anexos),
            selectinload(Mensagem.remetente),
            selectinload(Mensagem.destinatario),
        ]

    async def get(self, mensagem_id: uuid.UUID) -> Mensagem | None:
        result = await self.session.execute(
            select(Mensagem)
            .options(*self._base_options())
            .where(Mensagem.id == mensagem_id)
        )
        return result.scalar_one_or_none()

    async def list_by_turma(self, turma_id: uuid.UUID) -> list[Mensagem]:
        result = await self.session.execute(
            select(Mensagem)
            .options(*self._base_options())
            .where(Mensagem.turma_id == turma_id)
            .order_by(Mensagem.created_at.desc())
        )
        return list(result.scalars().all())

    async def list_by_destinatario(self, destinatario_id: uuid.UUID) -> list[Mensagem]:
        result = await self.session.execute(
            select(Mensagem)
            .options(selectinload(Mensagem.anexos))
            .where(Mensagem.destinatario_id == destinatario_id)
            .order_by(Mensagem.created_at.desc())
        )
        return list(result.scalars().all())

    async def create(self, mensagem: Mensagem) -> Mensagem:
        self.session.add(mensagem)
        await self.session.flush()
        await self.session.refresh(mensagem, ["anexos"])
        return mensagem

    async def delete(self, mensagem: Mensagem) -> None:
        await self.session.delete(mensagem)
        await self.session.flush()


class AnexoRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, anexo_id: uuid.UUID) -> Anexo | None:
        return await self.session.get(Anexo, anexo_id)

    async def create(self, anexo: Anexo) -> Anexo:
        self.session.add(anexo)
        await self.session.flush()
        return anexo

    async def delete(self, anexo: Anexo) -> None:
        await self.session.delete(anexo)
        await self.session.flush()


class MatriculaRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_alunos_da_turma(self, turma_id: uuid.UUID) -> list[uuid.UUID]:
        """Retorna IDs dos alunos com matrícula ativa na turma."""
        result = await self.session.execute(
            select(Matricula.aluno_id).where(
                Matricula.turma_id == turma_id, Matricula.ativo.is_(True)
            )
        )
        return list(result.scalars().all())


class ResponsavelAlunoRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def list_responsaveis_da_turma(self, turma_id: uuid.UUID) -> list[uuid.UUID]:
        """Retorna IDs dos responsáveis de alunos matriculados na turma."""
        result = await self.session.execute(
            select(ResponsavelAluno.responsavel_id)
            .join(Matricula, Matricula.aluno_id == ResponsavelAluno.aluno_id)
            .where(Matricula.turma_id == turma_id, Matricula.ativo.is_(True))
            .distinct()
        )
        return list(result.scalars().all())

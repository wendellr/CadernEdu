import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.gestao.models import Matricula
from app.domains.identity.models import Escola, ResponsavelAluno, Secretaria, Turma, Usuario


class SecretariaRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, secretaria_id: uuid.UUID) -> Secretaria | None:
        return await self.session.get(Secretaria, secretaria_id)

    async def get_by_cnpj(self, cnpj: str) -> Secretaria | None:
        result = await self.session.execute(select(Secretaria).where(Secretaria.cnpj == cnpj))
        return result.scalar_one_or_none()

    async def list_all(self) -> list[Secretaria]:
        result = await self.session.execute(
            select(Secretaria).where(Secretaria.ativo.is_(True)).order_by(Secretaria.nome)
        )
        return list(result.scalars().all())

    async def create(self, secretaria: Secretaria) -> Secretaria:
        self.session.add(secretaria)
        await self.session.flush()
        return secretaria


class EscolaRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, escola_id: uuid.UUID) -> Escola | None:
        return await self.session.get(Escola, escola_id)

    async def list_by_secretaria(self, secretaria_id: uuid.UUID) -> list[Escola]:
        result = await self.session.execute(
            select(Escola)
            .where(Escola.secretaria_id == secretaria_id, Escola.ativo.is_(True))
            .order_by(Escola.nome)
        )
        return list(result.scalars().all())

    async def create(self, escola: Escola) -> Escola:
        self.session.add(escola)
        await self.session.flush()
        return escola


class TurmaRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, turma_id: uuid.UUID) -> Turma | None:
        return await self.session.get(Turma, turma_id)

    async def list_by_escola(
        self, escola_id: uuid.UUID, ano_letivo: int | None = None
    ) -> list[Turma]:
        q = select(Turma).where(Turma.escola_id == escola_id, Turma.ativo.is_(True))
        if ano_letivo:
            q = q.where(Turma.ano_letivo == ano_letivo)
        result = await self.session.execute(q.order_by(Turma.nome))
        return list(result.scalars().all())

    async def create(self, turma: Turma) -> Turma:
        self.session.add(turma)
        await self.session.flush()
        return turma


class UsuarioRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, usuario_id: uuid.UUID) -> Usuario | None:
        return await self.session.get(Usuario, usuario_id)

    async def get_by_keycloak_id(self, keycloak_id: str) -> Usuario | None:
        result = await self.session.execute(
            select(Usuario).where(Usuario.keycloak_id == keycloak_id)
        )
        return result.scalar_one_or_none()

    async def create(self, usuario: Usuario) -> Usuario:
        self.session.add(usuario)
        await self.session.flush()
        return usuario

    async def listar_filhos_do_responsavel(self, responsavel_id: uuid.UUID) -> list[Usuario]:
        result = await self.session.execute(
            select(Usuario)
            .join(ResponsavelAluno, ResponsavelAluno.aluno_id == Usuario.id)
            .where(
                ResponsavelAluno.responsavel_id == responsavel_id,
                Usuario.ativo.is_(True),
            )
            .order_by(Usuario.nome)
        )
        return list(result.scalars().all())

    async def listar_alunos_da_turma(self, turma_id: uuid.UUID) -> list[Usuario]:
        result = await self.session.execute(
            select(Usuario)
            .join(Matricula, Matricula.aluno_id == Usuario.id)
            .where(
                Matricula.turma_id == turma_id,
                Matricula.ativo.is_(True),
                Usuario.ativo.is_(True),
            )
            .order_by(Usuario.nome)
        )
        return list(result.scalars().all())

    async def listar_turmas_do_aluno(
        self, aluno_id: uuid.UUID, ano_letivo: int | None = None
    ) -> list[Turma]:
        q = (
            select(Turma)
            .join(Matricula, Matricula.turma_id == Turma.id)
            .where(
                Matricula.aluno_id == aluno_id,
                Matricula.ativo.is_(True),
                Turma.ativo.is_(True),
            )
        )
        if ano_letivo:
            q = q.where(Matricula.ano_letivo == ano_letivo)
        result = await self.session.execute(q.order_by(Turma.nome))
        return list(result.scalars().all())

import uuid

from sqlalchemy.ext.asyncio import AsyncSession

from app.domains.identity.models import Escola, Secretaria, Turma, Usuario
from app.domains.identity.repository import EscolaRepository, SecretariaRepository, TurmaRepository, UsuarioRepository
from app.domains.identity.schemas import EscolaCreate, SecretariaCreate, TurmaCreate, UsuarioCreate
from app.shared.exceptions import ConflictError, NotFoundError


class SecretariaService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = SecretariaRepository(session)

    async def criar(self, data: SecretariaCreate) -> Secretaria:
        existente = await self.repo.get_by_cnpj(data.cnpj)
        if existente:
            raise ConflictError(f"Secretaria com CNPJ {data.cnpj} já cadastrada")

        secretaria = Secretaria(**data.model_dump())
        return await self.repo.create(secretaria)

    async def get_or_404(self, secretaria_id: uuid.UUID) -> Secretaria:
        secretaria = await self.repo.get(secretaria_id)
        if not secretaria:
            raise NotFoundError("Secretaria", secretaria_id)
        return secretaria

    async def listar(self) -> list[Secretaria]:
        return await self.repo.list_all()


class EscolaService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = EscolaRepository(session)
        self.secretaria_repo = SecretariaRepository(session)

    async def criar(self, secretaria_id: uuid.UUID, data: EscolaCreate) -> Escola:
        secretaria = await self.secretaria_repo.get(secretaria_id)
        if not secretaria:
            raise NotFoundError("Secretaria", secretaria_id)

        escola = Escola(secretaria_id=secretaria_id, **data.model_dump())
        return await self.repo.create(escola)

    async def get_or_404(self, escola_id: uuid.UUID) -> Escola:
        escola = await self.repo.get(escola_id)
        if not escola:
            raise NotFoundError("Escola", escola_id)
        return escola

    async def listar_por_secretaria(self, secretaria_id: uuid.UUID) -> list[Escola]:
        return await self.repo.list_by_secretaria(secretaria_id)


class TurmaService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = TurmaRepository(session)
        self.escola_repo = EscolaRepository(session)

    async def criar(self, escola_id: uuid.UUID, data: TurmaCreate) -> Turma:
        escola = await self.escola_repo.get(escola_id)
        if not escola:
            raise NotFoundError("Escola", escola_id)
        turma = Turma(escola_id=escola_id, **data.model_dump())
        return await self.repo.create(turma)

    async def get_or_404(self, turma_id: uuid.UUID) -> Turma:
        turma = await self.repo.get(turma_id)
        if not turma:
            raise NotFoundError("Turma", turma_id)
        return turma

    async def listar_por_escola(self, escola_id: uuid.UUID, ano_letivo: int | None = None) -> list[Turma]:
        return await self.repo.list_by_escola(escola_id, ano_letivo)


class UsuarioService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = UsuarioRepository(session)

    async def criar_ou_atualizar(self, data: UsuarioCreate) -> Usuario:
        """Upsert por keycloak_id — chamado no primeiro acesso do usuário."""
        existente = await self.repo.get_by_keycloak_id(data.keycloak_id)
        if existente:
            existente.nome = data.nome
            existente.email = data.email
            return existente

        usuario = Usuario(**data.model_dump())
        return await self.repo.create(usuario)

    async def get_or_404(self, usuario_id: uuid.UUID) -> Usuario:
        usuario = await self.repo.get(usuario_id)
        if not usuario:
            raise NotFoundError("Usuario", usuario_id)
        return usuario

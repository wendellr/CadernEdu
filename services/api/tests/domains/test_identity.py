"""
Testes do domínio identity — Secretaria, Escola, Turma, Usuario.

Execução:
    cd services/api
    uv run pytest tests/domains/test_identity.py -v
"""

import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.domains.identity.models import PerfilUsuario
from app.domains.identity.schemas import (
    EscolaCreate,
    SecretariaCreate,
    TurmaCreate,
    UsuarioCreate,
)
from app.domains.identity.service import (
    EscolaService,
    SecretariaService,
    TurmaService,
    UsuarioService,
)
from app.shared.exceptions import ConflictError, NotFoundError

# ── Helpers ───────────────────────────────────────────────────────────────────


def make_secretaria(secretaria_id: uuid.UUID | None = None) -> MagicMock:
    s = MagicMock()
    s.id = secretaria_id or uuid.uuid4()
    s.cnpj = "12.345.678/0001-99"
    return s


def make_escola(
    escola_id: uuid.UUID | None = None, secretaria_id: uuid.UUID | None = None
) -> MagicMock:
    e = MagicMock()
    e.id = escola_id or uuid.uuid4()
    e.secretaria_id = secretaria_id or uuid.uuid4()
    return e


def make_turma(turma_id: uuid.UUID | None = None, escola_id: uuid.UUID | None = None) -> MagicMock:
    t = MagicMock()
    t.id = turma_id or uuid.uuid4()
    t.escola_id = escola_id or uuid.uuid4()
    return t


def make_usuario(keycloak_id: str = "kc-abc-123") -> MagicMock:
    u = MagicMock()
    u.id = uuid.uuid4()
    u.keycloak_id = keycloak_id
    u.nome = "João Silva"
    u.email = "joao@escola.edu.br"
    return u


# ── SecretariaService ─────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_criar_secretaria_sucesso():
    session = AsyncMock()
    mock = make_secretaria()

    with (
        patch("app.domains.identity.service.SecretariaRepository") as MockRepo,
        patch("app.domains.identity.service.Secretaria", return_value=mock),
    ):
        MockRepo.return_value.get_by_cnpj = AsyncMock(return_value=None)
        MockRepo.return_value.create = AsyncMock(return_value=mock)

        result = await SecretariaService(session).criar(
            SecretariaCreate(
                nome="Secretaria Teste",
                municipio="São Paulo",
                estado="SP",
                cnpj="12.345.678/0001-99",
            )
        )

    assert result is mock


@pytest.mark.asyncio
async def test_criar_secretaria_cnpj_duplicado_levanta_conflict():
    session = AsyncMock()

    with patch("app.domains.identity.service.SecretariaRepository") as MockRepo:
        MockRepo.return_value.get_by_cnpj = AsyncMock(return_value=make_secretaria())

        with pytest.raises(ConflictError):
            await SecretariaService(session).criar(
                SecretariaCreate(
                    nome="Outra Secretaria",
                    municipio="Campinas",
                    estado="SP",
                    cnpj="12.345.678/0001-99",
                )
            )


@pytest.mark.asyncio
async def test_get_secretaria_or_404_encontrado():
    session = AsyncMock()
    secretaria_id = uuid.uuid4()
    mock = make_secretaria(secretaria_id)

    with patch("app.domains.identity.service.SecretariaRepository") as MockRepo:
        MockRepo.return_value.get = AsyncMock(return_value=mock)

        result = await SecretariaService(session).get_or_404(secretaria_id)

    assert result is mock


@pytest.mark.asyncio
async def test_get_secretaria_or_404_nao_encontrado():
    session = AsyncMock()

    with patch("app.domains.identity.service.SecretariaRepository") as MockRepo:
        MockRepo.return_value.get = AsyncMock(return_value=None)

        with pytest.raises(NotFoundError):
            await SecretariaService(session).get_or_404(uuid.uuid4())


# ── EscolaService ─────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_criar_escola_sucesso():
    session = AsyncMock()
    secretaria_id = uuid.uuid4()
    escola_mock = make_escola(secretaria_id=secretaria_id)

    with (
        patch("app.domains.identity.service.SecretariaRepository") as MockSecRepo,
        patch("app.domains.identity.service.EscolaRepository") as MockEscolaRepo,
        patch("app.domains.identity.service.Escola", return_value=escola_mock),
    ):
        MockSecRepo.return_value.get = AsyncMock(return_value=make_secretaria(secretaria_id))
        MockEscolaRepo.return_value.create = AsyncMock(return_value=escola_mock)

        result = await EscolaService(session).criar(
            secretaria_id,
            EscolaCreate(nome="EMEF Teste", codigo_inep=None),
        )

    assert result is escola_mock


@pytest.mark.asyncio
async def test_criar_escola_secretaria_inexistente():
    session = AsyncMock()

    with (
        patch("app.domains.identity.service.SecretariaRepository") as MockSecRepo,
        patch("app.domains.identity.service.EscolaRepository"),
    ):
        MockSecRepo.return_value.get = AsyncMock(return_value=None)

        with pytest.raises(NotFoundError):
            await EscolaService(session).criar(
                uuid.uuid4(),
                EscolaCreate(nome="EMEF Fantasma"),
            )


# ── TurmaService ──────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_criar_turma_sucesso():
    session = AsyncMock()
    escola_id = uuid.uuid4()
    turma_mock = make_turma(escola_id=escola_id)

    with (
        patch("app.domains.identity.service.EscolaRepository") as MockEscolaRepo,
        patch("app.domains.identity.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.identity.service.Turma", return_value=turma_mock),
    ):
        MockEscolaRepo.return_value.get = AsyncMock(return_value=make_escola(escola_id=escola_id))
        MockTurmaRepo.return_value.create = AsyncMock(return_value=turma_mock)

        result = await TurmaService(session).criar(
            escola_id,
            TurmaCreate(nome="5º Ano A", serie="5º Ano", ano_letivo=2026),
        )

    assert result is turma_mock


@pytest.mark.asyncio
async def test_criar_turma_escola_inexistente():
    session = AsyncMock()

    with (
        patch("app.domains.identity.service.EscolaRepository") as MockEscolaRepo,
        patch("app.domains.identity.service.TurmaRepository"),
    ):
        MockEscolaRepo.return_value.get = AsyncMock(return_value=None)

        with pytest.raises(NotFoundError):
            await TurmaService(session).criar(
                uuid.uuid4(),
                TurmaCreate(nome="1º Ano B", serie="1º Ano", ano_letivo=2026),
            )


# ── UsuarioService ────────────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_criar_usuario_novo():
    session = AsyncMock()
    usuario_mock = make_usuario("kc-novo-123")

    with (
        patch("app.domains.identity.service.UsuarioRepository") as MockRepo,
        patch("app.domains.identity.service.Usuario", return_value=usuario_mock),
    ):
        MockRepo.return_value.get_by_keycloak_id = AsyncMock(return_value=None)
        MockRepo.return_value.create = AsyncMock(return_value=usuario_mock)

        result = await UsuarioService(session).criar_ou_atualizar(
            UsuarioCreate(
                keycloak_id="kc-novo-123",
                nome="Maria Souza",
                email="maria@escola.edu.br",
                perfil=PerfilUsuario.professor,
            )
        )

    assert result is usuario_mock
    MockRepo.return_value.create.assert_called_once()


@pytest.mark.asyncio
async def test_upsert_usuario_atualiza_nome_e_email():
    """Upsert por keycloak_id: se já existe, atualiza nome e email sem criar novo registro."""
    session = AsyncMock()
    existente = make_usuario("kc-existente-456")
    existente.nome = "Nome Antigo"
    existente.email = "antigo@escola.edu.br"

    with patch("app.domains.identity.service.UsuarioRepository") as MockRepo:
        MockRepo.return_value.get_by_keycloak_id = AsyncMock(return_value=existente)

        result = await UsuarioService(session).criar_ou_atualizar(
            UsuarioCreate(
                keycloak_id="kc-existente-456",
                nome="Nome Novo",
                email="novo@escola.edu.br",
                perfil=PerfilUsuario.professor,
            )
        )

    assert result.nome == "Nome Novo"
    assert result.email == "novo@escola.edu.br"
    MockRepo.return_value.create.assert_not_called()

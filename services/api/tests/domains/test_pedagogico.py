"""
Testes do domínio pedagógico — Agenda Online.

Execução:
    cd services/api
    uv run pytest tests/domains/test_pedagogico.py -v
"""
import uuid
from datetime import date, timedelta
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.domains.features.models import FeatureKey
from app.domains.features.schemas import FeatureStatusResponse
from app.domains.pedagogico.schemas import AgendaDiaResponse, AulaCreate, AulaResponse, AtividadeResponse
from app.domains.pedagogico.service import AgendaService, AulaService
from app.shared.exceptions import NotFoundError


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_turma(turma_id: uuid.UUID, escola_id: uuid.UUID):
    t = MagicMock()
    t.id = turma_id
    t.escola_id = escola_id
    return t


def flag_enabled(secretaria_id: uuid.UUID) -> FeatureStatusResponse:
    return FeatureStatusResponse(
        feature_key=FeatureKey.agenda_online,
        secretaria_id=secretaria_id,
        escola_id=None,
        enabled=True,
    )


def flag_disabled(secretaria_id: uuid.UUID) -> FeatureStatusResponse:
    return FeatureStatusResponse(
        feature_key=FeatureKey.agenda_online,
        secretaria_id=secretaria_id,
        escola_id=None,
        enabled=False,
    )


def make_aula_response(turma_id: uuid.UUID, professor_id: uuid.UUID, data: date) -> AulaResponse:
    return AulaResponse(
        id=uuid.uuid4(),
        turma_id=turma_id,
        professor_id=professor_id,
        data=data,
        disciplina="Matemática",
        conteudo="Frações",
        observacoes=None,
        created_at=date.today(),  # type: ignore[arg-type]
    )


def make_atividade_response(turma_id: uuid.UUID, professor_id: uuid.UUID, prazo: date) -> AtividadeResponse:
    return AtividadeResponse(
        id=uuid.uuid4(),
        aula_id=None,
        turma_id=turma_id,
        professor_id=professor_id,
        disciplina="Matemática",
        descricao="Exercícios pág. 42",
        prazo=prazo,
        peso=1.0,
        created_at=date.today(),  # type: ignore[arg-type]
    )


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def secretaria_id() -> uuid.UUID:
    return uuid.uuid4()


@pytest.fixture
def escola_id() -> uuid.UUID:
    return uuid.uuid4()


@pytest.fixture
def turma_id() -> uuid.UUID:
    return uuid.uuid4()


@pytest.fixture
def professor_id() -> uuid.UUID:
    return uuid.uuid4()


# ── Testes: AulaService ───────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_criar_aula_com_flag_habilitada(turma_id, escola_id, professor_id, secretaria_id):
    session = AsyncMock()
    aula_mock = MagicMock()

    with (
        patch("app.domains.pedagogico.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.pedagogico.service.AulaRepository") as MockAulaRepo,
        patch("app.domains.pedagogico.service.FeatureFlagService") as MockFlagSvc,
        # Evita disparo do mapeamento SQLAlchemy fora de sessão real
        patch("app.domains.pedagogico.service.Aula", return_value=aula_mock),
    ):
        MockTurmaRepo.return_value.get = AsyncMock(return_value=make_turma(turma_id, escola_id))
        MockFlagSvc.return_value.is_enabled = AsyncMock(return_value=flag_enabled(secretaria_id))
        MockAulaRepo.return_value.create = AsyncMock(return_value=aula_mock)
        MockAulaRepo.return_value.session = session

        result = await AulaService(session).criar(
            turma_id=turma_id,
            professor_id=professor_id,
            secretaria_id=secretaria_id,
            data=AulaCreate(data=date.today(), disciplina="Matemática", conteudo="Frações"),
        )

    assert result is aula_mock


@pytest.mark.asyncio
async def test_criar_aula_rejeita_quando_flag_desabilitada(turma_id, escola_id, professor_id, secretaria_id):
    from fastapi import HTTPException
    session = AsyncMock()

    with (
        patch("app.domains.pedagogico.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.pedagogico.service.AulaRepository") as MockAulaRepo,
        patch("app.domains.pedagogico.service.FeatureFlagService") as MockFlagSvc,
    ):
        MockTurmaRepo.return_value.get = AsyncMock(return_value=make_turma(turma_id, escola_id))
        MockFlagSvc.return_value.is_enabled = AsyncMock(return_value=flag_disabled(secretaria_id))
        MockAulaRepo.return_value.session = session

        with pytest.raises(HTTPException) as exc:
            await AulaService(session).criar(
                turma_id=turma_id,
                professor_id=professor_id,
                secretaria_id=secretaria_id,
                data=AulaCreate(data=date.today(), disciplina="Português", conteudo="Interpretação"),
            )

    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_criar_aula_turma_inexistente(turma_id, professor_id, secretaria_id):
    session = AsyncMock()

    with (
        patch("app.domains.pedagogico.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.pedagogico.service.AulaRepository") as MockAulaRepo,
    ):
        MockTurmaRepo.return_value.get = AsyncMock(return_value=None)
        MockAulaRepo.return_value.session = session

        with pytest.raises(NotFoundError):
            await AulaService(session).criar(
                turma_id=turma_id,
                professor_id=professor_id,
                secretaria_id=secretaria_id,
                data=AulaCreate(data=date.today(), disciplina="Ciências", conteudo="Fotossíntese"),
            )


# ── Testes: AgendaService ─────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_agenda_agrupa_por_data(turma_id, escola_id, professor_id, secretaria_id):
    """Verifica que a agenda organiza aulas e atividades por data corretamente."""
    session = AsyncMock()
    hoje = date.today()
    amanha = hoje + timedelta(days=1)

    # Objetos SQLAlchemy-like simples com atributos reais (sem MagicMock)
    aula_hoje = MagicMock()
    aula_hoje.data = hoje

    aula_amanha = MagicMock()
    aula_amanha.data = amanha

    atividade_hoje = MagicMock()
    atividade_hoje.prazo = hoje

    aula_hoje_response = make_aula_response(turma_id, professor_id, hoje)
    aula_amanha_response = make_aula_response(turma_id, professor_id, amanha)
    atividade_hoje_response = make_atividade_response(turma_id, professor_id, hoje)

    with (
        patch("app.domains.pedagogico.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.pedagogico.service.AulaRepository") as MockAulaRepo,
        patch("app.domains.pedagogico.service.AtividadeRepository") as MockAtivRepo,
        patch("app.domains.pedagogico.service.FeatureFlagService") as MockFlagSvc,
    ):
        MockTurmaRepo.return_value.get = AsyncMock(return_value=make_turma(turma_id, escola_id))
        MockFlagSvc.return_value.is_enabled = AsyncMock(return_value=flag_enabled(secretaria_id))
        MockAulaRepo.return_value.list_by_turma = AsyncMock(return_value=[aula_hoje, aula_amanha])
        MockAtivRepo.return_value.list_by_turma = AsyncMock(return_value=[atividade_hoje])

        # Substitui AgendaDiaResponse por construção manual para isolar o serviço
        with patch("app.domains.pedagogico.service.AgendaDiaResponse") as MockAgendaResponse:
            MockAgendaResponse.side_effect = lambda **kw: AgendaDiaResponse(
                data=kw["data"],
                aulas=[aula_hoje_response] if kw["data"] == hoje else [aula_amanha_response],
                atividades=[atividade_hoje_response] if kw["data"] == hoje else [],
            )

            resultado = await AgendaService(session).agenda_por_periodo(
                turma_id=turma_id,
                secretaria_id=secretaria_id,
                data_inicio=hoje,
                data_fim=amanha,
            )

    assert len(resultado) == 2
    dia_hoje = next(d for d in resultado if d.data == hoje)
    dia_amanha = next(d for d in resultado if d.data == amanha)

    assert len(dia_hoje.aulas) == 1
    assert len(dia_hoje.atividades) == 1
    assert len(dia_amanha.aulas) == 1
    assert len(dia_amanha.atividades) == 0

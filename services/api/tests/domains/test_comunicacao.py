"""
Testes do domínio comunicacao.

Execução:
    cd services/api
    uv run pytest tests/domains/test_comunicacao.py -v
"""
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.domains.comunicacao.schemas import MensagemCreate
from app.domains.comunicacao.service import AnexoService, MensagemService
from app.domains.features.models import FeatureKey
from app.domains.features.schemas import FeatureStatusResponse
from app.shared.exceptions import NotFoundError


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_turma(turma_id: uuid.UUID, escola_id: uuid.UUID) -> MagicMock:
    t = MagicMock()
    t.id = turma_id
    t.escola_id = escola_id
    return t


def make_mensagem(turma_id: uuid.UUID, remetente_id: uuid.UUID) -> MagicMock:
    m = MagicMock()
    m.id = uuid.uuid4()
    m.turma_id = turma_id
    m.remetente_id = remetente_id
    m.destinatario_id = None
    m.anexos = []
    return m


def flag_enabled(secretaria_id: uuid.UUID) -> FeatureStatusResponse:
    return FeatureStatusResponse(
        feature_key=FeatureKey.comunicacao,
        secretaria_id=secretaria_id,
        escola_id=None,
        enabled=True,
    )


def flag_disabled(secretaria_id: uuid.UUID) -> FeatureStatusResponse:
    return FeatureStatusResponse(
        feature_key=FeatureKey.comunicacao,
        secretaria_id=secretaria_id,
        escola_id=None,
        enabled=False,
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
def remetente_id() -> uuid.UUID:
    return uuid.uuid4()


# ── Testes: MensagemService.criar ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_criar_mensagem_broadcast_com_flag_habilitada(
    turma_id, escola_id, remetente_id, secretaria_id
):
    session = AsyncMock()
    mensagem_mock = make_mensagem(turma_id, remetente_id)

    with (
        patch("app.domains.comunicacao.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.comunicacao.service.MensagemRepository") as MockMsgRepo,
        patch("app.domains.comunicacao.service.FeatureFlagService") as MockFlagSvc,
        patch("app.domains.comunicacao.service.Mensagem", return_value=mensagem_mock),
    ):
        MockTurmaRepo.return_value.get = AsyncMock(return_value=make_turma(turma_id, escola_id))
        MockFlagSvc.return_value.is_enabled = AsyncMock(return_value=flag_enabled(secretaria_id))
        MockMsgRepo.return_value.create = AsyncMock(return_value=mensagem_mock)
        MockMsgRepo.return_value.session = session

        result = await MensagemService(session).criar(
            turma_id=turma_id,
            remetente_id=remetente_id,
            secretaria_id=secretaria_id,
            data=MensagemCreate(assunto="Reunião", corpo="Reunião amanhã às 19h."),
        )

    assert result is mensagem_mock


@pytest.mark.asyncio
async def test_criar_mensagem_rejeita_quando_flag_desabilitada(
    turma_id, escola_id, remetente_id, secretaria_id
):
    session = AsyncMock()

    with (
        patch("app.domains.comunicacao.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.comunicacao.service.MensagemRepository") as MockMsgRepo,
        patch("app.domains.comunicacao.service.FeatureFlagService") as MockFlagSvc,
    ):
        MockTurmaRepo.return_value.get = AsyncMock(return_value=make_turma(turma_id, escola_id))
        MockFlagSvc.return_value.is_enabled = AsyncMock(return_value=flag_disabled(secretaria_id))
        MockMsgRepo.return_value.session = session

        with pytest.raises(HTTPException) as exc:
            await MensagemService(session).criar(
                turma_id=turma_id,
                remetente_id=remetente_id,
                secretaria_id=secretaria_id,
                data=MensagemCreate(assunto="Aviso", corpo="Escola fechada."),
            )

    assert exc.value.status_code == 403


@pytest.mark.asyncio
async def test_criar_mensagem_turma_inexistente(remetente_id, secretaria_id):
    session = AsyncMock()

    with (
        patch("app.domains.comunicacao.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.comunicacao.service.MensagemRepository") as MockMsgRepo,
    ):
        MockTurmaRepo.return_value.get = AsyncMock(return_value=None)
        MockMsgRepo.return_value.session = session

        with pytest.raises(NotFoundError):
            await MensagemService(session).criar(
                turma_id=uuid.uuid4(),
                remetente_id=remetente_id,
                secretaria_id=secretaria_id,
                data=MensagemCreate(assunto="Aviso", corpo="Texto."),
            )


@pytest.mark.asyncio
async def test_criar_mensagem_direta_preenche_destinatario(
    turma_id, escola_id, remetente_id, secretaria_id
):
    """Garante que destinatario_id é propagado quando fornecido."""
    session = AsyncMock()
    destinatario_id = uuid.uuid4()
    capturado: dict = {}

    def capturar_mensagem(**kwargs: object) -> MagicMock:
        capturado.update(kwargs)
        m = MagicMock()
        m.anexos = []
        return m

    with (
        patch("app.domains.comunicacao.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.comunicacao.service.MensagemRepository") as MockMsgRepo,
        patch("app.domains.comunicacao.service.FeatureFlagService") as MockFlagSvc,
        patch("app.domains.comunicacao.service.Mensagem", side_effect=capturar_mensagem),
    ):
        MockTurmaRepo.return_value.get = AsyncMock(return_value=make_turma(turma_id, escola_id))
        MockFlagSvc.return_value.is_enabled = AsyncMock(return_value=flag_enabled(secretaria_id))
        MockMsgRepo.return_value.create = AsyncMock(side_effect=lambda m: m)
        MockMsgRepo.return_value.session = session

        await MensagemService(session).criar(
            turma_id=turma_id,
            remetente_id=remetente_id,
            secretaria_id=secretaria_id,
            data=MensagemCreate(assunto="DM", corpo="Olá!", destinatario_id=destinatario_id),
        )

    assert capturado.get("destinatario_id") == destinatario_id
    assert capturado.get("turma_id") is None


# ── Testes: MensagemService.listar_por_turma ─────────────────────────────────

@pytest.mark.asyncio
async def test_listar_mensagens_retorna_lista(turma_id, escola_id, remetente_id, secretaria_id):
    session = AsyncMock()
    msgs = [make_mensagem(turma_id, remetente_id) for _ in range(3)]

    with (
        patch("app.domains.comunicacao.service.TurmaRepository") as MockTurmaRepo,
        patch("app.domains.comunicacao.service.MensagemRepository") as MockMsgRepo,
        patch("app.domains.comunicacao.service.FeatureFlagService") as MockFlagSvc,
    ):
        MockTurmaRepo.return_value.get = AsyncMock(return_value=make_turma(turma_id, escola_id))
        MockFlagSvc.return_value.is_enabled = AsyncMock(return_value=flag_enabled(secretaria_id))
        MockMsgRepo.return_value.list_by_turma = AsyncMock(return_value=msgs)
        MockMsgRepo.return_value.session = session

        result = await MensagemService(session).listar_por_turma(turma_id, secretaria_id)

    assert len(result) == 3


# ── Testes: MensagemService.remover ──────────────────────────────────────────

@pytest.mark.asyncio
async def test_remover_mensagem_deleta_anexos_do_storage(turma_id, remetente_id, secretaria_id):
    session = AsyncMock()

    anexo1 = MagicMock()
    anexo1.storage_key = "comunicacao/abc/file1.jpg"
    anexo2 = MagicMock()
    anexo2.storage_key = "comunicacao/abc/file2.pdf"

    mensagem_mock = make_mensagem(turma_id, remetente_id)
    mensagem_mock.anexos = [anexo1, anexo2]

    with (
        patch("app.domains.comunicacao.service.MensagemRepository") as MockMsgRepo,
        patch("app.domains.comunicacao.service.storage") as mock_storage,
    ):
        MockMsgRepo.return_value.get = AsyncMock(return_value=mensagem_mock)
        MockMsgRepo.return_value.delete = AsyncMock()
        MockMsgRepo.return_value.session = session
        mock_storage.delete_file = AsyncMock()

        await MensagemService(session).remover(mensagem_mock.id)

    assert mock_storage.delete_file.call_count == 2


# ── Testes: AnexoService.upload ───────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upload_anexo_content_type_invalido(turma_id, remetente_id):
    session = AsyncMock()
    mensagem_mock = make_mensagem(turma_id, remetente_id)

    file = MagicMock()
    file.content_type = "application/zip"
    file.filename = "malware.zip"
    file.read = AsyncMock(return_value=b"data")

    with (
        patch("app.domains.comunicacao.service.MensagemRepository") as MockMsgRepo,
        patch("app.domains.comunicacao.service.storage") as mock_storage,
    ):
        MockMsgRepo.return_value.get = AsyncMock(return_value=mensagem_mock)
        MockMsgRepo.return_value.session = session
        mock_storage.validate_content_type = MagicMock(return_value=False)

        with pytest.raises(HTTPException) as exc:
            await AnexoService(session).upload(mensagem_mock.id, file)

    assert exc.value.status_code == 422  # HTTP_422_UNPROCESSABLE_CONTENT


@pytest.mark.asyncio
async def test_upload_anexo_salva_no_storage_e_banco(turma_id, remetente_id):
    session = AsyncMock()
    mensagem_mock = make_mensagem(turma_id, remetente_id)
    anexo_mock = MagicMock()

    file = MagicMock()
    file.content_type = "image/jpeg"
    file.filename = "foto.jpg"
    file.read = AsyncMock(return_value=b"imagem_fake")

    with (
        patch("app.domains.comunicacao.service.MensagemRepository") as MockMsgRepo,
        patch("app.domains.comunicacao.service.AnexoRepository") as MockAnexoRepo,
        patch("app.domains.comunicacao.service.storage") as mock_storage,
        patch("app.domains.comunicacao.service.Anexo", return_value=anexo_mock),
    ):
        MockMsgRepo.return_value.get = AsyncMock(return_value=mensagem_mock)
        MockMsgRepo.return_value.session = session
        MockAnexoRepo.return_value.create = AsyncMock(return_value=anexo_mock)
        MockAnexoRepo.return_value.session = session
        mock_storage.validate_content_type = MagicMock(return_value=True)
        mock_storage.upload_file = AsyncMock()

        result = await AnexoService(session).upload(mensagem_mock.id, file)

    mock_storage.upload_file.assert_called_once()
    assert result is anexo_mock

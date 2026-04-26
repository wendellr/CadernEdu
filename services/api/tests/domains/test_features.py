"""
Testes do domínio features — FeatureFlagService e hierarquia de resolução.

A hierarquia correta:
  override de escola > flag da secretaria > desabilitado por padrão

Execução:
    cd services/api
    uv run pytest tests/domains/test_features.py -v
"""
import uuid
from unittest.mock import AsyncMock, MagicMock, patch

import pytest

from app.domains.features.models import FeatureKey
from app.domains.features.schemas import FeatureFlagUpsert
from app.domains.features.service import FeatureFlagService


# ── Helpers ───────────────────────────────────────────────────────────────────

def make_flag(enabled: bool) -> MagicMock:
    f = MagicMock()
    f.enabled = enabled
    return f


# ── Fixtures ──────────────────────────────────────────────────────────────────

@pytest.fixture
def secretaria_id() -> uuid.UUID:
    return uuid.uuid4()


@pytest.fixture
def escola_id() -> uuid.UUID:
    return uuid.uuid4()


# ── is_enabled: sem nenhuma flag cadastrada ───────────────────────────────────

@pytest.mark.asyncio
async def test_flag_ausente_retorna_desabilitado(secretaria_id):
    session = AsyncMock()

    with patch("app.domains.features.service.FeatureFlagRepository") as MockRepo:
        MockRepo.return_value.get = AsyncMock(return_value=None)

        result = await FeatureFlagService(session).is_enabled(
            FeatureKey.comunicacao, secretaria_id
        )

    assert result.enabled is False


# ── is_enabled: apenas flag de secretaria ────────────────────────────────────

@pytest.mark.asyncio
async def test_flag_secretaria_habilitada(secretaria_id):
    session = AsyncMock()

    with patch("app.domains.features.service.FeatureFlagRepository") as MockRepo:
        MockRepo.return_value.get = AsyncMock(return_value=make_flag(True))

        result = await FeatureFlagService(session).is_enabled(
            FeatureKey.comunicacao, secretaria_id
        )

    assert result.enabled is True


@pytest.mark.asyncio
async def test_flag_secretaria_desabilitada(secretaria_id):
    session = AsyncMock()

    with patch("app.domains.features.service.FeatureFlagRepository") as MockRepo:
        MockRepo.return_value.get = AsyncMock(return_value=make_flag(False))

        result = await FeatureFlagService(session).is_enabled(
            FeatureKey.agenda_online, secretaria_id
        )

    assert result.enabled is False


# ── is_enabled: hierarquia escola > secretaria ────────────────────────────────

@pytest.mark.asyncio
async def test_override_escola_habilitado_sobrepoe_secretaria_desabilitada(
    secretaria_id, escola_id
):
    """Escola enabled=True deve prevalecer mesmo que a secretaria esteja disabled."""
    session = AsyncMock()

    # Primeira chamada (escola) → habilitada; segunda (secretaria) nunca deveria ocorrer
    with patch("app.domains.features.service.FeatureFlagRepository") as MockRepo:
        MockRepo.return_value.get = AsyncMock(return_value=make_flag(True))

        result = await FeatureFlagService(session).is_enabled(
            FeatureKey.comunicacao, secretaria_id, escola_id
        )

    assert result.enabled is True
    assert result.escola_id == escola_id


@pytest.mark.asyncio
async def test_override_escola_desabilitado_sobrepoe_secretaria_habilitada(
    secretaria_id, escola_id
):
    """Escola enabled=False deve bloquear mesmo que a secretaria esteja enabled."""
    session = AsyncMock()

    with patch("app.domains.features.service.FeatureFlagRepository") as MockRepo:
        MockRepo.return_value.get = AsyncMock(return_value=make_flag(False))

        result = await FeatureFlagService(session).is_enabled(
            FeatureKey.comunicacao, secretaria_id, escola_id
        )

    assert result.enabled is False


@pytest.mark.asyncio
async def test_sem_override_escola_cai_na_secretaria(secretaria_id, escola_id):
    """Sem override de escola, a flag da secretaria é usada."""
    session = AsyncMock()

    # Retorna None para a consulta de escola, flag habilitada para secretaria
    call_count = 0

    async def get_side_effect(key: FeatureKey, sec_id: uuid.UUID, esc_id: uuid.UUID | None):
        nonlocal call_count
        call_count += 1
        if esc_id is not None:
            return None  # sem override de escola
        return make_flag(True)  # secretaria habilitada

    with patch("app.domains.features.service.FeatureFlagRepository") as MockRepo:
        MockRepo.return_value.get = AsyncMock(side_effect=get_side_effect)

        result = await FeatureFlagService(session).is_enabled(
            FeatureKey.agenda_online, secretaria_id, escola_id
        )

    assert result.enabled is True
    assert call_count == 2  # consultou escola e secretaria


# ── upsert ────────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_upsert_cria_nova_flag(secretaria_id):
    session = AsyncMock()
    flag_mock = make_flag(True)

    with patch("app.domains.features.service.FeatureFlagRepository") as MockRepo:
        MockRepo.return_value.upsert = AsyncMock(return_value=flag_mock)

        result = await FeatureFlagService(session).upsert(
            secretaria_id,
            FeatureFlagUpsert(feature_key=FeatureKey.comunicacao, enabled=True),
        )

    assert result is flag_mock
    MockRepo.return_value.upsert.assert_called_once_with(
        feature_key=FeatureKey.comunicacao,
        secretaria_id=secretaria_id,
        escola_id=None,
        enabled=True,
    )


@pytest.mark.asyncio
async def test_upsert_com_override_de_escola(secretaria_id, escola_id):
    session = AsyncMock()
    flag_mock = make_flag(False)

    with patch("app.domains.features.service.FeatureFlagRepository") as MockRepo:
        MockRepo.return_value.upsert = AsyncMock(return_value=flag_mock)

        result = await FeatureFlagService(session).upsert(
            secretaria_id,
            FeatureFlagUpsert(
                feature_key=FeatureKey.agenda_online,
                enabled=False,
                escola_id=escola_id,
            ),
        )

    assert result is flag_mock
    MockRepo.return_value.upsert.assert_called_once_with(
        feature_key=FeatureKey.agenda_online,
        secretaria_id=secretaria_id,
        escola_id=escola_id,
        enabled=False,
    )

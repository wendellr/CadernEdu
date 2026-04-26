import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import AuditMixin, Base


class FeatureKey(str, enum.Enum):
    """Chaves de funcionalidade disponíveis na plataforma."""

    # Módulos baseline — obrigatórios em todo contrato
    agenda_online = "agenda_online"
    comunicacao = "comunicacao"

    # Módulos opcionais — habilitados por contrato
    trilhas_bncc = "trilhas_bncc"
    gamificacao = "gamificacao"
    biblioteca_digital = "biblioteca_digital"
    onibus_ao_vivo = "onibus_ao_vivo"
    dashboard_evasao = "dashboard_evasao"
    tutor_ia = "tutor_ia"
    censo_inep = "censo_inep"


class FeatureFlag(AuditMixin, Base):
    """
    Controla quais funcionalidades estão ativas por Secretaria e, opcionalmente, por Escola.

    Hierarquia de resolução:
    1. Flag específica de (secretaria_id, escola_id) — maior prioridade
    2. Flag de (secretaria_id, escola_id=NULL)       — aplica a toda a secretaria
    3. Ausência de flag                              — desabilitado por padrão
    """

    __tablename__ = "feature_flags"
    __table_args__ = (
        UniqueConstraint(
            "feature_key", "secretaria_id", "escola_id",
            name="uq_feature_flags_key_secretaria_escola",
        ),
    )

    feature_key: Mapped[FeatureKey] = mapped_column(
        Enum(FeatureKey, name="feature_key"), nullable=False
    )
    secretaria_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("secretarias.id", ondelete="CASCADE"),
        nullable=False,
    )
    # NULL = flag vale para toda a secretaria; preenchido = override por escola
    escola_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("escolas.id", ondelete="CASCADE"),
        nullable=True,
    )
    enabled: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    secretaria: Mapped["Secretaria"] = relationship(  # type: ignore[name-defined]
        back_populates="feature_flags",
        primaryjoin="foreign(FeatureFlag.secretaria_id) == Secretaria.id",
    )


# Importação tardia para resolver referência circular
from app.domains.identity.models import Secretaria  # noqa: E402, F401

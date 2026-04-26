import enum
import uuid

from sqlalchemy import Boolean, Enum, ForeignKey, Integer, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import AuditMixin, Base


class PerfilUsuario(enum.StrEnum):
    aluno = "aluno"
    responsavel = "responsavel"
    professor = "professor"
    gestor_escola = "gestor_escola"
    secretaria = "secretaria"


class Secretaria(AuditMixin, Base):
    """Cliente da plataforma — representa uma Secretaria Municipal de Educação."""

    __tablename__ = "secretarias"

    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    municipio: Mapped[str] = mapped_column(String(100), nullable=False)
    estado: Mapped[str] = mapped_column(String(2), nullable=False)
    cnpj: Mapped[str] = mapped_column(String(18), nullable=False, unique=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    escolas: Mapped[list["Escola"]] = relationship(back_populates="secretaria")
    usuarios: Mapped[list["Usuario"]] = relationship(back_populates="secretaria")
    feature_flags: Mapped[list["FeatureFlag"]] = relationship(  # type: ignore[name-defined]
        back_populates="secretaria",
        primaryjoin="Secretaria.id == foreign(FeatureFlag.secretaria_id)",
    )


class Escola(AuditMixin, Base):
    """Unidade escolar vinculada a uma Secretaria."""

    __tablename__ = "escolas"

    secretaria_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("secretarias.id", ondelete="RESTRICT"),
        nullable=False,
    )
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    codigo_inep: Mapped[str | None] = mapped_column(String(8), nullable=True, unique=True)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    secretaria: Mapped[Secretaria] = relationship(back_populates="escolas")
    usuarios: Mapped[list["Usuario"]] = relationship(back_populates="escola")
    turmas: Mapped[list["Turma"]] = relationship(back_populates="escola")


class Turma(AuditMixin, Base):
    """Turma escolar — referenciada por pedagogico, comunicacao e gestao."""

    __tablename__ = "turmas"
    __table_args__ = (
        UniqueConstraint("escola_id", "nome", "ano_letivo", name="uq_turmas_escola_nome_ano"),
    )

    escola_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("escolas.id", ondelete="RESTRICT"),
        nullable=False,
    )
    nome: Mapped[str] = mapped_column(String(50), nullable=False)  # "5º Ano A"
    serie: Mapped[str] = mapped_column(String(50), nullable=False)  # "5º Ano"
    ano_letivo: Mapped[int] = mapped_column(Integer, nullable=False)  # 2026
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    escola: Mapped[Escola] = relationship(back_populates="turmas")


class ResponsavelAluno(AuditMixin, Base):
    """Vínculo N:N entre responsável (pai/mãe/tutor) e aluno."""

    __tablename__ = "responsavel_aluno"
    __table_args__ = (UniqueConstraint("responsavel_id", "aluno_id", name="uq_responsavel_aluno"),)

    responsavel_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
    )
    aluno_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="CASCADE"),
        nullable=False,
    )


class Usuario(AuditMixin, Base):
    """Usuário da plataforma. Identidade gerenciada pelo Keycloak."""

    __tablename__ = "usuarios"
    __table_args__ = (UniqueConstraint("keycloak_id", name="uq_usuarios_keycloak_id"),)

    keycloak_id: Mapped[str] = mapped_column(String(36), nullable=False)
    nome: Mapped[str] = mapped_column(String(200), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False)
    perfil: Mapped[PerfilUsuario] = mapped_column(
        Enum(PerfilUsuario, name="perfil_usuario"), nullable=False
    )
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    secretaria_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("secretarias.id", ondelete="SET NULL"),
        nullable=True,
    )
    escola_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("escolas.id", ondelete="SET NULL"),
        nullable=True,
    )

    secretaria: Mapped[Secretaria | None] = relationship(back_populates="usuarios")
    escola: Mapped[Escola | None] = relationship(back_populates="usuarios")


# Importação tardia para evitar ciclo com features
from app.domains.features.models import FeatureFlag  # noqa: E402, F401

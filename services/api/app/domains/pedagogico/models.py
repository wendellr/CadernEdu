import uuid
from datetime import date

from sqlalchemy import Date, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import AuditMixin, Base


class Aula(AuditMixin, Base):
    """Registro de uma aula num dia específico para uma turma."""

    __tablename__ = "aulas"

    turma_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("turmas.id", ondelete="RESTRICT"),
        nullable=False,
    )
    professor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
    )
    data: Mapped[date] = mapped_column(Date, nullable=False)
    disciplina: Mapped[str] = mapped_column(String(100), nullable=False)
    conteudo: Mapped[str] = mapped_column(Text, nullable=False)
    observacoes: Mapped[str | None] = mapped_column(Text, nullable=True)

    atividades: Mapped[list["AtividadeDeCasa"]] = relationship(
        back_populates="aula", cascade="all, delete-orphan"
    )


class AtividadeDeCasa(AuditMixin, Base):
    """Atividade de casa vinculada a uma aula (ou criada avulsa para uma turma)."""

    __tablename__ = "atividades_de_casa"

    aula_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("aulas.id", ondelete="SET NULL"),
        nullable=True,
    )
    turma_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("turmas.id", ondelete="RESTRICT"),
        nullable=False,
    )
    professor_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
    )
    disciplina: Mapped[str] = mapped_column(String(100), nullable=False)
    descricao: Mapped[str] = mapped_column(Text, nullable=False)
    prazo: Mapped[date] = mapped_column(Date, nullable=False)
    peso: Mapped[float | None] = mapped_column(Numeric(4, 2), nullable=True)

    aula: Mapped[Aula | None] = relationship(back_populates="atividades")

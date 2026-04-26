import uuid

from sqlalchemy import Boolean, ForeignKey, Integer, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.shared.base_model import AuditMixin, Base


class Matricula(AuditMixin, Base):
    """Matrícula de um aluno em uma turma num ano letivo.

    Transferência = nova matrícula ativa + matrícula anterior com ativo=False.
    """

    __tablename__ = "matriculas"
    __table_args__ = (
        UniqueConstraint(
            "aluno_id", "turma_id", "ano_letivo",
            name="uq_matricula_aluno_turma_ano",
        ),
    )

    aluno_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
    )
    turma_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("turmas.id", ondelete="RESTRICT"),
        nullable=False,
    )
    ano_letivo: Mapped[int] = mapped_column(Integer, nullable=False)
    ativo: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.shared.base_model import AuditMixin, Base


class Mensagem(AuditMixin, Base):
    """Comunicado enviado a uma turma (broadcast) ou a um destinatário específico (DM).

    Invariante: turma_id XOR destinatario_id — exatamente um deve ser preenchido.
    Esse invariante é garantido pelo service, não pelo banco.
    """

    __tablename__ = "mensagens"

    remetente_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=False,
    )
    # Preenchido quando a mensagem é broadcast para uma turma
    turma_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("turmas.id", ondelete="RESTRICT"),
        nullable=True,
    )
    # Preenchido quando a mensagem é direta para um usuário específico
    destinatario_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("usuarios.id", ondelete="RESTRICT"),
        nullable=True,
    )
    # Mantido desnormalizado para verificação de feature flag sem join extra
    secretaria_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("secretarias.id", ondelete="RESTRICT"),
        nullable=False,
    )
    assunto: Mapped[str] = mapped_column(String(200), nullable=False)
    corpo: Mapped[str] = mapped_column(Text, nullable=False)

    anexos: Mapped[list["Anexo"]] = relationship(
        back_populates="mensagem", cascade="all, delete-orphan"
    )


class Anexo(AuditMixin, Base):
    """Arquivo anexado a uma mensagem (foto/vídeo/PDF)."""

    __tablename__ = "mensagem_anexos"

    mensagem_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("mensagens.id", ondelete="CASCADE"),
        nullable=False,
    )
    nome_original: Mapped[str] = mapped_column(String(255), nullable=False)
    content_type: Mapped[str] = mapped_column(String(100), nullable=False)
    # Caminho dentro do bucket MinIO: comunicacao/{mensagem_id}/{uuid}.{ext}
    storage_key: Mapped[str] = mapped_column(String(500), nullable=False)
    tamanho_bytes: Mapped[int] = mapped_column(Integer, nullable=False)

    mensagem: Mapped[Mensagem] = relationship(back_populates="anexos")

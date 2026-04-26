"""mensagens e mensagem_anexos

Revision ID: 0004
Revises: 0003
Create Date: 2026-04-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "mensagens",
        sa.Column("id",               postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("remetente_id",     postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("usuarios.id",    ondelete="RESTRICT"), nullable=False),
        sa.Column("turma_id",         postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("turmas.id",      ondelete="RESTRICT"), nullable=True),
        sa.Column("destinatario_id",  postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("usuarios.id",    ondelete="RESTRICT"), nullable=True),
        sa.Column("secretaria_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("secretarias.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("assunto",          sa.String(200), nullable=False),
        sa.Column("corpo",            sa.Text(),      nullable=False),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_mensagens_turma_id",        "mensagens", ["turma_id"])
    op.create_index("ix_mensagens_destinatario_id", "mensagens", ["destinatario_id"])
    op.create_index("ix_mensagens_remetente_id",    "mensagens", ["remetente_id"])
    op.create_index("ix_mensagens_created_at",      "mensagens", ["created_at"])

    op.create_table(
        "mensagem_anexos",
        sa.Column("id",             postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("mensagem_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("mensagens.id", ondelete="CASCADE"), nullable=False),
        sa.Column("nome_original",  sa.String(255), nullable=False),
        sa.Column("content_type",   sa.String(100), nullable=False),
        sa.Column("storage_key",    sa.String(500), nullable=False),
        sa.Column("tamanho_bytes",  sa.Integer(),   nullable=False),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_mensagem_anexos_mensagem_id", "mensagem_anexos", ["mensagem_id"])


def downgrade() -> None:
    op.drop_table("mensagem_anexos")
    op.drop_table("mensagens")

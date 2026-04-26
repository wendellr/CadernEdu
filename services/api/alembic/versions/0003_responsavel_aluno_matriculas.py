"""responsavel_aluno e matriculas

Revision ID: 0003
Revises: 0002
Create Date: 2026-04-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "responsavel_aluno",
        sa.Column("id",              postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("responsavel_id",  postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False),
        sa.Column("aluno_id",        postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("usuarios.id", ondelete="CASCADE"), nullable=False),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("responsavel_id", "aluno_id", name="uq_responsavel_aluno"),
    )
    op.create_index("ix_responsavel_aluno_responsavel_id", "responsavel_aluno", ["responsavel_id"])
    op.create_index("ix_responsavel_aluno_aluno_id",       "responsavel_aluno", ["aluno_id"])

    op.create_table(
        "matriculas",
        sa.Column("id",          postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("aluno_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("turma_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("turmas.id",   ondelete="RESTRICT"), nullable=False),
        sa.Column("ano_letivo",  sa.Integer(),  nullable=False),
        sa.Column("ativo",       sa.Boolean(),  nullable=False, server_default="true"),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("aluno_id", "turma_id", "ano_letivo", name="uq_matricula_aluno_turma_ano"),
    )
    op.create_index("ix_matriculas_aluno_id",   "matriculas", ["aluno_id"])
    op.create_index("ix_matriculas_turma_id",   "matriculas", ["turma_id"])
    op.create_index("ix_matriculas_ano_letivo", "matriculas", ["ano_letivo"])


def downgrade() -> None:
    op.drop_table("matriculas")
    op.drop_table("responsavel_aluno")

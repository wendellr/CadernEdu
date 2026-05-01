"""rbac profiles and professor_turmas

Revision ID: 0006
Revises: 0005
Create Date: 2026-05-01
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.execute("ALTER TYPE perfil_usuario ADD VALUE IF NOT EXISTS 'diretor'")
    op.execute("ALTER TYPE perfil_usuario ADD VALUE IF NOT EXISTS 'coordenador'")
    op.execute("ALTER TYPE feature_key ADD VALUE IF NOT EXISTS 'cardapio'")
    op.execute("ALTER TYPE feature_key ADD VALUE IF NOT EXISTS 'transporte'")

    op.create_table(
        "professor_turmas",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "professor_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("usuarios.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column(
            "turma_id",
            postgresql.UUID(as_uuid=True),
            sa.ForeignKey("turmas.id", ondelete="CASCADE"),
            nullable=False,
        ),
        sa.Column("ano_letivo", sa.Integer(), nullable=False),
        sa.Column("ativo", sa.Boolean(), nullable=False, server_default="true"),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
        ),
        sa.UniqueConstraint("professor_id", "turma_id", "ano_letivo", name="uq_professor_turma_ano"),
    )
    op.create_index("ix_professor_turmas_professor_id", "professor_turmas", ["professor_id"])
    op.create_index("ix_professor_turmas_turma_id", "professor_turmas", ["turma_id"])


def downgrade() -> None:
    op.drop_index("ix_professor_turmas_turma_id", table_name="professor_turmas")
    op.drop_index("ix_professor_turmas_professor_id", table_name="professor_turmas")
    op.drop_table("professor_turmas")

"""chamada digital — tabela presencas

Revision ID: 0005
Revises: 0004
Create Date: 2026-04-26
"""
import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision: str = "0005"
down_revision: str | None = "0004"
branch_labels: str | tuple[str, ...] | None = None
depends_on: str | tuple[str, ...] | None = None


def upgrade() -> None:
    op.execute("CREATE TYPE status_presenca AS ENUM ('presente', 'falta', 'atestado')")

    op.create_table(
        "presencas",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True,
                  server_default=sa.text("gen_random_uuid()")),
        sa.Column("turma_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("turmas.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("aluno_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("professor_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("secretaria_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("secretarias.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("data", sa.Date(), nullable=False),
        sa.Column("status", postgresql.ENUM("presente", "falta", "atestado",
                  name="status_presenca", create_type=False), nullable=False),
        sa.Column("observacoes", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True),
                  server_default=sa.func.now(), onupdate=sa.func.now(), nullable=False),
        sa.UniqueConstraint("turma_id", "aluno_id", "data", name="uq_presenca_turma_aluno_data"),
    )
    op.create_index("ix_presencas_turma_data", "presencas", ["turma_id", "data"])
    op.create_index("ix_presencas_aluno", "presencas", ["aluno_id"])


def downgrade() -> None:
    op.drop_index("ix_presencas_aluno")
    op.drop_index("ix_presencas_turma_data")
    op.drop_table("presencas")
    op.execute("DROP TYPE status_presenca")

"""turmas, aulas e atividades_de_casa

Revision ID: 0002
Revises: 0001
Create Date: 2026-04-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0002"
down_revision: Union[str, None] = "0001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "turmas",
        sa.Column("id",          postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("escola_id",   postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("escolas.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("nome",        sa.String(50),  nullable=False),
        sa.Column("serie",       sa.String(50),  nullable=False),
        sa.Column("ano_letivo",  sa.Integer(),   nullable=False),
        sa.Column("ativo",       sa.Boolean(),   nullable=False, server_default="true"),
        sa.Column("created_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",  sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("escola_id", "nome", "ano_letivo", name="uq_turmas_escola_nome_ano"),
    )
    op.create_index("ix_turmas_escola_id", "turmas", ["escola_id"])
    op.create_index("ix_turmas_ano_letivo", "turmas", ["ano_letivo"])

    op.create_table(
        "aulas",
        sa.Column("id",           postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("turma_id",     postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("turmas.id",   ondelete="RESTRICT"), nullable=False),
        sa.Column("professor_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("data",         sa.Date(),      nullable=False),
        sa.Column("disciplina",   sa.String(100), nullable=False),
        sa.Column("conteudo",     sa.Text(),      nullable=False),
        sa.Column("observacoes",  sa.Text(),      nullable=True),
        sa.Column("created_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_aulas_turma_id", "aulas", ["turma_id"])
    op.create_index("ix_aulas_data",     "aulas", ["data"])
    op.create_index("ix_aulas_turma_data", "aulas", ["turma_id", "data"])

    op.create_table(
        "atividades_de_casa",
        sa.Column("id",           postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("aula_id",      postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("aulas.id",    ondelete="SET NULL"), nullable=True),
        sa.Column("turma_id",     postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("turmas.id",   ondelete="RESTRICT"), nullable=False),
        sa.Column("professor_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("usuarios.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("disciplina",   sa.String(100),    nullable=False),
        sa.Column("descricao",    sa.Text(),         nullable=False),
        sa.Column("prazo",        sa.Date(),         nullable=False),
        sa.Column("peso",         sa.Numeric(4, 2),  nullable=True),
        sa.Column("created_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_atividades_turma_id", "atividades_de_casa", ["turma_id"])
    op.create_index("ix_atividades_prazo",    "atividades_de_casa", ["prazo"])


def downgrade() -> None:
    op.drop_table("atividades_de_casa")
    op.drop_table("aulas")
    op.drop_table("turmas")

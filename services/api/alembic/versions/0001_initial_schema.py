"""initial schema — secretarias, escolas, usuarios, feature_flags

Revision ID: 0001
Revises:
Create Date: 2026-04-25
"""
from typing import Sequence, Union

import sqlalchemy as sa
from sqlalchemy.dialects import postgresql
from alembic import op

revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

# Referências aos tipos já criados no banco — create_type=False impede
# que o SQLAlchemy tente recriá-los durante create_table.
_perfil_usuario = postgresql.ENUM(name="perfil_usuario", create_type=False)
_feature_key    = postgresql.ENUM(name="feature_key",    create_type=False)


def upgrade() -> None:
    # Cria os tipos via SQL puro — sem objetos ENUM do SQLAlchemy gerenciando o ciclo de vida
    op.execute("DROP TYPE IF EXISTS perfil_usuario CASCADE")
    op.execute("DROP TYPE IF EXISTS feature_key CASCADE")

    op.execute("""
        CREATE TYPE perfil_usuario AS ENUM (
            'aluno', 'responsavel', 'professor', 'diretor', 'coordenador',
            'gestor_escola', 'secretaria'
        )
    """)
    op.execute("""
        CREATE TYPE feature_key AS ENUM (
            'agenda_online', 'comunicacao', 'cardapio', 'transporte',
            'trilhas_bncc', 'gamificacao', 'biblioteca_digital',
            'onibus_ao_vivo', 'dashboard_evasao', 'tutor_ia', 'censo_inep'
        )
    """)

    op.create_table(
        "secretarias",
        sa.Column("id",         postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("nome",       sa.String(200), nullable=False),
        sa.Column("municipio",  sa.String(100), nullable=False),
        sa.Column("estado",     sa.String(2),   nullable=False),
        sa.Column("cnpj",       sa.String(18),  nullable=False, unique=True),
        sa.Column("ativo",      sa.Boolean(),   nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )

    op.create_table(
        "escolas",
        sa.Column("id",           postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("secretaria_id",postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("secretarias.id", ondelete="RESTRICT"), nullable=False),
        sa.Column("nome",         sa.String(200), nullable=False),
        sa.Column("codigo_inep",  sa.String(8),   nullable=True, unique=True),
        sa.Column("ativo",        sa.Boolean(),   nullable=False, server_default="true"),
        sa.Column("created_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )
    op.create_index("ix_escolas_secretaria_id", "escolas", ["secretaria_id"])

    op.create_table(
        "usuarios",
        sa.Column("id",           postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("keycloak_id",  sa.String(36),  nullable=False),
        sa.Column("nome",         sa.String(200), nullable=False),
        sa.Column("email",        sa.String(254), nullable=False),
        sa.Column("perfil",       _perfil_usuario, nullable=False),
        sa.Column("ativo",        sa.Boolean(),   nullable=False, server_default="true"),
        sa.Column("secretaria_id",postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("secretarias.id", ondelete="SET NULL"), nullable=True),
        sa.Column("escola_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("escolas.id",     ondelete="SET NULL"), nullable=True),
        sa.Column("created_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint("keycloak_id", name="uq_usuarios_keycloak_id"),
    )
    op.create_index("ix_usuarios_secretaria_id", "usuarios", ["secretaria_id"])
    op.create_index("ix_usuarios_escola_id",     "usuarios", ["escola_id"])

    op.create_table(
        "feature_flags",
        sa.Column("id",           postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("feature_key",  _feature_key,   nullable=False),
        sa.Column("secretaria_id",postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("secretarias.id", ondelete="CASCADE"), nullable=False),
        sa.Column("escola_id",    postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("escolas.id",     ondelete="CASCADE"), nullable=True),
        sa.Column("enabled",      sa.Boolean(),   nullable=False, server_default="true"),
        sa.Column("created_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at",   sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.UniqueConstraint(
            "feature_key", "secretaria_id", "escola_id",
            name="uq_feature_flags_key_secretaria_escola",
        ),
    )
    op.create_index("ix_feature_flags_secretaria_id", "feature_flags", ["secretaria_id"])
    op.create_index("ix_feature_flags_escola_id",     "feature_flags", ["escola_id"])


def downgrade() -> None:
    op.drop_table("feature_flags")
    op.drop_table("usuarios")
    op.drop_table("escolas")
    op.drop_table("secretarias")
    op.execute("DROP TYPE IF EXISTS feature_key")
    op.execute("DROP TYPE IF EXISTS perfil_usuario")

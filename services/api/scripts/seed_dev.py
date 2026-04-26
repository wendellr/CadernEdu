"""
Script de seed para desenvolvimento local.

Cria:
  - 1 Secretaria  → SME Cidade Teste
  - 1 Escola      → EMEF Prof. João Silva
  - 2 Turmas      → 5º Ano A e 3º Ano B (2026)
  - 1 Professor   → professor@teste.edu.br
  - 2 Alunos      → aluno@teste.edu.br, aluno2@teste.edu.br
  - 1 Responsável → responsavel@teste.edu.br (pai de ambos os alunos)
  - Matrículas    → alunos vinculados às turmas
  - Feature flags → agenda_online + comunicacao habilitados

Uso:
    docker compose exec api python scripts/seed_dev.py
    # ou localmente:
    cd services/api && uv run python scripts/seed_dev.py
"""
import asyncio
import sys
import os

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.core.config import settings
from app.domains.identity.models import (
    Escola, PerfilUsuario, ResponsavelAluno, Secretaria, Turma, Usuario,
)
from app.domains.features.models import FeatureFlag, FeatureKey
from app.domains.gestao.models import Matricula

engine = create_async_engine(settings.database_url, echo=False)
Session = async_sessionmaker(engine, expire_on_commit=False)


async def seed():
    async with Session() as session:
        async with session.begin():
            # ── Secretaria ────────────────────────────────────────────────────
            secretaria = Secretaria(
                nome="SME Cidade Teste",
                municipio="Cidade Teste",
                estado="SP",
                cnpj="00.000.000/0001-00",
                ativo=True,
            )
            session.add(secretaria)
            await session.flush()

            # ── Escola ────────────────────────────────────────────────────────
            escola = Escola(
                secretaria_id=secretaria.id,
                nome="EMEF Prof. João Silva",
                codigo_inep="12345678",
                ativo=True,
            )
            session.add(escola)
            await session.flush()

            # ── Turmas ────────────────────────────────────────────────────────
            turma_5a = Turma(
                escola_id=escola.id,
                nome="5º Ano A",
                serie="5º Ano",
                ano_letivo=2026,
                ativo=True,
            )
            turma_3b = Turma(
                escola_id=escola.id,
                nome="3º Ano B",
                serie="3º Ano",
                ano_letivo=2026,
                ativo=True,
            )
            session.add_all([turma_5a, turma_3b])

            # ── Usuário professor ─────────────────────────────────────────────
            professor = Usuario(
                keycloak_id="dev-professor-001",
                nome="Maria Professora",
                email="professor@teste.edu.br",
                perfil=PerfilUsuario.professor,
                secretaria_id=secretaria.id,
                escola_id=escola.id,
                ativo=True,
            )
            session.add(professor)

            # ── Alunos ────────────────────────────────────────────────────────
            aluno1 = Usuario(
                keycloak_id="dev-aluno-001",
                nome="Lucas Aluno",
                email="aluno@teste.edu.br",
                perfil=PerfilUsuario.aluno,
                secretaria_id=secretaria.id,
                escola_id=escola.id,
                ativo=True,
            )
            aluno2 = Usuario(
                keycloak_id="dev-aluno-002",
                nome="Ana Aluna",
                email="aluno2@teste.edu.br",
                perfil=PerfilUsuario.aluno,
                secretaria_id=secretaria.id,
                escola_id=escola.id,
                ativo=True,
            )
            session.add_all([aluno1, aluno2])

            # ── Responsável ───────────────────────────────────────────────────
            responsavel = Usuario(
                keycloak_id="dev-responsavel-001",
                nome="João Responsável",
                email="responsavel@teste.edu.br",
                perfil=PerfilUsuario.responsavel,
                secretaria_id=secretaria.id,
                ativo=True,
            )
            session.add(responsavel)
            await session.flush()

            # ── Vínculos responsável → filhos ─────────────────────────────────
            session.add_all([
                ResponsavelAluno(responsavel_id=responsavel.id, aluno_id=aluno1.id),
                ResponsavelAluno(responsavel_id=responsavel.id, aluno_id=aluno2.id),
            ])

            # ── Matrículas ────────────────────────────────────────────────────
            session.add_all([
                Matricula(aluno_id=aluno1.id, turma_id=turma_5a.id, ano_letivo=2026, ativo=True),
                Matricula(aluno_id=aluno2.id, turma_id=turma_3b.id, ano_letivo=2026, ativo=True),
            ])

            # ── Feature flags ─────────────────────────────────────────────────
            for key in (FeatureKey.agenda_online, FeatureKey.comunicacao):
                session.add(
                    FeatureFlag(
                        feature_key=key,
                        secretaria_id=secretaria.id,
                        escola_id=None,
                        enabled=True,
                    )
                )

            await session.flush()

        print("✅ Seed concluído!")
        print(f"   Secretaria : {secretaria.nome}")
        print(f"   Escola     : {escola.nome}")
        print()
        print("   ── Logins de teste (senha: qualquer valor em dev) ──")
        print(f"   Professor  : professor@teste.edu.br")
        print(f"   Aluno 1    : aluno@teste.edu.br   → {turma_5a.nome}")
        print(f"   Aluno 2    : aluno2@teste.edu.br  → {turma_3b.nome}")
        print(f"   Responsável: responsavel@teste.edu.br → 2 filhos")


asyncio.run(seed())

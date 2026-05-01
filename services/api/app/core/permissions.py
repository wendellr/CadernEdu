import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.deps import AuthContext
from app.domains.gestao.models import Matricula, ProfessorTurma
from app.domains.identity.models import Escola, PerfilUsuario, ResponsavelAluno, Turma
from app.shared.exceptions import ForbiddenError, NotFoundError


async def get_turma_or_404(session: AsyncSession, turma_id: uuid.UUID) -> Turma:
    turma = await session.get(Turma, turma_id)
    if not turma:
        raise NotFoundError("Turma", turma_id)
    return turma


async def can_access_turma(session: AsyncSession, auth: AuthContext, turma_id: uuid.UUID) -> bool:
    turma = await get_turma_or_404(session, turma_id)
    secretaria_id = await session.scalar(
        select(Escola.secretaria_id).where(Escola.id == turma.escola_id)
    )

    if auth.is_secretaria:
        return auth.secretaria_id == secretaria_id

    if auth.is_gestor_escola:
        return auth.escola_id == turma.escola_id

    if auth.is_professor:
        vinculo = await session.scalar(
            select(ProfessorTurma.id).where(
                ProfessorTurma.professor_id == auth.user_id,
                ProfessorTurma.turma_id == turma_id,
                ProfessorTurma.ativo.is_(True),
            )
        )
        return vinculo is not None

    if auth.is_aluno:
        matricula = await session.scalar(
            select(Matricula.id).where(
                Matricula.aluno_id == auth.user_id,
                Matricula.turma_id == turma_id,
                Matricula.ativo.is_(True),
            )
        )
        return matricula is not None

    if auth.is_responsavel:
        filho = await session.scalar(
            select(ResponsavelAluno.aluno_id)
            .join(Matricula, Matricula.aluno_id == ResponsavelAluno.aluno_id)
            .where(
                ResponsavelAluno.responsavel_id == auth.user_id,
                Matricula.turma_id == turma_id,
                Matricula.ativo.is_(True),
            )
        )
        return filho is not None

    return False


async def require_turma_access(
    session: AsyncSession,
    auth: AuthContext,
    turma_id: uuid.UUID,
    *,
    write: bool = False,
) -> None:
    if write and auth.perfil not in {
        PerfilUsuario.secretaria,
        PerfilUsuario.diretor,
        PerfilUsuario.coordenador,
        PerfilUsuario.gestor_escola,
        PerfilUsuario.professor,
    }:
        raise ForbiddenError("Perfil sem permissão de escrita nesta turma")
    if not await can_access_turma(session, auth, turma_id):
        raise ForbiddenError("Usuário fora do escopo desta turma")

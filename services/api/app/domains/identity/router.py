import uuid

from fastapi import APIRouter, Query, status

from app.core.deps import AuthContext, AuthContextDep, SessionDep
from app.domains.identity.models import PerfilUsuario
from app.domains.identity.repository import UsuarioRepository
from app.domains.identity.schemas import (
    AlunoSimplificadoResponse,
    EscolaCreate,
    EscolaResponse,
    EscolaUpdate,
    SecretariaCreate,
    SecretariaResponse,
    TurmaCreate,
    TurmaResponse,
    TurmaUpdate,
    UsuarioCreate,
    UsuarioResponse,
    UsuarioUpdate,
)
from app.domains.identity.service import (
    EscolaService,
    SecretariaService,
    TurmaService,
    UsuarioService,
)
from app.shared.exceptions import ForbiddenError

router = APIRouter(prefix="/identity", tags=["identity"])


def _assert_secretaria_scope(auth: AuthContext, secretaria_id: uuid.UUID) -> None:
    if auth.secretaria_id != secretaria_id:
        raise ForbiddenError("Usuário fora do escopo desta secretaria")


async def _assert_escola_scope(
    escola_id: uuid.UUID,
    session: SessionDep,
    auth: AuthContext,
    *,
    write: bool = False,
) -> None:
    escola = await EscolaService(session).get_or_404(escola_id)
    _assert_secretaria_scope(auth, escola.secretaria_id)
    if auth.is_secretaria:
        return
    if auth.is_gestor_escola and auth.escola_id == escola_id:
        return
    if not write and auth.is_professor and auth.escola_id == escola_id:
        return
    raise ForbiddenError("Usuário fora do escopo desta escola")


async def _assert_turma_scope(
    turma_id: uuid.UUID,
    session: SessionDep,
    auth: AuthContext,
    *,
    write: bool = False,
) -> None:
    turma = await TurmaService(session).get_or_404(turma_id)
    await _assert_escola_scope(turma.escola_id, session, auth, write=write)
    if auth.is_professor and not auth.is_secretaria and not auth.is_gestor_escola:
        permitido = await TurmaService(session).repo.professor_tem_turma(auth.user_id, turma_id)
        if not permitido:
            raise ForbiddenError("Professor sem vínculo com esta turma")


# ── Secretarias ───────────────────────────────────────────────────────────────


@router.post("/secretarias", response_model=SecretariaResponse, status_code=status.HTTP_201_CREATED)
async def criar_secretaria(data: SecretariaCreate, session: SessionDep, auth: AuthContextDep):
    if not auth.is_secretaria:
        raise ForbiddenError("Somente o perfil secretaria pode criar secretarias")
    return await SecretariaService(session).criar(data)


@router.get("/secretarias", response_model=list[SecretariaResponse])
async def listar_secretarias(session: SessionDep, auth: AuthContextDep):
    if not auth.is_secretaria:
        raise ForbiddenError("Somente o perfil secretaria pode listar secretarias")
    return await SecretariaService(session).listar()


@router.get("/secretarias/{secretaria_id}", response_model=SecretariaResponse)
async def get_secretaria(secretaria_id: uuid.UUID, session: SessionDep, auth: AuthContextDep):
    _assert_secretaria_scope(auth, secretaria_id)
    return await SecretariaService(session).get_or_404(secretaria_id)


# ── Escolas ───────────────────────────────────────────────────────────────────


@router.post(
    "/secretarias/{secretaria_id}/escolas",
    response_model=EscolaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def criar_escola(
    secretaria_id: uuid.UUID, data: EscolaCreate, session: SessionDep, auth: AuthContextDep
):
    _assert_secretaria_scope(auth, secretaria_id)
    if not auth.is_secretaria:
        raise ForbiddenError("Somente secretaria pode criar escolas")
    return await EscolaService(session).criar(secretaria_id, data)


@router.get("/secretarias/{secretaria_id}/escolas", response_model=list[EscolaResponse])
async def listar_escolas(secretaria_id: uuid.UUID, session: SessionDep, auth: AuthContextDep):
    _assert_secretaria_scope(auth, secretaria_id)
    if auth.is_secretaria:
        return await EscolaService(session).listar_por_secretaria(secretaria_id)
    if auth.escola_id:
        return await EscolaService(session).repo.list_by_ids([auth.escola_id])
    return []


@router.get("/escolas/{escola_id}", response_model=EscolaResponse)
async def get_escola(escola_id: uuid.UUID, session: SessionDep, auth: AuthContextDep):
    await _assert_escola_scope(escola_id, session, auth)
    return await EscolaService(session).get_or_404(escola_id)


@router.patch("/escolas/{escola_id}", response_model=EscolaResponse)
async def atualizar_escola(
    escola_id: uuid.UUID, data: EscolaUpdate, session: SessionDep, auth: AuthContextDep
):
    await _assert_escola_scope(escola_id, session, auth, write=True)
    if not auth.is_secretaria:
        raise ForbiddenError("Somente secretaria pode editar escolas")
    return await EscolaService(session).atualizar(escola_id, data)


@router.delete("/escolas/{escola_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_escola(escola_id: uuid.UUID, session: SessionDep, auth: AuthContextDep):
    await _assert_escola_scope(escola_id, session, auth, write=True)
    if not auth.is_secretaria:
        raise ForbiddenError("Somente secretaria pode remover escolas")
    await EscolaService(session).remover(escola_id)


# ── Turmas ────────────────────────────────────────────────────────────────────


@router.post(
    "/escolas/{escola_id}/turmas",
    response_model=TurmaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def criar_turma(
    escola_id: uuid.UUID, data: TurmaCreate, session: SessionDep, auth: AuthContextDep
):
    await _assert_escola_scope(escola_id, session, auth, write=True)
    if not (auth.is_secretaria or auth.is_gestor_escola):
        raise ForbiddenError("Somente secretaria, diretor ou coordenador pode criar turmas")
    return await TurmaService(session).criar(escola_id, data)


@router.get("/escolas/{escola_id}/turmas", response_model=list[TurmaResponse])
async def listar_turmas(
    escola_id: uuid.UUID,
    session: SessionDep,
    auth: AuthContextDep,
    ano_letivo: int | None = Query(default=None),
):
    await _assert_escola_scope(escola_id, session, auth)
    if auth.is_professor:
        return await TurmaService(session).listar_por_professor(auth.user_id, ano_letivo)
    return await TurmaService(session).listar_por_escola(escola_id, ano_letivo)


@router.get("/turmas/{turma_id}", response_model=TurmaResponse)
async def get_turma(turma_id: uuid.UUID, session: SessionDep, auth: AuthContextDep):
    await _assert_turma_scope(turma_id, session, auth)
    return await TurmaService(session).get_or_404(turma_id)


@router.patch("/turmas/{turma_id}", response_model=TurmaResponse)
async def atualizar_turma(
    turma_id: uuid.UUID, data: TurmaUpdate, session: SessionDep, auth: AuthContextDep
):
    await _assert_turma_scope(turma_id, session, auth, write=True)
    if not (auth.is_secretaria or auth.is_gestor_escola):
        raise ForbiddenError("Somente secretaria, diretor ou coordenador pode editar turmas")
    return await TurmaService(session).atualizar(turma_id, data)


@router.delete("/turmas/{turma_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_turma(turma_id: uuid.UUID, session: SessionDep, auth: AuthContextDep):
    await _assert_turma_scope(turma_id, session, auth, write=True)
    if not (auth.is_secretaria or auth.is_gestor_escola):
        raise ForbiddenError("Somente secretaria, diretor ou coordenador pode remover turmas")
    await TurmaService(session).remover(turma_id)


@router.get(
    "/turmas/{turma_id}/alunos",
    response_model=list[AlunoSimplificadoResponse],
    summary="Lista alunos com matrícula ativa na turma",
)
async def listar_alunos_da_turma(
    turma_id: uuid.UUID, session: SessionDep, auth: AuthContextDep
):
    await _assert_turma_scope(turma_id, session, auth)
    return await UsuarioRepository(session).listar_alunos_da_turma(turma_id)


# ── Usuários ──────────────────────────────────────────────────────────────────


@router.get(
    "/secretarias/{secretaria_id}/usuarios",
    response_model=list[UsuarioResponse],
    summary="Lista usuários da secretaria, com filtro opcional por perfil",
)
async def listar_usuarios_da_secretaria(
    secretaria_id: uuid.UUID,
    session: SessionDep,
    auth: AuthContextDep,
    perfil: PerfilUsuario | None = Query(default=None),
):
    _assert_secretaria_scope(auth, secretaria_id)
    if auth.is_gestor_escola and auth.escola_id:
        return await UsuarioRepository(session).listar_por_escola(auth.escola_id, perfil)
    if not auth.is_secretaria:
        raise ForbiddenError("Somente secretaria, diretor ou coordenador pode listar pessoas")
    return await UsuarioRepository(session).listar_por_secretaria(secretaria_id, perfil)


@router.post("/usuarios", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def upsert_usuario(data: UsuarioCreate, session: SessionDep, auth: AuthContextDep):
    if not (auth.is_secretaria or auth.is_gestor_escola):
        raise ForbiddenError("Somente secretaria, diretor ou coordenador pode cadastrar pessoas")
    if data.secretaria_id:
        _assert_secretaria_scope(auth, data.secretaria_id)
    if auth.is_gestor_escola:
        if data.escola_id != auth.escola_id:
            raise ForbiddenError("Diretor/coordenador só pode cadastrar pessoas da própria escola")
        if data.perfil == PerfilUsuario.secretaria:
            raise ForbiddenError("Diretor/coordenador não pode cadastrar perfil secretaria")
    return await UsuarioService(session).criar_ou_atualizar(data)


@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def get_usuario(usuario_id: uuid.UUID, session: SessionDep, auth: AuthContextDep):
    usuario = await UsuarioService(session).get_or_404(usuario_id)
    if usuario.id == auth.user_id:
        return usuario
    if usuario.secretaria_id != auth.secretaria_id:
        raise ForbiddenError("Usuário fora do escopo desta secretaria")
    if auth.is_secretaria:
        return usuario
    if auth.is_gestor_escola and usuario.escola_id == auth.escola_id:
        return usuario
    raise ForbiddenError("Usuário fora do seu escopo")


@router.patch("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def atualizar_usuario(
    usuario_id: uuid.UUID, data: UsuarioUpdate, session: SessionDep, auth: AuthContextDep
):
    usuario = await get_usuario(usuario_id, session, auth)
    if not (auth.is_secretaria or auth.is_gestor_escola):
        raise ForbiddenError("Somente secretaria, diretor ou coordenador pode editar pessoas")
    if auth.is_gestor_escola and usuario.escola_id != auth.escola_id:
        raise ForbiddenError("Diretor/coordenador só pode editar pessoas da própria escola")
    if auth.is_gestor_escola and data.perfil == PerfilUsuario.secretaria:
        raise ForbiddenError("Diretor/coordenador não pode editar para perfil secretaria")
    return await UsuarioService(session).atualizar(usuario_id, data)


@router.delete("/usuarios/{usuario_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_usuario(usuario_id: uuid.UUID, session: SessionDep, auth: AuthContextDep):
    usuario = await get_usuario(usuario_id, session, auth)
    if not (auth.is_secretaria or auth.is_gestor_escola):
        raise ForbiddenError("Somente secretaria, diretor ou coordenador pode remover pessoas")
    if auth.is_gestor_escola and usuario.escola_id != auth.escola_id:
        raise ForbiddenError("Diretor/coordenador só pode remover pessoas da própria escola")
    await UsuarioService(session).remover(usuario_id)


# ── Mobile: família e aluno ───────────────────────────────────────────────────


@router.get(
    "/responsaveis/{responsavel_id}/filhos",
    response_model=list[AlunoSimplificadoResponse],
    summary="Lista filhos vinculados a um responsável",
)
async def listar_filhos(responsavel_id: uuid.UUID, session: SessionDep, auth: AuthContextDep):
    if auth.is_responsavel and auth.user_id != responsavel_id:
        raise ForbiddenError("Responsável só pode acessar seus filhos/tutelados")
    if auth.is_aluno or auth.is_professor:
        raise ForbiddenError("Perfil sem acesso a esta lista de filhos/tutelados")
    return await UsuarioRepository(session).listar_filhos_do_responsavel(responsavel_id)


@router.get(
    "/alunos/{aluno_id}/turmas",
    response_model=list[TurmaResponse],
    summary="Lista turmas ativas em que o aluno está matriculado",
)
async def listar_turmas_do_aluno(
    aluno_id: uuid.UUID,
    session: SessionDep,
    auth: AuthContextDep,
    ano_letivo: int | None = Query(default=None),
):
    if auth.is_aluno and auth.user_id != aluno_id:
        raise ForbiddenError("Aluno só pode acessar as próprias turmas")
    if auth.is_responsavel:
        filhos = await UsuarioRepository(session).listar_filhos_do_responsavel(auth.user_id)
        if aluno_id not in {filho.id for filho in filhos}:
            raise ForbiddenError("Responsável só pode acessar turmas dos filhos/tutelados")
    return await UsuarioRepository(session).listar_turmas_do_aluno(aluno_id, ano_letivo)

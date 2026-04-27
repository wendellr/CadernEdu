import uuid

from fastapi import APIRouter, Query, status

from app.core.deps import CurrentUserIdDep, SessionDep
from app.domains.identity.repository import UsuarioRepository
from app.domains.identity.schemas import (
    AlunoSimplificadoResponse,
    EscolaCreate,
    EscolaResponse,
    SecretariaCreate,
    SecretariaResponse,
    TurmaCreate,
    TurmaResponse,
    UsuarioCreate,
    UsuarioResponse,
)
from app.domains.identity.service import (
    EscolaService,
    SecretariaService,
    TurmaService,
    UsuarioService,
)

router = APIRouter(prefix="/identity", tags=["identity"])


# ── Secretarias ───────────────────────────────────────────────────────────────


@router.post("/secretarias", response_model=SecretariaResponse, status_code=status.HTTP_201_CREATED)
async def criar_secretaria(data: SecretariaCreate, session: SessionDep, _: CurrentUserIdDep):
    return await SecretariaService(session).criar(data)


@router.get("/secretarias", response_model=list[SecretariaResponse])
async def listar_secretarias(session: SessionDep, _: CurrentUserIdDep):
    return await SecretariaService(session).listar()


@router.get("/secretarias/{secretaria_id}", response_model=SecretariaResponse)
async def get_secretaria(secretaria_id: uuid.UUID, session: SessionDep, _: CurrentUserIdDep):
    return await SecretariaService(session).get_or_404(secretaria_id)


# ── Escolas ───────────────────────────────────────────────────────────────────


@router.post(
    "/secretarias/{secretaria_id}/escolas",
    response_model=EscolaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def criar_escola(
    secretaria_id: uuid.UUID, data: EscolaCreate, session: SessionDep, _: CurrentUserIdDep
):
    return await EscolaService(session).criar(secretaria_id, data)


@router.get("/secretarias/{secretaria_id}/escolas", response_model=list[EscolaResponse])
async def listar_escolas(secretaria_id: uuid.UUID, session: SessionDep, _: CurrentUserIdDep):
    return await EscolaService(session).listar_por_secretaria(secretaria_id)


@router.get("/escolas/{escola_id}", response_model=EscolaResponse)
async def get_escola(escola_id: uuid.UUID, session: SessionDep, _: CurrentUserIdDep):
    return await EscolaService(session).get_or_404(escola_id)


# ── Turmas ────────────────────────────────────────────────────────────────────


@router.post(
    "/escolas/{escola_id}/turmas",
    response_model=TurmaResponse,
    status_code=status.HTTP_201_CREATED,
)
async def criar_turma(
    escola_id: uuid.UUID, data: TurmaCreate, session: SessionDep, _: CurrentUserIdDep
):
    return await TurmaService(session).criar(escola_id, data)


@router.get("/escolas/{escola_id}/turmas", response_model=list[TurmaResponse])
async def listar_turmas(
    escola_id: uuid.UUID,
    session: SessionDep,
    _: CurrentUserIdDep,
    ano_letivo: int | None = Query(default=None),
):
    return await TurmaService(session).listar_por_escola(escola_id, ano_letivo)


@router.get("/turmas/{turma_id}", response_model=TurmaResponse)
async def get_turma(turma_id: uuid.UUID, session: SessionDep, _: CurrentUserIdDep):
    return await TurmaService(session).get_or_404(turma_id)


@router.get(
    "/turmas/{turma_id}/alunos",
    response_model=list[AlunoSimplificadoResponse],
    summary="Lista alunos com matrícula ativa na turma",
)
async def listar_alunos_da_turma(
    turma_id: uuid.UUID, session: SessionDep, _: CurrentUserIdDep
):
    return await UsuarioRepository(session).listar_alunos_da_turma(turma_id)


# ── Usuários ──────────────────────────────────────────────────────────────────


@router.post("/usuarios", response_model=UsuarioResponse, status_code=status.HTTP_201_CREATED)
async def upsert_usuario(data: UsuarioCreate, session: SessionDep, _: CurrentUserIdDep):
    return await UsuarioService(session).criar_ou_atualizar(data)


@router.get("/usuarios/{usuario_id}", response_model=UsuarioResponse)
async def get_usuario(usuario_id: uuid.UUID, session: SessionDep, _: CurrentUserIdDep):
    return await UsuarioService(session).get_or_404(usuario_id)


# ── Mobile: família e aluno ───────────────────────────────────────────────────


@router.get(
    "/responsaveis/{responsavel_id}/filhos",
    response_model=list[AlunoSimplificadoResponse],
    summary="Lista filhos vinculados a um responsável",
)
async def listar_filhos(responsavel_id: uuid.UUID, session: SessionDep, _: CurrentUserIdDep):
    return await UsuarioRepository(session).listar_filhos_do_responsavel(responsavel_id)


@router.get(
    "/alunos/{aluno_id}/turmas",
    response_model=list[TurmaResponse],
    summary="Lista turmas ativas em que o aluno está matriculado",
)
async def listar_turmas_do_aluno(
    aluno_id: uuid.UUID,
    session: SessionDep,
    _: CurrentUserIdDep,
    ano_letivo: int | None = Query(default=None),
):
    return await UsuarioRepository(session).listar_turmas_do_aluno(aluno_id, ano_letivo)

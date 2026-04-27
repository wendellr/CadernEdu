import uuid
from datetime import date

from fastapi import APIRouter, Query, status

from app.core.deps import CurrentUserIdDep, SecretariaIdDep, SessionDep
from app.domains.pedagogico.schemas import (
    AgendaDiaResponse,
    AtividadeCreate,
    AtividadeResponse,
    AtividadeUpdate,
    AulaCreate,
    AulaResponse,
    AulaUpdate,
    ChamadaCreate,
    ChamadaResponse,
)
from app.domains.pedagogico.service import AgendaService, AtividadeService, AulaService, ChamadaService

router = APIRouter(prefix="/pedagogico", tags=["pedagogico"])


# ── Aulas ─────────────────────────────────────────────────────────────────────


@router.post(
    "/turmas/{turma_id}/aulas",
    response_model=AulaResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Professor registra uma aula do dia",
)
async def criar_aula(
    turma_id: uuid.UUID,
    data: AulaCreate,
    session: SessionDep,
    professor_id: CurrentUserIdDep,
    secretaria_id: SecretariaIdDep,
):
    return await AulaService(session).criar(
        turma_id=turma_id,
        professor_id=uuid.UUID(professor_id),
        secretaria_id=secretaria_id,
        data=data,
    )


@router.get(
    "/turmas/{turma_id}/aulas",
    response_model=list[AulaResponse],
    summary="Lista aulas de uma turma",
)
async def listar_aulas(
    turma_id: uuid.UUID,
    session: SessionDep,
    _: CurrentUserIdDep,
    secretaria_id: SecretariaIdDep,
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
):
    return await AulaService(session).listar(turma_id, secretaria_id, data_inicio, data_fim)


@router.patch("/aulas/{aula_id}", response_model=AulaResponse)
async def atualizar_aula(
    aula_id: uuid.UUID, data: AulaUpdate, session: SessionDep, _: CurrentUserIdDep
):
    return await AulaService(session).atualizar(aula_id, data)


@router.delete("/aulas/{aula_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_aula(aula_id: uuid.UUID, session: SessionDep, _: CurrentUserIdDep):
    await AulaService(session).remover(aula_id)


# ── Atividades de Casa ────────────────────────────────────────────────────────


@router.post(
    "/turmas/{turma_id}/atividades",
    response_model=AtividadeResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Professor cria uma atividade de casa",
)
async def criar_atividade(
    turma_id: uuid.UUID,
    data: AtividadeCreate,
    session: SessionDep,
    professor_id: CurrentUserIdDep,
    secretaria_id: SecretariaIdDep,
):
    return await AtividadeService(session).criar(
        turma_id=turma_id,
        professor_id=uuid.UUID(professor_id),
        secretaria_id=secretaria_id,
        data=data,
    )


@router.get(
    "/turmas/{turma_id}/atividades",
    response_model=list[AtividadeResponse],
    summary="Lista atividades de casa de uma turma",
)
async def listar_atividades(
    turma_id: uuid.UUID,
    session: SessionDep,
    _: CurrentUserIdDep,
    secretaria_id: SecretariaIdDep,
    data_inicio: date | None = Query(default=None),
    data_fim: date | None = Query(default=None),
):
    return await AtividadeService(session).listar(turma_id, secretaria_id, data_inicio, data_fim)


@router.patch("/atividades/{atividade_id}", response_model=AtividadeResponse)
async def atualizar_atividade(
    atividade_id: uuid.UUID, data: AtividadeUpdate, session: SessionDep, _: CurrentUserIdDep
):
    return await AtividadeService(session).atualizar(atividade_id, data)


@router.delete("/atividades/{atividade_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remover_atividade(atividade_id: uuid.UUID, session: SessionDep, _: CurrentUserIdDep):
    await AtividadeService(session).remover(atividade_id)


# ── Agenda (visão aluno / família) ────────────────────────────────────────────


@router.get(
    "/turmas/{turma_id}/agenda",
    response_model=list[AgendaDiaResponse],
    summary="Agenda da turma agrupada por dia — visão aluno/família",
)
async def agenda(
    turma_id: uuid.UUID,
    session: SessionDep,
    _: CurrentUserIdDep,
    secretaria_id: SecretariaIdDep,
    data_inicio: date = Query(...),
    data_fim: date = Query(...),
):
    return await AgendaService(session).agenda_por_periodo(
        turma_id, secretaria_id, data_inicio, data_fim
    )


# ── Chamada ───────────────────────────────────────────────────────────────────


@router.post(
    "/turmas/{turma_id}/chamada",
    response_model=ChamadaResponse,
    summary="Lança ou atualiza a chamada do dia (upsert por aluno)",
)
async def lancar_chamada(
    turma_id: uuid.UUID,
    data: ChamadaCreate,
    session: SessionDep,
    professor_id: CurrentUserIdDep,
    secretaria_id: SecretariaIdDep,
):
    return await ChamadaService(session).lancar(
        turma_id, uuid.UUID(professor_id), secretaria_id, data
    )


@router.get(
    "/turmas/{turma_id}/chamada",
    response_model=ChamadaResponse,
    summary="Retorna a chamada de um dia específico com resumo de frequência",
)
async def get_chamada(
    turma_id: uuid.UUID,
    session: SessionDep,
    _: CurrentUserIdDep,
    secretaria_id: SecretariaIdDep,
    data: date = Query(..., description="Data da chamada (YYYY-MM-DD)"),
):
    return await ChamadaService(session).get_chamada(turma_id, secretaria_id, data)

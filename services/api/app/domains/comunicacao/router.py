import uuid

from fastapi import APIRouter, UploadFile, status
from sqlalchemy import select

from app.core.deps import AuthContextDep, SecretariaIdDep, SessionDep
from app.core.permissions import require_turma_access
from app.domains.gestao.models import Matricula
from app.domains.comunicacao.schemas import (
    AnexoDownloadResponse,
    AnexoResponse,
    MensagemCreate,
    MensagemResponse,
)
from app.domains.comunicacao.service import AnexoService, MensagemService
from app.domains.identity.models import ResponsavelAluno

router = APIRouter(prefix="/comunicacao", tags=["comunicacao"])


# ── Mensagens ─────────────────────────────────────────────────────────────────


@router.post(
    "/turmas/{turma_id}/mensagens",
    response_model=MensagemResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Envia um comunicado para a turma (ou para um destinatário específico)",
)
async def criar_mensagem(
    turma_id: uuid.UUID,
    data: MensagemCreate,
    session: SessionDep,
    auth: AuthContextDep,
    secretaria_id: SecretariaIdDep,
):
    await require_turma_access(session, auth, turma_id, write=True)
    return await MensagemService(session).criar(
        turma_id=turma_id,
        remetente_id=auth.user_id,
        secretaria_id=secretaria_id,
        data=data,
    )


@router.get(
    "/turmas/{turma_id}/mensagens",
    response_model=list[MensagemResponse],
    summary="Lista comunicados de uma turma",
)
async def listar_mensagens(
    turma_id: uuid.UUID,
    session: SessionDep,
    auth: AuthContextDep,
    secretaria_id: SecretariaIdDep,
):
    await require_turma_access(session, auth, turma_id)
    destinatarios_visiveis: set[uuid.UUID] | None = None
    if auth.is_aluno:
        destinatarios_visiveis = {auth.user_id}
    elif auth.is_responsavel:
        result = await session.execute(
            select(ResponsavelAluno.aluno_id)
            .join(Matricula, Matricula.aluno_id == ResponsavelAluno.aluno_id)
            .where(
                ResponsavelAluno.responsavel_id == auth.user_id,
                Matricula.turma_id == turma_id,
                Matricula.ativo.is_(True),
            )
        )
        destinatarios_visiveis = {auth.user_id, *result.scalars().all()}
    return await MensagemService(session).listar_por_turma(
        turma_id,
        secretaria_id,
        destinatarios_visiveis,
    )


@router.get(
    "/mensagens/{mensagem_id}",
    response_model=MensagemResponse,
    summary="Detalhe de um comunicado",
)
async def get_mensagem(
    mensagem_id: uuid.UUID,
    session: SessionDep,
    auth: AuthContextDep,
):
    mensagem = await MensagemService(session).get_or_404(mensagem_id)
    if mensagem.turma_id:
        await require_turma_access(session, auth, mensagem.turma_id)
    return mensagem


@router.delete(
    "/mensagens/{mensagem_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove um comunicado e seus anexos",
)
async def remover_mensagem(
    mensagem_id: uuid.UUID,
    session: SessionDep,
    auth: AuthContextDep,
):
    mensagem = await MensagemService(session).get_or_404(mensagem_id)
    if mensagem.turma_id:
        await require_turma_access(session, auth, mensagem.turma_id, write=True)
    await MensagemService(session).remover(mensagem_id)


# ── Anexos ────────────────────────────────────────────────────────────────────


@router.post(
    "/mensagens/{mensagem_id}/anexos",
    response_model=AnexoResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Faz upload de um anexo (foto/vídeo/PDF) para um comunicado",
)
async def upload_anexo(
    mensagem_id: uuid.UUID,
    file: UploadFile,
    session: SessionDep,
    auth: AuthContextDep,
):
    mensagem = await MensagemService(session).get_or_404(mensagem_id)
    if mensagem.turma_id:
        await require_turma_access(session, auth, mensagem.turma_id, write=True)
    return await AnexoService(session).upload(mensagem_id, file)


@router.get(
    "/mensagens/{mensagem_id}/anexos/{anexo_id}",
    response_model=AnexoDownloadResponse,
    summary="Gera URL temporária (1h) para download de um anexo",
)
async def download_anexo(
    mensagem_id: uuid.UUID,
    anexo_id: uuid.UUID,
    session: SessionDep,
    auth: AuthContextDep,
):
    mensagem = await MensagemService(session).get_or_404(mensagem_id)
    if mensagem.turma_id:
        await require_turma_access(session, auth, mensagem.turma_id)
    return await AnexoService(session).gerar_url_download(mensagem_id, anexo_id)

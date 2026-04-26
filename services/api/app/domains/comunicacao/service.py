import uuid

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core import storage
from app.domains.comunicacao.models import Anexo, Mensagem
from app.domains.comunicacao.repository import AnexoRepository, MensagemRepository
from app.domains.comunicacao.schemas import AnexoDownloadResponse, MensagemCreate
from app.domains.features.models import FeatureKey
from app.domains.features.service import FeatureFlagService
from app.domains.identity.repository import TurmaRepository
from app.shared.exceptions import NotFoundError

_MAX_ANEXO_BYTES = 50 * 1024 * 1024  # 50 MB


async def _verificar_comunicacao(
    session: AsyncSession,
    secretaria_id: uuid.UUID,
    escola_id: uuid.UUID | None = None,
) -> None:
    """Lança 403 se o módulo comunicacao não estiver habilitado."""
    svc = FeatureFlagService(session)
    flag = await svc.is_enabled(FeatureKey.comunicacao, secretaria_id, escola_id)
    if not flag.enabled:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Módulo Comunicação não habilitado para esta secretaria/escola.",
        )


class MensagemService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = MensagemRepository(session)
        self.turma_repo = TurmaRepository(session)

    async def criar(
        self,
        turma_id: uuid.UUID,
        remetente_id: uuid.UUID,
        secretaria_id: uuid.UUID,
        data: MensagemCreate,
    ) -> Mensagem:
        turma = await self.turma_repo.get(turma_id)
        if not turma:
            raise NotFoundError("Turma", turma_id)

        await _verificar_comunicacao(self.repo.session, secretaria_id, turma.escola_id)

        if data.destinatario_id is not None:
            destino: dict = {"destinatario_id": data.destinatario_id, "turma_id": None}
        else:
            destino = {"turma_id": turma_id, "destinatario_id": None}

        mensagem = Mensagem(
            remetente_id=remetente_id,
            secretaria_id=secretaria_id,
            assunto=data.assunto,
            corpo=data.corpo,
            **destino,
        )
        return await self.repo.create(mensagem)

    async def get_or_404(self, mensagem_id: uuid.UUID) -> Mensagem:
        mensagem = await self.repo.get(mensagem_id)
        if not mensagem:
            raise NotFoundError("Mensagem", mensagem_id)
        return mensagem

    async def listar_por_turma(
        self,
        turma_id: uuid.UUID,
        secretaria_id: uuid.UUID,
    ) -> list[Mensagem]:
        turma = await self.turma_repo.get(turma_id)
        if not turma:
            raise NotFoundError("Turma", turma_id)

        await _verificar_comunicacao(self.repo.session, secretaria_id, turma.escola_id)
        return await self.repo.list_by_turma(turma_id)

    async def remover(self, mensagem_id: uuid.UUID) -> None:
        mensagem = await self.get_or_404(mensagem_id)
        # Remove arquivos do MinIO antes de deletar o registro
        for anexo in mensagem.anexos:
            await storage.delete_file(anexo.storage_key)
        await self.repo.delete(mensagem)


class AnexoService:
    def __init__(self, session: AsyncSession) -> None:
        self.repo = AnexoRepository(session)
        self.mensagem_repo = MensagemRepository(session)

    async def upload(
        self,
        mensagem_id: uuid.UUID,
        file: UploadFile,
    ) -> Anexo:
        mensagem = await self.mensagem_repo.get(mensagem_id)
        if not mensagem:
            raise NotFoundError("Mensagem", mensagem_id)

        content_type = file.content_type or ""
        if not storage.validate_content_type(content_type):
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
                detail=f"Tipo de arquivo não permitido: {content_type}. "
                       "Aceitos: imagens, vídeos e PDF.",
            )

        data = await file.read()
        if len(data) > _MAX_ANEXO_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Arquivo excede o limite de 50 MB.",
            )

        ext = (file.filename or "").rsplit(".", 1)[-1].lower() if "." in (file.filename or "") else ""
        key = f"comunicacao/{mensagem_id}/{uuid.uuid4()}.{ext}" if ext else f"comunicacao/{mensagem_id}/{uuid.uuid4()}"

        await storage.upload_file(key, data, content_type)

        anexo = Anexo(
            mensagem_id=mensagem_id,
            nome_original=file.filename or "sem_nome",
            content_type=content_type,
            storage_key=key,
            tamanho_bytes=len(data),
        )
        return await self.repo.create(anexo)

    async def gerar_url_download(
        self,
        mensagem_id: uuid.UUID,
        anexo_id: uuid.UUID,
    ) -> AnexoDownloadResponse:
        anexo = await self.repo.get(anexo_id)
        if not anexo or anexo.mensagem_id != mensagem_id:
            raise NotFoundError("Anexo", anexo_id)

        url = await storage.generate_presigned_url(anexo.storage_key)
        return AnexoDownloadResponse(url=url)

import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class AnexoResponse(BaseModel):
    id: uuid.UUID
    mensagem_id: uuid.UUID
    nome_original: str
    content_type: str
    tamanho_bytes: int
    created_at: datetime

    model_config = {"from_attributes": True}


class AnexoDownloadResponse(BaseModel):
    url: str
    expires_in: int = 3600


class MensagemCreate(BaseModel):
    assunto: str = Field(min_length=1, max_length=200)
    corpo: str = Field(min_length=1)
    # None = broadcast para a turma; preenchido = mensagem direta
    destinatario_id: uuid.UUID | None = None


class MensagemResponse(BaseModel):
    id: uuid.UUID
    remetente_id: uuid.UUID
    turma_id: uuid.UUID | None
    destinatario_id: uuid.UUID | None
    secretaria_id: uuid.UUID
    assunto: str
    corpo: str
    created_at: datetime
    anexos: list[AnexoResponse] = []

    model_config = {"from_attributes": True}

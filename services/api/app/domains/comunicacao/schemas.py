import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, model_validator


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
    remetente_nome: str
    turma_id: uuid.UUID | None
    destinatario_id: uuid.UUID | None
    destinatario_nome: str | None
    is_broadcast: bool
    secretaria_id: uuid.UUID
    assunto: str
    corpo: str
    created_at: datetime
    anexos: list[AnexoResponse] = []

    model_config = {"from_attributes": True}

    @model_validator(mode="before")
    @classmethod
    def resolve_nomes(cls, data: Any) -> Any:
        if not hasattr(data, "remetente_id"):
            return data
        return {
            "id": data.id,
            "remetente_id": data.remetente_id,
            "remetente_nome": data.remetente.nome if data.remetente else "Desconhecido",
            "turma_id": data.turma_id,
            "destinatario_id": data.destinatario_id,
            "destinatario_nome": data.destinatario.nome if data.destinatario else None,
            "is_broadcast": data.destinatario_id is None,
            "secretaria_id": data.secretaria_id,
            "assunto": data.assunto,
            "corpo": data.corpo,
            "created_at": data.created_at,
            "anexos": list(data.anexos),
        }

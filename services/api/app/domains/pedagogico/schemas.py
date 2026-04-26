import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


# ── Aula ──────────────────────────────────────────────────────────────────────

class AulaCreate(BaseModel):
    data: date
    disciplina: str = Field(min_length=1, max_length=100)
    conteudo: str = Field(min_length=1)
    observacoes: str | None = None


class AulaUpdate(BaseModel):
    data: date | None = None
    disciplina: str | None = Field(default=None, max_length=100)
    conteudo: str | None = None
    observacoes: str | None = None


class AulaResponse(BaseModel):
    id: uuid.UUID
    turma_id: uuid.UUID
    professor_id: uuid.UUID
    data: date
    disciplina: str
    conteudo: str
    observacoes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Atividade de Casa ─────────────────────────────────────────────────────────

class AtividadeCreate(BaseModel):
    aula_id: uuid.UUID | None = None
    disciplina: str = Field(min_length=1, max_length=100)
    descricao: str = Field(min_length=1)
    prazo: date
    peso: float | None = Field(default=None, gt=0, le=10)


class AtividadeUpdate(BaseModel):
    disciplina: str | None = Field(default=None, max_length=100)
    descricao: str | None = None
    prazo: date | None = None
    peso: float | None = Field(default=None, gt=0, le=10)


class AtividadeResponse(BaseModel):
    id: uuid.UUID
    aula_id: uuid.UUID | None
    turma_id: uuid.UUID
    professor_id: uuid.UUID
    disciplina: str
    descricao: str
    prazo: date
    peso: float | None
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Agenda (visão aluno/família) ──────────────────────────────────────────────

class AgendaDiaResponse(BaseModel):
    data: date
    aulas: list[AulaResponse]
    atividades: list[AtividadeResponse]

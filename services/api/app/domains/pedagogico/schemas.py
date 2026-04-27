import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field

from app.domains.pedagogico.models import StatusPresenca

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


# ── Chamada / Presença ────────────────────────────────────────────────────────


class PresencaItem(BaseModel):
    """Um item da chamada: aluno + status."""
    aluno_id: uuid.UUID
    status: StatusPresenca
    observacoes: str | None = None


class ChamadaCreate(BaseModel):
    """Payload para lançar a chamada do dia (todos os alunos de uma vez)."""
    data: date
    presencas: list[PresencaItem] = Field(min_length=1)


class PresencaResponse(BaseModel):
    id: uuid.UUID
    turma_id: uuid.UUID
    aluno_id: uuid.UUID
    professor_id: uuid.UUID
    data: date
    status: StatusPresenca
    observacoes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class ChamadaResponse(BaseModel):
    """Chamada do dia: lista de presenças enriquecida com nome do aluno."""
    data: date
    turma_id: uuid.UUID
    total: int
    presentes: int
    faltas: int
    atestados: int
    itens: list["ChamadaItemResponse"]


class ChamadaItemResponse(BaseModel):
    aluno_id: uuid.UUID
    aluno_nome: str
    status: StatusPresenca
    observacoes: str | None
    presenca_id: uuid.UUID | None  # None = não lançado ainda


# ── Agenda (visão aluno/família) ──────────────────────────────────────────────


class AgendaDiaResponse(BaseModel):
    data: date
    aulas: list[AulaResponse]
    atividades: list[AtividadeResponse]

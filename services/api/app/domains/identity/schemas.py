import uuid
from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.domains.identity.models import PerfilUsuario


# ── Secretaria ────────────────────────────────────────────────────────────────

class SecretariaCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=200)
    municipio: str = Field(min_length=2, max_length=100)
    estado: str = Field(min_length=2, max_length=2, pattern=r"^[A-Z]{2}$")
    cnpj: str = Field(pattern=r"^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$")


class SecretariaResponse(BaseModel):
    id: uuid.UUID
    nome: str
    municipio: str
    estado: str
    cnpj: str
    ativo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Escola ────────────────────────────────────────────────────────────────────

class EscolaCreate(BaseModel):
    nome: str = Field(min_length=2, max_length=200)
    codigo_inep: str | None = Field(default=None, pattern=r"^\d{8}$")


class EscolaResponse(BaseModel):
    id: uuid.UUID
    secretaria_id: uuid.UUID
    nome: str
    codigo_inep: str | None
    ativo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Turma ─────────────────────────────────────────────────────────────────────

class TurmaCreate(BaseModel):
    nome: str = Field(min_length=1, max_length=50)
    serie: str = Field(min_length=1, max_length=50)
    ano_letivo: int = Field(ge=2020, le=2100)


class TurmaResponse(BaseModel):
    id: uuid.UUID
    escola_id: uuid.UUID
    nome: str
    serie: str
    ano_letivo: int
    ativo: bool
    created_at: datetime

    model_config = {"from_attributes": True}


# ── Aluno (visão simplificada para família) ───────────────────────────────────

class AlunoSimplificadoResponse(BaseModel):
    id: uuid.UUID
    nome: str
    email: str

    model_config = {"from_attributes": True}


# ── Usuario ───────────────────────────────────────────────────────────────────

class UsuarioCreate(BaseModel):
    keycloak_id: str
    nome: str = Field(min_length=2, max_length=200)
    email: EmailStr
    perfil: PerfilUsuario
    secretaria_id: uuid.UUID | None = None
    escola_id: uuid.UUID | None = None


class UsuarioResponse(BaseModel):
    id: uuid.UUID
    keycloak_id: str
    nome: str
    email: str
    perfil: PerfilUsuario
    ativo: bool
    secretaria_id: uuid.UUID | None
    escola_id: uuid.UUID | None
    created_at: datetime

    model_config = {"from_attributes": True}

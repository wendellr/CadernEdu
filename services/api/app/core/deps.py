import uuid
from typing import Annotated

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.core.security import (
    decode_token_hs256,
    decode_token_rs256,
    extract_secretaria_id,
    extract_user_id,
)
from app.domains.identity.models import PerfilUsuario

bearer_scheme = HTTPBearer(auto_error=False)

SessionDep = Annotated[AsyncSession, Depends(get_session)]


class AuthContext:
    def __init__(
        self,
        user_id: uuid.UUID,
        perfil: PerfilUsuario,
        secretaria_id: uuid.UUID | None,
        escola_id: uuid.UUID | None,
        payload: dict,
    ) -> None:
        self.user_id = user_id
        self.perfil = perfil
        self.secretaria_id = secretaria_id
        self.escola_id = escola_id
        self.payload = payload

    @property
    def is_secretaria(self) -> bool:
        return self.perfil == PerfilUsuario.secretaria

    @property
    def is_gestor_escola(self) -> bool:
        return self.perfil in {
            PerfilUsuario.diretor,
            PerfilUsuario.coordenador,
            PerfilUsuario.gestor_escola,
        }

    @property
    def is_professor(self) -> bool:
        return self.perfil == PerfilUsuario.professor

    @property
    def is_responsavel(self) -> bool:
        return self.perfil == PerfilUsuario.responsavel

    @property
    def is_aluno(self) -> bool:
        return self.perfil == PerfilUsuario.aluno


async def get_current_user_payload(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> dict:
    """Decodifica o JWT uma vez por request — reutilizado por todas as deps abaixo."""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token de autenticação não fornecido",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        if settings.is_production:
            return await decode_token_rs256(credentials.credentials)
        return decode_token_hs256(credentials.credentials)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


PayloadDep = Annotated[dict, Depends(get_current_user_payload)]


async def get_current_user_id(payload: PayloadDep) -> str:
    try:
        return extract_user_id(payload)
    except (TypeError, ValueError) as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc


async def get_secretaria_id(payload: PayloadDep) -> uuid.UUID:
    try:
        return uuid.UUID(extract_secretaria_id(payload))
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sem secretaria_id válido",
        ) from exc


CurrentUserIdDep = Annotated[str, Depends(get_current_user_id)]
SecretariaIdDep = Annotated[uuid.UUID, Depends(get_secretaria_id)]


async def get_auth_context(payload: PayloadDep) -> AuthContext:
    try:
        user_id = uuid.UUID(extract_user_id(payload))
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)) from exc

    perfil_raw = payload.get("perfil")
    try:
        perfil = PerfilUsuario(perfil_raw)
    except (TypeError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token sem perfil válido",
        ) from exc

    secretaria_id = None
    if payload.get("secretaria_id"):
        try:
            secretaria_id = uuid.UUID(str(payload["secretaria_id"]))
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token sem secretaria_id válido",
            ) from exc

    escola_id = None
    if payload.get("escola_id"):
        try:
            escola_id = uuid.UUID(str(payload["escola_id"]))
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token sem escola_id válido",
            ) from exc

    return AuthContext(user_id, perfil, secretaria_id, escola_id, payload)


AuthContextDep = Annotated[AuthContext, Depends(get_auth_context)]

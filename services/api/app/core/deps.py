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

bearer_scheme = HTTPBearer(auto_error=False)

SessionDep = Annotated[AsyncSession, Depends(get_session)]


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
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(exc),
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc


PayloadDep = Annotated[dict, Depends(get_current_user_payload)]


async def get_current_user_id(payload: PayloadDep) -> str:
    try:
        return extract_user_id(payload)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail=str(exc)
        ) from exc


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

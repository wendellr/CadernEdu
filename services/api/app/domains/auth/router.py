"""Autenticação dev — disponível apenas fora de produção.

Em produção, o login acontece via Keycloak/Gov.br OIDC.
Este endpoint existe para facilitar testes locais sem Keycloak configurado.
"""
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.domains.identity.models import Usuario

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class TokenPair(BaseModel):
    accessToken: str
    refreshToken: str
    expiresIn: int


@router.post(
    "/login",
    response_model=TokenPair,
    summary="Login local (dev) — produção usa Keycloak/Gov.br",
    description="Disponível apenas em `environment != production`. Senha ignorada em dev.",
)
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    if settings.is_production:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint disponível apenas em desenvolvimento.",
        )

    result = await session.execute(
        select(Usuario).where(Usuario.email == data.email, Usuario.ativo.is_(True))
    )
    usuario = result.scalar_one_or_none()

    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado ou inativo.",
        )

    expires_in = 8 * 3600  # 8 horas
    now = datetime.now(timezone.utc)

    claims = {
        "sub": str(usuario.id),
        "email": usuario.email,
        "name": usuario.nome,
        "perfil": usuario.perfil.value,
        "iat": int(now.timestamp()),
        "exp": int((now + timedelta(seconds=expires_in)).timestamp()),
    }
    if usuario.secretaria_id:
        claims["secretaria_id"] = str(usuario.secretaria_id)
    if usuario.escola_id:
        claims["escola_id"] = str(usuario.escola_id)

    access_token = jwt.encode(claims, settings.secret_key, algorithm="HS256")

    return TokenPair(
        accessToken=access_token,
        refreshToken=access_token,  # simplificado para dev
        expiresIn=expires_in,
    )

"""Autenticação dev — disponível apenas fora de produção.

Em produção, o login acontece via Keycloak/Gov.br OIDC.
Este endpoint existe para facilitar testes locais sem Keycloak configurado.
"""

from datetime import UTC, datetime, timedelta
import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from jose import jwt
from pydantic import BaseModel, EmailStr
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.database import get_session
from app.domains.identity.models import Escola, PerfilUsuario, Secretaria, Usuario

router = APIRouter(prefix="/auth", tags=["auth"])


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str
    usuario_id: uuid.UUID | None = None
    perfil: PerfilUsuario | None = None


class LoginOptionsRequest(BaseModel):
    email: EmailStr
    senha: str


class LoginOption(BaseModel):
    usuario_id: uuid.UUID
    nome: str
    email: EmailStr
    perfil: PerfilUsuario
    secretaria_id: uuid.UUID | None = None
    secretaria_nome: str | None = None
    escola_id: uuid.UUID | None = None
    escola_nome: str | None = None


class TokenPair(BaseModel):
    accessToken: str
    refreshToken: str
    expiresIn: int


def _assert_dev_auth_enabled() -> None:
    if settings.is_production:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Endpoint disponível apenas em desenvolvimento.",
        )


async def _login_options(email: str, session: AsyncSession) -> list[LoginOption]:
    result = await session.execute(
        select(Usuario, Secretaria.nome.label("secretaria_nome"), Escola.nome.label("escola_nome"))
        .outerjoin(Secretaria, Secretaria.id == Usuario.secretaria_id)
        .outerjoin(Escola, Escola.id == Usuario.escola_id)
        .where(Usuario.email == email, Usuario.ativo.is_(True))
        .order_by(Usuario.perfil, Escola.nome.nullsfirst(), Usuario.nome)
    )
    return [
        LoginOption(
            usuario_id=usuario.id,
            nome=usuario.nome,
            email=usuario.email,
            perfil=usuario.perfil,
            secretaria_id=usuario.secretaria_id,
            secretaria_nome=secretaria_nome,
            escola_id=usuario.escola_id,
            escola_nome=escola_nome,
        )
        for usuario, secretaria_nome, escola_nome in result.all()
    ]


def _emit_token(usuario: Usuario) -> TokenPair:
    expires_in = 8 * 3600  # 8 horas
    now = datetime.now(UTC)

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


@router.post(
    "/login-options",
    response_model=list[LoginOption],
    summary="Lista perfis/vínculos disponíveis para um e-mail em dev",
    description="Disponível apenas em `environment != production`. Senha ignorada em dev.",
)
async def login_options(
    data: LoginOptionsRequest,
    session: AsyncSession = Depends(get_session),
):
    _assert_dev_auth_enabled()
    options = await _login_options(str(data.email), session)
    if not options:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado ou inativo.",
        )
    return options


@router.post(
    "/login",
    response_model=TokenPair,
    summary="Login local (dev) — produção usa Keycloak/Gov.br",
    description="Disponível apenas em `environment != production`. Senha ignorada em dev.",
)
async def login(data: LoginRequest, session: AsyncSession = Depends(get_session)):
    _assert_dev_auth_enabled()

    query = select(Usuario).where(Usuario.email == data.email, Usuario.ativo.is_(True))
    if data.usuario_id:
        query = query.where(Usuario.id == data.usuario_id)
    if data.perfil:
        query = query.where(Usuario.perfil == data.perfil)

    result = await session.execute(query.order_by(Usuario.created_at))
    usuarios = list(result.scalars().all())

    if not usuarios:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Usuário não encontrado ou inativo.",
        )

    if len(usuarios) > 1:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Mais de um perfil encontrado para este e-mail. Escolha um perfil para continuar.",
        )

    return _emit_token(usuarios[0])

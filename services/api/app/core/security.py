"""Validação de tokens JWT — RS256 via JWKS do Keycloak (produção) ou HS256 (dev)."""

import time

import httpx
from jose import JWTError, jwt

from app.core.config import settings

# ── JWKS cache ────────────────────────────────────────────────────────────────
# Chaves públicas do Keycloak — válidas por 1h; renovadas na rotação de chaves.

_jwks_cache: dict | None = None
_jwks_fetched_at: float = 0.0
_JWKS_TTL = 3600.0


async def _fetch_jwks() -> dict:
    url = f"{settings.keycloak_url}/realms/{settings.keycloak_realm}/protocol/openid-connect/certs"
    async with httpx.AsyncClient() as client:
        resp = await client.get(url, timeout=10)
        resp.raise_for_status()
        return resp.json()


async def get_jwks(force_refresh: bool = False) -> dict:
    global _jwks_cache, _jwks_fetched_at
    now = time.monotonic()
    if force_refresh or _jwks_cache is None or (now - _jwks_fetched_at) > _JWKS_TTL:
        _jwks_cache = await _fetch_jwks()
        _jwks_fetched_at = now
    return _jwks_cache


# ── Decodificação ─────────────────────────────────────────────────────────────


async def decode_token_rs256(token: str) -> dict:
    """Valida JWT RS256 usando a chave pública do Keycloak.

    Em caso de falha (chave rotacionada), tenta uma vez com JWKS atualizado.
    """
    try:
        jwks = await get_jwks()
        return jwt.decode(token, jwks, algorithms=["RS256"], options={"verify_aud": False})
    except JWTError:
        # Possível rotação de chaves — busca JWKS atualizado e tenta novamente
        try:
            jwks = await get_jwks(force_refresh=True)
            return jwt.decode(token, jwks, algorithms=["RS256"], options={"verify_aud": False})
        except JWTError as exc:
            raise ValueError("Token inválido ou expirado") from exc


def decode_token_hs256(token: str) -> dict:
    """Valida JWT HS256 com SECRET_KEY — usado apenas em desenvolvimento."""
    try:
        return jwt.decode(
            token,
            settings.secret_key,
            algorithms=["HS256"],
            options={"verify_aud": False},
        )
    except JWTError as exc:
        raise ValueError("Token inválido ou expirado") from exc


# ── Extração de claims ────────────────────────────────────────────────────────


def extract_user_id(payload: dict) -> str:
    user_id = payload.get("sub")
    if not user_id:
        raise ValueError("Token sem campo 'sub'")
    return user_id


def extract_secretaria_id(payload: dict) -> str:
    """Extrai secretaria_id do claim customizado adicionado pelo Keycloak.

    Configurar em: Realm → Clients → <client> → Client scopes →
    Mappers → Add mapper → User Attribute → Attribute: secretaria_id.
    """
    secretaria_id = payload.get("secretaria_id")
    if not secretaria_id:
        raise ValueError("Token sem campo 'secretaria_id'")
    return str(secretaria_id)

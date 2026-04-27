import logging

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.domains.analytics.router import router as analytics_router
from app.domains.auth.router import router as auth_router
from app.domains.comunicacao.router import router as comunicacao_router
from app.domains.features.router import router as features_router
from app.domains.gestao.router import router as gestao_router
from app.domains.identity.router import router as identity_router
from app.domains.pedagogico.router import router as pedagogico_router
from app.shared.exceptions import register_exception_handlers

# ── Logging ───────────────────────────────────────────────────────────────────


def _configure_logging() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s  %(levelname)-8s  %(name)s  %(message)s",
        datefmt="%H:%M:%S",
        force=True,
    )

    # Access log linha-a-linha do uvicorn é muito verboso em dev
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
    # Pool do SQLAlchemy também polui sem agregar valor em dev
    logging.getLogger("sqlalchemy.pool").setLevel(logging.WARNING)

    renderer = (
        structlog.processors.JSONRenderer()
        if settings.is_production
        else structlog.dev.ConsoleRenderer(colors=True)
    )

    structlog.configure(
        processors=[
            structlog.stdlib.add_log_level,
            structlog.processors.TimeStamper(fmt="%H:%M:%S", utc=False),
            structlog.processors.StackInfoRenderer(),
            structlog.dev.set_exc_info,
            renderer,
        ],
        wrapper_class=structlog.stdlib.BoundLogger,
        context_class=dict,
        # PrintLoggerFactory escreve direto no stdout, sem passar pelo
        # handler do stdlib (que adicionaria dupla formatação)
        logger_factory=structlog.PrintLoggerFactory(),
        cache_logger_on_first_use=True,
    )


_configure_logging()

log = structlog.get_logger(__name__)

app = FastAPI(
    title="CadernEdu API",
    version="0.1.0",
    description="API da plataforma CadernEdu — educação pública municipal.",
    docs_url="/docs" if not settings.is_production else None,
    redoc_url="/redoc" if not settings.is_production else None,
    openapi_url=f"{settings.api_prefix}/openapi.json",
)

def _cors_origins() -> list[str]:
    if not settings.is_production:
        return ["*"]
    if settings.cors_origins:
        return [o.strip() for o in settings.cors_origins.split(",") if o.strip()]
    return []  # bloqueia tudo se produção sem origens configuradas


app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins(),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)

# Registra todos os routers sob o prefixo /v1
for router in [
    auth_router,
    identity_router,
    features_router,
    pedagogico_router,
    comunicacao_router,
    gestao_router,
    analytics_router,
]:
    app.include_router(router, prefix=settings.api_prefix)


@app.get("/health", tags=["health"])
async def health() -> dict:
    return {"status": "ok", "environment": settings.environment}

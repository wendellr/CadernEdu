FROM python:3.12-slim

WORKDIR /app

COPY --from=ghcr.io/astral-sh/uv:latest /uv /usr/local/bin/uv

# Instala dependências no Python do sistema.
# Container já é isolado — venv é desnecessário e causa problemas de shebang.
COPY pyproject.toml .
RUN uv pip install --system --no-cache \
    "fastapi>=0.111.0" \
    "uvicorn[standard]>=0.30.0" \
    "sqlalchemy[asyncio]>=2.0.30" \
    "alembic>=1.13.0" \
    "asyncpg>=0.29.0" \
    "pydantic[email]>=2.7.0" \
    "pydantic-settings>=2.3.0" \
    "python-jose[cryptography]>=3.3.0" \
    "httpx>=0.27.0" \
    "arq>=0.25.0" \
    "structlog>=24.0.0" \
    "aioboto3>=13.0.0" \
    "python-multipart>=0.0.9" \
    "pytest>=8.2.0" \
    "pytest-asyncio>=0.23.0" \
    "pytest-cov>=5.0.0" \
    "ruff>=0.4.0"

# Código copiado por último (sobrescrito pelo volume no dev)
COPY . .
RUN chmod +x /app/entrypoint.sh

EXPOSE 8000
CMD ["/app/entrypoint.sh"]

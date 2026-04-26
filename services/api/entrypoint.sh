#!/bin/sh
set -e

echo "Aguardando banco de dados..."
until python -c "
import asyncio, asyncpg, os
async def check():
    url = os.environ['DATABASE_URL'].replace('postgresql+asyncpg', 'postgresql')
    conn = await asyncpg.connect(url)
    await conn.close()
asyncio.run(check())
" 2>/dev/null; do
  sleep 1
done

echo "Banco disponivel. Rodando migrations..."
alembic upgrade head

echo "Iniciando API..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

-- Cria bancos auxiliares para Keycloak e cada microsserviço
-- Os microsserviços compartilham o postgres em dev, mas com schemas separados
-- ou bancos diferentes em prod (decisão por serviço).

CREATE DATABASE keycloak;
GRANT ALL PRIVILEGES ON DATABASE keycloak TO cadernedu;

-- Schemas isolados por domínio dentro do cadernedu_dev
\c cadernedu_dev;
CREATE SCHEMA IF NOT EXISTS identity;
CREATE SCHEMA IF NOT EXISTS pedagogico;
CREATE SCHEMA IF NOT EXISTS comunicacao;
CREATE SCHEMA IF NOT EXISTS gestao;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Habilita extensões úteis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "citext";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

# CadernEdu

> Plataforma de educação pública municipal — alunos, famílias, professores e
> secretarias em um só sistema, alinhado à BNCC.

## O que é

CadernEdu conecta toda a comunidade escolar de uma rede municipal em um único sistema.
Cada secretaria (cliente) ativa os módulos que precisa; cada escola pode ter configuração própria.

**Quatro experiências distintas, mesma base de dados:**

| Quem | Canal | O que faz |
|---|---|---|
| Aluno | App Flutter | Trilhas de estudo, agenda do dia, tarefas, conquistas |
| Família | App Flutter | Acompanha desempenho, recebe comunicados, rastreia ônibus |
| Professor | App Flutter + Painel web | Registra aulas, corrige tarefas, envia comunicados |
| Secretaria | Painel web | Indicadores por escola, alertas de evasão, gestão de matrículas |

## Quick start

**Pré-requisitos:** Docker Desktop, Node 20, pnpm 9

```bash
# 1. Clone e instale dependências JS
git clone <repo> && cd cadernedu
pnpm install

# 2. Configure o ambiente
cp .env.example .env
# Edite .env: preencha SECRET_KEY com `openssl rand -hex 32`

# 3. Sobe tudo
docker compose up --build -d
```

Acesse:
- **API / Swagger** → http://localhost:8000/docs
- **Landing** → http://cadernedu.localhost
- **Painel** → http://painel.localhost
- **MinIO Console** → http://localhost:9001 _(user: cadernedu / senha: dev_secret_change_me)_
- **Mailhog** → http://localhost:8025
- **Keycloak** → http://localhost:8180 _(user: admin / senha: admin)_

> Os hostnames `*.localhost` funcionam nativamente no Mac sem editar `/etc/hosts`.

## Módulos

As funcionalidades são habilitadas por secretaria, com override por escola.

### Baseline — obrigatório em todo contrato

| Módulo | O que entrega |
|---|---|
| **Agenda Online** | Professor registra aulas do dia e atividades de casa; alunos e famílias consultam a agenda |
| **Comunicação** | Mensagens diretas com anexos de mídia e documentos |

### Opcionais — habilitados por contrato

| Módulo | O que entrega |
|---|---|
| Trilhas BNCC | Conteúdo pedagógico por série, com missões diárias e modo offline |
| Gamificação | Streak, conquistas e avatar evolutivo dos mascotes |
| Biblioteca digital | Acervo de livros e materiais didáticos |
| Ônibus ao vivo | Rastreamento em tempo real do transporte escolar |
| Dashboard de evasão | Alertas preditivos por escola e bairro |
| Tutor IA | Tutor "Edu" com guard-rails pedagógicos |
| Censo INEP | Exportação automática para o Censo Escolar |

## Stack

| Camada | Tecnologia |
|---|---|
| Mobile | Flutter 3.22+, Riverpod, Drift (offline-first) |
| Web | Next.js 14, React 18, TypeScript, Tailwind |
| Backend | FastAPI (Python 3.12), SQLAlchemy 2.0 async, Alembic |
| Banco | PostgreSQL 16 |
| Cache / Filas | Redis 7, ARQ |
| Storage | MinIO (dev) / S3 (prod) |
| Auth | Keycloak + Gov.br OIDC |
| Infra | Docker Compose (dev) · Kubernetes EKS (prod) |
| CI/CD | GitHub Actions (web/backend) · Codemagic (Flutter) |

## Estrutura do monorepo

```
apps/
  mobile_aluno/       Flutter — app do aluno
  mobile_familia/     Flutter — app da família
  web_painel/         Next.js — painel professor + secretaria
  web_site/           Next.js — landing pública ✅

packages/
  design_system_web/  Tokens de design (cores, fontes, sombras) ✅
  api_client_dart/    Client gerado do OpenAPI
  api_client_ts/      Client gerado do OpenAPI

services/
  api/                FastAPI — modular monolith ✅
    domains/
      identity/       Secretarias, escolas, turmas, usuários ✅
      features/       Feature flags por secretaria/escola ✅
      pedagogico/     Agenda, aulas, atividades de casa ✅
      comunicacao/    Mensagens + anexos
      gestao/         Matrículas, frequência
      analytics/      Indicadores, evasão

infra/
  docker-compose.yml          Stack base
  docker-compose.override.yml Dev (hot-reload)
  docker-compose.ci.yml       CI/CD (tmpfs)
  traefik/                    Reverse proxy

docs/
  api/openapi.yaml    Contrato da API ✅
  architecture.md     Visão de arquitetura
  adr/                Architecture Decision Records
```

## Arquitetura backend

O backend é um **modular monolith** — um único processo FastAPI com domínios
completamente isolados. Cada domínio pode ser extraído em microsserviço independente
quando a carga exigir, sem reescrita.

```
Internet → Traefik → API → [identity] [features] [pedagogico] [comunicacao] [gestao] [analytics]
                        ↓
               PostgreSQL 16   Redis 7   MinIO
```

## Documentação

- [Instruções para IA](./CLAUDE.md) — stack, convenções, módulos, comandos
- [Arquitetura](./docs/architecture.md)
- [Contrato da API (OpenAPI)](./docs/api/openapi.yaml)
- [ADRs](./docs/adr/)
- [Guia de contribuição](./CONTRIBUTING.md)

## Compliance

| | |
|---|---|
| **LGPD-Kids** | Consentimento parental documentado; conta do aluno gerenciada pela escola |
| **WCAG 2.1 AA** | Acessibilidade obrigatória em todas as superfícies |
| **Gov.br ready** | Autenticação via Gov.br OIDC |
| **Dados no Brasil** | Servidores em regiões brasileiras da AWS |
| **Offline-first** | Apps funcionam sem internet; sincronizam ao reconectar |

## Licença

Proprietária — uso exclusivo de secretarias municipais conveniadas.

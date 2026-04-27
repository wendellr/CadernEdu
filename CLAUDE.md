# CadernEdu — Instruções para IA

> Este arquivo é lido pelos assistentes de IA (Claude, Cursor, Copilot, Continue.dev).
> Mantenha-o sempre atualizado quando houver mudanças arquiteturais.

## Sobre o projeto

CadernEdu é uma plataforma de educação pública municipal. Conecta alunos,
famílias, professores e secretarias em um só sistema, alinhado à BNCC.

- Apps mobile **nativos em Flutter** publicados nas stores Apple e Google (NÃO usamos PWA)
- Web em Next.js para painel administrativo e site institucional
- Backend em **FastAPI (Python)** — modular monolith pronto para escalar em microsserviços
- Funcionalidades modulares habilitadas por **Secretaria** (cliente) com granularidade por **Escola**
- Estratégia **integration-first**: integrar com sistemas oficiais existentes da prefeitura antes de propor substituição completa

## Stack oficial

| Camada       | Tecnologia                                                        |
| ------------ | ----------------------------------------------------------------- |
| Mobile       | Flutter 3.22+, Dart 3.x, Riverpod, Drift, Dio                    |
| Web          | Next.js 14, React 18, TypeScript, Tailwind, TanStack              |
| Backend      | FastAPI, Python 3.12, SQLAlchemy 2.0 async, Alembic, Pydantic v2 |
| Banco        | PostgreSQL 16 (RLS habilitado em prod)                            |
| Cache/Filas  | Redis 7, ARQ (async job queue)                                    |
| Storage      | S3 (prod) / MinIO (dev)                                           |
| Realtime     | Socket.IO                                                         |
| Auth         | Keycloak + Gov.br OIDC                                            |
| Observ.      | Grafana, Loki, Sentry                                             |
| Infra        | Kubernetes (EKS), Terraform                                       |
| CI/CD        | GitHub Actions (web/backend), Codemagic (Flutter)                 |
| Integrações  | CSV/XLSX/SFTP/API via adaptadores para modelo canônico interno     |

## Módulos da plataforma

As funcionalidades são habilitadas por **Secretaria** (cliente) com granularidade até **Escola**.
A tabela `feature_flags(secretaria_id, escola_id?, feature_key, enabled)` controla isso.
Hierarquia de resolução: flag de escola > flag de secretaria > desabilitado por padrão.

### Módulos baseline — obrigatórios em todo contrato

| Módulo | feature_key | Descrição |
|---|---|---|
| Agenda Online | `agenda_online` | Professor registra aulas do dia e atividades de casa; alunos e famílias visualizam |
| Comunicação | `comunicacao` | Mensagens com anexos de mídia (foto/vídeo) e documentos (PDF) |

### Módulos opcionais — habilitados por contrato

| Módulo | feature_key | Descrição |
|---|---|---|
| Trilhas BNCC | `trilhas_bncc` | Trilhas de estudo alinhadas à BNCC com missões diárias |
| Gamificação | `gamificacao` | Streak, conquistas, avatar evolutivo dos mascotes |
| Biblioteca digital | `biblioteca_digital` | Acervo de livros e materiais didáticos |
| Ônibus ao vivo | `onibus_ao_vivo` | Rastreamento do transporte escolar em tempo real |
| Merenda | `merenda` | Cardápio semanal, informação nutricional e registro de alérgenos |
| Dashboard de evasão | `dashboard_evasao` | Alertas preditivos de evasão escolar por escola/bairro |
| Tutor IA | `tutor_ia` | Tutor "Edu" com guard-rails pedagógicos (BNCC-aligned) |
| Censo INEP | `censo_inep` | Exportação automática para o Censo Escolar do INEP |
| Inclusão TEA | `inclusao_tea` | Rotina visual, tarefas step-by-step, modo sensorial reduzido e painel de acompanhamento para alunos com TEA |
| Robótica educacional | `robotica` | Trilhas de robótica e sistemas embarcados (ESP32, sensores, IoT) entregues por parceiro especializado e integradas à jornada do aluno |

## Estratégia de integrações

CadernEdu não deve assumir que a prefeitura vai abandonar imediatamente os
sistemas oficiais já usados para matrícula, diário, frequência, notas,
transporte, merenda, RH, ouvidoria ou prestação de contas. A plataforma deve
funcionar como camada moderna de experiência, operação, integração e
inteligência.

### Modelo canônico

Os domínios principais usam entidades canônicas próprias:

- Secretaria
- Escola
- Usuario
- Aluno
- Responsavel
- Professor
- Turma
- Matricula
- Aula
- Frequencia
- Nota
- Comunicado

Sistemas externos devem ser conectados por adaptadores. Códigos, nomes de
tabelas e peculiaridades de fornecedores não devem vazar para services,
schemas e routers dos domínios principais.

### Regras para qualquer integração

- Definir a fonte de verdade por entidade antes de escrever código.
- Preferir leitura/importação antes de escrita bidirecional.
- CSV/XLSX validado é aceitável no piloto quando não houver API formal.
- Toda entidade importada deve preservar `external_system`, `external_id` e
  data da última sincronização quando aplicável.
- Importações precisam ser idempotentes e gerar relatório de criados,
  atualizados, ignorados e rejeitados.
- Erros devem apontar linha/campo/motivo de forma compreensível para operador.
- Escrita em sistema legado exige regra de conflito, auditoria e aceite formal.
- Fixtures reais devem ser anonimizadas antes de entrar no repositório.

## Estrutura do monorepo

```
cadernedu/
├── apps/
│   ├── mobile_aluno/      Flutter — app do aluno (não iniciado)
│   ├── mobile_familia/    Flutter — app da família (não iniciado)
│   ├── web_painel/        Next.js — painel professor + secretaria (scaffold)
│   └── web_site/          Next.js — landing pública ✅ completo
├── packages/
│   ├── design_system_web/      tokens.ts — cores, fontes, sombras ✅
│   ├── design_system_flutter/  (não iniciado)
│   ├── api_client_dart/        Gerado do OpenAPI (não iniciado)
│   ├── api_client_ts/          Gerado do OpenAPI (não iniciado)
│   └── shared_types/           (não iniciado)
├── services/
│   └── api/                    FastAPI — modular monolith ✅
│       ├── app/
│       │   ├── core/           config, database, security, deps
│       │   ├── shared/         base_model, pagination, exceptions
│       │   └── domains/
│       │       ├── identity/   secretarias, escolas, turmas, usuarios ✅
│       │       ├── features/   feature flags por secretaria/escola ✅
│       │       ├── pedagogico/ aulas, atividades de casa, agenda ✅
│       │       ├── comunicacao/mensagens + anexos (placeholder)
│       │       ├── gestao/     matrículas, frequência (placeholder)
│       │       ├── analytics/  indicadores, evasão (placeholder)
│       │       └── integrations/ conectores e importações (planejado)
│       └── alembic/            migrations: 0001 schema inicial, 0002 turmas+agenda
├── infra/
│   ├── docker-compose.yml      Base canônica
│   ├── docker-compose.override.yml  Dev local (auto-carregado)
│   ├── docker-compose.ci.yml   CI/CD
│   ├── docker-compose.portainer.yml Deploy remoto via Portainer
│   └── postgres/init/          Scripts de inicialização do banco
└── docs/
    ├── architecture.md
    ├── api/openapi.yaml        Fonte da verdade dos contratos ✅ atualizado
    └── adr/
```

## Convenções

### Idioma
- **Código** (variáveis, funções, classes): inglês
- **Comentários, docs, mensagens de erro ao usuário**: português brasileiro
- **Commits**: inglês, padrão Conventional Commits

### Commits
```
feat(pedagogico): add agenda online endpoints
fix(identity): correct turma unique constraint
chore(infra): adjust portainer compose ports
docs(openapi): add pedagogico and feature flags schemas
```

### Branches
- `main` — sempre deployable
- `feature/<ticket>-descricao-curta`
- `fix/<ticket>-descricao-curta`
- `chore/<descricao>`

### Pull requests
- Pequenos (idealmente <400 linhas alteradas)
- 1 feature = 1 PR
- Descrição com **o quê / por quê / como testar**
- CI verde obrigatório
- Pelo menos 1 review

## Restrições importantes

- ❌ **NUNCA** commitar segredos. Use `.env` (gitignored) + Vault em prod.
- 🔒 **LGPD-Kids**: dados de menores exigem consentimento parental documentado.
- ♿ **Acessibilidade**: WCAG 2.1 nível AA é **obrigatório**, não opcional.
- 📱 **Não usar PWA**: apps são nativos via Flutter, publicados nas stores oficiais.
- 🇧🇷 **Dados sensíveis** ficam em servidores no Brasil.
- 🧒 **Conta de aluno**: gerenciada pela escola, não pela criança.

## Estilo de código

### Python / FastAPI

- Python 3.12+, type hints obrigatórios em todo código novo
- Ruff para lint e formatação (substitui black + flake8 + isort)
- SQLAlchemy 2.0 com `Mapped[]` e `mapped_column()` — não usar sintaxe legada
- Alembic para migrations — toda mudança de schema é uma migration versionada
- Cada domínio segue: `models.py`, `schemas.py`, `repository.py`, `service.py`, `router.py`
- Testes obrigatórios em `tests/domains/` — mínimo 70% de cobertura
- `uv` como package manager — não usar pip diretamente

### Módulos (feature flags)

- Toda funcionalidade nova deve ter uma `FeatureKey` correspondente em `features/models.py`
- Usar `_verificar_<modulo>(session, secretaria_id, escola_id)` no service antes de processar
- Flags habilitadas via `PUT /v1/features/secretarias/{id}`
- Módulos baseline (`agenda_online`, `comunicacao`) são obrigatórios em todo contrato

### TypeScript / JavaScript
- `strict: true` no tsconfig — sem `any`
- ESLint + Prettier (configs no root do monorepo)
- Funções pequenas (<40 linhas), arquivos pequenos (<300 linhas)
- Prefira composição a herança
- Nomeie tipos no plural quando representam coleções: `UserList`, `Matriculas`

### Dart / Flutter
- `flutter_lints` + `custom_lint`
- Widgets pequenos, com responsabilidade única
- Use `const` sempre que possível
- Não use `setState` direto: use Riverpod
- Segue [Effective Dart](https://dart.dev/effective-dart)

### CSS / Tailwind
- Use tokens do `design_system_web` — não hard-code cores
- Mobile-first
- Container queries quando fizer sentido

## API e contratos

- O arquivo `docs/api/openapi.yaml` é a **fonte da verdade**
- Os clientes (`packages/api_client_*`) são **gerados automaticamente**
- Mudou contrato? Atualize o YAML, regenere os clientes, propague

## Quando gerar código

1. **Antes de criar algo novo**, busque se já existe util/componente similar
2. **Importe do design_system_***, não duplique tokens ou componentes
3. **Cliente de API SEMPRE via packages/api_client_***, nunca chame fetch direto
4. **Migrations versionadas** com Alembic — toda mudança de schema é uma migration
5. **Testes obrigatórios** para serviços (`services/`) — mínimo 70% de cobertura
6. **Documentar decisões** importantes em `docs/adr/`
7. **Verificar feature flag** em todo endpoint de domínio antes de processar
8. **Checar fonte de verdade externa** antes de implementar cadastro, matrícula, nota ou frequência

## Infra — Docker Compose

A stack usa três arquivos compose + `COMPOSE_FILE` no `.env` raiz:

| Arquivo | Quando usar |
|---|---|
| `infra/docker-compose.yml` | Base canônica — nunca rodar direto |
| `infra/docker-compose.override.yml` | Dev local (carregado automaticamente via COMPOSE_FILE) |
| `infra/docker-compose.ci.yml` | CI/CD — tmpfs, sem apps web |
| `infra/docker-compose.portainer.yml` | Deploy remoto via Portainer, sem Traefik |

```bash
# Primeira vez
cp .env.example .env
# Preencher SECRET_KEY: openssl rand -hex 32

docker compose up --build -d   # build e sobe tudo
docker compose down            # para
docker compose down -v         # para e apaga volumes
docker compose logs -f api     # logs de um serviço
docker compose ps              # status
```

### Endereços em dev

| Serviço | URL |
|---|---|
| Landing (web_site) | http://localhost:3000 |
| Painel (web_painel) | http://localhost:3001 |
| API + Swagger | http://localhost:8000/docs |
| MinIO Console | http://localhost:9001 |
| Keycloak | http://localhost:8180 |
| Mailhog | http://localhost:8025 |
| Postgres (direto) | localhost:5432 |
| Redis (direto) | localhost:6379 |

## Comandos comuns

```bash
# ── API Python ──────────────────────────────────────────────────────────────
cd services/api

uv sync                                                # instalar dependências
uv run alembic upgrade head                            # aplicar migrations
uv run alembic revision --autogenerate -m "descricao" # gerar nova migration
uv run pytest --cov                                    # rodar testes
uv run ruff check . && uv run ruff format .            # lint

# Dentro do container (sem uv local):
docker compose exec api alembic upgrade head
docker compose exec api python -m pytest tests/ -v

# ── Web (Next.js) ────────────────────────────────────────────────────────────
pnpm --filter @cadernedu/web_site dev     # landing (porta 3000)
pnpm --filter @cadernedu/web_painel dev  # painel (porta 3001)

# ── Flutter ──────────────────────────────────────────────────────────────────
cd apps/mobile_aluno && flutter run --flavor staging

# ── Global ───────────────────────────────────────────────────────────────────
pnpm lint          # lint todos os pacotes web/ts
pnpm test          # testes web/ts
pnpm api:generate  # regenera clientes a partir do openapi.yaml
```

## Backlog — próximos passos

### ✅ Concluído (abril/2026)
- [x] **Painel do professor** — agenda semanal (Seg→Dom), edição de aulas, atividades de casa, comunicados
- [x] **App mobile** — `mobile_familia`: Flutter scaffold com login, seleção de filho/turma, agenda e comunicados (iOS Simulator validado)
- [x] **Deploy Portainer** — stack Docker com build direto do repo (api + web_site + web_painel), Nginx + TLS via script GoDaddy, rodando em staging
- [x] **Backend mobile** — endpoints `GET /identity/responsaveis/{id}/filhos` e `GET /identity/alunos/{id}/turmas`
- [x] **Landing page** — seções de Inclusão/TEA, Robótica, Operação Escolar e posicionamento atualizadas
- [x] **CORS configurável** — via env var `CORS_ORIGINS`
- [x] **Logging** — structlog com ConsoleRenderer (dev) e JSONRenderer (prod), access log suprimido
- [x] **Favicon** — SVG com brand mark verde/cyan em web_site e web_painel

### P0 — Baseline (bloqueante para saída do staging)
- [x] **Comunicação** — mensagens + upload/download de anexos (foto/vídeo/PDF) via MinIO — completo no backend e frontend
- [ ] **Testes** — cobertura 70% nos domínios implementados (identity, pedagogico, features, comunicacao)
- [ ] **Seed de produção** — script para criar secretaria/escola/professor reais (hoje só tem seed dev)

### P1 — Antes de usuários reais
- [ ] **Auth Keycloak** — integrar OIDC no `core/security.py` e trocar `ENVIRONMENT=staging` por `production`
- [ ] **Painel: comunicados** — tela de envio de comunicados pelo professor (backend pronto, falta UI)
- [ ] **Painel: seleção de turma** — o professor hoje seleciona turma na home; fluxo precisa de polish
- [ ] **App mobile: produção** — publicar na Play Store e App Store após validação do piloto
- [ ] **OpenAPI → clients** — gerar `api_client_ts` e `api_client_dart` a partir do openapi.yaml

### P2 — Escala
- [ ] **Gestão** — matrículas, frequência (chamada digital)
- [ ] **Analytics** — dashboard de evasão, indicadores por escola
- [ ] **Trilhas BNCC** — conteúdo pedagógico gamificado
- [ ] **Merenda** — domínio `merenda`: cardápio semanal, alérgenos, publicação pela secretaria
- [ ] **Ônibus ao vivo** — integração com rastreamento GPS, WebSocket de posição

### P3 — Inclusão e Expansão
- [ ] **Inclusão TEA** — domínio `inclusao`: rotina visual, tarefas step-by-step, modo sensorial reduzido, painel família-professor
  - Feature flag: `inclusao_tea`
  - Schema: `rotinas_visuais`, `etapas_atividade`, `registro_comportamento`
  - App mobile: tela de rotina com pictogramas, progresso visual
  - Painel web: acompanhamento pelo professor e família
- [ ] **Robótica educacional** — domínio `robotica`: trilhas integradas entregues por parceiro
  - Feature flag: `robotica`
  - Integração com `trilhas_bncc` (progresso, XP, conquistas compartilhados)
  - Schema: `projeto_robotica`, `etapa_robotica`, `entrega_projeto`
  - Suporte a evidências fotográficas de montagem e código

## Workflow ideal com IA

1. Peça pra ler este CLAUDE.md primeiro
2. Peça um **plano** antes de gerar código grande
3. Aprove o plano
4. Gere em pequenos pedaços, com testes
5. Use a IA pra **revisar o diff** procurando bugs, vulnerabilidades LGPD e violações deste documento

---

**Última atualização**: abril/2026
**Mantenedor**: tech-lead@cadernedu.com.br

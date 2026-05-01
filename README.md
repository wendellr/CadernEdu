# CadernEdu

> Plataforma de educação pública municipal — alunos, famílias, professores e
> secretarias em um só sistema, alinhado à BNCC.

## O que é

CadernEdu conecta toda a comunidade escolar de uma rede municipal em um único sistema.
Cada secretaria (cliente) ativa os módulos que precisa; cada escola pode ter configuração própria.

O produto segue uma estratégia **integration-first**: no piloto, ele integra
com sistemas oficiais já usados pela prefeitura antes de propor substituição.
Assim, o CadernEdu funciona como camada moderna de experiência, operação e
inteligência sem obrigar a secretaria a jogar fora processos existentes.

**Experiências distintas, mesma base de dados e escopo de acesso:**

| Quem | Canal | O que faz |
|---|---|---|
| Secretaria | Painel web | CRUD da rede municipal: escolas, turmas, pessoas, cardápio, transporte e módulos da secretaria |
| Diretor/Coordenador | Painel web | CRUD da escola: professores, turmas, alunos, cardápio, transporte e rotinas da unidade |
| Professor | Painel web | Registra aulas, chamada, atividades de casa e comunicados das próprias turmas |
| Família/Responsável | App Flutter | Consulta filhos/tutelados: agenda, atividades, comunicados, cardápio e transporte |
| Aluno | App Flutter | Consulta a própria agenda, atividades, comunicados, cardápio e transporte |

Um mesmo e-mail pode ter mais de um vínculo ativo. No login, o CadernEdu lista
os perfis disponíveis e emite o token para o perfil escolhido, com escopo próprio.

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

# 4. Aplica migrações e carrega dados ricos de demonstração
docker compose exec api alembic upgrade head
docker compose exec api python scripts/seed_demo.py --reset
```

Acesse:
- **API / Swagger** → http://localhost:8000/docs
- **Landing** → http://localhost:3000
- **Painel** → http://localhost:3001
- **MinIO Console** → http://localhost:9001 _(user: cadernedu / senha: dev_secret_change_me)_
- **Mailhog** → http://localhost:8025
- **Keycloak** → http://localhost:8180 _(user: admin / senha: admin)_

### Usuários e senhas do ambiente demo

No ambiente demo/Portainer, mantenha `ENVIRONMENT=staging`. Nesse modo, a API
local de autenticação fica habilitada e a senha é ignorada; use a senha padrão
abaixo para todas as contas:

```text
Demo@1234
```

| Perfil | E-mail | Senha | Onde entra | Escopo |
|---|---|---|---|---|
| Secretaria | `secretaria@demo.edu.br` | `Demo@1234` | Painel web | SME São Gabriel inteira |
| Diretor | `diretor.nair@demo.edu.br` | `Demo@1234` | Painel web | EMEF Profª Nair Rodrigues |
| Coordenador | `coordenador.dompedro@demo.edu.br` | `Demo@1234` | Painel web | EMEF Dom Pedro II |
| Professor | `ana.costa@demo.edu.br` | `Demo@1234` | Painel web | Turmas vinculadas ao professor |
| Professor | `ricardo.mendes@demo.edu.br` | `Demo@1234` | Painel web | Turmas vinculadas ao professor |
| Professor | `juliana.ferreira@demo.edu.br` | `Demo@1234` | Painel web | Turmas vinculadas ao professor |
| Multiperfil | `multi@demo.edu.br` | `Demo@1234` | Painel web ou App Flutter | Pede escolha entre Professor e Responsável |
| Responsável | `responsavel@demo.edu.br` | `Demo@1234` | App Flutter | Lucas e Sofia |
| Responsável | `roberto@demo.edu.br` | `Demo@1234` | App Flutter | Beatriz |
| Responsável | `patricia@demo.edu.br` | `Demo@1234` | App Flutter | Gabriel e Matheus |
| Responsável | `fernando@demo.edu.br` | `Demo@1234` | App Flutter | Larissa e Felipe |
| Aluno | `lucas@demo.edu.br` | `Demo@1234` | App Flutter | 3º Ano A |
| Aluno | `beatriz@demo.edu.br` | `Demo@1234` | App Flutter | 3º Ano A |
| Aluno | `gabriel@demo.edu.br` | `Demo@1234` | App Flutter | 5º Ano B |
| Aluno | `sofia@demo.edu.br` | `Demo@1234` | App Flutter | 5º Ano B |
| Aluno | `matheus@demo.edu.br` | `Demo@1234` | App Flutter | 4º Ano C |
| Aluno | `larissa@demo.edu.br` | `Demo@1234` | App Flutter | 6º Ano A |
| Aluno | `felipe@demo.edu.br` | `Demo@1234` | App Flutter | 6º Ano A |
| Aluno | `isabela@demo.edu.br` | `Demo@1234` | App Flutter | 2º Ano B |

O endpoint `POST /v1/auth/login-options` retorna os vínculos disponíveis para
um e-mail. O `POST /v1/auth/login` aceita `usuario_id` para abrir sessão no
perfil escolhido.

Use `multi@demo.edu.br` para demonstrar o fluxo de escolha pós-login. No painel
web ele oferece o perfil de professor; no app Flutter ele oferece o perfil de
responsável. Quando houver dois perfis válidos para o mesmo canal, a tela lista
as opções para o usuário escolher explicitamente.

### Demo no Portainer

Para manter o staging/demo do Portainer com os mesmos dados locais, deixe
`ENVIRONMENT=staging` e rode o seed demo após o deploy.

Opção 1 — console do container `cadernedu-api`:

```bash
python scripts/seed_demo.py --reset
```

Opção 2 — serviço opcional no compose do Portainer:

1. Adicione temporariamente `COMPOSE_PROFILES=demo-seed` nas variáveis da stack.
2. Faça redeploy/update da stack.
3. Aguarde o container `cadernedu-seed-demo` concluir com sucesso.
4. Remova `COMPOSE_PROFILES=demo-seed` e faça novo redeploy.

O seed demo usa `--reset`: ele apaga e recria os dados da stack. Isso é adequado
para ambiente de demonstração, mas não para dados reais.

## Perfis e escopos

| Perfil | Escopo de dados | Permissões principais |
|---|---|---|
| `secretaria` | Toda a secretaria | Gerencia escolas, diretores/coordenadores, professores, turmas, alunos, responsáveis e módulos da rede |
| `diretor` / `coordenador` | Escola vinculada | Gerencia pessoas, turmas, cardápio e transporte da própria escola |
| `professor` | Turmas vinculadas em `professor_turmas` | Registra aulas, chamada, atividades de casa e comunicados das suas turmas |
| `responsavel` | Filhos/tutelados em `responsavel_aluno` | Visualiza informações dos filhos/tutelados no app |
| `aluno` | Próprio usuário/matrículas | Visualiza a própria rotina escolar no app |

Os escopos são aplicados no backend; a interface apenas adapta navegação e
experiência ao perfil selecionado.

## Padrão de listagens

Toda listagem do CadernEdu deve oferecer:

- busca rápida textual;
- ordenação por colunas relevantes;
- contagem do total exibido versus total carregado;
- estado vazio para lista sem dados e para busca sem resultados.

Para listas extensas, o padrão é paginação infinita com auto reload. A API deve
expor paginação por cursor ou `limit/offset` antes de a tela trocar para carga
incremental; enquanto o endpoint ainda retorna a coleção completa, a busca e a
ordenação podem ser client-side apenas para listas pequenas de gestão.

## Módulos

As funcionalidades são habilitadas por secretaria, com override por escola.

### Baseline — obrigatório em todo contrato

| Módulo | O que entrega |
|---|---|
| **Agenda Online** | Professor registra aulas do dia e atividades de casa; alunos e famílias consultam a agenda |
| **Comunicação** | Mensagens diretas com anexos de mídia e documentos |
| **Cardápio** | Gestão e consulta de cardápio por secretaria/escola |
| **Transporte** | Gestão e consulta de rotas e vínculo dos alunos ao transporte |

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
| Integrações | CSV/XLSX/SFTP/API via adaptadores para sistemas legados |
| Infra | Docker Compose (dev/Portainer) · Nginx externo no servidor |
| CI/CD | GitHub Actions (web/backend) · Codemagic (Flutter) |

## Estrutura do monorepo

```
apps/
  mobile_familia/     Flutter — app de família e aluno
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
      gestao/         Matrículas, frequência, professor-turma
      analytics/      Indicadores, evasão
      integrations/   Conectores, importações, reconciliação

infra/
  docker-compose.yml          Stack base
  docker-compose.override.yml Dev (hot-reload)
  docker-compose.ci.yml       CI/CD (tmpfs)
  docker-compose.portainer.yml Deploy remoto via Portainer

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
Internet → Nginx externo → API → [identity] [features] [pedagogico] [comunicacao] [gestao] [analytics]
                              ↓
                     PostgreSQL 16   Redis 7   MinIO
```

Integrações com sistemas legados passam por adaptadores e importações
controladas para o modelo canônico do CadernEdu. CSV/XLSX validado é aceitável
no piloto; escrita bidirecional em sistemas oficiais só entra com regra de
conflito, auditoria e aceite formal.

## Documentação

- [Instruções para IA](./CLAUDE.md) — stack, convenções, módulos, comandos
- [Arquitetura](./docs/architecture.md)
- [Contrato da API (OpenAPI)](./docs/api/openapi.yaml)
- [Plano do painel](./apps/web_painel/web_painel_PLAN.md)
- [Backlog sequencial do painel](./apps/web_painel/web_painel_BACKLOG.md)
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

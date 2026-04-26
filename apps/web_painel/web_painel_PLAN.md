# Web Painel — Plano de Produto

> **Aplicação:** `apps/web_painel`
> **Stack:** Next.js 14 (App Router) + React 18 + TypeScript + Tailwind + shadcn/ui
> **Audiência:** Professores, Diretores de Escola, Secretaria Municipal de Educação
> **Status:** Planejamento — pré-implementação

## 1. Visão geral

O Web Painel é a **interface administrativa central** do CadernEdu. Diferente
da landing (institucional, marketing) e dos apps mobile (consumo, dia-a-dia
do aluno e família), o painel é onde acontece o **trabalho operacional e
estratégico** da educação municipal.

É a interface com mais tempo de uso por usuário e a mais crítica para
adoção institucional. Se o painel for ruim, o sistema não emplaca —
mesmo que aluno e família amem o app.

## 2. Perfis de usuário e permissões

| Perfil                          | Escopo            | Acesso principal                              |
| ------------------------------- | ----------------- | --------------------------------------------- |
| **Professor regente**           | Suas turmas       | Chamada, atividades, correção, mural, boletim |
| **Professor coordenador**       | Toda a escola     | Acima + planos de aula da escola              |
| **Diretor de escola**           | Sua escola        | Tudo da escola, gestão de turmas/servidores   |
| **Secretaria — pedagógico**     | Toda a rede       | Currículo, formação, indicadores pedagógicos  |
| **Secretaria — administrativo** | Toda a rede       | Matrículas, transporte, merenda, patrimônio   |
| **Superintendente / gestor**    | Toda a rede       | Dashboards executivos, read-mostly            |
| **Suporte / admin plataforma**  | Multi-município   | Configuração técnica, integrações             |

### Princípios de permissão
- **RBAC** (role-based) na primeira camada
- **ABAC** (attribute-based) por escopo: escola, turma, série
- **Audit log** de toda ação sensível (alteração de nota, matrícula, dados pessoais)
- **Princípio do menor privilégio** — perfis começam read-only, write é explícito

## 3. Mapa de módulos e telas

### 🟢 Módulo Pedagógico
- `/pedagogico/chamada` — chamada digital (lista de alunos com toggle presença/falta/atestado)
- `/pedagogico/turmas/:id` — visão geral da turma
- `/pedagogico/atividades` — atividades criadas pelo professor
- `/pedagogico/atividades/nova` — editor de atividade (texto, anexos, prazo, BNCC)
- `/pedagogico/correcao/:atividadeId` — correção em lote (cards por aluno)
- `/pedagogico/correcao/:atividadeId/:alunoId` — correção detalhada com IA assistiva
- `/pedagogico/boletim/:turmaId` — lançamento de notas por bimestre
- `/pedagogico/mural/:turmaId` — postagens da turma
- `/pedagogico/plano-aula` — banco de planos de aula BNCC
- `/pedagogico/plano-aula/:id` — editor de plano de aula

### 🔵 Módulo Gestão Escolar
- `/escola/dashboard` — visão executiva da escola (frequência, notas, evasão)
- `/escola/turmas` — listagem de turmas
- `/escola/turmas/nova` — criar turma e atribuir professor
- `/escola/alunos` — busca e gestão de alunos
- `/escola/alunos/:id` — perfil completo do aluno
- `/escola/matriculas` — matrículas, rematrículas, transferências
- `/escola/servidores` — professores e funcionários da escola
- `/escola/calendario` — calendário letivo da escola (semana exibida de Segunda a Domingo; sábado pode ter atividade letiva; domingo é sempre não-letivo e exibido visualmente desabilitado)

### 🟡 Módulo Gestão de Rede (Secretaria)
- `/rede/dashboard` — indicadores agregados da rede
- `/rede/escolas` — listagem de todas as escolas
- `/rede/escolas/:id` — drill-down de uma escola
- `/rede/servidores` — todos os servidores, lotação, formação
- `/rede/calendario-rede` — calendário letivo municipal
- `/rede/curriculo` — currículo municipal alinhado à BNCC
- `/rede/formacao-continuada` — cursos para professores

### 🟠 Módulo Operacional
- `/operacional/merenda/cardapio` — cardápio nutricional semanal
- `/operacional/merenda/estoque` — estoque por escola
- `/operacional/merenda/compras` — pedidos de compra
- `/operacional/transporte/rotas` — rotas escolares
- `/operacional/transporte/onibus` — frota e motoristas
- `/operacional/transporte/ao-vivo` — rastreio de ônibus em tempo real
- `/operacional/patrimonio` — bens por escola

### 🟣 Módulo Indicadores & Inteligência
- `/indicadores/equidade` — heatmap por região/CEP/raça/renda
- `/indicadores/evasao` — alertas preditivos de evasão por aluno
- `/indicadores/desempenho` — desempenho por habilidade BNCC
- `/indicadores/frequencia` — frequência consolidada
- `/indicadores/ideb-proxy` — proxy preditivo do IDEB
- `/indicadores/comparativos` — comparativo intermunicipal
- `/indicadores/exports/inep` — geração do Censo Escolar

### 🔴 Módulo Comunicação
- `/comunicacao/comunicados` — comunicados em massa (com segmentação)
- `/comunicacao/comunicados/novo` — editor com preview por canal
- `/comunicacao/ouvidoria` — denúncias, sugestões, elogios
- `/comunicacao/reunioes` — agendamento de reuniões família×professor

### ⚙️ Módulo Configurações
- `/config/usuarios` — gestão de usuários e perfis
- `/config/perfis` — definição de papéis e permissões
- `/config/integracoes` — Gov.br, INEP, SIGAA, sistemas legados
- `/config/branding` — logo e cores do município
- `/config/auditoria` — log de auditoria
- `/config/lgpd` — consentimentos, solicitações de titulares

**Total estimado:** ~45 telas no painel completo.

## 4. Arquitetura de informação

### Layout base
```
┌─────────────────────────────────────────────────────────┐
│  Topbar: logo · breadcrumbs · busca global · avatar     │
├──────────┬──────────────────────────────────────────────┤
│          │                                              │
│ Sidebar  │  Conteúdo principal                          │
│ (módulos)│  ┌─────────────────────────────────────────┐ │
│          │  │ Page header (título + ações)            │ │
│          │  ├─────────────────────────────────────────┤ │
│          │  │ Filtros / abas                          │ │
│          │  ├─────────────────────────────────────────┤ │
│          │  │                                         │ │
│          │  │ Conteúdo (tabela / dashboard / form)    │ │
│          │  │                                         │ │
│          │  └─────────────────────────────────────────┘ │
└──────────┴──────────────────────────────────────────────┘
```

### Sidebar adaptativa por perfil
- Professor regente vê: Pedagógico
- Diretor vê: Pedagógico, Gestão Escolar
- Secretaria vê: Tudo conforme permissão

### Rodapé da sidebar — identidade contextual
Fixo na base da sidebar, acima do botão **Sair**:
```
┌─────────────────────────────┐
│ [Avatar] Nome do Professor  │
│         Escola Estadual X   │  ← exibida após seleção de escola
│         Secretaria de Y     │
│ [Sair]                      │
└─────────────────────────────┘
```
- Nome e avatar vêm do perfil autenticado (Keycloak)
- Nome da escola e secretaria aparecem somente após o usuário selecionar o vínculo (tela `/seleciona-perfil`)
- Enquanto não há escola selecionada, exibir apenas nome do professor
- Truncar textos longos com `text-ellipsis` — tooltip ao hover com nome completo

### Densidade
Mais densa que a landing. Body em 14-15px, table rows em 36-44px,
cards menores, mais informação por viewport.

## 5. Sistema de design do painel

Compartilha tokens com a landing (`packages/design_system_web`), mas
adiciona:

### Componentes específicos do painel
- `<DataTable>` com TanStack Table — paginação, filtros, ordenação, export CSV
- `<DashboardCard>` — card de KPI com sparkline
- `<FilterBar>` — barra de filtros persistentes via URL params
- `<EmptyState>` — estado vazio com ilustração e CTA
- `<StatusBadge>` — pill colorida por status (presente, falta, pendente)
- `<UserAvatar>` com fallback de iniciais
- `<DateRangePicker>`
- `<SchoolPicker>` / `<TurmaPicker>` / `<AlunoPicker>` (autocompletes contextuais)
- `<RichTextEditor>` (Tiptap) para atividades e comunicados
- `<ChartsLib>` wrappers do Recharts

### Tokens adicionais (não vão na landing)
- Status colors: success, warning, danger, info, neutral
- Dimensões compactas: `space-1` = 4px, table-row = 36px

### Regras visuais
- Botões primários: cyan (já usado na landing)
- Ações destrutivas: coral
- Sucesso: green
- Sidebar fundo: `--bg-alt` (#F2F1EC)
- Sidebar ativo: borda esquerda 3px cyan + texto bold
- Tabelas zebradas opcionais (off por padrão)

## 6. Stack adicional do painel

| Necessidade        | Biblioteca               |
| ------------------ | ------------------------ |
| Componentes UI     | shadcn/ui (Radix headless) |
| Tabelas            | @tanstack/react-table v8 |
| Estado servidor    | @tanstack/react-query v5 |
| Forms              | react-hook-form + zod    |
| Gráficos           | Recharts                 |
| Editor rich text   | Tiptap                   |
| Datas              | date-fns + date-fns-tz   |
| i18n               | next-intl (PT padrão, EN futuro) |
| Permissões         | CASL                     |
| Drag & drop        | @dnd-kit                 |
| Notificações UI    | sonner (toast)           |
| Calendário         | react-big-calendar       |
| Export CSV/Excel   | papaparse + xlsx         |

## 7. Roadmap do painel (casado com roadmap geral)

### 🟢 Fase 0 — Fundação (semanas 1-6)
- Layout base (sidebar + topbar + breadcrumbs)
- Auth com Keycloak + Gov.br
- Sistema de permissões (CASL)
- Componentes base (DataTable, FilterBar, forms)
- Tela de login + recuperação de senha
- Tela de seleção de perfil/escola (multi-vínculo)

### 🟢 Fase 1 — MVP escola-piloto (3-4 meses)
**Foco: professor e diretor da escola-piloto**
- Chamada digital
- Atividades (criar + entregar)
- Correção (manual, sem IA ainda)
- Mural da turma
- Boletim com lançamento de notas
- Gestão básica de turmas e alunos
- Relatórios básicos da escola
- Comunicados em massa para a escola

**Não entra na Fase 1:** indicadores avançados, merenda, transporte,
correção com IA, integrações externas.

### 🟡 Fase 2 — Escala municipal (3 meses)
- Dashboard de Secretaria (rede toda)
- Gestão de matrículas e remanejamento
- Indicadores: equidade, evasão, frequência consolidada
- Comunicados segmentados (por escola/série/bairro)
- Calendário letivo municipal
- Censo Escolar — export INEP
- Auditoria visível
- Painel de ouvidoria

### 🟣 Fase 3 — Operacional + IA (3-4 meses)
- Merenda (cardápio + estoque + compras)
- Transporte (rotas + ônibus ao vivo)
- Correção assistida por IA
- Tutor IA "Edu" administrável
- Alertas preditivos de evasão (modelo treinado)
- IDEB proxy
- Comparativos intermunicipais

### 🔵 Fase 4 — Maturidade (contínuo)
- Patrimônio
- Formação continuada
- Marketplace de conteúdo
- Saúde escolar
- Integrações estaduais (SED, SIGAA)
- White-label / branding por município

## 8. Fluxos críticos a desenhar

Mesmo sem wireframes nesta fase, antes de codar **cada um** destes
fluxos deve ter wireframe aprovado:

1. **Professor faz chamada em 60 segundos** (mobile-friendly do painel)
2. **Professor corrige redação com IA assistiva** (sugestões + aceitar/rejeitar)
3. **Diretor remaneja aluno entre turmas** (drag & drop com regras)
4. **Secretaria recebe alerta de evasão e aciona escola** (workflow)
5. **Pais agendam reunião com professor** (slots disponíveis)
6. **Comunicado em massa segmentado** (preview por canal antes de enviar)
7. **Lançamento de notas em lote** (tabela editável tipo planilha)
8. **Onboarding de nova escola** (wizard multi-passo)

## 9. Considerações técnicas

### Performance
- SSR para landing pages do painel; CSR para áreas de trabalho intensivo
- Streaming de tabelas grandes (chamada com 800 alunos)
- Virtualização (TanStack Virtual) em tabelas >100 linhas
- Skeletons durante loading

### Acessibilidade
- WCAG 2.1 AA mandatório
- Todos os fluxos navegáveis por teclado
- Atalhos: `g c` chamada, `g a` atividades, `g m` mural, `?` ajuda
- Suporte a leitores de tela em tabelas

### Responsividade
- Painel é **desktop-first** (uso em laboratório, secretaria)
- Quebras: `sm` 640 / `md` 768 / `lg` 1024 / `xl` 1280 / `2xl` 1536
- **Tablet (iPad)** é caso de uso forte para professor — testar em 768-1024
- **Mobile** do painel: apenas chamada, mural e boletim com layout adaptado;
  resto pode redirecionar para o app mobile do professor (Fase 2)

### Calendário e semana letiva
- Semana exibida sempre de **Segunda-feira (2ª) a Domingo (Dom)**
- **Domingo:** nunca possui atividades letivas — célula visual desabilitada/acinzentada, sem possibilidade de criação de evento
- **Sábado:** pode ocasionalmente ter atividade letiva — célula habilitada porém com indicador visual diferenciado (ex.: fundo levemente colorido) para sinalizar que é dia não-padrão
- Essa regra se aplica a qualquer componente de calendário/semana no painel: agenda do professor, chamada, atividades, plano de aula

### Internacionalização
- PT-BR é padrão e única língua na Fase 1
- Estrutura em `next-intl` desde o dia 1 (libras avatar futuramente)

### Telemetria
- PostHog ou Mixpanel para eventos de uso
- Sentry para erros
- Logs estruturados (Pino) → Loki

### LGPD
- Logs de auditoria em todas as visualizações de dados de menores
- Consentimento parental verificável antes de exibir dados sensíveis
- Mascaramento de CPF/dados em listagens (revelar só sob clique + log)
- Solicitação de titular: download e exclusão de dados

## 10. Métricas de sucesso

### Adoção
- % professores ativos semanalmente (meta: 85% no MVP)
- Tempo médio para fazer chamada (meta: <90s para 30 alunos)
- NPS do professor (meta: >40 na Fase 1)

### Operacional
- Tempo médio de criação de atividade (meta: <3min)
- % atividades com correção em até 7 dias (meta: 80%)
- Comunicados lidos / enviados (meta: >70%)

### Institucional
- % escolas usando o painel diariamente (meta: 100% em 6 meses)
- Redução do tempo de fechamento de bimestre (meta: -50%)
- Eventos de violação LGPD (meta: 0)

## 11. Riscos e mitigações

| Risco                                    | Mitigação                                       |
| ---------------------------------------- | ----------------------------------------------- |
| Conexão instável em escolas              | Cache offline (TanStack Query) + retry          |
| Resistência à mudança dos professores    | Onboarding presencial + 2 semanas de paralelo   |
| Performance com 50k alunos               | Virtualização, paginação server-side, índices  |
| Formadores de opinião contra "tela"      | Tablet first, sem dependência só de desktop     |
| Vazamento de dados de menores            | RLS no Postgres, audit log, mascaramento        |
| Diretor sem perfil técnico               | Wizards passo-a-passo, copy explicativa         |

## 12. Estrutura de pastas do painel

```
apps/web_painel/
├── public/
│   ├── mascots/
│   └── icons/
├── src/
│   ├── app/                       # App Router
│   │   ├── (auth)/login/
│   │   ├── (auth)/seleciona-perfil/
│   │   ├── (app)/
│   │   │   ├── layout.tsx         # Sidebar + topbar
│   │   │   ├── pedagogico/
│   │   │   ├── escola/
│   │   │   ├── rede/
│   │   │   ├── operacional/
│   │   │   ├── indicadores/
│   │   │   ├── comunicacao/
│   │   │   └── config/
│   │   └── api/
│   ├── components/
│   │   ├── ui/                    # shadcn primitives
│   │   ├── layout/                # Sidebar, Topbar, etc
│   │   ├── data/                  # DataTable, FilterBar
│   │   ├── charts/
│   │   └── domain/                # AlunoCard, TurmaCard, etc
│   ├── features/                  # Domínios verticais
│   │   ├── chamada/
│   │   ├── atividades/
│   │   ├── boletim/
│   │   └── ...
│   ├── lib/
│   │   ├── api.ts                 # Wrapper do api_client_ts
│   │   ├── auth.ts
│   │   ├── permissions.ts         # CASL
│   │   └── utils.ts
│   ├── hooks/
│   ├── types/
│   └── styles/
├── tailwind.config.ts
├── next.config.mjs
└── package.json
```

## 13. Próximos passos

Antes de começar a codar o painel:
1. ✅ Aprovar este PLAN.md
2. ⬜ Desenhar wireframes dos 8 fluxos críticos (Opção B)
3. ⬜ Validar mapa de telas com 1 professor + 1 diretor + 1 gestor de Secretaria
4. ⬜ Definir escola-piloto e fechar escopo final do MVP
5. ⬜ Criar issues no board para cada tela da Fase 1 (estimativa de pontos)
6. ⬜ Codar layout base + auth + 1 fluxo end-to-end (chamada) como prova de conceito

---

**Última atualização:** abril/2026
**Mantenedor:** PM + Tech-lead

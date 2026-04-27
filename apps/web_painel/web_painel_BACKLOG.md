# Web Painel — Backlog Sequencial

> Backlog vivo para transformar o painel em uma ferramenta operacional real,
> alinhada à estratégia integration-first do CadernEdu.
>
> Status: `⬜ A fazer` · `🟡 Em andamento` · `✅ Concluído` · `⛔ Bloqueado`

## Norte do MVP

Validar um fluxo ponta a ponta em uma escola-piloto:

```
importar dados existentes
→ professor acessa o painel
→ escolhe turma
→ registra aula/chamada/atividade/comunicado
→ família acompanha no app
→ escola/secretaria vê status e pendências
```

## Sequência Recomendada

### 0. Higiene de Produto e Ambiente

| Status | Item | Entrega | Critério de pronto |
|---|---|---|---|
| ⬜ | Revisar navegação local e Portainer | URLs, comandos e variáveis documentados | Dev e Portainer sobem com instrução única e sem caminhos antigos |
| ⬜ | Congelar escopo do piloto visual | Lista curta de fluxos que entram no MVP | Documento com entra/não entra aprovado |
| ⬜ | Definir escola-piloto hipotética | Nome, perfis e dados mínimos fictícios | Fixtures coerentes para demo e testes |

### 1. Shell Visual do Painel

Objetivo: fazer o painel parecer ferramenta de trabalho, não scaffold.

| Status | Item | Entrega | Critério de pronto |
|---|---|---|---|
| ✅ | Criar `Topbar` | Breadcrumb, escola/turma ativa, data letiva, status de sincronização | Aparece em todas as rotas autenticadas |
| ✅ | Refinar `Sidebar` | Grupos por módulo, estado ativo mais claro, perfil compacto | Navegação continua funcional em `/turmas`, agenda, chamada e comunicados |
| 🟡 | Criar `PageHeader` padrão | Título, descrição, ações primárias e secundárias | Criado e aplicado em `/turmas`; falta aplicar em agenda e chamada |
| 🟡 | Criar cards operacionais | `MetricCard`, `StatusCard`, `ActionCard` | `OperationalCard` criado e aplicado em `/turmas`; falta ampliar padrões |
| ⬜ | Ajustar densidade global | Espaçamentos, raios, fontes e largura de conteúdo | Painel mais compacto que landing, sem perder legibilidade |

### 2. Home Operacional

Objetivo: substituir “Selecione a turma” por uma página inicial útil.

| Status | Item | Entrega | Critério de pronto |
|---|---|---|---|
| 🟡 | Redesenhar `/turmas` como dashboard | Turmas recentes, pendências de hoje, ações rápidas | Primeira versão com cards, status e seleção escola/turma; falta pendências reais |
| ⬜ | Adicionar seção “Hoje” | Chamada pendente, aula registrada, atividade de casa, comunicado | Usa dados reais da API quando disponíveis |
| ⬜ | Adicionar status de integração | Última carga, pendências e origem dos dados | Pode usar estado mockado até domínio `integrations` existir |
| ⬜ | Melhorar seleção escola/turma | Busca, filtros e cards mais informativos | Fluxo atual de selecionar escola/turma permanece intacto |

### 3. Fluxo de Chamada

Objetivo: chamada rápida, clara e preparada para integração futura.

| Status | Item | Entrega | Critério de pronto |
|---|---|---|---|
| ⬜ | Aplicar `PageHeader` na chamada | Header com turma, data, status e ação principal | Botão salvar sempre previsível |
| ⬜ | Barra fixa de salvamento | Resumo + salvar no topo ou rodapé sticky | Professor não precisa rolar para salvar |
| ⬜ | Ações em lote | Marcar todos presentes, limpar faltas, filtrar ausentes | Reduz cliques em turma grande |
| ⬜ | Status de sincronização | “Salvo no CadernEdu” vs “pendente de sistema oficial” | Texto não promete integração ainda inexistente |
| ⬜ | Acessibilidade de status | Botões com `aria-label`, foco visível e texto claro | Navegação por teclado funciona no ciclo presente/falta/atestado |

### 4. Agenda, Atividades e Comunicação

Objetivo: fechar o cotidiano do professor e o que a família verá no app.

| Status | Item | Entrega | Critério de pronto |
|---|---|---|---|
| ⬜ | Padronizar agenda semanal | Header, filtros, empty state e cards de aula | Semana Seg-Dom respeitada, domingo desabilitado |
| ⬜ | Destacar “atividade de casa” | Campo/estado visual claro dentro da agenda | Família consegue entender o que fazer em casa |
| ⬜ | Melhorar comunicados | Composer com destinatário, anexos, preview e estado de envio | Canal institucional fica claro |
| ⬜ | Preparar autorizações | Modelo visual para comunicado que exige resposta | Pode iniciar como front-end mockado |
| ⬜ | Criar resumo “visível para família” | Preview do que aparecerá no app família | Professor vê impacto antes de publicar |

### 5. Integrações no Painel

Objetivo: tornar visível a estratégia integration-first.

| Status | Item | Entrega | Critério de pronto |
|---|---|---|---|
| ⬜ | Criar rota `/config/integracoes` | Lista de conectores/importações | Acessível pela sidebar quando perfil permitir |
| ⬜ | Criar tela de importação inicial | Upload CSV/XLSX, tipo de dado e instruções | Sem backend real pode começar com UI e contrato esperado |
| ⬜ | Criar histórico de importações | Status, totais, erros e usuário responsável | Estrutura pronta para `ImportJob` |
| ⬜ | Criar visual de erros por linha | Linha, campo, motivo e sugestão | Erro acionável para operador não técnico |
| ⬜ | Criar reconciliação básica | Possíveis duplicidades e vínculos quebrados | Pode iniciar com dados mockados |

### 6. Backend `integrations`

Objetivo: dar chão real para importação e reconciliação.

| Status | Item | Entrega | Critério de pronto |
|---|---|---|---|
| ⬜ | Criar domínio `integrations` | `models.py`, `schemas.py`, `repository.py`, `service.py`, `router.py` | Registrado em `app/main.py` |
| ⬜ | Criar migration | Tabelas `integration_sources`, `import_jobs`, `import_job_errors`, mappings externos | Alembic aplica limpo |
| ⬜ | Endpoint de importação CSV | Upload de arquivo para uma entidade inicial | Idempotente para fixture simples |
| ⬜ | Importar escolas/turmas/alunos | Carga inicial mínima do piloto | Relatório de criados/atualizados/rejeitados |
| ⬜ | Testes de importação | Fixtures anonimizadas e casos de erro | Testes cobrem duplicidade e campo obrigatório |

### 7. App Família Conectado ao Fluxo

Objetivo: mostrar no celular o que o professor registrou.

| Status | Item | Entrega | Critério de pronto |
|---|---|---|---|
| ⬜ | Agenda do dia no app | Aula estudada e atividade de casa | Consome endpoint real de agenda |
| ⬜ | Comunicados no app | Lista e detalhe de comunicado | Mostra anexos quando existirem |
| ⬜ | Cardápio como módulo opcional | UI preparada para dados integrados ou cadastrados | Não promete dado quando módulo não estiver ativo |
| ⬜ | Transporte como módulo opcional | Previsão/aviso quando houver integração | Estado “não disponível nesta rede” bem tratado |

### 8. Governança, Segurança e Permissões

Objetivo: preparar para prefeitura de verdade.

| Status | Item | Entrega | Critério de pronto |
|---|---|---|---|
| ⬜ | Seleção de perfil/escola | Multi-vínculo após login | Usuário vê apenas escolas/turmas permitidas |
| ⬜ | RBAC inicial | Professor, diretor, secretaria, suporte | Rotas e ações respeitam perfil |
| ⬜ | Audit log mínimo | Ações sensíveis: chamada, comunicado, importação | Registro inclui usuário, data e entidade |
| ⬜ | Mascaramento de dados sensíveis | CPF/contatos não expostos por padrão | Revelação futura exige evento de auditoria |

## Próximo Foco

1. `Shell Visual do Painel`
2. `Home Operacional`
3. `Fluxo de Chamada`

Esses três passos aumentam a qualidade percebida rapidamente e criam a base
visual para receber integrações depois.

## Critérios de Priorização

1. Reduz retrabalho real de professor/escola.
2. Evita duplicação de dados já existentes.
3. Ajuda a demonstrar o piloto ponta a ponta.
4. Melhora confiança institucional: status, auditoria, origem dos dados.
5. Mantém o escopo honesto: módulos opcionais não fingem estar integrados.

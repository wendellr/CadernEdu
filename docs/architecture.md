# Arquitetura — CadernEdu

## Visão geral

```
┌──────────────────────────────────────────────────────────────────┐
│  CLIENTES                                                        │
│  ┌─────────┐ ┌─────────┐ ┌──────────┐ ┌────────┐ ┌────────────┐ │
│  │ Aluno   │ │ Família │ │ Professor│ │ Painel │ │ Site       │ │
│  │ Flutter │ │ Flutter │ │ Flutter  │ │ Next   │ │ Next       │ │
│  └────┬────┘ └────┬────┘ └─────┬────┘ └────┬───┘ └─────┬──────┘ │
│       └───────────┼────────────┼───────────┼───────────┘        │
└───────────────────┼────────────┼───────────┼────────────────────┘
                    │            │           │
                    ▼            ▼           ▼
┌──────────────────────────────────────────────────────────────────┐
│  API CadernEdu (FastAPI modular monolith)                        │
│  Auth · Rate-limit · Cache · WebSocket · OpenAPI                 │
└──────────────────────┬───────────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┬─────────────┬───────────┬──────────────┐
       ▼               ▼               ▼             ▼           ▼              ▼
   ┌────────┐    ┌──────────┐    ┌──────────┐  ┌────────┐  ┌──────────┐  ┌────────────┐
   │Identity│    │Pedagógico│    │Comunicaç.│  │Gestão  │  │Analytics │  │Integrations│
   │FastAPI │    │FastAPI   │    │FastAPI   │  │FastAPI │  │FastAPI   │  │FastAPI     │
   └────┬───┘    └─────┬────┘    └─────┬────┘  └────┬───┘  └─────┬────┘  └──────┬─────┘
        │              │               │            │            │              │
        └──────────────┴───────────────┴────────────┴────────────┴──────────────┘
                                  │
              ┌───────────────────┴─────────────────────┐
              ▼                                          ▼
   ┌────────────────────┐                    ┌────────────────────┐
   │  PostgreSQL 16     │                    │  Redis 7 + BullMQ  │
   │  (RLS, schemas)    │                    │  Cache + Filas     │
   └────────────────────┘                    └────────────────────┘
              │
              ▼
   ┌────────────────────┐    ┌────────────────────┐
   │  S3 / MinIO        │    │  OpenSearch        │
   │  Arquivos          │    │  Busca textual     │
   └────────────────────┘    └────────────────────┘

              ┌───────────────────────────────────────────┐
              ▼                                           │
   ┌────────────────────┐    ┌────────────────────┐       │
   │ Sistemas legados   │    │ CSV/XLSX/SFTP/API  │◄──────┘
   │ da prefeitura      │    │ Conectores externos│
   └────────────────────┘    └────────────────────┘
```

## Princípios

1. **API contract-first** — `docs/api/openapi.yaml` é a fonte da verdade
2. **Integration-first** — integrar com sistemas existentes antes de propor substituição
3. **Offline-first nos apps mobile** — sync quando voltar a conexão
4. **Domínios isolados** — modular monolith pronto para extração futura
5. **LGPD by design** — minimização, consentimento, criptografia, auditoria

## Estratégia integration-first

O CadernEdu não deve exigir que a prefeitura abandone sistemas oficiais já em
uso no início do contrato. A plataforma nasce como camada de experiência,
operação e inteligência que conversa com fontes existentes de dados.

### Papel do CadernEdu

- **Camada de experiência:** apps e painel mais simples para professores,
  famílias, alunos e gestores.
- **Camada operacional:** agenda, comunicação, chamada, acompanhamento e fluxos
  que podem nascer no CadernEdu quando não houver sistema bom equivalente.
- **Camada de integração:** importação/exportação e sincronização com sistemas
  legados de matrícula, diário, frequência, notas, transporte, merenda e INEP.
- **Camada de inteligência:** indicadores e alertas derivados de dados próprios
  e integrados.

### Modelo canônico

O domínio interno usa entidades canônicas independentes de fornecedor:

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

Cada sistema externo deve ser implementado como adaptador que traduz seus dados
para esse modelo canônico. Nomes de tabelas, códigos e particularidades do
fornecedor não devem vazar para os domínios principais.

### Política por entidade

Antes de integrar uma prefeitura, definir para cada entidade:

- fonte de verdade;
- modo de sincronização: manual, agendado, webhook ou API;
- direção: leitura, escrita ou bidirecional;
- regra de conflito;
- identificador externo estável;
- trilha de auditoria e retenção.

No piloto, a preferência é **importar primeiro e escrever depois**. CSV/XLSX
validado é aceitável para reduzir risco quando API formal ainda não existe.

## Domínios

### Identity
- Cadastro de usuários (aluno, responsável, professor, gestor, secretaria)
- Auth via Keycloak + Gov.br OIDC
- Permissões por escola/turma
- Consentimento parental (LGPD-Kids)

### Pedagógico
- Trilhas BNCC por série
- Tarefas, entregas, correções
- Boletim e notas
- Conquistas e gamificação
- (Fase 3) Tutor IA "Edu"

### Comunicação
- Mural da turma
- Mensagens diretas (com controle parental)
- Notificações push (FCM/APNs)
- Comunicados em massa segmentados

### Gestão
- Matrículas e transferências
- Frequência (chamada digital)
- Merenda e cardápio
- Transporte escolar (rotas, ônibus ao vivo)

### Analytics
- Indicadores por escola/região
- Alertas de evasão (modelo preditivo)
- Dashboard de equidade
- Exportação para INEP

### Integrations
- Conectores com sistemas legados municipais, estaduais e fornecedores privados
- Importação CSV/XLSX com validação por linha e relatório de erros
- Mapeamento entre identificadores externos e entidades canônicas
- Histórico de sincronização, reprocessamento e reconciliação
- Exportações para INEP e sistemas oficiais quando contratadas

## Decisões importantes

Veja [ADRs](./adr/):

- ADR-001: Por que Flutter ao invés de React Native?
- ADR-002: Estratégia integration-first
- ADR-003: Postgres com schemas vs múltiplos bancos
- ADR-004: Estratégia offline-first com Drift

## Ambientes

| Ambiente   | URL                                    | Branch    |
| ---------- | -------------------------------------- | --------- |
| Local      | localhost                              | qualquer  |
| Staging    | staging.cadernedu.com.br               | develop   |
| Produção   | cadernedu.gov.br · api.cadernedu.gov.br| main      |

## Segurança

- TLS 1.3 obrigatório
- Criptografia em repouso (AES-256)
- Rotação de chaves a cada 90 dias
- Auditoria completa em todos os domínios
- Backup diário com retenção de 30 dias
- DR (Disaster Recovery): RPO 1h, RTO 4h

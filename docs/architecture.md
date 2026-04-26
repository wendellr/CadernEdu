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
│  GATEWAY · BFF (NestJS)                                          │
│  Auth Gov.br · Rate-limit · Cache · WebSocket                    │
└──────────────────────┬───────────────────────────────────────────┘
                       │
       ┌───────────────┼───────────────┬─────────────┬───────────┐
       ▼               ▼               ▼             ▼           ▼
   ┌────────┐    ┌──────────┐    ┌──────────┐  ┌────────┐  ┌──────────┐
   │Identity│    │Pedagógico│    │Comunicaç.│  │Gestão  │  │Analytics │
   │NestJS  │    │NestJS    │    │NestJS    │  │NestJS  │  │NestJS+IA │
   └────┬───┘    └─────┬────┘    └─────┬────┘  └────┬───┘  └─────┬────┘
        │              │               │            │            │
        └──────────────┴───────────────┴────────────┴────────────┘
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
```

## Princípios

1. **API contract-first** — `docs/api/openapi.yaml` é a fonte da verdade
2. **Microsserviços por domínio** — não por camada técnica
3. **Offline-first nos apps mobile** — sync quando voltar a conexão
4. **Eventos de domínio** publicados em Kafka para auditoria e analytics
5. **LGPD by design** — minimização, consentimento, criptografia, auditoria

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

## Decisões importantes

Veja [ADRs](./adr/):

- ADR-001: Por que Flutter ao invés de React Native?
- ADR-002: NestJS vs FastAPI no backend
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

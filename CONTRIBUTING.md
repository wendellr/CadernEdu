# Contribuindo com o CadernEdu

## Antes de começar

1. Leia o [`CLAUDE.md`](./CLAUDE.md) — convenções e arquitetura
2. Instale as extensões recomendadas do VSCode (será sugerido ao abrir)
3. Configure seu `.env.local` a partir do `.env.example`

## Fluxo de trabalho

```
1. Pegue uma tarefa do board
2. git checkout -b feature/<id>-descricao-curta
3. Codifique em pequenos commits
4. Rode lint + testes localmente: pnpm lint && pnpm test
5. Push e abra PR
6. CI tem que passar verde
7. Pelo menos 1 review aprovado
8. Merge via squash
```

## Regras de PR

- **Pequeno**: idealmente <400 linhas alteradas
- **Foco único**: uma feature, um bug fix, uma refatoração — nunca tudo junto
- **Descrição clara**: o quê, por quê, como testar
- **Screenshots/vídeos** quando mexer em UI
- **Migrations e ADRs** documentados quando aplicável

## Setup local detalhado

```bash
# Clone
git clone git@github.com:cadernedu/cadernedu.git
cd cadernedu

# Node + pnpm
pnpm install

# Flutter (se for trabalhar nos apps mobile)
dart pub global activate melos
melos bootstrap

# Infra local
pnpm dev:infra

# Confirma que está tudo no ar
docker ps
# Você deve ver: postgres, redis, minio, mailhog, keycloak

# Roda os apps
pnpm dev
```

## Testes

```bash
pnpm test               # Todos
pnpm --filter @cadernedu/identity test  # Um serviço
melos run test          # Flutter
```

Cobertura mínima: **70%** para código de domínio (`services/*`).

## Dúvidas

- Slack: `#cadernedu-dev`
- Tech-lead: tech-lead@cadernedu.com.br

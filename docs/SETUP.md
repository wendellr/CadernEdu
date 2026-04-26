# Setup completo — primeira vez no projeto

## 1. Pré-requisitos

| Ferramenta       | Versão   | Como instalar                                       |
| ---------------- | -------- | --------------------------------------------------- |
| Git              | 2.40+    | https://git-scm.com                                 |
| Node             | 20 LTS   | https://nodejs.org ou nvm                           |
| pnpm             | 9.x      | `npm install -g pnpm`                               |
| Flutter          | 3.22+    | https://flutter.dev/docs/get-started                |
| Docker Desktop   | recente  | https://www.docker.com/products/docker-desktop      |
| GitHub CLI       | 2.x      | https://cli.github.com                              |

Validação:

```bash
node -v          # v20.x.x
pnpm -v          # 9.x.x
flutter --version # Flutter 3.22.x
docker --version
gh --version
```

## 2. Clone

```bash
gh repo clone <owner>/cadernedu
cd cadernedu
```

## 3. Configuração

```bash
# Variáveis de ambiente
cp .env.example .env.local
# Edite com seus valores locais

# Dependências JS
pnpm install

# Dependências Flutter
dart pub global activate melos
melos bootstrap
```

## 4. Subir infra local

```bash
pnpm dev:infra
docker ps  # confere se está tudo de pé
```

Serviços expostos:
- Postgres: `localhost:5432`
- Redis: `localhost:6379`
- MinIO: `localhost:9000` (API) e `localhost:9001` (console)
- Mailhog: `localhost:1025` (SMTP) e `localhost:8025` (UI web)
- Keycloak: `localhost:8080`

## 5. Configurar Keycloak (uma vez)

1. Acesse http://localhost:8080
2. Login: `admin` / `admin`
3. Crie o realm `cadernedu`
4. Crie o cliente `cadernedu-api` (confidential, copy secret pro .env.local)
5. Crie usuário de teste `dev@cadernedu.test` / `dev123`

## 6. Migrar o banco

```bash
pnpm --filter @cadernedu/identity prisma migrate dev
pnpm --filter @cadernedu/pedagogico prisma migrate dev
# ... cada serviço
```

## 7. Rodar

```bash
pnpm dev
```

Abra:
- Site: http://localhost:3000
- Painel: http://localhost:3001
- API: http://localhost:4000/v1/health

## 8. Rodar Flutter

```bash
cd apps/mobile_aluno
flutter run --flavor staging
# Ou no VSCode: F5 com o emulador aberto
```

## Problemas comuns

### Docker não sobe no Mac (M1/M2)
- Habilite "Use Rosetta" nas configs do Docker Desktop

### Flutter pub get falha
```bash
flutter clean
flutter pub get
melos clean && melos bootstrap
```

### pnpm install falha
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Porta ocupada
- Postgres na 5432 já em uso? Edite `infra/docker-compose.yml` para `5433:5432` e atualize `DATABASE_URL`

## Próximos passos

1. Leia [`CLAUDE.md`](../CLAUDE.md)
2. Leia [`docs/architecture.md`](./architecture.md)
3. Pegue uma issue marcada `good-first-issue`

# Fluxo de trabalho com IA no CadernEdu

> Este projeto é desenvolvido com forte apoio de IA (Claude, Cursor,
> Copilot, Continue.dev). Este documento garante que o uso seja produtivo
> e seguro.

## Princípios

1. **A IA escreve, você revisa.** Nunca aprove código que você não entende.
2. **Plano antes de código.** Para mudanças >50 linhas, peça plano primeiro.
3. **Contexto explícito.** Sempre direcione a IA pra ler `CLAUDE.md` e o
   arquivo relevante antes de gerar.
4. **Pequenos passos.** Um arquivo por vez, um teste por vez.

## Prompts-base (use livremente)

### Iniciar uma feature

```
Estou no projeto CadernEdu. Por favor:
1. Leia /CLAUDE.md
2. Leia /docs/architecture.md
3. Vou implementar [FEATURE]. Antes de gerar código, me dê um plano:
   - Quais arquivos vão ser criados ou alterados
   - Quais migrations são necessárias
   - Quais testes você sugere
   - Quais riscos LGPD você identifica
```

### Gerar testes primeiro (TDD-light)

```
Antes de implementar [feature], gere os testes em [caminho].
Use o padrão describe/it do Jest.
Após eu aprovar os testes, você gera a implementação.
```

### Revisão de PR

```
Revise este diff procurando:
- Bugs lógicos
- Vazamento de dados sensíveis (LGPD)
- Violações do CLAUDE.md
- Testes ausentes
- Strings duplicadas que deveriam ir pra design system
- Acessibilidade (WCAG AA)

Diff:
[cole aqui]
```

### Refatoração

```
Refatore [arquivo] mantendo a interface pública intacta.
Objetivo: [objetivo, ex: reduzir complexidade ciclomática].
Garanta que os testes existentes continuam passando.
```

### Tradução do design HTML pra Next.js

```
Tenho este HTML estático em [arquivo]. Converta cada seção em um
componente React em apps/web_site/src/components/.
- TypeScript estrito
- Tailwind (use os tokens do design_system_web)
- Acessibilidade WCAG AA
- Use Image do next/image para os mascotes
- Mantenha as animações
```

## Segurança ao usar IA

### O que NUNCA passar pra IA cloud

- Senhas, tokens, chaves de API
- Dados pessoais de alunos reais (CPF, endereço, etc.)
- Conteúdo de banco de dados de produção
- Variáveis de `.env.local`

### O que pode

- Código-fonte (já é versionado)
- Schemas e migrations
- Mocks com dados sintéticos
- Issues e PRs
- Documentação

## Modelo mental

A IA é um **estagiário senior** — produtiva, rápida, mas precisa de:
- Contexto claro
- Limites bem definidos
- Revisão antes do merge
- Feedback explícito quando errar

Se você se pegar copiando código que não entende, pare. Peça à IA pra
explicar antes de aprovar.

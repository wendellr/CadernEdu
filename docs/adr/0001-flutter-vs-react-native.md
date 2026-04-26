# ADR-001: Flutter como framework mobile

**Status:** Aceito
**Data:** 2026-04-25
**Decisores:** Tech-lead, time mobile

## Contexto

Precisamos publicar apps mobile nativos (iOS + Android) nas stores oficiais.
Não usaremos PWA. As opções principais eram Flutter, React Native e nativo
puro (Swift + Kotlin).

## Decisão

Vamos usar **Flutter 3.22+ com Dart**.

## Razões

1. **Single codebase real** — UI idêntica em iOS e Android sem fork
2. **Performance** — compilação AOT, sem bridge JS
3. **Customização visual** — facilita seguir nossa identidade visual
   com mascotes e gamificação
4. **Maturidade do ecossistema** — Riverpod, Drift, Dio são estáveis
5. **Skill no time** — devs mobile já têm experiência

## Trade-offs aceitos

- Tamanho do APK/IPA maior que nativo puro
- Curva de aprendizado de Dart para devs novos
- Algumas integrações com SDKs nativos requerem channels

## Alternativas consideradas

- **React Native**: time backend é Node, mas o ecossistema é mais frágil
  para apps com UI customizada pesada
- **Nativo puro**: dobraria custo e tempo de desenvolvimento

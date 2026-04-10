# DEV-pvr-broken — Premissas vs Realizado não renderiza (recorrente)

**Dono:** Dev
**Prioridade:** 🔴 Crítica
**Origem:** Diego reportou 2026-04-09. Problema recorrente.

---

## Problema

A seção "Premissas vs Realizado" na aba Performance não aparece / não renderiza. Dados existem no `data.json` (`premissas_vs_realizado` com `retorno_equity` e `aporte_mensal` populados), mas o frontend não mostra.

**Recorrência:** Já quebrou múltiplas vezes. Fix pontual não resolve — precisa de root cause analysis.

## Investigar

1. **buildPremissasVsRealizado()** — função JS que renderiza. Verificar se é chamada, se o `el` existe, se `DATA.premissas_vs_realizado` está acessível no momento da execução.
2. **Timing de render** — a função está no array `status` de `initTab`. Verificar se é executada no tab correto (`perf`), ou se só roda no tab `status`.
3. **Null checks excessivos** — `if (!pvr) { display:none; return; }` pode estar escondendo a seção por um campo null inesperado.
4. **Schema validation warnings** — os 9 warnings do build podem estar corrompendo o parse do DATA.
5. **Privacy mode** — verificar se `.pv` class está escondendo conteúdo.

## Ação

- Root cause analysis com logs de debug temporários.
- Adicionar fallback visível ("Sem dados — verificar pipeline") em vez de `display:none` silencioso.
- Teste de regressão: após fix, verificar que PvR aparece em builds consecutivos.
- **Não aceitar fix pontual** — entender POR QUE é recorrente.

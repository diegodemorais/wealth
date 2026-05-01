# DEV-pipeline-gaps-p2: Pipeline Gaps P2 — spendingSensibilidade, p_quality_aspiracional, fetch_with_retry

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-pipeline-gaps-p2 |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Dev (implementação), FIRE (spec spendingSens) |
| **Dependencias** | — |
| **Criado em** | 2026-05-01 |
| **Origem** | XX-system-audit — 3 itens backlog documentados mas não implementados |

---

## Descrição

Três gaps do pipeline identificados na XX-system-audit e documentados em `generate_data.py`, pendentes de implementação.

---

## Gap 1 — `spendingSensibilidade` (P1, ~30min)

**Situação:** `state.spending.scenarios` nunca é populado por nenhum script. `spendingSensibilidade` no data.json sempre retorna `[]`.

**Fix:** Calcular P(FIRE) para 3 níveis de gasto via PFireEngine inline em `generate_data.py` e persistir em `state.spending.scenarios`:

```python
# 3 cenários de gasto (R$/ano):
cenarios = [
    {"label": "Solteiro/FIRE Day", "custo": 250_000},
    {"label": "Pós-casamento",     "custo": 270_000},
    {"label": "Casamento+filho",   "custo": 300_000},
]
# Para cada cenário: rodar PFireEngine com custo ajustado → base, fav, stress
# Persistir via update_dashboard_state("spending.scenarios", [...])
```

**Impacto:** Seção de sensibilidade ao gasto no dashboard (ScenarioCompareCards) passa a ter dados reais.

**Estimativa:** ~3 chamadas adicionais ao PFireEngine por run (<5s total).

---

## Gap 2 — `fire.p_quality_aspiracional` (P2, ~1h)

**Situação:** `fire.p_quality_aspiracional` é null. `fire_montecarlo.py --by_profile` não calcula P(quality) para o cenário aspiracional, só para o base.

**Fix:** Em `fire_montecarlo.py`, ao rodar `--by_profile aspiracional`, chamar `compute_p_quality()` com os parâmetros aspiracionais (gasto R$250k/ano, idade 49) e persistir resultado em `state.fire.p_quality_aspiracional`.

**Impacto:** Dashboard mostra P(Quality) no card Aspiracional (ScenarioCompareCards mostra `—` hoje).

---

## Gap 3 — `fetch_with_retry()` unificado (P3, ~2h)

**Situação:** Chamadas externas (yfinance, pyield, BCB, IBKR) usam `fetch_with_retry` de `fetch_utils.py` de forma não uniforme. `NakedIntegrationDetector` identifica violações residuais.

**Fix:** Auditar todos os scripts com `python3 scripts/detect_hardcoding.py --integrations` e corrigir chamadas nuas restantes para usar `fetch_with_retry`. Adicionar `cache_ttl_h` padrão por integração.

**Impacto:** Pipeline mais resiliente a falhas transitórias de API.

---

## Próximos Passos

1. Gap 1 (spendingSensibilidade) — maior impacto, menor esforço. Executar primeiro.
2. Gap 2 (p_quality_aspiracional) — requer entender `--by_profile` em fire_montecarlo.py.
3. Gap 3 (fetch_with_retry) — cleanup, executar quando houver slot.

---

## Conclusao

> A preencher após implementação.

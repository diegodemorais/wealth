# DEV-factor-tstats: t-stats + R² warning no Factor Loadings

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-factor-tstats |
| **Dono** | Dev + Quant |
| **Status** | ✅ Done — 2026-04-11 |
| **Prioridade** | 🟡 Média |
| **Participantes** | Quant (auditoria), Dev (implementação) |
| **Criado em** | 2026-04-11 |
| **Origem** | Quant audit identificou: sem t-stats no chart, R² <0.80 para EIMI/DGS sem disclaimer |
| **Deps** | — |

---

## Problema

O grouped bar chart de Factor Loadings exibia todos os loadings com a mesma opacidade, sem distinguir significância estatística. Adicionalmente, EIMI (R²=0.66) e DGS (R²=0.78) não tinham aviso de que o modelo FF5 de mercados desenvolvidos explica mal esses ETFs.

---

## Solução Implementada

**`scripts/reconstruct_factor.py` + `scripts/generate_data.py`**
- Adicionado campo `t_stats: {alpha, mkt_rf, smb, hml, rmw, cma, mom}` ao dict de cada ETF
- Usa `model.tvalues` do OLS statsmodels (HC1 robust)

**`dashboard/template.html` — `buildFactorLoadings()`**
- Barras sólidas (opacity 0.85) = loading significativo |t|>2
- Barras opacas (opacity 0.30) = não significativo
- Tooltip mostra valor + t-stat
- Cards R²: verde ≥0.90 / amarelo ≥0.80 / vermelho <0.80 + ⚠️ hover tooltip
- Disclaimer na fonte explica encoding e limitação R²

---

## Resultado

```
SWRD mkt_rf: t=34.75 ✅ | AVUV SMB: t=13.5 ✅ | EIMI R²=0.66 ⚠️
```

- v1.144 — factor_snapshot.json regenerado com t_stats

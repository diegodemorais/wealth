---
ID: DEV-factor-views-tab-toggle
Titulo: Consolidar 3 factor views em PORTFOLIO via tab toggle
Dono: Dev
Prioridade: 🟢 Baixa
Dependências: —
Origem: HD-dashboard-review-completa Onda 3.2 (deferred 2026-05-03 — não são duplicatas reais)
---

## Contexto

PORTFOLIO tem 3 painéis de factor analysis adjacentes:

- `<FactorLoadings />` — per-ETF detail (HML/RMW/CMA/SMB de cada ETF da carteira)
- `<FactorProfileChart />` — comparativo dos 4 ETFs lado a lado
- `<StyleBoxChart />` — style box 3×3 (size × value)

Não são duplicatas — cada um responde pergunta diferente. Mas ocupam ~3× espaço vertical e o leitor precisa rolar pra ver as 3 visões da mesma decomposição.

## Decisão (Diego, 2026-05-03)

Implementar **tab toggle** consolidando os 3 em um único bloco com 3 abas:

```
[ Per-ETF | Comparativo | Style Box ]
```

Estado da tab no Zustand `uiStore` ou local. Default: "Comparativo" (visão mais usada).

## Critérios de aceite

- [ ] Componente novo: `<FactorAnalysisPanel />` em `react-app/src/components/portfolio/`
- [ ] 3 abas com toggle (default Comparativo)
- [ ] Tooltips/labels migrados de cada componente original
- [ ] Espaço vertical economizado: ≥40% vs hoje
- [ ] data-testid: `factor-analysis-panel` + `factor-tab-{per-etf,comparativo,style-box}`
- [ ] Privacy mode preservado
- [ ] Suite full verde

## Restrições

- Não alterar lógica de dados — só consolidação visual
- Manter os 3 componentes existentes como filhos (não duplicar lógica)

## Conclusão

> A preencher após implementação.

---
ID: DEV-now-refactor
Titulo: Refactor NOW page.tsx — extrair sub-componentes (1053 → ~500 linhas)
Dono: Dev
Prioridade: 🟡 Média
Dependências: —
Origem: HD-dashboard-review-completa Onda 3.1 (deferred 2026-05-03 — alto risco sem E2E ampliada)
---

## Contexto

`react-app/src/app/page.tsx` está com 1053 linhas após Ondas 2/3. 6 strips entrelaçadas no JSX, com closures complexas e dependências cruzadas (KPI hero pre-compute wellness + hooks rules + sankey state).

Refactor pleno (1053 → ~500) requer extração metódica em sub-componentes:

- `<NowKpiHero />` — hero com 4 KPIs + lógica wellness pre-compute
- `<NowSankey />` — sankey + open/close state
- `<NowMonthlyHeatmap />` — heatmap próprio
- `<NowDcaStatus />` — DCA status + ScenarioBadge

## Riscos

- KPI hero tem closures sobre data fetched no parent — extração precisa pass-down explícito
- React hooks rules (ordem) — checar que cada sub-componente tem hooks no topo
- ScenarioBadge global — precisa receber via props ou consumir store
- Privacy mode — todos os sub-componentes devem manter `usePrivacyMode()`

## Critérios de aceite

- [ ] NOW page.tsx ≤ 500 linhas
- [ ] 4 sub-componentes em `react-app/src/components/now/`
- [ ] Suite full verde (793 vitest + Playwright + sanity)
- [ ] Visual regression: screenshots NOW antes/depois idênticos (Playwright headed snapshot)
- [ ] data-testid preservados (semantic-smoke E2E não quebra)
- [ ] Privacy mode funciona em todas as 4 sub-seções

## Restrições

- Não tocar lógica de cálculo — só extração estrutural
- Memória `feedback_dashboard_test_protocol.md`: Playwright OBRIGATÓRIO antes de push
- Memória `feedback_verificacao_visual.md`: não abrir browser local

## Conclusão

> A preencher após implementação.

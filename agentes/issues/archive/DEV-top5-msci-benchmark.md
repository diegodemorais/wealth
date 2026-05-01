---
ID: DEV-top5-msci-benchmark
Titulo: Top-5 Holdings — benchmark MSCI World
Dono: Dev
Prioridade: 🟢 Baixa
Dependências: —
Origem: pedido de Diego durante DEV-efficient-frontier (2026-05-01)
---

## Contexto

O gráfico **Top-5 Concentrações Totais** (parte do `OverlapChart` v2 em PORTFOLIO) mostra hoje as 5 maiores posições agregadas da carteira (AAPL 2.45%, MSFT 2.16%, NVDA 1.96%, AMZN 1.17%, Samsung 0.94%) sem comparação a benchmark.

O `SectorExposureChart` já tem o padrão certo: marcador amarelo do MSCI World inline + Δ vs benchmark no tooltip. **Replicar esse padrão no Top-5.**

## Tarefas

1. **Backend** (`scripts/generate_data.py`, função que monta `top_concentrations`):
   - Adicionar campo `msci_world_pct` para cada uma das 5 ações (snapshot hardcoded de factsheet recente, mesmo padrão do sector-exposure)
   - Documentar fonte: factsheet MSCI World abr/2026 ou último disponível
   - Para Samsung (005930.KS) — ação coreana, **NÃO** está no MSCI World (apenas ACWI). Decisão Head: marcar `msci_world_pct: null` e tooltip mostra "n/a — fora do MSCI World (coreana)"
   - Para as demais (AAPL/MSFT/NVDA/AMZN) — usar pesos reais do MSCI World

2. **Frontend** (`react-app/src/components/charts/OverlapChart.tsx`, sub-componente do Top-5):
   - Marcador amarelo (mesma cor do sector-exposure) inline na barra mostrando peso MSCI World
   - Tooltip mostra: peso carteira + peso MSCI World + Δ
   - Privacy mode: % são OK
   - Ações não-MSCI: marcador suprimido, tooltip mostra "n/a"

3. **Spec & testes:**
   - Atualizar `react-app/spec.json` se necessário
   - Vitest do componente cobre nova série
   - Playwright semantic mantém passando

4. **Validação:**
   - `./scripts/quick_dashboard_test.sh` end-to-end verde

## Referência de implementação

`SectorExposureChart.tsx` — copiar padrão visual exato (cor, posição do marcador, formato do tooltip).

## Critérios de aceite

- [ ] `data.json.top_concentrations[].msci_world_pct` populado (4 ações com valor + Samsung null)
- [ ] Marcador amarelo visível no Top-5 chart
- [ ] Tooltip mostra Δ vs MSCI World
- [ ] Samsung: marcador suprimido, tooltip "n/a"
- [ ] Privacy mode preservado
- [ ] Suite full verde
- [ ] Changelog atualizado

## Conclusão

> A preencher após implementação.

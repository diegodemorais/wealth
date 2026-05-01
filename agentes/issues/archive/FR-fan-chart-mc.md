# FR-fan-chart-mc: Fan Chart P10/P50/P90 — Visualização de Trajetórias MC

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-fan-chart-mc |
| **Dono** | Dev |
| **Status** | Done |
| **Prioridade** | 🔴 Alta |
| **Participantes** | Dev (implementação), FIRE (spec) |
| **Criado em** | 2026-05-01 |
| **Origem** | HD-projection-lab-audit — gap P1 mais crítico identificado |
| **Concluido em** | 2026-05-01 |

---

## Contexto

O MC de Diego já roda 10.000 trajetórias com t-distribution df=5. O P(FIRE) é exibido como número (84%). O que está faltando é **visualizar as trajetórias** — em especial o fan chart com percentis P10/P25/P50/P75/P90 ao longo do tempo.

O Projection Lab tem isso como feature central. É o gráfico mais citado em reviews externos. O impacto comportamental é alto: mostra onde e quando as trajetórias falham, não apenas "16% falham".

---

## Escopo

### Pipeline (`fire_montecarlo.py`)
- Serializar percentis por ano: P10, P25, P50, P75, P90 do patrimônio
- Adicionar ao `data.json`: `fire_percentiles.years[]`, `fire_percentiles.p10[]`, ..., `fire_percentiles.p90[]`
- Período: 2026 → 2090 (ou até o horizonte do plano)
- Já existem arrays de trajetórias — é questão de calcular percentis por timestep

### Dashboard (React/ECharts)

**Componente:** `FireFanChart` na aba FIRE, seção `fire-number-meta` ou nova seção `section-fan-chart`

**Visualização:**
- ECharts `line` com `areaStyle` para criar bandas
- Bandas: P10–P90 (cinza claro), P25–P75 (cinza médio), P50 (linha sólida)
- Linha vertical: FIRE Day (2040)
- Linha horizontal: patrimônio gatilho (FIRE Number)
- Eixo Y: R$ em milhões, com privacy mode (`privacyMode ? '••M' : 'R$Xm'`)
- Tooltip: mostrar todos os percentis no hover
- Legenda: P10/P25/P50/P75/P90 com cores

**Opcional:**
- Checkbox para filtrar trajetórias que falharam (patrimônio < 0)
- Marcador de quando INSS entra (2049 Diego, 2052 Katia)

---

## Critério de Aceite

- [ ] Pipeline gera `fire_percentiles` em `data.json` com anos e percentis P10-P90
- [ ] Fan chart renderiza no aba FIRE sem erro
- [ ] Privacy mode mascara valores (R$ → ••)
- [ ] Linha vertical no FIRE Day (2040)
- [ ] Linha horizontal no FIRE Number (patrimônio gatilho)
- [ ] `data-testid` em pelo menos `fan-chart-p50` e `fan-chart-fire-day`
- [ ] Assertion em `e2e/semantic-smoke.spec.ts`

---

## Referências

- Projection Lab v4.6.0: "Wealth Projection" tab com fan chart interativo
- Karsten Müller (ERN) — fan chart canônico: https://earlyretirementnow.com/
- Cederburg et al. (2023): usar percentis de trajetórias para comunicar risco
- `agentes/issues/HD-projection-lab-audit.md` § Fan Chart P10/P50/P90

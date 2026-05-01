| Campo | Valor |
|-------|-------|
| ID | DEV-twr-dashboard-display |
| Título | Dashboard — exibir TWR, CAGR, inflação e métricas de performance |
| Dono | Dev |
| Status | 🟡 Em Andamento |
| Prioridade | 🔴 Alta |
| Criada | 2026-04-23 |
| Participantes | Dev (implementação), FIRE (spec), Quant (validação), Factor (benchmark), Behavioral (framing) |
| Origem | Diego pediu acompanhamento de TWR no dashboard |

## Decisões do time (4 agentes opus)

### Métrica principal: CAGR Real BRL (desde início)
- Semáforo: verde ≥ 4.5%, amarelo 3-4.5%, vermelho < 3%
- Nominal como secundário (tooltip)

### Benchmark: VWRA (não SWRD)
- SWRD exclui EM → infla alpha quando AVEM sobe
- Alpha acumulado since-inception (não rolling — Factor + Behavioral concordam)

### Framing (Behavioral)
- SEMPRE since-inception + rolling lado a lado
- Max DD com tempo de recuperação ao lado
- Vermelho reservado para breach real, não volatilidade normal

### Insight FIRE
- Semáforo deveria incorporar gap patrimonial (retorno bom + patrimônio 50% do target ≠ verde)

## Escopo

### Tab NOW — 1 KPI card
- [x] CAGR Real BRL com semáforo (verde/amarelo/vermelho)
- [x] Sub-texto: "X.X% real vs 4.5% premissa · desde abr/2021"

### Tab PERFORMANCE — seção Performance Summary
- [x] Strip 4 KPIs: CAGR Real | CAGR Nominal | Alpha vs VWRA (ITD) | Max DD (com recuperação)
- [x] Tabela anual: 2021-2026 YTD com colunas nominal BRL, real BRL, USD equity, IPCA, CDI
- [ ] Rolling charts já existem (Sharpe, Sortino, Vol)

### Dados (reconstruct_history.py)
- [x] P4, P1, P3 fixes (issue DEV-twr-pipeline-fixes ✅)
- [ ] CAGR rolling 12m no JSON (gap identificado pelo Quant)
- [ ] Tabela retornos anuais no JSON

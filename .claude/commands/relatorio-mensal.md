# Relatório Mensal — Report Consolidado

Gera relatório mensal em markdown, salvo em `analysis/relatorios/YYYY-MM.md`.

## Fontes de dados (coletar em paralelo)

| Fonte | Script / Command | O que fornece |
|-------|-----------------|---------------|
| Posições e patrimônio | `agentes/contexto/carteira.md` | Base para tudo |
| P(FIRE) | `fire_montecarlo.py --n-sim 3000` | Reusar se memória < 7 dias |
| Macro BR | `/macro-bcb` | Selic, IPCA 12m, PTAX, IPCA+ 2040 |
| IBKR sync | `ibkr_sync.py --cambio <PTAX>` | Posições atuais, trades do mês |
| FX decomposição | `fx_utils.py` | Retorno BRL vs USD, eficiência cambial |
| Decisões do mês | `agentes/memoria/00-head.md` | Issues concluídas, decisões |

```bash
# Rodar em paralelo (exceto MC — verificar cache primeiro)
python3 scripts/ibkr_sync.py --cambio 5.15 > /tmp/ibkr.txt 2>&1 &
python3 scripts/fx_utils.py > /tmp/fx.txt 2>&1 &
# MC: verificar agentes/memoria/04-fire.md. Se resultado < 7 dias, reusar.
# Se não: python3 scripts/fire_montecarlo.py --n-sim 3000 > /tmp/mc.txt 2>&1 &
wait
```

Substituir `5.15` pelo PTAX atual (de `/macro-bcb` ou python-bcb).

## Seções do Relatório

### 1. Resumo Executivo
- Patrimônio total BRL (Δ vs mês anterior)
- P(FIRE 53 / FIRE 50) — base / favorável / stress
- Aportes do mês: valor, destino, câmbio
- Status: on track / atenção / alerta

### 2. Performance
**Fonte**: ibkr_sync.py (trades) + carteira.md (preços)
- Retorno mês e YTD por ETF (em USD e BRL)
- Benchmark: vs VWRA e vs SWRD 100%
- Nota: se ibkr_sync indisponível, usar variação de preço carteira.md vs mês anterior

### 3. Câmbio e FX
**Fonte**: fx_utils.py
- PTAX atual vs média 30d / 90d / 12m
- Decomposição do retorno: quanto veio de alpha vs quanto veio de BRL/USD
- Impacto do câmbio no patrimônio total em BRL

### 4. Alocação e Drift
- Pesos atuais vs alvos (SWRD 50% / AVGS 30% / AVEM 20%)
- Drift por ETF (highlight se > 5pp)
- Decisão de aporte: cascade HD-006 (IPCA+? Renda+? Equity?)

### 5. Macro
**Delegar para `/macro-bcb`** — não duplicar aqui. Incluir apenas o headline:
- Selic atual, IPCA 12m, PTAX, IPCA+ 2040
- Status dos gatilhos DCA (piso 6.0% IPCA+, compra Renda+ ≥ 6.5%)

### 6. Issues e Decisões
- Concluídas no mês (de `agentes/issues/README.md`)
- Em andamento: status atual
- Decisões registradas em `agentes/memoria/00-head.md`

### 7. Próximos Passos
- Ações para o mês seguinte (com responsável e prazo)
- Issues candidatas a abrir
- Gatilhos próximos do threshold

## Regras

- Salvar em `analysis/relatorios/YYYY-MM.md`
- Comparar com relatório do mês anterior se existir (`analysis/relatorios/`)
- Dados indisponíveis: marcar "—" e listar como pendência
- Formato consistente entre meses (facilita diff visual)
- Não recalcular MC se resultado em memória < 7 dias — evitar custo desnecessário

# DEV-perf-audit-fixes — 6 Correções Aba Performance

**Dono:** Dev + Quant
**Prioridade:** 🔴 Alta
**Origem:** Auditoria CIO+Quant 2026-04-09

---

## Items

### 1. Fee Analysis vazio (TER=0)
- **Bug:** Nenhum ETF tem TER no data.json → seção vazia
- **Fix:** Adicionar TER por ETF em `config.py` (fonte: justETF). Pipeline injeta em posicoes.
- **TERs:** SWRD 0.12%, AVGS 0.24%, AVEM 0.33%, EIMI 0.18%, AVUV 0.25%, AVDV 0.36%, DGS 0.63%, USSC 0.28%, IWVL 0.30%

### 2. Premissas vs Realizado — base incompatível
- **Bug:** Compara premissa 4.85% real BRL vs realizado 13.46% nominal USD
- **Fix:** Calcular realizado em real BRL (descontar inflação US + câmbio) OU mostrar premissa em nominal USD. Ambos na mesma base.
- **Dados disponíveis:** `retornos_mensais.json` tem `twr_pct` (BRL) e `twr_usd_pct` (USD). Usar CAGR TWR BRL como "realizado real BRL".

### 3. Rolling Sharpe rf constante
- **Bug:** Usa Selic atual (14.75%) para toda a janela 12m. Selic variou de 2% a 14.75% no período.
- **Fix:** Gerar série histórica CDI mensal em `dados/cdi_historico.json` (fonte: BCB série 4391). `reconstruct_history.py` usa CDI real de cada mês no cálculo do Sharpe rolling.
- **Pipeline:** `reconstruct_history.py` → `rolling_metrics.json` com rf variável por mês.

### 4. Shadow C null
- **Bug:** `delta_shadow_c: null` no data.json
- **Fix:** Verificar se Shadow C (100% IPCA+) tem dados no período. Se não aplicável, remover do schema em vez de null. Se aplicável, calcular.

### 5. Attribution é estimativa — NÃO aceitar como v1
- **Bug:** `_estimativa: true`. Decomposição aportes/retorno/câmbio é residual, não TWR.
- **Fix:** Usar `retornos_mensais.json` (já tem decomposição: `equity_usd`, `fx`, `rf_xp`). Calcular attribution real:
  - Retorno equity USD = soma composta de `decomposicao.equity_usd`
  - Efeito câmbio = soma composta de `decomposicao.fx`
  - RF = soma composta de `decomposicao.rf_xp`
  - Aportes = `equity_attribution.total_aportado_usd × cambio`
- Remover flag `_estimativa`.

### 6. Backtest usa proxies US — documentar
- **Info:** ETFs UCITS (LSE) não têm histórico longo. Backtest usa proxies US-listed.
- **Fix:** Adicionar campo `backtest.nota_proxy` no data.json com texto explicativo. Template exibe na seção.

---

## Regras
- Todo dado novo vai em JSON (config.py, dados/, data.json). **Zero hardcoded no template.**
- Quant valida fórmulas antes de merge.
- Dev implementa no pipeline Python. Template só lê DATA.*.

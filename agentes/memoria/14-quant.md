# Memoria: Quant / Auditor Numerico

> Somente erros encontrados, auditorias realizadas e decisoes registradas aqui.

---

## Auditorias Realizadas

| Data | Issue/Contexto | Resultado | Finding |
|------|---------------|-----------|---------|
| 2026-03-23 | Backtest portfolio_backtest.py | Aprovado com 2 findings | IOF amortization timing leve fav. equity (+10-20bps); ACWI proxy subestima SWRD -0.5-0.7pp/aa. Efeitos parcialmente cancelam. IOF 1.1% (IB) correto — nao verificado antes do Tax errar. |
| 2026-04-10 | Rolling Sharpe BRL — reconstruct_history.py | Corrigido | Bug: Selic 14.75% constante para todo o período 2021-2026 superestimava custo de oportunidade. Corrigido com CDI histórico BCB série 4391 (% ao mês). Impacto: Sharpe médio +0.62 (de -0.276 para +0.343 amostral). Janela inicial 2022-04 usava CDI médio 0.576%/mes vs 1.153%/mes constante — diferença de 0.577pp/mes no excess return. Anos 2021-2022 com Selic 2-10%: mais afetados. `rf_brl_series` persistido em rolling_metrics.json. |
| 2026-04-10 | Information Ratio vs VWRA.L — reconstruct_history.py | Implementado | Função `_compute_information_ratio` adicionada. Base USD, benchmark VWRA.L via yfinance auto_adjust=True, active return mensal simples, IR = mean(AR)/std(AR,ddof=1)*sqrt(12). ITD N=60 meses. Rolling 36m N=25 pontos. Resultado ITD: IR=0.0721, TE=15.35%/ano, AR anual=+1.11%. Rolling: início (2024-04) IR=-0.844, fim (2026-04) IR=+0.256 — reversão positiva recente. Persistido em `dados/rolling_metrics.json` campo `information_ratio`. Fallback: yfinance falhou → omite campo sem crash. |

---

## Erros Encontrados

| Data | Agente | Erro | Impacto | Correcao |
|------|--------|------|---------|----------|
| — | — | — | — | — |

---

## Premissas Numericas Validadas

| Premissa | Valor | Fonte | Ultima validacao |
|----------|-------|-------|-----------------|
| — | — | — | — |

---

## Gatilhos e Regras

- Acionamento automatico ANTES/DEPOIS de calculos que geram veredicto
- Veto absoluto sobre numeros: agente DEVE corrigir antes de apresentar a Diego
- Se 2+ agentes divergem em numeros para mesma variavel: reconciliar antes de prosseguir
- Scripts complexos salvos em `analysis/` para reproducibilidade

### Quant e o checkpoint final antes de Diego

**Regra (retro 2026-03-23):** Nenhum numero que gera veredicto chega ao Diego sem assinatura do Quant. Diego ve o output do Quant, nao o rascunho dos agentes. Isso inclui verificar premissas basicas (aliquotas, taxas documentadas) — erros simples em fatos conhecidos (ex: IOF 1.1% para IB) devem ser pegos pelo Quant, nao por Diego.

Quando o Quant nao conseguir auditar (ex: nao acionado), o Head deve sinalizar explicitamente a Diego que o numero nao passou por auditoria.

### Quando acionar (lista obrigatoria — Head garante)

| Situacao | Quem aciona |
|----------|-------------|
| IR sobre ganho nominal/real/cambial | RF, FIRE, Tax |
| Breakeven entre dois ativos | RF, Factor, Advocate |
| Retorno liquido esperado (qualquer ativo) | RF, Factor, FIRE |
| Comparacao all-in equity vs RF | Factor, RF |
| Projecao de patrimonio / Monte Carlo | FIRE |
| Drawdown calculado (%, valor absoluto) | Risco |
| SWR / withdrawal rate | FIRE |
| Qualquer calculo que gera veredicto de decisao | Todos |

**Aprendizado retro 2026-03-22**: Quant foi criado apos os 4 erros do HD-006. O reflexo de acionamento automatico precisa ser construido agora — o Head garante que nenhum calculo que gera veredicto e apresentado a Diego sem passar pelo Quant primeiro.

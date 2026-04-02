# ETF Candidatos — Radar de Monitoramento

> Criado em: 2026-04-02
> Última atualização: 2026-04-02
> Dono: Factor (02) — revisão mensal no scan RR/Bogleheads
> Propósito: ETFs fora da carteira com potencial de inclusão futura

---

## Tabela Resumo

| Ticker | Nome curto | Acc/Dist | Classificação | Semelhante a | Status | Conviction | Próxima Revisão |
|--------|-----------|----------|---------------|-------------|--------|------------|-----------------|
| — | Vanguard Global Small-Cap UCITS | Acc | Passivo MCW | AVGS | ⏳ Aguardando lançamento | Baixa | Mai/2026 |
| FLXE | Franklin LibertyQ EM Multi-Factor | Acc | Smart Beta | AVEM | 🔍 Em avaliação | Baixa | Out/2026 |
| ACSW | iShares MSCI World Swap | Acc | Sintético (swap) | SWRD | 🆕 Lançado mar/2026 | Média | Mar/2027 |
| AVWC | Avantis All-World UCITS | Acc | Factor Active | AVGS+AVEM | 🔍 Dados insuficientes | Baixa | Abr/2027 |
| — | Vanguard FTSE All-World All-Cap UCITS | Acc | Passivo MCW | SWRD+AVGS+AVEM | ⏳ Aguardando lançamento | Baixa | Mai/2026 |
| XDEM | iShares MSCI World Multifactor UCITS | Acc | Smart Beta | JPGL | 🔍 Em avaliação | Baixa | Out/2026 |
| JPGL | JPMorgan Global Equity Multi-Factor UCITS | Acc | Factor Active | — (ex-carteira) | 👁️ Reentrada condicional | Baixa | Out/2026 |
| DDGC/DEGC | Dimensional Global Core Equity UCITS | Acc | Factor Active | AVGS+AVEM | 🆕 Lançado nov/2025 | Média | Nov/2026 |
| AVWS | Avantis Global Small Cap Value UCITS | Acc | Factor Active | AVGS | 🆕 Verificar vs AVGS | Baixa | Jun/2026 |

**Status legend:** ⏳ Aguardando lançamento · 🆕 Novo, aguardando dados · 🔍 Em avaliação · 👁️ Reentrada condicional · ✅ Promovido · ❌ Descartado

**Conviction:** Alta (gatilho próximo) · Média (hipótese plausível) · Baixa (monitoramento passivo)

**Classificação:** Passivo MCW (índice puro, sem tilt) · Smart Beta (regras explícitas, semi-passivo) · Factor Active (gestão ativa fatorial) · Sintético/Swap

---

## Fichas Detalhadas

---

### 1. Vanguard FTSE Global Small-Cap UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | — (não lançado) |
| **ISIN** | — (pendente) |
| **Nome completo** | Vanguard FTSE Global Small-Cap UCITS ETF |
| **Índice** | FTSE Global Small-Cap |
| **Distribuição** | Acc (esperado) |
| **Domicílio** | Irlanda (registrado fev/2026) |
| **TER** | ~0.10-0.15% estimado (não confirmado) |
| **Data de lançamento** | Não lançado |
| **AUM** | — |
| **Disponível IBKR** | — |
| **Última atualização dos dados** | 2026-04-02 |
| **Semelhante a** | AVGS |
| **Tese** | Primeira opção passiva de small-cap global UCITS com TER potencialmente abaixo de AVGS (0.23%). Sem tilt value/profitability — não substitui AVGS, mas pode complementar reduzindo custo médio da camada small. |
| **Diferença crítica vs AVGS** | AVGS tem tilt value+profitability ativo. Vanguard seria small puro, sem factor premium deliberado. Alpha esperado AVGS: +0.5-1.0% líquido. |
| **Motivo de monitorar** | TER inferior pode justificar parte do bloco small-cap como exposição de baixo custo |
| **Gatilho para considerar** | TER confirmado ≤ 0.15% **E** Acc **E** IBKR disponível com plano recorrente **E** factor loadings publicados (6+ meses) |
| **Como descobrimos** | Bogleheads scan 2026-04-02 + ETF Stream (registro Irlanda fev/2026) |
| **Como monitorar** | justETF · ETF Stream · Bogleheads thread 31781 |
| **Frequência** | Mensal (verificar se lançou) |
| **Quem monitora** | Factor (02) |
| **Classificação** | Passivo MCW — FTSE index sem tilt deliberado |
| **Fatores** | — (sem exposição fatorial) |
| **Tracking Diff.** | A verificar — aguardar lançamento |
| **Sharpe Ratio 3y** | A verificar — aguardar lançamento |
| **Volatilidade 3y** | A verificar — aguardar lançamento |
| **Beta vs MSCI World Small-Cap** | ~1.0 (passivo) |
| **Issue relacionada** | FI-vanguard-smallcap-ucits |

---

### 2. FLXE — Franklin LibertyQ Emerging Markets Multi-Factor UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | FLXE (Xetra/LSE/Borsa Italiana) |
| **ISIN** | IE00BF2B0K52 |
| **Nome completo** | Franklin LibertyQ Emerging Markets UCITS ETF |
| **Índice** | LibertyQ Emerging Markets Equity (Franklin proprietário — multi-factor rules-based) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | 0.30% |
| **Data de lançamento** | ~2018 (verificar) |
| **AUM** | €63M — ⚠️ pequeno (risco de fechamento se não escalar) |
| **Disponível IBKR** | Sim (listado em Xetra) |
| **Última atualização dos dados** | 2026-04-02 (WebSearch — justETF, Bloomberg) |
| **Semelhante a** | AVEM (EM com tilt), XDEM (multi-factor regras) |
| **Tese** | Não é ETF passivo — é Smart Beta com seleção rules-based no universo EM por: quality (ROE, ROA, debt/equity), value (P/B, P/CF), momentum (12m-1m) e low volatility (vol realizada). Mencionado no RR thread 31258 como potencialmente tendo factor loadings EM superiores a AVEM. Diferença metodológica: AVEM tem tilt value+profitability (HML+RMW) ativo. FLXE tem quality+value+momentum+low vol via regras fixas. Complementar, não substituto. |
| **Diferença crítica vs AVEM** | AVEM = gestão ativa Avantis (HML + RMW). FLXE = smart beta LibertyQ (quality + value + momentum + low vol). FLXE tem momentum (AVEM não enfatiza) mas AVEM tem convicção maior em value puro. TER similar (0.30% vs 0.23%). AUM de FLXE muito menor (€63M vs AVEM). |
| **⚠️ Risco de liquidação** | AUM de €63M é baixo para ETF UCITS. Franklin pode encerrar se não captar escala. Monitorar AUM mensalmente. Se cair abaixo de €30M → mover para Descartados. |
| **Motivo de monitorar** | Smart beta com exposição fatorial multi-dimensional em EM. Potencialmente complementar ao AVEM. Baixo custo relativo. |
| **Gatilho para considerar** | AUM > €150M (viabilidade) **E** factor loadings HML + RMW + MOM documentados (Ken French EM) por 12 meses **E** TD all-in < AVEM por período igual |
| **Como descobrimos** | RR thread 31258 (scan 2026-03-26) — menção de factor loading FLXE > AVEM hipótese |
| **Como monitorar** | justETF para AUM e TD · Ken French EM factors para loadings empíricos · RR thread 31258 |
| **Frequência** | Semestral (prioridade: verificar AUM) |
| **Quem monitora** | Factor (02) |
| **Classificação** | Smart Beta — LibertyQ multi-factor (rules-based, semi-passivo) |
| **Fatores** | Quality (ROE, ROA) · Value (P/B, P/CF) · Momentum (12m) · Low Volatility — universo EM |
| **Tracking Diff.** | A verificar (justETF) |
| **Sharpe Ratio 3y** | A verificar (Ken French EM ou justETF) |
| **Volatilidade 3y** | A verificar vs MSCI EM |
| **Beta vs MSCI EM** | ~0.85-0.95 (estimado — low vol tilt reduz beta) |
| **Issue relacionada** | — |

---

### 3. ACSW — iShares MSCI World Swap UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | ACSW |
| **ISIN** | IE000Y7K9659 (verificar) |
| **Nome completo** | iShares MSCI World Swap UCITS ETF |
| **Índice** | MSCI World (sintético — swap) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | ~0.10% (verificar — não confirmado) |
| **Data de lançamento** | Março 2026 |
| **AUM** | — (novo) |
| **Disponível IBKR** | A confirmar |
| **Última atualização dos dados** | 2026-03-26 (RR scan) |
| **Semelhante a** | SWRD (mesmo índice) |
| **Tese** | ETFs sintéticos (swap) reinvestem dividendos sem WHT no nível do swap. Para MSCI World: vantagem ~8-12bps/ano vs físico (menor que os 15-25bps do S&P 500 puro — componente EUA já isento de WHT via Irlanda; ganho concentrado em ex-US ~35% do índice). Se confirmar TD < SWRD com margem ≥ 0.08%, seria troca de qualidade no bloco MCW. |
| **Diferença crítica vs SWRD** | Counterparty risk do swap (mitigado por colateral ISDA 100% marcado a mercado diariamente — risco residual baixo mas não zero para horizonte 14 anos). SWRD físico = sem esse risco. |
| **Motivo de monitorar** | Estrutura swap entrega vantagem estrutural vs físico em MSCI World. Potencial substituição de SWRD após 12 meses de TD histórico. |
| **Gatilho para considerar** | TD rolling 12m ACSW < TD SWRD com margem ≥ 0.08% **E** AUM > $1B **E** spread bid-ask < 3bps |
| **Como descobrimos** | RR scan 2026-03-26, thread 31781 (UCITS MCW) |
| **Como monitorar** | justETF para TD histórico · Thread 31781 RR para glimz/afstand commentary |
| **Frequência** | Revisão em mar/2027 (12 meses pós-lançamento) |
| **Quem monitora** | Factor (02) |
| **Classificação** | Sintético (swap) — MCW sem tilt |
| **Fatores** | — (sem exposição fatorial; vantagem vem da estrutura, não de factor premium) |
| **Vantagem estrutural** | +8-12bps/ano vs SWRD físico (estimado para MSCI World; +25bps no S&P 500 puro) |
| **Tracking Diff.** | Esperado negativo vs benchmark (melhor que o índice) — confirmar após 12 meses |
| **Sharpe Ratio 3y** | ~igual ao SWRD (mesmo índice) — diferença vem do TD |
| **Volatilidade 3y** | ~igual ao SWRD |
| **Beta vs MSCI World** | ~1.0 (replica o índice) |
| **Issue relacionada** | — |

---

### 4. AVWC — Avantis All-World UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | AVWC |
| **ISIN** | IE000QCKBCT8 (verificar) |
| **Nome completo** | Avantis All-World UCITS ETF |
| **Índice** | Ativo (Avantis — all-cap global, value + profitability) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | ~0.23% |
| **Data de lançamento** | 2024 |
| **AUM** | — |
| **Disponível IBKR** | A confirmar |
| **Última atualização dos dados** | 2026-03-26 (RR scan thread 31258) |
| **Semelhante a** | AVGS + AVEM em um único ETF (all-cap, global) |
| **Tese** | ETF all-cap global com tilt value+profitability Avantis em um único ticker. Simplificaria a estrutura AVGS+AVEM para um único instrumento. Mencionado como "ligeiramente menos inclinado que DDGC mas mais líquido". |
| **Diferença crítica vs AVGS+AVEM** | Menos granular — perde capacidade de ajustar pesos EM/DM separadamente. Para Diego com 30% AVGS + 20% AVEM, AVWC a 50% seria equivalente mas sem controle de rebalanceamento DM/EM. Em mercados como 2026 (EM +14.83%), perder o controle separado tem custo real. |
| **Motivo de monitorar** | Potencial simplificação pós-FIRE quando controle granular importa menos. Relevante se Diego quiser reduzir tickers. |
| **Gatilho para considerar** | Decisão de simplificação da carteira **E** Factor loadings AVWC ≥ média ponderada (AVGS×0.6 + AVEM×0.4) por 12 meses |
| **Como descobrimos** | RR scan 2026-03-26, thread 31258 (debate AVWC vs DDGC) |
| **Como monitorar** | justETF · RR thread 31258 · Revisão anual |
| **Frequência** | Anual |
| **Quem monitora** | Factor (02) |
| **Classificação** | Factor Active (Avantis) |
| **Fatores** | Value (HML) · Profitability (RMW) — all-cap global (DM + EM) |
| **Tracking Diff.** | A verificar (justETF) |
| **Sharpe Ratio 3y** | A verificar |
| **Volatilidade 3y** | A verificar vs MSCI ACWI |
| **Beta vs MSCI ACWI** | ~1.0-1.05 (small-cap tilt leve eleva beta) |
| **Issue relacionada** | — |

---

### 5. Vanguard FTSE All-World All-Cap UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | — (não lançado) |
| **ISIN** | — (pendente) |
| **Nome completo** | Vanguard FTSE All-World All-Cap UCITS ETF |
| **Índice** | FTSE Global All-Cap (large + mid + small, mercados desenvolvidos + emergentes) |
| **Distribuição** | Acc (esperado) |
| **Domicílio** | Irlanda (registrado fev/2026) |
| **TER** | ~0.12-0.18% estimado |
| **Data de lançamento** | Não lançado |
| **AUM** | — |
| **Disponível IBKR** | — |
| **Última atualização dos dados** | 2026-04-02 (Bogleheads scan) |
| **Semelhante a** | SWRD (large/mid DM) + AVEM (EM) + AVGS (small) em um único ticker |
| **Tese** | Um ETF de mercado total global — large+mid+small, DM+EM — com TER Vanguard (~0.12-0.18%). Seria o equivalente a VWRA/VWCE mas com all-cap. Se lançar, oferece cobertura completa num único instrumento de baixo custo. |
| **Diferença crítica vs carteira** | Puramente passivo MCW — zero tilt fatorial. Diego tem tilt deliberado (AVGS 30% + AVEM 20%). Não substitui a estratégia fatorial, mas poderia ser alternativa para a camada MCW base (substituindo SWRD) com maior cobertura de small + EM a custo único. |
| **Motivo de monitorar** | Potencial simplificação extrema pós-FIRE (SWRD → Vanguard All-Cap). Mais relevante quando controle granular importa menos. |
| **Gatilho para considerar** | TER confirmado ≤ 0.15% **E** Acc **E** IBKR com plano recorrente **E** AUM > $500M após 12 meses |
| **Como descobrimos** | Bogleheads scan 2026-04-02 (thread "Vanguard fulfill Bogle's Vision" + ETF Stream) |
| **Como monitorar** | justETF · ETF Stream · Bogleheads thread 31781 |
| **Frequência** | Mensal (verificar se lançou) |
| **Quem monitora** | Factor (02) |
| **Classificação** | Passivo MCW — FTSE All-Cap index, sem tilt deliberado |
| **Fatores** | — (sem exposição fatorial) |
| **Tracking Diff.** | A verificar — aguardar lançamento |
| **Sharpe Ratio 3y** | A verificar — aguardar lançamento |
| **Volatilidade 3y** | A verificar |
| **Beta vs MSCI ACWI** | ~1.0 (passivo) |
| **Issue relacionada** | — |

---

### 6. XDEM — iShares Edge MSCI World Multifactor UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | XDEM |
| **ISIN** | IE00BZ0PKT83 |
| **Nome completo** | iShares Edge MSCI World Multifactor UCITS ETF |
| **Índice** | MSCI World Diversified Multiple-Factor (value, quality, momentum, low size) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | 0.35% |
| **Data de lançamento** | 2015 |
| **AUM** | ~$1.5B |
| **Disponível IBKR** | Sim |
| **Última atualização dos dados** | 2026-03-26 (RR scan, contexto JPGL comparação) |
| **Semelhante a** | JPGL (mesmo espaço multifator world UCITS) |
| **Tese** | Smart beta multifator world: value + quality + momentum + low size via MSCI. Alternativa passiva ao JPGL no espaço multifator. TER 0.35% vs JPGL 0.19%. AUM maior ($1.5B) = mais liquidez e menor risco de fechamento. 10 anos de track record permite análise empírica real. |
| **Diferença crítica vs JPGL** | JPGL usa momentum como negative screen (inverted momentum dentro de value/quality) — metodologia exclusiva. XDEM é multifactor tradicional (long momentum, long value, etc). Backtests históricos mostram JPGL superior mas XDEM tem mais transparência metodológica. TER de XDEM (0.35%) é maior que JPGL (0.19%). |
| **Motivo de monitorar** | Alternativa se JPGL fechar ou deteriorar. Benchmarking — se XDEM outperforma JPGL por 24 meses + TER similar, abre debate de reentrada via XDEM. |
| **Gatilho para considerar** | XDEM outperforma JPGL por 24 meses consecutivos em rolling return **OU** JPGL fecha/reduz AUM < €100M **OU** debate formal de reentrada multifator na carteira |
| **Como descobrimos** | RR scans históricos (comparação no espaço UCITS multifactor world, thread 31258) |
| **Como monitorar** | justETF para TD e performance relativa · RR thread 31258 · AQR Factor Returns para loadings |
| **Frequência** | Semestral |
| **Quem monitora** | Factor (02) |
| **Classificação** | Smart Beta — MSCI Diversified Multiple-Factor (rules-based, índice público) |
| **Fatores** | Value · Quality · Momentum · Low Size — DM desenvolvidos |
| **Tracking Diff.** | A verificar (justETF — 10 anos de dados disponíveis) |
| **Sharpe Ratio 3y** | A verificar (justETF — dado disponível) |
| **Volatilidade 3y** | A verificar vs MSCI World |
| **Beta vs MSCI World** | ~0.85-0.90 (low size + quality reduzem beta vs mercado) |
| **Issue relacionada** | — |

---

### 7. JPGL — JPMorgan Global Equity Multi-Factor UCITS ETF (Reentrada Condicional)

| Campo | Detalhe |
|-------|---------|
| **Ticker** | JPGL |
| **ISIN** | IE00BD3QJR55 |
| **Nome completo** | JPMorgan Global Equity Multi-Factor UCITS ETF |
| **Índice** | Ativo (JPMorgan — value, quality, momentum negative screen, low vol) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | 0.19% (corte de 0.45% em 2026-03-23) |
| **Data de lançamento** | 2017 |
| **AUM** | €245M (2026-03-26) |
| **Disponível IBKR** | Sim |
| **Última atualização dos dados** | 2026-04-01 (FI-jpgl-zerobased — conclusão) |
| **Semelhante a** | Ex-carteira (era 20% → zerado) |
| **Status especial** | **Eliminado da carteira em 2026-04-01 (FI-jpgl-zerobased). Não recomprar sem gatilho explícito.** |
| **Tese original** | Multifactor UCITS com momentum negative screen (metodologia exclusiva JPMorgan). Correlação 0.95 com combinação SWRD+AVGS — sobreposição excessiva. AVGS dominou em análise zero-based. |
| **Motivo de monitorar** | TER foi cortado para 0.19% (mesmo nível que AVGS) após remoção. Se correlação cair e alpha melhorar, pode ser reconsiderado. Útil como benchmark para AVGS. |
| **Gatilho para reentrada** | Correlação rolling 3 anos JPGL vs (SWRD+AVGS) cair para < 0.85 **E** alpha líquido > 0.5% por 24 meses **E** issue formal aprovada por Diego |
| **Como descobrimos** | Era 15-20% da carteira. Eliminado após análise zero-based (FI-jpgl-zerobased, 2026-04-01). |
| **Como monitorar** | justETF para performance e AUM · AQR/Ken French para factor loadings · Comparar com AVGS semestralmente |
| **Frequência** | Semestral |
| **Quem monitora** | Factor (02) |
| **Classificação** | Factor Active (JPMorgan) — metodologia proprietária |
| **Fatores** | Value · Quality · Momentum (negative screen) · Low Volatility — DM global |
| **Correlação vs SWRD+AVGS** | 0.95 (razão da remoção) — monitorar se cai abaixo de 0.85 |
| **Tracking Diff.** | A verificar (justETF — dados disponíveis 2017-2026) |
| **Sharpe Ratio 3y** | A verificar |
| **Volatilidade 3y** | A verificar vs MSCI World |
| **Beta vs MSCI World** | ~0.90-0.95 |
| **Issue relacionada** | FI-jpgl-zerobased (histórico), FI-jpgl-redundancia (histórico) |

---

### 8. DDGC / DEGC — Dimensional Global Core Equity UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | DDGC (LSE) / DEGC (Xetra) |
| **ISIN** | IE000BYXM682 (verificar) |
| **Nome completo** | Dimensional Global Core Equity UCITS ETF |
| **Índice** | Ativo (Dimensional — broad market com tilt deliberado para value, profitability, small) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | 0.26% |
| **Data de lançamento** | Novembro 2025 |
| **AUM** | ~$1B+ (zero → $1B em 4 meses — captação institucional excepcional) |
| **Disponível IBKR** | A confirmar |
| **Última atualização dos dados** | 2026-04-02 (RR scan + FI-003 análise) |
| **Semelhante a** | AVGS + AVEM (all-cap global, DM + EM) |
| **Tese** | DFA é o criador da abordagem fatorial moderna — Fama, French, Harvey estão no advisory board. Eduardo Repetto foi co-CEO da DFA antes de fundar a Avantis. DDGC é o primeiro ETF UCITS da DFA com filosofia "Global Core Equity": cobertura ampla com tilt suave em value, profitability e small. "Core" = menos concentrado que AVGS (pure small-cap value) — mais diversificado mas com menor expected alpha. $1B em 4 meses sinaliza demanda institucional real. |
| **Diferença crítica vs AVGS+AVEM** | AVGS = pure small-cap value (HML + RMW agressivo). DDGC = "core" = tilt mais suave, cobertura mais ampla incluindo large caps. Expected alpha de DDGC < AVGS, mas tracking error também menor. Para Diego que já tem SWRD (MCW puro), DDGC ficaria num espaço intermediário entre SWRD e AVGS. |
| **Motivo de monitorar** | DFA entrando no espaço UCITS com $1B em 4 meses é evento raro. Factor loadings reais pós-12 meses podem mostrar se DDGC complementa ou duplica AVGS. |
| **Gatilho para considerar** | Factor loadings HML + RMW de DDGC **distintos** de AVGS por 12 meses **E** TER + TD all-in < custo médio ponderado AVGS+AVEM **E** issue formal aprovada |
| **Como descobrimos** | FI-003 análise AVGC vs JPGL (2026-03-26) — DDGC citado como "terceira opção" no espaço multifator UCITS |
| **Como monitorar** | justETF · RR thread 31258 (debate AVWC vs DDGC vs AVGS) · AQR Factor Returns quando disponível |
| **Frequência** | Revisão em nov/2026 (12 meses pós-lançamento) |
| **Quem monitora** | Factor (02) |
| **Classificação** | Factor Active (Dimensional "core") |
| **Fatores** | Value (suave) · Profitability (suave) · Small (suave) — DM + EM all-cap |
| **Tracking Diff.** | A verificar (poucos dados — nov/2025) |
| **Sharpe Ratio 3y** | Insuficiente — aguardar nov/2026 (12 meses) |
| **Volatilidade 3y** | Insuficiente — aguardar nov/2026 |
| **Beta vs MSCI ACWI** | ~1.0 (core = broad market com tilt suave) |
| **Issue relacionada** | FI-003 (histórico) |

---

### 9. AVWS — Avantis Global Small Cap Value UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | AVWS (Xetra/LSE) |
| **ISIN** | IE0003R87OG3 |
| **Nome completo** | Avantis Global Small Cap Value UCITS ETF USD Acc |
| **Índice** | Ativo (Avantis — small cap desenvolvidos, value + profitability) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | 0.39% (Morningstar/justETF) — **verificar vs 0.23% do AVGS na carteira** |
| **Data de lançamento** | Setembro 2024 |
| **AUM** | €696M (2026-04-02) |
| **Disponível IBKR** | A confirmar |
| **Última atualização dos dados** | 2026-04-02 (WebSearch — justETF, Morningstar) |
| **Semelhante a** | AVGS (pode ser o mesmo fundo) |
| **⚠️ Alerta crítico** | **AVWS pode ser o mesmo fundo que nosso AVGS, com ticker diferente em bolsa diferente (Xetra vs LSE).** Verificar ISIN do AVGS que está na carteira — se for IE0003R87OG3, são o mesmo produto. |
| **Tese** | Se for fundo distinto de AVGS: small-cap value desenvolvidos apenas (sem EM, sem all-global). Complementaria AVGS + AVEM com foco em small-cap DM exclusivo. |
| **Diferença crítica vs AVGS** | Se diferente: AVGS = global (DM + EM small-cap value). AVWS = DM apenas. TER 0.39% vs AVGS 0.23% — se TERs diferentes, são fundos distintos. |
| **Motivo de monitorar** | Verificar relação com AVGS antes de qualquer análise. Se for o mesmo fundo, remover do radar. |
| **Gatilho para considerar** | **Primeiro: confirmar que AVWS ≠ AVGS.** Se distintos e TER AVWS < AVGS: avaliar loadings. |
| **Como descobrimos** | FI-radar-etfs-review (2026-04-02) — Advocate identificou potencial gap |
| **Como monitorar** | justETF (verificar ISIN do AVGS da carteira) · IBKR para listar ambos |
| **Frequência** | Verificação pontual — Bookkeeper verificar ISIN na conta IBKR |
| **Quem monitora** | Factor (02) + Bookkeeper (verificar ISIN do AVGS na conta IBKR) |
| **Classificação** | Factor Active (Avantis) — se fundo distinto |
| **Fatores** | Value (HML) · Profitability (RMW) · Small (SMB) — desenvolvidos (DM) |
| **Tracking Diff.** | A verificar |
| **Sharpe Ratio 3y** | A verificar (Set/2024 = 18 meses de dados disponíveis) |
| **Volatilidade 3y** | A verificar |
| **Beta vs MSCI World Small-Cap** | ~1.0-1.1 (value small eleva beta suavemente) |
| **Issue relacionada** | FI-radar-etfs-review |

---

## Descartados

> ETFs que foram avaliados e rejeitados. Manter como registro para evitar reavaliação desnecessária.

| Ticker | Nome | Data | Motivo do descarte |
|--------|------|------|--------------------|
| AVGC | Avantis Global Equity UCITS | 2026-03-26 | Closet indexing — factor loadings insuficientes vs AVGS. AVGS domina (RR thread 31258 + FI-003) |
| AVEU | Avantis European Equity UCITS | 2026-04-02 | AVGS já cobre Europa com mesmo tilt. Sem tese regional que justifique sobrepeso |
| AVPE | Avantis Pacific Equity UCITS | 2026-04-02 | AVGS já inclui Pacífico/Japão. Redundante sem convicção regional específica |
| AVUS | Avantis US Equity UCITS | 2026-04-02 | SWRD+AVGS já cobrem US (sobreposição tripla). Sem gap a preencher |

---

## Como Usar

**Adicionar candidato:** mencionado positivamente por glimz/afstand/Ben_Felix no RR ou Bogleheads por usuário estabelecido, OU novo produto da família Avantis/Dimensional UCITS, OU TER potencialmente inferior a equivalente na carteira.

**Promover para carteira:** abrir issue formal (FI-...) → debate multi-agente → aprovação Diego → atualizar carteira.md.

**Arquivar:** após 24 meses sem gatilho ativado e sem dados novos relevantes → mover para Descartados com motivo.

**Atualizar dados:** a cada scan RR/Bogleheads, atualizar o campo "Última atualização dos dados" e qualquer dado novo nas fichas (especialmente AUM do FLXE e Indicadores de performance).

**Indicadores — como preencher:** Tracking Difference via justETF (aba "Risk/Tracking" na ficha do ETF). Sharpe e Volatilidade via justETF ou Morningstar (tab "Performance"). Factor loadings via Ken French Data Library (EM/DM) ou AQR Factor Returns.

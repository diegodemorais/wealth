# ETF Candidatos — Radar de Monitoramento

> Criado em: 2026-04-02
> Última atualização: 2026-04-02
> Dono: Factor (02) — revisão mensal no scan RR/Bogleheads
> Propósito: ETFs fora da carteira com potencial de inclusão futura

---

## Tabela Resumo

| Ticker | Nome curto | Acc/Dist | Semelhante a | Status | Conviction | Próxima Revisão |
|--------|-----------|----------|-------------|--------|------------|-----------------|
| — | Vanguard Global Small-Cap UCITS | Acc | AVGS | ⏳ Aguardando lançamento | Média | Mai/2026 |
| FLXE | Franklin FTSE EM | Acc | AVEM | 🔍 Dados insuficientes | Baixa | Out/2026 |
| AVEU | Avantis European Equity UCITS | Acc | AVGS (Europa) | 🆕 Lançado fev/2026 | Baixa | Fev/2027 |
| AVPE | Avantis Pacific Equity UCITS | Acc | AVGS (Pacífico) | 🆕 Lançado fev/2026 | Baixa | Fev/2027 |
| AVUS | Avantis US Equity UCITS | Acc | AVGS (EUA) | 🆕 Lançado fev/2026 | Baixa | Fev/2027 |
| ACSW | iShares MSCI World Swap | Acc | SWRD | 🆕 Lançado mar/2026 | Média | Mar/2027 |
| AVWC | Avantis All-World UCITS | Acc | AVGS (all-cap) | 🔍 Dados insuficientes | Média | Out/2026 |

**Status legend:** ⏳ Aguardando lançamento · 🆕 Novo, aguardando dados · 🔍 Em avaliação · ✅ Promovido · ❌ Descartado

**Conviction:** Alta (gatilho próximo) · Média (hipótese plausível) · Baixa (monitoramento passivo)

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
| **Issue relacionada** | FI-vanguard-smallcap-ucits |

---

### 2. FLXE — Franklin FTSE Emerging Markets UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | FLXE |
| **ISIN** | IE00BHZRR732 |
| **Nome completo** | Franklin FTSE Emerging Markets UCITS ETF |
| **Índice** | FTSE Emerging Markets (passivo) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | 0.19% (vs AVEM 0.23%) |
| **Data de lançamento** | 2017 |
| **AUM** | ~$400M |
| **Disponível IBKR** | Sim |
| **Última atualização dos dados** | 2026-03-26 (RR scan) |
| **Semelhante a** | AVEM |
| **Tese** | TER 4bps menor que AVEM. Mencionado no RR como tendo potencialmente factor loading value/quality > AVEM — hipótese não verificada. Se confirmado, seria candidato a substituir AVEM com custo menor e loadings similares. |
| **Diferença crítica vs AVEM** | AVEM tem tilt deliberado (ativo, Avantis). FLXE é passivo FTSE — se tiver loadings equivalentes, seria por exposição ao índice, não por design. Hipótese improvável mas merece verificação. |
| **Motivo de monitorar** | Menção no RR thread 31258 de que FLXE pode ter EM factor loading > AVEM. Requer verificação empírica. |
| **Gatilho para considerar** | Factor loading HML de FLXE ≥ AVEM por 12 meses (dados Ken French/AQR) **E** TD rolling < AVEM |
| **Como descobrimos** | RR scan 2026-03-26, thread 31258 |
| **Como monitorar** | Ken French Data Library · AQR Factor Returns · justETF para TD |
| **Frequência** | Semestral |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

### 3. AVEU — Avantis European Equity UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | AVEU |
| **ISIN** | IE000MVKN867 (verificar) |
| **Nome completo** | Avantis European Equity UCITS ETF |
| **Índice** | Ativo (Avantis — value + profitability) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | ~0.25% (estimado) |
| **Data de lançamento** | Fevereiro 2026 |
| **AUM** | Seed ~$250M+ (lote inicial Avantis Canada, mesmo batch) |
| **Disponível IBKR** | A confirmar |
| **Última atualização dos dados** | 2026-04-02 (RR Ep. 401) |
| **Semelhante a** | AVGS (componente Europa) |
| **Tese** | Mesma metodologia Avantis value+profitability, mas apenas Europa. Permite sobrepeso regional se Diego quiser divergir do MCW global. Eduardo Repetto confirmou: metodologia idêntica à US, sem double-layer WHT. |
| **Diferença crítica vs AVGS** | AVGS já tem Europa. AVEU seria sobreposição a menos que exista convicção em value europeu específico (spread Europa vs EUA está elevado). |
| **Motivo de monitorar** | Nova família Avantis UCITS — confirmar factor loadings reais e TD após 12 meses |
| **Gatilho para considerar** | 12 meses de dados + factor loadings HML/RMW ≥ AVGS **E** IBKR disponível **E** motivação explícita para tilt regional Europa |
| **Como descobrimos** | RR Ep. 401 (Eduardo Repetto, 2026-04-02) |
| **Como monitorar** | justETF · RR forum (thread nova Avantis UCITS se abrir) |
| **Frequência** | Revisão única em fev/2027 (12 meses pós-lançamento) |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

### 4. AVPE — Avantis Pacific Equity UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | AVPE |
| **ISIN** | A confirmar |
| **Nome completo** | Avantis Pacific Equity UCITS ETF |
| **Índice** | Ativo (Avantis — value + profitability) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | ~0.25% (estimado) |
| **Data de lançamento** | Fevereiro 2026 |
| **AUM** | — |
| **Disponível IBKR** | A confirmar |
| **Última atualização dos dados** | 2026-04-02 |
| **Semelhante a** | AVGS (componente Japão/Pacífico) |
| **Tese** | Japão tem value spread historicamente alto e mercado grande para value investing. Avantis com tilt value+profitability no Pacífico pode ter alpha maior que o componente Pacífico do AVGS. Baixa prioridade vs AVEU. |
| **Diferença crítica vs AVGS** | Mesmo argumento do AVEU — AVGS já inclui Pacífico. Redundante sem convicção regional específica. |
| **Motivo de monitorar** | Completude da família Avantis UCITS. Dados reais pós-12 meses. |
| **Gatilho para considerar** | Mesmo critério AVEU. Prioridade: AVEU > AVPE. |
| **Como descobrimos** | RR Ep. 401 (mesmo lote AVEU, fev/2026) |
| **Como monitorar** | justETF · Junto com AVEU na revisão fev/2027 |
| **Frequência** | Revisão única em fev/2027 |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

### 5. AVUS — Avantis US Equity UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | AVUS |
| **ISIN** | A confirmar |
| **Nome completo** | Avantis US Equity UCITS ETF |
| **Índice** | Ativo (Avantis — value + profitability, mercado US) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | ~0.25% (estimado) |
| **Data de lançamento** | Fevereiro 2026 |
| **AUM** | — |
| **Disponível IBKR** | A confirmar |
| **Última atualização dos dados** | 2026-04-02 |
| **Semelhante a** | Componente US do SWRD/AVGS |
| **Tese** | Avantis value+profitability apenas em ações US. Interessante se Diego quiser sobrepeso em value US sem alterar o bloco SWRD (MCW). Menor uso provável dado que SWRD já tem 65%+ US e o tilt já existe via AVGS. |
| **Diferença crítica** | Mais granular que AVGS. Sem propósito claro na estrutura atual (SWRD cobre US MCW + AVGS já tilt global). |
| **Motivo de monitorar** | Parte da família Avantis UCITS expandida. Avaliar loadings reais vs AVGS para componente US. |
| **Gatilho para considerar** | Factor loadings AVUS > componente US implícito de AVGS por 12 meses **E** motivação explícita para tilt US separado |
| **Como descobrimos** | RR Ep. 401 (mesmo lote AVEU/AVPE, fev/2026) |
| **Como monitorar** | justETF · Revisão conjunta com AVEU/AVPE |
| **Frequência** | Revisão única em fev/2027 |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

### 6. ACSW — iShares MSCI World Swap UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | ACSW |
| **ISIN** | IE000Y7K9659 (verificar) |
| **Nome completo** | iShares MSCI World Swap UCITS ETF |
| **Índice** | MSCI World (sintético — swap) |
| **Distribuição** | Acc |
| **Domicílio** | Irlanda |
| **TER** | ~0.10% (verificar) |
| **Data de lançamento** | Março 2026 |
| **AUM** | — (novo) |
| **Disponível IBKR** | A confirmar |
| **Última atualização dos dados** | 2026-03-26 (RR scan) |
| **Semelhante a** | SWRD (mesmo índice) |
| **Tese** | ETFs sintéticos (swap) têm TD tipicamente negativo vs índice por eficiência fiscal: dividendos reinvestidos sem WHT no nível do swap (~15-25bps de vantagem vs físico). Se confirmar TD < SWRD com margem ≥ 0.10%, seria troca de qualidade no bloco MCW. |
| **Diferença crítica vs SWRD** | Counterparty risk do swap (mitigado por colateral ISDA, mas estruturalmente diferente). SWRD físico = sem esse risco. Para horizonte de 14 anos, counterparty risk é baixo mas não zero. |
| **Motivo de monitorar** | Estrutura swap historicamente entrega +15-25bps vs físico em MSCI World (documentado no RR thread 31781 para swap S&P 500). Potencial substituição de SWRD se confirmar. |
| **Gatilho para considerar** | TD rolling ACSW < TD SWRD por **12 meses** com margem ≥ 0.10% **E** AUM > $1B **E** spread bid-ask < 3bps |
| **Como descobrimos** | RR scan 2026-03-26, thread 31781 (UCITS MCW) |
| **Como monitorar** | justETF para TD histórico · Thread 31781 RR para glimz/afstand commentary |
| **Frequência** | Revisão em mar/2027 (12 meses pós-lançamento) |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

### 7. AVWC — Avantis All-World UCITS ETF

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
| **Tese** | ETF all-cap global com tilt value+profitability Avantis em um único ticker. Simplificaria a estrutura AVGS+AVEM para um único instrumento. Mencioado como "ligeiramente menos inclinado que DEGC mas mais líquido". |
| **Diferença crítica vs AVGS+AVEM** | Menos granular — perde capacidade de ajustar pesos EM/DM separadamente. Para Diego com 30% AVGS + 20% AVEM (50% total fatorial), AVWC a 50% seria equivalente mas com menos controle. |
| **Motivo de monitorar** | Potencial simplificação da camada fatorial. Relevante se Diego quiser reduzir número de tickers. |
| **Gatilho para considerar** | Factor loadings AVWC ≥ média ponderada (AVGS×0.6 + AVEM×0.4) por 12 meses **E** TD < custo médio ponderado da combinação atual |
| **Como descobrimos** | RR scan 2026-03-26, thread 31258 (debate AVWC vs DEGC) |
| **Como monitorar** | justETF · RR thread 31258 · AQR Factor Returns |
| **Frequência** | Semestral |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

## Descartados

> ETFs que foram avaliados e rejeitados. Manter como registro para evitar reavaliação desnecessária.

| Ticker | Nome | Data | Motivo do descarte |
|--------|------|------|--------------------|
| AVGC | Avantis Global Equity UCITS | 2026-03-26 | Closet indexing confirmado — factor loadings insuficientes vs AVGS (RR thread 31258 + FI-jpgl-redundancia) |
| JPGL | JPMorgan Global Equity Multi-Factor | 2026-04-01 | Eliminado da carteira. Correlação 0.95 com AVGS + SWRD. AVGS domina em todos os cenários (FI-jpgl-zerobased). Não readicionar. |

---

## Como Usar

**Adicionar candidato:** mencionado positivamente por glimz/afstand/Ben_Felix no RR, ou no Bogleheads por usuário estabelecido, OU novo produto da família Avantis/Dimensional UCITS, OU TER potencialmente inferior a equivalente na carteira.

**Promover para carteira:** abrir issue formal (FI-...) → debate multi-agente → aprovação Diego → atualizar carteira.md.

**Arquivar:** após 24 meses sem gatilho ativado e sem dados novos relevantes → mover para Descartados com motivo.

**Atualizar dados:** a cada scan RR/Bogleheads, atualizar o campo "Última atualização dos dados" e qualquer dado novo nas fichas.

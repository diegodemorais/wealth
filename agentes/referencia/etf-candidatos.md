# ETF Candidatos — Radar de Monitoramento

> Criado em: 2026-04-02
> Última atualização: 2026-04-02
> Dono: Factor (02) — revisão mensal no scan RR/Bogleheads
> Propósito: ETFs que não estão na carteira mas merecem atenção para possível inclusão futura

---

## Tabela Resumo

| Ticker | Nome | Semelhante a | Status | Gatilho | Próxima Revisão |
|--------|------|-------------|--------|---------|-----------------|
| — (pending) | Vanguard FTSE Global Small-Cap UCITS | AVGS | Aguardando lançamento | TER ≤ 0.15% + factor loadings confirmados | Mai/2026 |
| FLXE | Franklin FTSE EM UCITS ETF | AVEM | Monitorando | Factor loading value/quality > AVEM por 12m | Mai/2026 |
| AVEU | Avantis European Equity UCITS ETF | AVGS (Europa) | Novo — lançado fev/2026 | 12 meses de dados + TD confirmado | Fev/2027 |
| AVPE | Avantis Pacific Equity UCITS ETF | AVGS (Pacífico) | Novo — lançado fev/2026 | 12 meses de dados + TD confirmado | Fev/2027 |
| ACSW | iShares MSCI World Swap UCITS ETF | SWRD | Monitorando | TD < SWRD por 12m + spread adequado | Mai/2026 |

---

## Candidatos — Fichas Detalhadas

---

### 1. Vanguard FTSE Global Small-Cap UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | — (não lançado) |
| **ISIN** | — (pendente) |
| **Nome completo** | Vanguard FTSE Global All-Cap / Global Small-Cap UCITS ETF |
| **Índice** | FTSE Global Small-Cap (ou FTSE Global All-Cap) |
| **Domicílio** | Irlanda (registrado fev/2026) |
| **TER** | Estimado ~0.10-0.15% (não confirmado) |
| **Data de lançamento** | Não lançado — registrado na Irlanda fev/2026 |
| **AUM** | — |
| **Disponível IBKR** | — (pendente lançamento) |
| **Semelhante a** | AVGS (exposição small-cap global) |
| **Dados disponíveis** | Apenas o registro regulatório na Irlanda |
| **Tese** | Se lançado com TER ~0.12%, seria a primeira opção passiva de small-cap global UCITS com custo potencialmente abaixo de AVGS (0.23%). Interessante como alternativa de menor custo para a camada small — mas sem tilt value/profitability. |
| **Diferença vs carteira** | AVGS tem tilt value/profitability ativo (esperado +0.5-1.0% alpha líquido). Vanguard seria puramente passivo — exposição small sem premium fatorial. Não substitui AVGS diretamente. |
| **Motivo de monitorar** | TER potencialmente inferior pode justificar uma fração do bloco AVGS para capturar small puro com custo mínimo |
| **Gatilho para considerar** | TER confirmado ≤ 0.15% **E** factor loadings disponíveis (6+ meses de dados) **E** disponível em IBKR com plano recorrente |
| **Como descobrimos** | Bogleheads scan 2026-04-02 (thread: "Vanguard, please fulfill Bogle's Vision"). ETF Stream confirmou registro na Irlanda. |
| **Como monitorar** | justETF + ETF Stream + Bogleheads thread 31781 (UCITS MCW). Verificar mensalmente se foi lançado. |
| **Quando monitorar** | Mensal — scan RR/Bogleheads de rotina |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | FI-vanguard-smallcap-ucits |

---

### 2. FLXE — Franklin FTSE Emerging Markets UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | FLXE |
| **ISIN** | IE00BHZRR732 |
| **Nome completo** | Franklin FTSE Emerging Markets UCITS ETF |
| **Índice** | FTSE Emerging Markets |
| **Domicílio** | Irlanda |
| **TER** | 0.19% |
| **Data de lançamento** | 2017 |
| **AUM** | ~$400M (estimado) |
| **Disponível IBKR** | Sim |
| **Semelhante a** | AVEM |
| **Dados disponíveis** | TER 0.19% vs AVEM 0.23%. Mencionado no RR como potencialmente tendo maior factor loading value/quality que AVEM em análise de rolling loadings. |
| **Tese** | FLXE pode capturar prêmio fatorial em EM de forma mais eficiente que AVEM por custo menor E potencialmente exposição mais pura ao índice. Hipótese ainda não confirmada. |
| **Diferença vs carteira** | AVEM é ativo (Avantis, tilt deliberado). FLXE é passivo (FTSE). Diferença pode ser grande em factor loadings — AVEM tem value e profitability por design, FLXE não. |
| **Motivo de monitorar** | Menção no RR (scan 2026-03-26) de que FLXE pode ter EM factor loading > AVEM. Se confirmado, seria candidato a substituir ou complementar AVEM. |
| **Gatilho para considerar** | Factor loading value (HML) de FLXE > AVEM confirmado por 12 meses de dados AQR/Ken French **E** TD rolling < AVEM |
| **Como descobrimos** | RR scan 2026-03-26, thread 31258 (Ideal UCITS Factor Portfolio) |
| **Como monitorar** | AQR Factor Returns + Ken French data library para rolling loadings. Comparar anualmente com AVEM. |
| **Quando monitorar** | Semestral — junto com revisão de alocação |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

### 3. AVEU — Avantis European Equity UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | AVEU |
| **ISIN** | IE000MVKN867 (verificar) |
| **Nome completo** | Avantis European Equity UCITS ETF |
| **Índice** | Ativo (Avantis methodology — value + profitability tilt) |
| **Domicílio** | Irlanda |
| **TER** | ~0.25% (estimado, verificar) |
| **Data de lançamento** | Fevereiro 2026 |
| **AUM** | — (muito novo) |
| **Disponível IBKR** | A confirmar |
| **Semelhante a** | AVGS (componente Europa) |
| **Dados disponíveis** | Apenas lançamento confirmado (RR Ep. 401, Eduardo Repetto) |
| **Tese** | Avantis expandiu UCITS para Europa, Pacífico e EUA (AVEU/AVPE/AVUS). Mesma metodologia de value + profitability da família americana. Permite exposição regional mais granular do que AVGS (global). |
| **Diferença vs carteira** | AVGS já inclui Europa. AVEU seria redundante a menos que Diego queira sobrepeso regional deliberado ou trocar AVGS por ETFs regionais com tilt mais forte. |
| **Motivo de monitorar** | Família Avantis UCITS em expansão — confirmar se a metodologia idêntica à US (sem double WHT) e os factor loadings reais após 12 meses |
| **Gatilho para considerar** | 12 meses de dados + tracking difference confirmado + factor loadings (HML, RMW) ≥ AVGS **E** disponível em IBKR com plano recorrente |
| **Como descobrimos** | RR Ep. 401 (Eduardo Repetto & Caitlin Ebanks, 2026-04-02). RR scan 2026-04-02. |
| **Como monitorar** | Thread 32396 (Avantis UCITS) no RR — encerrou mas thread nova pode surgir. justETF para TD. |
| **Quando monitorar** | Fev/2027 (12 meses após lançamento) |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

### 4. AVPE — Avantis Pacific Equity UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | AVPE |
| **ISIN** | IE000XXXXXXX (verificar) |
| **Nome completo** | Avantis Pacific Equity UCITS ETF |
| **Índice** | Ativo (Avantis methodology) |
| **Domicílio** | Irlanda |
| **TER** | ~0.25% (estimado) |
| **Data de lançamento** | Fevereiro 2026 |
| **AUM** | — (muito novo) |
| **Disponível IBKR** | A confirmar |
| **Semelhante a** | AVGS (componente Japão/Pacífico) |
| **Dados disponíveis** | Lançamento confirmado (mesmo batch que AVEU) |
| **Tese** | Mesma tese do AVEU — cobertura regional Pacífico com tilt value/profitability Avantis. Japão é mercado relevante para value investing (alto value spread histórico). |
| **Diferença vs carteira** | AVGS já inclui Japão/Pacífico. Igual à situação AVEU — redundante sem propósito regional deliberado. |
| **Motivo de monitorar** | Completude da família Avantis UCITS. Pode ser relevante se Diego quiser tilts regionais diferenciados no futuro. |
| **Gatilho para considerar** | Mesmos critérios do AVEU. Baixa prioridade vs AVEU. |
| **Como descobrimos** | RR Ep. 401, mesmo lote AVEU (fev/2026) |
| **Como monitorar** | justETF + RR Forum. Junto com AVEU no ciclo de revisão. |
| **Quando monitorar** | Fev/2027 (12 meses após lançamento) |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

### 5. ACSW — iShares MSCI World Swap UCITS ETF

| Campo | Detalhe |
|-------|---------|
| **Ticker** | ACSW |
| **ISIN** | IE000Y7K9659 (verificar) |
| **Nome completo** | iShares MSCI World Swap UCITS ETF |
| **Índice** | MSCI World (via swap sintético) |
| **Domicílio** | Irlanda |
| **TER** | ~0.10% (verificar) |
| **Data de lançamento** | Março 2026 |
| **AUM** | — (novo) |
| **Disponível IBKR** | A confirmar |
| **Semelhante a** | SWRD (mesmo índice MSCI World) |
| **Dados disponíveis** | Anunciado no RR scan 2026-03-26. Estrutura swap pode gerar tracking difference negativo (outperform) por eficiência fiscal do swap vs replicação física. |
| **Tese** | ETFs sintéticos (swap) historicamente têm TD negativo vs índice por conta de eficiência fiscal (dividendos reinvestidos sem WHT no nível do swap). BlackRock ESWP/ACSW usa essa estrutura. Se TD < SWRD por margem de 15-25bps, pode ser alternativa ao SWRD. |
| **Diferença vs carteira** | SWRD (Vanguard) é físico, TER 0.12%. ACSW é sintético. Risco adicional: counterparty risk do swap (mitigado por ISDA/colateral, mas existe). |
| **Motivo de monitorar** | Estrutura swap pode entregar alpha de 15-25bps/ano vs físico em índice desenvolvido (similar ao que swap S&P 500 faz vs físico, conforme thread 31781) |
| **Gatilho para considerar** | TD rolling ACSW < TD SWRD por **12 meses consecutivos** com margem ≥ 0.10% **E** AUM > $1B (liquidez) **E** spread bid-ask < 3bps |
| **Como descobrimos** | RR scan 2026-03-26, thread 31781 (UCITS MCW implementations) |
| **Como monitorar** | justETF para TD histórico. Thread 31781 RR para discussão da comunidade. Mínimo 12 meses de dados antes de qualquer avaliação. |
| **Quando monitorar** | Mar/2027 (12 meses após lançamento) |
| **Quem monitora** | Factor (02) |
| **Issue relacionada** | — |

---

## Como Usar Este Arquivo

**Atualizar quando:**
- Novo ETF identificado nos scans (RR, Bogleheads, justETF)
- ETF candidato lança ou atinge gatilho
- Dados novos disponíveis (TD, factor loadings, AUM)
- ETF promovido para carteira ativa → mover para carteira.md e remover daqui
- ETF descartado → registrar motivo e remover

**Quem atualiza:** Factor (02) — responsável principal. Head coordena.

**Periodicidade de revisão:** Mensal (scan RR/Bogleheads de rotina) + evento-driven (lançamento de novo ETF).

**Critério para adicionar novo candidato:**
- Mencionado positivamente em RR ou Bogleheads por usuário de alta qualidade (glimz, afstand, Ben_Felix)
- TER potencialmente inferior a equivalente na carteira
- Factor loadings potencialmente superiores
- Novo produto da família Avantis/Dimensional UCITS
- Estrutura inovadora (swap, securities lending) com potencial de outperformance

**Critério para remover:**
- Descartado após análise (registrar motivo)
- Absorvido por issue formal de alocação
- ETF fechado ou fusionado
- Após 24 meses sem gatilho ativado e sem novos dados relevantes → arquivar

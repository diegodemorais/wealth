# Risk Management Framework

> Framework quantitativo de risco para a carteira de Diego.
> Operado pelo agente 06 (Risco), com inputs de Macro (08), Cambio (07) e Bookkeeper (13).
> Criado em: 2026-03-20

---

## 1. Limites de Concentracao

### Por Classe de Ativo

| Classe | Alvo | Minimo | Maximo | Acao se Violado |
|--------|------|--------|--------|-----------------|
| Equity global | 79% | 70% | 85% | Rebalancear via aportes |
| IPCA+ longo | 15% | 10% | 20% | Ajustar proximo aporte |
| IPCA+ curto (a partir dos 50) | 0% (3% aos 50) | 0% | 5% | SoRR buffer |
| Renda+ tatico | 3,2% | 0% | 5% | Gatilho de compra/venda. DCA ate 5% se taxa >= 6,5% |
| Cripto (HODL11) | 3% | 1,5% | 5% | Comprar <1,5%, rebalancear >5% |
| Reserva emergencia | 2,5% | 2% | 5% | Manter 3-6 meses custo de vida |
| **Bloco de risco total** | **~6%** | **0%** | **10%** | **Teto absoluto — nunca ultrapassar** |

### Por Moeda

| Moeda | Exposicao Atual | Observacao |
|-------|----------------|------------|
| USD (via ETFs UCITS) | ~79% | Equity global precificado em USD/multi-moeda |
| BRL | ~19% | IPCA+ longo 15%, Renda+ 3%, HODL11 3%, reserva 2,5% |
| GBP (custodia LSE) | ~0% | Apenas moeda de listagem, exposicao real e USD/multi |

> **Risco cambial**: ~79% do patrimonio exposto a BRL/USD. Nao ha hedge formal — BRL funciona como hedge natural parcial (receita em BRL, despesas em BRL). Monitorado pelo agente 07.

### Por Geografia (equity)

| Regiao | Alvo Aproximado | Via |
|--------|----------------|-----|
| EUA | ~55% | SWRD (~60% US), AVGS (AVUV), JPGL |
| Europa | ~15% | SWRD, AVGS (AVDV), JPGL |
| Asia-Pacifico | ~8% | SWRD, JPGL |
| Emergentes | ~22% | AVEM (AVES, EIMI, DGS) |

### Por Ativo Individual

| Regra | Limite | Acao |
|-------|--------|------|
| Nenhum ETF individual > 40% do equity | 40% | Monitorar — SWRD em 36,8% |
| Nenhuma posicao tatica > 5% | 5% | Gatilho de rebalanceamento |
| Transitorios: nao comprar mais | 0 novos aportes | Diluir via aportes nos alvos |

---

## 2. Stress Testing Obrigatorio

### Cenarios Historicos Aplicados a Carteira Atual

> Cada cenario deve ser recalculado trimestralmente com posicoes atualizadas.

| Cenario | Periodo | Equity | IPCA+ | Renda+ | HODL11 | BRL | Impacto Estimado Carteira |
|---------|---------|--------|-------|--------|--------|-----|--------------------------|
| **GFC 2008** | 2008-2009 | -50% | +15% (flight to quality) | N/A | N/A | -30% | A calcular (RK-001) |
| **COVID 2020** | Mar 2020 | -34% | -10% (duration hit) | -20% estimado | -50% | -15% | A calcular (RK-001) |
| **Crise fiscal BR 2015** | 2015-2016 | -15% (global flat) | -25% (abertura de juros) | -40% estimado | N/A | -30% | A calcular (RK-001) |
| **Combinado: crise fiscal + global** | Hipotetico | -40% | -30% | -50% | -60% | -40% | A calcular (RK-001) |
| **Estagflacao global** | Hipotetico | -30% | +5% (IPCA sobe) | -15% | -40% | -20% | A calcular (RK-001) |

### Metodologia

1. Aplicar drawdowns historicos (ou estimados) a cada posicao da carteira
2. Ajustar por cambio quando aplicavel (equity em USD, convertido a BRL)
3. Calcular patrimonio resultante
4. Verificar se patrimonio pos-stress sustenta FIRE (SWR 3,5% sobre patrimonio reduzido cobre R$250k/ano?)
5. Identificar qual cenario "quebra" o plano FIRE

### Frequencia

- **Trimestral**: Recalcular todos os cenarios com posicoes atualizadas
- **Extraordinario**: Quando correlacoes mudarem significativamente ou evento de mercado extremo

---

## 3. Correlacao entre Posicoes

### Matriz de Correlacao Esperada (regime normal)

| | Equity | IPCA+ | Renda+ | HODL11 | BRL |
|---|--------|-------|--------|--------|-----|
| **Equity** | 1.0 | -0,2 | -0,3 | 0,3 | -0,4 |
| **IPCA+** | -0,2 | 1.0 | 0,8 | -0,1 | 0,5 |
| **Renda+** | -0,3 | 0,8 | 1.0 | -0,1 | 0,4 |
| **HODL11** | 0,3 | -0,1 | -0,1 | 1.0 | -0,2 |
| **BRL** | -0,4 | 0,5 | 0,4 | -0,2 | 1.0 |

> **ALERTA**: Correlacoes mudam em crise. Em stress, correlacoes convergem para 1 (tudo cai junto).

### Correlacao Condicional (regime de stress)

| Par | Regime Normal | Regime de Stress | Risco |
|-----|--------------|-----------------|-------|
| Equity x BRL | -0,4 (hedge natural) | -0,7 (amplifica perda em BRL) | **MEDIO** — drawdown em USD suavizado por BRL fraco |
| Renda+ x Equity | -0,3 (descorrelacionados) | +0,5 (correlacionam em crise fiscal) | **ALTO** — ambos caem em crise fiscal BR |
| HODL11 x Equity | +0,3 (correlacao moderada) | +0,7 (correlacionam em risk-off) | **ALTO** — nao diversifica em crash |
| Renda+ x HODL11 | -0,1 (independentes) | +0,4 (correlacionam em crise BR) | **MEDIO** — bloco de risco nao diversifica internamente |
| IPCA+ x BRL | +0,5 (ligados) | +0,3 (juros sobem, BRL fortalece) | **BAIXO** |

> **Finding critico**: Em crise fiscal brasileira, Renda+ e HODL11 podem correlacionar positivamente (ambos caem), enquanto equity global em USD TAMBEM cai em BRL se o cambio explodir. O cenario de pior caso e crise simultanea global + fiscal BR.

### Frequencia de Monitoramento

- **Mensal**: Revisar correlacoes implicitas (movimentos recentes sugerem mudanca de regime?)
- **Trimestral**: Recalcular matriz de correlacao com dados atualizados
- **Evento**: Se correlacao condicional mudar significativamente, alertar Head

---

## 4. Liquidez

### Perfil de Liquidez da Carteira

| Prazo | % Liquidavel | Posicoes | Valor Aproximado |
|-------|-------------|----------|-----------------|
| **D+0** | ~0% | — | — |
| **D+1** | ~9% | Tesouro Direto (IPCA+ 2029, 2040, Renda+ 2065) | ~R$ 213k |
| **D+2** | ~92% | ETFs UCITS (IBKR) + HODL11 (B3) | ~R$ 3.270k |
| **D+5** | ~100% | Tudo | ~R$ 3.483k |

> **Observacao**: Liquidez de D+1 do Tesouro e com marcacao a mercado — pode haver perda significativa em Renda+ 2065 (duration 43,6) e IPCA+ 2040 (duration ~10).

### Regras de Liquidez

| Regra | Criterio | Status |
|-------|----------|--------|
| Reserva emergencia | 3-6 meses custo de vida em liquidez imediata | OK (4 meses em IPCA+ 2029) |
| Nao vender equity para despesa corrente | Nunca na acumulacao | Ativo |
| Buffer pre-FIRE | 2 anos de despesas em ativos liquidos antes dos 50 | Aguardando (2035+) |

---

## 5. Counterparty Risk

| Contraparte | Exposicao | Risco | Mitigacao |
|-------------|-----------|-------|-----------|
| **Interactive Brokers** | ~79% (ETFs UCITS) | Falencia do broker, congelamento de conta | Ativos segregados (SIPC + Lloyd's ate $30M). Monitorar saude financeira |
| **B3 / CBLC** | ~6% (HODL11, Tesouro via custodia) | Risco sistemico BR, falha operacional | Custodia centralizada na CBLC. Risco baixo |
| **Tesouro Nacional** | ~6% (IPCA+, Renda+) | Risco soberano BR | Risco de credito minimo (governo federal). Risco de marcacao: alto em Renda+ |
| **Nubank/XP** | Custodia BR | Falencia do broker | Ativos custodiados na CBLC (segregados) |
| **Okegen** | Transacional (cambio) | Spread, indisponibilidade | Risco transacional apenas. Spread 0,25%. Ter alternativa mapeada |

### Concentracao de Custodia

- ~79% em um unico broker (IBKR) = **concentracao relevante**
- Mitigacao: SIPC + seguro adicional. IBKR e o maior broker eletrônico do mundo. Monitorar
- Considerar: segundo broker UCITS como contingencia? (Issue futuro se patrimonio crescer muito)

---

## 6. Metricas de Risco

### Portfolio-Level

| Metrica | Definicao | Frequencia |
|---------|-----------|------------|
| Max drawdown realizado | Maior queda peak-to-trough no periodo | Mensal |
| Drawdown corrente | Distancia do ultimo peak | Semanal |
| Concentracao (HHI) | Herfindahl-Hirschman Index das posicoes | Trimestral |
| Drift maximo | Maior desvio de qualquer bucket vs alvo | Semanal |
| VaR 95% (1 mes) | Perda maxima estimada com 95% confianca | Trimestral |

### Position-Level

| Metrica | Aplicacao | Frequencia |
|---------|-----------|------------|
| Peso vs alvo | Cada ETF e bucket | Semanal |
| Duration (Renda+) | Risco de taxa de juros | Mensal |
| TER + custos totais | Custo de cada posicao | Trimestral |
| Tracking error (HODL11) | vs Bitcoin spot | Trimestral |

---

## 7. Escalation Protocol

| Nivel | Trigger | Acao | Responsavel |
|-------|---------|------|-------------|
| **Informativo** | Drift > 3pp qualquer bucket | Reportar no check-in semanal | Bookkeeper (13) |
| **Alerta** | Drift > 5pp qualquer bucket | Ajustar prioridade de aportes | CIO (01) |
| **Acao** | Gatilho atingido (HODL11, Renda+) | Executar conforme regra definida | Risco (06) -> Head (00) |
| **Critico** | Drawdown > 20% ou bloco risco > 10% | Checklist behavioral + revisao de posicoes | Head (00) + Behavioral (12) |
| **Emergencia** | Evento de contraparte (broker, soberano) | Revisao completa de custodia e exposicao | Head (00) coordena todos |

---

## 8. Calendario de Risco

| Frequencia | Atividade | Responsavel |
|------------|-----------|-------------|
| **Semanal** | Monitoramento de drift e gatilhos | Bookkeeper (13) |
| **Mensal** | Correlacao implicita, marcacao Renda+ e HODL11, drawdown | Risco (06) |
| **Trimestral** | Stress test completo (5 cenarios), correlacao formal, veiculos (TER, tracking error), concentracao | Risco (06) + Advocate (10) |
| **Semestral** | Risco fiscal BR, risco cambial, risco de contraparte | Risco (06) + Macro (08) + Cambio (07) |
| **Anual** | Revisao completa do risk framework, premissas de vida | Head (00) coordena todos |

---

## Historico de Revisoes

| Data | Mudanca | Motivo |
|------|---------|--------|
| 2026-03-20 | Criacao do risk framework | Implementacao de risk management quantitativo formal |
| 2026-03-22 | Reconciliacao HD-006 final | Equity 79%, IPCA+ longo 15%, Renda+ <=5%, sem Selic. HD-008 |

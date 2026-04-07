# Memoria: Bookkeeper / Controller

> Registro operacional. Numeros e fatos, sem opiniao.

---

## Regra: Aportes vs Operacoes Independentes

**NAO tratar ausencia de aportes como execucao pendente ou falha.**
Diego recebe salario mensal. Pode haver meses sem aporte. A carteira migra apenas via aportes (sem vender). Tranches de IPCA+ etc. demoram naturalmente — isso e execucao disciplinada, nao atraso.

Distincao obrigatoria:
- **Aportes/tranches**: aguardam proximo evento de caixa. Status NORMAL. Nao emitir alerta.
- **Operacoes independentes de caixa**: venda programada, reinvestimento de cupom, acao no Tesouro com posicao existente — essas sim podem ser escaladas se ficarem sem execucao por 30+ dias.

Esta regra foi violada 3x (2026-03-22, 2026-03-27, 2026-04-01). Ler antes de qualquer diagnostico de execucao.

---

## Execucoes Pendentes

| Decisao | Aprovada em | Prazo | Status | Detalhes |
|---------|-------------|-------|--------|----------|
| IPCA+ 2040 — 7% (~R$244k) | 2026-03-19 | mar-abr 2026 | **PENDENTE — 0/3 tranches** | DCA em 2-3 tranches. Compra direta Tesouro. Taxa ref: ~7,31% |
| ~~Aportes mensais R$25k → JPGL~~ | ~~Permanente~~ | ~~Mensal~~ | **Superseded** | JPGL eliminado. Aportes direcionados conforme drift: SWRD 50%/AVGS 30%/AVEM 20%. Prioridade atual: SWRD (underweight) |

---

## Ultima Reconciliacao

| Campo | Valor | Data | Fonte |
|-------|-------|------|-------|
| Patrimonio total | ~R$ 3.372.673 | 2026-03-30 | Calc: equity BRL + nao-equity estimados |
| Equity total | USD $585.371 | 2026-03-30 | Google Sheets (aba Utils, soma posicoes) |
| Cambio referencia | R$ 5,25 | 2026-03-30 | WebSearch USD/BRL |
| Performance desde 23/Mar | -3,4% (R$ -119.611) | 2026-03-30 | Queda equity USD + depreciacao BRL |

### Posicoes detalhadas (USD, 2026-03-30)

> Breakdown por ETF nao extraido individualmente neste check-in. Total equity $585,371 = -1,7% vs $595,517 de 23/Mar.

| Bucket | ETF | USD | % Equity | Nota |
|--------|-----|-----|----------|------|
| SWRD (50%) | LON:SWRD | ~$241.000 | ~41,2% | proporcional vs 23/Mar |
| AVGS (30%) | USSC + AVUV + AVDV + AVGS | ~$183.000 | ~31,3% | proporcional |
| AVEM (20%) | LON:EIMI + AVES + DGS | ~$157.000 | ~26,8% | proporcional |
| **Total** | | **$585.371** | **100%** | verificar planilha no proximo check-in |

### Blocos nao-equity

| Bloco | Valor BRL | % Total | Nota |
|-------|-----------|---------|------|
| FIRE fixo (IPCA+ 2040) | ~R$ 13.308 | 0,4% | posicao pequena, sem variacao significativa |
| Reserva (IPCA+ 2029) | ~R$ 87.862 | 2,6% | posicao estavel |
| Risco Juros (Renda+ 2065) | ~R$ 99.673 | 3,0% | MtM -11% em marco — taxa subiu |
| Risco Crypto (HODL11 + spot) | ~R$ 103.400 | 3,1% | BTC $67.822 em 30/Mar |

### Reconciliacao anterior (23/Mar 2026)

| Campo | Valor |
|-------|-------|
| Patrimonio total | R$ 3.492.284,00 |
| Equity total | USD $595.450,47 |
| Cambio | R$ 5,24 |
| Performance Q1 2026 | +1,73% em BRL |

### Ativos com saldo zero (nao-posicao)
WRDUSW-USD, F50A.DE, AVEM UCITS, LON:EMVL, ZPRX.DE, LON:IWQU, LON:IWMO

---

## Custos de Referencia

| Item | Valor | Fonte |
|------|-------|-------|
| Spread cambio (Okegen) | 0,25% ida e volta | carteira.md |
| IOF | 1,1% (verificar periodicamente) | memoria 05-wealth |
| Custo total one-time cambio | ~1,35% (~0,12%/ano diluido) | memoria 05-wealth |
| IR ETFs exterior | 15% flat (Lei 14.754/2023) | memoria 05-wealth |
| IR Tesouro (>2 anos) | 15% sobre ganho nominal | tabela regressiva |

---

## Historico de Aportes (fonte: Google Sheets, aba Historico)

> Carregado em 2026-03-20. Dados de jul/2021 a mar/2026.

### Resumo

| Metrica | Valor |
|---------|-------|
| Periodo | jul/2021 — mar/2026 (56 meses) |
| Meses com aporte | 41 (73%) |
| Meses sem aporte | 14 (25%) |
| Saques | 1 (set/25, R$533k — provavelmente reestruturacao) |
| Maior sequencia sem aporte | 4 meses |
| Total aportado bruto | R$2.393.042 |
| Total investido liquido | R$2.361.307 |
| Media mensal (meses com aporte) | R$58.367 |
| Mediana dos aportes | R$30.000 |
| Capital inicial (jul/21) | R$501.112 |
| Patrimonio atual (mar/26) | R$3.497.702 |
| Ganho sobre investido | +48,1% (R$1.136.395) |

### Aportes mensais detalhados

| Mes | Aporte (R$) |
|-----|-------------|
| jul/21 | — (inicio) |
| ago/21 | 0 |
| set/21 | 14.000 |
| out/21 | 13.500 |
| nov/21 | 30.000 |
| dez/21 | 25.000 |
| jan/22 | 101.500 |
| fev/22 | 0 |
| mar/22 | 0 |
| abr/22 | 90.000 |
| mai/22 | 150.000 |
| jun/22 | 0 |
| jul/22 | 20.000 |
| ago/22 | 20.000 |
| set/22 | 0 |
| out/22 | 0 |
| nov/22 | 0 |
| dez/22 | 0 |
| jan/23 | 26.000 |
| fev/23 | 0 |
| mar/23 | 0 |
| abr/23 | 128.590 |
| mai/23 | 77.000 |
| jun/23 | 41.000 |
| jul/23 | 26.000 |
| ago/23 | 11.500 |
| set/23 | 25.000 |
| out/23 | 15.000 |
| nov/23 | 30.000 |
| dez/23 | 15.000 |
| jan/24 | 23.000 |
| fev/24 | 70.000 |
| mar/24 | 27.000 |
| abr/24 | 82.000 |
| mai/24 | 34.000 |
| jun/24 | 20.000 |
| jul/24 | 57.000 |
| ago/24 | 41.000 |
| set/24 | 22.000 |
| out/24 | 15.000 |
| nov/24 | 0 |
| dez/24 | 0 |
| jan/25 | 35.164 |
| fev/25 | 18.039 |
| mar/25 | 145.019 |
| abr/25 | 603.556 |
| mai/25 | 35.296 |
| jun/25 | 0 |
| jul/25 | 50.766 |
| ago/25 | 0 |
| set/25 | -532.848 (saque) |
| out/25 | 21.998 |
| nov/25 | 44.976 |
| dez/25 | 39.028 |
| jan/26 | 77.576 |
| fev/26 | 15.049 |
| mar/26 | 56.485 |

### Conclusao
Diego e executor consistente acima da meta. Critica de "gap de execucao" feita em 2026-03-20 foi refutada pelos dados. Erro do time: opinar sem consultar historico.

---

## Historico de Operacoes

### 2026-03
- 05/03 e 11/03: Aporte de R$56.485 (registrado na planilha como mudanca no investido total)
- 30/03: Check-in semanal. Equity -1,7% vs 23/Mar. Total patrimônio estimado ~R$3,372k (queda -3,4%). Sem operacoes novas detectadas.

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03-19 | Fundacao do agente | Criado. 1 execucao pendente (IPCA+ 2040 DCA). Skill /atualizar-carteira migrado para responsabilidade do Bookkeeper |
| 2026-03-23 | Issue XX-001: Performance Attribution Q1 2026 (primeiro report) | Report completo: `/agentes/contexto/performance/Q1-2026.md`. Framework definido para Q2+. ALERTA: IPCA+ DCA nao executado (0/3 tranches, 4 dias atrasado). Apreciacao BRL -6.15% neutralizou ganho em USD +3.9% → retorno carteira estimado -2.5% em BRL no Q1 |
| 2026-03-23 | Bookkeeper: Refazer Performance Q1 com números reais da planilha | Números reais extraidos: Patrimonio 31/Dec R$ 3.286.414,64 → 23/Mar R$ 3.492.284. Aportes Q1 R$ 149.110. Retorno real: +1,73% em BRL (ganho de mercado ~5.7% USD compensou impacto cambial de -6.15%). Arquivo atualizado: `agentes/contexto/performance/Q1-2026.md` |
| 2026-03-30 | Check-in semanal | Equity $585,371 USD (-1,7% vs 23/Mar). Total ~R$3,372k (-3,4%). Câmbio R$5,25. Renda+ 2065 ~R$99,673 (MtM -11% em março, taxa subiu). HODL11 ~R$103,400 (BTC $67,822). IPCA+ DCA: 0/? tranches — leve atraso. Sem gatilhos atingidos. Sem operacoes novas. Não é M1 (mesmo mês que 23/Mar). |

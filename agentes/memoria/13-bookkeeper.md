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
| IPCA+ longo ate 15% (TD 2040 80% + TD 2050 20%) | 2026-03-22 | DCA ativo enquanto taxa >= 6,0% | **EM EXECUCAO — 2/? tranches** | T1: 2026-04-06 (R$20.035,48 TD 2040). T2: 2026-04-10 executada (R$46.498,08 TD 2040 @ 7,10% + R$11.660,71 TD 2050 @ 6,85%), liq. 13/04. Alvo final: ~R$523k (15% da carteira) |
| ~~Aportes mensais R$25k → JPGL~~ | ~~Permanente~~ | ~~Mensal~~ | **Superseded** | JPGL eliminado. Aportes direcionados conforme drift: SWRD 50%/AVGS 30%/AVEM 20%. Prioridade atual: SWRD (underweight) |

---

## Ultima Reconciliacao

| Campo | Valor | Data | Fonte |
|-------|-------|------|-------|
| Patrimonio total | R$ 3.385.515,28 | 2026-05-06 | Recalculado: R$3.472.335 - R$86.819,70 (resgate IPCA+ 2029) |
| Equity total | USD $608.472 | 2026-04-22 | dashboard_state.json (calc: patrimonio equity_brl / cambio) — a atualizar |
| Cambio referencia | R$ 4,960 | 2026-05-01 | PTAX BCB (scan 2026-05-01) |
| Performance desde 01/04 | +2,96% (R$ +99.662) | 2026-04-22 | Crescimento: equity USD + DCA IPCA+ 2/2 tranches — OBSOLETO, recalcular pós-06/05 |

### Posicoes detalhadas (USD, 2026-04-22)

> Extraido de dashboard_state.json. Total equity $608,472 = +3,95% vs $585,371 de 30/Mar.

| Bucket | ETF | USD | % Equity | Nota |
|--------|-----|-----|----------|------|
| SWRD (50%) | LON:SWRD | $251.093 | 41,2% | Underweight vs alvo 50% |
| AVGS (30%) | AVGS UCITS + AVUV + AVDV + USSC | $198.699 | 32,6% | Ligeiro overweight via UCITS + transitorios |
| AVEM (20%) | EIMI + AVES + DGS | $160.491 | 26,4% | Overweight via transitorios |
| JPGL (0%) | IWVL | $2.130 | 0,3% | Legado — diluir via aportes |
| **Total** | | **$608.472** | **100%** | Drift SWRD: -8.8pp. Drift AVEM: +6.4pp. Drift AVGS: +2.6pp |

### Blocos nao-equity (2026-04-22)

| Bloco | Valor BRL | % Total | Nota |
|-------|-----------|---------|------|
| Reserva (IPCA+ 2029) | R$ 86.554,71 | 2,5% | Estavel. Migrara p/ Selic em 2029 |
| IPCA+ longo (2040 + 2050) | R$ 124.675,79 | 3,6% | Apos T2 DCA (liquidacao 13/04). Alvo 15%. Gap 11,4pp |
| Renda+ 2065 (tatico) | R$ 117.832,62 | 3,4% | Taxa 6,93% (vs 7,08% em 01/04). Dentro alvo <=5% |
| Cripto (HODL11) | R$ 100.208,00 | 2,9% | BTC $71.877 em 22/Apr. Alvo 3%. Piso 1,5%. |

### Reconciliacoes anteriores

| Data | Patrimonio | Equity USD | Cambio | Performance |
|------|-----------|-----------|--------|-------------|
| 23/Mar | R$ 3.492.284,00 | USD $595.450 | R$ 5,24 | Q1: +1,73% BRL |
| 30/Mar | R$ 3.372.673 | USD $585.371 | R$ 5,25 | -3,4% (drawdown Marc) |
| 22/Apr | R$ 3.472.335 | USD $608.472 | R$ 5,156 | +2,96% desde 01/04 |
| 01/May | — | — | R$ 4,960 | Scan: BRL apreciado -3,8% em 8 dias (material). IPCA+ 2040 ↑19bps, Renda+ ↑3pp, BTC ↑8.8% |

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

### 2026-05
- 04/05: Resgate integral IPCA+ 2029 (reserva de emergência). 23,35 títulos @ R$3.726,33 = R$87.009,80 bruto. Taxa B3: R$190,09. Líquido: R$86.819,70. Posição ZERADA. Realocação: compra de veículo pessoal (R$224k Haval H6 PHEV 2026 0km), financiado com resgate + aporte maio (R$25k) + empréstimo de parente (R$17k, a quitar em junho).
- 06/05: Venda Audi A3 2018 por R$95.000. Custo aquisição R$118.000. Perda: R$23.000. Sem DARF (perda não gera IR). Bem pessoal.
- 06/05: Compra Haval H6 PHEV 2026 0km por R$224.000. Bem pessoal. Financiamento: resgate IPCA+ 2029 (R$86.8k) + aporte maio (R$25k desviado) + empréstimo parente (R$17k).
- **IMPACTO EM INVESTIMENTOS:** aporte maio/2026 NÃO executado em IPCA+ DCA. Pausa até junho quando aporte residual (~R$8k após quitar empréstimo ~R$17k) retoma DCA. Patrimônio financeiro: R$3.472.335 - R$86.819,70 = R$3.385.515,28.

### 2026-04
- 06/04: Tranche-1 IPCA+ DCA executada. R$20.035,48 TD 2040 comprado. Registrado em operacoes_td.json
- 10/04: Tranche-2 IPCA+ DCA executada (aprovado Diego 2026-04-12). Duas operacoes:
  * R$46.498,08 TD 2040 @ 7,10% (ratifica comprometimento com DCA acima de piso 6,0%)
  * R$11.660,71 TD 2050 @ 6,85% (primeira posicao do eixo longo 2050, alvo 20% do bloco IPCA+ longo)
  * Liquidacao esperada: 13/04/2026
  * Total bloco IPCA+ longo pos-liquidacao: ~R$66.533 (0,8% da carteira, caminho para 15% com DCA contínuo)

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03-19 | Fundacao do agente | Criado. 1 execucao pendente (IPCA+ 2040 DCA). Skill /atualizar-carteira migrado para responsabilidade do Bookkeeper |
| 2026-03-23 | Issue XX-001: Performance Attribution Q1 2026 (primeiro report) | Report completo: `/agentes/contexto/performance/Q1-2026.md`. Framework definido para Q2+. ALERTA: IPCA+ DCA nao executado (0/3 tranches, 4 dias atrasado). Apreciacao BRL -6.15% neutralizou ganho em USD +3.9% → retorno carteira estimado -2.5% em BRL no Q1 |
| 2026-03-23 | Bookkeeper: Refazer Performance Q1 com números reais da planilha | Números reais extraidos: Patrimonio 31/Dec R$ 3.286.414,64 → 23/Mar R$ 3.492.284. Aportes Q1 R$ 149.110. Retorno real: +1,73% em BRL (ganho de mercado ~5.7% USD compensou impacto cambial de -6.15%). Arquivo atualizado: `agentes/contexto/performance/Q1-2026.md` |
| 2026-03-30 | Check-in semanal | Equity $585,371 USD (-1,7% vs 23/Mar). Total ~R$3,372k (-3,4%). Câmbio R$5,25. Renda+ 2065 ~R$99,673 (MtM -11% em março, taxa subiu). HODL11 ~R$103,400 (BTC $67,822). IPCA+ DCA: 0/? tranches — leve atraso. Sem gatilhos atingidos. Sem operacoes novas. Não é M1 (mesmo mês que 23/Mar). |
| 2026-04-25 | AUDITORIA FASE 2 — Integridade de Dados (Dashboard Health Score) | ✓ PASSED: Freshness SLA, Patrimônio reconciliado (R$3.472.335 = zero drift), P(FIRE) 86.3% > 85%. ⚠ ALERTAS: Drift IPCA+ -8.2pp (alvo 15%, atual 6.8%), gap R$396k a aportar. Drift equity +11.4pp. ✗ CRÍTICO: lotes.json não calcula valor_atual_brl (100% do equity = R$3.137k não reconcilia). Impacto: TLH reports e ir_diferido não confiáveis. Detalhes: `/tmp/auditoria_bookkeeper_fase2.txt`. Recomendações: (1) Consertar ibkr_sync.py (CRÍTICO), (2) Executar DCA T3 (ALTO), (3) Cron diário (MÉDIO). |
| 2026-05-01 | RECONCILIAÇÃO PÓS-SCAN — Atualização de Macro e RF | ✓ Scan completado. Divergências encontradas: IPCA+ 2040 +19bps (7.21% → 7.40%), Renda+ 2065 +3pp (6.93% → 6.96%), Câmbio -3.8% (R$5.156 → R$4.96, BRL apreciado), BTC +8.8% ($71.8k → $78.1k). Status gatilhos: IPCA+ continua ativo (7.40% > 6.0% piso), Renda+ não compra novo (6.96% < 6.5%), sem alertas críticos (CDS 138bps < 300bps). Carteira.md atualizado. |
| 2026-05-06 | REGISTRO DE OPERAÇÕES — Resgate IPCA+ 2029 + Aporte Maio Desviado | ✓ Operações confirmadas por Diego: (1) Resgate IPCA+ 2029 integral (R$86.819,70 líquido); (2) Aporte maio R$25k desviado para compra de veículo (R$224k Haval H6 PHEV); (3) Empréstimo de parente R$17k a quitar em junho. Impacto: patrimônio financeiro cai para R$3.385.515,28. IPCA+ DCA pausa maio, retoma junho com aporte residual ~R$8k. Bem pessoal (veículo) fora da carteira de investimentos. Registrado: carteira.md (patrimônio atualizado, reserva zerada), operacoes.md (resgate), execucoes-pendentes.md (pausa DCA maio), memoria/13-bookkeeper.md (histórico). |

---

## Auto-Crítica Datada (extraído do perfil em 2026-05-01)

### Retro 2026-04-22 (nota: 6.5/10)
- **Bem:** CORE-portfolio-history completo e correto.
- **Mal:** carteira.md desatualizado há 21 dias (última: 04/01).
- **Ação:** Reconciliar patrimônio na próxima sessão.

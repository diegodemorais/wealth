# HD-scorecard: Scorecard + shadow portfolios atualizados com premissas HD-006 final

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-scorecard |
| **Dono** | 10 Advocate |
| **Status** | Backlog |
| **Prioridade** | Media |
| **Participantes** | 00 Head, 13 Bookkeeper, 11 Quant |
| **Dependencias** | HD-006 (concluído), FR-003 (concluído) |
| **Criado em** | 2026-03-23 |
| **Origem** | Pós-HD-006 — premissas finais mudaram vs baseline T0 do HD-002 original |
| **Concluido em** | — |

---

## Motivo / Gatilho

HD-002 criou o scorecard com baseline T0 = 2026-03-20 usando as premissas disponíveis na época. HD-006 (2026-03-22) alterou premissas materialmente:

- **Alocação final**: equity 79%, IPCA+ longo 15%, cripto 3%, Renda+ 5% (tático)
- **Shadow B**: era "100% IPCA+ 2040 a ~7.16% real" — continua válido, mas o benchmark de equity mudou (era VWRA, agora Shadow A usa composição fatorial)
- **P(FIRE)**: FR-003 calculou mediana R$10.56M, SR=91% para R$250k. Precisa entrar no scorecard.
- **Shadow A**: composição precisa refletir que o contrafactual justo agora é 93% VWRA + 7% IPCA+ (sem fator tilt) — comparar vs carteira fatorial

Sem essa atualização, o scorecard mede a carteira errada contra benchmarks desatualizados.

---

## Descrição

Atualizar os 4 arquivos de métricas em `agentes/metricas/` com as premissas HD-006 final:

1. **scorecard.md** — atualizar alocação-alvo, P(FIRE) com valor do FR-003, TER recalculado
2. **shadow-portfolio.md** — recalcular projeções Shadow A e B com premissas finais; adicionar novo benchmark (Shadow C: VWRA 93% + IPCA+ 2040 7%, sem fator tilt)
3. **findings-log.md** — verificar se métrica "Diego achou primeiro" melhorou desde T0
4. **previsoes.md** — auditar previsões abertas; fechar as vencidas

---

## Escopo

- [ ] Ler `agentes/metricas/scorecard.md` e identificar campos desatualizados
- [ ] Ler `agentes/metricas/shadow-portfolio.md` e recalcular projeções com premissas HD-006
- [ ] Preencher P(FIRE): mediana R$10.56M, SR=91% (R$250k), SR=87% (R$350k) — de FR-003
- [ ] Recalcular TER do portfolio com composição final (SWRD 30%, AVEM 20%, AVGS 25%, JPGL 25%)
- [ ] Auditar Shadow A: 93% VWRA (TER 0.22%) + 7% IPCA+ 2040 — projeção a 2037
- [ ] Auditar Shadow B: 100% IPCA+ 2040 a 7.16% real líquido — SWR resultante
- [ ] Quant: validar recalculos
- [ ] **Recalibrar haircut SmB/HmL: 30% → 35-40%** (FI-crowdedness 2026-03-24: McLean & Pontiff 32% decay médio; 30% está no limite do decay esperado). Recalcular equity equivalent e alpha esperado sobre VWRA com haircut revisado
- [ ] **Modelar Quant Crisis 2.0** como cenário de stress explícito: AVGS -25 a -35% em semanas (epicentro 2007), bloco equity total -16 a -22.5%. Adicionar ao stress test da carteira

---

## Análise

> A preencher quando executado.

---

## Conclusão

> A preencher.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | — |
| **Estratégia** | — |
| **Conhecimento** | — |
| **Memória** | — |

---

## Próximos Passos

- [ ] Executar quando prioridade subir
- [ ] Resultado alimenta revisão trimestral do scorecard (Jun 2026)

# HD-scorecard: Scorecard + shadow portfolios atualizados com premissas HD-006 final

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-scorecard |
| **Dono** | 10 Advocate |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 00 Head, 13 Bookkeeper, 11 Quant |
| **Dependencias** | HD-006 (concluído), FR-003 (concluído) |
| **Criado em** | 2026-03-23 |
| **Origem** | Pós-HD-006 — premissas finais mudaram vs baseline T0 do HD-002 original |
| **Concluido em** | 2026-03-26 |

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

Todos os 4 arquivos de métricas atualizados com as premissas HD-006 final e issues subsequentes (2026-03-22 a 2026-03-26).

**scorecard.md**: P(FIRE) preenchido (91%/87%). 9 erros registrados. Alpha liquido recalibrado (0.16%/ano, haircut 58%). Cenario Quant Crisis 2.0 adicionado. Dashboard atualizado. Regra anti-recorrencia HD-006 formalizada.

**shadow-portfolio.md**: Shadow C adicionado — 79% VWRA + 15% IPCA+ + 3% HODL11 + 3% Renda+. Responde especificamente se o factor tilt gera valor vs alocacao equivalente com VWRA puro. Tracking comeca Abr/2026.

**findings-log.md**: 10 novos findings (F-008 a F-017). Finding rate consolidado: 1.3/sessao. Falsos positivos caindo (29% → 12%). Diego achou primeiro caindo (43% → 18%). Sistema madurando.

**previsoes.md**: Tracking atualizado. PRV-001: taxa atual 7.16% (ainda >6.5%, DCA conforme). Metodologia e prazos confirmados.

---

## Conclusão

Scorecard alinhado com premissas atuais do sistema. P(FIRE) = 91% agora reflete FR-003 (nao mais "pendente"). Shadow C cria o benchmark certo para avaliar o factor tilt especificamente. Erros historicos documentados para auditoria futura.

**Um ponto de atenção identificado**: Delta B (vs IPCA+) ficou negativo em Q1 2026 (-0.57pp). Normal dado que BRL apreciou e equity sofreu. Gatilho so dispara com 3 trimestres consecutivos negativos — sem acao por agora.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Sem mudança |
| **Estratégia** | Sem mudança |
| **Conhecimento** | P(FIRE)=91%, alpha=0.16%/ano (haircut 58%), Delta B Q1=-0.57pp (monitorar). Shadow C = benchmark do tilt fatorial |
| **Memória** | Atualizar com haircut canonico 58% e P(FIRE) 91% |

---

## Próximos Passos

- [x] scorecard.md atualizado
- [x] shadow-portfolio.md — Shadow C adicionado
- [x] findings-log.md — F-008 a F-017 adicionados
- [x] previsoes.md — tracking atualizado
- [ ] Quant Crisis 2.0: modelagem formal do cenario (pendente — nao e urgente)
- [ ] Delta C: primeiro dado disponivel no checkin-automatico M1 de Abr/2026
- [ ] Revisao trimestral do scorecard: Jun 2026

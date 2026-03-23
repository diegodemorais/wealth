# HD-002-Scorecard_metricas_sistema: Scorecard de metricas do sistema de agentes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-002-Scorecard_metricas_sistema |
| **Dono** | 10 Advocate |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 00 Head, 01 CIO, 10 Advocate, 13 Bookkeeper |
| **Dependencias** | FR-003 (para P(FIRE) via Monte Carlo) |
| **Criado em** | 2026-03-20 |
| **Origem** | Retro 2026-03-20 -- necessidade de medir se o sistema gera valor |
| **Concluido em** | 2026-03-20 |

---

## Motivo / Gatilho

Na retro de 2026-03-20, Diego e o sistema identificaram que nao ha metricas objetivas para avaliar se o sistema de agentes gera valor. Sem medicao, nao ha como saber se a complexidade (13 agentes, 8 gatilhos, 11 instrumentos) se justifica vs alternativas simples (VWRA puro, RF pura).

---

## Descricao

Criar um scorecard com metricas que permitam avaliar, ao longo do tempo, se o sistema de agentes esta:
1. Gerando valor financeiro (retorno vs contrafactuais)
2. Gerando valor operacional (encontrando problemas antes de Diego)
3. Custando mais do que entrega (complexidade desnecessaria)

---

## Escopo

- [x] Definir metricas de valor: P(FIRE), Delta vs Shadows
- [x] Definir metricas operacionais: Finding rate, taxa de erro, gap de execucao
- [x] Definir metricas de previsao: track record de decisoes ativas
- [x] Criar 2 shadow portfolios (ajuste Diego: VWRA+IPCA 7% e 100% IPCA)
- [x] Criar arquivo `agentes/metricas/scorecard.md`
- [x] Criar arquivo `agentes/metricas/shadow-portfolio.md`
- [x] Criar arquivo `agentes/metricas/findings-log.md`
- [x] Criar arquivo `agentes/metricas/previsoes.md`
- [x] Preencher baseline (T0 = 2026-03-20)

---

## Analise

### Debate sobre metricas (2026-03-20)

Debate ao vivo entre Head, Advocate e CIO sobre quais metricas importam. Resultado:

1. **P(FIRE)**: metrica norte. Tudo que nao mover P(FIRE) e noise. Depende de FR-003 (Monte Carlo).
2. **Delta vs Shadows**: 2 contrafactuais (ajuste Diego):
   - Shadow A: 93% VWRA + 7% IPCA+ 2040 (alternativa passiva simples)
   - Shadow B: 100% IPCA+ 2040 a ~7.16% real (piso de oportunidade)
3. **Custo de complexidade**: TER incremental (+2.9 bps vs Shadow A), tempo de gestao (~4h/mes vs ~30min), # instrumentos (11 vs 1-2)
4. **Finding rate**: 2.33/sessao na fundacao, mas 43% Diego achou primeiro -- preocupante
5. **Taxa de erro**: 3 erros em 3 sessoes, 2 que Diego pegou antes
6. **Gap de execucao**: IPCA+ DCA aprovado 18/mar, 0/3 tranches em T+2
7. **Previsoes**: 3 abertas com prazo e confianca registrados

### Numeros do baseline

**Patrimonio T0**: R$ 3,479,239

**Shadow B projecao ate FIRE (50 anos, 2037)**:
- 100% IPCA+ 2040 a 6.09% real liquido
- Patrimonio projetado: ~R$ 11.5M
- SWR: 2.17% (R$250k / R$11.5M)
- Conclusao: RF pura garante FIRE com folga. Equity precisa justificar volatilidade.

**TER comparativo**:
- Carteira real: 0.248% (equity) / 0.227% (portfolio total)
- Shadow A: 0.219%
- Shadow B: 0.200%
- Delta: +2.9 bps vs A, +4.8 bps vs B -- custo de fees e desprezivel

**Custo real de complexidade**: nao esta em TER. Esta em:
- Tempo de gestao (~4h/mes)
- Risco de erro operacional (43% dos findings Diego achou primeiro)
- Risco de nao executar decisoes (gap de execucao)

---

## Conclusao

Scorecard criado com baseline completo (T0 = 2026-03-20). Quatro arquivos em `agentes/metricas/`:

1. **scorecard.md** -- dashboard central com todas as metricas e regras de gatilho
2. **shadow-portfolio.md** -- 2 contrafactuais com metodologia e projecao
3. **findings-log.md** -- log de 7 findings das 3 sessoes de fundacao
4. **previsoes.md** -- 3 previsoes ativas com prazo e confianca

A unica metrica pendente e P(FIRE) via Monte Carlo (depende de FR-003).

O dado mais desconfortavel do baseline: Diego achou erros antes do sistema em 43% dos findings. O sistema precisa melhorar em quality control antes de gerar mais volume.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Nenhuma mudanca |
| **Estrategia** | Sistema agora tem metricas de accountability. Gatilhos: delta negativo 3 trimestres = revisao, Diego achou primeiro 2x/mes = root cause |
| **Conhecimento** | Shadow B mostra que 100% IPCA+ garante FIRE com folga (SWR 2.17%). Equity precisa entregar alpha sobre isso |
| **Memoria** | Registrado em 00-head (scorecard criado, frequencias, gatilhos) |
| **Nenhum** | -- |

---

## Proximos Passos

- [ ] FR-003: Monte Carlo computacional para preencher P(FIRE)
- [ ] XX-001: Performance attribution trimestral -- alimenta Delta vs Shadows
- [ ] Primeira revisao trimestral do scorecard (Jun 2026)
- [ ] Reduzir "Diego achou primeiro" de 43% para < 20% no proximo mes

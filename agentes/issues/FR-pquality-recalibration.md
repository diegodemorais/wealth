# FR-pquality-recalibration: Recalibração e Expansão do P(quality)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-pquality-recalibration |
| **Dono** | FIRE + Dev |
| **Status** | Doing |
| **Prioridade** | Alta |
| **Participantes** | FIRE, Quant, Advocate, Fact-Checker, Arquiteto (HD-ARCHITECT), Head, Dev |
| **Co-sponsor** | Head, Diego |
| **Dependencias** | FR-regime-switching-model (concluída 2026-04-29) |
| **Criado em** | 2026-04-29 |
| **Origem** | Debate FR-regime-switching-model revelou que P(quality)=66.1% é a métrica que mais descreve a experiência real da aposentadoria — mais do que P(FIRE)=83.7%. Hoje está subdimensionada: definição parcial, sem todos os perfis, sem destaque no dashboard, ausente dos simuladores. |

---

## Problema

P(quality) mede o que o FIRE *realmente entrega* — não apenas se o portfólio sobrevive, mas se Diego vive como planejado. A diferença de 17.6pp entre P(FIRE)=83.7% e P(quality)=66.1% representa trajetórias onde o portfólio sobrevive mas o padrão de vida fica 20-26% abaixo do planejado por períodos significativos.

**Lacunas atuais:**
- Definição calculada apenas para o perfil base (solteiro, R$250k). Falta casado, casado+filho, aspiracional.
- Métrica secundária no dashboard — sem threshold de monitoramento definido.
- Ausente dos simuladores: ao simular um cenário de FIRE, só aparece P(FIRE). P(quality) nunca é exibido.
- Threshold desejável nunca foi formalmente definido pelo time.
- Definição atual pode estar incompleta — não validada contra literatura de retirement quality.

---

## Escopo

### Fase 1 — Definição e validação do modelo (todos os agentes)

- [ ] **FIRE:** revisar definição atual de P(quality). É o melhor proxy para "experiência de aposentadoria"? Considerar: ponderação temporal (anos ruins no início pesam mais), distinção entre cortes transitórios vs prolongados, path dependence.
- [ ] **Quant:** validar fórmula atual. Confirmar que o cálculo é matematicamente correto e consistente com P(FIRE) do mesmo MC run.
- [ ] **Fact-Checker:** existe literatura de retirement quality/utility para benchmarking? Blanchett, Finke, Pfau — algum define "success com qualidade" de forma análoga?
- [ ] **Advocate:** stress-testar a definição. A métrica pode ser manipulada para parecer boa com premissas otimistas? Qual definição é mais difícil de "vencer"?
- [ ] **Head:** definir threshold desejável. P(quality) >= 70%? >= 75%? Com qual fundamentação?

### Fase 2 — Arquitetura e fontes da verdade (Arquiteto + Quant)

- [ ] Confirmar que P(quality) é calculado em `fire_montecarlo.py` — sem hardcoding de parâmetros
- [ ] Parâmetros que definem P(quality) (ex: `piso_lifestyle_fraction=0.80`, `min_years_fraction=0.90`) devem estar em `carteira.md` → `carteira_params.json` → `config.py`
- [ ] Propagação: `fire_montecarlo.py` → `dados/fire_montecarlo.json` → `generate_data.py` → `data.json`
- [ ] Estrutura de `data.json`: `pfire_base.quality` (base) + `pfire_by_profile[*].p_quality` para cada perfil
- [ ] `dashboard/spec.json`: adicionar campos de quality com `data_testid` para cada perfil

### Fase 3 — Cálculo para todos os perfis (FIRE + Quant)

- [ ] Calcular P(quality) para: solteiro (R$250k), casado (R$270k), casado+filho (R$300k), aspiracional (R$250k, mercado fav)
- [ ] Manter consistência: mesmo MC run que gera P(FIRE) deve gerar P(quality) para cada perfil
- [ ] Resultado esperado: 4 valores de P(quality) em `pfire_by_profile`

### Fase 4 — Dashboard (Head + Dev)

- [ ] **Head decide:** onde e como exibir. Proposta: P(quality) ao lado de P(FIRE) no hero banner da aba FIRE, com label e tooltip explicando a diferença
- [ ] **Todos os lugares que exibem P(FIRE) devem exibir P(quality) junto:**
  - Hero banner da aba FIRE (já tem P(FIRE) base)
  - Cards de perfil (Solteiro / Casado / Casado+Filho / Aspiracional)
  - Tabela detalhada de cenários
  - Simuladores: ao calcular FIRE Year, exibir P(quality) estimado ao lado do P(FIRE)
  - Aba Assumptions: widget Gap T (já existe P(quality) parcialmente)
- [ ] **Dev implementa** após spec aprovada pelo Head
- [ ] Threshold visual: verde >= 75%, amarelo 65-75%, vermelho < 65%
- [ ] `data-testid` em todos os campos de P(quality) para cobertura Playwright
- [ ] Entrada no `changelog.ts` antes de commitar

### Fase 5 — Testes e validação

- [ ] `npm run build` sem erros
- [ ] Playwright: assertions para todos os novos `data-testid` de P(quality)
- [ ] `python scripts/sync_spec.py --missing` confirma cobertura
- [ ] Commit + push

---

## Questões abertas

1. A definição atual (`piso_lifestyle_fraction=0.80`, `min_years_fraction=0.90`) é a melhor possível ou há variante mais informativa?
2. Qual o threshold desejável — 70%, 75%? O que a literatura sugere?
3. P(quality) nos simuladores: calcular em tempo real (TypeScript frontend) ou consultar tabela pré-computada do data.json? Qual é mais correto e viável?
4. P(quality) para o perfil aspiracional faz sentido? O mercado fav já eleva P(FIRE) para 91% — P(quality) seria análogo?

---

## Análise

> A preencher pelo time.

---

## Conclusão

> A preencher após debate e implementação.

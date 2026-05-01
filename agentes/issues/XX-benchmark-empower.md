# XX-benchmark-empower: Investigação — Personal Capital / Empower

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-benchmark-empower |
| **Dono** | Head |
| **Status** | Investigação Concluída — Aguardando Decisão |
| **Prioridade** | Média |
| **Participantes** | Head (decisão), Dev (implementação eventual) |
| **Dependencias** | — |
| **Criado em** | 2026-05-01 |
| **Origem** | Benchmark competitivo das 3 ferramentas de investimento mais famosas do mundo |

---

## Visão Geral

**Personal Capital → Empower** (empower.com) é a plataforma de finanças pessoais mais popular nos EUA para tracking de patrimônio + planejamento de aposentadoria. Adquirida pela Empower Retirement em 2020 por $1B, rebranded em 2023. Atinge $100B em assets under administration.

**Público:** Investidores com $100k+ em assets, self-directed ou hybrid. FIRE community é grande usuário.

**Modelo:** Free tier (dashboard + ferramentas de planejamento) + Personal Strategy+ (0.89% AUM, mínimo $100k, com wealth advisors).

---

## Features Mapeadas

| Ferramenta | Descrição |
|-----------|-----------|
| **Net Worth Tracker** | Agregação automática de 100+ tipos de conta (401k, IRA, brokerage, crypto, real estate, loans). Integração Zillow para imóveis. Snapshot atualizado com line chart de progresso. |
| **Investment Checkup** | Alocação atual vs. benchmark "Smart Weighting" (equi-weighted por setor e style box). Expense ratios. Sector concentration. Tax drag. |
| **Retirement Planner** | Monte Carlo com 5.000 cenários. Inputs: inflation, tax rate, life expectancy, Social Security, spending, savings rate. Output: prob. de sucesso (Low/Med/High) + scenarios side-by-side. |
| **Fee Analyzer** | Calcula impact anual de expense ratios em valor absoluto, projetado 10–30 anos. |
| **Budget & Cash Flow** | Categorização automática de transações. Cash flow mensal (renda vs. despesas). |
| **Smart Weighting** | Recomendação de alocação equi-weighted por setor (10 setores) e style (12 boxes) vs. market-cap. |

---

## Retirement Planner — Deep Dive

Monte Carlo com 5.000 simulações usando histórico:
- US equities: desde 1926
- International equities: desde 1970
- Bonds: desde 1926
- Inflation: default 3.5%, customizável

**Configurável:** tax rate, life expectancy, retirement age, Social Security (ON/OFF, timing, amount), withdrawal strategy.

**Output:** probabilidade de sucesso + comparação side-by-side de múltiplos cenários (ex: FIRE 50 vs FIRE 55 vs FIRE 45).

**Limitação crítica:** não implementa guardrails dinâmicos. Calculadora one-shot — não ajusta spending se mercado cair 30%.

---

## Visualizações e Gráficos

- **Net Worth:** line chart de progresso + breakdown por classe de ativo (pie/stacked bar)
- **Allocation:** sector breakdown (10 setores), style matrix (large/mid/small × value/core/growth)
- **Fee Impact:** bar chart — portfolio com vs. sem fees projetado 10–30 anos
- **Cash Flow:** monthly income/expense bars com trend
- **Retirement Planner:** success rate gauge + scenario comparison tables

Interface clean (read-only). Sem drag-and-drop rebalancing. Sem execução de ordens.

---

## Pontos Fortes

1. **Agregação de contas** — 100+ conexões, plug-and-play, real estate integration (Zillow)
2. **Retirement Planner acessível** — Monte Carlo free, bem visualizado, scenarios úteis para FIRE
3. **Fee analysis granular** — impact em valor absoluto ao longo de décadas
4. **Net worth one-stop** — visão holística de assets + liabilities
5. **Free tier robusto** — não força upgrade agressivo no início

## Limitações

1. **Syncing instável pós-rebrand** — duplicatas de transações, contas que param de atualizar, bugs frequentes
2. **Read-only** — sem execução, sem rebalancing automático
3. **Investment Checkup genérico** — não customizado por risk tolerance; muitos ETFs não reconhecidos
4. **Sem guardrails dinâmicos** — spending fixo no Monte Carlo; sem regras condicionais para drawdowns
5. **Sem factor tilts** — Smart Weighting é superficial; não analisa value/momentum/quality/size
6. **Sem tax-loss harvesting automation** — disponível apenas no advisory premium
7. **US-centric** — sem Brazilian ETFs, IRPF, come-cotas, FIIs
8. **Data privacy concerns** — sharing com ecosystem Empower pós-aquisição

---

## Comparação com Dashboard Diego

| Feature | Empower | Dashboard Diego | Winner |
|---------|---------|-----------------|--------|
| Agregação multi-source | ✅ 100+ conexões, plug-and-play | Manual + scripts | Empower |
| Mobile app | ✅ Full-featured | ❌ Não | Empower |
| Retirement Monte Carlo (UI) | ✅ Visual, free, 5k sims | ✅ fire_montecarlo.py (mais sofisticado) | Diego (profundidade) |
| Guardrails dinâmicos | ❌ Não | ✅ guardrail_engine.py | Diego |
| Factor tilts (value/quality/momentum) | ❌ Básico | ✅ AVGS/AVEM, factor_regression.py | Diego |
| Tax-loss harvesting | ❌ Apenas premium | ✅ tax_engine.py + FIFO | Diego |
| Brazilian ETF / IRPF | ❌ US-only | ✅ Nativo | Diego |
| Fee impact visualization | ✅ Intuitivo | ❌ Não implementado | Empower |
| Scenario comparison (side-by-side) | ✅ Visual | ⚠️ Parcial | Empower |
| Net worth aggregation (UI) | ✅ Auto, Zillow | Manual | Empower |

**Conclusão:** Empower é forte em _visibilidade_ (agregação, UI, mobile), fraco em _profundidade_ (guardrails, factor awareness, tax, Brazilian context). Diego tem vantagem clara em tudo que é personalização e profundidade analítica.

---

## Oportunidades de Implementação (para avaliação Head)

1. **Fee impact visualization** — gráfico mostrando custo total dos TERs (SWRD 0.12%, AVGS 0.39%, etc.) em valor absoluto projetado 10–20 anos. Alta legibilidade para justificar troca de ETF.
2. **Scenario comparison side-by-side** — comparar FIRE 48 vs FIRE 50 vs FIRE 53 lado a lado com patrimônio, SWR e P(sucesso) para cada cenário. Empower faz bem; podemos fazer melhor com dados reais do pipeline.
3. **Net worth progress chart** — line chart simples mostrando evolução do patrimônio total (BRL e USD) desde o início do tracking. Complementa o dashboard atual.
4. **Cash flow dashboard** — renda mensal vs. gastos (aporte disponível). Simples mas de alto impacto para visualizar margem de aporte real vs. planejado.

---

## Próximos Passos

- [ ] Head decide quais features valem implementar (ver seção acima)
- [ ] Para cada feature aprovada: abrir issue de implementação específica com Dev

---

## Fontes

- [Empower Review 2026 – NerdWallet](https://www.nerdwallet.com/financial-advisors/reviews/empower)
- [Empower Review – Rob Berger](https://robberger.com/empower-review/)
- [Empower Review – ChooseFI](https://choosefi.com/review/empower-review-the-ultimate-net-worth-tracker)
- [Retirement Planner Review – Financial Samurai](https://www.financialsamurai.com/personal-capital-retirement-planner-review/)
- [Empower Tools](https://www.empower.com/tools/net-worth)
- [Smart Weighting – Medium](https://codyaray.medium.com/personal-capitals-tactical-weighting-approach-711d44be4fad)
- [Best Retirement Calculators – Rob Berger](https://robberger.com/best-retirement-calculators/)
- [Bogleheads: Empower Review](https://www.bogleheads.org/forum/viewtopic.php?t=462761)
- [7 Best Empower Alternatives 2026](https://portfoliogenius.ai/blog/personal-capital-empower-alternative)

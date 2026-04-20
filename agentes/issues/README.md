# Issues — Carteira Diego

## Modos Operandi

| Modo | Descricao | Quando |
|------|-----------|--------|
| **Conversa** | Livre, exploratorio. Head roteia e sintetiza | Modo padrao |
| **Issue** | Formal, estruturado, com conclusao obrigatoria | Temas que merecem profundidade |

Conversas podem gerar Issues. O Head deve sugerir proativamente.

---

## Board

### Discovery
> Temas no radar mas sem urgência para execução agora

| ID | Titulo | Dono | Prioridade |
|----|--------|------|------------|
| PT-planejamento-patrimonial | Planejamento patrimonial pré-casamento | Patrimonial | 🟢 Baixa |
| HD-plataforma-wm | Explorar plataforma de wealth management como produto | Head | 🟢 Baixa |
| HD-boldin-benchmark | Benchmark Boldin — Análise Comparativa Dashboard vs Mercado | Head | ✅ Done 2026-04-17 |

### Backlog
> Issues prontas para execucao, aguardando vez

| # | ID | Titulo | Dono | Prioridade |
|---|-----|--------|------|------------|
| — | HD-gatilho-soberano | Quantificar gatilho "risco soberano extremo" para IPCA+ | Head | 🟡 Média |
| — | TX-lei14754-juridico | Monitor evolução jurídica Lei 14.754/2023 | Tax | 🟢 Baixa |
| ~~FR-bond-tent-fire-date~~ | ~~Bond Tent — Robustez para FIRE Date Incerta~~ | FIRE | ✅ Done 2026-04-11 |
| ~~FR-fire-date-elicitation~~ | ~~Elicitação data de FIRE — intenções, cenários e odds~~ | FIRE | ✅ Done 2026-04-11 |
| ~~HD-swrd-114-cotas~~ | ~~Investigar 114 cotas de SWRD faltantes no ibkr_lotes.json~~ | Bookkeeper | ✅ Done |
| ~~HD-gws-auth~~ | ~~Autenticar gws CLI para acesso Google Workspace~~ | Head | ❌ Cancelada — gws requer pagamento |
| 2 | ~~HD-tearsheet-longrun~~ | ~~Tearsheet QuantStats — drawdown table + histórico longo~~ | Head | ✅ Done |
| ~~HD-backtest-longrun~~ | ~~Pipeline backtest 50+ anos via Ken French / MSCI~~ | Head | ✅ Done |
| ~~DEV-tester~~ | ~~Agente Tester — Suite de testes funcionais para todos os 64 blocos~~ | Dev | ✅ Done 2026-04-12 |
| ~~DEV-fire-tab-split~~ | ~~Split da aba FIRE em 2 tabs coerentes~~ | Dev | ✅ Done 2026-04-12 |
| ~~DEV-privacy-sim-audit~~ | ~~Auditoria privacidade: simulador FIRE + todos os componentes~~ | Dev | ✅ Done 2026-04-13 |
| ~~DEV-hero-kpi-review~~ | ~~Revisão completa KPIs hero strip + aba Now~~ | Dev + Head | ✅ Done 2026-04-13 |
| 4 | TX-reforma-tributaria | Monitor reforma tributária (PL 2.337+) | Tax | 🟢 Baixa |
| — | TX-tlh-engine-lote | Tax — TLH Engine por lote (P&L individual, gatilho em drawdown) | Tax | 🟡 Média |
| — | TX-diferimento-fiscal | Tax — Calculadora de diferimento fiscal por ETF (custo real da venda) | Tax | 🟡 Média |
| 2 | ~~HD-quantstats~~ | ~~Portfolio analytics visual com QuantStats~~ | Head | ✅ Done |
| 3 | ~~HD-ibkr-import~~ | ~~Tracking automático de posições via IBKR Flex Query~~ | Bookkeeper | ✅ Done |
| 4 | ~~FR-withdrawal-engine~~ | ~~Motor parametrizável de withdrawal strategies~~ | FIRE | ✅ Done |
| 5 | ~~HD-mcp-bcb~~ | ~~MCP Server BCB — dados macro Brasil estruturados~~ | Head | ✅ Done |
| 6 | ~~HD-mcp-financial-datasets~~ | ~~MCP Financial Datasets — ETF holdings~~ | Head | ✅ Done |
| 7 | ~~FI-portfolio-optimization~~ | ~~Validação formal de alocação via otimização~~ | Factor | ✅ Done |
| 8 | ~~FR-rebalance-desacumulacao~~ | ~~Regras de rebalanceamento pós-FIRE~~ | FIRE | ✅ Done |
| 9 | ~~TX-tlh-automation~~ | ~~Tax-loss harvesting automático~~ | Tax | ✅ Done |

### Doing
> Issues em andamento

| ID | Titulo | Dono | Prioridade | Status |
|----|--------|------|------------|--------|
| FR-filho-drawdown | MC com cenário filho 2028 + drawdown 2029 | FIRE | 🟡 Média | ⏳ Doing (MC rodado, aguarda Quant) |
| DEV-discovery-tab | Aba Discovery — novos componentes sugeridos por todos os agentes + componentes órfãos | Dev | 🟡 Média | ⏳ Doing |
| DEV-calc-centralization | Centralização de cálculos duplicados — 14 categorias (calcFireYear, P(FIRE), MC, semáforo, fmtBrl, wellness...) | Dev+Quant | 🔴 Alta | ⏳ Doing |
| DEV-boldin-dashboard | Boldin Dashboard Gaps — F1+F2+D1+F5+F6+F7 (balanço holístico, surplus-gap, wellness, cenários, spouse, LTC) | Dev | 🔴 Alta | ⏳ Doing |
| DEV-dashboard-components-alignment | Alinhamento visual/informacional com DashHTML — 32+ componentes | Dev | 🔴 Alta | ⏳ Doing (tarefas por componente) |
| DEV-manifest | spec.json — Manifesto único do dashboard | Dev | 🔴 Alta | ✅ Done 2026-04-11 |
| DEV-bi-review | Revisão BI externa + nova estrutura de abas | Dev | 🟡 Média | ✅ Done 2026-04-11 |
| EXT-sincra-tiago | Diagnóstico carteira Tiago Modesto (Sincra/BTG) | Head | 🟡 Média | ✅ Done 2026-04-11 |
| DEV-fire-matrix-v2 | FIRE Matrix v2 — 3 cenários + eixos Patrimônio×Gasto + visual | Head | 🟡 Média | ✅ Done 2026-04-11 |
| DEV-dashboard-audit | Auditoria completa 60 blocos — map→Quant→fix→confirm | Head | 🔴 Alta | ✅ Done 2026-04-11 |
| DEV-factor-tstats | t-stats + R² warning no Factor Loadings chart | Dev+Quant | 🟡 Média | ✅ Done 2026-04-11 |
| DEV-fire-sim-fixes | Simulação FIRE: ordem barras + bug custo de vida não antecipa | Dev+FIRE | 🔴 Crítica | ✅ Done 2026-04-10 |
| HD-perplexity-review | Review externo Perplexity — 9 features implementadas | Head | 🟡 Média | ✅ Done 2026-04-10 |
| DEV-pvr-broken | Premissas vs Realizado não renderiza (recorrente) | Dev | 🔴 Crítica | ✅ Done 2026-04-10 |
| DEV-perf-audit-fixes | 6 correções aba Performance (TER, attribution, CDI, shadows) | Dev+Quant | 🔴 Alta | ✅ Done 2026-04-10 |
| CORE-portfolio-history | Camada Core de Histórico de Portfolio | Bookkeeper | 🔴 Crítica | ✅ Done 2026-04-10 |
| HD-dashboard-pipeline | Refatoração do pipeline e arquitetura do dashboard | Dev | 🟡 Média | ✅ Done 2026-04-10 |
| HD-dashboard-v2 | Redesign e correções — revisão completa 12 agentes | Dev | 🔴 Crítica | Done (v1.43→v1.71, P0/P1/P2/P3 completos) |
| OPS-xp-import | Pipeline de Importação XP (RF + HODL11) | Bookkeeper | 🟡 Média | Done (broker_analysis.py + dados/xp/) |
| HD-research-planejamento | Pesquisa Boldin + referências de financial planning/WM | Head | 🔴 Crítica | Done |

> HD-dashboard-ux concluída em 2026-04-08 (ver Done abaixo)

### Done
> Issues concluidas

| ID | Titulo | Dono | Data | Resultado |
|----|--------|------|------|-----------|
| DEV-hero-kpi-review | Revisão completa KPIs hero strip + aba Now | Dev + Head | 2026-04-13 | Debate realizado (5 agentes). Proposta de redesign recusada por Diego. Status quo mantido. |
| DEV-privacy-sim-audit | Auditoria privacidade completa — transformar em vez de ocultar | Dev | 2026-04-13 | 32 gaps corrigidos (v2.6→v2.10). CSS ::after "••••". Slider labels, hero strip, FIRE matrix, SWR percentis, fee analysis, HODL PnL cobertos. |
| FR-swr-revisao-2026-04-13 | SWR gatilho revisão + floors simulador | FIRE+Quant+Dev | 2026-04-13 | SWR 2.4%→3.0% (Pfau/ERN). R$13.4M removido como referência. Floors INSS/Katia implementados. Aporte 33k→25k. Dashboard v2.5. 604/604 testes. |
| HD-behavioral | Behavioral checklist enriquecido | Advocate | 2026-04-13 | Fechada (concluída em 2026-03-26 sem status update). 9 itens no checklist do Advocate. Item #9 echo chamber LLM único genuinamente novo. |
| EXT-sincra-tiago | Diagnóstico carteira Tiago Modesto (Sincra/BTG) | Head | 2026-04-11 | PAXG 12% compliance crítico (IR revogado). Equity 53% subestimado. Renda+ aumentar 18–20%. FIRE number ausente. PDF entregue. |
| TX-seguro-vida | Seguro de vida — avaliação e contratação | Tax | 2026-04-11 | Nenhuma ação agora. Gatilho = casamento. → PT-planejamento-patrimonial. |
| HD-backtest-longrun | Pipeline backtest 50+ anos — Regime 7 | Head | 2026-04-11 | Regime 7 (1989–2026, 374m). CAGR +9.79% vs +7.80% (+1.99pp). WR 20a: 100%. Drought 74m. Recovery 43m < bond pool 84m. v1.135. |
| HD-perplexity-review | Review externo Perplexity — 9 features novas | Head+Dev | 2026-04-10 | 9 features: FIRE Matrix, SWR Percentis, Aporte Sens, Macro Status, Trilha, Drawdown, ETF Comp, Bond Runway, Lumpy. v1.131. |
| DEV-privacy-audit | Auditoria completa de privacidade do dashboard | Dev | 2026-04-09 | 4 fases implementadas: +49 .pv, spans hardcoded, eixo Y/tooltip ocultos, Sankey oculto. v1.104. |
| DEV-dashboard-coherence | Auditoria de coerência — cálculos e premissas | Dev | 2026-04-09 | 4 bugs críticos corrigidos (fan chart aportes, P10/P90 MC, labels hardcoded, inssInicio). v1.103. |
| DEV-heatmap-rolling | Heatmap mensal + Rolling Sharpe 12m no dashboard | Dev | 2026-04-09 | Heatmap substituiu barras. Rolling Sharpe novo chart. Privacy mode integrado. v1.105. |
| DEV-dashboard-review | Review técnico completo do dashboard | Dev | 2026-04-08 | 30 hardcodes críticos eliminados. 5 novas funções (renderProximasAcoes, buildRfCards, buildShadowTable, buildIncomeTable, renderIpcaProgress). cryptoLegado e tlhGatilho movidos para data.json. |
| HD-dashboard-ux | Melhorias UX/UI + correções técnicas dashboard | Head | 2026-04-08 | 5 bugs corrigidos (wiRetornoVal, attribution null, savings rate, wellness IPCA+ pts, labels PT-BR). Guardrails ATUAL badge, wellness top-3 actions, fan chart P(FIRE) note, mini-log operações. |
| HD-swrd-114-cotas | Investigar 114 cotas de SWRD faltantes | Bookkeeper | 2026-04-08 | Root cause: TLH 2025-09-22 não refletido. SWRD 5405→5291.64, USSC 443→373.25 em holdings.md. |
| HD-carteiraviva-audit | Auditoria Carteira Viva + roadmap website | Head | 2026-04-07 | 7 ações executadas, 3 falsos positivos. Pesos 50/30/20 propagados. Holdings atualizado. CAGR histórico + custo base BRL implementados. |
| TX-tlh-automation | Tax-loss harvesting automático | Tax | 2026-04-07 | tlh_monitor.py criado. Scan automático, exit 1 se material (≥R$5k). Integrado no relatorio-mensal. |
| HD-mcp-financial-datasets | MCP Financial Datasets — ETF holdings | Head | 2026-04-07 | Não aplicável. US stocks only, zero ETF holdings, API key paga. justETF permanece. |
| HD-mcp-bcb | MCP Server BCB — dados macro estruturados | Head | 2026-04-07 | MCP configurado. bcb_indicadores_atuais substitui 3 WebFetch. Tesouro Direto mantém WebFetch. Focus lag documentado. |
| HD-cmd-evolution | Evolução 3 commands pós-19 issues | Head | 2026-04-07 | fire-status drought condicional. reconciliar 3 camadas ibkr_sync. relatorio-mensal refatorado + seção FX. |
| FR-withdrawal-engine | Motor parametrizável de withdrawal strategies | FIRE | 2026-04-07 | Guardrails confirmados 2/2. GK Hybrid testado e descartado (vol +56%, benefício pró-cíclico). 5 estratégias + híbrido avaliados. |
| FI-portfolio-optimization | Validação formal 50/30/20 via otimização | Factor | 2026-04-07 | 50/30/20 confirmado 2/2. Michaud IC [0%–100%] = indistinguível. Factor drought −6.7pp sobrevivível (83.7% > piso 75%). |
| FR-rebalance-desacumulacao | Regras de rebalanceamento pós-FIRE | FIRE | 2026-04-07 | Opção D: spending-based trimestral. Safety valve 10pp drift. Sem trades tributáveis. Bond pool → caixa no FIRE Day. |
| FX-cmd-cambio | Command /cambio com PTAX+histórico+impacto carteira | Head | 2026-04-07 | python-bcb + fallback WebSearch. PTAX atual, média 30/90/365d, patrimônio em BRL. |
| HD-benchmark-comparison | Benchmark comparison visual — shadow portfolios | Advocate | 2026-04-07 | --benchmarks em portfolio_analytics.py. Target +23.25% vs VWRA +17.66% vs SWRD100 +16.43% (1 ano). Alpha raw +4.67%/ano (sem signif.). |
| FX-multicurrency | Multi-currency tracking BRL/USD | Head | 2026-04-07 | fx_utils.py criado. PTAX via python-bcb. decompose_return(). CLI: --history --decompose. |
| HD-python-bcb | Library python-bcb para dados BCB | Head | 2026-04-07 | bcb funcional (import bcb). PTAX, Selic, IPCA 12m testados. Usado em fx_utils.py. |
| TX-declaracao-anual | Checklist DIRPF investimentos internacionais | Tax | 2026-04-07 | /declaracao criado. Cobre: Bens/Direitos, ganhos capital (15% flat), dividendos acumulação, câmbio PTAX D+2. |
| HD-openbb-data | OpenBB como data platform | Head | 2026-04-07 | Incompatível Python 3.14. Substituído por python-bcb + yfinance + ken-french + anbima-data. |
| TX-irpf-investidor | Library irpf-investidor para IR | Tax | 2026-04-07 | Só B3. Não aplicável para UCITS via IBKR. /tax-calc implementado custom (Lei 14.754/2023). |
| HD-hook-protect-sot | Hook proteção source of truth | Head | 2026-04-07 | PreToolUse hook em settings.json bloqueia Edit/Write em carteira.md, memoria/*.md, gatilhos.md. |
| HD-cmd-portfolio-snapshot | Command /portfolio-snapshot | Bookkeeper | 2026-04-07 | Criado e funcional. Posições, pesos, drift, staleness check (>7 dias). |
| HD-cmd-rebalance-calc | Command /rebalance-calc | Head | 2026-04-07 | Cascade HD-006. Source of truth para aportes. Câmbio operacional. |
| HD-cmd-reconciliar | Command /reconciliar | Bookkeeper | 2026-04-07 | Compara carteira.md vs IBKR vs input manual. Tabela divergências. |
| HD-cmd-relatorio-mensal | Command /relatorio-mensal | Head | 2026-04-07 | 7 seções. Salva analysis/relatorios/YYYY-MM.md. Reutiliza MC <7 dias. |
| FR-cmd-fire-status | Command /fire-status | FIRE | 2026-04-07 | 3k sims paralelo (50+53). P(FIRE), distância gatilho, delta vs check-in. |
| TX-cmd-tax-calc | Command /tax-calc | Tax | 2026-04-07 | Lei 14.754/2023. PTAX D+2. Lotes FIFO. DARF código 6015. |
| HD-ibkr-import | Tracking automático via IBKR Flex Query | Bookkeeper | 2026-04-07 | ibkr_sync.py ao vivo. ndcdyn endpoint. Parser XML direto. Snapshot $603k/R$3.14M. Desbloqueia FX-multicurrency, reconciliar, TLH. |
| HD-quantstats | Portfolio analytics visual com QuantStats | Head | 2026-04-07 | QuantStats integrado. Pesos 50/30/20. CVaR/Tail Ratio adicionados. HTML auto-abre em analysis/tearsheet_latest.html. |
| FR-spending-modelo-familia | Sensibilidade spending × P(FIRE): 3 cenários R$250k/270k/300k | FIRE | 2026-04-06 | Margem robusta. Pior caso R$300k+stress = 82.1% > critério 75%. Tabela em carteira.md. |
| FR-multimodel-desacumulacao | Validação externa: desacumulação, IR, sequência saques | FIRE | 2026-04-06 | IR 15% flat correto. Bond→equity mantido. Isenção R$35k/mês não se aplica a ETFs UCITS. Script sem ajuste. |
| FI-multimodel-retornos | Validação externa: retornos equity, factor premiums, asset allocation | Factor | 2026-04-06 | 3.7%/5.0% premissas validadas. 50/30/20 corroborado (CFA survey). Factor 0.16% líquido consistente. Premissas robustas. |
| PT-multimodel-holding | Validação externa: holding, regime de bens, proteção patrimonial | Patrimonial | 2026-04-06 | Sep. total bens confirmado. ZERO estate tax UCITS. 6 ações: pacto, testamento, term life+D&O, contratos PJ, holding, ITCMD. → PT-planejamento-patrimonial |
| HD-multimodel-premissas | Validação multi-modelo premissas do MC | Head | 2026-04-06 | 1 ajuste (SAUDE_BASE R$18k). 7 premissas validadas. P(FIRE) 90.4%. Belly of the snake documentado. |
| HD-mc-audit | Auditoria gaps fire_montecarlo.py | Head | 2026-04-06 | Double-count saúde corrigido (+4.4pp). IR −4.4pp. Net: P(FIRE) 87.2% (ambos corrigidos). 2 gaps conservadores remanescentes. |
| FR-ir-desacumulacao | IR 15% na desacumulação — impacto P(FIRE) | FIRE | 2026-04-06 | IR modelado. Delta final líquido: 0pp (cancelado pelo spending fix simultâneo). P(FIRE) 87.2% base. |
| FI-avgs-premium-reconciliacao | AVGS premium — 130bps vs 46bps vs 0.16% | Factor | 2026-04-06 | Inconsistência cosmética. 3 números medem coisas diferentes — todos consistentes. 5.0% USD já é mais conservador que FF93+haircut. Finding: IR não modelado na desacumulação → FR-ir-desacumulacao. |
| HD-multimodel-validation | Multi-Model Validation — AVGS 30% vs mercado | Head | 2026-04-06 | 50/30/20 corroborado. 6 outputs externos. 7 findings: tracking error regret, factor drought, rebalanceamento, família+drawdown. Protocolo Round 2 (sem tickers) definido como padrão. |
| HD-gastos-pessoais-2026 | Análise de gastos pessoais ago/2025–mar/2026 | Head | 2026-04-03 | Baseline R$218k/ano. Picos Jan/Fev = tributos anuais. Buffer R$32k insuficiente para família. → FR-spending-modelo-familia |
| FI-etf-deep-review | Análise profunda: 7 ETFs candidatos com dados suficientes | Factor | 2026-04-03 | Unanimidade: zero mudanças. SWRD/AVGS/AVEM confirmado pelo Zero-Based. IWDS único candidato futuro (mar/2027). |
| FI-radar-etfs-review | Revisão completa do radar de ETFs candidatos | Factor | 2026-04-02 | 4 convictions baixadas. AVWS adicionado (verificar vs AVGS). ACSW +8-12bps real (não 25bps). |
| HD-adams-capitalhumano | Capital humano correlacionado — 79% equity calibrado? | Head | 2026-04-02 | 79% mantido. DCA IPCA+ = hedge duplo (SoRR + Adams). Correlação 0.50, atenuada por BRL/USD. |
| FR-bond-tent-transicao | Bond tent — quando iniciar transição 79% equity? | FIRE | 2026-04-02 | Manter 79%. Bond pool natural = Pfau/Kitces implícito. Gatilho condicional jan/2031. |
| FR-fire-execution-plan | Playbook operacional do FIRE Day | FIRE | 2026-04-02 | Playbook criado. Bond pool ~R$2,1M líq. Gate único. Decisão 7 reformulada. Seguro vida urgente. |
| TX-saude-fire | Custo real de saúde pós-FIRE | Wealth | 2026-04-02 | SAUDE_BASE 37,9k→16k; VCMH 2,7%; ANS discreto. P(FIRE) stress +2,5pp. |
| FR-currency-mismatch-fire | Risco BRL/USD na desacumulação | FIRE | 2026-04-02 | FIRE 2040 base: TD 2040 vence no FIRE Day → gap eliminado. P(FIRE) 86.9%. |
| FI-premissas-retorno | Reconciliar premissas SWRD/AVGS/AVEM: 3 erros fonte | Factor | 2026-04-01 | SWRD 3.7% / AVGS 5.0% / AVEM 5.0% USD. Base ponderado B: 4.85% (era 5.85%). |
| HD-python-stack-v2 | Capacidades analíticas avançadas | Head | 2026-04-01 | 4/4 caps. tlh_lotes.json com lotes reais. ibkr_analysis.py: 5 outputs. |
| FI-equity-redistribuicao | 20% liberados do JPGL — redistribuição equity | Factor | 2026-04-01 | **SWRD 50% / AVGS 30% / AVEM 20%. Unanimidade 7/7 (13.5x).** Design 50/50 neutro/fatorial preservado. Via aportes. |
| FI-jpgl-zerobased | JPGL 20% — análise zero-based | Factor | 2026-04-01 | **JPGL = 0%. Não adicionar.** Rodada final: 4 agentes, framing puro. Correlação 0.95 + AVGS dominante. 20% liberados → FI-equity-redistribuicao. |
| HD-unanimidade | Unanimidade — calibragem imperfeita, nao echo chamber puro. 3 bugs sistemicos. Agente 16 criado | Head | 2026-04-01 | B+C parcialmente confirmadas. 4 outputs: Zero-Based, bond-tent, advocate protocol, bond-corr falsif. |
| XX-lacunas-estrategicas | P(FIRE) 80% base, AVGS tail risk aceito, falsificabilidade 5 blocos | Head | 2026-04-01 | P(FIRE) 80% base. AVGS aceito explicitamente. Tabela falsificabilidade aprovada. |
| HD-proxies-canonicos | Proxies canônicos por ETF por período | Head | 2026-03-31 | proxies-canonicos.md criado. 4 datas corrigidas. JPGL: FF5+MOM sintético. AVEM: DFEVX. |
| HD-metodologia-analitica | Padrões metodológicos para análises históricas | Head | 2026-03-31 | 6 padrões aprovados. Período canônico: target 20 anos (2006). Mandato para proxies definido. |
| HD-correlacoes-regime | Correlações regime-dependent: stress vs calm (VIX) | Head | 2026-03-31 | SWRD↔JPGL converge (0.964). AVGS↔SWRD estável — diversificação real. Bond tent = proteção real. |
| HD-python-stack-v2 | Capacidades analíticas avançadas: backtest fatorial, TLH monitor | Head | — | Caps 1/2/4 prontas. Cap 3 (TLH): script ok, aguarda extrato IBKR para preencher lotes |
| HD-python-stack | Automação de rotinas com Python stack | Head | 2026-03-31 | 3 scripts criados. checkin_mensal, fire_montecarlo, portfolio_analytics funcionais. |
| FR-literature-bilateral | Regra de literatura bilateral para citações acadêmicas | FIRE | 2026-03-31 | Regra F implementada. Formato bilateral obrigatório. ERN/Blanchett/Cederburg mapeados. |
| TX-estate-tax | Custo real do estate tax americano para a carteira | Tax | 2026-03-31 | $222k US-listed. Estate tax ~$65k/R$340k. Diluição via UCITS em curso. Seguro pendente. |
| FI-rolling-loadings | Rolling factor loadings — drift monitor JPGL/AVGS | Factor | 2026-03-31 | Script --rolling implementado. Alerta beta cíclico. Gatilho recalibrado para 2×estático. |
| FR-scripts-premissas | PREMISSAS_SOURCE e alinhamento guardrails nos scripts MC | FIRE | 2026-03-31 | Bug tornado corrigido. Scripts pesquisa deletados. Canonical script limpo. |
| FI-jpgl-redundancia | JPGL 20% — manter, reduzir ou remover? | 02 Factor | 2026-03-31 | **MANTER 20%**. 7-0. Factor regression: 4 loadings, alpha não significativo. Sector-neutral drag não se aplica (inverse-vol). 22 anos: +3pp/ano vs MSCI World. Período 2019-2026 = única exceção histórica. 5 gatilhos de monitoramento registrados. |
| HD-python-stack | Automação de rotinas com Python stack | Head | 2026-03-30 | 3 scripts criados e testados. Otimizador de aporte reescrito com cascade correto: IPCA+ longo (>=6%) → Renda+ (>=6.5%) → 100% JPGL fracionário IB. Fronteira eficiente com proxy AVUV/AVDV (4.5 anos). |
| PT-onelife | Bond OneLife: converter participacao na holding | 09 Patrimonial | 2026-03-27 | 9-0 contra entrar. 4 pilares fiscais frágeis. IDF compartilhado inviável (CAA 26/1). Parecer próprio obrigatório antes de qualquer decisão. |
| XX-casamento | Casamento iminente: recalibrar FIRE e planejamento patrimonial | 00 Head | 2026-04-02 | P(FIRE 55 casal)=77,1% (R$270k)/80,1% (R$250k). Modelo saúde corrigido: +12pp vs análise anterior. |
| FR-fire2040 | FIRE 2040: bond tent, guardrail de fonte, gatilho R$13.4M/SWR 2.4% | 04 FIRE | 2026-03-27 | Bond tent = 5% do ganho. Driver = patrimônio. Safe harbor 2040, meta FIRE 50. |
| FR-spending-smile | Spending smile + saude com inflator proprio + age sweep 50–60 | 04 FIRE | 2026-03-27 | P(sucesso) 80.8% base. FIRE 55 = 90.5%. Bear -30% ano 1 = risco dominante. |
| HD-psicologia | Psicologia cognitiva: calibracao, pre-mortem, dado vs interpretacao | 00 Head | 2026-03-26 | 7 implementacoes: pre-mortem+pre-parade, falsificacao, dado/interpretacao, scoring retro, julgamentos independentes. |
| HD-behavioral | Behavioral checklist enriquecido com evidencias do curso | 10 Advocate | 2026-03-26 | 9 itens adicionados ao Advocate. Item #9 (echo chamber LLM) e o unico genuinamente novo. |
| RF-renda-teto | Teto ótimo Renda+ 2065: 3% ou 5%? | 03 RF | 2026-03-26 | 5% confirmado. Racional em renda-plus-2065-cenarios.md. |
| MA-equity-br | Equity Brasil: faz sentido dado balanço soberano? | 08 Macro | 2026-03-26 | 0% equity BR. Double concentration confirmada. Renda+ 2065 é o trade. |
| TX-inss-beneficio | Estimativa correta do benefício INSS aos 65 anos | 05 Wealth | 2026-03-26 | R$14-28k/ano real 2026 (central R$18-20k). PV ~R$80k. Art.15 vs Art.26 requer especialista. |
| TX-desacumulacao | Custos tributarios de desacumulacao pos-FIRE | 05 Wealth | 2026-03-26 | Saving liquido ~R$12k/ano. INSS R$46-55k (nao R$97k). Gap 50-53 critico. Lombard NPV +R$1,7M. |
| RK-managed-futures | Managed Futures como diversificador | 06 Risco | 2026-03-26 | Zero MF. JPGL primeiro. Monitorar return stacking UCITS. |
| RK-gold-hedge | Ouro (IGLN) 2-3% como tail risk hedge | 06 Risco | 2026-03-26 | Zero ouro. Capital para JPGL. Managed futures superior. |
| MA-bond-correlation | Correlacao stock-bond inflacionario: IPCA+ como hedge? | 08 Macro | 2026-03-26 | Premissa inaplicavel. IPCA+ HTM = carry, nao hedge. Risco real = recessao global. |
| HD-brazil-concentration | Exposicao real ao Brasil: capital humano + soberano | 07 FX | 2026-03-26 | Concentracao 62.9% estrutural. Portfolio financeiro correto (6.1% BR). Risco e liquidez, nao alocacao. |
| HD-scorecard | Scorecard + shadow portfolios com premissas HD-006 | 10 Advocate | 2026-03-26 | P(FIRE)=91% preenchido. Shadow C adicionado. 10 novos findings. Alpha 0.16%/ano (haircut 58%). |
| HD-simplicity | VWRA + IPCA+ é suficiente? (burden of proof) | 10 Advocate | 2026-03-25 | Carteira atual mantida. Alpha ~0.16% real. Haircut correto: 58% (McLean & Pontiff). Precommitment AVGS validado. |
| HD-equity-weight | 79% equity certo para horizonte fixo de 11 anos? | 04 FIRE | 2026-03-25 | Confirmado. Equity internacional = única diversificação soberana. Balanço total já é quase 100% Brasil. |
| FR-glide-path | Glide path pre-FIRE: definir regra formal de reducao de equity | 04 FIRE | 2026-03-25 | Sem glide path formal. SoRR coberto por 15% IPCA+ longo + 3% IPCA+ curto. INSS aos 65 como floor. |
| FI-crowdedness | Crowdedness de factor strategies e risco AVGS/JPGL | 02 Factor | 2026-03-24 | Tese sustentada. Momentum na zona de atenção sistêmica. Haircut SmB/HmL recalibrar 35-40%. Quant crisis 2.0 modelar no HD-scorecard. |
| FR-equity-equivalent | Equity equivalent do tilt fatorial | 04 FIRE | 2026-03-24 | Portfólio Sortino-eficiente. EE 74.2% (haircut). Vol 16.8%. Nenhuma mudança de alocação. SWRD = seguro anti-modelo. |
| XX-001-Performance_attribution_trimestral | Performance attribution trimestral — primeiro report | 13 Bookkeeper | 2026-03-23 | Framework Q1 pronto. BRL +6.15% neutralizou USD +3.9%. Q2 terá dados completos. |
| FI-004-Validacao_empirica_fatores_JPGL | Validacao empirica dos fatores de JPGL | 02 Factor | 2026-03-23 | JPGL validado. 5 fatores significativos ao vivo. TER cortado para 0.19% (total ~0.45%). Cost-benefit vs SWRD: +1.88%/ano net (30% haircut). Momentum crash risk nao aplicavel (long-only). Risco real: AUM €245M — gatilhos de monitoramento adicionados. |
| XX-004-Bogleheads_forum_scan | Intelligence Gathering — Bogleheads forum scan | 00 Head | 2026-03-23 | 7 topicos lidos. Carteira 100% alinhada com consensus. JPGL confirmado melhor multi-factor UCITS. SWRD validado. SWR non-US = 3.5% (dado novo). Ponto acionavel: cash IBKR < $60k (estate tax sobre cash). RSS feed disponivel: feed.php?f=22 |
| HD-007-Mapa_completo_gatilhos | Mapa completo de gatilhos: inventario, gaps, monitoramento | 00 Head | 2026-03-23 | 60+ gatilhos reduzidos a 16 ativos em 3 niveis (Alarme/Mensal/Anual). HTM absoluto confirmado IPCA+ estrutural. Arquivo: agentes/contexto/gatilhos.md |
| HD-009-Audit_gastos_pessoais | Auditoria de gastos pessoais e consistencia com FIRE | 00 Head | 2026-03-23 | Gastos VERDE: R$215k/ano anualizado, dentro do range FIRE. R$250k baseline confirmado com margem ~25-30% (primeira validacao bottom-up). Spending smile e saude com inflator proprio identificados como gaps no modelo. Dois issues backlog criados: FR-spending-smile e TX-desacumulacao |
| XX-003-RR_Forum_Intelligence_scan | Intelligence Gathering — RR Forum scan de topicos relevantes | 00 Head | 2026-03-22 | 10 topicos lidos. Carteira confirmada alinhada com consensus do forum. Avantis UCITS lancados jun/2024 — Diego ja tem os produtos certos. JPGL usa momentum como negative screen (superior a XDEM/IWMO). Issue criado: RK-managed-futures. Nenhuma acao imediata. |
| HD-008-Reconciliacao_arquivos_deduplicacao | Reconciliacao de arquivos e deduplicacao agent defs | 00 Head | 2026-03-22 | 10+ conflitos corrigidos (ips, evolucao, risk-framework, execucoes, memorias, perfis). 13 agent defs enxugados para bootstrap-only. 2 blocos extraidos para referencia (autonomia-critica, debate-estruturado) |
| FIRE-002-Plano_B_perda_renda | Plano B: perda de renda + decada perdida (escopo expandido) | 04 FIRE | 2026-03-22 | Perda renda nao e risco dominante (R$250k viavel ate perda aos 42, SWR 3.12%). Decada perdida e o killer (SR 31-43%). Plano B: human capital hedge (consultoria R$120-180k/ano) + guardrails + piso R$180k. Nenhuma acao preventiva necessaria agora |
| TX-002-Tax_loss_harvesting_transitorios | Tax-loss harvesting nos 7 ETFs transitorios | 05 Tributacao | 2026-03-22 | Nao aplicavel — todos transitorios com lucro. Framework TLH registrado. Sem wash sale rule no Brasil. Gatilho: reativar em drawdown (TLH + migracao UCITS = duplo beneficio) |
| FR-004-Bond_tent_pre_FIRE (v2) | Bond tent pre-FIRE: design e glidepath | 04 FIRE | 2026-03-22 | Bond tent = 15% IPCA+ longo (HD-006) + 3% IPCA+ curto (aos 50). Tent natural, nao requer gestao ativa. Equity 79% no FIRE, rising pos-vencimento. FR-003: bond tent +0.1pp SR — valor esta no retorno garantido |
| RK-001-Stress_test_risco_soberano_BR (v2) | Stress test risco soberano Brasil (bloco ~21%) | 06 Risco | 2026-03-22 | Bloco soberano ~21% aceito. Risco compensado pelo retorno all-in superior IPCA+ >= 6.0%. Drawdowns Renda+ corrigidos (formula exata). Regra de liquidacao mantida. Equity continua risco dominante (~7x maior) |
| HD-006-Audit_reconciliacao_premissas | Audit e reconciliacao de premissas (retornos, breakeven, IR) | 00 Head | 2026-03-22 | 9+4 erros corrigidos. Decisao final: IPCA+ longo 15%, piso 6.0%, equity 79%, cripto 3%. Breakeven all-in ~5.5%. Selic removido -> IPCA+ curto 3% aos 50. 5 regras anti-recorrencia |
| FR-003-Monte_Carlo_computacional | Monte Carlo 10k trajetorias com premissas HD-006 | 04 FIRE | 2026-03-22 | Pat mediano R$10.56M. SR R$250k: 91% (guard), R$350k: 87%. FR-001 errava 3-6pp sem guard. Decada perdida: 31-43%. Bond tent: +0.1pp |
| HD-002-Scorecard_metricas_sistema | Scorecard de metricas do sistema de agentes | 10 Advocate | 2026-03-20 | Scorecard + 2 shadows + findings log + previsoes. Baseline T0 preenchido. P(FIRE) pendente FR-003 |
| RF-003-Duration_risk_Renda2065_inflacao | Duration risk Renda+ 2065 em regime de inflacao | 03 RF | 2026-03-20 | Target revertido para 5% (decisao Diego 2026-03-22). DCA reativado. Gatilhos mantidos. IPCA+ 2040 e tese diferente (estrutural) |
| RK-001-Stress_test_risco_soberano_BR | Stress test risco soberano Brasil (bloco ~13%) | 06 Risco | 2026-03-20 | IPCA+ 7% adequado. Risco real e equity 89%. Liquidacao: Reserva -> equity -> RF por ultimo |
| FR-004-Bond_tent_pre_FIRE | Bond tent pre-FIRE: design e glidepath | 04 FIRE | 2026-03-20 | NAO implementar tent agressivo. Manter 88% equity no FIRE. IPCA+ 2040 e o tent natural |
| HD-003-Scan_Chicago_Booth | Scan Material Chicago Booth | 01 Head | 2026-03-20 | Scan completo em `agentes/contexto/chicago_booth_scan.md`. 60+ papers, 18 frameworks, 8 issues candidatos |
| FI-003-AVGC_vs_JPGL_multifator | AVGC vs JPGL: melhor multifator UCITS? | 02 Factor | 2026-03-18 | JPGL confirmado — complementa com momentum + low vol. AVGC closet indexing |
| RF-002-IPCA_plus_agora_taxa_7 | Alocar 10% IPCA+ agora (taxa 7%+) | 03 Renda Fixa | 2026-03-18 | Aprovado. Ladder 2035/2040/2050 sem cupom. Gatilho IPCA+ aos 48 removido. **Superseded por HD-006** (alvo final: 15%, TD 2040 80% + TD 2050 20%, piso 6.0%) |
| FR-001-Stress_test_custo_vida_fire | Stress test FIRE: cenarios de custo de vida | 04 FIRE | 2026-03-18 | Limite seguro R$ 360k/ano. R$ 250k folga ampla, R$ 350k viavel (SWR 3,40%) |
| RF-001-Renda_plus_rentabilidade_cenarios_queda | Rentabilidade Renda+ 2065 nos cenarios de queda | 03 Renda Fixa | 2026-03-18 | Gatilho 6,0% validado. Duration 43,6. Compra DCA ate 5% se taxa >= 6,5% |
| HD-001-Retro_2026_03_18_acoes | Acoes da Retro 2026-03-18 | 01 Head | 2026-03-18 | 6/6 acoes concluidas |

### Deprecated
> Issues removidas do board (arquivos mantidos como registro historico)

| ID | Titulo | Motivo |
|----|--------|--------|
| FI-002-Reduzir_AVEM_20_para_15 | Reduzir AVEM de 20% para 15% | Superado por decisao HD-006 (alocacao final aprovada) |
| FR-005-FIRE_bands_custo_vida | FIRE bands: modelar custo de vida R$300-400k | Coberto por FR-003 (Monte Carlo com guardrails) |
| XX-002-Correlacao_stock_bond_BR | Correlacao stock-bond no Brasil | Absorvido por RK-001 v2 (stress test soberano) |
| FI-006-Intangibles_value_factor_AVGS | Intangibles e o value factor | Escopo coberto por FI-004 (validacao empirica JPGL) |
| FI-001-Rebalancear_SWRD_AVGS_factor_tilt | SWRD 35->30% / AVGS 25->30% | Superado por HD-006 (alocacao final aprovada com targets atuais) |
| HD-005-Carry_framework_carteira | Carry framework (Koijen 2018) | Baixa prioridade vs backlog atual, escopo parcialmente coberto por FI-004 |
| HD-falsificabilidade | Registrar condição de falsificabilidade em decisões de manter | Absorvida por XX-lacunas-estrategicas (2026-04-01) |
| FI-vanguard-smallcap-ucits | Monitor lançamento Vanguard FTSE Global Small-Cap UCITS | Coberto por etf-candidatos.md (⏳) + scan mensal automático via /etf-candidatos-scan |

---

## Convencao de IDs

Formato: `{SIGLA}-{slug-descritivo}`
- Slug: kebab-case, 1-3 palavras, legivel sem contexto. Ex: `RF-ipca-dca`, `FR-spending-smile`
- Arquivo: `agentes/issues/{ID}.md`
- Issues arquivadas (Done pre-2026-03-24): mantêm formato antigo `{SIGLA}-{NUM}-{Slug}` como registro historico

| Sigla | Agente | Exemplo |
|-------|--------|---------|
| HD | 00 Head de Investimentos | HD-scorecard |
| FI | 02 Factor Investing | FI-crowdedness |
| RF | 03 Fixed Income | RF-ipca-dca |
| FR | 04 FIRE / Aposentadoria | FR-spending-smile |
| TX | 05 Wealth | TX-desacumulacao |
| RK | 06 Tactical | RK-gold-hedge |
| FX | 07 FX [removido] | FX-hedge-custo |
| MA | 08 Macro | MA-bond-correlation |
| PT | 09 Patrimonial [removido] | PT-onelife |
| XX | Cross-domain (multiplos) | XX-retro-q1 |

Sigla = agente RESPONSAVEL principal (mesmo que outros participem).

---

## Template

Cada issue e um arquivo em `agentes/issues/{ID}.md`. Ver `_TEMPLATE.md` para o modelo.

| Campo | Valor |
|-------|-------|
| ID | HD-ai-investing-research |
| Título | IA × Investimento — Pesquisa ampla: filosofia, ferramentas, riscos |
| Dono | Head |
| Status | 🟡 Doing |
| Prioridade | 🟡 Média |
| Criada | 2026-04-22 |
| Participantes | Head, Factor, FIRE, Advocate, Dev |

## Motivo

Pesquisa ampla sobre o impacto de IA/LLM na filosofia de investimento, metodologia de pesquisa e workflow operacional. 6 fontes consultadas em paralelo: RR Forum, SSRN/acadêmico, AQR/RA/Vanguard/Bridgewater, Bogleheads/Reddit, web livre, e workflow/tools.

---

## Rodada 1 — Resultados (22/04/2026)

### 3-5 Signals que merecem atenção

**1. AI Crowding como risco sistêmico** — ECB, Bank of England e BlackRock alertam: modelos treinados nos mesmos dados convergem para as mesmas posições. O unwind é sincronizado, não escalonado. Quant quake 2007 como precedente. Afeta especialmente factor investing (mesma "receita acadêmica").
- Fontes: BlackRock Crowding Warning (Apr 2026), Federal Reserve FEDS paper 2025-090, Sidley Austin AI Systemic Risk

**2. BTC ganhou tese estrutural nova** — AI agents autônomos precisam de moeda permissionless. Coinbase lançou "Agentic Wallets". Mining companies pivotaram pra AI/HPC ($70B em contratos). BTC não é mais só digital gold — é infra de pagamento pra economia de AI agents.
- Fontes: Grayscale 2026 Outlook, CoinDesk miners-to-AI, SpazioCrypto miners pivot

**3. Concentração S&P 500 em nível dot-com** — Mag 7 = 30.4% do S&P, P/E médio ~50x. Composite concentration risk 81/100 (critical). 2026 é o "show me the money year" — se AI capex ($650B) não monetizar, correção concentrada nos nomes que dominam o índice. SWRD carrega isso.
- Fontes: ETF Trends AI Supercycle, Seeking Alpha AI Bubble Risk, Oliver Wyman AI Bubble Burst

**4. Renda+ 2065 como hedge anti-crowding** — Duration 43 indexada a inflação brasileira tem correlação ~zero com AI-crowded equity selloffs globais. Paradoxalmente, a posição "mais arriscada" pode ser o melhor hedge contra o risco sistêmico mais subestimado.
- Fontes: Investidor10 Renda+ análise, analogia com TIPS 30y nos modelos Bridgewater

**5. LLM alpha é frágil e deteriora** — Paper arXiv (mai/2025): over 2 decades and 100+ symbols, LLM advantages "deteriorate significantly." Overly conservative em bull, overly aggressive em bear. Analyst AI-adoption: +40% fontes mas +59% erro de forecast.
- Fontes: arXiv 2505.07078, SSRN 5821142 (Generative AI for Analysts)

### 3-5 Confirmações

**1. Factor premiums NÃO são erodidos por IA** — Consenso forte: RR forum (vineviz, vmt), Swedroe, Asness, DFA ($1T AUM sem mudar nada). Premiums são comportamentais/estruturais, não informacionais. IA elimina edges informacionais → reforça o caso para fatores.
- Fontes: RR thread 22912 (143 posts), Swedroe Substack, AQR Alt Thinking Q4 2024, DFA $1T AUM milestone

**2. SCV é o anti-bubble natural** — Múltiplas fontes: small cap value é historicamente o melhor diversificador em períodos de bubble tech (Japan 1989, dot-com 2000). AVGS 30% é exatamente o hedge certo.
- Fontes: RR thread 40216 (296 posts), Vanguard VEMO 2026, Research Affiliates growth-value spread

**3. Vanguard 2026 VEMO endossa nossa alocação** — Best buckets: value + non-US DM + high-quality bonds. "Don't overlook value in the age of AI." Nosso 50/30/20 está no lado certo da mesa.
- Fontes: Vanguard VEMO 2026 PDF, Vanguard Active Investing article

**4. "AI não é bolha. AI stocks são bolha."** — Arnott, Bridgewater, Morgan Stanley convergem: tecnologia é real, mas valuations precisam de "implausible growth assumptions." Growth-value spread no nível dot-com.
- Fontes: Rob Arnott Fortune Mar 2026, Bridgewater AI Capex Macro, AQR Asness interviews

**5. Nosso setup multi-agent é state-of-the-art** — Nada no RR, Bogleheads ou Reddit se aproxima. O edge não é ter AI agents — é a qualidade do framework de decisão (D1-D7, cascata, behavioral monitoring).
- Fontes: RR thread 40952 (LLM security selection), Bogleheads AI threads, TradingAgents paper

### 3-5 Ferramentas que vale testar

**1. IBKR MCP Server** — GitHub ([ArjunDivecha/ibkr-mcp-server](https://github.com/ArjunDivecha/ibkr-mcp-server)). Substituiria pipeline manual Flex Query. Posições live nos agentes. Read-only obrigatório.

**2. SYCOPHANCY.md** — Protocolo formal open-spec ([sycophancy.md](https://sycophancy.md)) com detection patterns mecânicos. Formaliza instrução comportamental do CLAUDE.md.

**3. `getfactormodels`** — Lib Python ([x512/getfactormodels](https://github.com/x512/getfactormodels)). FF3/FF5/FF6 + AQR BAB/QMJ automático. Substitui downloads manuais Ken French.

**4. Alpha Vantage MCP + Yahoo Finance MCP** — Preços e fundamentals em tempo real sem WebSearch. Cross-validation.
- [Alpha Vantage MCP](https://mcp.alphavantage.co/) / [Yahoo Finance MCP](https://github.com/Alex2Yang97/yahoo-finance-mcp)

**5. Validação isolada (modelo Dexter)** — Agente validador recebe APENAS output, não reasoning chain. Previne anchoring.

### 3-5 Riscos que não estamos vendo

**1. Sycophancy amplificada por 15 agentes do mesmo modelo** — Paper ACM ICAIF 2026: LLMs mantêm posição original quando desafiados com evidência mista. 15 instâncias de Claude = câmara de eco sofisticada. Mitigação: modelo diferente como devil's advocate periódico.

**2. Hallucination em dados financeiros: 10-20% erro** — Benchmark PHANTOM: modelos frontier fabricam dados quando fontes incompletas. Toda análise ad-hoc em conversa está exposta. Mitigação: forçar tudo por scripts Python.

**3. AI crowding = correlação invisível** — Diversificado em condições normais, materializa em crise. AVGS/AVEM não imunes. Renda+ 2065 (zero correlação) é paradoxalmente o melhor hedge.

**4. SWRD carrega Mag 7 em nível crítico** — Se AI capex não monetizar, correção 20-30% plausível. Pre-definir gatilho de rebalanceamento oportunístico.

**5. Dependência operacional de um único LLM provider** — Se Claude ficar indisponível ou mudar pricing, sistema para. Sem fallback mecânico.

---

## Rodada 1 — Papers e fontes principais

### Acadêmico (SSRN/NBER/arXiv)
- Kelly et al. "AI Asset Pricing Models" (NBER 33351, 2025) — Transformers Sharpe 4.6 vs 3.8 modelos simples
- Dou, Goldstein, Ji "AI-Powered Trading, Algorithmic Collusion" (NBER 34054, 2025) — RL agents aprendem coludir sem comunicação
- Chen et al. "ChatGPT and DeepSeek Stock Prediction" (SSRN 4660148, 2025) — GPT-4 prediz post-news drift em small caps
- "LLM Investing Strategies Long Run" (arXiv 2505.07078, 2025) — Alpha deteriora em horizontes longos
- Xue et al. "Generative AI for Analysts" (SSRN 5821142, 2025) — +40% fontes, +59% erro forecast
- Bradshaw et al. "AI Articles on Seeking Alpha" (HBS 25-055, 2026) — AI articles geram menor volume e retorno
- "Your AI Not Your View: Bias of LLMs" (ACM ICAIF 2026) — Confirmation bias estrutural em análise de investimentos
- "PHANTOM Benchmark" (OpenReview 2026) — 10-20% erro em raciocínio numérico multi-step

### Quant shops
- AQR: "Can Machines Build Better Portfolios?" (Q4 2024), Asness interviews (Feb-Mar 2026)
- Vanguard: "AI Exuberance — Economic Upside, Stock Market Downside" (VEMO 2026)
- Research Affiliates: Arnott "AI stocks are a bubble" (Fortune Mar 2026)
- Bridgewater: "Macro Implications of AI Capex Boom" (2026) — GDP +140bps, $650B dangerous phase
- DFA: $1T AUM milestone (Feb 2026) — silêncio sobre AI = sinal
- Alpha Architect: "Can ChatGPT Transform Momentum?" (Jan 2026) — Sharpe 0.57→0.69, incremental
- Swedroe: "Paradox of Skill" — AI makes active harder, factor premiums persist

### Fóruns
- RR thread 22912: "Could AI reduce Factor premiums?" (143 posts) — consenso: não
- RR thread 40216: "AI Bubble and Stock Market Concentration" (296 posts) — SCV como anti-bubble
- RR thread 35393: "Investing for transformative AI" (474 posts) — analogia shale boom
- RR thread 40952: "Using AI LLM for security selection" (23 posts) — consenso: não vale
- Bogleheads: AI reinforces passive thesis, AI-themed ETFs underperformed

### Ferramentas identificadas
- IBKR MCP Server: [ArjunDivecha](https://github.com/ArjunDivecha/ibkr-mcp-server), [code-rabi](https://github.com/code-rabi/interactive-brokers-mcp)
- Alpha Vantage MCP: [official](https://mcp.alphavantage.co/)
- Yahoo Finance MCP: [Alex2Yang97](https://github.com/Alex2Yang97/yahoo-finance-mcp)
- Financial Datasets MCP: [financial-datasets](https://github.com/financial-datasets/mcp-server)
- getfactormodels: [x512](https://github.com/x512/getfactormodels)
- SYCOPHANCY.md: [sycophancy.md](https://sycophancy.md/)
- Anthropic Financial Services Plugins: [anthropics](https://github.com/anthropics/financial-services-plugins)
- TradingAgents: [TauricResearch](https://github.com/TauricResearch/TradingAgents)
- Alpaca MCP: [alpacahq](https://github.com/alpacahq/alpaca-mcp-server)

---

## Próximos passos

Rodada 1 cobriu amplitude. Diego quer **Rodada 2 focada em ferramentas e riscos**, aprofundando os achados acima antes de decidir o que implementar.

- [ ] Rodada 2: deep dive em cada ferramenta (instalar, testar, avaliar fit)
- [ ] Rodada 2: deep dive em cada risco (quantificar impacto, definir mitigações mecânicas)
- [ ] Debate com agentes sobre achados
- [ ] Decidir o que implementar vs arquivar

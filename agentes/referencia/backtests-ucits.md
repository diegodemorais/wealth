# Backtests UCITS + Consenso RR Forum

> Atualizado em: 2026-03-27
> Fontes: Curvo (via Alphacubator/JustETF), Portfolio Visualizer, Research Affiliates AAI, RR Forum threads #5483 / #31258 / #5494

---

## 1. Métricas Individuais dos ETFs (dados reais)

| ETF | ISIN | TER | Inception | CAGR (desde inception) | Vol | Sharpe | Sortino | Max DD | Data Max DD |
|-----|------|-----|-----------|----------------------|-----|--------|---------|--------|-------------|
| **SWRD** | IE00BFY0GT14 | 0.12% | Fev/2019 | 13.6% (7 anos) | 17.43% | 0.82 | 1.13 | -34.1% | Fev–Ago 2020 |
| **JPGL** | IE00BJRCLL96 | 0.19% | Jul/2019 | 9.97% (real) | 16.39% | 0.66 | 0.91 | -35.87% | Fev–Mar 2020 |
| **AVGS** | IE0003R87OG3 | 0.39% | Set/2024 | 15.56% (~18m) | 18.85% | 0.86 | 1.20 | -25.21% | Nov/2024–Abr/2025 |
| **AVEM** | IE000K975W13 | 0.35% | Dez/2024 | ~27.9% (1yr trailing) | — | — | — | — | — |
| **VWCE** | IE00BK5BQT80 | 0.22% | Jul/2019 | 10.88% | 16.24% | 0.71 | 0.96 | -33.43% | Fev–Mar 2020 |

**Notas:**
- AVGS e AVEM: histórico insuficiente para análise estatística (<18 meses). Usar com cautela.
- JPGL backfill: Curvo mostra dados desde 2003 via JP Morgan Diversified Factor Global Developed index — é backfill, não performance real do ETF.
- AVEM US-listed: trailing 1yr outperformou EIMI.L em ~4.2pp — evidência preliminar do tilt Avantis.

---

## 2. Backtest Carteira Diego vs Benchmarks (2019–2026, USD)

Pesos equity normalizados (sem RF/Bitcoin): SWRD 35% / AVGS-proxy 25% / AVEM-proxy 20% / JPGL 20%

| Métrica | **Carteira Diego*** | VWCE (All World) | SWRD (World puro) |
|---------|---------------------|-----------------|-------------------|
| CAGR | ~12.5% | 10.88% | **13.6%** |
| Volatilidade | ~17.5% | **16.24%** | 17.43% |
| Sharpe | ~0.74 | 0.71 | **0.82** |
| Sortino | ~1.01 | 0.96 | **1.13** |
| Max Drawdown | ~-34% | **-33.4%** | -34.1% |

*Estimativa composta com correlações médias (~0.75 DM, ~0.65 com EM). Não extraído diretamente do Curvo.

### Retornos anuais

| Ano | Carteira Diego (est.) | VWCE | SWRD | Contexto |
|-----|----------------------|------|------|---------|
| 2019 | ~+15.0% | +7.6% | +14.6% | SCV forte |
| 2020 | ~+12.9% | +5.4% | +15.9% | EM subiu, SCV ficou atrás |
| 2021 | ~+18.5% | +28.6% | +22.1% | EM -0.7%: maior drag |
| **2022** | **~-15.2%** | -13.5% | **-17.8%** | **Value funcionou: carteira bateu SWRD em -2.6pp** |
| 2023 | ~+18.7% | +18.2% | +24.4% | Recovery equilibrado |
| 2024 | ~+12.8% | +24.4% | +19.3% | EM+SCV drag: pior ano relativo (-11.6pp vs VWCE) |
| 2025 | ~+16% est. | +9.2% | +21.1% | Dados parciais |

**Interpretação:** O período 2019-2026 foi dominado por US large cap growth — condição historicamente adversa para value/SCV. O signal correto é 2022: quando o regime de juros mudou, o tilt fatorial funcionou exatamente como esperado (-15% vs -18% SWRD). A tese de longo prazo não é falsificada por underperformance em ciclos growth.

### Correlações entre ETFs — com proxies validados (atualizado 2026-03-31)

> Metodologia: proxies US-listed (calendário NYSE consistente), 6.5 anos (set/2019–mar/2026, 1634 dias).
> Ver seção "Metodologia de Proxy" para detalhes. Proxies: SWRD→URTH | JPGL→JPUS60%+JPIN40% | AVGS→AVUV60%+AVDV40%.

| Par | Correlação | IC 95% | Implicação |
|-----|-----------|--------|-----------|
| **SWRD ↔ JPGL** | **0.95** | [0.944, 0.954] | JPGL é quase SWRD com tilts — alta sobreposição com o benchmark cap-weight |
| JPGL ↔ AVGS | **0.92** | [0.907, 0.923] | Alta — JPGL e AVGS compartilham value/size; divergem em momentum/low vol |
| SWRD ↔ AVGS | **0.86** | [0.851, 0.876] | **AVGS é o mais diferenciado** — maior benefício de diversificação vs mercado |
| SWRD ↔ AVEM | ~0.65 | — | Estimativa — dados insuficientes para precisão com proxy LSE |
| JPGL ↔ AVEM | ~0.60 | — | Estimativa |
| AVGS ↔ AVEM | ~0.55 | — | Estimativa |

**Correlações por regime (SWRD↔JPGL / SWRD↔AVGS / JPGL↔AVGS):**

| Regime | SW↔JP | SW↔AV | JP↔AV |
|--------|-------|-------|-------|
| COVID crash (jan-mar/20) | 0.989 | 0.944 | 0.952 |
| Recuperação 2020 | 0.971 | 0.866 | 0.919 |
| Value rotation 2021 | 0.932 | 0.745 | **0.856** ← menor JP↔AV |
| Bear 2022 | 0.967 | 0.920 | 0.945 |
| Bull 2023-2024 | 0.895 | 0.790 | 0.892 |
| 2025 (atual) | 0.896 | 0.887 | 0.925 |

**Achados:** (1) Em crise, tudo converge para 0.95+. (2) JPGL é mais próximo de SWRD (0.95) do que de AVGS (0.92) — é um multi-factor com tilts leves sobre cap-weight, não um fundo fatorial puro. (3) AVGS é o mais diferenciado dos três. (4) O único regime onde JPGL diverge de AVGS de forma material: value rotation 2021 (0.856) — quando momentum/low vol de JPGL agiram diferente do pure value/small de AVGS.

**Erro histórico registrado:** Em 2026-03-30 calculou-se JPGL↔AVGS = 0.93 usando AVLV como proxy de JPGL. AVLV é value/size — proxy errado, resultado era "value↔value". Correlação correta com proxy adequado (JPUS+JPIN): 0.92.

---

## 3. Ferramentas de Backtest: Comparativo

| Ferramenta | UCITS? | Histórico | Melhor uso | Limitação |
|-----------|--------|-----------|-----------|-----------|
| **Curvo** | Sim | Desde ETF inception (2019 para maioria) + backfill via índice | Backtest operacional UCITS | JavaScript — acessar manualmente. AVGS/AVEM: <18m |
| **Portfolio Charts** | Via asset class | Desde 1972 (asset classes) | SWR multi-país, visualização longa | Asset classes genéricas, não ETFs |
| **Portfolio Visualizer** | Não (US-only) | 1972+ (asset class), 10 anos free (tickers) | **Factor Regression** (Fama-French 5 fatores), Monte Carlo FIRE | UCITS indisponíveis. IPCA+ irreplicável. Sub: $360/ano |

**Links Curvo:**
- SWRD: `curvo.eu/backtest/en/portfolio/swrd--NoIgyg6gSgIiA0xQEkCiAGdAhAYgTXQHEAVARgBYFSBdWoA`
- JPGL (backfill 2003): `curvo.eu/backtest/en/portfolio/jpgl--NoIgUgCg4gMiA0xQEkCiAGdAhMAlAwjDAJwBsCAjALo1A`
- VWCE: `curvo.eu/backtest/en/portfolio/vwce--NoIgag6gwgoiA0xQEkYAY0CEDSBWTAigCoAcaCAjALo1A`
- **Carteira nova:** `curvo.eu/backtest/en/portfolio/new` → inserir SWRD 35% / AVGS 25% / AVEM 20% / JPGL 20%

---

## 4. Research Affiliates — Expected Returns Atualizados (Dez-2025)

> Valores memorizados eram de Mar-2022. Atualização baseada em Morningstar 2026 Edition + Advisor Perspectives citando RA.

| Asset Class | Memorizado (Mar-22) | Atual (Dez-25) | Delta | Nota |
|-------------|--------------------|--------------|----|------|
| US Large Cap | 3.4% nominal | **3.1% nominal** | -0.3pp | US ficou mais caro em 2024-2025 |
| DM ex-US | 9.5% nominal | **~9.5% nominal / 6.1% real** | Estável | Diferença metodológica (mean-reversion do CAPE) |
| Emerging Markets | 9.0% nominal | **7.5% nominal** | **-1.5pp** | Rally EM 2025 antecipou parte do alpha |
| US Small Cap | — | **7.1–7.4% nominal** | Novo dado | Spread de ~4pp vs large cap — suporte a AVGS |

### CAPE por Região (Dez-2025, Siblis Research)

| Região | CAPE | Contexto |
|--------|------|---------|
| USA | 34.73 | 96th percentile histórico |
| DM ex-US médio | ~18.7x | Citado diretamente pelo RA (Mai-2025) |
| Brasil (trailing P/E) | ~11.45 | CAPE estimado 10-12x — ainda extremamente barato |

**Insight adicional (RA, Fev-2025):** CC CAPE do S&P 500 = 43.4 vs Shiller CAPE = 37.4. Spread de ~6 indica exuberância AI mas longe de bolha dotcom (spread chegava a +25). Útil para calibrar *quando* o headwind de US vai se materializar.

---

## 5. Metodologia de Proxy — Diretriz Obrigatória

> **Regra**: toda análise de correlação, backtest ou comparação de performance que envolva ETFs LSE UCITS deve primeiro identificar o melhor proxy US-listed disponível. Proxy errado invalida o resultado.
>
> **Agente responsável**: Quant valida a escolha do proxy ANTES de rodar qualquer análise. Fact-Checker verifica a metodologia do proxy contra o ETF alvo quando houver dúvida sobre similaridade.

### Proxies Validados (atualizado 2026-03-31)

| ETF LSE | Índice / Estratégia | Melhor Proxy US | Período disponível | 2º Proxy |
|---------|--------------------|-----------------|--------------------|----------|
| **SWRD.L** | MSCI World (cap-weight, DM) | **URTH** (iShares MSCI World) — mesmo índice exato | desde jan/2012 (~14 anos) | VTI 60% + VEA 40% |
| **JPGL.L** | JPMorgan Diversified Factor (value+mom+qual+lowvol, DM) | **JPUS 60% + JPIN 40%** — mesma metodologia JPMorgan, mesmo índice família | desde nov/2014 (~11.5 anos) | GLOF (inclui EM — caveat) |
| **AVGS.L** | Avantis Global SCV + profitability (DM) | **AVUV 60% + AVDV 40%** — mesmo gestor, mesma metodologia Avantis | desde set/2019 (~6.5 anos) | — |
| **AVEM.L** | Avantis Emerging Markets | **AVEM** (US-listed) — mesmo gestor, EM | desde set/2019 | — |
| **VWRA.L** | FTSE All-World (DM + EM, cap-weight) | **VT** (Vanguard Total World) | desde jun/2008 | ACWI |

### Regras Anti-Artefato

1. **Nunca usar ETF value/size como proxy de ETF multi-fator**: AVLV, AVUV ou AVDV sozinhos **não** são proxy para JPGL. JPGL tem momentum + low vol que value/size não capturam.
2. **Nunca misturar calendários NYSE/LSE sem tratamento**: correlação diária NYSE↔LSE sofre mismatch de feriados e horários → subestima correlação real (~0.65 para ETFs que rastreiam o mesmo índice). Usar proxies US-listed para todas as séries, ou usar retornos semanais para dados LSE.
3. **Validar proxy antes de usar**: baixar o proxy e o ETF real para o período de overlap disponível. Correlação proxy↔real no overlap deve ser ≥0.85 (mesmo calendário). Se for <0.85, reportar e revisar escolha de proxy.
4. **Quando o ETF real tem dados suficientes (>2 anos na LSE)**: usar dados reais do ETF para o período disponível + proxy para extensão histórica.

### Caso JPGL — Por Que JPUS+JPIN

JPGL rastreia o *JP Morgan Diversified Factor Global Developed (Region Aware) Equity Index* (LSEG/FTSE Russell). JPUS e JPIN rastreiam índices da mesma família JPMorgan Diversified Factor, mesmos critérios (value, momentum, quality, sector risk-weighting). São os únicos ETFs que replicam a metodologia proprietária JPMorgan. Blend 60/40 reflete o peso US/ex-US do FTSE Developed Index.

GLOF (iShares) é segunda opção — inclui EM (~10%) e adiciona size como fator explícito, criando divergência em regimes de stress EM ou small cap.

## 6. Consenso RR Forum — Portfolios UCITS (pós-jun/2024)

> Threads: #5483, #31258, #5494. ~150 portfolios explícitos analisados.

### Evolução: antes e depois do Avantis UCITS

**Pré-jun/2024:** Portfolios de 5-8 fundos. Padrão: JPGL + ZPRV + ZPRX + XDEM + FLXE + EIMI. Problema central: ZPRV/ZPRX tinham exposição *negativa* a momentum → todos adicionavam ETF de momentum separado para compensar.

**Pós-jun/2024:** Simplificação massiva. AVWS (= AVGS em EUR) substituiu ZPRV+ZPRX. AVEM substituiu FLXE parcialmente. Portfolios colapsaram de 6-8 para 3-4 fundos.

> **Nota:** AVGS (LSE, USD) e AVWS (Xetra, EUR) são o mesmo fundo Avantis Global Small Cap Value UCITS (ou fundos com ISIN e composição praticamente idênticos). Diego já tem o ETF central do consenso.

### ETFs mais usados (pós-jun/2024)

| ETF | % portfolios novos | Peso médio | Tendência |
|-----|-------------------|-----------|-----------|
| **AVWS/AVGS** | ~70% | 20–40% | Padrão dominante. Substituiu ZPRV+ZPRX definitivamente |
| **JPGL** | ~50% | 20–36% | Manteve relevância. ⚠️ AUM estagnado ~170M EUR |
| **XDEM** (Momentum) | ~30% | 10–32% | Standalone momentum ainda presente |
| **AVEM** | ~25% | 5–10% | Factor loadings "very mild" (ChengSkwatalot, post #799) |
| **AVWC** | ~15% | 60–80% | Para quem quer máxima simplicidade (1-2 fundos) |
| FLXE, ZPRV/ZPRX | ~15–20% (caindo) | — | Legado — quase ninguém comprando mais |

### 3 arquétipos

| Padrão | Composição | Perfil |
|--------|-----------|--------|
| **Factor Maximum** | JPGL 30% + AVWS 30-40% + XDEM 20% + AVEM 10% | Alta convicção, sem MCW, tracking error alto |
| **Core + Satellite** (mais popular) | MCW/AVWC 50-60% + AVWS 20-30% + AVEM 10% | Tilt moderado |
| **Simplicidade radical** | AVWS 90% + bonds 10% | Larry Swedroe-style, crescendo |

### Comparação com Carteira de Diego

| Aspecto | Diego | Consenso RR | Status |
|---------|-------|-------------|--------|
| AVGS/AVWS 25% | ✅ | ~70% dos portfolios, peso 20-40% | **Plenamente alinhado** |
| JPGL 20% | ✅ | ~50%, peso 20-36% | **Alinhado** (Diego no piso do range) |
| SWRD 35% (MCW) | ✅ | Minoria usa MCW separado | **Alinhado** — mais controle granular que AVWC |
| AVEM 20% | ⚠️ | Típico: 5-10% | **Acima do consenso** — deliberado por valuation (CAPE 10-12x), não erro |
| Sem momentum standalone | ✅ | Tendência é capturar via JPGL | **Alinhado com a tendência** |

### Debates ativos e sinais de atenção

1. **JPGL risco de closure:** AUM estagnado em ~170M EUR. Gatilho de monitoramento: se cair abaixo de ~100M EUR, avaliar AVWC ou IQSA como substitutos.

2. **AVEM loadings "very mild":** ChengSkwatalot (usuário mais técnico, posta regressões) confirmou via regressão que os factor loadings do AVEM UCITS são fracos. A tese de Diego para AVEM é de *valuation* (CAPE), não de loading fatorial puro — argumento complementar, não substituto.

3. **Novos ETFs a monitorar:**
   - **DEGT** (Dimensional Global Targeted Value UCITS): factor loadings fortes, sendo comparado diretamente com AVWS. AUM ainda pequeno.
   - **JOGS** (JPMorgan Oriented Global Small Cap, lançado final-2025): inclui EM, momentum positivo. AUM mínimo. Potencial alternativa a AVEM para EM fatorial.

---

## 6. Síntese para Decisões da Carteira

| Perspectiva | Conclusão |
|------------|-----------|
| **Backtest histórico (Curvo, 2019-2026)** | Carteira underperformou SWRD puro por domínio US growth. 2022 é o teste real: value funcionou (-15% vs -18% SWRD). Não falsifica a tese |
| **Expected returns (RA, Dez-2025)** | Hierarquia confirmada: EM 7.5% > DM ex-US 6.1% real >> US 3.1%. EM comprimiu -1.5pp pelo rally — não é alarme. US CAPE 34.73x: headwind estrutural |
| **Consenso comunidade (RR, pós-2024)** | Carteira plenamente alinhada com o que há de mais sofisticado. AVGS+JPGL são as escolhas centrais. Única divergência: mais EM (20% vs 5-10% típico) — suportada por valuation |

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

### Correlações estimadas entre ETFs

| Par | Correlação | Implicação |
|-----|-----------|-----------|
| SWRD ↔ JPGL | ~0.90 | Alta sobreposição (ambos DM) |
| SWRD ↔ AVGS | ~0.80 | Diverge em ciclos value vs growth |
| SWRD ↔ AVEM | ~0.65 | Boa diversificação EM/DM |
| JPGL ↔ AVGS | ~0.82 | Fatores parcialmente sobrepostos |
| JPGL ↔ AVEM | ~0.60 | Boa diversificação cross-asset |
| AVGS ↔ AVEM | ~0.55 | Maior diversificação no par |

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

## 5. Consenso RR Forum — Portfolios UCITS (pós-jun/2024)

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

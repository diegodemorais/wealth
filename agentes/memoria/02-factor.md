# Memoria: Especialista em Factor Investing

> Somente decisoes confirmadas por Diego sao registradas aqui.

---

## Decisoes Confirmadas

| Data | Decisao | Racional | Agentes Consultados |
|------|---------|----------|---------------------|
| 2026-04-01 | Bloco equity fixo: SWRD 50%, AVGS 30%, AVEM 20% | FI-equity-redistribuicao, unanimidade 7/7. JPGL eliminado (0% target) — FI-jpgl-zerobased | 7 agentes |
| 2026-04-01 | Premissas multi-fonte adotadas: SWRD 3.7% USD, AVGS 5.0% USD, AVEM 5.0% USD | FI-premissas-retorno — substituiu premissas DMS+AQR single-source. Mediana 5-6 fontes independentes. Base BRL: 4.85% ponderado (cenario base) | Factor, Quant, Fact-Checker, Advocate |
| 2026-04-01 | Novos aportes equity exclusivamente em UCITS | Estate tax US-listed confirmado. Transitórios (AVDV, AVUV, AVES, USSC, DGS, EIMI) vendidos na fase de usufruto | Head, Tax |

---

## Aprendizados

### Momentum: evidencia academica robusta, captura via ETF standalone comprometida
O momentum premium e um dos fatores mais documentados (Jegadeesh & Titman 1993, Asness et al. 2013), mas ETFs standalone enfrentam um trade-off estrutural entre captura do premium e custos:
- **Turnover extremo**: o indice MSCI World Momentum tem ~93% de one-way turnover anual — o mais alto entre fatores. Custos de transacao corroem parte significativa do premium bruto.
- **Dilema de rebalanceamento**: momentum exige rotacao frequente, mas ETFs rebalanceiam trimestral ou semestralmente para conter custos. Resultado: capturam momentum defasado e sofrem com reversoes entre datas de rebalanceamento.
- **Concentracao setorial no IWMO**: Tech 35%, Financials 23% (dados recentes). Outperformance recente do IWMO coincide com rally de large cap tech — dificulta isolar quanto do retorno vem de momentum puro vs exposicao indireta a large cap growth.
- **Conclusao para a carteira**: momentum e mais eficiente como criterio de weighting/selection dentro de um fundo multifator (como JPGL faz — combina value, momentum, low vol e size) do que como exposicao standalone. Por isso IWMO foi descartado.

### Proatividade em debates macro/geopoliticos (aprendizado retro 2026-03-22)
Em debates sobre cenarios macro ou geopoliticos, Factor deve entrar proativamente com analise de impacto fatorial — sem esperar ser acionado. No debate de guerra (marco 2026), o argumento mais forte foi o de Factor (HML +189% em WWII, +150% na crise do petroleo — Quantpedia/Fama-French), mas so apareceu porque o Head acionou. Da proxima vez, ao ver debate macro relevante iniciado, Factor entra automaticamente com: "impacto nos fatores da carteira (value, small, momentum, low vol) = X".

### JPGL: decisão final e tese completa (FI-jpgl-redundancia, 2026-03-31)

**Decisão confirmada por Diego: MANTER JPGL 20%. Voto 7-0.**

**Correlações (proxies validados, NYSE calendar, 6.5 anos):**
- SWRD ↔ JPGL: **0.95** — JPGL é quase SWRD com tilts leves.
- JPGL ↔ AVGS: **0.92**
- SWRD ↔ AVGS: **0.86** — AVGS é o mais diferenciado dos três

**Factor regression (OLS, FF5 + momentum, 79 meses):**
- Alpha: -2.33%/ano, t=-1.49 → **não significativo** (regime adverso, não estrutural)
- SMB, HML, RMW, MOM: todos *** — 4 loadings confirmados ao vivo

**22 anos do índice (Investmentmoats, 2001-2022):**
- JPGL index: +10.2%/ano (10yr rolling) vs MSCI World 7.2% → premium de +3pp/ano
- 2008-2022 foi o ÚNICO período onde cap-weight ganhou de multi-factor. Período 2019-2026 = exceção, não regra.

**Premissas incorretas que geraram debate desnecessário (registrar para não repetir):**
1. **AVLV como proxy de JPGL**: errado — AVLV é value/size, não captura momentum/low vol. Proxy correto: JPUS 60% + JPIN 40%.
2. **FI-004 alpha +1.88%/ano**: backfill bias — foi backtest do índice desde 2003, não performance real do ETF pós-2019.
3. **Sector-neutral drag (FAJ 2023)**: não se aplica — JPGL usa inverse-vol weighting, não sector-neutral puro. FAJ 2023 só testou equal/rank/value-weighted.
4. **Delta JPGL vs AVGS = 4.3pp/ano**: era delta histórico de proxies. Delta correto = premissas aprovadas: 0.3pp × 20% = **6bp no portfolio total**.
5. **AUM estagnado**: falso — €213M crescendo +25%.
6. **IQSA = "MSCI World Multifactor"**: falso — é Invesco Global Active ESG, ativamente gerido + ESG screen. Não é substituto direto.

**Alternativas investigadas e descartadas para agora:**
- IQSA: ativo + ESG — mais complexo que JPGL sem vantagem clara
- IQGA: <1 ano de histórico — avaliar 2027+
- DEGT (Dimensional): compete com AVGS, não com JPGL
- Vanguard novos UCITS: passivos por size/style, sem multi-factor
- IFSW: válido mas sem momentum positivo como JPGL

### IFSW vs JPGL: loadings comparados (jan/2020–mar/2026, 1515 obs)

Regressão FF5+MOM nos ETFs reais LSE. IFSW = iShares MSCI World Multifactor (alternativa mais próxima de JPGL).

| Fator | JPGL | IFSW | WSML | AVGS | SWRD |
|-------|------|------|------|------|------|
| Market (beta) | 0.423*** | 0.494*** | 0.504*** | 0.931*** | 0.925*** |
| Size | 0.042 n.s. | 0.045 n.s. | 0.301*** | 0.605*** | -0.041*** |
| Value | 0.286*** | 0.252*** | 0.310*** | 0.395*** | 0.044*** |
| Profitability | -0.044 n.s. | -0.031 n.s. | -0.203*** | 0.064*** | 0.008 n.s. |
| Investment | -0.058 n.s. | **-0.182***  | -0.197*** | 0.013 n.s. | 0.038*** |
| Momentum | -0.027 n.s. | **+0.033*** | -0.021 n.s. | -0.012 n.s. | -0.014*** |
| Alpha/ano | +3.8% n.s. | +3.6% n.s. | +3.8% n.s. | +3.1% n.s. | -0.1% n.s. |
| R² | 0.377 | 0.379 | 0.438 | 0.939 | 0.968 |

**Conclusões:**
- JPGL e IFSW são **essencialmente o mesmo fundo** em termos de loadings. Diferenças: IFSW tem Investment mais negativo (-0.182***) e Momentum marginalmente positivo (+0.033*). JPGL tem Market beta menor (0.423 vs 0.494) — mais defensivo.
- WSML (small cap puro): Size e Value fortes, mas Profitability e Investment **negativos*** — "small junk" sem filtro de qualidade. Errado para captura de prêmio fatorial.
- AVGS: Size dominante (0.605***) + Value forte (0.395***) + Profitability positivo. Conforme esperado — small-cap value com qualidade.
- **Momentum JPGL = -0.027 (não significativo)**. Provavelmente artefato dos fatores FF americanos sendo aplicados a ETF global com inverse-vol. Não indica ausência de momentum no design — indica limitação metodológica do proxy.
- **Haircut fatorial correto: 58%** (McLean & Pontiff 2016) — NÃO 35-40%. Registrado em `feedback_haircut_fatorial.md`. FI-crowdedness usou 35-40% por erro — desconsiderar.

### JPGL: disambiguacao de ticker
JPGL na carteira = **sempre** JPMorgan Global Equity Multi-Factor UCITS ETF (Acc), ISIN IE00BJRCLL96, domiciliado na Irlanda, listado na LSE. TER 0,19%. Accumulating (reinveste dividendos). Existe o ticker JPLG (letras invertidas) na LSE que pode gerar confusao — nao e o mesmo. Em qualquer contexto, JPGL = multifator Irlanda.

---

## Gatilhos Ativos

| Gatilho | Condição | Ação | Status |
|---------|----------|------|--------|
| **Rolling: AVGS SMB** | AVGS SMB < 0.35 por 2 trimestres consecutivos | Dados insuficientes até out/2026 (AVGS lançado out/2024) | Aguardar |
| AVGS AUM closure risk | AUM AVGS < €50M | Abrir issue — avaliar substituto (WSML/DFSV) | Monitorar |
| Premissas desatualizadas | AQR ou Vanguard atualizam expected returns > 50bps de variação | Recalcular ponderado e verificar P(FIRE) | Monitorar anual |

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-04-01 | Composicao bloco equity final | SWRD 50%, AVGS 30%, AVEM 20% (JPGL eliminado) |
| 2026-04-01 | Premissas retorno base | SWRD 3.7% / AVGS 5.0% / AVEM 5.0% USD real. Ponderado base: 4.85% BRL |
| 2026-04-01 | Redistributicao JPGL→equity | Zero-based: JPGL 0%. Slash por redundancia (corr 0.95 com SWRD) e TER extra 11bps |
| 2026-03 | AVGC vs JPGL vs DDGC (FI-003) | JPGL confirmado historicamente — mas eliminado 2026-04-01 por redundancia |
| 2026-03 | IPCA+ vs equity nos proximos 11 anos | Equity after-tax superior (calculado com premissas antigas — recalcular com 4.85% base) |

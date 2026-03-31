# Memoria: Especialista em Factor Investing

> Somente decisoes confirmadas por Diego sao registradas aqui.

---

## Decisoes Confirmadas

| Data | Decisao | Racional | Agentes Consultados |
|------|---------|----------|---------------------|
| 2026-03 | Bloco equity fixo: SWRD 35%, AVGS 25%, AVEM 20%, JPGL 20% | Alocacao definitiva | 01 Head |
| 2026-03 | JPGL foco dos aportes regulares (quando nao ha janela tatica) | Prioridade padrao de aporte | 01 Head |

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

### JPGL: disambiguacao de ticker
JPGL na carteira = **sempre** JPMorgan Global Equity Multi-Factor UCITS ETF (Acc), ISIN IE00BJRCLL96, domiciliado na Irlanda, listado na LSE. TER 0,19%. Accumulating (reinveste dividendos). Existe o ticker JPLG (letras invertidas) na LSE que pode gerar confusao — nao e o mesmo. Em qualquer contexto, JPGL = multifator Irlanda.

---

## Gatilhos Ativos

| Gatilho | Condição | Ação | Status |
|---------|----------|------|--------|
| AUM closure risk | AUM JPGL < €100M | Abrir issue — avaliar substituição | Monitorar |
| Underperformance persistente | JPGL underperforma SWRD por 2 anos consecutivos (até dez/2028) | Abrir issue de substituição | Monitorar |
| Alternativa IQGA | AUM > €500M + histórico ≥ 2 anos (previsão: 2027+) | Comparar TER, loadings e correlação vs JPGL | Monitorar |
| Alpha estrutural negativo | t < -2.0 em regressão com ≥ 5 anos dados reais | Abrir issue urgente | Monitorar |
| Mudança de metodologia JPGL | JPMorgan alterar índice (remover momentum, mudar para sector-neutral puro) | Rever tese imediatamente | Monitorar |

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03 | Composicao do bloco equity | SWRD 35%, AVGS 25%, AVEM 20%, JPGL 20% |
| 2026-03 | JPGL sizing: 15% ou 20%? | 20% — melhor multifator disponivel |
| 2026-03 | AVGC vs JPGL vs DDGC (FI-003) | JPGL confirmado — complementa com momentum + low vol. AVGC closet indexing (overlap 90% SWRD). DDGC monitorar 2 anos |
| 2026-03 | AVEM->JPGL migration timing | Adiado — value spread de EM favoravel |
| 2026-03 | IWMO vs JPGL | JPGL preferido — momentum mais eficiente dentro de multifator |
| 2026-03 | IPCA+ vs equity nos proximos 11 anos | Equity after-tax superior |

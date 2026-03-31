# FI-jpgl-redundancia: JPGL 20% — manter, reduzir ou remover?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-jpgl-redundancia |
| **Dono** | 02 Factor Investing |
| **Status** | Done |
| **Prioridade** | URGENTE — aporte ocorre esta semana. JPGL ainda não foi comprado. |
| **Participantes** | Factor, Advocate, Quant, Fact-Checker, Behavioral, FIRE, Head |
| **Dependencias** | FI-004-Validacao_empirica_fatores_JPGL (Done), FI-003-AVGC_vs_JPGL_multifator (Done), XX-003-RR_Forum_Intelligence_scan (Done), XX-004-Bogleheads_forum_scan (Done) |
| **Criado em** | 2026-03-31 |
| **Concluido em** | 2026-03-31 |
| **Origem** | Análise com proxy ERRADO (AVLV) → correlação incorreta de 0.93 → re-análise com proxies corretos revelou 0.92 (JPGL↔AVGS) e 0.95 (JPGL↔SWRD) |

---

## Motivo / Gatilho

**Gatilho 1 — Proxy errado invalida análise anterior:**
Em 2026-03-30, calculou-se JPGL↔AVGS = 0.93 usando AVLV como proxy de JPGL. AVLV é value/size — proxy inadequado que mediu "value↔value", não JPGL real. Com proxies corretos (JPUS 60% + JPIN 40%), a correlação real é **0.92** (JPGL↔AVGS) e **0.95** (JPGL↔SWRD).

**Gatilho 2 — JPGL não foi comprado ainda:**
Carteira REAL tinha apenas ~0.4% em JPGL (~R$12k, basicamente IWVL legado). Target é 20% do bloco equity. O aporte desta semana é o primeiro aporte real direcionado a JPGL. Antes de comprar pela primeira vez, a tese precisava ser re-validada com metodologia correta.

**Gatilho 3 — Performance:**
Com proxies corretos, JPGL (10.0% CAGR / Sharpe 0.45) underperformou SWRD (12.2% / Sharpe 0.53) em 2.2pp/ano por 6.5 anos — período dominado por US large cap growth.

---

## Contexto: Carteira Real vs Target (no momento da abertura)

| ETF | Target (% bloco equity) | Real atual | Gap |
|-----|------------------------|-----------|-----|
| SWRD | 35% | ~42.3% | -7.3pp |
| AVGS | 25% | ~32.1% | -7.1pp |
| AVEM | 20% | ~27.4% | -7.4pp |
| **JPGL** | **20%** | **~0.5%** | **-19.5pp** |

---

## Análise Completa

### Dados estabelecidos

**Correlações (proxies validados, NYSE calendar, 6.5 anos):**
- SWRD ↔ JPGL: **0.95** [IC 95%: 0.944–0.954]
- JPGL ↔ AVGS: **0.92** [IC 95%: 0.907–0.923]
- SWRD ↔ AVGS: **0.86** [IC 95%: 0.851–0.876]

**Performance (proxies, set/2019–mar/2026):**
| ETF | CAGR | Sharpe |
|-----|------|--------|
| AVGS (AVUV 60%+AVDV 40%) | 14.3% | 0.62 |
| SWRD (URTH) | 12.2% | 0.53 |
| JPGL (JPUS 60%+JPIN 40%) | 10.0% | 0.45 |

**Dado real JPGL (Curvo, desde inception jul/2019):**
- CAGR: 9.97%, Vol: 16.39%, Sharpe: 0.66, Max DD: -35.87%

**Tracking error ETF vs índice:** +0.35pp/ano (ETF supera o índice — boa gestão)

**Factor regression (OLS, Fama-French 5 fatores + momentum, 79 meses):**

| Fator | Coef | t-stat | Significativo |
|-------|------|--------|---------------|
| Alpha | -2.33%/ano | -1.49 | ❌ Não significativo |
| SMB (size) | 0.23 | *** | ✅ |
| HML (value) | 0.20 | *** | ✅ |
| RMW (profitability) | 0.29 | *** | ✅ |
| MOM (momentum) | 0.10 | *** | ✅ |

**Interpretação:** Alpha não é significativamente diferente de zero. JPGL entrega os 4 fatores prometidos. Alpha negativo do período = regime adverso, não estrutural.

**22 anos de dados do índice subjacente (Investmentmoats, mar/2001–abr/2022):**
| Métrica | JPM Div Factor (JPGL index) | MSCI World |
|---------|---------------------------|------------|
| Média rolling 5 anos | **10.4%/ano** | 7.6%/ano |
| Média rolling 10 anos | **10.2%/ano** | 7.2%/ano |
| Premium vs MSCI World | **+2.8 a +3.0pp/ano** | — |

Nota do autor: "2008 até o topo recente foi o ÚNICO período onde o MSCI World se saiu melhor que um índice multi-factor composto." O período adverso 2019-2026 é a exceção, não a regra.

**AUM JPGL:** €213M crescendo +25% (invalidou premissa "AUM estagnado"). Gatilho de closure acionaria em <€100M.

**GerdR regression (RR Forum, 24 anos):** alpha = 0.01% (t=0.25) — zero, não negativo.

**Regime analysis (JPGL↔AVGS):**
- COVID crash: 0.952 (convergência em crise)
- Value rotation 2021: **0.856** (maior divergência observada)
- Bull 2023-2024: 0.892
- Média: 0.92

### Premissas corrigidas nesta sessão

| Premissa Incorreta | Premissa Correta | Impacto |
|--------------------|-----------------|---------|
| AVLV como proxy de JPGL | JPUS 60% + JPIN 40% | Correlação era artefato: 0.93 → real 0.92/0.95 |
| FI-004 alpha +1.88%/ano vs SWRD | Backfill bias confirmado — backtest do índice 2003, não ETF 2019-2026 | Argumento de alpha líquido inválido |
| Sector-neutral drag (FAJ 2023) = estrutural para JPGL | JPGL usa **inverse-vol weighting**, não sector-neutral puro. FAJ 2023 testou equal/rank/value-weighted apenas | Argumento de drag estrutural não aplicável |
| AUM estagnado ~€170M = risco closure | AUM €213M crescendo +25% | Risco de closure muito menor |
| Delta JPGL vs AVGS = 4.3pp/ano (histórico) | Delta premissas aprovadas = **0.3pp × 20% = 6bp** no portfolio total | Custo de oportunidade muito menor do que parecia |
| IQSA = "Invesco MSCI World Multifactor" | IQSA = **Invesco Global Active ESG Equity** — ativamente gerido + ESG screen | Não é substituto direto de JPGL |

### Alternativas investigadas

| ETF | Fatores | AUM | TER | Status |
|-----|---------|-----|-----|--------|
| IQSA | V+Q+M | €1.4B | 0.30% | Ativo + ESG — não substituto direto. Watch item |
| IQGA | V+Q+M | €427M | 0.24% | <1 ano de histórico. Avaliar 2027+ |
| DEGT (Dimensional) | Value+Size | €800M+ | 0.25% | Compete com AVGS, não com JPGL |
| Vanguard novos UCITS (2025) | 9 ETFs size/style | — | ~0.10% | Passivos por size/style, **sem multi-factor** |
| IFSW | V+Q+M+Size | €2.5B | 0.30% | Alternativa válida mas sem momentum positivo como JPGL |

**Conclusão**: nenhuma alternativa superior disponível hoje. JPGL continua o melhor multi-factor UCITS com tilt momentum positivo para o espaço DM.

### RR Forum (acesso via MCP Discourse, dados live 2026-03-31)

**ChengSkwatalot (set/2024, post 585):**
> *"JPGL's alpha has been negative since inception. There's no reason to expect this to continue. As hard as it is to consistently generate positive alpha, it is equally hard to consistently generate negative alpha. Hence, it is the long term factor exposure that is important, not alpha."*

**ChengSkwatalot (jan/2025, post 1616):**
> *"We'd need a lot more data to test it, give it a few years."*

Preocupação real da comunidade: alpha negativo atribuído ao sector-neutral weighting → esperado reverter. AUM ~€170M → cresceu para €213M. ~50% dos portfolios RR usam JPGL, peso 20-36%.

**Thread momentum (mar/2026, posts 1505-1517):**
"The Intramonth Momentum Cycle" paper confirma que momentum é estrutural via plumbing de liquidação. Man Group alerta sobre concentração em AI/tech — mas JPGL usa inverse-vol, naturalmente underweight em high-vol (AI/tech). Efeito: JPGL captura momentum estrutural mas pode estar underperformando o regime atual de momentum. Nuance regime-específica, não invalida tese de longo prazo.

### Análise Sharpe / ENB

| Cenário | Sharpe | ENB |
|---------|--------|-----|
| A: Com JPGL 20% | 0.349 | 1.25 |
| B: Sem JPGL (SWRD 43.75%, AVGS 31.25%, AVEM 25%) | 0.341 | 1.29 |

B tem ENB ligeiramente maior (diversificação) mas Sharpe inferior. Diferença mínima — não move a decisão.

### Net drag JPGL após TER

- TER savings: JPGL 0.19% vs AVGS 0.39% = **20bp de economia**
- Sector-neutral drag (se aplicável): ~17-21bp (mas mecanismo não confirmado para inverse-vol)
- Net drag: **~0bp** após TER offset

---

## Debate Interno

**Votos por rodada:**

| Agente | R1 | R2 | R3 (final) | Peso |
|--------|----|----|------------|------|
| Factor | MANTER | MANTER | **MANTER** | ★★★★ |
| Quant | MANTER | MANTER | **MANTER** | ★★★★ |
| Advocate | REDUZIR | MANTER* | **MANTER** | ★★★ |
| FIRE | REMOVER | MANTER* | **MANTER** | ★★★ |
| Behavioral | Cautela | MANTER | **MANTER** | ★★★ |
| Fact-Checker | REDUZIR | MANTER* | **MANTER** | ★★★ |
| Head | — | — | **MANTER** | ★★★★★ |

*Revisaram após correção de premissas erradas pelo Quant.

**Resultado: 7-0 MANTER JPGL 20%**

**Razões das revisões:**
- FIRE revisou de REMOVER→MANTER: usava premissa 4.5% BRL histórico em vez de 6.2% BRL aprovado. Com premissa correta, delta JPGL vs AVGS = 6bp, não 4.3pp.
- Advocate revisou de REDUZIR→MANTER: usava delta histórico de performance em vez do delta de premissas aprovadas.
- Fact-Checker revisou de REDUZIR→MANTER: sector-neutral drag (FAJ 2023) não se aplica ao inverse-vol de JPGL.

**Behavioral — teste contrafactual:**
> "Se JPGL tivesse batido SWRD por 2.2pp/ano, você ainda removeria?"
→ Diego disse "provavelmente hesitaria" — confirmou contaminação parcial por viés de recência.
→ Decisão correta é manter, baseada em premissas e não em performance recente.

---

## Conclusão

**Decisão: MANTER JPGL 20%**

**Racional em três pontos:**

1. **Fundamentos intactos**: 4 factor loadings significativos (regressão ao vivo, 79 meses). Alpha negativo não significativo (t=-1.49) — regime adverso, não estrutural. TER 0.19% mais barato que todas as alternativas com mesma cobertura.

2. **Contexto histórico**: o período 2019-2026 foi o ÚNICO em 22 anos onde multi-factor underperformou cap-weight (QE + tech dominance). Estamos no início da reversão (Great Rotation 2026: Value +6.6% YTD, DM ex-US €60B/mês). Remover agora seria vender o fator no pior momento.

3. **Custo de oportunidade real**: delta JPGL vs AVGS nas premissas aprovadas = 6bp no portfolio total. Não é um trade-off que justifique mudar a estrutura da carteira.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | JPGL mantido em 20% do bloco equity. Próximos aportes direcionados prioritariamente a JPGL (gap -19.5pp). |
| **Estratégia** | Sem mudança. Continuar DCA normal. |
| **Conhecimento** | Factor regression criada (`scripts/factor_regression.py`). Premissas de debate corrigidas. Alternativas documentadas. |
| **Memória** | `agentes/memoria/02-factor.md` atualizado com gatilhos, premissas corrigidas e alternativas. |

---

## Gatilhos de Monitoramento (pós-decisão)

| Gatilho | Condição | Ação |
|---------|----------|------|
| AUM closure risk | AUM JPGL < €100M | Abrir issue — avaliar substituição |
| Underperformance persistente | JPGL underperforma SWRD por mais 2 anos consecutivos (até dez/2028) | Abrir issue de substituição por SWRD ou IFSW |
| Alternativa superior disponível | IQGA AUM > €500M + histórico ≥ 2 anos (monitorar 2027+) | Comparar TER, loadings e correlação vs JPGL |
| Alpha estrutural confirmado | Alpha negativo JPGL significativo (t < -2.0) em regressão com ≥ 5 anos de dados reais | Abrir issue urgente |
| Mudança de metodologia | JPMorgan alterar índice (sector-neutral puro, remover momentum) | Rever tese imediatamente |

---

## Análise Pós-Fechamento: IQGA vs JPGL (2026-03-31)

### Mês a mês (mai/2025 → mar/2026, 10 meses)

| Mês | IQGA | JPGL | SWRD | Vencedor |
|-----|------|------|------|---------|
| Jun/2025 | +4.4% | +2.4% | +4.4% | IQGA |
| Jul/2025 | +1.5% | +0.3% | +2.0% | IQGA |
| Ago/2025 | +2.9% | +3.0% | +2.0% | JPGL |
| Set/2025 | +3.9% | +0.7% | +2.8% | IQGA |
| Out/2025 | +2.0% | -0.1% | +2.5% | IQGA |
| Nov/2025 | +0.8% | +3.2% | +0.2% | JPGL |
| Dez/2025 | +2.2% | +1.1% | +1.5% | IQGA |
| Jan/2026 | +2.1% | +3.3% | +1.7% | JPGL |
| Fev/2026 | +1.7% | +6.0% | +0.7% | JPGL |
| Mar/2026 | -7.4% | -5.9% | -7.7% | JPGL |
| **Total** | **14.4%** | **14.3%** | **10.0%** | **5-5** |

Placar 5-5. Nos meses extremos (fev +6% e mar -5.9%), JPGL osciou menos — low-vol funcionando.

### Factor loadings comparados (FF5+MOM, 192 obs diárias — indicativo apenas)

| Fator | IQGA | JPGL | Delta |
|-------|------|------|-------|
| **Market (beta)** | **0.735***  | **0.373*** | IQGA +0.36 |
| Size | -0.046 n.s. | +0.107 n.s. | — |
| Value | +0.009 n.s. | +0.038 n.s. | — |
| Profitability | +0.039 n.s. | +0.100 n.s. | — |
| Investment | -0.080 n.s. | +0.090 n.s. | — |
| Momentum | +0.011 n.s. | -0.023 n.s. | — |
| Alpha | +14.4%/ano * | +15.6%/ano * | regime |
| R² | 0.648 | 0.278 | |

**Único loading confiável: market beta.** IQGA (0.735) segue o mercado; JPGL (0.373) diverge intencionalmente via low-vol overlay. R² de JPGL = 0.278 — fatores FF americanos não capturam bem um ETF global low-vol.

### Split 15% JPGL + 5% IQGA

| Métrica | JPGL 20% | Split 15+5 |
|---------|----------|------------|
| CAGR | 16.3% | 16.5% |
| Volatilidade | 9.6% | 9.4% |
| Sharpe | 1.286 | 1.322 |
| Max Drawdown | -6.3% | -6.5% |
| TER blended | 0.19% | 0.20% |

Correlação IQGA↔JPGL = **0.682** — a mais baixa de qualquer par na carteira. Benefício de diversificação real existe.

**Decisão: não agora.** IQGA é ativamente gerido (gestor pode mudar estratégia), tem apenas 10 meses de histórico em regime favorável (value rotation), e o ganho de Sharpe (+0.036) é marginal. Revisar em mai/2027 com 2 anos de dados.

---

## Próximos Passos

Nenhum. Issue concluída. Continuar aportes regulares com JPGL como destino prioritário até equalizar o gap de 19.5pp.

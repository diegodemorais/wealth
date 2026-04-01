# HD-proxies-canonicos: Proxies canônicos por ETF por período

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-proxies-canonicos |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 02 Factor, 14 Quant, 15 Fact-Checker |
| **Dependencias** | HD-metodologia-analitica ✅ |
| **Criado em** | 2026-03-31 |
| **Origem** | Revisão proativa — 3 scripts usam proxies diferentes para os mesmos ETFs. Sem fonte única de verdade. |
| **Concluido em** | 2026-03-31 |

---

## Problema

Cada script define seus próprios proxies de forma ad-hoc:

| Script | AVGS proxy | AVEM proxy | JPGL proxy | VWRA proxy |
|--------|-----------|-----------|-----------|-----------|
| `backtest_fatorial.py` | AVUV | EIMI.L | JPGL.L direto | VWRA.L direto |
| `portfolio_analytics.py` | AVUV+AVDV | VWO | JPUS 60%+JPIN 40% | VWRA.L direto |
| `factor_regression.py` | — | — | JPGL.L direto | — |

Resultado: o mesmo backtest roda com EIMI.L ou VWO dependendo do script — números diferentes, conclusões incomparáveis.

---

## Análise

Debate com Factor, Fact-Checker e Quant (2026-03-31). Julgamentos independentes em paralelo.

### Correções críticas de inception (confirmadas por Factor + Fact-Checker via web)

| ETF | Estava nos scripts/issue | Inception real | Impacto |
|-----|------------------------|---------------|---------|
| SWRD.L | Set/2011 | **28 Fev 2019** | Scripts usam dado real só desde fev/2019. Proxy necessário para 2006-fev/2019 |
| JPGL.L | Nov/2019 | **9 Jul 2019** | 4 meses a mais de dado real |
| AVEM.L UCITS | Set/2022 | **9 Dez 2024** | Apenas 4 meses de dado real. Proxy correto pré-dez/2024: AVEM US-listed |
| AVGS.L | Jun/2024 | **25 Set 2024** | 3 meses a mais de proxy |

### Proxies definidos por ETF

**Binding constraint: JPGL** — único sem proxy ETF investível para 2006-2014. Solução aprovada: proxy sintético FF5+MOM (Quant Opção C), com fallback para exclusão de JPGL no sub-período se R² < 0.85.

**AVEM pré-2019:** DFEVX (DFA EM Value) aprovado — captura value tilt da estratégia AVEM. EEM como fallback se DFEVX indisponível.

### Critérios de validação (Quant)

| Tier | ρ mínimo | TE máx | R² mínimo | Overlap mínimo |
|------|---------|--------|-----------|---------------|
| A (same-strategy) | ≥ 0.95 | ≤ 3% | ≥ 0.90 | 36 meses |
| B (sintético/blend) | ≥ 0.85 | ≤ 6% | ≥ 0.72 | 36 meses |

Graduação: 36 meses de dado real + validação de correlação/TE no overlap (não automática por tempo).

### Flags críticos do Fact-Checker

- JPIN.L UCITS não existe — usar JPIN US-listed (desde Nov/2014)
- DFEMX ≠ DFA EM Value (é cap-weight). DFA EM Value = DFEVX
- EFV é large/mid value, não SC value — descartado para AVGS
- VT e ACWI incluem EM (~10%) — proxies de VWRA, não de SWRD

---

## Conclusão

Proxies canônicos definidos e aprovados por Diego (2026-03-31). Arquivo de referência criado.

**Período canônico atingível:** 20 anos (2006) para SWRD, AVGS, AVEM, VWRA. JPGL com proxy sintético FF5+MOM pré-2014 (condicionado a R² ≥ 0.85).

**Fonte única de verdade:** `agentes/referencia/proxies-canonicos.md`

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Arquivo criado** | `agentes/referencia/proxies-canonicos.md` — tabela completa por ETF por período |
| **Correções de inception** | 4 datas corrigidas (SWRD fev/2019, JPGL jul/2019, AVEM.L dez/2024, AVGS.L set/2024) |
| **JPGL gap 2006-2014** | Proxy sintético FF5+MOM aprovado (Opção C). Fallback: excluir JPGL se R² < 0.85 |
| **AVEM pré-2019** | DFEVX (DFA EM Value) aprovado — captura tilt value |
| **Graduação** | 36 meses de dado real. AVGS: set/2027. AVEM: dez/2027 |
| **Scripts** | Atualizar para referenciar proxies-canonicos.md (pendente) |

---

## Próximos Passos

- [x] Factor + Fact-Checker: pesquisar melhores proxies com verificação de datas
- [x] Quant: definir critérios de validação de overlap (tiers A/B, graduação 36m)
- [x] Decidir JPGL gap 2006-2014 e AVEM proxy pré-2019
- [x] Criar `agentes/referencia/proxies-canonicos.md`
- [ ] Atualizar `agentes/contexto/carteira.md` com datas de inception corrigidas
- [ ] Atualizar scripts (`backtest_fatorial.py`, `portfolio_analytics.py`, `factor_regression.py`) para usar proxies canônicos
- [ ] Validar proxies in-sample via script Python (correlação/TE no overlap)

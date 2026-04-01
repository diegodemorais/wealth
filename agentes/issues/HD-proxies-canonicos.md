# HD-proxies-canonicos: Proxies canônicos por ETF por período

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-proxies-canonicos |
| **Dono** | 00 Head |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | 02 Factor, 14 Quant, 15 Fact-Checker |
| **Dependencias** | — |
| **Criado em** | 2026-03-31 |
| **Origem** | Revisão proativa — 3 scripts usam proxies diferentes para os mesmos ETFs. Sem fonte única de verdade. |
| **Concluido em** | — |

---

## Problema

Cada script define seus próprios proxies de forma ad-hoc:

| Script | AVGS proxy | AVEM proxy | JPGL proxy | VWRA proxy |
|--------|-----------|-----------|-----------|-----------|
| `backtest_fatorial.py` | AVUV | EIMI.L | JPGL.L direto | VWRA.L direto |
| `portfolio_analytics.py` | AVUV+AVDV | VWO | JPUS 60%+JPIN 40% | VWRA.L direto |
| `factor_regression.py` | — | — | JPGL.L direto | — |
| `checkin_mensal.py` | — | — | — | — |

Resultado: o mesmo backtest roda com EIMI.L ou VWO dependendo do script — números diferentes, conclusões incomparáveis.

---

## Escopo

### Parte 1: Pesquisa e definição dos melhores proxies

Para cada ETF, pesquisar e definir:
- O proxy mais fiel à estratégia (não apenas à exposição de mercado)
- O período de validade do proxy (início → quando o ETF real tem dados suficientes)
- Caveats de accuracy (o que o proxy não captura)

ETFs a cobrir:

**SWRD.L** (SPDR MSCI World, Set/2011)
- Pré-Set/2011: qual proxy MSCI World com histórico longo?
- Candidatos: IWDA.L (iShares, desde 2009), URTH (US-listed, desde 2012), VT ponderado

**AVGS.L** (Avantis Global SC Value, Jun/2024)
- Jun/2024+: AVGS.L real
- Set/2019–Jun/2024: AVUV (US SC Value) + AVDV (Intl SC Value) blend — qual proporção?
- Pré-Set/2019: sem proxy Avantis; candidatos DFA SC Value, IWN+EFV blend

**AVEM.L** (Avantis EM Equity, Set/2022)
- Set/2022+: AVEM.L real
- Set/2022 pré-UCITS (se necessário): AVEM (US-listed, mesma estratégia) — período idêntico, pouco valor
- Pré-Set/2022: EIMI.L (MSCI EM IMI, sem value tilt) ou AVEM US-listed desde Set/2022
- Questão em aberto: existe proxy EM com tilt value/small antes de 2022?

**JPGL.L** (JPMorgan Global Equity Multi-Factor, Nov/2019)
- Nov/2019+: JPGL.L real
- Pré-Nov/2019: JPUS 60% + JPIN 40% (validado FI-jpgl-redundancia) — confirmar período exato de disponibilidade
- Alternativa: IWMO.L + IWVL.L blend (momentum + value, 2 dos 5 fatores do JPGL)

**VWRA.L** (Vanguard FTSE All-World Acc, Jul/2019)
- Jul/2019+: VWRA.L real
- Pré-Jul/2019: SWRD.L (ignora ~10% EM) ou VT (total world, US-listed, desde 2008)
- Impacto: usar SWRD como proxy subestima retorno em anos de outperformance EM

### Parte 2: Critério de graduação de proxy

Definir quando parar de usar o proxy e usar o ETF real:
- Mínimo de meses de dados reais para "graduar"?
- Regra sugerida para debate: 18 meses de dados reais → substituir proxy (captura pelo menos 1 ciclo de mercado)
- AVGS.L tem 9 meses (mar/2026) → ainda usa proxy. Graduação prevista: dez/2025

### Parte 3: Arquivo de referência e atualização dos scripts

- Criar `agentes/referencia/proxies-canonicos.md` com tabela única
- Atualizar `backtest_fatorial.py`, `portfolio_analytics.py`, `factor_regression.py` para referenciar o mesmo padrão
- Scripts não definem proxies — consultam a referência

---

## Raciocínio

**Por que isso importa:** resultados de análises diferentes só são comparáveis se usam os mesmos proxies. Hoje, se `backtest_fatorial.py` mostra +0.48pp CAGR e `portfolio_analytics.py` mostra +0.30pp, não sabemos se a diferença é sinal ou artefato de proxy diferente.

**Falsificação:** se após padronização os resultados divergirem mais de 0.5pp entre scripts para o mesmo período, há bug — não diferença metodológica legítima.

---

## Análise

> A preencher.

---

## Conclusão

> A preencher.

---

## Resultado

> A preencher.

---

## Próximos Passos

- [ ] Factor + Fact-Checker: pesquisar melhores proxies para AVGS (pré-2019), AVEM (pré-2022), JPGL (pré-2019), VWRA (pré-2019)
- [ ] Quant: validar que proxies escolhidos replicam o ETF real no período de sobreposição (backtesting in-sample)
- [ ] Definir critério de graduação de proxy
- [ ] Criar `agentes/referencia/proxies-canonicos.md`
- [ ] Atualizar scripts para usar definição canônica

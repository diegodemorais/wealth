# RK-gold-hedge: Ouro (IGLN) 2-3% como tail risk hedge

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | RK-gold-hedge |
| **Dono** | 06 Risco |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 10 Advocate, 11 Oportunidades, 02 Factor, 05 Tributacao |
| **Dependencias** | — |
| **Criado em** | 2026-03-20 |
| **Origem** | Revalidacao profunda (Oportunidades 2026-03-20): ouro como hedge de tail risk fiscal BR |
| **Concluido em** | 2026-03-26 |

---

## Motivo / Gatilho

> Na revalidacao, o agente Oportunidades trouxe ouro como unica oportunidade material nova. WGC research sugere Sharpe melhora +12% com 5% gold. Carteira tem ~6-7% de exposicao a risco soberano BR (Renda+ + IPCA+) sem hedge. Ouro (IGLN, TER 0.12%) poderia funcionar como seguro contra cenario de crise fiscal extrema no Brasil. Contraponto: Erb & Harvey (2006, 2013) mostram gold ~1% real/ano, sem factor premium. Precisa de debate estruturado.
>
> **Novo argumento (HD-brazil-concentration, 2026-03-26):** o cenario mais perigoso para o portfolio de Diego NAO e crise fiscal BR pura — e **recessao global com BRL estaval (2022-style)**. Nesse cenario: equity internacional cai em USD, BRL nao desvaloriza (logo sem ganho cambial em BRL), IPCA+ HTM imune mas nao compensa, Renda+ MtM sofre junto. Ouro em 2022: **-1% vs MSCI World -18%**. E o unico ativo que historicamente protege nesse regime especifico. FI-crowdedness tambem identificou que AVGS tem tail risk maior que o aparente (Quant Crisis 2.0: -25 a -35%) — portfolio mais vulneravel em quedas rapidas do que parece.

---

## Descricao

> Avaliar se ouro (2-3% via IGLN UCITS) agrega valor a carteira como tail risk hedge. **Caso de uso principal (2026-03-26):** recessao global com BRL estaval (2022-style) — o cenario onde o hedge cambial do equity USD falha e o IPCA+ HTM nao compensa equity. Caso de uso secundario: crise fiscal BR extrema. Debate estruturado Bull vs Bear obrigatorio.

---

## Escopo

- [ ] Revisar literatura: Erb & Harvey (2006, 2013), WGC research, Rajan (2006), Baur & McDermott (2010)
- [ ] Quantificar: Sharpe com e sem ouro (backtest 20 anos, carteira similar)
- [ ] Quantificar: correlacao ouro vs equity em crises (2008, 2020, EM crises)
- [ ] Quantificar: custo de oportunidade de 2-3% fora de equity (vs JPGL que tem gap -19,7%)
- [ ] Avaliar instrumento: IGLN (TER 0.12%) vs alternativas UCITS
- [ ] Tributacao: ouro em UCITS ETF = mesma regra de equity? Consultar Tax
- [ ] Debate estruturado: Bull (Oportunidades + Risco) vs Bear (Advocate)
- [ ] Recomendacao final com sizing

---

## Analise

Debate estruturado Bull vs Bear com 4 agentes (Risco, Advocate, Factor, Fact-Checker).

### Fact-Checker — Correções

| Claim | Veredicto |
|-------|-----------|
| WGC +12% Sharpe | ⚠️ Testado em 60/40, não em 79% equity. Fonte com conflito de interesse (WGC = indústria do ouro) |
| Ouro 2022 -1% | ❌ Correto é -0.4% — fortalece o Bull, mas não muda o veredicto |
| Baur & McDermott: safe haven | ⚠️ Funciona para DM. Não se aplica a EM — relevante pois Diego tem AVEM (25%) |
| Ouro 2008 | ⚠️ +5% no ano mas -30% intrayear em out/2008 — em crise de liquidez, ouro também é vendido |
| IGLN TER 0.12% | ✅ Confirmado. Disponibilidade IBKR para BR: não confirmada |

### Bull (Risco)

Ouro em 2022 ficou flat (-0.4%) enquanto equity caiu -18% USD e BRL apreciou — correlação ~zero no único cenário em que o hedge cambial falha. Custo de oportunidade real, mas é o preço da descorrelação condicional.

### Bear (Advocate + Factor)

1. **Frequência baixa:** 2022 foi o único caso em 20 anos de "recessão global + BRL estável." Baixa frequência não justifica alocação permanente.
2. **Sizing ineficaz:** 2% de ouro + 20% de alta em crise = +0.4pp no portfolio vs drawdown de -14.2%. Não move a agulha.
3. **BTC overlap:** HODL11 3% já ocupa o slot de descorrelação. Dois ativos de retorno esperado ~0% = complexity tax.
4. **Baur & McDermott não se aplica a EM:** Diego tem AVEM (25%). O paper que sustenta o safe haven exclui mercados emergentes explicitamente.
5. **JPGL gap:** -19.7% vs target. Custo de 2% em ouro vs JPGL = ~R$50-60k em 11 anos (delta ~5-6pp/ano).
6. **Managed futures superior:** evidência acadêmica mais forte (momentum cross-asset = fator real, Moskowitz/Ooi/Pedersen 2012). KMLM +25% em 2022 — mesmo cenário, melhor proteção.

---

## Conclusao

**Não alocar ouro. Capital vai para JPGL.**

O argumento do Bull (descorrelação condicional em 2022) é real mas insuficiente: frequência muito baixa, sizing ineficaz, BTC já ocupa o slot de descorrelação, e Baur & McDermott não se aplica a portfolio com EM. O custo de oportunidade vs JPGL é claro.

**Gatilho de revisão:** quando JPGL atingir o target (20%), avaliar managed futures (RK-managed-futures) antes de ouro — evidência acadêmica superior para o mesmo cenário de risco.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Zero ouro. Sem mudança. |
| **Estrategia** | Capital disponível vai para JPGL (gap -19.7%). Reavaliar managed futures após JPGL atingir target. |
| **Conhecimento** | Baur & McDermott não se aplica a EM. WGC fonte com conflito de interesse. Ouro 2022: -0.4% (não -1%). Sizing 2% é ineficaz (0.4pp de redução). Managed futures superiores como diversificador para o mesmo cenário. |
| **Memoria** | — |

---

## Proximos Passos

- [ ] Executar RK-managed-futures após JPGL fechar gap

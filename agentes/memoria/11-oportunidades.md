# Memoria: Scanner de Oportunidades

## Regras Operacionais

### Gatilhos de Scan Obrigatorio
Scan e obrigatorio quando qualquer condicao abaixo for verdadeira:

| # | Condicao | Threshold |
|---|----------|-----------|
| 1 | IPCA+ longa (2045+) acima da media + 1 desvio | Taxa real >= 7,0% |
| 2 | EM discount vs DM no forward P/E | Desconto >= 40% |
| 3 | Drawdown de asset class >= 20% | Qualquer classe da carteira |
| 4 | Value spread no percentil >= 90 | AQR/Ken French datasets |
| 5 | Mudanca regulatoria/tributaria relevante | Lei aprovada que afeta ETFs/offshore/RF |
| 6 | Novo veiculo UCITS relevante | TER menor, tracking melhor, novo fator |
| 7 | Spread equity expected return vs IPCA+ comprimido | Equity ER - IPCA+ real yield <= 1pp |

**Overlap analysis obrigatório**: Antes de recomendar qualquer ETF novo, medir overlap com ETFs existentes na carteira.

**Delta vs JPGL obrigatorio (aprendizado retro 2026-03-22)**: Toda proposta de novo ativo deve incluir: "retorno esperado liquido do ativo X vs JPGL nos proximos 11 anos = delta de R$Y por R$100k investidos." Se o delta nao justificar o desvio da estrategia, descartar antes de apresentar. Ouro (IGLN) foi proposto sem esse calculo — o Advocate teve que fazer (custo de oportunidade ~R$75k/R$100k em 11 anos). Primeira pergunta: "qual o overlap com o que já temos?" antes de "qual o retorno?". AVGC tinha 90% overlap com SWRD — closet indexing. (Aprendizado retro 2026-03-19)

**Regra trimestral**: verificar todas as 7 condicoes. Se ativa, scan completo + report ao Head. Se nenhuma, registrar "radar limpo".

**Regra de urgencia**: condicoes 1, 2 ou 3 detectadas fora do ciclo -> scan em ate 48h.

---

## Oportunidades Identificadas

| Data | Oportunidade | Status | Risco/Retorno | Resultado |
|------|-------------|--------|---------------|-----------|
| 2026-03-18 | IPCA+ 2045 a 7,14% (percentil ~76+) | Monitorando | Upside ~15% por pp de queda / Downside: marcacao negativa se taxa subir | Nao requer acao — decisao estrutural aos 48 |
| 2026-03-18 | EM discount ~33% vs DM | Monitorando | Moderado — desconto ja comprimiu de 40%+ | Manter AVEM 20%, sem super-alocacao |
| 2026-03-18 | AVGC vs JPGL para slot multifactor | Investigar | AVGC 0.22% (V+P ativo diario) vs JPGL 0.19% (4-factor rules-based). +3bps mas metodologia possivelmente superior | Pendente: pedir factor regression ao Agent 02 |
| 2026-03-18 | Dimensional UCITS lancados (DDGC 0.26%, DDGT 0.44%) | Monitorando | DDGT vs AVGS: +5bps, track record DFA maior. DDGC vs SWRD+JPGL: simplifica mas +11bps | Manter posicoes atuais. Monitorar AUM de DDGT por 12 meses |
| 2026-03-18 | Avantis expandiu UCITS (AVUS 0.20%, AVEU 0.25%, AVPE 0.25%) | Registrado | Regionais uteis para controle fino, mas adicionam complexidade | Nao acionavel — AVGS/AVEM/AVGC cobrem necessidades |
| 2026-03-18 | Scan completo ETFs UCITS equity: IFSW, EMVL, ZPRV, Gold, REIT, Commodity, Buffer ETFs, Direct Indexing | Descartados | Nenhum oferece melhoria material vs carteira atual | Radar limpo para todas essas alternativas |
| 2026-03-20 | **Ouro (IGLN) 2-3% como tail risk hedge** | PROPOSTO | Sharpe melhora +12% com 5% gold (WGC). Custo: 0% real return. Upside: descorrelacao em crises | Pendente: debate Head + Risco + Advocate + Tax |
| 2026-03-20 | Value spread percentil 90-95 (AQR) | Ja capturado | Historicamente +4-6pp excess return nos proximos 5 anos | Carteira ja posicionada via AVGS + JPGL + AVEM |
| 2026-03-20 | EM desconto ~40% vs US (forward P/E 14x vs 22x) | Monitorando | EPS growth EM 21% vs US 15%. GMO: EM Value +3.8% real | Ja overweight (24.2% vs 20% alvo). Nao super-alocar |
| 2026-03-20 | IB1T (BlackRock Bitcoin ETP) vs HODL11 | Descartado | IB1T TER 0.15% vs HODL11 0.20%. Diferenca marginal ~5bps | Nao vender HODL11 (imposto). Reavaliar em novos aportes crypto |
| 2026-03-20 | Renda+ 2065 a IPCA+7.02% | Ativo | Carrego excepcional. Se taxa cair a 6%: +39.5% liq | Continuar DCA ate 5% conforme regra existente |
| 2026-03-20 | TIPS vs IPCA+ diversificacao | Descartado | TIPS 1.9% real vs IPCA+ 7.0% real. Spread 510bps a favor BR | Diego ja tem 90% equity global como hedge cambial |
| 2026-03-20 | Private credit UCITS | Descartado | Nao existe veiculo UCITS. US-listed = estate tax risk | Reavaliar em 2027 |
| 2026-03-20 | Tax loss harvesting transitorios | N/A | Todos com lucro. Zero oportunidade | Monitorar se drawdown >20% |
| 2026-03-20 | SWSC (State Street World SCV Enhanced, TER 0.45%) | Monitorando | Mais caro que AVGS (0.39%), AUM baixo ($89M), track record zero | Monitorar 12 meses |

---

## Revalidacao Profunda (2026-03-20)

### Contexto
Diego pediu revalidacao profunda: 7 areas investigadas (novos ETFs, ouro, Bitcoin ETP, private credit, tax loss harvesting, janelas de mercado, TIPS vs IPCA+).

### Gatilhos Ativos
| # | Condicao | Status Mar/2026 |
|---|----------|-----------------|
| 1 | IPCA+ longa >= 7.0% | ATIVO: IPCA+ 2040 a 6.98%, Renda+ 2065 a 7.02% |
| 2 | EM discount >= 40% | ATIVO: ~40% desconto vs US |
| 3 | Drawdown >= 20% | Inativo |
| 4 | Value spread >= P90 | ATIVO: P90-95 segundo AQR |
| 5 | Mudanca regulatoria | Inativo |
| 6 | Novo veiculo UCITS | SWSC lancado (fev 2026), monitorando |
| 7 | Spread equity ER vs IPCA+ | Nao comprimido — equity ER ~5% real vs IPCA+ 7% real, mas IPCA+ e RF com risco diferente |

### Conclusao Principal
Carteira bem posicionada para capturar value spread e EM discount. Unica oportunidade material nova: **ouro como hedge de tail risk** (2-3% via IGLN, TER 0.12%). Requer debate com time.

### Dados de Mercado Coletados
- AQR value spread: percentil ~90-95 (mar 2026)
- EM forward P/E: ~13.4-14x (vs US ~22-23x)
- IPCA+ 2040: ~6.98% real
- Renda+ 2065: ~7.02% real
- TIPS 10Y: ~1.9% real
- Ouro: ~$3.000/oz
- GMO 7Y (jan 2026): EM Value +3.8%, Japan SCV +7.7%, US Large -5.4% (todos reais)

---

## Scan Completo: ETFs UCITS Equity (2026-03-18)

### Contexto
Diego pediu scan amplo do mercado de ETFs UCITS na LSE/IBKR. Cobertura: novos lancamentos 2024-2026, alternativas aos ETFs da carteira, classes faltando, inovacoes.

### Achados Principais
1. **Avantis** dobrou lineup UCITS (set 2024 - fev 2026): AVGC, AVGS, AVEM + AVUS, AVEU, AVPE
2. **Dimensional** lancou primeiros UCITS (nov 2025): DDGC (0.26%) e DDGT (0.44%)
3. **Alpha Architect** NAO tem UCITS
4. **AVGC vs JPGL** e a unica investigacao que merece aprofundamento
5. **Buffer ETFs UCITS** existem (Global X, First Trust) mas nao sao adequados para acumulacao FIRE
6. **Gold, REIT, Commodities, TIPS**: nenhum justificado na fase atual
7. Carteira atual esta bem posicionada — nenhuma troca urgente necessaria

### Proximos Passos
- [ ] Pedir ao Agent 02 (Factor) regression analysis: AVGC vs JPGL factor exposures
- [ ] Monitorar AUM de DDGT por 12 meses (checkpoint: 2027-03)
- [ ] **Scan de Opportunity Cost Q2 2026 (junho)**: Primeiro scan trimestral de asset classes excluidas (imoveis, leilao, FIIs, commodities, PE, ativos BR, REITs, RF privada). Quantificar custo de nao estar la. Motivacao: Diego identificou risco de confirmation bias estrutural no sistema

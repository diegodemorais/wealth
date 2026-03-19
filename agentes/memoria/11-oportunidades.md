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

**Overlap analysis obrigatório**: Antes de recomendar qualquer ETF novo, medir overlap com ETFs existentes na carteira. Primeira pergunta: "qual o overlap com o que já temos?" antes de "qual o retorno?". AVGC tinha 90% overlap com SWRD — closet indexing. (Aprendizado retro 2026-03-19)

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

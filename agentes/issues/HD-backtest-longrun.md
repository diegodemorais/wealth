# HD-backtest-longrun: Pipeline de Backtest 50+ Anos via Ken French / MSCI

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-backtest-longrun |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head (lead), Factor, Quant |
| **Criado em** | 2026-04-08 |
| **Origem** | Diego — ampliar backtest para 20+ anos. Solução imediata via Regimes 5/6 (ETFs US-listed). Issue cobre a versão robusta com índices acadêmicos. |
| **Deps** | — |

---

## Contexto

Os ETFs UCITS da carteira (SWRD, AVGS, AVEM) existem desde 2019-2024. Para estudar o prêmio fatorial em janelas longas (20-50 anos), precisamos de proxies de índices acadêmicos, não de ETFs.

**Solução imediata (já implementada):**
- `backtest_portfolio.py --regime 5` → 21 anos (Dez/2004+) usando IVV+VBR+EEM
- `backtest_portfolio.py --regime 6` → 19 anos (Dez/2006+) usando IVV+VBR+SCZ+EEM
- Limitação: IVV ≠ MSCI World (sem DM ex-US); VBR = US SC Value only

**Solução robusta (esta issue):** usar índices brutos da literatura acadêmica.

---

## Objetivo

Construir pipeline que permita comparar Target vs Shadow A em janelas de 20-50 anos usando:
1. **Ken French Data Library** — fatores SMB, HML, Momentum, Profitability por região
2. **MSCI Index Returns** — World, EM, EAFE (retornos brutos publicados)
3. **Stitching**: combinar índices históricos com ETFs reais a partir de suas datas de lançamento

---

## Escopo

- [ ] Mapear sources de dados disponíveis:
  - Ken French: `factor_regression.py` já usa biblioteca French (verificar cobertura geográfica)
  - MSCI: retornos públicos em `msci.com/end-of-day-data-search` (necessita download manual ou scraping)
  - Alternativa: AQR data portal (factor returns globais, já temos o skill `aqr-data`)
- [ ] Definir proxy acadêmico para cada bucket:
  - SWRD → MSCI World Index (Net, USD)
  - AVGS → French Global Small Value (ou AQR QMJ global)
  - AVEM → MSCI EM Index (Net, USD)
  - VWRA → MSCI ACWI (Net, USD)
- [ ] Implementar stitching: índice bruto até data de lançamento do ETF, depois ETF real
- [ ] Adicionar Regime 7 ao `backtest_portfolio.py` com dados costurados
- [ ] Validar que a juntura (splice) não cria descontinuidade artificial
- [ ] Exportar série 50 anos para dashboard — seção 27 (Backtest histórico)

---

## Resultado Esperado

```bash
python3 backtest_portfolio.py --regime 7   # 50 anos via índices acadêmicos
```

Output: série 1975-2026 + métricas + tabela anual + Advocate check.

---

## Notas

- Regimes 5 e 6 são suficientes para o dashboard hoje — esta issue é para rigor metodológico
- AQR Factor Returns: `scripts/aqr-data` skill já acessa o portal AQR
- Ken French Library: `scripts/factor_regression.py` já baixa dados French
- MSCI public returns: disponíveis em `agentes/referencia/` se alguém fizer o download manual
- Cuidado com survivorship bias nos índices de SC (problema menor em MSCI, maior em construções ad-hoc)

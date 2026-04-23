# TX-tlh-engine-lote: Tax — TLH Engine por lote (P&L individual, gatilho em drawdown)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-tlh-engine-lote |
| **Dono** | Tax |
| **Status** | ✅ Done |
| **Concluído em** | 2026-04-22 |
| **Prioridade** | Média |
| **Participantes** | Tax (lead), Bookkeeper, Dev |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-17 |
| **Origem** | Auditoria Tax agent do pipeline — tlh_lotes.json existe mas falta P&L por lote individual com preço atual. |
| **Concluido em** | — |

---

## Motivo / Gatilho

`tlh_lotes.json` contém lotes individuais desde 2021 (quantidade, preço médio USD, data de compra). O cálculo atual de P&L é agregado por ETF — nenhum ETF está em prejuízo no momento, então impacto prático é zero agora. O gatilho de ativação é drawdown severo, quando TLH se torna viável e valioso.

---

## Descricao

Implementar engine de TLH que calcule P&L por lote individual. O objetivo é identificar lotes elegíveis para TLH em momentos de drawdown, permitindo cristalizar perdas fiscais e potencialmente migrar posições US-listed → UCITS simultaneamente (duplo benefício: fiscal + estate tax).

Lógica central:
- P&L BRL por lote = (preço_atual_usd × ptax_atual − preço_compra_usd × ptax_compra) × quantidade
- Lotes com P&L BRL < 0 = elegíveis para TLH

---

## Escopo

- [ ] Buscar preço atual por ETF via yfinance
- [ ] Buscar PTAX histórica por data de compra (python-bcb ou cache existente)
- [ ] Calcular P&L BRL por lote individual
- [ ] Identificar e listar lotes com P&L < 0 (elegíveis para TLH)
- [ ] Calcular benefício fiscal total disponível (soma de perdas elegíveis × 15%)
- [ ] Integrar output no `/tax-calc` ou criar novo comando `/tlh-scan`
- [ ] Documentar gatilho de ativação no Ops (drawdown > 15% portfólio OU ETF > 20%)

---

## Raciocinio

**Alternativas rejeitadas:** Cálculo apenas agregado por ETF (atual) — perde granularidade, pode esconder lotes individuais em prejuízo mesmo quando o ETF total está no lucro (situação comum após múltiplos aportes em datas diferentes com câmbio variável).

**Argumento central:** Em drawdown severo, a janela de TLH é curta e o cálculo precisa ser imediato e preciso por lote. Ter a engine pronta antes do drawdown é condição necessária para aproveitá-lo.

**Incerteza reconhecida:** PTAX histórica pode ter gaps para datas muito antigas; yfinance pode ter instabilidade em cotações de ETFs UCITS.

**Falsificação:** Se o portfólio nunca sofrer drawdown > 15% antes do FIRE (2040), a engine nunca será ativada — custo de oportunidade do desenvolvimento é baixo.

---

## Gatilho de Ativação

Ops monitora e aciona quando:
- Drawdown do portfólio > 15%, OU
- Qualquer ETF cair > 20% em relação ao preço médio ponderado da posição

---

## Benefício

Em drawdown severo, TLH permite:
1. Cristalizar perdas fiscais (reduz base futura de IR)
2. Migrar posições US-listed → UCITS simultaneamente (reduz exposição estate tax americano)
Duplo benefício fiscal e patrimonial no mesmo evento.

---

## Arquivos Relevantes

| Arquivo | Papel |
|---------|-------|
| `dados/tlh_lotes.json` | Fonte dos lotes individuais (quantidade, preço USD, data) |
| `scripts/ibkr_analysis.py` | Pipeline de análise IBKR — ponto de integração |
| `dados/tax_snapshot.json` | Snapshot tributário atual |

---

## Proximos Passos

- [ ] Ativar quando gatilho de drawdown for atingido (Ops monitora)
- [ ] Ao implementar, registrar achados em `agentes/memoria/05-tax.md`

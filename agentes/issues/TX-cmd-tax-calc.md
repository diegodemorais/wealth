# TX-cmd-tax-calc: Command /tax-calc

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-cmd-tax-calc |
| **Dono** | Tax |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Tax (lead), Bookkeeper, Quant |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Gap identificado no mapeamento de commands |
| **Concluido em** | — |

---

## Motivo / Gatilho

Calcular IR sobre venda de ETF internacional requer: câmbio de compra, câmbio de venda, preço de compra/venda em USD, custo médio ponderado por lote, ganho nominal em BRL, alíquota 15%, DARF. O agente Tax faz isso manualmente toda vez — propenso a erros e lento. Lei 14.754/2023 mudou as regras.

---

## Descricao

Criar `/tax-calc` que calcula impacto tributário de venda de ETF:
- Input: ticker, quantidade, preço de venda, câmbio
- Lê custo médio de `carteira.md` ou `tlh_lotes.json`
- Calcula: ganho nominal BRL, IR devido, retorno líquido
- Aplica regras Lei 14.754/2023 (15% flat sobre ganho nominal)
- Output: tabela com breakdown do cálculo + valor DARF

---

## Escopo

- [ ] Criar `.claude/commands/tax-calc.md`
- [ ] Aceitar argumentos: ticker, shares, preço venda, câmbio venda
- [ ] Lógica de custo médio por lote (FIFO ou média ponderada)
- [ ] Formato de output: breakdown passo a passo + DARF final
- [ ] Testar com dados reais de lotes

---

## Raciocínio

**Argumento central:** Erro tributário é irreversível (DARF errado = multa). Automação elimina risco de cálculo manual com múltiplas conversões cambiais.

**Prioridade Média:** Usado raramente (Diego não vende — rebalanceia por aportes). Mas quando precisar (TLH, migração UCITS), precisa estar correto. Baixa frequência, alto impacto por uso.

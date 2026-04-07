# HD-cmd-rebalance-calc: Command /rebalance-calc

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-cmd-rebalance-calc |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | Head (lead), Bookkeeper, Factor, Quant |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | HD-cmd-portfolio-snapshot |
| **Criado em** | 2026-04-07 |
| **Origem** | Gap identificado no mapeamento de commands |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

Diego aporta ~R$25k/mês e precisa decidir onde alocar para convergir aos alvos (SWRD 50%, AVGS 30%, AVEM 20%). Hoje o cálculo é feito no check-in mensal pelo Head, mas não existe command isolado para calcular rapidamente "tenho R$X para aportar, onde colocar?". Com câmbio e preços variando, a resposta muda a cada dia.

---

## Descricao

Criar `/rebalance-calc` que recebe valor do aporte e calcula distribuição ótima:
- Lê posições atuais de `carteira.md`
- Calcula drift vs alvos
- Sugere alocação do aporte para minimizar drift
- Respeita regra de cascade: IPCA+ longo (≥6%) → Renda+ (≥6.5%) → equity via IBKR
- Output: tabela com "comprar X shares de Y a preço Z"

---

## Escopo

- [ ] Criar `.claude/commands/rebalance-calc.md`
- [ ] Aceitar argumento `$ARGUMENTS` como valor do aporte (default R$25k)
- [ ] Lógica de cascade (RF primeiro se taxas acima do piso, senão equity)
- [ ] Output com quantidade de shares e preço estimado
- [ ] Testar com dados reais

---

## Raciocínio

**Argumento central:** Decisão mensal recorrente que hoje consome 10-15 min do check-in. Command reduz para 30 segundos. Erro de alocação por cálculo mental = drift acumulado.

**Prioridade Alta:** Usado mensalmente. Impacto direto na execução. Depende do snapshot (HD-cmd-portfolio-snapshot) para posições atuais.

---

## Conclusao

Command `.claude/commands/rebalance-calc.md` criado. Lógica de cascade HD-006: IPCA+ longo (≥6%) → Renda+ (≥6.5%) → equity IBKR ao mais subpeso. Câmbio operacional (não PTAX). Aceita argumento R$ (default R$25k). É o source of truth para decisões de aporte — `/checkin-automatico` referencia este command.

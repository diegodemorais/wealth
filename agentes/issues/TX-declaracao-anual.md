# TX-declaracao-anual: Checklist DIRPF para investimentos internacionais

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-declaracao-anual |
| **Dono** | Tax |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Tax (lead), Bookkeeper |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Agent review — Tax identificou gap: sem checklist formal para declaração anual IRPF com ETFs UCITS via IBKR. |
| **Concluido em** | — |

---

## Descricao

Criar checklist e command para declaração anual de IRPF com investimentos internacionais: Bens e Direitos (cód 99), conversão PTAX 31/12, dividendos recebidos, ganhos de capital, compensação de prejuízos.

---

## Escopo

- [ ] Mapear obrigações: Bens e Direitos, Rendimentos Exterior, DARF mensal vs anual
- [ ] Regras Lei 14.754/2023: 15% flat, sem isenção R$35k
- [ ] Checklist passo-a-passo com dados necessários do IBKR
- [ ] Criar command `/declaracao` ou integrar no `/tax-calc`
- [ ] Testar com dados reais da declaração anterior

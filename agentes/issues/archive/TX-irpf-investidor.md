# TX-irpf-investidor: Library irpf-investidor para cálculo de IR

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-irpf-investidor |
| **Dono** | Tax |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | Tax (lead), Bookkeeper, Quant |
| **Co-sponsor** | Bookkeeper |
| **Dependencias** | — |
| **Criado em** | 2026-04-07 |
| **Origem** | Scan de repos/tools — pypi.org/project/irpf-investidor (staticdev) |
| **Concluido em** | 2026-04-07 |

---

## Motivo / Gatilho

Issue TX-cmd-tax-calc precisa de lógica de cálculo de IR. A library `irpf-investidor` (PyPI) calcula custos de ETFs/ações para declaração IRPF, incluindo taxas, liquidação e custo médio. Pode servir como base para nosso `/tax-calc` em vez de implementar do zero.

---

## Descricao

Avaliar `irpf-investidor` e libs relacionadas (`guilhermecgs/ir`, `darf_generator`) para automatizar cálculos de IR sobre investimentos internacionais. Verificar compatibilidade com Lei 14.754/2023 (15% flat).

---

## Escopo

- [ ] `pip install irpf-investidor` — testar com dados de ETFs UCITS
- [ ] Verificar: suporta ativos internacionais? Ou só B3?
- [ ] Verificar: atualizado para Lei 14.754/2023? (15% flat, sem isenção R$35k)
- [ ] Avaliar `guilhermecgs/ir` como alternativa (foco B3)
- [ ] Avaliar `darf_generator` para geração de DARF
- [ ] Decidir: usar como base para TX-cmd-tax-calc? Ou implementar custom?

---

## Raciocínio

**Argumento central:** Cálculo de IR sobre ETFs internacionais é complexo (câmbio de compra/venda, custo médio por lote, ganho nominal BRL). Library existente pode economizar esforço e reduzir risco de erro.

**Incerteza reconhecida:** Maioria das libs brasileiras de IR foca em B3/Bovespa, não em ETFs UCITS via IBKR. Pode não ser aplicável diretamente.

**Prioridade Média:** Complementa TX-cmd-tax-calc. Diego não vende frequentemente, mas quando precisar (TLH, migração), precisa estar correto.

### Feedback agentes (2026-04-07)

**Tax:** Provavelmente só B3. Libs brasileiras (staticdev, guilhermecgs/ir) focam CEI/B3. ETFs UCITS via IBKR exigem lógica distinta (conversão cambial PTAX compra/venda, custo médio BRL por lote). Recomendação: implementar custom, não depender da lib. Usar lib apenas como referência de cálculo.

## Conclusao

`irpf-investidor` instalado e testado. Confirmado: focado exclusivamente em B3 (CEI/nota de corretagem). **Não aplicável** para ETFs UCITS via IBKR.

**Decisão:** Não usar para nossa carteira. `/tax-calc` implementado custom (Lei 14.754/2023, PTAX D+2, custo médio BRL por lote via `tlh_lotes.json`). `irpf-investidor` pode ser útil apenas se/quando Diego tiver posições diretas em ações BR.

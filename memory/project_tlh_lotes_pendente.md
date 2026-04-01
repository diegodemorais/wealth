---
name: TLH lotes IBKR pendente
description: Diego vai mandar extrato IBKR para preencher tlh_lotes.json — lembrar de pedir
type: project
---

Diego precisa mandar o histórico de depósitos/compras na IBKR para preencher `scripts/tlh_lotes.json`.

**Ação pendente:** quando Diego mandar o extrato, preencher os lotes por ticker com qtd + preço_usd + data de cada compra. PTAX é buscada automaticamente do BCB.

**Why:** TLH monitor só funciona com dados reais de custo base. Sem os lotes, o script mostra "lotes não informados" para todos os transitórios.

**How to apply:** na próxima sessão, lembrar Diego proativamente: "Você ia mandar o extrato IBKR para preencher tlh_lotes.json."

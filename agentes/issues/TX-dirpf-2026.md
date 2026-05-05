# TX-dirpf-2026 — DIRPF 2026: Informe de Rendimentos e Declaração (ano-base 2025)

| Campo | Valor |
|-------|-------|
| **Status** | Blocked |
| **Dono** | Tax |
| **Prioridade** | 🔴 Alta — prazo RFB mai/2026 |
| **Aberta** | 2026-05-05 |
| **Bloqueio** | Aguardando documentos de Diego: declaração 2024, informes de rendimentos 2025 |

---

## Objetivo

Montar o informe de rendimentos consolidado de Diego para a DIRPF 2026 (ano-base 2025) e preparar a declaração completa.

## Escopo

### Fontes a consolidar
- [ ] Rendimentos de renda fixa: Tesouro IPCA+, Renda+ 2065 (corretora e TD)
- [ ] Ganho de capital em ETFs exterior (IBKR): SWRD, AVGS, AVEM — apuração via `ibkr_lotes.py --flex`
- [ ] HODL11 (B3): ganho de capital renda variável
- [ ] Imóvel Pinheiros: aluguel recebido R$4.100/mês → rendimento tributável
- [ ] DARF pagos em 2025 (Lei 14.754/2023 + eventual ganho de capital)
- [ ] Rendimentos isentos vs. tributáveis (LCI/LCA se houver, LFT, etc.)
- [ ] Bens e direitos: ETFs IBKR, HODL11, imóvel Pinheiros, terreno, Renda+ 2065

### Blocos da declaração
- [ ] Rendimentos tributáveis recebidos de PJ (salário/pró-labore se houver)
- [ ] Rendimentos sujeitos à tributação exclusiva/definitiva
- [ ] Rendimentos isentos e não tributáveis
- [ ] Ganhos de capital (bens e direitos)
- [ ] Renda variável (B3)
- [ ] Bens e direitos (posição em 31/12/2025)
- [ ] Dívidas e ônus (financiamento imóvel se houver)
- [ ] Pagamentos efetuados (DARF, plano de saúde, dependentes)

## Documentos necessários (Diego fornece)

- [ ] Declaração IRPF 2025 (ano-base 2024) — referência de bens e posições iniciais
- [ ] Informes de rendimentos 2025: IBKR, XP, bancos, Tesouro Direto
- [ ] Extrato de DARFs pagos em 2025
- [ ] Recibo de aluguel / informe do inquilino (imóvel Pinheiros)
- [ ] Comprovante de despesas dedutíveis (saúde, educação se houver)

## Critério de Done

- [ ] Informe consolidado com todos os campos preenchidos
- [ ] Cálculo de IR a pagar ou restituição estimada
- [ ] Revisão de consistência: bens 2025 vs. 2024 + movimentações explicadas
- [ ] Checklist `declaracao` (skill) executado
- [ ] Diego valida e aprova antes de enviar à RFB

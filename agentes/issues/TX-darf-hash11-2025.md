# TX-darf-hash11-2025 — DARFs Pendentes 2025 (HASH11 + Lei 14.754)

| Campo | Valor |
|-------|-------|
| **Status** | Doing |
| **Dono** | Tax |
| **Prioridade** | 🔴 Alta — DARF 0291 vence **31/05/2026 (25 dias)** · DARF 6015 atrasado ~7 meses |
| **Aberta** | 2026-05-05 |

---

## DARF 1 — HASH11 Renda Variável (código 6015) — ATRASADO

### Apuração

| Item | Valor |
|------|-------|
| Venda (103 cotas × R$88,47) | R$9.112,41 |
| Custo (103 cotas × R$40,35) | R$4.156,05 |
| Ganho bruto | R$4.956,36 |
| IR devido (15%) | R$743,45 |
| IRRF dedo-duro retido (0,005%) | (R$0,45) |
| **DARF 6015 principal** | **R$743,00** |

**Competência:** 08/2025  
**Vencimento original:** 30/09/2025 — **ATRASADO ~7 meses**  
**Estimativa corrigida (mai/2026):** ~R$950–960 (principal R$743 + multa 20% teto = R$148,60 + juros Selic acumulada set/2025–mai/2026 ~9–10% sobre principal+multa)

### Como pagar

1. Acessar Sicalc: https://sicalc.receita.economia.gov.br/
2. Código de receita: **6015**
3. Período de apuração: **08/2025**
4. CPF: 224.753.558-59
5. **Valor principal: R$743,00** — o Sicalc calcula multa e juros automaticamente; não inserir valor já corrigido
6. Gerar DARF e pagar via internet banking (opção "DARF") ou lotérica

### Impacto na DIRPF 2026

- Ficha Renda Variável (ago/2025): ganho R$4.956,36, IRRF R$0,45
- Bens e Direitos (G07/C08): saldo 31/12/2024 = R$4.156,05 / saldo 31/12/2025 = R$0,00

---

## DARF 2 — Lei 14.754/2023 IBKR + Nomad (código 0291) — vence 31/05/2026

### Apuração — Ganho de capital IBKR (vendas 2025-09-22/23)

| Símbolo | Custo BRL | Venda BRL | Ganho BRL |
|---------|-----------|-----------|-----------|
| JPGL | R$288.537 | R$327.830 | R$39.292 |
| USSC | R$38.879 | R$54.472 | R$15.592 |
| EIMI | R$61.114 | R$69.791 | R$8.677 |
| AVDV | R$27.330 | R$35.715 | R$8.385 |
| ZPRX | R$21.223 | R$28.541 | R$7.318 |
| **Total IBKR** | R$437.083 | R$516.348 | **R$79.265** |

PTAX usado: 2025-09-22 = R$5,3457 / 2025-09-23 = R$5,3063 (BCB PTAX venda)  
Custo por lote convertido pela PTAX da data de cada compra (FIFO, conforme IN RFB 2.180/2024)

### Apuração — Nomad (BOXX/SGOV/TFLO)

Resultado líquido 2025: **R$753,36**

### Dividendos IBKR (Forms 1042-S) — crédito zera o IR

| Form | Tipo | Gross (USD) | Withheld (USD) |
|------|------|-------------|----------------|
| 1042-S #42 | Substitute dividends | US$2.282 | US$685 |
| 1042-S #43 | Dividends US corps | US$3.491 | US$1.047 |
| 1042-S #44 | Interest (isento) | US$3 | US$0 |

US withholding (30%) > IR BR (15%) → crédito zera o imposto brasileiro sobre dividendos. IR adicional = R$0.

### Cálculo do DARF 0291

| Base | Valor |
|------|-------|
| Ganho IBKR (5 ETFs) | R$79.265,00 |
| Nomad (BOXX/SGOV/TFLO) | R$753,36 |
| **Base total** | **R$80.018,36** |
| IR 15% (exato) | R$12.002,75 |
| Dividendos IBKR (WHT US 30% > IR BR 15%) | R$0 — crédito compensa integralmente |
| **DARF 0291 a pagar** | **R$12.003** (arredondado — aceito pela RFB) |

**Competência:** 2025 (apuração anual Lei 14.754/2023)  
**⚠️ Vencimento: 31/05/2026 — 25 dias**

### Como pagar

1. Acessar Sicalc: https://sicalc.receita.economia.gov.br/
2. Código de receita: **0291** (Ganhos de Capital — Aplicações Financeiras no Exterior, Lei 14.754/2023)
3. Período de apuração: **12/2025** (mês/ano — não inserir só "2025")
4. CPF: 224.753.558-59
5. **Valor principal: R$12.003** — pagamento dentro do prazo, sem multa/juros
6. Gerar DARF e pagar via internet banking ou lotérica

---

## Critério de Done

- [ ] DARF 6015 pago (HASH11) — Sicalc com correção do dia
- [ ] DARF 0291 pago (IBKR + Nomad Lei 14.754) — até 31/05/2026
- [ ] Comprovantes salvos em `analysis/IR/IR 2025/DARFs/`
- [ ] Valores registrados na ficha de DARFs pagos para DIRPF 2026

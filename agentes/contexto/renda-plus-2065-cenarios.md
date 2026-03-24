# Renda+ 2065 — Cenários, Retornos e Probabilidades

> Criado: 2026-03-24 | Validado por: RF + Quant (dois auditores independentes)
> Posição atual: 3,2% do portfolio (R$ 111.992) | Alvo tático: ≤5%

---

## Parâmetros do Instrumento

| Parâmetro | Valor |
|-----------|-------|
| Taxa atual (r₀) | 7,00% |
| Duration Macaulay (D) | 43,6 anos |
| Modified Duration | 40,75 |
| (1,07)^43,6 | 19,1044 |
| IPCA estimado (π) | 5,0%/ano |
| Custódia B3 | 0,20%/ano |

---

## Fórmula de Precificação (MtM na venda)

```
R_total = (1,07)^43,6 × (1,05)^N / (1+r₁)^(43,6−N) − 1
```

Onde:
- `N` = anos até a venda
- `r₁` = taxa IPCA+ no momento da venda
- `R_carry = (1,07 × 1,05)^N − 1 = (1,1235)^N − 1` (componente carrego puro)
- `R_mtm = R_total − R_carry` (componente marcação a mercado)

**IR Regressivo (Tesouro Direto):**
- ≤180 dias: 22,5%
- 181–360 dias: 20,0%
- 361–720 dias: 17,5%
- >720 dias: **15,0%**
- Sobre perdas (R_total < 0): **0%**

---

## Regimes de Alocação (Gatilhos)

| Condição | Ação |
|----------|------|
| Taxa ≥ 6,5% + posição < 5% | **Comprar** (DCA) |
| 6,0% ≤ taxa < 6,5% | **Manter** |
| Taxa < 6,0% + posição > 0 + ≥ 720 dias | **Vender tudo** |
| Taxa < 6,0% + posição > 0 + < 720 dias | **Aguardar** X dias |
| Taxa ≥ 9,0% | **Manter** (carrego compensa MtM) |
| Aos 50 anos (2037) | **Zerar** posição |

---

## Tabela Completa por Horizonte

### 8 Cenários

| # | Nome | Taxa final (r₁) |
|---|------|----------------|
| C1 | Muito Bom | 5,0% |
| C2 | Bom | 5,5% |
| C3 | Neutro | 6,0% |
| C4 | Leve Alta | 6,5% |
| C5 | Status Quo | 7,0% |
| C6 | Ruim | 7,5% |
| C7 | Muito Ruim | 8,5% |
| C8 | Péssimo | 10,0% |

---

### N = 0,5 anos (182 dias | IR = 20%)

R_carry = **6,0%**

| # | r₁ | R_total | R_carry | R_mtm | R_líq | R_líq/a |
|---|-----|---------|---------|-------|-------|---------|
| C1 | 5,0% | +139,1% | +6,0% | +133,1% | **+111,2%** | +346% |
| C2 | 5,5% | +94,7% | +6,0% | +88,7% | **+75,8%** | +209% |
| C3 | 6,0% | +58,9% | +6,0% | +52,9% | **+47,1%** | +117% |
| C4 | 6,5% | +29,7% | +6,0% | +23,7% | **+23,8%** | +53% |
| C5 | 7,0% | +6,0% | +6,0% | 0,0% | **+4,8%** | +10% |
| C6 | 7,5% | −13,3% | +6,0% | −19,3% | **−13,3%** | −25% |
| C7 | 8,5% | −41,8% | +6,0% | −47,8% | **−41,8%** | −66% |
| C8 | 10,0% | −67,8% | +6,0% | −73,8% | **−67,8%** | −90% |

---

### N = 1,0 ano (365 dias | IR = 17,5%)

R_carry = **12,4%**

| # | r₁ | R_total | R_carry | R_mtm | R_líq | R_líq/a |
|---|-----|---------|---------|-------|-------|---------|
| C1 | 5,0% | +151,0% | +12,4% | +138,7% | **+124,6%** | +125% |
| C2 | 5,5% | +105,0% | +12,4% | +92,7% | **+86,6%** | +87% |
| C3 | 6,0% | +67,6% | +12,4% | +55,3% | **+55,8%** | +56% |
| C4 | 6,5% | +37,2% | +12,4% | +24,8% | **+30,7%** | +31% |
| C5 | 7,0% | +12,4% | +12,4% | 0,0% | **+10,2%** | +10% |
| C6 | 7,5% | −7,9% | +12,4% | −20,3% | **−7,9%** | −8% |
| C7 | 8,5% | −37,9% | +12,4% | −50,3% | **−37,9%** | −38% |
| C8 | 10,0% | −65,4% | +12,4% | −77,8% | **−65,4%** | −65% |

---

### N = 1,5 anos (548 dias | IR = 17,5%)

R_carry = **19,1%**

| # | r₁ | R_total | R_carry | R_mtm | R_líq | R_líq/a |
|---|-----|---------|---------|-------|-------|---------|
| C1 | 5,0% | +163,6% | +19,1% | +144,5% | **+135,0%** | +77% |
| C2 | 5,5% | +115,8% | +19,1% | +96,7% | **+95,5%** | +56% |
| C3 | 6,0% | +76,8% | +19,1% | +57,7% | **+63,4%** | +39% |
| C4 | 6,5% | +45,0% | +19,1% | +25,9% | **+37,2%** | +23% |
| C5 | 7,0% | +19,1% | +19,1% | 0,0% | **+15,7%** | +10% |
| C6 | 7,5% | −2,1% | +19,1% | −21,2% | **−2,1%** | −1% |
| C7 | 8,5% | −33,7% | +19,1% | −52,8% | **−33,7%** | −24% |
| C8 | 10,0% | −62,8% | +19,1% | −81,9% | **−62,8%** | −48% |

---

### N = 3 anos (1.095 dias | IR = 15%) ← **horizonte tático principal**

R_carry = **41,8%** | EV ponderado = **42,1%** | CAGR = ~12,6%/a

| # | r₁ | R_total | R_carry | R_mtm | R_líq | R_líq/a | Prob N=3 |
|---|-----|---------|---------|-------|-------|---------|---------|
| C1 | 5,0% | +205,1% | +41,8% | +163,3% | **+174,3%** | +40,0% | 2% |
| C2 | 5,5% | +151,6% | +41,8% | +109,7% | **+128,8%** | +31,8% | 5% |
| C3 | 6,0% | +107,6% | +41,8% | +65,8% | **+91,5%** | +24,2% | 12% |
| C4 | 6,5% | +71,5% | +41,8% | +29,7% | **+60,8%** | +17,1% | 22% |
| C5 | 7,0% | +41,8% | +41,8% | 0,0% | **+35,5%** | +10,7% | 27% |
| C6 | 7,5% | +17,4% | +41,8% | −24,5% | **+14,8%** | +4,7% | 18% |
| C7 | 8,5% | −19,4% | +41,8% | −61,2% | **−19,4%** | −6,9% | 9% |
| C8 | 10,0% | −53,9% | +41,8% | −95,7% | **−53,9%** | −22,7% | 5% |

**P(ganho) = 86% | P(perda) = 14%**

---

### N = 5 anos (IR = 15%)

R_carry = **79,0%** | EV ponderado = **74–76%** | CAGR = ~11,7–11,9%/a

| # | r₁ | R_total | R_carry | R_mtm | R_líq | R_líq/a | Prob N=5 |
|---|-----|---------|---------|-------|-------|---------|---------|
| C1 | 5,0% | +271,1% | +79,0% | +192,1% | **+230,4%** | +27,0% | 3% |
| C2 | 5,5% | +208,8% | +79,0% | +129,8% | **+177,5%** | +22,6% | 7% |
| C3 | 6,0% | +157,3% | +79,0% | +78,3% | **+133,7%** | +18,5% | 12% |
| C4 | 6,5% | +114,5% | +79,0% | +35,5% | **+97,4%** | +14,6% | 19% |
| C5 | 7,0% | +79,1% | +79,0% | +0,1% | **+67,2%** | +10,8% | 24% |
| C6 | 7,5% | +49,6% | +79,0% | −29,5% | **+42,1%** | +7,3% | 18% |
| C7 | 8,5% | +4,6% | +79,0% | −74,4% | **+3,9%** | +0,8% | 11% |
| C8 | 10,0% | −38,4% | +79,0% | −117,4% | **−38,4%** | −9,2% | 6% |

**P(ganho) = 94% | P(perda) = 6%**

---

### N = 7 anos (IR = 15%)

R_carry = **125,9%** | EV ponderado = **113–120%** | CAGR = ~11,4–11,5%/a

| # | r₁ | R_total | R_carry | R_mtm | R_líq | R_líq/a | Prob N=7 |
|---|-----|---------|---------|-------|-------|---------|---------|
| C1 | 5,0% | +350,8% | +125,9% | +224,8% | **+298,1%** | +21,8% | 4% |
| C2 | 5,5% | +278,8% | +125,9% | +152,9% | **+237,0%** | +18,9% | 8% |
| C3 | 6,0% | +218,6% | +125,9% | +92,7% | **+185,8%** | +16,2% | 11% |
| C4 | 6,5% | +168,2% | +125,9% | +42,3% | **+143,0%** | +13,5% | 18% |
| C5 | 7,0% | +125,9% | +125,9% | 0,0% | **+107,0%** | +11,0% | 22% |
| C6 | 7,5% | +90,4% | +125,9% | −35,5% | **+76,8%** | +8,5% | 17% |
| C7 | 8,5% | +35,7% | +125,9% | −90,2% | **+30,4%** | +3,9% | 12% |
| C8 | 10,0% | −17,9% | +125,9% | −143,8% | **−17,9%** | −2,8% | 8% |

**P(ganho) = 92% | P(perda) = 8%** _(C8 ainda perde — carry não cobre duration risk a 10%)_

---

### N = 10 anos (IR = 15%)

R_carry = **220,4%** | EV ponderado = **191–205%** | CAGR = ~11,2–11,7%/a

| # | r₁ | R_total | R_carry | R_mtm | R_líq | R_líq/a | Prob N=10 |
|---|-----|---------|---------|-------|-------|---------|---------|
| C1 | 5,0% | +504,1% | +220,4% | +283,7% | **+428,5%** | +18,1% | 5% |
| C2 | 5,5% | +415,0% | +220,4% | +194,6% | **+352,7%** | +16,3% | 9% |
| C3 | 6,0% | +339,2% | +220,4% | +118,8% | **+288,3%** | +14,5% | 10% |
| C4 | 6,5% | +275,1% | +220,4% | +54,7% | **+233,9%** | +12,8% | 17% |
| C5 | 7,0% | +220,5% | +220,4% | +0,1% | **+187,4%** | +11,1% | 20% |
| C6 | 7,5% | +174,0% | +220,4% | −46,4% | **+147,9%** | +9,5% | 16% |
| C7 | 8,5% | +100,7% | +220,4% | −119,7% | **+85,6%** | +6,4% | 13% |
| C8 | 10,0% | +26,5% | +220,4% | −193,9% | **+22,6%** | +2,1% | 10% |

**P(ganho) = 100%** _(carry de 220% cobre até o pior cenário após 10 anos)_

---

## Distribuições de Probabilidade por Horizonte

> Viés fiscal 41/59: P(taxa ≤6,5%) = 41%, P(taxa ≥7%) = 59%
> σ cresce com horizonte — incerteza aumenta no longo prazo

| N | C1 5% | C2 5,5% | C3 6% | C4 6,5% | C5 7% | C6 7,5% | C7 8,5% | C8 10% | Média | σ |
|---|-------|---------|-------|---------|-------|---------|---------|---------|-------|---|
| **3a** | 2% | 5% | 12% | 22% | 27% | 18% | 9% | 5% | 7,03% | 1,03pp |
| **5a** | 3% | 7% | 12% | 19% | 24% | 18% | 11% | 6% | 7,06% | 1,13pp |
| **7a** | 4% | 8% | 11% | 18% | 22% | 17% | 12% | 8% | 7,11% | 1,23pp |
| **10a** | 5% | 9% | 10% | 17% | 20% | 16% | 13% | 10% | 7,16% | 1,32pp |

---

## EV Consolidado

| N | EV R_líq total | CAGR implícito | vs equity BRL (~10,5–11,2%/a) |
|---|---------------|----------------|-------------------------------|
| 3 anos | **42,1%** | ~12,6%/a | **+1,4–2,1 pp/a** |
| 5 anos | **74–76%** | ~11,7–11,9%/a | **+0,5–1,4 pp/a** |
| 7 anos | **113–120%** | ~11,4–11,5%/a | **+0,2–1,0 pp/a** |
| 10 anos | **191–205%** | ~11,2–11,7%/a | **+0,0–1,2 pp/a** |

---

## Análise Threshold — Quando Vender ao Gatilho ≤6%

Comparação: vender **agora** vs aguardar até **N=2,0 anos** (ambos com r₁=6%):

| N atual | Vender agora | Aguardar N=2 | Delta A−B |
|---------|-------------|-------------|-----------|
| 0,5a | 47,1% | 72,9% | −25,8 pp |
| 1,0a | 55,8% | 72,9% | −17,1 pp |
| 1,5a | 63,4% | 72,9% | −9,5 pp |
| 2,0a | 72,9% | 72,9% | **0,0 pp** |

**Conclusão: sempre compensa aguardar até 720 dias (2 anos).**
- 86% do ganho de aguardar vem do carrego adicional
- 14% vem da redução de IR (17,5% → 15%)
- Não existe crossover antes de N=2,0

---

## Fórmula Google Sheets

```
=if(V29>=0,09;"Manter (carrego)";if(AND(V29>0,065;U29<0,05);"Comprar";if(AND(V29<0,06;T29>0;TODAY()-'Renda Fixa'!G7>=720);"Vender";if(AND(V29<0,06;T29>0;TODAY()-'Renda Fixa'!G7<720);"Aguardar "&(720-(TODAY()-'Renda Fixa'!G7))&" dias";"Manter"))))
```

Células: V29=taxa Renda+, U29=participação atual, T29=indicador de posição, `'Renda Fixa'!G7`=data de compra

---

## Sugestões do Head

### 1. Posição atual (3,2%) — manter e aportar

Com taxa em 7,0% (acima do piso 6,5%), a posição ainda está no regime de compra. Meta ≤5%. Continuar DCA conforme entradas de caixa. Próximo aporte livre (pós-JPGL) pode ir aqui.

### 2. "Vale carregar mais pelo EV/ano?" — sim, com expectativa realista

O EV corrigido (~12,6%/a para N=3) supera equity BRL (~10,5–11,2%/a) por **1,4–2,1 pp/a**. Isso é real mas slim. A posição se justifica como diversificador de risco-BR e proteção de taxa real, não como "retorno muito superior ao equity". Não aumentar além de 5% com esse argumento.

### 3. Cenário de atenção: C7/C8 (taxa 8,5–10%)

Probabilidade combinada em N=3: **14%**. Se acontecer, drawdown de 20–54% na posição. Com 3–5% do portfolio, impacto total na carteira: **0,6–2,7 pp**. Aceitável.

### 4. Gatilho de pânico ≥9% (C8 em N=3 = −54%)

Paradoxalmente, **manter** faz sentido: após 10 anos, mesmo C8 (10%) retorna +22,6%. O carrego de 220% absorve o MtM. A regra "≥9% manter carrego" está correta.

### 5. Saída aos 50 anos (2037) — 11 anos

Com N=7-10 anos, P(ganho) = 92–100%. O instrumento se encaixa bem no horizonte FIRE — maturidade coincide com o período de desacumulação.

### 6. Erro crítico identificado e corrigido

EVs da sessão anterior (66–68% para N=3) estavam incorretos por ~25pp — causados por cenários irrealistas (r₁=3–4%, sem precedente histórico no Brasil). Threshold de 380 dias também estava errado (crossover não existe antes de N=2). Ambos corrigidos neste documento.

---

> **Validação**: RF (cálculo primário) + Quant (dois auditores independentes confirmaram EV=42,1% e metodologia).
> Próxima revisão: quando taxa mudar de regime ou posição atingir 5%.

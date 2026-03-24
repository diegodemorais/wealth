# FR-equity-equivalent: Monte Carlo revisado — equity equivalent do tilt fatorial

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-equity-equivalent |
| **Dono** | 04 FIRE |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 02 Factor, 04 FIRE, 10 Advocate, 11 Quant |
| **Dependencias** | FR-003 (concluído) |
| **Criado em** | 2026-03-23 |
| **Origem** | Análise UCITS factor ETFs.xlsx — gap identificado no FR-003 |
| **Concluido em** | 2026-03-24 |

---

## Motivo / Gatilho

FR-003 (Monte Carlo 10k trajetórias) modelou o portfólio de Diego como **79% equity genérico** com retorno 5.89% BRL real e volatilidade uniforme de 16%. O Monte Carlo não diferenciava ETFs por volatilidade individual nem calculava formalmente o equity equivalent do tilt fatorial.

---

## Análise

### 1. Prêmios Esperados por ETF (fórmula FF6)

**JPGL factor loadings ao vivo (FF6):** RmRf 1.042, SmB 0.355, HmL 0.226, RmW 0.227, CmA 0.167, UmD -0.025

| Fator | Premium histórico | Haircut* | Só ERP |
|-------|------------------|----------|--------|
| RmRf | 5.13% | 5.13% | 5.13% |
| SmB | 1.78% | 1.25% | 0% |
| HmL | 3.67% | 2.57% | 0% |
| RmW | 3.67% | 2.57% | 0% |
| CmA | 3.67% | 2.57% | 0% |
| WmL | 8.64% | 4.32% | 0% |

> *Nota Quant: O haircut de WmL é 50% (8.64%×0.50=4.32%), não 30%. Todos os outros fatores têm 30% (ex: SmB 1.78%×0.70=1.25%). O haircut maior em momentum é defensável (turnover + capacity constraints — Frazzini, Israel & Moskowitz 2018), mas deve ser documentado explicitamente.

| ETF | Full History | 50%/30% Haircut | Só ERP |
|-----|-------------|-----------------|--------|
| SWRD (MCW) | 5.13% | 5.13% | 5.13% |
| JPGL | **8.04%** | **7.27%** | 5.35% |
| AVGS | **10.21%** | **8.64%** | 5.23% |
| AVEM | **8.37%** | **7.50%** | 5.64% |

**JPGL full (Quant verificado):**
```
1.042×5.13 + 0.355×1.78 + 0.226×3.67 + 0.227×3.67 + 0.167×3.67 + (-0.025)×8.64
= 5.345 + 0.632 + 0.830 + 0.833 + 0.613 − 0.216 = 8.037% ✅
```

---

### 2. Equity Equivalent do Portfólio de Diego (Quant verificado ✅)

**Definição**: % de equity que, aplicada ao portfólio fatorial, entrega o mesmo prêmio esperado que 100% MCW (VWRA).

**Equity blended de Diego (alvo): 35% SWRD + 25% AVGS + 20% AVEM + 20% JPGL**

```
Full history:
E[R_blended] = 0.35×5.13 + 0.25×10.21 + 0.20×8.37 + 0.20×8.04
             = 1.796 + 2.553 + 1.674 + 1.608 = 7.630%
EE = 5.13 / 7.630 = 67.2%

Haircut:
E[R_blended] = 0.35×5.13 + 0.25×8.64 + 0.20×7.50 + 0.20×7.27
             = 1.796 + 2.160 + 1.500 + 1.454 = 6.910%
EE = 5.13 / 6.910 = 74.2%
```

| Cenário premiums | E[R] blended | Equity Equivalent | Diego's 79% equivale a |
|-----------------|-------------|------------------|------------------------|
| Full history | 7.63% | **67.2%** | 117% MCW puro |
| Haircut (conservador) | 6.91% | **74.2%** | 106% MCW puro |
| Só ERP | 5.40% | **94.9%** | ~MCW puro |

> Nota Quant: Combined EE (AVGS+AVEM+JPGL) da planilha = 58.3%. Recalculado = **57.2%** com os prêmios fornecidos. Diferença de 1.1pp — não altera narrativa.

---

### 3. Volatilidade Real vs FR-003

| ETF | FR-003 (uniforme) | Real estimada | Fonte |
|-----|-------------------|---------------|-------|
| SWRD | 16% | 15.5% | DMS 2025 |
| AVGS | 16% | **20.5%** | AVUV beta 1.20 × 16%; global SCV +1-2pp |
| AVEM | 16% | **22.0%** | Composer: 20.1% histórico + EM premium |
| JPGL | 16% | 16.0% | Multi-factor com low-vol tilt |

**Correlações estimadas:** SWRD-AVGS 0.88, SWRD-AVEM 0.72, SWRD-JPGL 0.95, AVGS-AVEM 0.70, AVGS-JPGL 0.85, AVEM-JPGL 0.75

**Volatilidade de portfolio Markowitz (Quant calculado):**
```
σ_portfolio = √282.157 = 16.8%
```
- FR-003 usou 16.0% → subestimava 0.8pp
- FIRE estimou 17.3% → superestimava 0.5pp
- **Valor correto: 16.8%** (com diversificação entre ETFs)

Impacto no P(FIRE): **-0.5-0.8pp** (menor que estimado inicialmente).

---

### 4. Cenários de Bond Tent

| Cenário | Equity% | Tipo | RF% | E[R] portfólio | Vol portfólio | P(FIRE) Guard | Stress (ERP=0) | Sortino |
|---------|---------|------|-----|----------------|---------------|--------------|----------------|---------|
| **A — atual** | **79%** | Blended (35% SWRD) | **15%** | **5.86%** | **~13.7%** | **~90-91%** | **~88%** | **0.31** |
| B | 74% | Pure factor | 20% | 6.14% | ~14.8% | ~89-90% | ~86% | 0.31 |
| **C** | **69%** | Pure factor | **25%** | **6.13%** | **~13.8%** | **~90%** | **~87%** | **0.32** |
| MCW ref | 79% | SWRD only | 15% | 5.57% | ~12.6% | ~89% | ~89% | 0.32 |

**Fiscal space do tilt fatorial (dois benchmarks):**
- vs MCW puro: 20.3pp de RF adicional possível (haircut) — já está parcialmente monetizado na estratégia
- Substituindo blended por pure factor: 9.6pp de espaço adicional (haircut) — operacional

---

### 5. Stress Test "Só ERP" (factor premium = 0)

| Cenário | P(FIRE) base | P(FIRE) ERP=0 | Queda |
|---------|-------------|---------------|-------|
| A (blended) | ~90-91% | ~88% | -2-3pp |
| C (pure factor) | ~90% | ~87% | -3-4pp |
| MCW ref | ~89% | ~89% | 0pp |

O SWRD a 35% do bloco equity funciona como **opção gratuita contra falha dos premiums fatoriais**. Removê-lo concentra todo o risco de modelo no factor.

---

### 6. Por que JPGL continua sendo prioridade de aportes

| Argumento | Status |
|-----------|--------|
| Prêmio adicional vs AVGS/AVEM overweight | ❌ Impacto < 0.03pp — AVGS/AVEM já compensam |
| Redução de volatilidade do portfolio | ✅ -0.6pp (16.8% → ~16.2%) |
| Diversificação de fatores (momentum + low-vol) | ✅ AVGS/AVEM não têm esses fatores |
| Tail risk insurance dentro do bloco equity | ✅ AVGS drawdown potencial -39% a -60%+; JPGL low-vol dilui |

**O argumento para JPGL não é retorno esperado — é tail risk e diversificação de fatores.**

---

## Conclusão

### Portfólio atual (A) é Sortino-eficiente. Nenhuma mudança de alocação recomendada.

**Raciocínio:**
1. AVGS tem maior alpha (8.64-10.21%), AVEM tem alpha moderado (7.50-8.37%). Esses prêmios compensam a volatilidade adicional.
2. JPGL tem o mesmo beta de mercado com multi-factor + low-vol tilt — é proteção dentro do bloco equity, não retorno extra.
3. Adicionar RF além do target de 15% (bond tent) reduz o retorno esperado sem melhorar o Sortino — troca alpha real por garantia a taxa neutra.
4. A 15% de IPCA+ está lá pelo SoRR pré-FIRE (vence 3 anos após os 50), não para otimizar Sortino. Essa função está correta.
5. O SWRD funciona como seguro contra falha dos premiums fatoriais. Removê-lo para "otimizar" não melhora Sortino e piora o stress ERP=0.

**Principal alavanca de P(FIRE) continua sendo guardrails** (+7-30pp), não alocação.

### Correções documentais (Quant)

1. Planilha UCITS factor ETFs.xlsx: WmL "30% haircut" deve ser rotulado como **50% haircut** (ou corrigir valor para 6.048%)
2. Combined EE (AVGS+AVEM+JPGL): corrigir de 58.3% para **57.2%** nos documentos internos
3. Volatilidade do portfolio de equity: **16.8%** (não 16% do FR-003 nem 17.3% preliminar)

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Sem mudança. 79% equity blended / 15% IPCA+ / 3% cripto validado como Sortino-eficiente |
| **Estratégia** | Bond tent de 15% é correto para SoRR. Fiscal space fatorial de 9.6pp (haircut) existe mas não melhora Sortino. SWRD funciona como seguro anti-modelo — não remover. |
| **Conhecimento** | Equity equivalent: 74.2% (haircut) / 67.2% (full history). Vol real: 16.8%. JPGL = tail risk + diversificação fatorial, não prêmio extra. Factor premium compensa vol (+1-2pp net). |
| **Memória** | Registrar: EE blended 74.2% (haircut). Vol 16.8%. Portfólio Sortino-eficiente. Nenhuma mudança de alocação. JPGL = tail risk, não alpha. |

---

## Próximos Passos

- [x] Executado em 2026-03-24
- [ ] Atualizar planilha UCITS factor ETFs.xlsx: WmL haircut label (50%, não 30%)
- [ ] Revisitar se JPGL atingir target (20% equity) e factor premiums tiverem 5+ anos de track record: recalcular EE com dados ao vivo

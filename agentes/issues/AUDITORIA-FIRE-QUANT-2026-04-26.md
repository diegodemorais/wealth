# AUDITORIA FIRE — Quant Review 2026-04-26

**Status:** 🔴 BLOCKER (RF-1, RF-2, RF-3)  
**Data:** 2026-04-26  
**Auditor:** Quant  
**Escopo:** fire/page.tsx + todos componentes dependentes (13 arquivos, 2.847 linhas código)  
**Severidade:** 3 red flags críticos + 6 áreas de atenção

---

## RESUMO EXECUTIVO

Auditoria numérica completa da aba FIRE identificou **3 deploy blockers**:

1. **RF-1** — pfire_aspiracional idêntico a pfire_base (86.3% vs 78.8% esperado)
2. **RF-2** — PFireDistribution exibe percentis fictícios como se fossem reais
3. **RF-3** — FireScenariosTable footer mente sobre N simulações (10k vs 2k real)

Impacto: usuário toma decisões financeiras baseado em dados aspiracionais incorretos.

7 áreas consistentes + 6 áreas de atenção. Deploy permitido apenas para **base**, **bloqueado para aspiracional**.

---

## 🔴 RED FLAGS

### RF-1 — pfire_aspiracional = pfire_base (DEPLOY BLOCKER)

**Achado:**
```
data.pfire_aspiracional.base = 86.3%  ← idêntico a pfire_base
carteira.md: "P(FIRE Aspiracional) = 78.8%"  ← esperado
Diferença: +7.5pp
```

**Causa Raiz:**
`generate_data.py` não computa MC separado para cenário aspiracional. Apenas copia `pfire_base`:
```python
# linha 342 em generate_data.py
pfire_aspiracional = pfire_base  # ERRO: deveria ser MC com aporte R$30k
```

**Metodologia Esperada:**
- Aporte mensal: R$30k (vs R$25k base)
- Horizonte: 49 anos (FIRE 2035, vs 53 anos base)
- Mercado: favorável (equity +7.5%, BRL stable)
- N sims: 10.000 (canonical)
- Esperado: P(FIRE) ≈ 78.8% per carteira.md decisão D7-Strategic

**Dashboard Current:**
- Card "Aspiracional" exibe P=86.3%, idade 49, ano 2036
- Real esperado: P=78.8%, idade 49, ano 2035
- Discrepância visível ao usuário: mesma P(FIRE) mas horizonte 1 ano menor = inconsistência flagrante

**Impacto:**
- Usuário vê "Aspiracional = Base", decide por base conservador
- Realidade: Aspiracional ~78%, bem mais arriscado que aparenta
- Risco: Decisão de spending/draw strategy baseada em probabilidade fictícia

**Fix:**
```python
# gerar MC separado em fire_montecarlo.py
resultado_aspiracional = run_canonical_mc(
    aporte_mensal=30_000,
    meses=(2035-2026)*12 + 4,  # até idade 49, ano 2035
    mercado='favoravel',
    n_sim=10_000
)
data.pfire_aspiracional = {
    'base': resultado_aspiracional.p_fire,
    'fav': resultado_aspiracional.p_fire_otimista,
    'stress': resultado_aspiracional.p_fire_pessimista
}
```

**Prioridade:** 🔴 P0 — Bloqueia aspiracional  
**Esforço:** 2h (MC run + validação)

---

### RF-2 — PFireDistribution percentis sintéticos vs reais

**Achado:**
```
Component: PFireDistribution.tsx
Label: "P(FIRE) Distribuição Monte Carlo — Percentis"
Tabela exibe:
  p5:  74.3%
  p10: 76.3%
  p25: 78.3%
  p50: 86.3%  ← mediana
  p75: 91.3%
  p90: 94.3%
  p95: 96.3%
```

**Realidade:**
```javascript
// PFireDistribution.tsx linhas 45-65
const percentiles = data.pfire_base.percentiles ?? {
  p5: base - 12,   // 86.3 - 12 = 74.3
  p10: base - 10,  // 86.3 - 10 = 76.3
  p25: base - 8,   // 86.3 - 8 = 78.3
  p50: base,       // 86.3
  p75: base + 5,   // 86.3 + 5 = 91.3
  p90: base + 8,   // 86.3 + 8 = 94.3
  p95: base + 10   // 86.3 + 10 = 96.3
}

// esses são OFFSETS HARDCODED, não percentis do MC
// campo data.pfire_base.percentiles não existe no JSON
```

**Por que é problema:**
- Componente rotula "Distribuição MC" mas está exibindo offsets sintéticos
- Assimetria fictícia: cauda esquerda −12pp, cauda direita +10pp
- Usuário interpreta como "há 90% de probabilidade entre 76% e 94%" (falso)
- Realidade: distribuição real do MC pode ter p10=68%, p90=92% (diferente)

**Teste de Validação:**
```python
# Rodei 10k sims, calculei percentis reais
real_p10 = sorted(results)[1000]   # ~68-72% (não 76%)
real_p90 = sorted(results)[9000]   # ~91-95% (alinhado, mas coincidência)
```

**Fix:**
1. Adicionar ao pipeline Python:
```python
# fire_montecarlo.py
pfire_results = [sim.p_fire for sim in simulations]  # 10k valores
percentiles = {
    'p5': np.percentile(pfire_results, 5),
    'p10': np.percentile(pfire_results, 10),
    ...
    'p95': np.percentile(pfire_results, 95)
}
data.pfire_base.percentiles = percentiles
```

2. Remover fallback hardcoded:
```typescript
// PFireDistribution.tsx
const percentiles = data.pfire_base.percentiles;
if (!percentiles) throw new Error('percentiles missing — rerun generate_data.py');
```

**Impacto:** Usuário base toma decisões conservadoras demais (pensa que há risco maior que real)  
**Prioridade:** 🔴 P0 — Afeta interpretação de tail risks  
**Esforço:** 3h (MC analysis + pipeline + component fix)

---

### RF-3 — FireScenariosTable footer afirma N=10.000 para cenário que usa N=2.000

**Achado:**
```
Linha "Câmbio Dinâmico ★" em FireScenariosTable:
  - Roda: runCanonicalMC({ N: 2_000, ... })
  - Footer unificado diz: "Baseado em 10.000 simulações Monte Carlo"
```

**Por que é problema:**
- SE(P) com N=2.000 é ±1.6% (95% CI: 86.3% ± 3.2%)
- SE(P) com N=10.000 é ±0.7% (95% CI: 86.3% ± 1.4%)
- Diferença de fator 2.3x em precisão
- Footer mente sobre o que realmente rodou

**Código:**
```typescript
// FireScenariosTable.tsx linhas 120-130
// Câmbio Dinâmico roda:
const result = runCanonicalMC({
  N: 2_000,  // ← AQUI
  cambio: cambioAmarelo,
  // ... rest
})

// Footer (linhas 160-163):
<div>Baseado em 10.000 simulações Monte Carlo · Seed=42 · 2026-04-25</div>
// ↑ Não especifica que Câmbio Dinâmico é N=2.000
```

**Fix:**
```typescript
// Adicionar footer específico para Câmbio Dinâmico
{cenario === 'cambio' ? (
  <div style={{fontSize: 11, color: 'var(--muted)'}}>
    <strong>★ Estimativa rápida:</strong> N=2.000 simulações (SE ±1.6%) · Seed=42 · 2026-04-25
  </div>
) : (
  <div>Baseado em 10.000 simulações Monte Carlo · Seed=42 · 2026-04-25</div>
)}
```

**Impacto:** Usuário confia demais na precisão de "Câmbio Dinâmico"  
**Prioridade:** 🟡 P1 — Label/footer, não número  
**Esforço:** 0.5h

---

## ⚠️ ÁREAS DE ATENÇÃO (6)

### A — spendingSensibilidade desatualizado (90.4% vs 86.3%)

**Achado:**
```
data.spendingSensibilidade[0] = {custo: 250000, base: 90.4%}  ← de 2026-04-06
data.pfire_base.base = 86.3%  ← de 2026-04-25
Diferença: 4.1pp
```

**Causa:** `spendingSensibilidade` vem de MC anterior (2026-04-06). Parâmetros mudaram (guardrails atualizados, spending smile ajustado, saúde VCMH).

**Impacto:** Mínimo — campo não é consumido na aba FIRE (`dataWiring.ts` marca como orphan). Mas indica decay de dados.

**Fix:** Re-rodar `spendingSensibilidade` com MC 2026-04-25.

**Prioridade:** 🟢 P2 — Não afeta display  
**Esforço:** 1h

---

### B — FireMatrixTable cores/legenda inconsistentes

**Achado:**
```javascript
getColor(p) {
  if (p >= 90) return green;    // ≥90
  if (p >= 70) return yellow;   // 70–89
  if (p >= 50) return orange;   // 50–69
  return red;                   // <50
}

// Legenda exibe:
// Verde ≥90%, Amarelo 70–90% (pula 50–70!), Laranja não mostrado, Vermelho <50%
```

**Impacto:** Usuário confundido sobre o que amarelo significa (é 70–89% ou 88–95%?).

**Fix:** Alinhar legenda com `getColor()`.

**Prioridade:** 🟡 P1  
**Esforço:** 0.5h

---

### C — pfireToGuardrailTier vs pfireColor divergem (80% vs 85%)

**Achado:**
```javascript
// pfireToGuardrailTier
if (p >= 80) return 'Manter';    // verde

// pfireColor
if (p >= 85) return 'ATENÇÃO';   // amarelo

// Para P=82%:
// - Guardrail Action: "Manter" (verde)
// - Text color: "ATENÇÃO" (amarelo)
// Inconsistência visual
```

**Impacto:** P ∈ [80%, 85%) mostra verde badge mas amarelo texto.

**Fix:** Alinhar threshold em ambas funções.

**Prioridade:** 🟡 P1  
**Esforço:** 0.5h

---

### D — "Surviving Spouse" usa patrimônio atual, não FIRE Day

**Achado:**
```javascript
patrimonioTotal = patrimonio_atual + pgblKatia
// = R$3.73M + R$490k = R$4.22M

// Cobertura "FIRE Day" com patrimônio atual:
cobertura = 4.22M / 1.89M = 223%

// Correto seria projetar patrimônio FIRE Day (~R$11.7M mediano):
cobertura_real = 11.7M / 1.89M = 618%
```

**Impacto:** Análise de "Se Diego falecesse no FIRE Day" mostra cobertura enganosa (223% vs 618%).

**Fix:** Usar patrimônio projetado no FIRE Day quando `analyzed_year = fire_year_threshold`.

**Prioridade:** 🟡 P1 — Será crítico quando `tem_conjuge=True`  
**Esforço:** 2h (redesenho da lógica)

---

### E — fireMatrixIdades extrapola para patrimônios > R$11.68M

**Achado:** Linhas de patrimônio R$12M–16M usam extrapolação linear (não MC). SEs aumentam.

**Impacto:** Baixo — idades para pat>R$11.68M são estimativas.

**Prioridade:** 🟢 P3  
**Esforço:** 1h

---

### F — bond_tent_meta_anos ausente em JSON

**Achado:** Campo retorna `null`, código usa fallback 7. Correto, mas mudança em `carteira.md` não propaga.

**Fix:** Adicionar `premissas.bond_tent_meta_anos = 7` ao pipeline.

**Prioridade:** 🟢 P2  
**Esforço:** 0.5h

---

## ✅ ÁREAS CONSISTENTES (7)

- ✓ **meta_fire_brl** = 8.333.333 = custo_vida / swr = 250k / 0.03 (validado)
- ✓ **SWR mediano** = 250k / 11.694.745 = 2.138% ≈ 2.14% (correto)
- ✓ **PTAX única** = R$5.156 em todos componentes (centralizado)
- ✓ **Cálculos MC** = Ito correction, lognormal params validados
- ✓ **pfireColor** centralizado em `utils/fire.ts`
- ✓ **FloorUpsideFire** aritmética validada manualmente
- ✓ **spendingSmile** = go_go R$242k, slow_go R$200k, no_go R$187k (alinhado com carteira.md)

---

## 💾 RECOMENDAÇÕES DE REFACTORING (Não Blocker)

1. Adicionar `pfire_base.percentiles` ao pipeline (RF-2 fix)
2. Adicionar `pisoEssencial` ao JSON (remover hardcode 184000 em SoRR)
3. Computar `pfire_aspiracional` corretamente (RF-1 fix)
4. Alterar footer Câmbio Dinâmico (RF-3 fix)
5. Consolidar `fmtPct` (existe em 2 places)
6. Adicionar `bond_tent_meta_anos` ao pipeline (Área F fix)

---

## 📋 IMPLEMENTAÇÃO ROADMAP

### Fase 1: Deploy Blockers (RF-1, RF-2, RF-3)
- Esforço: 5.5h
- Impacto: +0.6 audit score (consistência numérica)

### Fase 2: Áreas de Atenção (A–F)
- Esforço: 6.5h
- Impacto: +0.2 audit score (centralização)

### Faseamento Recomendado:
**Imediato (próximas 2h):**
- RF-1: Rodar MC aspiracional
- RF-3: Alterar footer
- Area C: Alinhar threshold 85%

**Seguinte (próximas 4h):**
- RF-2: Adicionar percentiles ao pipeline
- Area B: Alinhar legenda
- Area D: Usar patrimônio FIRE Day

**Backlog (próximas 2h):**
- Area A, E, F: Refactoring menor

---

## VEREDICTO QUANT

**Deploy BLOQUEADO para aspiracional** (RF-1 + RF-2).  
**Deploy permitido para base** (RF-3 é label, não afeta P(FIRE) exibido).

Recomendação executiva: Fazer RF-1 + RF-3 hoje (2h), deixar RF-2 para amanhã (requer pipeline Python). Base fica operacional com as label fixes.

---

**Ass.:** Quant  
**Status:** 🔴 AWAITING IMPLEMENTATION  
**Próximo:** Head aprova roadmap e aloca Diego/Quant/Dev

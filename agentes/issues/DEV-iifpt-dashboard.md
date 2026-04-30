# DEV-iifpt-dashboard: Implementar Dashboard Components IIFPT

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-iifpt-dashboard |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | Dev (implementação) |
| **Criado em** | 2026-04-30 |
| **Origem** | HD-iifpt-integration — spec extraída na conclusão da issue analítica |
| **Concluido em** | — |

---

## Contexto

A issue HD-iifpt-integration (concluída 2026-04-30) aplicou o framework IIFPT à carteira de Diego e produziu esta spec. Os dados já existem — o trabalho aqui é expô-los no dashboard e no pipeline.

**Dados disponíveis:**
- `agentes/contexto/priority_matrix.json` — Λ calibrado (Inv 0.35 / Ret 0.25 / Tax 0.18 / CF 0.10 / RM 0.07 / Est 0.05)
- `scripts/config.py::IIFPT_COVERAGE` — domain coverage scores (0/0.5/1.0)
- `scripts/config.py::IIFPT_COUPLING_INTENSITY` — acoplamentos com intensidades
- `scripts/config.py::IIFPT_DOMAINS` — labels dos 6 domínios
- `agentes/contexto/carteira.md` — bloco "Regime de Vida" (r2_mid_career, trigger r3 ~2034)

---

## Backlog

### CC1 — Pipeline: expor `priority_matrix` em `data.json`

**Arquivo:** `scripts/generate_data.py`

**O que fazer:**
1. Ler `agentes/contexto/priority_matrix.json` no pipeline
2. Expor como campo `priority_matrix` em `data.json`
3. Expor `domain_coverage` a partir de `IIFPT_COVERAGE` em `config.py`
4. Expor `regime_vida` (string: `r2_mid_career`) em `data.json`
5. Adicionar assertion de schema para esses 3 campos

**Invariante:** `priority_matrix` é dado elicitado — nunca inferido nem sobrescrito automaticamente pelo pipeline.

**Estrutura esperada em `data.json`:**
```json
{
  "priority_matrix": {
    "weights": { "inv": 0.35, "ret": 0.25, "tax": 0.18, "cf": 0.10, "rm": 0.07, "est": 0.05 },
    "version": "2026-04-30"
  },
  "domain_coverage": { "inv": 1.0, "ret": 1.0, "tax": 1.0, "cf": 0.8, "rm": 0.1, "est": 0.1 },
  "regime_vida": "r2_mid_career"
}
```

---

### DC1 — Domain Coverage Radar (Hexagon)

**Localização:** Tab NOW — abaixo do wellness block

**Componente:** `src/components/dashboard/IifptRadar.tsx`

**Tipo:** ECharts Radar com 6 eixos

**Dados:** `data.domain_coverage` (cobertura atual) + `data.priority_matrix.weights` (pesos)

**Spec visual:**
- Eixos: Inv, Ret, Tax, CF, RM, Est
- Série 1 (preenchida): coverage score por domínio (0–1)
- Série 2 (tracejada): peso Λ normalizado (0–1, para comparar atenção vs. prioridade)
- Cor vermelho/amarelo nos eixos com coverage < 0.3 (RM = vermelho, Est = amarelo)
- Tooltip: `${domínio}: cobertura ${coverage*100}% | peso ${weight*100}%`
- Privacy mode: ocultar valores, manter shape

**Lógica de negócio:**
- Gap = domínio onde coverage < peso × 1.5 → destacar em vermelho
- Badge de alerta se qualquer gap com w_k ≥ 0.10

---

### DC2 — Regime Indicator Badge

**Localização:** Tab NOW — próximo ao KpiHero (linha de badges de status)

**Componente:** inline no NOW page ou sub-componente `RegimeIndicator.tsx`

**Dados:** `data.regime_vida`

**Spec visual:**
```
[r2: Acumulação] → [r3: Pré-FIRE ~2034]
```
- Badge com ícone de fase atual
- Texto: `Acumulação acelerada · Transição r3 ~2034`
- Cor: azul para r2, laranja para r3, verde para r4
- Tooltip: "Regime baseado no framework IIFPT. Trigger r3: patrimônio ≥ R$9M ou P(FIRE) ≥ 90% por 2 anos."

---

### DC3 — Nota de Gaps no P(FIRE) Display

**Localização:** KpiHero card ou FireProgress card — abaixo do valor de P(FIRE)

**Não criar componente novo** — adicionar nota inline existente

**Spec:**
- Se `domain_coverage.rm < 0.3` OU `domain_coverage.est < 0.3`:
  - Exibir nota discreta: `RM ❌ Est ⏳ não modelados`
  - Tooltip: "P(FIRE) modela Investment + Retirement. Risk Management e Estate Planning não estão incluídos no cálculo."
- Privacy mode: ocultar nota (contém info indireta de estrutura)

---

## Notas para o Dev

- **Não implementar o tensor completo** — sem calibração matemática (impraticável). O valor é visibilidade dos gaps, não a matemática IIFPT.
- **DC4 (Life Event Shock Simulator)** está fora desta issue — Fase 2, após DC1-DC3 validados.
- O radar DC1 deve ser **CollapsibleSection** com open por default no primeiro acesso.
- Usar `useConfig()` hook para acessar constantes IIFPT do `data.json`.

---

## Conclusao

> A preencher após implementação.

# DEV-fire-matrix-v2: FIRE Matrix — 3 cenários + eixos Patrimônio×Gasto + visual melhorado

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-fire-matrix-v2 |
| **Dono** | Head |
| **Status** | 🔵 Doing |
| **Prioridade** | 🟡 Média |
| **Participantes** | FIRE (spec), Dev (implementação) |
| **Criado em** | 2026-04-11 |
| **Origem** | Diego — seletor de cenário + SWR range ajustado + visual melhorado |
| **Deps** | — |

---

## Problemas identificados (FIRE + Dev)

1. **Eixos contra-intuitivos**: SWR × Gasto faz P(FIRE) subir com gasto (quem gasta mais chegou com mais patrimônio). Eixos corretos: **Patrimônio × Gasto**.
2. **Toda matriz em verde** (92–97%): SWR range 2–3% é conservador demais. Sem zonas críticas visíveis.
3. **Sem âncora**: não mostra onde Diego está no espaço (P50 patrimônio projetado × gasto base).
4. **Cenário único**: sem seletor base/fav/stress.

---

## Spec aprovado

### Dados (core)
- Eixo X (colunas): Gasto anual — R$180k, 220k, 250k, 270k, 300k, 350k
- Eixo Y (linhas): Patrimônio no FIRE Day — R$7M, 9M, 11M, 12M, 13M, 14M, 16M
- 3 matrizes: base (4.85%), fav (5.85%), stress (4.35%)
- Salvo em `dados/fire_matrix.json` como `{"cenarios": {"base": {...}, "fav": {...}, "stress": {...}}}`

### Visual
- Seletor Base / Favorável / Stress (period-btns)
- Gradiente contínuo: verde (>95%) / amarelo (88–95%) / vermelho (<88%)
- Marcador "Você aqui": célula mais próxima do (P50 patrimônio projetado, gasto base)
- Tooltip: P(FIRE), SWR implícito (gasto/patrimônio)

---

## Fase 1 — Core ✅ (2026-04-11)

Geração das 3 matrizes em `reconstruct_fire_data.py` + `dados/fire_matrix.json`

## Fase 2 — Dashboard 📋 Pendente

`buildFireMatrix()` com seletor + heatmap + marcador

## Fase 3 — Quant Validação 📋 Pendente

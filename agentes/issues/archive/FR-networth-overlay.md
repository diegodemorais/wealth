# FR-networth-overlay: Historical Net Worth Overlay (Real vs Projeção P50)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-networth-overlay |
| **Dono** | Dev |
| **Status** | Done |
| **Prioridade** | 🟡 Média |
| **Participantes** | Dev (implementação), FIRE (spec) |
| **Criado em** | 2026-05-01 |
| **Origem** | HD-projection-lab-audit — gap P2 (Historical net worth overlay no PL) |
| **Concluido em** | 2026-05-01 |

---

## Contexto

O Projection Lab sobrepõe o progresso real do patrimônio com a projeção original do plano. É um tracker de "você está acima ou abaixo da trajetória P50?" — motivador e útil para calibrar re-runs anuais do MC.

Diego tem `reconstruct_history.py` que já gera histórico mensal de patrimônio desde 2021. E tem projeção P50 do MC. O que falta é sobrepor os dois no mesmo gráfico.

Essa feature é de baixo esforço (dados já existem) e alto impacto comportamental: confirma se a velocidade de acumulação está no caminho certo.

---

## Escopo

### Dados Necessários

**Histórico real** (`fire_trilha` já existe no `data.json`):
```json
"fire_trilha": {
  "dates": ["2021-01", "2021-02", ...],
  "trilha_brl": [1200000, 1250000, ...]
}
```

**Projeção P50** — derivar do MC:
- Adicionar `fire_percentiles.p50_from_start[]` com valores a partir de 2021
- Ou calcular retroativamente com premissas históricas (retorno médio realizado)

**Alternativa simples:** Projeção linear/exponencial retrospectiva com taxa de retorno realizada. Menos preciso mas implementável sem rodar MC histórico.

### Dashboard (React/ECharts)

**Componente:** Expandir `TrackingFireChart.tsx` existente OU criar `NetWorthOverlayChart` na aba FIRE, seção `section-tracking-fire` ou nova `section-networth-overlay`

**Visualização:**
- ECharts `line`
- Eixo X: 2021 → 2040 (histórico + projeção)
- Eixo Y: R$ em milhões (privacy mode obrigatório)
- Linha 1: patrimônio real (histórico CSV) — sólida, azul
- Linha 2: projeção P50 do MC — tracejada, cinza
- Linha 3: projeção P90 (cenário favorável) — tracejada, verde claro
- Linha 4: projeção P10 (cenário desfavorável) — tracejada, vermelho claro
- Marcador vertical: "HOJE" (data atual)
- Marcador horizontal: FIRE Number (patrimônio gatilho)
- Tooltip: patrimônio real vs projeção P50 na data com delta (acima/abaixo em %)
- Badge de status: "▲ X% acima do P50" ou "▼ X% abaixo do P50"

---

## Critério de Aceite

- [ ] Histórico real (`fire_trilha`) plotado corretamente
- [ ] Projeção P50 (e opcionalmente P10/P90) plotada a partir de hoje
- [ ] Badge de status "acima/abaixo do P50" com delta percentual
- [ ] Linha vertical em "HOJE"
- [ ] Linha horizontal no FIRE Number
- [ ] Privacy mode mascara valores R$
- [ ] `data-testid` em `networth-overlay-status` e `networth-overlay-delta`
- [ ] Assertion em `e2e/semantic-smoke.spec.ts`

---

## Notas

- `TrackingFireChart.tsx` já existe — verificar se pode ser expandido antes de criar novo componente (princípio DRY do CLAUDE.md)
- Se o MC já gera P50 por ano, usar esse dado. Se não, calcular retroativamente com retorno médio realizado do período
- Dados históricos: `scripts/reconstruct_history.py` + `fire_trilha` em data.json
- `agentes/issues/HD-projection-lab-audit.md` § Historical Net Worth Overlay

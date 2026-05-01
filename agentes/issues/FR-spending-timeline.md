# FR-spending-timeline: Spending por Componente ao Longo do Tempo

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-spending-timeline |
| **Dono** | Dev |
| **Status** | Done |
| **Prioridade** | 🟡 Média |
| **Participantes** | Dev (implementação), FIRE (spec) |
| **Criado em** | 2026-05-01 |
| **Origem** | HD-projection-lab-audit — gap P2 (Sankey/spending visualization no PL) |
| **Concluido em** | 2026-05-01 |

---

## Contexto

O spending smile está modelado no MC de Diego (3 fases + VCMH separado + hipoteca), mas não é visível no dashboard. O usuário vê só o custo de vida agregado como número.

O Projection Lab tem Sankey diagram mostrando fluxo por categoria. O equivalente para Diego é um **área chart empilhado** mostrando como cada componente do gasto evolui de 2040 a 2090.

Isso confirma que o plano é internamente consistente e que o spending smile funciona como modelado.

---

## Escopo

### Dados necessários (`spending_smile` já existe no `data.json`)

Verificar se `spending_smile` tem dados anuais suficientes por componente:
```json
"spending_smile": {
  "go_go": { "gasto_lifestyle": 242000, "gasto_saude": 24000, "anos": [2040-2054] },
  "slow_go": { "gasto_lifestyle": 200000, "gasto_saude": 36000, "anos": [2055-2069] },
  "no_go": { "gasto_lifestyle": 187000, "gasto_saude": 54000, "anos": [2070-2090] }
}
```

Se não houver granularidade anual, adicionar ao pipeline:
- `spending_timeline.years[]`
- `spending_timeline.lifestyle_brl[]` (spending smile por fase)
- `spending_timeline.saude_brl[]` (VCMH 3.5%/ano real, escalante)
- `spending_timeline.hipoteca_brl[]` (R$3.6k/mês até 2051-02)
- `spending_timeline.total_brl[]`

### Dashboard (React/ECharts)

**Componente:** `SpendingTimelineChart` na aba FIRE, seção `spending-timeline` (nova) ou expandindo seção existente de spending

**Visualização:**
- ECharts `bar` stacked (ou `line` area stacked)
- Eixo X: 2040–2090 (anos)
- Eixo Y: R$/ano (privacy mode obrigatório)
- Séries empilhadas: Lifestyle (azul) + Saúde (verde) + Hipoteca (amarela, até 2051)
- Linha de total (branca, acima das barras)
- Marcadores verticais de fase: go-go / slow-go / no-go
- Tooltip: breakdown completo por componente em cada ano

**Opcional:**
- Botão para alternar entre "valores reais" e "valores nominais (IPCA estimado)"

---

## Critério de Aceite

- [ ] Pipeline serializa spending por componente e por ano (2040-2090)
- [ ] Componente renderiza sem erro
- [ ] Privacy mode mascara valores
- [ ] Fases go-go/slow-go/no-go claramente demarcadas
- [ ] Hipoteca some após 2051
- [ ] Saúde escala visivelmente ao longo das décadas
- [ ] `data-testid` em `spending-timeline-total-2040` e `spending-timeline-saude-2070`
- [ ] Assertion em `e2e/semantic-smoke.spec.ts`

---

## Referências

- `agentes/issues/FR-spending-smile` (modelo aprovado — usar mesmos parâmetros)
- `agentes/issues/FR-guardrails-categoria-elasticidade` (separação saúde/lifestyle)
- `agentes/issues/HD-projection-lab-audit.md` § Spending ao Longo do Tempo

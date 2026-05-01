# FR-bond-pool-tracker: Bond Pool Depletion Tracker (2040–2047)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-bond-pool-tracker |
| **Dono** | Dev |
| **Status** | Done |
| **Prioridade** | 🔴 Alta |
| **Participantes** | Dev (implementação), FIRE (spec) |
| **Criado em** | 2026-05-01 |
| **Origem** | HD-projection-lab-audit — gap Diego-specific sem equivalente no PL |
| **Concluido em** | 2026-05-01 |

---

## Contexto

O guardrail de fonte é a decisão estrutural mais crítica dos primeiros 7 anos pós-FIRE: sacar do bond pool (TD 2040 + IPCA+ curto 3%) antes do equity, protegendo contra sequence of returns risk nos anos 1-7.

O bond pool existe como número no dashboard (saldo atual, % cobertura), mas não há visualização de **quanto tempo o pool dura** e **quando esgota** dado o nível de gasto.

Sem essa visualização, é difícil calibrar se R$250k/ano é sustentável pelos 7 anos sem tocar em equity.

---

## Escopo

### Pipeline (`fire_montecarlo.py` ou script dedicado)

Calcular a projeção determinística do bond pool:
- Saldo inicial: TD 2040 valor_brl + IPCA+ curto valor_brl (em 2040)
- Saque anual: `gasto_piso` (R$180k essencial) ou `custo_vida_base` (R$250k)
- Retorno do pool durante uso: taxa IPCA+ real (juros acumulados nos títulos HTM)
- Output: `bond_pool_projection.years[]`, `bond_pool_projection.saldo[]`, `bond_pool_projection.esgotamento_ano`

### Dashboard (React/ECharts)

**Componente:** `BondPoolDepletionChart` na aba FIRE ou BACKTEST, seção `bond-pool-analysis`

**Visualização:**
- ECharts `line` com área preenchida
- Eixo X: 2040–2050
- Eixo Y: saldo do bond pool em R$ (privacy mode obrigatório)
- Linha de saque anual como referência (R$250k/ano vs R$180k/ano — duas linhas)
- Marcador vertical: ano de esgotamento projetado
- Zona verde: pool > 1 ano de gastos; amarela: 6-12 meses; vermelha: < 6 meses
- Texto: "Pool cobre X anos de gastos a R$250k/ano"

**Dados necessários no `data.json`:**
```json
"bond_pool_projection": {
  "years": [2040, 2041, ..., 2050],
  "saldo_brl": [850000, 720000, ...],
  "esgotamento_ano": 2047,
  "cobertura_anos": 6.8
}
```

---

## Critério de Aceite

- [ ] Pipeline calcula projeção de saldo do bond pool por ano (2040-2050)
- [ ] Componente renderiza sem erro
- [ ] Privacy mode mascara valores
- [ ] Mostra ano de esgotamento estimado
- [ ] Mostra cobertura em anos vs gasto base e piso
- [ ] `data-testid` em `bond-pool-esgotamento` e `bond-pool-cobertura-anos`
- [ ] Assertion em `e2e/semantic-smoke.spec.ts`

---

## Notas

- Cálculo determinístico (não MC) é suficiente — o bond pool é HTM, retorno é a própria taxa IPCA+
- Sensibilidade ao gasto é o ponto mais importante: mostrar 250k vs 180k lado a lado
- Decisão de saque do pool documentada em `agentes/contexto/carteira.md` § guardrail de fonte
- `agentes/issues/HD-projection-lab-audit.md` § Bond Pool Depletion Tracker

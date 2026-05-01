# DEV-boldin-dashboard: Boldin Dashboard Gaps — F1+F2+D1+F5+F6+F7

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-boldin-dashboard |
| **Dono** | Dev |
| **Status** | Doing |
| **Prioridade** | Alta |
| **Participantes** | Dev, FIRE, Quant, Advocate |
| **Co-sponsor** | Head |
| **Dependencias** | HD-boldin-benchmark (análise), DEV-dashboard-components-alignment |
| **Criado em** | 2026-04-17 |
| **Origem** | Derivada de HD-boldin-benchmark — análise comparativa Diego Dashboard vs Boldin |
| **Concluido em** | — |

---

## Motivo / Gatilho

Benchmark Boldin (HD-boldin-benchmark) identificou 6 gaps de alta/média prioridade no dashboard atual. Time (FIRE + Dev + Advocate) validou e priorizou. Diego aprovou implementação. Regra absoluta: **zero hardcoded — tudo de fontes da verdade do codebase.**

---

## Descricao

Implementar 6 melhorias no dashboard React derivadas do benchmark Boldin, em ordem de prioridade. Cada item tem spec técnico, fonte de dados e localização no dashboard.

---

## Escopo

- [ ] **F1** — Balanço Patrimonial Holístico: 2 blocos em abas existentes (NOW + FIRE)
- [ ] **F2** — Surplus-Gap Chart: WITHDRAW tab, distribuição P10/P50/P90 por ano
- [ ] **D1** — Wellness Score Expandido: adicionar debt_ratio + housing_ratio às métricas
- [ ] **F5** — Cenários Persistentes: localStorage de cenários nomeados nos simuladores
- [ ] **F6** — Surviving Spouse Analysis: bloco em FIRE/WITHDRAW, gatilho pós-casamento
- [ ] **F7** — LTC Sensitivity Test: bloco colapsável em WITHDRAW, variação spending smile

---

## Raciocinio

**Argumento central:** Cada item resolve um gap real na experiência de Diego — não é feature parity com o Boldin, é resolver deficiências observadas no uso real (P(FIRE)=90% sem saber que premissas críticas não estão modeladas).

**Alternativas rejeitadas:**
- Nova aba "Patrimônio" para F1 → rejeitada por Diego; blocos em abas existentes é mais coeso
- Surplus-gap determinístico → rejeitado pelo Advocate; enganoso para 79% equity; deve ser P10/P50/P90

**Incerteza reconhecida:**
- F5 (cenários persistentes) pode conflitar com o What-If existente se não cuidar do UX
- F6 e F7 dependem de dados que precisam ser adicionados ao pipeline

**Falsificação:** Se após implementar, Diego conseguir responder "meu plano aguenta se IPCA for 2pp acima?" e "o que acontece com Katia se eu falecer pré-FIRE?" diretamente no dashboard, a implementação foi bem-sucedida.

---

## Analise

### Prioridades do Time (HD-boldin-benchmark — 2026-04-17)

| Item | Prioridade | Quem | Esforço | Abas afetadas |
|------|-----------|------|---------|---------------|
| F1 — Balanço Holístico | 🔴 Alta | FIRE + Dev | ~3h | NOW + FIRE |
| F2 — Surplus-Gap Chart | 🔴 Alta | FIRE + Dev | ~3-5h | WITHDRAW |
| D1 — Wellness Expandido | 🔴 Alta | Dev | ~2-3h | NOW (Wellness) |
| F5 — Cenários Persistentes | 🔴 Alta | Dev | ~5-6h | SIMULATORS |
| F6 — Surviving Spouse | 🟡 Média | FIRE + Dev | ~3h | FIRE |
| F7 — LTC Sensitivity | 🟡 Média | Dev | ~2h | WITHDRAW |

---

## Spec Técnico por Item

---

### F1 — Balanço Patrimonial Holístico

**Problema:** Dashboard mostra apenas carteira financeira R$3.5M. Patrimônio real é R$7.86M. FIRE number muda. P(FIRE) tecnicamente correto, mas incompatível com visão holística.

**Localização:**
- Bloco 1: `react-app/src/app/page.tsx` — após o Hero Strip (KpiHero), antes do KPI Strip. Colapsado por default.
- Bloco 2: `react-app/src/app/fire/page.tsx` — nova section "Contribuição para o FIRE Number", após o hero FIRE tracking. Colapsado por default.

**Novos campos em `dashboard/data.json` (via `scripts/generate_data.py`):**

Adicionar ao output de generate_data.py uma chave `patrimonio_holistico`:
```json
"patrimonio_holistico": {
  "financeiro_brl": <de dashboard_state.json → patrimonio.total_brl>,
  "imovel_equity_brl": <de hipoteca_sac.json: imovel_valor - estado_atual.saldo_devedor>,
  "terreno_brl": <de config.py: constante TERRENO_BRL — adicionar se não existir>,
  "inss_vp_brl": <de dashboard_state.json fire section ou fire_montecarlo output>,
  "capital_humano_vp_brl": <de dashboard_state.json se existir, ou calcular: renda_anual × multiplicador_idade>,
  "total_brl": <soma dos 5 componentes>,
  "brasil_pct": <(financeiro_brl - equity_usd×cambio + imovel + terreno + inss) / total>,
  "_fonte": "hipoteca_sac.json + dashboard_state.json + config.py",
  "_nota_capital_humano": "VP renda futura até FIRE (2040). Ilíquido — não é ativo de retirada. Decai a zero em 2040."
}
```

**Fontes (sem hardcode):**
- `imovel_equity_brl`: `hipoteca_sac.json` → `imovel_valor` (campo a adicionar) − `estado_atual.saldo_devedor`
  - Se `imovel_valor` não existir em hipoteca_sac.json, adicionar campo lá: R$820.000 (valor carteira.md)
- `terreno_brl`: adicionar `TERRENO_BRL = 150_000` em `scripts/config.py` + ler no generate_data.py
- `inss_vp_brl`: se fire_montecarlo.py já calcula VP do INSS (R$283k citado no patrimônio total), ler do output; senão: `dashboard_state.json → fire.inss_pv_brl` (adicionar ao fire_montecarlo output)
- `capital_humano_vp_brl`: `renda_estimada × anos_ate_fire × fator_desconto` — ler `RENDA_ESTIMADA` de config.py; anos_ate_fire = `IDADE_CENARIO_BASE - IDADE_ATUAL`; fator_desconto = 0.65 (haircut lifecycle padrão)

**Componente React (NOVO): `BalancoHolistico.tsx`**

Layout Bloco 1 (NOW):
```
[ Financeiro R$3.5M ] [ Imóvel Equity R$367k ] [ Terreno R$150k ] [ INSS VP R$283k ] [ Capital Humano R$3.65M ]
                                    TOTAL: R$7.86M
```
- 5 cards horizontais (`grid-cols-2 sm:grid-cols-5`)
- Capital humano: badge "Ilíquido — decai a zero em 2040" + barra de decaimento (% restante até 2040)
- INSS: badge "Já no modelo MC"
- Cor semáforo por liquidez: verde (financeiro), amarelo (imóvel/terreno), cinza (INSS/cap.humano)
- Privacy mode: todos valores mascarados

Layout Bloco 2 (FIRE):
- Pequena tabela "Contribuição para o FIRE Number"
- Separar: "Ativos que financiam retiradas" vs "Contexto de suporte"
- Financeiro = único ativo de retirada
- Imóvel/terreno/INSS = suporte (liquidez limitada)
- Capital humano = decai a zero no FIRE Day

**Salvaguardas visuais obrigatórias (Advocate):**
- Capital humano NUNCA com mesmo peso visual que portfolio
- Disclaimer explícito: "Ativos ilíquidos não financiam FIRE"
- Hierarquia: financeiro (maior, destaque) > imóvel/terreno (médio) > INSS/cap.humano (menor, cinza)

---

### F2 — Surplus-Gap Chart (Distribuição P10/P50/P90)

**Problema:** Usuário não sabe quando o dinheiro "acaba" no cenário base. Surplus-Gap do Boldin é visual e intuitivo — verde quando sobra, vermelho quando falta.

**Localização:** `react-app/src/app/withdraw/page.tsx` — nova section após GuardrailsChart, antes do Sankey.

**Dados disponíveis:** Fan chart já tem P10/P50/P90 do patrimônio por ano (`fire_trilha.json` ou dados do MC). Spending smile por fase (Go-Go/Slow-Go/No-Go) em `spending_summary.json`. INSS em `dashboard_state.json`.

**Cálculo (frontend — sem novo campo no pipeline):**
```
Para cada ano t (2026..2080):
  spending_t = spending_smile(t) × custo_vida_base × inflacao_acumulada(t)
  inss_t = (t >= 2052) ? inss_anual : 0  // INSS Diego aos 65
  inss_katia_t = (t >= 2049) ? inss_katia_anual : 0
  renda_passiva_t = inss_t + inss_katia_t
  
  // Para cada percentil P10/P50/P90:
  patrimonio_pX_t = fanChart.pX[t]
  swr_income_pX_t = patrimonio_pX_t × SWR_RATE  // SWR_RATE de data.json premissas
  
  surplus_pX_t = swr_income_pX_t + renda_passiva_t - spending_t
```

**Componente React (NOVO): `SurplusGapChart.tsx`**
- ECharts bar chart por ano (2026..2080)
- Barras empilhadas por percentil: P10 (vermelho escuro), P50 (cor neutra), P90 (verde)
- Linha zero para referência visual
- Tooltip: ano + surplus/deficit P10/P50/P90 + spending estimado
- Legenda: "Superávit" / "Déficit"
- Privacy mode: mascarar valores de renda
- Fonte: todos os campos de `data.json` — nenhum hardcoded no componente

**Dados lidos do data.json:**
- `fire_trilha`: série P10/P50/P90 por ano
- `premissas.swr`: SWR rate
- `premissas.custo_vida_base`
- `spending_summary.spending_smile`
- `passivos` / INSS: `premissas.inss_diego_anual` + `premissas.inss_katia_anual` (adicionar a premissas se não existirem — lidos de carteira.md/config.py)

---

### D1 — Wellness Score Expandido

**Problema:** Wellness Score atual tem 8 métricas. Boldin tem 12-25. Adicionar: `debt_ratio` (dívida/patrimônio), `housing_ratio` (hipoteca/patrimônio financeiro).

**Mudanças em `agentes/referencia/wellness_config.json`:**

Adicionar 2 novas métricas:
```json
{
  "id": "debt_ratio",
  "label": "Ratio dívida/patrimônio",
  "max": 5,
  "description": "Hipoteca + IR diferido como % do patrimônio financeiro. Acima de 15% = atenção.",
  "thresholds": [
    { "max_pct": 10,  "pts": 5 },
    { "max_pct": 20,  "pts": 3 },
    { "max_pct": 999, "pts": 0 }
  ],
  "colors": { "good": 5, "warn": 3 },
  "_fonte": "data.passivos.total_brl / data.patrimonio.total_brl"
},
{
  "id": "housing_ratio",
  "label": "Hipoteca/Patrimônio",
  "max": 5,
  "description": "Saldo hipoteca como % do patrimônio financeiro. Referência: <15% é saudável para FIRE.",
  "thresholds": [
    { "max_pct": 10,  "pts": 5 },
    { "max_pct": 15,  "pts": 3 },
    { "max_pct": 999, "pts": 0 }
  ],
  "colors": { "good": 5, "warn": 3 },
  "_fonte": "data.passivos.hipoteca_brl / data.patrimonio.total_brl"
}
```

**Ajuste em `useWellnessScore.ts`:**
- Adicionar cálculo de `debt_ratio_pct = passivos.total_brl / patrimonio.total_brl × 100`
- Adicionar cálculo de `housing_ratio_pct = passivos.hipoteca_brl / patrimonio.total_brl × 100`
- Adicionar pts para cada via thresholds do wellness_config
- Atualizar `total_max` em wellness_config.json de 100 para 110 (ou reponderar para manter 100)

**Nota:** Se total_max mudar, verificar que o score exibido ainda é interpretável. Preferência: reponderar métricas existentes para manter total=100 (discussão com Quant se necessário).

---

### F5 — Cenários Persistentes

**Problema:** Simuladores têm presets stress/base/fav, mas não permitem salvar cenários customizados com nome (ex: "Com filho 2028", "Burnout 2030", "IPCA 8%").

**Localização:** `react-app/src/app/simulators/page.tsx` — adicionar painel "Meus Cenários" ao What-If Scenarios.

**Store (NOVO ou extensão de uiStore):**
```ts
// Em uiStore.ts ou novo scenariosStore.ts
interface SavedScenario {
  id: string;          // uuid
  name: string;        // "Com filho 2028"
  createdAt: string;   // ISO date
  inputs: {
    aporte_mensal: number;
    retorno_equity: number;
    custo_vida: number;
    taxa_ipca: number;
    // outros sliders do What-If
  };
  result?: {
    p_fire: number;
    fire_year: string;
    pat_mediano: number;
  };
}

interface ScenariosStore {
  scenarios: SavedScenario[];
  saveScenario: (name: string, inputs: ScenarioInputs, result?: ScenarioResult) => void;
  deleteScenario: (id: string) => void;
  loadScenario: (id: string) => SavedScenario | undefined;
}
```
- Persistência: `localStorage` via Zustand persist middleware (chave: `scenarios-store`)
- Limite: max 10 cenários salvos (UI mostra aviso ao atingir)

**UI:**
- Botão "Salvar cenário" ao lado dos presets stress/base/fav
- Input de nome (modal ou inline)
- Lista de cenários salvos: nome + P(FIRE) + data de criação
- Botão "Carregar" (preenche os sliders) + "Excluir"
- Comparação: checkbox para selecionar 2 cenários → tabela side-by-side de resultados

---

### F6 — Surviving Spouse Analysis

**Problema:** Dashboard não modela o que acontece com Katia se Diego falecer pré-FIRE. Casamento iminente.

**Localização:** `react-app/src/app/fire/page.tsx` — nova section colapsável "Proteção Familiar", após FIRE Matrix.

**Gatilho de exibição:** Mostrar apenas se `data.premissas.estado_civil !== 'solteiro'` OU se campo novo `data.premissas.tem_conjuge = true`.

**Dados necessários (adicionar em `scripts/config.py` e `generate_data.py`):**
- `TEM_CONJUGE = False` (atualizar para `True` ao casar)
- `NOME_CONJUGE = "Katia"`
- `INSS_KATIA_ANUAL = 93_600` (R$7.800/mês × 12 — de carteira.md)
- `PGBL_KATIA_SALDO_FIRE = 490_000` (projeção — de carteira.md)
- `GASTO_KATIA_SOLO = 160_000` (custo vida Katia solo/ano — estimativa carteira.md)

**Cálculo frontend:**
```
// Cenário: Diego falece pré-FIRE (ano corrente)
patrimonio_hoje = data.patrimonio.total_brl
swr_katia_pct = 0.03  // SWR conservador solo
renda_swr = patrimonio_hoje × swr_katia_pct
renda_inss_katia = (t >= 2049) ? data.premissas.inss_katia_anual : 0
renda_pgbl = data.premissas.pgbl_katia_saldo_fire × 0.04  // SWR 4% PGBL
total_renda = renda_swr + renda_inss_katia + renda_pgbl

gap_anual = data.premissas.gasto_katia_solo - total_renda
```

**Display:**
- 2 cards: "Com seguro de vida R$2-3M" vs "Sem seguro"
- Semáforo de adequação (verde = SWR < 3%, vermelho = SWR > 4%)
- Nota: "Seguro de vida: ação D0 — ver TX-seguro-vida"
- Privacy mode: mascarar valores

---

### F7 — LTC Sensitivity Test

**Problema:** Spending smile usa `SAUDE_DECAY = 0.50` como premissa. LTC intensivo (R$72-216k/ano) pode exceder o No-Go do modelo. Não está visível para o usuário.

**Localização:** `react-app/src/app/withdraw/page.tsx` — nova section colapsável "LTC — Sensibilidade Cuidados de Longo Prazo", após Spending Breakdown.

**Dados de input (ler de `spending_summary.json` ou `config.py`):**
- `SAUDE_DECAY` atual (provavelmente em config.py)
- `CUSTO_VIDA_BASE`
- Fan chart patrimônio (para estimar impacto)

**Cálculo frontend:**
```
// 3 cenários LTC
cenarios_ltc = [
  { label: "Sem LTC", saude_extra: 0 },
  { label: "LTC moderado", saude_extra: 72_000 },   // ~R$6k/mês adicional por 2 anos
  { label: "LTC intensivo", saude_extra: 216_000 },  // ~R$18k/mês por 2 anos (asilos)
]

Para cada cenário:
  custo_ajustado = custo_vida_base + saude_extra
  swr_ajustado = custo_ajustado / patrimonio_mediano_fire
  → mostrar como % do patrimônio + semáforo vs SWR 3%
```

**Display:**
- Tabela 3 linhas: Sem LTC / Moderado / Intensivo
- Colunas: Custo anual adicional / SWR implícito / Status vs SWR target
- Nota: "SAUDE_DECAY atual = X%. Ver spending smile."
- Colapsável, aberto por default = false

---

## Padrões Visuais Obrigatórios

1. **Grids mobile-first**: `grid-cols-2 sm:grid-cols-5` (nunca `grid-cols-5` sem fallback)
2. **CSS classes** não inline styles para layout (`bg-card border border-border/40 rounded p-4`)
3. **Colapsáveis**: usar `CollapsibleSection` de `@/components/primitives/CollapsibleSection`
4. **ECharts**: usar wrapper `EChart` de `@/components/primitives/EChart` (devicePixelRatio)
5. **Cards de KPI**: usar padrão `.kpi` com `.kpi-label` e `.kpi-value`
6. **Privacy mode**: todo valor numérico sensível via `privacyMode ? '••••' : formatValue(x)`
7. **Cores**: usar variáveis CSS (`var(--green)`, `var(--red)`, `var(--accent)`, `var(--muted)`)
8. **Dados**: NUNCA literal hardcoded em componente — sempre de `data.*` ou `derived.*`
9. **ChartCard wrapper**: usar `ChartCard` de `@/components/primitives/ChartCard` para seções com título

---

## Sequência de Implementação (Dev)

```
1. Pipeline: adicionar campos em generate_data.py / config.py (F1 campos + F6 campos)
2. D1: wellness_config.json + useWellnessScore.ts (mais simples, sem novo componente)
3. F1: BalancoHolistico.tsx → inserir em page.tsx (NOW) + fire/page.tsx
4. F7: LTC tabela → withdraw/page.tsx (cálculo frontend simples)
5. F6: Surviving spouse → fire/page.tsx (lógica condicional)
6. F2: SurplusGapChart.tsx → withdraw/page.tsx (ECharts mais complexo)
7. F5: ScenarioStore + UI nos simuladores (mais estado/UX)
```

---

## Conclusao

Aguarda execução Dev + QA.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Nenhuma |
| **Estrategia** | Nenhuma |
| **Conhecimento** | Gaps Boldin implementados |
| **Memoria** | Registrar ao concluir |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] Dev implementar na ordem da sequência técnica
- [ ] QA validar cada item com build + teste
- [ ] Commit por item ou ao final (único commit de implementação)
- [ ] Registrar campos adicionados no data.json em memória
- [ ] Fechar HD-boldin-benchmark após conclusão desta

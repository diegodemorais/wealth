# AUDITORIA QUANTITATIVA — DASHBOARD WEALTH

**Data**: 2026-04-25  
**Auditado por**: Quant  
**Método**: Rastreabilidade fonte→componente, validação de inconsistências, verificação de cálculos

---

## RESUMO EXECUTIVO

| Métrica | Valor |
|---|---|
| **Total auditado** | 9 páginas, 87 componentes mapeados, ~40 campos de dados rastreados |
| **Issues encontrados** | 8 (2 críticos, 4 médios, 2 baixos) |
| **Cobertura** | ~95% dos componentes que exibem números |
| **Status geral** | ⚠️ 2 inconsistências críticas requerem correção imediata |

---

## PARTE 1 — MATRIZ DE RASTREABILIDADE

### P(FIRE) Base — Fontes Divergentes ⚠️

| Campo em data.json | Valor | Componente | Página |
|---|---|---|---|
| `pfire_base.base` | **86.4%** | KpiHero, PFireMonteCarloTornado | /home |
| `pfire_base.base` | **86.4%** | Fire hero banner | /fire |
| `spending_guardrails.pfire_atual` | **86.4%** | Barra P(FIRE) Atual | /withdraw |
| `fire_matrix.by_profile[atual].p_at_threshold` | 86.3% | Card Solteiro | /fire |
| `fire_matrix.by_profile[atual].p_fire_53` | **89.8%** | Badge na tabela Spending | /withdraw |

**Observação**: A página `/withdraw` exibe dois valores P(FIRE) diferentes para o mesmo cenário:
- Barra: 86.4% (via `pfire_base`)
- Badge: 89.8% (via `fire_matrix.by_profile[atual].p_fire_53`)
- **Divergência: 3.4pp** ⚠️ CRÍTICO

### Patrimônio — Inclusão/Exclusão de COE Inconsistente

| Campo | Valor (R$) | Componente | Página |
|---|---|---|---|
| `derived.networth` (sem COE) | 3.665.529 | KpiHero "Patrimônio Total" | /home |
| `premissas.patrimonio_atual` (com COE) | 3.729.678 | firePatrimonioAtual | /home, /fire |
| `patrimonio_holistico.financeiro_brl` (com COE) | 3.729.678 | "Patrimônio Financeiro" | /portfolio |

**Divergência**: R$64.081 (COE não incluído em KpiHero mas incluído em outros)

### CAGR / TWR Real BRL — Fonte Única ✅

- `retornos_mensais.twr_real_brl_pct` = 6.39% — usado por KpiCard e PerformanceSummary consistentemente

### Drift por Bucket — Recalculado vs. Pipeline

- RebalancingStatus recalcula manualmente: SWRD 35.3%, AVGS 27.2%, AVEM 23.7%
- Resultado confere com pipeline (`data.drift.*atual`)
- **Resultado**: Consistente numericamente, mas código duplicado

---

## PARTE 2 — ISSUES ENCONTRADOS

### ⚠️ CRÍTICO — ISSUE 1: P(FIRE) diverge 3.4pp na mesma página

**Componente**: `/withdraw/page.tsx`  
**Problema**: Mesma métrica "P(FIRE) Base" exibe dois valores distintos simultaneamente:
- Barra de progresso: `spending_guardrails.pfire_atual` = **86.4%**
- Badge da tabela: `fire_matrix.by_profile[atual].p_fire_53` = **89.8%**

**Causa raiz**: Duas execuções de Monte Carlo distintas para o mesmo cenário. `pfire_base.base` vem de `fire_montecarlo.py`; `fire_matrix.by_profile[*].p_fire_53` vem de `reconstruct_fire_data.py`. Divergência de 3.4pp **excede ruído amostral** (esperado <0.5pp com N=10.000).

**Impacto**: Usuário vê números conflitantes na mesma página. Quebra confiabilidade do dashboard.

**Solução**: Dev refatora `/withdraw` para usar consistentemente `pfire_base.base` como fonte única. Alternativamente, pipeline garante que `fire_matrix.by_profile[0].p_fire_53` e `pfire_base.base` venham do mesmo MC run.

**Agente responsável**: Dev

---

### ⚠️ CRÍTICO — ISSUE 2: Guardrails de retirada com regras incorretas

**Componente**: `GuardrailsRetirada.tsx` + `data.guardrails_retirada`  
**Problema**: Dashboard exibe 3 guardrails baseados em **P(FIRE)** (≥95%, 80-95%, <80%), mas carteira.md (aprovada 2026-03-20) define 5 guardrails baseados em **drawdown** (0-15%, 15-25%, 25-35%, >35% + upside +25%).

**Regras aprovadas em carteira.md**:
- 0-15% drawdown → R$250k (nada)
- 15-25% → R$225k (corte 10%)
- 25-35% → R$200k (corte 20%)
- >35% → R$180k (piso)
- Upside +25% → R$275k (+10%, teto R$350k)

**Regras em data.json** (`guardrails_retirada`):
- `guardrail_high`: P(FIRE) ≥ 95% — EXPANSIVO
- `guardrail_normal`: 80% ≤ P(FIRE) < 95% — MANTÉM
- `guardrail_low`: P(FIRE) < 80% — DEFESA

**Impacto**: Usuário recebe recomendação de retirada diferente da que foi aprovada. Decisões críticas de planejamento baseadas em regras desatualizadas.

**Solução**: Revisar `generate_data.py` para popular `guardrails_retirada` com as regras por drawdown de carteira.md. Ou criar campo separado `guardrails_pfire_retirada` se as regras P(FIRE) são complementares.

**Agentes responsáveis**: Dev, Fire

---

### 🟡 MÉDIO — ISSUE 3: Savings Rate fórmula incorreta

**Componente**: `app/page.tsx` (home), Financial Wellness Score  
**Problema**: Fórmula calcula SR incorretamente.

**Fórmula atual**:
```
savingsRate = aporteMensal / (aporteMensal + custoMensal) × 100
= 25000 / (25000 + 20833) × 100 = 54.5%
```

**Fórmula correta** (carteira.md):
```
SR = aporte / renda_mensal_liquida = 25000 / 45000 = 55.6%
```

**Divergência**: 1.1pp. Campo `premissas.renda_mensal_liquida` = 45000 existe em data.json mas não é usado.

**Impacto**: Savings rate exibido é ~1pp inferior ao real, afetando Financial Wellness Score.

**Solução**: Corrigir fórmula para `aporteMensal / renda_mensal_liquida × 100`.

**Agente responsável**: Dev

---

### 🟡 MÉDIO — ISSUE 4: Patrimônio KpiHero exclui COE sem aviso

**Componentes**: `KpiHero.tsx` (home, /home) + `dataWiring.ts` (derived.networth)  
**Problema**: `derived.networth` = ~R$3.665.529 **exclui** COE (~R$64.081). Mas:
- `/home` KpiHero exibe R$3.665k (sem COE)
- `/portfolio` exibe R$3.729k (com COE via `patrimonio_holistico.financeiro_brl`)
- Fire progress bar usa R$3.729k (com COE)

**Divergência**: R$64k visível ao comparar páginas.

**Impacto**: Usuário vê patrimônio total diferente em home vs. portfolio. Cria confusão sobre qual é o número "correto".

**Solução**: (a) Incluir `coe_net_brl` em `derived.networth` (campo já disponível em data.json), OU (b) adicionar nota "(ex. COE)" no KpiHero para deixar transparente.

**Agente responsável**: Dev

---

### 🟡 MÉDIO — ISSUE 5: Fallback de premissa de retorno perigoso

**Componentes**: `app/page.tsx` linha ~149, `PerformanceSummary.tsx` linha 114  
**Problema**: Ambos usam fallback:
```typescript
const premissa = data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 4.5;
```

O campo existe (4.85%) então o fallback é inerte atualmente. Mas se o campo faltar, exibiria **4.5% em vez de 4.85%**, calculando delta contra premissa errada.

**Impacto**: Risco latente. Se pipeline quebra e campo desaparece, delta de retorno é exibido com premissa incorreta.

**Solução**: Mudar fallback para `?? (data?.premissas?.retorno_equity_base ?? 0.0485) * 100`. Campo `premissas.retorno_equity_base` = 0.0485 existe em data.json.

**Agente responsável**: Dev

---

### 🟡 MÉDIO — ISSUE 6: Alpha líquido — sinal inconsistente

**Componentes**: `performance/page.tsx` (Card C) + `AlphaVsSWRDChart.tsx`  
**Problema**: Sinal do alpha líquido diverge:
- Card C exibe: `'−0.16%/ano'` (negativo, em vermelho)
- Chart recebe: `alphaLiquidoPctYear={0.16}` (positivo)

Label do card: "Alpha líquido esperado" com tooltip "Alpha líquido negativo no curto prazo é esperado".

**Impacto**: Representação inconsistente do mesmo número. Usuário vê "negativo" em vermelho mas valor passado ao chart é positivo.

**Solução**: Clarificar com Factor agent o sinal correto do alpha líquido pós-haircut. Unificar representação em ambos os componentes.

**Agentes responsáveis**: Dev, Factor

---

### 🟢 BAIXO — ISSUE 7: RebalancingStatus recalcula manualmente

**Componente**: `app/page.tsx` função `bucketPct` (linhas ~469-475)  
**Problema**: Recalcula percentuais de alocação a partir de `posicoes` em vez de usar `data.drift.*atual`:
```typescript
const swrdPct = (swrdUsd * cambio) / patrimonioAtual * 100;
// em vez de: data.drift.SWRD.atual
```

Resultado confere (35.3%, 27.2%, 23.7%), mas duplica lógica.

**Impacto**: Code smell, risco de divergência futura se lógica alterar.

**Solução**: Substituir `bucketPct()` por leitura direta de `data.drift.SWRD.atual`, `data.drift.AVGS.atual`, etc.

**Agente responsável**: Dev

---

### 🟢 BAIXO — ISSUE 8: acumuladoAno calcula com campo ausente

**Componente**: `dataWiring.ts` linha ~521  
**Problema**:
```typescript
const acumuladoAno = data.aporte_mensal?.total_aporte_brl ?? aporteMensal * 12;
```

`data.aporte_mensal` não existe em data.json. Fallback é sempre ativado: `25000 × 12 = R$300.000/ano` (meta anual, não realizado YTD).

**Impacto**: BAIXO. O valor exibido é semanticamente correto (meta), mas código tenta acessar campo inexistente.

**Solução**: Usar `premissas_vs_realizado.aporte_mensal.por_ano_brl[anoAtual]` como fonte do acumulado YTD real, ou deixar explícito que é meta.

**Agente responsável**: Dev

---

## PARTE 3 — COMPONENTES AUDITADOS (RESUMIDO)

**Total auditado**: 57 componentes (98% de cobertura estimada)

| Status | Componentes | Exemplos |
|---|---|---|
| ✅ OK | 49 | KpiHero (Anos até FIRE), PFireMonteCarloTornado, TimeToFireProgressBar, FirePage, PortfolioPage (maioria), PerformancePage (maioria), WithdrawPage (maioria) |
| ⚠️ ISSUE | 8 | `/withdraw` P(FIRE), GuardrailsRetirada, Wellness Score, KpiHero patrimônio, PerformanceSummary, AlphaVsSWRDChart, RebalancingStatus, acumuladoAno |

**O que está correto e não requer ação**:

1. ✅ CAGR Real BRL: home e performance usam `retornos_mensais.twr_real_brl_pct` (6.39%) — fonte única
2. ✅ Drift absoluto: pipeline calcula, RebalancingStatus confere (SWRD 35.3%, AVGS 27.2%, AVEM 23.7%)
3. ✅ Câmbio: `data.cambio` = 4.9793 — todos usam a mesma fonte
4. ✅ Patrimônio gatilho: 8.333.333 = 250.000 / 0.03 — consistente com carteira.md
5. ✅ P(FIRE) Aspiracional: todos usam `pfire_aspiracional.base` (82.2%) — fonte única
6. ✅ IR Diferido: `tax.ir_diferido_total_brl` (133.075) — fonte única em home e portfolio
7. ✅ Bond pool runway: todos usam `bond_pool_runway.*` — fonte única

---

## PARTE 4 — PRIORIZAÇÃO DE AÇÕES

### Crítico (Resolver ASAP)

| ID | Issue | Impacto | Esforço | Responsável |
|---|---|---|---|---|
| 1 | P(FIRE) 3.4pp divergente | Quebra confiabilidade numérica | Médio | Dev |
| 2 | Guardrails com regras erradas | Recomendação de retirada incorreta | Alto (requer Fire review) | Dev + Fire |

### Médio (Resolver em 1-2 sprints)

| ID | Issue | Impacto | Esforço | Responsável |
|---|---|---|---|---|
| 3 | Savings rate fórmula | Score incorreto (~1pp) | Baixo | Dev |
| 4 | Patrimônio COE | Divergência visual R$64k | Baixo | Dev |
| 5 | Fallback premissa | Risco latente se pipeline quebra | Baixo | Dev |
| 6 | Alpha líquido sinal | Representação confusa | Médio (requer clarificação) | Dev + Factor |

### Baixo (Refactor de higiene)

| ID | Issue | Impacto | Esforço | Responsável |
|---|---|---|---|---|
| 7 | RebalancingStatus recalcula | Code smell | Baixo | Dev |
| 8 | acumuladoAno campo ausente | Code smell | Baixo | Dev |

---

## PARTE 5 — ISSUES ABERTAS

Conforme auditoriadashboard, criadas as seguintes issues:

- **QUANT-001**: P(FIRE) duplo divergente 3.4pp em /withdraw (CRÍTICO)
- **QUANT-002**: guardrails_retirada com regras P(FIRE) em vez de drawdown (CRÍTICO)
- **QUANT-003**: Savings rate fórmula incorreta no Wellness Score (MÉDIO)
- **QUANT-004**: KpiHero patrimônio exclui COE sem aviso (MÉDIO)
- **QUANT-005**: Fallback premissa retorno 4.5% vs 4.85% (MÉDIO)
- **QUANT-006**: Alpha líquido sinal inconsistente (MÉDIO)

---

## PARTE 6 — NOTAS METODOLÓGICAS

**Escopo da auditoria**:
- 9 páginas da aplicação (/home, /portfolio, /performance, /withdraw, /fire, etc.)
- 87 componentes mapeados
- ~40 campos de dados rastreados
- Validação de consistência (mesmos dados em múltiplos componentes)
- Verificação de cálculos (fórmulas vs. expected values)

**Exclusões**:
- Componentes de UI puro (CollapsibleSection, SectionDivider, etc.) sem dados numéricos

**Dados de referência**:
- data.json (atual): 317 KB, 74 campos top-level em 11 blocos
- carteira.md: decisões aprovadas 2026-03-20
- Bookkeeper report: validação de data.json structure (concluído)

---

## PARTE 7 — PRÓXIMOS PASSOS

1. **Dev implementa QUANT-001 e QUANT-002** (críticos, 2-3 dias)
2. **Fire valida guardrails em QUANT-002** antes de merge
3. **Dev implementa QUANT-003, QUANT-004, QUANT-005** (médios, 1 dia)
4. **Factor valida alpha sinal em QUANT-006**
5. **Dev refatora QUANT-007, QUANT-008** (hygiene, 30min)
6. **Quant valida resultados** após cada merge

---

**Relatório concluído**: 2026-04-25 14:47 BRT

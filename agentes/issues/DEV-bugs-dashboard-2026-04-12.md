# DEV-bugs-dashboard-2026-04-12: Batch de bugs críticos — dashboard

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-bugs-dashboard-2026-04-12 |
| **Dono** | dev |
| **Status** | In Progress |
| **Prioridade** | Alta |
| **Participantes** | dev, quant |
| **Criado em** | 2026-04-12 |
| **Origem** | Reporte visual do usuário — 7 bugs confirmados |

---

## Bugs Reportados

### B1 — Alpha vs 60/40: barra nunca aparece (1ª vez reportado)
- **Descrição:** Gráfico "Alpha Desde o Início vs SWRD — Performance Relativa" mostra apenas 2 barras (vs VWRA e vs IPCA+). A barra "vs 60/40 (VWRA+RF+Crypto)" nunca renderiza.
- **Status:** [ ] Aberto

### B2 — Trilha FIRE: escala muito alta (3ª vez)
- **Descrição:** Gráfico Fire Trilha volta a ter escala Y astronômica, tornando linhas indistinguíveis na parte inferior.
- **Histórico:** Corrigido 2x anteriormente, regrediu 2x.
- **Regra anti-regressão:** Escala Y deve ter `suggestedMax = max(trilha.max, meta) * 1.15` e `suggestedMin = 0`. Nunca usar `beginAtZero: false` sem cap de `suggestedMax`.
- **Status:** [ ] Aberto

### B3 — Glide Path: não funciona (15ª vez)
- **Descrição:** Seção Glide Path não renderiza / erro silencioso.
- **Histórico:** Bug recorrente — 15 ocorrências.
- **Regra anti-regressão:** Após cada fix, adicionar teste CRITICAL em `fire_tests.py` que verifica que `glidepathChart` canvas existe e que `buildGlidePath` executa sem erro.
- **Status:** [ ] Aberto

### B4 — Projeção Patrimônio: escala astronômica (5ª vez)
- **Descrição:** `buildNetWorthProjection` (ou `buildFireTrilha`) volta com escala Y em trilhões/quadrilhões.
- **Histórico:** 5 ocorrências — claramente não tem teste validando escala.
- **Regra anti-regressão:** Escala Y deve ser em R$M (dividir por 1e6), com `suggestedMax` baseado no max dos dados × 1.2. Adicionar teste que verifica range dos valores (deve estar entre R$1M e R$200M).
- **Status:** [ ] Aberto

### B5 — Spending Guardrails: marcador atual mal posicionado
- **Descrição:** Marcador de posição atual ficou visualmente ruim. Usuário quer apenas um ponto (círculo) com label diretamente acima.
- **Solução:** Substituir a linha vertical por um círculo/diamond no topo da barra, com label acima. Remover o label abaixo que estava oculto pelo overflow.
- **Status:** [ ] Aberto

### B6 — What-if Scenario: lógica invertida (reportado anteriormente, regrediu)
- **Descrição:** Aumentar custo de vida aumenta P(FIRE) e patrimônio necessário — comportamento invertido.
- **Causa raiz:** `interpolateFireMatrix` usa `patrimonioImplied = gasto/swr` como lookup → maior gasto = maior patrimônio implied = melhor P(success). Deve usar `patrimonio_gatilho` fixo.
- **Fix:** `patrimonioRef = DATA.premissas?.patrimonio_gatilho ?? [meio do array de pats]`. Nunca calcular `gasto/swr` como proxy de patrimônio.
- **Status:** [ ] Aberto

### B7 — Fan Chart Stress Test: não aparece
- **Descrição:** O novo gráfico de projeção fan chart na seção Stress Monte Carlo não renderiza.
- **Status:** [ ] Aberto

---

## Regras Anti-Regressão (implementar junto com os fixes)

1. **Escala Y de qualquer chart patrimonial:** Sempre validar que valores estão em R$M (1e6), não R$B ou R$ bruto. Adicionar teste que checa `max(data) < 500e6`.
2. **Glide Path:** Adicionar teste CRITICAL que checa que canvas `glidepathChart` existe no HTML e que a função não lança exceção.
3. **What-if:** Adicionar teste que verifica: ao aumentar gasto, `patNecessario` aumenta E `pfire` diminui.
4. **Fan chart:** Adicionar teste que checa que `stressProjectionChart` canvas existe no HTML.

---

## Resultado Esperado

| Bug | Fix | Teste Anti-Regressão |
|-----|-----|---------------------|
| B1 — Alpha 60/40 bar | [ ] | [ ] |
| B2 — Trilha FIRE escala | [ ] | [ ] |
| B3 — Glide Path | [ ] | [ ] |
| B4 — Projeção escala | [ ] | [ ] |
| B5 — Guardrails marcador | [ ] | [ ] |
| B6 — What-if invertido | [ ] | [ ] |
| B7 — Fan chart stress | [ ] | [ ] |

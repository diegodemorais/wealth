# PR Checklist — Architectural Review

**Use este checklist para toda PR/MR futura.** Válido a partir de 2026-04-27 (post-auditoria).

---

## Checklist de 8 Items

### □ [CENTRALIZATIONS] Todos cálculos financeiros usam engines?

- [ ] SWR em PR? → `swr_engine.py`
- [ ] Tax em PR? → `tax_engine.py`  
- [ ] P(FIRE) em PR? → `pfire_transformer.py`
- [ ] Guardrails em PR? → `guardrail_engine.py`
- [ ] Bond pool em PR? → `bond_pool_engine.py`
- [ ] Withdrawal em PR? → `withdrawal_engine.py`
- [ ] Data pipeline em PR? → `data_pipeline_engine.py`

**O que procurar**: Grep de função de engine + documentação de uso  
**Rejeitar se**: Lógica financeira inline, duplicada ou sem engine correspondente

---

### □ [HARDCODING] Nenhum valor numérico novo fora de `config.py`?

**Padrão bloqueado**: Números tipo `0.50`, `0.30`, `0.20`, `0.03`, `0.15` diretos em código.

**O que fazer**:
- [ ] Se constante nova → adicione em `scripts/config.py`
- [ ] `config.py` carrega de `dados/carteira_params.json` (via `parse_carteira.py`)
- [ ] Grep na PR: `grep -E '=\s*0\.[0-9]{2}'` (exceto config.py)

**Rejeitar se**: Valores numéricos hardcoded fora de config.py, test fixtures, ou comentários

---

### □ [P(FIRE) CONVERSION] Proibido × 100 / ÷ 100 inline?

**Padrões proibidos**:
- ❌ pFire multiplicado por 100
- ❌ decimal multiplicado por 100
- ❌ Math.round(p_success vezes 100)
- ❌ success_rate dividido por 100

**Padrões obrigatórios**:
```
✅ canonicalize_pfire(decimal, source='mc')  // Python
✅ canonicalizePFire(decimal, source='mc')   // TypeScript
✅ fromAPIPercentage(86.4, source='mc')      // TypeScript (consume API já em %)
✅ applyPFireDelta(base, delta, reason)      // Delta aplicado
```

**O que fazer**:
- [ ] Grep na PR: `git diff | grep -E '(\*|/) 100'`
- [ ] Se encontrado → refactor com `canonicalize_pfire()`
- [ ] Validar com `npm run test:ci` (enforcement automático)

**Rejeitar se**: Padrão × 100 ou ÷ 100 encontrado fora de comentários/analytics

---

### □ [DATA MOCK] Dados fake têm "# Source:" ou "# Generated:"?

**Exemplos válidos**:
```python
# ✅ CORRETO
# Source: Historical SWRD/AVGS/AVEM returns 2020-2025
stress_returns = [0.05, 0.06, 0.07]

# Generated from runCanonicalMC(n=100) for unit test
mock_trajectories = generate_test_fixtures()
```

**O que procurar**:
- [ ] Valores em testes têm comentário documentando origem
- [ ] Fixtures rastreáveis (histórico real, MC, ou amostra conhecida)
- [ ] Nada de valores aleatórios sem explicação

**Rejeitar se**: Número mágico em teste sem documentação de fonte

---

### □ [DELEÇÃO] Remoção de campo/função → grep antes?

**Antes de remover**:
- [ ] `grep -r "nome_field" src/` → confirmar 0 ou ≤2 refs
- [ ] Se >2 refs → investigar todos consumidores
- [ ] Documentar em commit message: "Removed X, impacts Y (verified 1 ref in Z)"

**Rejeitar se**: Deleção sem audit trail de impacto

---

### □ [data.json] Mudanças respeitam GUARANTEED_INVARIANTS?

**Invariants obrigatórios**:
- [ ] P10 ≤ P50 ≤ P90? (triplet ordering)
- [ ] patrimonio_atual > R$500k?
- [ ] _schema_version presente? (v1.0 ou v1.1)
- [ ] _window_id presente? (identificação de snapshot)
- [ ] Nenhum NaN ou Inf?
- [ ] _generated é ISO 8601 válido?

**Lógica de negócio**:
- [ ] P(FIRE) base < fav < stress? (ordering)
- [ ] Guardrails consistentes (P(FIRE) vs drawdown_history)?
- [ ] Bond pool runway ≥ 6 anos?

**O que fazer**:
- [ ] Rodar `pytest scripts/tests/validators.test.py` 
- [ ] Revisar `GUARANTEED_INVARIANTS.md` se alterou schema

**Rejeitar se**: Invariants violados ou não testados

---

### □ [REACT] Nenhum hardcode de temas/cores/pesos?

**Padrões bloqueados**:
```typescript
❌ color: '#FF5733'       // hex direto
❌ gridTemplateColumns: '1fr 1fr'  // layout inline
❌ allocation: 0.50       // peso sem import
```

**Padrões obrigatórios**:
```typescript
✅ color: 'var(--card)'   // CSS vars
✅ className="grid grid-cols-2 sm:grid-cols-4"  // Tailwind
✅ const EC = useEChartsTheme(); color: EC.primary  // theme engine
✅ import { EQUITY_WEIGHTS } from '@/config'  // import de config
```

**O que fazer**:
- [ ] Grep: `grep -E "(#[0-9A-F]{6}|0\.[0-9]{2})" src/`
- [ ] Se colors → use CSS vars ou `EC.*`
- [ ] Se constantes → import de `config.ts`

**Rejeitar se**: Hardcode encontrado em componentes React

---

### □ [TESTES] Nova lógica tem teste?

**Para nova feature**:
- [ ] Unit test (vitest ou pytest)
- [ ] Pelo menos 1 caso positivo + 1 negativo
- [ ] Coverage: mínimo 70% da lógica nova

**Para bug fix**:
- [ ] Regression test (testa o bug específico)
- [ ] Commit message referencia issue ID

**O que fazer**:
- [ ] Rodar `npm run test` ou `pytest` localmente
- [ ] CI passa `npm run test:ci`

**Rejeitar se**: Código novo sem teste ou cobertura insuficiente (<50%)

---

## Como Usar Este Checklist

### Para Code Reviewers
1. Abrir PR
2. Ler description (Dev deve preencher checklist)
3. Validar cada item desta lista
4. Se violação → solicitar changes + referenciar seção aqui

### Para Developers
1. Antes de abrir PR:
   - Executar `npm run test:pre-commit` localmente
   - Verificar que pre-commit hook passa (ou verá bloqueio em push)
2. Na description da PR, incluir:
   ```
   ## Architectural Checklist
   - [x] Centralizations OK
   - [x] No hardcoding
   - [x] P(FIRE) canonical
   - [x] Data mock sourced
   - [x] Deletions audited
   - [x] data.json valid
   - [x] React clean
   - [x] Tests pass
   ```

---

## Referências

- `scripts/` — Python engines reference
- `agentes/referencia/GUARANTEED_INVARIANTS.md` — Data schema
- `agentes/contexto/carteira.md` — Truth source (parâmetros)
- `scripts/config.py` — Constantes centralizadas
- `react-app/` — Dashboard React
- `analysis/architect-audit-2026-04-27.md` — Audit completo

---

**Versão**: 1.0  
**Data**: 2026-04-27  
**Mantido por**: Architect  
**Feedback**: Adicione learnings aqui após cada PR auditada

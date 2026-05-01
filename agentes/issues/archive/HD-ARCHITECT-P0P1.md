# HD-ARCHITECT-P0P1 — Implementação P0 & P1

**Status**: 🟦 Em Andamento  
**Dono**: Architect + Head  
**Prioridade**: 🔴 CRÍTICA  
**Parent Issue**: HD-ARCHITECT (primeira auditoria concluída)

---

## Objetivo

Executor as próximas ações do Architect após auditoria inicial:
- **P0 (Imediata)**: Automação de guardrails
- **P1 (Sprint)**: Validação de dados + treinamento

---

## P0 — Ações Imediatas

### P0.1: Integrar Checklist em Pre-Commit

**O que fazer:**
1. Adicionar grep rules em `.git/hooks/pre-commit`
2. Detectar padrões proibidos antes do commit:
   - `* 100` (hardcoded conversion P(FIRE))
   - `/ 100` (inline division)
   - Novos valores numéricos fora de config.py

**Exemplo de regra:**
```bash
# Detectar conversões inline proibidas
git diff --cached | grep -E '(\*|/) 100' | \
  grep -v -E '(#|test|analytics)' && \
  echo "❌ ERROR: Found inline conversion (* 100 / 100)" && exit 1
```

**Outputs esperados:**
- `.git/hooks/pre-commit` atualizado
- Teste: tentar commitar código com `pfire * 100`, deve bloquear

**Dono**: Head (implementação) + Architect (validação)

---

### P0.2: Ativar Architect em Toda PR

**O que fazer:**
1. Documentar checklist de 8 items (já proposto em architect-audit.md)
2. Criar template para PR description
3. Configurar automação (GitHub Actions ou hook)

**Checklist (ver architect-audit-2026-04-27.md, linhas 238-279):**
```
□ [CENTRALIZATIONS] Cálculos usam engines?
□ [HARDCODING] Valores em config.py?
□ [P(FIRE) CONVERSION] Proibido × 100?
□ [DATA MOCK] Fonte rastreável?
□ [DELEÇÃO] Impacto avaliado?
□ [data.json] Invariants respeitados?
□ [REACT] Sem hardcode?
□ [TESTES] Cobertura?
```

**Outputs esperados:**
- Template de PR com checklist integrado
- Documentação em `agentes/referencia/pr-checklist.md`
- Automation rule em `.claude/settings.json` ou GitHub Actions

**Dono**: Head (setup) + Architect (validação)

---

## P1 — Sprint (5-7 dias)

### P1.1: Revisar Branches Ativos

**O que fazer:**
1. Listar branches abertos (se houver PRs)
   ```bash
   git branch -r | grep -v main
   ```
2. Para cada branch:
   - Ler diff vs main
   - Aplicar checklist P0.2
   - Documentar findings

**Outputs esperados:**
- Lista de branches com status arquitetural
- Sugestões de correção (se necessário)
- File: `analysis/branch-audit-2026-04-27.md`

**Dono**: Architect

**Nota**: Skip se nenhum branch aberto (apenas main em uso)

---

### P1.2: Audit data.json Gerado

**O que fazer:**
1. Verificar último snapshot em `react-app/public/data.json`
2. Validar contra GUARANTEED_INVARIANTS:
   - P10 ≤ P50 ≤ P90? ✅
   - patrimonio_atual > R$500k? ✅
   - _schema_version presente? ✅
   - _window_id presente? ✅
   - Nenhum NaN/Inf? ✅
   - Timestamp válido (_generated ISO 8601)? ✅

3. Validar lógica:
   - P(FIRE) base vs fav vs stress (ordenação)?
   - Guardrails alignados (P(FIRE) vs drawdown)?
   - Bond pool runway (anos adequados)?

**Outputs esperados:**
- Relatório: `analysis/data-json-audit-2026-04-27.md`
- Status: ✅ OK ou ❌ Violations encontradas

**Dono**: Architect + Quant (validação numérica)

---

### P1.3: Treinar Dev com Checklist

**O que fazer:**
1. Criar walkthrough de checklist para Dev
2. Exemplos práticos:
   - ✅ Como fazer PR conforme
   - ❌ Violações comuns + como corrigir
3. Session de 15 min com Dev

**Outputs esperados:**
- Documento: `agentes/referencia/architect-pr-guide.md`
- Session recording (opcional)
- Feedback: Dev confirma entendimento

**Dono**: Architect + Head

**Timing**: Após primeira PR aberta (trigger)

---

## Timeline Recomendada

| Fase | Tarefa | Estimativa | Trigger |
|------|--------|-----------|---------|
| **P0** | P0.1 (pre-commit) + P0.2 (checklist setup) | 2-3h | Imediato |
| **P1** | P1.1 (branch audit) | 1h | Existe branch? |
| **P1** | P1.2 (data.json audit) | 1-2h | Após data regen |
| **P1** | P1.3 (Dev training) | 15m | 1ª PR aberta |

---

## Definition of Done

### P0
- [x] Pre-commit grep rules funcionando
- [x] Checklist documentado
- [x] Automação configurada
- [x] Teste: bloquear commit com `pfire * 100`

### P1
- [ ] Branch audit concluído (ou N/A se sem branches)
- [ ] data.json audit concluído
- [ ] Dev treinado
- [ ] Feedback incorporado

---

## Referências

- `analysis/architect-audit-2026-04-27.md` — Auditoria inicial P0 + Próximas Ações
- `agentes/issues/HD-ARCHITECT.md` — Briefing completo + 8 categorias centralizations
- `agentes/referencia/GUARANTEED_INVARIANTS.md` — Schema garantias para data.json

---

**Created**: 2026-04-27  
**Parent**: HD-ARCHITECT  
**Status**: 🟦 Em Andamento

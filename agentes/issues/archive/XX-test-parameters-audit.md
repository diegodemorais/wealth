---
id: XX-test-parameters-audit
titulo: Auditoria de Testes — Validação de Parâmetros de Referência
tipo: audit
dono: Quant + Dev (com suporte de especialistas por domínio)
prioridade: 🔴 Alta
status: 🔵 Em Andamento
criado: 2026-04-27
---

## Objetivo

Revisar **todos os testes** existentes (Python + TypeScript) para validar:
1. Parâmetros de referência (ranges, limites, valores esperados) fazem sentido?
2. Validações existentes cobrem tudo que precisa validar?
3. Há validações de algo que **não precisa** ser validado (falsos positivos)?
4. Gaps: o que deveria ser testado mas não está?

**Resultado esperado**: Suite de testes calibrada, sem ruído, com cobertura apropriada.

---

## Escopo

### 🔍 Testes a Revisar

**Python (`scripts/tests/`):**
- `test_pfire_canonicalization_audit.py` (9 testes)
- `test_data_pipeline_prohibitions.py` (6 testes)
- `test_phase4_*.py` (37 testes)
- `test_prohibition_advanced.py` (10 testes)
- Demais testes em `scripts/tests/`

**TypeScript/React (`react-app/`):**
- `src/__tests__/pfire-engine.test.ts` (tests com values hardcoded)
- `tests/data-validation.test.ts` (55 testes, muitos falhando por falta de data.json)
- `src/__tests__/schema-validation.test.ts` (14 testes)
- `tests/display-validation.test.ts` (35 testes)
- `tests/annual-returns-schema.test.ts` (21 testes)
- Demais testes

---

## Protocolo de Revisão

### Fase 1: Triage por Domínio (Quant + Dev)
Inventariar testes por categoria:
- **Canonicalization**: pfire, factor engines
- **Data Pipeline**: snapshots, schemas, validação
- **Portfolio**: posições, patrimônio, allocations
- **Tax**: IR, DARF, impacto fiscal
- **RF**: Tesouro, IPCA+, duration, MTM
- **Drawdown**: max DD, histórico
- **MC**: simulações, patrimônio P10/P50/P90

### Fase 2: Validação por Especialista (1 por domínio)
Para cada categoria, especialista responde:

**Pergunta 1: Parâmetros de Referência fazem sentido?**
```
Exemplo (Quant):
✓ P(FIRE) esperado 85-87% faz sentido? [SIM/NÃO + justificativa]
✓ Patrimônio P50 ~R$11M faz sentido? [SIM/NÃO]
✓ Drawdown max -53% é baseline correto? [SIM/NÃO]
```

**Pergunta 2: Faltam validações?**
```
Exemplo (FIRE):
⚠️ Testa se P(FIRE) de cenários (fav/stress) respeitam ordem? [NÃO → criar teste]
⚠️ Testa se delta_pp (fav-base) é sempre positivo? [NÃO → criar teste]
⚠️ Testa se valores estão em range válido (0-100)? [SIM]
```

**Pergunta 3: Validações que podem ser removidas?**
```
Exemplo (Dev):
🗑️ "networth between 1M-100M" depende de data.json preenchido. Manter como warning, não erro? [PROPOSTA]
🗑️ "annual_returns schema" — testa demais? [NÃO, necessário]
```

### Fase 3: Dev + Especialista (se houver dúvida técnica)
Se especialista tiver dúvida sobre **implementação**, não decisão:
```
Exemplo:
Quant: "Não sei se é possível validar delta_pp sem recalcular MC. Possível?"
  → Dev explica: "Sim, via CanonicalPFire.apply_pfire_delta(). Vou implementar."
```

---

## Agentes Convocados

| Domínio | Agente | Responsabilidade |
|---------|--------|------------------|
| **Core** | Quant | Orquestrar, validar parâmetros matemáticos, matriz principal |
| **Core** | Dev | Implementar fixes, validar cobertura TypeScript/Python |
| **Fire** | FIRE | Validar parâmetros spending, patrimônio, SWR, guardrails |
| **Risk** | Advocate | Validar gaps de stress-test, edge cases |
| **Tax** | Tax | Validar IR, DARF, Lei 14.754 |
| **RF** | RF | Validar Tesouro, duration, MTM, IPCA+ |
| **Factor** | Factor | Validar factor loadings, factor premiums |

---

## Entregáveis

1. **Matriz de Revisão** (Google Sheets ou CSV):
   - Teste → Domínio → Especialista → Validação (✓/✗/⚠️) → Ação

2. **Fixes Implementados**:
   - Novos testes criados (se gaps)
   - Testes removidos (se ruído)
   - Parâmetros ajustados (se mal calibrados)

3. **Report Final**:
   - Suite antes: X testes
   - Suite depois: Y testes
   - Coverage: Z%
   - CI status: ✅ passando

---

## Timeline

- **Fase 1 (Triage)**: 2h (Quant + Dev)
- **Fase 2 (Revisão)**: 4-6h (1h por especialista × 5-6)
- **Fase 3 (Implementação)**: 2-4h (Dev)
- **Total**: ~8-12h

---

## Dependências

- Acesso a: `scripts/tests/`, `react-app/__tests__/`, `tests/`
- Pre-requisito: Data.json preenchido (para tests que dependem)
  - Fallback: Mockar data.json ou adicionar conditional skip

---

## Notas

- **Falsos positivos atuais**: Tests falhando por falta de data.json (posicoes vazio, patrimonio 0)
  - Decisão: Manter como warning ou mockar dados de teste?
- **Ruído**: Alguns testes validam coisas que são sempre true (ex: `percentStr ends with %`)
  - Decisão: Mover para type-check ou remover?
- **Gaps conhecidos**: 
  - Nenhum teste valida sequence of returns risk (SoRR) explicitamente
  - Nenhum teste valida tax efficiency de drawdown
  - Nenhum teste valida estate tax impact em US-listed

---

## Status

Aguardando respostas de:
- ✋ Quant: Validação matriz matemática
- ✋ FIRE: Validação parâmetros behavior
- ✋ Tax: Validação IR/DARF
- ✋ RF: Validação Tesouro/duration
- ✋ Factor: Validação factor loadings
- ✋ Dev: Implementação fixes

**Início**: 2026-04-27 19:30 (ou próximo check-in)

# data.json Audit — Template

**Data da auditoria**: [AAAA-MM-DD]  
**Auditor**: Architect / Quant  
**Snapshot**: `react-app/public/data.json`

---

## Parte 1: Checklist de Invariants

### Invariants Estruturais (Schema)

- [ ] **P10 ≤ P50 ≤ P90 ordering?**
  - Resultado: P10 = ___, P50 = ___, P90 = ___
  - Válido: ✅ / ❌

- [ ] **patrimonio_atual > R$500k?**
  - Valor: R$ ___
  - Válido: ✅ / ❌

- [ ] **_schema_version ∈ v1.0 | v1.1?**
  - Versão encontrada: ___
  - Válido: ✅ / ❌

- [ ] **_window_id presente?**
  - Window ID: ___
  - Válido: ✅ / ❌

- [ ] **Nenhum NaN, Inf?**
  - Scan: Grep para `NaN|Infinity|null` (exceto em valores opcionais)
  - Resultado: ___
  - Válido: ✅ / ❌

- [ ] **_generated é ISO 8601 válido?**
  - Timestamp: ___
  - Válido: ✅ / ❌

---

## Parte 2: Validação de Lógica de Negócio

### P(FIRE) Consistency

- [ ] **P(FIRE) base < fav < stress (ordering)?**
  - base = ___ %
  - fav = ___ %
  - stress = ___ %
  - Válido: ✅ / ❌

- [ ] **Deltas coerentes?**
  - fav - base = ___ pp
  - stress - base = ___ pp
  - Esperado: fav ≈ +2pp, stress ≈ -8pp
  - Válido: ✅ / ❌

### Guardrails Alignment

- [ ] **drawdown_history consistente com P(FIRE)?**
  - Última queda: ___ %
  - P(FIRE) reflete queda? ✅ / ❌
  - Observação: ___

- [ ] **Bond pool runway adequado?**
  - Anos de cobertura (6mo/ano): ___
  - Mínimo esperado: 6 anos
  - Válido: ✅ / ❌

### Data Freshness

- [ ] **Snapshot gerado recentemente (últimas 7 dias)?**
  - Data geração: ___
  - Dias desde agora: ___
  - Válido: ✅ / ❌

---

## Parte 3: Flags Opcionais

- [ ] Qualquer campo `_metadata` adicionado?
  - Listar: ___
  - Verificado: ✅ / ❌

- [ ] Novos cenários em `scenarios`?
  - Nome: ___
  - Schema: ___
  - Validado: ✅ / ❌

---

## Resultado Final

**Status Geral**: 
- ✅ OK — Todos invariants e lógica válida
- ⚠️  Warning — Algumas desvios leves (documentar abaixo)
- ❌ Violations — Bloqueadores encontrados (detalhar)

### Resumo de Violations (se houver)

```
Item: ___
Severidade: Crítica / Alta / Média / Baixa
Descrição: ___
Ação Necessária: ___
```

### Observações Adicionais

___

---

## Sign-Off

| Rol | Nome | Data | Nota |
|-----|------|------|------|
| Architect | ___ | ___ | ___ |
| Quant | ___ | ___ | ___ |

---

## Referências

- `agentes/referencia/GUARANTEED_INVARIANTS.md` — Especificação completa
- `scripts/validators.py` — Validação Python
- `react-app/public/data.json` — Arquivo auditado
- Commit que gerou snapshot: ___


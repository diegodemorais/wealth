---
ID: DEV-spec-contract-fix
Titulo: Spec contract fix — HODL11 + fire_montecarlo_liquido
Dono: Dev
Prioridade: 🟡 Média
Dependências: —
Origem: descoberto durante DEV-pipeline-append-only (2026-05-01)
---

## Contexto

`quick_dashboard_test.sh` está falhando em **bug pré-existente de spec contract**, não introduzido por DEV-pipeline-append-only. Validado: falha existia em HEAD limpo de antes da issue anterior.

A falha cascateou em 1 teste cross-source: `tests/cross-source.test.ts:234` — `n_historico` 62 (data.json stale) vs 61 (fire_trilha.json fresh). O bloqueio root é o `generate_data.py` não conseguir validar o `data.json` contra `react-app/spec.json` (validador de contrato bloqueia o build).

## Bugs identificados

### Bug 1 — HODL11 spec contract
- Campos faltantes ou divergentes: `hodl11.pnl_brl`, `hodl11.pnl_pct`
- Spec esperado em `react-app/spec.json` não é atendido por `generate_data.py`

### Bug 2 — fire_montecarlo_liquido spec contract
- Campos faltantes ou divergentes em `fire_montecarlo_liquido.*`
- Mesmo padrão: `data.json` produzido não cumpre o spec

## Plano

1. Rodar `python3 scripts/generate_data.py` e capturar output exato do validador (qual campo, qual divergência)
2. Para cada um dos 2 bugs:
   - Identificar se o gap é (a) campo ausente em data.json, (b) tipo errado, (c) spec desatualizado
   - Corrigir no source apropriado (`generate_data.py` ou `spec.json`, conforme verdade)
3. Regenerar `data.json` + `react-app/public/data.json`
4. Validar contrato: `validate_dashboard_contract.py` (ou equivalente) verde
5. Validar suite full: `./scripts/quick_dashboard_test.sh` end-to-end verde

## Critérios de aceite

- [ ] HODL11 spec contract verde
- [ ] fire_montecarlo_liquido spec contract verde
- [ ] `cross-source.test.ts:234` (`n_historico`) verde
- [ ] `./scripts/quick_dashboard_test.sh` end-to-end verde
- [ ] `data.json` regenerado e commitado
- [ ] Changelog atualizado se mudou semântica de campo (não se foi só correção de schema)

## Memórias relevantes

- `feedback_validacao_contrato.md`: spec.json é vinculante, bloqueia build se violação — verdade é o spec, não o data.json improvisado
- `feedback_data_provenance.md`: regenerar via scripts canônicos
- `feedback_dashboard_test_protocol.md`: Playwright/suite obrigatório antes do push

## Conclusão

> A preencher após implementação.

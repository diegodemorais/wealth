# Dashboard Test Protocol — Validação Completa

**OBRIGATÓRIO**: Antes de qualquer `git push` que envolva dashboard, executar esta suite de testes.

## Quick Start

```bash
# Suite completa (5 níveis, ~2 min)
./scripts/quick_dashboard_test.sh

# Apenas testes críticos (mais rápido)
./scripts/quick_dashboard_test.sh --quick

# Sem Playwright (se só alterou CSS/HTML, sem mudanças estruturais)
./scripts/quick_dashboard_test.sh --no-render

# Apenas schema validation (diagóstico rápido)
python3 scripts/validate_schema.py

# Apenas component render status
node dashboard/tests/debug_render_status.js

# Apenas dashboard test suite
python3 scripts/test_dashboard.py
```

## O que cada teste faz

| Nível | Script | O que valida | Tempo | Resultado |
|-------|--------|--------------|-------|-----------|
| 1 | `validate_schema.py` | spec.json ↔ data.json contrato | ~1s | ✅/❌ |
| 2 | `test_rendered_html.py` | Elementos HTML populados | ~1s | ✅/❌ |
| 3 | `debug_render_status.js` | 66 componentes renderizados (spec mapping) | ~10s | 62/66 esperado |
| 4 | `test_dashboard.py` | 559 testes (todas categorias) | ~30s | 557/559 esperado |
| 5 | `validate_locally.mjs` | Playwright: bootstrap, tabs, CSS, KPIs, erros | ~15s | ✅/❌ |

## Resultado esperado

```
✅ Schema VALIDAÇÃO PASSOU
✅ HTML RENDER CHECK OK (stackedAllocBar, legend, etc.)
✅ COMPONENT RENDER STATUS: 62/66 renderizados
✅ DASHBOARD TEST SUITE: 557/559 PASSED → DEPLOY APPROVED
✅ PLAYWRIGHT: All checks green → Safe to push
```

## Se algum teste falhar

### Falha no Schema (Nível 1)
```
❌ Campo 'xyz.abc' não existe em data.json
```
→ Verifique se `generate_data.py` está gerando o campo esperado

### Falha no HTML Render (Nível 2)
```
❌ stackedAllocBar — ELEMENTO VAZIO
```
→ Verifique se `build_dashboard.py` está populando os IDs

### Falha no Component Render (Nível 3)
```
❌ EMPTY: 4/66
  • glide-path
  • retorno-decomposicao
```
→ Componentes devem estar em `dashboard/js/0X-*.mjs` builder

### Falha no Test Suite (Nível 4)
```
❌ responsive :: RENDER :: tabelas não causam overflow horizontal
```
→ CSS responsivo incompleto — adicione media query ou classe dinâmica

### Falha no Playwright (Nível 5)
```
❌ 1 errors: Failed to load resource: status 500
```
→ Erro de rede interceptado. Verifique:
- Arquivo missing ou 404
- Erro no bootstrap.mjs import
- Port 8765 em uso

## Integração em CI/CD (GitHub Actions)

O arquivo `.github/workflows/test-dashboard.yml` roda automaticamente:

```yaml
- name: Dashboard Test Suite
  run: ./scripts/quick_dashboard_test.sh
```

Se falhar → bloqueia merge na main.

## Histórico de testes

Cada execução salva resultado em:
- `dashboard/tests/full_test_run.json` — suite master
- `dashboard/tests/last_run.json` — testes do Python
- `dashboard/tests/render_status.json` — component render map

## Notas

- **Arquivos gerados** (evite editar):
  - `dashboard/index.html` (gerado por `build_dashboard.py`)
  - `dashboard/version.json`
  - `dashboard/data.json`
  - `dashboard/tests/*.json`

- **Arquivos a editar**:
  - `dashboard/template.html` (quando splitará em partials)
  - `dashboard/js/*.mjs` (lógica JS)
  - `dashboard/styles/*.css` (estilos)
  - `dashboard/spec.json` (schema de blocos)
  - `scripts/generate_data.py` (dados do Python)

## Exemplo: Workflow completo

```bash
# 1. Fazer mudança
vi dashboard/js/07-init-tabs.mjs

# 2. Testar localmente
./scripts/quick_dashboard_test.sh

# 3. Se tudo verde
git add .
git commit -m "fix: switch tab animation timing"
git push origin feature-branch

# 4. GitHub Actions roda novamente antes de merge
```

Se falhar em CI → git push rejeitado até corrigir.

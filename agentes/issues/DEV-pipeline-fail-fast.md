---
ID: DEV-pipeline-fail-fast
Titulo: Pipeline fail-fast — eliminar fallbacks silenciosos
Dono: Dev
Prioridade: 🟢 Baixa
Dependências: —
Origem: descoberto durante DEV-spec-contract-fix (2026-05-01)
---

## Contexto

`get_factor_value_spread()` em `scripts/generate_data.py:4012` faz **fallback silencioso para `None`** quando o import `from market_data import factor_value_spread` falha:

```python
try:
    from market_data import factor_value_spread
    ...
except Exception:
    return None  # silencioso
```

Resultado real (vivido nesta sessão): pipeline rodou via `python3` (system Python sem `getfactormodels`) em vez do venv canônico (`~/claude/finance-tools/.venv/bin/python3`). Output: `factor.value_spread = None`, spec contract 344/345, widget de value spread sumiu silenciosamente, semantic test quebrou — sem nenhum warning visível durante a execução do pipeline.

**Princípio violado:** dado faltante deve ser **fatal ou warning visível**, nunca silencioso. Fallback `return None` esconde bugs ambientais e degrada o dashboard sem que ninguém perceba até o teste de contrato falhar — possivelmente em CI ou produção.

## Escopo

Auditar **todos os fallbacks silenciosos** em scripts do pipeline (`scripts/*.py`):

1. **`except Exception: return None`** — anti-padrão A
2. **`except: pass`** — anti-padrão B
3. **`if x is None: x = default_silencioso`** — anti-padrão C (depende do contexto)
4. **Imports condicionais sem warning** — anti-padrão D

Para cada ocorrência:
- (a) Esperado: deve ser fail-fast (assertion/raise) → corrigir
- (b) Tolerável: tem fallback legítimo (ex: cache opcional) → adicionar `logger.warning(...)` visível
- (c) Defensivo necessário: documentar no comentário do código por quê

## Princípios

### P1. Fontes primárias = fail-fast
Imports de pacotes obrigatórios (`getfactormodels`, `pyield`, `python-bcb`, `yfinance`, `fredapi`) devem causar `RuntimeError` imediato com mensagem clara: "Pipeline requer `<pkg>`. Use venv canônico: `~/claude/finance-tools/.venv/bin/python3`".

### P2. Cálculos derivados = fail-fast por padrão
Funções que retornam dados para `data.json` devem `raise` ao invés de `return None` quando dependências falham. Spec contract pega no final, mas quando explode é tarde demais.

### P3. Caches = warning visível
Falha em ler/escrever cache não pode quebrar pipeline, mas deve aparecer em log.

### P4. Validador de ambiente upfront
`scripts/generate_data.py` deve, no início da execução, validar:
- Python correto (venv canônico)
- Pacotes core importáveis
- Variáveis de ambiente obrigatórias (se houver)

Falha → `sys.exit(1)` com mensagem clara antes de qualquer cálculo.

## Plano

### Fase 1 — Auditoria
Grep estruturado em `scripts/`:
- `except Exception:\s*\n\s*return None`
- `except:\s*\n\s*pass`
- `try:\s*\n\s*from .* import` sem `else: log` correspondente

Produzir tabela: arquivo, linha, padrão, decisão (fail-fast | warning | manter).

### Fase 2 — Fix do bug original
`get_factor_value_spread()` (`generate_data.py:4012`):
- Trocar `return None` por `raise RuntimeError("getfactormodels não disponível — usar venv canônico")`
- Validador upfront (P4) impedirá chegar aqui em ambiente errado

### Fase 3 — Refator dos demais fallbacks silenciosos
Aplicar P1-P3 conforme tabela da Fase 1.

### Fase 4 — Validador de ambiente (P4)
Criar `scripts/validate_env.py`:
- Checa Python path contém `finance-tools/.venv`
- Checa imports core (`yfinance`, `pyield`, `getfactormodels`, `python-bcb`, `fredapi`)
- Importado no topo de `generate_data.py` como primeira ação

### Fase 5 — Testes
- Teste unitário: cada função fail-fast levanta exceção esperada quando dependência falta
- Teste E2E: rodar `python3 scripts/generate_data.py` (system Python) deve falhar imediatamente com mensagem clara, NÃO produzir data.json corrompido
- `./scripts/quick_dashboard_test.sh` end-to-end verde

## Critérios de aceite

- [ ] Auditoria completa de fallbacks silenciosos em `scripts/*.py` (tabela em `_FALLBACK_AUDIT.md` ou docstring)
- [ ] `get_factor_value_spread()` é fail-fast
- [ ] `scripts/validate_env.py` criado e invocado no topo do pipeline
- [ ] Pipeline rodando em ambiente sem dependência → erro claro em < 1s, sem data.json gerado
- [ ] Pipeline rodando em ambiente correto → comportamento idêntico ao atual
- [ ] Testes unitários cobrem caminhos de erro
- [ ] `./scripts/quick_dashboard_test.sh` end-to-end verde
- [ ] Changelog atualizado se houver impacto observável (provavelmente não — esta é mudança defensiva)

## Conclusão

> A preencher após implementação.

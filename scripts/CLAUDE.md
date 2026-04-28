# Dev — Pipeline Python

Tech lead do pipeline de dados da carteira de Diego Morais.
Identifique-se como "Dev:" em cada resposta.

> **Isolamento de contexto:** Este arquivo é carregado junto com o CLAUDE.md root (Head).
> As instruções do Head que NÃO se aplicam aqui: bootstrap (carteira.md, perfis CIO),
> roteamento Head→Dev, protocolos de decisão de portfolio.
> Você já é o Dev — execute apenas as instruções deste arquivo.

**Ownership:** Dev altera código em `scripts/`. Bookkeeper valida outputs. Agentes analíticos (FIRE, Factor, RF, Macro) abrem issue se precisam de mudança no pipeline — não tocam diretamente.
Enforcement real: assertions de schema em `generate_data.py` bloqueiam output inválido.

@agentes/perfis/20-dev.md

## Ambiente

```bash
~/claude/finance-tools/.venv/bin/python3 scripts/generate_data.py
```

Catálogo completo de scripts: `agentes/referencia/scripts.md`

## Fluxo de dados

```
carteira.md → parse_carteira.py → carteira_params.json → config.py
                                                           ↓
                                              generate_data.py → dados/data.json → React
```

Ao alterar premissa: editar `carteira.md` (narrativa + tabela "Parâmetros para Scripts") → rodar `parse_carteira.py`.
Nunca editar `config.py` diretamente para parâmetros financeiros.

## Invariantes

- Zero hardcoded em `generate_data.py` — parâmetros vêm de `config.py` / `carteira_params.json`
- Todo campo gerado para o dashboard precisa de assertion de schema em `generate_data.py` (bloqueia se nulo)
- Outputs são JSON — validar estrutura antes de salvar

## Qualidade (Python)

- Funções: 4–20 linhas, responsabilidade única
- Type hints obrigatórios em funções públicas
- Early returns sobre ifs aninhados; máx 2 níveis de indentação
- Arquivos temporários: `/tmp` — nunca no root do repo

## P(FIRE) — Python

```python
from scripts.pfire_transformer import canonicalize_pfire, apply_pfire_delta

p_sucesso = 0.864  # de fire_montecarlo.py (decimal, não %)
pfire = canonicalize_pfire(p_sucesso, source='mc')
# → CanonicalPFire(decimal=0.864, percentage=86.4, percentStr="86.4%")

pfire_fav = apply_pfire_delta(pfire, delta_pct=2.05, reason="fav = base + delta")

# PROIBIDO: p_sucesso * 100  /  round(p_sucesso * 100, 1)
```

| source | Origem | Confiança |
|--------|--------|-----------|
| `'mc'` | Monte Carlo real (fire_montecarlo.py) | Canônico |
| `'heuristic'` | Delta aplicado sobre base | Derivado |
| `'fallback'` | Constante stale hardcoded | Emergencial |

Validação: `pytest scripts/tests/pfire-canonicalization.test.py`

---
ID: DEV-release-gate-checklist
Titulo: Release Gate — checklist técnico mecânico pre-push
Dono: Dev (+ QA mandato)
Prioridade: 🟡 Média
Dependências: —
Origem: feedback Advocate na retro de composição de time (2026-05-01) + 4 bugs visuais que Diego pegou nesta sessão
---

## Contexto

Sessão 2026-05-01 fechou 14 issues e Diego foi o gate de qualidade visual: pegou cliff −91% no drawdown chart, timezone BRT errada no changelog, sliders FIRE quebrados após Aspiracional, AVEM 1.43% só visível em scan. Bug do FIRE rodou 3 dias silencioso. Custo: bugs em produção que poderiam ser pegos em ~2 minutos de checklist mecânico.

**Decisão Head pós-debate Advocate:** criar perfil QA (`agentes/perfis/22-qa.md`) com mandato de gate técnico obrigatório antes de push + Validador Funcional como role dinâmico (agente do domínio).

Esta issue implementa o **checklist mecânico** que materializa o mandato.

## Escopo

Criar `scripts/release_gate.sh` (ou expandir `quick_dashboard_test.sh`) que executa os 9 checks do perfil QA e bloqueia push se falhar:

| # | Check | Critério | Implementação |
|---|-------|----------|---------------|
| 1 | Build limpo | `npm run build` passa | já existe em quick_dashboard_test |
| 2 | TypeScript | `tsc --noEmit` zero novos | já existe (allowlist) |
| 3 | Vitest | 100% pass não-skipped | já existe |
| 4 | Playwright semantic | 100% pass | já existe |
| 5 | Pipeline E2E | spec contract X/X OK | já existe |
| 6 | Privacy regression | zero R$ literal em privacy on | já existe (estendido em DEV-privacy-deep-fix) |
| 7 | **Sanity numérico** | drawdown sem cliff vertical, P(FIRE) [0,100], patrimônio ±20%, Selic [8,20], IPCA+ [4,10] | **NOVO** |
| 8 | **Anti-cliff visual** | último ponto vs penúltimo: divergência <50% em chart | **NOVO** |
| 9 | Versão bumped | dashboard version mudou | já existe |

**Novos checks (7+8) — implementação:**

### Check 7: Sanity numérico

`scripts/release_gate_sanity.py`:
```python
import json
from pathlib import Path

ROOT = Path(__file__).parent.parent
data = json.loads((ROOT / "react-app/public/data.json").read_text())

ASSERTIONS = [
    ("kpis.networth_brl", lambda v: 100_000 < v < 100_000_000, "patrimônio em range plausível"),
    ("fire.pfire_canonical_base", lambda v: 0 <= v <= 100, "P(FIRE) em [0,100]"),
    ("macro.selic", lambda v: 5 <= v <= 25, "Selic em [5,25]%"),
    ("macro.ipca_2040_real", lambda v: 3 <= v <= 12, "IPCA+ 2040 em [3,12]% real"),
    # ... ~10 outros
]

failures = []
for path, predicate, label in ASSERTIONS:
    val = get_nested(data, path)
    if val is None:
        failures.append(f"❌ {path}: ausente")
    elif not predicate(val):
        failures.append(f"❌ {label}: valor {val} fora do range")

if failures:
    print("\n".join(failures))
    sys.exit(1)
print("✅ sanity numérico OK")
```

### Check 8: Anti-cliff visual

Para arrays de pontos em charts (drawdown_history, fire_trilha, retornos_mensais, rolling_metrics):
```python
# último ponto vs penúltimo: divergência absoluta não pode exceder 50% (ou 5pp absoluto se valor pequeno)
def assert_no_cliff(series, name, max_rel_change=0.5, max_abs_change=5):
    if len(series) < 2: return
    last, prev = series[-1], series[-2]
    rel = abs((last - prev) / prev) if prev else 0
    abs_diff = abs(last - prev)
    if rel > max_rel_change and abs_diff > max_abs_change:
        raise AssertionError(f"{name}: cliff vertical {prev} → {last}")
```

Aplicar a todas as séries com >24 pontos. Falha → bloqueia push.

## Integração

1. `scripts/release_gate.sh` chama todos os 9 checks em sequência
2. `quick_dashboard_test.sh` invoca `release_gate.sh` ao final (substituindo blocos atuais ou complementando)
3. Documentar em `react-app/CLAUDE.md` ou `scripts/CLAUDE.md`: "antes de push: rodar `./scripts/release_gate.sh`. Se falhar, NÃO commitar."
4. Opcional: hook git pre-push automático em `.git/hooks/pre-push` que rode o gate (Diego pode optar por isso ou manter manual)

## Testes da própria issue

- Sanity check funciona (rodar com data.json corrompido propositalmente, deve falhar)
- Anti-cliff funciona (rodar com série que tem cliff -91% como o bug original do drawdown — deve falhar)
- Verde quando data.json está consistente
- Tempo do gate completo: < 2 min (incluindo Playwright)

## Critérios de aceite

- [ ] `scripts/release_gate.sh` criado, executa 9 checks em sequência
- [ ] Sanity numérico (Python) valida 8-10 campos críticos com ranges
- [ ] Anti-cliff (Python) valida séries de chart contra cliff visual (>50% e >5pp)
- [ ] `quick_dashboard_test.sh` invoca o gate
- [ ] `CLAUDE.md` ou `scripts/CLAUDE.md` documenta o protocolo
- [ ] Teste de regressão: rodar gate contra data.json com cliff -91% propositalmente — gate falha
- [ ] Teste de regressão: rodar gate contra data.json válido atual — gate passa
- [ ] Suite full verde
- [ ] Issue arquivada

## Memórias críticas

- `feedback_dashboard_test_protocol.md`: Playwright OBRIGATÓRIO antes de push
- `feedback_validacao_contrato.md`: spec.json é vinculante
- Perfil novo `agentes/perfis/22-qa.md`: mandato e workflow do QA

## Conclusão

> A preencher após implementação.

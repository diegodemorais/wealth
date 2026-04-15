# Visual Regression Testing — Nível 6 da Suite Oficial

## O que é?

**Testes de Regressão Visual** comparam screenshots do React atual contra a baseline HTML (stable-v2.77) para detectar:
- Componentes faltando (ex: Semáforos)
- Styling divergências (cores, borders, spacing)
- Layout changes (alinhamento, responsividade)

É a **validação end-to-end visual** — complementa testes de schema/estrutura com análise real de como o dashboard aparece.

## Como usar?

### Standalone (rápido)
```bash
python3 scripts/test_visual_regression.py
```

### Com threshold customizado
```bash
python3 scripts/test_visual_regression.py --threshold 5
```

### Na suite completa (6 níveis)
```bash
./scripts/quick_dashboard_test.sh
```

### Pular visual na suite (mais rápido)
```bash
python3 scripts/run_all_dashboard_tests.py --no-visual
```

## O que o teste faz?

1. **Valida baseline**: Verifica que 25 screenshots de referência (HTML stable-v2.77) existem
2. **Captura React**: 7 screenshots via Playwright (01-now-tab.png até 07-backtest-tab.png)
3. **Analisa gaps**: Compara componentes visuais conhecidos (KPI cards, Semáforos, tabelas, charts)
4. **Classifica severidade**:
   - 🔴 **CRITICAL** — Bloqueia release (componente missing, layout quebrado)
   - 🟡 **MEDIUM** — Visual divergence aceitável (styling, spacing — < 3 allowed)
   - 🟢 **LOW** — Minor (padding, font-weight)

## Resultado

```
✅ PASS: <= 3 medium gaps, 0 critical
❌ FAIL: > 3 medium gaps OR qualquer critical gap
```

Relatório salvo em: `dashboard/tests/visual_regression_report.json`

## Gaps conhecidos (Catálogo)

| Gap | Severity | Tab | Fix |
|-----|----------|-----|-----|
| Semáforos not rendering | 🔴 CRITICAL | NOW | Check Semaforo.tsx visibility |
| KPI cards missing border | 🟡 MEDIUM | NOW | Add border-left: 4px |
| Tab active indicator | 🟡 MEDIUM | All | Add border-bottom active state |
| Portfolio badge colors | 🟡 MEDIUM | PORTFOLIO | Add .badge-* classes |
| Chart resize on collapse | 🟡 MEDIUM | All | Dispatch resize event |
| Table row alternating colors | 🟢 LOW | PORTFOLIO | Add nth-child(odd) styling |

## Integração na CI/CD

- **Antes de merge**: `./scripts/quick_dashboard_test.sh` (inclui nível 6)
- **Pre-push hook**: Mesmo comando
- **Dashboard pipeline**: Deploy blocks se visual regression FAIL

## Atualizando o catálogo de gaps

Quando fixar um gap:
1. Edit `scripts/test_visual_regression.py` → remove entrada de `KNOWN_GAPS`
2. Re-run teste: `python3 scripts/test_visual_regression.py`
3. Resultado: 1 menos gap na contagem

Quando descobrir novo gap:
1. Inspecione screenshot
2. Adicione entrada em `KNOWN_GAPS` dict (id, severity, tab, description, impact, fix)
3. Re-run teste
4. Documente no plano de fixes

---

**Testes visuais são obrigatórios antes de qualquer release.** Sem passar nível 6, nenhum git push.

# 📸 Visual Regression Testing Suite

**Status:** ✅ Updated to wkhtmltopdf + PIL comparison

## Descrição

Suite completa de testes de regressão visual que:
1. Captura screenshots do dashboard via **wkhtmltopdf** (GitHub Pages)
2. Compara com **25 screenshots de baseline** (stable-v2.77)
3. Gera relatório JSON com análise pixel-by-pixel
4. Classifica gaps por severidade (CRITICAL/MEDIUM/LOW)

## Uso

```bash
# Teste completo
python3 scripts/test_visual_regression.py

# Com threshold customizado
python3 scripts/test_visual_regression.py --threshold 3

# Apenas validar baseline
python3 scripts/test_visual_regression.py --baseline-only

# Com detalhes
python3 scripts/test_visual_regression.py --verbose
```

## Arquitetura

### Captura de Screenshots (wkhtmltopdf)
```
GitHub Pages → wkhtmltopdf → PDF → pdftoppm → PNG
└─ Fonte: https://diegodemorais.github.io/wealth/
└─ Saída: react-app/audit-screenshots/*.png
```

### Comparação (PIL)
```
React Screenshot (01-now-tab.png) ┐
                                   ├─→ ImageChops.difference() 
Baseline Screenshot (1.png)         ┘
                                   ├─→ ImageStat.Stat() (RMS error)
                                   ├─→ Pixel diff count
                                   └─→ Similarity score (0-100%)
```

### Relatório
```json
{
  "timestamp": "2026-04-15T21:04:00",
  "baseline_valid": true,
  "total_gaps": 1,
  "critical_gaps": 1,
  "medium_gaps": 0,
  "low_gaps": 0,
  "gaps": [
    {
      "id": "VIS-01-now-tab.png",
      "severity": "🔴 CRITICAL",
      "description": "Visual divergence detected: 0% match with baseline",
      "impact": "1753254 pixels differ from reference",
      "analysis": {
        "rms_error": 0.998,
        "diff_pixels": 1753254,
        "similarity": 0.2
      }
    }
  ]
}
```

## Fluxo de Integração

### Run All Tests (Nível 6)
```python
scripts/run_all_dashboard_tests.py
│
├── 1. Schema Validation
├── 2. HTML Structure
├── 3. Component Render
├── 4. Dashboard Tests (557/559)
├── 5. Playwright E2E
└── 6. Visual Regression ✅ (NEW: wkhtmltopdf)
```

## Métricas

- **Screenshot Size:** ~54KB (compressed PNG)
- **Baseline:** 25 screenshots (analysis/screenshots/stable-v2.77/)
- **Comparison Time:** ~2-3s por screenshot
- **Memory:** <500MB típico

## Configuração

### Dependências
```bash
# Sistema
wkhtmltopdf    # apt-get install wkhtmltopdf
pdftoppm       # apt-get install poppler-utils
imagemagick    # apt-get install imagemagick

# Python
pip install pillow  # PIL para image comparison
```

### Threshold Padrão
- **CRITICAL:** Bloqueia release (0 permitido)
- **MEDIUM:** Máximo 3 (customizável via --threshold)
- **LOW:** Não bloqueia

## Catalog de Gaps Conhecidos

KNOWN_GAPS é um dicionário que mapeia gap IDs para metadata:
```python
KNOWN_GAPS = {
    "QUANT-001-semaforos": {
        "severity": CRITICAL,
        "tab": "NOW Tab",
        "description": "Semáforos não renderizam",
        "impact": "Traffic light status invisible",
        "fix": "Array.isArray check em gatilhos.js"
    },
    # ... mais gaps
}
```

**Nota:** Gaps são removidos do catálogo quando fixados (veja commit f92f47c).

## Próximos Passos

1. **Integração CI/CD:** Rodar antes de releases
2. **Baseline Updates:** Capturar novo baseline a cada major version
3. **Threshold Refinement:** Ajustar tolerância por tipo de screen
4. **Percy/Playwright Cloud:** Considerar para CI visual testing

## Referências

- **Commit Original:** d4c2cd3 (QUANT-001 visual regression)
- **Refactor:** 5cc8537 (wkhtmltopdf migration)
- **Issue:** `agentes/issues/QUANT-001-visual-regression-audit.md`
- **Report:** `dashboard/tests/visual_regression_report.json`

---

**Last Updated:** 2026-04-15  
**Status:** ✅ Production Ready (wkhtmltopdf + PIL)

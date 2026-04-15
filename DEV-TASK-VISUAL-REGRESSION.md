# 🚀 DEV TASK — Visual Regression Suite Implementation

**Created:** 2026-04-15  
**Owner:** @Dev  
**Status:** 🟡 READY FOR IMPLEMENTATION  
**Priority:** 🔴 HIGH  
**Est. Time:** 3-4h

---

## 📋 Contexto

Suite de testes visuais foi atualizada para usar **wkhtmltopdf + PIL** em vez de Playwright. Agora é funcional, mas com limitações:

✅ **Pronto:**
- Comparação pixel-by-pixel (PIL)
- RMS error metric
- Baseline validation (25 screenshots)
- Gap classification (CRITICAL/MEDIUM/LOW)
- JSON report generation

⏳ **Faltando:**
- [ ] Navegação por abas (tab-specific captures)
- [ ] Baseline atualizado (v0.1.166)
- [ ] Análise completa (7 abas)

---

## 🎯 Objetivos

### Phase 1: Tab Navigation (1.5-2h)
Implementar navegação por abas no script de captura para tirar screenshots de cada aba separadamente.

**Atual:** Captura apenas página principal (Now tab)  
**Desejado:** 7 screenshots individuais (1 por aba)

#### Opções:

**Opção A: Selenium** (Recomendado)
```python
from selenium import webdriver
from selenium.webdriver.common.by import By

driver = webdriver.Chrome()
driver.get("https://diegodemorais.github.io/wealth/")

# Navigate tabs
tabs = ["now", "portfolio", "performance", "fire", "withdraw", "simulators", "backtest"]
for tab in tabs:
    button = driver.find_element(By.CSS_SELECTOR, f'[data-tab="{tab}"]')
    button.click()
    time.sleep(2)  # Wait for render
    
    # Capture screenshot
    driver.save_screenshot(f"01-{tab}-tab.png")
```

**Opção B: Puppeteer (Node.js)**
```javascript
const puppeteer = require('puppeteer');

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.goto('https://diegodemorais.github.io/wealth/');

const tabs = ["now", "portfolio", "performance", "fire", "withdraw", "simulators", "backtest"];
for (const tab of tabs) {
  await page.click(`[data-tab="${tab}"]`);
  await page.waitForTimeout(2000);
  await page.screenshot({path: `01-${tab}-tab.png`});
}
```

**Opção C: Playwright (volta ao original, mas mais simples)**
```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page()
    page.goto("https://diegodemorais.github.io/wealth/")
    
    # Navigate tabs
    ...
```

**Recomendação:** Opção A (Selenium) ou B (Puppeteer) — ambas podem usar xvfb-run em CI

#### Tarefas:
- [ ] Instalar dependência (selenium ou puppeteer)
- [ ] Atualizar `capture_screenshots()` em `test_visual_regression.py`
- [ ] Validar que 7 PNGs são gerados corretamente
- [ ] Testar em headless mode (CI/CD ready)

---

### Phase 2: Baseline Update (1-1.5h)
Capturar novo baseline de v0.1.166 como referência padrão.

**Estrutura:**
```
analysis/screenshots/
├── stable-v2.77/           (old baseline - 2022)
│   ├── 1.png (Now-1)
│   ├── 2.png (Now-2)
│   ├── ...
│   └── 25.png (Backtest-8)
│
└── v0.1.166/               (NEW - current)
    ├── 01-now-tab.png
    ├── 02-portfolio-tab.png
    ├── 03-performance-tab.png
    ├── 04-fire-tab.png
    ├── 05-withdraw-tab.png
    ├── 06-simuladores-tab.png
    └── 07-backtest-tab.png
```

#### Tarefas:
- [ ] Criar diretório `analysis/screenshots/v0.1.166/`
- [ ] Executar `python3 scripts/test_visual_regression.py` com Phase 1 completa
- [ ] Validar 7 PNGs foram capturados (~54KB cada)
- [ ] Armazenar em git

---

### Phase 3: Gap Analysis (1-1.5h)
Executar análise completa e gerar relatório de gaps reais.

**Esperado:**
- 7 comparações (1 por aba)
- Identificar gaps REAIS (vs. redesign esperado)
- Classificar por severidade
- Gerar plano de remediation

#### Tarefas:
- [ ] Atualizar `TAB_MAPPING` em `test_visual_regression.py` com novos componentes
- [ ] Rodar `test_visual_regression.py` full suite
- [ ] Revisar `dashboard/tests/visual_regression_report.json`
- [ ] Documentar gaps por aba
- [ ] Criar issues para cada gap CRITICAL/MEDIUM

---

## 📊 Definições de Sucesso

| Critério | Target | Status |
|----------|--------|--------|
| Phase 1: Tab navigation working | ✅ | ⏳ |
| Phase 2: 7 baseline screenshots captured | ✅ | ⏳ |
| Phase 3: Gap analysis complete | ✅ | ⏳ |
| All abas compared | 7/7 | ⏳ |
| CRITICAL gaps identified | ≥0 | ⏳ |
| MEDIUM gaps identified | ≥0 | ⏳ |
| Report generated | ✅ | ⏳ |

---

## 📁 Arquivos Relevantes

### Core Suite
- `scripts/test_visual_regression.py` — Main test suite (UPDATE NEEDED)
- `scripts/capture_screenshots.sh` — Bash helper
- `scripts/capture_with_server.py` — Server-based capture
- `scripts/capture_github_pages.sh` — wkhtmltopdf wrapper

### Documentation
- `VISUAL-REGRESSION-SUITE-README.md` — Usage guide
- `VISUAL-REGRESSION-ANALYSIS.md` — Current analysis
- `dashboard/QUANT-001-Visual-Fixes-Report.md` — History

### Data
- `analysis/screenshots/stable-v2.77/` — Old baseline (25 PNGs)
- `react-app/audit-screenshots/` — Current captures
- `dashboard/tests/visual_regression_report.json` — Report

---

## 🔧 Implementação Checklist

### Phase 1: Tab Navigation
- [ ] Install Selenium / Puppeteer
- [ ] Update `capture_screenshots()` function
- [ ] Test with GitHub Pages URL
- [ ] Validate 7 PNGs generated
- [ ] Add to `scripts/test_visual_regression.py`
- [ ] Test in CI/CD environment

### Phase 2: Baseline Capture
- [ ] Create `analysis/screenshots/v0.1.166/` directory
- [ ] Run full test suite
- [ ] Verify 7 baseline screenshots
- [ ] Commit to git
- [ ] Update `.gitignore` if needed

### Phase 3: Gap Analysis
- [ ] Update TAB_MAPPING with new components
- [ ] Run full regression analysis
- [ ] Generate final report
- [ ] Document gaps by severity
- [ ] Create follow-up issues

---

## 🚀 Getting Started

```bash
# 1. Check current status
python3 scripts/test_visual_regression.py --baseline-only

# 2. Implement Phase 1 (navigation)
# Edit scripts/test_visual_regression.py
# Add Selenium/Puppeteer tab navigation

# 3. Test locally
python3 scripts/test_visual_regression.py

# 4. Commit baseline
git add analysis/screenshots/v0.1.166/
git commit -m "baseline: Capture v0.1.166 screenshots for visual regression"

# 5. Full analysis
python3 scripts/test_visual_regression.py --verbose

# 6. Review report
cat dashboard/tests/visual_regression_report.json | python3 -m json.tool
```

---

## ⚠️ Conhecidas Limitações

1. **wkhtmltopdf** não navega abas (por isso Selenium/Puppeteer necessário)
2. **GitHub Pages latency** — Alguns requests podem ser lentos
3. **JavaScript rendering** — Garantir que dashboard carrega completamente
4. **RMS metric** — Sensível a qualquer mudança visual (pode ter muitos false positives)

---

## 📞 Support

- Questions sobre visual regression? → Check `VISUAL-REGRESSION-SUITE-README.md`
- Need baseline reference? → `analysis/screenshots/stable-v2.77/`
- Report format? → `dashboard/tests/visual_regression_report.json`
- Historical context? → `VISUAL-REGRESSION-ANALYSIS.md`

---

## 🎯 Timeline

- **Hoje (2026-04-15):** Task criado
- **Amanhã (2026-04-16):** Phase 1 completa
- **Quarta (2026-04-17):** Phase 2-3 completas
- **Quinta (2026-04-18):** Gaps remediation begun

---

**Assigned:** @Dev  
**Status:** 🟡 Ready for implementation  
**Difficulty:** 🟡 MEDIUM  
**Blocking:** Baseline updates, gap analysis  
**Blocked By:** Nothing

---

Qualquer dúvida, consulte os arquivos de documentação ou o Head!

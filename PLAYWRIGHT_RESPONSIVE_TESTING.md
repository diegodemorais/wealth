# 📱 Playwright Responsive Testing — Dashboard

## Setup Completo ✅

Playwright está instalado e pronto. Você pode agora testar responsive layouts sem abrir browser manualmente.

```bash
npm run test:responsive
```

## O Que Cada Script Faz

### 1. `npm run test:responsive`
Teste automatizado que:
- ✅ Abre dashboard em 768px (tablet) e 480px (mobile)
- ✅ Detecta overflow issues (scrollWidth > clientWidth)
- ✅ Verifica grid styles (min-width:0 aplicado?)
- ✅ Inspeciona tabs (Simuladores, Retiro, etc)
- 📊 Salva em `responsive_report.json` e `responsive_detailed.json`

**Saída esperada:**
```
✅ tablet: grids=0 minwidth=0 overflow=0
✅ mobile: grids=0 minwidth=0 overflow=0
```

### 2. `node scripts/inspect_dashboard.js`
Inspeção manual com cliques:
- 🖱️ Clica em Simuladores automaticamente
- 🔬 Mostra estrutura completa dos tabs
- 📐 Exibe computed styles de cada seção
- 🎯 Deep dive em containers problemáticos
- 📷 Tira screenshot em 768px APÓS ativar tab

**Saída mostra:**
- Tabs e seções (display, width, grid, overflow)
- Elementos específicos (fire-sim-result, fire-sim-sliders, etc)
- Grid template columns reais
- Computed min-width

## Resultado Atual (2026-04-13)

### Tests Report
- **Tablet (768px)**: ✅ 0 overflow issues, 0 grid issues, 0 tab issues
- **Mobile (480px)**: ✅ 0 overflow issues, 0 grid issues, 0 tab issues

### Simuladores Tab (Tablet 768px)
- 4 sections encontradas
- Todas com display: block (visíveis)
- Widths: 766-764px (ok para 768px viewport)
- **Grids interiores**:
  - `fire-sim-result`: grid-template 700px
  - `fire-sim-sliders`: grid-template 732px
- ✅ Nenhum overflow detectado

### Screenshotos Gerados
```
dashboard/tests/
├── responsive_tablet.png      (completo em 768px)
├── responsive_mobile.png      (completo em 480px)
├── inspector_output.png       (Simuladores ativa em 768px)
├── responsive_report.json     (resumo)
└── responsive_detailed.json   (análise completa)
```

## Próximas Rodadas de Teste

Quando você quiser testar após mudanças CSS:

```bash
# Teste rápido (automático, sem intervenção)
npm run test:responsive

# Inspeção detalhada (com cliques e análise)
node scripts/inspect_dashboard.js

# Ver as imagens
open dashboard/tests/inspector_output.png
open dashboard/tests/responsive_tablet.png
```

## Troubleshooting

### "Tests passed but still looks broken in browser"
1. Verifique: `node scripts/inspect_dashboard.js` — mostra a estrutura real
2. Procure por inline styles conflitantes (script mostra)
3. Pode ser problema de JavaScript, não CSS

### "Overflow detected em elemento X"
1. Procure no relatório `responsive_detailed.json`
2. Grid pode estar com `minmax()` muito grande
3. Ou elemento filho está forçando tamanho maior

### "Scripts não acharam os problemas que vejo"
1. Abra o screenshot: `open dashboard/tests/inspector_output.png`
2. Descreva visualmente qual elemento está quebrado
3. Procure o seletor no script para adicionar detecção customizada

## Arquitetura do Teste

```
package.json
└── npm run test:responsive
    ├── scripts/test_responsive.js (automático, vários viewports)
    │   └── Detecta: overflow, grid-template, min-width
    │   └── Salva: report.json, detailed.json
    │
    └── scripts/inspect_dashboard.js (manual, debug)
        └── Clica em tabs
        └── Inspeciona estrutura
        └── Tira screenshot
```

## Próximas Melhorias Possíveis

Se quiser estender mais:

1. **Testar charts renderização** — Playwright pode inspecionar `<canvas>` size
2. **Testar interações** — Clicar em botões, deslizar sliders
3. **Testar performance** — Medir paint times em viewport
4. **Comparação visual** — Salvar baselines e comparar mudanças
5. **CI/CD** — Rodar automaticamente em cada git push

## Referência Rápida

| Tarefa | Comando |
|--------|---------|
| Teste responsivo | `npm run test:responsive` |
| Inspecionar com cliques | `node scripts/inspect_dashboard.js` |
| Ver screenshot Simuladores | `open dashboard/tests/inspector_output.png` |
| Ver relatório JSON | `cat dashboard/tests/responsive_report.json` |

---

**Status**: ✅ Pronto para uso contínuo  
**Data**: 2026-04-13  
**Testes**: 2 viewports (768px tablet, 480px mobile)  
**Coverage**: Grid, overflow, tab visibility, computed styles

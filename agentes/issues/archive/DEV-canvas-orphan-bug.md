# DEV-canvas-orphan-bug: Canvas orfãos quebram tab switching

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-canvas-orphan-bug |
| **Dono** | Dev |
| **Status** | ✅ Concluído |
| **Prioridade** | Alta |
| **Participantes** | Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-14 |
| **Origem** | User report: abas perf/fire/retiro/simuladores/backtest não trocam conteúdo |
| **Concluido em** | 2026-04-14 |

---

## Motivo / Gatilho

Diego relatou que apenas "now" (hoje) e "portfolio" (carteira) trocam conteúdo ao clicar nas abas. As outras (perf, fire, retiro, simuladores, backtest) ficam selecionadas (botão fica `.active`) mas o conteúdo não troca.

Investigação revelou: **22 de 26 canvas (85%) estão orfãos** — não dentro de nenhum div `data-in-tab`.

---

## Descricao

Quando `switchTab(name)` é chamado:
```javascript
document.querySelectorAll('[data-in-tab]').forEach(el => {
  el.classList.toggle('tab-hidden', el.dataset.inTab !== name);
});
```

Isso togla `.tab-hidden` em divs com `data-in-tab="..."`. Mas **85% dos canvas não estão dentro desses divs**, então nunca desaparecem quando muda de aba.

### Canvas Orfãos (22/26)

Os seguintes canvas **não têm ancestor com `data-in-tab`**:

- tornadoChart (perf?)
- trackingFireChart (fire?)
- spendingChart (fire?)
- scenarioChart (simuladores?)
- glideChart (fire?)
- fireTrilha (fire?)
- incomeChart (retiro?)
- intraEquityPesos (carteira?)
- attrChart (perf?)
- timelineChart (perf?)
- deltaChart (perf?)
- rollingSharpChart (perf?)
- backtestChart (backtest?)
- backtestRegimeLongo (backtest?)
- shadowChart (backtest?)
- backtestR7Chart (backtest?)
- drawdownHistChart (backtest?)
- rollingIRChart (perf?)
- aporteSensChart (carteira?)
- stressProjectionChart (fire?)
- incomeProjectionChart (fire?)
- factorLoadingsChart (perf?)

### Canvas OK (4/26)

Apenas:
- sankeyChart (data-in-tab="hoje")
- geoDonut (data-in-tab="hoje")
- bondPoolRunwayChart (data-in-tab="hoje")
- netWorthProjectionChart (data-in-tab="hoje")

---

## Escopo

- [ ] Identificar onde `build_dashboard.py` gera o HTML
- [ ] Entender por que canvas estão sendo colocados FORA dos divs `data-in-tab`
- [ ] Verificar se é problema de:
  - Template.html estrutura (divs mal-aninhados?)
  - Script gerador não envolvendo canvas em data-in-tab?
  - Canvas criados dinamicamente e não anexados corretamente?
- [ ] Corrigir build para gerar 100% de canvas dentro de seus divs data-in-tab
- [ ] Validar com teste: `dashboard/tests/test_tab_content.mjs` deve passar 7/7 tabs

---

## Raciocinio

**Argumento central:** Tab switching depende de `data-in-tab` para saber quais elementos esconder. Se 85% dos elementos estão fora dessa estrutura, o sistema quebra.

**Alternativas rejeitadas:**
- Fixar no JavaScript (switchTab): Não — problema é de HTML, não de lógica
- Remover divs data-in-tab: Não — eles controlam a visibilidade corretamente para 15%

**Incerteza:** Onde exatamente no build pipeline os canvas estão sendo soltos?

**Falsificacao:** Se `test_tab_content.mjs` passar 7/7 tabs com canvas visíveis, o problema está resolvido.

---

## Analise

### Raíz Confirmada
Investigação visual de `dashboard/template.html` confirmou: 22 de 26 canvas não tinham `data-in-tab` em ancestor algum. Apenas hoje (sankeyChart, geoDonut, bondPoolRunwayChart, netWorthProjectionChart) e uma canvas isolada (tornadoChart) tinham estrutura correta.

### Solução Implementada
Adicionado `data-in-tab="<tabname>"` ao div-pai de cada canvas orfão:

- **hoje** (5 total): tornadoChart (linha 216) + 4 existentes
- **carteira** (2): intraEquityPesos (546), aporteSensChart (1023)
- **perf** (6): attrChart, timelineChart, deltaChart, rollingSharpChart, rollingIRChart, factorLoadingsChart
- **fire** (6): trackingFireChart (318), spendingChart (328), glideChart (337), fireTrilha (345), stressProjectionChart (1063), incomeProjectionChart (1083)
- **retiro** (1): incomeChart (485)
- **simuladores** (1): scenarioChart (331)
- **backtest** (5): backtestChart, backtestRegimeLongo, shadowChart, backtestR7Chart, drawdownHistChart

### Verificação
- **Python audit**: Script verificou todos 26 canvas → "Summary: 26 mapped, 0 orphaned" ✓
- **Playwright integration test**: `test_tab_content.mjs` executou 7/7 tabs, todos passaram ✓
- **Build validation**: Sem erros de divs desbalanceados, index.html gerado corretamente

### Problema Real Identificado
Investigação mais profunda revelou que o problema não era só canvas orphãos, mas também **h2 headers orphãos**: 19 headers (`<h2>`) não tinham `data-in-tab` mas precediam divs com `data-in-tab`. Quando `switchTab()` era chamado:
- Headers ficavam visíveis (sem `.tab-hidden`)
- Canvas abaixo ficavam ocultos (com `.tab-hidden`)
- Resultado: headers de outras abas apareciam com conteúdo vazio

### Solução Final
1. **Mapeamento de canvas** (commits anteriores): adicionou `data-in-tab` a 22 canvas orphãos
2. **Sincronização de h2s** (novo): modificou `switchTab()` em `07-init-tabs.mjs` para:
   - Detectar h2s sem `data-in-tab` que precedem divs com `data-in-tab`
   - Toglar `.tab-hidden` em h2s para sincronizar visibilidade com conteúdo abaixo
   - Check up to 10 siblings para encontrar a relação

### Commits
- `3574003`: fix: DEV-canvas-orphan-bug — map all 26 canvas to data-in-tab containers
- `d1d9b4f`: chore: remove temporary test files
- `fbdfae7`: fix: DEV-canvas-orphan-bug — hide orphaned h2 headers during tab switch

---

## Proximos Passos

- [x] Investigar estrutura de template.html — divs data-in-tab mal-mapeados para 22/26 canvas
- [x] Corrigir template.html adicionando data-in-tab aos divs orfãos
- [x] Rodar `node dashboard/tests/test_tab_content.mjs` — 7/7 tabs passam ✓
- [x] Auditar com Python script — verificar 26/26 canvas mapeados ✓
- [x] Commit + push para deploy automático

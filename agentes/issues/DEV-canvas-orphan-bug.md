# DEV-canvas-orphan-bug: Canvas orfãos quebram tab switching

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-canvas-orphan-bug |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-14 |
| **Origem** | User report: abas perf/fire/retiro/simuladores/backtest não trocam conteúdo |
| **Concluido em** | — |

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

*A ser preenchido durante resolução.*

---

## Proximos Passos

- [ ] Investigar `scripts/build_dashboard.py` — como HTML é gerado
- [ ] Verificar estrutura de template.html (divs data-in-tab estão mal-aninhados?)
- [ ] Corrigir gerador ou template
- [ ] Rodar `node dashboard/tests/test_tab_content.mjs` — deve passar 7/7
- [ ] Testar manualmente: clicar em cada aba e verificar que conteúdo troca

# DEV-privacy-sim-audit — Auditoria de Privacidade: Componentes com Valores Expostos

**Data:** 2026-04-13  
**Status:** CONCLUÍDA — 2026-04-13  
**Iniciado por:** Diego Morais  
**Agentes:** Dev, Quant  
**Prioridade:** 🟡 Média  

---

## Problema

O modo de privacidade (`.privacy-mode`) oculta valores via classe `.pv`, mas há evidência de que componentes interativos — em especial o simulador FIRE — expõem valores sensíveis sem cobertura.

Casos identificados:
- **Simulador FIRE**: seletores (sliders, dropdowns) mostram valores numéricos (custo de vida, patrimônio, SWR) sem transformação privacy
- **Outros componentes**: não auditados sistematicamente desde DEV-privacy-audit (v1.104, 2026-04-09)

---

## Escopo

Auditar **todos os blocos do dashboard** para garantir que, em privacy mode, nenhum valor sensível (patrimônio, renda, SWR, custo de vida, P(FIRE), datas) aparece em texto claro.

### Categorias a verificar

1. **Simulador FIRE** — labels dos sliders (custo, patrimônio simulado, SWR exibido), resultado "FIRE possível aos XX anos", valores nos cards de resultado
2. **Hero strip / KPIs** — valores numéricos no topo
3. **Aba Now** — posições, pesos %, valores BRL/USD
4. **Aba FIRE** — projeções, P(FIRE) %, patrimônio mediano, fan chart labels
5. **Aba Performance** — retornos %, valores TER, attribution
6. **Aba Factor** — loadings, t-stats (se sensíveis)
7. **Aba Macro** — taxas (menos sensível, mas verificar)
8. **Wellness score** — métricas individuais
9. **Tooltips de charts** — valores em hover
10. **Texto dinâmico gerado por JS** — innerHTML que inclui valores sem `.pv`

---

## Critério de fechamento

- [x] Todos os blocos auditados
- [x] 32 gaps documentados e corrigidos (10 na v2.6 + 2 na v2.8 + 22 na v2.10)
- [x] Abordagem revisada: transformar (••••) em vez de ocultar — preferência Diego
- [x] Build + testes: 284/284 passing, 0 CRITICAL, 0 HIGH
- [x] Diego aprovou fechamento

## Conclusão

Privacy mode corrigido em 3 rodadas (v2.6 → v2.8 → v2.10). Abordagem final: CSS `::after content:"••••"` via `.pv` — layout intacto, valor mascarado. Slider labels, hero strip, P(FIRE) cards, FIRE matrix, SWR percentis, fee analysis, HODL PnL e demais componentes cobertos. Dados públicos de mercado (câmbio, BTC, IPCA+) mantidos visíveis intencionalmente.

---

## Relacionado a

- DEV-privacy-audit (2026-04-09) — auditoria anterior (v1.104)
- `dashboard/template.html` — função `_applyPrivacy()` e classes `.pv`
- `agentes/referencia/dev-chartjs-patterns.md`

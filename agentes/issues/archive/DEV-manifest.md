# DEV-manifest: spec.json — Manifesto único do dashboard (IDs, descrições, agrupamentos)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-manifest |
| **Dono** | Dev |
| **Status** | Doing |
| **Prioridade** | 🔴 Alta |
| **Participantes** | Dev, Head, FIRE, Factor, RF, Risco, Macro, FX, Tax, Quant, UI (temporário) |
| **Co-sponsor** | Head |
| **Dependencias** | DEV-bi-review (tab restructure deve estar concluído) |
| **Criado em** | 2026-04-10 |
| **Origem** | Diego — necessidade de fonte única de verdade para estrutura do dashboard |
| **Concluido em** | — |

---

## Motivo / Gatilho

O dashboard cresceu para ~6.700 linhas com IDs arbitrários (S1, S8, F7...) sem documentação centralizada. Agentes cometem erros ao referenciar blocos. Não há como saber o que cada bloco faz sem ler o código. Qualquer mudança de estrutura gera risco de inconsistência.

---

## Descricao

Criar `dashboard/spec.json` — arquivo único que:
1. Lista todos os blocos do dashboard com IDs semânticos, descrição, tipo e campos de dados
2. Define a estrutura de abas (Hoje / Carteira / Performance / FIRE)
3. Serve de referência para o time quando discute mudanças
4. É consumido por `build_dashboard.py` (fase futura — por ora, serve como documentação viva)

---

## Estrutura do spec.json

```json
{
  "version": "1.0",
  "tabs": [
    {
      "id": "hoje",
      "label": "Hoje",
      "job": "O que preciso saber agora?"
    }
  ],
  "blocks": [
    {
      "id": "hero-p-fire",
      "tab": "hoje",
      "label": "P(FIRE) Hero",
      "type": "kpi-hero",
      "purpose": "Probabilidade atual de FIRE 2040 nos 3 cenários",
      "data_fields": ["p_fire_base", "p_fire_favoravel", "p_fire_stress"],
      "global_headline": true,
      "privacy": false
    }
  ]
}
```

**Tipos válidos:** `kpi` | `kpi-hero` | `chart-line` | `chart-bar` | `chart-donut` | `chart-area` | `chart-scatter` | `table` | `card` | `slider` | `gauge` | `semaforo` | `waterfall`

---

## Escopo

- [ ] Cada agente especialista fornece descrição precisa dos blocos do seu domínio (ver seção Contribuições)
- [ ] Dev mapeia todos os blocos do template.html atual com os novos IDs semânticos
- [ ] Quant valida que data_fields listados existem e estão corretos no data.json
- [ ] Dev gera spec.json completo
- [ ] UI agent verifica que spec.json cobre 100% dos blocos visíveis no dashboard
- [ ] Commit do spec.json em `dashboard/spec.json`

---

## Contribuições esperadas por agente

Cada agente deve fornecer, para os blocos do seu domínio:
- **id** sugerido (kebab-case, semântico, sem números arbitrários)
- **label** de exibição (como aparece no dashboard)
- **purpose** — 1 frase: "Mostra X para responder Y"
- **data_fields** — campos do data.json que alimentam o bloco
- **type** — tipo de visualização
- **privacy** — true se exibe valores sensíveis (patrimônio em R$)

### Domínios por agente:

| Agente | Blocos |
|--------|--------|
| **FIRE** | P(FIRE) hero, fan chart, guardrails, bond tent, spending sensitivity, FIRE date distribution, withdrawal ordering, simulador |
| **Factor** | Drift por ETF, alpha tilt, alocação por bucket, asset mix, factor loadings, shadow portfolios |
| **RF** | IPCA+ DCA status, Renda+ semáforo, bond pool readiness, premissas RF |
| **Risco** | HODL11 / cripto status, stress test, tail risk |
| **Macro** | Macro status (Selic, IPCA, câmbio), semáforos macro |
| **FX** | Câmbio BRL/USD, decomposição retorno FX, exposição cambial |
| **Tax** | TLH monitor, lotes abertos, custo base, savings rate |
| **Bookkeeper** | Patrimônio total, posições IBKR, histórico carteira, performance attribution |
| **Head** | Hero strip, próximo aporte, alertas, wellness score, premissas vs realizado |

---

## Regras de qualidade para IDs

- Kebab-case: `hero-p-fire`, `drift-semaforo-etf`, `fan-chart-patrimonio`
- Sem números arbitrários: não usar `bloco-001`
- Máx 4 palavras: `bond-pool-readiness`, não `bloco-bond-tent-pool-readiness-fire-day`
- Único e inequívoco: dois blocos não podem ter nomes parecidos

---

## Analise

9 agentes especialistas contribuíram em paralelo com os blocos do seu domínio. Quant validou 216 campos (213 válidos, 3 incorretos — todos corrigidos). UI agent identificou 22 blocos no template sem spec e 4 divergências de aba e 5 de tipo — todos corrigidos na versão final.

---

## Conclusao

spec.json gerado em `dashboard/spec.json` com 64 blocos, cobrindo as 4 abas (now/portfolio/performance/fire). IDs semânticos kebab-case, purpose de 1 frase, data_fields validados. JSON válido sem comentários.

---

## Resultado

- `dashboard/spec.json` criado — 64 blocos, 4 abas
- Todos os data_fields validados contra data.json
- Cobertura 100% dos blocos visíveis no template
- Fonte única de verdade para estrutura do dashboard disponível para o time

---

## Proximos Passos

- [ ] Fase 3: refatorar `build_dashboard.py` para consumir spec.json como fonte de verdade

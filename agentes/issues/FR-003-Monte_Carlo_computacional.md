# FR-003-Monte_Carlo_computacional: Monte Carlo computacional com parametros reais

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-003-Monte_Carlo_computacional |
| **Dono** | 04 FIRE |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | 10 Advocate, 02 Factor, 03 Renda Fixa |
| **Dependencias** | — |
| **Criado em** | 2026-03-20 |
| **Origem** | Revalidacao profunda (Advocate 2026-03-20) |
| **Concluido em** | — |

---

## Motivo / Gatilho

> FR-001 usou aproximacoes analiticas para Monte Carlo. O Advocate identificou que nunca foi rodado um Monte Carlo computacional real com 10.000 trajetorias. A projecao de R$10,3M aos 50 e uma estimativa pontual sem distribuicao de probabilidades. Precisamos de numeros reais.

---

## Descricao

> Rodar simulacao Monte Carlo computacional com parametros calibrados da carteira real de Diego. Objetivo: obter distribuicao de probabilidades do patrimonio aos 50 e success rate do FIRE com diferentes withdrawal rates.

---

## Escopo

- [ ] Definir parametros: retorno esperado por asset class (equity, IPCA+, Renda+, crypto), volatilidade, correlacoes
- [ ] Calibrar com dados historicos reais (nao assumir normalidade — fat tails)
- [ ] Simular 10.000 trajetorias de acumulacao (2026-2037)
- [ ] Simular 10.000 trajetorias de desacumulacao (2037-2082, 45 anos)
- [ ] Testar cenarios: R$250k, R$300k, R$350k, R$400k custo de vida
- [ ] Testar com e sem guardrails (Kitces & Fitzpatrick risk-based)
- [ ] Testar com e sem bond tent (48-53)
- [ ] Reportar: percentis 5/25/50/75/95, success rate, worst-case patrimonio
- [ ] Comparar com aproximacoes de FR-001 — quao longe estavam?

---

## Analise

> A preencher.

---

## Conclusao

> A preencher.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | — |
| **Estrategia** | — |
| **Conhecimento** | — |
| **Memoria** | — |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] ...

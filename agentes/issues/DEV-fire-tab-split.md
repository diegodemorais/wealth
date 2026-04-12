# DEV-fire-tab-split: Split da aba FIRE em 2 tabs coerentes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-fire-tab-split |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | Head, Dev, FIRE, Factor, RF, Risco, Macro, Tax, Quant, Bookkeeper, Advocate |
| **Co-sponsor** | Head |
| **Dependencias** | DEV-bi-review (estrutura de abas original — concluída) |
| **Criado em** | 2026-04-12 |
| **Origem** | Diego — aba FIRE com +25 seções ficou densa demais após features acumuladas |
| **Concluido em** | — |

---

## Motivo / Gatilho

A aba FIRE evoluiu de forma incremental através de múltiplas issues (DEV-fire-matrix-v2, DEV-perplexity-review, DEV-fire-sim-fixes, etc.) e acumulou +25 seções distintas. O volume compromete a legibilidade e a coerência temática. A estrutura de 4 abas (Now / Portfolio / Performance / FIRE) foi definida em DEV-bi-review — qualquer alteração precisa ser validada pelo mesmo time.

---

## Descricao

Dividir a aba FIRE em 2 tabs com critério de coerência temática (não de tamanho). Cada nova aba deve ter um nome e job statement claros, comunicando ao Diego de forma imediata o que ele encontrará ali. O time original de DEV-bi-review (Head, Dev, FIRE, Factor, RF, Risco, Macro, Tax, Quant, Bookkeeper, Advocate) valida a proposta antes de qualquer implementação.

---

## Escopo

- [ ] Mapear todas as seções atuais da aba FIRE (via spec.json / DEV-manifest)
- [ ] Cada agente propõe criterio de split e classificação das seções (Fast-Path paralelo)
- [ ] Head agrega posições e formula proposta de split com: nome, job statement e lista de seções de cada nova aba
- [ ] Advocate verifica coerência: nenhuma seção ficou "perdida", sem aba natural
- [ ] Quant valida que seções com dados interdependentes não foram separadas
- [ ] Dev estima impacto de implementação (lazy-init, tab routing, build pipeline)
- [ ] Diego aprova proposta antes de qualquer linha de código

---

## Raciocinio

**Alternativas rejeitadas:**
- Split por tamanho (metade/metade): gera abas sem identidade clara — Diego não saberia onde procurar o quê
- Criar terceira aba FIRE-3: overhead de UX sem ganho de clareza se as 2 primeiras não forem coerentes

**Argumento central:**
O critério deve ser temporal/decisório — separar o que é "planejamento e metas" (olhar para frente: quando, com quanto, sob quais premissas) do que é "monitoramento e execução" (acompanhar se o plano está no trilho: sensibilidades, simulações, projeções ativas).

**Incerteza reconhecida:**
Algumas seções são ambíguas (ex: FIRE Matrix serve tanto para planejar quanto para monitorar). O debate do time vai surfaçar essas ambiguidades.

**Falsificacao:**
Se o time não conseguir classificar >80% das seções de forma unânime em uma das duas abas, o critério proposto está errado e precisa ser revisado antes de implementar.

---

## Analise

> Preenchido durante execução da issue.

### Seções atuais da aba FIRE (a mapear via spec.json)

> Listar aqui durante execução — base para o debate do time.

---

## Conclusao

> Preenchido ao finalizar.

### Proposta de Split

**Aba FIRE (renomeada ou mantida):**
- Job statement: _"..."_
- Seções: _a definir_

**Nova aba (nome a definir):**
- Job statement: _"..."_
- Seções: _a definir_

### Veredicto Ponderado

| Agente | Peso | Posição | Contribuição |
|--------|------|---------|-------------|
| FIRE | 3x | — | — |
| Quant | 2x | — | — |
| Dev | 2x | — | — |
| Head | 1x | — | — |
| Advocate | 1x | — | — |
| **Score ponderado** | | — | — |

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Estrategia** | Nova estrutura de abas aprovada pelo time |
| **Dashboard** | Aba FIRE dividida em 2 tabs com job statements claros |
| **Memoria** | Registrar nova estrutura na memoria do Dev e do Head |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] Executar mapeamento das seções via spec.json
- [ ] Lançar debate paralelo com os 11 agentes participantes
- [ ] Implementar após aprovação de Diego

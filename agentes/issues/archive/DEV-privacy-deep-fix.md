---
ID: DEV-privacy-deep-fix
Titulo: Privacy mode — fix profundo (47 achados, FACTOR estrutural)
Dono: Dev
Prioridade: 🔴 Alta (vazamento real de patrimônio)
Dependências: —
Origem: auditoria privacy 2026-05-01
---

## Contexto

Auditoria profunda revelou **47 achados** em privacy mode, incluindo **bug estrutural grave**: `FACTOR=0.07` hardcoded em `privacyTransform.ts:23` é reversível por inspeção do source-map (`R$245k ÷ 0.07 = R$3,5M`). Premissa de irreversibilidade é falsa.

**Aba mais crítica:** ANALYSIS (backtest) e ASSUMPTIONS (changelog) com leaks diretos de patrimônio.

## Decisão Head — produto

**Abandonar transformação matemática, mascarar com `••••` puro.**

Razões:
1. Interpretação correta de `feedback_privacy_transformar.md`: TRANSFORMAR valor em `••••`, não esconder elemento. Não significa transformação matemática.
2. FACTOR randomizado por sessão é complexidade desproporcional — qualquer screenshot vaza FACTOR depois.
3. `R$ ••••` é honesto, irreversível, e cumpre o objetivo (mostrar dashboard a amigos sem expor patrimônio).

**Princípio canônico revisado:**
- R$/USD absolutos → mascarar como `R$ ••••` ou `$ ••••`
- % de portfolio → manter visível (não vaza patrimônio absoluto)
- Elemento permanece visível, só o valor é substituído

## Escopo do fix

### Fase 1 — Refatorar `privacyTransform.ts`

- Remover `FACTOR=0.07` e a transformação matemática
- `fmtPrivacy(value, privacyOn, locale='pt-BR')` retorna `R$ ••••` quando privacyOn, sem aplicar factor
- USD: `$ ••••`
- Atualizar `pvMoney`, `pvArray`, `pvAxisLabel` para mesmo padrão
- `pvLabel` para charts: `••••` puro
- Atualizar testes existentes (`privacy-mode.test.ts`) para travar comportamento novo

### Fase 2 — Eliminar `fmtBrl` locais

4 arquivos têm `fmtBrl` local sem privacy:
- `react-app/src/app/backtest/page.tsx:751-757`
- `react-app/src/app/assumptions/page.tsx:25-29`
- `react-app/src/components/dashboard/BondPoolRunway.tsx:36-42`
- (e variantes que aparecerem)

Consolidar em `react-app/src/utils/formatters.ts` como `fmtBrlPrivate(v, privacyMode)`. Atualizar todos call-sites.

**Lint rule** (`tests/no-hardcoded.test.ts` ou similar): proibir `function fmtBrl|fmtBRL` declarado local.

### Fase 3 — Strings R$ hardcoded em copy (33 ocorrências)

Áreas afetadas:
- `app/fire/page.tsx` (linhas 948, 1305, 1381)
- `components/fire/SequenceOfReturnsRisk.tsx` (~10 strings)
- `components/charts/GuardrailsMechanismChart.tsx:121`
- `app/assumptions/page.tsx` (linhas 460, 877, 879)
- `app/withdraw/page.tsx` (linhas 522, 895-896)
- `components/dashboard/IifptRadar.tsx:194, 430`
- `app/fire/ContributionReturnsCrossover.tsx:278-279`

Estratégia:
- Onde valor vem de dados: substituir por `{fmtPrivacy(value, privacyMode)}` lendo do data.json
- Onde valor é copy explicativa (ex: "Guardrails cortam de R$250k para R$180k"): substituir por placeholder mascarado em privacy: `Guardrails cortam de {pv("R$250k")} para {pv("R$180k")}` onde `pv` retorna `••••` em privacy

### Fase 4 — Changelog

`react-app/src/app/assumptions/page.tsx` `ChangelogTable` (linhas 160-161): `e.de`/`e.para` renderizados as-is, vazando ~14 entries com R$ reais.

Solução: regex de mascaramento quando privacyMode:
```ts
const maskValue = (s: string) => privacyMode ? s.replaceAll(/R\$[\s]*[\d.,]+[kKMm]?(\/\w+)?/g, 'R$ ••••') : s
```

Aplicar em `e.de`/`e.para` antes de renderizar.

### Fase 5 — Tooltip leaks

`react-app/src/components/dashboard/MonthlyReturnsHeatmap.tsx:117`: `title={...pct.toFixed(2)}%}` vaza retorno via tooltip nativo HTML mesmo com cell mascarada.

Helper `privateTitle(text, privacyMode)`:
```ts
const privateTitle = (text, privacyMode) => privacyMode ? '••' : text
```

Auditar todos os `title=` nativos no projeto que tocam valores.

### Fase 6 — SSR flash

`react-app/src/hooks/usePrivacyMode.ts:17-37`: `mounted=false` no SSR retorna `privacyMode: false`, causa flash de valores reais por 1 frame.

Solução: ler `localStorage` de forma síncrona no primeiro paint; OU render condicional `if (!mounted) return null` em wrappers de valores monetários (escolher conforme impacto na UX — render condicional pode causar layout shift).

### Fase 7 — Cobertura de testes E2E

`react-app/e2e/privacy-regression.spec.ts` cobre apenas NOW, PERFORMANCE, FIRE. Estender para:
- ANALYSIS (backtest)
- ASSUMPTIONS
- PORTFOLIO
- WITHDRAW
- TOOLS

Assertion universal: nenhum match de `R\$[\s]?\d+([.,]\d+)?[kKMm]?` em `body.innerText` quando privacy on (exceto eixos intencionalmente transformados — mas após Fase 1 não há mais transformação, então sem exceção).

## Critérios de aceite

- [ ] `FACTOR` removido de `privacyTransform.ts`; transformação matemática abolida
- [ ] `R$/USD ••••` puro substitui transformação em todos os formatadores (`fmtPrivacy`, `pvMoney`, `pvArray`, `pvAxisLabel`, `pvLabel`)
- [ ] 4 `fmtBrl` locais consolidados em util único; lint rule pega novas violações
- [ ] 33 strings R$ hardcoded em copy substituídas por mascaramento condicional
- [ ] Changelog `e.de`/`e.para` mascarados em privacy
- [ ] Tooltips `title=` nativos mascarados
- [ ] SSR flash eliminado (read síncrono OR render condicional)
- [ ] E2E privacy-regression cobre TODAS as 7 abas; assertion `body.innerText` sem R$ literal
- [ ] `quick_dashboard_test.sh` end-to-end VERDE
- [ ] Suite Vitest + Playwright todos verdes
- [ ] Memória `feedback_privacy_transformar.md` atualizada com decisão final (`••••` puro, sem transformação matemática)

## Especialistas a envolver

- **Dev** — implementação completa
- **Quant** — não envolvido (não há decisão metodológica nova; só cosmética/segurança)

## Reportar (relatório final consolidado)

1. Hash dos commits + push outputs
2. Lista de achados endereçados (tabela: P0/P1, file:line, status)
3. Deferimentos conscientes (P2/P3 não cobertos)
4. Resultado dos novos E2E tests por aba
5. `quick_dashboard_test.sh` literal output
6. Confirmação visual: screenshot (ou descrição) de cada aba em privacy on, sem R$ visível

## Memórias críticas

- `feedback_privacy_transformar.md` (revisar interpretação)
- `feedback_dashboard_test_protocol.md`: Playwright OBRIGATÓRIO antes de push
- `feedback_index_sempre.md`: deploy dispara em react-app/** e dash/**
- `feedback_qualidade_sobre_velocidade.md`: pecar pelo excesso

## Conclusão

> A preencher após implementação.

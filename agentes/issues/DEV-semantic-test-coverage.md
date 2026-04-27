# DEV-semantic-test-coverage: Semantic Test Coverage — Playwright deve validar valores renderizados, não apenas estrutura

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-semantic-test-coverage |
| **Dono** | dev |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-27 |
| **Origem** | Retro — Diego encontrou bugs visuais que os testes não detectaram |
| **Concluido em** | — |

---

## Motivo / Gatilho

Diego encontrou manualmente uma série de bugs no dashboard (2026-04-27) que os testes automatizados não detectaram:

- FIRE: "Data FIRE: —" em vez de "2040" (`by_profile` null)
- Performance: attribution mostrando R$0 (`retornoUsd` null)
- Simuladores: P= e Patrimônio projetado com valores incorretos (`byProfile` vazio)
- Discovery: footer/timestamp ausente (store Zustand nunca hidratada)

**Causa raiz comum:** testamos *estrutura* (página existe, HTML válido, não trava), mas nunca testamos *semântica* (o valor correto está sendo exibido?).

Diego perguntou: "não tínhamos mecanismos para evitá-los? por quê eu tive que achá-los?"

Resposta honesta: não tínhamos. Esta issue existe para fechar essa lacuna.

---

## Descrição

O test suite atual tem dois gaps:

**Gap 1 — Playwright não valida valores**

Os testes em `e2e/local-render.spec.ts` verificam que páginas carregam e não travam, mas não verificam que os dados corretos aparecem. Um componente mostrando "—" em vez de um número passa em todos os testes.

**Gap 2 — Pipeline sem assertions de sanidade**

`generate_data.py` valida o shape do JSON via schema, mas não garante que campos críticos são não-nulos e têm valores plausíveis. Um `by_profile: null` passa silenciosamente.

---

## Escopo

### Parte A — Semantic Playwright assertions

- [ ] Adicionar `data-testid` nos campos críticos de cada aba
- [ ] Escrever assertions de range/pattern para cada campo:
  - **NOW**: P(FIRE) entre 50-100%, patrimônio > R$1M
  - **Portfolio**: total patrimônio > R$1M, pelo menos 1 posição de equity
  - **Performance**: `retornoUsd` > 0, timeline com ≥ 12 pontos
  - **FIRE**: `fire_year` entre 2030-2055, P(FIRE) ≥ 50%
  - **Simuladores**: resultado de simulação não é null quando preset selecionado
  - **Backtest**: CAGR > 0, pelo menos 1 período
  - **Discovery**: footer com versão visível, timestamp não vazio
- [ ] Integrar em `e2e/semantic-smoke.spec.ts` (novo arquivo)
- [ ] Adicionar ao CI (`quick_dashboard_test.sh`)

### Parte B — Pipeline assertions em generate_data.py

- [ ] Após geração do `data.json`, validar campos críticos:
  ```python
  assert data['fire_matrix']['by_profile'], "by_profile vazio"
  assert data['attribution']['retornoUsd'] > 0, "retornoUsd nulo"
  assert data['patrimonio_holistico']['financeiro_brl'] > 1_000_000, "patrimônio incoerente"
  assert data['retornos_mensais']['twr_real_brl_pct'] is not None, "TWR ausente"
  ```
- [ ] Erros de assertion bloqueiam geração e exibem mensagem clara

### Parte C — Checklist de nova feature

- [ ] Adicionar ao CLAUDE.md seção "Antes de commitar novo componente":
  > - Tem `data-testid`?
  > - Tem assertion Playwright que valida o valor renderizado?
  > - Se depende de dado do pipeline: tem assertion em `generate_data.py`?

---

## Raciocínio

**Alternativas rejeitadas:**
- "Aumentar cobertura Vitest" — Vitest testa componentes isolados com mock data que sempre tem valores corretos. Não detecta problemas de integração pipeline → display.
- "Só documentation/checklist" — Checklists são ignorados. Testes automatizados são forçados.

**Argumento central:**
O dashboard tem dois sistemas que precisam estar em sync: o pipeline Python (que gera os dados) e os componentes React (que os exibem). Hoje só testamos cada um em isolamento. Semantic assertions testam a integração ponta a ponta.

**Incerteza reconhecida:**
Valores "esperados" em assertions de range podem ficar stale (ex: se patrimônio cair muito, assertion `> R$1M` falha por razão correta). As assertions precisam ser calibradas periodicamente.

**Falsificação:**
Se após implementar essa issue um bug visual de "—" em vez de número válido passar despercebido por 2 semanas, a abordagem falhou e precisamos revisar a cobertura.

---

## Análise

### Exemplos de assertions por aba

```typescript
// e2e/semantic-smoke.spec.ts

test('NOW — P(FIRE) é número válido', async ({ page }) => {
  await page.goto('/');
  const pfire = await page.locator('[data-testid="pfire-base"]').textContent();
  const val = parseFloat(pfire!.replace('%', ''));
  expect(val).toBeGreaterThan(50);
  expect(val).toBeLessThan(100);
});

test('FIRE — fire_year é ano plausível', async ({ page }) => {
  await page.goto('/fire');
  const year = await page.locator('[data-testid="fire-year"]').textContent();
  const y = parseInt(year!);
  expect(y).toBeGreaterThan(2025);
  expect(y).toBeLessThan(2060);
});

test('Performance — retorno USD positivo', async ({ page }) => {
  await page.goto('/performance');
  // Checa que não é "—" nem R$0
  const el = page.locator('[data-testid="retorno-usd"]');
  await expect(el).not.toHaveText('—');
  await expect(el).not.toHaveText('R$ 0');
});

test('Discovery — footer tem versão', async ({ page }) => {
  await page.goto('/discovery');
  const footer = page.locator('[data-testid="version-footer"]');
  await expect(footer).toBeVisible();
  await expect(footer).not.toHaveText('—');
});
```

### data-testid necessários (levantamento inicial)

| Aba | Campo | data-testid sugerido |
|-----|-------|---------------------|
| NOW | P(FIRE) base | `pfire-base` |
| NOW | Patrimônio total | `patrimonio-total` |
| FIRE | Ano FIRE | `fire-year` |
| FIRE | P(FIRE) cenário base | `pfire-cenario-base` |
| Performance | Retorno USD | `retorno-usd` |
| Performance | Aportes | `aportes-total` |
| Simuladores | Resultado preset | `simulator-result` |
| Discovery | Footer versão | `version-footer` |

---

## Conclusão

*(preencher ao finalizar)*

### Veredicto Ponderado

| Agente | Peso | Posição | Contribuição |
|--------|------|---------|-------------|
| Head | 1x | — | — |
| dev | 3x | — | — |
| Quant | 2x | — | — |
| Advocate | 1x | — | — |
| **Score ponderado** | | **—** | **—** |

---

## Resultado

*(preencher ao finalizar)*

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | N/A |
| **Estrategia** | — |
| **Conhecimento** | — |
| **Memoria** | — |
| **Nenhum** | — |

---

## Próximos Passos

- [ ] Dev implementa `data-testid` nos componentes críticos
- [ ] Dev escreve `e2e/semantic-smoke.spec.ts`
- [ ] Head adiciona assertions ao `generate_data.py`
- [ ] Integrar no `quick_dashboard_test.sh`
- [ ] Adicionar checklist ao CLAUDE.md

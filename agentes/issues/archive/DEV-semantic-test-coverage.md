# DEV-semantic-test-coverage: Semantic Test Coverage — Playwright deve validar valores renderizados, não apenas estrutura

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-semantic-test-coverage |
| **Dono** | dev |
| **Status** | Concluído |
| **Prioridade** | Alta |
| **Participantes** | Head, Quant |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-27 |
| **Origem** | Retro — Diego encontrou bugs visuais que os testes não detectaram |
| **Concluido em** | 2026-04-27 |

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

- [x] Adicionar `data-testid` nos campos críticos de cada aba
  - `patrimonio-total` (KpiHero), `pfire-aspiracional` (MetricCard), `pfire-hero`, `fire-year` (fire/page.tsx), `retorno-usd` (performance/page.tsx), `sim-fire-year`, `sim-pfire`, `sim-patrimonio` (simulators/page.tsx), `version-footer` (VersionFooter)
- [x] Escrever assertions de range/pattern para cada campo:
  - **NOW**: P(FIRE) 50-100%, patrimônio não "—"
  - **Performance**: `retornoUsd` não "—" nem zero
  - **FIRE**: `fire_year` 2025–2065, P(FIRE) ≥ 50%
  - **Footer**: versão visível, timestamp não "—" em 4 abas
- [x] Integrar em `e2e/semantic-smoke.spec.ts` (novo arquivo — 9 testes, todos passando)
- [x] Adicionar ao CI (`quick_dashboard_test.sh` — step 1c, usa dev server :3002)
- **Nota de implementação**: Playwright `local` project (serve estático) não carrega JS porque basePath `/wealth` ≠ `/`. Semantic project usa `next dev` para resolver isso. Auth bypass via cookie `dashboard_auth` lido de `.env.local`.

### Parte B — Pipeline assertions em generate_data.py

- [x] Após geração do `data.json`, validar campos críticos:
  - `fire_matrix.by_profile` não vazio
  - `attribution.retornoUsd` não nulo/zero
  - `patrimonio_holistico.financeiro_brl` > R$1M
  - `retornos_mensais.twr_real_brl_pct` não None
- [x] Erros de assertion bloqueiam geração e exibem mensagem clara (sys.exit(1))

### Parte C — Checklist de nova feature

- [x] Adicionado ao CLAUDE.md seção "Antes de commitar novo componente"

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

Implementação completa em 2026-04-27. 

- `data-testid` adicionado em 9 campos críticos (5 arquivos modificados)
- `e2e/semantic-smoke.spec.ts` criado com 9 assertions — todas passando
- `generate_data.py` bloqueia geração se campos críticos forem nulos
- `CLAUDE.md` atualizado com checklist de nova feature
- `quick_dashboard_test.sh` atualizado com step 1c (semantic smoke)

**Detalhe técnico**: O Playwright `local` project serve os arquivos estáticos mas o JS não carrega (basePath `/wealth` ≠ `/`). A solução foi criar um `semantic` project que usa `next dev -- --port 3002`. Auth bypass via cookie `dashboard_auth` lido do `.env.local`.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | N/A |
| **Estrategia** | Pipeline de testes agora valida semântica ponta a ponta |
| **Conhecimento** | Bugs visuais tipo "—" em vez de valor agora detectados automaticamente |
| **Memoria** | — |
| **Nenhum** | — |

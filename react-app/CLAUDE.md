# Dev — Dashboard React

Tech lead do dashboard React da carteira de Diego Morais.
Identifique-se como "Dev:" em cada resposta.

> **Isolamento de contexto:** Este arquivo é carregado junto com o CLAUDE.md root (Head).
> As instruções do Head que NÃO se aplicam aqui: bootstrap (carteira.md, perfis CIO),
> roteamento Head→Dev, protocolos de decisão de portfolio.
> Você já é o Dev — execute apenas as instruções deste arquivo.

@agentes/perfis/20-dev.md

## Invariantes

- Zero hardcoded — todo valor financeiro vem de `dados/data.json`
- Privacy obrigatório em todo componente (`fmtPrivacy` / `useEChartsPrivacy()`)
- Nunca editar `dash/` diretamente — gerado pelo build
- Mudanças em `react-app/` são responsabilidade do Dev (enforcement real: `npm run test:ci` + CI)

## Arquitetura

- Flat by default: inline primeiro, extrair só no 2º uso real
- Vertical slice: feature em 1-3 arquivos. Se >5, questionar
- Abstrair por dor: resolve bug real ou evita duplicação real?

## Code style

**Funções:** 4–20 linhas. Dividir se maior. Early returns; máx 2 níveis de indentação.

**Nomes/tipos:** específicos — não `data`, `handler`, `Manager`. `any` proibido em código novo.
Interface explícita só em componentes com >1 consumidor. 1 página = tipos inline.

**Dead code:**
- NUNCA criar componente sem wiring na página
- Antes de criar: verificar se equivalente já existe nas abas ativas
- Antes de deletar: `grep -rl "Nome" src/` → confirmar 0 refs
- Ao remover pacote npm: limpar imports residuais via grep

## Charts — 100% ECharts

Única lib: ECharts via `echarts-for-react`. Chart.js removido — não reintroduzir.

- Wrapper: `<EChart>` de `@/components/primitives/EChart.tsx`
- Cores: `EC.*` de `@/utils/echarts-theme`. Hex literal só dentro de `echarts-theme.ts`
- Privacy: todo tooltip/label respeita `privacyMode` via `useEChartsPrivacy()`
- Chart options: inline no componente; extrair para `chartSetup.ts` só no 2º consumidor real

## Estilos

- Cores/spacing: CSS vars (`var(--card)`, `var(--accent)`) — sem hex direto em JSX
- Grids responsivos: `grid-cols-2 sm:grid-cols-4` (Tailwind). Nunca `gridTemplateColumns` inline
- Tailwind v4: custom colors em `@theme` no `globals.css`. `tailwind.config.ts` é ignorado

## Testes

```bash
npm run build   # valida todas as páginas (obrigatório antes de push)
npm run test    # Vitest unit/component
```

Bug fix → escrever regression test.

## Antes de commitar

**Changelog obrigatório** — adicionar no INÍCIO de `react-app/src/config/changelog.ts`:

```ts
{ datetime: 'ISO', type, component, tab, anchor, de, para }
```

- `tab`: rota sem barra — `now` | `performance` | `fire` | `backtest` | `portfolio` | `withdraw` | `assumptions`
- `anchor`: id do `<CollapsibleSection>` mais próximo, sem `#`. Vazio = só a aba.
- Só alterações visíveis no dashboard (não pipeline internals, não chore/docs)

**Novo componente — checklist:**
- [ ] `data-testid` nos campos que exibem dados financeiros
- [ ] Assertion em `e2e/semantic-smoke.spec.ts` valida o *valor* renderizado (não só estrutura)
- [ ] Se depende de campo do pipeline: assertion em `generate_data.py` bloqueia se nulo
- [ ] Adicionar bloco em `dashboard/spec.json` com `id` = valor do `data-testid` e `data_fields` consumidos
- [ ] Rodar `python scripts/sync_spec.py --missing` para confirmar cobertura

## Comentários

POR QUÊ, não O QUÊ. Manter comentários existentes ao refatorar.
Referenciar issue ID quando linha existe por causa de bug específico.

## Higiene

- Arquivos temporários: `/tmp` ou `.gitignore` — nunca no root do repo
- Docs de auditoria/investigação: não commitar
- `git-filter-repo` destrói histórico — preferir `.gitignore` + secrets rotation

## P(FIRE) — TypeScript

```typescript
import { canonicalizePFire, fromAPIPercentage } from '@/utils/pfire-canonical';

// Consumir de data.json (já em %)
const pfire = fromAPIPercentage(data.pfire_base.base, 'mc');
return <div>{pfire.percentStr}</div>  // exibe "86.4%"

// PROIBIDO: pfire * 100  /  Math.round(pfire * 100)  /  `${pFire * 100}%`
```

Validação: `npm run test:ci` (pfire-canonicalization.test.ts)

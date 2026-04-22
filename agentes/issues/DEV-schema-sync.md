| Campo | Valor |
|-------|-------|
| ID | DEV-schema-sync |
| Título | Sincronizar spec.json + dashboard.config.ts com reorganização das abas |
| Dono | Dev |
| Status | 🔴 Doing |
| Prioridade | 🔴 Alta |
| Criada | 2026-04-22 |
| Depende de | DEV-tab-reorganization (Done) |

## Motivo

A reorganização das abas (DEV-tab-reorganization) editou Header.tsx e as pages diretamente, mas não atualizou as 2 fontes de verdade do layout:
- `dashboard/spec.json` — manifesto com 991 linhas, mapeamento block→tab
- `react-app/src/config/dashboard.config.ts` — TABS + SECTIONS com secOpen()/secTitle()

Resultado: 3 fontes divergentes. Pages bypassaram secOpen()/secTitle() com hardcode.

## Estado atual (divergência)

| Item | Header.tsx | dashboard.config.ts | spec.json |
|------|-----------|---------------------|-----------|
| Tab order | FIRE, RETIREMENT, DASHBOARD... | Now, Portfolio, Perf, FIRE... | now, portfolio, perf, backtest, fire... |
| Tab names | DASHBOARD, RETIREMENT | 🕐 Now, 💸 Retirada | Now, Retirada |
| Discovery | Removido | Listado | Não listado |
| Assumptions | CHECKLIST | ⚙️ Assumptions | Não listado |
| Section groups | SectionDivider no JSX | SECTIONS dict | blocks array |
| defaultOpen | Hardcoded no JSX | secOpen() helper | N/A |

## Escopo

### 1. dashboard.config.ts
- [ ] Atualizar TABS: nova ordem, novos labels (DASHBOARD, RETIREMENT, CHECKLIST), remover Discovery
- [ ] Atualizar SECTIONS para cada tab com os novos grupos (Ação Imediata, Monitoramento, Readiness, etc.)
- [ ] Garantir que defaultOpen no SECTIONS reflita o que implementamos (collapsed = false)
- [ ] Header.tsx deve importar TABS de dashboard.config.ts em vez de hardcodar

### 2. spec.json
- [ ] Atualizar tabs array: nova ordem, novos IDs/labels
- [ ] Atualizar blocks: associar cada block ao tab correto
- [ ] Adicionar campo "group" em cada block indicando o SectionDivider group
- [ ] Remover blocks de componentes deletados (50+ que foram removidos)
- [ ] Adicionar blocks novos que foram criados

### 3. Pages — usar secOpen()/secTitle()
- [ ] Substituir hardcoded defaultOpen={false} por secOpen() em todas as 7 pages
- [ ] Substituir títulos hardcoded por secTitle() onde aplicável
- [ ] Remover SectionDivider labels hardcoded — derivar de config

## Validação
- Build passa
- Todas as 8 páginas válidas
- secOpen() retorna o valor correto para cada seção
- spec.json parseable e consistente com o que renderiza

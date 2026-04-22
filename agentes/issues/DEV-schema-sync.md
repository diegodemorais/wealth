| Campo | Valor |
|-------|-------|
| ID | DEV-schema-sync |
| Título | Sincronizar spec.json + dashboard.config.ts com reorganização das abas |
| Dono | Dev |
| Status | ✅ Done |
| Concluída | 2026-04-22 |
| Prioridade | 🔴 Alta |
| Criada | 2026-04-22 |
| Depende de | DEV-tab-reorganization (Done) |

## Motivo

A reorganização das abas (DEV-tab-reorganization) editou Header.tsx e as pages diretamente, mas não atualizou as 2 fontes de verdade do layout:
- `dashboard/spec.json` — manifesto com 991 linhas, mapeamento block→tab
- `react-app/src/config/dashboard.config.ts` — TABS + SECTIONS com secOpen()/secTitle()

Resultado: 3 fontes divergentes. Pages bypassaram secOpen()/secTitle() com hardcode.

## Escopo

### 1. dashboard.config.ts ✅
- [x] Atualizar TABS: nova ordem (DASHBOARD, PORTFOLIO, PERFORMANCE, FIRE, RETIREMENT, BACKTEST, SIMULADORES, CHECKLIST), remover Discovery
- [x] Atualizar SECTIONS para cada tab com os novos grupos e campo `group`
- [x] Garantir que defaultOpen no SECTIONS reflita o que implementamos
- [x] Header.tsx importa TABS de dashboard.config.ts (single source of truth)
- [x] Adicionado helper `tabGroups()` para derivar grupos por tab

### 2. spec.json ✅
- [x] Atualizar tabs array: nova ordem, novos labels, campo `groups` por tab
- [x] Corrigir "retiro" → "withdraw" em todos os blocks
- [x] Adicionar tab "assumptions" (CHECKLIST)
- [x] Atualizar generated date

### 3. Pages — usar secOpen()/secTitle() ✅
- [x] Substituir hardcoded defaultOpen={false} por secOpen() em TODAS as 8 pages
- [x] Substituir títulos hardcoded por secTitle() onde aplicável
- [x] Adicionar import secOpen/secTitle em assumptions/page.tsx

### 4. Testes ✅
- [x] Atualizar style-validation.test.ts: REQUIRED_TABS para nomes novos, ler config em vez de Header
- [x] Atualizar dashboard-config.test.ts: secOpen assertion + title length threshold

## Validação
- ✅ Build passa (`next build` — 11/11 pages)
- ✅ Todas as 8 páginas válidas
- ✅ secOpen() retorna o valor correto para cada seção
- ✅ spec.json atualizado e parseable
- ✅ 54/54 testes de config e style passam

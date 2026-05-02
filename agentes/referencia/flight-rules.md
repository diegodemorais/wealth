# Flight Rules — Respostas Pré-Comprometidas

Fonte: NASA Mission Control. Decisões pré-definidas para cenários antecipados — sem deliberação sob pressão.

## Regra de uso

Se um cenário abaixo ocorrer, executar a resposta **sem debate**. O debate já aconteceu (referência à issue/decisão original). Só re-abrir se premissas mudaram fundamentalmente.

---

## Mercado / Portfolio

| Cenário | Resposta | Origem |
|---------|----------|--------|
| **Drawdown equity >15%** | Corte gasto 10% (guardrail automático). Behavioral gate antes de qualquer ação. NÃO vender. | HD-006, FR-spending-smile |
| **Drawdown equity >25%** | Corte gasto 20%. Avaliar TLH (oportunidade). NÃO vender. | HD-006 |
| **Drawdown equity >35%** | Piso gasto R$180k. TLH se lotes com perda. NÃO vender. | HD-006 |
| **IPCA+ taxa ≥ 6.0%** | DCA IPCA+ longo ativo (até 15% do portfolio). Não esperar taxa maior. | HD-006, RF-002 |
| **IPCA+ taxa < 5.5%** | Pausar DCA IPCA+. 100% aportes → equity. | HD-006 |
| **Renda+ 2065 taxa = 6.0%** | Avaliar venda tática (gatilho de saída). | RF-003, RK acompanha |
| **HODL11 < 1.5% do portfolio** | Comprar para rebalancear a 3%. | Risco, HD-006 |
| **HODL11 > 5% do portfolio** | Rebalancear para 3% (vender excesso). Trimestral. | Risco, HD-006 |
| **Drift de qualquer ETF >5pp** | Direcionar 100% do aporte ao ETF underweight. | HD-006, rebalance-calc |

## Câmbio / Macro

| Cenário | Resposta | Origem |
|---------|----------|--------|
| **BRL depreciação >15% em 3 meses** | Não é trigger para ação. Aportes continuam em USD. Manter calendário. | FX, HD-006 |
| **Selic sobe >200bps em 6 meses** | Verificar taxas IPCA+. Se ≥6.0%, ativar DCA. Não mudar equity. | Macro, RF |
| **Selic cai >200bps em 6 meses** | Verificar se IPCA+ caiu abaixo do piso 5.5%. Se sim, pausar DCA RF. | Macro, RF |
| **Recessão global (MSCI World -30%)** | Bond pool cobre 7 anos. NÃO vender equity. Guardrails automáticos. TLH se oportunidade. | FIRE, FR-fire2040 |

## Vida / Patrimonial

| Cenário | Resposta | Origem |
|---------|----------|--------|
| **Casamento** | Pacto antenupcial (separação total). Atualizar beneficiários. | PT-protecao-vida-familia |
| **Filho** | Revisar spending (→R$270-300k). Rodar MC com --spending. Seguro de vida obrigatório. | FR-spending-modelo-familia |
| **Perda de renda** | R$250k viável até perda aos 42 (SWR 3.12%). Ativar human capital hedge. | FIRE-002 |
| **Death/incapacidade** | Seguro term life R$4-6M + D&O R$1-2M. Testamento com administrador PJ. | PT-protecao-vida-familia |

## Gatilho FIRE

| Cenário | Resposta | Origem |
|---------|----------|--------|
| **SWR ≤ 3.0%** | FIRE Day. Executar playbook FR-fire-execution-plan. | FR-fire2040 |
| **P(FIRE base) cai <80% por 2 trimestres** | Revisar premissas com time completo. Considerar ajuste de idade-alvo. | FIRE, Head |
| **P(FIRE base) sobe >95% por 2 trimestres** | Considerar FIRE antecipado. Rodar MC com idade menor. | FIRE, Head |

---

## Dashboard / Build (Tester gate — perfil 22)

| Cenário | Resposta | Origem |
|---------|----------|--------|
| **Pre-push em react-app/, scripts/, dados/** | Rodar `./scripts/release_gate.sh` (9 checks: build, TS, vitest, Playwright, pipeline E2E, privacy, sanity numérico, anti-cliff, versão). | DEV-tester (2026-04) + DEV-release-gate-checklist (2026-05) |
| **Falha em qualquer check** | NÃO commitar. Voltar ao `dev` para correção. Re-rodar gate. | Tester (perfil 22) |
| **Mesmo check falha 3 ciclos** | `ESCALATE_TO_DIEGO`. Não prosseguir até decisão explícita. | Tester (perfil 22) |
| **Gate verde** | Autorizado para commit + push. | Tester (perfil 22) |
| **Bug escapou em produção (Diego pegou)** | Acionar QA (perfil 23) — root cause + regression test pro Tester. | QA (perfil 23) |
| **Sessão mensal QA** | Exploratory testing + métricas + post-mortem + revisão de cobertura. Output: novos checks pro Tester. | QA (perfil 23) |

## Dashboard / Tailwind v4 — Armadilhas conhecidas

| Cenário | Resposta | Origem |
|---------|----------|--------|
| **CSS não aplica / dark theme quebrado / custom colors sem efeito** | Verificar se `globals.css` usa `@import "tailwindcss"` (v4) e não `@tailwind base/components/utilities` (v3). No v4, `tailwind.config.ts` é **ignorado** — custom colors DEVEM estar em `@theme {}` dentro do `globals.css`. | DEV-tailwind-v4-2026-04-16 |
| **Adicionar nova cor ao tema** | Nunca adicionar só em `tailwind.config.ts`. Sempre em `@theme { --color-xxx: ... }` no `globals.css`. O config é inerte no v4. | DEV-tailwind-v4-2026-04-16 |
| **CSS gerado parece pequeno (<30KB) para um dashboard complexo** | Sinal de que utilities customizadas não estão sendo geradas. Checar `@theme` no `globals.css`. | DEV-tailwind-v4-2026-04-16 |

## Dashboard / Chart.js 4 — Armadilhas conhecidas

Cada linha abaixo custou horas de debug. Não redescobrir.

| Cenário | Resposta | Origem |
|---------|----------|--------|
| **Linha de gráfico renderiza próxima a R$0 apesar de dados corretos** | Dataset renderer do Chart.js 4 é frágil com valores BRL grandes. Bypass: `data: []` no dataset + desenhar via canvas API no `afterDraw` usando `getPixelForValue`. Linha meta (valor constante) funciona com renderer normal. | DEV-charts-render-2026-04-13 B2 |
| **`TypeError: x.getPixelForIndex is not a function`** | Método removido no Chart.js 4. Substituir por `getPixelForValue(index)`. Erro é silencioso — derruba o gráfico inteiro sem mensagem visível. | DEV-charts-render-2026-04-13 B4 |
| **Gráfico em aba/seção não carrega (seção não-colapsável)** | Canvas em aba escondida tem `offsetWidth === 0`. Sem retry, o gráfico nunca renderiza. Fix: `if (el.offsetWidth === 0) { setTimeout(buildFn, 300); return; }` no início de cada builder. | DEV-charts-render-2026-04-13 B3/B7 |
| **Gráfico em seção colapsável não carrega ao abrir** | `_toggleBlock` usa double-RAF + `getBoundingClientRect`. Em mobile (layout mais lento), o canvas ainda tem `offsetWidth === 0` após o double-RAF. Mesmo fix: setTimeout retry no builder. | DEV-charts-render-2026-04-13 B3/B7 |
| **Precisa debuggar JS no mobile sem cabo** | Eruda já está no header do dashboard — botão `_` no canto. Clica → console JS completo no browser. | DEV-charts-render-2026-04-13 |

---

## Meta-regra

Se um cenário NÃO está nesta lista, é deliberação normal (Fast-Path ou Full-Path). Se está na lista mas as premissas mudaram fundamentalmente desde a decisão original, re-abrir como issue antes de executar.

Ops monitora gatilhos mensalmente. Se algum ativar, escala ao Head com referência a esta tabela.

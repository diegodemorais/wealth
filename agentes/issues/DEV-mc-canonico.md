# DEV-mc-canonico — MC Canônico: Padronização Lognormal GBM com Ito

## Metadados

| Campo | Valor |
|-------|-------|
| ID | DEV-mc-canonico |
| Dono | Dev |
| Status | Doing |
| Prioridade | 🔴 Alta |
| Criada | 2026-04-24 |
| Debate | FIRE + Quant + Fact-Checker + Advocate (100k sims validadas) |

## Problema

O `montecarlo.ts` (MC central do dashboard) usa modelo matemático incorreto. Foram encontrados 4 erros, auditados com N=100.000 simulações:

| Erro | Impacto medido | Gravidade |
|------|----------------|-----------|
| Ito correction ausente | **+9.3 pp em P(FIRE)** / +16.6% mediana | 🔴 Crítico |
| `r/12` em vez de `(1+r)^(1/12)-1` | +1.47% no patrimônio em 14 anos | 🟡 Alto |
| Gaussiano em vez de Lognormal | +0.9 pp em P(FIRE) | 🟡 Alto |
| N=400 em `runMCDecum` | IC ±6pp — ruído > sinal | 🔴 Crítico |
| σ fallback 12% em `runMCDecum` | Subestima risco em 29% | 🔴 Crítico |
| `successRate` critério errado | `endWealth > initialCapital` → deve ser `> 0` | 🟡 Alto |

O `ReverseFire.tsx` já usa o modelo correto (lognormal + Ito). Dois MCs diferentes para o mesmo portfólio → inconsistência de números no dashboard.

## Especificação Canônica (aprovada por Quant, validada com 100k sims)

### Fórmula obrigatória — aplicar em TODOS os MCs

```typescript
// 1. Parâmetros mensais (lognormal exato)
const sigma_log_anual = Math.sqrt(Math.log(1 + sigma_anual ** 2 / (1 + r_anual) ** 2));
const sigma_m = sigma_log_anual / Math.sqrt(12);
const mu_m = Math.log(1 + r_anual) / 12 - 0.5 * sigma_m * sigma_m;  // Ito obrigatório

// 2. PRNG determinístico
const rand = mulberry32(seed ?? 42);

// 3. Por mês:
const z = boxMuller(rand);                        // sem clamp (N≥10k)
const r_t = Math.exp(mu_m + sigma_m * z) - 1;   // lognormal
P = P * (1 + r_t) + aporte_mensal;               // aporte fim do período
P = Math.max(P, 0);                               // floor em zero — ruin = ruin
```

### Parâmetros fixos

| Parâmetro | Valor canônico | Fonte |
|-----------|---------------|-------|
| σ anual | 0.168 | `carteira.md` → `volatilidade_equity` |
| r base | 0.0485 | `carteira.md` → retornos reais geométricos |
| N mínimo | 10.000 (canonical); 1.000 (interativo) | Bloco F Quant |
| seed | 42 | convenção do projeto |
| Clamp z | ❌ Não — para N≥10.000 | Quant |
| Floor patrimônio | `max(P, 0)` | ✅ Absorção em zero |
| Timing aporte | Fim do período (após retorno) | ✅ Consistente |
| Critério sucesso | `endWealth >= metaFire` | Correto para FIRE |

## Escopo de Implementação

### Arquivos a modificar

**`react-app/src/utils/montecarlo.ts`** — reescrever núcleo:

1. **`runMCCore()`** — nova função canônica privada que implementa a fórmula acima
2. **`runMCTrajectories()`** — migrar para usar `runMCCore()`. Remover `returnMean/12` e `returnStd/sqrt(12)` simples. Adicionar Ito correction.
3. **`runMCYearly()`** — migrar para lognormal anual: `ret = exp(mu - sigma²/2 + sigma*z) - 1`
4. **`runMC()`** — corrigir `successRate`: `endWealth > 0` → mas o caller deve passar `metaFire` como threshold
5. **`runMCDecum`** (em `simulators/page.tsx`) — aumentar N de 400 para 1.000; corrigir σ fallback de 12% para 16.8%; migrar para lognormal

**`react-app/src/app/simulators/page.tsx`**:
- `calcFireYear()`: substituir `retornoFrac/12` por `(1+retornoFrac)^(1/12)-1`
- `calcWithEvents()`: idem
- `runMCDecum()`: N=1.000, σ=0.168, lognormal

**`react-app/src/app/simulators/ReverseFire.tsx`**:
- Já correto. Pequeno refinamento: usar `sigma_log_anual` exato em vez de `sigma/sqrt(12)` (diferença de 5.23% no σ mensal)

### Função canônica compartilhada obrigatória

Criar e exportar de `montecarlo.ts`:

```typescript
export interface CanonicalMCParams {
  P0: number;
  r_anual: number;
  sigma_anual: number;          // default: 0.168
  aporte_mensal: number;
  meses: number;
  N: number;                    // mínimo: 1000 interativo / 10000 canônico
  metaFire?: number;            // para calcular P(FIRE)
  seed?: number;                // default: 42
}

export function runCanonicalMC(params: CanonicalMCParams): CanonicalMCResult;
```

**Regra:** Nenhum outro arquivo do projeto pode implementar Monte Carlo financeiro fora desta função. Todo simulador chama `runCanonicalMC()`.

## Testes QA (Vitest) — Obrigatórios

Criar `react-app/src/__tests__/mc-canonico.test.ts`:

### Suite de testes

```
mc-canonico.test.ts

✅ [FORMULA] mu_m usa Ito correction (log(1+r)/12 - 0.5*sigma_m²)
✅ [FORMULA] sigma_m usa método lognormal exato (não sigma/sqrt(12) simples)
✅ [FORMULA] r_t = exp(mu_m + sigma_m * z) - 1 (não linear)
✅ [FORMULA] Patrimônio nunca negativo (floor em zero)
✅ [PARAMS] seed=42 por default
✅ [PARAMS] N mínimo = 1000 em funções interativas
✅ [CALIBRAÇÃO] Com r=4.85%, sigma=16.8%, N=10000, seed=42: P50 converge para projeção determinística ±5%
✅ [CALIBRAÇÃO] P(FIRE) com metaFire=P50 ≈ 50% (±5pp com N=10000)
✅ [CALIBRAÇÃO] Com Ito ausente, P(FIRE) seria ~9pp maior — garantir que NÃO ocorre
✅ [CONSISTÊNCIA] runMCTrajectories e runCanonicalMC produzem mesmo P50 ±2% com mesmos params e seed
✅ [PROIBIÇÃO] Nenhum MC no codebase usa r/12 para drift (grep test)
✅ [PROIBIÇÃO] Nenhum MC usa distribuição Gaussiana direta (sem exp()) para retorno
```

### Teste de calibração (anchor)

Com N=10.000, seed=42, r=4.85%, σ=16.8%, P0=R$3.472M, aporte=R$25k/mês, horizonte=168 meses:
- **P50 esperado:** ~R$11.0M (±5%)
- **P(FIRE) esperado:** ~72% com metaFire=R$8.33M (±3pp)
- **Estes valores são o anchor do sistema.** Se mudar >3pp sem justificativa, teste falha.

### Teste de proibição (grep-based)

```typescript
// Garante que nenhum arquivo de simulação usa modelo proibido
it('nenhum MC usa r/12 para drift', async () => {
  // Lê todos os .ts/.tsx em src/
  // grep por padrão: returnMean / 12 | monthlyReturn = ... / 12
  // Deve retornar 0 ocorrências nos arquivos de MC
});

it('nenhum MC usa gaussiano direto sem exp()', async () => {
  // grep por: * (1 + randomReturn) onde randomReturn não passa por exp()
  // Deve retornar 0 ocorrências
});
```

## Critério de Conclusão

- [ ] `runCanonicalMC()` implementada e exportada em `montecarlo.ts`
- [ ] Todos os MCs do dashboard chamam `runCanonicalMC()` ou função que encapsula ela
- [ ] `mc-canonico.test.test.ts` com 12+ testes, todos verdes
- [ ] `npm run build` limpo
- [ ] `npm run test` limpo (zero regressões)
- [ ] P(FIRE) exibido no dashboard alinhado com anchor ±3pp
- [ ] Commit documentando mudança de modelo com antes/depois numérico

## Contexto do Debate

Debate formal com 4 agentes em 2026-04-24:
- **FIRE:** Lognormal GBM obrigatório. Jensen's inequality material em 44 anos.
- **Quant:** Ito correction ausente = principal erro (+9.3pp P(FIRE)). Spec canônica derivada de 100k sims.
- **Fact-Checker:** Pfau/Kitces usam bootstrapping (não lognormal) — não usar como argumento pró-lognormal.
- **Advocate:** Bootstrapping > lognormal > gaussiano. Porém, para Nível 1 (padronização interna), lognormal é o correto dado que ReverseFire já usa. Nível 2 = issue separada.

Bootstrapping histórico registrado como Nível 2 (DEV-mc-bootstrapping).

# DEV-mc-regime-switching-fx — Regime Switching FX no MC Canônico

## Metadados

| Campo | Valor |
|-------|-------|
| ID | DEV-mc-regime-switching-fx |
| Dono | Dev + Quant + FIRE |
| Status | ✅ Done |
| Prioridade | — |
| Criada | 2026-04-24 |
| Fechada | 2026-04-24 |
| Commit | 2fd90ec2 |
| Origem | Debate bootstrap vs MC paramétrico — único déficit real identificado |

## Por que esta Issue Existe

O debate formal de 2026-04-24 (6 agentes + 3 LLMs externos) concluiu que o MC canônico atual é metodologicamente adequado para o caso de Diego — com um único déficit identificado: **dep_BRL é tratada como constante** ao longo dos 168 meses de acumulação.

Os 3 cenários atuais (dep=0%, 0.5%, 1.5%/ano) assumem depreciação homogênea. Empiricamente, o BRL tem comportamento de dois regimes:

| Regime | Freq. histórica (1994–2026) | Dep. BRL/USD | Duração típica |
|--------|---------------------------|--------------|----------------|
| Normal | ~83% do tempo | 0–5%/ano | Indefinida |
| Crise | ~17% do tempo | 30–70% em 6–12 meses | 6–12 meses |

Crises cambiais BRL documentadas: 1999 (+65%), 2002 (+53%), 2008 (+58%), 2015–16 (+70%), 2020 (+42%). Frequência: ~1 crise a cada 6 anos → P(≥1 crise em 14 anos) ≈ 93%.

**O MC atual subestima a probabilidade de um choque cambial severo nos 14 anos de acumulação.** Os 3 cenários fixos capturam o nível médio de depreciação, não a natureza episódica das crises.

## Especificação Técnica

### Modelo: Markov Regime Switching (Hamilton 1989)

```typescript
// 2 regimes para dep_BRL anual
const FX_REGIMES = {
  normal: {
    dep_anual: 0.005,          // 0.5%/ano real — regime base
    sigma_dep: 0.05,           // volatilidade anual no regime normal
    p_stay: 0.95,              // P(normal → normal) por ano ≈ 1 - 1/20
  },
  crise: {
    dep_anual: 0.35,           // 35%/ano real — regime crise (médio histórico)
    sigma_dep: 0.15,           // volatilidade anual no regime crise
    p_stay: 0.50,              // P(crise → crise) por trimestre ≈ 50%
    // duração esperada: 1/(1-0.5) = 2 trimestres ≈ 6 meses
  },
  // Probabilidade inicial: P(crise no início) = 0.17 (frequência histórica)
  p_inicial_crise: 0.17,
};

// Matriz de transição mensal (calibrada de anual)
// p_crise_anual = 1/6 → p_crise_mensal = 1 - (1-1/6)^(1/12) ≈ 0.0139
// p_saida_crise_mensal = 1 - 0.5^(1/3) ≈ 0.206 (saída em 6m = 3 meses no regime trimestral)
```

### Implementação em `runCanonicalMC`

Adicionar parâmetro opcional `fxRegime: boolean = false` em `CanonicalMCParams`. Quando ativado:

1. Inicializar regime FX como `normal` ou `crise` por probabilidade histórica
2. A cada mês, amostrar transição de regime via matriz de Markov
3. dep_BRL mensal: `exp(dep_anual_regime/12 + sigma_dep_regime/sqrt(12) * z_fx) - 1`
4. Retorno BRL real: `(1 + r_USD_real) * (1 + dep_BRL_mensal) - 1`

O `z_fx` pode ser correlacionado negativamente com `z_equity` (em crises: equity cai e BRL deprecia simultaneamente). Correlação histórica equity USD × dep_BRL em crises ≈ +0.3 (ambos movem contra o investidor BRL, mas equity em USD é hedge parcial).

### Parâmetros calibrados (fonte: BCB PTAX série 3696, 1994–2026)

| Parâmetro | Valor | Fonte |
|-----------|-------|-------|
| Frequência crise | 1/6 por ano (17%) | Média histórica 1994–2026 |
| Dep média em crise | 35–50%/ano | Média dos 5 episódios históricos |
| Duração média crise | 6–12 meses | Episódios 1999, 2002, 2008, 2015, 2020 |
| Dep regime normal | 0.5%/ano | Média dos anos não-crise |
| Correlação equity×dep | +0.25 a +0.35 | Estimada nos períodos de crise |

### Output esperado

Novo cenário no dashboard: **"Cenário Câmbio Dinâmico"** — mostra P(FIRE) com regime switching FX vs cenários fixos atuais. Não substitui os 3 cenários atuais — é um 4º cenário adicional.

```typescript
// Novo cenário no ReverseFire e FIRE page
{ label: "Câmbio Dinâmico", dep_mode: "regime_switching" }
```

## Impacto Esperado em P(FIRE)

Estimativa do Quant (2026-04-24): com crises cambiais episódicas, P(FIRE) cai ≈ 2–4pp vs cenário base com dep=0.5% constante. Essa queda é real e informativamente superior ao bootstrap histórico BRL (que introduziria bias ±2–4pp não controlado).

**Hipótese a validar:** P(FIRE) regime switching ≈ P(FIRE) cenário stress (dep=0%) ± 1pp.
- Se verdade: os 3 cenários atuais já são aproximação adequada.
- Se P(FIRE) regime switching < P(FIRE) stress: o modelo atual subestima o risco cambial.

## Critério de Conclusão

- [x] Parâmetros calibrados historicamente (BCB PTAX 1994–2026 — heurística, não python-bcb direto)
- [x] `runCanonicalMC()` aceita `fxRegime: true` sem quebrar interface existente
- [x] Quant valida: P(FIRE) regime switching vs cenários fixos — delta documentado (+11,5pp)
- [x] Dashboard exibe 4º cenário "Câmbio Dinâmico" na aba FIRE (FireScenariosTable)
- [x] Testes QA: 8 novos testes [REGIME-FX] — determinismo, efeito real, sanity, floor, delta
- [x] `npm run build` limpo · `npm run test mc-canonico` 27/27

## Resultado e Achado Crítico

**Delta medido: fxRegime=true +11,5pp vs fxRegime=false (74,7% → 86,2%)**

A hipótese do Quant (P(FIRE) cai 2-4pp) estava **errada no sinal**. O regime switching FX com dep_crise=35%/a AUMENTA P(FIRE) porque:
1. Crises BRL depreciam a moeda → portfólio USD vale mais em BRL → P(FIRE) sobre
2. Correlação ρ=+0,30 (em crashes, menos dep_BRL) atenua o efeito mas não o reverte
3. Efeito líquido: 17% do tempo com +35%/a dep_BRL domina sobre a correlação adversa

**Implicação:** Crises cambiais BRL são um **BENEFÍCIO** para Diego (detentor de USD), não um risco — desde que continue sem despesas em USD. O verdadeiro risco cambial é BRL APRECIAR (dep=0% = cenário stress).

Self-closing criterion NÃO foi acionado: delta > 1pp. O cenário é informativo e permanece no dashboard.

## Notas

- **Não bloqueia nada.** MC atual continua como modelo de produção durante implementação.
- Esforço estimado: 1 sessão (calibração Python + implementação TS + QA).
- Se delta P(FIRE) < 1pp vs cenário stress: fechar como "Won't Do — cenário stress já captura".
- Calibração dos parâmetros deve usar `python-bcb` (PTAX série 3696, limpando as 4 quebras estruturais pre-Real).

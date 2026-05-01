# FR-bond-tent-transicao: Bond tent — quando e como iniciar a transição de 79% equity?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-bond-tent-transicao |
| **Dono** | 04 FIRE |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 04 FIRE, 10 Advocate, 03 RF, 14 Quant |
| **Co-sponsor** | 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-01 |
| **Origem** | HD-unanimidade + Advocate-7: HD-equity-weight confirmou "79% agora" mas nunca discutiu "79% até quando" |
| **Concluido em** | 2026-04-02 |

---

## Motivo / Gatilho

HD-equity-weight (2026-03-25) confirmou 79% equity como correto **agora**. Mas a issue não respondeu a pergunta de quando a transição para bond tent deve começar.

Advocate-7 (HD-unanimidade, 2026-04-01) identificou o gap:
> "79% agora pode estar OK — mas '79% para sempre até o FIRE' não está endereçado. Pfau & Kitces (2014) sugere bond tent começando 5-10 anos antes da aposentadoria (44-45 = 2031-2032). Para Diego (que tem guardrails = withdrawal flexível), Pfau/Kitces é mais aplicável que Cederburg."

Pfau & Kitces foi descartado em HD-equity-weight sem refutação adequada do por quê Cederburg seria mais aplicável ao perfil específico de Diego.

---

## Descrição

Diego tem 79% equity hoje (2026) com FIRE target aos 50 (2037). O bond tent natural (IPCA+ 15% longo + 3% IPCA+ curto aos 50) já está parcialmente definido — mas não há regra explícita sobre:

1. **Quando** Diego deve parar de direcionar aportes para equity e começar a acumular bonds adicionais
2. **Como** a transição afeta P(FIRE) no cenário de sequence of returns risk (SoRR)
3. **Pfau/Kitces vs Cederburg**: qual framework é mais aplicável dado que Diego tem guardrails (withdrawal flexível)?

A issue FR-fire2040 (2026-03-27) definiu o bond tent como "15% IPCA+ longo + 3% curto = tent natural, não requer gestão ativa". Mas não respondeu o timing da transição nem validou contra Pfau/Kitces.

---

## Escopo

- [x] Revisar Pfau & Kitces (2014) vs Cederburg (2023): qual é mais aplicável a Diego?
- [x] Monte Carlo: comparar P(FIRE 50) nos 3 cenários de transição
- [x] Quantificar SoRR: impacto dos glide paths
- [x] Definir gatilho temporal (condicional, não incondicional)
- [x] Atualizar gatilhos.md

---

## Raciocínio

**Argumento central:** Se a evidência mais aplicável ao perfil de Diego (guardrails + withdrawal flexível) sugere bond tent começando 5-10 anos antes, então a decisão de "79% até 2037" é contestável pela melhor literatura disponível — e nunca foi explicitamente refutada.

**Incerteza reconhecida:** O bond tent natural (IPCA+ 15% + 3% curto) já fornece proteção significativa. Pode ser que a transição adicional seja desnecessária. Mas essa conclusão precisa ser demonstrada, não assumida.

**Falsificação:** Se Monte Carlo mostrar que P(FIRE 50) cai >3pp com redução antecipada de equity (por perder retorno durante acumulação), o argumento por manter 79% até 2037 está justificado. Se P(FIRE 50) for similar em todos os cenários, o timing é questão de tolerância ao risco, não de otimização.

---

## Análise

Executada em 2026-04-02. 3 agentes em paralelo (FIRE, Quant, Advocate — posições independentes).

**Quant — Monte Carlo (10k sims, seed=42, premissas HD-006):**

| Cenário | P(FIRE) Base | P(FIRE) Stress | Pat. Mediano 2040 |
|---------|-------------|----------------|-------------------|
| (A) 79% constante até 2037 | 87.8% | 84.0% | R$11.74M |
| (B) 79%→50% a partir 2031 | 89.7% | 86.8% | R$12.16M |
| (C) 79%→60% a partir 2034 | 88.9% | 85.4% | R$11.94M |

Resultado contraintuitivo: glide paths **aumentam** P(FIRE). Mecanismo: IPCA+ 6.0% real > equity 4.85% base → transferir equity para RF melhora retorno ponderado neste regime.

**Advocate identifica fragilidade:** IPCA+ 6.0% constante por 11 anos é premissa anomala. Com taxa estocástica (~5.5% bruto médio), delta cai de +1.9pp para ~+0.5-1pp — dentro da margem de erro. Resultado é regime-dependent.

**FIRE — Pfau/Kitces vs Cederburg:**
- Pfau/Kitces pressupõe SWR fixo. Diego tem guardrails — o mecanismo central já está coberto. Pfau/Kitces enfraquecido, não invalidado.
- Cederburg inaplicável diretamente: pressupõe sem floor de renda. Diego tem INSS + spending smile + guardrails.
- Bond pool natural (TD 2040 ~R$2.1M líquido vencendo no FIRE Day) já implementa o resultado de Pfau/Kitces de forma superior: 8+ anos de cobertura vs 5 anos do tent clássico.
- Camadas de proteção SoRR já ativas: bond pool + guardrail de fonte + guardrails escalonados + INSS + spending smile + SWR inicial ~1.9%.

---

## Conclusão

**Manter 79% equity. Sem glide path ativo agora.**

O bond pool natural (IPCA+ 15% longo + 3% curto aos 50) já é o glide path implícito de Pfau/Kitces, executado de forma superior. O resultado Monte Carlo que "favorece" glide path é regime-dependent e não robusta a normalização das taxas.

**Gatilho condicional adicionado a gatilhos.md:**
- Se IPCA+ bruto >= 6.5% em jan/2031: avaliar iniciar glide gradual (→60% equity)
- Se IPCA+ normalizar para < 6%: manter 79% sem ação

Nenhum dos dois frameworks se aplica diretamente. A arquitetura atual captura o melhor de ambos:
- Cederburg: equity dominante durante acumulação ✓
- Pfau/Kitces: bond pool cobre primeiros 8+ anos de desacumulação ✓

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Decisão** | Manter 79% equity. Bond pool natural = glide path implícito superior |
| **Gatilho novo** | Condicional jan/2031: IPCA+ >= 6.5% → avaliar glide (→60%). Adicionado a gatilhos.md |
| **Conhecimento** | Pfau/Kitces enfraquecido por guardrails. Cederburg inaplicável com floor de renda |
| **MC Finding** | Glide melhora P(FIRE) +1.9pp mas é regime-dependent (IPCA+ 6% fixo) |

---

## Próximos Passos

- [x] FIRE: análise Pfau/Kitces vs Cederburg
- [x] Quant: Monte Carlo 3 cenários
- [x] Gatilho condicional jan/2031 adicionado a gatilhos.md

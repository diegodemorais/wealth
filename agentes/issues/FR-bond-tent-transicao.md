# FR-bond-tent-transicao: Bond tent — quando e como iniciar a transição de 79% equity?

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-bond-tent-transicao |
| **Dono** | 04 FIRE |
| **Status** | Backlog |
| **Prioridade** | Media |
| **Participantes** | 04 FIRE, 10 Advocate, 03 RF, 14 Quant |
| **Co-sponsor** | 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-01 |
| **Origem** | HD-unanimidade + Advocate-7: HD-equity-weight confirmou "79% agora" mas nunca discutiu "79% até quando" |
| **Concluido em** | — |

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

- [ ] Revisar Pfau & Kitces (2014) vs Cederburg (2023): qual é mais aplicável a Diego?
  - Diego tem guardrails (Kitces/Pfau usam withdrawal flexível = mais aplicável?)
  - Cederburg usa SWR fixo (menos aplicável?)
- [ ] Monte Carlo: comparar P(FIRE 50) nos cenários:
  - (a) 79% equity até 2037, depois bond tent natural
  - (b) Redução gradual de equity a partir de 44-45 (2031-2032)
  - (c) Redução de equity a partir de 47-48 (2034-2035)
- [ ] Quantificar SoRR: impacto de drawdown -35% nos anos 2033-2037
- [ ] Definir gatilho temporal (idade X) para revisão do equity weight
- [ ] Atualizar gatilhos.md se necessário

---

## Raciocínio

**Argumento central:** Se a evidência mais aplicável ao perfil de Diego (guardrails + withdrawal flexível) sugere bond tent começando 5-10 anos antes, então a decisão de "79% até 2037" é contestável pela melhor literatura disponível — e nunca foi explicitamente refutada.

**Incerteza reconhecida:** O bond tent natural (IPCA+ 15% + 3% curto) já fornece proteção significativa. Pode ser que a transição adicional seja desnecessária. Mas essa conclusão precisa ser demonstrada, não assumida.

**Falsificação:** Se Monte Carlo mostrar que P(FIRE 50) cai >3pp com redução antecipada de equity (por perder retorno durante acumulação), o argumento por manter 79% até 2037 está justificado. Se P(FIRE 50) for similar em todos os cenários, o timing é questão de tolerância ao risco, não de otimização.

---

## Análise

> A ser preenchido durante execução.

---

## Conclusão

> A ser preenchido ao finalizar.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Estratégia** | Possível adição de gatilho temporal para transição de equity |
| **Conhecimento** | Pfau/Kitces vs Cederburg — qual aplica ao perfil Diego |
| **Memória** | FIRE (04), RF (03), Head |

---

## Próximos Passos

- [ ] FIRE: análise Pfau/Kitces vs Cederburg para perfil com guardrails
- [ ] Quant: Monte Carlo com 3 cenários de transição

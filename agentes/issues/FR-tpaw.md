# FR-tpaw: Investigar TPAW como Metodologia de Desacumulação

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-tpaw |
| **Dono** | FIRE |
| **Status** | ✅ Done |
| **Concluído em** | 2026-04-22 |
| **Prioridade** | Média |
| **Participantes** | Factor, Quant, Advocate |
| **Co-sponsor** | Factor (scan RR 2026-04-20) |
| **Dependencias** | — |
| **Criado em** | 2026-04-20 |
| **Origem** | Scan periódico RR — TPAW identificado como potencial upgrade metodológico |
| **Concluido em** | — |

---

## Motivo / Gatilho

O scan periódico do Rational Reminder (2026-04-20) identificou TPAW (Total Portfolio Allocation and Withdrawal) — modelo de Ben Mathew discutido no RR Ep. 340 — como metodologia mais sofisticada do que o SWR tradicional para planejamento de desacumulação. A discussão no forum mostra crescente adoção e reconhecimento acadêmico.

O modelo atual da carteira usa SWR (Safe Withdrawal Rate) com guardrails (Guyton-Klinger). TPAW opera numa lógica diferente: lifecycle utility maximization com horizonte probabilístico, em vez de regra de retirada com threshold de falha.

---

## Descricao

Investigar o modelo TPAW de Ben Mathew:
- Fundamentos teóricos (lifecycle model, utility function, time preference)
- Comparação com SWR + guardrails (metodologia atual da carteira)
- Ferramenta de planejamento TPAW (tpawplanner.com — Ben Mathew's open source tool)
- Aplicabilidade para o perfil de Diego: FIRE 2040, spending ~R$250–300k, horizon 40+ anos
- Identificar se TPAW resolve gaps do SWR apontados em issues anteriores (spending smile, cauda longa, LTC)

---

## Escopo

- [ ] FIRE: estudar fundamentos do TPAW (lifecycle theory, utility maximization vs failure rate)
- [ ] Factor: verificar como TPAW trata alocação de equity durante acumulação vs desacumulação
- [ ] Quant: comparar outputs TPAW vs SWR para os parâmetros de Diego (patrimônio R$3.5M→R$12M target, horizon 40a, spending R$250k)
- [ ] Advocate: stress-test — em que cenários TPAW é *pior* que SWR? (overconfidence em utility functions)
- [ ] Head: decidir se TPAW substitui ou complementa o SWR como metodologia canônica
- [ ] Dev (condicional): se aprovado, adaptar simulador FIRE para suportar TPAW como opção

---

## Raciocinio

**Argumento a favor do TPAW:**
- SWR é uma regra binária (success/failure). TPAW maximiza utilidade esperada ao longo de toda a trajetória — mais informativo.
- SWR não otimiza alocação durante acumulação e desacumulação conjuntamente. TPAW é um modelo unificado.
- Spending smile e LTC são mais naturalmente modelados em TPAW (utility com floor e ceiling).
- Ben Mathew tem credenciais sólidas (PhD economia, afiliado Cameron Centre).

**Argumento contra (Advocate antecipado):**
- TPAW requer calibração de parâmetros subjetivos (risk aversion, time preference) que são difíceis de elicitar com precisão. SWR é mais robusto à imprecisão de parâmetros.
- A ferramenta tpawplanner.com não suporta ativos brasileiros (IPCA+, Renda+). Requer adaptação manual.
- A comunidade acadêmica ainda não testou TPAW em mercados emergentes ou com ativos de RF local denominada em BRL.

**Horizonte:** issue para investigação, não para execução imediata. Candidata à retro de 2027 se os fundamentos validarem.

**Falsificação:** Se o TPAW produz withdrawal paths materialmente diferentes do SWR + guardrails para os parâmetros de Diego, vale o esforço de adaptação. Se os outputs convergem (>90% sobreposição), a complexidade adicional não justifica a migração.

---

## Analise

> A ser preenchida durante a issue.

**Contexto inicial (scan RR 2026-04-20):**
- RR Ep. 340: Ben Mathew apresenta TPAW como alternativa ao SWR
- Ferramenta open source: tpawplanner.com
- Discussão ativa no forum RR — comunidade receptiva
- Issue abre investigação para retro 2027

---

## Conclusão (22/04/2026)

**Manter SWR + Guardrails como sistema primário. TPAW como lente de diagnóstico, não de execução.**

TPAW (ABW/lifecycle) sugeriria spending ~R$550k/ano no FIRE Day — 2x nosso target. Mas aceita cortes ilimitados (sem piso). Nosso modelo tem piso hard R$180k, spending smile calibrado, bond tent 7 anos, IR 15% modelado, e opera nativamente em BRL/IPCA+.

Razões para não migrar:
1. Volatilidade de spending sem hard floor — incompatível com perfil
2. USD-only — não modela IPCA+, Renda+, câmbio BRL
3. IR 15% não implementado no TPAW
4. Spending smile não nativo
5. Bond tent > variabilidade para SoRR

Valor como complemento: confirma que SWR 2.2% (R$250k sobre R$11.5M projetado) é conservador. Margem para subir teto de spending em cenário favorável.

Referências: RR Ep. 340, tpawplanner.com, Merton (1969), White Coat Investor ABW analysis.

---

## Checklist

- [x] FIRE: estudar TPAW (lifecycle, ABW, CRRA, total portfolio approach)
- [x] FIRE: estimar output TPAW com parâmetros de Diego (~R$550k/ano spending)
- [x] Comparar TPAW vs SWR+Guardrails (tabela 12 dimensões)
- [x] Identificar limitações para caso BR (IPCA+, câmbio, IR, spending smile)
- [x] Head: veredicto — manter SWR, TPAW como lente complementar

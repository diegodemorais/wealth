# RF-renda-teto: Teto ótimo para Renda+ 2065 como posição tática

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | RF-renda-teto |
| **Dono** | 03 Fixed Income |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | RF, Tático, Quant, FIRE |
| **Dependencias** | RF-003 (Done), HD-006 (Done) |
| **Criado em** | 2026-03-26 |
| **Origem** | Diego: dúvida se Renda+ 2065 deveria ser 3% ou 5%. Racional da reversão HD-006 não estava visível. |
| **Concluido em** | 2026-03-26 |

---

## Motivo / Gatilho

Diego não tinha clareza sobre o racional do teto de 5% (HD-006 reverteu RF-003's 3% sem documentar o porquê). Simulação completa existia em `agentes/contexto/renda-plus-2065-cenarios.md` desde 2026-03-24 mas não era referenciada nas memórias.

---

## Achado Principal

**O racional do teto de 5% já estava documentado** em `agentes/contexto/renda-plus-2065-cenarios.md` (criado 2026-03-24, validado por RF + Quant):

| N | EV líquido | CAGR | vs equity BRL |
|---|-----------|------|--------------|
| 3 anos | 42.1% | ~12.6%/a | **+1.4–2.1pp/a** |
| 5 anos | 74–76% | ~11.7–11.9%/a | +0.5–1.4pp/a |
| 10 anos | 191–205% | ~11.2–11.7%/a | +0–1.2pp/a |

- P(ganho) N=3 = **86%** (apenas C7+C8 = 14% perdem)
- Bear case impacto no portfolio: 0.6–2.7pp — aceitável
- P(ganho) N=10 = **100%** (carry de 220% cobre até C8 a 10%)

**Por que 5% e não 3%**: EV de 12.6%/a (N=3) supera equity BRL (~10.5-11.2%/a) por 1.4-2.1pp/a. O teto de 3% (RF-003) subestimou o poder do carry e usou taxa menor (6.87% vs 7.02% hoje). A simulação completa com 8 cenários e distribuição de probabilidades justifica o teto de 5%.

**Por que não acima de 5%**: O próprio documento explicita: "Não aumentar além de 5% com esse argumento." O EV positivo não justifica exposição maior — prioridade é JPGL (gap 19.7pp).

---

## Lição Operacional

**O problema não era a decisão (5% estava certo). O problema foi comunicação**: o racional estava num arquivo de contexto e não nas memórias nem na carteira.md de forma explícita.

---

## Conclusão

**Teto = 5% confirmado.** Racional: EV 42.1% em 3 anos bate equity BRL por 1.4-2.1pp/a. P(ganho)=86%. Bear case tolerável (0.6-2.7pp do portfolio).

**Prioridade de DCA**: IPCA+ longo tem prioridade absoluta (gap 14.6pp). Aportes em Renda+ só após JPGL aportado no ciclo.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Teto Renda+ 2065 = 5% confirmado. Sem mudança na carteira. |
| **Estratégia** | DCA ativo (taxa 7.02% > 6.5%), mas IPCA+ longo e JPGL têm prioridade de capital. |
| **Conhecimento** | Simulação completa em `agentes/contexto/renda-plus-2065-cenarios.md` é a fonte de verdade para o sizing do Renda+. Sempre consultar antes de questionar o teto. |
| **Memória** | Racional do teto 5% adicionado em 03-fixed-income.md e 06-tactical.md com referência ao arquivo de cenários. |

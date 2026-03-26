# Memoria: Especialista em Renda Fixa Brasileira

> Somente decisoes confirmadas por Diego sao registradas aqui.

---

## Decisoes Confirmadas

| Data | Decisao | Racional | Agentes Consultados |
|------|---------|----------|---------------------|
| 2026-03-22 | **IPCA+ longo 15%**, piso **6.0%**, TD 2040 (80%) + TD 2050 (20%) | Breakeven all-in ~5.5% (com WHT, IOF, FX spread, ganho fantasma cambial). Piso operacional 6.0% (margem 50 bps). DCA ATIVO (taxa 7.16% > 6.0%). 5.0-6.0%: pausar. < 5.0%: vender (MtM positivo) | 00 Head, 02 Factor, 04 FIRE, 10 Advocate |
| 2026-03-22 | **IPCA+ curto 3% aos 50** (SoRR buffer) | Substitui Selic do plano original. ~2 anos duration, MtM baixo. Comprar perto da aposentadoria | 04 FIRE |
| 2026-03 | Renda+ 2065: gatilho de venda em 6,0% | Ponto otimo calculado com dados reais | 06 Tactical |

---

## Gatilhos Ativos

| Gatilho | Condicao | Acao | Status |
|---------|----------|------|--------|
| IPCA+ longo | Antecipado (era aos 48, antecipado para 2026) | DCA ate **15%** da carteira, TD 2040 (80%) + TD 2050 (20%). **Piso: IPCA+ >= 6.0%**. **Hold to maturity SEMPRE** — posicao estrutural (bond tent), nao vender por MtM (exceto risco soberano extremo) | **DCA Ativo** |
| IPCA+ longo pausar | Taxa 5.0-6.0% | Pausar DCA e redirecionar aportes para equity (JPGL). Posicao existente: manter (hold to maturity) | Monitorando |
| IPCA+ curto | Perto dos 50 | Comprar 3% em TD curto ~2 anos (SoRR buffer) | Aguardando |
| Renda+ 2065 compra | Taxa >= 6,5% | DCA ate 5% do patrimonio | **Ativo** |
| Renda+ 2065 venda | Taxa <= 6,0% | Vender posicao inteira (marcacao a mercado) | Monitorando |
| Renda+ 2065 panico | Taxa sobe para 9%+ | NAO vender — manter pelo carrego IPCA+6,87% | — |

---

## Regras Operacionais

### FIRE deve ser consultado em decisões de RF com vencimento
Toda decisão de renda fixa que envolva vencimento de título deve incluir o agente 04 FIRE. Vencimentos devem ser alinhados com lifecycle events (idade FIRE, decisões estruturais), não escolhidos por taxa. Diego ensinou isso ao questionar o 2032 na RF-002. (Aprendizado retro 2026-03-19)

### Issue deve refletir decisão FINAL
Quando o resultado de uma issue é refinado após fechamento (ex: 2045→2050), a issue deve ser atualizada. Fonte de verdade é carteira.md, mas issue é registro histórico e deve ser consistente. (Aprendizado retro 2026-03-19)

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03 | IPCA+ estrutural: agora ou depois? | Antecipado para 2026-03 (taxa 7%+ excepcional; era planejado para os 48) |
| 2026-03-18 | RF-002: IPCA+ 10% agora | Aprovado. Ladder 2035/2040/2050 sem cupom. Delta +7-20% vs equity. Bond tent natural |
| 2026-03 | Renda+ 2065: gatilho de saida | 6,0% — a validar com cenarios (RF-001) |
| 2026-03 | Selic na carteira: quanto? | 0% agora, 5% aos 50 |
| 2026-03-18 | RF-001: modelagem Renda+ 2065 | Duration 43,6. Gatilho venda 6,0% validado (+39,5% liq). Compra: DCA ate 5% se taxa >= 6,5% |

---

## Historico Superado

| Data | Decisao | Por que superada |
|------|---------|-----------------|
| 2026-03 | IPCA+ estrutural apenas aos 48 | Antecipado: janela 7%+ excepcional justificou DCA imediato |
| 2026-03-18 | IPCA+ 10%, ladder 2035/2040/2050 | NTN-B 2035 Principal descontinuado fev/2025. Ladder → concentrado no 2040 |
| 2026-03-20 | Piso 6.0% (versão inicial) | Superado na mesma sessão por breakeven recalculado para 6.4% |
| 2026-03-20 | Piso 6.4%, teto 20% | HD-006 final: breakeven all-in correto é ~5.5%, piso revisado para 6.0% com custos equity incluídos |
| 2026-03 | Selic 0% agora, 5% aos 50 | Substituído por IPCA+ curto 3% (~2 anos duration) — melhor proteção inflacionária |

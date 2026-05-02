# Memoria: Especialista em Ativos de Risco

> Somente decisoes confirmadas por Diego sao registradas aqui.

---

## Decisoes Confirmadas

| Data | Decisao | Racional | Agentes Consultados |
|------|---------|----------|---------------------|
| 2026-03 | HODL11 alvo 3%, piso 1,5%, teto 5% | Sizing disciplinado de posicao especulativa | 01 Head |
| 2026-03-24 | **Renda+ 2065: teto 5%, DCA ativo >= 6.5%** | EV 42.1% em N=3 (~12.6%/a) supera equity BRL por 1.4-2.1pp/a. P(ganho)=86%. Simulação completa 8 cenários em `agentes/contexto/renda-plus-2065-cenarios.md`. Ordem de prioridade de aportes: **IPCA+ longo → Renda+ 2065 → equity (SWRD/AVGS/AVEM conforme drift)**. RF estrutural e tático primeiro (janelas de taxa abertas), depois equity. | 03 RF, 14 Quant |
| 2026-03 | Renda+ 2065 gatilho de venda: 6,0% | Rentabilidade nos cenarios precisa ser calculada (RF-001) | 03 Fixed Income |
| 2026-03 | Saida total cripto apenas se tese quebrar | Regulacao confiscatoria OU falha de protocolo | 01 Head |
| 2026-03 | Teto absoluto do bloco de risco: 10% do patrimonio | Disciplina — pode ser revisto se fizer sentido | 01 Head |
| 2026-03 | Mandato de observacao tatica mensal | Buscar oportunidades com evidencia cientifica, trazer ao Head | 01 Head |

---

## Status Atual das Posicoes

| Posicao | % Patrimonio | Valor Aprox | Status |
|---------|-------------|-------------|--------|
| HODL11 | 3,2% | ~R$112k | Dentro da faixa (1,5%-5%) |
| Renda+ 2065 | 3,2% | R$111.992 | Taxa ~7%+. Gatilho compra ativo — ir ate 5% |

---

## Gatilhos Ativos

| Gatilho | Condicao | Acao | Status |
|---------|----------|------|--------|
| HODL11 compra | Alocacao < 1,5% | Comprar ate 3% | Monitorando trimestral |
| HODL11 venda | Alocacao > 5% | Rebalancear para 3% | Monitorando trimestral |
| Renda+ compra | Taxa >= 6,5% | DCA em 3 tranches ate 5% do patrimonio | **Ativo** |
| Renda+ venda | Taxa <= 6,0% | Vender posicao inteira (marcacao a mercado) | Monitorando mensal |
| Renda+ panico | Taxa sobe para 9%+ | NAO vender — manter pelo carrego IPCA+6,87% | — |

---

## Stress Test Soberano BR (RK-001, 2026-03-20)

### Drawdown Map

| Cenario | Bloco Soberano | Carteira Total |
|---------|---------------|----------------|
| 1 — Fiscal BR (2015 style) | -18,2% do bloco (-R$83k) | -6,8% a -11,3% |
| 2 — Risk-off global (2022 style) | -11,8% do bloco (-R$54k) | -25,4% |
| 3 — Worst case (ambos) | -23,4% do bloco (-R$107k) | -24,5% (BRL) |

### Conclusoes Chave
- Risco dominante da carteira e equity (~79%), NAO bloco soberano
- IPCA+ 2040 hold-to-maturity: risco de credito (baixo). Renda+ 2065: risco de mercado (alto). Naturezas diferentes
- FIRE sobrevive ao worst case com folga (horizonte 11 anos + aportes R$25k/mes)
- **Bloco soberano atual: ~21%** (IPCA+ longo 15% + Renda+ ~3% + Reserva ~2.5%). Threshold de review ja atingido.
- Se bloco soberano > 15%: review obrigatorio de sizing — **ALERTA ATIVO**

### Alerta de Concentracao Soberana (aprendizado retro 2026-03-22)
Com IPCA+ longo aprovado em 15%, bloco soberano subiu de ~13% para ~21% — ultrapassando o proprio threshold de review definido pelo Risco. A regra existia, nao foi aplicada na decisao que a ativou. Regra agora: sempre que uma decisao de aporte/alocacao elevar o bloco soberano acima de 15%, emitir alerta explicito ao Head antes de aprovar.

### Withdrawal Rules (proposta — pendente confirmacao Diego)
1. NUNCA liquidar Renda+ e IPCA+ no mesmo trimestre
2. Prioridade de liquidacao: Reserva 2029 > IPCA+ 2040 > Renda+ 2065
3. Renda+ taxa 9%+: NUNCA vender (manter pelo carrego)
4. Necessidade de liquidez: equity global primeiro

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03 | HODL11 sizing e bandas | Alvo 3%, piso 1,5%, teto 5% |
| 2026-03 | Renda+ 2065 como posicao tatica | Gatilho de venda em 6,0% (RF-001 para cenarios) |
| 2026-03-18 | RF-001: duration corrigida e sizing | Duration 43,6 (nao 36,5). Compra DCA ate 5% se taxa >= 6,5%. Drawdown worst case (8%): -38,6% |
| 2026-03 | Condicoes de saida total cripto | Regulacao confiscatoria OU falha de protocolo |
| 2026-03 | Teto do bloco de risco | 10% do patrimonio |
| 2026-03-20 | RK-001: Stress test soberano BR | 3 cenarios modelados. Bloco soberano 13% aceitavel. IPCA+ 7% sizing adequado. Withdrawal rules propostas |

---

## Auto-Crítica Datada (extraído do perfil em 2026-05-01)

### Erros conhecidos (retro 2026-03-19)
- Nao checou Renda+ pos-corte da Selic — deveria ter alertado proativamente

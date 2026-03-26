# Previsoes Ativas

> Decisoes que tem resultado esperado, prazo e probabilidade estimada.
> Atualizado em: 2026-03-26 (HD-scorecard)

---

## Objetivo

Registrar previsoes implicitas em cada decisao ativa da carteira. Quando o prazo vencer, avaliar: a previsao estava certa? Se nao, o que errou? Isso calibra a confianca do sistema ao longo do tempo.

---

## Previsoes Abertas

### PRV-001: IPCA+ 2040 DCA — Taxa Media >= 6.5%

| Campo | Valor |
|-------|-------|
| **Decisao** | DCA em IPCA+ 2040 (80%) + 2050 (20%), ate atingir 15% do portfolio |
| **Previsao** | Taxa media de compra >= 6.5% real |
| **Prazo** | Jun 2026 (first tracking checkpoint) |
| **Confianca** | Alta (~80%) |
| **Racional** | Taxa atual 7.16% (2026-03-26). Selic em 14.25%, sem sinais de corte iminente. IPCA pressionado. Taxas reais devem permanecer elevadas ate pelo menos jun 2026 |
| **Cenario de falha** | Corte surpresa de Selic, ou sinalizacao forte de fiscal responsavel pelo governo, comprimindo taxas reais abaixo de 6.5% |
| **Gatilho de parada** | Se taxa cair abaixo de 6.0% (piso operacional), pausar DCA e redirecionar aportes para JPGL |
| **Agente dono** | 03 Renda Fixa |
| **Status** | Aberta — DCA ativo |

**Tracking:**

| Data | Taxa IPCA+ 2040 | Tranche | Valor | Taxa Media Acum |
|------|----------------|---------|-------|----------------|
| 2026-03-20 | 7.36% | — | — | — |
| 2026-03-26 | 7.16% | — | — | — |

> Nota: taxa caiu 20bps desde T0 (7.36% -> 7.16%), mas ainda muito acima do piso de 6.0%. DCA continua conforme. Proxima verificacao: check-in mensal Abr/2026.

---

### PRV-002: Renda+ 2065 — Taxa Cai para <= 6.0%

| Campo | Valor |
|-------|-------|
| **Decisao** | DCA pausado (taxa abaixo de 6.5%). Vender tudo se taxa <= 6.0% (ganho MtM) |
| **Previsao** | Taxa cai para <= 6.0% em 12-18 meses |
| **Prazo** | Mar 2027 - Set 2027 |
| **Confianca** | Baixa-Media (40-55%) |
| **Racional** | Ciclo de Selic eventualmente reverte. Se economia desacelerar, taxas longas caem. Mas risco fiscal pode manter taxas elevadas por mais tempo. Duração 43.6 anos — alta sensibilidade a variacao de taxa |
| **Cenario de falha** | Risco fiscal se materializa, Selic fica alta por 2+ anos, taxas longas sobem para 8%+ |
| **Regra de saida** | Aguardar 720 dias se holding < 2 anos (carry domina reducao de IR). Se taxa >= 9%: manter pelo carrego |
| **Agente dono** | 03 Renda Fixa |
| **Status** | Aberta — monitorando mensalmente |

**Tracking:**

| Data | Taxa Renda+ 2065 | Status | Acao |
|------|-----------------|--------|------|
| 2026-03-20 | 7.10% | Longe do gatilho de venda (6.0%) | Nenhuma |
| 2026-03-26 | ~7.1% (estimado — verificar no check-in) | Longe do gatilho | Nenhuma |

> Nota: DCA parado (taxa < 6.5%). Posicao atual ~3.2% do portfolio. Gatilho de compra: taxa >= 6.5%. Gatilho de venda: taxa <= 6.0%.

---

### PRV-003: JPGL Gap Fecha em 27-30 Meses

| Campo | Valor |
|-------|-------|
| **Decisao** | Aportes prioritarios em JPGL ate gap fechar (alvo 20% do bloco equity = ~15.8% do portfolio) |
| **Previsao** | Gap atual (-19.7%) cai para < 2% em 27-30 meses |
| **Prazo** | Jun-Set 2028 |
| **Confianca** | Media (~60%) |
| **Racional** | Aporte R$25k/mes, ~70-80% para JPGL apos IPCA+ DCA. Se IPCA+ DCA consume ~R$8k/mes, sobra ~R$17k/mes para JPGL. Gap atual: ~R$608k (20% de R$3.5M equity = R$700k target, atual R$11k). A R$17k/mes: ~36 meses. Com crescimento do portfolio, alvo e movel |
| **Cenario de falha** | Aportes desviados para outras oportunidades; patrimonio cresce rapido e 20% se torna alvo movel; JPGL fecha (AUM EUR 245M — monitorar) |
| **Agente dono** | 02 Factor |
| **Status** | Aberta — gap 19.7% |

**Tracking:**

| Data | JPGL Valor | JPGL % | Gap vs 20% equity | Aporte Mes |
|------|-----------|--------|--------------------|-----------|
| 2026-03-20 | R$ 11.383 | 0.3% | -19.7% | — |
| 2026-03-26 | R$ 11.383 (estimado — sem novo aporte confirmado) | ~0.3% | ~-19.7% | — |

> Nota: proxima atualizacao no checkin-automatico M1 de Abr/2026.

---

## Previsoes Encerradas

| ID | Previsao | Resultado | Acerto? | Data Encerramento |
|----|----------|-----------|---------|-------------------|
| — | — | — | — | — |

---

## Metricas de Calibracao

| Metrica | Valor atual | Meta |
|---------|------------|------|
| Total abertas | 3 | — |
| Total encerradas | 0 | — |
| Taxa de acerto | N/A (sem encerradas) | >= 60% |
| Confianca media vs acerto real | N/A | Calibrado (80% conf = ~80% acerto) |

---

## Regras

1. **Toda decisao ativa tem previsao implicita**: Se aprovamos algo, estamos prevendo um resultado. Registrar.
2. **Prazo obrigatorio**: Previsao sem prazo nao e previsao, e wishful thinking.
3. **Confianca obrigatoria**: Estimar probabilidade, mesmo que imprecisa. Permite calibracao futura.
4. **Tracking trimestral**: Atualizar dados de cada previsao a cada trimestre.
5. **Post-mortem ao encerrar**: Quando o prazo vencer, avaliar: acertou? Se nao, por que? Registrar.
6. **Sem revisao de confianca retroativa**: Uma vez registrada, a confianca inicial nao muda. Isso permite avaliar calibracao real.

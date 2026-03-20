# Previsoes Ativas

> Decisoes que tem resultado esperado, prazo e probabilidade estimada.
> Atualizado em: 2026-03-20

---

## Objetivo

Registrar previsoes implicitas em cada decisao ativa da carteira. Quando o prazo vencer, avaliar: a previsao estava certa? Se nao, o que errou? Isso calibra a confianca do sistema ao longo do tempo.

---

## Previsoes Abertas

### PRV-001: IPCA+ 2040 DCA — Taxa Media >= 6.5%

| Campo | Valor |
|-------|-------|
| **Decisao** | DCA em 2-3 tranches de IPCA+ 2040, mar-jun 2026 |
| **Previsao** | Taxa media de compra >= 6.5% real |
| **Prazo** | Jun 2026 |
| **Confianca** | Alta (~80%) |
| **Racional** | Taxa atual 7.36% (20/mar/2026). Selic em 14.25%, sem sinais de corte iminente. IPCA pressionado. Taxas reais devem permanecer elevadas ate pelo menos jun 2026 |
| **Cenario de falha** | Corte surpresa de Selic, ou sinalizacao forte de fiscal responsavel pelo governo, comprimindo taxas reais abaixo de 6.5% |
| **Agente dono** | 03 Renda Fixa |
| **Status** | Aberta — 0/3 tranches executadas |

**Tracking:**

| Data | Taxa no momento | Tranche | Valor | Taxa Media Acum |
|------|----------------|---------|-------|----------------|
| 2026-03-20 | IPCA+ 7.36% | — | — | — |

---

### PRV-002: Renda+ 2065 — Taxa Cai para <= 6.0%

| Campo | Valor |
|-------|-------|
| **Decisao** | DCA parado. Vender tudo se taxa <= 6.0% (ganho MtM) |
| **Previsao** | Taxa cai para <= 6.0% em 12-18 meses |
| **Prazo** | Mar 2027 - Set 2027 |
| **Confianca** | Baixa-Media (40-55%) |
| **Racional** | Ciclo de Selic eventualmente reverte. Se economia desacelerar, taxas longas caem. Mas risco fiscal pode manter taxas elevadas por mais tempo |
| **Cenario de falha** | Risco fiscal se materializa, Selic fica alta por 2+ anos, taxas longas sobem para 8%+ |
| **Agente dono** | 03 Renda Fixa |
| **Status** | Aberta — monitorando mensalmente |

**Tracking:**

| Data | Taxa Renda+ 2065 | Status | Acao |
|------|-----------------|--------|------|
| 2026-03-20 | 7.10% | Longe do gatilho | Nenhuma |

---

### PRV-003: JPGL Gap Fecha em 27-30 Meses

| Campo | Valor |
|-------|-------|
| **Decisao** | Aportes prioritarios em JPGL ate gap fechar |
| **Previsao** | Gap atual (-19.7%) cai para < 2% em 27-30 meses |
| **Prazo** | Jun-Set 2028 |
| **Confianca** | Media (~60%) |
| **Racional** | Aporte R$25k/mes, ~80-90% para JPGL apos IPCA+ DCA concluido. R$11.4k atual -> precisa chegar a ~R$620k (20% de patrimonio projetado ~R$3.1M equity). Delta ~R$608k / ~R$22k/mes = ~28 meses |
| **Cenario de falha** | Aportes desviados para outras oportunidades (HODL11 piso, Renda+ reaberto), ou patrimonio cresce rapido e 20% se torna alvo movel |
| **Agente dono** | 02 Factor |
| **Status** | Aberta — gap 19.7% |

**Tracking:**

| Data | JPGL Valor | JPGL % | Gap vs 20% | Aporte Mes |
|------|-----------|--------|------------|-----------|
| 2026-03-20 | R$ 11,383 | 0.3% | -19.7% | — |

---

## Previsoes Encerradas

| ID | Previsao | Resultado | Acerto? | Data Encerramento |
|----|----------|-----------|---------|-------------------|
| — | — | — | — | — |

---

## Metricas de Calibracao

| Metrica | Valor T0 | Meta |
|---------|---------|------|
| Total abertas | 3 | — |
| Total encerradas | 0 | — |
| Taxa de acerto | N/A | >= 60% |
| Confianca media vs acerto real | N/A | Calibrado (80% conf = ~80% acerto) |

---

## Regras

1. **Toda decisao ativa tem previsao implicita**: Se aprovamos algo, estamos prevendo um resultado. Registrar.
2. **Prazo obrigatorio**: Previsao sem prazo nao e previsao, e wishful thinking.
3. **Confianca obrigatoria**: Estimar probabilidade, mesmo que imprecisa. Permite calibracao futura.
4. **Tracking trimestral**: Atualizar dados de cada previsao a cada trimestre.
5. **Post-mortem ao encerrar**: Quando o prazo vencer, avaliar: acertou? Se nao, por que? Registrar.
6. **Sem revisao de confianca retroativa**: Uma vez registrada, a confianca inicial nao muda. Isso permite avaliar calibracao real.

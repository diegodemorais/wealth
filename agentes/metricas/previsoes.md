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
| **Gatilho de parada** | Se taxa cair abaixo de 6.0% (piso operacional), pausar DCA e redirecionar aportes para **SWRD** (JPGL eliminado em 2026-04-01) |
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

---

## Previsoes Encerradas

| ID | Previsao | Resultado | Acerto? | Data Encerramento | Motivo encerramento |
|----|----------|-----------|---------|-------------------|--------------------|
| PRV-003 | JPGL gap fecha em 27-30 meses via aportes | Gap não fechou por aporte — JPGL eliminado (target 0%) | Acerto na decisão, não na trajetória | 2026-04-01 | Mudança de tese: FI-jpgl-zerobased elimineu o target. Gap "fechou" porque o alvo foi removido. |

---

## Metricas de Calibracao

| Metrica | Valor atual | Meta |
|---------|------------|------|
| Total abertas | 2 | — |
| Total encerradas | 1 | — |
| Taxa de acerto | N/A (PRV-003 encerrada por mudança de tese, não avaliável) | >= 60% |
| Confianca media vs acerto real | N/A | Calibrado (80% conf = ~80% acerto) |

---

## Regras

1. **Toda decisao ativa tem previsao implicita**: Se aprovamos algo, estamos prevendo um resultado. Registrar.
2. **Prazo obrigatorio**: Previsao sem prazo nao e previsao, e wishful thinking.
3. **Confianca ponderada — votação do time**: A confiança não é estimada por 1 agente sozinho. É uma votação ponderada dos agentes com expertise no domínio:
   - Cada agente vota: `Alta (~80%)`, `Média (40-60%)` ou `Baixa (<40%)`
   - Pesos: especialista do domínio 3x, adjacente 2x, Head/generalistas 1x
   - Confiança final = média ponderada das estimativas
   - Registrar dissent se houver divergência relevante (ex: Factor diz Alta, RF diz Baixa)
4. **Tracking trimestral**: Atualizar dados de cada previsao a cada trimestre.
5. **Post-mortem ao encerrar**: Quando o prazo vencer, avaliar: acertou? Se nao, por que? Registrar.
6. **Sem revisao de confianca retroativa**: Uma vez registrada, a confianca inicial nao muda. Isso permite avaliar calibracao real.

## Template de Nova Previsão

```
| Campo | Valor |
|-------|-------|
| **Decisao** | ... |
| **Previsao** | ... |
| **Prazo** | ... |
| **Confianca** | ... |
| **Racional** | ... |
| **Cenario de falha** | ... |
| **Condição de encerramento por mudança de tese** | [critério explícito — ex: "se o target do ativo for removido, a previsão é encerrada como mudança de tese, não como erro de previsão"] |
| **Agente dono** | ... |
| **Status** | ... |
```

> **Regra L-22 (2026-04-01):** Toda nova previsão DEVE definir explicitamente a condição de encerramento por mudança de tese. Sem esse campo, o encerramento retroativo fica ambíguo (acerto vs abandono). Caso: PRV-003 encerrada porque JPGL foi eliminado — o campo teria deixado o critério claro desde a abertura.

---

## Template de Votação de Confiança (preencher ao abrir cada PRV)

```
| Agente | Peso | Estimativa | Justificativa |
|--------|------|-----------|---------------|
| {especialista} | 3x | Alta/Média/Baixa | ... |
| {adjacente} | 2x | Alta/Média/Baixa | ... |
| Head | 1x | Alta/Média/Baixa | ... |
| **Confiança ponderada** | | **X%** | |
| Dissent | | {agente divergente}: {posição} | |
```

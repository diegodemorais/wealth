# RF-001-Renda_plus_rentabilidade_cenarios_queda

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | RF-001-Renda_plus_rentabilidade_cenarios_queda |
| **Dono** | 03 Renda Fixa |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 06 Risco, 08 Macro |
| **Dependencias** | — |
| **Criado em** | 2026-03-18 |
| **Origem** | Conversa — revisao do perfil do agente 03 |
| **Concluido em** | 2026-03-18 |

---

## Motivo / Gatilho

O gatilho de venda do Renda+ 2065 esta definido em taxa = 6,0%, mas usamos apenas a regra de bolso (queda em pp x duration ~47) como aproximacao. Precisamos de calculo rigoroso para validar se o gatilho esta correto e qual a rentabilidade real esperada.

---

## Descricao

Modelar a rentabilidade do Renda+ 2065 em diferentes cenarios de queda de juros reais, considerando duration, convexidade, tempo, tributacao e custo de oportunidade vs equity.

---

## Escopo

- [x] Levantar taxa atual do Renda+ 2065 (via Tesouro Direto)
- [x] Calcular duration modificada real (nao apenas aproximada)
- [x] Avaliar efeito de convexidade em movimentos grandes (>1pp)
- [x] Modelar cenarios: 8,0%->6,0%, 7,5%->6,0%, 7,0%->6,0%, cenarios intermediarios
- [x] Estimar tempo ate o gatilho em cada cenario (custo de oportunidade)
- [x] Calcular tributacao (15% sobre ganho nominal) e rentabilidade liquida
- [x] Comparar com manter em equity no mesmo periodo (retorno esperado after-tax)
- [x] Validar se 6,0% e realmente o gatilho otimo ou se deveria ser ajustado

---

## Analise

### Duration e Convexidade

O Renda+ 2065 paga renda mensal de jan/2065 a dez/2084 (240 fluxos). Na fase de acumulacao funciona como portfolio de 240 zero-coupon bonds reais.

- **Macaulay Duration**: 46,6 anos (centro de gravidade dos fluxos em ~2075)
- **Modified Duration**: 43,6 anos
- **Convexidade**: 1.969 anos² (extremamente alta)

Nota: estimativa anterior de ~36,5 (agente 06) tratava como zero-coupon unico em 2065. Corrigido.

### Cenarios de Rentabilidade (partindo de IPCA + 6,87%, R$ 111.992)

| Cenario | Taxa | Var. Bruta | Com Convexidade | Ganho/Perda Liq. (15% IR) |
|---------|------|-----------|-----------------|--------------------------|
| **Gatilho venda** | 6,0% | +37,9% | **+46,5%** | **+R$ 44.272 (+39,5%)** |
| Otimista | 5,5% | +59,7% | **+82,9%** | +R$ 78.914 (+70,5%) |
| Adverso | 7,5% | -27,5% | **-23,9%** | -R$ 26.786 |
| Pessimista | 8,0% | -49,3% | **-38,6%** | -R$ 43.275 |
| Carrego 12m | 6,87% | +6,87% real | +6,87% real | +R$ 5.740 (+5,1% real liq.) |

Convexidade positiva adiciona +8,6pp no gatilho e protege -3,6pp no cenario adverso.

### Custo de Oportunidade vs Equity (JPGL)

| Estrategia | Retorno Real Liq. 12m |
|------------|----------------------|
| Renda+ carrego puro | +5,1% |
| Renda+ gatilho 6,0% (mark-to-market) | +39,5% |
| JPGL conservador | +4,0% |
| JPGL otimista | +4,8% |

Carrego do Renda+ e ligeiramente superior a equity. Mark-to-market no gatilho e ~8x o retorno de equity.

### Cenario Macro e Timing

- Selic: 15% (pico). COPOM iniciando cortes. Focus: 12,25% fim 2026, 10,50% fim 2027.
- Cenario base (50-55%): taxa do Renda+ chega a 6,0% em 12-18 meses (2027)
- Cenario otimista (15-20%): chega a 5,5% em 18-24 meses (gov com agenda fiscal)
- Cenario pessimista (25-30%): taxa sobe para 8%+ (fiscal deteriora, ciclo abortado)
- Historico: no ciclo 2016-18, taxa real longa caiu de 7% para 6% em 6-12 meses
- Risco principal: fiscal (divida/PIB 82%+ em 2026, trajetoria ascendente)

### Validacao do Gatilho 6,0%

Gatilho **VALIDADO**. Razoes:
1. Captura 56% do ganho maximo provavel (39,5% liq. vs 70,5% se esperasse ate 5,5%)
2. Custo de oportunidade de ~0,45%/mes em equity nao aportado apos 6,0%
3. Taxa de 6,0% esta na media historica (~51% dos dias) — cenario provavel
4. Assimetria favoravel: ganho (+39,5%) e 1,65x a perda do cenario adverso (-23,9%)

---

## Conclusao

### Gatilhos Definitivos

| Gatilho | Condicao | Acao | Limite |
|---------|----------|------|--------|
| **Compra** | Taxa >= 6,5% | DCA em 3 tranches mensais | Ate 5% do patrimonio (~R$ 174k) |
| **Venda** | Taxa <= 6,0% | Vender tudo — marcacao a mercado | Posicao inteira |
| **Panico** | Taxa sobe para 9%+ | NAO vender — manter pelo carrego (IPCA+6,87%) | Sem stop loss |

### Numeros-chave
- Duration modificada: 43,6 anos
- Ganho esperado no gatilho de venda: +46,5% bruto / +39,5% liquido
- Cenario base: gatilho em 12-18 meses (2027)
- Posicao maxima: 5% do patrimonio (hoje 3,2%, faltam ~R$ 62k)

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Renda+ 2065: max 5% do patrimonio (de 3,2% atual) |
| **Estrategia** | Compra: DCA 3 tranches se taxa >= 6,5%. Venda: tudo a taxa <= 6,0% |
| **Conhecimento** | Duration modificada = 43,6. Convexidade = 1.969. Tabela de cenarios calculada |
| **Memoria** | Atualizar agentes 03, 06, 08 |

---

## Proximos Passos

- [x] Registrar conclusoes nas memorias dos agentes
- [ ] Executar 1a tranche de compra (proximo aporte)

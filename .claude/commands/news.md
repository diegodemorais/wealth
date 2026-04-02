# News Monitor — Carteira Diego

Voce e o Head (00) rodando um scan de noticias relevantes para a carteira de Diego. Filtra ruido, contextualiza vs posicoes reais e identifica impactos acionaveis.

## Objetivo

Buscar noticias das ultimas 72h que impactam diretamente a carteira. Nao e newsletter — e filtro de materialidade.

## Principio: Sinal vs Ruido

**REPORTAR** (sinal):
- Decisoes de politica monetaria (COPOM, Fed, ECB, BoJ)
- Mudancas em taxas reais (IPCA+ no Tesouro, yields globais)
- Eventos geopoliticos com impacto em mercados (guerras, sancoes, embargos, tarifas)
- Legislacao tributaria que afeta a carteira (IR, IOF, estate tax)
- Movimentos extremos (>3% intraday em indices, >5% em BRL/USD, >10% em BTC)
- Mudancas em indices/ETFs relevantes (recomposicao, fusao, fechamento, reducao de TER)
- Dados macro relevantes (IPCA, PIB, payroll, CPI)
- Noticias especificas de ETFs da carteira (AVGS, AVEM, SWRD): novos lotes, mudanca de provedor, eventos societarios

**IGNORAR** (ruido):
- "Mercado sobe/desce 1%"
- Opiniao de economista/influencer sem dados
- Previsoes sem base em dados
- Noticias sobre ativos que Diego nao tem
- Repeticoes da mesma noticia em fontes diferentes

## Como Executar

### Passo 1: Ler contexto da carteira

Ler em paralelo:
- `agentes/contexto/carteira.md` (posicoes e gatilhos)
- `agentes/memoria/08-macro.md` (ultimo snapshot macro)
- `agentes/memoria/06-risco.md` (gatilhos HODL11 e Renda+)
- `agentes/contexto/execucoes-pendentes.md`

### Passo 2: Buscar noticias por area de impacto

Executar WebSearch em paralelo para cada area. Substituir `{mes}` e `{ano}` pelo mes e ano atuais em cada query.

**Renda Fixa Brasil (IPCA+ longo, Renda+ 2065, Selic)**:
- "Tesouro IPCA+ taxa hoje {mes} {ano}"
- "COPOM Selic decisao {mes} {ano}"
- "Renda+ 2065 taxa"
- "risco fiscal Brasil {mes} {ano}"

**Equity Global (SWRD, AVGS, AVEM)**:
- "global stock market news this week"
- "emerging markets equities {mes} {ano}"
- "small cap value stocks performance"
- "MSCI World ACWI weekly"
- "Avantis ETF news {ano}"

**Cambio (BRL/USD)**:
- "dolar real cotacao hoje"
- "BRL USD forecast {mes} {ano}"
- "IOF cambio mudanca"

**Cripto (HODL11, BTC)**:
- "Bitcoin price this week"
- "HODL11 cotacao B3"
- "crypto regulation Brazil {ano}"

**Geopolitica / Macro Global**:
- "Fed interest rate decision {mes} {ano}"
- "geopolitical risk markets {mes} {ano}"
- "trade war tariffs {ano}"

**Tributacao / Regulacao**:
- "imposto investimentos exterior Brasil {ano}"
- "Lei 14.754 regulamentacao"
- "estate tax changes {ano}"

### Passo 3: Filtrar por materialidade

Para cada noticia encontrada, aplicar o filtro:

1. **Afeta algum ativo da carteira?** Se nao → descartar
2. **Muda algum cenario ou premissa?** (Selic, IPCA, risk premium, taxa real)
3. **Ativa ou aproxima algum gatilho?**
   - IPCA+ < 6,0%? (pausar DCA)
   - Renda+ 2065 <= 6,0%? (vender) ou >= 6,5%? (comprar)
   - HODL11 < 1,5% ou > 5%?
   - Drift de alocacao > 5pp?
   - BRL deprecia > 10% sustentado?
   - CDS Brasil 5y >= 500bps (alerta) ou >= 800bps (alarme)?
4. **E acionavel?** Se so contexto sem acao → marcar como "monitorar"

### Passo 4: Classificar impacto

Para cada noticia que passou no filtro:

| Nivel | Criterio | Exemplo |
|-------|----------|---------|
| ALTO | Gatilho ativado ou premissa invalidada | IPCA+ caiu para 5,8%, pausar DCA |
| MEDIO | Mudanca de cenario que pode ativar gatilho em semanas | Selic cortada mais que esperado |
| BAIXO | Contexto relevante, sem acao imediata | EM underperformance moderada |
| MONITORAR | Tendencia que merece acompanhamento | Proposta de mudanca tributaria |

### Passo 5: Apresentar report

Formato:

```
## News Monitor — {data}

### Resumo Executivo
{1-2 frases: o que aconteceu e se muda algo na carteira}
{Se nao houve noticias materiais: "Sem eventos materiais nas ultimas 72h. Proximos eventos: [lista]."}

### Noticias Relevantes

| # | Noticia | Area | Impacto | Nivel | Acao | Fonte |
|---|---------|------|---------|-------|------|-------|

### Gatilhos — Status
| Gatilho | Valor Atual | Threshold | Status |
|---------|-------------|-----------|--------|
| IPCA+ 2040 taxa | X% | >= 6,0% (DCA ativo) | OK/ALERTA |
| Renda+ 2065 taxa | X% | <= 6,0% (venda) / >= 6,5% (compra) | OK/ALERTA |
| HODL11 % carteira | X% | 1,5% - 5,0% | OK/ALERTA |
| CDS Brasil 5y | Xbps | >= 500bps (alerta) / >= 800bps (alarme) | OK/ALERTA |
| Drift max bucket | X pp | > 5pp | OK/ALERTA |
| BRL/USD | R$ X | depreciacao > 10% | OK/ALERTA |

### Cenario Macro Atualizado
{Mudou algo vs ultimo snapshot em agentes/memoria/08-macro.md? Se sim, o que. Se nao, "Sem mudanca material."}

### Proximos Eventos a Monitorar
{Datas relevantes: COPOM, IPCA, Fed, payroll, vencimento de titulos, etc}
```

### Passo 6: Acionar agentes se necessario

- **Gatilho ALTO ativado** → Acionar Head para decisao imediata
- **Mudanca macro relevante** → Atualizar `agentes/memoria/08-macro.md`
- **Nada material** → Apenas reportar, sem alterar arquivos

## Regras

- Ser conciso — report deve caber em 2 telas no maximo
- Sem opiniao propria — apenas fatos e dados com fonte
- Sempre citar fonte (mesmo que resumida: "Bloomberg via InfoMoney", "Tesouro Direto")
- Se nao encontrar dados atualizados (ex: final de semana), usar ultimos disponiveis + indicar data
- Frequencia recomendada: 2-3x por semana, ou sob demanda em periodos de stress
- NAO atualizar arquivos da carteira sem aprovacao do Diego
- Priorizar impacto sobre volume — melhor 3 noticias relevantes que 15 genericas

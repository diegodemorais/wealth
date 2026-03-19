# Check-in Semanal do Bookkeeper

Voce e o Bookkeeper (13) rodando um check-in semanal da carteira de Diego. Este command e compativel com `/loop` para construcao automatica de historico.

## Objetivo

Reconciliar posicoes com a planilha Google Sheets, verificar execucoes pendentes, gatilhos, drift, e dados macro.

## Como Executar

### Passo 1: Buscar dados da planilha

Acessar a planilha do Google Sheets e extrair posicoes atuais:

```
URL base: https://docs.google.com/spreadsheets/d/1LmxgmvIoGut6Bfzj7ibhXtFuR1H7cIPcJOkVmiTuzZs

Aba Utils (posicoes reais): /gviz/tq?tqx=out:csv&sheet=Utils&range=A46:Z94
Aba Aporte (aportes): /gviz/tq?tqx=out:csv&sheet=Aporte
Aba Evolução (targets): /gviz/tq?tqx=out:csv&sheet=Evolução
```

Extrair via WebFetch:
- Posicao de cada ETF em USD (aba Utils, linhas 46-94)
- Patrimonio total e % por bucket
- Cambio de referencia

### Passo 2: Ler estado interno

Ler em paralelo:
- `agentes/contexto/execucoes-pendentes.md`
- `agentes/contexto/carteira.md`
- `agentes/contexto/operacoes.md`
- `agentes/memoria/08-macro.md` (snapshot macro)
- `agentes/memoria/06-risco.md` (gatilhos Renda+ e HODL11)
- `agentes/memoria/13-bookkeeper.md` (ultima reconciliacao)

### Passo 3: Reconciliar

Comparar dados da planilha com carteira.md:
- Posicoes mudaram? (novo aporte, valorizacao/desvalorizacao)
- Patrimonio total atualizado
- Cambio mudou?
- Algum ETF novo apareceu ou sumiu?

### Passo 4: Verificar

1. **Execucoes pendentes**: alguma decisao aprovada esta atrasada?
2. **Gatilhos**: algum gatilho atingido ou proximo?
   - HODL11 < 1,5% ou > 5%?
   - Renda+ 2065 taxa <= 6,0% (venda) ou >= 6,5% (compra)?
   - Drift de alocacao > 5pp em algum bucket?
3. **Dados macro**: buscar via WebSearch as taxas atuais (Selic, IPCA+ 2040, Renda+ 2065, BRL/USD, BTC)
4. **Aporte mensal**: R$25k do mes ja foi feito?

### Passo 5: Report

Formato conciso:

```
## Check-in Semanal — {data}

### Reconciliacao (planilha vs sistema)
| Bucket | Planilha | Sistema | Delta |
|--------|----------|---------|-------|

Patrimonio total: R$ X (planilha) vs R$ Y (sistema)
Cambio: R$ X

### Execucoes Pendentes
{status de cada execucao — dias restantes do prazo}

### Gatilhos
{status de cada gatilho — OK ou ALERTA}

### Snapshot Macro Rapido
| Indicador | Valor | Variacao vs anterior |
|-----------|-------|---------------------|

### Aporte do Mes
{feito ou pendente — destino, valor}

### Alertas
{qualquer coisa que precisa de atencao}
```

### Passo 6: Registrar

- Atualizar `agentes/memoria/13-bookkeeper.md` com nova reconciliacao
- Se posicoes mudaram significativamente (>2%), atualizar `agentes/contexto/carteira.md` (pedir aprovacao do Diego antes)
- Se dados macro mudaram, atualizar `agentes/memoria/08-macro.md`
- Se gatilho foi atingido, alertar no report
- Registrar operacoes novas em `agentes/contexto/operacoes.md` se detectadas
- NAO tomar acoes — apenas reportar. Decisoes sao do Head e dos agentes especializados

## Regras

- Ser conciso — o check-in deve caber em uma tela
- Sempre comecar pela planilha — ela e a fonte primaria de posicoes
- Se a planilha nao estiver acessivel, reportar com ultimos dados + data
- Priorizar alertas sobre execucoes pendentes — decisao aprovada sem execucao e o maior risco operacional
- Comparar SEMPRE planilha vs sistema — divergencias sao red flags

# URGENTE: Obter dados IBKR reais — Pipeline bloqueado

**Status:** 🔴 CRÍTICO / BLOQUEADOR  
**Data de Criação:** 2026-04-25  
**Prioridade:** MÁXIMA  
**Dono:** Diego (obtenção de dados) + Dev (validação pipeline)

---

## Resumo

Main branch está com dados **incompletos e testes quebrando**. Pipeline de geração de dados está bloqueado esperando:

1. **Posições reais de IBKR** (SWRD, AVGS, AVEM, HODL11, RF)
2. **Histórico de aportes/contribuições** 
3. **Lotes IBKR com custo médio e P&L**

Sem esses dados:
- ❌ `patrimonio_financeiro` = R$0 (fallback)
- ❌ `backtest.metrics` = vazio
- ❌ `tax.ir_diferido` = R$0
- ❌ Testes falhando constantemente
- ❌ Dashboard mostrando dados fake

---

## Ação Imediata Necessária

### Opção A (Recomendado): IBKR Flex Query XML
```
1. Acesse: https://account.interactivebrokers.com/ → Account Management
2. Flex Queries → Create New (ou download existente)
3. Período: inception-to-date (todo histórico)
4. Inclua: Positions, Trades, Dividends
5. Exporte XML → envie para Dev
6. Dev carrega em: dados/ibkr/flex_query_YYYYMMDD.xml
```

### Opção B: IBKR Credenciais
```
1. IBKR_TOKEN (gerado em Account Management → Flex Query)
2. IBKR_QUERY_POSITIONS (ID da query existente)
3. Envie para Dev configurar em .env
4. Dev roda: python3 scripts/ibkr_sync.py
```

### Opção C: CSV Manual
```
Ticker,Quantidade,Preço_Médio,Valor_BRL
SWRD,1500,32.50,48750
AVGS,700,45.20,31640
AVEM,400,28.15,11260
...
```

---

## Timeline

- **HOJE (2026-04-25):** Diego fornece dados IBKR (qualquer formato acima)
- **HOJE +2h:** Dev carrega dados no pipeline
- **HOJE +4h:** `npm run test:pre-commit` passa
- **HOJE +6h:** Deploy automático corrige main
- **Semana que vem:** 2ª auditoria pode começar

---

## Bloqueador para:
- ✅ AUDITORIA-dashboard-fase2-2026-04-25.md (aguardando dados)
- ✅ Deploy automático (testes quebrados)
- ✅ Dashboard de produção (dados incompletos)

---

**Sem isso: impossível prosseguir.**

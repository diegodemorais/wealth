| Campo | Valor |
|-------|-------|
| ID | OPS-ibkr-flex-trades |
| Título | Configurar Flex Query de Trades na IBKR |
| Dono | Ops (Diego) |
| Status | ✅ Done |
| Concluída | 2026-04-22 |
| Prioridade | 🟡 Média |
| Criada | 2026-04-22 |

## Motivo

A Flex Query atual (ID 1461568) só retorna posições abertas, não trades. Precisamos de uma query de trades para manter os 213 lotes atualizados automaticamente via API.

## Passo a passo — IBKR pelo celular (ou browser)

### 1. Abrir o Client Portal

Acesse: **https://portal.interactivebrokers.com**

Login normal (user + senha + 2FA).

### 2. Ir para Flex Queries

Menu → **Performance & Reports** → **Flex Queries**

(No celular: menu hamburger ☰ no canto superior esquerdo → Performance & Reports → Flex Queries)

### 3. Criar nova query

Clique no **"+"** ou **"Create"** ao lado de "Activity Flex Query".

> **IMPORTANTE**: é "Activity Flex Query", não "Trade Confirmation Flex Query".

### 4. Configurar a query

| Campo | Valor |
|-------|-------|
| **Query Name** | `trades-api` (ou qualquer nome) |
| **Date Period** | **Last 365 Calendar Days** |
| **Format** | **XML** |

### 5. Selecionar seções

Na lista de seções, marque **APENAS**:

- ✅ **Trades** (obrigatório)
  - Dentro de Trades, deixe todos os campos marcados (ou pelo menos: Symbol, DateTime, Buy/Sell, Quantity, Price, Commission, Currency, ISIN)

Não precisa marcar: Open Positions, Cash Transactions, Dividends, etc. (a query de posições já cobre isso).

### 6. Salvar

Clique **Save** (ou **Continue** → **Create**).

A IBKR vai mostrar o **Query ID** — é um número tipo `1234567`.

### 7. Me passar o Query ID

Só me diz o número. Eu adiciono no `.env` e testo.

```
IBKR_QUERY_TRADES=<número que apareceu>
```

---

## Depois que Diego configurar

- [ ] Adicionar `IBKR_QUERY_TRADES=XXXXXX` ao `.env`
- [ ] Testar: `python3 scripts/ibkr_sync.py --trades`
- [ ] Integrar no `ibkr_lotes.py` com flag `--flex` para merge automático
- [ ] Incluir no `/scan` para manter lotes atualizados

## Nota

O token da API (`IBKR_TOKEN=933485...`) já está configurado e funcionando — testado hoje. Só falta a query de trades.

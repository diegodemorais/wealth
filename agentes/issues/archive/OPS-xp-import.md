# OPS-xp-import: Pipeline de Importação XP (Renda Fixa + HODL11)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | OPS-xp-import |
| **Dono** | Bookkeeper |
| **Status** | Backlog |
| **Prioridade** | 🟡 Média |
| **Participantes** | Bookkeeper, Dev, RF, Risco |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-09 |
| **Origem** | Conversa — Diego quer estruturar importação de dados XP como fez com IBKR |
| **Concluido em** | — |

---

## Motivo / Gatilho

O pipeline IBKR (ibkr_analysis.py + ibkr_sync.py) automatiza extração de lotes, dividendos, aportes e P&L para ETFs internacionais. Porém os ativos na XP (e Nubank) não têm pipeline equivalente:

- **HODL11** (XP/Nubank) — falta preço médio de compra, histórico de operações
- **Tesouro Direto** (IPCA+ 2029, 2040, 2050, Renda+ 2065) — falta histórico de compras, preço médio ponderado por título
- **Outros RF** — eventuais operações futuras

Sem esses dados, o dashboard mostra `null` para P&L de HODL11 e não tem rastreabilidade de RF.

---

## Descrição

Criar um pipeline similar ao IBKR para importação de dados da XP, cobrindo:
1. Parsing de extratos/notas de corretagem XP (CSV ou PDF)
2. Extração de: lotes de compra (data, qtd, preço, custo), vendas, proventos
3. Cálculo de preço médio ponderado por ativo
4. Output em JSONs estruturados (padrão `dados/xp/`)
5. Integração com `generate_data.py` para fluir para `data.json`

---

## Escopo

### Fase 1 — Manual estruturado (MVP)
- [ ] Definir formato de input: CSV da XP? Nota de corretagem PDF? Ou input manual estruturado (JSON)?
- [ ] Criar `dados/xp/` com estrutura de arquivos (lotes.json, operacoes.json)
- [ ] Criar `dados/xp/lotes.json` com schema compatível com ibkr/lotes.json
- [ ] Popular HODL11 avg_cost no dashboard_state.json (ativa P&L no dashboard)
- [ ] Popular RF compras (data, valor, taxa de compra por título)

### Fase 2 — Parser automatizado
- [ ] Criar `analysis/xp_analysis.py` (similar a ibkr_analysis.py)
- [ ] Parser de extrato XP CSV (formato a definir com Diego)
- [ ] Parser de nota de corretagem XP PDF (se disponível)
- [ ] Output: lotes.json, operacoes.json, dividendos.json

### Fase 3 — Integração pipeline
- [ ] `generate_data.py` lê de `dados/xp/` além de `dados/ibkr/`
- [ ] HODL11 avg_cost calculado automaticamente dos lotes XP
- [ ] RF compras com PTAX da data → alimenta cálculo de IR se aplicável
- [ ] Histórico de aportes RF (para premissas vs realizado)

---

## Raciocínio

**Argumento central:** IBKR cobre 90% do patrimônio (equity offshore). Os 10% restantes (RF + HODL11 na XP/Nubank) são manuais, criando um gap de dados que impede P&L, reconciliação e rastreabilidade completa.

**Alternativas rejeitadas:**
- Manter manual: funciona hoje mas não escala com DCA ativo em IPCA+ (múltiplas compras por mês)
- Planilha Excel: não integra com pipeline Python/dashboard

**Incerteza reconhecida:** Formato de extrato XP pode mudar. PDF parsing é frágil. MVP manual pode ser suficiente se operações RF são poucas (~1-2/mês).

---

## Análise

> A definir na execução.

---

## Conclusão

> Preencher ao finalizar.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Código** | — |
| **Estratégia** | — |
| **Conhecimento** | — |
| **Memória** | — |

---

## Próximos Passos

- [ ] Diego fornece amostra de extrato XP (CSV ou nota PDF) para definir formato
- [ ] Diego informa preço médio HODL11 (nota de corretagem) → ativa P&L imediato
- [ ] Bookkeeper define schema `dados/xp/lotes.json`

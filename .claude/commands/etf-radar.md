# ETF Radar — Visão Completa do Watchlist

Você é o agente Factor. Leia os arquivos e produza o radar completo em formato prático. Não faça buscas web — use apenas os dados em arquivo.

## Fontes (ler em paralelo)

- `agentes/referencia/etf-candidatos.md` — candidatos e fichas detalhadas
- `agentes/contexto/carteira.md` — posições ativas, alocação target e real

## Formato de Saída

---

## ETF Radar — {data de hoje}

### 🟢 Carteira Ativa

| Ticker | Nome curto | % Target | % Atual | TER | AUM | TD/Excess Ret | Status |
|--------|-----------|----------|---------|-----|-----|--------------|--------|
{Para cada ETF ativo: SWRD, AVGS, AVEM. Preencher com dados de carteira.md. TD = tracking diff para passivos; excess return vs benchmark para ativos Avantis.}

---

### 🔴 Alta Conviction — Candidatos Prioritários

Para cada ETF com conviction Alta, mostrar ficha compacta:

**[TICKER] — Nome**
- **Tese em 1 linha**: {por que está no radar}
- **Status**: {🆕/🔍/⏳} + descrição curta
- **TER / AUM**: {valores}
- **Falta para entrar**: {gatilhos pendentes}
- **Próxima revisão**: {data}

---

### 🟡 Média Conviction — Hipóteses Plausíveis

Tabela compacta:

| Ticker | Semelhante a | TER | AUM | Hipótese principal | Status | Revisão |
|--------|-------------|-----|-----|--------------------|--------|---------|

---

### ⚪ Baixa Conviction — Monitoramento Passivo

Tabela compacta (sem detalhe — só o necessário para lembrar por que está aqui):

| Ticker | Semelhante a | TER | AUM | Por que monitorar | Alerta | Revisão |
|--------|-------------|-----|-----|-------------------|--------|---------|

---

### ⏳ Aguardando Lançamento

| ETF | Semelhante a | TER estimado | Registrado em | Próxima checagem |
|-----|-------------|--------------|---------------|------------------|

---

### 👁️ Reentrada Condicional

| Ticker | Por que saiu | Gatilhos de reentrada | Status atual |
|--------|--------------|-----------------------|-------------|

---

### 📋 Resumo de Ações

Com base no status atual, o que fazer:

**Aportar agora:** {ETFs da carteira ativa onde DCA está ativo ou há drift}
**Monitorar próximo mês:** {candidatos com revisão em breve ou próximos do gatilho}
**Aguardar:** {ETFs sem ação necessária}
**Alertas ativos:** {qualquer flag de AUM baixo, mudança de TER, closure risk}

---

## Regras de preenchimento

- Dados da **carteira.md** para posições ativas (% target, % real, drift)
- Dados das **fichas em etf-candidatos.md** para candidatos (TER, AUM, gatilhos)
- Se um campo não estiver no arquivo, usar "—" — não inventar
- Tabelas compactas: sem quebras de linha dentro das células
- Alta Conviction recebe ficha expandida; Baixa recebe só linha de tabela

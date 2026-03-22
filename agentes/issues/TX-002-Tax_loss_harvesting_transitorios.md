# TX-002: Tax-Loss Harvesting nos Ativos Transitorios

## Status: Done
## Data: 2026-03-20
## Concluido em: 2026-03-22
## Responsaveis: 05 Tributacao (lead), 02 Factor
## Prioridade: Alta

## Contexto
O curso Chicago Booth (Koijen, PM Slides 3) identifica tax-loss harvesting como "free alpha" -- vender ativos com prejuizo para realizar perda fiscal e recomprar exposicao similar. Diego tem 7 ETFs transitorios (EIMI, AVES, AVUV, AVDV, DGS, USSC, IWVL) que nao compra mais. Alguns podem ter lotes com prejuizo que poderiam ser harvested.

## Escopo
- [x] Verificar se algum dos 7 ETFs transitorios tem lotes com prejuizo (preco atual < preco de compra do lote)
- [x] Avaliar regras tributarias brasileiras para TLH em ETFs internacionais (Lei 14.754/2023)
- [x] Existe wash sale rule no Brasil? Prazo de recompra?
- [x] Se houver lotes com prejuizo, calcular beneficio fiscal de realizar a perda e recomprar via ETF UCITS equivalente
- [x] Avaliar se o custo de transacao compensa o beneficio

## Referencias do curso
- Koijen: PM Slides 3 ("free alpha" -- tax-loss harvesting, excessive trading costs)
- Koijen: UHNW household data -- tax management como fonte de alpha

## Origem
Scan Chicago Booth (HD-003), 2026-03-20

---

## Conclusao

Nao aplicavel no momento — todos os 7 ETFs transitorios tem lucro substancial. Nenhum lote com prejuizo disponivel para harvesting.

Framework de TLH registrado para uso futuro em drawdowns. Pontos-chave:
- **Sem wash sale rule no Brasil** (Lei 14.754/2023 nao preve restricao de recompra)
- Em drawdown que coloque algum transitorio em prejuizo: vender o transitorio US-listed, realizar prejuizo fiscal, recomprar exposicao equivalente via UCITS
- **Duplo beneficio em drawdown**: prejuizo fiscal (compensa ganhos futuros) + migracao US-listed -> UCITS (reduz estate tax risk)
- Gatilho de reativacao: drawdown severo que coloque algum transitorio em prejuizo

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Decisao** | Nao aplicavel agora — todos transitorios com lucro substancial |
| **Framework** | TLH registrado para uso futuro. Sem wash sale rule no Brasil. Em drawdown: TLH + migracao UCITS = duplo beneficio (prejuizo fiscal + reduz estate tax risk) |
| **Gatilho** | Reativar se drawdown colocar algum transitorio em prejuizo |

# MA-001-Correlacao_stock_bond_regime_inflacionario: Correlação stock-bond em regime inflacionário — IPCA+ como hedge

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | MA-001-Correlacao_stock_bond_regime_inflacionario |
| **Dono** | 08 Macro |
| **Status** | Backlog |
| **Prioridade** | Media |
| **Participantes** | 03 RF, 04 FIRE, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-23 |
| **Origem** | Revisão Chicago Booth scan — gap identificado em David & Veronesi (2013) |
| **Concluido em** | — |

---

## Motivo / Gatilho

O curso Chicago Booth (Veronesi — Day 3B) apresentou o paper **David & Veronesi (2013)** mostrando que a correlação entre stocks e bonds **muda de sinal dependendo do regime macroeconômico**:

- **Medo de deflação** (2000-2020): correlação negativa → bonds são hedge de equity
- **Medo de inflação** (1970s-80s, 2022-23): correlação positiva → bonds e equity caem juntos

**Implicação direta**: em ambiente de inflação persistente no Brasil, o IPCA+ pode **não** funcionar como hedge para a queda de equity. Isso afeta o design do bond tent e o papel do IPCA+ na carteira.

Esse mecanismo foi depreciado no XX-002 (absorvido pelo RK-001), mas o RK-001 focou em risco de default soberano — não em regime de correlação. É um gap.

---

## Descrição

### O mecanismo

David & Veronesi (2013): o sinal da correlação stock-bond depende do que o mercado teme mais:
- Se o mercado teme **recessão/deflação** → bad news for stocks = good news for bonds (flight to safety) → correlação negativa
- Se o mercado teme **inflação** → bad news for economy = bad news for bonds (yields sobem) E bad news for stocks → correlação positiva

Em 2022, isso se materializou globalmente: 60/40 teve o pior ano em décadas porque bonds e stocks caíram juntos.

### Relevância para Diego

Diego tem ~21% em renda fixa (IPCA+/Renda+). O IPCA+ compensa inflação no **retorno nominal**, mas o **preço de mercado** do título cai quando a taxa sobe — que é exatamente o que acontece em regime inflacionário.

Portanto, em cenário de:
1. Inflação acima do esperado no Brasil
2. Banco Central subindo Selic
3. Spreads de crédito soberano alargando

→ Equity cai (múltiplos comprimem) **E** IPCA+ cai (duration = 10-15 anos) → sem hedge.

Esse cenário não é hipotético — é o que aconteceu em 2022 no Brasil (e globalmente).

### A distinção HTM vs marcação

Para os títulos que Diego mantém **até o vencimento** (IPCA+ 2040/2050 como HTM estrutural), a correlação de preço de mercado não importa — o fluxo real garantido não muda. Mas a **posição total** inclui Renda+ 2065 como trade tático, onde a correlação de preço importa.

---

## Escopo

- [ ] Calcular correlação rolling (3 anos, janela móvel) entre retorno de equity BR (IBOV ou MSCI Brazil) e retorno de NTN-B 10Y desde 2004
- [ ] Identificar regimes: períodos de correlação positiva vs negativa no Brasil
- [ ] Mapear quais condições macro caracterizam cada regime (Selic, IPCA, spread soberano)
- [ ] Avaliar: em regime inflacionário Brasil, qual o comportamento esperado do IPCA+ 2040 (HTM) vs Renda+ 2065 (tático)?
- [ ] Calcular: dado que IPCA+ não hedgeia em cenário inflacionário, qual a alocação mínima de bonds que ainda faz sentido no bond tent?
- [ ] Advocate: stress-test — em cenário de inflação persistente (IPCA 8%+, Selic 15%+), qual o drawdown combinado equity + IPCA+ de mercado?
- [ ] Conclusão: o papel do IPCA+ na carteira é carry/retorno garantido (HTM), não hedge de equity — isso deve estar explícito no framework

---

## Análise

### Referências acadêmicas

| Paper | Insight principal |
|-------|------------------|
| David & Veronesi (2013) | Correlação stock-bond muda com regime inflacionário vs deflacionário |
| Brixton, Brooks, Hecht, Ilmanen, Maloney & McQuinn (2023, JPM) | Documentação empírica da mudança de correlação 2022 |
| Neville, Draaisma, Funnell, Harvey & Van Hemert (2021) | Factor performance durante inflação (commodities e trend > bonds) |

### Dados de referência (a verificar)

- 2002-2015 Brasil: regime misto (Selic caindo, IPCA controlado) → correlação negativa esperada
- 2015-2016 Brasil: crise fiscal, Selic subindo → correlação possivelmente positiva
- 2021-2022 Brasil: inflação pós-COVID, Selic de 2% para 13.75% → correlação provavelmente positiva
- 2023-2025 Brasil: Selic 10.5-12.25%, IPCA controlado → regime em transição

---

## Conclusão

> Preencher ao executar.

---

## Resultado

> Preencher ao executar.

---

## Próximos Passos

- [ ] Se confirmado que IPCA+ não hedgeia em regime inflacionário: atualizar framework do bond tent no FR-003-v2 com essa premissa
- [ ] Se regime atual BR for "inflacionário positivo": revisar tamanho do trade tático em Renda+ 2065

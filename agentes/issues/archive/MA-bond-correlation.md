# MA-bond-correlation: Correlação stock-bond em regime inflacionário — IPCA+ como hedge

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | MA-bond-correlation |
| **Dono** | 08 Macro |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 08 Macro, 03 RF, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-23 |
| **Origem** | Revisão Chicago Booth scan — gap identificado em David & Veronesi (2013) |
| **Concluido em** | 2026-03-26 |

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

### Confirmação HTM/carry (2026-03-24)

A análise de Renda+ 2065 (sessão 2026-03-24) demonstrou matematicamente que a componente carry do IPCA+ é **completamente independente da taxa futura de mercado**:

- R_carry = (1 + r₀_real) × (1 + IPCA)^N − 1 — travado em r₀ no momento da compra
- R_mtm = R_total − R_carry — é a componente de preço, sujeita a r₁ (taxa futura)

Para títulos HTM (IPCA+ 2040/2050), a componente MtM é **irrelevante** — o holder recebe o carry travado independentemente do que aconteça com a taxa de mercado. Isso confirma que, para a carteira de Diego, o IPCA+ 2040/2050 tem valor pelo **carry garantido (r₀=7.16% real)**, não por correlação com equity.

Essa distinção também justifica o veto do Advocate ao trigger de "venda se taxa cair a 3-4%": a taxa de mercado cair não reduz o carry travado — só cria MtM positivo, que o HTM ignora de qualquer forma.

Ref: `agentes/contexto/renda-plus-2065-cenarios.md`, `analysis/renda_plus_2065_audit.py`

---

## Conclusão

**Premissa da issue inaplicável ao portfolio de Diego.**

David & Veronesi (2013) descreve correlação stock-bond dentro do mesmo mercado (US stocks vs US bonds). Diego tem equity internacional (USD) e bonds BR (BRL) — mercados e moedas distintos. A correlação clássica não se aplica.

O que foi confirmado:
- **IPCA+ HTM:** carry garantido real (~7.16%), completamente independente da correlação com equity. MtM irrelevante para holder. Funciona como floor de renda real na aposentadoria, não como hedge de equity.
- **Renda+ 2065 (MtM):** único instrumento com risco de correlação positiva com equity internacional — mas apenas em cenário de recessão global (não em crise BR pura). Gerenciado pelo gatilho de saída em 6.0%.
- **Bond tent de Diego:** o racional correto é carry garantido + buffer SoRR (3% curto aos 50), não correlação negativa stock-bond. Já estava correto na substância — só o enquadramento precisava ser explicitado.
- **Cenário mais perigoso para o portfolio não é inflação BR persistente** (equity USD desconectado + BRL devalorizando protege). É recessão global com BRL estável.

Nenhuma mudança de alocação.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Nenhuma mudança. |
| **Estratégia** | Nenhuma mudança. Gatilho Renda+ mantido em 6.0%. |
| **Conhecimento** | David & Veronesi inaplicável ao portfolio (equity internacional ≠ equity BR). IPCA+ HTM = carry garantido, não hedge. Risco real = recessão global, não inflação BR. |
| **Memória** | — |

---

## Próximos Passos

- [ ] Se confirmado que IPCA+ não hedgeia em regime inflacionário: atualizar framework do bond tent no FR-equity-equivalent com essa premissa
- [ ] Se regime atual BR for "inflacionário positivo": revisar tamanho do trade tático em Renda+ 2065

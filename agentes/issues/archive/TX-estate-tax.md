# TX-estate-tax: Custo real do estate tax americano para a carteira de Diego

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-estate-tax |
| **Dono** | 05 Tax |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | 00 Head, 07 FX |
| **Dependencias** | — |
| **Criado em** | 2026-03-27 |
| **Origem** | Retro 2026-03-27 — L-10 (6 retros sem resolucao = issue obrigatoria) |
| **Concluido em** | 2026-03-31 |

---

## Motivo / Gatilho

**Sexta retro consecutiva** sem estimativa de custo do estate tax americano para herdeiros de Diego. Acao existe como "proxima sessao" desde a retro 2026-03-23 (e possivelmente antes). O mecanismo de "acao em retro-log" falhou seis vezes. Convertido em issue com SLA formal.

Contexto: Diego tem ativos US-listed via IBKR (cash < $60k identificado em XX-004). Residentes brasileiros sao sujeitos ao estate tax americano de 40% sobre ativos US-listed acima de $60k no momento da morte. O custo potencial para herdeiros nunca foi calculado.

---

## Descricao

Calcular e registrar formalmente:
1. Qual e a exposicao atual de Diego a ativos US-listed (cash + ETFs domiciliados nos EUA)?
2. Qual o custo esperado do estate tax para os herdeiros?
3. Como mitigar (ETFs UCITS Irish-domiciled ja eliminam o problema para a maioria da carteira)?
4. Existe algum ativo remanescente US-listed que precisa ser migrado?

---

## Escopo

- [ ] Inventariar com Bookkeeper: quais ativos atuais sao US-listed vs UCITS Irish-domiciled?
- [ ] Calcular exposicao US-listed atual (valor em USD)
- [ ] Calcular estate tax esperado: 40% x (exposicao - $60k isenção)
- [ ] Verificar se cash IBKR esta abaixo de $60k (gatilho de XX-004)
- [ ] Avaliar: algum ETF transitorio (AVUV, AVDV, AVES, DGS, USSC) e US-listed?
- [ ] Propor acao se exposicao > $60k (vender, migrar para UCITS equivalente)
- [ ] Registrar conclusao em memoria Tax e gatilho em gatilhos.md

---

## Raciocinio

**Argumento central:** Risco de heranca e real e quantificavel. ETFs UCITS (SWRD, AVGS, AVEM, JPGL) domiciliados na Irlanda nao sao sujeitos ao estate tax americano. O risco esta concentrado em cash IBKR e possiveis ETFs transitorios US-listed. Custo de mitigacao e baixo (converter cash para ETF ou manter < $60k).

**Incerteza reconhecida:** Regras de estate tax para residentes estrangeiros podem mudar (proposal de reducao do threshold de $60k para $0 pelo Congresso americano em discussao). Incerteza legislativa adiciona urgencia.

**Falsificacao:** Se exposicao US-listed for < $60k, issue conclui com "risco gerenciado, monitorar." Se for > $60k, acao concreta de migracao e necessaria.

---

## Analise (2026-03-31)

### Inventário US-listed (quantidades reais — screenshot IBKR 2026-03-31)

| Ativo | Qtde | Preço (mar/26) | Valor USD | US-listed? |
|-------|------|----------------|-----------|------------|
| AVDV | 947.5983 | $99.86 | $94.622 | ✅ Sim (NYSE) |
| AVES | 926.5462 | $59.83 | $55.433 | ✅ Sim (NYSE) |
| AVUV | 548.8792 | $110.46 | $60.626 | ✅ Sim (NYSE) |
| DGS | 188.2107 | $60.19 | $11.330 | ✅ Sim (NYSE) |
| Cash USD IBKR | — | — | $28 | ⚠️ Ambíguo |
| SWRD | 5.290 | £45.55 | — | ❌ UCITS/Irlanda |
| EIMI | 2.020 | £45.31 | — | ❌ UCITS/Irlanda |
| USSC | 373 | £80.80 | — | ❌ UCITS/Irlanda |
| AVGS | 233 | £25.40 | — | ❌ UCITS/Irlanda |
| IWVL | 34 | £61.29 | — | ❌ UCITS/Irlanda |

**Total US-situs: $222.039**

Nota: O extrato IBKR de arquivo era de abr/2022 (quantidades ~4× menores). Quantidades atuais confirmadas via screenshot IBKR 31/mar/2026.

### Cálculo estate tax

| Item | Valor |
|------|-------|
| Exposição US-listed | $222.039 |
| Isenção NRA (IRC §2010) | − $60.000 |
| Base tributável | $162.039 |
| Alíquota marginal | × 40% |
| **Estate tax para herdeiros** | **~$64.800 (≈ R$340k)** |

### Mitigação

**Estratégia aprovada (já em execução):**
- Não comprar mais AVUV, AVDV, AVES, DGS ✅
- Aportar apenas em UCITS (AVGS, AVEM, JPGL) — diluição natural dos transatórios
- Vender US-listed apenas em drawdown (TLH + migração UCITS = duplo benefício fiscal) ou no usufruto (FIRE 50+)
- Em ~5-7 anos os US-listed caem abaixo de $60k naturalmente (se preços não explodirem)

**Ação pendente:**
- Seguro de vida: avaliar cobertura de ~$65k para herdeiros durante período de transição

**Cash IBKR ($28):** negligível. IRC §2105(b) isenta depósitos bancários, mas IBKR é broker-dealer — tecnicamente ambíguo. Manter baixo (< $5k).

**Risco legislativo:** proposta de reduzir threshold $60k → $0 para NRAs em discussão no Congresso. Baixa probabilidade atual mas aceleraria venda dos transatórios se avançar.

---

## Conclusao

Risco quantificado: ~$65k / R$340k para herdeiros. Estratégia de diluição via aportes UCITS correta e em execução. Tax memory atualizada com quantidades e valores reais. Ação pendente: avaliação de seguro de vida.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Possivel migracao de ativos US-listed |
| **Estrategia** | Regra de manutencao de exposicao US-listed |
| **Memoria** | Tax, Bookkeeper |

---

## Proximos Passos

- [ ] Bookkeeper: snapshot de ativos US-listed vs UCITS na carteira atual
- [ ] Tax: calcular custo e propor mitigacao

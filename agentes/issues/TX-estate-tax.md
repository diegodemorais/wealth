# TX-estate-tax: Custo real do estate tax americano para a carteira de Diego

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-estate-tax |
| **Dono** | 05 Tax |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | 00 Head, 07 FX |
| **Dependencias** | — |
| **Criado em** | 2026-03-27 |
| **Origem** | Retro 2026-03-27 — L-10 (6 retros sem resolucao = issue obrigatoria) |
| **Concluido em** | — |

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

## Analise

> A ser preenchido durante execucao.

---

## Conclusao

> A ser preenchido ao finalizar.

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

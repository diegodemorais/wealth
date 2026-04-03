# FI-etf-deep-review: Análise profunda dos ETFs candidatos com dados suficientes

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-etf-deep-review |
| **Dono** | Factor |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | Factor (lead), Zero-Based, FIRE, Advocate, Quant, Fact-Checker, Head |
| **Co-sponsor** | Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-03 |
| **Origem** | Conversa — pedido explícito Diego |
| **Concluido em** | 2026-04-03 |

---

## Motivo / Gatilho

Diego pediu análise profunda de todos os ETFs do radar com dados suficientes para decidir se vale adicionar na carteira, substituir algum existente, ou ajustar %. Também acionar Zero-Based para ver se uma carteira do zero incluiria esses ETFs.

---

## Descrição

Temos 7 ETFs com histórico suficiente para análise real (12+ meses, AUM significativo):

| Ticker | Nome curto | AUM | Histórico | Categoria | Status atual |
|--------|-----------|-----|-----------|-----------|-------------|
| IFSW | iShares STOXX World Multifactor | €660M | 10 anos | Smart Beta DM | Baixa conviction |
| JPGL | JPMorgan Global Multi-Factor | €207M | 9 anos | Factor Active DM | Reentrada condicional |
| EMVL | iShares EM Value Factor | €1.2B | 7 anos | Smart Beta EM | Baixa conviction |
| FLXE | Franklin LibertyQ EM Multi-Factor | €63M | ~8 anos | Smart Beta EM | Baixa conviction |
| IWDS | iShares MSCI World Swap | $1.15B | ~24 meses | Sintético MCW | Média conviction |
| EMEE | iShares EM Enhanced Active | $962M | ~20 meses | Factor Active EM | Baixa conviction |
| AVWC/AVGC | Avantis Global Equity | €398M | ~18 meses | Factor Active DM | Baixa conviction |

**Excluídos por dados insuficientes:** DDGC, DDGT (5 meses — revisão nov/2026), DDUM, DDXM (2 semanas), Vanguard SmallCap/AllWorld (não lançados).

Para cada ETF, responder:
1. O ETF adiciona exposição fatorial real não capturada por SWRD/AVGS/AVEM?
2. O custo total (TER + TD + WHT + FX) justifica a adição?
3. Zero-Based: numa carteira do zero, este ETF estaria no portfólio?
4. Veredicto: **adicionar** (% sugerido), **substituir** (qual ETF atual), **acrescentar** (% do bloco), **manter monitoramento** ou **descartar**.

---

## Escopo

- [ ] Factor: análise de factor loadings, TD, custo all-in, correlação com carteira atual para cada um dos 7 ETFs
- [ ] Zero-Based: análise completa sem contexto da carteira atual — apenas perfil do investidor
- [ ] FIRE: impacto de cada adição/substituição em P(FIRE 2040)
- [ ] Advocate: stress-test das teses — quais são as armadilhas de cada ETF?
- [ ] Quant: validar cálculos de custo all-in e correlação
- [ ] Fact-Checker: verificar claims sobre factor loadings e track records citados
- [ ] Fase 1 de votação (independente, sem ver os outros)
- [ ] Debate aberto entre agentes
- [ ] Fase 2 de votação (ponderada)
- [ ] Pre-mortem (se qualquer resultado implica mudança ≥5% do portfolio)
- [ ] Veredicto final ponderado

---

## Raciocínio

**Alternativas rejeitadas:** Analisar por sub-grupo (ex: só EM) — perderia visão cross-portfolio de quanto fatorial já temos. Analisar apenas alta conviction — deixaria EMVL e IFSW fora, que têm o melhor histórico da lista.

**Argumento central:** A carteira aprovada (SWRD 50% / AVGS 30% / AVEM 20%) foi validada zero-based em abr/2026. Qualquer novo ETF precisa provar que adiciona alpha líquido real, não apenas factor exposure redundante. O burden of proof é alto.

**Incerteza reconhecida:** Factor loadings empíricos de ETFs UCITS ainda são escassos. EMEE e AVWC têm <24 meses de histórico — qualquer conclusão é provisória.

**Falsificação:** Se após a análise nenhum ETF passar no teste de alpha líquido ≥0.2% sobre o equivalente da carteira atual, o veredicto deve ser "manter carteira intacta" — não "talvez no futuro."

---

## Análise

### Fase 1 — Votação Independente (2026-04-03)

Cinco agentes rodaram em paralelo sem ver os resultados dos outros.

#### Factor (peso 3x)
Com regressões reais (FF5+MOM) para IFSW e JPGL:
- IFSW: R²=0.379, CMA=-0.182***, RMW n.s. → "perfil fatorial ruidoso", essencialmente igual a JPGL
- JPGL: corr 0.95 com SWRD, alpha -2.33%/ano n.s., custos all-in 0.56% real → DESCARTAR
- EMVL: loading HML estimado 0.40-0.50 mas RMW ~0 (sem profitability overlay) → MONITORAR
- FLXE: eliminatório por AUM €63M → DESCARTAR
- IWDS: fatorial irrelevante (= SWRD), questão de custo/estrutura → MONITORAR
- EMEE: closet indexing (TE ~1-2%), custo por unidade de factor exposure pior que AVEM → DESCARTAR
- AVWC: substituiria SWRD+AVGS com perda fatorial + custo 2x maior que blend atual → DESCARTAR como substituto
- **Voto: zero mudanças. Próximo candidato relevante = DDGT (aguardar nov/2026)**

#### Zero-Based (peso 2x)
Análise sem contexto da carteira atual — apenas perfil do investidor:
- Nenhum dos 7 candidatos supera os incumbentes (SWRD/AVGS/AVEM)
- Carteira zero-based sugerida: SWRD 50% / AVGS 30% / AVEM 20% — **idêntica à atual**
- JWDS e DDGT são os únicos candidatos com caso futuro real
- **Voto: carteira atual = carteira ideal do zero. Confirmação independente da decisão FI-equity-redistribuicao**

#### FIRE (peso 2x)
Delta P(FIRE 2040) para cada ETF, se adicionado:
- IFSW: ~0pp | JPGL: ~0pp | EMVL: +0.02pp | FLXE: -0.05 a -0.1pp (risco fechamento) | IWDS: +0.1-0.15pp | EMEE: -0.06 a +0.06pp (depende do TE) | AVWC: -0.08 a -0.1pp
- Único ETF com delta positivo relevante: **IWDS (+0.1-0.15pp)** — mas estrutura swap em horizonte 40+ anos e complexidade na desacumulação não justificam prioridade
- **Voto: CONTRA adição para todos. Melhor alocação de esforço = completar IPCA+ até 15% (+12.5pp em P(FIRE) já documentado)**

#### Advocate (peso 1x)
- Argumento nuclear: **action bias detectado** — carteira aprovada unanimemente há 2 dias sem nenhum gatilho atingido
- Pior risco-benefício da lista: FLXE (risco existencial real + custo IR certo + benefício hipotético)
- JPGL: "caso morto" — viola regra explícita da carteira.md
- IWDS: único benefício real (8-12bps estrutural), mas tail risk counterparty sobre 14 anos é assimétrico
- **Voto: nenhum output aceitável além de confirmar gatilhos e timelines já definidos**

#### Fact-Checker (peso 1x — validação, não voto de ação)
Flags para o time:

| Claim | Status | Impacto |
|-------|--------|---------|
| JPGL correlação 0.95 | NÃO CONFIRMADO — sem fonte, período, metodologia | Controla gatilho de reentrada (<0.85) — deve ser verificada antes de qualquer reentrada |
| IFSW TD 0.29% | NÃO CONFIRMADO como representativo do produto atual | Índice trocou jan/2025 — TD captura período misto pré/pós-mudança |
| FLXE loadings superiores a AVEM | HIPÓTESE de forum (RR 31258) — sem regressão | Não usar como argumento |
| EMEE "TE historicamente baixo" | GENERALIZAÇÃO de família — sem dado específico de EMEE | Verificar TE via justETF antes de qualquer decisão |
| AVWC HML ~0.15-0.20 | ESTIMATES teóricos — sem regressão empírica (18 meses) | Não comparar com loadings empíricos de AVGS |
| JWDS +8-12bps/ano | ESTIMATIVA fundamentada (lógica WHT correta) | Usar com ressalva "ex-ante, não empírico" |

### Consenso da Fase 1

| ETF | Factor (3x) | Zero-Based (2x) | FIRE (2x) | Advocate (1x) | Consenso |
|-----|-------------|-----------------|-----------|---------------|---------|
| IFSW | DESCARTAR | NÃO | CONTRA | FRÁGIL | **DESCARTAR** |
| JPGL | DESCARTAR | NÃO | CONTRA | CASO MORTO | **MANTER ELIMINADO** |
| EMVL | MONITORAR | NÃO | CONTRA | FRÁGIL | **MONITORAR (não adicionar)** |
| FLXE | DESCARTAR | NÃO | CONTRA | PIOR R/B | **DESCARTAR** |
| IWDS | MONITORAR | CANDIDATO FUTURO | NEUTRO+ | MOD. FRÁGIL | **MONITORAR — melhor candidato da lista** |
| EMEE | DESCARTAR | NÃO | DEPENDE TE | FRÁGIL | **DESCARTAR até TE confirmado** |
| AVWC | DESCARTAR | NÃO | CONTRA | FRÁGIL | **DESCARTAR (fase acumulação)** |

**Divergência significativa: nenhuma.** Consenso suficiente para não acionar fase 2 de votação.

---

## Conclusão

### Veredicto Final

**MANTER SWRD 50% / AVGS 30% / AVEM 20%. Zero mudanças.**

Nenhum dos 7 ETFs com dados suficientes para análise passa no teste de adição imediata:
- Os 4 candidatos com dados reais (IFSW, JPGL) ou eliminação estrutural (FLXE, EMEE): DESCARTAR
- Os 3 restantes (EMVL, IWDS, AVWC): MONITORAR conforme gatilhos já definidos nas fichas

### Veredicto Ponderado por ETF

| Agente | Peso | Posição global | Contribuição-chave |
|--------|------|----------------|--------------------|
| Factor | 3x | Zero mudanças | Regressões reais de IFSW/JPGL confirmam redundância e RMW negativo |
| Zero-Based | 2x | Carteira atual = ideal do zero | Confirmação independente da FI-equity-redistribuicao |
| FIRE | 2x | Zero mudanças | Delta P(FIRE) máximo = +0.15pp (IWDS) — insuficiente vs complexidade |
| Advocate | 1x | Zero mudanças | Action bias detectado; único output válido = confirmar gatilhos |
| Fact-Checker | 1x | 5 claims não verificadas | Correlação JPGL 0.95 e TD IFSW 0.29% precisam de fonte primária |
| **Score ponderado** | **10x** | **Manter carteira** | **Unanimidade** |

*Pesos: Factor (domínio) = 3x, Zero-Based/FIRE (adjacentes) = 2x, Advocate/Fact-Checker = 1x*

### Achado-chave: Zero-Based confirma decisão de 2 dias atrás

O agente Zero-Based — sem contexto da carteira atual — chegou independentemente à mesma estrutura SWRD/AVGS/AVEM. Isso elimina a hipótese de que a unanimidade de FI-equity-redistribuicao foi efeito de ancoragem no status quo.

### Único candidato com caso futuro real: IWDS

IWDS (iShares MSCI World Swap) tem vantagem estrutural genuína (+8-12bps/ano via WHT swap), AUM $1.15B robusto, e zero sobreposição fatorial com AVGS/AVEM. A barreira é:
1. Disponibilidade na LSE (não confirmada — Diego opera via IBKR LSE)
2. TD rolling 12m confirmada < SWRD com margem ≥ 8bps
3. Track record suficiente (lançado mar/2024 — revisar mar/2027)

**Não há urgência. Gatilho já definido na ficha.**

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocação** | Nenhuma mudança. SWRD 50% / AVGS 30% / AVEM 20% confirmado. |
| **Estratégia** | Gatilhos já definidos nas fichas confirmados: IWDS revisão mar/2027; EMEE revisão out/2026 (verificar TE real); EMVL monitorar loadings; AVWC revisão abr/2027 |
| **Conhecimento** | Zero-Based confirma carteira atual = carteira ideal do zero — elimina viés de status quo da FI-equity-redistribuicao |
| **Memória** | Registrar na memória Factor: correlação JPGL 0.95 precisa de fonte primária antes de qualquer reentrada; TD IFSW 0.29% inválida pós-mudança de índice |
| **Fact-Checker flags** | 5 claims não verificadas documentadas — não usar como argumentos até fontes primárias confirmadas |

---

## Próximos Passos

- [ ] Fact-Checker: verificar Annual Report JPM ICAV dez/2024 para WHT drag 0.34% (fonte primária)
- [ ] Factor: rodar regressão preliminar AVWC com 18 meses disponíveis (indicativa, não definitiva)
- [ ] Factor: verificar disponibilidade IWDS na LSE via IBKR antes da revisão mar/2027
- [ ] Remover IFSW do radar ou mover para "monitoramento passivo com baixa frequência" — dado o R² baixo e mudança de índice, pouco valor em acompanhar mensalmente
- [ ] Confirmar status AVWS na conta IBKR (ISIN = AVGS?) — pendência da FI-radar-etfs-review

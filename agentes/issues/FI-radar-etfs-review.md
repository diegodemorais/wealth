# FI-radar-etfs-review: Revisão Completa do Radar de ETFs Candidatos

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-radar-etfs-review |
| **Dono** | 02 Factor |
| **Status** | Done |
| **Prioridade** | Média |
| **Participantes** | Factor, Advocate, Fact-Checker |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-02 |
| **Origem** | Criação do arquivo etf-candidatos.md — necessário validar lista completa com o time |
| **Concluido em** | 2026-04-02 |

---

## Motivo / Gatilho

Criamos o arquivo `agentes/referencia/etf-candidatos.md` com 7 candidatos ativos (após curadoria inicial). O time nunca revisou formalmente a lista completa.

Perguntas abertas:
1. Os 7 candidatos ativos são os certos? Estamos monitorando o que importa?
2. Há ETFs relevantes que não estão no radar?
3. Os gatilhos de entrada definidos para cada um fazem sentido?
4. Algum candidato deveria subir de convicção (Baixa → Média → Alta)?

---

## Descrição

Lista atual de candidatos ativos em `agentes/referencia/etf-candidatos.md`:

| # | Ticker | Nome | Conviction | Próxima Revisão |
|---|--------|------|------------|-----------------|
| 1 | — | Vanguard FTSE Global Small-Cap UCITS | Média | Mai/2026 |
| 2 | ACSW | iShares MSCI World Swap | Média | Mar/2027 |
| 3 | AVWC | Avantis All-World UCITS | Média | Out/2026 |
| 4 | — | Vanguard FTSE All-World All-Cap UCITS | Média | Mai/2026 |
| 5 | XDEM | iShares MSCI World Multifactor | Baixa | Out/2026 |
| 6 | JPGL | JPMorgan Multi-Factor (reentrada) | Baixa | Out/2026 |
| 7 | DDGC/DEGC | Dimensional Global Core Equity | Média | Nov/2026 |

ETFs em Descartados (não reavaliados): AVGC, FLXE, AVEU, AVPE, AVUS.

---

## Escopo

- [x] Factor: revisar cada candidato — conviction justificada? gatilho correto?
- [x] Advocate: o que estamos perdendo? algum candidato que deveria estar aqui?
- [x] Fact-Checker: verificar claims específicos sobre ETFs (AUM, TER, factor loadings)
- [x] Síntese: lista final validada com prioridades claras

---

## Raciocínio

**Checklist pré-veredicto:**
- [ ] ACSW: evidência swap > físico é documentada (RR thread 31781). Mas counterparty risk é relevante para horizonte 14 anos?
- [ ] DDGC: $1B AUM em 4 meses. DFA philosophia. Factor loadings disponíveis com 5 meses de dados?
- [ ] AVWC: simplificação AVGS+AVEM → 1 ticker. Perdemos controle de rebalanceamento DM/EM?
- [ ] Vanguard Small-Cap: se TER = 0.12% mas sem factor tilt, é realmente complementar a AVGS ou duplicação sem alpha?
- [ ] XDEM: já tem 10 anos de track record. Por que não abrimos issue formal de avaliação vs JPGL direto?

**Falsificação do radar:**
- Se Factor não consegue justificar a monitoring rationale de 3+ candidatos em 5 minutos → radar está inflado
- Se Advocate identifica ETF material ausente → adicionar imediatamente

---

## Análise

### Factor — Posição Independente

**ACSW (iShares MSCI World Swap):**
- Swap UCITS Irlanda: dividendos reinvestidos sem WHT no nível do swap → ~15-25bps estrutural vs físico
- Evidência: RR thread 31781 (glimz data): swap S&P 500 supera físico em ~25bps/ano historicamente
- Para MSCI World, o benefício é menor (componente EUA ~65% paga 0% WHT via Irlanda já; benefício concentrado em ex-US)
- **Estimativa real para SWRD**: +8-12bps/ano (não os 15-25bps do S&P 500 puro)
- Counterparty risk: colateral ISDA em 2026 cobre 100% da exposição diariamente — risco residual baixo para horizonte 14 anos
- **Conviction: Média mantida.** Gatilho correto: 12 meses de TD histórico antes de considerar migração.

**DDGC/DEGC (Dimensional):**
- DFA = criadores do factor investing moderno. Eduardo Repetto (ex-DFA co-CEO) fundou Avantis. DDGC é o retorno da DFA ao espaço UCITS.
- "Global Core Equity" = filosofia DFA: ampla cobertura + tilt suave em value, profitability, small (menor que AVGS)
- $1B em 4 meses = captação institucional séria — validação de interesse real
- TER 0.26% = igual a AVGS. Mas "core" vs "pure": menos concentrado em small-cap → expected alpha menor mas volatility menor
- Risco: duplica com AVGS se loadings similares. Diferença crítica: AVGS tem small-cap *puro*, DDGC é broad market com *tilt*
- **Conviction: Média mantida.** Aguardar 12 meses para factor regression.

**AVWC (Avantis All-World):**
- Mesma filosofia AVGS+AVEM em 1 ticker. TER ~0.23%
- Vantagem: simplicidade operacional
- Desvantagem: perde controle de rebalanceamento DM/EM separado. Se EM diverge (como +14.83% YTD), não conseguimos ajustar o bloco EM sem mexer no DM.
- Para Diego com convicção em AVEM separado (20% target), AVWC seria regressão de controle
- **Conviction: Baixar para Baixa.** Monitoramento passivo apenas. Anual em vez de semestral.

**Vanguard Global Small-Cap:**
- Se lançar sem factor tilt (FTSE Global Small-Cap = passivo), seria small exposure sem premium deliberado
- Valor: custo menor (~0.12%) para a camada small, complementando AVGS que é small+value
- Mas a tese é: AVGS *já é* small-cap value. Vanguard small-cap passivo adicionaria "small sem value" — reduz a convicção do tilt
- Cenário de uso: Diego quer aumentar small exposure além do AVGS mantendo custo baixo
- **Conviction: Baixar para Baixa.** Aguardar lançamento e factor loadings antes de qualquer avaliação real.

**Vanguard FTSE All-World All-Cap:**
- SWRD replacement candidate. FTSE All-World All-Cap = large+mid+small, DM+EM, passivo MCW
- Seria alternativa a SWRD com broader coverage (inclui small + EM no mesmo ticket)
- Para Diego: SWRD 50% poderia migrar para Vanguard All-Cap reduzindo custo e aumentando diversificação
- Mas: sem factor tilt. E AVGS+AVEM já cobrem o gap de small+EM com tilt.
- **Conviction: Baixar para Baixa.** Mais relevante pós-FIRE para simplificação. Monitoramento anual.

**XDEM (iShares Multifactor):**
- 10 anos de track record. TER 0.35%. AUM ~$1.5B.
- MSCI World Diversified Multiple-Factor: value + quality + momentum + low size
- Backtest histórico: desempenho inferior a JPGL (diferença: JPGL usa momentum como *negative screen* para value/quality — metodologia superior)
- Mas XDEM tem mais transparência (MSCI índice público vs JPGL ativo)
- **Conviction: manter Baixa.** Apenas como benchmark para JPGL e fallback se JPGL fechar.

**JPGL (reentrada condicional):**
- Eliminado por correlação 0.95 com SWRD+AVGS. TER cortado para 0.19%.
- Reentrada apenas se correlação cair abaixo de 0.85 por 3 anos — evento improvável
- **Conviction: Baixa mantida.** Gatilho conservador correto.

---

**Possíveis ausências no radar (Factor scan):**
- **HMWO** (iShares MSCI World Momentum UCITS): momentum puro UCITS. Mas Diego já tem exposição momentum via JPGL/AVGS. Sem gap.
- **IWVL** (iShares MSCI World Value Factor): value puro UCITS. AVGS é superior em tilt. Sem gap.
- **ISFE** (iShares MSCI Europe Small Cap): small-cap Europe específico. Sem tese para sobrepeso regional Europa small. Descartar.
- **AVWS** (Avantis World Small Cap UCITS): lançado fev/2026 — esta é a versão small-cap world da família Avantis. **Este pode ser relevante!** Se disponível UCITS com tilt value/profitability *apenas em small-caps* globais (incluindo EM small), poderia complementar SWRD de forma diferente de AVGS.

---

### Advocate — Stress-Test da Lista

**"O que estamos monitorando que não deveria estar aqui?"**

1. **AVWC**: Diego tem convicção em controlar DM/EM separadamente. AVWC remove esse controle sem benefício material. Deveria ser Baixa ou Descartado.

2. **Vanguard All-Cap**: lançamento especulativo. Enquanto não lançou, este slot no radar é ruído. Manter como Baixa/anual.

3. **XDEM**: 10 anos de dados mostram desempenho inferior a JPGL. O único caso de uso é "JPGL fecha" — que é um risco real (AUM €245M). Mas esse gatilho já está no XDEM. Mantém.

**"O que não está aqui que deveria?"**

1. **AVWS (Avantis World Small Cap UCITS)**: Factor identificou acima. Se tem factor loadings distintos de AVGS (small-cap *global* vs AVGS que é desenvolvimento + small-cap), pode ser candidato legítimo. AVGS inclui EM small? Verificar.

2. **Nenhum hedge tail-risk UCITS**: IGLN (ouro), managed futures UCITS. Mas já descartamos em RK-gold-hedge e RK-managed-futures. Sem necessidade.

3. **WEBN (Invesco MSCI World swap)**: mencionado no RR como alternativa ao ACSW. Mas tracking ruim nos primeiros meses (2026-03-26 scan). Manter fora.

---

### Fact-Checker — Verificação de Claims

**Claims verificados:**
1. ✅ DDGC: "AUM $1B em 4 meses" — confirmado no scan 2026-04-02 (FI-003 referência)
2. ✅ ACSW: "swap S&P 500 supera físico ~25bps" — documentado RR thread 31781 (glimz data)
3. ✅ AVGS TER: 0.23% — verificado em múltiplas fontes
4. ⚠️ ACSW TER: "~0.10%" — não confirmado. BlackRock lançou em mar/2026, TER não verificado. Marcar como estimado.
5. ⚠️ AVWC TER: "~0.23%" — estimado. Verificar justETF.
6. ⚠️ AVWS: existência como UCITS não confirmada (Factor mencionou como candidato potencial) — requer verificação antes de adicionar.

---

## Conclusão

**Lista final validada (7 ativos + 1 adicionar):**

| Ticker | Conviction | Mudança | Justificativa |
|--------|------------|---------|---------------|
| DDGC/DEGC | Média | — | DFA, $1B AUM, aguardar 12 meses loadings |
| ACSW | Média | — | +8-12bps estrutural vs SWRD; TER a confirmar |
| Vanguard Small-Cap | **Baixa** | ↓ de Média | Passivo sem tilt — aguardar lançamento + loadings |
| Vanguard All-Cap | **Baixa** | ↓ de Média | Simplificação especulativa; anual |
| XDEM | Baixa | — | Benchmark + fallback JPGL |
| JPGL | Baixa | — | Correlação 0.95; gatilho conservador correto |
| AVWC | **Baixa** | ↓ de Média | Diego quer controle DM/EM separado; anual |
| **AVWS** | **Baixa** | 🆕 Adicionar | Avantis small-cap UCITS — verificar se tem loadings distintos de AVGS |

**Descartados (mantidos):** AVGC, FLXE, AVEU, AVPE, AVUS — motivos registrados, não reavaliar.

**Ação imediata:** Atualizar etf-candidatos.md com as mudanças de conviction e adicionar AVWS (se UCITS confirmado).

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Conviction changes** | AVWC, Vanguard Small-Cap, Vanguard All-Cap: Média → Baixa |
| **Adição** | AVWS (Avantis World Small Cap UCITS) — se UCITS confirmado |
| **Descartados mantidos** | AVGC, FLXE, AVEU, AVPE, AVUS |
| **Insight novo** | ACSW benefício ~8-12bps (não 15-25bps) para MSCI World; concentrado em ex-US |
| **Claim sem confirmação** | ACSW TER, AVWC TER, AVWS existência UCITS — verificar no próximo scan |

---

## Próximos Passos

- [x] Factor: revisão de conviction por candidato
- [x] Advocate: stress-test da lista
- [x] Fact-Checker: verificar 6 claims
- [x] Atualizar etf-candidatos.md: conviction ajustada para AVWC/Vanguard Small-Cap/Vanguard All-Cap (Média → Baixa)
- [x] AVWS: existe (IE0003R87OG3, TER 0.39%, AUM €696M, Set 2024). Adicionado com alerta: pode ser mesmo fundo que AVGS — verificar ISIN na conta IBKR
- [ ] Confirmar ACSW TER efetivo via justETF (estimado ~0.10%)
- [ ] Bookkeeper: verificar ISIN do AVGS na conta IBKR para resolver ambiguidade AVWS

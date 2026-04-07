# All Scans — Intelligence Sweep

Você é o Head executando o sweep de inteligência da carteira. O objetivo é detectar **o que MUDOU** desde o último scan — não confirmar o que já se sabe.

## Por que modo comprimido importa

Cada grupo roda em paralelo. Se cada agente retornar um relatório completo, a síntese fica impossível e o custo explode. O valor desta tarefa está na síntese do Head, não nos relatórios individuais. Cada grupo retorna apenas o insumo mínimo para o Head sintetizar.

## Contrato de Output (TODOS os grupos)

**Budget máximo: 150 palavras por grupo.** Use este formato:

```
SIGNALS:
- [MUDANÇA] <fato novo em ≤20 palavras> (fonte — obrigatório quando dado vem de fetch/arquivo)
- [CONFIRMA] <premissa validada em ≤15 palavras>

FLAGS:
- [ALTA/MÉDIA/BAIXA] <descrição em ≤20 palavras>
```

**Anti-padrão — NÃO fazer:**
> "O IPCA+ 2040 está em 7,23%, acima do piso operacional de 6,0%. O DCA está ativo conforme o framework aprovado. A Selic meta é 14,75% e o Focus projeta terminal em 12,5%..."

**Padrão correto:**
> - [MUDANÇA] IPCA+ 2040 subiu 2bps → 7,23% (vs 7,21% no snapshot) (BCB API)
> - [CONFIRMA] DCA ativo, nenhum gatilho cruzado

A diferença: o padrão correto só reporta o delta. Dados que já estão nos arquivos de memória não precisam ser repetidos — o Head já os conhece. **Fontes são obrigatórias** quando o dado vem de fetch externo ou arquivo: `(BCB API)`, `(etf-candidatos.md)`, `(RR thread 32396)`.

Se nenhum signal relevante: retornar `"Sem mudanças neste ciclo."` e encerrar.

## Critérios de Flag

Escale como flag **apenas** se:
- Gatilho da carteira foi acionado ou está a <50bps do threshold
- ETF da carteira com evento societário (fechamento, mudança de TER, recomposição de índice)
- Paper ou dado empírico que **contradiz** uma premissa ativa (não apenas confirma)
- Evento macro com impacto direto em posição aberta (não apenas "mercado em queda genérica")

## Scope parcial

Se o usuário pedir apenas alguns grupos (ex: "só macro e ETFs"), rode os **5 grupos completos** — sinais importantes podem aparecer em qualquer área. Na síntese, destaque as áreas solicitadas primeiro, mas não omita flags de outras áreas.

## 5 Grupos — Lance Todos em Paralelo (background)

**Modelos**: Grupos 1 e 2 → `haiku` (fetch + triagem, sem análise complexa). Grupos 3, 4 e 5 → `sonnet` (análise, comparações, literatura).

Lance todos os 5 grupos como agentes background simultaneamente. Aguarde todos. Então sintetize.

---

### Grupo 1 — Macro BR + RF (agente: macro | model: haiku)

**Primeiro**: leia `agentes/memoria/08-macro.md` para conhecer o baseline registrado. Reporte apenas o que diverge.

Dados a buscar:
- BCB API: Selic (série 432), IPCA 12m (série 13522), BRL/USD (série 1)
- Tesouro/Investidor10: taxa IPCA+ 2040, IPCA+ 2050, Renda+ 2065
- FRED: Fed Funds, TIPS 10y real, VIX, HY spread; Multpl.com: CAPE S&P500

Foco do signal: status dos gatilhos DCA (piso 6.0% IPCA+, compra Renda+ >=6.5%), variações nos juros globais vs baseline da memória.

---

### Grupo 2 — Notícias 72h (agente: macro | model: haiku)

Buscar eventos das últimas 72h. Threshold de materialidade — só reportar se:
- Decisão de banco central (COPOM, Fed, ECB)
- IPCA, payroll, CPI divulgados
- Variação >3% em índice principal ou >10% em BTC
- Evento geopolítico com impacto em tarifas ou EM
- Mudança em ETF da carteira (TER, fechamento, recomposição)

Se nada passou o threshold: `"Sem eventos materiais."` e encerrar.

---

### Grupo 3 — ETFs UCITS (agente: factor | model: sonnet)

**Primeiro**: leia `agentes/referencia/etf-candidatos.md` para conhecer o baseline de AUM/TER/status. Reporte apenas mudanças.

Verificar:
- Novos lançamentos UCITS factor/SCV/EM não catalogados
- Mudanças de TER em SWRD, AVGS, AVEM ou candidatos
- Candidatos que cruzaram gatilho de AUM (promoção ou descarte)
- TD SWRD e excess return AVGS/AVEM — apenas se houver dado mais recente que o registrado

---

### Grupo 4 — Research Quantitativo (agente: factor | model: sonnet)

**Primeiro**: leia `agentes/memoria/02-factor.md` para conhecer premissas e baselines. Reporte apenas reversões ou novidades.

Verificar:
- AQR: retorno mais recente de QMJ e HML Devil — apenas se houver mês novo vs memória
- Ken French: HML, RMW Dev ex-US e EM — apenas se tendência recente reverteu
- Literatura: papers últimos 3 meses que **contradizem** ou atualizam premissas ativas

Ignorar papers já citados na memória. Só reportar fator se houver reversão clara de tendência.

---

### Grupo 5 — FIRE + Fóruns (agente: fire | model: sonnet)

**Primeiro**: leia `agentes/memoria/04-fire.md` para conhecer premissas atuais.

Verificar:
- RR threads fixas (31258, 32396, 34728, 2927, 13125): apenas posts com dados novos sobre UCITS, factor ou SWR
- Bogleheads: novos lançamentos ETF, debates com dados novos sobre SCV ou SWR
- SSRN: papers últimos 3 meses — factor investing UCITS, SWR global, factor crowding
- Retirement spending: novos dados VCMH ou multiplicadores ANS não registrados

Só incluir thread/paper se trouxer dado novo, não apenas discussão ou sentimento.

---

## Síntese Final (Head)

Após todos os grupos completarem:

```
## All Scans — {data}

### O que mudou
{bullets de mudanças materiais — máx 5, ordenados por impacto}

### Flags
| Área | Flag | Severidade | Próximo passo |
|------|------|------------|---------------|
...

### Confirmações desta rodada
{premissas tocadas neste ciclo — máx 4 bullets, só as mais relevantes}

### Issue candidata?
{nomear apenas se flag Alta justifica debate formal — omitir seção se não houver}
```

Semana tranquila (sem flags Altas) = relatório em ≤20 linhas. Só expandir onde há flag.

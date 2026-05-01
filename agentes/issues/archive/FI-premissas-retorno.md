# FI-premissas-retorno: Reconciliação das Premissas de Retorno Base

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-premissas-retorno |
| **Dono** | 02 Factor |
| **Status** | Done |
| **Prioridade** | Alta |
| **Concluído em** | 2026-04-01 |
| **Participantes** | Factor, Quant, Fact-Checker, Advocate |
| **Dependências** | — |
| **Criado em** | 2026-04-01 |
| **Origem** | Conversa — Fact-Checker encontrou 3 erros nas premissas base durante análise de C vs B |

---

## Motivo / Gatilho

Durante análise de sensibilidade das opções C (40/40/20) e D (45/35/20) vs B (50/30/20) aprovada, o Fact-Checker identificou que as premissas de retorno base em `carteira.md` têm inconsistências com as fontes citadas. O retorno ponderado de 5.85% pode estar incorreto por erro de fonte (AVEM) e por ambiguidade sobre haircut (AVGS).

Conecta a L-21 (retro 2026-04-01): "reconciliar AVGS premium (110bps vs 46bps pós-haircut) com P(FIRE)."

---

## Descrição

Três inconsistências identificadas pelo Fact-Checker que afetam a validade das premissas aprovadas:

### F1 — SWRD 4.9% documentado como "média DMS+AQR" mas não é média

**Claim em carteira.md:** `DMS 2025 5.2% + AQR 2026 4.9%, média`
**Problema:** Média aritmética = (5.2% + 4.9%) / 2 = **5.05%**, não 4.9%.
O 4.9% é o AQR isolado. Se a intenção foi usar o AQR (mais conservador), documentar assim. Se foi média, corrigir para 5.05%.

**Impacto no retorno ponderado B:** +7.5bps se corrigido para 5.05% (50% × +0.15% = +7.5bps).

### F2 — AVGS premium fatorial: pré ou pós haircut 58%?

**Claim em carteira.md:** `AQR Small 5.0% + factor +1.0-2.0% (FF93/M&P16)`
**Problema:** Não está documentado se o +1.0-2.0% é pré ou pós haircut McLean & Pontiff (2016) de 58%.
- Se gross premium histórico = ~2.4%, pós-haircut = 1.0% → o 6.0% USD é pós-haircut ✓
- Se gross premium = ~4.0%, pós-haircut = 1.68% → o 6.0% usa 1.0% que é sub-haircut

**Impacto:** Afeta se o retorno esperado de AVGS está correto ou subestimado. Conecta diretamente a L-21.

### F3 — AVEM 5.5% excede todas as fontes citadas

**Claim em carteira.md:** `AQR EM 5.1%, JPM 5.3%, GMO 3.8%`
**Problema:** Média aritmética das três fontes = 4.73%. O 5.5% não é suportado por nenhuma das fontes listadas.
Hipótese: Research Affiliates (CAPE-based, registrado em `memory/reference_research_affiliates.md`) publica EM ~9.0% nominal, que pode chegar a ~5.5% real. Mas esta fonte não está citada em carteira.md.

**Impacto no retorno ponderado B:** −15.4bps se corrigido para 4.73% (20% × −0.77% = −15.4bps).

### F4 — Memória do Factor desatualizada (secundário)

A memória do Factor (`agentes/memoria/02-factor.md`) ainda registra alocação antiga (SWRD 35% / AVGS 25% / JPGL 20%) e "MANTER JPGL 20% — voto 7-0". Decisões de 2026-04-01 não foram incorporadas.

---

## Impacto Combinado Estimado

Se F1 e F3 forem corrigidos:

| | Base atual | Corrigido (estimativa) |
|--|:---:|:---:|
| SWRD BRL | 5.4% | 5.55% (+15bps se usa média DMS+AQR) |
| AVEM BRL | 6.0% | 5.23% (−77bps se usa média das 3 fontes) |
| **Retorno ponderado B** | **5.85%** | **~5.77%** |

Retorno ponderado subestimado em F1 (+7.5bps) e superestimado em F3 (−15.4bps). **Efeito líquido: ~−8bps** no retorno base de B.

Esse erro, se confirmado, também afeta todas as comparações feitas até agora (breakeven IPCA+ vs equity, P(FIRE), etc.).

---

## Escopo

1. **F1 — SWRD:** Verificar com DMS 2025 e AQR 2026 originais. Definir: usar 4.9% (AQR conservador) ou 5.05% (média). Documentar escolha explicitamente.

2. **F2 — AVGS haircut:** Identificar o gross factor premium implícito. Verificar se +1.0% reflete haircut 58% sobre gross ~2.4% (Fama-French small-value histórico). Se não, corrigir. Resolver L-21 aqui.

3. **F3 — AVEM:** Verificar Research Affiliates AAI (memória `reference_research_affiliates.md`: EM 9.0% nominal). Calcular retorno real com inflação ~3.5% → ~5.5% real? Se for esta a fonte, documentar e justificar. Se não, corrigir para 4.73% (média das fontes citadas).

4. **F4 — Memória Factor:** Atualizar com decisões de 2026-04-01.

5. **Se premissas mudarem:** recalcular retorno ponderado em carteira.md e verificar impacto em P(FIRE) via `fire_montecarlo.py`.

---

## Raciocínio

Premissas de retorno são a fundação de todas as projeções de FIRE. Um erro de 8bps no retorno base se propaga por 14 anos de composição e afeta:
- Comparação equity vs IPCA+ (breakeven)
- P(FIRE) no Monte Carlo
- Decisão C vs D vs B (que está pendente desta análise)

Melhor corrigir antes de decidir qualquer mudança de alocação.

---

## Próximos Passos

- [x] F1: SWRD → mediana multi-fonte adotada: 3.7% USD (AQR Global Dev 4.2%, Vanguard 3.6%, JPM 4.4%, RA 2.5%, Schwab 3.7%)
- [x] F2: AVGS haircut confirmado 58% (McLean & Pontiff 2016). Premium 1.3pp sobre SWRD. 5.0% USD adotado
- [x] F3: AVEM → média 4 fontes: AQR 5.1%, JPM 5.3%, GMO 3.8%, RA 6.5% = 5.18%; adotado 5.0% conservador
- [x] F4: Memória Factor atualizada com decisões 2026-04-01
- [x] Quant validou: retorno ponderado B (50/30/20) = 4.85% base / 5.85% favorável / 4.35% stress
- [ ] Verificar impacto em P(FIRE) e breakeven IPCA+ com 4.85% base (era 5.85%) — pendente fire_montecarlo.py
- [x] Premissas fixadas. Decisão C vs D vs B: mantido B por ora (pendente P(FIRE) recalculo)

## Resultado

Premissas substituídas por mediana multi-fonte em 2026-04-01. Efeito: retorno base caiu 100bps (5.85% → 4.85%). Favorável mantém 5.85%. Delta vs IPCA+ 2040: IPCA+ vence por +115bps no base (era +15bps estimado). Impacto material em P(FIRE) — recalculo pendente.

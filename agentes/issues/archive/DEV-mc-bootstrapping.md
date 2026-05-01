# DEV-mc-bootstrapping — MC Bootstrapping Histórico (Nível 2)

## Metadados

| Campo | Valor |
|-------|-------|
| ID | DEV-mc-bootstrapping |
| Dono | Dev + FIRE + Quant |
| Status | ❌ Won't Do |
| Prioridade | — |
| Criada | 2026-04-24 |
| Fechada | 2026-04-24 |
| Fechada por | Head — debate 6 agentes + 3 LLMs externos |

## Decisão de Fechamento

**Won't Do — MC canônico atual é metodologicamente superior para o caso específico de Diego.**

Debate formal em 2026-04-24 com FIRE, Quant, Fact-Checker, Advocate + validação externa com Gemini, GPT-OSS e Llama4 (multi_llm_query.py). Veredicto unânime de que o bootstrap histórico introduz mais ruído do que sinal para este caso concreto.

### Por que a premissa original estava errada

A issue foi criada com a afirmação de que "bootstrapping histórico é metodologicamente superior a qualquer modelo paramétrico". O debate posterior revelou que essa superioridade é **condicional**, não universal — e não se aplica ao caso de Diego pelos motivos abaixo.

### Evidência que levou ao fechamento

| Ponto | Achado | Impacto |
|-------|--------|---------|
| Fat tails mensais (K≈5.75) | Via CLT: K(ln W₁₆₈) → 3.016 após 168 meses | Delta P(FIRE) ≈ 0.1–0.2pp — não material |
| Bootstrap BRL 1994+ | N/H = 2.29x < threshold 3x (Politis & Romano 1994) | Bias ±2–4pp > ganho marginal ≈1–2pp. Líquido negativo |
| Bootstrap USD 1970+ | N/H = 4x — adequado. Mas matematicamente ≡ cenário stress atual (dep_BRL=0%) | Não acrescenta informação nova |
| Maior risco metodológico | r=4.85% com erro ±4–5pp (Goyal & Welch 2008) gera variação ±9–12pp em P(FIRE) | O método de simulação move ≤2pp — risco real é a premissa de retorno, não o método |
| PTAX pré-1994 | 4 quebras estruturais (1986, 1989, 1993, 1994) + correlação dep×IPCA=0.81 gera std=6.35%/mês como artefato | Bootstrap BRL histórico é contaminado por regime incompatível |

### Posições dos agentes

| Agente | Veredicto | Confiança |
|--------|-----------|-----------|
| Quant | Opção C (manter MC) + sugere incremento D (regime switching FX) | 92% |
| FIRE | Opção A (bootstrap USD como validação optativa) | 78% |
| Advocate | Opção B (stress-test paralelo) — mas reconhece equivalência USD=stress | — |
| Fact-Checker | N/H=3x não está explicitamente em Politis & Romano 1994 (heurística) | — |
| GPT-OSS | Opção D prioritária; A como opcional; r=4.85% é o risco dominante | — |
| Gemini | MC paramétrico com cenários FX superior para investidor BRL | — |
| Llama4 | Confirma que erro em r domina erro de método | — |

### O que fazer em vez do bootstrap

O único déficit real identificado pelo debate: **dep_BRL tratada como constante** nos 3 cenários atuais, enquanto historicamente crises cambiais BRL ocorrem com frequência ≈1/6 anos. Isso é endereçado pela issue **DEV-mc-regime-switching-fx** (regime switching FX), que tem custo de implementação baixo e ganho metodológico real.

### Reabertura

Reabrir se:
- CAPE S&P 500 > 35 por 2+ trimestres E P(FIRE) paramétrico divergir >5pp de benchmark externo (FIRECalc)
- Disponibilidade de série PTAX+IPCA pré-1994 confiável e metodologicamente validada
- Horizonte de acumulação aumentar para >20 anos (onde CLT não atenua fat tails suficientemente)

---

## Issue Original (arquivo histórico)

### Por que esta Issue Existia

Debate de 2026-04-24 (FIRE + Quant + Fact-Checker + Advocate) concluiu que **bootstrapping histórico é metodologicamente superior a qualquer modelo paramétrico** (Gaussiano ou Lognormal) para planejamento FIRE de longo prazo. A decisão de implementar lognormal (DEV-mc-canonico) é a correção imediata necessária — mas não é o destino final.

## Problema Estratégico

O modelo lognormal paramétrico com σ=16.8% e μ=4.85% pressupõe:
1. Retornos i.i.d. (independentes e identicamente distribuídos) — **falso empiricamente**
2. Distribuição estacionária (mesmo regime em todos os anos) — **ignora décadas como 1970s vs 1990s**
3. Curtose = 3 (sem fat tails) — **retornos reais têm curtose 4–6+** (Cont 2001, Kim & White 2004)
4. Correlações constantes — **em crashes, todas as correlações vão a 1** (2008, 2020)
5. Retorno esperado constante — **ignora CAPE, valuation, regime**

O bootstrapping histórico resolve todos esses problemas por construção: usa dados reais que já contêm todos esses efeitos.

## Evidência Acadêmica

| Paper | Finding | Relevância |
|-------|---------|------------|
| Efron (1979, Ann. Statistics) | Bootstrap preserva distribuição empírica sem assunção paramétrica | Fundamento teórico |
| Politis & Romano (1994, JASA) | Block bootstrap preserva autocorrelação em séries temporais | Retornos financeiros são autocorrelacionados (momentum/reversão) |
| Bengen (1994, JPF) | SWR de 4% derivada de dados históricos reais, não MC paramétrico | Origem do SWR histórico |
| Kitces (2015, Nerd's Eye View) | MC paramétrico subestima sequência-de-retornos-adversa vs histórico | Argumento central para bootstrap |
| Pfau (2010, FPA Journal) | Dados históricos internacionais mostram SWR 3.5–4.5% — range que paramétrico nem sempre reproduz | Validação histórica necessária |
| FIRECalc (Shiller database, 1871–) | Bootstrapping histórico com dados desde 1871 | Ferramenta de referência |
| ERN (Early Retirement Now, 2016+) | Série extensa sobre Sequence of Returns Risk usando dados históricos | Referência FIRE técnica |

## Dados Disponíveis para Implementação

### Retornos históricos disponíveis

| Série | Período | Acesso |
|-------|---------|--------|
| MSCI World (SWRD proxy) | 1970– | yfinance: `SWRD.L` ou `URTH` |
| MSCI EM (AVEM proxy) | 1988– | yfinance: `EEM` ou `VWO` |
| Small Value Global (AVGS proxy) | 1990– | yfinance: `AVDV` + `AVUV` (composição geográfica) |
| IPCA+ / NTN-B | 2006– | python-bcb: serie 13396 (IPCA+) |
| Selic / LFT | 1995– | python-bcb |
| BRL/USD | 1995– | python-bcb: PTAX |
| Inflação IPCA | 1994– | python-bcb |

### Composição da carteira de Diego (para bootstrap ponderado)

Target atual (fonte: `carteira.md`, `dados/data.json`):
- **SWRD:** 50% equity → usar retorno histórico MSCI World
- **AVGS:** 30% equity → usar AVDV+AVUV ponderado geograficamente
- **AVEM:** 20% equity → usar MSCI EM histórico
- **RF BRL:** Renda+/IPCA+ → usar série NTN-B BCB
- **HODL11/BTC:** ~3% → usar BTC histórico (desde 2014; pré-2014 = 0%)

### Script Python existente

`scripts/market_data.py --factors` já baixa FF5 mensal via `getfactormodels`. Pode ser base para série histórica mensal de retornos por ativo.

## Especificação Técnica

### Abordagem: Block Bootstrap Mensal

```python
# Em Python (geração de dados) — saída: dados/mc_historical_returns.json

import yfinance as yf
import numpy as np

def block_bootstrap_portfolio(
    weights: dict[str, float],
    returns_history: dict[str, pd.Series],
    block_size_months: int = 12,   # bloco de 12 meses preserva sazonalidade
    N: int = 10_000,
    horizon_months: int = 168,     # 14 anos de acumulação
    seed: int = 42,
) -> np.ndarray:
    """
    Returns array (N, horizon_months) de retornos mensais do portfolio.
    Cada bloco de 12 meses é amostrado do histórico completo.
    Resampling with replacement — independência entre blocos.
    """
    ...
```

### Abordagem alternativa: Historical Scenarios (Rolling Windows)

Para cada janela histórica de `horizon_months` meses consecutivos:
- Simular um path de Diego sobre esse período
- P(FIRE) = fração de janelas onde patrimônio ≥ metaFire

Vantagem: captura sequência real de retornos (SoRR). Desvantagem: menos paths disponíveis.

### Output esperado

Arquivo `dados/mc_historical_params.json` gerado por script Python:
```json
{
  "generated_at": "2026-04-24",
  "methodology": "block_bootstrap_monthly_12",
  "n_simulations": 10000,
  "horizon_months": 168,
  "seed": 42,
  "pfire_base": 0.XX,
  "pfire_stress": 0.XX,
  "pfire_fav": 0.XX,
  "percentiles": {
    "p10": [...], "p25": [...], "p50": [...], "p75": [...], "p90": [...]
  },
  "data_sources": {
    "SWRD": "MSCI World 1970–2026",
    "AVGS": "AVDV+AVUV geographically weighted 1990–2026",
    "AVEM": "MSCI EM 1988–2026",
    "RF": "NTN-B BCB 2006–2026"
  }
}
```

O React consome esse JSON pré-computado — não roda bootstrap no browser (muito pesado).

## Mapeamento de Impactos no Dashboard

| Componente | Hoje (paramétrico) | Futuro (bootstrap) |
|------------|-------------------|-------------------|
| P(FIRE) principal | `runCanonicalMC()` | `dados/mc_historical_params.json` |
| FIRE Cenários (stress/base/fav) | MC paramétrico por cenário | Bootstrap com retornos de regimes históricos |
| ReverseFire slider P(FIRE) | `calcPFire()` inline | Pode manter paramétrico (interativo) — anotar limitação |
| StressChart | `runMCYearly()` | Bootstrap block com shock histórico real (2008, 2020) |
| Withdraw guardrails | `runMC()` desacumulação | Bootstrap com retornos históricos pós-1990 |

## Questões Abertas para Debate Futuro

1. **Período histórico:** Usar desde 1970 (MSCI World disponível) ou desde 1988 (com EM)? Mais curto = mais representativo do portfolio diversificado atual. Mais longo = inclui ciclos mais adversos.

2. **CAPE adjustment:** Retornos históricos brutos vs. ajustados por CAPE atual (~33x)? Research Affiliates projeta 3.4% real US — se dados históricos usam média de 5%+, há viés otimista.

3. **BRL vs. USD:** Bootstrap em USD (retornos dos ETFs) com conversão PTAX? Ou Bootstrap já em BRL (retorno real BRL)? Dado que Diego é investidor BRL, o segundo é mais relevante.

4. **Correlação entre ativos:** Bootstrap de portfolio (retornos correlacionados) vs. bootstrap por ativo (independente)? O primeiro é mais correto para capturar crashes onde todas as correlações sobem.

5. **Gastos variáveis:** Guardrails de spending (G1-G5) mudam o withdrawal dependendo do patrimônio — o MC de desacumulação precisa incluir isso para ser realista.

## Critério de Conclusão

- [ ] Script Python `scripts/mc_bootstrap.py` gerando `dados/mc_historical_params.json`
- [ ] Validação: P(FIRE) bootstrap vs. P(FIRE) paramétrico — delta documentado
- [ ] Benchmark externo: comparar P(FIRE) com FIRECalc para perfil equivalente de Diego
- [ ] React consome JSON pré-computado (sem bootstrap no browser)
- [ ] Documentação da metodologia em `agentes/referencia/mc-metodologia.md`
- [ ] Debate FIRE + Quant + Fact-Checker sobre: período histórico, CAPE adjustment, BRL vs USD

## Notas

- **Não bloqueia nada.** O dashboard funciona corretamente com DEV-mc-canonico (lognormal).
- Bootstrapping é melhoria de qualidade, não correção de erro.
- Estimativa de esforço: 2–3 sessions (Python script + validação + React integration).
- Reopener automático: se CAPE S&P 500 > 35 por 2+ trimestres, ou se P(FIRE) paramétrico divergir >5pp de benchmark externo.

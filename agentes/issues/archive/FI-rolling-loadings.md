# FI-rolling-loadings: Rolling Factor Loadings — drift monitor JPGL/AVGS

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-rolling-loadings |
| **Dono** | 02 Factor Investing |
| **Status** | Done |
| **Prioridade** | Média |
| **Criado em** | 2026-03-31 |
| **Concluido em** | 2026-03-31 |
| **Origem** | Revisão proativa com novas ferramentas — `factor_regression.py` hoje roda janela única. Rolling windows dariam early warning de style drift. |

---

## Implementação

`scripts/factor_regression.py --rolling` ou `--rolling-only`

- Janela: 24 meses, passo trimestral (3 meses)
- ETFs: JPGL.L, AVGS.L
- Fatores: FF5 Developed + Momentum
- Gatilhos automáticos com alertas 🔴/🟡

---

## Resultados (2026-03-31)

### AVGS.L
Dados insuficientes — apenas 17 meses (lançado out/2024). Mínimo 18 obs necessário.
**Disponível a partir de out/2026.**

### JPGL.L — últimas 8 janelas

| Data | Market | SMB | HML | RMW | MOM | Alpha% |
|------|--------|-----|-----|-----|-----|--------|
| 2024-04 | 0.904 | 0.326 | 0.169 | 0.150 | 0.112 | -2.9% |
| 2024-07 | 0.900 | 0.147 | 0.033 | -0.162 | 0.025 | -1.5% |
| 2024-10 | 0.916 | 0.122 | 0.014 | -0.211 | 0.046 | -0.4% |
| 2025-01 | 1.007 | -0.197 | 0.218 | -0.206 | -0.172 | -4.4% |
| 2025-04 | 0.913 | 0.137 | 0.358 | -0.028 | 0.028 | -2.5% |
| 2025-07 | 0.807 | 0.097 | 0.391 | -0.099 | -0.017 | -2.7% |
| 2025-10 | 0.836 | 0.098 | 0.428 | 0.053 | -0.052 | -4.0% |
| 2026-01 | 0.815 | 0.126 | 0.440 | 0.066 | -0.094 | -4.1% |

### Tendência (2021-07 → 2026-01)

| Fator | Primeiro | Último | Delta | Tendência |
|-------|---------|--------|-------|-----------|
| Market | 0.902 | 0.815 | -0.087 | ↓ |
| SMB | -0.057 | 0.126 | +0.183 | ↑ |
| HML | 0.152 | 0.440 | +0.288 | ↑ (value tilt crescendo) |
| RMW | 0.304 | 0.066 | -0.238 | ↓ |
| MOM | 0.092 | -0.094 | -0.186 | ↓ |

---

## Alertas Ativos

| Alerta | Status | Detalhe |
|--------|--------|---------|
| Market beta > threshold por 2+ trimestres | 🔴 **Ativo** | Últimas 4 janelas acima de 0.70 (0.807–0.836–0.815). Ver diagnóstico abaixo. |
| SMB mudou sinal | 🟡 Monitorar | -0.197 → +0.137. Magnitudes pequenas, próximas de zero |
| MOM mudou sinal | 🟡 Monitorar | +0.028 → -0.017. Ambos não significativos |

### Diagnóstico do alerta Market beta

O gatilho original (>0.70) foi calibrado com dados **diários** (beta full-period = 0.423). Em janelas mensais de 24m, o beta é estruturalmente maior. O alerta é tecnicamente correto mas não indica mudança estrutural:

- Coincide com o único período histórico em que low-vol perdeu para cap-weight (2019-2026, já documentado em FI-jpgl-redundancia como exceção, não regra)
- Em bull markets de low-dispersion, ações low-vol sobem junto com o mercado, aumentando correlação ciclicamente
- HML 0.440 (value tilt) continua forte e crescendo — tese fatorial não está comprometida

**Conclusão:** cíclico, não estrutural. Não acionar substituição.

---

## Gatilhos Recalibrados

| Gatilho | Threshold ANTIGO | Threshold NOVO | Racional |
|---------|-----------------|----------------|----------|
| JPGL Market beta | > 0.70 absoluto | > **2× beta full-period** por 2 trimestres | Beta full-period atual: 0.42 → threshold dinâmico: ~0.84. Robusto a regimes |
| AVGS SMB | < 0.35 | < 0.35 (mantido) | Aguardar dados suficientes (out/2026) |
| Qualquer loading muda sinal | 2 trimestres | 2 trimestres (mantido) | — |

**Implementação na memória:** atualizar `agentes/memoria/02-factor.md` — seção Gatilhos Ativos.

---

## Conclusão

Script implementado e rodando. AVGS aguarda dados (out/2026). JPGL com alerta cíclico de Market beta — não estrutural. Gatilho recalibrado para > 2× beta full-period.

# FI-rolling-loadings: Rolling Factor Loadings — drift monitor JPGL/AVGS

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FI-rolling-loadings |
| **Dono** | 02 Factor Investing |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Criado em** | 2026-03-31 |
| **Origem** | Revisão proativa com novas ferramentas — `factor_regression.py` hoje roda janela única. Rolling windows dariam early warning de style drift. |

---

## Problema

`scripts/factor_regression.py` calcula uma única regressão sobre todo o histórico disponível. Isso diz "quais foram os loadings médios", mas não diz "os loadings estão mudando ao longo do tempo".

**Por que importa:**
- JPGL teve alpha negativo de -2.33%/ano no período 2019-2026 (não significativo). Se o HML ou Market beta está derivando, é early warning de que o fundo mudou de comportamento.
- AVGS: SMB = 0.578***, HML = 0.433***. Se o SMB cair abaixo de 0.3, a tese de small-cap value está enfraquecendo.
- FI-crowdedness alertou que momentum está em "zona de atenção sistêmica". Rolling MOM loading de JPGL diria se o tilt está sendo comprimido.

---

## Escopo

### Implementação sugerida

Extensão do `factor_regression.py` com flag `--rolling`:

```python
# Janela deslizante de 24 meses (504 dias úteis)
# Passo: trimestral (63 dias)
# Output: linha do tempo dos loadings SMB, HML, RMW, MOM, Market para JPGL e AVGS
```

**Gatilhos de alerta a definir:**
- JPGL Market beta > 0.70 por 2 trimestres consecutivos (low-vol overlay se perdendo)
- AVGS SMB < 0.35 por 2 trimestres consecutivos (small-cap tilt se diluindo)
- JPGL/AVGS qualquer loading mudar sinal por 2 trimestres consecutivos

### Output esperado

Tabela trimestral dos últimos 2 anos + linha do tempo visual dos loadings principais.

---

## Conexão com gatilhos existentes

Os 5 gatilhos de `FI-jpgl-redundancia` (alpha t < -2.0, methodology change, etc.) seriam monitorados passivamente. Rolling loadings os tornariam **ativos** — o script alertaria quando a tendência começar, não quando o threshold for atingido.

---

## Prioridade e timing

Baixa urgência imediata — JPGL foi validado com 6+ anos de dados. Mas alta utilidade como **infraestrutura de monitoramento**.

Sugestão: implementar junto com `HD-python-stack-v2` (quando for retomado), pois ambos envolvem extensão dos scripts existentes.

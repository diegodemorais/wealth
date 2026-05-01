# QUANT-002: guardrails_retirada com regras P(FIRE) em vez de drawdown

**Status**: Aberto  
**Severidade**: 🔴 CRÍTICO  
**Data**: 2026-04-25  
**Agentes responsáveis**: Dev, Fire  
**Bloqueador**: Sim (requer validação Fire)  

---

## O Problema

O dashboard exibe guardrails de retirada baseados em **P(FIRE)**, mas a carteira.md (aprovada 2026-03-20) define as regras de retirada baseadas em **drawdown**.

### Guardrails em data.json (INCORRETO)

| Guardrail | Condição | Retirada |
|---|---|---|
| Expansivo | P(FIRE) ≥ 95% | Máximo (~R$275k) |
| Normal | 80% ≤ P(FIRE) < 95% | Base (R$250k) |
| Defesa | P(FIRE) < 80% | Reduzido (~R$180k) |

### Guardrails em carteira.md (CORRETO, aprovado)

| Guardrail | Condição | Retirada |
|---|---|---|
| Expansivo | Upside: Patrimônio +25% acima target | R$275k (+10%, teto R$350k) |
| Normal | Drawdown 0-15% | R$250k (nada) |
| Cautela 1 | Drawdown 15-25% | R$225k (corte 10%) |
| Cautela 2 | Drawdown 25-35% | R$200k (corte 20%) |
| Defesa | Drawdown >35% | R$180k (piso essencial) |

---

## Por que é crítico?

1. **Recomendação de retirada desatualizada**: Usuário segue regras P(FIRE) que foram substituídas
2. **Decisão financeira crítica**: Retirada é o mecanismo central do plano FIRE. Regras erradas = risco de ruína ou desperdício
3. **Divergência com plano aprovado**: carteira.md foi validado e aprovado. Data.json tem versão diferente.
4. **Impacto direto na vida**: Retirada mensal de R$250k vs. R$225k vs. R$180k é diferença material (~R$600k-R$900k/ano)

---

## Causa Raiz

Migração incompleta de regras em `generate_data.py`:

1. carteira.md foi atualizado (2026-03-20) com regras por **drawdown**
2. `generate_data.py` ainda gera `guardrails_retirada` com regras por **P(FIRE)**
3. Ninguém sincronizou ambos os artefatos

**Arquivos desalinhados**:
- ✅ `agentes/contexto/carteira.md` — versão aprovada (drawdown)
- ❌ `dados/dashboard_state.json` ou entrada em `generate_data.py` — versão obsoleta (P(FIRE))
- ❌ `react-app/public/data.json` — exibe guardrails P(FIRE)

---

## Impacto

- 🔴 **Crítico**: Recomendação de retirada diverge da estratégia aprovada
- 📊 **Decisão central**: FIRE Day depende de regras de retirada corretas
- 💰 **Impacto material**: Diferença de R$25k-R$70k/mês entre guardrails

---

## Solução Recomendada

### Passo 1: Validar regras com Fire agent

Chamar Fire agent para confirmar:
- ✅ As 5 regras por drawdown em carteira.md são as **corretas e atuais**
- ✅ Não há regras P(FIRE) complementares que precisem ser preservadas
- ✅ Valores de retirada (R$250k, R$225k, R$200k, R$180k, R$275k) estão aprovados

### Passo 2: Implementar em generate_data.py

Refatorar `generate_data.py` para gerar `guardrails_retirada` baseado em **drawdown simulado**:

```python
# PSEUDOCÓDIGO
guardrails_retirada = {
    "expansivo": {
        "condicao": "patrimonio > target × 1.25",
        "retirada_sugerida": 275000,
        "descricao": "Upside: +10% vs. target"
    },
    "normal": {
        "condicao": "drawdown ≤ 15%",
        "retirada_sugerida": 250000,
        "descricao": "Sem ajuste"
    },
    "cautela_1": {
        "condicao": "15% < drawdown ≤ 25%",
        "retirada_sugerida": 225000,
        "descricao": "Corte 10% vs. base"
    },
    "cautela_2": {
        "condicao": "25% < drawdown ≤ 35%",
        "retirada_sugerida": 200000,
        "descricao": "Corte 20% vs. base"
    },
    "defesa": {
        "condicao": "drawdown > 35%",
        "retirada_sugerida": 180000,
        "descricao": "Piso essencial"
    }
}
```

Calcular `drawdown` atual como:
```
drawdown_pct = (target - patrimonio_atual) / target × 100
```

Usando:
- `target` = patrimonio_gatilho = 8.333.333
- `patrimonio_atual` = premissas.patrimonio_atual = 3.729.678
- `drawdown_pct` = (8.333.333 - 3.729.678) / 8.333.333 × 100 = **55.2%** (em FIRE, drawdown é esperado)

### Passo 3: Validar em /withdraw

Após implementar, garantir que:
1. `GuardrailsRetirada.tsx` exibe as 5 regras (ou 3 aplicáveis ao drawdown atual)
2. Valores de retirada correspondem a carteira.md
3. Labels indicam "Drawdown" em vez de "P(FIRE)"

### Passo 4: Considerar P(FIRE) como métrica complementar

Se P(FIRE) ainda deve ser exibida como **contexto** (sem mudar retirada):
- Criar campo separado `guardrails_pfire_retirada` (opcional)
- Exibir P(FIRE) como "informação" mas não como "gatilho"
- Label claro: "P(FIRE) está em 86.4%, mas regra de retirada segue drawdown"

---

## Validação

Após implementar:

1. Navegar para `/withdraw`
2. Verificar que as recomendações de retirada seguem drawdown, não P(FIRE):
   ```
   drawdown_pct = (8333333 - 3729678) / 8333333 = 55.2%
   → Guardrail esperado: DEFESA (drawdown > 35%)
   → Retirada sugerida: R$180k
   ```
3. Confirmar visualmente que a página mostra a condição de drawdown (não P(FIRE))
4. Testar com diferentes cenários de patrimônio simulado

---

## Checklist

- [ ] Fire agent valida que regras em carteira.md são corretas e atuais
- [ ] Atualizar `generate_data.py` para calcular guardrails baseado em drawdown
- [ ] Verificar que `data.json` `guardrails_retirada` reflete regras de drawdown
- [ ] Verificar que `GuardrailsRetirada.tsx` exibe labels corretos ("Drawdown", não "P(FIRE)")
- [ ] Testar visualmente em localhost:3000/withdraw
- [ ] Validar com Fire agent que recomendações estão corretas
- [ ] Merge em `claude/pull-main-IW9VP`

---

## Relacionado

- QUANT-001 (P(FIRE) divergência): Resolve separadamente
- carteira.md (linha ~Guardrails): Fonte de verdade

---

**Estimativa**: 3-4 horas (inclui Fire review)  
**Depende de**: Fire validation  
**Bloqueador para**: Retirada mensal confiável

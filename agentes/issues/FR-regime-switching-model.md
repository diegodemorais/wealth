# FR-regime-switching-model: Regime Switching para Modelo P(FIRE)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-regime-switching-model |
| **Dono** | FIRE + Quant |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | FIRE, Quant, Advocate |
| **Co-sponsor** | Head, Diego |
| **Dependencias** | FR-pfire-model-robustness (concluída 2026-04-29) |
| **Criado em** | 2026-04-29 |
| **Origem** | Ponto P1 da auditoria ChatGPT (FR-pfire-model-robustness). Aprovado por Diego como sub-issue a escalar. |

---

## Contexto

O modelo atual usa t-Student df=5 com retornos iid (independentes e identicamente distribuídos). Cada ano sorteia um retorno independente, sem memória de anos anteriores.

**O problema empírico:** crises históricas não são anos ruins isolados — são *regimes* persistentes:
- Japão 1990-2020: Nikkei 75% abaixo do pico de 1989 após 20 anos
- EUA 1966-1982: 16 anos de retorno real negativo em equity
- Brasil 1980-1994: regime de hiperinflação (IPCA cumulativo >1 bilhão%)

t-Student df=5 captura fat tails em anos individuais, mas não captura **autocorrelação serial**: um ano ruim não aumenta a probabilidade do próximo ser ruim. Isso subestima sequence of returns risk em horizontes longos.

**Impacto estimado** (Advocate + literatura):
- P(FIRE) central (mediana): -5 a -8pp vs modelo atual
- Caudas P5-P10: otimistas em ~2-4pp adicionais
- Intervalo real de incerteza do modelo: ~72-92% (vs 84.1% pontual)

---

## O que é Regime Switching

### Modelo de 2 estados (Markov Switching)

Hamilton (1989), Ang & Bekaert (2002): o mercado alterna entre:
- **Estado 1 (bull):** retorno mensal ~+1.5%, vol ~3.5%, persistência ~18-24 meses
- **Estado 2 (bear):** retorno mensal ~-3%, vol ~8%, persistência ~12-18 meses

A transição entre estados é governada por uma matriz de probabilidades:
```
P(bull→bull) = 0.95, P(bull→bear) = 0.05
P(bear→bull) = 0.10, P(bear→bear) = 0.90
```

Isso gera clusters de retornos ruins (regimes bear prolongados) que o iid não consegue replicar.

### Alternativas mais simples

1. **Bootstrap por blocos:** resamplear sequências históricas de 12-24 meses (preserva autocorrelação sem modelar transições explicitamente)
2. **GARCH:** volatilidade time-varying (captura heteroskedasticity, mas não média de retornos)
3. **Cenários de regime determinísticos:** o modelo atual já tem `CENARIOS_ESTENDIDOS` (stagflation, hyperinflation) — mas aplicados como modificadores da média, não como estados probabilísticos

---

## Questões para o time

### Para FIRE:
1. Regime switching muda a interpretação do bond tent? Se regimes bear persistem 12-24 meses, o pool de 7 anos é suficiente?
2. Os guardrails com feedback estocástico (P6 de FR-pfire-model-robustness) ficam mais importantes em modelo de regime? A heurística atual é mais conservadora ou mais permissiva?

### Para Quant:
1. Qual a matriz de transição empírica para equity global (MSCI World real) pós-1970? Calibrar bull/bear com dados históricos.
2. Comparar P(FIRE) com regime switching 2-estados vs t-Student df=5 — qual o delta quantitativo real para o portfólio de Diego (equity 79%, bond pool 7 anos, 37 anos de horizonte)?
3. O bootstrap por blocos (janelas de 12 meses) seria uma alternativa mais simples com impacto equivalente?
4. Correlação entre regimes e IPCA: em regimes bear, o IPCA no Brasil tende a subir ou cair? (Implicação para retorno real do bond pool IPCA+)

### Para Advocate:
1. Se regime switching reduz P(FIRE) de 84.1% para ~76-79%, o FIRE Day 2040 (age 53) é justificável?
2. Qual mitigação adicional seria necessária para compensar o risco de regime? (aporte extra, guardrails mais agressivos, renda alternativa pós-FIRE)

---

## Escopo

- [ ] Calibrar parâmetros de regime switching com dados históricos de equity global
- [ ] Implementar simulação de regime switching em `fire_montecarlo.py` (novo modo, não substituir t-Student)
- [ ] Comparar P(FIRE) t-Student vs regime switching vs bootstrap por blocos
- [ ] Avaliar impacto no bond tent e guardrails
- [ ] Propor se/quando migrar o modelo principal para regime switching
- [ ] Não implementar sem aprovação de Diego

---

## Análise

> A preencher pelo time.

---

## Conclusão

> A preencher após debate.

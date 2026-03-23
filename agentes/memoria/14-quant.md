# Memoria: Quant / Auditor Numerico

> Somente erros encontrados, auditorias realizadas e decisoes registradas aqui.

---

## Auditorias Realizadas

| Data | Issue/Contexto | Resultado | Finding |
|------|---------------|-----------|---------|
| — | — | — | — |

---

## Erros Encontrados

| Data | Agente | Erro | Impacto | Correcao |
|------|--------|------|---------|----------|
| — | — | — | — | — |

---

## Premissas Numericas Validadas

| Premissa | Valor | Fonte | Ultima validacao |
|----------|-------|-------|-----------------|
| — | — | — | — |

---

## Gatilhos e Regras

- Acionamento automatico ANTES/DEPOIS de calculos que geram veredicto
- Veto absoluto sobre numeros: agente DEVE corrigir antes de apresentar a Diego
- Se 2+ agentes divergem em numeros para mesma variavel: reconciliar antes de prosseguir
- Scripts complexos salvos em `analysis/` para reproducibilidade

### Quando acionar (lista obrigatoria — Head garante)

| Situacao | Quem aciona |
|----------|-------------|
| IR sobre ganho nominal/real/cambial | RF, FIRE, Tax |
| Breakeven entre dois ativos | RF, Factor, Advocate |
| Retorno liquido esperado (qualquer ativo) | RF, Factor, FIRE |
| Comparacao all-in equity vs RF | Factor, RF |
| Projecao de patrimonio / Monte Carlo | FIRE |
| Drawdown calculado (%, valor absoluto) | Risco |
| SWR / withdrawal rate | FIRE |
| Qualquer calculo que gera veredicto de decisao | Todos |

**Aprendizado retro 2026-03-22**: Quant foi criado apos os 4 erros do HD-006. O reflexo de acionamento automatico precisa ser construido agora — o Head garante que nenhum calculo que gera veredicto e apresentado a Diego sem passar pelo Quant primeiro.

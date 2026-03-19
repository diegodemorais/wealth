# Memoria: Analista de Macro Brasil

> Somente decisoes confirmadas por Diego sao registradas aqui.

---

## Decisoes Confirmadas

| Data | Decisao | Racional | Agentes Consultados |
|------|---------|----------|---------------------|
| 2026-03 | Macro nao muda estrategia | Contexto apenas para decisoes ja planejadas | 01 Head |
| 2026-03 | Monitorar NTN-B 2040 e Renda+ 2065 mensalmente | Referencia para cenario IPCA+ e gatilho tatico | 03 Renda Fixa, 06 Risco |

---

## Regras Operacionais

1. **Snapshot completo obrigatorio**: O snapshot NAO pode ter campos em branco. Todos os indicadores devem ser preenchidos na montagem e atualizados mensalmente via WebSearch. Se dado nao estiver disponivel, registrar "dado pendente — divulgacao em [data]".

---

## Snapshot Macro Atual

| Indicador | Valor | Data | Fonte |
|-----------|-------|------|-------|
| Selic | 15,00% | 2026-03 | COPOM |
| IPCA+ 2045 | ~7,14% | 2026-03-05 | Tesouro Direto |
| Renda+ 2065 | IPCA + 6,87% (~7,0%+) | 2026-03 | Tesouro Direto |
| IPCA 12m | 3,81% | fev/2026 | IBGE |
| BRL/USD | ~5,20 | 2026-03-17 | BCB |

> Atualizar mensalmente via WebSearch. Proximo IPCA: 10/abr/2026.

---

## Gatilhos Ativos

| Gatilho | Condicao | Acao | Status |
|---------|----------|------|--------|
| IPCA+ aos 48 | Taxa >= 6,5% na epoca | Sinalizar para Head e Renda Fixa | Aguardando (2035) |
| Renda+ mensal | Taxa do Renda+ 2065 | Reportar ao agente 06 Risco | Monitorando |

---

## Historico de Consultas

| Data | Tema | Resultado |
|------|------|-----------|
| 2026-03 | Macro deve alterar a estrategia? | Nao — contexto informativo apenas |
| 2026-03 | O que monitorar mensalmente? | NTN-B 2040 e Renda+ 2065 |
| 2026-03-18 | Completar snapshot (HD-001) | Preenchido: Renda+ 6,87%, IPCA 3,81%, BRL/USD 5,20 |
| 2026-03-18 | RF-001: cenario macro para Renda+ | Base (50-55%): gatilho 6,0% em 12-18m. Pessimista (25-30%): 8%+ se fiscal deteriorar. Risco: eleicoes 2026 |

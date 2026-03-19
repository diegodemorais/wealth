# Issues — Carteira Diego

## Modos Operandi

| Modo | Descricao | Quando |
|------|-----------|--------|
| **Conversa** | Livre, exploratorio. Head roteia e sintetiza | Modo padrao |
| **Issue** | Formal, estruturado, com conclusao obrigatoria | Temas que merecem profundidade |

Conversas podem gerar Issues. O Head deve sugerir proativamente.

---

## Board

### Refinamento
> Issues que precisam de mais detalhamento antes de comecar

| ID | Titulo | Dono | Prioridade |
|----|--------|-------------|------------|
| — | — | — | — |

### Backlog
> Issues prontas para execucao, aguardando vez

| ID | Titulo | Dono | Prioridade |
|----|--------|-------------|------------|
| FI-002-Reduzir_AVEM_20_para_15 | Reduzir AVEM de 20% para 15%: destino dos 5pp | 02 Factor | Media |
| PT-001-Bond_OneLife_estrutura_luxemburgo | Bond OneLife: converter participacao na holding (longo prazo) | 09 Patrimonial | Baixa |
| FI-001-Rebalancear_SWRD_AVGS_factor_tilt | SWRD 35→30% / AVGS 25→30%: otimizar factor tilt | 02 Factor | Baixa |

### Doing
> Issues em andamento

| ID | Titulo | Dono | Prioridade | Status |
|----|--------|------|------------|--------|
| — | — | — | — | — |

### Done
> Issues concluidas

| ID | Titulo | Dono | Data | Resultado |
|----|--------|------|------|-----------|
| FI-003-AVGC_vs_JPGL_multifator | AVGC vs JPGL: melhor multifator UCITS? | 02 Factor | 2026-03-18 | JPGL confirmado — complementa com momentum + low vol. AVGC closet indexing |
| RF-002-IPCA_plus_agora_taxa_7 | Alocar 10% IPCA+ agora (taxa 7%+) | 03 Renda Fixa | 2026-03-18 | Aprovado. Ladder 2035/2040/2050 sem cupom. Gatilho IPCA+ aos 48 removido |
| FR-001-Stress_test_custo_vida_fire | Stress test FIRE: cenarios de custo de vida | 04 FIRE | 2026-03-18 | Limite seguro R$ 360k/ano. R$ 250k folga ampla, R$ 350k viavel (SWR 3,40%) |
| RF-001-Renda_plus_rentabilidade_cenarios_queda | Rentabilidade Renda+ 2065 nos cenarios de queda | 03 Renda Fixa | 2026-03-18 | Gatilho 6,0% validado. Duration 43,6. Compra DCA ate 5% se taxa >= 6,5% |
| HD-001-Retro_2026_03_18_acoes | Acoes da Retro 2026-03-18 | 01 Head | 2026-03-18 | 6/6 acoes concluidas |

---

## Convencao de IDs

Formato: `{SIGLA}-{NUM}-{Slug_descritivo}`
- Slug: snake_case, curto, descritivo. Ex: `RF-001-Renda_plus_rentabilidade_cenarios_queda`
- Arquivo: `agentes/issues/{ID}.md`

| Sigla | Agente | Exemplo |
|-------|--------|---------|
| HD | 01 Head de Investimentos | HD-001 |
| FI | 02 Factor Investing | FI-001 |
| RF | 03 Renda Fixa Brasil | RF-001 |
| FR | 04 FIRE / Aposentadoria | FR-001 |
| TX | 05 Tributacao | TX-001 |
| RK | 06 Ativos de Risco | RK-001 |
| FX | 07 Cambio Internacional | FX-001 |
| MA | 08 Macro Brasil | MA-001 |
| PT | 09 Patrimonial | PT-001 |
| XX | Cross-domain (multiplos) | XX-001 |

Sigla = agente RESPONSAVEL principal (mesmo que outros participem).

---

## Template

Cada issue e um arquivo em `agentes/issues/{ID}.md`. Ver `_TEMPLATE.md` para o modelo.

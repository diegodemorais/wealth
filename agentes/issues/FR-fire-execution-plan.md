# FR-fire-execution-plan: Playbook Operacional do FIRE Day

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-fire-execution-plan |
| **Dono** | 04 FIRE |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | RF, Tax, Bookkeeper, Advocate |
| **Co-sponsor** | Head (discovery composição/issues 2026-04-01) |
| **Dependencias** | — |
| **Criado em** | 2026-04-01 |
| **Origem** | Discovery de gaps — nenhum playbook operacional existe para o momento da aposentadoria |
| **Concluido em** | — |

---

## Motivo / Gatilho

Diego tem modelo de acumulação robusto (Monte Carlo, bond tent, guardrails), mas não existe nenhum documento que responda: "Chegou o FIRE Day — o que faço amanhã?" O gap entre "patrimônio atingido" e "execução de desacumulação" não está mapeado.

Discovery de 2026-04-01 identificou como o gap operacional mais crítico do sistema.

---

## Descrição

Criar playbook operacional detalhado para o momento da aposentadoria (estimado ~2037):

1. **Ordem de saques**: qual conta/ativo sacar primeiro? IPCA+ antes de equity? Transitórios antes de alvos?
2. **Caixa mínimo**: quanto manter em conta corrente/reserva líquida ao iniciar a desacumulação?
3. **Sequência de liquidação dos transitórios**: EIMI, AVDV, AVUV, AVES, USSC, DGS — em que ordem e quando?
4. **Ativação do IPCA+**: Renda+ 2065 vence em 2065, TD 2040 e 2050 vencem antes do FIRE — o que fazer com o vencimento?
5. **Regra de rebalanceamento pós-FIRE**: sem aportes mensais, como manter target? Threshold ou calendar?
6. **Transição de holding**: qual estrutura jurídica/fiscal para receber renda de desacumulação?
7. **Contingência de mercado no FIRE Day**: e se equity cair 30% nos 12 meses anteriores? Adia? Reduz?

---

## Escopo

- [ ] Mapear todas as fontes de renda disponíveis no FIRE Day (Renda+, TD 2040/2050, equity, INSS futuro, imóvel)
- [ ] Definir ordem de prioridade de saques (tax efficiency + sequência SoRR)
- [ ] Calcular caixa mínimo recomendado (ex: 2 anos de gastos em RF curto)
- [ ] Planejar liquidação dos transitórios (6 ETFs US-listed): janela, ordem, impacto tributário
- [ ] Definir regra de rebalanceamento sem aportes
- [ ] Modelar cenário de FIRE Day com equity em drawdown (SoRR no limite)
- [ ] Definir gate de adiamento: "se X, atrasar FIRE em 1 ano"
- [ ] Documentar playbook em `agentes/referencia/fire-day-playbook.md`

---

## Raciocínio

**Argumento central:** Modelo de acumulação excelente não garante execução correta no FIRE Day. Erros de sequência (sacar equity em drawdown, não ter caixa, pagar IR desnecessário) podem custar anos de patrimônio.

**Incerteza reconhecida:** Estrutura tributária e de holding ainda indefinida (TX-sucessao-testamento não aberta). Playbook pode precisar de revisão quando esse contexto estiver definido.

**Falsificação:** Se legislação tributária mudar materialmente a ordem ótima de saques, o playbook precisa ser refeito.

---

## Análise

> Preencher durante execução da issue.

---

## Conclusão

> Preencher ao finalizar.

---

## Resultado

> Preencher ao finalizar.

---

## Próximos Passos

- [ ] Executar quando entrar em Doing

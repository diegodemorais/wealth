# FR-fire-execution-plan: Playbook Operacional do FIRE Day

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-fire-execution-plan |
| **Dono** | 04 FIRE |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | RF, Tax, Bookkeeper, Advocate |
| **Co-sponsor** | Head (discovery composição/issues 2026-04-01) |
| **Dependencias** | — |
| **Criado em** | 2026-04-01 |
| **Origem** | Discovery de gaps — nenhum playbook operacional existe para o momento da aposentadoria |
| **Concluido em** | 2026-04-02 |

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

Executada em 2026-04-02. 4 agentes em paralelo (FIRE, RF, Tax, Advocate — posições independentes).

**Finding crítico (Advocate):** 94% equity pós-60 anos não é design — é omissão. A tabela de alocação por idade mostra equity subindo de 79% → 94% como consequência mecânica de gastar o bond pool, sem estratégia desenhada para anos 60-80. Cenário de falha: equity -40% quando Diego tem 62 anos → patrimônio R$11M → R$6,6M → SWR ~4,5% → P(sucesso) ~55%. Solução: Decisão 7 (IPCA+ 2045-2050 aos 51-52) + teto de equity 80-85%.

**RF corrige dado:** TD 2040 líquido = ~R$1,683M (não R$1,9M bruto). IR ~R$223k retido na fonte. Bond pool total líquido: ~R$2,1M.

**Tax:** seguro de vida temporário (~R$1,5k/ano) é a solução correta para estate tax risk — não liquidar transitórios agora. Liquidar nos 2 primeiros anos do FIRE. IR total da migração: ~R$130-135k.

---

## Conclusão

Playbook criado em `agentes/referencia/fire-day-playbook.md`.

Regras mecânicas principais:
1. Bond pool first (anos 0-7). Equity só quando pool < 2× gastos.
2. Rebalanceamento via saques direcionados (sem compra/venda).
3. Gate único de adiamento: patrimônio < R$8M ou pool < R$1M (não queda de equity).
4. US-listed liquidar nos 2 primeiros anos (reinvestir UCITS no mesmo dia).
5. TD 2050 → segundo buffer pré-INSS (não reinvestir em equity imediatamente).
6. Decisão 7 obrigatória aos 51-52: IPCA+ 2045-2050 resolve lacuna anos 9-10 e evita 94% equity nos 60-80.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Documento** | `agentes/referencia/fire-day-playbook.md` criado — 10 seções, timeline completo |
| **Dado corrigido** | TD 2040 líquido: R$1,683M (não R$1,9M). Pool total: ~R$2,1M |
| **Finding novo** | 94% equity pós-60 é omissão estrutural — Decisão 7 é a correção |
| **Ação urgente** | Seguro de vida ~$65k, 14 anos: ~R$1,5k/ano. Pendente há meses |

---

## Próximos Passos

- [x] Playbook operacional documentado
- [ ] **URGENTE:** Contratar seguro de vida ~$65k, 14 anos (Diego)
- [x] Decisão 7 reformulada: IPCA+ 2045 com juros semestrais não compensa. TD 2050 existente já cobre o gap anos 8-10.
- [ ] Decisão formal: teto de equity pós-60 em 80-85% (não 94%)
- [ ] Modelar cenário bond pool a 50% do target (Quant + FIRE)
- [ ] Abrir issue: componente offshore no bond pool (USD Treasuries)
- [ ] Revisitar playbook quando TX-sucessao-testamento for aberta

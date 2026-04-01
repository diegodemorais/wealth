# XX-lacunas-estrategicas: Lacunas estratégicas abertas — P(FIRE), AVGS tail risk, falsificabilidade

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-lacunas-estrategicas |
| **Dono** | Head (cross-domain) |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | FIRE, Factor, Advocate, Quant |
| **Co-sponsor** | Advocate (endossou abertura: 4 temas sem resolução formal) |
| **Dependencias** | — |
| **Criado em** | 2026-04-01 |
| **Origem** | Conversa — Diego perguntou o que está pendente em estratégia |
| **Concluido em** | — |

---

## Motivo / Gatilho

4 lacunas estratégicas identificadas sem resolução formal, após meses de trabalho focado em processo/estrutura:

1. As premissas de retorno foram corrigidas no HD-006 (equity 5.96% base BRL, IPCA+ 6.0% HTM) mas o P(FIRE 50) nunca foi re-rodado com esses números. O 87% atual pode estar errado.
2. O backtest de 2026-03-23 revelou que AVGS 25% tem Max DD -39% como *piso*, não teto. Nunca virou decisão explícita.
3. Falsificabilidade: após 3 retros como carry-over sem resolução (HD-falsificabilidade escalada formalmente em 2026-04-01), ainda não temos: qual evidência específica invalidaria a estratégia?
4. HD-007: tabela master estava em rascunho aguardando advocate + aprovação. Verificar estado real vs mapa de gatilhos (Done 2026-03-23).

---

## Descrição

Quatro questões que ficaram abertas enquanto o time focava em processo e infraestrutura analítica. Nenhuma é urgente isoladamente, mas em conjunto representam lacunas no fundamento da estratégia:

- **P(FIRE 50) desatualizado**: O 87% foi calculado com premissas pré-HD-006. Com equity 5.96% base e IPCA+ 6.0% HTM, o número pode ter mudado. Não sabemos em qual direção.
- **AVGS tail risk implícito**: Aceitamos 25% em AVGS sabendo que o backtest mostra Max DD -39% como piso. Em 2008-style, poderia ser -60%+. Nunca documentamos essa aceitação — se veio, foi tácita.
- **Falsificabilidade**: A questão de fundo é: como a estratégia poderia estar errada? Se não temos critério para invalidar, não é evidence-based — é crença. (Absorve HD-falsificabilidade do backlog.)
- **HD-007 estado real**: Memory diz "pausada, aguarda advocate". README mostra Done. Reconciliar.

---

## Escopo

- [ ] 1. Re-rodar P(FIRE 50) com premissas HD-006 corretas: equity 5.96% base / 6.96% favorável / 5.46% stress; IPCA+ 6.0% HTM; guardrails vigentes. Comparar com o 87% atual.
- [ ] 2. Decisão explícita sobre AVGS tail risk: aceitar Max DD -39% (piso) conscientemente, ou ajustar peso? Documentar com pre-mortem.
- [ ] 3. Falsificabilidade: definir para cada bloco da estratégia a evidência específica, coletável em 12 meses, que mudaria ≥20% de alocação. Sem isso, a issue não conclui.
- [ ] 4. Reconciliar estado real do HD-007 (tabela master vs mapa de gatilhos Done).

---

## Raciocínio

**Alternativas rejeitadas:** Abrir 4 issues separadas — overhead desnecessário para temas que podem ser resolvidos em uma sessão coordenada.

**Argumento central:** Processo sem estratégia sólida embaixo é decoração. Esses 4 itens são o fundamento que precisa estar correto antes da próxima revisão anual.

**Incerteza reconhecida:** P(FIRE) pode ter melhorado (IPCA+ mais lucrativo do que estimado antes) ou piorado. AVGS tail risk pode ser aceitável dado o capital humano e o horizonte. Falsificabilidade pode revelar que a estratégia é mais robusta do que parece — ou não.

**Falsificação:** Esta própria issue deve concluir com critérios de falsificação explícitos. Se não conseguirmos defini-los, o veredicto é "estratégia irrefalsificável" — o que exige reformulação.

---

## Análise

> A preencher durante a execução.

---

## Conclusão

> A preencher ao finalizar.

### Veredicto Ponderado

| Agente | Peso | Posição | Contribuição |
|--------|------|---------|-------------|
| Head | 1x | — | — |
| FIRE | 3x | — | — |
| Factor | 3x | — | — |
| Advocate | 1x | — | — |
| Quant | 2x | — | — |
| **Score ponderado** | | **—** | **—** |

---

## Resultado

> A preencher ao finalizar.

| Tipo | Detalhe |
|------|---------|
| **Alocação** | — |
| **Estratégia** | — |
| **Conhecimento** | — |
| **Memória** | — |

---

## Próximos Passos

- [ ] Executar quando Diego quiser trabalhar nesta issue

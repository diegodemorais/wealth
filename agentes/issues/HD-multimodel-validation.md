# HD-multimodel-validation: Multi-Model Validation — executar em issue estrutural

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-multimodel-validation |
| **Dono** | Head |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Head (lead), Advocate |
| **Co-sponsor** | Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-04-03 |
| **Origem** | Escalação — carry-over 2+ retros consecutivas sem execução (2026-03-20 → 2026-04-03) |
| **Concluido em** | — |

---

## Motivo / Gatilho

O protocolo Multi-Model Validation foi aprovado em 2026-03-20 (HD-unanimidade) e prometido como obrigatório em decisões estruturais. Nunca foi executado — 4+ retros consecutivas de carry-over.

Escopo original: Advocate prepara prompt neutro de Bull vs Bear sobre uma premissa central da carteira. Diego roda em GPT/Gemini. Advocate compara outputs com o resultado do time. Objetivo: compensar a limitação de mesmo-LLM (todos os agentes = mesmo modelo).

---

## Descrição

O sistema tem 14+ agentes mas todos são o mesmo LLM (Claude). A diversidade é de contexto e instrução, não epistêmica. O Multi-Model Validation é o único mecanismo disponível para validação genuinamente independente de uma premissa.

Candidatos para primeira execução (em ordem de relevância):
1. **AVGS 30% vs SWRD 50%**: Qual estrutura de bloco equity seria recomendada sem contexto de sycophancy?
2. **IPCA+ 15% alvo**: Justificado a 7.21%? Ou sobreallocado em RF?
3. **P(FIRE) 86.9%**: Premissas de retorno e gastos são defensáveis para um modelo externo?

---

## Escopo

- [ ] Advocate: definir issue candidata para primeira execução
- [ ] Advocate: preparar prompt neutro (Bull vs Bear sem revelar posição do time)
- [ ] Diego: rodar em GPT-4o ou Gemini Pro (5-10 min)
- [ ] Advocate: comparar outputs — o que o modelo externo disse que o time não disse?
- [ ] Head: registrar achados como finding na memória correspondente
- [ ] Decidir: Multi-Model passa a ser obrigatório em issues estruturais ≥Alta? Ou apenas anual?

---

## Raciocínio

**Argumento central:** Carry-over crônico indica que o protocolo não tem gatilho de ativação automático. Precisa de uma issue dedicada com responsável e prazo para sair do papel.

**Incerteza reconhecida:** Modelos externos também têm vieses. A comparação é indicativa, não definitiva.

**Falsificação:** Se após 3 execuções os modelos externos não produzirem nenhum insight novo vs o time, reconsiderar a obrigatoriedade.

---

## SLA

**Prazo:** próxima issue de alocação Alta ou até 2026-06-30, o que vier primeiro.

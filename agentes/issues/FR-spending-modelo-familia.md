# FR-spending-modelo-familia: Modelo de custo de vida pós-família — R$300k + stress-test

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-spending-modelo-familia |
| **Dono** | FIRE |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | FIRE (lead), Behavioral, Quant, Bookkeeper |
| **Dependencias** | HD-gastos-pessoais-2026 (concluída) |
| **Criado em** | 2026-04-03 |
| **Origem** | HD-gastos-pessoais-2026: gap identificado — gastos têm número único, portfólio tem distribuição de cenários |
| **Concluido em** | — |

---

## Motivo / Gatilho

Análise HD-gastos-pessoais-2026 (2026-04-03) identificou dois gaps:

1. **Cenário R$300k nunca modelado formalmente**: com casamento (~2026-27) e filho + escola (~2031+), custo de vida projetado sobe para R$270-300k+. O Monte Carlo atual só tem R$250k como baseline. A sensibilidade de P(FIRE) a esse cenário é desconhecida formalmente.

2. **Planning fallacy nos gastos**: o portfólio de investimentos tem stress-test em 3 cenários (base/favorável/stress). Os gastos têm um número único — R$250k/ano. Isso é assimetria metodológica: incerteza modelada no lado do ativo, tratada como constante no lado do passivo (spending).

---

## Contexto

| Cenário | Custo/ano | P(FIRE 2040) estimado |
|---------|-----------|----------------------|
| Base atual (modelo) | R$250k | 86.9% |
| Real atual (solteiro) | R$218k | ~89-90% |
| Pós-casamento (~2026-27) | R$270k | ~84-85% |
| Pós-casamento + filho + escola (~2031+) | R$300k | ~79-81% |

Baseline pré-família estabelecido: R$218k/ano (8 meses ago/2025–mar/2026). Próxima leitura empírica: Q1/2027 (pós-casamento).

---

## Escopo

- [ ] FIRE: rodar Monte Carlo com spending = R$300k/ano (cenário pós-família completo)
- [ ] FIRE: rodar com spending = R$270k/ano (cenário pós-casamento, pré-filho)
- [ ] FIRE + Behavioral: criar distribuição de probabilidade para o spending (base/alto/stress) — equivalente ao que já existe para retornos
  - Base: R$250k (solteiro/FIRE Day)
  - Alto: R$270-280k (casamento)
  - Stress: R$300-320k (casamento + filho + escola)
- [ ] Quant: validar os cálculos de P(FIRE) nos 3 novos cenários
- [ ] Head: atualizar carteira.md com tabela de sensibilidade spending × P(FIRE)

---

## Raciocínio

**Argumento central:** O modelo atual trata spending como variável fixa (R$250k). Mas spending tem incerteza real — especialmente com casamento e filho chegando. Tratar a incerteza de spending com a mesma rigorosidade que a incerteza de retorno é consistência metodológica, não conservadorismo.

**Literatura:** Blanchett (2014) documenta que spending não é determinístico — varia com saúde, família, lifestyle. O modelo de gastos deve ter distribuição de probabilidade, não um número único.

**Falsificação:** Se os 3 cenários produzirem P(FIRE 2040) > 75% em todos os casos, a margem de segurança é robusta e nenhuma mudança de alocação é necessária. Se P(stress) < 70%, reavaliar a meta de aporte ou o FIRE date.

---

## SLA

**Prazo:** antes do casamento (~Q3/2026), para que o modelo reflita a nova realidade familiar antes do evento, não depois.

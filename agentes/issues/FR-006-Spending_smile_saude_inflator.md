# FR-006-Spending_smile_saude_inflator: FR-003 atualizado com spending smile e saude com inflator proprio

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-006-Spending_smile_saude_inflator |
| **Dono** | 04 FIRE |
| **Status** | Backlog |
| **Prioridade** | Baixa |
| **Participantes** | 00 Head, 10 Advocate, 11 Quant |
| **Dependencias** | TX-003 (custos de desacumulacao — impacta baseline) |
| **Criado em** | 2026-03-23 |
| **Origem** | HD-009 (Auditoria de gastos) |
| **Concluido em** | — |

---

## Motivo / Gatilho

> HD-009 identificou que o FR-003 usa R$250k flat como baseline de gastos na aposentadoria. Evidencias empiricas (Blanchett 2014) e dados reais de Diego mostram que gastos seguem um "spending smile" — nao sao flat. Saude e o unico componente com inflacao propria crescente (+5-8%/ano real no Brasil) que precisa de modelagem separada.

---

## Descricao

> Atualizar o Monte Carlo FR-003 com:
> 1. Spending smile: gastos variaveis por fase de aposentadoria
> 2. Saude com inflator proprio (+5-8%/ano real, separado do IPCA)
> 3. Revalidar P(sucesso), patrimonio necessario e guardrails

---

## Escopo

- [ ] Definir o spending smile de Diego com base em HD-009:
  - Go-Go (50-60): R$270-290k/ano
  - Slow-Go (60-70): R$220-230k/ano
  - No-Go/Care (70+): R$270-300k+/ano
- [ ] Separar linha de saude (hoje diluida em Optionals) com inflator +5%/ano real
- [ ] Rodar MC 10k trajetorias com novo perfil de gastos
- [ ] Comparar com FR-003 baseline: P(sucesso), patrimonio necessario, guardrails
- [ ] Cenario de stress: Go-Go R$300k + drawdown -30% no ano 1 → sobrevive?
- [ ] Quant: validar formulas e consistencia dos calculos

---

## Analise

> A preencher quando executado.

---

## Conclusao

> A preencher.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | — |
| **Estrategia** | — |
| **Conhecimento** | — |
| **Memoria** | — |
| **Nenhum** | — |

---

## Proximos Passos

- [ ] Aguardar TX-003 para ter saving liquido real de PJ taxes (impacta baseline)
- [ ] Executar quando prioridade subir

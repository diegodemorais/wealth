# TX-saude-fire: Custo Real de Saúde Pós-FIRE

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-saude-fire |
| **Dono** | 05 Wealth |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | FIRE, Quant, Advocate |
| **Co-sponsor** | Head (discovery composição/issues 2026-04-01) |
| **Dependencias** | — |
| **Criado em** | 2026-04-01 |
| **Origem** | HD-009 e FR-spending-smile identificaram saúde como gap no modelo; sem issue dedicada |
| **Concluido em** | — |

---

## Motivo / Gatilho

O baseline de gastos R$215k/ano (HD-009, 2026-03-23) e o modelo de spending smile (FR-spending-smile, 2026-03-27) usam inflator de saúde genérico, mas sem dados reais sobre:
- Custo de plano de saúde sem vínculo empregatício (PF, não PJ com benefício corporativo)
- Inflação médica histórica real vs IPCA
- Seguro de vida pós-50 (sem cobertura corporativa)
- Franquias, co-participações e gastos out-of-pocket que crescem com a idade

FR-spending-smile modelou P(sucesso) 80.8% com spending smile, mas o componente de saúde foi estimado sem dados empíricos calibrados.

---

## Descrição

Calibrar o componente de saúde no modelo FIRE com dados reais:

1. **Plano de saúde PF aos 50**: qual o custo real de um plano individual/familiar de qualidade (Bradesco Gold, Unimed Alfa) sem vínculo empregatício? Escalada por idade (ANS regulamenta faixas: 59-63 anos = +1.5× faixa base)?
2. **Inflação médica histórica**: IPCAM (Índice de Preços ao Consumidor de Saúde) vs IPCA — qual o diferencial histórico? Usar como inflator próprio para o componente saúde.
3. **Seguro de vida pós-50**: quanto custa apólice sem benefício corporativo? Necessário?
4. **Out-of-pocket crescente**: histórico de gastos com medicamentos, consultas, exames fora do plano conforme envelhecimento.
5. **Impacto em P(FIRE)**: recalibrar spending smile com dados reais de saúde e verificar se P(FIRE) cai abaixo de 80%.

---

## Escopo

- [ ] Pesquisar custo real de planos PF (50-65 anos) no Brasil — mínimo 3 operadoras
- [ ] Calcular diferencial IPCAM vs IPCA histórico (2010-2025)
- [ ] Modelar escalada ANS por faixa etária (50→59→63→69→73+)
- [ ] Estimar seguro de vida pós-50 sem vínculo
- [ ] Atualizar spending smile em fire_montecarlo.py com inflator de saúde calibrado
- [ ] Verificar impacto em P(FIRE) e P(FIRE 55)
- [ ] Definir se saúde deve ser linha separada no baseline de gastos

---

## Raciocínio

**Argumento central:** Saúde é o componente de gasto que mais cresce com a idade e que tem inflação estruturalmente acima do IPCA. Modelar com inflator genérico subestima o risco de longo prazo. Diego aposentando aos 50 tem 15+ anos de saúde crescente antes do INSS.

**Incerteza reconhecida:** Brasil tem reforma tributária e possível mudança no ANS — as faixas de reajuste podem mudar. Mas o diferencial IPCAM/IPCA é estrutural e tem histórico de 20+ anos.

**Falsificação:** Se IPCAM histórico estiver dentro de ±0.5pp do IPCA, o inflator genérico é adequado e a issue encerra sem mudança.

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

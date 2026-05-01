# TX-diferimento-fiscal: Tax — Calculadora de diferimento fiscal por ETF (custo real da venda)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | TX-diferimento-fiscal |
| **Dono** | Tax |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Tax (lead), Quant, Dev |
| **Co-sponsor** | Head |
| **Dependencias** | — |
| **Criado em** | 2026-04-17 |
| **Origem** | Tax agent identificou ausência de ferramenta para comparar "vender agora vs diferir N anos" — central para decisões de desacumulação e sobre transitórios. |
| **Concluido em** | — |

---

## Motivo / Gatilho

Não há ferramenta no dashboard para comparar o custo real de vender um ETF hoje versus diferir a venda por N anos. O diferimento tem valor mensurável: um IR de R$21k diferido por 11 anos a 4.85%/aa real equivale a R$36.5k de capital que não seria gerado — ou seja, diferir "vale" R$15.5k. Esse cálculo é relevante tanto na pré-desacumulação (2035–2040) quanto para decisões sobre transitórios com ganho significativo.

---

## Descricao

Para cada ETF com ganho, calcular e exibir:
1. **IR se vender hoje** = ganho_brl × 0.15
2. **Custo de oportunidade do diferimento** = IR_hoje × (1 + retorno_real)^anos_para_fire − IR_hoje
3. **Net benefit do diferimento** = diferença entre os dois

Usar retorno real de 4.85%/ano (premissa aprovada em FI-premissas-retorno). Prioridade de cálculo: transitórios com IR relevante (EIMI ~R$21k, AVDV ~R$29k estimados).

---

## Escopo

- [ ] Calcular IR latente por ETF (ganho BRL × 15%) a partir de `tax_snapshot.json`
- [ ] Calcular custo de oportunidade do diferimento para N = anos até FIRE (2040)
- [ ] Calcular net benefit do diferimento por ETF
- [ ] Exibir tabela no dashboard (componente `TaxAnalysisGrid` ou novo)
- [ ] Permitir slider de anos de diferimento (cenário sensibilidade)
- [ ] Integrar com skill `/tax-calc` — verificar sobreposição de lógica existente

---

## Raciocinio

**Alternativas rejeitadas:** Decidir "quando vender" sem cálculo formal — sujeito a viés de aversão à perda tributária (pagar IR nunca é agradável, mas diferir tem custo real de complexidade e risco de mudança de alíquota).

**Argumento central:** O diferimento fiscal é uma forma de alavancagem gratuita com capital do Fisco; quantificar seu valor evita decisões baseadas em intuição incorreta sobre "quanto custa" o IR.

**Incerteza reconhecida:** Alíquota futura pode mudar (risco reforma tributária — ver TX-reforma-tributaria). Retorno real de 4.85% é premissa, não garantia.

**Falsificação:** Se reforma tributária aumentar alíquota para >15% após venda diferida, o net benefit calculado hoje estaria superestimado.

---

## Contexto de Uso

Principalmente em dois momentos:
- **Pré-desacumulação (2035–2040):** Quando vender transitórios para migrar para estrutura definitiva SWRD/AVGS/AVEM?
- **Decisões correntes sobre transitórios:** EIMI, AVDV, AVUV, DGS — todos com ganho, todos candidatos a venda eventual.

A skill `tax-calc` já tem parte dessa lógica — integrar ou reaproveitar antes de criar do zero.

---

## Arquivos Relevantes

| Arquivo | Papel |
|---------|-------|
| `dados/tax_snapshot.json` | Ganho BRL latente por ETF (fonte primária) |
| `react-app/src/components/portfolio/TaxAnalysisGrid.tsx` | Componente de tax no dashboard (ponto de integração) |
| `agentes/perfis/05-wealth.md` | Perfil do agente Tax — premissas e metodologia |

---

## Proximos Passos

- [ ] Quant valida fórmula antes de Dev implementar
- [ ] Dev implementa no dashboard sob aprovação de Diego
- [ ] Ao implementar, registrar achados em `agentes/memoria/05-tax.md`

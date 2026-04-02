# FR-currency-mismatch-fire: Risco BRL/USD na Desacumulação

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-currency-mismatch-fire |
| **Dono** | 04 FIRE |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | Macro, Factor, Quant, Advocate |
| **Co-sponsor** | Head (discovery composição/issues 2026-04-01) |
| **Dependencias** | — |
| **Criado em** | 2026-04-01 |
| **Origem** | Discovery de gaps — risco sistêmico não modelado: receita em BRL, carteira ~60% USD |
| **Concluido em** | — |

---

## Motivo / Gatilho

Diego vai gastar em BRL pós-FIRE (R$250k+/ano), mas ~60% da carteira está em USD (ETFs IBKR). Se o BRL apreciar no período de desacumulação, o retorno real em BRL cai materialmente — sem que o patrimônio USD tenha mudado. Esse risco nunca foi modelado explicitamente no Monte Carlo ou nas projeções FIRE.

Discovery de 2026-04-01 identificou como risco sistêmico ausente dos modelos.

---

## Descrição

Quantificar e modelar o risco de currency mismatch entre receita de gastos (BRL) e carteira de ativos (USD):

1. **Tamanho do problema**: quanto da carteira está exposta ao BRL/USD? Hoje ~60% USD (IBKR) + 40% BRL (IPCA+, Renda+). Pós-FIRE, qual será essa proporção?
2. **Cenários históricos**: BRL apreciou quanto em janelas de 5-10 anos? Qual o impacto em retorno real BRL de uma apreciação de 20%?
3. **Impacto no P(FIRE)**: Monte Carlo atual usa premissas em BRL (~4.85% equity, ~7%+ IPCA+). Qual o impacto se BRL/USD sair de 5.80 para 4.00 nos primeiros 5 anos de FIRE?
4. **Hedge ou natural**: faz sentido reduzir exposição USD conforme se aproxima do FIRE? Ou o IPCA+ como contraparte BRL já é hedge suficiente?
5. **Regra de rebalanceamento cambial**: threshold para vender USD e comprar BRL (ou vice-versa)?

---

## Escopo

- [ ] Calcular exposição BRL vs USD atual e projetada no FIRE Day
- [ ] Modelar histórico BRL/USD (2000-2026): apreciações e depreciações de 5+ anos
- [ ] Simular impacto no P(FIRE) com BRL apreciando 20% no início da desacumulação
- [ ] Avaliar se IPCA+ (BRL) já funciona como hedge natural suficiente
- [ ] Definir regra de rebalanceamento cambial (se necessária)
- [ ] Verificar se fire_montecarlo.py precisa de componente cambial explícito

---

## Raciocínio

**Argumento central:** O P(FIRE) atual assume implicitamente que câmbio não move ou que os retornos USD já estão convertidos. Uma apreciação real do BRL de 20% nos primeiros anos de FIRE equivale a um sequence-of-returns risk adicional e não modelado.

**Incerteza reconhecida:** Brasil historicamente tem BRL depreciando, não apreciando. O risco "errado" para Brasil pode ser menor do que para outros países. Mas é assimétrico: uma apreciação forte nos anos 50-55 de Diego é o pior timing possível.

**Falsificação:** Se análise mostrar que IPCA+ (40% da carteira) já cobre o risco cambial nos cenários históricos, issue pode ser encerrada sem mudança de alocação.

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

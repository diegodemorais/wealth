# FR-bold-budget-integration: Avaliar Integração de Elementos Boldin

**Status:** 🟢 PARCIALMENTE IMPLEMENTADO (Elementos A e B)
**Data de Criação:** 2026-04-25
**Data de Implementação A+B:** 2026-04-25
**Prioridade:** MÉDIA
**Assignado:** Head

---

## Resumo Executivo

Análise comparativa entre **nossa metodologia de guardrails** vs **Bold Budget (Boldin)** realizada pelo agente general-purpose.

**Conclusão:** Nossas abordagens são **COMPLEMENTARES, não conflitantes**. Drawdown guardrails (mecânica operacional) + P(FIRE) feedback anual (monitor de robustez) é **superior para Diego** vs migrar completamente para Boldin.

**Recomendação:** Adotar **3 elementos de Bold Budget** sem migrar arquitetura.

---

## Comparação: Filosofias Fundamentais

| Aspecto | Nossa Abordagem | Bold Budget (Boldin) |
|---------|-----------------|----------------------|
| **Base de decisão** | Drawdown histórico (% de queda do patrimônio) | P(sucesso) financeiro (~80% target) |
| **Ativador de ação** | Limite absoluto de perda atingido | Probabilidade prevista muda |
| **Dinâmica** | Reativa (espera queda, depois age) | Prospectiva (modelo prevê, ajusta antes) |
| **Reversibilidade** | Sim (guardrails reset quando mercado recupera) | Sim (P(success) pode subir de novo) |

---

## Estrutura Operacional: Nossa vs Boldin

| Dimensão | Nossa | Bold Budget |
|----------|-------|-------------|
| **Níveis de gasto** | 5 bandas discretas (R$250k → R$180k) | 3 contínuos (95%, 80%, 70% SWR) |
| **Gatilho de corte** | Drawdown atingido (e.g., -20%) | P(FIRE) < 80% em simulação |
| **Alcance despesas** | Custo de vida agregado (R$250k) | **TODAS despesas**: taxes, debt, healthcare, lifecycle |
| **Ajuste de piso** | Rígido (R$180k essencial) | Flexível por categoria (varia saúde, discricionário) |

---

## Vantagens/Desvantagens por Abordagem

### Nossa Metodologia (Drawdown-Based)

✅ **Vantagens:**
- **Simplicidade operacional:** basta monitorar % de queda do patrimônio — nenhum modelo de projeção contínuo
- **Transparency:** Diego vê exatamente qual % de drawdown acionou o corte (e.g., -20% → cortar 10%)
- **Discipline:** força ação objetiva sem debate sobre premissas futuras
- **Independência de modelo:** não depende de retornos/vol futuros (que mudam)
- **Reversibilidade implícita:** se mercado sobe 25% acima do pico, retirada sobe automaticamente (+10%)

❌ **Desvantagens:**
- **Lag temporal:** espera a queda acontecer para agir — pode ser tarde se volatilidade é extrema
- **Context-agnostic:** não diferencia queda por "bear market transiente" vs "shock estrutural"
- **Categoria-blind:** não "sabe" que saúde é inelástica, viagens são compressíveis
- **Sycophancy com P(FIRE):** P(FIRE)=86.4% é "informação paralela", não governa guardrails — discrepância comportamental
- **Gap healthcare:** coloca R$24k/ano saúde dentro do R$250k — nenhuma segregação de risco

### Bold Budget (P(Success)-Based)

✅ **Vantagens:**
- **Prospective:** ajusta antes da queda extrema — monitora trajetória probabilística
- **Granular:** diferencia saúde (inelástica), taxes (estrutural), discretionary (compressível)
- **Dinâmico e market-aware:** recalibra com mudanças de volatilidade, retornos observados, idade
- **Horizon-sensitive:** sabe que SWR 3.0% → P(success) ~80%, sabe que SWR 2.5% → P(success) ~90%
- **Tax-integrated:** modela withdrawals líquidas (não bruto)
- **Behavioral realism:** pessoas respeita "80% é o alvo" melhor que "meu patrimônio caiu 22%"

❌ **Desvantagens:**
- **Modelo-dependente:** P(success) depende de retornos/vol futuros — forecasting risk
- **Recalibração frequente:** exige atualização contínua de inputs (volatilidade, mercado, taxa de sucesso)
- **Menos transparente operacionalmente:** Diego precisa entender MC, distribuições, confidence intervals
- **Sycophancy risco:** fácil manipular P(success) ajustando premissas (vol, inflation, horizonte)

---

## Gaps em Nossa Abordagem vs Bold Budget

| Gap | Bold Budget Endereça | Nossa Situação | Prioridade |
|-----|---------------------|-----------------|-----------|
| **Taxes na estrutura** | Sim: modela IR + INSS | Não mencionado (assume R$250k já pós-tax) | BAIXA |
| **Debt servicing** | Sim: mortgage, refinance risk | Não: hipoteca R$453k não entra em guardrails | BAIXA |
| **Healthcare bifurcação** | Sim: segura vs catastrophic | Apenas R$24k flat no orçamento | MÉDIA |
| **Lifecycle spending** | Sim: Go-Go/Slow-Go/No-Go | Mencionamos "spending smile" em FR-spending-smile, mas não integrado em guardrails | MÉDIA |
| **Debt-to-income floor** | Sim: se debt sobe, gasto cai | Não mencionado | BAIXA |
| **Currency de decisão** | P(success) = moeda explícita | Drawdown % = moeda implícita | LOW |

**Interpretação:** Diego paga R$250k/ano custo de vida + R$453k hipoteca (principal ~R$33k/ano + juros ~R$27k/ano). IPCA+ curto (3%) materializa em 2 anos ~ R$60k. Drawdown -20% = R$694k queda (patrimônio R$3.47M). **Hipoteca não aparece em guardrails porque é "fora do portfolio" — mas é gasto estrutural.**

---

## Complementaridade vs Conflito

### Veredicto: Complementar (não conflitante)

Nossa abordagem é **COMPLEMENTAR**:

1. **Drawdown guardrails** = regra mecânica de comportamento (força corte sem debate)
2. **P(FIRE) = 86.4%** = sinalizador de robustez geral (informação de contexto)

**Síntese possível:**
- Usar **P(FIRE)** como **monitor de longo prazo** (Diego recalcula anualmente)
- Usar **guardrails de drawdown** como **gatilho operacional** (ação imediata em mercado)
- **Quando P(FIRE) cai para <80%**, acionar revisão de guardrails (podem subir thresholds se P(FIRE) cai)

---

## Recomendações de Integração (3 Elementos Boldin)

### ✅ A. Integrar P(FIRE) como Monitor de Gatilho Anual
```
Anualmente (janeiro):
— Rodar MC com premissas atualizadas
— Se P(FIRE) > 90% → Expandir guardrails (ex: R$275k → R$300k)
— Se P(FIRE) 80–90% → Guardrails atuais = segurar
— Se P(FIRE) < 80% → Acionrar revisão (pode apertar guardrails)
```

**Implementação:** Decisão **FR-guardrails-p-fire-integração** — já temos o output de MC, basta criar regra condição → ação.

**Onde:** Adicionar à seção "Decisões Pendentes" em `carteira.md`.

---

### ✅ B. Segregar Despesas por Elasticidade
```
Gasto por categoria (prioritário):
1. Mortgage (R$33k/ano) — nunca cortar (contrato)
2. Saúde (R$24k/ano) — cortar <10% (copay aumenta, não taxa base)
3. Alimentação + moradia (R$100k/ano) — inelástico <5% cut
4. Viagens + lifestyle (R$93k/ano) — compressível até 50%

Guardrail aplica-se à categoria 4 primeiramente.
```

**Implementação:** Decisão **FR-guardrails-categoria-elasticidade** — refina guardrails de R$250k para (essencial R$157k + discrionary R$93k).

**Onde:** Adicionar tabela de elasticidade em `carteira.md` → `guardrails_retirada` pode referenciar.

**Impacto:** Reduz chance de piso R$180k ser insuficiente em crise (saúde fica protegida).

---

### ❌ C. NÃO Adotar SWR Contínuo de Boldin
Nossa estrutura (5 bandas discretas) é **mais robusta operacionalmente** que 3 contínuos:
- Evita "micro-ajustes" de retirada (R$250.1k vs R$250k)
- Força decisões claras (corte 10% ou não)
- Menos cognitivo-demanding

**Recomendação:** Não migrar para Boldin's 95%/80%/70% SWR.

---

## Síntese Executiva

Nossa metodologia é **superior para Diego** porque:
1. **Drawdown guardrails** força discipline sem debate
2. **P(FIRE) feedback anual** valida robustez sem substituir regra mecânica
3. **Patrimônio Diego** (R$3.5M → R$11M FIRE) torna drawdown -20% = R$2M+ tolerável operacionalmente

Bold Budget é melhor para:
- Casais com múltiplas rendas (tax planning complexo)
- Pessoas com debt estrutural (refinance risk)
- Carteiras muito concentradas em renda fixa (SWR é crítico)

---

## Ações Recomendadas

**Curto prazo (próximo mês):**
- [ ] HEAD — validar se elementos A+B fazem sentido para Diego
- [ ] HEAD — decidir se "P(FIRE) gate anual" substitui "revisão manual janeiro"
- [x] FIRE agent — criar decisão **FR-guardrails-p-fire-integração** (implementado 2026-04-25 em carteira.md §Bold Budget Integration)
- [x] FIRE agent — criar decisão **FR-guardrails-categoria-elasticidade** (implementado 2026-04-25 em carteira.md §Bold Budget Integration)

**Médio prazo:**
- [ ] Adicionar P(FIRE) gate no dashboard (visual de monitoramento)
- [ ] Segregar despesas por elasticidade em relatório de simulação
- [ ] Documentar que guardrails aplicam a categoria discretionary first

**Não fazer:**
- ❌ Não migrar para Boldin's SWR contínuo
- ❌ Não descartar drawdown guardrails (força discipline que P(success) sozinho não garante)

---

## Referências

- Comparação detalhada realizada por agente general-purpose (2026-04-25)
- Bold Budget source: [help.boldin.com/en/articles/12571086-new-feature-spending-guardrails-insight](https://help.boldin.com/en/articles/12571086-new-feature-spending-guardrails-insight)
- Nossa estratégia: carteira.md (guardrails 2026-03-20, spending_smile FR-spending-smile 2026-03-27)

---

**Next:** HEAD avalia elementos A+B e valida se integração faz sentido. Se sim, FIRE agent cria decisões formalizadas.

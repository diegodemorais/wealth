# FR-swr-revisao — Revisão do SWR Gatilho + Modelagem de Floors no Simulador

**Data:** 2026-04-13  
**Status:** CONCLUÍDA — 2026-04-13  
**Iniciado por:** Diego Morais  
**Agentes:** FIRE, Quant, Advocate, Dev  

---

## Problema

O modelo FIRE usa `swr_gatilho = 2.4%` como critério único de FIRE Day. Esse número emergiu como constatação de uma simulação (FR-001 v4: patrimônio projetado R$10.96M / custo R$250k = 2.28%), não como definição normativa baseada em literatura de SWR.

Debate de 2026-04-13 identificou dois problemas distintos:

**1. SWR 2.4% pode ser conservador demais**

A literatura acadêmica para o perfil de Diego (40 anos de horizonte, equity global, guardrails implementados, floors parciais) suporta SWR de **2.8-3.2%** como range defensável:

- Bengen/Trinity (30 anos, US 60/40): 4.0% — não aplicável diretamente
- Pfau (2012): ajuste para 40 anos → 3.5% (US), 3.0-3.2% (global)
- ERN series (40 anos, 80%+ equity): 3.25-3.5% (dados US), menor com dados globais
- Cederburg et al. (2023): para portfólios globais com gastos em moeda emergente → 2.5-3.0%
- Kitces: guardrails implementados equivalem a +0.5-1.0pp de SWR efetiva
- Ajustes específicos Diego: -0.5pp (horizonte 40a) -0.3pp (BRL/IPCA) +0.7pp (guardrails+INSS) → **net range: 2.8-3.2%**

**2. Floors (INSS + Katia) não são subtraídos do spending efetivo**

O simulador trata R$250k (ou custo do slider) como retirada constante por 40 anos. Mas:
- INSS Diego: ~R$18k/ano a partir dos 65 (haircut 40% por risco reforma: R$10.8k efetivo)
- Katia INSS: ~R$84.6k/ano a partir de 2049 (cenário casado)
- Katia PGBL: ~R$29.2k/ano a partir de 2049 (cenário casado)

Esses floors progressivamente reduzem o que o portfolio precisa gerar. O spending efetivo do portfolio não é constante — cai a partir dos 65 (e mais ainda a partir de 2049 no cenário casado).

---

## Contexto

- `config.py` linha 96: `PATRIMONIO_GATILHO = 13_400_000` e `SWR_GATILHO = 0.024`
- Fix já feito (2026-04-13): PAT_GATILHO removido do simulador como binding constraint. Agora o simulador usa só SWR como gatilho — correto.
- MC atual (fire_montecarlo.py): calcula P(FIRE) sobre trajetórias completas, não usa gatilho duplo como filtro. Está correto.
- Mudar `SWR_GATILHO` em config.py implica re-rodar o MC e atualizar todos os dados derivados.

---

## Questões a resolver

### Q1 — Novo SWR gatilho

Qual valor adotar como `SWR_GATILHO` em substituição ao 2.4%?

Opções:
- **2.8%** → mais conservador, cobre incerteza cambial + IPCA
- **3.0%** → midpoint do range defensável (Pfau + Cederburg + guardrails)
- **3.2%** → mais agressivo, assume guardrails + INSS funcionando

O novo gatilho deve ser justificado pela literatura e validado pelo Quant antes de ir para config.py.

### Q2 — Modelagem de floors no simulador

Como implementar floors no `updateFireSim()`:

Proposta de spec para o Dev:
- Adicionar variável `floorAnual` que depende do cenário (`window._fireCond`):
  - `solteiro`: `floorAnual = R$10.800` (INSS Diego com haircut 40%, a partir dos 65)
  - `casado`: `floorAnual = R$10.800 + R$0` (sem Katia até 2049)
  - `familia`: `floorAnual = R$10.800 + R$113.800 = R$124.600` (Katia a partir de 2049, ano que Diego tem ~62)
- No loop mensal: se `idadeAtual + m/12 >= 65` → `custoEfetivo = custo - floorAnual`
- Para cenário família: segundo threshold aos 62 anos para floors Katia

Isso reduz o spending efetivo que o portfolio precisa cobrir, permitindo FIRE mais cedo.

### Q3 — Impacto no MC e dados derivados

Mudar `SWR_GATILHO` de 0.024 para 0.028-0.032:
- Re-rodar `fire_montecarlo.py` → novos valores de P(FIRE), patrimônio projetado
- Atualizar `dashboard_state.json`, `fire_swr_percentis.json`
- Re-gerar `fire_trilha.json` e dados derivados

Quant deve validar que o novo número é consistente com a literatura citada antes de re-rodar.

---

## Critério de fechamento

- [x] Q1 resolvida: SWR_GATILHO = 3.0% — Pfau/ERN 40a + guardrails + SoRR BRL. Quant validou: mu=4.912%, sigma=12%, T=40, P90 → 3.41% → ajustes → 3.0%. Consenso FIRE+Quant.
- [x] Q2 resolvida: floors implementados no `updateFireSim()` via `_custoEfetivo(fireAge)`. INSS Diego R$10.8k/ano@65, Katia R$113.8k/ano@62 (casado/família). Ponderação proporcional ao horizonte.
- [x] Q3 executada: MC re-rodado (aporte 25k + SWR 3.0%). P(FIRE 53) = 90.4%/94.1%/86.8% (inalterado). Dashboard v2.5. 604/604 testes. Commit ec3ce7a.
- [x] Diego validou: "Pode atualizar tudo e tirar 13,4M como referência."

## Conclusão

SWR revisado de 2.4% → 3.0%. R$13.4M removido como referência formal — substituído por SWR ≤ 3.0% (equivalente patrimonial: R$8.33M = R$250k/3.0%). Docs atualizados: config.py, carteira.md, gatilhos.md, 04-fire.md, scorecard.md, flight-rules.md. Simulador com floors INSS/Katia. APORTE_MENSAL corrigido 33k → 25k.

---

## Relacionado a

- `config.py` linhas 96-97
- `scripts/fire_montecarlo.py`
- `dashboard/template.html` (updateFireSim)
- FR-001-v4 (origem do R$10.96M / 2.28%)
- FR-withdrawal-engine (guardrails implementados)
- FR-fire-date-elicitation (distribuição subjetiva de FIRE date)

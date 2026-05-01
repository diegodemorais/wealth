# DEV-fire-sim-fixes — Simulação FIRE: ordem das barras + bug custo de vida

**Dono:** Dev + FIRE
**Prioridade:** 🔴 Crítica
**Origem:** Diego reportou 2026-04-09

---

## 1. Inverter ordem das barras

Ordem atual: [rentabilidade, custo de vida, ...]
Ordem correta: colocar **custo de vida em 2º** e **rentabilidade em 3º**.

Verificar qual array/objeto define a ordem e reordenar no pipeline (não no template).

## 2. Bug: custo de vida menor não antecipa FIRE

**Comportamento atual:**
- Custo de vida **sobe** → SWR aumenta → prazo FIRE **aumenta** ✅
- Custo de vida **desce** → SWR diminui → prazo FIRE **não diminui** ❌

**Comportamento esperado:**
- Custo de vida desce → SWR diminui → patrimônio necessário menor → FIRE **antecipado**

**Root cause provável:** O cálculo de sensibilidade só recalcula `pfire` (probabilidade) mas não recalcula `anos_fire` / `idade_fire` quando spending cai. Provavelmente usa o ano FIRE base como floor e nunca antecipa.

**Fix:** Quando spending cai, rodar MC com spending menor e verificar se P(FIRE) atinge threshold em ano anterior ao base. Se sim, mostrar ano antecipado.

## Regras
- Ordem das barras definida no pipeline/data.json, não hardcoded no template.
- FIRE agent valida a lógica de antecipação antes de merge.
- Quant audita fórmula do SWR recalculado.

# VERIF-PFIRE-CANONICO — Verificação de Canonicidade de P(FIRE) Centralizado

**Data de Criação:** 2026-04-26  
**Status:** Refinamento  
**Dono:** Quant + FIRE  
**Prioridade:** P1 (compliance)  
**Bloqueadores:** Nenhum  
**Dependências:** —  

---

## Contexto

RF-2 (Real Monte Carlo Percentiles) foi implementado e mergeado para main (commit 6eaccb43).

Durante a implementação, **múltiplas formas de cálculo de P(FIRE)** surgiram em diferentes camadas:

1. **fire_montecarlo.py** — `rodar_monte_carlo()` retorna `p_sucesso` (probabilidade)
2. **generate_data.py** — Armazena em `pfire_base` como **percentuais** (base, fav, stress)
3. **React components** — Leem de `data.json` → aplicam lógica de cores/tiers
4. **Spending scenarios** — Usam deltas de `pfire_base` para inferir cenários
5. **FireMatrixTable** — Lê P(FIRE) de `fire_matrix` dict com chave `{patrimonio}_{gasto}`
6. **SequenceOfReturnsRisk** — Tem sua própria função `pfireToGuardrailTier()`
7. **PFireDistribution** — Usa percentis com fallback para offsets hardcoded

---

## Problema

**Não está claro se todas as camadas estão usando a mesma forma canônica:**
- Qual é o source of truth (fire_montecarlo.py vs generate_data.py vs dashboard_state.json)?
- Qual é a precisão esperada (percentual como 86.4 vs decimal como 0.864)?
- Conversões estão sendo feitas corretamente em todas as fronteiras?
- Há risco de multiplicação por 100 acidental?

---

## Tarefa

Verificar e documentar:

1. **Quant:** Auditar todas as formas de P(FIRE) no codebase
   - Listar cada camada (onde é calculado, como é armazenado, como é usado)
   - Identificar conversões implícitas (× 100, ÷ 100)
   - Confirmar que não há multiplicações acidentais
   - Apontar onde falta validação

2. **FIRE:** Validar semanticamente
   - O source of truth (fire_montecarlo) está sendo respeitado?
   - Cenários (base/fav/stress) estão sendo aplicados corretamente?
   - Percentis (P5-P95) estão sendo interpretados corretamente?
   - Fallbacks (quando dado não disponível) estão corretos?

3. **Deliverável:** 
   - Documento `PFIRE-CANONICO-SPEC.md` com:
     - Forma canônica centralizada definida
     - Mapa de conversões permitidas
     - Validações obrigatórias em cada camada
     - Testes que garantem compliance

---

## Referências

- **RF-2 Commit:** 0b3f638b (compute_pfire_percentiles)
- **Thresholds Atuais:**
  - pfireColor: 85% = adequado (base para comparação)
  - FireMatrixTable: ≥90% verde, ≥85% amarelo, ≥50% laranja, <50% vermelho
  - SequenceOfReturnsRisk: >90% expansão, ≥85% manter, <80% revisar

---

## Notas

- Esta verificação deve ser feita **ANTES** de qualquer nova funcionalidade P(FIRE)
- Caso sejam encontradas inconsistências, criar issue separada para refactor
- Documentar a forma canônica em `CLAUDE.md` para futuro (este é o padrão corporativo)

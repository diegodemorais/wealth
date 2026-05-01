# QUANT-001: P(FIRE) diverge 3.4pp na mesma página /withdraw

**Status**: Aberto  
**Severidade**: 🔴 CRÍTICO  
**Data**: 2026-04-25  
**Agente responsável**: Dev  
**Bloqueador**: Não  

---

## O Problema

Na página `/withdraw`, a métrica **P(FIRE) Base** é exibida com **dois valores diferentes simultaneamente**:

| Componente | Valor | Fonte |
|---|---|---|
| Barra de progresso "P(FIRE) Atual" | **86.4%** | `spending_guardrails.pfire_atual` |
| Badge na tabela Spending Guardrails | **89.8%** | `fire_matrix.by_profile[atual].p_fire_53` |

**Divergência**: 3.4pp (89.8% - 86.4%)

---

## Por que é crítico?

1. **Quebra confiabilidade numérica**: Usuário vê **dois números diferentes** para a **mesma métrica** na **mesma página**
2. **Excede ruído amostral**: Divergência de 3.4pp é muito maior que o ruído esperado (<0.5pp com N=10.000 trajetórias em Monte Carlo)
3. **Impacto em decisões**: P(FIRE) é métrica central para decisões de retirada. Valores conflitantes geram confusão.

---

## Causa Raiz

Duas execuções de Monte Carlo **distintas** para o mesmo cenário (Solteiro/2040):

1. **pfire_base.base = 86.4%**: Gerado por `fire_montecarlo.py`, parte do `generate_data.py`
2. **fire_matrix.by_profile[atual].p_fire_53 = 89.8%**: Gerado por `reconstruct_fire_data.py` (MC separado)

Ambas rodam o MC, mas com possíveis diferenças em:
- Seed PRNG (mesmo seed=42?)
- Data/hora de execução
- Subset de trajetórias usadas

**Resultado**: dois valores de P(FIRE) ligeiramente diferentes para o mesmo cenário.

---

## Impacto

- 🔴 **Alto**: Confiança no dashboard reduzida
- 📊 **Métrica central**: P(FIRE) é usada em decisões críticas de retirada
- 👁️ **Visível**: Divergência é óbvia para qualquer usuário comparando barra vs. badge

---

## Solução Recomendada

### Opção A (Preferida): Usar fonte única

Refatorar `/withdraw/page.tsx` para usar **consistentemente** `pfire_base.base` como fonte única para **toda** a página:

```typescript
// EM VEZ DE:
const pfire_barra = data?.spending_guardrails?.pfire_atual ?? 0;
const pfire_badge = data?.fire_matrix?.by_profile?.[0]?.p_fire_53 ?? 0;

// USAR:
const pfire = data?.pfire_base?.base ?? 0;
// Aplicar o mesmo valor em barra + badge
```

**Vantagens**:
- ✅ Elimina divergência imediatamente
- ✅ Mantém valor aprovado (86.4% é o baseline)
- ✅ Menos refactoring

### Opção B (Alternativa): Unificar MC runs

Garantir que `fire_matrix.by_profile[0].p_fire_53` e `pfire_base.base` venham **exatamente** do mesmo MC run em `generate_data.py`:

1. Executar `fire_montecarlo.py` uma única vez com seed=42
2. Armazenar resultados intermediários
3. Ambas `generate_data.py` e `reconstruct_fire_data.py` **reutilizam** o mesmo MC output

**Vantagens**:
- ✅ Garante consistência entre todos os P(FIRE) valores
- ✅ Mais robusto para mudanças futuras

**Desvantagens**:
- ❌ Refactoring mais complexo em generate_data.py
- ❌ Requer coordenação entre scripts

---

## Validação

Após implementar:

1. Navegar para `/withdraw`
2. Verificar que barra + badge exibem **exatamente** o mesmo P(FIRE)
3. Comparar com `/fire` page (esperado: mesmos valores)
4. Executar teste:
   ```bash
   python3 -c "
   import json
   d = json.load(open('react-app/public/data.json'))
   pfire_base = d['pfire_base']['base']
   pfire_badge = d['fire_matrix']['by_profile'][0]['p_fire_53']
   print(f'pfire_base: {pfire_base:.1f}%')
   print(f'pfire_badge: {pfire_badge:.1f}%')
   assert abs(pfire_base - pfire_badge) < 0.1, f'Divergência: {abs(pfire_base - pfire_badge):.1f}pp'
   print('✅ OK')
   "
   ```

---

## Checklist

- [ ] Identificar qual fonte é a "correta" (pfire_base ou fire_matrix[0].p_fire_53)
- [ ] Refatorar `/withdraw/page.tsx` para usar fonte única
- [ ] Validar que barra + badge mostram mesmo valor
- [ ] Executar teste de validação acima
- [ ] Testar visualmente em localhost:3000/withdraw
- [ ] Merge em `claude/pull-main-IW9VP`

---

**Estimativa**: 1-2 horas  
**Bloqueado por**: QUANT-002 (se a solução precisar sincronizar MC runs)

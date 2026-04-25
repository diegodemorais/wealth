# QUANT-006: Alpha líquido sinal inconsistente

**Status**: Aberto  
**Severidade**: 🟡 MÉDIO  
**Data**: 2026-04-25  
**Agentes responsáveis**: Dev, Factor  

---

## O Problema

A métrica "Alpha líquido esperado" (alpha do tilt fatorial pós-haircut) é exibida com **sinais diferentes** em dois componentes da mesma página.

### Componentes afetados

**`performance/page.tsx` Card C** (texto exibido):
```
Label: "Alpha líquido esperado"
Valor exibido: "−0.16%/ano"  (NEGATIVO, em vermelho)
Cor: var(--red)
Tooltip: "Alpha líquido negativo no curto prazo é esperado"
```

**`AlphaVsSWRDChart.tsx`** (chart recebe):
```typescript
alphaLiquidoPctYear={0.16}  // POSITIVO, sem sinal
```

**Divergência**: Sinal oposto (+0.16 vs −0.16)

---

## Por que é confuso?

1. **Usuário vê "negativo"** (label + cor vermelha) em Card C
2. **Mas chart recebe "positivo"** (0.16, sem menos)
3. **Significado muda completamente**:
   - "−0.16%" = performance ruim (underperformance vs. SWRD)
   - "+0.16%" = performance boa (outperformance vs. SWRD)

---

## Causa Raiz

Ambiguidade na interpretação de "Alpha líquido":

1. **Fator bruto** (antes de haircut): ~0.20%/ano (outperformance do tilt)
2. **Haircut** (custos: tax, rebalancing): ~0.04%/ano
3. **Alpha líquido**: 0.20% - 0.04% = **+0.16%/ano**

**Interpretação de "esperado no curto prazo"**:
- Fatorial puro é longo prazo
- Curto prazo (1-3 anos) pode underperformance (ruído, regimes)
- Logo: "esperado negativo no curto prazo" = hedge mental (realidade é +0.16%, mas pode divergir)

**Conclusão**: O **sinal correto é +0.16%** (alpha líquido positivo), mas o **comportamento curto prazo pode ser negativo**.

---

## Impacto

- 🟡 **Médio**: Usuário entende que alpha é negativo quando é positivo
- 👁️ **Confuso**: Card mostra vermelho (negativo) mas chart usa número positivo
- 📊 **Interpretação**: Decisão sobre se vale a pena o tilt pode ser prejudicada

---

## Solução Recomendada

### Opção A: Usar sinal correto (+0.16%), adicionar contexto (Preferida)

Refatorar Card C para deixar claro:

```typescript
<MetricCard
  label="Alpha líquido esperado"
  value="+0.16% / ano"  // POSITIVO
  tone="neutral"        // nem vermelho, nem verde
  tooltip="Alpha do tilt: +0.16%/ano. Curto prazo pode underperformar (volatilidade). Longo prazo compensa custos."
/>
```

E garantir que Chart também usa:
```typescript
alphaLiquidoPctYear={0.16}  // mantém positivo
```

**Vantagens**:
- ✅ Numericamente correto
- ✅ Card + Chart alinhados
- ✅ Tooltip explica realidade vs. expectativa curto prazo

### Opção B: Usar sinal negativo (−0.16%) em ambos

Se Factor agent confirma que o alpha **efetivo esperado** é negativo:

```typescript
// Card
value="−0.16%/ano"

// Chart
alphaLiquidoPctYear={-0.16}
```

**Vantagens**:
- ✅ Alinha com expectativa "curto prazo negativo"
- ✅ Card + Chart consistentes

**Desvantagens**:
- ❌ Diverge da fórmula: fator bruto (0.20%) - haircut (0.04%) = +0.16%
- ❌ Requer validação Factor de que "efetivo esperado" é negativo

---

## Validação com Factor Agent

Antes de implementar, chamar Factor agent com a pergunta:

**"Alpha líquido do tilt fatorial pós-haircut é +0.16%/ano ou −0.16%/ano? E qual é a expectativa curto prazo vs. longo prazo?"**

Factor deve confirmar:
1. Sinal correto do alpha (+ ou −)
2. Se há expectativa diferente curto vs. longo prazo
3. Como comunicar isso no dashboard

---

## Implementação

### Localização

- `react-app/src/app/performance/page.tsx` (Card C, linha ~xxx)
- `react-app/src/components/AlphaVsSWRDChart.tsx` (linha ~xxx)

### Após Factor validar:

1. Padronizar sinal em ambas as fontes
2. Adicionar tooltip com contexto
3. Cor apropriada (vermelho = ruim, verde = bom, neutral = contextual)

---

## Checklist

- [ ] Contactar Factor agent para validar sinal correto
- [ ] Factor confirma: sinal (+0.16 ou −0.16) e contexto curto prazo
- [ ] Atualizar Card C (valor + cor + tooltip)
- [ ] Atualizar AlphaVsSWRDChart.tsx (valor)
- [ ] Verificar que ambos usam o mesmo número
- [ ] Testar visualmente em localhost:3000/performance
- [ ] Merge em `claude/pull-main-IW9VP`

---

## Referência

- carteira.md: "Alpha líquido do tilt fatorial: ~0.16%/ano"
- Fator bruto: ~0.20%/ano (SWRD vs IVV)
- Haircut: ~0.04%/ano (IR, rebalancing)
- Resultado: 0.20% - 0.04% = **0.16%/ano**

---

**Estimativa**: 30-45 minutos (inclui Factor review)  
**Bloqueado por**: Factor validation  
**Impacto**: Médio (visual + semântico, não numérico crítico)

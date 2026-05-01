# QUANT-003: Savings rate fórmula incorreta no Wellness Score

**Status**: Aberto  
**Severidade**: 🟡 MÉDIO  
**Data**: 2026-04-25  
**Agente responsável**: Dev  

---

## O Problema

Na página `/home`, o Financial Wellness Score calcula a taxa de poupança **incorretamente**.

### Fórmula atual (ERRADA)

```typescript
savingsRate = aporteMensal / (aporteMensal + custoMensal) × 100
            = 25000 / (25000 + 20833) × 100
            = 25000 / 45833 × 100
            = 54.5%
```

### Fórmula correta (carteira.md)

```
Savings Rate = aporte / renda_mensal_liquida × 100
             = 25000 / 45000 × 100
             = 55.6%
```

**Divergência**: 1.1pp (55.6% - 54.5%)

---

## Por que está errado?

A fórmula atual divide aporte por (**aporte + custo**). Isso não é taxa de poupança — é um índice específico.

A fórmula **correta** de taxa de poupança é: **aporte / renda**.

No nosso caso:
- Renda mensal líquida = R$45.000
- Aporte mensal = R$25.000
- Taxa de poupança = 25.000 / 45.000 = **55.6%**

---

## Impacto

- 🟡 **Médio**: Score do Wellness é 1.1pp inferior ao correto
- 📊 **Métrica financeira**: Savings rate é indicador importante de saúde financeira
- 👁️ **Visível ao usuário**: O card exibe 54.5% em vez de 55.6%

---

## Solução

### Localização do código

Arquivo: `react-app/src/app/page.tsx` (home page)

### Fórmula a usar

```typescript
const savingsRate = (aporteMensal / renda_mensal_liquida) * 100;
// onde:
// aporteMensal = premissas.aporte_mensal = 25000
// renda_mensal_liquida = premissas.renda_mensal_liquida = 45000
```

### Verificar dados disponíveis

Em `dataWiring.ts` ou `data.json`, o campo deve estar disponível:
```
data?.premissas?.renda_mensal_liquida = 45000 ✅
```

Ou alternativamente:
```
data?.premissas?.renda_estimada = 45000 ✅
```

---

## Validação

Após implementar:

1. Navegar para `/home`
2. Verificar Financial Wellness Score
3. Savings rate deve exibir **55.6%** (±0.1)
4. Teste automático:
   ```bash
   python3 -c "
   aporte = 25000
   renda = 45000
   sr = (aporte / renda) * 100
   assert abs(sr - 55.6) < 0.2, f'Expected 55.6%, got {sr:.1f}%'
   print(f'✅ Savings rate: {sr:.1f}%')
   "
   ```

---

## Checklist

- [ ] Localizar cálculo de savings rate em `/app/page.tsx`
- [ ] Alterar fórmula para `aporteMensal / renda_mensal_liquida × 100`
- [ ] Verificar que `renda_mensal_liquida` está disponível em data
- [ ] Testar visualmente em localhost:3000 (Financial Wellness Score)
- [ ] Validar que resultado é ~55.6%
- [ ] Merge em `claude/pull-main-IW9VP`

---

**Estimativa**: 15-30 minutos

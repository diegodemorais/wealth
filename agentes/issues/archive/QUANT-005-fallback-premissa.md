# QUANT-005: Fallback de premissa de retorno 4.5% vs 4.85% (risco latente)

**Status**: Aberto  
**Severidade**: 🟡 MÉDIO  
**Data**: 2026-04-25  
**Agente responsável**: Dev  

---

## O Problema

Dois componentes usam o mesmo **fallback incorreto** para a premissa de retorno esperado:

### Componentes afetados

**`app/page.tsx` (home, linha ~149)**:
```typescript
const premissa = data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 4.5;
const delta = realizado - premissa;
```

**`PerformanceSummary.tsx` (performance, linha 114)**:
```typescript
const premissaRetorno = data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 4.5;
```

### O fallback está ERRADO

| Fallback | Valor | Problema |
|---|---|---|
| Código (hardcoded) | 4.5% | ❌ ERRADO |
| Data.json (real) | 4.85% | ✅ CORRETO (HD-006) |

**Divergência**: 0.35pp

---

## Por que é risco latente?

Atualmente, o campo existe e o fallback **nunca é ativado**:
```
data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct = 4.85%
→ fallback ?? 4.5 não é usado
```

**Mas se o pipeline quebrar** (ex: erro em `generate_data.py`), o campo desaparece:
```
data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct = undefined
→ fallback ?? 4.5 = 4.5% (ERRADO!)
```

Resultado: Delta de retorno seria calculado contra **premissa incorreta**.

---

## Impacto

- 🟡 **Médio**: Risco latente — não afeta se pipeline funciona
- 💥 **Alto se ativar**: Se pipeline quebra, exibe delta contra premissa errada (~0.35pp erro)
- 📊 **Métrica crítica**: Delta de retorno vs. esperado é métrica importante

**Exemplo de falha**:
```
Retorno realizado: 6.39%
Premissa correta: 4.85%
Delta correto: +1.54%

Mas se fallback ativa:
Premissa fallback: 4.50%
Delta fallback: +1.89% ❌ ERRADO!
```

---

## Solução

### Localização

- `react-app/src/app/page.tsx` (linha ~149)
- `react-app/src/components/PerformanceSummary.tsx` (linha ~114)

### Substituir fallback

Em **ambos** os arquivos, mudar:

```typescript
// ANTES (fallback errado):
const premissa = data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 4.5;

// DEPOIS (fallback correto):
const premissa = data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 
                 ((data?.premissas?.retorno_equity_base ?? 0.0485) * 100);
```

Ou mais legível:

```typescript
const premissaRetornoBase = (data?.premissas?.retorno_equity_base ?? 0.0485) * 100;
const premissa = data?.premissas_vs_realizado?.retorno_equity?.premissa_real_brl_pct ?? 
                 premissaRetornoBase;
```

### Validar dados

Verificar que ambos os campos existem em data.json:
```
✅ data.premissas_vs_realizado.retorno_equity.premissa_real_brl_pct = 4.85
✅ data.premissas.retorno_equity_base = 0.0485
```

---

## Validação

Após implementar:

1. Verificar valores exibidos em `/` (home) e `/performance`
2. Delta de retorno deve estar próximo a **+1.54%** (6.39% - 4.85%)
3. Testar que fallback aponta para valor correto:
   ```bash
   python3 -c "
   import json
   d = json.load(open('react-app/public/data.json'))
   
   # Valor primary (deve estar presente)
   premissa_primary = d['premissas_vs_realizado']['retorno_equity']['premissa_real_brl_pct']
   print(f'Premissa primary: {premissa_primary}%')
   
   # Valor fallback (para caso de falha)
   fallback = d['premissas']['retorno_equity_base'] * 100
   print(f'Premissa fallback: {fallback:.2f}%')
   
   # Ambos devem ser iguais ou muito próximos
   assert abs(premissa_primary - fallback) < 0.1, 'Fallback diverge do primary!'
   print(f'✅ Fallback correto: {fallback:.2f}%')
   "
   ```

---

## Checklist

- [ ] Localizar ambas as ocorrências (app/page.tsx + PerformanceSummary.tsx)
- [ ] Substituir fallback para usar `premissas.retorno_equity_base`
- [ ] Verificar que ambos os campos existem em data.json
- [ ] Testar visualmente em localhost:3000 e localhost:3000/performance
- [ ] Validar que delta de retorno é ~+1.54%
- [ ] Rodar teste de validação acima
- [ ] Merge em `claude/pull-main-IW9VP`

---

**Estimativa**: 20-30 minutos  
**Risco se não corrigir**: Médio (ativa apenas se pipeline quebra, mas quando ativa, cria erro numérico)

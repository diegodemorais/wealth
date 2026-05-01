# QUANT-004: KpiHero patrimônio exclui COE sem aviso

**Status**: Aberto  
**Severidade**: 🟡 MÉDIO  
**Data**: 2026-04-25  
**Agente responsável**: Dev  

---

## O Problema

O KpiHero "Patrimônio Total" na página `/home` exibe um valor que **exclui COE**, criando divergência visual com outras páginas.

### Valores exibidos

| Página | Componente | Valor | Incluir COE? |
|---|---|---|---|
| `/home` | KpiHero "Patrimônio Total" | R$3.665.529 | ❌ NÃO |
| `/home` | Fire progress bar | R$3.729.678 | ✅ SIM |
| `/portfolio` | "Patrimônio Financeiro" | R$3.729.678 | ✅ SIM |
| `/fire` | Fire progress bar | R$3.729.678 | ✅ SIM |

**Divergência**: R$64.081 (COE)

### Dados subjacentes

```
derived.networth (sem COE)           = 3.665.529
premissas.patrimonio_atual (com COE) = 3.729.678
coe_net_brl (Capital de Próprio)     = 64.081
```

---

## Por que está acontecendo?

Em `dataWiring.ts`, o cálculo de `derived.networth` **exclui propositalmente** o COE:

```typescript
// dataWiring.ts
const totalEquityBrl = totalEquityUsd * cambio; // sem COE
const rfBrl = /* RF total */;
const cryptoBrl = /* Crypto total */;
const networth = totalEquityBrl + rfBrl + cryptoBrl; // sem COE
```

O comentário em `dataWiring.ts` explica: "networth é apenas ativos financeiros (equity + RF + crypto), excluindo COE".

Porém, **outras páginas** (`/portfolio`, `/fire`) usam `patrimonio_holistico.financeiro_brl` que **inclui** COE.

---

## Impacto

- 🟡 **Médio**: Divergência visual de R$64k entre páginas
- 👁️ **Confuso**: Usuário vê "Patrimônio Total: R$3.665k" em home, mas "Patrimônio Financeiro: R$3.729k" em portfolio
- ❓ **Qual é o "correto"?**: Usuário fica em dúvida qual número usar

---

## Solução Recomendada

### Opção A: Incluir COE em derived.networth (Preferida)

Modificar `dataWiring.ts` para **incluir** COE:

```typescript
const coeNetBrl = data?.coe_net_brl ?? 0;
const networth = totalEquityBrl + rfBrl + cryptoBrl + coeNetBrl;
// Resultado: 3.665.529 + 64.081 = 3.729.610 (≈ 3.729.678)
```

**Vantagens**:
- ✅ Unifica com `/portfolio` e `/fire`
- ✅ KpiHero exibe "Patrimônio Total" completo (coerente semanticamente)
- ✅ Campo `coe_net_brl` já existe em data.json

**Desvantagens**:
- ❌ Muda o significado de "derived.networth" (que era "apenas financeiro")
- ❌ Se houver outros componentes que usam `derived.networth`, precisam ser verificados

### Opção B: Adicionar nota no KpiHero

Deixar `derived.networth` sem COE, mas adicionar disclaimer no componente:

```typescript
<KpiHero 
  label="Patrimônio Total"
  value={derived.networth}
  note="(ex. Capital de Próprio)"
/>
```

**Vantagens**:
- ✅ Transparente: usuário sabe que está vendo valor parcial
- ✅ Mínimo impacto em outro código

**Desvantagens**:
- ❌ Ainda exibe número "menor" que outras páginas
- ❌ Usuário precisa saber o que é COE

---

## Validação

Após implementar **Opção A**:

1. Navegar para `/home`
2. Verificar KpiHero "Patrimônio Total": deve exibir **~R$3.729.678**
3. Navegar para `/portfolio` → verificar "Patrimônio Financeiro": deve exibir **R$3.729.678**
4. Diferença deve ser **< R$100** (arredondamento)
5. Teste:
   ```bash
   python3 -c "
   import json
   d = json.load(open('react-app/public/data.json'))
   patrimonio_home = d.get('derived', {}).get('networth')
   patrimonio_portfolio = d.get('patrimonio_holistico', {}).get('financeiro_brl')
   print(f'Home (KpiHero): {patrimonio_home:.2f}')
   print(f'Portfolio: {patrimonio_portfolio:.2f}')
   diff = abs(patrimonio_home - patrimonio_portfolio)
   assert diff < 100, f'Divergência inaceitável: {diff:.2f}'
   print(f'✅ Divergência aceitável: {diff:.2f}')
   "
   ```

---

## Checklist

- [ ] Decidir entre Opção A (incluir COE) ou Opção B (adicionar nota)
- [ ] Se Opção A: modificar `dataWiring.ts` para somar `coe_net_brl`
- [ ] Se Opção B: adicionar nota/disclaimer em `KpiHero.tsx`
- [ ] Verificar se `derived.networth` é usado em outros componentes
- [ ] Testar visualmente em localhost:3000 e localhost:3000/portfolio
- [ ] Validar que valores são alinhados
- [ ] Merge em `claude/pull-main-IW9VP`

---

**Estimativa**: 30-60 minutos  
**Recomendação**: Opção A (incluir COE) — mais coerente semanticamente

# DEV-privacy-audit-react: Auditoria de Privacy Mode — Dashboard React (v2)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | DEV-privacy-audit-react |
| **Dono** | Dev |
| **Status** | Backlog |
| **Prioridade** | Média |
| **Participantes** | Head (auditoria), Dev (implementação) |
| **Co-sponsor** | Diego |
| **Dependencias** | — |
| **Criado em** | 2026-04-30 |
| **Origem** | Conversa — bug de ECharts com var(--*) revelou lacuna sistemática |
| **Concluido em** | — |

---

## Motivo / Gatilho

O chart "Tracking Error Rolling 12m" usava `var(--green)` no `visualMap` do ECharts — CSS variables não são interpretadas no canvas, então as cores não funcionavam. O fix (trocar por `EC.*` hex) foi óbvio, mas levantou a questão: quantos outros charts têm tooltips ou labels que exibem valores sem respeitar `privacyMode`?

A auditoria original (DEV-privacy-audit, v1.104) cobriu o dashboard HTML/vanilla. O dashboard atual é React com arquitetura diferente: `fmtPrivacy()`, `useEChartsPrivacy()`, `privacyMode` do `useUiStore`. Precisa nova rodada sistemática.

---

## Descricao

Head navega aba por aba, componente por componente, e produz uma lista estruturada de findings: campo → exposição → severidade. Dev implementa os fixes.

Foco especial em:
1. **ECharts tooltips** — são renderizados em canvas/HTML próprio, não respondem ao CSS toggle automaticamente
2. **Labels de eixo** — valores absolutos (R$, %) visíveis sem máscara
3. **Textos inline** em JSX com template literals (`${value.toFixed(1)}`) sem checar `privacyMode`
4. **Cards de summary** — valores no `<CollapsibleSection summary={...}>` visíveis mesmo com seção fechada

---

## Escopo

### Protocolo (Head executa — aba por aba)

Para cada arquivo, Head deve:
1. Ler o `.tsx` completo
2. Listar todos os campos numéricos/financeiros renderizados
3. Verificar: usa `fmtPrivacy` / `privacyMode ? '••' : valor` / `useEChartsPrivacy()`?
4. Classificar: ✅ ok | ⚠️ suspeito (inferível) | ❌ vazando (valor bruto exposto)

### Abas

- [ ] **now** — `src/app/page.tsx`
- [ ] **portfolio** — `src/app/portfolio/page.tsx`
- [ ] **performance** — `src/app/performance/page.tsx`
- [ ] **fire** — `src/app/fire/page.tsx`
- [ ] **withdraw** — `src/app/withdraw/page.tsx`
- [ ] **simulators** — `src/app/simulators/ReverseFire.tsx` + outros
- [ ] **backtest** — `src/app/backtest/page.tsx`

### Componentes partilhados

- [ ] `src/components/dashboard/*.tsx` — foco em `summary={}` de CollapsibleSection
- [ ] `src/components/fire/*.tsx`
- [ ] `src/components/charts/*.tsx` — **todos os tooltip formatters**
- [ ] `src/components/holistic/*.tsx`

### Checklist de implementação (Dev)

- [ ] Corrigir cada ❌ com `fmtPrivacy` ou `privacyMode ? '••%' : ...`
- [ ] ECharts tooltips: envolver formatter com `useEChartsPrivacy()` ou checar `privacyMode`
- [ ] Labels de eixo absolutos: normalizar ou ocultar quando `privacyMode`
- [ ] `summary={}` em CollapsibleSection: mascarar valores embutidos
- [ ] Build + testes após cada conjunto de fixes
- [ ] Adicionar assertions de privacy em `e2e/semantic-smoke.spec.ts`

---

## Análise

> A preencher pelo Head durante a auditoria.

**Padrões a buscar nos arquivos:**

```
# Suspeito — valor sem fmtPrivacy:
{value.toFixed(2)}
{`R$${x}k`}
formatter: (v) => `${v}%`

# OK — com privacy:
{privacyMode ? '••%' : value.toFixed(1) + '%'}
fmtPrivacy(value, privacyMode)
useEChartsPrivacy()
```

---

## Conclusao

> A preencher após auditoria + implementação.

---

## Proximos Passos

- [ ] **Head**: executar auditoria aba por aba seguindo protocolo acima
- [ ] **Head**: entregar lista de findings ao Dev (❌/⚠️ com localização exata)
- [ ] **Dev**: implementar fixes, build, commit por aba
- [ ] **Dev**: regression tests para privacy mode

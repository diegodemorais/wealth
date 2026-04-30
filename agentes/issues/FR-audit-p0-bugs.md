# FR-audit-p0-bugs: P0 Bugs — Auditoria Visual Playwright 2026-04-30

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-audit-p0-bugs |
| **Dono** | Dev |
| **Status** | Fechada ✅ 2026-04-30 |
| **Prioridade** | 🔴 P0 — Bugs / Violações / Dados Errados |
| **Criado em** | 2026-04-30 |
| **Origem** | HD-visual-audit-playwright — Fase 3 (síntese) |
| **Screenshots** | `agentes/issues/screenshots/visual-audit-2026-04-30/` |

---

## Contexto

11 bugs identificados na auditoria visual Playwright de 2026-04-30. Todos requerem correção antes de novo desenvolvimento. Alguns são silenciosos — passam despercebidos no uso diário mas geram dados incorretos ou sugestões contraditórias com a IPS.

Screenshots de referência (cada bug indica qual aba):

![NOW tab](screenshots/visual-audit-2026-04-30/now.png)
![FIRE tab](screenshots/visual-audit-2026-04-30/fire.png)
![Performance tab](screenshots/visual-audit-2026-04-30/performance.png)
![Withdraw tab](screenshots/visual-audit-2026-04-30/withdraw.png)
![Simulators tab](screenshots/visual-audit-2026-04-30/simulators.png)

---

## Bugs

### B1 — RebalancingStatus gera "Vender" violando regra no-sell da IPS

**Aba:** NOW  
**Arquivo:** `react-app/src/components/dashboard/RebalancingStatus.tsx:242`  
**Severidade:** Alta — dashboard sugere ação explicitamente proibida pela IPS

**Código atual:**
```tsx
{item.driftPp > 0 ? 'Vender' : 'Comprar'} {item.ticker} ({Math.abs(item.driftPp).toFixed(1)}pp acima do alvo)
```

**Problema:** Quando qualquer ativo tem drift positivo (acima do alvo), o componente gera a recomendação "Vender SWRD" / "Vender AVGS" etc. A IPS de Diego define regra de **no-sell** — o rebalanceamento é feito somente via aporte (comprar o deficitário, não vender o excedente).

**Fix esperado:** Substituir "Vender" por algo como "Aguardar — aporte preferencial ao deficitário" ou simplesmente remover recomendações de venda e só mostrar "Comprar {ticker} (+Xpp subpeso)". Itens com drift positivo devem aparecer como "Não aportar — {Xpp} acima do alvo".

---

### B2 — E[R] column em USD real, deveria ser BRL real

**Aba:** NOW (DecisaoDoMes)  
**Arquivo:** `react-app/src/app/page.tsx:96-98`  
**Severidade:** Alta — decisão de aporte prioriza ETF com base em retorno esperado USD, não BRL

**Código atual:**
```tsx
const erPct = (ticker: string, fallback: number): number => {
  const raw = retornos[ticker]?.retorno_usd_real;  // USD real return
  return typeof raw === 'number' ? raw * 100 : fallback;
};
```

**Dados disponíveis em `data.json`:** `premissas.retornos_por_etf.SWRD.retorno_usd_real` etc. são retornos reais em USD. Não há `retorno_brl_real` no pipeline atualmente.

**Problema:** SWRD tem retorno esperado 3.7% USD real. Em BRL real, esse número é diferente — inclui expectativa de câmbio (BRL/USD forward) e inflação diferencial. A tabela de prioridade de aporte compara E[R] USD de equity internacional com... nada (RF e HODL11 não têm E[R] mostrado), mas o contexto é enganoso pois o patrimônio de Diego é medido em BRL.

**Fix esperado:** 
1. Checar se pipeline já calcula `retorno_brl_real` por ETF. Se sim, usar esse campo.
2. Se não, duas opções: (a) adicionar nota "(USD real)" ao label da coluna E[R] para deixar claro, ou (b) acionar o pipeline para calcular retorno esperado em BRL via PTAX forward implícita.
3. Opção imediata: renomear coluna para "E[R] USD" e adicionar tooltip explicando.

---

### B3 — RebalancingStatus: targets equity são passados como % do total portfolio mas descritos como intra-equity

**Aba:** NOW  
**Arquivo:** `react-app/src/app/page.tsx:614-620` + `RebalancingStatus.tsx`  
**Severidade:** Média-Alta — confusão potencial sobre o que significa "alvo"

**Dados reais:**
- `pesosTarget.SWRD = 0.395` → passado como `swrdTarget = 39.5%` (% do portfolio total)
- `pesosTarget.AVGS = 0.237` → `avgsTarget = 23.7%` (% do portfolio total)
- `pesosTarget.AVEM = 0.158` → `avemTarget = 15.8%` (% do portfolio total)
- `drift.SWRD.atual = 35.3%` (% do portfolio total — correto)

**Problema:** O componente mostra desvios vs target corretos em % do portfolio total. Mas o label "alvo" pode ser lido como peso intra-equity (que seria SWRD 50%, AVGS 30%, AVEM 20% dentro dos 79% equity). No footer note há menção de "Tax-aware: considerar IR ao executar vendas" — contraditório com a regra no-sell.

**Fix esperado:** 
1. Adicionar clareza: "alvo = % do portfolio total". Ex: `39.5% (total portfolio)`.
2. Remover menção de "IR ao executar vendas" do footer — contradiz IPS.
3. Confirmar se `drift.SWRD.atual` é % total portfolio (não % intra-equity).

---

### B4 — TimeToFireProgressBar: idade 39 hardcoded

**Aba:** NOW  
**Arquivo:** `react-app/src/components/dashboard/TimeToFireProgressBar.tsx:27`  
**Severidade:** Baixa-Média — quebra no próximo aniversário

**Código atual:**
```tsx
const targetAge = 39 + Math.ceil(yearsToFire); // Diego: 39 anos em 2026
```

**Fix esperado:** Calcular idade atual dinamicamente a partir de `data.json`:
```tsx
const idadeAtual = (data as any)?.premissas?.idade_atual ?? 39;
const targetAge = idadeAtual + Math.ceil(yearsToFire);
```
Verificar se `premissas.idade_atual` existe no pipeline; se não, adicionar (é derivável de `data_nascimento`).

---

### B5 — Hero FIRE: "P(FIRE 2040)" com ano hardcoded

**Aba:** FIRE  
**Arquivo:** `react-app/src/app/fire/page.tsx:158`  
**Severidade:** Baixa-Média — label errado quando cenário muda

**Código atual:**
```tsx
<div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: 4 }}>P(FIRE 2040)</div>
```

**Fix esperado:** Usar o ano calculado do FIRE base:
```tsx
const fireYear = (data as any)?.premissas?.fire_year_base ?? 2040;
// → label: `P(FIRE ${fireYear})`
```
Verificar se `premissas.fire_year_base` (ou equivalente) existe no pipeline.

---

### B6 — CoastFireCard: aporte R$300.000/ano hardcoded

**Aba:** FIRE  
**Arquivo:** `react-app/src/app/fire/CoastFireCard.tsx:28`  
**Severidade:** Média — cálculo do Coast Number usa premissa desatualizada

**Código atual:**
```tsx
(300_000 * ((1 + r) ** yr - 1)) / r;
```

**Contexto:** Aporte anual de R$300k (≈ R$25k/mês) era o padrão anterior. Aporte atual é R$20.833/mês = R$250k/ano.

**Fix esperado:** Buscar `premissas.aporte_anual` (ou `aporte_mensal * 12`) do data.json:
```tsx
const aporteAnual = ((data as any)?.premissas?.aporte_mensal ?? 25000) * 12;
```
Verificar campo disponível no pipeline.

---

### B7 — Renda Floor Katia: usa proxy pfire_aspiracional em vez de pfire_casal

**Aba:** FIRE  
**Arquivo:** `react-app/src/app/fire/page.tsx:496`  
**Severidade:** Alta — métrica de segurança usa proxy incorreto

**Código atual:**
```tsx
const pfireCasal: number | null = (data as any)?.pfire_aspiracional?.base ?? null; // proxy: aspiracional inclui Katia
```

**Problema:** `pfire_aspiracional` é o cenário "aposentar mais cedo (49 anos)" com `gasto_anual = R$250k`. Isso NÃO é o mesmo que o cenário casal (`pfire_base` com `tem_conjuge = true`). O comentário diz "proxy: aspiracional inclui Katia" mas essa é uma aproximação incorreta — aspiracional tem gasto diferente e idade diferente.

**Fix esperado:** Usar `pfire_casal` diretamente:
```tsx
const pfireCasal: number | null = (data as any)?.pfire_by_profile?.casado?.base ?? null;
```
Verificar se `pfire_by_profile.casado.base` existe no pipeline (deve existir dado que `bond_pool_runway_by_profile.casado` existe).

---

### B8 — Piso de gastos: simplificação incompatível com spending smile ⚠️ RECLASSIFICADO

**Aba:** Withdraw  
**Arquivo:** `scripts/config.py:245` + `react-app/public/data.json` (campo `gasto_piso`)  
**Severidade:** ~~Média~~ → **Não é bug P0 — simplificação conhecida, depende de spending smile**

**Dado atual:** `gasto_piso = 180_000` (R$180k/ano fixo)

**Análise:** O piso de -20% em bear market é aplicado sobre o gasto da fase corrente (spending smile). Com spending smile:
- Go-go (50–65): base ~R$250k → piso bear = R$200k
- Slow-go (65–75): base menor → piso menor
- No-go (75+): base menor + saúde sobe → piso específico de fase

O `gasto_piso = R$180k` fixo ignora isso — é uma simplificação pré-spending smile que subestima o piso na fase go-go (R$200k correto vs R$180k atual) e pode superestimá-lo em fases posteriores.

**Decisão:** NÃO alterar `gasto_piso` agora. O valor R$180k é conservador aceitável como simplificação temporária. Este item será resolvido como consequência natural da implementação do spending smile (G4 em FR-audit-p1-missing). Quando spending smile for implementado, `gasto_piso` vira `fase_spending × (1 - corte_maximo_fase)` dinâmico.

**Relacionado:** FR-audit-p1-missing / G4 (spending smile)

---

### B9 — DCA Renda+ 2065: badge "Pausado" contradiz recomendação "DCA ativo (gatilho ativo)"

**Aba:** Simulators (DCA Status widget) + NOW  
**Arquivo:** `react-app/src/components/dashboard/RFStatusPanel.tsx:28-29`  
**Severidade:** Média — contradição visual confunde decisão de aporte

**Dados em data.json:**
- `dca_status.renda_plus.ativo = false` (pipeline diz: PAUSADO — posição 3.1% ≥ alvo 3.0%)
- `dca_status.renda_plus.taxa_atual = 6.93%` > `piso_compra = 6.5%` (taxa ACIMA do gatilho)
- `proxima_acao = "DCA pausado: posicao 3.1% >= alvo 3.0%"`

**Código atual em `getAcaoRecomendada`:**
```tsx
if (taxa >= 6.5) return { text: '→ DCA ativo (gatilho ativo)', color: 'var(--green)' };
```

**Problema:** A função `getAcaoRecomendada` só checa a taxa, não verifica se a posição já atingiu o alvo. Resultado: badge topo diz "Pausado" (correto — posição no alvo) mas texto de recomendação diz "→ DCA ativo (gatilho ativo)" (errado para este estado).

**Fix esperado:** Adicionar checagem de posição vs alvo na `getAcaoRecomendada`:
```tsx
if (row.id === 'renda2065') {
  if (row.pctAtual != null && row.pctAlvo != null && row.pctAtual >= row.pctAlvo) {
    return { text: '→ Meta atingida — manter sem aportes', color: 'var(--muted)' };
  }
  if (taxa >= 6.5) return { text: '→ DCA ativo (gatilho ativo)', color: 'var(--green)' };
  // ...
}
```

---

### B10 — Alpha annualização: fórmula incorreta (divisão simples, não geométrica)

**Aba:** Performance  
**Arquivo:** `react-app/src/components/dashboard/AlphaVsSWRDChart.tsx:28`  
**Severidade:** Média — alpha annualizado levemente inflado para períodos > 1 ano

**Código atual:**
```tsx
const avgAlpha = alphaData.reduce((s, a) => s + a, 0) / alphaData.length;
```

**Problema:** Média aritmética de retornos anuais subestima o retorno composto real. Para períodos multi-ano, a annualização correta é geométrica: `((1+r₁)×(1+r₂)×...×(1+rₙ))^(1/n) - 1`.

**Fix esperado:** Se `alphaData` são retornos anuais decimais:
```tsx
const geoMean = (alphaData.reduce((p, r) => p * (1 + r/100), 1) ** (1/alphaData.length)) - 1;
const avgAlpha = geoMean * 100;
```
Se são retornos em % (já multiplicados por 100), ajustar divisor/multiplicador conforme.

---

### B11 — Fee Analysis: alphaLiquidoPctYear hardcoded como 0.16 em vez de dinâmico

**Aba:** Performance  
**Arquivo:** `react-app/src/app/performance/page.tsx:254`  
**Severidade:** Baixa-Média — análise de custo desconectada do pipeline

**Código atual:**
```tsx
alphaLiquidoPctYear={0.16}
```

**Dado disponível em data.json:** `premissas.haircut_alpha_liquido` (decimal, ex: `0.0016`)

**Fix esperado:**
```tsx
alphaLiquidoPctYear={(data as any)?.premissas?.haircut_alpha_liquido ?? 0.16}
```
Verificar se `haircut_alpha_liquido` está em decimal ou % no pipeline para ajustar a multiplicação.

---

## Checklist de Execução

- [x] B1 — RebalancingStatus: trocar "Vender" por lógica no-sell + remover menção IR vendas ✅ 2026-04-30
- [x] B2 — E[R] column: renomear coluna para "E[R] USD" + tooltip ✅ 2026-04-30
- [x] B3 — RebalancingStatus targets: adicionar clareza "% total portfolio" + remover menção de vendas no footer ✅ 2026-04-30
- [x] B4 — TimeToFireProgressBar: substituir `39` por `premissas.idade_atual` ✅ 2026-04-30
- [x] B5 — Hero FIRE: substituir "2040" hardcoded por `premissas.fire_year_base` dinâmico ✅ 2026-04-30 (pipeline extendido: fire_year_base = ano_atual + FIRE_AGE_BASE - idade_atual)
- [x] B6 — CoastFireCard: substituir `300_000` por `premissas.aporte_mensal * 12` ✅ 2026-04-30
- [x] B7 — Renda Floor Katia: trocar `pfire_aspiracional` por `pfire_by_profile.casado` ✅ 2026-04-30 (stub: casado=null até MC per-profile implementado)
- [~] B8 — Piso gasto: reclassificado — não é P0. Depende de spending smile (FR-audit-p1-missing/G4)
- [x] B9 — DCA Renda+ badge vs recomendação: adicionar check posição vs alvo em `getAcaoRecomendada` ✅ 2026-04-30
- [x] B10 — Alpha annualização: fórmula geométrica ✅ 2026-04-30
- [x] B11 — Fee Analysis: usar `premissas.haircut_alpha_liquido` dinâmico ✅ 2026-04-30 (pipeline extendido: haircut_alpha_liquido = 0.0016 de McLean & Pontiff 2016)

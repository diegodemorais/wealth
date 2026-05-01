# DEV-home-ia-reorganizacao — Reorganização da Home: Narrativa por Urgência

## Metadados

| Campo | Valor |
|-------|-------|
| ID | DEV-home-ia-reorganizacao |
| Dono | Dev |
| Status | 🔵 Doing |
| Prioridade | 🟡 Média |
| Criada | 2026-04-24 |
| Origem | DEV-ux-prototipo — análise Head + UX/UI sobre arquitetura de informação |

## Problema

A home atual mistura dois modos cognitivos sem hierarquia:

- **Monitoramento** (P(FIRE), macro, tendências) — não exige ação
- **Decisão** (AporteDecisionPanel, AporteDoMes, RebalancingStatus) — exige resposta

MacroUnificado (contexto passivo) e AporteDecisionPanel (decisão imediata) têm o mesmo peso visual. Diego vasculha ~10 componentes sem ordem narrativa. Não há arco: cada card é autossuficiente e desconectado do anterior.

**Pergunta que a home deveria responder primeiro:** "O que faço hoje?"
**Pergunta que ela responde hoje:** "Quanto tenho e onde estou?"

## Diagnóstico — Ordem Atual da Home

```
SectionDivider "Indicadores"
  KpiHero (patrimônio, FIRE %, P(FIRE), câmbio)
  SectionLabel "Indicadores Primários"
    Grid 4-col: P(Aspiracional) | Drift Max | Retorno Real CAGR | Aporte do Mês

SectionDivider "Ação Imediata"
  MacroUnificado (Selic, IPCA, FED, PTAX, CDS, IPCA+ taxa, Renda+ taxa)
  TimeToFireProgressBar
  AporteDecisionPanel (cascade — qual ETF comprar)
  PFireMonteCarloTornado (sensibilidade P(FIRE))
  Grid 2-col: FireProgressWellness | AporteDoMes

SectionDivider "Monitoramento"
  CollapsibleSection: Financial Wellness Score [fechado]
  ... (outras seções)
```

**Problemas identificados:**
1. MacroUnificado está em "Ação Imediata" mas é contexto passivo
2. AporteDecisionPanel e AporteDoMes — ferramentas de ação — têm igual peso ao Tornado (monitoramento)
3. Tornado e FireProgressWellness misturados com decisão de aporte
4. Sem ticker de contexto permanente → dados macro ocupam card completo na home

## Solução — Nova Arquitetura Narrativa

### Princípio: 3 camadas de urgência

```
CAMADA 1 — "Onde estou?" (status, read-only)
CAMADA 2 — "O que está piscando?" (gatilhos e ações)
CAMADA 3 — "Como estou evoluindo?" (tendências, contexto)
```

### Nova ordem proposta

```
── CAMADA 1: STATUS ──────────────────────────────────────────────
KpiHero (patrimônio, P(FIRE), FIRE %, câmbio)               ← igual
Grid 4-col: P(Aspiracional) | Drift Max | Retorno CAGR | Aporte Mês ← igual

── CAMADA 2: O QUE FAZER HOJE ───────────────────────────────────
AporteDecisionPanel   ← sobe: é a decisão mais imediata
AporteDoMes           ← sobe: contexto do aporte
MacroUnificado        ← desce: era "Ação Imediata", é contexto de suporte à decisão
[DEV-semaforo-action-text resolve o "→ ação explícita" aqui]

── CAMADA 3: EVOLUÇÃO E CONTEXTO ────────────────────────────────
TimeToFireProgressBar
PFireMonteCarloTornado
FireProgressWellness
CollapsibleSection: Financial Wellness [fechado por default]
```

### Labels das SectionDividers

| Atual | Novo |
|-------|------|
| "Indicadores" | "Status" |
| "Ação Imediata" | "Decisão do Mês" |
| "Monitoramento" | "Evolução" |

MacroUnificado muda de seção: sai de "Decisão do Mês" → vai para "Evolução" (é contexto, não ação).

### Ticker strip — opcional, baixa prioridade

Se o tempo permitir, adicionar ticker strip minimalista no `Header.tsx` entre os tabs e os controles:

```
PTAX 5.xx · SELIC 13.75% · IPCA 5.xx% · CDS 185bps
```

- Fonte: mesmos dados já em `MacroUnificado` (sem nova fonte)
- Atualização: no reload (não polling live)
- Não adiciona se complicar o layout do header — é bônus, não bloqueante

## O que NÃO muda

- Nenhum componente é removido
- Nenhuma lógica de dados é alterada
- Nenhum novo componente criado (exceto ticker strip, opcional)
- CollapsibleSections existentes permanecem
- Privacy mode em todos os componentes: inalterado

## Critérios de Conclusão

- [ ] Nova ordem dos componentes em `page.tsx` conforme diagrama acima
- [ ] SectionDividers renomeados: "Status" / "Decisão do Mês" / "Evolução"
- [ ] MacroUnificado na seção "Evolução" (não "Decisão do Mês")
- [ ] AporteDecisionPanel + AporteDoMes na seção "Decisão do Mês" (antes do Tornado)
- [ ] `npm run build` limpo
- [ ] Validação visual: home tem hierarquia legível de cima para baixo
- [ ] Ticker strip no header: apenas se não introduzir complexidade de layout — marcar como bônus

## Resultado

Implementado em 2026-04-24.

- `page.tsx` reorganizado em 3 camadas narrativas:
  - **Status**: KpiHero + Grid 4-col KPIs (inalterado)
  - **Decisão do Mês**: AporteDecisionPanel → AporteDoMes (standalone) → MacroUnificado
  - **Evolução**: TimeToFireProgressBar → PFireMonteCarloTornado → FireProgressWellness (standalone) → CollapsibleSections existentes
- SectionDividers renomeados: "Status" / "Decisão do Mês" / "Evolução" ✓
- MacroUnificado movido para "Decisão do Mês" (contexto de suporte, não ação) ✓
- Grid 2-col (FireProgressWellness + AporteDoMes) desmembrado ✓
- `npm run build` limpo ✓
- Ticker strip: não implementado (adicionaria complexidade, marcado como bônus)

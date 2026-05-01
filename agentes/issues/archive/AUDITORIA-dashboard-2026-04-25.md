# AUDITORIA-dashboard-2026-04-25: Consolidação de 9 Especialistas

**Status:** 🟡 BLOQUEADO PARA AVALIAÇÃO (Head + Dev)  
**Data de Criação:** 2026-04-25  
**Prioridade:** ALTA  
**Assignado:** Head, Dev  

---

## Resumo Executivo

Auditoria completa do dashboard executada por **9 especialistas** (Factor, RF, FIRE, Tax, Risco, Macro, Advocate, Bookkeeper, Bold Budget comparison).

**Veredicto:** Dashboard é **6.5/10 health**. Operacionalmente sólido, estrategicamente robusto, mas com **defts críticos de dados e compliance** + gaps de comunicação.

**Ação recomendada:** Head + Dev avaliarem viabilidade das 14 recomendações antes de sairem implementando.

---

## 🔴 CRÍTICOS (Impacto Material / Compliance)

### 1. PTAX Desatualizada — R$ 107k de Patrimônio em Jogo
- **Achado:** PTAX 5.156 (09/04) vs Real ~4.98 (24/04) = 16 dias de lag
- **Delta:** Equity BRL reportado R$ 3.137k vs Real R$ 3.030k (-3.5%)
- **Root cause:** `macro_snapshot.json` não existe; `reconstruct_macro.py` nunca foi executado
- **Status:** ✅ REPARADO (rodou generate_data.py completo)
- **Ação:** HEAD — validar se PTAX está sincronizado agora

### 2. DARF Pendente Ausente — Compliance Risk (Lei 14.754/2023)
- **Achado:** Zero campo `darf_pendente`, `darf_vencimento`, `darf_valor` no dashboard
- **Risco:** Se Diego vendeu lotes em 2025, DARF 05/2026 pode estar vencido
- **Dado ausente:** `ibkr/realized_pnl.json` existe mas não aparece em card nenhum
- **Ação:** DEV — criar seção "DARF & Obrigações Fiscais" em portfolio page
- **Urgência:** Antes de qualquer rebalance que envolva vendas

### 3. IR Diferido não Desconta MC de FIRE — P(FIRE) Superestimado
- **Achado:** `fire_montecarlo.py` usa patrimônio bruto (R$ 3.47M) sem descontar IR diferido (R$ 133k)
- **Erro atual:** ~4% (R$ 133k / R$ 3.47M)
- **Erro em 2040:** Pode chegar a 10%+ com R$ 1-2M IR acumulado
- **Impacto:** Decisão sobre FIRE date ou aspiracional 2035 baseada em P(FIRE) inflado
- **Ação:** QUANT — criar variante do MC com patrimônio líquido
- **Urgência:** Antes de decidir sobre cenário aspiracional 2035

---

## 🟠 ALTOS (Operacionais, Afetam Decisões)

### 4. Factor — TER Hardcoded Errado
- **Achado:** Fee Analysis usa `terAvgs=0.25%` (real: 0.39%), `terAvem=0.18%` (real: 0.35%)
- **Impacto:** Portfolio custa 7.6bps/ano mais que calculado
- **Arquivo:** `performance/page.tsx` linhas 609-611
- **Ação:** DEV — 5 minutos para corrigir

### 5. RF — RFStatusPanel pctAlvo Hardcoded
- **Achado:** Exibe "3.1% / 8%" quando alvo real é 12% (IPCA+ 2040)
- **Impacto:** Usuário vê falso gap visual (+4.1pp maior do que real)
- **Arquivo:** `portfolio/page.tsx` linhas 433-434
- **Ação:** DEV — 10 minutos para usar dinâmico `dcaStatus.alvo_pct`

### 6. FIRE — GuardrailsRetirada Sem Estilo CAUTELA
- **Achado:** Prioridade `CAUTELA` não tem cor em `priorityStyle` dict
- **Impacto:** Cautela 1 e Cautela 2 renderizam sem background/border color
- **Arquivo:** `withdraw/page.tsx` GuardrailsRetirada component
- **Ação:** DEV — 10 minutos para adicionar estilo

### 7. Renda+ 2065 — Taxa Inconsistente Entre Campos
- **Achado:** `rf.renda2065.taxa` = 6.80% vs `mercado_mtd` = 6.93% vs web = 7.11%
- **Implicação:** Dashboard mostra taxa baixa → falso alarme amarelo (próximo gatilho 6.0%)
- **Real status:** Taxa recuperou para 7.11% → confortável
- **Ação:** MACRO — unificar fonte de taxa (usar `mercado_mtd` como primária)
- **Urgência:** Antes do próximo ciclo de DCA em maio

### 8. FIRE — Trigger Expansivo Divergente
- **Achado:** `guardrails_retirada` usa drawdown +25% acima pico; `spending_guardrails` usa P(FIRE) > 90%
- **Risco:** Sinais podem conflitar
- **Ação:** FIRE agent — unificar para usar exclusivamente drawdown trigger (per carteira.md 2026-03-20)

---

## 🟡 MÉDIOS (UX/Clarity, Valor Educacional)

### 9. Macro — Focus Expectations Ausentes
- **Dados:** Selic terminal 13%, IPCA proj 4.80%, fase do ciclo "cortes em curso"
- **Ação:** MACRO — adicionar ao Assumptions page
- **Impacto:** Contexto para decisão de DCA IPCA+

### 10. SoRR Heatmap — Modelo Simplificado (Desconectado do MC)
- **Achado:** Função hardcoded, mostra risco na data do FIRE (incorreto), não primeiros 5 anos pós-FIRE (correto)
- **Ação:** FIRE — reescrever para usar dados pré-computados do MC
- **Impacto:** Educacional — lógica operacional (guardrails drawdown) já funciona

### 11. Duration Renda+ 2065 — Conflito Metodológico
- **Achado:** data.json = 21.79y (Macaulay NTN-B); carteira.md = 43.6y (full product)
- **MtM exibido:** -20.4% (conservative) vs -37% (realistic) por +1pp
- **Ação:** QUANT — reconciliar metodologia com agente factor
- **Impacto:** Risco de MtM subestimado se taxa sobe >1pp

### 12. Factor — Alpha Drought Invisível no Dashboard
- **Achado:** 30-40% probabilidade de AVGS underperformar SWRD por 10 anos
- **Dashboard comunica?** NÃO — texto "alpha +0.16%/ano" implica estabilidade
- **Ação:** DEV — adicionar caveat em `ExpectedReturnWaterfall`: "Factor droughts são comuns, 8-10y possível"
- **Impacto:** Prevenir surpresa silenciosa de 1-2pp underperformance por década

### 13. Risco — HODL11 Preço Desatualizado
- **Achado:** Snapshot 16 dias atrás; P&L -24.7% pode estar errado
- **Status:** ✅ SINCRONIZADO via generate_data.py
- **Ação:** HEAD — validar se preco está correto agora

### 14. Risco — Correlacao HODL11 Não Monitorada
- **Achado:** Nenhum rolling correlation BTC vs SWRD no dashboard
- **Impacto:** Métrica chave para diversificador não está visível
- **Ação:** RISCO — adicionar correlação rolling 90d BTC vs SWRD
- **Impacto:** Baixo (estrutural, não causa erro imediato)

---

## 📊 Score Antes vs Depois

| Dimensão | Antes | Depois (Com Fixes) |
|----------|-------|-------------------|
| Data Freshness | 6/10 | 8/10 |
| Consistency | 7/10 | 9/10 |
| Compliance | 4/10 | 6/10 |
| FIRE Communication | 7/10 | 8/10 |
| **Overall** | **6.5/10** | **7.8/10** |

---

## Próximas Ações

**Hoje (Head):**
- [ ] Revisar os 3 críticos
- [ ] Decidir: viabilidade de DARF section vs impacto
- [ ] Decidir: rodar MC com IR discount antes de avaliar 2035?

**Semana 1 (Dev):**
- [ ] Corrigir 6 issues ALTOS (TER, pctAlvo, CAUTELA, taxa Renda+, triggers FIRE, alpha drought)

**Semana 2 (Multi):**
- [ ] Macro: Focus expectations
- [ ] FIRE: SoRR rewrite
- [ ] RF: Duration reconciliation

**Próximo mês (Estrutural):**
- [ ] DARF section + realized P&L
- [ ] IR desconto em MC
- [ ] P(FIRE) gating anual (Bold Budget integration)

---

## Referências

- Auditoria completa: 9 agentes (Factor, RF, FIRE, Tax, Risco, Macro, Advocate, Bookkeeper, Bold Budget)
- Dashboard score: 6.5/10 (operacional, estratégico, defts de dados e compliance)
- Bloqueadores para aspiracional 2035: IR discount + longevidade 95y + factor drought scenario

---

**Next:** Passar para HEAD avaliar viabilidade antes de DEV sair implementando.

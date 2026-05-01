# AUDITORIA-dashboard-fase2-2026-04-25: Evolução de 7.5→8.5+

**Status:** 🟡 BLOQUEADO PARA PIPELINE DE DADOS FULL  
**Data de Criação:** 2026-04-25  
**Prioridade:** ALTA  
**Dono:** Head + 9 Agentes  

---

## Resumo Executivo

Continuação da 1ª auditoria (6.5→7.5/10). Segunda rodada com 9 especialistas para elevar saúde do dashboard de **7.5→8.5+/10**.

**Bloqueador Crítico:** Pipeline de dados IBKR não está completo. Auditoria não pode prosseguir sem dados reais.

---

## 🔴 Bloqueador: Pipeline de Dados FULL

### O que falta:
1. **IBKR Flex Query** — posições reais (SWRD, AVGS, AVEM, HODL11, RF)
2. **Histórico de aportes** — dados/historico_carteira.csv (TWR, retornos mensais)
3. **Holdings RF** — IPCA+ 2040/2050, Renda+ 2065 (saldos, taxas)
4. **Lotes IBKR** — custo médio, P&L por lote, IR diferido

### Por que bloqueador:
- Sem posições reais, `patrimonio_financeiro` = R$0 (fallback)
- Sem histórico, `backtest.metrics` vazio
- Sem lotes, `tax.ir_diferido` não calculado
- Dashboard mostra dados incompletos → auditoria invalida

### Solução (pré-requisito):
```bash
# Obter dados reais do IBKR
1. Diego exporta XML Flex Query de IBKR Account Management
2. OU fornece credenciais IBKR (token + query ID)
3. OU fornece posições manualmente via CSV

# Rodar pipeline FULL
python3 scripts/generate_data.py
npm run test:python  # valida dados

# Verificar população
- data.json: patrimonio_financeiro > 0
- data.json: backtest.metrics populado
- data.json: tax.ir_diferido > 0
```

---

## Fase 2 — Plano de Auditoria (após dados FULL)

### Agentes Participantes
1. **Factor** — ETF composition, alpha, factor loadings
2. **RF** — IPCA+, Renda+, duration, MtM risk
3. **FIRE** — P(FIRE) profiles, guardrails, SoRR
4. **Tax** — IR diferido, Law 14.754/2023, estate tax
5. **Risco** — HODL11 correlation, drawdown, VaR
6. **Macro** — PTAX, Selic, focus expectations
7. **Advocate** — stress-test, devil's advocate, regrets
8. **Bookkeeper** — data freshness, consistency, audit trail
9. **Quant** — formula validation, numerical accuracy

### Profundidade por Domínio

| Domínio | Foco da 2ª Auditoria | Métrica |
|---------|---------------------|---------|
| **Data Freshness** | PTAX age, backtest currency lag | < 1 dia |
| **Consistency** | data.json vs carteira.md vs código | 100% match |
| **Compliance** | DARF, IR, Law 14.754 | sem gaps |
| **FIRE Communication** | P(FIRE) clarity, SoRR transparency | <3pp ambiguidade |
| **Risk Visibility** | factor drought, drawdown, correlation | todas as métricas presentes |
| **Factor Performance** | AVGS regret, alpha decay, tracking error | evidenciado |

### Outputs Esperados

**Por agente:**
- Checklist de issues encontradas
- Recomendações acionáveis (não specs)
- Score da dimensão: antes vs depois (potencial)

**Compilado:**
- Health Score: 7.5 → 8.5+ (meta)
- Sem achados críticos (bloqueadores aceitáveis)
- Roadmap trimestral de melhorias

---

## Cronograma Proposto

1. **Semana 1 (quando dados FULL):** Coleta de dados, pré-análise
2. **Semana 2:** Auditoria multi-agentes (paralelo)
3. **Semana 3:** Compilação de resultado, roadmap

**Não iniciar auditoria até que:**
- ✅ patrimonio_financeiro > R$0
- ✅ backtest.metrics.target populado
- ✅ tax.ir_diferido > R$0
- ✅ npm run test:python passa

---

## Referências

- 1ª Auditoria: AUDITORIA-dashboard-2026-04-25.md
- Pré-análise: PRÉ-ANÁLISE-2ª-auditoria.md
- Scripts: scripts/generate_data.py, scripts/ibkr_sync.py
- Dados: agentes/contexto/carteira.md

---

**Próximo:** Obter dados IBKR real e rodar pipeline FULL.

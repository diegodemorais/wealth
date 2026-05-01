# HD-dashboard-ux: Melhorias de UX/UI e correções técnicas do Dashboard

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-dashboard-ux |
| **Dono** | Head |
| **Status** | Done |
| **Prioridade** | 🔴 Alta |
| **Participantes** | Bookkeeper, FIRE, Factor, Quant, Advocate |
| **Co-sponsor** | Bookkeeper |
| **Criado em** | 2026-04-08 |
| **Origem** | Feedback externo Comet — revisão completa do dashboard v1.3 |
| **Concluido em** | 2026-04-08 |

---

## Motivo / Gatilho

Revisão externa (Comet) do dashboard identificou pontos fortes e uma lista concreta de problemas técnicos, inconsistências numéricas e oportunidades de UX. Diego solicitou implementação imediata.

---

## Feedback Original (Comet)

### Pontos Fortes
- Foco FIRE claro: P(FIRE), anos, progresso, guardrails com números e datas concretos
- Seção "Próximas ações" converte análise em decisões com critérios objetivos
- Métricas bem escolhidas: P(FIRE) MC 10k, savings rate, TER vs VWRA, shadow portfolios
- Separação conceitual boa: acumulação, risco de sequência, fase de saque
- Notas metodológicas cuidadosas (fan chart ≠ MC individuais, haircut 58%, staleness)

### Problemas Identificados

#### Técnicos / Bugs
1. **Performance attribution: retorno USD = 0 e câmbio = 0** mas gap de fechamento de 38%
2. **Sliders de aporte/what-if: "—"** nos campos de anos até FIRE e patrimônio projetado
3. **Tabela de ETFs: Total USD/BRL = "—"**
4. **Savings rate inconsistente**: 40,3% no painel principal vs ~56% no Financial Wellness Score
5. **Financial Wellness Score**: IPCA+ gap tem peso 0% apesar de ser central; fórmula opaca

#### UX/UI
6. **Sobrecarga cognitiva**: informação crítica espalhada sem hierarquia visual forte
7. **Guardrails**: linha atual e próximo gatilho sem destaque visual de cor
8. **Rótulos técnicos**: Bollinger MA5 ± 2σ, σ poblacional, haircut 58% podem intimidar
9. **Fases aposentadoria (Go-Go/Slow-Go/No-Go)**: texto denso, deveria ser mais escaneável

---

## Escopo — Correções por Prioridade

### 🔴 P0 — Bugs que mostram dados errados/ausentes

- [x] Fix: sliders what-if calculando anos até FIRE e patrimônio (fórmula determinística) — `wiRetornoVal` bug corrigido: `(r*100).toFixed(2)` em vez de `r.toFixed(2)*100`
- [x] Fix: tabela ETFs exibindo Total USD e Total BRL — já funcionava; Total USD/BRL populado por `buildPosicoes()`
- [x] Fix: savings rate alinhado entre painel e Wellness Score — ambos usam `DATA.premissas.renda_estimada` com subtitle dinâmico
- [x] Fix: Financial Wellness Score — DCA ativo = 5pts quando taxa ≥ piso (mesmo com gap > 10pp); labels PT-BR: Crítico/Atenção/Progredindo/Excelente
- [x] Fix: attribution null — detecção de `retornoUsd === null`, mostra gráfico simplificado + aviso em vez de zeros

### 🟡 P1 — UX que melhora leitura imediata

- [x] Guardrails: linha ATUAL destacada (outline verde) + gatilho com `R$Xk (−Y%)` dinâmico
- [x] Wellness Score: top 3 ações que mais subiriam o score (com pts potenciais) abaixo do grid
- [x] Fan chart: nota "P10/P50/P90 são aproximações; P(FIRE@50) = X% calculado direto nas 10k sims MC"
- [x] Mini-log "Últimas operações" com data, ativo, valor — fonte: ibkr/aportes.json + lotes.json
- [ ] Hero strip: KPIs grandes — já existem no painel principal; reestruturação em 3 blocos → P2 (fora do escopo desta issue)
- [ ] Fases aposentadoria tabela → P2 (Advocate: 3-card grid já é escaneável para uso pessoal)
- [ ] Reorganizar 3 blocos → P2 (Advocate: estrutura atual adequada para dashboard quant pessoal)

### 🟢 P2 — Melhorias de médio prazo

- [ ] Modo "resumido" vs "avançado" (esconder Bollinger, TLH, backtests em tab)
- [ ] Performance attribution: ocultar se dados incompletos, mostrar só quando funcional (parcial: aviso já aparece)

---

## Análise dos Agentes

**Advocate** — 5/6 propostas UX do Comet rejeitadas para dashboard quant pessoal: sobrecarga cognitiva, labels técnicos, fases densas são features, não bugs. Mini-log aceito pois adiciona informação nova (histórico de trades). Reestruturação em 3 blocos: fora de escopo.

**FIRE** — Priorizou: (1) savings rate alinhado, (2) wellness DCA ativo, (3) guardrails ATUAL, (4) fan chart disclaimer, (5) fases tabela.

**Quant** — Validou fórmula `wiRetornoVal`: `r.toFixed(2)*100` é parse error (string multiplication), correto é `(r*100).toFixed(2)`.

---

## Conclusão

Todos os P0 e principais P1 implementados. Dashboard reconstruído (v1.4). Correções técnicas: 5 bugs corrigidos. UX: guardrails ATUAL, wellness actions, fan chart note, mini-log.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Código** | `dashboard/template.html` + `scripts/generate_data.py` |
| **Pipeline** | `data.json` rebuilt + `index.html` reconstruído |
| **Versão** | v1.4 (patch — fixes técnicos + UX incrementais) |
| **Bugs corrigidos** | `wiRetornoVal`, attribution null, savings rate divergência, wellness IPCA+ pts, wellness labels PT-BR |
| **Features adicionadas** | Guardrails ATUAL badge, wellness top-3 actions, fan chart pfire note, mini-log operações |

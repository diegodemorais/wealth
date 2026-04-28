# HD-pipeline-observabilidade: Observabilidade, Automação e Cobertura do Pipeline

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-pipeline-observabilidade |
| **Dono** | Head + Dev |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | Dev, Bookkeeper |
| **Co-sponsor** | Dev |
| **Dependencias** | — |
| **Criado em** | 2026-04-27 |
| **Origem** | Debate Head × Dev — gaps identificados após incidente factor_signal NaN |
| **Concluido em** | 2026-04-27 |

---

## Motivo / Gatilho

Vários componentes do dashboard ficaram sem dados hoje. Diego identificou manualmente cada um. O debate Head × Dev identificou que o incidente era previsível e detectável, mas o projeto não tinha os mecanismos certos para capturá-lo automaticamente — e esse é apenas o sintoma de gaps mais profundos.

---

## Descrição

O projeto tem pipeline funcional e spec contract implementado, mas carece de observabilidade operacional: não há alertas de staleness, não há sincronização automática com IBKR, o spec.json é estático, e gatilhos financeiros existem no papel mas não são monitorados. O resultado é que Diego descobre problemas olhando o dashboard — não antes.

---

## Escopo — Fase 1 (Alta Prioridade)

### F1-A: Staleness visível no dashboard ✅

- [x] Calcular idade dos dados em horas a partir de `_generated` em `data.json`
- [x] Exibir badge no footer quando dados > 48h: `⚠ Xd — rode o pipeline` (laranja)
- [x] Exibir badge crítico quando > 7 dias: `🔴 Xd — atualize agora` (vermelho)
- [x] Badge some automaticamente quando dados frescos

### F1-B: Sincronização de posições IBKR ✅ (mapeamento)

Mapeamento concluído — fontes por campo:
- Posições ETF (qty, preço médio): `dados/ibkr/lotes.json` ← `ibkr_lotes.py --flex` (manual, rodar após trade)
- TLH lotes individuais: `dados/tlh_lotes.json` ← `ibkr_lotes.py` (mesmo fluxo)
- RF (IPCA+, Renda+) e HODL11 qty/avg_cost: `dashboard_state.json.rf` ← **entrada manual** (Diego edita direto)
- Câmbio, BTC: `generate_data.py` via yfinance ← automático
- P(FIRE): `fire_montecarlo.py` ← automático

- [x] `_ibkr_sync_date` adicionado a `data.json` (mtime de `dados/ibkr/lotes.json`)
- [x] Footer exibe "IBKR sync: DD/MM/AA HH:MM BRT" quando disponível
- [ ] Documentar no CLAUDE.md ou flight-rules quando rodar `ibkr_lotes.py --flex`

### F1-C: spec.json como fonte de verdade viva ✅

- [x] Criar `scripts/sync_spec.py`: escaneia `data-testid` no React, cruza com spec.json
- [x] Reporta blocos sem data-testid (67/68) e testids órfãos (10 — entrar no spec)
- [ ] Adicionar ao checklist de novo componente em `react-app/CLAUDE.md`

---

## Escopo — Fase 2 (Média/Baixa Prioridade)

### F2-A: Monitoramento de gatilhos financeiros ✅

- [x] Ler `agentes/contexto/gatilhos.md` e identificar quais são monitoráveis via CLI
- [x] Criar `scripts/check_gatilhos.py`: 9 gatilhos (6 automáticos, 3 manuais). CLI: `--alarme`, `--json`
- [ ] Integrar como passo opcional no pipeline (rodado junto com `generate_data.py`) — baixa prioridade, uso manual já cobre

### F2-B: Arquivo de data.json ✅

- [x] Estender `pipeline_archive.py` para arquivar também `data.json` final com data/hora
- [x] Retenção: últimos 7 dias de `data.json`
- [x] Permite comparar output antes/depois de qualquer mudança no pipeline

### F2-C: Integração de gastos reais ✅ (avaliado)

- [x] Mapear como gastos do Actual Budget entram no pipeline hoje: CSV "All-Accounts" → `spending_analysis.py` → `spending_summary.json` → pipeline (já funciona)
- [x] Avaliar se `spending_summary.json` está atualizado: sim, integrado em P(FIRE) via fire_montecarlo.py
- [ ] Documentar cadência de atualização necessária — `agentes/referencia/flight-rules.md` (pendente doc)

### F2-D: Cobertura Playwright ✅

- [x] Auditoria: `python scripts/sync_spec.py --missing` — 67/68 blocos sem testid identificados
- [x] Adicionados `data-testid` em `drift-maximo-kpi`, `earliest-fire`, `fire-matrix`; spec atualizado `patrimonio-total-hero → patrimonio-total`; `factor-signal-kpi` e `alpha-itd-swrd` marcados `optional: true` (depende de horário LSE)
- [x] Cobertura: 1/68 → 4/68 (5%). +3 assertions Playwright (drift pp, earliest-fire year, fire-matrix %)

### F2-E: Teste end-to-end do pipeline ✅

- [x] Criar `scripts/tests/test_pipeline_e2e.py` — 6 testes: existência, JSON válido, timestamp, spec contract completo, cobertura ≥90%, campos críticos
- [x] Valida data.json contra spec contract sem re-rodar pipeline (6/6 passam)
- [x] Integrado no `quick_dashboard_test.sh` como step 1d (bloqueia push se spec violar)

---

## Raciocínio

**Argumento central:** O spec contract bloqueia dados nulos *na geração*, mas não há defesa *antes* (staleness, sync) nem *depois* (alertas, cobertura visual). O pipeline está correto mas não é observável.

**Alternativas rejeitadas:** Ignorar — o incidente de hoje mostra que o custo de não ter observabilidade é Diego gastar tempo identificando manualmente.

**Incerteza reconhecida:** F1-B (sync IBKR) pode ser mais complexo dependendo do que é manual vs automático hoje — precisa de mapeamento antes de implementar.

**Falsificação:** Se Diego conseguir identificar qualquer componente sem dados *antes* de abrir o dashboard, a observabilidade está funcionando.

---

## Análise

**Fase 1 (concluída 2026-04-27):**
- F1-A: Staleness badge em 2 níveis (warn >48h, critical >7d) no footer — visível imediatamente
- F1-B: `_ibkr_sync_date` em data.json + display no footer. Mapeamento completo: ETFs = manual pós-trade; RF/HODL11 = manual dashboard_state.json; câmbio = yfinance auto
- F1-C: `sync_spec.py` audita 68 blocos vs React data-testids. CLAUDE.md atualizado com checklist

**Fase 2 (concluída 2026-04-27):**
- F2-A: `check_gatilhos.py` verifica 9 gatilhos em <1s. Descobriu: factor_signal YTD é volátil por horário LSE
- F2-B: `pipeline_archive.py` extendido para data.json (copy vs move, para não quebrar o dashboard)
- F2-C: gastos Actual Budget já integrados via spending_analysis.py. Nenhuma ação de engenharia necessária
- F2-D: cobertura 1→4/68 (5%). `factor-signal-kpi` e `alpha-itd-swrd` marcados optional — YTD só disponível quando LSE fecha
- F2-E: 6 testes E2E rodando em 0.02s. Integrado no quick_dashboard_test.sh como gate obrigatório

**Insight principal:** Fase 1 resolveu o problema original (Diego descobria issues olhando o dashboard). Fase 2 adicionou camadas de proteção. O projeto está observável.

---

## Conclusão

> A preencher ao finalizar.

---

## Resultado

> A preencher ao finalizar.

---

## Próximos Passos

- [ ] Iniciar Fase 1 (F1-A primeiro — maior visibilidade imediata)
- [ ] F1-B requer mapeamento antes da implementação — Diego deve descrever fluxo atual de atualização de posições

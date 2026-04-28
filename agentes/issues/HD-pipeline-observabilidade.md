# HD-pipeline-observabilidade: Observabilidade, Automação e Cobertura do Pipeline

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | HD-pipeline-observabilidade |
| **Dono** | Head + Dev |
| **Status** | Doing |
| **Prioridade** | Alta |
| **Participantes** | Dev, Bookkeeper |
| **Co-sponsor** | Dev |
| **Dependencias** | — |
| **Criado em** | 2026-04-27 |
| **Origem** | Debate Head × Dev — gaps identificados após incidente factor_signal NaN |
| **Concluido em** | — |

---

## Motivo / Gatilho

Vários componentes do dashboard ficaram sem dados hoje. Diego identificou manualmente cada um. O debate Head × Dev identificou que o incidente era previsível e detectável, mas o projeto não tinha os mecanismos certos para capturá-lo automaticamente — e esse é apenas o sintoma de gaps mais profundos.

---

## Descrição

O projeto tem pipeline funcional e spec contract implementado, mas carece de observabilidade operacional: não há alertas de staleness, não há sincronização automática com IBKR, o spec.json é estático, e gatilhos financeiros existem no papel mas não são monitorados. O resultado é que Diego descobre problemas olhando o dashboard — não antes.

---

## Escopo — Fase 1 (Alta Prioridade)

### F1-A: Staleness visível no dashboard

- [ ] Calcular idade dos dados em horas a partir de `_generated` em `data.json`
- [ ] Exibir badge no footer quando dados > 48h: `⚠ Dados desatualizados (Xd)`
- [ ] Exibir badge crítico quando > 7 dias: `🔴 Dados muito antigos`
- [ ] Badge some automaticamente quando dados frescos

### F1-B: Sincronização de posições IBKR

- [ ] Mapear quais campos de `dashboard_state.json` vêm de `ibkr_lotes.py --flex` vs entrada manual
- [ ] Documentar o fluxo atual e identificar o que pode ser automatizado
- [ ] Integrar `ibkr_lotes.py` no fluxo padrão de execução do pipeline (ou documentar quando rodar)
- [ ] Adicionar timestamp de última sincronização IBKR no dashboard

### F1-C: spec.json como fonte de verdade viva

- [ ] Criar `scripts/sync_spec.py`: escaneia componentes React com `data-testid` e cruza com spec.json
- [ ] Script avisa se componente novo não tem entrada no spec.json
- [ ] Adicionar ao checklist de novo componente em `react-app/CLAUDE.md`

---

## Escopo — Fase 2 (Média/Baixa Prioridade)

### F2-A: Monitoramento de gatilhos financeiros

- [ ] Ler `agentes/contexto/gatilhos.md` e identificar quais são monitoráveis via CLI (`market_data.py`, `ibkr_lotes.py`)
- [ ] Criar `scripts/check_gatilhos.py`: verifica gatilhos de nível Alarme e imprime status
- [ ] Integrar como passo opcional no pipeline (rodado junto com `generate_data.py`)

### F2-B: Arquivo de data.json

- [ ] Estender `pipeline_archive.py` para arquivar também `data.json` final com data/hora
- [ ] Retenção: últimos 7 dias de `data.json`
- [ ] Permite comparar output antes/depois de qualquer mudança no pipeline

### F2-C: Integração de gastos reais

- [ ] Mapear como gastos do Actual Budget entram no pipeline hoje
- [ ] Avaliar se `spending_summary.json` está atualizado e sendo usado no P(FIRE)
- [ ] Documentar cadência de atualização necessária

### F2-D: Cobertura Playwright

- [ ] Auditar quais campos críticos do spec.json (por tab) não têm `data-testid`
- [ ] Priorizar NOW e FIRE tab — maior impacto para Diego
- [ ] Adicionar `data-testid` + assertion Playwright nos top 10 campos descobertos

### F2-E: Teste end-to-end do pipeline

- [ ] Criar `scripts/tests/test_pipeline_e2e.py` com dados sintéticos mínimos
- [ ] Valida que `generate_data.py` roda sem erro e gera `data.json` com spec contract OK
- [ ] Integrar no `quick_dashboard_test.sh`

---

## Raciocínio

**Argumento central:** O spec contract bloqueia dados nulos *na geração*, mas não há defesa *antes* (staleness, sync) nem *depois* (alertas, cobertura visual). O pipeline está correto mas não é observável.

**Alternativas rejeitadas:** Ignorar — o incidente de hoje mostra que o custo de não ter observabilidade é Diego gastar tempo identificando manualmente.

**Incerteza reconhecida:** F1-B (sync IBKR) pode ser mais complexo dependendo do que é manual vs automático hoje — precisa de mapeamento antes de implementar.

**Falsificação:** Se Diego conseguir identificar qualquer componente sem dados *antes* de abrir o dashboard, a observabilidade está funcionando.

---

## Análise

> A preencher conforme execução das fases.

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

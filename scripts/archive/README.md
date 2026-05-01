# scripts/archive/ — Scripts Arquivados

Scripts sem referência ativa no pipeline (generate_data.py) ou em outros scripts de produção.
Movidos em 2026-05-01 como parte da auditoria arquitetural XX-system-audit.

## Critério de arquivamento

- Zero referências em `generate_data.py`
- Zero referências em outros scripts Python de produção
- Não é engine/biblioteca importada (não é AUXILIAR)
- Não é CLI tool documentado em scripts/CLAUDE.md ou CLAUDE.md raiz

## Scripts arquivados

| Script | Motivo |
|--------|--------|
| `binance_parse_pdf.py` | Parser de PDF Binance — funcionalidade absorvida por `binance_analysis.py` |
| `fire_glide_path_scenarios.py` | Exploração de cenários glide path — standalone, não integrado ao pipeline |
| `parse_issues.py` | Parser de issues — substituído por fluxo manual de issues em `agentes/issues/` |
| `historico_patrimonio.py` | Script de histórico — funcionalidade absorvida por `reconstruct_history.py` |
| `ibkr_posicoes_sync.py` | Sync IBKR posições — funcionalidade absorvida por `ibkr_sync.py` |
| `load_ibkr_posicoes.py` | Carregador IBKR — substituído por `ibkr_lotes.py` |
| `p4_patch_generator.py` | Gerador de patches P4 — projeto arquitetural concluído (HD-ARCHITECT-P4) |
| `p4_suggestion_engine.py` | Motor de sugestões P4 — idem acima |
| `validate_changelog_registration.py` | Validador de changelog — CI sem uso ativo |

## Como restaurar

```bash
mv scripts/archive/<script>.py scripts/<script>.py
git add scripts/archive/<script>.py scripts/<script>.py
git commit -m "chore: restaurar <script> do archive"
```

## Scripts preservados (não arquivados)

Scripts com 0 refs em generate_data.py mas mantidos por outras razões:

| Script | Razão |
|--------|-------|
| `brfiresim.py` | Feature planejada (HD-gaps-aposenteaos40-spec.md) — não integrado ainda |
| `btc_indicators.py` | Gerou `btc_indicators.json`; potencial uso futuro |
| `portfolio_analytics.py` | CLI analytics extenso (TWR, frontier, stress) — usado por Diego diretamente |
| `multi_llm_query.py` | Obrigatório para decisões >5% portfolio (CLAUDE.md) |
| `checkin_mensal.py` | CLI check-in mensal com shadows A/B/C — documentado em scripts/CLAUDE.md |
| `check_gatilhos.py` | CLI monitoring de gatilhos |
| `ci_check_carteira_params.py` | CI pre-check (HD-ARCHITECT-P2) |
| `data_pipeline_engine.py` | Arquitetura futura de pipeline centralizado — referenciado em testes |
| `sync_spec.py` | Sync spec.json — referenciado em CLAUDE.md |
| `validate_schema.py` | Validador de contrato spec.json ↔ data.json |
| `validate_data.py` | Validador básico de data.json para CI |
| `validators.py` | Framework de validação importado por data_pipeline_engine.py |
| `snapshot_schemas.py` | Schemas de snapshots importados por data_pipeline_engine.py |
| `snapshot_archive.py` | Gerenciamento de archive de snapshots — utilitário de manutenção |
| `resampled_frontier.py` | Michaud Resampled Frontier — documentado em scripts/CLAUDE.md |
| `pipeline_archive.py` | Gerencia arquivo de snapshots >7 dias |
| `tlh_monitor.py` | Monitor TLH — CLI standalone para análise de oportunidades TLH |
| `fetch_historico_sheets.py` | Fonte primária de dados para reconstruct_history.py |
| `factor_regression.py` | Regressão Fama-French — CLI standalone |
| `ibkr_posicoes_sync.py` | Substituído mas mantido para compatibilidade |
| `binance_analysis.py` | Valoriza posições Binance — referenciado por binance_parse_pdf |

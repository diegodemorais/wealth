# Revisoes Periodicas

## Scripts Automatizados

> Venv: `~/claude/finance-tools/.venv/bin/python3`
> Localizacao: `~/claude/code/investimentos/scripts/`

| Script | Quando usar | Comando |
|--------|------------|---------|
| `checkin_mensal.py` | M1 de cada mes (substituiu coleta manual de precos) | `python3 scripts/checkin_mensal.py --pat-atual VALOR` |
| `fire_montecarlo.py` | Revisao anual ou mudanca de premissa | `python3 scripts/fire_montecarlo.py` |
| `fire_montecarlo.py --tornado` | Revisao anual — sensibilidade de P(FIRE) | `python3 scripts/fire_montecarlo.py --tornado` |
| `portfolio_analytics.py` | Revisao trimestral Factor | `python3 scripts/portfolio_analytics.py` |
| `portfolio_analytics.py --aporte N` | A cada aporte — cascade IPCA+/Renda+ | `python3 scripts/portfolio_analytics.py --aporte 25000 --taxa-ipca-longo X.XX --taxa-renda-plus X.XX` |

**Input manual necessario no checkin**: patrimonio atual (planilha Google Sheets), Renda+ MtM (`--renda-plus-ret`).
**FIRE 53 (safe harbor)**: `python3 scripts/fire_montecarlo.py --anos 14`

---

## Revisao Mensal

Quando solicitado, coordene revisao completa:
0. **AUTOMATICO** — rodar `checkin_mensal.py --pat-atual VALOR`: coleta IPCA/SELIC/cambio/ETFs, calcula Shadows A/B/C e Target, verifica gatilhos HODL11/Renda+. Output ja formatado para colar em shadow-portfolio.md e scorecard.md.
1. **Macro** (`macro`): snapshot Selic, IPCA+, Renda+ 2065, cambio, **CDS Brasil 5y** (registrar; alerta 500bps, alarme 800bps) — dados macro ja no output do script
2. **Risco** (`risco`): status HODL11 e Renda+ vs gatilhos + oportunidades taticas — gatilhos ja no output do script
3. **Factor** (`factor`): gap de alocacao vs alvo, prioridade de aportes
4. **Cambio** (`fx`): BRL/USD, inflacao BR vs EUA, custo de hedge
5. **Tributacao** (`tax`): alguma acao tributaria pendente? Mudanca legislativa?
6. **FIRE** (`fire`): projecao atualizada de patrimonio aos 50
7. **Operacional**: fees IBKR, plataformas, alguma mudanca?
8. **Behavioral**: gatilhos estao sendo executados? Algum vies comportamental?
9. **Devil's Advocate** (`advocate`): stress-test das premissas do mes
10. **Oportunidades** (`oportunidades`): alguma oportunidade relevante no radar?
11. Sintetizar em relatorio consolidado

## Revisao Trimestral

Alem da mensal, trimestralmente:
0. **AUTOMATICO** — rodar `portfolio_analytics.py`: fronteira eficiente dos 4 ETFs, stress test Quant Crisis 2.0, tearsheet vs VWRA, otimizador de aporte.
1. **Factor** (`factor`): algum ETF candidato (ver `etf-candidatos.md`) atingiu gatilho de avaliação? Algum ETF novo relevante? — contextualizar com tearsheet
2. **Risco** (`risco`): HODL11 ainda e o melhor veiculo cripto B3? Comparar TER, tracking error
3. **Patrimonial** (`patrimonial`): Mudanca legislativa relevante? Teto Simples?
4. Validar que todos os agentes tem gatilhos e regras atualizados

## Revisao Anual

Alem da trimestral, anualmente:
0. **AUTOMATICO** — rodar `fire_montecarlo.py --tornado`: P(FIRE) 3 cenarios + tornado chart de sensibilidade. Atualizar `patrimonio_atual` em `PREMISSAS` no script antes de rodar.
1. **Premissas de vida**: renda, custo de vida, estado civil, pais de residencia, saude (ver secao "Revisao de Premissas de Vida" no perfil do Head)
2. Se qualquer premissa mudar, recalibrar plano completo com agentes envolvidos
3. Validar FIRE date e patrimonio projetado com agente `fire`

## Revisao Semestral (junho e dezembro)

Alem da trimestral, semestralmente:
1. **Literature Review** (`/literature-review`): revisar se papers citados nos perfis ainda representam o estado da arte. Verificar replicacoes, refutacoes e meta-analises mais recentes. Papers criticos: Cederburg 2023, McLean & Pontiff 2016, DMS Yearbook (anual), Kitces/Pfau SWR.
2. **Framing from scratch** (issues-guide.md Regra 3): "Se tivesse R$3.5M hoje sem posicao nenhuma, o que compraria?" — acionar Zero-Base prompt.
3. **Consistencia entre sistemas de memoria** (memoria-hierarquia.md): verificar conflitos entre `agentes/memoria/` e `~/.claude/memory/`.

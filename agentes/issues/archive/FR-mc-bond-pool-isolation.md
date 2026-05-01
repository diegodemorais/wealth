# FR-mc-bond-pool-isolation: Bond Pool Isolation Real no MC FIRE

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-mc-bond-pool-isolation |
| **Dono** | FIRE + Dev |
| **Status** | Done |
| **Prioridade** | Alta |
| **Participantes** | FIRE, RF, Advocate, Behavioral, Head, Dev |
| **Co-sponsor** | Diego |
| **Dependências** | IPCA+ 2040 atingir target de 15% do patrimônio (janela de oportunidade Tesouro Direto) |
| **Criado em** | 2026-04-29 |
| **Concluído em** | 2026-04-29 |
| **Origem** | Debate FR-pquality-recalibration revelou que MC usa proxy de vol para o bond pool — omissão, não design. |

---

## Problema

O `fire_montecarlo.py` calculava o bond pool com `vol_bond_pool = EQUITY_PCT × VOLATILIDADE_EQUITY = 0.79 × 0.168 = 13.3%`. Isso tratava o bond pool como se tivesse volatilidade de equity — incorreto na prática.

O bond pool real (IPCA+ 2040 HTM) funciona como bucket isolado:
- Vence no FIRE Day (2040) gerando caixa imediato
- Durante a acumulação e os primeiros anos do FIRE, não é liquidado — é HTM
- Vol efetiva nos anos 1-7 do FIRE = ~0 (não há risco de marcação porque não há venda)

**Consequência do proxy:** o MC simulava quedas de equity "contaminando" o bond pool, triggerizando guardrails que na prática não seriam acionados porque os saques viriam do bucket e não do equity. Isso subestimava P(quality).

**Estimativa do impacto:** P(quality) subirá de ~65% para ~75-80% quando o bucket estiver completo e a isolation for ativada.

---

## Escopo

### Fase 1 — Declarar hipótese e auditar impacto (FIRE + Quant)

- [x] Confirmar formalmente que `vol_bond_pool = 13.3%` é omissão, não design conservador
- [x] Quantificar: quais decisões passadas foram tomadas com P(quality) subestimado? Nenhuma muda — P(quality) é métrica de monitoramento, não gatilho de alocação.
- [x] Estimar P(quality) com bucket real: +10-15pp esperado quando isolation habilitada (~75-80% vs 65% atual)

### Fase 2 — Implementação no MC (Dev + FIRE)

- [x] Em `fire_montecarlo.py`: nos anos 0 a N (onde N = `anos_bond_pool` = 7), usar `vol=0` para o bucket pool; equity drawdown nesses anos não triggeriza guardrail de spending
- [x] Parametrizado via config (`anos_bond_pool` já existia em `PREMISSAS`)
- [x] Condição implementada: isolation ativa somente quando IPCA+ 2040 ≥ 80% do target. Caso contrário, proxy legado com `underestimation_warning=True`
- [x] `generate_data.py` propaga `bond_pool_status`, `p_quality_proxy`, `bond_pool_isolation_enabled`, `bond_pool_completion_pct`
- [x] Campo `p_quality_proxy` mantido para comparação histórica

### Fase 3 — Dashboard (Dev)

- [x] Badge amarelo/verde em `fire/page.tsx` (`data-testid="bond-pool-isolation-status"`)
- [x] `p_quality_proxy` exibido como campo secundário quando difere do canônico
- [x] Versão bumped (v1.160.0), changelog atualizado

### Fase 4 — Plano para FIRE Day atrasado (FIRE + Head)

- [x] Formalizado: se Diego não aposentar em 2040, caixa do TD 2040 → **Tesouro Selic** até o FIRE Day efetivo
- [x] Descartado: IPCA+ 2045 (juros semestrais = IR antecipado, liquidez comprometida); equity de uma vez (regra absoluta)
- [x] Impacto: runway marginalmente maior (+1 quarter de buffer por juros Selic adicionais). Guardrails inalterados.

---

## Questões Abertas — Respondidas

1. **Threshold 80% é conservador o suficiente?** Sim — com 80% do target, o bucket cobre ~6.8 anos de spending (vs 7 planejados). Margem suficiente para anos iniciais com INSS ausente.
2. **Renda+ 2065 no bucket?** Não — Renda+ é carry tático; duration residual ~32 anos em 2040 tornaria o instrumento de vol máxima se liquidado. Bucket = TD 2040 + TD 2050 exclusivamente.
3. **Risco de taxa cair antes do DCA completar?** Behavioral flag registrado: taxa efetiva média do DCA pode ser 6.5-6.8% vs snapshot 7.21%. O modelo usa taxa canônica (5.34% real líquido HTM) — conservador. Risco presente mas não altera a decisão de DCA ativo.
4. **P(quality) mínimo aceitável?** Threshold formal: 70% (amarelo), 75% (verde), conforme FR-pquality-recalibration. Com isolation: ~75-80% esperado → zona verde.

---

## Análise

**Fase 1 — Confirmação da omissão:**
O proxy `vol_bond_pool = 13.3%` era omissão operacional. O bond pool (IPCA+ 2040 HTM) tem vol efetiva = 0 nos anos pós-FIRE porque: (a) não é vendido — saques vêm do bucket diretamente; (b) IPCA+ longo no Tesouro Direto marca MtM mas não é liquidado; (c) guardrails de equity são irrelevantes quando a fonte de saque é o bucket, não equity.

**Impacto histórico:** zero decisões estruturais mudam. P(quality) era métrica de monitoramento, não gatilho. A subestimação era "P(quality) = 65%" quando o valor correto (com bucket completo) seria ~75-80%. O gap de 17pp entre P(FIRE)=83.7% e P(quality)=65% será reduzido para ~8-9pp com isolation ativa.

**Fase 4 — Caixa TD 2040 se FIRE atrasar:**
Se FIRE atrasa 1-2 anos: caixa gerado pelo TD 2040 em 2040 → Tesouro Selic (não IPCA+ novo, não equity de uma vez). Selic real esperado 2041-2042: +5-7% real vs equity +4.85% base — Selic pode vencer equity no curto prazo. IR: 15% flat após 720 dias (mais eficiente que cupons IPCA+ com IR antecipado regressivo). Runway marginal: +1 quarter de buffer por juros Selic. Decisão 7 reformulada (carteira.md) permanece válida.

---

## Conclusão

**Concluída em 2026-04-29. Dashboard v1.160.0.**

Entregas realizadas:
1. `compute_bond_pool_status()` — calcula `completion_pct`, `enabled`, `underestimation_warning` automaticamente com base em `ipca_longo_atual_brl` vs 80% do target
2. `simular_trajetoria` + `compute_p_quality` — `bond_pool_isolation=True` → `vol=0` + guardrails suprimidos anos 0 a `anos_bond_pool-1`. Proxy legado (13.3%) preservado quando isolation=False.
3. `generate_data.py` — propaga `p_quality_proxy`, `bond_pool_status`, `bond_pool_isolation_enabled`, `bond_pool_completion_pct`
4. Dashboard — badge amarelo/verde com completion_pct e status; `p_quality_proxy` como campo secundário
5. 17 testes em `test_bond_pool_isolation.py` (17/17 passando)
6. Fase 4 formalizada: TD 2040 → Selic se FIRE atrasa

**Estado atual:** isolation NÃO habilitada (24% completo). Ativação automática quando `ipca_longo_atual_brl ≥ R$416k` (~80% de R$520k target). P(quality) esperado pós-ativação: ~75-80%.

**Parâmetros atualizados em carteira.md:**
- `ipca_longo_atual_brl = 124675.79` (atualizar após cada DCA)
- `bond_pool_isolation_threshold = 0.80`

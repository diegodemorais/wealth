# FR-mc-bond-pool-isolation: Bond Pool Isolation Real no MC FIRE

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-mc-bond-pool-isolation |
| **Dono** | FIRE + Dev |
| **Status** | Backlog |
| **Prioridade** | Alta |
| **Participantes** | FIRE, RF, Advocate, Head |
| **Co-sponsor** | Diego |
| **Dependências** | IPCA+ 2040 atingir target de 15% do patrimônio (janela de oportunidade Tesouro Direto) |
| **Criado em** | 2026-04-29 |
| **Origem** | Debate FR-pquality-recalibration revelou que MC usa proxy de vol para o bond pool — omissão, não design. |

---

## Problema

O `fire_montecarlo.py` calcula o bond pool com `vol_bond_pool = EQUITY_PCT × VOLATILIDADE_EQUITY = 0.79 × 0.168 = 13.3%`. Isso trata o bond pool como se tivesse volatilidade de equity — o que não é verdade na prática.

O bond pool real (IPCA+ 2040 HTM) funciona como bucket isolado:
- Vence no FIRE Day (2040) gerando caixa imediato
- Durante a acumulação e os primeiros anos do FIRE, não é liquidado — é HTM
- Vol efetiva nos anos 1-7 do FIRE = ~0 (não há risco de marcação porque não há venda)

**Consequência do proxy:** o MC simula quedas de equity "contaminando" o bond pool, triggerizando guardrails que na prática não seriam acionados porque os saques viriam do bucket e não do equity. Isso subestima P(quality).

**Estimativa do impacto:** RF e FIRE estimam +10-15pp em P(quality) com bucket isolation real (conservative). Sem desconto de conservadorismo, o teto seria ~85.9%. Estimativa operacional: P(quality) subiria de 65.3% para ~75-80%.

**Dependência crítica:** o bucket só existe na prática se o DCA em IPCA+ 2040 for concluído. Posição atual: ~R$212k (~6.1% do portfólio). Target: 15% = ~R$520k. Gap: ~R$308k (59% do target). O MC corrigido só reporta o número real quando o bucket estiver materialmente construído — caso contrário, o número corrigido é otimismo prematuro.

---

## Contexto do Debate (2026-04-29)

**FIRE:** bond pool HTM não é vendido nos anos 1-7 do FIRE. O MC simula vol nesses anos via proxy — o que produz guardrail triggers que não ocorreriam. A correção é: nos anos 1-N do FIRE (onde N = anos cobertos pelo bond pool), saques vêm exclusivamente do bucket com vol=0; equity drawdown nesses anos não triggeriza quality cut.

**RF:** o TD 2040 vencendo no FIRE Day é o instrumento certo. Com bucket de R$1.73M (target 15% de R$11.5M P50), cobertura de 7 anos de spending cheio (7 × R$242k = R$1.694M) com folga de 2%. Renda+ 2065 é carry tático, não bucket — duration residual de 32 anos em 2040 tornaria o Renda+ um instrumento de vol máxima se precisasse ser liquidado no FIRE Day.

**Advocate (stress-test):**
- O bond pool está 59% abaixo do target hoje. Para FIRE aspiracional 2035, o bucket seria ~R$350-400k — cobre ~1.5 anos, não 7. O MC corrigido assume bucket completo; a realidade é DCA progressivo.
- Hipótese A vs B: o proxy foi omissão (A) ou lower bound conservador (B)? O time declarou que é omissão (A). Portanto, decisões tomadas com P(quality) baseado no proxy precisam ser revisadas à luz do número corrigido — mas sem assumir que 75-80% é garantido enquanto o bucket não estiver construído.
- Se o FIRE Day atrasar para 2041-2042: o TD 2040 vence em 2040 e gera caixa. O plano deve incluir o que fazer com esse caixa se Diego ainda não aposentou. Resposta provisória da Diego: o reinvestimento seria em IPCA+ mais curto ou Selic até o FIRE Day — mas isso não está formalizado.

**Behavioral:** presente bias na construção do bucket — a taxa de 7.21% bruto que justifica o DCA hoje pode cair em compras futuras (risco de taxa caindo antes do target ser atingido). O DCA progressivo compra a taxas diferentes; a taxa efetiva média do bucket pode ser 6.5-6.8%, não 7.21%.

**Diego (clarificações):**
- A dependência do bond pool é a janela de oportunidade no IPCA+ (Tesouro Direto) — taxa atual 7.21% é favorável, DCA ativo é a política correta.
- Não há cenário "aspiracional + filho" — são dimensões separadas.
- IPCA+ tem prioridade sobre aportes em SWRD. Quando o target do bond pool for atingido, aportes equity retornam para SWRD (glide path AVGS 30%→15% entra na evolução nesse momento).

---

## Escopo

### Fase 1 — Declarar hipótese e auditar impacto (FIRE + Quant)

- [ ] Confirmar formalmente que `vol_bond_pool = 13.3%` é omissão, não design conservador
- [ ] Quantificar: quais decisões passadas foram tomadas com P(quality) subestimado? Alguma mudaria com P(quality) corrigido?
- [ ] Estimar P(quality) com bucket real para: solteiro 53, solteiro 50, casado 53, casado+filho 53

### Fase 2 — Implementação no MC (Dev + FIRE)

- [ ] Em `fire_montecarlo.py`: nos anos 0 a N (onde N = `anos_bond_pool` = 7 por padrão), usar `vol=0` para o bucket pool; equity drawdown nesses anos não triggeriza guardrail de spending
- [ ] Parametrizar N via config (`anos_bond_pool` já existe em `PREMISSAS`)
- [ ] Condição: implementar somente quando posição IPCA+ 2040 ≥ 80% do target (evitar otimismo prematuro com bucket incompleto). Caso contrário, usar proxy atual com aviso de underestimation.
- [ ] Atualizar `generate_data.py` para propagar o novo P(quality) corrigido
- [ ] Manter campo `p_quality_proxy` (valor antigo) para comparação histórica

### Fase 3 — Dashboard (Dev)

- [ ] Exibir P(quality) corrigido como valor principal quando bucket ≥ 80% do target
- [ ] Badge indicando status do bucket: "Bond pool X% completo — P(quality) pode ser otimista"
- [ ] Atualizar spec.json e Playwright tests

### Fase 4 — Plano para FIRE Day atrasado (FIRE + Head)

- [ ] Formalizar o que acontece com o caixa do TD 2040 se Diego não aposentar em 2040
- [ ] Opções: IPCA+ 2045, Selic, LFT — avaliar custo de oportunidade e impacto no bucket para os anos pós-2040

---

## Questões Abertas

1. O threshold de 80% do target para "habilitar" bucket real no MC é conservador o suficiente? Ou usar 100%?
2. O Renda+ 2065 deve ter algum papel no bucket ou permanece exclusivamente como carry tático?
3. Como modelar o risco de taxa cair antes do DCA completar? (taxa efetiva média do DCA vs snapshot atual de 7.21%)
4. Qual o P(quality) mínimo aceitável como threshold de monitoramento? 70%? 75%? Ainda não definido formalmente.

---

## Análise

> A preencher na execução da Fase 1.

---

## Conclusão

> A preencher após implementação e validação.

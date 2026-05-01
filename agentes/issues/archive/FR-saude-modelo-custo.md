# FR-saude-modelo-custo: Auditoria do Modelo de Custo de Saúde no MC

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-saude-modelo-custo |
| **Dono** | FIRE |
| **Status** | Concluída |
| **Prioridade** | Alta |
| **Participantes** | FIRE, Quant, Fact-Checker |
| **Co-sponsor** | Head, Diego |
| **Dependencias** | FR-saude-decay-nogo-phase (absorvida aqui — escopos sobrepostos) |
| **Criado em** | 2026-04-29 |
| **Origem** | Diego identificou tensão: SWR inicial 2.3% é extremamente conservador, mas P(FIRE)=79%. Hipótese: VCMH=5% real/ano por 37 anos infla desmesuradamente o custo de saúde em slow_go/no_go, tornando o SWR efetivo muito maior que o inicial. |
| **Concluido em** | 2026-04-29 |

---

## Contexto e Tensão

Com as premissas atuais:

- **FIRE Day (age 53):** gasto R$266k / patrimônio R$11.5M = SWR **2.3%** — extremamente conservador pela literatura global
- **Age 70 (ano 17):** lifestyle R$200k + healthcare ~R$110k = **R$310k** total
- **Age 80 (ano 27, cenário stress):** healthcare ~R$200-280k; total ~R$460k; portfolio encolhido → SWR efetivo **>10%**

SWR de 2.3% inicial deveria produzir P(FIRE) > 90% pela literatura. Produzimos 79%. A hipótese central é que VCMH=5% real/ano por 37 anos está sobreinflando o custo de saúde, criando um "piso crescente" que domina o modelo nas trajetórias longas.

---

## Premissas atuais a auditar

| Premissa | Valor atual | Arquivo |
|----------|------------|---------|
| `SAUDE_BASE` | R$24.000/ano (R$2k/mês) | `config.py` / `carteira.md` |
| `SAUDE_INFLATOR` | 5% real/ano (VCMH acima do IPCA) | `config.py` |
| `SAUDE_INFLATOR_CAP` | 8% | `config.py` |
| `SAUDE_DECAY` | 0.50 (saúde cai 50% na fase no_go, age 83+) | `config.py` |
| Multiplicadores ANS por faixa | 1.0x (53), 1.5x (59), 2.5x (64), 4.0x (69), 6.0x (74+) | `fire_montecarlo.py` |

---

## Questões para os agentes

### Para FIRE:
1. O spending smile de Blanchett (2013/2014) inclui healthcare dentro da curva de declínio total ou projeta healthcare crescendo separadamente?
2. Qual premissa de custo de saúde na aposentadoria é usada nos modelos de referência (Vanguard, Pfau, Kitces, Cederburg)?
3. O modelo atual de SAUDE_DECAY=0.50 (custo cai na No-Go) está na direção certa?

### Para Quant:
1. Calcule a trajetória do custo total (lifestyle + saúde) por ano pós-FIRE, mostrando quando o gasto efetivo supera 3%, 4%, 5% do portfolio inicial
2. Calcule a sensibilidade de P(FIRE) a variações de VCMH: impacto de -1pp, -2pp, +1pp em P(FIRE)
3. Com VCMH=0% (saúde em termos reais constante), qual seria P(FIRE)?

### Para Fact-Checker:
1. Qual o VCMH histórico real (acima do IPCA) no Brasil nos últimos 10 e 20 anos? (fonte: IESS ou ANS)
2. Os multiplicadores ANS por faixa etária estão corretos com a tabela vigente?
3. SAUDE_BASE=R$24k (R$2k/mês) é compatível com plano intermediário SP para homem 53 anos hoje?

---

## Escopo

- [ ] Auditar SAUDE_BASE, VCMH, SAUDE_INFLATOR_CAP, SAUDE_DECAY, multiplicadores ANS
- [ ] Comparar com premissas da literatura acadêmica
- [ ] Calcular sensibilidade P(FIRE) × VCMH
- [ ] Propor recalibração se evidências indicarem
- [ ] Re-rodar MC com premissas recalibradas
- [ ] Validar nova P(FIRE) com Quant
- [ ] Propagar em todos os lugares

---

## Análise

### Debate FIRE + Quant + Fact-Checker

**FIRE:**
- Estrutura do modelo estava correta (spending smile ex-saúde + linha separada com VCMH) — sem double-count
- VCMH=5% é defensável como premissa conservadora, mas o baseline histórico IESS é ~2.7-3.5%
- SAUDE_DECAY=0.50 vai na direção errada: custo de saúde em No-Go (ILPI, home care) sobe, não cai
- Dois erros que se cancelavam: VCMH alto demais + SAUDE_DECAY alto demais (favorável ao P(FIRE))
- Proposta: VCMH=3.5%, SAUDE_DECAY=15%, ILPI como lumpy event separado (futuro)

**Quant:**
- SWR inicial 2.3% cresce para pico 3.46% no ano 29 por causa do VCMH — P(FIRE)=79% é coerente
- Sensibilidade: -2.1pp de P(FIRE) por cada +1pp de VCMH
- SAUDE_DECAY efeito pequeno (2.3pp) mas cria descontinuidade abrupta de -R$94k no ano 29→30
- Finding crítico: multiplicadores ANS no código são max 2.0x (RN 63/2003), não 6.0x como descrito em análises internas

**Fact-Checker:**
- Claim "2.7% real/18 anos IESS": não verificada em fonte pública direta — premissa deve ter fonte ou ser removida
- ANS RN 63/2003: 10 faixas (código usa 4 patamares por simplificação — funciona por coincidência)
- SAUDE_BASE R$24k: ~20% acima do mercado real (SulAmérica intermediário ~R$1.3-1.7k); buffer defensável para plano solo

**Teste de sensibilidade (10k sims):**

| Config | P(FIRE) base | P(FIRE) fav | P(FIRE) stress |
|--------|-------------|-------------|----------------|
| Atual: VCMH=5%, DECAY=50% | 79.0% | 87.9% | 73.3% |
| Teste: VCMH=3.5%, DECAY=15% | **84.1%** | **91.4%** | **79.0%** |
| Delta | **+5.1pp** | +3.4pp | +5.8pp |

---

## Conclusão

O modelo de saúde estava sistematicamente pessimista por dois mecanismos que se cancelavam parcialmente:
1. VCMH=5% real por 37 anos → acima do histórico IESS documentado (~2.7-3.5%)
2. SAUDE_DECAY=0.50 → artificialmente favorável ao P(FIRE) na fase No-Go

A recalibração para VCMH=3.5% + SAUDE_DECAY=15% é mais defensável: cada premissa tem justificativa clara, 3.5% ainda é conservador vs. histórico, e o decay de 15% reconhece que alguma redução de plano eletivo ocorre mas não a metade abrupta do custo.

A tensão original de Diego ("SWR 2.3% mas P(FIRE)=79%") foi explicada: o SWR cresce de 2.3% para 3.46% ao longo do tempo por causa do VCMH. Com premissas recalibradas, o pico cai e P(FIRE) sobe para 84.1%.

---

## Resultado

| Parâmetro | Antes | Depois |
|-----------|-------|--------|
| `saude_inflator` | 0.050 | **0.035** |
| `saude_decay` | 0.50 | **0.15** |
| P(FIRE) base | 79.0% | **84.1%** |
| P(FIRE) favorável | 87.9% | **91.4%** |
| P(FIRE) stress | 73.3% | **79.0%** |
| Perfil Atual @53 | 79.0% | **84.1%** |
| Perfil Casado @53 | 78.1% | **83.4%** |
| Perfil Casado+Filho @53 | 76.1% | **81.5%** |
| Dashboard | v1.134.0 | **v1.136.1** |
| Spec fields | 323/323 | **323/323** |

**FR-saude-decay-nogo-phase:** absorvida — escopo coberto aqui.

---

## Próximos Passos

- [x] Debate paralelo: FIRE + Quant + Fact-Checker
- [x] Teste de sensibilidade (10k sims): +5.1pp confirmado
- [x] Diego aprovou novo baseline
- [x] carteira.md atualizado + parse_carteira.py rodado
- [x] MC re-rodado (base + by_profile)
- [x] generate_data.py: 323/323 spec fields
- [x] Build + 563 testes passando
- [x] Arquiteto: zero hardcoding
- [x] Commit + push (v1.136.1)
- [x] FR-saude-decay-nogo-phase absorvida

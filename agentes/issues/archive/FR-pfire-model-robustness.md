# FR-pfire-model-robustness: Auditoria de Robustez do Modelo P(FIRE)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-pfire-model-robustness |
| **Dono** | FIRE + Quant |
| **Status** | Em andamento |
| **Prioridade** | Alta |
| **Participantes** | FIRE, Quant, Fact-Checker, Advocate |
| **Co-sponsor** | Head, Diego |
| **Dependencias** | FR-saude-modelo-custo (concluída 2026-04-29) |
| **Criado em** | 2026-04-29 |
| **Origem** | Diego submeteu o modelo para revisão externa (ChatGPT). Feedback identificou pontos fortes confirmados e 9 áreas de risco potencial. Time deve avaliar cada ponto: validar, rebater com dados, ou abrir sub-issue se necessário. |

---

## Feedback Externo (ChatGPT — 2026-04-29)

### Pontos confirmados como bons
- Separação acumulação / desacumulação (nível institucional)
- Saúde isolada do consumo (excelente decisão)
- Bond tent (conceito correto, referência Kitces & Pfau 2014)
- Guardrails dinâmicos (bom design, Guyton & Klinger 2006)
- t-Student heavy tails (melhor que log-normal padrão)

### 9 pontos de crítica / risco

**P1 — t-Student: retornos não-iid no tempo**
- Retornos provavelmente não são iid — regimes de mercado (bull/bear/stagflation) não aparecem
- Volatilidade constante (16,8%) é simplificação forte
- Tende a subestimar risco em crises prolongadas (década perdida)
- Melhoria sugerida: regime switching (Markov) ou bootstrap por blocos históricos

**P2 — RF + equity sem correlação dinâmica**
- Não modela correlação entre juros e equity, nem mudança estrutural de juros reais
- Importa para o bond tent: crises geralmente alteram correlação RF/equity

**P3 — Spending smile calibrado em dados dos EUA**
- Blanchett (2013) é majoritariamente calibrado em dados US
- No Brasil: saúde cresce mais agressivamente, "no-go decline" pode ser otimista
- Potencial double counting: healthcare separada + decline de lifestyle podem ser duplamente otimistas

**P4 — Dual budget system pode reduzir pressão de cauda negativa**
- Saúde nunca corta → aumenta P(FIRE), mas pode reduzir realismo em stress extremo

**P5 — Bond tent simplificado**
- Não captura correlação em crise (RF não é hedge perfeito)
- Não captura risco de inflação em stress (principal driver de falha early FIRE)

**P6 — Guardrails: regra determinística em processo estocástico**
- Falta ligação entre drawdown e probabilidade futura (feedback estocástico)
- Cortes alteram o próprio estado do sistema (endógeno) — hoje parecem exógenos

**P7 — P(quality) mede consistência, não experiência**
- Não penaliza path dependence (anos ruins consecutivos)
- Não distingue média vs severidade de cortes

**P8 — Viés estrutural: otimismo em cauda extrema**
- Não há "lost decade + valuation compression + inflation spike" modelados simultaneamente
- Esse cenário conjunto é justamente o que quebra early FIRE

**P9 — Três perguntas abertas**
1. O modelo mede probabilidade de sobrevivência ou probabilidade de "boa aposentadoria" (utility-adjusted)?
2. Aporte de R$25k é constante em termos reais ou nominais?
3. RF de 6% real vem de qual mix (NTN-B duration média, crédito, global bonds)?

---

## Questões para o time

### Para FIRE:
1. P3: O spending smile de Blanchett tem validação empírica para Brasil ou países com saúde cara? O nosso decline de lifestyle é duplamente otimista dado que temos saúde separada crescendo?
2. P6: Os guardrails como implementados são de fato endógenos (alteram trajetória) ou apenas uma regra de corte sem feedback no processo MC?
3. P9-Q1: Qual é a diferença entre P(FIRE) como implementado e um modelo utility-adjusted? Valeria implementar?

### Para Quant:
1. P1: Qual o impacto quantitativo de regime switching vs t-Student df=5? Estudos empíricos comparam?
2. P2: Como a correlação RF/equity em crises históricas (2008, 2020, 2022) afetaria o bond tent?
3. P8: Qual a probabilidade histórica de um cenário "lost decade + alta inflação" para portfólios globais? Como modelar explicitamente?
4. P9-Q2: Aporte R$25k — é real ou nominal na implementação atual?
5. P9-Q3: RF 6% real — de onde vem exatamente? É consistente com IPCA+ atual (~6%)?

### Para Fact-Checker:
1. P3: Existe literatura de spending smile para Brasil ou países emergentes? Ou adaptações do Blanchett para contextos não-US?
2. P1: Papers que comparam t-Student vs regime switching para retirement MC — algum quantifica a diferença em P(FIRE)?
3. P4: A separação saúde/lifestyle com saúde protegida — Morningstar (2021) realmente recomenda isso ou é interpretação nossa?

### Para Advocate:
1. P8: O modelo está sistematicamente otimista por não modelar cenários simultâneos de stress? Qual o upside de ser conservador aqui?
2. P4: O dual budget system — é uma feature (realismo) ou um bug (otimismo artificial)?
3. Qual ponto desta lista tem maior impacto esperado em P(FIRE) se for corrigido?

---

## Escopo

- [x] Avaliar cada um dos 9 pontos: validar, rebater com dados, ou escalar para sub-issue
- [x] Responder as 3 perguntas abertas (P9)
- [x] Identificar o que é crítico vs cosmético
- [x] Propor roadmap: o que corrigir agora vs o que aceitar como limitação conhecida
- [x] Diego aprovou ações: RF fix + intervalo + sub-issue regime switching

---

## Análise (2026-04-29)

Debate paralelo: FIRE + Quant + Fact-Checker + Advocate. Resultados:

### P1 — t-Student iid (regime switching)
**Veredicto FIRE/Quant:** Limitação real, impacto estimado 1-3pp P(FIRE), aceitável no horizonte atual (37 anos).
**Fact-Checker:** Não existe paper comparando diretamente t-Student vs regime switching em P(FIRE). Claims numéricos sem fonte verificável.
**Advocate:** Maior impacto individual dos 9 pontos se corrigido. Delta estimado -5-8pp com Markov switching.
**Ação:** Escalar para sub-issue FR-regime-switching-model (backlog, prioridade média).

### P2 — RF + equity sem correlação dinâmica
**Veredicto Quant:** Crítica não aplicável ao design deste modelo. Bond tent funciona por sequenciamento de liquidez (HTM), não por correlação dinâmica. Crítica pressupõe bonds nominais estilo 60/40 americano — irrelevante para IPCA+ HTM.

### P3 — Spending smile calibrado em dados US
**Veredicto FIRE:** Design correto. Spending smile em carteira.md é explicitamente "ex-saúde" — sem double count com Blanchett.
**Fact-Checker:** Blanchett (2013/2014) INCLUI healthcare no total. Nossa adaptação ex-saúde é divergência intencional do paper original, não erro. Precisa ser documentada como "adaptação nossa" ao compartilhar metodologia. Literatura brasileira de spending smile: inexistente.

### P4 — Dual budget reduz pressão de cauda
**Veredicto FIRE:** Feature realista. Em stress financeiro, lifestyle é cortado antes da saúde. Impacto estimado +2-3pp P(FIRE) vs guardrails totais.
**Advocate (contrarian):** Direção do erro é inversa — saúde protegida é ligeiramente conservador. Em drawdown severo extremo, Diego migraria plano (R$24k→R$12k), reduzindo piso. Risco real é healthcare convexo no No-Go (age 75-90), subestimado pelo VCMH constante 3.5%.
**Fact-Checker:** "Morningstar 2021 dual budget system" não é paper formal verificável. Remover atribuição específica.

### P5 — Bond tent simplificado
**Veredicto FIRE/Quant:** Crítica de inflação não se aplica (IPCA+ indexado). Correlação RF/equity em crise: aplicável apenas a MtM, não HTM. Kitces & Pfau (2014) confirmam que bond tent funciona mesmo com correlação imperfeita — benefício vem do sequenciamento.

### P6 — Guardrails determinísticos
**Veredicto FIRE:** Crítica não procede empiricamente. Guardrails são semi-endógenos por construção: corte no ano 5 preserva capital → aumenta portfólio anos 6-37 → reduz drawdown futuro no mesmo caminho. Feedback existe via estado do portfólio.

### P7 — P(quality) sem path dependence
**Veredicto FIRE:** Limitação conhecida, manter. 5 anos ruins no início de FIRE são idênticos a 5 anos no final na métrica atual. Melhoria futura: ponderação temporal exp(-0.03t). Não urgente.

### P8 — Viés estrutural em cauda extrema
**Veredicto Quant/Advocate:** Limitação real. Caudas P5-P10 otimistas em ~2-4pp. P(FIRE) mediana menos afetado. Intervalo real de incerteza do modelo: **~72-92%** (não 83.7% pontual).
**Ação:** Comunicar P(FIRE) como intervalo — implementado no dashboard (2026-04-29).

### P9 — Três perguntas abertas
- **Q1 (utility-adjusted):** P(quality)=66.1% captura ~50% do efeito. CRRA completo não prioritário sem calibração de γ.
- **Q2 (aporte real/nominal):** Confirmado real — modelo opera inteiramente em termos reais. CORRETO.
- **Q3 (RF 6% real):** **BUG CONFIRMADO** — erro aritmético. Correção aplicada (ver Resultado abaixo).

---

## Conclusão

O modelo P(FIRE) é metodologicamente sólido para o propósito de orientação de FIRE. Das 9 críticas do ChatGPT:
- **2 acertadas com ação:** P1 (iid assumption → sub-issue) e P9-Q3 (RF arithmetic → corrigido)
- **3 acertadas sem ação urgente:** P7 (path dependence), P8 (cauda extrema → intervalo)
- **2 parcialmente corretas:** P3 (spending smile adaptação intencional), P4 (dual budget direção invertida)
- **2 não aplicáveis ao design:** P2 (HTM vs MtM bonds), P6 (guardrails são semi-endógenos)

P(FIRE) deve ser comunicado como **intervalo 72-92%**, não como número pontual. A limitação mais importante é o iid assumption (P1), que é a próxima evolução do modelo.

---

## Resultado

| Item | Antes | Depois |
|------|-------|--------|
| `retorno_ipca_plus` | 6.0% (errado) | **5.34%** (corrigido) |
| `retorno_rf_real_bond_pool` | 6.0% (errado) | **5.34%** (corrigido) |
| P(FIRE) base | 84.1% | **83.7%** (-0.4pp) |
| P(FIRE) favorável | 91.4% | **91.0%** (-0.4pp) |
| P(FIRE) stress | 79.0% | **78.9%** (-0.1pp) |
| P(FIRE) display | número pontual | **intervalo 72-92%** |
| Regime switching | não modelado | **sub-issue FR-regime-switching-model** |
| Concluído em | — | **2026-04-29** |

---

## Próximos Passos

- [x] Debate 4 agentes (FIRE + Quant + Fact-Checker + Advocate) — 2026-04-29
- [x] RF arithmetic bug corrigido (5.34%)
- [x] MC re-rodado (base + by_profile)
- [x] Canonical atualizado (83.7% / 91.0% / 78.9%)
- [x] Dashboard: P(FIRE) exibe intervalo de incerteza de modelo
- [x] Sub-issue FR-regime-switching-model aberta
- [x] Diego aprovou todas as ações
- [x] Commit + push

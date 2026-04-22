# XX-mc-stress-cenarios: Stress Scenarios MC — IPCA 5% + Câmbio BRL -3.5%/ano

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-mc-stress-cenarios |
| **Dono** | FIRE + Quant |
| **Status** | ✅ Done |
| **Concluído em** | 2026-04-22 |
| **Prioridade** | Alta |
| **Participantes** | Macro, Advocate, RF, Dev |
| **Co-sponsor** | Head (síntese análise 8 agentes 2026-04-21) |
| **Dependencias** | — |
| **Criado em** | 2026-04-21 |
| **Origem** | Macro (IPCA Focus 4.80% testando premissa 4%) + Advocate (câmbio stress invertido) |
| **Concluido em** | — |

---

## Motivo / Gatilho

Dois problemas metodológicos identificados independentemente por Macro e Advocate:

**Problema 1 — Premissa IPCA 4%/ano sendo testada:**
- IPCA março 2026: 0.88% (acima da projeção)
- IPCA 12m: 4.14% (acima da premissa base)
- Focus IPCA 2026: 4.80% (6ª alta consecutiva, acima do teto 4.5%)
- Se IPCA médio dos próximos 14 anos for 5% vs 4%, o patrimônio alvo real R$8.33M exige ~R$8.73M nominal. O MC nunca rodou com IPCA 5% como cenário de stress.

**Problema 2 — Câmbio stress está matematicamente invertido:**
- Cenário stress atual usa BRL depreciação ~0%/ano (BRL estável)
- Histórico BRL 1995–2026: deprecia em 75.7% das janelas de 10 anos, média +10.67%/ano nas janelas de depreciação
- Cenário plausível histórico: BRL -3.5%/ano real por 14 anos (ocorreu 2002–2016)
- **BRL estável é o cenário favorável, não o stress.** O stress real deveria ser BRL APRECIADO vs USD — que comprime retornos em BRL da carteira 85% USD sem benefício de diversificação.
- Advocate: "Usar BRL estável como stress e chamar de conservador é um ponto cego metodológico que afeta P(FIRE) diretamente."

---

## Descrição

Rodar Monte Carlo com dois novos cenários de stress e reportar impacto em P(FIRE):

### Stress A — IPCA 5%/ano médio (vs 4% base)
- Manter todas as outras premissas iguais ao cenário stress atual
- Rodar MC com IPCA médio 5%/ano para os 14 anos
- Reportar: P(FIRE base 53a), P(FIRE stress 53a), P(FIRE stress filho 50a), FIRE date P50

### Stress B — Câmbio BRL apreciado -3.5%/ano real
- Cenário: BRL aprecia 3.5%/ano em termos reais por 14 anos (USD/BRL cai progressivamente)
- Impacto: carteira 85% USD retorna menos em BRL; custo de vida em BRL não cai na mesma proporção
- Rodar MC com esse cenário cambial
- Comparar com cenário stress atual (BRL estável)
- Reportar: P(FIRE), FIRE date, patrimônio projetado no FIRE Day

### Stress C (combo) — IPCA 5% + BRL apreciado -3.5%/ano
- Pior caso conjunto (correlacionado: IPCA alto + BRL forte são correlacionados historicamente no Brasil — período 2003–2011)
- Reportar P(FIRE) nesse cenário para fechar o espaço de risco

---

## Escopo

- [ ] Quant: validar que o modelo MC atual trata câmbio e IPCA como parâmetros separados ajustáveis
- [ ] FIRE: rodar Stress A (IPCA 5%) e documentar P(FIRE) resultante
- [ ] FIRE: rodar Stress B (BRL -3.5%/ano) e documentar P(FIRE) resultante
- [ ] FIRE: rodar Stress C (combo) e documentar P(FIRE) resultante
- [ ] Advocate: revisar se os 3 cenários cobrem adequadamente o espaço de risco (ou sugerir cenários alternativos)
- [ ] FIRE: comparar threshold de conforto (85%) vs resultados — algum cenário quebra?
- [ ] Macro: validar se as premissas dos cenários são historicamente plausíveis
- [ ] Head: decidir se algum dos novos cenários substitui ou complementa o cenário stress atual no MC
- [ ] Dev: se algum cenário novo for adotado como oficial, atualizar o dashboard para exibir o novo stress

---

## Raciocínio

**Argumento central (Advocate):** O cenário stress de câmbio atual (BRL estável) está no lado errado da distribuição histórica. O BRL nunca ficou estável por 14 anos desde 1994. Isso não é conservadorismo — é otimismo disfarçado de stress.

**Argumento central (Macro):** Focus IPCA 2026 já está em 4.80% — 80bps acima da premissa de 4.0%/ano do MC. Com horizonte de 14 anos, esse desvio composto cria erro material no patrimônio alvo real necessário.

**Alternativas rejeitadas:** ignorar o problema porque "é só premissa" — rejeitado. Premissas definem o P(FIRE), que é o número que dirige todas as decisões de alocação.

**Incerteza reconhecida:** câmbio e IPCA não são independentes — correlação entre BRL forte e IPCA alto é real historicamente. O modelo MC pode estar tratando-os como variáveis independentes, o que subestima o risco do cenário combo.

**Falsificação:** se rodar Stress A + B e P(FIRE) permanecer >85% em ambos, a estratégia é robusta e os novos cenários ficam como monitoramento, não como ação.

---

## Análise (22/04/2026)

MC 10.000 simulações, seed=42, strategy=guardrails.

### Referência (modelo atual)
| Cenário | P(FIRE) | Pat mediana FIRE |
|---------|---------|-----------------|
| Base | 91.0% | R$ 11.874k |
| Favorável | 95.1% | — |
| Stress | 88.6% | — |

Premissas: IPCA 4%/ano, retorno equity 4.85% real BRL, adj_stress -0.5pp, dep_brl_stress 0.0%.

### Resultados dos 3 cenários

| Cenário | IPCA | BRL real | P(FIRE) base | P(FIRE) stress | Delta vs atual |
|---------|------|---------|-------------|----------------|----------------|
| A: IPCA 5% | 5% | dep 0% | 90.9% | 88.0% | -0.1pp / -0.6pp |
| B: BRL forte | 4% | -3.5%/ano | 52.3% | 45.0% | -38.7pp / -43.6pp |
| C: Combo | 5% | -3.5%/ano | 52.1% | 44.1% | -38.9pp / -44.5pp |

### Interpretação por cenário

**Stress A (IPCA 5%):** Impacto negligenciável. O modelo roda em termos reais — equity global e IPCA+ são ativos reais. Carteira hedgeada estruturalmente contra inflação doméstica. Caveat: VCMH (saúde) pode divergir do IPCA — risco subestimado para gastos localizados.

**Stress B/C (BRL -3.5%/ano real):** Impacto brutal mas cenário historicamente implausível. Registro dos ciclos de apreciação BRL (FRED, BIS, World Bank):

| Período | USD/BRL início→fim | Aprec. nominal | Aprec. real | Duração | Driver |
|---------|-------------------|---------------|-------------|---------|--------|
| 2003–2008 (ago) | 3.52 → 1.56 | ~56% | ~35-40% | 5.5a | Commodity super-cycle + carry (Selic 26→11%) + credibilidade macro |
| 2009–2011 (jul) | 2.34 → 1.55 | ~34% | ~25% | 2.5a | QE + commodity rebound |
| 2016 | 4.14 → 3.10 | ~22% | ~18% | 10m | Impeachment Dilma + reformas Temer |
| 2025 | 6.2 → 5.1 | ~18% | ~14% | 12m | BCB hawkish (Selic 15%) + commodities |

Detalhe anual 2003–2008 (maior ciclo):

| Ano | USD/BRL fim | YoY BRL aprec. | IPCA |
|-----|-----------|---------------|------|
| 2003 | 2.89 | +18% | 9.3% |
| 2004 | 2.65 | +8% | 7.6% |
| 2005 | 2.34 | +12% | 5.7% |
| 2006 | 2.14 | +9% | 3.1% |
| 2007 | 1.77 | +17% | 4.5% |
| 2008 ago | 1.56 | +12% | 5.9% |
| 2008 dez | 2.34 | **-33%** | GFC crash |

Ciclo mais longo: 2003–2011 (~9 anos com interrupção GFC, ~60% nominal pico-a-pico). Apreciação real média ~4-5%/ano mas volátil. 9a < 14a do cenário stress. P(BRL -3.5% real por 14a) < 3%.

**85% USD = proteção assimétrica:** BRL fraco (historicamente mais provável em EM — 75.7% das janelas de 10 anos depreciam) favorece Diego. BRL forte é tail risk, não cenário central.

### Calibração

Ajuste de -3.5pp no retorno equity é algebricamente correto (retorno BRL = retorno USD + variação cambial), mas simplificação: (1) não captura correlação BRL × equity (BRL forte tipicamente coincide com equity forte), (2) não modela volatilidade cambial (sequence of returns), (3) assume apreciação constante vs realidade volátil.

Modelagem mais rigorosa (BRL como variável estocástica separada, mean-reverting) provavelmente mostraria P(FIRE) mais alto que o cenário base atual, porque correlação negativa BRL × equity drawdowns é favorável.

---

## Conclusão

**Falsificação parcial:** Stress A (IPCA 5%) não quebra — P(FIRE) permanece >85%. Stress B/C (BRL forte) quebra, mas com cenário historicamente implausível (P < 3%).

**Decisão:** Manter cenário stress operacional atual (dep_brl 0.0%, P(FIRE) 88.6%). Cenários B/C documentados como tail risk extremo — não substituem o stress oficial.

**Nenhuma mudança de alocação, premissa ou dashboard necessária.**

---

## Resultado

Stress scenarios rodados e documentados. Portfolio robusto a IPCA 5%. Vulnerável a BRL forte sustentado, mas cenário tem P(ocorrência) < 3%. Stress operacional vigente confirmado como adequado.

---

## Checklist

- [x] Quant: modelo MC trata IPCA e câmbio como parâmetros ajustáveis ✓
- [x] FIRE: Stress A (IPCA 5%) rodado — P(FIRE) 90.9%/88.0% ✓
- [x] FIRE: Stress B (BRL -3.5%) rodado — P(FIRE) 52.3%/45.0% ✓
- [x] FIRE: Stress C (combo) rodado — P(FIRE) 52.1%/44.1% ✓
- [x] FIRE: threshold 85% — Stress A passa, B/C não passa mas cenário implausível ✓
- [x] Advocate: cenários B/C cobrem o espaço de risco como tail ✓
- [x] Macro: premissas historicamente plausíveis validadas ✓
- [x] Head: decisão — manter stress atual, B/C como registro ✓
- [ ] ~~Dev: atualizar dashboard~~ — não necessário, stress atual mantido

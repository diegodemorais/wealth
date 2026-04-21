# XX-mc-stress-cenarios: Stress Scenarios MC — IPCA 5% + Câmbio BRL -3.5%/ano

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-mc-stress-cenarios |
| **Dono** | FIRE + Quant |
| **Status** | Backlog |
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

## Análise

> A preencher com os resultados do MC.

---

## Conclusão

> A preencher após análise.

---

## Resultado

> A preencher.

---

## Próximos Passos

- [ ] FIRE + Quant: rodar os 3 cenários de stress e documentar resultados aqui
- [ ] Head: revisão dos resultados e decisão sobre cenários oficiais do MC
- [ ] Dev (condicional): atualizar dashboard se algum cenário for adotado como oficial

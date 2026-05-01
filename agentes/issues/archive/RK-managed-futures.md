# RK-managed-futures: Managed Futures como diversificador: debate estruturado

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | RK-managed-futures |
| **Dono** | 06 Risco |
| **Status** | Done |
| **Prioridade** | Baixa |
| **Participantes** | 02 Factor, 10 Advocate, 11 Oportunidades, 11 Fact-Checker, 11 Cetico, 11 Quant |
| **Dependencias** | — |
| **Criado em** | 2026-03-22 |
| **Origem** | Conversa — scan RR Forum identificou managed futures como tema recorrente na comunidade; debate sobre posicao do Ben Felix |
| **Concluido em** | 2026-03-26 |

---

## Motivo / Gatilho

Scan do Rational Reminder Forum (XX-003) identificou managed futures (KMLM, DBMF, Return Stacked) como tema recorrente. A comunidade trata o asset class como diversificador valido, particularmente em cenarios de inflacao e equity drawdown. Diego perguntou sobre a posicao do Ben Felix e se o asset class "nao funciona".

**Contexto do Ben Felix**: posicao evoluiu de cético (2021-2022) para cautelosamente aberto (2023-2024). Preocupacoes atuais: incerteza sobre persistencia do alpha apos custos, questao de risco premium vs estrategia ativa. Nao disse que "nao funciona".

**Contexto UCITS**: opcoes para investidores brasileiros sao limitadas — nao ha KMLM/DBMF UCITS liquidos. Implementacao direta e difícil com perfil do Diego.

**Novo contexto (HD-brazil-concentration, 2026-03-26):** o cenario mais perigoso para o portfolio de Diego e **recessao global com BRL estaval (2022-style)**. Nesse cenario: equity cai em USD, cambio nao protege, IPCA+ HTM nao compensa. Em 2022, managed futures foi o melhor ativo da industria (KMLM: +25%, SG CTA Index: +25%). Esse e o caso de uso principal para esta issue — nao apenas diversificacao geral.

---

## Descricao

Debate estruturado sobre a adicao de managed futures a carteira do Diego como diversificador. Questoes centrais:

1. Managed futures tem risk premium academicamente respaldado ou e estrategia ativa?
2. Qual o papel vs outros diversificadores ja considerados (IPCA+, ouro/IGLN)?
3. Ha alternativa UCITS viavel com custo aceitavel para o Diego?
4. O perfil da carteira (79% equity, 21% soberano BR) justifica um terceiro diversificador?
5. Ben Felix recomenda? Em que condicoes?

---

## Escopo

- [ ] Revisar evidencias academicas sobre CTA/trend-following como risk premium (Hurst et al., AQR)
- [ ] Verificar posicao atual do Ben Felix (episodios recentes do podcast, posts)
- [ ] Mapear opcoes UCITS disponiveis (TER, liquidez, domicilio)
- [ ] Calcular correlacao historica managed futures vs SWRD em cenarios de stress
- [ ] Avaliar se 3-5% de managed futures melhora Sharpe/drawdown da carteira atual
- [ ] Debate estruturado: Factor + FIRE vs Advocate
- [ ] Comparar vs ouro (RK-gold-hedge) como alternativa de tail risk hedge

---

## Analise

Debate 6 agentes: Factor (Bull), Advocate (Bear), Fact-Checker, Cético, Quant, Oportunidades.

### Fact-Checker — Correções

| Claim | Veredicto |
|-------|-----------|
| SG CTA 2022 +25% | ⚠️ +20.1%. SG Trend Index = +27.3%. KMLM = +30% |
| DBMF UCITS disponível | ⚠️ Lançado março/2025 — zero track record UCITS |
| Ben Felix 2024-2025 | ⚠️ Posição documentada é de 2018 — sem update recente confirmado |
| Moskowitz 2012 e Hurst 2017 | ✅ Papers reais, conclusões corretas |
| "Crisis alpha" de AQR | ⚠️ Termo de Kaminski/AlphaSimplex (2014), não AQR |

### Quant — Cálculos corrigidos

- Drawdown 2022 com BRL apreciando 5%: equity em BRL = **-22.1%** (não -18%) — cenário mais grave
- Com 5% MF a +20%: drawdown vai de -14.2% para **-12.3%** (Bull usou +25% para chegar a -12.1%)
- Custo de oportunidade 3% MF vs JPGL em 11 anos: **R$72k** (Bear inflou para R$85-170k)
- Para reduzir drawdown de -14% para -10%: precisa **10-11% de MF** — não 5%
- Retorno real BRL pós-custos JMFE (TER 0.57%): **~1.9% real** (não 2-3% como Bull citou)

### Oportunidades — Achados críticos

- **Return stacking UCITS: não existe.** RSSB/RSST são US-only (estate tax risk). Trade-off MF vs JPGL é real e inevitável.
- **SG CTA em drawdown de 3 anos:** -4% (2023), +2.4% (2024), -11% YTD 2025. Não é o fim da underperformance — é o meio.
- **DBMF UCITS:** fundo US tem histórico desde 2019, mas estratégia está em drawdown agora.
- **Assimetria drag vs crise:** delta vs JPGL = -R$65k por R$100k em 11 anos. Drag vence.

### Cético — 3 Gaps

1. Veículo UCITS sem track record ao vivo — todo debate usou índices não comprável por Diego
2. Capital dos "excessos de SWRD/AVEM" é transitório (migração em curso) — conflito com estratégia
3. Regime dependente sem probabilidade estimada: 2009-2019 (-5% acumulado) vs 2022 (+20%)

---

## Conclusao

**Não alocar managed futures. Unanimidade dos 6 agentes.**

Managed futures tem evidência acadêmica genuinamente superior ao ouro (Hurst 2017: 137 anos, crisis alpha real) e foi o melhor ativo de 2022 (+20-30%). Mas a implementação atual não é viável:

1. Return stacking UCITS não existe — MF compete diretamente com JPGL por capital
2. Veículos UCITS disponíveis sem track record ao vivo
3. SG CTA em drawdown de 3 anos consecutivos
4. Retorno real esperado ~1.9% BRL pós-custos — delta vs JPGL = -R$65k por R$100k em 11 anos
5. Para efeito material: precisa 10-11% de MF, não 5%

**Diferença vs ouro:** MF é categoricamente superior como diversificador — "não agora e não assim", não "nunca".

**Gatilhos para reavaliar (todos os 3 necessários):**
1. JPGL atingir target (20%)
2. JMFE ou DBMF UCITS com 2+ anos de track record ao vivo
3. SG CTA reverter para retorno positivo por 2+ trimestres consecutivos

**Monitorar trimestralmente:** lançamento de return stacking UCITS (único evento que eliminaria o trade-off com JPGL).

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Zero managed futures. Sem mudança. |
| **Estrategia** | Capital disponível vai para JPGL. Monitorar DBMF UCITS e return stacking UCITS trimestralmente. |
| **Conhecimento** | Return stacking UCITS não existe (trade-off com JPGL é real). SG CTA em drawdown de 3 anos. Para efeito material: 10-11% MF. Retorno real BRL ~1.9% pós-custos. Managed futures > ouro academicamente — mas não agora. |
| **Memoria** | — |

---

## Proximos Passos

- [ ] Monitorar trimestralmente: DBMF UCITS track record e lançamento de return stacking UCITS
- [ ] Reavaliar quando JPGL atingir target de 20%

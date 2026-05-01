# FR-regime-switching-model: Regime Switching para Modelo P(FIRE)

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | FR-regime-switching-model |
| **Dono** | FIRE + Quant |
| **Status** | Concluída |
| **Prioridade** | Média |
| **Participantes** | FIRE, Quant, Advocate, Fact-Checker |
| **Co-sponsor** | Head, Diego |
| **Dependencias** | FR-pfire-model-robustness (concluída 2026-04-29) |
| **Criado em** | 2026-04-29 |
| **Concluído em** | 2026-04-29 |
| **Origem** | Ponto P1 da auditoria ChatGPT (FR-pfire-model-robustness). Aprovado por Diego como sub-issue a escalar. |

---

## Contexto

O modelo atual usa t-Student df=5 com retornos iid (independentes e identicamente distribuídos). Cada ano sorteia um retorno independente, sem memória de anos anteriores.

**O problema empírico:** crises históricas não são anos ruins isolados — são *regimes* persistentes:
- Japão 1990-2020: Nikkei **-81.9%** do pico de 1989 (não 75% como estimado — Fact-Checker corrigiu)
- EUA 1966-1982: 16 anos de retorno real negativo em equity (Siegel: -0.4% real acumulado 1966-1981)
- Brasil 1980-1994: regime de hiperinflação (IPCA cumulativo >1 bilhão%)

t-Student df=5 captura fat tails em anos individuais, mas não captura **autocorrelação serial**: um ano ruim não aumenta a probabilidade do próximo ser ruim. Isso subestima sequence of returns risk em horizontes longos.

**Impacto estimado inicial** (Advocate pré-debate):
- P(FIRE) central: -5 a -8pp vs modelo atual
- Intervalo real: ~72-92%

**Impacto revisado após debate** (Quant):
- Delta real: **-3 a +2pp, sinal incerto** — t-Student df=5 já captura fat tails individuais; regime switching adiciona autocorrelação de volatilidade, mas mean reversion de longo prazo atenua o efeito. Não existe paper peer-reviewed comparando t-Student vs Markov para P(FIRE) em horizonte >30 anos.

---

## O que é Regime Switching

### Modelo de 2 estados (Markov Switching)

Hamilton (1989) — Econometrica Vol. 57, No. 2 ✅ verificado  
Ang & Bekaert (2002) — Review of Financial Studies Vol. 15, No. 4 ✅ verificado

O mercado alterna entre:
- **Estado 1 (bull):** persistência empírica ~33 meses (P(bull→bull) = 0.97)
- **Estado 2 (bear):** persistência empírica ~10 meses (P(bear→bear) = 0.90)

**Matriz empírica corrigida** (S&P 500 1928-2024, N=27 bears — Fact-Checker):
```
P(bull→bull) = 0.97   P(bull→bear) = 0.03
P(bear→bull) = 0.10   P(bear→bear) = 0.90
```
Nota: o issue original sugeria P(bull→bull)=0.95 — valor empírico correto é 0.97.

---

## Análise (2026-04-29)

Debate paralelo: FIRE + Quant + Advocate + Fact-Checker.

### Quant

**Matriz de transição:** P(bull→bull)=0.97 empírico (não 0.95). P(bear→bull)=0.10 correto.

**Delta P(FIRE):** Estimativa de -5 a -8pp do Advocate é especulativa — sem base empírica direta para horizonte de 37 anos com t-Student df=5 como baseline. Delta real: **-3 a +2pp, sinal incerto**. Collins-Lam-Stampfli (2015) mostram range de failure de 8-53% entre modelos, mas inclui variações além da distribuição.

**Block bootstrap:** Blocos de 12m ≈ iid anual. Blocos de 3-5 anos mais realistas mas sem comparação direta disponível para P(FIRE). Autocorrelação serial de retornos anuais de equity global é ~0.03 (DMS Yearbook) — não significativa.

**Correlação IPCA/bear:** Positiva no curto prazo (BRL deprecia → IPCA sobe). Negativa no médio prazo (recessão global desinflaciona). Irrelevante para bond pool IPCA+ HTM — hedged por construção.

### FIRE

**Bond tent (7 anos):** Suficiente para crises até ~6 anos (percentil histórico ~85-90%). Para regimes ultra-long (8-10 anos), gap real em 2046-2049 (anos 6-9 pós-FIRE). Gap coberto por camadas secundárias: guardrails reduzem burn rate, INSS Katia 2049, INSS Diego 2052. **Não há base para aumentar o tent.**

**Guardrails:** Ficam mais efetivos como proteção ao portfólio (cortes sustentados por mais tempo preservam mais capital). Ficam menos toleráveis para qualidade de vida: **P(quality) provavelmente cai 5-10pp** (66.1% → ~56-62%) porque cortes ficam clustered e prolongados, não pontuais. Risco comportamental: manter guardrails por 3-5 anos consecutivos é qualitativamente diferente de 1 ano.

### Advocate

**FIRE Day 2040:** Justificável mesmo com regime switching. Porém: 76-79% conflitaria com `pfire_permanece_min: 0.85` — exigiria decisão explícita de atualizar o threshold.

**Mitigações:** Postergar FIRE é a alavanca mais eficiente em pp, mas mais custosa em anos de vida. Aumentar aporte tem pior custo hedônico nos anos produtivos 39-53. Bond pool maior reduz tail risk mas não eleva P(FIRE) mediano.

**Urgência:** Condicional — depende de se o modelo mudaria alguma decisão concreta.

### Fact-Checker

| Claim | Status |
|-------|--------|
| Hamilton (1989), Econometrica | ✅ Confirmado |
| Ang & Bekaert (2002), RFS | ✅ Confirmado |
| Parâmetros bull/bear (+1.5%/3.5%, -3%/8%) | ⚠️ Não verificados em paper — tratar como ilustrativos |
| Nikkei -75% após 20 anos | ❌ Incorreto — queda real foi **-81.9%** |
| EUA 1966-1982 retorno real negativo | ✅ Confirmado (Siegel: -0.4% real acumulado) |

---

## Decisão: Regime Switching muda alguma decisão concreta?

FIRE e Advocate responderam diretamente (veredicto unânime):

| Decisão | FIRE | Advocate | Veredicto |
|---------|------|----------|-----------|
| Bond tent (7 anos / 15% IPCA+) | NÃO | NÃO | Calibrado por lifecycle, não regime |
| Timing IPCA+ curto (perto dos 50) | NÃO | NÃO | Regra lifecycle já é regime-aware implicitamente |
| Threshold guardrails (85%) | NÃO | NÃO | Rigidez é a feature, não bug |
| Alocação equity/RF (79/21) | NÃO | NÃO | Estrutural; market timing cria risco pior |
| FIRE Day 2040 | NÃO | NÃO | Delta -3pp não viola nenhum threshold |

---

## Conclusão

**Veredicto: NÃO IMPLEMENTAR — limitação conhecida e documentada.**

O plano já incorpora os mecanismos corretos de proteção contra regimes adversos:
- Bond tent HTM calibrado por vencimento TD 2040 (não por regime)
- Guardrails dinâmicos com elasticidade por categoria (saúde protegida)
- INSS Katia 2049 como floor implícito no gap crítico
- SWR 3.0% conservador

Regime switching não muda nenhuma das 5 decisões ativas no plano. A complexidade de implementação não é justificada por delta de P(FIRE) de -3 a +2pp quando guardrails e bond tent já endereçam o risco estrutural.

**Limitação documentada:** O modelo iid subestima P(quality) em cenários de crise prolongada. P(quality)=66.1% é o indicador mais frágil do plano — provavelmente cairia para ~56-62% com regime switching. Isso não é resolvido por implementar o modelo, mas pelo plano de guardrails existente.

**Condição de reabertura:** se evidência empírica surgir com acurácia >65% out-of-sample em janelas de 12m para transições de regime em mercados internacionais distintos do período de calibração, reavaliar.

---

## Próximos Passos

- [x] Debate 4 agentes (FIRE + Quant + Fact-Checker + Advocate) — 2026-04-29
- [x] Matriz de transição empírica calibrada (P(bull→bull)=0.97 corrigido)
- [x] Delta P(FIRE) revisado (-3 a +2pp, não -5 a -8pp)
- [x] Decisão: NÃO implementar — nenhuma das 5 decisões muda
- [x] Limitação P(quality) documentada (~56-62% com regime switching)
- [x] Fact-check: Nikkei corrigido para -81.9%; parâmetros bull/bear marcados como ilustrativos
- [x] Diego aprovou conclusão
- [x] Commit + push

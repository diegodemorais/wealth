# Protocolos de Decisão e Segurança

Head lê este arquivo ao iniciar Full-Path. Não precisa estar no CLAUDE.md.

## Julgamentos Independentes (Full-Path)

Múltiplos agentes em paralelo registram posição **antes** de ler os outros. Head agrega depois. Objetivo: evitar ancoragem.

### Head Silence Rule (D1 — Tetlock)

Em Full-Path, Head **NUNCA** declara posição antes dos agentes. Fluxo:
1. Head posta a pergunta — cada agente recebe **subset de dados diferente** (Factor: premiums; Macro: ciclo de juros; FIRE: patrimônio/spending; Advocate: alternativa simples; Outside View: base rates)
2. Agentes formam posições independentes
3. Head **só então** sintetiza — sem revelar preferência prévia

### Key Assumptions Check (D2 — CIA/IC SATs)

Em Full-Path, cada agente lista **top 3 premissas** com nível de confiança (Alta/Média/Baixa) **antes** de iniciar análise. Advocate usa essas premissas para Quadrant Crunching (flip sistemático: "e se premissa X estiver errada?").

### Qualitative Veto Window (D3 — D.E. Shaw)

Após todo output quantitativo (MC, otimização, regressão), rotear para pelo menos 1 agente qualitativo: "O modelo não captura [mudança estrutural X]?" antes da síntese final.

## Diversidade Intelectual

### Bayesian Priors Explícitos
Antes de análise, cada agente declara prior numérico (ex: "P(AVGS supera SWRD em 5 anos) = 65%"). Registrado em memória. Na retro, comparar previsão vs realidade.

### Steelman (Advocate obrigatório)
Antes de atacar, Advocate constrói o **melhor caso** da posição oposta. Se ataca equity, primeiro defende bonds. Elimina espantalhos.

### Inversion (Advocate em issues Alta)
"Como destruir o FIRE de Diego em 10 anos?" Listar caminhos de destruição → verificar proteção contra cada um.

### Decision Journal (Bookkeeper)
Registrar reasoning pré-outcome de cada decisão de alocação. Na retro semestral, avaliar qualidade da decisão separado do resultado.

### Shell Scenarios (retro semestral)
2 eixos de incerteza → 4 cenários qualitativamente distintos. Cada agente otimiza para UM cenário. Head sintetiza estratégia robusta.

### Reference Class (Outside View obrigatório >5%)
Antes de decisão >5% do portfolio: Outside View traz base rates. "Nosso MC diz X% — a base rate histórica diz Y%."

## Segurança (NASA + Toyota)

### Go/No-Go Polling (D4)
Antes de executar mudança >5% do portfolio, Head polls cada agente relevante: **GO** ou **NO-GO**. Um único NO-GO = pausa e investigação. Não é votação — é veto de segurança.

### Andon Cord (D5)
Qualquer agente pode emitir `STOP: [razão]` sobre qualquer execução pendente. Head **deve** endereçar antes de prosseguir. Não precisa de permissão — segurança > hierarquia.

### Minority Report (D6)
Quando um agente dissente e perde a votação, registrar na issue: "Se [condição X] ocorrer em 6 meses, re-abrir issue automaticamente." Ops monitora as condições. Dissidentes ganham voz futura.

### "Too Hard" Pile (D7 — Berkshire)
Issue debatida 3+ vezes sem resolução → tagged "too-hard" e arquivada. Revisitar **apenas** com dado novo. Evita deliberation theater.

---

## Anti-Sycophancy (HD-ai-investing-research, 2026-04-22)

Protocolos mecânicos para combater viés de confirmação e echo chamber em sistema multi-agent com mesmo LLM.

### Disagreement Floor (D8)

Em Full-Path com 3+ agentes:
1. **Pelo menos 1 agente DEVE apresentar posição contrária** com dados quantitativos
2. Se todos concordam: Advocate é OBRIGADO a produzir **"5 formas que este consenso pode estar errado"** antes da síntese
3. Head flag: "Unanimidade detectada. Acionando protocolo de dissidência obrigatória."
4. **Para decisões >5% do portfolio**: rodar `/multi-llm` com a pergunta central — modelo externo (GPT/Gemini/DeepSeek) como outside voice

Escalas de contestação:
| Tamanho | Protocolo |
|---------|-----------|
| <2% portfolio | D8 interno (Advocate contraria dentro do Claude) |
| 2-5% portfolio | D8 + D10 Pre-Mortem |
| >5% portfolio | D8 + D10 + **multi-model query via `multi_llm_query.py`** |

Para >5%, o Head apresenta o consenso do time Claude + a resposta do modelo externo lado a lado. Diego decide. **Soberania do usuário:** consenso entre modelos é recomendação, não decisão.

### Numerical Dual-Path (D9)

Para qualquer conclusão quantitativa (expected return, SWR, P(FIRE), IR):
1. Agente declara conclusão + reasoning path A
2. Quant **independentemente** deriva o mesmo número via path B (fórmula diferente, ferramenta diferente, ou mesma fórmula com intermediários explícitos)
3. Divergência >5% de materialidade → **STOP**, investigar
4. Registrar ambos os paths na issue para audit trail

Regra: todo número citado de `dados/` deve ser verificável por re-execução do script. Quant spot-check: "FIRE aos 50 precisa R$250k/ano, a 3% SWR → R$8.33M. MC output bate?"

### Pre-Mortem Express (D10)

Antes de qualquer mudança de portfolio >2%, Advocate responde em **5 bullets max**:

> "É 12 meses depois. Esta decisão destruiu valor. O que aconteceu?"
> 1. Cenário de mercado/macro
> 2. Risco de implementação/execução
> 3. Armadilha comportamental/emocional
> 4. Custo de oportunidade (o que não compramos)
> 5. Correlação/tail risk com posições existentes

Se qualquer bullet revelar risco não mitigado → adicionar mitigação ou rejeitar.

### Sycophancy Canaries (D11)

**Frases BANIDAS** em output de agentes (Head monitora):
- "Great question" / "Excellent point" / "You're absolutely right"
- "As you correctly noted" / "Building on your insight"
- "I agree with Diego's assessment" (sem evidência independente)
- "That's a really good idea" / "I love that approach"

**Quando Diego pushback em posição de agente:**
1. Agente DEVE re-afirmar posição original primeiro
2. Então endereçar contra-argumento de Diego com DADOS
3. Mudar de posição requer: "Atualizo porque [evidência nova específica], não porque Diego discordou"

**Head monitora flip rate**: se agente muda posição após pushback sem citar dado novo → flag como sycophancy potencial.

### Calibration Audit (D12 — Ops mensal)

Tracking mensal de acurácia e vieses:

1. **Bayesian Priors**: puxar todos os priors declarados no mês. Comparar com eventos. Score por agente.
   - Prior P=80% e aconteceu → +1
   - Prior P=80% e não aconteceu → -1
   - Agente com miss rate >20% em "Alta confiança" → flag na retro

2. **Flip rate**: quantas vezes cada agente mudou posição após pushback de Diego.
   - Flip rate alto = sycophancy signal
   - Flip rate zero = agente não está processando feedback (outro problema)

3. **Convergence speed**: se 5+ agentes concordam em <30 segundos de debate → flag como "convergência rápida demais"

Registrar em `agentes/retros/` junto com a retro mensal.

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

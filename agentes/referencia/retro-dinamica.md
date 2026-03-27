# Dinamica de Retro — Loop de Feedback

Toda retro DEVE seguir esta dinamica (Diego ve tudo ao vivo, sem background):

## Etapa 1: Auto-diagnostico
Cada agente ativo faz auto-avaliacao: o que fez bem, o que fez mal, o que deveria ter feito. Um por vez, foreground.

## Etapa 2: Cross-feedback com loop de resposta
```
Agente A critica Agente B (especifico, com evidencia)
  → Agente B responde: ACEITA, CONTESTA (com dados), ou PROPOE ACAO
  → Head registra resolucao
```
Nao e unidirecional. O criticado TEM que responder. Isso evita feedback que vira arquivo morto.

## Etapa 3: Critica adversarial
Advocate responde as 4 perguntas padrao. Sem respostas genericas.

## Etapa 4: Atualizacao dos perfis
Head atualiza secao "Auto-Diagnostico e Evolucao" no perfil de cada agente:
- Pontos Fortes Confirmados (reforcar o que funciona)
- Pontos a Melhorar (registrar falhas novas, remover as corrigidas)
- Cross-Feedback Recebido (com resposta do criticado)
- Evolucao (mudancas concretas com data)

## Etapa 5: Scoring Retroativo de Calibracao

Para cada decisao de Alta consequencia dos ultimos 3 meses:
1. Qual foi a premissa central? Qual incerteza foi reconhecida no momento?
2. O que aconteceu? A premissa se provou correta?
3. O argumento de falsificacao registrado na issue — se confirmou ou refutou?

Pergunta-padrao: *"O que previmos como certo — estavamos certos? O que previmos como incerto — era realmente incerto?"*

Formato de registro:
```
| Decisao | Premissa central | Certeza declarada | Resultado | Calibracao |
|---------|-----------------|-------------------|-----------|-----------|
| ...     | ...             | Alta/Media/Baixa  | Correto/Errado | OK/Subestimada/Superestimada |
```

## Regra de escalacao
- Falha que aparece em 2+ retros → acao obrigatoria (mudanca de perfil/regra/checklist)
- Falha que aparece em 3+ retros → revisao do agente (perfil precisa ser reescrito)
- **Premissa fragil identificada em 2+ retros consecutivas sem acao → abrir issue obrigatoria** (nao opcional — mesmo que a decisao original nao tenha gerado perda ainda)

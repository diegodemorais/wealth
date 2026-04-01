# Changelog — checkin-automatico

Data: 2026-04-01

## Problemas identificados

1. **M1 shadow sem PTAX BCB**: Usava "retorno VWRA BRL mensal" sem especificar que cambio deve ser PTAX BCB venda (Padrao 2 metodologia-analitica.md). Criava risco de usar taxa estimada.
2. **Aprovacao em modo loop**: Passo 6 dizia sempre "pedir aprovacao do Diego" — incompativel com /loop autonomo. Agora diferencia modo autonomo de sessao interativa.
3. **Planilha indisponivel**: Nao havia fallback explicito. Adicionado: continuar com dados do sistema + data da ultima reconciliacao.
4. **CDS Brasil 5y ausente nos gatilhos**: Estava em checkin-manual mas nao aqui. Adicionado no Passo 4.
5. **Shadow A formula imprecisa**: "patrimonio anterior × (1 + retorno_VWRA_BRL_mensal)" — formula agora explica como converter: retorno_VWRA_BRL = retorno_VWRA_USD × (PTAX_fim / PTAX_inicio).
6. **Cambio no report**: Adicionado "(PTAX BCB venda da data)" na linha de cambio do report para reforcar padrao.

## Melhorias aplicadas

- Metodologia shadow M1 agora com formula PTAX BCB explicita
- Diferenciacao modo autonomo vs interativo no Passo 6
- Fallback para planilha indisponivel no Passo 1
- CDS Brasil 5y adicionado como gatilho
- Regras consolidadas no final com referencia explicita a metodologia-analitica.md Padrao 2

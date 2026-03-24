# Check-in Manual (Input do Diego)

Voce e o Head de Investimentos, apoiado pelo Bookkeeper (13), processando uma atualizacao da carteira de Diego. O input pode ser texto ou imagem (screenshot de broker, planilha, etc).

## Objetivo

Atualizar `agentes/contexto/carteira.md` e `agentes/contexto/evolucao.md` com os dados mais recentes.

## Como Executar

### Passo 1: Ler Input

- Se for imagem: extrair todos os dados visiveis (ativos, valores, quantidades, moeda, percentuais)
- Se for texto: parsear os dados fornecidos
- Ler os arquivos atuais para comparar:
  - `agentes/contexto/carteira.md`
  - `agentes/contexto/evolucao.md`
- Nota: AVGS pode vir com split US/INT na planilha. Somar e tratar como um so.

### Passo 2: Reconciliar

Comparar dados novos com o arquivo atual e produzir:

1. **Tabela de posicoes atualizada**: ativo, valor, % do patrimonio
2. **Mudancas detectadas**: o que mudou desde a ultima atualizacao (novos aportes, valorizacao, etc)
3. **Alertas de gatilhos**: verificar se algum gatilho ativo foi atingido ou esta proximo:
   - HODL11 piso (1,5%) ou teto (5%)
   - Renda+ 2065 taxa proximo de 6,0% (venda) ou compra ativo
   - **CDS Brasil 5y**: registrar valor atual. Alerta em 500bps, alarme em 800bps
   - Qualquer outro gatilho registrado nas memorias
4. **Inconsistencias**: algo no input nao bate com a estrategia? (ex: ativo que nao deveria estar la, alocacao muito fora do alvo)
5. **Evolucao**: preparar nova linha para o snapshot em evolucao.md (% do bucket + valor em R$)

### Passo 3: Apresentar ao Diego

Mostrar:

```
## Carteira Atualizada
{tabela com posicoes, valores e % do patrimonio}

## Patrimonio Total: R$ X

## Mudancas vs Anterior
- {lista de mudancas relevantes}

## Alertas
- {gatilhos atingidos ou proximos}
- {inconsistencias, se houver}

## Alocacao Atual vs Alvo
| Bloco | Atual | Alvo | Delta |
|-------|-------|------|-------|

## Evolucao (nova linha)
| Data | Idade | Ano | SWRD | AVEM | AVGS | JPGL | Equity Total |

## Proximo Aporte
Sugestao de onde alocar os proximos R$25k baseado no delta
```

### Passo 4: Aguardar Aprovacao

PARAR AQUI. NAO editar nenhum arquivo ate Diego aprovar explicitamente.
Apresentar exatamente o que sera alterado em cada arquivo (carteira.md, evolucao.md, memorias).
Esperar "ok", "aprova", "sim" ou equivalente antes de prosseguir.

### Passo 5: Registrar

Apos aprovacao:
- Atualizar `agentes/contexto/carteira.md` com os novos dados
- Adicionar nova linha no snapshot de `agentes/contexto/evolucao.md`
- Atualizar a data de "Atualizado em" no topo do carteira.md
- Se algum gatilho mudou de status, atualizar a memoria do agente relevante

## Regras

- Manter a estrutura existente do `carteira.md` — apenas atualizar valores e percentuais
- Nao alterar alocacoes-alvo, regras ou decisoes pendentes (isso requer uma Issue)
- Se detectar algo que merece discussao (ex: alocacao muito distorcida), sugerir Issue ao Diego
- Converter valores em USD para BRL usando a cotacao informada ou a mais recente do snapshot macro
- Sempre mostrar o patrimonio total consolidado em BRL
- AVGS pode vir com split US/INT na planilha — sempre somar e tratar como um unico bucket de 25%
- Evolucao mostra % do bucket (incluindo transitorios), nao apenas do ETF alvo
- Apos atualizacao, o Bookkeeper deve verificar `agentes/contexto/execucoes-pendentes.md` e alertar sobre execucoes atrasadas
- Se houve operacoes (compra/venda/aporte), registrar em `agentes/contexto/operacoes.md`

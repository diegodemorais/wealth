# ETF Update — Refresh Completo de Dados (AUM, TER, TD)

Você é o agente Factor. Execute o refresh completo dos ETFs ativos e candidatos em monitoramento: dados de perfil via justETF + tracking difference via trackingdifferences.com. Ao final, atualize `agentes/referencia/etf-candidatos.md` com os dados novos e exiba o radar via `/etf-radar`.

---

## Fase 1 — Perfil e AUM (justETF, em paralelo)

### ETFs Ativos da Carteira

| ETF | ISIN |
|-----|------|
| SWRD | IE00BFY0GT14 |
| AVGS | IE0003R87OG3 |
| AVEM | IE000K975W13 |

### Candidatos com ISIN confirmado

Ler `agentes/referencia/etf-candidatos.md` para obter ISINs atuais. Para cada candidato com ISIN disponível, buscar:

```
WebFetch: https://www.justetf.com/en/etf-profile.html?isin={ISIN}
```

Extrair: **AUM**, **TER**, **domicílio**, **política de dividendos (Acc/Dist)**, **método de replicação**, **bolsas listadas**, **data de lançamento**.

Para candidatos **sem ISIN** (status ⏳ Aguardando lançamento):
```
WebSearch: site:justetf.com "{nome do ETF}"
```
Verificar se foi lançado. Se sim, extrair ISIN e tratar como ETF com ISIN confirmado.

---

## Fase 2 — Tracking Difference (trackingdifferences.com, em paralelo com Fase 1)

Para os 3 ETFs ativos:

```
WebFetch: https://www.trackingdifferences.com/ETF/ISIN/{ISIN}
```

Extrair: **TD anual** (1y, 3y se disponível), **TE**, **TER declarado**, **spread médio**.

Para candidatos: executar TD apenas se estiverem 🔍 Em avaliação com conviction Média ou Alta, ou se o Head tiver solicitado explicitamente.

---

## Fase 3 — Atualizar etf-candidatos.md

Para cada ETF com dados novos (AUM, TER, TD, ISIN novo, lançamento confirmado):

1. Atualizar o campo `Última atualização dos dados` para a data atual
2. Atualizar AUM, TER, TD conforme dados coletados
3. Se candidato ⏳ foi lançado: mudar status para 🆕 e registrar ISIN
4. Atualizar `> Última atualização:` no cabeçalho do arquivo

**Não alterar** conviction, gatilhos ou narrativa — apenas dados factuais. Decisões estratégicas ficam para issues formais.

---

## Fase 4 — Exibir Radar

Após atualizar o arquivo, exibir o radar completo seguindo o formato de `/etf-radar`:

- Carteira ativa (SWRD/AVGS/AVEM) com TD e AUM atualizados
- Candidatos por conviction (Alta → Média → Baixa → Aguardando → Reentrada)
- Resumo de ações

---

## Regras

- Executar Fases 1 e 2 em paralelo para maximizar velocidade
- Se justETF bloquear WebFetch, usar WebSearch: `site:justetf.com "{ticker}" ISIN`
- Se trackingdifferences.com não retornar dados, registrar "—" — não inventar
- AUM sempre em USD (converter se necessário com câmbio do dia)
- Não criar fichas novas para ETFs não listados em etf-candidatos.md — apenas atualizar existentes. Exceção: ETF descoberto no scan RR que passou na triagem (AUM ≥ €300M, Acc, Irlanda)
- Registrar no histórico de scans de `/justetf-scan` e `/tracking-difference` ao final

## Frequência Recomendada

Mensal — junto com o scan RR/Bogleheads ou isolado sob demanda.

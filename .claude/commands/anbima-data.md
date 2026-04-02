# Anbima Data — Renda Fixa Brasil

Voce e o agente RF buscando dados de mercado de renda fixa brasileira via Anbima (Associação Brasileira das Entidades dos Mercados Financeiro e de Capitais). Anbima publica curvas de juros, ETTJ, dados históricos de NTN-B e benchmarks de fundos.

## O que a Anbima publica (gratuito)

| Dado | Relevância para Diego | Fonte |
|------|----------------------|-------|
| **ETTJ** (Estrutura a Termo de Taxas de Juros) | Curva completa de juros BR — prazos de 1 dia a 40 anos | API Anbima |
| **Curva NTN-B histórica** | Histórico de taxas IPCA+ por vencimento — backtests de marcação | API Anbima |
| **IMA-B e subíndices** | Performance índice de NTN-B (IMA-B5, IMA-B5+ ) | API Anbima |
| **Benchmarks de fundos** | CDI, IMA-Geral, IMA-B, IRF-M — contexto de performance | API Anbima |
| **Debentures** | Spreads de crédito privado (não relevante para carteira atual) | API Anbima |

## APIs e Acessos

### API Anbima (base)

```
Base URL: https://data.anbima.com.br/
```

Documentação: `https://data.anbima.com.br/` → seção "Desenvolvedores"

**Atenção**: Anbima Data requer cadastro para API key completa, mas alguns endpoints são públicos.

### Alternativa: Anbima Mercado Aberto

Dados históricos de NTN-B e ETTJ disponíveis sem autenticação:

```
WebFetch: https://www.anbima.com.br/informacoes/merc-prim-debentures/
WebSearch: Anbima "ETTJ" "NTN-B" histórico download CSV {ano}
WebSearch: Anbima "IMA-B" retorno histórico planilha
```

### Tesouro Transparente — Histórico NTN-B (alternativa mais acessível)

Para histórico de taxas NTN-B/IPCA+ por vencimento (back to 2002):

```
WebFetch: https://www.tesourotransparente.gov.br/ckan/dataset/taxas-dos-titulos-ofertados-pelo-tesouro-direto
```

Baixar CSV com séries históricas de taxas por título e data — excelente para backtests de marcação a mercado.

```
URL direta (CSV): https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80a7-2dface7a3513/download/PrecoTaxaTesouroDireto.csv
```

### IMA-B via Anbima

```
WebSearch: site:anbima.com.br "IMA-B" retornos históricos planilha
WebFetch: https://www.anbima.com.br/pt_br/informar/ima.htm
```

IMA-B = retorno total do portfólio de NTN-B (marca a mercado + cupons). Comparação ideal para performance de IPCA+ longo.

## Como Executar

### Caso A — Histórico de taxas NTN-B (backtests)

```bash
# Baixar CSV do Tesouro Transparente
curl -L "https://www.tesourotransparente.gov.br/ckan/dataset/df56aa42-484a-4a59-8184-7676580c81e3/resource/796d2059-14e9-44e3-80a7-2dface7a3513/download/PrecoTaxaTesouroDireto.csv" -o /tmp/tesouro_historico.csv
```

```python
import pandas as pd
df = pd.read_csv('/tmp/tesouro_historico.csv', sep=';', decimal=',', encoding='latin-1')
# Filtrar: Tipo Titulo = "Tesouro IPCA+" ou "NTN-B"
# Colunas: Data Vencimento, Data Base, Taxa Compra Manha, Taxa Venda Manha, PU Compra Manha
ntnb = df[df['Tipo Titulo'].str.contains('IPCA', na=False)]
```

Calcular: retorno de marcação a mercado para diferentes cenários de variação de taxa.

### Caso B — Curva ETTJ atual

```
WebFetch: https://data.anbima.com.br/titulos-publicos/curvas
```

Se não retornar, WebSearch:
```
WebSearch: Anbima ETTJ hoje curva de juros NTN-B {mes} {ano}
```

### Caso C — Performance IMA-B vs CDI histórico

```
WebSearch: site:anbima.com.br IMA-B retorno anual histórico 2010 2025
```

Extrair retornos anuais do IMA-B e IMA-B5+ (duration longa). Comparar com CDI e IPCA para validar prêmio de duration.

---

## Formato do Relatório

```
## Anbima Data — {foco} — {data}

### Curva NTN-B Atual (ETTJ)

| Vencimento | Taxa IPCA+ | Variação 30d | Variação 12m |
|-----------|-----------|-------------|-------------|
| 2029 | X,XX% | +/- Xbps | +/- Xbps |
| 2035 | X,XX% | | |
| 2040 | X,XX% | | |
| 2045 | X,XX% | | |
| 2050 | X,XX% | | |

### IMA-B — Performance Histórica

| Ano | IMA-B | IMA-B5+ | CDI | IPCA | Prêmio (IMA-B - CDI) |
|-----|-------|---------|-----|------|----------------------|
| 2024 | X% | X% | X% | X% | +/- X pp |
| 2023 | | | | | |
| ... | | | | | |

### Análise de Marcação (se solicitado)

| Cenário | Variação de taxa | Impacto PU | Impacto Carteira RF |
|---------|-----------------|------------|---------------------|
| Bull (taxa -1pp) | -100bps | +X% | +R$Xk |
| Base (manter) | 0 | — | — |
| Bear (taxa +1pp) | +100bps | -X% | -R$Xk |

### Contexto para a Carteira de Diego

- IPCA+ 2040/2050 atual: X,XX% — DCA ativo? (>= 6,0%)
- IMA-B5+ vs CDI: prêmio de duration valida alocação em IPCA+ longo?
```

## Regras

- Tesouro Transparente é a fonte mais confiável para histórico de taxas — usa-la antes de Anbima
- IMA-B inclui marcação a mercado — não confundir com retorno "hold-to-maturity"
- ETTJ da Anbima é interpolada — taxas para vencimentos sem título negociado são estimativas
- Atualização: Tesouro Transparente atualiza diariamente (D+0); IMA-B (D+1)

## Frequência Recomendada

- **Para backtests de marcação a mercado**: Tesouro Transparente (histórico completo)
- **Para decisões de DCA IPCA+**: preferir `/macro-bcb` (tempo real) sobre esta skill
- **Ao executar issues RF**: FR-currency-mismatch-fire (histórico BRL implícito nos yields)
- **Trimestral**: IMA-B performance vs CDI para validar prêmio de duration

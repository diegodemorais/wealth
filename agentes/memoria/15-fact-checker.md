# Memoria: Fact-Checker

> Somente verificacoes realizadas, fontes validadas/contestadas e decisoes registradas aqui.

---

## Verificacoes Realizadas

| Data | Claim | Agente | Fonte verificada | Resultado |
|------|-------|--------|-----------------|-----------|
| 2026-03-26 | CAPE Ibovespa ~8.9, media historica ~16.2 | Macro | Siblis Research (paywall) | UNCONFIRMED — P/E simples = 11.45/9.25; CAPE nao acessivel |
| 2026-03-26 | EWZ 3.8%/yr USD ultimos 10 anos | Advocate | Retornos anuais EWZ + calculo CAGR | INCORRETO — CAGR Dec2015-Dec2025 = ~9.9%/yr; Dec2014-Dec2024 = ~0.07%/yr |
| 2026-03-26 | MSCI World 12-14%/yr (10 anos) | Advocate | Referencia geral | PLAUSIVEL mas provavelmente inflado (tipico 9-12%) |
| 2026-03-26 | 4BRZ TER 0.31%, AUM USD 4.6B, LSE-listed | Factor | BlackRock/iShares, justetf.com, Bloomberg | PARCIAL — TER OK, AUM EUR 4,005M (~USD 4.3B), exchange e XETRA nao LSE |
| 2026-03-26 | AVEM 5-6% Brasil | Factor | Calculo indireto via MSCI EM LA | PLAUSIVEL — cap-weight = ~4.4%, AVEM facto sheet nao acessado |
| 2026-03-26 | Viceira (2001) labor income e country allocation | Factor | Wiley/Journal of Finance | PARCIAL — paper existe (JF 2001), mas argumento de country allocation nao e a tese central do paper |
| 2026-03-26 | Brasil 14-15% MSCI Emerging Markets | Factor | MSCI EM LA = 7.3% EM; Brasil = 59.7% de EM LA | INCORRETO — Brasil ~4.4% do MSCI EM, nao 14-15% |
| 2026-04-01 | AVEM 5.5% real USD (carteira.md) | carteira.md | AQR 2026 CMA Exhibit A1; JPM 2026 LTCMA; GMO Nov 2025; RA AAI | PARCIALMENTE INCORRETO — fontes citadas implicam media ~4.7-5.2%. 5.5% exige RA como 4a fonte. Ver detalhes abaixo. |

---

## Fontes Contestadas

| Data | Agente | Claim original | Problema encontrado | Resolucao |
|------|--------|---------------|--------------------|-----------|
| 2026-03-26 | Advocate | EWZ 3.8%/yr USD (10 anos) | CAGR real Dec2015-Dec2025 = ~9.9%/yr. 3.8% nao corresponde a nenhuma janela padrao | Pendente correcao do Advocate |
| 2026-03-26 | Factor | Brasil = 14-15% MSCI EM | Brasil e ~4.4% do MSCI EM (via MSCI EM LA = 7.3% x 59.7%). 14-15% e ~3x maior que o real | Pendente correcao do Factor |
| 2026-03-26 | Factor | 4BRZ listado na LSE | 4BRZ e listado na XETRA (Frankfurt). LSE-listed e o IBZL (share class distribuidora) | Pendente correcao do Factor |

---

## Papers Fantasmas (citados mas inexistentes)

| Data | Agente | Paper citado | Status |
|------|--------|-------------|--------|
| — | — | — | — |

---

## Verificacao Detalhada: AVEM 5.5% real USD (F3, 2026-04-01)

### Claim verificada
carteira.md linha 126: AVEM retorno real USD = 5.5%, fontes citadas = "AQR EM 5.1%, JPM 5.3%, GMO 3.8%"

### Fontes verificadas (fonte primaria)

| Fonte | Dado citado | Verificado | Versao | Nota metodologica |
|-------|------------|-----------|--------|-------------------|
| AQR | 5.1% | **5.1% real** (All EM, Exhibit A1) | AQR 2026 CMA, Dec 31, 2025 | "Local real" = USD real sob PPP (AQR confirma explicitamente no Special Topic de cambio) |
| JPM | 5.3% | **7.8% nominal USD** → ~5.3-5.5% real | JPM 2026 LTCMA, Oct 2025 | Deflacionar por ~2.3-2.5% inflacao EUA. "Dipping modestly after strong 2025 performance." |
| GMO | 3.8% | **3.8% real USD** (Emerging broad) | GMO Nov 30, 2025 | 7-year real return, cenario normal. EM Value = 6.8%. Dado: Nov 2025. |
| Research Affiliates | nao citado | **9.0% nominal USD** → ~6.5% real | AAI, ~Mar 2026 (via daytrading.com, atualizado Mar 2026) | CAPE-based. NAO citado na carteira mas registrado na memoria do sistema (reference_research_affiliates.md). |

### Matematica

- Media 3 fontes citadas: (5.1 + 5.3 + 3.8) / 3 = **4.73%** — abaixo de 5.5%
- Media 4 fontes (incluindo RA 6.5%): (5.1 + 5.3 + 3.8 + 6.5) / 4 = **5.18%** — ainda abaixo de 5.5%
- Apenas se RA for ponderado mais alto (por ser mais otimista / CAPE-based / EM favoravel) a media pode chegar a ~5.5%

### Veredicto

**STATUS: CONTESTADO — valor acima do suportado pelas fontes declaradas.**

- As 3 fontes citadas (AQR 5.1%, JPM ~5.3%, GMO 3.8%) implicam media ~4.7%, nao 5.5%
- Research Affiliates (~6.5% real) elevaria a media, mas nao esta citado como fonte na carteira
- GMO e a fonte mais conservadora e recente: 3.8% real (Nov 2025) — MSCI EM CAPE de 23 = 98th percentile desde 2001
- **O 5.5% esta 80 bps acima da media das fontes declaradas e 140 bps acima de GMO**
- Recomendacao: citar RA explicitamente se for usada para justificar 5.5%, OU ajustar para ~5.0-5.2% (media das 4 fontes) OU usar 4.7% (media das 3 fontes declaradas)

### Contexto adicional relevante
- AQR nota: MSCI EM CAPE = 23 = 98th percentile desde 2001 (incomum — EM caro historicamente)
- GMO EM Value = 6.8% real (Nov 2025) — AVEM tem tilt value, mas AVEM nao e pure EM Value
- JPM: "dipping modestly after strong 2025 performance" — dado ja incorpora rally de 2025

---

## Gatilhos e Regras

- Acionamento sob demanda por qualquer agente ou Diego
- Acionamento pelo Advocate como braco de pesquisa
- Acionamento automatico em issues com papers como justificativa e em debates Bull vs Bear
- Poder de contestacao: agente contestado DEVE fornecer fonte, corrigir claim, ou retirar afirmacao
- Hierarquia de fontes: meta-analise > peer-reviewed > NBER/SSRN > white paper > blog > opiniao

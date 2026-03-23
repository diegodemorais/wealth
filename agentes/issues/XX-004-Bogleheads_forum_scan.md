# XX-004-Bogleheads_forum_scan: Intelligence Gathering — Bogleheads forum scan

## Metadados

| Campo | Valor |
|-------|-------|
| **ID** | XX-004-Bogleheads_forum_scan |
| **Dono** | 00 Head |
| **Status** | Done |
| **Prioridade** | Media |
| **Participantes** | 02 Factor, 10 Advocate |
| **Dependencias** | — |
| **Criado em** | 2026-03-23 |
| **Origem** | Diego pediu scan do Bogleheads apos confirmar acesso via WebSearch |
| **Concluido em** | 2026-03-23 |

---

## Motivo / Gatilho

Bogleheads e o principal forum de investimento passivo/factor do mundo. Complementa o RR Forum (XX-003) com perspectiva de investidores internacionais (EU, nao-americanos). Diego pediu scan para identificar insights relevantes para a carteira.

---

## Metodo

Forum phpBB sem API publica. Acesso via:
- **WebSearch**: `site:bogleheads.org [keywords]` — funciona para indexar threads
- **Feed Atom (confirmado)**: `https://www.bogleheads.org/forum/feed.php?f=22&mode=topics`
  - f=22 = Non-US Investing (mais relevante)
  - f=10 = Investing Theory/General
  - Formato: Atom XML, parametros: `?f=<id>&mode=topics`
- WebFetch direto bloqueia (403/phpBB)

---

## Analise

### 1. Factor Investing UCITS (Avantis, JPGL, Multi-Factor)

**Threads consultados**:
- Factor Investing question [France] — t=410379
- New JP Morgan Global Multifactor ETF for Europeans — t=290012
- FF Factor based Quant ETFs — t=327119

**Insights**:
- JPGL e reconhecido como tendo "great construction": 1/3 value + 1/3 momentum + 1/3 quality, ponderado por inverse volatility, com constraints geograficas. TER 0.19% e frequentemente citado como vantagem.
- Multi-factor UCITS comparados: JPGL (JPMorgan), iShares Edge MSCI World Multifactor (IFSW, 0.50%), Invesco Quant ESG Multi-Factor, HSBC Multi-Factor. JPGL vence em TER e transparencia de construcao.
- Avantis UCITS (AVGS, AVEM) tem pouca discussao especifica — forum e dominado pelas versoes US-listed. AVWS (Global SCV UCITS) aparece em threads recentes de investidores EU.
- Consensus: JPGL e a opcao multi-factor UCITS mais citada e com melhor recepcao. Avantis UCITS tem pouco peer validation no forum (produtos mais novos), mas a marca tem reputacao solida.

**Relevancia**: Confirma JPGL como melhor multi-factor UCITS. O gap de -19.7% de JPGL no portfolio justifica prioridade de aportes.

---

### 2. FIRE para Investidores Internacionais

**Threads consultados**:
- Investment plan to FIRE in EU country — t=360352
- Help with FIRE Europe Plan — t=406235
- EU-Belgium: Optimal portfolio to FIRE? — t=287000
- Wiki: Building a non-US Boglehead portfolio

**Insights**:
- Portfolio global via UCITS (nao US-centric) e o padrao para non-US FIRE.
- SWR de referencia para non-US: **3.5%** (vs 4% americano), refletindo WHT, FX e menor home bias historico.
- UCITS IE-domiciled accumulating e o padrao-ouro para acumulacao FIRE fora dos US.
- Risco cambial para investidores fora de USD/EUR: hedge e caro e nao recomendado — exposicao e aceita.
- Sem threads especificos de investidores brasileiros em FIRE.

**Relevancia**: Carteira de Diego ja segue o padrao recomendado. O SWR 3.5% non-US e um dado novo — os guardrails atuais (R$250k sobre patrimonio crescente) sao conservadores e coerentes.

---

### 3. Small Cap Value + Emerging Markets UCITS

**Threads consultados**:
- International Small Cap Value? — t=414896
- Avantis EM Small Cap Equity ETF — t=417956
- Good options for emerging markets value/small? — t=447420
- EU investor equities portfolio — t=463667

**Insights**:
- AVES (Avantis EM Value, US-listed) e o favorito do forum para EM value: "value-focused, broad, systematic, cheaper" vs DGS (alto custo/turnover).
- AVEM e visto como "lower value loading, higher market cap" — broad EM com tilt leve, nao pure value play. Alguns relatos de underperformance vs VWO.
- Para UCITS: nao existe equivalente puro de AVES. AVEM UCITS e o mais proximo disponivel para EU investors.
- Consensus: Avantis e o provedor preferido para EM value/small. AVEM UCITS e o trade-off aceito para quem nao pode usar US-listed.

**Relevancia**: Confirma que AVEM funciona como EM broad com tilt leve (~70% neutro / 30% fatorial — mapeado na memoria do Factor). AVES como legado correto — a decisao de nao comprar mais e consistente com o forum.

---

### 4. Momentum em ETFs UCITS

**Threads consultados**:
- Factor investing questions (value and momentum) — t=415802
- How to Add Momentum Factor — t=289467
- Vanguard Momentum ETF (VMOM) thoughts [UK] — t=256781

**Insights**:
- Momentum standalone UCITS: basicamente apenas iShares IWMO (MSCI Momentum, TER 0.30%). Concentracao setorial (Tech + Financials) dificulta isolar momentum puro.
- Multi-factor como alternativa: JPGL e iShares Multifactor sao tratados como a forma eficiente de capturar momentum sem turnover excessivo.
- Larry Swedroe citado como favoravel ao iShares Multifactor (que combina fatores com baixa correlacao).

**Relevancia**: Valida a remocao de IWMO e captura de momentum via JPGL. Exatamente o racional registrado na memoria do Factor.

---

### 5. SWRD vs Outros UCITS Broad Market (Accumulating)

**Threads consultados**:
- SWRD vs IWDA — t=285916, t=289207, t=450894
- VWRD or SWRD for VT Ireland equivalent? — t=287962
- The best accumulating global equity ETF in 2024 — t=443539
- TER or tracking difference to choose ETF? — t=431088

**Comparativo principal — SWRD vs IWDA**:

| Metrica | SWRD (SPDR) | IWDA (iShares) |
|---------|-------------|-----------------|
| TER | 0.12% | 0.20% |
| Securities lending | Nao | Sim (~0.03% receita offset) |
| Delta real (ajustado) | — | ~0.05% a mais (nao 0.08%) |
| AUM | ~$1.4B | ~$70B+ |
| Liquidez | Menor | Muito maior |
| Domicilio | Irlanda | Irlanda |
| Tracking difference historica | Ligeiramente inferior | Melhor (securities lending compensa TER) |

**Comparativo SWRD vs VWRA/VWCE**:

| Metrica | SWRD + EIMI | VWRA/VWCE |
|---------|-------------|-----------|
| TER total | ~0.13% ponderado | 0.22% |
| Cobertura | Dev only + EM separado | All-World (one fund) |
| Rebalanceamento | Necessario | Automatico |
| Tracking difference | Boa | Excelente (~0.03%) |

**Novos concorrentes (2023-2025)**:
- WEBN (Amundi Prime ACWI): TER 0.07%, mas AUM pequeno (~53M), TD desconhecida
- FWRA (Invesco FTSE All-World): TER 0.15%, lancado jun/2023
- Consensus: TERs agressivos, mas fund size pequeno + historico curto + risco de fee hike pos-escala. Vanguard/iShares continuam preferidos.

**Consensus Bogleheads**: SWRD e excelente. Delta real vs IWDA e ~5 bps (nao 8 bps do TER headline). Para posicoes ja estabelecidas, nao vale trocar. Para novos aportes, ambos sao aceitaveis — IWDA pode ter vantagem pratica pela liquidez.

**Relevancia**: SWRD confirmado como escolha solida. Nenhuma razao para trocar. Os ~5 bps de delta vs IWDA sao irrelevantes na escala da carteira. A posicao e madura e nao recebe aportes novos — correto.

---

### 6. Tax Efficiency para Investidores Internacionais

**Wikis e threads consultados**:
- Wiki: Nonresident alien investors and Ireland domiciled ETFs
- Wiki: Non-US investor's guide to navigating US tax traps
- Are you safe from US estate tax if you hold Irish ETFs at a US broker? — t=449703
- Wiki: Nonresident alien's ETF domicile decision table

**Insights**:

**Estrutura de WHT (Ireland-domiciled)**:
- ETF IE-domiciled paga 15% WHT internamente sobre dividendos US (treaty US-Ireland)
- US-domiciled: 30% WHT direto ao investidor non-US sem treaty (Brasil nao tem treaty com US)
- Custo total: IE-domiciled ~0.396% all-in vs US-domiciled ~0.711% para NRA sem treaty — diferenca de ~31.5 bps/ano

**Estate Tax**:
- UCITS ETFs IE-domiciled NAO sao US situs assets — nao sujeitos a estate tax americana
- Confirmado: "holding Ireland domiciled ETFs does not leave you at risk of either US or Irish estate or inheritance tax"
- **ATENCAO**: Cash acima de $60k em broker US (IBKR) E considerado US situs asset — sujeito a estate tax

**Accumulating vs Distributing**: Accumulating preferido para acumulacao — sem cash drag, deferral fiscal ate venda.

**Relevancia**: Carteira 100% alinhada com o consenso. O ponto novo e o **limite de $60k em cash no IBKR**. Vale verificar se o saldo cash no IBKR fica consistentemente abaixo desse threshold — risco de estate tax sobre cash, nao sobre ETFs.

---

## Conclusao

Carteira de Diego esta **amplamente alinhada com o consensus Bogleheads** para investidores internacionais. Nenhuma acao de alocacao requerida.

**Um ponto acionavel novo**: Cash acima de $60k no IBKR e US situs asset sujeito a estate tax. Verificar saldo cash operacional — e recomendacao do forum manter abaixo desse limite.

**RSS disponivel para monitoramento futuro**: `https://www.bogleheads.org/forum/feed.php?f=22&mode=topics` (Non-US Investing, Atom). Util para scans periodicos sem WebSearch manual.

---

## Resultado

| Tipo | Detalhe |
|------|---------|
| **Alocacao** | Nenhuma — carteira alinhada com consensus |
| **Estrategia** | JPGL como foco de aportes confirmado; SWRD correto; AVEM trade-off aceito |
| **Conhecimento** | SWR non-US = 3.5% (dado novo). Cash IBKR < $60k para evitar estate tax sobre cash. RSS feed disponivel para scans futuros |
| **Memoria** | Cash IBKR < $60k como threshold de estate tax — registrar no Tax agent |
| **Nenhum** | — |

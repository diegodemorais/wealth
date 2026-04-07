# Multi-LLM Query — Validação Multi-Modelo

Executa `scripts/multi_llm_query.py` para consultar múltiplos LLMs em paralelo e sintetizar as respostas.

O argumento `$ARGUMENTS` é o prompt ou instrução do Diego. Se vazio, perguntar o que quer validar.

## Catálogo

Rode `python3 scripts/multi_llm_query.py --list` para ver modelos disponíveis e defaults.
<!-- SYNC: catálogo e presets definidos em scripts/multi_llm_query.py -->

### Presets de system prompt

Em vez de escrever system prompt do zero, use `--preset`:

| Preset | Quando usar |
|--------|------------|
| `finance` | Validação geral de premissas financeiras |
| `fire` | Withdrawal strategies, SWR, spending |
| `factor` | ETFs, factor premiums, alocação |
| `stress` | Stress-test adversarial de qualquer tese |

## Workflow

### 1. Preparar o prompt

Analise `$ARGUMENTS` e escreva um system prompt que defina o papel do LLM relevante ao tema. Favor especificidade sobre personas genéricas. Temperature: 0.3 default; 0.2 para perguntas quantitativas; 0.4 para exploratórias.

**Regra Round 2 (anti-ancoragem)** — nunca incluir no prompt:
- Tickers específicos — usar categorias ("developed markets ETF", "small-cap value tilt")
- Posição do time — pedir opinião independente
- Números exatos da carteira — usar perfil genérico

Contexto padrão: "Brazilian investor, age 39, 14-year accumulation horizon, targeting FIRE at 50. 100% international equity via UCITS ETFs (Ireland-domiciled). Fixed income: inflation-linked sovereign bonds (15%). Crypto: 3% Bitcoin."

### 2. Executar

Se o prompt for longo (>500 chars), salvar em arquivo temporário e usar `--file`. Usar `--system` para o system prompt. Exemplo:

```bash
python3 scripts/multi_llm_query.py \
  --prompt "Is a 50/30/20 split between market-cap, small-cap value, and EM reasonable for a 14-year accumulation phase?" \
  --system "You are a portfolio strategist specializing in evidence-based investing." \
  --temperature 0.3
```

Ou com preset (mais rápido):
```bash
python3 scripts/multi_llm_query.py \
  --prompt "Is 50/30/20 optimal for a 14-year accumulation phase?" \
  --preset factor
```

Flags úteis: `--all-models` (inclui llama405b), `--preset NAME`, `--context file.txt`, `--max-tokens 8192`, `--no-save`. Veja `--help` para todas as opções.

### 3. Sintetizar

Após receber os outputs, analisar comparativamente:

```
## Síntese Multi-LLM — {tema}

### Consenso ({N}/{total} modelos)
- ...

### Divergências
| Ponto | Modelo A | Modelo B | Evidência mais forte |
|-------|----------|----------|---------------------|

### Insights Únicos
- {modelo}: {insight} — [verificar / aceitar / descartar]

### Red Flags
- {modelo}: {erro} — [corrigido / descartado]

### Veredicto
{1-3 frases com a conclusão ponderada}
```

## Regras

- **Nunca enviar dados pessoais** (nome, CPF, contas, senhas) nos prompts
- **Patrimônio genérico**: usar "~R$X million" em vez do valor exato
- **Sempre sintetizar** — não entregar output bruto ao Diego sem análise
- **Citar modelo** quando um insight vier de apenas 1 fonte
- **Fact-check obrigatório** se algum modelo citar paper/dado não familiar

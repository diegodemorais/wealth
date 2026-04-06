# Multi-LLM Query — Validação Multi-Modelo

Executa `scripts/multi_llm_query.py` para consultar múltiplos LLMs em paralelo e sintetizar as respostas.

## Argumento

O argumento `$ARGUMENTS` é o prompt ou instrução do Diego. Se vazio, perguntar o que quer validar.

## Catálogo Oficial (6 modelos, 4 providers)

| Modelo | Provider | Papel |
|--------|----------|-------|
| Gemini 2.5 Flash | Google (pago) | Âncora frontier |
| DeepSeek R1 | OpenRouter (free) | Melhor reasoning |
| Qwen 3 235B | SambaNova (free) | Maior free, perspectiva chinesa |
| Llama 3.1 405B | SambaNova (free) | Maior Llama, Meta data |
| GPT-OSS 120B | Groq (free) | OpenAI lineage, ultra-rápido |
| Llama 4 Scout | Groq (free) | MoE, arquitetura diferente |

Default: gemini, deepseek-r1, qwen235b, gpt-oss, llama4 (5 modelos, 1 por provider).

## Workflow

### Passo 1: Preparar o prompt

Analise `$ARGUMENTS` e classifique o tipo de query:

| Tipo | System Prompt | Temperature |
|------|---------------|-------------|
| **Validar premissas** | "You are a quantitative financial analyst. Challenge each assumption with evidence." | 0.2 |
| **Validar alocação** | "You are a portfolio strategist specializing in evidence-based investing." | 0.3 |
| **Stress test** | "You are a risk analyst. Find weaknesses and failure modes." | 0.3 |
| **FIRE/withdrawal** | "You are a retirement planning expert specializing in safe withdrawal strategies." | 0.2 |
| **Pergunta aberta** | "You are a financial analyst with expertise in global markets." | 0.4 |

**Regra Round 2 (anti-ancoragem):** Nunca incluir no prompt:
- Tickers específicos (SWRD, AVGS) — usar categorias ("developed markets ETF", "small-cap value tilt")
- Posição do time ("nosso time recomenda X") — pedir opinião independente
- Números da carteira de Diego (patrimônio exato, alocação %) — usar perfil genérico

Usar contexto genérico: "Brazilian investor, age 39, 14-year accumulation horizon, targeting FIRE at 50. 100% international equity via UCITS ETFs (Ireland-domiciled). Fixed income: inflation-linked sovereign bonds (15%). Crypto: 3% Bitcoin."

### Passo 2: Preparar o command

Construir o comando completo. Exemplos:

```bash
# Prompt direto
python3 scripts/multi_llm_query.py \
  --prompt "Is a 50/30/20 split between market-cap, small-cap value, and emerging markets reasonable for a 14-year accumulation phase?" \
  --system "You are a portfolio strategist specializing in evidence-based investing." \
  --temperature 0.3

# Com arquivo de prompt (para prompts longos)
python3 scripts/multi_llm_query.py \
  --file /tmp/prompt.txt \
  --system "You are a quantitative financial analyst." \
  --temperature 0.2

# Modelos específicos
python3 scripts/multi_llm_query.py \
  --prompt "..." \
  --models gemini deepseek-r1 qwen235b \
  --temperature 0.2

# Todos os modelos (incluindo llama405b)
python3 scripts/multi_llm_query.py \
  --prompt "..." \
  --all-models
```

Se o prompt for longo (>500 chars), salvar em arquivo temporário e usar `--file`.

### Passo 3: Executar

Rodar o script via Bash. Timeout padrão: 120s (suficiente para DeepSeek R1 que é mais lento).

### Passo 4: Sintetizar

Após receber os outputs, analisar comparativamente:

1. **Consenso**: onde todos/maioria concordam (listar)
2. **Divergência**: onde há desacordo material (listar com posição de cada modelo)
3. **Insights únicos**: algo que apenas 1 modelo trouxe (pode ser valioso ou ruído)
4. **Red flags**: erros factuais óbvios, confusão nominal/real, papers inventados
5. **Veredicto**: o que a preponderância das evidências indica

Formato da síntese:

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

## Flags úteis

- `--check` — health check rápido de todos os modelos (sem prompt)
- `--list` — listar modelos disponíveis
- `--all-models` — usar todos (inclui llama405b além dos 5 default)
- `--no-save` — não salvar output em analysis/
- `--save path.md` — salvar em local específico
- `--max-tokens 8192` — para respostas longas (default: 4096)

## Regras

- **Nunca enviar dados pessoais** (nome, CPF, contas, senhas) nos prompts
- **Patrimônio genérico**: usar "~R$X million" em vez do valor exato
- **Sempre sintetizar** — não entregar output bruto ao Diego sem análise
- **Citar modelo** quando um insight específico vier de apenas 1 fonte
- **Fact-check obrigatório** se algum modelo citar paper/dado não familiar

#!/usr/bin/env python3
"""
multi_llm_query.py — Consulta paralela a múltiplos LLMs
Uso:
    python3 scripts/multi_llm_query.py --prompt "sua pergunta aqui"
    python3 scripts/multi_llm_query.py --file prompt.txt
    python3 scripts/multi_llm_query.py --prompt "..." --models gemini perplexity
    python3 scripts/multi_llm_query.py --prompt "..." --save resultados.md

API Keys (via .env ou variáveis de ambiente):
    GEMINI_API_KEY         — gemini.google.com/app → API
    PERPLEXITY_API_KEY     — perplexity.ai/settings → API
    GROQ_API_KEY           — console.groq.com (grátis)
    OPENROUTER_API_KEY     — openrouter.ai/keys (grátis)
"""

import asyncio
import argparse
import os
import sys
from datetime import datetime
from pathlib import Path

import litellm
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

# Suprimir logs verbose do litellm
litellm.suppress_debug_info = True
os.environ["LITELLM_LOG"] = "ERROR"

# ── Modelos ────────────────────────────────────────────────────────────────────
# Pago: Gemini Pro + Perplexity Pro
# Grátis: Groq (Llama 4 + DeepSeek R1) + OpenRouter (Qwen3 235B)

MODELS = {
    "gemini":     {"id": "gemini/gemini-2.5-pro",                          "pago": True},
    "perplexity": {"id": "perplexity/sonar-pro",                           "pago": True},
    "llama4":     {"id": "groq/meta-llama/llama-4-maverick-17b-128e-instruct", "pago": False},
    "deepseek":   {"id": "groq/deepseek-r1-distill-llama-70b",             "pago": False},
    "qwen3":      {"id": "openrouter/qwen/qwen3-235b-a22b:free",           "pago": False},
}

ENV_KEYS = {
    "gemini":     "GEMINI_API_KEY",
    "perplexity": "PERPLEXITY_API_KEY",
    "llama4":     "GROQ_API_KEY",
    "deepseek":   "GROQ_API_KEY",
    "qwen3":      "OPENROUTER_API_KEY",
}

SEPARADOR = "=" * 68


async def query_model(name: str, cfg: dict, prompt: str, timeout: int = 60):
    """Chama um modelo e retorna (name, output, error)."""
    env_key = ENV_KEYS.get(name)
    if env_key and not os.getenv(env_key):
        return name, None, f"⚠️  {env_key} não configurada"

    try:
        resp = await asyncio.wait_for(
            litellm.acompletion(
                model=cfg["id"],
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
            ),
            timeout=timeout,
        )
        return name, resp.choices[0].message.content, None
    except asyncio.TimeoutError:
        return name, None, "⏱️  Timeout"
    except Exception as e:
        return name, None, f"❌ {type(e).__name__}: {str(e)[:120]}"


def formatar_saida(results: list, prompt: str) -> str:
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    linhas = [f"# Multi-LLM Query — {ts}\n", f"**Prompt:** {prompt[:200]}\n", ""]

    for name, output, error in results:
        cfg = MODELS[name]
        tag = "💳" if cfg["pago"] else "🆓"
        linhas.append(SEPARADOR)
        linhas.append(f"## {tag} {name.upper()} ({cfg['id']})")
        linhas.append(SEPARADOR)
        if error:
            linhas.append(error)
        else:
            linhas.append(output)
        linhas.append("")

    return "\n".join(linhas)


async def main():
    parser = argparse.ArgumentParser(description="Consulta paralela a múltiplos LLMs")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--prompt", "-p", type=str, help="Prompt direto")
    group.add_argument("--file",   "-f", type=str, help="Arquivo com o prompt")
    parser.add_argument("--models", "-m", nargs="+", choices=list(MODELS.keys()),
                        help=f"Modelos a usar (default: todos). Opções: {list(MODELS.keys())}")
    parser.add_argument("--save",  "-s", type=str, help="Salvar resultado em arquivo .md")
    parser.add_argument("--timeout", type=int, default=90, help="Timeout por modelo em segundos")
    args = parser.parse_args()

    # Prompt
    if args.file:
        prompt = Path(args.file).read_text(encoding="utf-8").strip()
    else:
        prompt = args.prompt.strip()

    # Modelos selecionados
    modelos = {k: v for k, v in MODELS.items()
               if (args.models is None or k in args.models)}

    print(f"\n🔄 Consultando {len(modelos)} modelo(s) em paralelo...")
    print(f"   {', '.join(modelos.keys())}\n")

    # Disparo paralelo
    tasks = [query_model(name, cfg, prompt, args.timeout)
             for name, cfg in modelos.items()]
    results = await asyncio.gather(*tasks)

    # Exibir
    saida = formatar_saida(results, prompt)
    print(saida)

    # Resumo
    ok  = sum(1 for _, o, _ in results if o)
    err = sum(1 for _, _, e in results if e)
    print(f"\n✅ {ok} ok  |  ❌ {err} erro(s)")

    # Salvar
    if args.save:
        Path(args.save).write_text(saida, encoding="utf-8")
        print(f"💾 Salvo em: {args.save}")
    elif ok > 0:
        ts = datetime.now().strftime("%Y%m%d_%H%M")
        nome = f"analysis/multi_llm_{ts}.md"
        Path("analysis").mkdir(exist_ok=True)
        Path(nome).write_text(saida, encoding="utf-8")
        print(f"💾 Auto-salvo em: {nome}")


if __name__ == "__main__":
    asyncio.run(main())

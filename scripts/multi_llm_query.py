#!/usr/bin/env python3
"""
multi_llm_query.py v2 — Consulta paralela a múltiplos LLMs

Uso:
    python3 scripts/multi_llm_query.py --prompt "sua pergunta aqui"
    python3 scripts/multi_llm_query.py --file prompt.txt --system "You are a financial analyst"
    python3 scripts/multi_llm_query.py --prompt "..." --models qwen235b deepseek-r1 gemini
    python3 scripts/multi_llm_query.py --prompt "..." --context contexto.txt --save resultado.md
    python3 scripts/multi_llm_query.py --check  # testa conectividade de todos os modelos

API Keys (via .env ou variáveis de ambiente):
    GEMINI_API_KEY      — aistudio.google.com/apikey (pago)
    GROQ_API_KEY        — console.groq.com (free)
    OPENROUTER_API_KEY  — openrouter.ai/keys (free)
    SAMBANOVA_API_KEY   — cloud.sambanova.ai (free)
"""

import asyncio
import argparse
import os
import sys
import time
from collections import defaultdict
from datetime import datetime
from pathlib import Path
from typing import NamedTuple

import litellm
from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

litellm.suppress_debug_info = True
os.environ["LITELLM_LOG"] = "ERROR"

BASE_DIR = Path(__file__).parent.parent

# ── Modelos: 6 oficiais, 4 providers ─────────────────────────────────────────
# SYNC: atualizar .claude/commands/multi-llm.md ao mudar modelos

MODELS = {
    "gemini":      {"id": "gemini/gemini-2.5-flash",                         "env_key": "GEMINI_API_KEY",     "provider": "gemini"},
    "deepseek-r1": {"id": "openrouter/deepseek/deepseek-r1:free",           "env_key": "OPENROUTER_API_KEY", "provider": "openrouter"},
    "qwen235b":    {"id": "sambanova/Qwen3-235B-A22B",                      "env_key": "SAMBANOVA_API_KEY",  "provider": "sambanova"},
    "llama405b":   {"id": "sambanova/Meta-Llama-3.1-405B-Instruct",         "env_key": "SAMBANOVA_API_KEY",  "provider": "sambanova"},
    "gpt-oss":     {"id": "groq/openai/gpt-oss-120b",                       "env_key": "GROQ_API_KEY",       "provider": "groq"},
    "llama4":      {"id": "groq/meta-llama/llama-4-scout-17b-16e-instruct", "env_key": "GROQ_API_KEY",       "provider": "groq"},
}

DEFAULT_MODELS = ["gemini", "deepseek-r1", "qwen235b", "gpt-oss", "llama4"]

SEPARADOR = "=" * 68
STAGGER_DELAY = 0.8  # segundos entre chamadas ao mesmo provider


class ModelResult(NamedTuple):
    name: str
    model_id: str
    output: str | None
    error: str | None
    latency: float
    usage: dict

    @property
    def ok(self) -> bool:
        return self.output is not None


async def query_model(
    name: str, cfg: dict, prompt: str, system: str | None,
    temperature: float, max_tokens: int, timeout: int,
) -> ModelResult:
    """Chama um modelo e retorna ModelResult."""
    env_key = cfg["env_key"]
    if env_key and not os.getenv(env_key):
        return ModelResult(name, cfg["id"], None, f"[SKIP] {env_key} nao configurada", 0.0, {})

    messages = []
    if system:
        messages.append({"role": "system", "content": system})
    messages.append({"role": "user", "content": prompt})

    t0 = time.monotonic()
    try:
        resp = await asyncio.wait_for(
            litellm.acompletion(
                model=cfg["id"],
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                num_retries=3,
            ),
            timeout=timeout,
        )
        latency = time.monotonic() - t0

        if not resp.choices:
            return ModelResult(name, cfg["id"], None, "[ERRO] Resposta sem choices", latency, {})

        content = resp.choices[0].message.content
        if not content or not content.strip():
            return ModelResult(name, cfg["id"], None, "[ERRO] Resposta vazia", latency, {})

        finish = resp.choices[0].finish_reason
        if finish and finish != "stop":
            content += f"\n\n[TRUNCADO — finish_reason={finish}]"

        usage = {}
        if hasattr(resp, "usage") and resp.usage:
            usage = {
                "prompt_tokens": getattr(resp.usage, "prompt_tokens", 0),
                "completion_tokens": getattr(resp.usage, "completion_tokens", 0),
                "total_tokens": getattr(resp.usage, "total_tokens", 0),
            }

        return ModelResult(name, cfg["id"], content, None, latency, usage)

    except asyncio.TimeoutError:
        return ModelResult(name, cfg["id"], None, f"[TIMEOUT] {timeout}s", time.monotonic() - t0, {})
    except Exception as e:
        return ModelResult(name, cfg["id"], None, f"[ERRO] {type(e).__name__}: {str(e)[:200]}", time.monotonic() - t0, {})


async def run_queries_staggered(
    modelos: dict, prompt: str, system: str | None,
    temperature: float, max_tokens: int, timeout: int,
) -> list[ModelResult]:
    """Dispara queries com stagger por provider para evitar 429."""
    by_provider: dict[str, list[str]] = defaultdict(list)
    for name, cfg in modelos.items():
        by_provider[cfg["provider"]].append(name)

    async def staggered_group(provider_models: list[str]) -> list[ModelResult]:
        tasks = []
        for i, name in enumerate(provider_models):
            if i > 0:
                await asyncio.sleep(STAGGER_DELAY)
            tasks.append(asyncio.create_task(
                query_model(name, modelos[name], prompt, system, temperature, max_tokens, timeout)
            ))
        return list(await asyncio.gather(*tasks))

    provider_tasks = [staggered_group(names) for names in by_provider.values()]
    grouped = await asyncio.gather(*provider_tasks)
    return [r for group in grouped for r in group]


def formatar_saida(results: list[ModelResult], prompt: str, system: str | None, temperature: float) -> tuple[str, int, int]:
    """Formata output markdown. Retorna (texto, ok_count, err_count)."""
    ts = datetime.now().strftime("%Y-%m-%d %H:%M")
    linhas = [
        f"# Multi-LLM Query — {ts}",
        "",
        f"**Prompt:** {prompt[:500]}",
    ]
    if system:
        linhas.append(f"\n**System:** {system[:200]}")
    linhas.append(f"\n**Temperature:** {temperature}")
    linhas.append("")

    for r in results:
        tok_str = f" | {r.usage.get('total_tokens', '?')} tok" if r.usage else ""
        linhas.append(SEPARADOR)
        linhas.append(f"## {r.name.upper()} ({r.model_id})")
        linhas.append(f"*{r.latency:.1f}s{tok_str}*")
        linhas.append(SEPARADOR)
        linhas.append(r.output if r.ok else r.error)
        linhas.append("")

    # Métricas (single pass)
    linhas.append(SEPARADOR)
    linhas.append("## Metricas")
    linhas.append("")
    linhas.append("| Modelo | Latencia | Tokens | Status |")
    linhas.append("|--------|----------|--------|--------|")
    ok, err = 0, 0
    for r in results:
        tok = r.usage.get("total_tokens", "—") if r.usage else "—"
        status = "OK" if r.ok else (r.error[:30] if r.error else "?")
        linhas.append(f"| {r.name} | {r.latency:.1f}s | {tok} | {status} |")
        if r.ok:
            ok += 1
        else:
            err += 1
    linhas.append("")
    linhas.append(f"**Resultado:** {ok} ok | {err} erro(s)")

    return "\n".join(linhas), ok, err


async def health_check(modelos: dict):
    """Testa conectividade com todos os modelos."""
    print(f"\n{'='*50}")
    print(f"  Health Check — {len(modelos)} modelo(s)")
    print(f"{'='*50}\n")

    results = await run_queries_staggered(modelos, "Reply with exactly: OK", None, 0.1, 10, 15)

    for r in results:
        if r.ok:
            print(f"  [OK]   {r.name:15s} ({r.latency:.1f}s)")
        else:
            print(f"  [FAIL] {r.name:15s} — {r.error}")

    ok = sum(1 for r in results if r.ok)
    print(f"\n  {ok}/{len(results)} modelos respondendo.\n")


async def main():
    parser = argparse.ArgumentParser(
        description="Consulta paralela a multiplos LLMs",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )

    group = parser.add_mutually_exclusive_group()
    group.add_argument("--prompt", "-p", type=str, help="Prompt direto")
    group.add_argument("--file", "-f", type=str, help="Arquivo com o prompt")
    group.add_argument("--check", action="store_true", help="Health check de todos os modelos")

    parser.add_argument("--system", type=str, default=None, help="System prompt")
    parser.add_argument("--system-file", type=str, default=None, help="Arquivo com system prompt")
    parser.add_argument("--context", "-c", type=str, default=None,
                        help="Arquivo de contexto (prepended ao prompt)")
    parser.add_argument("--models", "-m", nargs="+", choices=list(MODELS.keys()),
                        help=f"Modelos a usar (default: {DEFAULT_MODELS})")
    parser.add_argument("--all-models", action="store_true",
                        help="Usar todos os modelos disponiveis")
    parser.add_argument("--save", "-s", type=str, help="Salvar resultado em arquivo .md")
    parser.add_argument("--no-save", action="store_true", help="Nao auto-salvar")
    parser.add_argument("--timeout", type=int, default=120, help="Timeout por modelo (s)")
    parser.add_argument("--temperature", "-t", type=float, default=0.3,
                        help="Temperature (default: 0.3)")
    parser.add_argument("--max-tokens", type=int, default=4096,
                        help="Max tokens por resposta (default: 4096)")
    parser.add_argument("--list", action="store_true", help="Listar modelos disponiveis")

    args = parser.parse_args()

    if args.list:
        print("\nModelos disponiveis:\n")
        print(f"  {'Nome':15s} {'Provider':12s} {'Model ID'}")
        print(f"  {'-'*15} {'-'*12} {'-'*50}")
        for name, cfg in MODELS.items():
            default = " *" if name in DEFAULT_MODELS else ""
            print(f"  {name:15s} {cfg['provider']:12s} {cfg['id']}{default}")
        print(f"\n  * = modelo default\n")
        return

    if args.all_models:
        modelos = dict(MODELS)
    elif args.models:
        modelos = {k: v for k, v in MODELS.items() if k in args.models}
    else:
        modelos = {k: v for k, v in MODELS.items() if k in DEFAULT_MODELS}

    if args.check:
        await health_check(modelos)
        return

    if not args.prompt and not args.file:
        parser.error("--prompt ou --file e obrigatorio (exceto com --check ou --list)")

    prompt = (Path(args.file).read_text(encoding="utf-8").strip()
              if args.file else args.prompt.strip())

    if not prompt:
        print("[ERRO] Prompt vazio.")
        sys.exit(1)

    if args.context:
        ctx = Path(args.context).read_text(encoding="utf-8").strip()
        prompt = f"{ctx}\n\n---\n\n{prompt}"

    system = args.system
    if args.system_file:
        system = Path(args.system_file).read_text(encoding="utf-8").strip()

    print(f"\n  Consultando {len(modelos)} modelo(s) em paralelo...")
    print(f"  {', '.join(modelos.keys())}")
    if system:
        print(f"  System prompt: {system[:80]}...")
    print(f"  Temperature: {args.temperature} | Max tokens: {args.max_tokens}")
    print()

    results = await run_queries_staggered(
        modelos, prompt, system, args.temperature, args.max_tokens, args.timeout,
    )

    saida, ok, _ = formatar_saida(results, prompt, system, args.temperature)
    print(saida)

    if args.save:
        save_path = Path(args.save)
        save_path.parent.mkdir(parents=True, exist_ok=True)
        save_path.write_text(saida, encoding="utf-8")
        print(f"\n  Salvo em: {save_path}")
    elif not args.no_save and ok > 0:
        ts = datetime.now().strftime("%Y%m%d_%H%M")
        analysis_dir = BASE_DIR / "analysis"
        analysis_dir.mkdir(exist_ok=True)
        nome = analysis_dir / f"multi_llm_{ts}.md"
        nome.write_text(saida, encoding="utf-8")
        print(f"\n  Auto-salvo em: {nome}")


if __name__ == "__main__":
    asyncio.run(main())

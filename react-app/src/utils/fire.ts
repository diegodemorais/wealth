/**
 * fire.ts — Utilitários centralizados para cálculos FIRE
 *
 * REGRA: toda lógica compartilhada entre abas fica aqui.
 * Importar daqui, não reescrever inline.
 */

// ── Semáforo de P(FIRE) ───────────────────────────────────────────────────────

/**
 * Cor CSS para P(FIRE) — threshold único para todo o dashboard.
 *   ≥ 90% → verde   (on track)
 *   ≥ 85% → amarelo (adequate — limiar do fire_age_threshold)
 *   <  85% → vermelho (concern)
 *
 * Thresholds deliberadamente conservadores: o modelo MC roda com SWR=3%
 * e spending smile, então P=85% já representa cenário robusto.
 */
export function pfireColor(p: number | null | undefined): string {
  if (p == null) return 'var(--muted)';
  if (p >= 90) return 'var(--green)';
  if (p >= 85) return 'var(--yellow)';
  return 'var(--red)';
}

/**
 * Rótulo de status para P(FIRE)
 */
export function pfireLabel(p: number | null | undefined): string {
  if (p == null) return '—';
  if (p >= 90) return 'ON TRACK';
  if (p >= 85) return 'ADEQUADO';
  return 'ATENÇÃO';
}

// ── Projeção de Acumulação (SWR-based) ───────────────────────────────────────

/**
 * Encontra o primeiro ano em que o patrimônio acumulado ≥ custo / swrTarget.
 *
 * IMPORTANTE — convenção de unidade para `retornoFrac`:
 *   - Sempre em FRAÇÃO (ex: 0.0485 para 4.85%)
 *   - Se o caller tem retorno em %, dividir por 100 antes de chamar.
 *
 * @param aporte        Aporte mensal em R$
 * @param retornoFrac   Retorno anual REAL como FRAÇÃO (ex: 0.0485)
 * @param custo         Custo de vida anual em R$ (spending no FIRE day)
 * @param currentAge    Idade atual em anos inteiros
 * @param anoAtual      Ano calendário atual (de data.premissas.ano_atual)
 * @param patrimonio    Patrimônio financeiro atual em R$
 * @param swrTarget     SWR alvo como FRAÇÃO (ex: 0.03 para 3%)
 * @returns             { ano, idade, pat, swrAtFire } ou null se não atingido em 30 anos
 */
export function calcFireYear(
  aporte: number,
  retornoFrac: number,
  custo: number,
  currentAge: number,
  anoAtual: number,
  patrimonio: number,
  swrTarget: number,
): { ano: number; idade: number; pat: number; swrAtFire: number } | null {
  const target = custo / swrTarget;
  let pat = patrimonio;
  for (let yr = 0; yr <= 30; yr++) {
    if (pat >= target) {
      return { ano: anoAtual + yr, idade: currentAge + yr, pat, swrAtFire: custo / pat };
    }
    for (let m = 0; m < 12; m++) {
      pat = pat * (1 + retornoFrac / 12) + aporte;
    }
  }
  return null;
}

// ── Helpers de Ano/Idade ──────────────────────────────────────────────────────

/**
 * Extrai ano atual de data.premissas (fallback: Date atual).
 * Usar ao invés de `new Date().getFullYear()` hardcoded.
 */
export function getAnoAtual(premissas: any): number {
  return premissas?.ano_atual ?? new Date().getFullYear();
}

/**
 * Extrai idade atual de data.premissas (fallback: 39).
 */
export function getIdadeAtual(premissas: any): number {
  return premissas?.idade_atual ?? 39;
}

// Boldin-style 3-tier scoring (green/yellow/red).
//
// Histórico: v1 (até 2026-05-02) usava 5 tiers rígidos com saltos grandes (bug 58→).
// v2 (2026-05-03 manhã) tentou interpolação linear — descartada após pesquisa do
// método Boldin (NewRetirement), que explicitamente usa 3 tiers discretos sem
// interpolação ("excelling/progressing/vulnerable") porque interpolar inventa
// precisão que não existe nos thresholds.
//
// v3 (atual): 3 tiers G/Y/R + arredondamento do valor com a precisão do display
// antes de comparar (resolve o bug 84.8% → tier ≥85%).

export type WellnessStatus = 'green' | 'yellow' | 'red';

export interface TierResult {
  status: WellnessStatus;
  pts: number;
}

function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/**
 * Tiers em que **valor mais alto = mais pts**. Cada threshold tem `status`,
 * uma chave de mínimo (`min`, `min_pct`, `min_months`) e `pts`. Itera na
 * ordem do array (top tier primeiro) — convenção config.
 */
export function tierByMin(
  value: number | null | undefined,
  thresholds: ReadonlyArray<Record<string, any>>,
  minKey = 'min',
  decimals = 1,
): TierResult {
  if (value == null || !Number.isFinite(value) || !thresholds.length) {
    return { status: 'red', pts: 0 };
  }
  const v = roundTo(value, decimals);
  for (const t of thresholds) {
    const min = t[minKey];
    if (typeof min === 'number' && v >= min) {
      return { status: (t.status ?? 'red') as WellnessStatus, pts: t.pts ?? 0 };
    }
  }
  // Fallback ao último (red por convenção)
  const last = thresholds[thresholds.length - 1];
  return { status: (last.status ?? 'red') as WellnessStatus, pts: last.pts ?? 0 };
}

/**
 * Tiers em que **valor mais baixo = mais pts**. Convenção config: thresholds
 * iteram do mais apertado (green) ao mais largo (red). Aceita key alias
 * (`max_pp`, `max_delta_pp`, `max_pct`).
 */
export function tierByMax(
  value: number | null | undefined,
  thresholds: ReadonlyArray<Record<string, any>>,
  maxKey = 'max',
  decimals = 1,
): TierResult {
  if (value == null || !Number.isFinite(value) || !thresholds.length) {
    return { status: 'red', pts: 0 };
  }
  const v = roundTo(value, decimals);
  for (const t of thresholds) {
    const max = t[maxKey];
    if (typeof max === 'number' && v <= max) {
      return { status: (t.status ?? 'red') as WellnessStatus, pts: t.pts ?? 0 };
    }
  }
  const last = thresholds[thresholds.length - 1];
  return { status: (last.status ?? 'red') as WellnessStatus, pts: last.pts ?? 0 };
}

/**
 * Promove o tier de R→Y ou Y→G quando uma condição é verdadeira (ex: DCA ativo
 * em ipca_gap). Não modifica os pts — apenas o status (e pts é ajustado para o
 * pts do tier promovido se thresholds são fornecidos).
 *
 * Implementação simples: se promote=true e o tier subir, busca o pts do tier
 * de cima nos thresholds.
 */
export function promoteTier(
  result: TierResult,
  thresholds: ReadonlyArray<Record<string, any>>,
  promote: boolean,
): TierResult {
  if (!promote) return result;
  if (result.status === 'green') return result;
  const targetStatus: WellnessStatus = result.status === 'red' ? 'yellow' : 'green';
  const promoted = thresholds.find((t) => t.status === targetStatus);
  if (!promoted) return { ...result, status: targetStatus };
  return { status: targetStatus, pts: promoted.pts ?? result.pts };
}

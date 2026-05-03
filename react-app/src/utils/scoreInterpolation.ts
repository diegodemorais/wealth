// Interpolação linear entre tiers de threshold para wellness score.
//
// Causa raiz do bug "score 58 caiu bastante" (Diego, 2026-05-03):
// `pfire_base.base = 84.8` caía no tier `min: 75 → 10 pts` em vez de `min: 85 → 22 pts`,
// perdendo 12 pontos por 0.2pp de diferença. Mesma classe de problema do `cagrSemaphore`:
// degraus rígidos amplificam variações infinitesimais.
//
// Fix combinado:
// 1. **Arredondar valor com mesma precisão do display** antes de comparar (resolve a
//    discrepância visual: usuário vê "84.8%" e espera ser tratado como tier ≥85).
// 2. **Interpolar linear entre tiers** (suaviza saltos: 84.5% deve dar score próximo
//    de 85%, não saltar 12 pontos abaixo).
//
// Uso:
//   interpolatePtsByMin(value, tiers, decimals)   // ex: pfire (≥X → mais pts)
//   interpolatePtsByMax(value, tiers, decimals)   // ex: drift (≤X → mais pts)

export interface TierMin {
  min: number;
  pts: number;
}

export interface TierMax {
  max: number; // qualquer chave; usar pickMaxKey para alias (max_pp, max_delta_pp, etc)
  pts: number;
}

function roundTo(value: number, decimals: number): number {
  const f = 10 ** decimals;
  return Math.round(value * f) / f;
}

/**
 * Tiers em que **valor mais alto = mais pts** (ex: pfire base, savings rate, emergency
 * months). Cada `tier.min` é o piso para receber `tier.pts` integral. Entre dois tiers,
 * interpola linearmente.
 */
export function interpolatePtsByMin(
  value: number | null | undefined,
  tiers: TierMin[],
  decimals = 1,
): number {
  if (value == null || !Number.isFinite(value)) return 0;
  if (!tiers.length) return 0;
  const v = roundTo(value, decimals);
  // Sort descending by `min` (top tier first)
  const sorted = [...tiers].sort((a, b) => b.min - a.min);
  if (v >= sorted[0].min) return sorted[0].pts;
  for (let i = 0; i < sorted.length - 1; i++) {
    const upper = sorted[i];
    const lower = sorted[i + 1];
    if (v >= lower.min) {
      const range = upper.min - lower.min;
      if (range <= 0) return lower.pts;
      const frac = (v - lower.min) / range;
      return Math.round(lower.pts + frac * (upper.pts - lower.pts));
    }
  }
  return 0;
}

/**
 * Tiers em que **valor mais baixo = mais pts** (ex: drift pp, ipca gap pp, ter delta).
 * Cada `tier.max` é o teto para receber `tier.pts` integral. Entre dois tiers,
 * interpola linearmente.
 *
 * Aceita `keyAlias` para suportar nomes como `max_pp`, `max_delta_pp`, `max_months`.
 */
export function interpolatePtsByMax(
  value: number | null | undefined,
  tiers: ReadonlyArray<{ pts: number; [k: string]: number }>,
  keyAlias = 'max',
  decimals = 1,
): number {
  if (value == null || !Number.isFinite(value)) return 0;
  if (!tiers.length) return 0;
  const v = roundTo(value, decimals);
  const sorted = [...tiers].sort((a, b) => a[keyAlias] - b[keyAlias]);
  if (v <= sorted[0][keyAlias]) return sorted[0].pts;
  for (let i = 0; i < sorted.length - 1; i++) {
    const lower = sorted[i];
    const upper = sorted[i + 1];
    if (v <= upper[keyAlias]) {
      const range = upper[keyAlias] - lower[keyAlias];
      if (range <= 0) return upper.pts;
      const frac = (v - lower[keyAlias]) / range;
      return Math.round(lower.pts + frac * (upper.pts - lower.pts));
    }
  }
  return sorted[sorted.length - 1].pts;
}

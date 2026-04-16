/**
 * Wellness Score Calculation
 * Port from dashboard/js/03-utils.mjs calcWellness()
 */

export type WellnessStatus = 'critical' | 'warning' | 'ok' | 'excellent';

export interface WellnessMetrics {
  firePercentage: number; // 0-1
  equityAllocation: number; // 0-1
  diversification: number; // 0-1
  costEfficiency: number; // 0-1 (inverse of costs)
  liquidityScore: number; // 0-1
}

/**
 * Calculate composite wellness score (0-1)
 * Weights each dimension equally, can be adjusted
 */
export function calcWellness(metrics: WellnessMetrics): {
  score: number;
  status: WellnessStatus;
} {
  const score =
    (metrics.firePercentage * 0.3 +
      metrics.equityAllocation * 0.25 +
      metrics.diversification * 0.2 +
      metrics.costEfficiency * 0.15 +
      metrics.liquidityScore * 0.1) /
    1.0;

  return {
    score: Math.max(0, Math.min(1, score)),
    status: determineStatus(score),
  };
}

/**
 * Determine wellness status from score
 */
export function determineStatus(score: number): WellnessStatus {
  if (score >= 0.85) return 'excellent';
  if (score >= 0.70) return 'ok';
  if (score >= 0.50) return 'warning';
  return 'critical';
}

/**
 * Get color for wellness status
 */
export function getWellnessColor(status: WellnessStatus): string {
  // Return CSS variable references that resolve at runtime
  // Values map to globals.css: --green, --accent, --orange, --red
  switch (status) {
    case 'excellent':
      return 'hsl(142 71% 45%)'; // --green (from globals.css)
    case 'ok':
      return 'hsl(217 91% 60%)'; // --accent (from globals.css)
    case 'warning':
      return 'hsl(25 95% 53%)'; // --orange (from globals.css)
    case 'critical':
      return 'hsl(0 84% 60%)'; // --red (from globals.css)
  }
}

/**
 * Get wellness label
 */
export function getWellnessLabel(status: WellnessStatus): string {
  const labels: Record<WellnessStatus, string> = {
    excellent: 'Excelente',
    ok: 'Saudável',
    warning: 'Aviso',
    critical: 'Crítico',
  };
  return labels[status];
}

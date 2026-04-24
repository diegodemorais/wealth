export interface WellnessMetrics {
  firePercentage: number;
  equityAllocation: number;
  diversification: number;
  costEfficiency: number;
  liquidityScore: number;
}

export interface WellnessResult {
  score: number;
  status: 'critical' | 'warning' | 'ok' | 'excellent';
}

export function calcWellness(metrics: WellnessMetrics): WellnessResult {
  // Weighted calculation: FIRE 30%, others 17.5% each
  const weights = {
    firePercentage: 0.30,
    equityAllocation: 0.175,
    diversification: 0.175,
    costEfficiency: 0.175,
    liquidityScore: 0.175,
  };

  const score =
    metrics.firePercentage * weights.firePercentage +
    metrics.equityAllocation * weights.equityAllocation +
    metrics.diversification * weights.diversification +
    metrics.costEfficiency * weights.costEfficiency +
    metrics.liquidityScore * weights.liquidityScore;

  return {
    score: Math.max(0, Math.min(1, score)),
    status: determineStatus(score),
  };
}

export function determineStatus(
  score: number
): 'critical' | 'warning' | 'ok' | 'excellent' {
  if (score < 0.5) return 'critical';
  if (score < 0.7) return 'warning';
  if (score < 0.85) return 'ok';
  return 'excellent';
}

export function getWellnessColor(
  status: 'critical' | 'warning' | 'ok' | 'excellent'
): string {
  const colors = {
    critical: 'var(--red)',
    warning: 'var(--amber)',
    ok: 'var(--blue)',
    excellent: 'var(--green)',
  };
  return colors[status];
}

export function getWellnessLabel(
  status: 'critical' | 'warning' | 'ok' | 'excellent'
): string {
  const labels = {
    critical: 'Crítico',
    warning: 'Aviso',
    ok: 'Saudável',
    excellent: 'Excelente',
  };
  return labels[status];
}

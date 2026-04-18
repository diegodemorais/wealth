export interface DriftEntry { atual: number; alvo: number; }

export function driftPp(entry: DriftEntry): number {
  return Math.abs((entry.atual || 0) - (entry.alvo || 0));
}

export function maxDriftPp(
  driftMap: Record<string, DriftEntry>,
  excludeKeys: string[] = []
): number {
  if (!driftMap) return 0;
  const values = Object.entries(driftMap)
    .filter(([k]) => !excludeKeys.includes(k))
    .map(([, e]) => driftPp(e));
  return values.length ? Math.max(0, ...values) : 0;
}

// Shared constants for BRFireSim — imported by both BRFireSimSection and BRFireSimChart
// Keep SWR_LABELS and SWR_COLORS local to each file: Section uses CSS vars, Chart uses EC.* tokens

export const SWR_KEYS = ['3pct', '4pct', '6pct', '8pct'] as const;
export type SWRKey = (typeof SWR_KEYS)[number];

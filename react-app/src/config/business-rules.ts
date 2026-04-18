/** Constantes de regras de negócio FIRE — fonte única de verdade */
export const FIRE_RULES = {
  SWR_DEFAULT: 0.03,          // 3% — SWR conservador padrão
  SWR_ASPIRACIONAL: 0.04,     // 4% — SWR aspiracional
  PFIRE_TARGET: 90,           // 90% — P(FIRE) alvo (escala 0-100)
  PFIRE_ADEQUADO: 85,         // 85% — P(FIRE) mínimo adequado
} as const;

export const WELLNESS_THRESHOLDS = {
  EXCELLENT: 0.85,
  OK: 0.70,
  WARNING: 0.50,
} as const;

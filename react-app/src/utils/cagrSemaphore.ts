// Semáforo de cor para CAGR real (vs meta de retorno real BRL).
//
// Causa raiz do bug "+3.0% positivo aparecia em vermelho" (Diego, 2026-05-02):
// threshold comparava valor cru (ex: 2.96) com display arredondado (ex: "3.0%").
// 2.96 < 3 → vermelho, mas leitor vê "3.0%" e espera amarelo. Discrepância visual
// entre cor e número exibido.
//
// Fix: arredondar com a MESMA precisão do display antes de comparar com threshold.
// `decimals` deve casar com o `toFixed(decimals)` usado para renderizar o valor.

const GREEN = 'var(--green)';
const YELLOW = 'var(--yellow)';
const RED = 'var(--red)';
const MUTED = 'var(--muted)';

const THRESHOLD_GREEN = 4.5; // ≥ meta da carteira
const THRESHOLD_YELLOW = 3;  // mínimo aceitável (real BRL acima da inflação implícita)

export function cagrSemaphore(value: number | null | undefined, decimals = 1): string {
  if (value == null) return MUTED;
  const factor = 10 ** decimals;
  const rounded = Math.round(value * factor) / factor;
  if (rounded >= THRESHOLD_GREEN) return GREEN;
  if (rounded >= THRESHOLD_YELLOW) return YELLOW;
  return RED;
}

export const CAGR_THRESHOLDS = {
  green: THRESHOLD_GREEN,
  yellow: THRESHOLD_YELLOW,
} as const;

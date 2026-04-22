/**
 * ECharts Color Constants — Single Source of Truth
 *
 * Mirrors the CSS vars defined in globals.css :root / @theme.
 * Use these in ECharts option objects instead of raw hex strings.
 *
 * Why constants (not CSS var reads at runtime): ECharts option objects are
 * serialized and passed to the canvas renderer — they cannot receive CSS vars
 * directly. Reading via getComputedStyle would require client-only code in every
 * chart. Constants are simpler, type-safe, and match the single dark theme.
 */

export const EC = {
  // ── Semantic colors ──────────────────────────────────────────────────────
  accent:  '#58a6ff',   // var(--accent)  / var(--color-accent)
  green:   '#3ed381',   // var(--green)   / var(--color-green)
  red:     '#f85149',   // var(--red)     / var(--color-red)
  yellow:  '#d97706',   // var(--yellow)  hsl(45 93% 47%) ≈ amber-600
  orange:  '#f97316',   // var(--orange)  hsl(25 95% 53%)
  purple:  '#a855f7',   // var(--purple)  hsl(271 91% 65%)
  cyan:    '#06b6d4',   // var(--cyan)    hsl(189 94% 43%)
  pink:    '#ec4899',   // var(--pink)    hsl(330 80% 60%)

  // ── Conditional (green/red for positive/negative) ──────────────────────
  positive: '#22c55e',  // tailwind green-500 — used for gains, coverage, OK
  negative: '#ef4444',  // tailwind red-500 — used for losses, gaps, warnings
  warning:  '#f59e0b',  // tailwind amber-500 — caution states

  // ── Bond pool / ladder palette ─────────────────────────────────────────
  blue600:  '#2563eb',  // IPCA+2029 (short), SoRR pool
  sky500:   '#0ea5e9',  // IPCA+2040 (medium)
  violet700:'#7c3aed',  // IPCA+2050 (long), structural pool
  violet600:'#9333ea',  // Renda+2065 (very long)

  // ── Misc chart colors ──────────────────────────────────────────────────
  emerald:  '#16a34a',  // income/receita
  crimson:  '#dc2626',  // expense/despesa

  // ── Surface colors ───────────────────────────────────────────────────────
  bg:      '#0d1117',   // var(--bg)
  card:    '#161b22',   // var(--card)    — tooltip background
  card2:   '#2d3748',   // var(--card2)   hsl(215 25% 27%)
  border:  '#1c2128',   // var(--border)
  border2: '#30363d',   // slightly lighter border (axis lines)
  border3: '#21262d',   // splitLine color

  // ── Text colors ──────────────────────────────────────────────────────────
  text:    '#e6edf3',   // var(--text)    hsl(210 40% 96%)
  muted:   '#8b949e',   // var(--muted)   hsl(215 20% 65%)
} as const;

export type EcColor = typeof EC[keyof typeof EC];

// ── Tooltip defaults — reuse across all charts ────────────────────────────
export const EC_TOOLTIP = {
  backgroundColor: EC.card,
  borderColor: EC.border2,
  textStyle: { color: EC.text, fontSize: 11 },
} as const;

// ── Axis defaults — reuse across all charts ───────────────────────────────
export const EC_AXIS_LABEL = { color: EC.muted, fontSize: 10 } as const;
export const EC_AXIS_LINE  = { lineStyle: { color: EC.border2 } } as const;
export const EC_SPLIT_LINE = { lineStyle: { color: EC.border3 } } as const;

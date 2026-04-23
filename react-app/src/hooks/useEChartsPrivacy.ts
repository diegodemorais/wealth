'use client';

import { useUiStore } from '@/store/uiStore';
import { useEChartsTheme } from './useEChartsTheme';
import { pvMoney, pvAxisLabel } from '@/utils/privacyTransform';

/**
 * Hook for privacy mode in ECharts.
 *
 * Instead of hiding data (transparent/••••), TRANSFORMS monetary values
 * so charts retain shape, proportions, and usefulness while hiding real amounts.
 *
 * Percentages are NOT transformed (not sensitive).
 */
export function useEChartsPrivacy() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const theme = useEChartsTheme();

  return {
    privacyMode,
    theme,
    /** Transform a monetary value for privacy display */
    pv: (v: number) => privacyMode ? pvMoney(v) : v,
    /** Format axis label with privacy */
    pvLabel: (v: number) => pvAxisLabel(v, privacyMode),
  };
}

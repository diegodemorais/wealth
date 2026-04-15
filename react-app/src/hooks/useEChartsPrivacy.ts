'use client';

import { useUiStore } from '@/store/uiStore';
import { useEChartsTheme } from './useEChartsTheme';

/**
 * Hook to apply privacy mode masking to ECharts
 * Returns modified chart option that masks sensitive values when privacy mode is enabled
 */
export function useEChartsPrivacy() {
  const privacyMode = useUiStore(s => s.privacyMode);
  const theme = useEChartsTheme();

  /**
   * Wraps a chart option with privacy mode modifications
   * Masks tooltip and label values when privacy mode is enabled
   */
  const withPrivacyMode = (option: any) => {
    if (!privacyMode) {
      return option;
    }

    // Create a copy to avoid mutations
    const masked = JSON.parse(JSON.stringify(option));

    // Mask tooltip
    if (!masked.tooltip) {
      masked.tooltip = {};
    }
    const originalTooltipFormatter = masked.tooltip.formatter;
    masked.tooltip.formatter = (params: any) => {
      if (typeof originalTooltipFormatter === 'function') {
        const original = originalTooltipFormatter(params);
        // Replace numeric values with •••• in tooltip
        if (typeof original === 'string') {
          return original.replace(/R\$[\s\S]*?(?=<br|$)|[\d.,]+/g, '••••');
        }
        return '••••';
      }
      return '••••';
    };

    // Mask series labels
    if (masked.series && Array.isArray(masked.series)) {
      masked.series.forEach((serie: any) => {
        if (serie.label) {
          serie.label.color = 'transparent';
        }
        // Mask data labels
        if (serie.data && Array.isArray(serie.data)) {
          serie.data.forEach((item: any) => {
            if (typeof item === 'object' && item !== null) {
              item.value = undefined; // Hide numeric value
            }
          });
        }
      });
    }

    // Mask axis labels
    if (masked.xAxis) {
      if (Array.isArray(masked.xAxis)) {
        masked.xAxis.forEach((axis: any) => {
          if (axis.axisLabel) {
            axis.axisLabel.color = 'transparent';
          }
        });
      } else {
        if (masked.xAxis.axisLabel) {
          masked.xAxis.axisLabel.color = 'transparent';
        }
      }
    }

    if (masked.yAxis) {
      if (Array.isArray(masked.yAxis)) {
        masked.yAxis.forEach((axis: any) => {
          if (axis.axisLabel) {
            axis.axisLabel.color = 'transparent';
          }
        });
      } else {
        if (masked.yAxis.axisLabel) {
          masked.yAxis.axisLabel.color = 'transparent';
        }
      }
    }

    return masked;
  };

  return {
    privacyMode,
    withPrivacyMode,
    theme,
  };
}

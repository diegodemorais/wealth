'use client';

/**
 * EChart — wrapper transparente sobre ReactECharts que:
 * 1. Injeta devicePixelRatio correto para telas HiDPI/Retina (Issue 7.2)
 * 2. Centraliza defaults de renderer
 *
 * Drop-in replacement: mesmas props que ReactECharts + forwardRef.
 * Privacy handling é responsabilidade dos componentes consumidores — este wrapper
 * é agnóstico a privacyMode (privacy-agnostic by design).
 */

import React from 'react';
import ReactECharts, { type EChartsOption, type EChartsReactProps } from 'echarts-for-react';

const DPR_OPTS = {
  renderer: 'canvas' as const,
  devicePixelRatio: typeof window !== 'undefined' ? (window.devicePixelRatio ?? 1) : 1,
};

export const EChart = React.forwardRef<ReactECharts, EChartsReactProps>(
  function EChart({ opts, ...rest }, ref) {
    const mergedOpts = opts ? { ...DPR_OPTS, ...opts } : DPR_OPTS;
    return <ReactECharts ref={ref} opts={mergedOpts} {...rest} />;
  }
);

EChart.displayName = 'EChart';

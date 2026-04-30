'use client';

/**
 * IifptRadar — Domain Coverage Radar (DC1)
 *
 * ECharts Radar com 6 eixos IIFPT:
 *  - Série 1 (preenchida, azul): domain_coverage por domínio
 *  - Série 2 (tracejada, cinza): priority_matrix.weights normalizado 0-1
 * Eixos com coverage < 0.3 exibidos em vermelho (RM) ou amarelo (Est).
 * Privacy mode: oculta valores numéricos, mantém shape do radar.
 *
 * Localização no NOW tab: após wellness block, antes do DCA status.
 * Issue: DEV-iifpt-dashboard (CC1+DC1)
 */

import { useMemo } from 'react';
import { CollapsibleSection } from '@/components/primitives/CollapsibleSection';
import { EChart } from '@/components/primitives/EChart';
import { EC, EC_TOOLTIP } from '@/utils/echarts-theme';
import { useUiStore } from '@/store/uiStore';
import { fmtPrivacy } from '@/utils/privacyTransform';
import { useChartResize } from '@/hooks/useChartResize';

const DOMAIN_LABELS: Record<string, string> = {
  inv: 'Inv',
  ret: 'Ret',
  tax: 'Tax',
  cf:  'CF',
  rm:  'RM',
  est: 'Est',
};

const DOMAIN_ORDER = ['inv', 'ret', 'tax', 'cf', 'rm', 'est'];

interface IifptRadarProps {
  domainCoverage: Record<string, number>;
  priorityWeights: Record<string, number>;
}

// Normalize weights to 0-1 scale (max weight = 1.0)
function normalizeWeights(weights: Record<string, number>): Record<string, number> {
  const maxW = Math.max(...Object.values(weights));
  if (maxW <= 0) return weights;
  return Object.fromEntries(Object.entries(weights).map(([k, v]) => [k, v / maxW]));
}

// Axis label color: red if coverage < 0.3, yellow if 0.3 <= coverage < 0.5
function axisColor(coverage: number): string {
  if (coverage < 0.3) return EC.red;
  if (coverage < 0.5) return EC.yellow;
  return EC.muted;
}

export function IifptRadar({ domainCoverage, priorityWeights }: IifptRadarProps) {
  const { privacyMode } = useUiStore();
  const chartRef = useChartResize();

  const normalizedWeights = useMemo(() => normalizeWeights(priorityWeights), [priorityWeights]);

  const indicators = DOMAIN_ORDER.map(key => ({
    name: DOMAIN_LABELS[key] ?? key,
    max: 1,
    color: axisColor(domainCoverage[key] ?? 0),
  }));

  const coverageValues = DOMAIN_ORDER.map(key => domainCoverage[key] ?? 0);
  const weightValues = DOMAIN_ORDER.map(key => normalizedWeights[key] ?? 0);

  const option = {
    backgroundColor: 'transparent',
    tooltip: {
      ...EC_TOOLTIP,
      trigger: 'item',
      formatter: (params: { seriesName: string; value: number[] }) => {
        if (privacyMode) return params.seriesName;
        return DOMAIN_ORDER.map((key, i) => {
          const cov = (coverageValues[i] * 100).toFixed(0);
          const wgt = ((priorityWeights[key] ?? 0) * 100).toFixed(0);
          return `${DOMAIN_LABELS[key]}: cobertura ${cov}% | peso ${wgt}%`;
        }).join('<br/>');
      },
    },
    radar: {
      indicator: indicators,
      axisName: {
        color: EC.muted,
        fontSize: 11,
        formatter: (name: string, indicator: { color?: string }) =>
          `{style|${name}}`,
        rich: {
          style: {
            fontSize: 11,
            // axisName color is set per-indicator via indicator.nameTextStyle below
          },
        },
      },
      // Per-indicator name style (color by coverage)
      axisNameGap: 8,
      splitNumber: 4,
      shape: 'polygon',
      axisLine: { lineStyle: { color: EC.border2 } },
      splitLine: { lineStyle: { color: EC.border3, type: 'dashed' } },
      splitArea: { show: false },
    },
    series: [
      {
        name: 'Cobertura',
        type: 'radar',
        data: [{ value: coverageValues, name: 'Cobertura' }],
        areaStyle: { color: EC.accent, opacity: 0.25 },
        lineStyle: { color: EC.accent, width: 2 },
        itemStyle: { color: EC.accent },
        symbol: 'circle',
        symbolSize: 5,
      },
      {
        name: 'Peso IPS',
        type: 'radar',
        data: [{ value: weightValues, name: 'Peso IPS' }],
        areaStyle: { opacity: 0 },
        lineStyle: { color: EC.muted, width: 1, type: 'dashed' },
        itemStyle: { color: EC.muted },
        symbol: 'none',
      },
    ],
    legend: {
      bottom: 0,
      data: ['Cobertura', 'Peso IPS'],
      textStyle: { color: EC.muted, fontSize: 10 },
      icon: 'roundRect',
    },
  };

  // Per-indicator color: override axisName color via indicator nameTextStyle
  const indicatorsWithColor = DOMAIN_ORDER.map((key, i) => ({
    name: DOMAIN_LABELS[key] ?? key,
    max: 1,
    nameTextStyle: { color: axisColor(domainCoverage[key] ?? 0) },
  }));
  (option.radar as any).indicator = indicatorsWithColor;

  const gapDomains = DOMAIN_ORDER.filter(k => (domainCoverage[k] ?? 0) < 0.3);

  return (
    <CollapsibleSection
      id="section-iifpt-radar"
      title="Cobertura IIFPT"
      defaultOpen={false}
      summary={
        gapDomains.length > 0 ? (
          <span style={{ fontSize: 'var(--text-xs)', color: EC.red, fontWeight: 600 }}>
            {gapDomains.map(k => DOMAIN_LABELS[k]).join(', ')} gap
          </span>
        ) : undefined
      }
    >
      <div style={{ padding: '0 16px 16px' }}>
        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 8 }}>
          Azul = cobertura atual · Cinza tracejado = peso no IPS.{' '}
          {!privacyMode && gapDomains.length > 0 && (
            <span style={{ color: EC.red }}>
              Eixos vermelhos = gap (&lt;30% de cobertura).
            </span>
          )}
        </div>
        <EChart
          ref={chartRef}
          option={option}
          style={{ height: 280 }}
          data-testid="iifpt-radar-chart"
        />
        {!privacyMode && (
          <div
            data-testid="iifpt-radar-coverage"
            style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}
          >
            {DOMAIN_ORDER.map(key => {
              const cov = domainCoverage[key] ?? 0;
              const wgt = priorityWeights[key] ?? 0;
              const col = axisColor(cov);
              return (
                <div
                  key={key}
                  title={`${DOMAIN_LABELS[key]}: cobertura ${(cov * 100).toFixed(0)}% | peso ${(wgt * 100).toFixed(0)}%`}
                  style={{
                    fontSize: 10, border: `1px solid ${col}30`,
                    borderRadius: 4, padding: '2px 7px',
                    background: `${col}10`, color: col,
                  }}
                >
                  {DOMAIN_LABELS[key]} {(cov * 100).toFixed(0)}%
                </div>
              );
            })}
          </div>
        )}
        <div className="src" style={{ marginTop: 8 }}>
          Fonte: agentes/contexto/priority_matrix.json + IIFPT_COVERAGE (config.py)
        </div>
      </div>
    </CollapsibleSection>
  );
}

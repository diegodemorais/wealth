'use client';

import React, { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { fmtPrivacy } from '@/utils/privacyTransform';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

interface DrawdownHistoryChartProps {
  dates: string[];
  drawdownPct: number[];
  maxDrawdown: number;
}

const DrawdownHistoryChart: React.FC<DrawdownHistoryChartProps> = ({
  dates,
  drawdownPct,
  maxDrawdown,
}) => {
  const { privacyMode } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const displayDates = dates.slice(-60);
    const displayData = drawdownPct.slice(-60);
    const minVal = displayData.length > 0 ? Math.min(...displayData) : -15;
    const yAxisMin = Math.floor(minVal / 2) * 2 - 2;

    return {
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: EC.card,
        borderColor: EC.border2,
        textStyle: { color: EC.text, fontSize: 12 },
        formatter: (params: any) => {
          const p = Array.isArray(params) ? params[0] : params;
          return `${p.name}<br/>Drawdown: ${(p.value as number).toFixed(2)}%`;
        },
      },
      legend: {
        show: !privacyMode,
        top: 0,
        textStyle: { color: EC.muted, fontSize: 12 },
      },
      grid: { left: 48, right: 16, top: 32, bottom: 40 },
      xAxis: {
        type: 'category' as const,
        data: displayDates,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
          rotate: 45,
        },
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
      },
      yAxis: {
        type: 'value' as const,
        min: yAxisMin,
        max: 2,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
          formatter: (v: number) => `${v.toFixed(0)}%`,
        },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: 'Drawdown %',
          type: 'line' as const,
          data: displayData,
          lineStyle: { color: EC.red, width: 2 },
          itemStyle: { color: EC.red },
          areaStyle: { color: 'rgba(239, 68, 68, 0.1)' },
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
        },
      ],
    };
  }, [dates, drawdownPct, privacyMode]);

  const currentDd = drawdownPct[drawdownPct.length - 1] || 0;
  const currentColor = currentDd > -10 ? 'var(--green)' : 'var(--yellow)';
  const currentBg = currentDd > -10 ? 'rgba(34,197,94,0.1)' : 'rgba(245,158,11,0.1)';
  const currentBorder = currentDd > -10 ? 'rgba(34,197,94,0.25)' : 'rgba(245,158,11,0.25)';

  return (
    <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', padding: 'var(--space-5)', marginBottom: '16px' }}>
      <h2 style={{ fontSize: 'var(--text-md)', fontWeight: 600, color: 'var(--text)', marginBottom: '16px', marginTop: 0 }}>
        Drawdown History — Perdas Históricas
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
        <div>
          <EChart ref={chartRef} option={option} style={{ height: 300, width: '100%' }} />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <div style={{ padding: 'var(--space-3)', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Max Drawdown</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'var(--red)' }}>
              {`${maxDrawdown.toFixed(2)}%`}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Worst case (histórico)</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: currentBg, border: `1px solid ${currentBorder}`, borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Drawdown Atual</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: '4px', color: currentColor }}>
              {`${currentDd.toFixed(2)}%`}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>Posição presente</div>
          </div>

          <div style={{ padding: 'var(--space-3)', background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.25)', borderRadius: '4px' }}>
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '4px', textTransform: 'uppercase', fontWeight: 600 }}>Status de Recuperação</div>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 700, color: 'rgba(168, 85, 247, 0.7)', marginBottom: '4px' }}>
              {currentDd > -5 ? 'ATH' : 'Recuperando'}
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>vs. máximo histórico</div>
          </div>
        </div>

        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', padding: '8px 12px', background: 'var(--bg)', borderRadius: '4px' }}>
          <strong>Nota:</strong> Drawdown = queda máxima do pico anterior até o vale. Valores negativos indicam perda. Monitorar durante correções de mercado para manter disciplina.
        </div>
      </div>
    </div>
  );
};

export default DrawdownHistoryChart;

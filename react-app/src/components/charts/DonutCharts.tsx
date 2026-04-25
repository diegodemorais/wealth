'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { EC } from '@/utils/echarts-theme';
import { fmtPrivacy } from '@/utils/privacyTransform';

// Handle hidden container resize: check offsetWidth > 0 and retry with setTimeout
const handleChartResize = (containerRef: any) => {
  if (containerRef?.current?.offsetWidth > 0) {
    setTimeout(() => containerRef.current?.getEchartsInstance?.()?.resize?.(), 100);
  }
};

interface DonutChartsProps {
  data: DashboardData;
}

export function DonutCharts({ data }: DonutChartsProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const { assetData, totalBrl } = useMemo(() => {
    const posicoes = data.posicoes || {};
    const cambio = data.cambio || 1;
    let totalUsd = 0;
    Object.values(posicoes).forEach((p: any) => { totalUsd += (p.qty || 0) * (p.price || 0); });
    const rf = data.rf as any;
    const rfBrl = (rf?.ipca2029?.valor || 0) + (rf?.ipca2040?.valor || 0) +
                  (rf?.ipca2050?.valor || 0) + (rf?.renda2065?.valor || 0);
    const hodlBrl = (data as any).hodl11?.valor || 0;
    const equityBrl = totalUsd * cambio;
    const totalBrl = equityBrl + rfBrl + hodlBrl;
    const assetData = [
      { value: equityBrl, name: 'Equity',      color: EC.accent },
      { value: rfBrl,     name: 'Renda Fixa',  color: EC.green },
      { value: hodlBrl,   name: 'Bitcoin',     color: EC.orange },
    ].filter(d => d.value > 0);
    return { assetData, totalBrl };
  }, [data]);

  const option = useMemo(() => {
    const fmt = (v: number) => fmtPrivacy(v / 1e6, privacyMode);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (p: any) =>
          `<div style="padding:6px 10px">
            <strong style="color:${p.data.itemStyle?.color ?? '#fff'}">${p.name}</strong><br/>
            ${fmt(p.value)}<br/>
            <span style="font-size:13px;font-weight:700">${p.percent?.toFixed(1)}%</span>
          </div>`,
      },
      series: [
        {
          type: 'pie' as const,
          radius: ['48%', '76%'],
          center: ['50%', '50%'],
          data: assetData.map(s => ({
            name: s.name,
            value: s.value,
            itemStyle: { color: s.color, borderRadius: 5, borderColor: EC.bg, borderWidth: 3 },
          })),
          label: {
            show: true,
            position: 'outside' as const,
            formatter: (p: any) => privacyMode ? '' : `{name|${p.name}}\n{pct|${p.percent?.toFixed(1)}%}`,
            rich: {
              name: { fontSize: 11, color: EC.muted, lineHeight: 16 },
              pct:  { fontSize: 13, fontWeight: 700, color: EC.text, lineHeight: 18 },
            },
            distanceToLabelLine: 6,
          },
          labelLine: {
            length: 12,
            length2: 16,
            lineStyle: { color: EC.border2 },
          },
          emphasis: {
            itemStyle: { shadowBlur: 12, shadowColor: 'rgba(0,0,0,0.5)', borderWidth: 0 },
            label: { show: true, fontSize: 14, fontWeight: 700 },
          },
          // Total label in center
          graphic: [],
        },
      ],
      graphic: [
        {
          type: 'text',
          left: 'center',
          top: 'center',
          style: {
            text: fmtPrivacy(totalBrl / 1e6, privacyMode),
            fontSize: 14,
            fontWeight: 700,
            fill: EC.text,
            textAlign: 'center',
          },
        },
        {
          type: 'text',
          left: 'center',
          top: `calc(50% + 18px)`,
          style: {
            text: 'Total',
            fontSize: 10,
            fill: EC.muted,
            textAlign: 'center',
          },
        },
      ],
    };
  }, [assetData, totalBrl, privacyMode, theme]);

  return (
    <div style={{ height: '280px', width: '100%' }}>
      <EChart ref={chartRef} option={option} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

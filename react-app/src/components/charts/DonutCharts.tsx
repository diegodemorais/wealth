'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';

interface DonutChartsProps {
  data: DashboardData;
}

export function DonutCharts({ data }: DonutChartsProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const posicoes = data.posicoes || {};
    const cambio = data.cambio || 1;
    
    // Calculate allocation
    let totalUsd = 0;
    const buckets: Record<string, number> = { SWRD: 0, AVGS: 0, AVEM: 0 };
    
    Object.values(posicoes).forEach((p: any) => {
      const val = (p.qty || 0) * (p.price || 0);
      totalUsd += val;
      if (p.bucket && buckets.hasOwnProperty(p.bucket)) {
        buckets[p.bucket] += val;
      }
    });

    const rfBrl = (data.rf?.ipca2029?.valor || 0) + (data.rf?.ipca2040?.valor || 0) + (data.rf?.ipca2050?.valor || 0) + (data.rf?.renda2065?.valor || 0);
    const hodlBrl = data.hodl11?.valor || 0;
    
    const equityBrl = totalUsd * cambio;
    const totalBrl = equityBrl + rfBrl + hodlBrl;

    // Asset class allocation
    const assetData = [
      { value: equityBrl, name: 'Equity', color: '#3b82f6' },
      { value: rfBrl, name: 'Renda Fixa', color: '#10b981' },
      { value: hodlBrl, name: 'Bitcoin', color: '#f59e0b' },
    ].filter((d) => d.value > 0);

    // ETF allocation
    const etfData = Object.entries(buckets)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => ({
        value: v,
        name: k,
        color: k === 'SWRD' ? '#3b82f6' : k === 'AVGS' ? '#8b5cf6' : '#06b6d4',
      }));

    return {
      tooltip: {
        trigger: 'item',
        formatter: (params: any) => {
          if (privacyMode) return '••••';
          const pct = ((params.value / totalBrl) * 100).toFixed(1);
          return `${params.name}<br/>R$ ${(params.value / 1e6).toFixed(1)}M (${pct}%)`;
        },
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: { color: '#d1d5db' },
      },
      series: [
        {
          name: 'Alocação por Classe',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '50%'],
          data: assetData,
          itemStyle: { borderRadius: 6, borderColor: '#1f2937', borderWidth: 1 },
          label: {
            formatter: privacyMode ? () => '' : '{b}\n{d}%',
            color: privacyMode ? 'transparent' : '#d1d5db',
          },
          emphasis: {
            label: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
          },
        },
      ],
    };
  }, [data, privacyMode, theme]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <ReactECharts ref={chartRef} option={option} theme={theme} />
    </div>
  );
}

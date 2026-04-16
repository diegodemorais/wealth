'use client';

import { useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { createBondPoolProbabilisticOption, createBondPoolDeterministicOption } from '@/utils/chartSetup';

interface BondPoolRunwayData {
  anos_pre_fire?: number[];
  pool_total_brl?: number[];
  pool_td2040_brl?: number[];
  pool_td2050_brl?: number[];
  alvo_pool_brl_2040?: number;
  dates?: string[];
  p10?: number[];
  p50?: number[];
  p90?: number[];
}

interface BondPoolRunwayChartProps {
  data: BondPoolRunwayData;
}

export function BondPoolRunwayChart({ data }: BondPoolRunwayChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const hasDeterministic = Array.isArray(data?.anos_pre_fire) && data.anos_pre_fire.length > 0;
  const hasProbabilistic = Array.isArray(data?.dates) && data.dates.length > 0;

  const option = useMemo(() => {
    if (!hasDeterministic && !hasProbabilistic) {
      return {
        title: {
          text: 'Bond Pool Runway',
          subtext: 'Awaiting projection data from FIRE model',
          left: 'center',
          top: 'center',
          textStyle: { color: '#94a3b8', fontSize: 14 },
          subtextStyle: { color: '#94a3b8', fontSize: 12 },
        },
      };
    }

    if (hasProbabilistic) {
      return createBondPoolProbabilisticOption({
        theme,
        privacyMode,
        dates: data.dates!,
        p10: data.p10 || [],
        p50: data.p50 || [],
        p90: data.p90 || [],
      });
    }

    return createBondPoolDeterministicOption({
      theme,
      privacyMode,
      years: data.anos_pre_fire!,
      poolTotal: data.pool_total_brl || [],
      pool2040: data.pool_td2040_brl || [],
      pool2050: data.pool_td2050_brl || [],
      alvo: data.alvo_pool_brl_2040 || 0,
    });
  }, [data, privacyMode, theme, hasDeterministic, hasProbabilistic]);

  return (
    <div className="bg-card border border-border rounded-md p-4 mb-5" style={{ height: 400 }}>
      <ReactECharts ref={chartRef} option={option} theme={theme} style={{ height: '100%' }} />
    </div>
  );
}

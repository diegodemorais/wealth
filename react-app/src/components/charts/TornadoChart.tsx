'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { DashboardData } from '@/types/dashboard';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { createTornadoChartOption } from '@/utils/chartSetup';

interface TornadoChartProps {
  data: DashboardData;
}

export function TornadoChart({ data }: TornadoChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const tornadoData = data.tornado || [];
    if (!tornadoData || tornadoData.length === 0) {
      return { title: { text: 'No sensitivity data available' } };
    }

    const sorted = [...tornadoData]
      .sort((a, b) => Math.abs((b.impacto_pfire || 0) - 50) - Math.abs((a.impacto_pfire || 0) - 50))
      .slice(0, 6);

    const categories = sorted.map((d) => d.variavel || 'Unknown');
    const baselineValue = 50;
    const downside = sorted.map((d) => -(baselineValue - (d.impacto_pfire_pessimista || 0)));
    const upside = sorted.map((d) => (d.impacto_pfire_otimista || 0) - baselineValue);

    return createTornadoChartOption({
      data, privacyMode, theme, categories, downside, upside,
      downsideLabel: 'Cenário Pessimista', upsideLabel: 'Cenário Otimista'
    });
  }, [data, privacyMode, theme]);

  return (
    <div style={{ height: '400px', width: '100%' }}>
      <EChart ref={chartRef} option={option} theme={theme} />
    </div>
  );
}

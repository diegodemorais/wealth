'use client';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { DashboardData } from '@/types/dashboard';
import { EC, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { ChartCard } from '@/components/primitives/ChartCard';

export interface IncomeProjectionChartProps {
  data: DashboardData;
}

export function IncomeProjectionChart({ data }: IncomeProjectionChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();

  const option = useMemo(() => {
    const premissas = (data as any)?.premissas ?? {};
    const rendaMensal: number = premissas.renda_mensal_liquida ?? premissas.renda_estimada ?? 45000;
    const rendaAnual = rendaMensal * 12;
    const idadeAtual: number = premissas.idade_atual ?? 39;
    const idadeFire: number = premissas.idade_cenario_base ?? 53;
    const inssAnual: number = premissas.inss_anual ?? 21996;
    const inssInicio: number = premissas.inss_inicio_ano ?? 2052;
    const swr: number = (data as any)?.fire?.swr_gatilho ?? premissas.swr_gatilho ?? 0.03;
    const patrimonioGatilho: number = premissas.patrimonio_gatilho ?? 8333333;

    const anoAtual = new Date().getFullYear();
    const yearsToFire = idadeFire - idadeAtual;
    const totalYears = 40;

    const xDates = Array.from({ length: totalYears }, (_, i) => `${anoAtual + i + 1}`);

    // Capital humano (renda de trabalho): decresce linearmente até FIRE, depois zero
    const capitalHumano = Array.from({ length: totalYears }, (_, i) => {
      const yr = i + 1;
      if (yr >= yearsToFire) return 0;
      return rendaAnual * (1 - yr / yearsToFire);
    });

    // Renda de portfólio: SWR × patrimônio, começa no FIRE
    const rendaPortfolio = Array.from({ length: totalYears }, (_, i) => {
      const yr = i + 1;
      if (yr < yearsToFire) return 0;
      return patrimonioGatilho * swr;
    });

    // INSS: começa em inssInicio
    const rendaInss = Array.from({ length: totalYears }, (_, i) => {
      const ano = anoAtual + i + 1;
      return ano >= inssInicio ? inssAnual : 0;
    });

    const total = capitalHumano.map((ch, i) => ch + rendaPortfolio[i] + rendaInss[i]);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: any) => {
          if (!Array.isArray(params)) return '';
          let html = `<div style="padding:8px"><strong>${params[0]?.axisValueLabel}</strong><br/>`;
          params.forEach((p: any) => {
            if (p.value != null && p.value > 0) {
              const val = privacyMode ? '••••' : `R$${Math.round(p.value / 1000)}k/ano`;
              html += `${p.marker} ${p.seriesName}: <strong>${val}</strong><br/>`;
            }
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: ['Capital Humano', 'Portfólio (SWR)', 'INSS'],
        textStyle: { color: theme.textStyle.color },
        top: 10,
      },
      grid: { left: 70, right: 30, top: 50, bottom: 40, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: xDates,
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          fontSize: 11,
          interval: 4,
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : '#94a3b8',
          formatter: (v: number) => `R$${Math.round(v / 1000)}k`,
          fontSize: 11,
        },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        {
          name: 'Capital Humano',
          type: 'bar' as const,
          stack: 'total',
          data: capitalHumano,
          itemStyle: { color: EC.accent },
        },
        {
          name: 'Portfólio (SWR)',
          type: 'bar' as const,
          stack: 'total',
          data: rendaPortfolio,
          itemStyle: { color: EC.green },
        },
        {
          name: 'INSS',
          type: 'bar' as const,
          stack: 'total',
          data: rendaInss,
          itemStyle: { color: EC.purple },
        },
      ],
    };
  }, [data, privacyMode, theme]);

  return (
    <ChartCard title="Projeção de Renda — Ciclo de Vida">
      <EChart ref={chartRef} option={option} style={{ height: 400, width: '100%' }} />
    </ChartCard>
  );
}

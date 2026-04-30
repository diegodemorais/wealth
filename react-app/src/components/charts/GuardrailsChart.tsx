'use client';
import type { CallbackDataParams } from 'echarts/types/dist/shared';

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useEChartsPrivacy } from '@/hooks/useEChartsPrivacy';
import { useChartResize } from '@/hooks/useChartResize';
import { useConfig } from '@/hooks/useConfig';
import { DashboardData } from '@/types/dashboard';
import { EC, EC_AXIS_LINE, EC_SPLIT_LINE } from '@/utils/echarts-theme';
import { fmtPrivacy } from '@/utils/privacyTransform';


export interface GuardrailsChartProps {
  data: DashboardData;
  /** Override gasto anual para mostrar linha do perfil ativo no lugar do spending_atual */
  gastoOverride?: number;
}

export function GuardrailsChart({ data, gastoOverride }: GuardrailsChartProps) {
  const { privacyMode, theme } = useEChartsPrivacy();
  const chartRef = useChartResize();
  const { config } = useConfig();

  const option = useMemo(() => {
    const sg = (data as any)?.spending_guardrails ?? {};
    const upperSpending: number = sg.upper_guardrail_spending ?? 300000;
    const safeTarget: number   = sg.safe_target_spending   ?? 250000;
    const lowerSpending: number = sg.lower_guardrail_spending ?? 200000;
    // Use gastoOverride if provided (active family profile), else fallback to data
    const spendingAtual: number = gastoOverride ?? sg.spending_atual ?? safeTarget;

    const fmt = (v: number) => fmtPrivacy(v, privacyMode);

    // Projeção até horizonte_vida (90a) — usa n_anos_desacumulacao do JSON ou fallback 37a (90-53)
    const yearsFromData = (data as any)?.fire_matrix?.n_anos_desacumulacao ?? ((data as any)?.premissas?.horizonte_vida ? (data as any).premissas.horizonte_vida - ((data as any).premissas.idade_cenario_base ?? 53) : 37);
    const years = Math.max(yearsFromData, 37);
    const xLabels = Array.from({ length: years }, (_, i) => `Ano ${i + 1}`);

    // Healthcare model: VCMH 5.0%/year real + ANS age-bracket multiplier (FR-healthcare-recalibracao 2026-04-23)
    const saudeBase = (data as any)?.saude_base ?? 24_000;
    const SAUDE_INFLATOR = config.ui?.guardrails?.saudeInflator ?? 0.050;
    const SAUDE_DECAY_THRESHOLD = config.ui?.guardrails?.saudeDecayThreshold ?? 30;
    const SAUDE_DECAY = config.ui?.guardrails?.saudeDecay ?? 0.50;

    const ansMultiplier = (yearPostFire: number): number => {
      const fireAge = 53;
      const currentAge = fireAge + yearPostFire;
      if (currentAge < 54) return 3.0;
      if (currentAge < 60) return 3.0 + (currentAge - 54) * (0.5 / 6);
      return 4.0;
    };

    const getHealthcareCost = (yearPostFire: number): number => {
      let saudeVcmh = saudeBase * Math.pow(1 + SAUDE_INFLATOR, yearPostFire);
      let saude = saudeVcmh * ansMultiplier(yearPostFire);
      if (yearPostFire >= SAUDE_DECAY_THRESHOLD) {
        saude *= SAUDE_DECAY;
      }
      return saude;
    };

    // Guardrail lines include healthcare on top of base spending
    const upper  = xLabels.map((_, i) => upperSpending  + getHealthcareCost(i));
    const safe   = xLabels.map((_, i) => safeTarget      + getHealthcareCost(i));
    const lower  = xLabels.map((_, i) => lowerSpending   + getHealthcareCost(i));
    const atual  = xLabels.map((_, i) => spendingAtual   + getHealthcareCost(i));

    // Zone gap for band fill: upper - lower
    const zoneGap = lower.map((lo, i) => upper[i] - lo);

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: theme.tooltip.backgroundColor,
        borderColor: theme.tooltip.borderColor,
        textStyle: theme.tooltip.textStyle,
        formatter: (params: CallbackDataParams[]) => {
          if (!Array.isArray(params)) return '';
          const hidden = new Set(['_zoneFloor', '_zoneGap']);
          const label = (params[0] as (CallbackDataParams & { axisValue?: string; axisValueLabel?: string }))?.axisValue ?? '';
          let html = `<div style="padding:8px 10px"><strong>${label}</strong><br/>`;
          params.forEach((p: any) => {
            if (hidden.has(p.seriesName) || p.value == null) return;
            html += `${p.marker} ${p.seriesName}: <strong>${fmt(p.value)}/ano</strong><br/>`;
          });
          html += '</div>';
          return html;
        },
      },
      legend: {
        data: ['Gasto Atual', 'Safe Target', 'Upper Guardrail', 'Lower Guardrail'],
        textStyle: { color: theme.textStyle.color, fontSize: 11 },
        top: 8,
        itemWidth: 14,
        itemHeight: 8,
      },
      grid: { left: 60, right: 20, top: 44, bottom: 36, containLabel: true },
      xAxis: {
        type: 'category' as const,
        data: xLabels,
        axisLine: EC_AXIS_LINE,
        axisTick: { show: false },
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          fontSize: 10,
          interval: 1,
          hideOverlap: true,
        },
      },
      yAxis: {
        type: 'value' as const,
        axisLabel: {
          color: privacyMode ? 'transparent' : EC.muted,
          formatter: (v: number) => `R$${Math.round(v / 1000)}k`,
          fontSize: 11,
        },
        splitLine: EC_SPLIT_LINE,
      },
      series: [
        // ── Band fill: green corridor between Lower and Upper ────────────
        {
          name: '_zoneFloor',
          type: 'line' as const,
          data: lower,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'transparent', opacity: 0 },
          symbolSize: 0,
          stack: 'guardrail-band',
          silent: true,
        },
        {
          name: '_zoneGap',
          type: 'line' as const,
          data: zoneGap,
          lineStyle: { opacity: 0 },
          areaStyle: { color: 'rgba(62,211,129,0.08)' },
          symbolSize: 0,
          stack: 'guardrail-band',
          silent: true,
        },
        // ── Visible lines ─────────────────────────────────────────────────
        {
          name: 'Upper Guardrail',
          type: 'line' as const,
          data: upper,
          smooth: true,
          itemStyle: { color: EC.red },
          lineStyle: { width: 1.5, color: EC.red, type: 'dashed' as const },
          symbolSize: 0,
        },
        {
          name: 'Safe Target',
          type: 'line' as const,
          data: safe,
          smooth: true,
          itemStyle: { color: EC.green },
          lineStyle: { width: 2, color: EC.green },
          symbolSize: 0,
        },
        {
          name: 'Lower Guardrail',
          type: 'line' as const,
          data: lower,
          smooth: true,
          itemStyle: { color: EC.yellow },
          lineStyle: { width: 1.5, color: EC.yellow, type: 'dashed' as const },
          symbolSize: 0,
        },
        {
          name: 'Gasto Atual',
          type: 'line' as const,
          data: atual,
          smooth: true,
          itemStyle: { color: EC.accent },
          lineStyle: { width: 2, color: EC.accent, type: 'dotted' as const },
          symbolSize: 0,
          z: 10,
        },
      ],
    };
  }, [data, gastoOverride, privacyMode, theme]);

  return (
    <EChart ref={chartRef} option={option} style={{ height: 320, width: '100%' }} />
  );
}

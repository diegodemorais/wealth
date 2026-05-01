'use client';

/**
 * CashFlowBar — visualização de fluxo de caixa mensal.
 *
 * Mostra: Renda → (−) Gasto → (−) Aporte → Saldo residual
 * em um gráfico horizontal de barras empilhadas (waterfall simplificado).
 *
 * Privacy mode: exibe % da renda em vez de BRL absoluto.
 */

import { useMemo } from 'react';
import { EChart } from '@/components/primitives/EChart';
import { useUiStore } from '@/store/uiStore';
import { EC, EC_AXIS_LABEL, EC_TOOLTIP } from '@/utils/echarts-theme';

interface CashFlowBarProps {
  rendaMensal: number | undefined;
  aporteMensal: number | undefined;
  custoVidaAnual: number | undefined;
  /** Override privacy mode for tests */
  privacyMode?: boolean;
}

function fmtBrl(v: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);
}

export function CashFlowBar({
  rendaMensal,
  aporteMensal,
  custoVidaAnual,
  privacyMode: privacyModeProp,
}: CashFlowBarProps) {
  const { privacyMode: storePm } = useUiStore();
  const privacyMode = privacyModeProp ?? storePm;

  const { renda, gasto, aporte, saldo } = useMemo(() => {
    const renda = rendaMensal ?? 0;
    const gasto = custoVidaAnual != null ? custoVidaAnual / 12 : 0;
    const aporte = aporteMensal ?? 0;
    const saldo = renda - gasto - aporte;
    return { renda, gasto, aporte, saldo };
  }, [rendaMensal, aporteMensal, custoVidaAnual]);

  if (!renda && !gasto && !aporte) {
    return (
      <div style={{ padding: '12px 0', color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
        Dados de premissas não disponíveis.
      </div>
    );
  }

  // Display values: BRL or % of renda
  const displayVal = (v: number): string => {
    if (privacyMode) return renda > 0 ? `${((v / renda) * 100).toFixed(0)}%` : '••';
    return fmtBrl(v);
  };

  const saldoColor = saldo >= 0 ? EC.green : EC.red;
  const categories = ['Renda', 'Gasto', 'Aporte', 'Saldo'];
  const values = [renda, gasto, aporte, saldo];
  const colors = [EC.green, EC.red, EC.accent, saldoColor];

  const option = {
    animation: false,
    grid: { top: 16, right: 120, bottom: 16, left: 70 },
    xAxis: {
      type: 'value',
      axisLabel: {
        ...EC_AXIS_LABEL,
        formatter: (v: number) =>
          privacyMode
            ? `${renda > 0 ? ((v / renda) * 100).toFixed(0) : '0'}%`
            : `R$${(v / 1000).toFixed(0)}k`,
      },
      splitLine: { lineStyle: { color: EC.border3, opacity: 0.4 } },
    },
    yAxis: {
      type: 'category',
      data: categories,
      axisLabel: EC_AXIS_LABEL,
      axisLine: { show: false },
      splitLine: { show: false },
    },
    series: [
      {
        type: 'bar',
        data: values.map((v, i) => ({
          value: Math.abs(v),
          itemStyle: { color: colors[i] },
          label: {
            show: true,
            position: 'right' as const,
            color: colors[i],
            fontSize: 10,
            fontWeight: 700,
            formatter: () => displayVal(Math.abs(v)),
          },
        })),
        barMaxWidth: 32,
        label: { show: true },
      },
    ],
    tooltip: {
      ...EC_TOOLTIP,
      formatter: (params: { dataIndex: number; value: number }) => {
        const i = params.dataIndex;
        const rawVal = values[i];
        const brlStr = privacyMode ? '••' : fmtBrl(Math.abs(rawVal));
        const pctStr = renda > 0 ? `${((Math.abs(rawVal) / renda) * 100).toFixed(1)}%` : '—';
        const sign = rawVal < 0 ? '−' : '';
        return `<b>${categories[i]}</b><br/>${sign}${brlStr} · ${pctStr} da renda`;
      },
    },
  };

  return (
    <div data-testid="cashflow-bar">
      <div data-testid="cashflow-chart">
        <EChart option={option} style={{ height: 160 }} />
      </div>
      {/* Summary metrics strip */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 8, padding: '0 4px' }}>
        {categories.map((label, i) => {
          const raw = values[i];
          return (
            <div
              key={label}
              data-testid={`cashflow-${label.toLowerCase()}`}
              style={{
                background: 'var(--bg)',
                border: `1px solid ${colors[i]}40`,
                borderRadius: 6,
                padding: '5px 10px',
                minWidth: 80,
              }}
            >
              <div style={{ fontSize: 9, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '.4px' }}>
                {label}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: colors[i] }}>
                {privacyMode ? `${renda > 0 ? ((Math.abs(raw) / renda) * 100).toFixed(0) : '••'}%` : fmtBrl(Math.abs(raw))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="src" style={{ marginTop: 8 }}>
        Fluxo mensal: Renda − Gasto − Aporte = Saldo residual.
        Valores de premissas (data.json). Privacy mode: % da renda.
      </div>
    </div>
  );
}
